#!/bin/bash
set -e

clear
echo "================================================"
echo "    EMERGENCY FIX - Complete Reinstall"
echo "================================================"
echo ""
echo "This will fix your Tailwind CSS error."
echo ""

# Step 1
echo "Step 1/5: Stopping all Node processes..."
killall -9 node 2>/dev/null || true
sleep 3
echo "✅ Done"
echo ""

# Step 2
echo "Step 2/5: Removing old installations..."
cd /Users/amirfooladi/learningapp
rm -rf node_modules package-lock.json .next
echo "✅ Done"
echo ""

# Step 3
echo "Step 3/5: Installing dependencies (this takes 30-60 seconds)..."
npm install
echo "✅ Done"
echo ""

# Step 4
echo "Step 4/5: Verifying Tailwind CSS version..."
TAILWIND_VERSION=$(npm list tailwindcss 2>&1 | grep tailwindcss@ | head -1)
echo "   $TAILWIND_VERSION"
if echo "$TAILWIND_VERSION" | grep -q "3.4.1"; then
    echo "✅ Correct version installed!"
else
    echo "❌ Wrong version! Forcing install..."
    npm install -D tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.18
fi
echo ""

# Step 5
echo "Step 5/5: Starting development server..."
echo "================================================"
echo ""
echo "Server will start at: http://localhost:3000"
echo "Browser will open automatically"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================================"
echo ""

# Start server
npm run dev &
SERVER_PID=$!

# Wait for server
sleep 20

# Open browser
open http://localhost:3000 2>/dev/null || echo "Open http://localhost:3000 in your browser"

# Keep running
wait $SERVER_PID

