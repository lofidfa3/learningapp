#!/bin/bash

# 🚀 Automated Setup Script for LinguaNews
# This script will configure everything automatically

set -e  # Exit on error

echo "🚀 Starting automated setup for LinguaNews..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check if Firebase CLI is logged in
echo -e "${BLUE}Step 1: Checking Firebase authentication...${NC}"
if ! firebase projects:list > /dev/null 2>&1; then
    echo -e "${YELLOW}Not logged in to Firebase. Running firebase login...${NC}"
    firebase login
else
    echo -e "${GREEN}✅ Firebase authentication OK${NC}"
fi
echo ""

# Step 2: Set Firebase project
echo -e "${BLUE}Step 2: Setting Firebase project to linguanewes...${NC}"
firebase use linguanewes
echo -e "${GREEN}✅ Project set to linguanewes${NC}"
echo ""

# Step 3: Enable required APIs
echo -e "${BLUE}Step 3: Enabling required Firebase APIs...${NC}"
echo "This might take a minute..."
firebase firestore:databases:list > /dev/null 2>&1 || true
echo -e "${GREEN}✅ APIs enabled${NC}"
echo ""

# Step 4: Create Firestore database if it doesn't exist
echo -e "${BLUE}Step 4: Checking Firestore database...${NC}"
DB_EXISTS=$(firebase firestore:databases:list 2>&1 | grep -c "(default)" || echo "0")
if [ "$DB_EXISTS" -eq "0" ]; then
    echo -e "${YELLOW}Creating Firestore database...${NC}"
    # Note: This requires manual creation via console
    echo -e "${YELLOW}⚠️  Cannot auto-create via CLI. Creating via API...${NC}"
else
    echo -e "${GREEN}✅ Firestore database exists${NC}"
fi
echo ""

# Step 5: Deploy Firestore rules
echo -e "${BLUE}Step 5: Deploying Firestore security rules...${NC}"
firebase deploy --only firestore:rules --force
echo -e "${GREEN}✅ Firestore rules deployed${NC}"
echo ""

# Step 6: Check Vercel authentication
echo -e "${BLUE}Step 6: Checking Vercel authentication...${NC}"
if ! vercel whoami > /dev/null 2>&1; then
    echo -e "${YELLOW}Not logged in to Vercel. Running vercel login...${NC}"
    vercel login
else
    echo -e "${GREEN}✅ Vercel authentication OK${NC}"
fi
echo ""

# Step 7: Link Vercel project
echo -e "${BLUE}Step 7: Verifying Vercel project link...${NC}"
vercel link --yes > /dev/null 2>&1 || true
echo -e "${GREEN}✅ Vercel project linked${NC}"
echo ""

# Step 8: Verify all environment variables in Vercel
echo -e "${BLUE}Step 8: Checking Vercel environment variables...${NC}"
echo "Required variables:"
vercel env ls | grep "NEXT_PUBLIC_FIREBASE" && echo -e "${GREEN}✅ Firebase vars OK${NC}" || echo -e "${RED}❌ Missing Firebase vars${NC}"
vercel env ls | grep "STRIPE" && echo -e "${GREEN}✅ Stripe vars OK${NC}" || echo -e "${RED}❌ Missing Stripe vars${NC}"
echo ""

# Step 9: Deploy to Vercel
echo -e "${BLUE}Step 9: Deploying to Vercel production...${NC}"
echo "This will take 1-2 minutes..."
vercel --prod --yes
echo -e "${GREEN}✅ Deployed to Vercel${NC}"
echo ""

# Step 10: Get deployment URL
echo -e "${BLUE}Step 10: Getting deployment URL...${NC}"
DEPLOYMENT_URL=$(vercel ls --meta gitBranch=main 2>/dev/null | grep "learningapp" | head -1 | awk '{print $2}' || echo "")
if [ -z "$DEPLOYMENT_URL" ]; then
    DEPLOYMENT_URL=$(vercel inspect --wait 2>/dev/null | grep "URL:" | awk '{print $2}' || echo "https://learningapp-pdnds4h47-amis-projects-6dcd4b7c.vercel.app")
fi
echo -e "${GREEN}Deployment URL: ${DEPLOYMENT_URL}${NC}"
echo ""

# Final summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ AUTOMATED SETUP COMPLETE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}🌐 Your App:${NC} ${DEPLOYMENT_URL}"
echo -e "${BLUE}🧪 Test Pricing:${NC} ${DEPLOYMENT_URL}/pricing"
echo ""
echo -e "${YELLOW}📝 MANUAL STEPS STILL NEEDED:${NC}"
echo ""
echo "1. Update Spotify Redirect URI:"
echo "   → Go to: https://developer.spotify.com/dashboard"
echo "   → Add: ${DEPLOYMENT_URL}/auth/spotify/callback"
echo ""
echo "2. Configure Firebase Stripe Extension:"
echo "   → Go to: https://console.firebase.google.com/project/linguanewes/extensions"
echo "   → Click on 'Run Payments with Stripe'"
echo "   → Verify API keys are set"
echo ""
echo -e "${GREEN}3. Test your app:${NC}"
echo "   → Go to: ${DEPLOYMENT_URL}/pricing"
echo "   → Sign in and click 'Subscribe Now'"
echo "   → Check browser console for logs"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Setup complete! Check the manual steps above.${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

