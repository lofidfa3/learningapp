#!/bin/bash

# Fix IONOS Domain Configuration
# The domain in IONOS is "newslings.org" (with 's'), not "newsling.org"

SERVER_IP="82.165.174.146"
SERVER_USER="root"
DOMAIN="newslings.org"  # Note: with 's' as shown in IONOS panel

echo "🔧 Fixing IONOS Domain Configuration..."
echo ""
echo "⚠️  IMPORTANT: Your IONOS panel shows 'newslings.org' (with 's')"
echo "   We need to configure for the correct domain name"
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    echo "Step 1: Configuring Nginx for newslings.org..."
    
    cat > /etc/nginx/sites-available/learningapp << 'NGINXEOF'
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name newslings.org www.newslings.org newsling.org www.newsling.org;

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

    ln -sf /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/learningapp
    rm -f /etc/nginx/sites-enabled/default
    
    if nginx -t; then
        systemctl reload nginx
        echo "✅ Nginx configured for newslings.org"
    else
        echo "❌ Nginx configuration error:"
        nginx -t
    fi
    
    echo ""
    echo "Step 2: Updating .env.production..."
    cd /var/www/learningapp
    
    if [ -f ".env.production" ]; then
        sed -i 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://newslings.org|g' .env.production
        sed -i 's|SPOTIFY_REDIRECT_URI=.*|SPOTIFY_REDIRECT_URI=https://newslings.org/auth/spotify/callback|g' .env.production
        echo "✅ Updated .env.production"
    fi
    
    echo ""
    echo "Step 3: Testing connection..."
    sleep 2
    curl -s http://localhost | head -c 100 && echo "..." || echo "⚠️  Not responding"
ENDSSH

echo ""
echo "✅ Server configuration updated!"
echo ""
echo "📝 IMPORTANT: You need to configure IONOS DNS settings:"
echo ""
echo "1. Go to IONOS Control Panel"
echo "2. Navigate to: Domini & SSL → newslings.org"
echo "3. Go to DNS settings"
echo "4. Add/Update A record:"
echo "   - Type: A"
echo "   - Name: @ (or leave blank)"
echo "   - Value: 82.165.174.146"
echo "   - TTL: 3600"
echo ""
echo "5. Add A record for www:"
echo "   - Type: A"
echo "   - Name: www"
echo "   - Value: 82.165.174.146"
echo "   - TTL: 3600"
echo ""
echo "6. Remove or disable 'Spazio web' connection if it exists"
echo "   (The domain should point to your VPS, not IONOS web space)"
echo ""
echo "🌐 After DNS changes (5-30 minutes), visit:"
echo "   https://newslings.org"
echo ""






