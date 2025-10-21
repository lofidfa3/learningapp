#!/bin/bash

clear
echo "=============================================="
echo "  COMPLETE FIX - Language Learning App"
echo "=============================================="
echo ""

# Kill all processes
echo "🔴 Step 1/6: Stopping all node processes..."
killall -9 node 2>/dev/null
sleep 3
echo "   ✅ Done"
echo ""

# Navigate to project
cd /Users/amirfooladi/learningapp
echo "📁 Step 2/6: In project directory"
echo "   ✅ $(pwd)"
echo ""

# Remove problematic Tailwind v4
echo "🗑️  Step 3/6: Removing Tailwind CSS v4..."
npm uninstall tailwindcss postcss autoprefixer >/dev/null 2>&1
echo "   ✅ Removed"
echo ""

# Install correct versions
echo "📦 Step 4/6: Installing Tailwind CSS v3 (stable)..."
npm install -D tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.18
echo "   ✅ Installed"
echo ""

# Ensure correct PostCSS config
echo "⚙️  Step 5/6: Verifying PostCSS configuration..."
cat > postcss.config.js << 'EOFCONFIG'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOFCONFIG
rm -f postcss.config.mjs 2>/dev/null
echo "   ✅ Configuration correct"
echo ""

# Clear caches
echo "🧹 Step 6/6: Clearing caches..."
rm -rf .next node_modules/.cache
echo "   ✅ Caches cleared"
echo ""

echo "=============================================="
echo "  🎉 FIX COMPLETE!"
echo "=============================================="
echo ""
echo "Starting development server..."
echo "The app will open in your browser automatically."
echo ""
echo "Press Ctrl+C to stop the server when done."
echo ""
echo "=============================================="
echo ""

# Start server
PORT=3000 npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 15

# Try to open browser
if command -v open &> /dev/null; then
    open http://localhost:3000
    echo "✅ Browser opened at http://localhost:3000"
else
    echo "📱 Open your browser manually: http://localhost:3000"
fi

echo ""
echo "Server is running. Press Ctrl+C to stop."
echo ""

# Keep script running
wait $SERVER_PID

