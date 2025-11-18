-- Migration to ensure 100% parity between email/password and OAuth users
-- This guarantees all users have identical database capabilities

-- Update the trigger function to be even more comprehensive
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user profile with FULL defaults
  INSERT INTO public.users (
    id, 
    email, 
    display_name,
    subscription_status,
    subscription_plan,
    articles_per_day,
    target_language,
    daily_goal,
    notifications_enabled,
    articles_read,
    words_learned,
    streak_days,
    last_active_date,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1),
      'User'
    ),
    'free',        -- All users start as free
    'basic',       -- All users start with basic plan
    5,             -- 5 articles per day for free users
    'italian',     -- Default target language
    10,            -- Default daily goal
    true,          -- Notifications enabled by default
    0,             -- Initial articles read
    0,             -- Initial words learned
    0,             -- Initial streak days
    NOW(),         -- Set last active to now
    NOW(),         -- Created timestamp
    NOW()          -- Updated timestamp
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Ensure ALL fields have values (fix any incomplete profiles)
    display_name = COALESCE(
      NULLIF(public.users.display_name, ''),
      COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'User'
      )
    ),
    email = COALESCE(public.users.email, NEW.email),
    subscription_status = COALESCE(public.users.subscription_status, 'free'),
    subscription_plan = COALESCE(public.users.subscription_plan, 'basic'),
    articles_per_day = COALESCE(public.users.articles_per_day, 5),
    target_language = COALESCE(public.users.target_language, 'italian'),
    daily_goal = COALESCE(public.users.daily_goal, 10),
    notifications_enabled = COALESCE(public.users.notifications_enabled, true),
    articles_read = COALESCE(public.users.articles_read, 0),
    words_learned = COALESCE(public.users.words_learned, 0),
    streak_days = COALESCE(public.users.streak_days, 0),
    last_active_date = COALESCE(public.users.last_active_date, NOW()),
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill ALL existing users to ensure complete profiles
-- This fixes any OAuth users who may have incomplete data
UPDATE public.users
SET 
  display_name = COALESCE(NULLIF(display_name, ''), split_part(email, '@', 1), 'User'),
  subscription_status = COALESCE(subscription_status, 'free'),
  subscription_plan = COALESCE(subscription_plan, 'basic'),
  articles_per_day = COALESCE(articles_per_day, 5),
  target_language = COALESCE(target_language, 'italian'),
  daily_goal = COALESCE(daily_goal, 10),
  notifications_enabled = COALESCE(notifications_enabled, true),
  articles_read = COALESCE(articles_read, 0),
  words_learned = COALESCE(words_learned, 0),
  streak_days = COALESCE(streak_days, 0),
  last_active_date = COALESCE(last_active_date, NOW()),
  updated_at = NOW()
WHERE 
  -- Update any record with at least one NULL field
  display_name IS NULL OR display_name = '' OR
  subscription_status IS NULL OR
  subscription_plan IS NULL OR
  articles_per_day IS NULL OR
  target_language IS NULL OR
  daily_goal IS NULL OR
  notifications_enabled IS NULL OR
  articles_read IS NULL OR
  words_learned IS NULL OR
  streak_days IS NULL OR
  last_active_date IS NULL;

-- Add helpful comment
COMMENT ON FUNCTION handle_new_user() IS 
  '✅ UPDATED: Ensures 100% parity between email/password and OAuth users. All users get identical database capabilities.';

-- Create a helper view to verify all users have complete profiles
CREATE OR REPLACE VIEW user_profile_completeness AS
SELECT 
  id,
  email,
  display_name,
  CASE 
    WHEN display_name IS NOT NULL AND display_name != '' AND
         subscription_status IS NOT NULL AND
         subscription_plan IS NOT NULL AND
         articles_per_day IS NOT NULL AND
         target_language IS NOT NULL AND
         daily_goal IS NOT NULL AND
         notifications_enabled IS NOT NULL AND
         articles_read IS NOT NULL AND
         words_learned IS NOT NULL AND
         streak_days IS NOT NULL AND
         last_active_date IS NOT NULL
    THEN true
    ELSE false
  END as is_complete,
  CASE 
    WHEN display_name IS NULL OR display_name = '' THEN 'Missing display_name'
    WHEN subscription_status IS NULL THEN 'Missing subscription_status'
    WHEN subscription_plan IS NULL THEN 'Missing subscription_plan'
    WHEN articles_per_day IS NULL THEN 'Missing articles_per_day'
    WHEN target_language IS NULL THEN 'Missing target_language'
    WHEN daily_goal IS NULL THEN 'Missing daily_goal'
    WHEN notifications_enabled IS NULL THEN 'Missing notifications_enabled'
    WHEN articles_read IS NULL THEN 'Missing articles_read'
    WHEN words_learned IS NULL THEN 'Missing words_learned'
    WHEN streak_days IS NULL THEN 'Missing streak_days'
    WHEN last_active_date IS NULL THEN 'Missing last_active_date'
    ELSE 'Complete'
  END as completeness_status
FROM public.users;

-- Grant access to view for authenticated users
GRANT SELECT ON user_profile_completeness TO authenticated;

COMMENT ON VIEW user_profile_completeness IS 
  'View to verify all user profiles are complete with identical capabilities';

