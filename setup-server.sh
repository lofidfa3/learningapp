#!/bin/bash

# Quick Server Setup Script
# Run this on your server to install all prerequisites

set -e

echo "🚀 Setting up server for Learning App deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Update system
echo -e "${GREEN}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo -e "${GREEN}📦 Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo -e "${YELLOW}Node.js already installed: $(node --version)${NC}"
fi

# Install PM2
echo -e "${GREEN}📦 Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    echo -e "${YELLOW}PM2 already installed${NC}"
fi

# Install Nginx
echo -e "${GREEN}📦 Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl enable nginx
    sudo systemctl start nginx
else
    echo -e "${YELLOW}Nginx already installed${NC}"
fi

# Install Certbot for SSL
echo -e "${GREEN}📦 Installing Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot python3-certbot-nginx -y
else
    echo -e "${YELLOW}Certbot already installed${NC}"
fi

# Configure firewall
echo -e "${GREEN}🔥 Configuring firewall...${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo ""
echo -e "${GREEN}✅ Server setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Upload your application files to the server"
echo "2. Run: ./deploy.sh"
echo "3. Configure PM2: pm2 start ecosystem.config.js"
echo "4. Set up Nginx: Follow SELF_HOSTING_GUIDE.md"
echo "5. Set up SSL: sudo certbot --nginx -d yourdomain.com"

