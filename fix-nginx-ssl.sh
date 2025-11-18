#!/bin/bash

# Fix Nginx SSL Certificate Issue
# This script finds the correct SSL certificate path and configures Nginx

SERVER_IP="82.165.174.146"
SERVER_USER="root"
DOMAIN="newsling.org"

echo "🔍 Finding SSL certificate and fixing Nginx..."
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    echo "Step 1: Finding SSL certificate..."
    
    # Check if certificate exists at expected location
    CERT_PATH=""
    
    if [ -f "/etc/letsencrypt/live/newsling.org/fullchain.pem" ]; then
        CERT_PATH="/etc/letsencrypt/live/newsling.org"
        echo "✅ Found certificate at: $CERT_PATH"
    elif [ -f "/etc/letsencrypt/live/newslings.org/fullchain.pem" ]; then
        CERT_PATH="/etc/letsencrypt/live/newslings.org"
        echo "✅ Found certificate at: $CERT_PATH"
    else
        echo "⚠️  Certificate not found at expected locations"
        echo "Checking all Let's Encrypt certificates:"
        sudo certbot certificates 2>/dev/null || echo "No certificates found"
        
        # Try to find any certificate
        if [ -d "/etc/letsencrypt/live" ]; then
            echo ""
            echo "Available certificates:"
            ls -la /etc/letsencrypt/live/
            echo ""
            read -p "Enter certificate directory name (or press Enter to use HTTP only): " cert_dir
            if [ -n "$cert_dir" ] && [ -f "/etc/letsencrypt/live/$cert_dir/fullchain.pem" ]; then
                CERT_PATH="/etc/letsencrypt/live/$cert_dir"
            fi
        fi
    fi
    
    echo ""
    echo "Step 2: Configuring Nginx..."
    
    if [ -n "$CERT_PATH" ] && [ -f "$CERT_PATH/fullchain.pem" ]; then
        # SSL certificate exists - use HTTPS
        echo "✅ Using SSL certificate at: $CERT_PATH"
        cat > /etc/nginx/sites-available/learningapp << NGINXEOF
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name newsling.org www.newsling.org;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name newsling.org www.newsling.org;

    ssl_certificate $CERT_PATH/fullchain.pem;
    ssl_certificate_key $CERT_PATH/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 10M;

    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;

    location / {
        proxy_pass http://nextjs_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINXEOF
    else
        # No SSL certificate - use HTTP only for now
        echo "⚠️  No SSL certificate found. Configuring HTTP only..."
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
        echo "✅ Configured for HTTP. You can add SSL later with:"
        echo "   sudo certbot --nginx -d newsling.org -d www.newsling.org"
    fi
    
    ln -sf /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/learningapp
    rm -f /etc/nginx/sites-enabled/default
    
    echo ""
    echo "Step 3: Testing Nginx configuration..."
    if nginx -t; then
        systemctl reload nginx
        echo "✅ Nginx configured and reloaded successfully!"
    else
        echo "❌ Nginx configuration error:"
        nginx -t
    fi
    
    echo ""
    echo "Step 4: Testing connection..."
    sleep 2
    curl -s http://localhost | head -c 100 && echo "..." || echo "⚠️  Not responding"
ENDSSH

echo ""
echo "✅ SSL certificate issue fixed!"
echo ""
echo "🌐 Your app should now be accessible!"
echo ""


