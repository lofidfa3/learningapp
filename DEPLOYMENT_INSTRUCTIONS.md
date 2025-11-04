# 🚀 Deployment Instructions - Make App Fully Functional

## Current Status

✅ **Local Development:** Working perfectly
- App running at http://localhost:54112
- DeepSeek API configured in `.env.local`
- All functions working locally

⏳ **Production:** Needs API keys

## Quick Deploy (Manual Method)

Since automated deployment is having issues, here's the manual way:

### Step 1: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `learningapp`

2. **Add Environment Variables:**
   - Go to: Settings → Environment Variables
   - Click "Add New"
   
3. **Add These Variables:**

   **Variable 1:**
   - Name: `DEEPSEEK_API_KEY`
   - Value: `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`
   - Environment: Production, Preview, Development (check all)
   - Click "Save"

   **Variable 2:**
   - Name: `DEEPSEEK_MODEL`  
   - Value: `deepseek/deepseek-chat`
   - Environment: Production, Preview, Development (check all)
   - Click "Save"

### Step 2: Redeploy

After adding the variables:
1. Go to "Deployments" tab
2. Click the "⋯" menu on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete (~2 minutes)

### Step 3: Test Production

Once deployed, visit your app and test:
1. ✅ Browse news articles
2. ✅ Click an article
3. ✅ Click "Translate Article" - Should work!
4. ✅ Click "Extract Vocabulary" - Should work!
5. ✅ Save words to flashcards
6. ✅ Review flashcards

## What Each Variable Does

### DEEPSEEK_API_KEY
Powers the AI features:
- Article translation to 9 languages
- Vocabulary extraction from articles
- AI chat about articles

### DEEPSEEK_MODEL
Specifies which AI model to use:
- `deepseek/deepseek-chat` - Fast, accurate, cost-effective

## Verification

After deploying, check:

1. **Homepage loads** ✅
   - Should see news articles

2. **Translation works** ✅
   - Open any article
   - Click "Translate Article"
   - Should see translation appear

3. **Vocabulary extraction works** ✅
   - Click "Extract Vocabulary"
   - Should see list of words with translations

4. **Saving works** ✅
   - Click "Save" on words
   - Check Flashcards page - words should appear

5. **Database integration** ✅
   - All saves go to Supabase
   - Data persists across sessions

## Alternative: Command Line Deploy

If you prefer command line:

```bash
cd /Users/amirfooladi/learningapp

# Add environment variables
vercel env add DEEPSEEK_API_KEY production
# Paste: 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

vercel env add DEEPSEEK_MODEL production  
# Paste: deepseek/deepseek-chat

# Deploy
vercel --prod
```

## Troubleshooting

### Issue: Translation not working in production
**Solution:** Check environment variables are set in Vercel dashboard

### Issue: "API key not configured" error
**Solution:** Redeploy after adding environment variables

### Issue: Local works but production doesn't
**Solution:** Environment variables only in `.env.local`, not in Vercel

## Current URLs

- **Local:** http://localhost:54112 (WORKING ✅)
- **Production:** https://learningapp-q2jhiwf4z-amis-projects-6dcd4b7c.vercel.app (Needs env vars)

## Summary

**What you need to do:**
1. Go to Vercel Dashboard
2. Add 2 environment variables (see above)
3. Redeploy
4. Test the app

**Total time:** ~5 minutes

After this, your app will be **fully functional** on production! 🎉


