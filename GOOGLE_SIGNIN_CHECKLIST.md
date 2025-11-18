# Google Sign-In Implementation Checklist

## ✅ Current Status
- ✅ Backend function `signInWithGoogle()` exists in `lib/auth-context.tsx`
- ✅ OAuth callback handler exists in `app/auth/callback/page.tsx`
- ⚠️ **Missing**: Google sign-in buttons in UI
- ⚠️ **Missing**: Google OAuth configuration in Supabase
- ⚠️ **Missing**: Google OAuth credentials in Google Cloud Console

---

## 📋 Step-by-Step Checklist

### Phase 1: Google Cloud Console Setup (15 minutes)

- [ ] **1.1** Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] **1.2** Create/select a project
- [ ] **1.3** Enable Google+ API (APIs & Services > Library)
- [ ] **1.4** Configure OAuth Consent Screen:
  - [ ] Choose "External"
  - [ ] Fill app name: `LinguaNews`
  - [ ] Add support email
  - [ ] Add scopes: `email`, `profile`, `openid`
  - [ ] Save
- [ ] **1.5** Create OAuth 2.0 Client ID:
  - [ ] Application type: Web application
  - [ ] Name: `LinguaNews Web Client`
  - [ ] Add Authorized JavaScript origins:
    ```
    http://localhost:3000
    https://cnuuusmeigryzkctfcgr.supabase.co
    ```
  - [ ] Add Authorized redirect URIs:
    ```
    http://localhost:3000/auth/callback
    https://cnuuusmeigryzkctfcgr.supabase.co/auth/v1/callback
    ```
  - [ ] Create and **copy Client ID and Client Secret**

---

### Phase 2: Supabase Configuration (5 minutes)

- [ ] **2.1** Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] **2.2** Navigate to Authentication > Providers
- [ ] **2.3** Find "Google" and click Enable
- [ ] **2.4** Enter credentials:
  - [ ] Paste Google Client ID
  - [ ] Paste Google Client Secret
  - [ ] Save
- [ ] **2.5** Go to Authentication > URL Configuration
- [ ] **2.6** Set Site URL: `http://localhost:3000` (for dev)
- [ ] **2.7** Add Redirect URLs:
  ```
  http://localhost:3000/auth/callback
  ```

---

### Phase 3: Add UI Buttons (10 minutes)

- [ ] **3.1** Add Google button to `app/auth/page.tsx`
- [ ] **3.2** Add Google button to `app/auth/signin/page.tsx`
- [ ] **3.3** Add Google button to `app/auth/signup/page.tsx`
- [ ] **3.4** Import `signInWithGoogle` from `useAuth()` hook
- [ ] **3.5** Add error handling for Google sign-in

---

### Phase 4: Testing (10 minutes)

- [ ] **4.1** Start dev server: `npm run dev`
- [ ] **4.2** Navigate to `/auth/signin`
- [ ] **4.3** Click "Continue with Google"
- [ ] **4.4** Verify redirect to Google sign-in page
- [ ] **4.5** Sign in with Google account
- [ ] **4.6** Verify redirect back to app
- [ ] **4.7** Verify user is logged in
- [ ] **4.8** Check user profile in Supabase dashboard

---

### Phase 5: Production Setup (10 minutes)

- [ ] **5.1** Add production domain to Google Cloud Console:
  - [ ] Authorized JavaScript origins
  - [ ] Authorized redirect URIs
- [ ] **5.2** Update Supabase:
  - [ ] Site URL to production domain
  - [ ] Add production redirect URL
- [ ] **5.3** Test Google sign-in in production

---

## 🎯 Quick Start (Minimum Steps)

If you want to get it working quickly:

1. **Google Cloud Console** (5 min):
   - Create OAuth client
   - Copy Client ID and Secret

2. **Supabase** (2 min):
   - Enable Google provider
   - Paste credentials

3. **Code** (5 min):
   - Add Google button to auth pages
   - Test locally

**Total time: ~12 minutes**

---

## 🔧 Code Changes Needed

### File: `app/auth/page.tsx`
Add after line 207 (before closing form tag):
```tsx
<div className="relative">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-background px-2 text-muted-foreground">
      Or continue with
    </span>
  </div>
</div>

<Button
  type="button"
  variant="outline"
  className="w-full"
  onClick={async () => {
    try {
      setError('');
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    }
  }}
  disabled={loading}
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

Also add `signInWithGoogle` to the destructured `useAuth()`:
```tsx
const { signIn, signUp, signInWithGoogle, user } = useAuth();
```

### Similar changes needed for:
- `app/auth/signin/page.tsx`
- `app/auth/signup/page.tsx`

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| `redirect_uri_mismatch` | Check redirect URIs match exactly in Google Console |
| `Invalid client` | Verify Client ID/Secret in Supabase match Google Console |
| User not redirected | Check `/auth/callback` page exists |
| Profile not created | Check Supabase database triggers |

---

## 📚 Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Full Setup Guide](./GOOGLE_SIGNIN_SETUP.md)

---

**Estimated Total Time: 40-50 minutes**

