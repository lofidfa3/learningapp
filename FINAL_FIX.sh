#!/bin/bash

echo "================================================"
echo "FINAL FIX - Tailwind CSS v3 Installation"
echo "================================================"
echo ""

# Stop all processes
echo "1. Stopping all Node processes..."
killall -9 node 2>/dev/null
sleep 3

# Navigate to project
cd /Users/amirfooladi/learningapp

# Remove Tailwind v4
echo "2. Removing Tailwind CSS v4..."
npm uninstall tailwindcss postcss autoprefixer 2>/dev/null

# Install Tailwind v3 (stable)
echo "3. Installing Tailwind CSS v3 (stable version)..."
npm install -D tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.18

# Ensure PostCSS config is correct
echo "4. Creating correct PostCSS configuration..."
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Clean cache
echo "5. Clearing Next.js cache..."
rm -rf .next

echo ""
echo "================================================"
echo "✅ Fix Complete! Starting server..."
echo "================================================"
echo ""

# Start server
npm run dev


