#!/bin/bash

# Fix Port 3000 Conflict
# Another program is using port 3000

SERVER_IP="82.165.174.146"
SERVER_USER="root"

echo "🔍 Checking what's using port 3000..."
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    echo "Step 1: Finding what's using port 3000..."
    echo ""
    
    # Find process using port 3000
    PID=$(ss -tlnp | grep :3000 | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2 | head -1)
    
    if [ -n "$PID" ]; then
        echo "⚠️  Port 3000 is in use by PID: $PID"
        echo ""
        echo "Process details:"
        ps aux | grep $PID | grep -v grep
        echo ""
        
        # Check if it's our app
        if pm2 list | grep -q "learningapp"; then
            echo "✅ Our app (learningapp) is running with PM2"
            echo "   This might be the issue - let's check PM2 port"
            pm2 describe learningapp | grep -E "port|script"
        else
            echo "❌ Unknown process using port 3000"
            echo ""
            read -p "Kill process $PID? (y/n): " kill_it
            if [ "$kill_it" = "y" ]; then
                kill -9 $PID
                echo "✅ Process killed"
            fi
        fi
    else
        echo "✅ Port 3000 is free"
    fi
    
    echo ""
    echo "Step 2: Checking all processes on port 3000..."
    ss -tlnp | grep :3000
    echo ""
    
    echo "Step 3: Checking PM2 processes..."
    pm2 list
    echo ""
    
    echo "Step 4: Options to fix..."
    echo ""
    echo "Option A: Use different port (e.g., 3001)"
    echo "Option B: Stop conflicting process"
    echo "Option C: Check if it's our app on wrong port"
    echo ""
ENDSSH

echo ""
echo "🔧 Fixing port conflict..."
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /var/www/learningapp
    
    echo "Step 5: Changing app to use port 3001..."
    
    # Update .env.production
    if [ -f ".env.production" ]; then
        sed -i 's/PORT=3000/PORT=3001/g' .env.production
        echo "PORT=3001" >> .env.production
        echo "✅ Updated .env.production to use port 3001"
    else
        echo "PORT=3001" >> .env.production
        echo "✅ Created .env.production with port 3001"
    fi
    
    # Update ecosystem.config.js
    if [ -f "ecosystem.config.js" ]; then
        sed -i 's/"PORT": 3000/"PORT": 3001/g' ecosystem.config.js
        sed -i 's/3000/3001/g' ecosystem.config.js
        echo "✅ Updated ecosystem.config.js to use port 3001"
    fi
    
    echo ""
    echo "Step 6: Stopping old process..."
    pm2 delete learningapp 2>/dev/null || true
    pkill -f "node.*3000" 2>/dev/null || true
    
    echo ""
    echo "Step 7: Starting app on port 3001..."
    PORT=3001 pm2 start ecosystem.config.js || PORT=3001 pm2 start npm --name "learningapp" -- start
    pm2 save
    
    sleep 3
    
    echo ""
    echo "Step 8: Testing new port..."
    curl -s http://localhost:3001 | head -c 100 && echo "..." || echo "❌ Not responding on 3001"
    
    echo ""
    echo "Step 9: Updating Nginx to use port 3001..."
    sed -i 's/127.0.0.1:3000/127.0.0.1:3001/g' /etc/nginx/sites-available/learningapp
    
    if nginx -t; then
        systemctl reload nginx
        echo "✅ Nginx updated and reloaded"
    else
        echo "❌ Nginx config error:"
        nginx -t
    fi
    
    echo ""
    echo "✅ Port conflict fixed!"
    echo ""
    echo "📊 Status:"
    pm2 status
    echo ""
    ss -tlnp | grep -E "3000|3001"
ENDSSH

echo ""
echo "✅ Port conflict resolved!"
echo ""
echo "🌐 Your app should now work at: https://newslings.org"
echo ""
echo "📝 Changed from port 3000 to 3001"
echo ""






