# 🚀 Vercel Deployment Guide

## Quick Deploy

Your app is ready to deploy! Here's how:

### Option 1: Deploy via Vercel CLI (Recommended)

```bash
# Make sure you're logged in
vercel login

# Deploy (will prompt for project settings)
vercel

# Deploy to production
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. **Go to**: https://vercel.com/new
2. **Import your Git repository** (or drag & drop your project)
3. **Configure**:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### ⚠️ Important: Environment Variables

**You MUST add these environment variables in Vercel Dashboard:**

1. Go to your project → Settings → Environment Variables
2. Add these variables for **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_SUPABASE_URL=https://cnuuusmeigryzkctfcgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNudXV1c21laWdyeXprY3RmY2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjM1MTAsImV4cCI6MjA3NzY5OTUxMH0.eFL8IceEHzQ5g1qak1CBL5kABwXF9AeA219zCbw_bBc
```

### Post-Deployment Steps

1. **Run Database Migrations** in Supabase Dashboard
2. **Test your deployed app**
3. **Verify environment variables** are set correctly

### Build Issues

If you encounter build errors:
- Check Vercel build logs
- Ensure all environment variables are set
- Verify Next.js version compatibility
- Check for TypeScript errors

## 🎯 Quick Deploy Command

```bash
npm run supabase:setup  # First, run migrations in Supabase
vercel --prod           # Then deploy!
```

---

**After deployment, your app will be live and ready to use!** 🎉

