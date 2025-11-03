# Supabase Setup Guide

This guide will help you set up Supabase as the backend for your LinguaNews application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - **Name**: linguanews (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
4. Click "Create new project" and wait for it to initialize (~2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under Project API keys)

## Step 3: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

## Step 4: Run Database Migrations

You need to create the database tables and functions. There are two ways to do this:

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. In your Supabase project, go to the **SQL Editor**
2. Open the migration file `supabase/migrations/001_initial_schema.sql` from your project
3. Copy the entire SQL content
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration
6. Repeat for `supabase/migrations/002_helper_functions.sql`

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (you'll need your project ref from the dashboard)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Step 5: Set Up Authentication (Optional - Google OAuth)

If you want to use Google Sign-In:

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Google** provider
3. Follow Supabase's instructions to set up Google OAuth:
   - Create a Google Cloud Project
   - Configure OAuth consent screen
   - Create OAuth credentials
   - Add credentials to Supabase

## Step 6: Verify Database Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see the following tables:
   - `users`
   - `vocabulary_items`
   - `articles`
   - `user_actions`

## Step 7: Test the Connection

1. Run your Next.js app:
```bash
npm run dev
```

2. Open your browser to `http://localhost:3000`
3. Try signing up with a new account
4. Check your Supabase dashboard to see if the user was created in the `users` table

## Database Schema Overview

### Users Table
Stores user profiles and subscription information.

### Vocabulary Items Table
Stores all saved vocabulary words with translations and review progress.

### Articles Table
Stores articles that users have read or saved.

### User Actions Table
Tracks all user interactions for analytics and personalization.

## Row Level Security (RLS)

All tables have Row Level Security enabled. This means:
- Users can only access their own data
- All queries are automatically filtered by user ID
- No need to add user ID checks in your application code

## Backup Your Data

It's recommended to:
1. Regularly export your database (Supabase does automatic backups for paid plans)
2. Keep your migration files in version control
3. Test migrations on a development project before running on production

## Migration from Firebase

If you're migrating from Firebase:
1. Export your Firebase data
2. Use the Supabase dashboard or CLI to import data
3. Run a test migration on a development project first
4. Update your application code to use Supabase services

## Troubleshooting

### Connection Issues
- Verify your `.env.local` file has the correct credentials
- Make sure there are no extra spaces in the environment variables
- Restart your Next.js dev server after changing `.env.local`

### RLS Policy Errors
- Check that you're authenticated before making requests
- Verify the user ID matches the data you're trying to access
- Review RLS policies in **Authentication** → **Policies**

### Migration Errors
- Run migrations in order (001, then 002, etc.)
- Check for syntax errors in the SQL
- Look at the error message in the SQL Editor for hints

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Configure environment variables
3. ✅ Run migrations
4. ✅ Test authentication
5. Start using the app!

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

