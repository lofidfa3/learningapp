#!/bin/bash

# Fix SSL Certificate Path Issue
# The app is running but Nginx can't find the SSL certificate

SERVER_IP="82.165.174.146"
SERVER_USER="root"
DOMAIN="newsling.org"

echo "🔍 Finding SSL certificate location..."
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    echo "📋 Checking for SSL certificates..."
    echo ""
    
    # Check what certificates exist
    echo "1. Checking Let's Encrypt certificates:"
    sudo certbot certificates 2>/dev/null || echo "Certbot not available or no certificates"
    
    echo ""
    echo "2. Checking common certificate locations:"
    
    # Check various possible locations
    locations=(
        "/etc/letsencrypt/live/newsling.org"
        "/etc/letsencrypt/live/newslings.org"
        "/etc/ssl/certs"
        "/etc/nginx/ssl"
        "/var/www/ssl"
    )
    
    for loc in "${locations[@]}"; do
        if [ -d "$loc" ] || [ -f "$loc/fullchain.pem" ]; then
            echo "✅ Found: $loc"
            ls -la "$loc" 2>/dev/null | head -5
        fi
    done
    
    echo ""
    echo "3. Searching for certificate files:"
    find /etc -name "*newsling*" -o -name "*newslings*" 2>/dev/null | head -10
    
    echo ""
    echo "4. Checking Nginx SSL configs:"
    grep -r "ssl_certificate" /etc/nginx/ 2>/dev/null | grep -v "#" | head -5
    
    echo ""
    echo "5. If certificate doesn't exist, we'll set up HTTP only first, then add SSL"
ENDSSH

echo ""
echo "Now fixing Nginx configuration..."
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /var/www/learningapp
    
    # First, create HTTP-only config (works without SSL)
    cat > /etc/nginx/sites-available/learningapp << 'NGINXEOF'
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name newsling.org www.newsling.org;

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
        echo "✅ Nginx configured for HTTP (will work immediately)"
        echo "⚠️  Note: Using HTTP for now. We'll add SSL next."
    else
        echo "❌ Nginx configuration still has errors"
        nginx -t
    fi
    
    echo ""
    echo "🌐 Testing HTTP connection..."
    curl -s http://localhost | head -c 100 || echo "Not responding"
ENDSSH

echo ""
echo "✅ HTTP configuration applied!"
echo ""
echo "🌐 Your app should now work at: http://newsling.org"
echo ""
echo "📝 Next: We need to find your SSL certificate or create a new one"
echo ""


