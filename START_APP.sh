#!/bin/bash

# Start the LinguaNews AI-Powered App

echo "🚀 Starting LinguaNews - AI-Powered Language Learning App"
echo ""

# Go to project directory
cd /Users/amirfooladi/learningapp

# Kill any existing servers
echo "🔄 Checking for existing servers..."
lsof -ti:3000 :54112 2>/dev/null | xargs kill -9 2>/dev/null
sleep 2

# Verify environment variables
echo "🔑 Checking environment variables..."
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found"
    echo "Run: cat AI_POWERED_READY.md for setup instructions"
    exit 1
fi

if grep -q "DEEPSEEK_API_KEY" .env.local; then
    echo "✅ DeepSeek API key found"
else
    echo "❌ Error: DEEPSEEK_API_KEY not found in .env.local"
    exit 1
fi

# Start the server
echo ""
echo "🎯 Starting development server with AI features..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev

# The script will stay running with the server

