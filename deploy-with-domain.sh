#!/bin/bash

# Complete Deployment Script for VPS with Domain
# Usage: ./deploy-with-domain.sh yourdomain.com your-server-ip

set -e

DOMAIN=$1
SERVER_IP=$2
SERVER_USER=${3:-root}
APP_DIR="/var/www/learningapp"

if [ -z "$DOMAIN" ] || [ -z "$SERVER_IP" ]; then
    echo "Usage: ./deploy-with-domain.sh <domain> <server-ip> [username]"
    echo "Example: ./deploy-with-domain.sh example.com 82.165.174.146"
    exit 1
fi

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
    
    # Install Certbot if not installed
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
    
    # Create .env.production if it doesn't exist
    if [ ! -f .env.production ]; then
        cat > .env.production << EOF
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_SUPABASE_URL=https://cnuuusmeigryzkctfcgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
DEEPSEEK_MODEL=deepseek/deepseek-chat-v3.1:free
SPOTIFY_CLIENT_ID=aeca33a241374f0aae9f0d0b2fe771a2
SPOTIFY_CLIENT_SECRET=29dab9ff2d234c77a18df6737b08f2cf
SPOTIFY_REDIRECT_URI=https://$DOMAIN/auth/spotify/callback
GENIUS_ACCESS_TOKEN=63GzNt7g9M9-YtP8daOkMDG2i6qlqfLyzCsg2QIyoRqNPVpE0k_rruXi5RONSHzf
NODE_ENV=production
PORT=3000
EOF
        echo "⚠️  Created .env.production - PLEASE EDIT IT WITH YOUR API KEYS!"
    fi
    
    # Build application
    npm run build
    
    # Start/restart with PM2
    pm2 delete learningapp 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
ENDSSH

# Step 5: Configure Nginx
echo "🌐 Configuring Nginx..."
ssh $SERVER_USER@$SERVER_IP << ENDSSH
    cat > /etc/nginx/sites-available/learningapp << 'NGINXEOF'
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://nextjs_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINXEOF

    # Replace domain placeholder
    sed -i "s/\$DOMAIN/$DOMAIN/g" /etc/nginx/sites-available/learningapp
    
    # Enable site
    ln -sf /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/learningapp
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload
    nginx -t && systemctl reload nginx
ENDSSH

# Step 6: Setup SSL
echo "🔒 Setting up SSL certificate..."
echo "⚠️  Make sure your DNS is pointing to $SERVER_IP before continuing!"
read -p "Press Enter when DNS is configured..."

ssh $SERVER_USER@$SERVER_IP << ENDSSH
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect || {
        echo "⚠️  SSL setup failed. You may need to run manually:"
        echo "   certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    }
ENDSSH

# Step 7: Configure firewall
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
echo "🌐 Your app should be available at: https://$DOMAIN"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Edit .env.production on server with your API keys:"
echo "   ssh $SERVER_USER@$SERVER_IP"
echo "   nano $APP_DIR/.env.production"
echo "   pm2 restart learningapp"
echo ""
echo "2. Add redirect URI to Spotify Dashboard:"
echo "   https://$DOMAIN/auth/spotify/callback"
echo ""
echo "3. Update Supabase redirect URLs if needed"
echo ""
echo "4. Test your app: https://$DOMAIN"
echo ""

