# 🚀 Vercel Deployment Instructions

## ✅ Pre-Deployment Checklist

### 1. Local Build Successful ✅
Your app builds successfully locally.

### 2. Environment Variables Ready ✅
All required environment variables are documented.

---

## 🔧 Step 1: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

```bash
cd /Users/amirfooladi/learningapp

# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: Using Vercel Dashboard

1. **Go to:** https://vercel.com/new
2. **Import your Git repository**
3. **Configure project:**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

---

## 🔑 Step 2: Add Environment Variables in Vercel

After deploying, add these environment variables in Vercel Dashboard:

**Go to:** Your Project → Settings → Environment Variables

### Add These Variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://cnuuusmeigryzkctfcgr.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNudXV1c21laWdyeXprY3RmY2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMzMzNDgsImV4cCI6MjA1MjgwOTM0OH0.AClvNd9Mi0f1VDMLo0j1yGXe-YXYE-CGhfHqFwpuWHQ` | Production, Preview, Development |
| `DEEPSEEK_API_KEY` | `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` | Production, Preview, Development |
| `OPENROUTER_API_KEY` | `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` | Production, Preview, Development |
| `DEEPSEEK_MODEL` | `deepseek/deepseek-chat-v3.1:free` | Production, Preview, Development |

---

## 🌐 Step 3: Configure Supabase for Production

### A. Update Redirect URLs in Supabase

**Go to:** https://supabase.com/dashboard/project/cnuuusmeigryzkctfcgr/auth/url-configuration

#### Add these URLs to "Redirect URLs":

**Local (for testing):**
```
http://localhost:3000/**
http://localhost:3000/auth/callback
```

**Production (replace YOUR_VERCEL_URL):**
```
https://YOUR_VERCEL_URL.vercel.app/**
https://YOUR_VERCEL_URL.vercel.app/auth/callback
```

**Example if your URL is `learningapp-xyz.vercel.app`:**
```
https://learningapp-xyz.vercel.app/**
https://learningapp-xyz.vercel.app/auth/callback
```

#### Set "Site URL":
```
https://YOUR_VERCEL_URL.vercel.app
```

### B. Update Google OAuth Settings

**Go to:** Google Cloud Console → APIs & Services → Credentials → Your OAuth 2.0 Client

**Add to "Authorized redirect URIs":**
```
https://cnuuusmeigryzkctfcgr.supabase.co/auth/v1/callback
```

(This should already be there, but verify!)

---

## 🧪 Step 4: Test Production Deployment

After deployment:

1. **Visit your Vercel URL:** `https://YOUR_APP.vercel.app`
2. **Test authentication:**
   - Click "Sign In"
   - Click "Sign in with Google"
   - Should redirect and log you in
   - Your name should appear in nav bar
3. **Test features:**
   - Browse news articles ✅
   - Click article and read ✅
   - Translate article (DeepSeek AI) ✅
   - Extract vocabulary ✅
   - Save words to flashcards ✅
   - View flashcards page ✅
   - Check progress page ✅

---

## 🔍 Troubleshooting

### If OAuth Fails on Production:

1. **Check Supabase Redirect URLs**
   - Must include your exact Vercel URL
   - Must end with `/auth/callback`

2. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors
   - Check what URL it's trying to redirect to

3. **Verify Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Make sure all 5 variables are set
   - Redeploy after adding variables

4. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on your deployment
   - Check "Functions" logs for errors

---

## 📊 Expected Results

### Successful Deployment Shows:

```
✅ Build completed successfully
✅ Environment variables loaded
✅ Static pages generated
✅ API routes working
✅ Deployment URL: https://YOUR_APP.vercel.app
```

### After Visiting Your App:

```
✅ Homepage loads
✅ Navigation works
✅ News articles load
✅ Sign in with Google works
✅ User profile loads
✅ AI features work (translate, vocabulary)
✅ Database operations work
```

---

## 🚨 Common Issues & Solutions

### Issue: "Module not found" errors
**Solution:** Make sure all dependencies are in `package.json` dependencies, not devDependencies

### Issue: Environment variables not working
**Solution:** 
1. Add them in Vercel Dashboard
2. Make sure they're named exactly right (with `NEXT_PUBLIC_` prefix for client-side)
3. Redeploy after adding

### Issue: OAuth fails on production
**Solution:**
1. Add your Vercel URL to Supabase redirect URLs
2. Make sure format is: `https://your-app.vercel.app/auth/callback`

### Issue: API routes timeout
**Solution:**
1. Check function logs in Vercel
2. Verify API keys are set
3. Check if external APIs (DeepSeek, Guardian News) are accessible

---

## 📝 Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login (first time only)
vercel login

# Deploy to production
cd /Users/amirfooladi/learningapp
vercel --prod

# View logs
vercel logs YOUR_DEPLOYMENT_URL

# List deployments
vercel ls
```

---

## 🎯 Post-Deployment Checklist

- [ ] App deployed to Vercel
- [ ] Environment variables added in Vercel
- [ ] Supabase redirect URLs updated with Vercel URL
- [ ] Google OAuth redirect URI verified
- [ ] Tested Google sign-in on production
- [ ] Tested news articles loading
- [ ] Tested AI translation
- [ ] Tested vocabulary extraction
- [ ] Tested flashcards
- [ ] Tested progress page

---

## 🌟 Your Vercel URL Format

After deployment, your URL will be:
```
https://learningapp-[random-id].vercel.app
```

Or if you set a custom domain:
```
https://yourdomain.com
```

**Remember to:**
1. Copy this exact URL
2. Add it to Supabase redirect URLs
3. Test OAuth with the production URL

---

## 💡 Pro Tips

1. **Use Preview Deployments:** Every push to a branch creates a preview URL
2. **Environment Variables:** Set them for all environments (Production, Preview, Development)
3. **Custom Domain:** You can add a custom domain in Vercel settings
4. **Analytics:** Enable Vercel Analytics to track performance
5. **Logs:** Check function logs if APIs aren't working

---

## 🚀 Ready to Deploy!

Your app is ready for production deployment. Follow the steps above and let me know if you encounter any issues!

**Quick Start:**
```bash
cd /Users/amirfooladi/learningapp
vercel --prod
```

Then follow the prompts and add environment variables in the Vercel dashboard!

