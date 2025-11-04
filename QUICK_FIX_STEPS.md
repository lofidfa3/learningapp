# 🚀 Quick Fix - DeepSeek API Error

## The Problem
```
Error: DEEPSEEK_API_KEY or OPENROUTER_API_KEY is not configured
```

## Quick Solution (3 Steps)

### Step 1: Verify .env.local exists
```bash
cd /Users/amirfooladi/learningapp
ls -la .env.local
```

If it doesn't exist, create it:
```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://cnuuusmeigryzkctfcgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNudXV1c21laWdyeXprY3RmY2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMzMzNDgsImV4cCI6MjA1MjgwOTM0OH0.AClvNd9Mi0f1VDMLo0j1yGXe-YXYE-CGhfHqFwpuWHQ
DEEPSEEK_API_KEY=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
DEEPSEEK_MODEL=deepseek/deepseek-chat
NEXT_PUBLIC_APP_URL=https://learningapp-q2jhiwf4z-amis-projects-6dcd4b7c.vercel.app
EOF
```

### Step 2: Kill all Node processes
```bash
pkill -9 node
```

### Step 3: Restart the server
```bash
cd /Users/amirfooladi/learningapp
npm run dev
```

## Test It Works

1. Open http://localhost:3000 (or whatever port it shows)
2. Click any article
3. Click "Translate Article" - Should work now! ✅
4. Click "Extract Vocabulary" - Should work now! ✅

## What Should Happen

When you start `npm run dev`, you should see:
```
▲ Next.js 15.5.6
- Local:        http://localhost:XXXX
- Environments: .env.local         ← This line is important!
✓ Ready in XXXXms
```

The key is seeing "Environments: .env.local" which means Next.js found and loaded your environment variables.

## Still Not Working?

### Check .env.local content:
```bash
cat .env.local | grep DEEPSEEK
```
Should show:
```
DEEPSEEK_API_KEY=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
DEEPSEEK_MODEL=deepseek/deepseek-chat
```

### Check file permissions:
```bash
chmod 644 .env.local
```

### Make sure you're in the right directory:
```bash
pwd
# Should show: /Users/amirfooladi/learningapp
```

## ✅ Done!

Once you see "Environments: .env.local" when starting the server, translation and vocabulary extraction will work!


