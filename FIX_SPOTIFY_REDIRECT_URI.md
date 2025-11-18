# Fix: INVALID_CLIENT - Invalid redirect URI

## Problem Analysis

The error "INVALID_CLIENT: Invalid redirect URI" occurs when:
- The redirect URI in your **Spotify Developer Dashboard** doesn't match
- The redirect URI your code is sending to Spotify

These must match **EXACTLY** (including http/https, port numbers, trailing slashes, etc.)

## Current Redirect URI in Code

Your code is using:
- **Local development**: `http://localhost:3000/api/spotify/callback`
- **Production**: `{NEXT_PUBLIC_APP_URL}/api/spotify/callback`

## Solution: Add Redirect URI to Spotify Dashboard

### Step 1: Go to Spotify Developer Dashboard

1. Visit: https://developer.spotify.com/dashboard
2. Log in with your Spotify account
3. Click on your app (or create a new one)

### Step 2: Add Redirect URI

1. Click **"Edit Settings"** button
2. Scroll down to **"Redirect URIs"** section
3. Click **"Add URI"**
4. Add these URIs (one at a time):

   **For Local Development:**
   ```
   http://localhost:3000/api/spotify/callback
   ```

   **For Production (if deployed):**
   ```
   https://your-domain.com/api/spotify/callback
   ```
   (Replace `your-domain.com` with your actual domain)

5. Click **"Add"** after each URI
6. Scroll down and click **"Save"**

### Step 3: Important Notes

⚠️ **CRITICAL**: The redirect URI must match EXACTLY:
- ✅ `http://localhost:3000/api/spotify/callback` (correct)
- ❌ `http://localhost:3000/api/spotify/callback/` (wrong - trailing slash)
- ❌ `https://localhost:3000/api/spotify/callback` (wrong - https instead of http)
- ❌ `http://127.0.0.1:3000/api/spotify/callback` (wrong - different host)

### Step 4: Verify Your Environment Variables

Make sure your `.env.local` has:

```env
SPOTIFY_CLIENT_ID=aeca33a241374f0aae9f0d0b2fe771a2
SPOTIFY_CLIENT_SECRET=29dab9ff2d234c77a18df6737b08f2cf
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Test Again

1. Restart your development server
2. Try connecting Spotify again
3. The error should be resolved

## Common Mistakes

1. **Missing redirect URI** - Not added to dashboard at all
2. **Wrong protocol** - Using `https` instead of `http` for localhost
3. **Trailing slash** - Adding or missing `/` at the end
4. **Wrong port** - Using different port than 3000
5. **Wrong path** - Different path than `/api/spotify/callback`

## Quick Checklist

- [ ] Redirect URI added to Spotify Dashboard
- [ ] URI matches exactly (no trailing slash, correct protocol)
- [ ] Saved changes in Spotify Dashboard
- [ ] Environment variables set correctly
- [ ] Development server restarted

## Still Having Issues?

If it still doesn't work:

1. **Check browser console** - Look for the exact redirect URI being used
2. **Check Spotify Dashboard** - Verify the URI is saved correctly
3. **Clear browser cache** - Sometimes cached OAuth state causes issues
4. **Try incognito mode** - To rule out browser extensions

## For Production Deployment

When deploying to production:

1. Add production redirect URI to Spotify Dashboard:
   ```
   https://your-actual-domain.com/api/spotify/callback
   ```

2. Update environment variables:
   ```env
   SPOTIFY_REDIRECT_URI=https://your-actual-domain.com/api/spotify/callback
   NEXT_PUBLIC_APP_URL=https://your-actual-domain.com
   ```

3. Make sure both local and production URIs are in the dashboard

