#!/bin/bash

# Auto-deploy to Vercel (non-interactive)

set -e

echo "🚀 Auto-deploying to Vercel..."
echo ""

cd /Users/amirfooladi/learningapp

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if already linked to a project
if [ -f ".vercel/project.json" ]; then
    echo "✅ Project already linked to Vercel"
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    echo "Project ID: $PROJECT_ID"
else
    echo "⚠️  Project not linked. You may need to link it first:"
    echo "   vercel link"
    echo ""
    echo "Or deploy as new project:"
    vercel --yes
    exit 0
fi

echo ""
echo "📦 Building app..."
npm run build

echo ""
echo "🚀 Deploying to production..."
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""





