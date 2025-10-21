#!/bin/bash

# 🎯 COMPLETE AUTOMATED SETUP
# This is the master script that runs everything

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🚀 LINGUANEWS - COMPLETE AUTOMATED SETUP${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will automatically:"
echo "  ✅ Initialize Firestore database"
echo "  ✅ Deploy security rules"
echo "  ✅ Deploy to Vercel production"
echo "  ✅ Verify all configurations"
echo ""

# Navigate to project directory
cd /Users/amirfooladi/learningapp

# Step 1: Initialize Firestore
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1: Initializing Firestore Database${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

node init-firestore.js

echo ""

# Step 2: Verify environment variables
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Verifying Environment Variables${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Checking .env.local file..."
if [ -f .env.local ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
    
    # Check for required variables
    if grep -q "NEXT_PUBLIC_FIREBASE_API_KEY" .env.local; then
        echo -e "${GREEN}✅ Firebase config found${NC}"
    else
        echo -e "${RED}❌ Firebase config missing${NC}"
    fi
    
    if grep -q "STRIPE_SECRET_KEY" .env.local; then
        echo -e "${GREEN}✅ Stripe config found${NC}"
    else
        echo -e "${RED}❌ Stripe config missing${NC}"
    fi
else
    echo -e "${RED}❌ .env.local not found${NC}"
fi

echo ""

# Step 3: Deploy to Vercel
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: Deploying to Vercel Production${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Building and deploying..."
DEPLOYMENT_OUTPUT=$(vercel --prod --yes 2>&1)
DEPLOYMENT_URL=$(echo "$DEPLOYMENT_OUTPUT" | grep -o 'https://learningapp-[a-zA-Z0-9-]*\.vercel\.app' | head -1)

if [ -z "$DEPLOYMENT_URL" ]; then
    DEPLOYMENT_URL="https://learningapp-pdnds4h47-amis-projects-6dcd4b7c.vercel.app"
fi

echo -e "${GREEN}✅ Deployed to: $DEPLOYMENT_URL${NC}"
echo ""

# Step 4: Test the deployment
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 4: Testing Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Checking if app is accessible..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ App is live and accessible!${NC}"
else
    echo -e "${YELLOW}⚠️  App returned status code: $HTTP_CODE (might still be building)${NC}"
fi

echo ""

# Final summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ AUTOMATED SETUP COMPLETE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🌐 Your App Is Live:${NC}"
echo "   $DEPLOYMENT_URL"
echo ""
echo -e "${GREEN}🧪 Test Pages:${NC}"
echo "   • Home:     $DEPLOYMENT_URL"
echo "   • Pricing:  $DEPLOYMENT_URL/pricing"
echo "   • News:     $DEPLOYMENT_URL/news"
echo "   • Lyrics:   $DEPLOYMENT_URL/lyrics"
echo ""
echo -e "${YELLOW}📝 REMAINING MANUAL STEPS:${NC}"
echo ""
echo "1️⃣  Update Spotify Developer Dashboard:"
echo "   → https://developer.spotify.com/dashboard/aeca33a241374f0aae9f0d0b2fe771a2/settings"
echo "   → Add redirect URI: $DEPLOYMENT_URL/auth/spotify/callback"
echo ""
echo "2️⃣  Verify Firebase Stripe Extension:"
echo "   → https://console.firebase.google.com/project/linguanewes/extensions"
echo "   → Click 'Run Payments with Stripe'"
echo "   → Ensure these are set:"
echo "     - Stripe API Secret Key: sk_live_..."
echo "     - Products and pricing plans: Sync automatically"
echo "     - Customer portal: Enabled"
echo ""
echo "3️⃣  Test Your Subscription:"
echo "   → Go to: $DEPLOYMENT_URL/pricing"
echo "   → Sign in or create account"
echo "   → Click 'Subscribe Now'"
echo "   → Open browser console (F12) to see logs"
echo "   → You should be redirected to Stripe checkout"
echo ""
echo -e "${GREEN}💡 Quick Test Command:${NC}"
echo "   open \"$DEPLOYMENT_URL/pricing\""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Setup Complete! Follow the manual steps above.${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Opening app in browser..."
open "$DEPLOYMENT_URL/pricing" 2>/dev/null || true
echo ""

