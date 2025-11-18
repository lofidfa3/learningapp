# Fix: 404 Not Found Error

## Current Status
- ✅ DNS is working (you can reach the server)
- ✅ Nginx is responding
- ❌ Getting 404 Not Found (Nginx can't find the app)

## Quick Fix

Run this script:
```bash
cd /Users/amirfooladi/learningapp
./fix-404-error.sh
```

This will:
1. Check if app is running
2. Test app on port 3000
3. Fix Nginx configuration
4. Test everything

## What's Happening

The 404 error means:
- ✅ DNS is correct (reaching your server)
- ✅ Nginx is running
- ❌ Nginx can't proxy to your app on port 3000

## Common Causes

1. **App not running on port 3000**
2. **Nginx proxy_pass wrong**
3. **App crashed**
4. **Port 3000 not accessible**

## Manual Fix

### Step 1: Check if App is Running

```bash
ssh root@82.165.174.146

# Check PM2
pm2 status

# Check port 3000
ss -tlnp | grep 3000

# Test app directly
curl http://localhost:3000
```

### Step 2: If App Not Running

```bash
cd /var/www/learningapp

# Start app
pm2 restart learningapp || pm2 start ecosystem.config.js

# Or start manually
npm start
```

### Step 3: Fix Nginx Configuration

```bash
cat > /etc/nginx/sites-available/learningapp << 'EOF'
upstream nextjs_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name newslings.org www.newslings.org;

    location / {
        proxy_pass http://nextjs_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/learningapp
nginx -t && systemctl reload nginx
```

## Diagnostic Commands

Run these to see what's wrong:

```bash
ssh root@82.165.174.146

# 1. Is app running?
pm2 status
pm2 logs learningapp --lines 20

# 2. Is port 3000 listening?
ss -tlnp | grep 3000

# 3. Can we reach app directly?
curl -v http://localhost:3000

# 4. What does Nginx see?
curl -H "Host: newslings.org" http://localhost

# 5. Check Nginx logs
sudo tail -20 /var/log/nginx/error.log
sudo tail -20 /var/log/nginx/access.log
```

## Most Likely Issue

The app probably isn't running or crashed. Check:

```bash
pm2 logs learningapp
```

Look for errors in the logs.

## Quick Test

After fixing, test:

```bash
# On server
curl http://localhost:3000

# Should return HTML, not 404
```

If that works, then Nginx is the issue.
If that fails, the app is the issue.

## Step-by-Step Fix

1. **SSH to server:**
   ```bash
   ssh root@82.165.174.146
   ```

2. **Check app:**
   ```bash
   pm2 status
   pm2 logs learningapp
   ```

3. **Restart app if needed:**
   ```bash
   cd /var/www/learningapp
   pm2 restart learningapp
   ```

4. **Test app:**
   ```bash
   curl http://localhost:3000
   ```

5. **Fix Nginx:**
   ```bash
   # Use the config from Step 3 above
   nginx -t && systemctl reload nginx
   ```

6. **Test website:**
   Visit: `https://newslings.org`

## If Still Getting 404

Check these:

1. **App logs:**
   ```bash
   pm2 logs learningapp --lines 50
   ```

2. **Nginx logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Test direct connection:**
   ```bash
   curl http://82.165.174.146:3000
   ```

4. **Check firewall:**
   ```bash
   sudo ufw status
   sudo ufw allow 3000/tcp
   ```

## Expected Result

After fixing:
- ✅ `curl http://localhost:3000` returns HTML
- ✅ `curl -H "Host: newslings.org" http://localhost` returns HTML
- ✅ `https://newslings.org` shows your app

## Summary

The 404 means Nginx is working but can't find your app. Most likely:
- App isn't running → Start with PM2
- App crashed → Check logs and restart
- Nginx config wrong → Update proxy_pass

Run the fix script to diagnose and fix automatically!






