#!/bin/bash

# Remote Deployment Script
# This script will deploy your app to your server

set -e

SERVER_IP="82.165.174.146"
SERVER_USER="root"  # Adjust if different
APP_DIR="/var/www/learningapp"

echo "🚀 Starting remote deployment to $SERVER_IP..."

# Step 1: Test SSH connection
echo "📡 Testing SSH connection..."
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo '✅ SSH connection successful'" || {
    echo "❌ Failed to connect. Please check:"
    echo "   - Server IP is correct"
    echo "   - Password is correct"
    echo "   - SSH is enabled on server"
    exit 1
}

# Step 2: Create app directory
echo "📁 Creating application directory..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $APP_DIR"

# Step 3: Upload project files
echo "📤 Uploading project files..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    --exclude '.env.local' --exclude '.env.production' \
    ./ $SERVER_USER@$SERVER_IP:$APP_DIR/

# Step 4: Run setup on server
echo "⚙️  Running server setup..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /var/www/learningapp
    
    # Make scripts executable
    chmod +x setup-server.sh deploy.sh check-server.sh
    
    # Run server setup
    ./setup-server.sh
    
    # Create .env.production from template
    if [ ! -f .env.production ]; then
        cp env.production.template .env.production
        echo "⚠️  Please edit .env.production with your API keys!"
    fi
ENDSSH

# Step 5: Deploy application
echo "🚀 Deploying application..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /var/www/learningapp
    
    # Install dependencies and build
    npm install
    npm run build
    
    # Update ecosystem.config.js with correct path
    sed -i "s|/path/to/learningapp|/var/www/learningapp|g" ecosystem.config.js
    
    # Start with PM2
    pm2 start ecosystem.config.js || pm2 restart ecosystem.config.js
    pm2 save
    pm2 startup
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  IMPORTANT SECURITY STEPS:"
echo "1. Edit .env.production on server with your API keys:"
echo "   ssh $SERVER_USER@$SERVER_IP"
echo "   nano /var/www/learningapp/.env.production"
echo ""
echo "2. Set up Nginx and SSL (follow SELF_HOSTING_GUIDE.md)"
echo ""
echo "3. CHANGE YOUR SERVER PASSWORD (you shared it publicly!)"
echo ""
echo "4. Set up SSH key authentication (more secure than password)"
echo ""

