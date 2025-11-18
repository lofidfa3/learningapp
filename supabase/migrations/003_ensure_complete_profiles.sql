-- Migration to ensure all users have complete profiles with identical capabilities
-- regardless of authentication method (email/password vs OAuth)

-- Update the handle_new_user trigger function to set ALL default values
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    last_active_date
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'free',
    'basic',
    5,
    'italian',
    10,
    true,
    0,
    0,
    0,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Update only if fields are null/empty (preserve existing data)
    display_name = COALESCE(
      NULLIF(public.users.display_name, ''),
      COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
      )
    ),
    subscription_status = COALESCE(public.users.subscription_status, 'free'),
    subscription_plan = COALESCE(public.users.subscription_plan, 'basic'),
    articles_per_day = COALESCE(public.users.articles_per_day, 5),
    target_language = COALESCE(public.users.target_language, 'italian'),
    daily_goal = COALESCE(public.users.daily_goal, 10),
    notifications_enabled = COALESCE(public.users.notifications_enabled, true),
    articles_read = COALESCE(public.users.articles_read, 0),
    words_learned = COALESCE(public.users.words_learned, 0),
    streak_days = COALESCE(public.users.streak_days, 0),
    last_active_date = COALESCE(public.users.last_active_date, NOW());
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing users who may have incomplete profiles
-- This ensures all existing Google OAuth users get the same capabilities as email users
UPDATE public.users
SET 
  subscription_status = COALESCE(subscription_status, 'free'),
  subscription_plan = COALESCE(subscription_plan, 'basic'),
  articles_per_day = COALESCE(articles_per_day, 5),
  target_language = COALESCE(target_language, 'italian'),
  daily_goal = COALESCE(daily_goal, 10),
  notifications_enabled = COALESCE(notifications_enabled, true),
  articles_read = COALESCE(articles_read, 0),
  words_learned = COALESCE(words_learned, 0),
  streak_days = COALESCE(streak_days, 0),
  last_active_date = COALESCE(last_active_date, NOW())
WHERE 
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

-- Add a comment to document this migration
COMMENT ON FUNCTION handle_new_user() IS 
  'Ensures all users get complete profiles with identical capabilities, regardless of auth method (email/password or OAuth)';

