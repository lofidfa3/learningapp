#!/bin/bash

echo "========================================="
echo "🔧 Language Learning App - Auto Fix & Run"
echo "========================================="

# Kill all node processes
echo "Step 1: Stopping any running servers..."
killall -9 node 2>/dev/null
sleep 3

# Navigate to project directory
cd /Users/amirfooladi/learningapp

# Clean build artifacts
echo "Step 2: Cleaning cache..."
rm -rf .next

# Fix PostCSS configuration
echo "Step 3: Fixing PostCSS configuration..."
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Remove conflicting config
rm -f postcss.config.mjs

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Step 4: Installing dependencies (this may take a minute)..."
    npm install
else
    echo "Step 4: Dependencies already installed ✓"
fi

# Verify key files exist
echo "Step 5: Verifying configuration files..."
if [ -f "tailwind.config.ts" ]; then
    echo "  ✓ tailwind.config.ts found"
fi
if [ -f "postcss.config.js" ]; then
    echo "  ✓ postcss.config.js found"
fi
if [ -f "next.config.mjs" ]; then
    echo "  ✓ next.config.mjs found"
fi

# Start the development server
echo ""
echo "========================================="
echo "🚀 Starting development server..."
echo "========================================="
echo ""
echo "The app will open in your browser automatically."
echo "If not, look for the URL below (usually http://localhost:3000)"
echo ""

# Start server in background
npm run dev &
SERVER_PID=$!

# Wait for server to start and open browser
echo "Waiting for server to start..."
sleep 15

# Try to find which port the server is running on and open it
for port in 3000 54112 4000 3001; do
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo ""
    echo "========================================="
    echo "✅ SUCCESS! Server is running on port $port"
    echo "========================================="
    echo ""
    echo "Opening browser at: http://localhost:$port"
    echo ""
    echo "Press Ctrl+C to stop the server when done."
    echo ""
    
    # Open in default browser
    open http://localhost:$port
    
    # Keep script running so server stays up
    wait $SERVER_PID
    exit 0
  fi
done

echo ""
echo "⚠️  Server started but port detection failed."
echo "   Check the output above for the URL (look for 'Local: http://localhost:XXXX')"
echo "   Copy that URL and paste it in your browser."
echo ""

# Keep server running
wait $SERVER_PID

