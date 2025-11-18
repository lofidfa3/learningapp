#!/bin/bash

# Complete Fix Script - Fixes Everything
# This script uploads files, rebuilds, and fixes all issues

set -e

SERVER_IP="82.165.174.146"
SERVER_USER="root"
APP_DIR="/var/www/learningapp"
DOMAIN="newsling.org"

echo "🔧 Complete Fix Script for newsling.org"
echo "========================================"
echo ""

# Step 1: Upload files
echo "📤 Step 1: Uploading updated files to server..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.env.local' \
    --exclude '*.log' \
    ./ $SERVER_USER@$SERVER_IP:$APP_DIR/

echo ""
echo "✅ Files uploaded"
echo ""

# Step 2: Fix everything on server
echo "🔧 Step 2: Fixing everything on server..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    set -e
    
    cd /var/www/learningapp
    
    echo "📦 Cleaning old build and dependencies..."
    rm -rf node_modules package-lock.json .next node_modules/.cache
    
    echo ""
    echo "📦 Installing all dependencies..."
    npm install
    
    echo ""
    echo "🔨 Building application..."
    npm run build
    
    if [ ! -d ".next" ]; then
        echo "❌ Build failed! Trying again with clean install..."
        rm -rf node_modules package-lock.json
        npm install
        npm run build
    fi
    
    if [ ! -d ".next" ]; then
        echo "❌ Build still failed. Check errors above."
        exit 1
    fi
    
    echo ""
    echo "✅ Build successful!"
    
    echo ""
    echo "🔧 Fixing permissions..."
    chown -R $USER:$USER /var/www/learningapp
    chmod -R 755 /var/www/learningapp
    [ -d ".next" ] && chmod -R 755 .next
    
    echo ""
    echo "📝 Creating/updating .env.production..."
    cat > .env.production << 'EOF'
NEXT_PUBLIC_APP_URL=https://newsling.org
NEXT_PUBLIC_SUPABASE_URL=https://cnuuusmeigryzkctfcgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNudXV1c21laWdyeXprY3RmY2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjM1MTAsImV4cCI6MjA3NzY5OTUxMH0.eFL8IceEHzQ5g1qak1CBL5kABwXF9AeA219zCbw_bBc
OPENROUTER_API_KEY=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
DEEPSEEK_MODEL=deepseek/deepseek-chat-v3.1:free
SPOTIFY_CLIENT_ID=aeca33a241374f0aae9f0d0b2fe771a2
SPOTIFY_CLIENT_SECRET=29dab9ff2d234c77a18df6737b08f2cf
SPOTIFY_REDIRECT_URI=https://newsling.org/auth/spotify/callback
GENIUS_ACCESS_TOKEN=63GzNt7g9M9-YtP8daOkMDG2i6qlqfLyzCsg2QIyoRqNPVpE0k_rruXi5RONSHzf
NODE_ENV=production
PORT=3000
EOF
    
    echo ""
    echo "⚙️  Updating PM2 configuration..."
    [ -f "ecosystem.config.js" ] && sed -i "s|/path/to/learningapp|/var/www/learningapp|g" ecosystem.config.js
    
    echo ""
    echo "🚀 Starting application with PM2..."
    pm2 delete learningapp 2>/dev/null || true
    
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    else
        pm2 start npm --name "learningapp" -- start
    fi
    
    pm2 save
    
    echo ""
    echo "⏳ Waiting for app to start..."
    sleep 5
    
    echo ""
    echo "🧪 Testing application..."
    if curl -s http://localhost:3000 | head -c 100 > /dev/null 2>&1; then
        echo "✅ App is responding on localhost:3000"
    else
        echo "⚠️  App not responding yet. Checking logs..."
        pm2 logs learningapp --lines 20 --nostream
    fi
    
    echo ""
    echo "🌐 Configuring Nginx..."
    cat > /etc/nginx/sites-available/learningapp << 'NGINXEOF'
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name newsling.org www.newsling.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name newsling.org www.newsling.org;

    ssl_certificate /etc/letsencrypt/live/newsling.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/newsling.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 10M;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    location / {
        proxy_pass http://nextjs_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

    ln -sf /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/learningapp
    rm -f /etc/nginx/sites-enabled/default
    
    if nginx -t; then
        systemctl reload nginx
        echo "✅ Nginx configured and reloaded"
    else
        echo "❌ Nginx configuration error"
        nginx -t
    fi
    
    echo ""
    echo "🔥 Configuring firewall..."
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable || true
    
    echo ""
    echo "================================"
    echo "✅ Complete Fix Applied!"
    echo ""
    echo "📊 Final Status:"
    pm2 status
    echo ""
    echo "🧪 Testing local connection:"
    curl -s http://localhost:3000 | head -c 200 || echo "⚠️  Not responding yet"
    echo ""
    echo ""
    echo "🌐 Your app should now be available at:"
    echo "   https://newsling.org"
    echo ""
    echo "📝 If still not working, check:"
    echo "   pm2 logs learningapp"
    echo "   sudo tail -f /var/log/nginx/error.log"
    echo ""
ENDSSH

echo ""
echo "✅ Complete fix script finished!"
echo ""
echo "🌐 Visit: https://newsling.org"
echo ""


