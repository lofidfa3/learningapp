# Quick Domain Deployment Guide

## Prerequisites Checklist

- [ ] VPS server with Ubuntu Linux
- [ ] Domain name registered
- [ ] SSH access to server
- [ ] Server IP address

## Quick Start (5 Steps)

### 1. Configure DNS (5 minutes)

Go to your domain registrar and add:

```
Type: A
Name: @
Value: YOUR_SERVER_IP

Type: A  
Name: www
Value: YOUR_SERVER_IP
```

**Wait 5-10 minutes for DNS to propagate**

### 2. Run Deployment Script

```bash
# Make script executable
chmod +x deploy-with-domain.sh

# Run deployment (replace with your domain and IP)
./deploy-with-domain.sh yourdomain.com YOUR_SERVER_IP
```

The script will:
- ✅ Install Node.js, PM2, Nginx
- ✅ Upload your app
- ✅ Configure Nginx
- ✅ Set up SSL certificate
- ✅ Start your app

### 3. Edit Environment Variables

```bash
ssh root@YOUR_SERVER_IP
nano /var/www/learningapp/.env.production
```

Add all your API keys, then:
```bash
pm2 restart learningapp
```

### 4. Update Spotify Redirect URI

1. Go to [Spotify Dashboard](https://developer.spotify.com/dashboard)
2. Add: `https://yourdomain.com/auth/spotify/callback`
3. Save

### 5. Test Your App

Visit: `https://yourdomain.com`

## Manual Deployment (If Script Fails)

### On Your Server:

```bash
# 1. Install dependencies
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2

# 2. Clone/upload your app
sudo mkdir -p /var/www/learningapp
cd /var/www/learningapp
# Upload your files here

# 3. Install and build
npm install
npm run build

# 4. Create .env.production (see VPS_DOMAIN_DEPLOYMENT.md)

# 5. Start with PM2
pm2 start ecosystem.config.js
pm2 save

# 6. Configure Nginx (see VPS_DOMAIN_DEPLOYMENT.md)

# 7. Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Common Issues

### DNS Not Working
- Wait longer (can take up to 48 hours)
- Check: `nslookup yourdomain.com`
- Verify A record is correct

### SSL Certificate Fails
- DNS must be working first
- Check: `nslookup yourdomain.com` returns your IP
- Try: `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com`

### App Not Loading
- Check PM2: `pm2 status`
- Check logs: `pm2 logs learningapp`
- Check Nginx: `sudo systemctl status nginx`

## Environment Variables Template

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://cnuuusmeigryzkctfcgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
DEEPSEEK_MODEL=deepseek/deepseek-chat-v3.1:free
SPOTIFY_CLIENT_ID=aeca33a241374f0aae9f0d0b2fe771a2
SPOTIFY_CLIENT_SECRET=29dab9ff2d234c77a18df6737b08f2cf
SPOTIFY_REDIRECT_URI=https://yourdomain.com/auth/spotify/callback
GENIUS_ACCESS_TOKEN=63GzNt7g9M9-YtP8daOkMDG2i6qlqfLyzCsg2QIyoRqNPVpE0k_rruXi5RONSHzf
NODE_ENV=production
PORT=3000
```

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

## Next Steps After Deployment

1. ✅ Test all features (login, Spotify, lyrics, etc.)
2. ✅ Set up automatic backups
3. ✅ Configure monitoring
4. ✅ Set up SSH key authentication (more secure)
5. ✅ Change default passwords

