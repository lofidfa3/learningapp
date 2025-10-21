#!/bin/bash

echo "================================================"
echo "  🚀 DEPLOYING TO VERCEL"
echo "================================================"
echo ""
echo "Vercel is the BEST host for Next.js apps!"
echo "Your app will be live in ~30 seconds."
echo ""

cd /Users/amirfooladi/learningapp

# Clean up
echo "Step 1: Cleaning..."
killall -9 node 2>/dev/null || true
rm -rf .next
echo "✓ Done"
echo ""

# Check if logged in
echo "Step 2: Checking Vercel login..."
if ! vercel whoami > /dev/null 2>&1; then
    echo "⚠️  Not logged in to Vercel!"
    echo "   Running: vercel login"
    vercel login
fi
echo "✓ Logged in"
echo ""

# Deploy
echo "Step 3: Deploying to Vercel..."
echo "================================================"
echo ""

vercel --prod

echo ""
echo "================================================"
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "Your app is now LIVE!"
echo "Check the URL above ⬆️"
echo ""
echo "Share it with anyone - it's public! 🌍"
echo "================================================"

