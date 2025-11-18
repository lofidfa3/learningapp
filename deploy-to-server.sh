#!/bin/bash

# Step-by-step deployment to your server
# Run this script and it will guide you through deployment

SERVER_IP="82.165.174.146"
SERVER_USER="root"
APP_DIR="/var/www/learningapp"

echo "🚀 Deploying Learning App to $SERVER_IP"
echo ""

# Step 1: Upload files
echo "📤 Step 1: Uploading files to server..."
echo "You'll be prompted for password: 8jQrRVJs"
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.env.local' \
    --exclude '.env.production' \
    --exclude '*.log' \
    ./ $SERVER_USER@$SERVER_IP:$APP_DIR/

echo ""
echo "✅ Files uploaded!"
echo ""

# Step 2: Run setup commands on server
echo "⚙️  Step 2: Setting up server..."
echo "You'll be prompted for password again..."

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /var/www/learningapp
    
    # Make scripts executable
    chmod +x setup-server.sh deploy.sh check-server.sh 2>/dev/null || true
    
    # Install Node.js 20 if not installed
    if ! command -v node &> /dev/null; then
        echo "📦 Installing Node.js 20..."
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    fi
    
    # Install PM2 if not installed
    if ! command -v pm2 &> /dev/null; then
        echo "📦 Installing PM2..."
        npm install -g pm2
    fi
    
    # Install Nginx if not installed
    if ! command -v nginx &> /dev/null; then
        echo "📦 Installing Nginx..."
        yum install -y nginx
        systemctl enable nginx
        systemctl start nginx
    fi
    
    echo "✅ Server setup complete!"
ENDSSH

echo ""
echo "✅ Server setup complete!"
echo ""

# Step 3: Install dependencies and build
echo "🔨 Step 3: Building application..."
echo "You'll be prompted for password again..."

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /var/www/learningapp
    
    # Install dependencies
    echo "📥 Installing dependencies..."
    npm install
    
    # Create .env.production if it doesn't exist
    if [ ! -f .env.production ]; then
        echo "📝 Creating .env.production from template..."
        cp env.production.template .env.production
        echo "⚠️  IMPORTANT: Edit .env.production with your API keys!"
    fi
    
    # Update ecosystem.config.js
    sed -i "s|/path/to/learningapp|/var/www/learningapp|g" ecosystem.config.js
    
    # Build application
    echo "🔨 Building application..."
    npm run build
    
    echo "✅ Build complete!"
ENDSSH

echo ""
echo "✅ Build complete!"
echo ""

# Step 4: Start application with PM2
echo "🚀 Step 4: Starting application..."
echo "You'll be prompted for password again..."

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /var/www/learningapp
    
    # Start with PM2
    pm2 delete learningapp 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    
    # Setup PM2 to start on boot
    pm2 startup systemd -u root --hp /root
    
    echo "✅ Application started!"
    pm2 status
ENDSSH

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure environment variables:"
echo "   ssh $SERVER_USER@$SERVER_IP"
echo "   nano /var/www/learningapp/.env.production"
echo "   # Add your API keys:"
echo "   # - OPENROUTER_API_KEY"
echo "   # - NEXT_PUBLIC_SUPABASE_URL"
echo "   # - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   # - DEEPSEEK_MODEL"
echo "   # - NEXT_PUBLIC_APP_URL (your domain)"
echo ""
echo "2. Restart the app:"
echo "   ssh $SERVER_USER@$SERVER_IP 'cd /var/www/learningapp && pm2 restart learningapp'"
echo ""
echo "3. Configure Nginx (see SELF_HOSTING_GUIDE.md)"
echo ""
echo "4. Set up SSL certificate:"
echo "   ssh $SERVER_USER@$SERVER_IP"
echo "   yum install -y certbot python3-certbot-nginx"
echo "   certbot --nginx -d yourdomain.com"
echo ""
echo "⚠️  SECURITY WARNING:"
echo "   You shared your server password publicly!"
echo "   CHANGE IT IMMEDIATELY:"
echo "   ssh $SERVER_USER@$SERVER_IP"
echo "   passwd"
echo ""
echo "🌐 Your app should be running on: http://$SERVER_IP:3000"
echo "   (Once Nginx is configured, it will be on your domain)"
echo ""

