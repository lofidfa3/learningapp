-- Quick verification script to check if all users have complete profiles
-- Run this in Supabase SQL Editor to verify the fix

-- Check for users with incomplete profiles
SELECT 
  id,
  email,
  display_name,
  CASE 
    WHEN display_name IS NULL OR display_name = '' THEN '❌'
    ELSE '✅'
  END as has_name,
  CASE 
    WHEN target_language IS NULL THEN '❌'
    ELSE '✅'
  END as has_language,
  CASE 
    WHEN daily_goal IS NULL THEN '❌'
    ELSE '✅'
  END as has_goal,
  CASE 
    WHEN subscription_status IS NULL THEN '❌'
    ELSE '✅'
  END as has_subscription,
  CASE 
    WHEN subscription_plan IS NULL THEN '❌'
    ELSE '✅'
  END as has_plan,
  CASE 
    WHEN articles_per_day IS NULL THEN '❌'
    ELSE '✅'
  END as has_articles_limit,
  target_language,
  daily_goal,
  subscription_status,
  subscription_plan,
  articles_per_day,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- Summary: Count of complete vs incomplete profiles
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN 
    display_name IS NOT NULL AND display_name != '' AND
    target_language IS NOT NULL AND
    daily_goal IS NOT NULL AND
    subscription_status IS NOT NULL AND
    subscription_plan IS NOT NULL AND
    articles_per_day IS NOT NULL
  THEN 1 END) as complete_profiles,
  COUNT(CASE WHEN 
    display_name IS NULL OR display_name = '' OR
    target_language IS NULL OR
    daily_goal IS NULL OR
    subscription_status IS NULL OR
    subscription_plan IS NULL OR
    articles_per_day IS NULL
  THEN 1 END) as incomplete_profiles
FROM public.users;

-- List users with incomplete profiles (if any)
SELECT 
  id,
  email,
  display_name,
  'Missing: ' || 
  CASE WHEN display_name IS NULL OR display_name = '' THEN 'display_name, ' ELSE '' END ||
  CASE WHEN target_language IS NULL THEN 'target_language, ' ELSE '' END ||
  CASE WHEN daily_goal IS NULL THEN 'daily_goal, ' ELSE '' END ||
  CASE WHEN subscription_status IS NULL THEN 'subscription_status, ' ELSE '' END ||
  CASE WHEN subscription_plan IS NULL THEN 'subscription_plan, ' ELSE '' END ||
  CASE WHEN articles_per_day IS NULL THEN 'articles_per_day' ELSE '' END
  as missing_fields
FROM public.users
WHERE 
  display_name IS NULL OR display_name = '' OR
  target_language IS NULL OR
  daily_goal IS NULL OR
  subscription_status IS NULL OR
  subscription_plan IS NULL OR
  articles_per_day IS NULL;

