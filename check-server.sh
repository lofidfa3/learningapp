#!/bin/bash

# Server Readiness Check Script
# Run this on your server to verify it's ready for deployment

echo "🔍 Checking server readiness for Learning App deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check OS
echo "📦 Operating System:"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo -e "${GREEN}✅ OS: $PRETTY_NAME${NC}"
else
    echo -e "${RED}❌ Cannot detect OS${NC}"
fi
echo ""

# Check if running as root or has sudo
echo "🔐 Permissions:"
if [ "$EUID" -eq 0 ]; then
    echo -e "${GREEN}✅ Running as root${NC}"
    HAS_SUDO=true
elif sudo -n true 2>/dev/null; then
    echo -e "${GREEN}✅ Has sudo privileges${NC}"
    HAS_SUDO=true
else
    echo -e "${YELLOW}⚠️  Need sudo privileges (run with sudo or as root)${NC}"
    HAS_SUDO=false
fi
echo ""

# Check memory
echo "💾 Memory:"
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
if [ "$TOTAL_MEM" -ge 1024 ]; then
    echo -e "${GREEN}✅ RAM: ${TOTAL_MEM}MB (Sufficient)${NC}"
else
    echo -e "${YELLOW}⚠️  RAM: ${TOTAL_MEM}MB (Minimum 1GB recommended)${NC}"
fi
echo ""

# Check disk space
echo "💿 Disk Space:"
AVAILABLE=$(df -h / | awk 'NR==2 {print $4}' | sed 's/G//')
if [ ! -z "$AVAILABLE" ]; then
    AVAILABLE_NUM=$(echo $AVAILABLE | sed 's/[^0-9.]//g')
    if (( $(echo "$AVAILABLE_NUM > 5" | bc -l) )); then
        echo -e "${GREEN}✅ Available: ${AVAILABLE} (Sufficient)${NC}"
    else
        echo -e "${YELLOW}⚠️  Available: ${AVAILABLE} (At least 5GB recommended)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not check disk space${NC}"
fi
echo ""

# Check CPU cores
echo "⚙️  CPU:"
CORES=$(nproc)
echo -e "${GREEN}✅ CPU Cores: $CORES${NC}"
echo ""

# Check Node.js
echo "📦 Node.js:"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
    
    # Check if version is 20.x
    if [[ $NODE_VERSION == v20* ]]; then
        echo -e "${GREEN}✅ Node.js version is correct (20.x)${NC}"
    else
        echo -e "${YELLOW}⚠️  Node.js version should be 20.x (current: $NODE_VERSION)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Node.js not installed (will be installed by setup-server.sh)${NC}"
fi
echo ""

# Check npm
echo "📦 npm:"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  npm not installed (will be installed with Node.js)${NC}"
fi
echo ""

# Check PM2
echo "📦 PM2:"
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    echo -e "${GREEN}✅ PM2 installed: $PM2_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 not installed (will be installed by setup-server.sh)${NC}"
fi
echo ""

# Check Nginx
echo "🌐 Nginx:"
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
    echo -e "${GREEN}✅ Nginx installed: $NGINX_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx not installed (will be installed by setup-server.sh)${NC}"
fi
echo ""

# Check ports
echo "🔌 Port Availability:"
if command -v lsof &> /dev/null || command -v netstat &> /dev/null; then
    if lsof -i :3000 &> /dev/null || netstat -tuln 2>/dev/null | grep -q ":3000 "; then
        echo -e "${YELLOW}⚠️  Port 3000 is in use${NC}"
    else
        echo -e "${GREEN}✅ Port 3000 is available${NC}"
    fi
    
    if lsof -i :80 &> /dev/null || netstat -tuln 2>/dev/null | grep -q ":80 "; then
        echo -e "${YELLOW}⚠️  Port 80 is in use (might be Nginx)${NC}"
    else
        echo -e "${GREEN}✅ Port 80 is available${NC}"
    fi
    
    if lsof -i :443 &> /dev/null || netstat -tuln 2>/dev/null | grep -q ":443 "; then
        echo -e "${YELLOW}⚠️  Port 443 is in use (might be Nginx with SSL)${NC}"
    else
        echo -e "${GREEN}✅ Port 443 is available${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot check ports (lsof/netstat not available)${NC}"
fi
echo ""

# Check firewall
echo "🔥 Firewall:"
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | head -n 1)
    echo "Status: $UFW_STATUS"
    echo -e "${YELLOW}⚠️  Make sure ports 22, 80, 443 are open${NC}"
elif command -v firewall-cmd &> /dev/null; then
    echo -e "${YELLOW}⚠️  Firewalld detected - ensure ports 22, 80, 443 are open${NC}"
else
    echo -e "${YELLOW}⚠️  No firewall detected (or using different firewall)${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo ""

READY=true

if [ "$HAS_SUDO" = false ]; then
    echo -e "${RED}❌ Need sudo/root access${NC}"
    READY=false
fi

if [ "$TOTAL_MEM" -lt 512 ]; then
    echo -e "${RED}❌ Insufficient RAM (need at least 512MB)${NC}"
    READY=false
fi

if [ "$READY" = true ]; then
    echo -e "${GREEN}✅ Server appears ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Upload your project files to the server"
    echo "2. Run: ./setup-server.sh"
    echo "3. Follow the deployment guide"
else
    echo -e "${YELLOW}⚠️  Some issues detected. Please resolve them before deployment.${NC}"
fi

echo ""

