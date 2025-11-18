# Fix: Build Error - PostCSS/Webpack Plugin Loading

## Problem

The build is failing with:
```
Build failed because of webpack errors
Error loading PostCSS plugins
```

## Root Cause

PostCSS and autoprefixer were in `devDependencies`, so when running `npm install --production` on the server, they weren't installed. Next.js needs these for the build process.

## Solution Applied

1. ✅ Moved `postcss` and `autoprefixer` to `dependencies` (not devDependencies)
2. ✅ Updated PostCSS version to match Next.js requirements (8.4.31)
3. ✅ Updated fix script to install ALL dependencies (not just production)

## Quick Fix

### Option 1: Run the Fix Script

```bash
cd /Users/amirfooladi/learningapp
./fix-build-error.sh
```

This will:
- Clean node_modules
- Reinstall all dependencies
- Build the app
- Start with PM2

### Option 2: Manual Fix on Server

SSH into your server:
```bash
ssh root@82.165.174.146
cd /var/www/learningapp
```

Then run:
```bash
# Clean everything
rm -rf node_modules package-lock.json .next

# Reinstall ALL dependencies (not just production)
npm install

# Build
npm run build

# Start with PM2
pm2 restart learningapp || pm2 start ecosystem.config.js
```

## What Changed

**package.json:**
- Moved `postcss` and `autoprefixer` from `devDependencies` to `dependencies`
- Updated `postcss` version to `^8.4.31` (matches Next.js requirement)

**fix-server-complete.sh:**
- Changed from `npm install --production` to `npm install`
- This ensures all build dependencies are installed

## Why This Happened

Next.js requires PostCSS and autoprefixer during the build process, even in production. These need to be in `dependencies`, not `devDependencies`, because:
- The build happens on the server
- Next.js needs these plugins to process CSS
- They're required at build time, not just development time

## After Fixing

Your app should:
1. ✅ Build successfully
2. ✅ Start with PM2
3. ✅ Be accessible at https://newsling.org

## Verify

After running the fix:
```bash
# On server
pm2 status
curl http://localhost:3000
```

Both should work now!

