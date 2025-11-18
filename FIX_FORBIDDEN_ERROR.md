# Fix: 403 Forbidden Error on newsling.org

## Common Causes

A "Forbidden" (403) error usually means:
1. **File permissions** - Nginx can't read the files
2. **App not running** - Next.js app isn't running on port 3000
3. **Nginx configuration** - Wrong proxy settings
4. **Directory permissions** - Web server can't access directories

## Quick Diagnosis

Run these commands on your server to diagnose:

```bash
ssh root@82.165.174.146

# 1. Check if app is running
pm2 status

# 2. Check if port 3000 is listening
sudo netstat -tlnp | grep 3000
# Or
sudo ss -tlnp | grep 3000

# 3. Check Nginx error logs
sudo tail -20 /var/log/nginx/error.log

# 4. Check file permissions
ls -la /var/www/learningapp

# 5. Test Nginx configuration
sudo nginx -t
```

## Solutions

### Solution 1: Fix File Permissions

```bash
# On your server
cd /var/www/learningapp

# Fix ownership
sudo chown -R $USER:www-data /var/www/learningapp

# Fix directory permissions
sudo find /var/www/learningapp -type d -exec chmod 755 {} \;

# Fix file permissions
sudo find /var/www/learningapp -type f -exec chmod 644 {} \;

# Make sure .next directory is accessible
sudo chmod -R 755 .next
```

### Solution 2: Ensure App is Running

```bash
# Check PM2 status
pm2 status

# If not running, start it
cd /var/www/learningapp
pm2 start ecosystem.config.js
pm2 save

# Check logs
pm2 logs learningapp
```

### Solution 3: Fix Nginx Configuration

The issue might be that Nginx is trying to serve static files instead of proxying. Check your Nginx config:

```bash
sudo nano /etc/nginx/sites-available/learningapp
```

Make sure it has the proxy configuration (not trying to serve files directly):

```nginx
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 443 ssl http2;
    server_name newsling.org www.newsling.org;

    # ... SSL config ...

    location / {
        proxy_pass http://nextjs_backend;  # Must proxy to backend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Solution 4: Check SELinux/AppArmor (if enabled)

```bash
# Check if SELinux is enabled
sestatus

# If enabled, set proper context
sudo setsebool -P httpd_can_network_connect 1
```

## Most Likely Issue

Based on the error, the most common cause is:

**Nginx is trying to serve files directly instead of proxying to the Next.js app.**

This happens when:
- Nginx config has `root` directive pointing to a directory
- The app isn't running on port 3000
- Nginx can't connect to the backend

## Quick Fix Script

Run this on your server:

```bash
#!/bin/bash
# Quick fix for 403 Forbidden

# 1. Ensure app is running
cd /var/www/learningapp
pm2 restart learningapp

# 2. Fix permissions
sudo chown -R $USER:www-data /var/www/learningapp
sudo chmod -R 755 /var/www/learningapp

# 3. Check Nginx config
sudo nginx -t

# 4. Reload Nginx
sudo systemctl reload nginx

# 5. Check if app is accessible on port 3000
curl http://localhost:3000
```

## Step-by-Step Fix

1. **SSH into your server:**
   ```bash
   ssh root@82.165.174.146
   ```

2. **Check if app is running:**
   ```bash
   pm2 status
   ```
   If not running, start it:
   ```bash
   cd /var/www/learningapp
   pm2 start ecosystem.config.js
   ```

3. **Test if app responds locally:**
   ```bash
   curl http://localhost:3000
   ```
   If this works, the app is fine - it's an Nginx issue.

4. **Check Nginx configuration:**
   ```bash
   sudo cat /etc/nginx/sites-available/learningapp
   ```
   Make sure it's proxying to `http://127.0.0.1:3000`, not serving files.

5. **Fix and reload:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Still Not Working?

Check these:

1. **Firewall blocking:**
   ```bash
   sudo ufw status
   sudo ufw allow 3000/tcp
   ```

2. **App crashed:**
   ```bash
   pm2 logs learningapp --lines 50
   ```

3. **Wrong domain in config:**
   - Make sure Nginx config has `newsling.org` (not newslings.org)
   - Check if you're using the right domain

