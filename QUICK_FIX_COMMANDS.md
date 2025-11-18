# Quick Fix Commands for Your Server

## Run This Script (Easiest)

From your local machine:
```bash
cd /Users/amirfooladi/learningapp
./fix-server-complete.sh
```

This will automatically fix everything.

## Or Run These Commands Manually on Server

SSH into your server:
```bash
ssh root@82.165.174.146
```

Then run these commands one by one:

### 1. Go to app directory
```bash
cd /var/www/learningapp
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build the app
```bash
npm run build
```

### 4. Start with PM2
```bash
pm2 delete learningapp 2>/dev/null || true
pm2 start npm --name "learningapp" -- start
pm2 save
```

### 5. Check if it's running
```bash
pm2 status
ss -tlnp | grep 3000
curl http://localhost:3000
```

### 6. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/learningapp
```

Make sure it has:
```nginx
upstream nextjs_backend {
    server 127.0.0.1:3000;
}

server {
    listen 443 ssl http2;
    server_name newsling.org www.newsling.org;
    
    # ... SSL config ...
    
    location / {
        proxy_pass http://nextjs_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 7. Reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## What the Script Does

1. ✅ Checks if app directory exists
2. ✅ Installs Node.js and PM2 if missing
3. ✅ Installs app dependencies
4. ✅ Builds the application
5. ✅ Creates .env.production with correct settings
6. ✅ Fixes file permissions
7. ✅ Starts app with PM2
8. ✅ Configures Nginx properly
9. ✅ Sets up firewall
10. ✅ Tests everything

## After Running

Your app should be available at: **https://newsling.org**

If you still see errors, check:
```bash
pm2 logs learningapp
sudo tail -f /var/log/nginx/error.log
```

