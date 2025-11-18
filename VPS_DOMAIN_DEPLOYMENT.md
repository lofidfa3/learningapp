# Complete VPS Deployment Guide with Domain

This guide will help you deploy your Learning App to your VPS server with your custom domain.

## Prerequisites

- ✅ VPS server (Linux Ubuntu)
- ✅ Domain name
- ✅ SSH access to your server
- ✅ Root or sudo access

## Step 1: Configure DNS (Domain Name System)

### 1.1 Get Your Server IP Address

First, find your server's public IP address:
```bash
# On your server, run:
curl ifconfig.me
# Or check your VPS provider's dashboard
```

### 1.2 Configure DNS Records

Go to your domain registrar's DNS management panel and add these records:

**Type A Record:**
- **Name/Host**: `@` (or leave blank for root domain)
- **Value/IP**: Your server's IP address (e.g., `82.165.174.146`)
- **TTL**: 3600 (or default)

**Type A Record (for www subdomain):**
- **Name/Host**: `www`
- **Value/IP**: Your server's IP address (same as above)
- **TTL**: 3600

**Example:**
```
Type    Name    Value              TTL
A       @       82.165.174.146    3600
A       www     82.165.174.146    3600
```

### 1.3 Wait for DNS Propagation

DNS changes can take 5 minutes to 48 hours. Check propagation:
```bash
# On your local machine:
nslookup yourdomain.com
# Or
dig yourdomain.com
```

## Step 2: Server Initial Setup

### 2.1 Connect to Your Server

```bash
ssh root@your-server-ip
# Or
ssh root@yourdomain.com
```

### 2.2 Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should show v20.x.x
npm --version
```

### 2.4 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 2.5 Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2.6 Install Certbot (for SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

## Step 3: Deploy Your Application

### 3.1 Create Application Directory

```bash
sudo mkdir -p /var/www/learningapp
sudo chown -R $USER:$USER /var/www/learningapp
cd /var/www/learningapp
```

### 3.2 Clone Your Repository

```bash
# If using GitHub:
git clone https://github.com/lofidfa3/learningapp.git .

# Or upload files via SCP from your local machine:
# scp -r /path/to/learningapp/* root@yourdomain.com:/var/www/learningapp/
```

### 3.3 Install Dependencies

```bash
cd /var/www/learningapp
npm install
```

### 3.4 Create Environment Variables File

```bash
nano .env.production
```

Add all your environment variables:

```env
# App URL (use your domain)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cnuuusmeigryzkctfcgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
OPENROUTER_API_KEY=your_openrouter_key
DEEPSEEK_MODEL=deepseek/deepseek-chat-v3.1:free

# Spotify
SPOTIFY_CLIENT_ID=aeca33a241374f0aae9f0d0b2fe771a2
SPOTIFY_CLIENT_SECRET=29dab9ff2d234c77a18df6737b08f2cf
SPOTIFY_REDIRECT_URI=https://yourdomain.com/auth/spotify/callback

# Genius
GENIUS_ACCESS_TOKEN=63GzNt7g9M9-YtP8daOkMDG2i6qlqfLyzCsg2QIyoRqNPVpE0k_rruXi5RONSHzf

# Node Environment
NODE_ENV=production
PORT=3000
```

**Important:** Replace `yourdomain.com` with your actual domain name!

### 3.5 Build the Application

```bash
npm run build
```

### 3.6 Update PM2 Configuration

```bash
nano ecosystem.config.js
```

Update the `cwd` path:
```javascript
cwd: '/var/www/learningapp', // Make sure this is correct
```

### 3.7 Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Follow the command it outputs to enable PM2 on boot
```

## Step 4: Configure Nginx

### 4.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/learningapp
```

Add this configuration:

```nginx
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (will be configured after SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increase body size for API routes
    client_max_body_size 10M;

    # Proxy settings
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # All requests
    location / {
        proxy_pass http://nextjs_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Replace `yourdomain.com` with your actual domain!**

### 4.2 Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t  # Test configuration
```

## Step 5: Set Up SSL Certificate (HTTPS)

### 5.1 Get SSL Certificate with Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (choose Yes)

### 5.2 Auto-Renewal Setup

Certbot automatically sets up renewal, but verify:

```bash
sudo certbot renew --dry-run
```

## Step 6: Update Spotify Redirect URI

### 6.1 Add Production Redirect URI to Spotify

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app
3. Click "Edit Settings"
4. Add redirect URI: `https://yourdomain.com/auth/spotify/callback`
5. Click "Save"

## Step 7: Firewall Configuration

### 7.1 Configure UFW (Uncomplicated Firewall)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

## Step 8: Final Steps

### 8.1 Restart Services

```bash
sudo systemctl restart nginx
pm2 restart learningapp
```

### 8.2 Verify Everything Works

1. Visit `https://yourdomain.com` in your browser
2. Check SSL certificate (should show as secure)
3. Test Spotify login
4. Test all app features

## Step 9: Maintenance Commands

### View Application Logs

```bash
pm2 logs learningapp
```

### Restart Application

```bash
pm2 restart learningapp
```

### Update Application

```bash
cd /var/www/learningapp
git pull
npm install
npm run build
pm2 restart learningapp
```

### Check Nginx Status

```bash
sudo systemctl status nginx
```

### Check SSL Certificate Expiry

```bash
sudo certbot certificates
```

## Troubleshooting

### App Not Loading

1. Check PM2: `pm2 status`
2. Check Nginx: `sudo nginx -t`
3. Check logs: `pm2 logs learningapp`
4. Check port: `sudo netstat -tlnp | grep 3000`

### SSL Certificate Issues

1. Check DNS: `nslookup yourdomain.com`
2. Verify Nginx config: `sudo nginx -t`
3. Check Certbot: `sudo certbot certificates`

### 502 Bad Gateway

- App might not be running: `pm2 restart learningapp`
- Port 3000 not accessible: Check firewall

## Security Checklist

- [ ] Changed default SSH password
- [ ] Set up SSH key authentication
- [ ] Configured firewall (UFW)
- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] PM2 auto-restart enabled
- [ ] Regular backups configured

## Quick Reference

**Server IP**: Your VPS IP address
**Domain**: yourdomain.com
**App Directory**: `/var/www/learningapp`
**PM2 App Name**: `learningapp`
**Nginx Config**: `/etc/nginx/sites-available/learningapp`

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs learningapp`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify DNS propagation: `nslookup yourdomain.com`
4. Test SSL: `sudo certbot certificates`

