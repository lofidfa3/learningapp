# Google Sign-In Setup Guide

## Overview
This guide will help you add Google OAuth authentication to your LinguaNews app. The backend infrastructure is already in place - you just need to configure Google OAuth and add UI buttons.

## Prerequisites
- ✅ Supabase project set up
- ✅ Google account (for creating OAuth credentials)
- ✅ Access to your Supabase dashboard
- ✅ Access to Google Cloud Console

---

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one

### 1.2 Enable Google+ API
1. Go to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google Identity"
3. Click **Enable** (if not already enabled)

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in required fields:
     - App name: `LinguaNews`
     - User support email: Your email
     - Developer contact: Your email
   - Click **Save and Continue**
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (if in testing mode)
   - Click **Save and Continue**

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `LinguaNews Web Client`
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     https://your-domain.com
     https://cnuuusmeigryzkctfcgr.supabase.co
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:3000/auth/callback
     https://your-domain.com/auth/callback
     https://cnuuusmeigryzkctfcgr.supabase.co/auth/v1/callback
     ```
   - Click **Create**

5. **Save your credentials:**
   - Copy the **Client ID**
   - Copy the **Client Secret**
   - Keep these secure - you'll need them for Supabase

---

## Step 2: Configure Supabase

### 2.1 Enable Google Provider in Supabase
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** > **Providers**
4. Find **Google** in the list
5. Click **Enable**

### 2.2 Add Google OAuth Credentials
1. In the Google provider settings, enter:
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
2. Click **Save**

### 2.3 Configure Redirect URLs
1. In Supabase, go to **Authentication** > **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: 
     ```
     http://localhost:3000/auth/callback
     https://your-domain.com/auth/callback
     ```

---

## Step 3: Add Google Sign-In Buttons to UI

### 3.1 Update Auth Pages
The following files need Google sign-in buttons:
- `app/auth/page.tsx`
- `app/auth/signin/page.tsx`
- `app/auth/signup/page.tsx`

### 3.2 Button Implementation
Add a Google sign-in button that calls `signInWithGoogle()` from the auth context.

Example button code:
```tsx
<Button
  type="button"
  variant="outline"
  className="w-full"
  onClick={async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    }
  }}
>
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  Continue with Google
</Button>
```

---

## Step 4: Test the Integration

### 4.1 Local Testing
1. Start your development server: `npm run dev`
2. Navigate to `/auth/signin` or `/auth/signup`
3. Click "Continue with Google"
4. You should be redirected to Google's sign-in page
5. After signing in, you should be redirected back to `/auth/callback`
6. Then redirected to the home page

### 4.2 Common Issues & Solutions

**Issue: "redirect_uri_mismatch" error**
- **Solution**: Make sure the redirect URI in Google Cloud Console exactly matches:
  - `https://your-supabase-project.supabase.co/auth/v1/callback`
  - Check for trailing slashes and protocol (http vs https)

**Issue: "Invalid client" error**
- **Solution**: Verify Client ID and Client Secret in Supabase match Google Cloud Console

**Issue: User not redirected after sign-in**
- **Solution**: Check that `/auth/callback` page exists and is working

**Issue: User profile not created**
- **Solution**: Check Supabase database triggers and ensure `handle_new_user` function is working

---

## Step 5: Production Deployment

### 5.1 Update Google Cloud Console
1. Add production URLs to **Authorized JavaScript origins**:
   ```
   https://your-production-domain.com
   https://your-supabase-project.supabase.co
   ```

2. Add production redirect URIs:
   ```
   https://your-production-domain.com/auth/callback
   https://your-supabase-project.supabase.co/auth/v1/callback
   ```

### 5.2 Update Supabase
1. Update **Site URL** in Supabase to your production domain
2. Add production redirect URL

### 5.3 OAuth Consent Screen
1. If your app is in testing mode, add test users
2. For production, submit for verification (if needed)
3. Update app information (logo, privacy policy, etc.)

---

## Step 6: Code Changes Required

### Files to Modify:
1. ✅ `lib/auth-context.tsx` - Already has `signInWithGoogle()` function
2. ✅ `app/auth/callback/page.tsx` - Already handles OAuth callbacks
3. ⚠️ `app/auth/page.tsx` - **Needs Google button**
4. ⚠️ `app/auth/signin/page.tsx` - **Needs Google button**
5. ⚠️ `app/auth/signup/page.tsx` - **Needs Google button**

### Implementation Checklist:
- [ ] Add Google sign-in button to `app/auth/page.tsx`
- [ ] Add Google sign-in button to `app/auth/signin/page.tsx`
- [ ] Add Google sign-in button to `app/auth/signup/page.tsx`
- [ ] Test Google sign-in flow locally
- [ ] Configure production URLs
- [ ] Test in production

---

## Quick Reference

### Google Cloud Console URLs:
- **Credentials**: https://console.cloud.google.com/apis/credentials
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent

### Supabase URLs:
- **Authentication Settings**: https://supabase.com/dashboard/project/_/auth/providers
- **URL Configuration**: https://supabase.com/dashboard/project/_/auth/url-configuration

### Important Redirect URIs:
```
# For Supabase (required)
https://cnuuusmeigryzkctfcgr.supabase.co/auth/v1/callback

# For your app (local)
http://localhost:3000/auth/callback

# For your app (production)
https://your-domain.com/auth/callback
```

---

## Security Notes

1. **Never commit** Client Secret to version control
2. Store credentials in environment variables (Supabase handles this)
3. Use HTTPS in production
4. Regularly rotate OAuth credentials
5. Monitor OAuth usage in Google Cloud Console

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify all URLs match exactly (no trailing slashes)
4. Ensure Google OAuth consent screen is configured
5. Check that Google+ API is enabled

---

## Next Steps After Setup

Once Google sign-in is working:
1. Test the full user flow (sign in → use app → sign out)
2. Verify user profiles are created correctly
3. Test on mobile devices
4. Add error handling for edge cases
5. Consider adding other OAuth providers (GitHub, etc.)

