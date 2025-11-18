# Fix: Port 3000 Conflict

## Problem
Another program is using port 3000, so your Next.js app can't start.

## Quick Fix

### Option 1: Check What's Using Port 3000

```bash
cd /Users/amirfooladi/learningapp
./check-port-3000.sh
```

This will show you what's using port 3000.

### Option 2: Fix by Using Different Port (Recommended)

```bash
cd /Users/amirfooladi/learningapp
./fix-port-conflict.sh
```

This will:
1. Change your app to use port 3001
2. Update Nginx to proxy to port 3001
3. Restart everything

## Manual Fix

### Step 1: Check What's Using Port 3000

```bash
ssh root@82.165.174.146

# Find what's using port 3000
ss -tlnp | grep :3000

# Or
lsof -i :3000

# Check all Node processes
ps aux | grep node
```

### Step 2: Option A - Stop Conflicting Process

If it's not your app:

```bash
# Find PID
PID=$(ss -tlnp | grep :3000 | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2)

# Kill it
kill -9 $PID
```

### Step 2: Option B - Use Different Port (Better)

Change your app to use port 3001:

```bash
cd /var/www/learningapp

# Update .env.production
echo "PORT=3001" >> .env.production
sed -i 's/PORT=3000/PORT=3001/g' .env.production

# Update ecosystem.config.js
sed -i 's/3000/3001/g' ecosystem.config.js

# Restart app
pm2 delete learningapp
pm2 start ecosystem.config.js

# Update Nginx
sed -i 's/127.0.0.1:3000/127.0.0.1:3001/g' /etc/nginx/sites-available/learningapp
nginx -t && systemctl reload nginx
```

## Common Causes

1. **Another Next.js app running**
2. **Old PM2 process still running**
3. **Development server left running**
4. **Another service using port 3000**

## Quick Diagnostic

```bash
ssh root@82.165.174.146

# Check port 3000
ss -tlnp | grep :3000

# Check PM2
pm2 list

# Check all Node processes
ps aux | grep node

# Check what's listening on ports
netstat -tlnp | grep -E "3000|3001"
```

## Recommended Solution

**Use port 3001** - It's easier than finding and stopping the conflicting process:

1. Run: `./fix-port-conflict.sh`
2. Done! Your app will use port 3001
3. Nginx will be updated automatically

## After Fixing

Test:
```bash
# On server
curl http://localhost:3001

# Should return HTML
```

Then visit: `https://newslings.org`

## Summary

- Port 3000 is occupied
- Solution: Use port 3001 instead
- Run `./fix-port-conflict.sh` to fix automatically






