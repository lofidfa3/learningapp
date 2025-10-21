#!/bin/bash

echo "================================================"
echo "  🚀 Deploy to Firebase Hosting"
echo "================================================"
echo ""

# Check if logged in to Firebase
if ! firebase projects:list > /dev/null 2>&1; then
    echo "⚠️  Not logged in to Firebase!"
    echo "   Please run: firebase login"
    echo ""
    exit 1
fi

echo "✓ Logged in to Firebase"
echo ""

# Go to project directory
cd /Users/amirfooladi/learningapp

# Clean and install
echo "Step 1/3: Installing dependencies..."
rm -rf .next
npm install > /dev/null 2>&1
echo "✓ Done"
echo ""

# Build
echo "Step 2/3: Building for production..."
npm run build
BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
    echo ""
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

echo "✓ Build successful"
echo ""

# Deploy
echo "Step 3/3: Deploying to Firebase..."
firebase deploy

echo ""
echo "================================================"
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "Your app is now live!"
echo "Check the URL above to access it."
echo ""

