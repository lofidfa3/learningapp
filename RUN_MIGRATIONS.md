# 🚀 Run Supabase Migrations

## Quick Start

Your Supabase backend needs database tables. Follow these steps:

### Option 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "+ New query"

3. **Run Migration 001**
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste into SQL editor
   - Click "Run"
   - Wait for "Success" message

4. **Run Migration 002**
   - Copy contents of `supabase/migrations/002_helper_functions.sql`
   - Paste into SQL editor
   - Click "Run"
   - Wait for "Success" message

5. **Verify Tables Created**
   - Click "Table Editor" in sidebar
   - You should see:
     - `users`
     - `vocabulary_items`
     - `articles`
     - `user_actions`

### Option 2: Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

## What the Migrations Do

### Migration 001: Initial Schema
Creates:
- `users` table - User profiles and stats
- `vocabulary_items` table - Saved vocabulary with spaced repetition
- `articles` table - Read/saved articles
- `user_actions` table - Action tracking
- RLS policies - Row-level security
- Triggers - Auto-create user profile on signup

### Migration 002: Helper Functions
Creates:
- `increment_user_stat()` - Update user statistics
- `update_user_streak()` - Calculate study streaks

## Verify Setup

After running migrations, test with SQL:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should show: users, vocabulary_items, articles, user_actions

-- Test user insert
INSERT INTO users (id, email, display_name) 
VALUES ('test-user-id', 'test@example.com', 'Test User');

-- Check it worked
SELECT * FROM users WHERE email = 'test@example.com';

-- Clean up test
DELETE FROM users WHERE email = 'test@example.com';
```

## Common Issues

### Error: "relation already exists"
**Solution:** Tables already created. Safe to ignore.

### Error: "permission denied"
**Solution:** Check you're using service role key or are project owner.

### Error: "syntax error"
**Solution:** Copy the entire migration file, don't miss any lines.

## After Migrations

1. ✅ Tables created
2. ✅ RLS policies active
3. ✅ Triggers set up
4. ✅ Ready to use!

Now your app will:
- Create user profiles on signup
- Save vocabulary to database
- Track progress in database
- Persist flashcard reviews

## Need Help?

If migrations fail, you can manually create tables. See migration files for SQL.

