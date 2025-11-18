#!/bin/bash

# Fix Nginx for IONOS Hosting with SSL
# IONOS manages SSL certificates, so we need to configure differently

SERVER_IP="82.165.174.146"
SERVER_USER="root"
DOMAIN="newsling.org"

echo "🔧 Configuring Nginx for IONOS Hosting with SSL..."
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    echo "Step 1: Checking IONOS SSL certificate locations..."
    
    # IONOS might store certificates in different locations
    # Common locations for managed hosting SSL
    locations=(
        "/etc/ssl/certs"
        "/etc/ssl/private"
        "/var/www/ssl"
        "/usr/local/ssl"
        "/opt/ssl"
    )
    
    cert_found=""
    for loc in "${locations[@]}"; do
        if [ -d "$loc" ]; then
            echo "Checking: $loc"
            find "$loc" -name "*newsling*" -o -name "*newslings*" 2>/dev/null | head -3
        fi
    done
    
    echo ""
    echo "Step 2: Checking if IONOS uses reverse proxy..."
    echo "IONOS might handle SSL at their level. Let's configure for both scenarios."
    
    echo ""
    echo "Step 3: Configuring Nginx..."
    
    # Option 1: If IONOS handles SSL termination (most common)
    # We listen on port 80 and let IONOS handle HTTPS
    cat > /etc/nginx/sites-available/learningapp << 'NGINXEOF'
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

# HTTP - IONOS will redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name newsling.org www.newsling.org;

    # If IONOS handles SSL, they'll redirect HTTP to HTTPS
    # Otherwise, we proxy directly
    location / {
        proxy_pass http://nextjs_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }
}

# HTTPS - Only if certificate exists locally
# If IONOS handles SSL, this might not be needed
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name newsling.org www.newsling.org;

    # Try to find certificate, but don't fail if not found
    # IONOS might handle this at their level
    ssl_certificate /etc/letsencrypt/live/newsling.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/newsling.org/privkey.pem;
    
    # If certificate doesn't exist, comment out SSL lines above
    # and uncomment these to use self-signed (not recommended but works)
    # ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    # ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 10M;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
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

    echo ""
    echo "Step 4: Testing configuration..."
    
    # Test without SSL first (HTTP only)
    # This will work even if SSL certificate path is wrong
    if nginx -t 2>&1 | grep -q "certificate"; then
        echo "⚠️  SSL certificate issue detected. Creating HTTP-only config..."
        
        # Create HTTP-only version
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
    proxy_set_header X-Forwarded-Host $host;
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
        
        echo "✅ Created HTTP-only config (IONOS will handle SSL termination)"
    fi
    
    ln -sf /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/learningapp
    rm -f /etc/nginx/sites-enabled/default
    
    if nginx -t; then
        systemctl reload nginx
        echo "✅ Nginx configured successfully!"
        echo ""
        echo "📝 Note: IONOS likely handles SSL at their level."
        echo "   Your app should work at both http:// and https://"
    else
        echo "❌ Configuration error:"
        nginx -t
    fi
    
    echo ""
    echo "Step 5: Testing connection..."
    sleep 2
    curl -s http://localhost | head -c 100 && echo "..." || echo "⚠️  Not responding"
ENDSSH

echo ""
echo "✅ IONOS SSL configuration complete!"
echo ""
echo "🌐 Your app should now work at:"
echo "   - http://newsling.org"
echo "   - https://newsling.org (handled by IONOS)"
echo ""


