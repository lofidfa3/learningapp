#!/bin/bash

# Self-Hosting Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR=$(pwd)
NODE_VERSION="20"
PORT=3000

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    echo "Please create .env.production with all required environment variables."
    exit 1
fi

echo -e "${GREEN}✅ Found .env.production${NC}"

# Check Node.js version
echo "📦 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js version ${NODE_VERSION}"
    exit 1
fi

NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_CURRENT" != "$NODE_VERSION" ]; then
    echo -e "${YELLOW}⚠️  Warning: Node.js version is ${NODE_CURRENT}, recommended is ${NODE_VERSION}${NC}"
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm ci --production=false

# Build the application
echo "🔨 Building application..."
npm run build

# Create logs directory if it doesn't exist
mkdir -p logs

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Update ecosystem.config.js with your deployment path"
echo "2. Start the app with PM2: pm2 start ecosystem.config.js"
echo "3. Or use systemd: sudo systemctl start learningapp"
echo ""
echo "To view logs:"
echo "  PM2: pm2 logs learningapp"
echo "  Systemd: sudo journalctl -u learningapp -f"

