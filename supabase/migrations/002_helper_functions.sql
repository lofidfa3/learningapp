-- Helper function to increment articles read count
CREATE OR REPLACE FUNCTION increment_articles_read(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET 
    articles_read = articles_read + 1,
    last_active_date = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to increment words learned count
CREATE OR REPLACE FUNCTION increment_words_learned(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET 
    words_learned = words_learned + 1,
    last_active_date = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate and update streak
CREATE OR REPLACE FUNCTION update_user_streak(user_id UUID)
RETURNS integer AS $$
DECLARE
  last_active DATE;
  today DATE := CURRENT_DATE;
  current_streak INTEGER;
BEGIN
  SELECT last_active_date::date, streak_days
  INTO last_active, current_streak
  FROM public.users
  WHERE id = user_id;

  -- If last active was yesterday, increment streak
  IF last_active = today - INTERVAL '1 day' THEN
    current_streak := current_streak + 1;
  -- If last active was today, keep streak
  ELSIF last_active = today THEN
    -- Do nothing, streak remains
    RETURN current_streak;
  -- If more than a day ago, reset streak
  ELSE
    current_streak := 1;
  END IF;

  -- Update user record
  UPDATE public.users
  SET 
    streak_days = current_streak,
    last_active_date = NOW()
  WHERE id = user_id;

  RETURN current_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'articles_read', articles_read,
    'words_learned', words_learned,
    'streak_days', streak_days,
    'vocabulary_count', (
      SELECT COUNT(*) FROM public.vocabulary_items WHERE vocabulary_items.user_id = users.id
    ),
    'mastered_count', (
      SELECT COUNT(*) FROM public.vocabulary_items 
      WHERE vocabulary_items.user_id = users.id AND mastered = true
    ),
    'total_actions', (
      SELECT COUNT(*) FROM public.user_actions WHERE user_actions.user_id = users.id
    )
  )
  INTO result
  FROM public.users
  WHERE id = user_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to increment words_learned when vocabulary is added
CREATE OR REPLACE FUNCTION on_vocabulary_added()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM increment_words_learned(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER vocabulary_added_trigger
  AFTER INSERT ON public.vocabulary_items
  FOR EACH ROW
  EXECUTE FUNCTION on_vocabulary_added();

