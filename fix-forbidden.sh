#!/bin/bash
# Quick fix script for 403 Forbidden error

SERVER_IP="82.165.174.146"
SERVER_USER="root"
APP_DIR="/var/www/learningapp"

echo "🔧 Fixing 403 Forbidden error..."

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    echo "1. Checking PM2 status..."
    pm2 status
    
    echo ""
    echo "2. Restarting app..."
    cd /var/www/learningapp
    pm2 restart learningapp || pm2 start ecosystem.config.js
    
    echo ""
    echo "3. Fixing permissions..."
    chown -R $USER:www-data /var/www/learningapp
    chmod -R 755 /var/www/learningapp
    
    echo ""
    echo "4. Testing app on port 3000..."
    curl -s http://localhost:3000 | head -c 100 || echo "❌ App not responding on port 3000"
    
    echo ""
    echo "5. Checking Nginx config..."
    nginx -t
    
    echo ""
    echo "6. Reloading Nginx..."
    systemctl reload nginx
    
    echo ""
    echo "7. Checking Nginx error log..."
    tail -10 /var/log/nginx/error.log
    
    echo ""
    echo "✅ Fix applied. Check if the site works now."
ENDSSH

echo ""
echo "🌐 Try visiting: https://newsling.org"
