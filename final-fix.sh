#!/bin/bash

# Final Fix - DNS is correct, fix server issues

SERVER_IP="82.165.174.146"
SERVER_USER="root"

echo "🔧 Final Fix - DNS is correct, fixing server..."
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /var/www/learningapp
    
    echo "Step 1: Stopping everything on port 3000..."
    pm2 delete all 2>/dev/null || true
    pkill -f "node.*3000" 2>/dev/null || true
    sleep 2
    
    echo ""
    echo "Step 2: Changing to port 3001..."
    echo "PORT=3001" > .env.production
    cat >> .env.production << 'ENVEOF'
NEXT_PUBLIC_APP_URL=https://newslings.org
NEXT_PUBLIC_SUPABASE_URL=https://cnuuusmeigryzkctfcgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNudXV1c21laWdyeXprY3RmY2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjM1MTAsImV4cCI6MjA3NzY5OTUxMH0.eFL8IceEHzQ5g1qak1CBL5kABwXF9AeA219zCbw_bBc
OPENROUTER_API_KEY=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
DEEPSEEK_MODEL=deepseek/deepseek-chat-v3.1:free
SPOTIFY_CLIENT_ID=aeca33a241374f0aae9f0d0b2fe771a2
SPOTIFY_CLIENT_SECRET=29dab9ff2d234c77a18df6737b08f2cf
SPOTIFY_REDIRECT_URI=https://newslings.org/auth/spotify/callback
GENIUS_ACCESS_TOKEN=63GzNt7g9M9-YtP8daOkMDG2i6qlqfLyzCsg2QIyoRqNPVpE0k_rruXi5RONSHzf
NODE_ENV=production
ENVEOF
    
    # Update ecosystem.config.js
    if [ -f "ecosystem.config.js" ]; then
        sed -i 's/"PORT": 3000/"PORT": 3001/g' ecosystem.config.js
        sed -i 's/3000/3001/g' ecosystem.config.js
    fi
    
    echo ""
    echo "Step 3: Building app..."
    npm run build
    
    echo ""
    echo "Step 4: Starting on port 3001..."
    PORT=3001 pm2 start ecosystem.config.js || PORT=3001 pm2 start npm --name "learningapp" -- start
    pm2 save
    sleep 5
    
    echo ""
    echo "Step 5: Testing app..."
    curl -s http://localhost:3001 | head -c 100 && echo "..." || echo "❌ Not responding"
    
    echo ""
    echo "Step 6: Configuring Nginx..."
    cat > /etc/nginx/sites-available/learningapp << 'NGINXEOF'
upstream nextjs_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name newslings.org www.newslings.org;

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
        echo "✅ Nginx configured for port 3001"
    else
        echo "❌ Nginx error:"
        nginx -t
    fi
    
    echo ""
    echo "✅ Final fix complete!"
    echo ""
    echo "📊 Status:"
    pm2 status
    echo ""
    echo "🧪 Testing:"
    curl -s -H "Host: newslings.org" http://localhost | head -c 100 && echo "..." || echo "⚠️  Not responding"
ENDSSH

echo ""
echo "✅ All fixes applied!"
echo ""
echo "🌐 Your app should now work at: https://newslings.org"
echo ""
echo "📝 DNS is correct - no changes needed there!"
echo ""
