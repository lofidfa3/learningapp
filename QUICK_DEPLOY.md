# Quick Deployment Reference

## 🚀 Fast Track Deployment (5 Steps)

### 1. On Your Server - Initial Setup
```bash
# Run the setup script
chmod +x setup-server.sh
./setup-server.sh
```

### 2. Upload Your Code
```bash
# Option A: Clone from GitHub
cd /var/www
git clone https://github.com/lofidfa3/learningapp.git
cd learningapp

# Option B: Upload via SCP
scp -r . user@your-server:/var/www/learningapp
```

### 3. Configure Environment
```bash
cd /var/www/learningapp
cp .env.production.example .env.production
nano .env.production  # Add your API keys and URLs
```

### 4. Build & Start
```bash
npm install
npm run build

# Update ecosystem.config.js with correct path
nano ecosystem.config.js  # Change cwd to /var/www/learningapp

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Configure Nginx & SSL
```bash
# Copy nginx config
sudo cp nginx.conf.example /etc/nginx/sites-available/learningapp
sudo nano /etc/nginx/sites-available/learningapp  # Update domain name

# Enable site
sudo ln -s /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 📋 Essential Commands

### PM2 Management
```bash
pm2 status              # Check status
pm2 logs learningapp    # View logs
pm2 restart learningapp # Restart
pm2 stop learningapp   # Stop
pm2 monit               # Monitor
```

### Systemd Management
```bash
sudo systemctl status learningapp
sudo systemctl restart learningapp
sudo journalctl -u learningapp -f  # View logs
```

### Nginx Management
```bash
sudo systemctl status nginx
sudo systemctl reload nginx
sudo nginx -t  # Test config
```

## 🔧 Troubleshooting

**App not starting?**
```bash
pm2 logs  # Check PM2 logs
cat .env.production  # Verify env vars
node --version  # Check Node.js version
```

**502 Bad Gateway?**
```bash
curl http://localhost:3000  # Test if app is running
sudo tail -f /var/log/nginx/error.log  # Check Nginx errors
```

**SSL Issues?**
```bash
sudo certbot renew
sudo certbot certificates
```

## 📝 Required Environment Variables

Make sure `.env.production` has:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`
- `DEEPSEEK_MODEL=google/gemini-2.5-flash-lite`
- `NEXT_PUBLIC_APP_URL=https://yourdomain.com`

## 🔄 Updating Your App

```bash
cd /var/www/learningapp
git pull  # If using git
npm install
npm run build
pm2 restart learningapp
```

For detailed instructions, see `SELF_HOSTING_GUIDE.md`

