# IONOS SSL Configuration Guide

## Understanding IONOS SSL

When you use IONOS hosting:
- ✅ SSL is activated in IONOS control panel
- ⚠️  IONOS handles SSL termination at their level (reverse proxy)
- 📝 Your server (Nginx) typically only needs to handle HTTP (port 80)
- 🔒 IONOS automatically redirects HTTP to HTTPS

## Quick Fix

Run this script:
```bash
cd /Users/amirfooladi/learningapp
./fix-ionos-ssl.sh
```

This configures Nginx to work with IONOS's SSL setup.

## How IONOS SSL Works

```
User → IONOS (HTTPS/SSL) → Your Server (HTTP) → Next.js App
```

IONOS acts as a reverse proxy:
1. User connects to `https://newsling.org` (SSL handled by IONOS)
2. IONOS forwards to your server on HTTP (port 80)
3. Your Nginx proxies to Next.js on port 3000

## Configuration

### Option 1: HTTP Only (Recommended for IONOS)

Since IONOS handles SSL, configure Nginx for HTTP only:

```nginx
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
```

### Option 2: If IONOS Doesn't Handle SSL

If IONOS just provides the certificate but doesn't proxy:

1. **Download certificate from IONOS panel:**
   - Go to SSL Certificate section
   - Download certificate files
   - Upload to your server

2. **Or use Let's Encrypt on your server:**
   ```bash
   sudo certbot --nginx -d newsling.org
   ```

## Manual Setup

### Step 1: Configure Nginx for HTTP

```bash
ssh root@82.165.174.146
cat > /etc/nginx/sites-available/learningapp << 'EOF'
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
EOF

ln -sf /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/learningapp
nginx -t && systemctl reload nginx
```

### Step 2: Configure IONOS (if needed)

In IONOS control panel:
1. Go to your domain settings
2. SSL Certificate section → Should show "Active"
3. Make sure domain points to your server IP: `82.165.174.146`
4. IONOS will automatically handle HTTPS

## Testing

After configuration:

1. **Test HTTP (direct to server):**
   ```bash
   curl http://82.165.174.146
   ```

2. **Test through domain:**
   - Visit: `http://newsling.org` (should work)
   - Visit: `https://newsling.org` (IONOS handles SSL)

## Common IONOS Setup

IONOS typically:
- ✅ Provides SSL certificate
- ✅ Handles SSL termination
- ✅ Redirects HTTP → HTTPS automatically
- ✅ Proxies to your server on HTTP

Your server just needs to:
- ✅ Listen on port 80 (HTTP)
- ✅ Proxy to your Next.js app on port 3000
- ✅ Set correct headers

## Troubleshooting

### If HTTPS doesn't work:

1. **Check IONOS SSL status:**
   - Login to IONOS panel
   - Verify SSL is "Active"
   - Check domain DNS points to your server

2. **Check if IONOS needs configuration:**
   - Some IONOS plans require manual SSL setup
   - Check IONOS documentation for your plan

3. **Test direct server access:**
   ```bash
   curl http://82.165.174.146
   ```
   If this works, the issue is with IONOS configuration, not your server.

## Recommended Configuration

For IONOS hosting, use **HTTP-only Nginx config**:

```nginx
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
```

IONOS will handle:
- ✅ SSL/HTTPS
- ✅ HTTP → HTTPS redirect
- ✅ Certificate management

Your server handles:
- ✅ Running the Next.js app
- ✅ Proxying requests

## Next Steps

1. Run the fix script: `./fix-ionos-ssl.sh`
2. Test: Visit `https://newsling.org`
3. If it works, you're done! ✅
4. If not, check IONOS panel for additional SSL configuration needed






