-- Migration to add translation and vocabulary storage columns to articles table
-- This ensures translations persist across sessions for all users

-- Add translation columns to articles table
ALTER TABLE public.articles 
  ADD COLUMN IF NOT EXISTS translation TEXT,
  ADD COLUMN IF NOT EXISTS translation_language TEXT,
  ADD COLUMN IF NOT EXISTS vocabulary JSONB,
  ADD COLUMN IF NOT EXISTS vocabulary_language TEXT;

-- Add index for faster lookup by translation existence
CREATE INDEX IF NOT EXISTS idx_articles_with_translation 
  ON public.articles(user_id, id) 
  WHERE translation IS NOT NULL;

-- Add index for faster lookup by vocabulary existence
CREATE INDEX IF NOT EXISTS idx_articles_with_vocabulary 
  ON public.articles(user_id, id) 
  WHERE vocabulary IS NOT NULL;

-- Add comment to document this change
COMMENT ON COLUMN public.articles.translation IS 
  'Stores the translated content of the article for reuse across sessions';

COMMENT ON COLUMN public.articles.translation_language IS 
  'The target language of the translation (e.g., Italian, Spanish)';

COMMENT ON COLUMN public.articles.vocabulary IS 
  'Stores extracted vocabulary words as JSON array for quick access';

COMMENT ON COLUMN public.articles.vocabulary_language IS 
  'The target language of the vocabulary extraction';

-- Ensure RLS policies still work with new columns (they inherit from table)
-- No additional RLS policies needed as the existing ones cover SELECT/UPDATE

