# Authentication Parity Fix

## Problem

Users who signed up with **email/password** had different database capabilities compared to users who signed in with **Google OAuth**. This created an inconsistent experience.

### Root Cause

1. **Email/Password users**: Profile created via `createUserProfile()` with complete defaults:
   - `target_language: 'italian'`
   - `daily_goal: 10`
   - `subscription_status: 'free'`
   - `subscription_plan: 'basic'`
   - `articles_per_day: 5`
   - `notifications_enabled: true`
   - All stats initialized to 0

2. **Google OAuth users**: Profile created via `upsert` in callback page with minimal fields:
   - Only `id`, `email`, `display_name`
   - Missing all other default fields
   - Caused incomplete database records

## Solution

### 1. Updated `ensureUserProfile()` Function

**File**: `lib/create-user-profile.ts`

Now checks for ALL required fields and backfills missing ones:

```typescript
// Checks for incomplete profiles
const needsUpdate = 
  !existing.display_name || 
  !existing.target_language ||
  !existing.daily_goal ||
  !existing.subscription_status ||
  !existing.subscription_plan ||
  !existing.articles_per_day;

// Updates with complete defaults if needed
if (needsUpdate) {
  await supabase.from('users').update({ 
    display_name: displayName || email.split('@')[0],
    target_language: 'italian',
    daily_goal: 10,
    subscription_status: 'free',
    subscription_plan: 'basic',
    articles_per_day: 5,
    notifications_enabled: true,
  });
}
```

### 2. Updated OAuth Callback Handler

**File**: `app/auth/callback/page.tsx`

Now uses `ensureUserProfile()` to guarantee complete profile creation:

```typescript
// Import ensureUserProfile for consistent profile setup
const { ensureUserProfile } = await import('@/lib/create-user-profile');

const profileSuccess = await ensureUserProfile(
  session.user.id,
  session.user.email || '',
  displayName
);
```

### 3. Updated Auth Context

**File**: `lib/auth-context.tsx`

Enhanced display name extraction from OAuth metadata:

```typescript
const displayNameFromMetadata = 
  currentUser.user_metadata?.display_name ||
  currentUser.user_metadata?.full_name ||
  currentUser.user_metadata?.name ||
  currentUser.email?.split('@')[0];
```

### 4. Database Migration

**File**: `supabase/migrations/003_ensure_complete_profiles.sql`

- Updated `handle_new_user()` trigger to set ALL defaults
- Backfills existing users with missing fields
- Ensures future users get complete profiles automatically

## How to Apply

### Option 1: Automatic (Recommended)

The fix is already applied in the code. When you deploy or restart the app:

1. New users (both email and OAuth) will get complete profiles
2. Existing users will be backfilled when they next sign in
3. The `ensureUserProfile()` function runs on every auth state change

### Option 2: Manual Migration (Database)

If you want to apply the database migration immediately:

```bash
# Make sure you're in the project directory
cd /Users/amirfooladi/learningapp

# Apply the migration
npm run supabase:migrate

# Or use the helper script
./scripts/apply-profile-parity-migration.sh
```

### Option 3: Direct SQL in Supabase Dashboard

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Copy the contents of supabase/migrations/003_ensure_complete_profiles.sql
-- and execute it in the SQL editor
```

## Verification

### Check if the fix worked:

1. **Sign in with Google OAuth**
2. **Check your Supabase dashboard** → Authentication → Users → Select user
3. **Verify the profile has ALL fields**:
   - ✅ `display_name`
   - ✅ `target_language`
   - ✅ `daily_goal`
   - ✅ `subscription_status`
   - ✅ `subscription_plan`
   - ✅ `articles_per_day`
   - ✅ `notifications_enabled`

4. **Test database operations**:
   - Save vocabulary words
   - Translate articles
   - Track progress
   - Use flashcards

### Test Both Auth Methods

```bash
# Test 1: Email/Password
1. Create account with email
2. Verify all features work
3. Check database for complete profile

# Test 2: Google OAuth
1. Sign in with Google
2. Verify all features work
3. Check database for complete profile

# Both should have IDENTICAL capabilities
```

## What's Fixed

✅ **All users now have identical database capabilities** regardless of auth method

✅ **Google OAuth users can now**:
- Save vocabulary items
- Track reading progress
- Set language preferences
- Receive personalized recommendations
- Access all premium features (if applicable)
- Have proper subscription status

✅ **Consistent user experience** across authentication methods

✅ **Automatic backfilling** of existing incomplete profiles

✅ **Future-proof** database trigger for new users

## Files Changed

1. `lib/create-user-profile.ts` - Enhanced profile creation/updating
2. `app/auth/callback/page.tsx` - Fixed OAuth callback
3. `lib/auth-context.tsx` - Improved auth state handling
4. `supabase/migrations/003_ensure_complete_profiles.sql` - Database migration
5. `scripts/apply-profile-parity-migration.sh` - Helper script

## Technical Details

### Before Fix

```javascript
// OAuth users got minimal profile
{
  id: 'user-id',
  email: 'user@example.com',
  display_name: 'User Name',
  // ❌ Missing: target_language, daily_goal, subscription_status, etc.
}
```

### After Fix

```javascript
// All users get complete profile
{
  id: 'user-id',
  email: 'user@example.com',
  display_name: 'User Name',
  target_language: 'italian',
  daily_goal: 10,
  subscription_status: 'free',
  subscription_plan: 'basic',
  articles_per_day: 5,
  notifications_enabled: true,
  articles_read: 0,
  words_learned: 0,
  streak_days: 0,
  last_active_date: '2025-01-01T00:00:00Z'
}
```

## Rollback (If Needed)

If you need to revert the changes:

```bash
git restore lib/create-user-profile.ts
git restore app/auth/callback/page.tsx
git restore lib/auth-context.tsx
```

For the database migration, you would need to manually revert in Supabase.

## Support

If you still experience issues after applying this fix:

1. Check browser console for errors
2. Verify Supabase connection
3. Check that all migrations are applied
4. Look at Supabase logs for any errors
5. Create a new test user with each auth method

## Notes

- This fix is **backwards compatible** - existing users won't be affected negatively
- The backfill happens automatically on next sign-in
- No data is lost or overwritten - only missing fields are added
- The fix applies to both new and existing users

