#!/bin/bash

echo "================================================"
echo "  🚀 DEPLOYING TO FIREBASE"
echo "================================================"
echo ""
echo "Project: linguanewes"
echo "URL: https://linguanewes.web.app"
echo ""

cd /Users/amirfooladi/learningapp

echo "Step 1: Cleaning up..."
killall -9 node 2>/dev/null || true
rm -rf .next out
echo "✓ Done"
echo ""

echo "Step 2: Installing dependencies..."
if [ ! -d "node_modules" ]; then
  npm install
fi
echo "✓ Done"
echo ""

echo "Step 3: Building for production..."
npm run build
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ BUILD FAILED!"
    echo "Please fix errors above before deploying."
    exit 1
fi
echo "✓ Build successful!"
echo ""

echo "Step 4: Deploying to Firebase..."
firebase deploy --only hosting
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ DEPLOYMENT FAILED!"
    echo "Make sure you're logged in: firebase login"
    exit 1
fi

echo ""
echo "================================================"
echo "  ✅ DEPLOYMENT SUCCESSFUL!"
echo "================================================"
echo ""
echo "Your app is now live at:"
echo "  🌐 https://linguanewes.web.app"
echo "  🌐 https://linguanewes.firebaseapp.com"
echo ""
echo "Opening in browser..."
open https://linguanewes.web.app

echo ""
echo "Share this URL with others!"
echo "================================================"

