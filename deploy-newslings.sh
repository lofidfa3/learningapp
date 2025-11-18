#!/bin/bash

# Customized Deployment Script for newslings.org
# Domain: newslings.org
# Server IP: 82.165.174.146

set -e

DOMAIN="newslings.org"
SERVER_IP="82.165.174.146"
SERVER_USER="root"
APP_DIR="/var/www/learningapp"

echo "🚀 Deploying to $DOMAIN ($SERVER_IP)..."

# Step 1: Test SSH connection
echo "📡 Testing SSH connection..."
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo '✅ SSH connection successful'" || {
    echo "❌ Failed to connect. Please check your SSH credentials."
    exit 1
}

# Step 2: Server setup
echo "⚙️  Setting up server..."
ssh $SERVER_USER@$SERVER_IP << ENDSSH
    # Update system
    apt update && apt upgrade -y
    
    # Install Node.js 20.x if not installed
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    
    # Install PM2 if not installed
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    # Install Nginx if not installed
    if ! command -v nginx &> /dev/null; then
        apt install nginx -y
        systemctl enable nginx
        systemctl start nginx
    fi
    
    # Install Certbot if not installed (for SSL renewal)
    if ! command -v certbot &> /dev/null; then
        apt install certbot python3-certbot-nginx -y
    fi
    
    # Create app directory
    mkdir -p $APP_DIR
    chown -R $USER:$USER $APP_DIR
ENDSSH

# Step 3: Upload files
echo "📤 Uploading application files..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.env.local' \
    --exclude '.env.production' \
    --exclude '*.log' \
    ./ $SERVER_USER@$SERVER_IP:$APP_DIR/

# Step 4: Setup on server
echo "🔧 Configuring application on server..."
ssh $SERVER_USER@$SERVER_IP << ENDSSH
    cd $APP_DIR
    
    # Install dependencies
    npm install --production
    
    # Update ecosystem.config.js
    sed -i "s|/path/to/learningapp|$APP_DIR|g" ecosystem.config.js
    
    # Create .env.production with correct domain
    cat > .env.production << 'EOF'
NEXT_PUBLIC_APP_URL=https://newslings.org
NEXT_PUBLIC_SUPABASE_URL=https://cnuuusmeigryzkctfcgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNudXV1c21laWdyeXprY3RmY2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjM1MTAsImV4cCI6MjA3NzY5OTUxMH0.eFL8IceEHzQ5g1qak1CBL5kABwXF9AeA219zCbw_bBc
OPENROUTER_API_KEY=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
DEEPSEEK_MODEL=deepseek/deepseek-chat-v3.1:free
SPOTIFY_CLIENT_ID=aeca33a241374f0aae9f0d0b2fe771a2
SPOTIFY_CLIENT_SECRET=29dab9ff2d234c77a18df6737b08f2cf
SPOTIFY_REDIRECT_URI=https://newslings.org/auth/spotify/callback
GENIUS_ACCESS_TOKEN=63GzNt7g9M9-YtP8daOkMDG2i6qlqfLyzCsg2QIyoRqNPVpE0k_rruXi5RONSHzf
NODE_ENV=production
PORT=3000
EOF
    
    echo "✅ Created .env.production with newslings.org configuration"
    
    # Build application
    npm run build
    
    # Start/restart with PM2
    pm2 delete learningapp 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
ENDSSH

# Step 5: Configure Nginx
echo "🌐 Configuring Nginx for newslings.org..."
ssh $SERVER_USER@$SERVER_IP << ENDSSH
    cat > /etc/nginx/sites-available/learningapp << 'NGINXEOF'
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name newslings.org www.newslings.org;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name newslings.org www.newslings.org;

    # SSL certificates (assuming already configured)
    ssl_certificate /etc/letsencrypt/live/newslings.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/newslings.org/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increase body size for API routes
    client_max_body_size 10M;

    # Proxy settings
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;

    # All requests
    location / {
        proxy_pass http://nextjs_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINXEOF

    # Enable site
    ln -sf /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/learningapp
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload
    nginx -t && systemctl reload nginx
ENDSSH

# Step 6: Configure firewall
echo "🔥 Configuring firewall..."
ssh $SERVER_USER@$SERVER_IP << ENDSSH
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable || true
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app is now available at: https://newslings.org"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo ""
echo "1. Add redirect URI to Spotify Dashboard:"
echo "   https://newslings.org/auth/spotify/callback"
echo ""
echo "2. Verify SSL certificate is working:"
echo "   Visit: https://newslings.org"
echo ""
echo "3. Test all features:"
echo "   - Login/Signup"
echo "   - Spotify connection"
echo "   - Lyrics feature"
echo "   - News articles"
echo ""
echo "4. View logs if needed:"
echo "   ssh root@$SERVER_IP"
echo "   pm2 logs learningapp"
echo ""

