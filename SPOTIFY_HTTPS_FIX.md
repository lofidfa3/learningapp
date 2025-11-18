# Fix: Spotify Won't Accept HTTP Redirect URI

## Problem
Spotify no longer allows HTTP redirect URIs (even for localhost) for security reasons. They require HTTPS.

## Solution
I've updated the code to use the **existing HTTPS redirect URI** that you already have configured in your Spotify Dashboard:

✅ `https://localhost:3000/auth/spotify/callback` (already in your dashboard)
✅ `https://learningapp-iota.vercel.app/auth/spotify/callback` (already in your dashboard)

## What I Changed

1. **Updated redirect URI path** from `/api/spotify/callback` to `/auth/spotify/callback`
2. **Changed default to HTTPS** instead of HTTP
3. **Created new callback route** at `/auth/spotify/callback` to match your existing configuration

## For Local Development

Since you're using `https://localhost:3000`, you'll need to:

### Option 1: Use Production URL (Easiest)
Just use your Vercel deployment URL:
- Set `NEXT_PUBLIC_APP_URL=https://learningapp-iota.vercel.app` in `.env.local`
- The app will use: `https://learningapp-iota.vercel.app/auth/spotify/callback`

### Option 2: Set Up HTTPS for Localhost (Advanced)
If you want to test locally with HTTPS:

1. Install `mkcert`:
   ```bash
   brew install mkcert  # macOS
   # or
   npm install -g mkcert
   ```

2. Create local certificate:
   ```bash
   mkcert -install
   mkcert localhost
   ```

3. Update `next.config.js` to use HTTPS (requires custom server setup)

**Recommendation**: Use Option 1 (production URL) for testing - it's much simpler!

## Environment Variables

Update your `.env.local`:

```env
SPOTIFY_CLIENT_ID=aeca33a241374f0aae9f0d0b2fe771a2
SPOTIFY_CLIENT_SECRET=29dab9ff2d234c77a18df6737b08f2cf
SPOTIFY_REDIRECT_URI=https://learningapp-iota.vercel.app/auth/spotify/callback
NEXT_PUBLIC_APP_URL=https://learningapp-iota.vercel.app
```

Or for local testing with your existing HTTPS localhost:
```env
SPOTIFY_REDIRECT_URI=https://localhost:3000/auth/spotify/callback
NEXT_PUBLIC_APP_URL=https://localhost:3000
```

## Testing

1. Restart your dev server
2. Try connecting Spotify again
3. It should now work with your existing redirect URIs!

## Note

The redirect URIs in your Spotify Dashboard are:
- ✅ `https://localhost:3000/auth/spotify/callback` 
- ✅ `https://learningapp-iota.vercel.app/auth/spotify/callback`

The code now matches these exactly, so no changes needed in Spotify Dashboard!

