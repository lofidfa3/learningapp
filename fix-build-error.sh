#!/bin/bash

# Fix Build Error Script
# This fixes the PostCSS/Webpack build error

SERVER_IP="82.165.174.146"
SERVER_USER="root"
APP_DIR="/var/www/learningapp"

echo "🔧 Fixing build error on server..."
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /var/www/learningapp
    
    echo "📦 Step 1: Cleaning node_modules and lock files..."
    rm -rf node_modules package-lock.json .next
    
    echo ""
    echo "📦 Step 2: Installing all dependencies..."
    npm install
    
    echo ""
    echo "📦 Step 3: Verifying PostCSS and Tailwind..."
    npm list postcss autoprefixer tailwindcss
    
    echo ""
    echo "🔨 Step 4: Building application..."
    npm run build
    
    echo ""
    if [ -d ".next" ]; then
        echo "✅ Build successful!"
        echo ""
        echo "🚀 Step 5: Starting with PM2..."
        pm2 delete learningapp 2>/dev/null || true
        pm2 start ecosystem.config.js || pm2 start npm --name "learningapp" -- start
        pm2 save
        
        echo ""
        echo "✅ App started!"
        pm2 status
        
        echo ""
        echo "🌐 Testing local connection..."
        sleep 2
        curl -s http://localhost:3000 | head -c 100 && echo "..." || echo "⚠️  App not responding yet"
    else
        echo "❌ Build failed. Check errors above."
        exit 1
    fi
ENDSSH

echo ""
echo "✅ Build fix complete!"
echo "🌐 Your app should now be working at: https://newsling.org"

