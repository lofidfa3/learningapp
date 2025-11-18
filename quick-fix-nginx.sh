#!/bin/bash
# Quick fix: Configure Nginx to work immediately

ssh root@82.165.174.146 << 'ENDSSH'
    # First, find the certificate
    echo "🔍 Finding SSL certificate..."
    
    if [ -f "/etc/letsencrypt/live/newsling.org/fullchain.pem" ]; then
        CERT_DIR="/etc/letsencrypt/live/newsling.org"
        echo "✅ Found: $CERT_DIR"
    elif [ -f "/etc/letsencrypt/live/newslings.org/fullchain.pem" ]; then
        CERT_DIR="/etc/letsencrypt/live/newslings.org"
        echo "✅ Found: $CERT_DIR"
    else
        echo "⚠️  Certificate not found. Using HTTP only for now."
        CERT_DIR=""
    fi
    
    # Configure Nginx
    if [ -n "$CERT_DIR" ]; then
        # HTTPS config
        cat > /etc/nginx/sites-available/learningapp << NGINXEOF
upstream nextjs_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name newsling.org www.newsling.org;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name newsling.org www.newsling.org;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;

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
        # HTTP only config (works immediately)
        cat > /etc/nginx/sites-available/learningapp << 'NGINXEOF'
upstream nextjs_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name newsling.org www.newsling.org;

    location / {
        proxy_pass http://nextjs_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF
    fi
    
    ln -sf /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/learningapp
    rm -f /etc/nginx/sites-enabled/default
    
    if nginx -t; then
        systemctl reload nginx
        echo "✅ Nginx fixed and reloaded!"
    else
        echo "❌ Error:"
        nginx -t
    fi
ENDSSH

echo ""
echo "✅ Done! Your app should now work."
echo "🌐 Visit: http://newsling.org (or https:// if SSL found)"
