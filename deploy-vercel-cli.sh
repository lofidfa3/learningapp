#!/bin/bash

# Deploy to Vercel using Vercel CLI

set -e

echo "🚀 Deploying to Vercel using CLI..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
fi

cd /Users/amirfooladi/learningapp

echo "📋 Step 1: Checking Vercel CLI version..."
vercel --version

echo ""
echo "📋 Step 2: Building the app..."
npm run build

echo ""
echo "📋 Step 3: Deploying to Vercel..."
echo ""
echo "⚠️  This will prompt you to:"
echo "   - Login to Vercel (if not logged in)"
echo "   - Link to existing project or create new"
echo "   - Confirm deployment settings"
echo ""

# Deploy to production
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app should be live on Vercel!"
echo ""





