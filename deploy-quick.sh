#!/bin/bash

echo "🚀 Quick Deploy to Get HTTPS"
echo "=============================="
echo ""
echo "This will deploy your app to Vercel and give you a free HTTPS URL!"
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

cd /Users/amirfooladi/learningapp

# Deploy
vercel --prod

echo ""
echo "✅ Done!"
echo ""
echo "📝 Next steps:"
echo "1. Copy your production URL (ends with .vercel.app)"
echo "2. Go to Spotify Dashboard"
echo "3. Add redirect URI: https://your-url.vercel.app/lyrics"
echo "4. Click Save"
echo ""
echo "🎉 You now have HTTPS!"
