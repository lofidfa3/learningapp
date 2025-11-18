# Deployment Guide for newslings.org

## Your Configuration

- **Domain**: newslings.org
- **Server IP**: 82.165.174.146
- **SSL**: Already activated ✅

## Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
cd /Users/amirfooladi/learningapp
./deploy-newslings.sh
```

This will automatically:
- ✅ Set up your server
- ✅ Upload your app
- ✅ Configure Nginx
- ✅ Set up environment variables
- ✅ Start your app

### Option 2: Manual Steps

If you prefer manual deployment, follow these steps:

## Step 1: Connect to Server

```bash
ssh root@82.165.174.146
```

## Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Step 3: Deploy Application

```bash
# Create app directory
sudo mkdir -p /var/www/learningapp
sudo chown -R $USER:$USER /var/www/learningapp
cd /var/www/learningapp

# Clone from GitHub (or upload files)
git clone https://github.com/lofidfa3/learningapp.git .

# Install dependencies
npm install

# Create .env.production
nano .env.production
```

Add this content:

```env
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
PORT=3000
```

```bash
# Build application
npm run build

# Update PM2 config
sed -i "s|/path/to/learningapp|/var/www/learningapp|g" ecosystem.config.js

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 4: Configure Nginx

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
    server_name newslings.org www.newslings.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name newslings.org www.newslings.org;

    # SSL certificates (your existing ones)
    ssl_certificate /etc/letsencrypt/live/newslings.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/newslings.org/privkey.pem;
    
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
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/learningapp
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5: Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Step 6: Update Spotify Redirect URI

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app
3. Click "Edit Settings"
4. Add redirect URI: `https://newslings.org/auth/spotify/callback`
5. Click "Save"

## Step 7: Test Your App

Visit: **https://newslings.org**

## Useful Commands

```bash
# View app logs
pm2 logs learningapp

# Restart app
pm2 restart learningapp

# Check app status
pm2 status

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Troubleshooting

### App Not Loading

```bash
# Check PM2
pm2 status
pm2 logs learningapp

# Check if app is running on port 3000
sudo netstat -tlnp | grep 3000

# Restart app
pm2 restart learningapp
```

### 502 Bad Gateway

- App might not be running: `pm2 restart learningapp`
- Check Nginx: `sudo nginx -t`
- Check logs: `sudo tail -f /var/log/nginx/error.log`

### SSL Issues

Since SSL is already configured, verify:
```bash
sudo certbot certificates
```

## Next Steps

1. ✅ Test all features on https://newslings.org
2. ✅ Verify Spotify login works
3. ✅ Test lyrics feature
4. ✅ Check all API endpoints

Your app should now be live at **https://newslings.org**! 🎉

