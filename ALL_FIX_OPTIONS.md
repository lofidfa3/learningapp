# All Ways to Fix 403 Forbidden Error

## Quick Summary

You're seeing "Forbidden" because either:
1. App isn't running on port 3000
2. Nginx isn't configured correctly
3. Files aren't uploaded to server
4. Build failed

## Solution 1: Run Complete Fix Script (RECOMMENDED)

**From your local machine:**
```bash
cd /Users/amirfooladi/learningapp
./fix-everything.sh
```

This does EVERYTHING automatically:
- ✅ Uploads all files
- ✅ Installs dependencies
- ✅ Builds the app
- ✅ Fixes permissions
- ✅ Configures Nginx
- ✅ Starts with PM2
- ✅ Tests everything

## Solution 2: Manual Step-by-Step

### On Your Local Machine:

```bash
# 1. Upload files
cd /Users/amirfooladi/learningapp
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    ./ root@82.165.174.146:/var/www/learningapp/
```

### On Your Server (SSH):

```bash
ssh root@82.165.174.146
cd /var/www/learningapp

# 2. Clean and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run build

# 3. Fix permissions
chown -R $USER:$USER /var/www/learningapp
chmod -R 755 /var/www/learningapp

# 4. Create .env.production
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

# 5. Start with PM2
pm2 delete learningapp 2>/dev/null || true
pm2 start ecosystem.config.js || pm2 start npm --name "learningapp" -- start
pm2 save

# 6. Test
sleep 3
curl http://localhost:3000 | head -c 100

# 7. Configure Nginx
cat > /etc/nginx/sites-available/learningapp << 'NGINXEOF'
upstream nextjs_backend {
    server 127.0.0.1:3000;
}

server {
    listen 443 ssl http2;
    server_name newsling.org www.newsling.org;

    ssl_certificate /etc/letsencrypt/live/newsling.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/newsling.org/privkey.pem;

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
nginx -t && systemctl reload nginx
```

## Solution 3: Diagnostic First

Run these to see what's wrong:

```bash
ssh root@82.165.174.146

# Check what's actually happening
pm2 logs learningapp --lines 50
ss -tlnp | grep 3000
curl -v http://localhost:3000
sudo tail -20 /var/log/nginx/error.log
ls -la /var/www/learningapp/.next
```

## Solution 4: Start App Manually to See Errors

```bash
ssh root@82.165.174.146
cd /var/www/learningapp

# Stop PM2
pm2 stop learningapp

# Start manually - you'll see all errors
NODE_ENV=production npm start
```

Press Ctrl+C after seeing errors, then fix them.

## Solution 5: Check Each Component

### A. Is the app built?
```bash
ls -la /var/www/learningapp/.next
```
If empty or missing → Run `npm run build`

### B. Is the app running?
```bash
pm2 status
ss -tlnp | grep 3000
```
If not → Start with PM2

### C. Is Nginx proxying correctly?
```bash
sudo cat /etc/nginx/sites-available/learningapp
```
Must have `proxy_pass http://127.0.0.1:3000`

### D. Are permissions correct?
```bash
ls -la /var/www/learningapp
```
Should be owned by your user, not root

## Most Likely Issues

1. **App not built** → Missing `.next` directory
2. **Dependencies wrong** → PostCSS not installed
3. **Nginx wrong config** → Serving files instead of proxying
4. **App crashed** → Check PM2 logs

## Quick Test Commands

After fixing, test in this order:

```bash
# 1. Test app directly
curl http://localhost:3000

# 2. Test through Nginx locally
curl -H "Host: newsling.org" http://localhost

# 3. Test from outside
curl https://newsling.org
```

## Recommended Action

**Just run this one command:**
```bash
cd /Users/amirfooladi/learningapp
./fix-everything.sh
```

It fixes everything automatically!


