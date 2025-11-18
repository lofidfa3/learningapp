# Complete Fix Guide - All Solutions for 403 Forbidden

## Current Status
- ❌ App showing "Forbidden" error
- ✅ PM2 shows app as "online" but might not be working
- ❌ Port 3000 not responding

## All Possible Fixes (Try in Order)

### Fix 1: Upload Updated Files and Rebuild

The `package.json` was fixed locally but needs to be on the server.

**On your local machine:**
```bash
cd /Users/amirfooladi/learningapp

# Upload updated files
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    ./ root@82.165.174.146:/var/www/learningapp/
```

**Then on server:**
```bash
ssh root@82.165.174.146
cd /var/www/learningapp

# Clean and rebuild
rm -rf node_modules package-lock.json .next
npm install
npm run build

# Restart
pm2 delete learningapp
pm2 start ecosystem.config.js
pm2 save
```

### Fix 2: Check if App is Actually Running

```bash
ssh root@82.165.174.146

# Check PM2
pm2 status
pm2 logs learningapp --lines 50

# Check if port 3000 is listening
ss -tlnp | grep 3000

# Test local connection
curl -v http://localhost:3000
```

### Fix 3: Fix Nginx Configuration

The Nginx might be trying to serve files instead of proxying.

```bash
ssh root@82.165.174.146
sudo nano /etc/nginx/sites-available/learningapp
```

Make sure it looks like this (NOT serving files directly):

```nginx
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 443 ssl http2;
    server_name newsling.org www.newsling.org;

    # SSL config...
    ssl_certificate /etc/letsencrypt/live/newsling.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/newsling.org/privkey.pem;

    # IMPORTANT: Must proxy, not serve files
    location / {
        proxy_pass http://nextjs_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Fix 4: Check File Permissions

```bash
ssh root@82.165.174.146
cd /var/www/learningapp

# Fix ownership
sudo chown -R $USER:$USER /var/www/learningapp

# Fix permissions
sudo chmod -R 755 /var/www/learningapp
sudo chmod -R 755 .next
```

### Fix 5: Check Environment Variables

```bash
ssh root@82.165.174.146
cd /var/www/learningapp

# Check if .env.production exists
cat .env.production

# Make sure it has:
# NEXT_PUBLIC_APP_URL=https://newsling.org
# PORT=3000
```

### Fix 6: Start App Manually to See Errors

```bash
ssh root@82.165.174.146
cd /var/www/learningapp

# Stop PM2
pm2 stop learningapp

# Start manually to see errors
npm start
```

This will show you any startup errors.

### Fix 7: Check Nginx Error Logs

```bash
ssh root@82.165.174.146
sudo tail -50 /var/log/nginx/error.log
```

This will show what Nginx is complaining about.

### Fix 8: Verify SSL Certificate Path

```bash
ssh root@82.165.174.146

# Check if SSL cert exists
sudo ls -la /etc/letsencrypt/live/newsling.org/

# If not, check what domain the cert is for
sudo certbot certificates
```

## Complete Automated Fix Script

Run this from your local machine - it does everything:

```bash
cd /Users/amirfooladi/learningapp
./fix-server-complete.sh
```

## Step-by-Step Complete Fix

### Step 1: Upload Files
```bash
cd /Users/amirfooladi/learningapp
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.env.local' \
    ./ root@82.165.174.146:/var/www/learningapp/
```

### Step 2: Fix on Server
```bash
ssh root@82.165.174.146 << 'ENDSSH'
cd /var/www/learningapp

# Clean everything
rm -rf node_modules package-lock.json .next

# Install dependencies
npm install

# Build
npm run build

# Fix permissions
chown -R $USER:$USER /var/www/learningapp
chmod -R 755 /var/www/learningapp

# Create .env.production if missing
if [ ! -f .env.production ]; then
cat > .env.production << 'EOF'
NEXT_PUBLIC_APP_URL=https://newsling.org
NEXT_PUBLIC_SUPABASE_URL=https://cnuuusmeigryzkctfcgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNudXV1c21laWdyeXprY3RmY2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjM1MTAsImV4cCI6MjA3NzY5OTUxMH0.eFL8IceEHzQ5g1qak1CBL5kABwXF9AeA219zCbw_bBc
OPENROUTER_API_KEY=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
DEEPSEEK_MODEL=deepseek/deepseek-chat-v3.1:free
SPOTIFY_CLIENT_ID=aeca33a241374f0aae9f0d0b2fe771a2
SPOTIFY_CLIENT_SECRET=29dab9ff2d234c77a18df6737b08f2cf
SPOTIFY_REDIRECT_URI=https://newsling.org/auth/spotify/callback
GENIUS_ACCESS_TOKEN=63GzNt7g9M9-YtP8daOkMDG2i6qlqfLyzCsg2QIyoRqNPVpE0k_rruXi5RONSHzf
NODE_ENV=production
PORT=3000
EOF
fi

# Update PM2 config
sed -i "s|/path/to/learningapp|/var/www/learningapp|g" ecosystem.config.js

# Restart with PM2
pm2 delete learningapp 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Wait and test
sleep 5
curl http://localhost:3000 | head -c 100

# Configure Nginx
cat > /etc/nginx/sites-available/learningapp << 'NGINXEOF'
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name newsling.org www.newsling.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name newsling.org www.newsling.org;

    ssl_certificate /etc/letsencrypt/live/newsling.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/newsling.org/privkey.pem;
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
nginx -t && systemctl reload nginx

echo ""
echo "✅ Complete fix applied!"
pm2 status
ENDSSH
```

## Diagnostic Commands

Run these to see what's wrong:

```bash
ssh root@82.165.174.146

# 1. Check PM2
pm2 status
pm2 logs learningapp --lines 30

# 2. Check port
ss -tlnp | grep 3000

# 3. Test app
curl -v http://localhost:3000

# 4. Check Nginx
sudo nginx -t
sudo systemctl status nginx
sudo tail -20 /var/log/nginx/error.log

# 5. Check if app directory exists
ls -la /var/www/learningapp

# 6. Check if .next exists (build output)
ls -la /var/www/learningapp/.next
```

## Most Common Issues

1. **App not built** → Run `npm run build`
2. **Dependencies missing** → Run `npm install` (not `npm install --production`)
3. **Nginx serving files** → Must proxy to port 3000
4. **Wrong domain in config** → Check Nginx server_name
5. **SSL cert path wrong** → Check `/etc/letsencrypt/live/newsling.org/`

## Quick Test

After fixing, test:
```bash
# On server
curl http://localhost:3000

# Should return HTML, not error
```

If that works, then Nginx is the issue.
If that fails, the app is the issue.


