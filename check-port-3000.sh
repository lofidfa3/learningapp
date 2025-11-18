#!/bin/bash

# Check what's using port 3000

SERVER_IP="82.165.174.146"
SERVER_USER="root"

echo "🔍 Checking what's using port 3000..."
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    echo "=== Port 3000 Status ==="
    echo ""
    
    # Check if port 3000 is in use
    if ss -tlnp | grep -q ":3000"; then
        echo "⚠️  Port 3000 is IN USE"
        echo ""
        
        echo "Process using port 3000:"
        ss -tlnp | grep :3000
        echo ""
        
        # Get PID
        PID=$(ss -tlnp | grep :3000 | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2 | head -1)
        
        if [ -n "$PID" ]; then
            echo "PID: $PID"
            echo ""
            echo "Process details:"
            ps aux | grep "^$PID " | grep -v grep || ps aux | grep $PID | grep -v grep | head -1
            echo ""
            
            # Check if it's a Node.js process
            if ps -p $PID -o comm= | grep -q node; then
                echo "✅ It's a Node.js process"
                echo ""
                echo "Command:"
                ps -p $PID -o args=
                echo ""
                
                # Check if it's our app
                if pm2 list | grep -q "learningapp"; then
                    echo "Our PM2 app status:"
                    pm2 describe learningapp
                fi
            else
                echo "⚠️  It's NOT a Node.js process"
                echo "   This might be the conflict!"
            fi
        fi
    else
        echo "✅ Port 3000 is FREE"
    fi
    
    echo ""
    echo "=== All PM2 Processes ==="
    pm2 list
    echo ""
    
    echo "=== All Node Processes ==="
    ps aux | grep node | grep -v grep
    echo ""
    
    echo "=== All processes on common ports ==="
    ss -tlnp | grep -E ":3000|:3001|:80|:443"
ENDSSH

echo ""
echo "✅ Port check complete!"
echo ""





