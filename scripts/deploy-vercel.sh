#!/bin/bash

# Automated Vercel Deployment Script

set -e

echo "🚀 Deploying to Vercel"
echo "======================"
echo ""

# Check if logged in
if ! vercel whoami > /dev/null 2>&1; then
  echo "❌ Not logged into Vercel"
  echo "   Run: vercel login"
  exit 1
fi

echo "✅ Logged into Vercel"
echo ""

# Check for environment variables
if [ -f .env.local ]; then
  echo "📋 Found .env.local - make sure to add these to Vercel:"
  echo ""
  grep "NEXT_PUBLIC_" .env.local | while read line; do
    KEY=$(echo "$line" | cut -d'=' -f1)
    echo "   ✅ $KEY"
  done
  echo ""
  echo "💡 Add these in Vercel Dashboard → Project → Settings → Environment Variables"
  echo ""
fi

# Build check
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ Build successful"
echo ""

# Deploy
echo "📤 Deploying to Vercel..."
echo ""

vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "💡 Don't forget to:"
echo "   1. Add environment variables in Vercel Dashboard"
echo "   2. Run database migrations in Supabase"
echo "   3. Test your deployed app"
echo ""

