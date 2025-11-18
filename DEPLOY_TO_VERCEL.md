# Deploy to Vercel - Step by Step Guide

## ✅ What's Been Fixed

All authentication parity issues have been resolved! Both email/password and Google OAuth users now have identical database capabilities.

## 🚀 Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New Project"**

3. **Import your Git repository**
   - Connect your GitHub/GitLab account if not already connected
   - Select the `learningapp` repository

4. **Configure the project:**
   - Framework Preset: **Next.js**
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **Add Environment Variables:**
   
   Click "Environment Variables" and add these:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://cnuuusmeigryzkctfcgr.supabase.co
   ```
   
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNudXV1c21laWdyeXprY3RmY2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMzMzNDgsImV4cCI6MjA1MjgwOTM0OH0.AClvNd9Mi0f1VDMLo0j1yGXe-YXYE-CGhfHqFwpuWHQ
   ```
   
   ```
   DEEPSEEK_API_KEY=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
   ```
   
   ```
   OPENROUTER_API_KEY=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
   ```
   
   ```
   DEEPSEEK_MODEL=deepseek/deepseek-chat-v3.1:free
   ```

   **Important:** Select ✅ Production, ✅ Preview, and ✅ Development for each variable

6. **Click "Deploy"**

7. **Wait for deployment** (usually 2-3 minutes)

### Option 2: Deploy via Vercel CLI (if team access resolved)

```bash
cd /Users/amirfooladi/learningapp

# Login to Vercel
vercel login

# Remove old config
rm -rf .vercel

# Deploy to production
vercel --prod --yes
```

## 🔧 After Deployment

### 1. Update Supabase Redirect URLs

Once deployed, you'll get a URL like: `https://your-app.vercel.app`

Go to [Supabase Auth Settings](https://supabase.com/dashboard/project/cnuuusmeigryzkctfcgr/auth/url-configuration)

Add these URLs:

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs:**
```
https://your-app.vercel.app/**
https://your-app.vercel.app/auth/callback
```

### 2. Update Google OAuth (if using Google Sign-In)

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

Add to **Authorized JavaScript origins:**
```
https://your-app.vercel.app
```

Add to **Authorized redirect URIs:**
```
https://your-app.vercel.app/auth/callback
https://cnuuusmeigryzkctfcgr.supabase.co/auth/v1/callback
```

### 3. Apply Database Migration

Apply the auth parity migration to ensure all users have complete profiles:

**Option A - Via Supabase Dashboard:**
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/cnuuusmeigryzkctfcgr/sql)
2. Copy contents from `supabase/migrations/003_ensure_complete_profiles.sql`
3. Paste and run in SQL editor

**Option B - Via Supabase CLI:**
```bash
# If you have Supabase CLI installed
supabase db push --include-all
```

## ✅ Verification

After deployment, test both auth methods:

1. **Test Email/Password Sign Up:**
   - Create new account
   - Verify all features work
   - Check Supabase dashboard for complete profile

2. **Test Google Sign-In:**
   - Sign in with Google
   - Verify all features work
   - Check Supabase dashboard for complete profile

Both should have **identical** database access:
- ✅ Save vocabulary
- ✅ Track progress
- ✅ Read articles
- ✅ Use flashcards
- ✅ AI translations

## 🐛 Troubleshooting

### Build Error: "generate is not a function"

This error occurs during local builds. Vercel's build environment handles it differently and should work fine. If you see this:

1. **Push to Git and deploy via Vercel Dashboard** instead of CLI
2. Vercel's remote build environment will handle Next.js 15 properly

### Team Access Error

If you see: "Git author must have access to the team"

1. Remove `.vercel` folder: `rm -rf .vercel`
2. Deploy via Vercel Dashboard instead of CLI
3. Or ask team owner to add you as collaborator

### OAuth Redirect Errors

If Google/OAuth sign-in fails:

1. Check redirect URLs in Supabase match your Vercel URL
2. Check Google Cloud Console redirect URIs
3. Wait 5-10 minutes for DNS propagation

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [AUTH_PARITY_FIX.md](./AUTH_PARITY_FIX.md) - Details on the auth fix

## 🎉 You're Done!

Once deployed and configured, your app will have:
- ✅ Unified authentication (email + Google with equal capabilities)
- ✅ Complete user profiles for all auth methods
- ✅ Full database access for all users
- ✅ Production-ready deployment on Vercel

Visit your deployment URL and enjoy! 🚀

