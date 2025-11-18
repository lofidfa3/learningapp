#!/bin/bash

# Fix 404 Not Found Error
# DNS is working, but Nginx can't find the app

SERVER_IP="82.165.174.146"
SERVER_USER="root"
DOMAIN="newslings.org"

echo "🔧 Fixing 404 Not Found Error..."
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    echo "Step 1: Checking if app is running..."
    pm2 status
    echo ""
    
    echo "Step 2: Testing app on port 3000..."
    curl -s http://localhost:3000 | head -c 200 || echo "❌ App not responding on port 3000"
    echo ""
    
    echo "Step 3: Checking if port 3000 is listening..."
    ss -tlnp | grep 3000 || echo "⚠️  Port 3000 not listening"
    echo ""
    
    echo "Step 4: Checking current Nginx configuration..."
    cat /etc/nginx/sites-available/learningapp | head -30
    echo ""
    
    echo "Step 5: Fixing Nginx configuration..."
    
    # Ensure app is running first
    cd /var/www/learningapp
    pm2 restart learningapp || pm2 start ecosystem.config.js || pm2 start npm --name "learningapp" -- start
    sleep 3
    
    # Create proper Nginx config
    cat > /etc/nginx/sites-available/learningapp << 'NGINXEOF'
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name newslings.org www.newslings.org;

    # Logging
    access_log /var/log/nginx/newslings_access.log;
    error_log /var/log/nginx/newslings_error.log;

    client_max_body_size 10M;

    # Proxy settings
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;

    # All requests go to Next.js
    location / {
        proxy_pass http://nextjs_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINXEOF

    ln -sf /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/learningapp
    rm -f /etc/nginx/sites-enabled/default
    
    echo ""
    echo "Step 6: Testing Nginx configuration..."
    if nginx -t; then
        systemctl reload nginx
        echo "✅ Nginx reloaded"
    else
        echo "❌ Nginx configuration error:"
        nginx -t
        exit 1
    fi
    
    echo ""
    echo "Step 7: Testing connections..."
    sleep 2
    
    echo "Testing app directly:"
    curl -s http://localhost:3000 | head -c 100 && echo "..." || echo "❌ App not responding"
    
    echo ""
    echo "Testing through Nginx:"
    curl -s -H "Host: newslings.org" http://localhost | head -c 100 && echo "..." || echo "❌ Nginx not proxying"
    
    echo ""
    echo "Step 8: Checking Nginx error logs..."
    tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No error log yet"
    
    echo ""
    echo "✅ Fix applied!"
    echo ""
    echo "📊 Final Status:"
    pm2 status
    echo ""
    ss -tlnp | grep 3000 || echo "⚠️  Port 3000 check"
ENDSSH

echo ""
echo "✅ 404 Fix Complete!"
echo ""
echo "🌐 Test your website: https://newslings.org"
echo ""
echo "📝 If still getting 404, check:"
echo "   1. pm2 logs learningapp"
echo "   2. sudo tail -f /var/log/nginx/error.log"
echo "   3. curl http://localhost:3000"
echo ""






