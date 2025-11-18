# 🚀 Deploy to Vercel RIGHT NOW

Your code is pushed to GitHub! Follow these steps:

## Step 1: Open Vercel Dashboard
👉 https://vercel.com/new

## Step 2: Import Your Repository
1. Click **"Import Git Repository"**
2. Find and select: `lofidfa3/learningapp`
3. Click **"Import"**

## Step 3: Configure Project
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (leave default)
- **Build Command:** `npm run build` (leave default)
- **Output Directory:** `.next` (leave default)

## Step 4: Add Environment Variables

Click "Environment Variables" and add these **5 variables**:

### Variable 1:
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://cnuuusmeigryzkctfcgr.supabase.co
```
Select: ✅ Production ✅ Preview ✅ Development

### Variable 2:
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNudXV1c21laWdyeXprY3RmY2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMzMzNDgsImV4cCI6MjA1MjgwOTM0OH0.AClvNd9Mi0f1VDMLo0j1yGXe-YXYE-CGhfHqFwpuWHQ
```
Select: ✅ Production ✅ Preview ✅ Development

### Variable 3:
```
Name: DEEPSEEK_API_KEY
Value: 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
```
Select: ✅ Production ✅ Preview ✅ Development

### Variable 4:
```
Name: OPENROUTER_API_KEY
Value: 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
```
Select: ✅ Production ✅ Preview ✅ Development

### Variable 5:
```
Name: DEEPSEEK_MODEL
Value: deepseek/deepseek-chat-v3.1:free
```
Select: ✅ Production ✅ Preview ✅ Development

### Variable 6 (Required for migration):
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Your Supabase Service Role Key - get from Supabase Dashboard > Settings > API]
```
Select: ✅ Production ✅ Preview ✅ Development

## Step 5: Deploy!
Click **"Deploy"** button and wait 2-3 minutes ⏱️

## Step 6: After Deployment

You'll get a URL like: `https://learningapp-xxx.vercel.app`

### Update Supabase:
1. Go to: https://supabase.com/dashboard/project/cnuuusmeigryzkctfcgr/auth/url-configuration
2. Add **Site URL**: `https://your-vercel-url.vercel.app`
3. Add **Redirect URL**: `https://your-vercel-url.vercel.app/auth/callback`
4. Add **Redirect URL**: `https://your-vercel-url.vercel.app/**`

### Update Google OAuth (if using):
1. Go to: https://console.cloud.google.com/apis/credentials
2. Add to **Authorized JavaScript origins**: `https://your-vercel-url.vercel.app`
3. Add to **Authorized redirect URIs**: `https://your-vercel-url.vercel.app/auth/callback`

### Apply Database Migration:

**Option 1: Via Supabase Dashboard (Recommended)**
1. Go to: https://supabase.com/dashboard/project/cnuuusmeigryzkctfcgr/sql
2. Copy content from: `supabase/migrations/004_ensure_auth_parity.sql`
3. Paste and run in SQL editor

**Option 2: Via API Endpoint**
1. After deployment, call: `POST https://your-vercel-url.vercel.app/api/supabase/migrate`
2. Check status: `GET https://your-vercel-url.vercel.app/api/supabase/migrate`

## ✅ Done!

Visit your Vercel URL and test:
- ✅ Email/password signup
- ✅ Google sign-in
- ✅ Save vocabulary
- ✅ Translate articles

Both auth methods now have **identical** database capabilities! 🎉

---

## 🔧 Quick Links

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Auth: https://supabase.com/dashboard/project/cnuuusmeigryzkctfcgr/auth/url-configuration
- Supabase SQL: https://supabase.com/dashboard/project/cnuuusmeigryzkctfcgr/sql
- Google Console: https://console.cloud.google.com/apis/credentials
- Your GitHub Repo: https://github.com/lofidfa3/learningapp


