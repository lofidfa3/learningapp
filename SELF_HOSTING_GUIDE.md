# Self-Hosting Deployment Guide

This guide will help you deploy your Learning App to your own server/host.

## Prerequisites

- A server with Ubuntu/Debian Linux (or similar)
- Root or sudo access
- Domain name (optional but recommended)
- Node.js 20.x installed
- Basic knowledge of Linux commands

## Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should show v20.x.x
```

### 1.3 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 1.4 Install Nginx (Reverse Proxy)
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Step 2: Deploy Your Application

### 2.1 Clone/Upload Your Code
```bash
# Option 1: Clone from GitHub
cd /var/www
sudo git clone https://github.com/lofidfa3/learningapp.git
sudo chown -R $USER:$USER learningapp
cd learningapp

# Option 2: Upload via SCP/SFTP
# Upload your project files to /var/www/learningapp
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Create Production Environment File
```bash
cp .env.production.example .env.production
nano .env.production  # Edit with your actual values
```

**Required Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`
- `DEEPSEEK_MODEL`
- `NEXT_PUBLIC_APP_URL` (your domain)

### 2.4 Build the Application
```bash
npm run build
```

## Step 3: Configure Process Manager

### Option A: Using PM2 (Recommended)

1. **Update ecosystem.config.js:**
   ```bash
   nano ecosystem.config.js
   ```
   Change `cwd: '/path/to/learningapp'` to your actual path (e.g., `/var/www/learningapp`)

2. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup  # Follow the instructions to enable auto-start on boot
   ```

3. **Useful PM2 Commands:**
   ```bash
   pm2 status              # Check status
   pm2 logs learningapp    # View logs
   pm2 restart learningapp # Restart app
   pm2 stop learningapp    # Stop app
   pm2 monit               # Monitor resources
   ```

### Option B: Using Systemd

1. **Create service file:**
   ```bash
   sudo nano /etc/systemd/system/learningapp.service
   ```
   Copy content from `learningapp.service.example` and update paths.

2. **Enable and start:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable learningapp
   sudo systemctl start learningapp
   sudo systemctl status learningapp
   ```

## Step 4: Configure Nginx Reverse Proxy

### 4.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/learningapp
```
Copy content from `nginx.conf.example` and:
- Replace `yourdomain.com` with your actual domain
- Update SSL certificate paths if using Let's Encrypt

### 4.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/learningapp /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

## Step 5: Set Up SSL Certificate (HTTPS)

### Using Let's Encrypt (Free)

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Obtain Certificate:**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Auto-renewal (already configured):**
   ```bash
   sudo certbot renew --dry-run  # Test renewal
   ```

## Step 6: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

## Step 7: Verify Deployment

1. **Check if app is running:**
   ```bash
   # PM2
   pm2 status
   
   # Systemd
   sudo systemctl status learningapp
   ```

2. **Check Nginx:**
   ```bash
   sudo systemctl status nginx
   ```

3. **Test locally:**
   ```bash
   curl http://localhost:3000
   ```

4. **Visit your domain:**
   Open `https://yourdomain.com` in your browser

## Maintenance Commands

### Update Application
```bash
cd /var/www/learningapp
git pull  # If using git
npm install
npm run build
pm2 restart learningapp  # or: sudo systemctl restart learningapp
```

### View Logs
```bash
# PM2
pm2 logs learningapp

# Systemd
sudo journalctl -u learningapp -f

# Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Monitor Resources
```bash
# PM2
pm2 monit

# System resources
htop
df -h  # Disk space
free -h  # Memory
```

## Troubleshooting

### App won't start
1. Check logs: `pm2 logs` or `sudo journalctl -u learningapp`
2. Verify environment variables: `cat .env.production`
3. Check Node.js version: `node --version`
4. Verify port is available: `sudo lsof -i :3000`

### 502 Bad Gateway
1. Check if app is running: `pm2 status` or `sudo systemctl status learningapp`
2. Verify Nginx can reach the app: `curl http://localhost:3000`
3. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### SSL Certificate Issues
1. Renew certificate: `sudo certbot renew`
2. Check certificate: `sudo certbot certificates`
3. Verify Nginx SSL config: `sudo nginx -t`

### Performance Issues
1. Monitor resources: `pm2 monit` or `htop`
2. Check Nginx caching configuration
3. Consider increasing server resources
4. Enable PM2 cluster mode in `ecosystem.config.js`

## Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use firewall:**
   ```bash
   sudo ufw enable
   ```

3. **Regular backups:**
   - Database (Supabase handles this)
   - Application files
   - Environment variables

4. **Monitor logs regularly:**
   ```bash
   pm2 logs --lines 100
   ```

5. **Use strong passwords and SSH keys**

6. **Keep dependencies updated:**
   ```bash
   npm audit
   npm audit fix
   ```

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Support

If you encounter issues:
1. Check the logs first
2. Verify all environment variables are set correctly
3. Ensure all prerequisites are installed
4. Check firewall and port configurations

