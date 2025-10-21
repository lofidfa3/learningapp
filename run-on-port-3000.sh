#!/bin/bash

echo "🔧 Starting app on port 3000..."
echo ""

# Kill any existing Node processes
echo "Killing existing Node processes..."
killall -9 node 2>/dev/null || true
sleep 1

# Navigate to project directory
cd /Users/amirfooladi/learningapp

echo ""
echo "✅ Starting dev server on port 3000..."
echo "📍 Your app will be at: http://localhost:3000"
echo "🎵 Lyrics page will be at: http://localhost:3000/lyrics"
echo ""
echo "📝 Add this redirect URI to Spotify Dashboard:"
echo "   http://localhost:3000/lyrics"
echo ""
echo "=========================================="
echo ""

# Start the dev server on port 3000
PORT=3000 npm run dev

