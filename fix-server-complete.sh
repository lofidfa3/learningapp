#!/bin/bash

# Complete Server Fix Script for newsling.org
# This script will fix all issues and get your app running

set -e

SERVER_IP="82.165.174.146"
SERVER_USER="root"
APP_DIR="/var/www/learningapp"
DOMAIN="newsling.org"

echo "🔧 Complete Server Fix Script"
echo "================================"
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    set -e
    
    echo "📋 Step 1: Checking current status..."
    echo ""
    
    # Check if app directory exists
    if [ ! -d "/var/www/learningapp" ]; then
        echo "❌ App directory not found. Creating it..."
        mkdir -p /var/www/learningapp
        chown -R $USER:$USER /var/www/learningapp
    else
        echo "✅ App directory exists"
    fi
    
    echo ""
    echo "📋 Step 2: Installing missing tools..."
    echo ""
    
    # Install ss (alternative to netstat)
    if ! command -v ss &> /dev/null; then
        apt-get update -qq
        apt-get install -y iproute2
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    echo "Node.js version: $(node --version)"
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        npm install -g pm2
    fi
    echo "PM2 version: $(pm2 --version)"
    
    echo ""
    echo "📋 Step 3: Setting up application..."
    echo ""
    
    cd /var/www/learningapp
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo "❌ package.json not found. Please upload your app files first."
        echo "   You can use: rsync or git clone"
        exit 1
    fi
    
    echo "✅ Found package.json"
    
    # Install dependencies (including dev dependencies for build)
    echo "Installing dependencies..."
    npm install
    
    # Update ecosystem.config.js
    if [ -f "ecosystem.config.js" ]; then
        sed -i "s|/path/to/learningapp|/var/www/learningapp|g" ecosystem.config.js
        echo "✅ Updated ecosystem.config.js"
    fi
    
    # Create .env.production if it doesn't exist
    if [ ! -f ".env.production" ]; then
        echo "Creating .env.production..."
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
        echo "✅ Created .env.production"
    else
        echo "✅ .env.production already exists"
    fi
    
    echo ""
    echo "📋 Step 4: Building application..."
    echo ""
    
    # Clean build artifacts
    echo "Cleaning previous build..."
    rm -rf .next node_modules/.cache
    
    # Build the app
    echo "Building application..."
    npm run build
    
    if [ ! -d ".next" ]; then
        echo "❌ Build failed! Check errors above."
        echo "Trying to fix dependencies..."
        rm -rf node_modules package-lock.json
        npm install
        npm run build
    fi
    
    echo ""
    echo "✅ Build complete"
    
    echo ""
    echo "📋 Step 5: Fixing permissions..."
    echo ""
    
    # Fix ownership
    chown -R $USER:$USER /var/www/learningapp
    
    # Fix permissions
    find /var/www/learningapp -type d -exec chmod 755 {} \;
    find /var/www/learningapp -type f -exec chmod 644 {} \;
    
    # Make sure .next is accessible
    if [ -d ".next" ]; then
        chmod -R 755 .next
    fi
    
    echo "✅ Permissions fixed"
    
    echo ""
    echo "📋 Step 6: Starting application with PM2..."
    echo ""
    
    # Stop existing process if any
    pm2 delete learningapp 2>/dev/null || true
    
    # Start the app
    pm2 start ecosystem.config.js || {
        # If ecosystem.config.js doesn't work, start directly
        echo "Starting with direct command..."
        pm2 start npm --name "learningapp" -- start
    }
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup
    pm2 startup | tail -1 | bash || true
    
    echo ""
    echo "✅ App started with PM2"
    
    echo ""
    echo "📋 Step 7: Checking if app is running..."
    echo ""
    
    # Wait a moment for app to start
    sleep 3
    
    # Check PM2 status
    pm2 status
    
    # Check if port 3000 is listening
    echo ""
    echo "Checking port 3000..."
    if ss -tlnp | grep -q ":3000"; then
        echo "✅ Port 3000 is listening"
    else
        echo "⚠️  Port 3000 is not listening. Checking logs..."
        pm2 logs learningapp --lines 20 --nostream
    fi
    
    # Test local connection
    echo ""
    echo "Testing local connection..."
    if curl -s http://localhost:3000 | head -c 100 > /dev/null 2>&1; then
        echo "✅ App is responding on localhost:3000"
    else
        echo "❌ App is not responding. Checking logs..."
        pm2 logs learningapp --lines 30 --nostream
    fi
    
    echo ""
    echo "📋 Step 8: Configuring Nginx..."
    echo ""
    
    # Create Nginx configuration
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

    # SSL certificates
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

    # Enable site
    ln -sf /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/learningapp
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    if nginx -t; then
        systemctl reload nginx
        echo "✅ Nginx configured and reloaded"
    else
        echo "❌ Nginx configuration error. Check: nginx -t"
    fi
    
    echo ""
    echo "📋 Step 9: Configuring firewall..."
    echo ""
    
    # Allow necessary ports
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable || true
    
    echo "✅ Firewall configured"
    
    echo ""
    echo "================================"
    echo "✅ Fix Complete!"
    echo ""
    echo "📊 Final Status:"
    echo ""
    pm2 status
    echo ""
    echo "🌐 Your app should now be available at: https://newsling.org"
    echo ""
    echo "📝 Useful commands:"
    echo "   pm2 logs learningapp        - View app logs"
    echo "   pm2 restart learningapp     - Restart app"
    echo "   pm2 status                  - Check app status"
    echo "   systemctl status nginx      - Check Nginx status"
    echo ""
ENDSSH

echo ""
echo "✅ Server fix script completed!"
echo ""
echo "🌐 Visit: https://newsling.org"
echo ""

