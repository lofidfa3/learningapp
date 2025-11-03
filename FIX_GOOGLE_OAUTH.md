# 🔧 Fix Google OAuth: redirect_uri_mismatch Error

## Problem

You're seeing: **"Error 400: redirect_uri_mismatch"**

This means the redirect URI in your Google OAuth credentials doesn't match what Supabase is using.

## ✅ Solution

You need to add the **Supabase callback URL** to your Google OAuth credentials.

### Step 1: Get Your Supabase Project Reference

Your Supabase URL is: `https://cnuuusmeigryzkctfcgr.supabase.co`

So your project reference is: `cnuuusmeigryzkctfcgr`

### Step 2: Add Redirect URI to Google Cloud Console

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/

2. **Select your project** (or create one if needed)

3. **Navigate to APIs & Services → Credentials:**
   https://console.cloud.google.com/apis/credentials

4. **Find your OAuth 2.0 Client ID** (or create one):
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Supabase OAuth" (or any name)

5. **Add Authorized redirect URIs:**
   
   Add **BOTH** of these URLs:
   ```
   https://cnuuusmeigryzkctfcgr.supabase.co/auth/v1/callback
   http://localhost:54321/auth/v1/callback
   ```
   
   The first one is for production, the second is for local development (if using Supabase CLI locally).

6. **Save** the credentials

7. **Copy the Client ID and Client Secret**

### Step 3: Configure in Supabase Dashboard

1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard/project/cnuuusmeigryzkctfcgr

2. **Navigate to:**
   Authentication → Providers

3. **Enable Google Provider:**
   - Toggle "Google" to ON

4. **Add Credentials:**
   - **Client ID (for OAuth):** Paste your Google Client ID
   - **Client Secret (for OAuth):** Paste your Google Client Secret

5. **Save** the configuration

### Step 4: Add Redirect URL in Supabase (Optional but Recommended)

1. **Go to:**
   Authentication → URL Configuration

2. **Add Site URL:**
   ```
   https://learningapp-39o1b9j24-amis-projects-6dcd4b7c.vercel.app
   ```

3. **Add Redirect URLs:**
   ```
   https://learningapp-39o1b9j24-amis-projects-6dcd4b7c.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

4. **Save**

## 📋 Quick Checklist

- [ ] Created/Selected Google Cloud Project
- [ ] Created OAuth 2.0 Client ID in Google Cloud Console
- [ ] Added redirect URI: `https://cnuuusmeigryzkctfcgr.supabase.co/auth/v1/callback`
- [ ] Copied Client ID and Client Secret
- [ ] Enabled Google provider in Supabase Dashboard
- [ ] Added Client ID and Secret in Supabase
- [ ] Added redirect URLs in Supabase URL Configuration

## 🔍 Verify the Fix

1. **Clear browser cache** (or use incognito mode)

2. **Try Google Sign In again:**
   - Go to `/auth/signin`
   - Click "Sign in with Google"
   - ✅ Should redirect properly now

## 🐛 Still Not Working?

### Check 1: Redirect URI Format
The redirect URI **must be exactly:**
```
https://cnuuusmeigryzkctfcgr.supabase.co/auth/v1/callback
```
- ✅ Must start with `https://`
- ✅ Must match your Supabase project URL
- ✅ Must end with `/auth/v1/callback`

### Check 2: Google Cloud Console
- Make sure you're editing the correct OAuth Client ID
- The redirect URI should be in "Authorized redirect URIs" section
- Save after adding

### Check 3: Supabase Dashboard
- Verify Client ID and Secret are correct (no extra spaces)
- Make sure Google provider is **enabled** (toggle is ON)
- Check URL Configuration has your site URL

### Check 4: Wait a Few Minutes
- Google OAuth changes can take 1-5 minutes to propagate
- Try again after waiting

## 📝 Important Notes

1. **The redirect URI must match exactly** - Google is very strict about this
2. **Use HTTPS** - Production URLs must use `https://`
3. **No trailing slashes** - Don't add `/` at the end
4. **Case sensitive** - URLs are case-sensitive

## 🎯 Expected Redirect URI Format

For Supabase projects, the format is always:
```
https://[PROJECT-REF].supabase.co/auth/v1/callback
```

Where `[PROJECT-REF]` is your Supabase project reference.

In your case:
```
https://cnuuusmeigryzkctfcgr.supabase.co/auth/v1/callback
```

---

**After following these steps, Google OAuth should work!** ✅

