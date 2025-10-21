#!/bin/bash

echo "========================================="
echo "Language Learning App - Setup & Run"
echo "========================================="

# Kill any existing processes
echo "Step 1: Killing existing node processes..."
killall -9 node 2>/dev/null
sleep 2

# Clean up
echo "Step 2: Cleaning up old files..."
cd /Users/amirfooladi/learningapp
rm -rf .next node_modules/.cache

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Step 3: Installing dependencies..."
    npm install
else
    echo "Step 3: Dependencies already installed"
fi

# Verify PostCSS config
echo "Step 4: Verifying configuration..."
if [ ! -f "postcss.config.js" ]; then
    echo "Creating postcss.config.js..."
    cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
fi

# Start the server
echo "Step 5: Starting development server..."
echo "========================================="
PORT=4000 npm run dev

