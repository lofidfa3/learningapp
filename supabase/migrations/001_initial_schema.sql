-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Subscription info
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'pro')),
  articles_per_day INTEGER DEFAULT 5,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Preferences
  target_language TEXT DEFAULT 'italian',
  daily_goal INTEGER DEFAULT 5,
  notifications_enabled BOOLEAN DEFAULT true,
  
  -- Stats
  articles_read INTEGER DEFAULT 0,
  words_learned INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date TIMESTAMPTZ DEFAULT NOW()
);

-- Create vocabulary_items table
CREATE TABLE IF NOT EXISTS public.vocabulary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  original_word TEXT NOT NULL,
  translated_word TEXT NOT NULL,
  original_sentence TEXT,
  translated_sentence TEXT,
  language TEXT NOT NULL,
  
  article_id TEXT NOT NULL,
  article_title TEXT NOT NULL,
  
  mastered BOOLEAN DEFAULT false,
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  next_review TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, original_word, language)
);

-- Create articles table (stores read articles)
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  url TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  source TEXT,
  author TEXT,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, id)
);

-- Create user_actions table (tracks all user activity)
CREATE TABLE IF NOT EXISTS public.user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL CHECK (action_type IN (
    'read_article',
    'completed_flashcard',
    'saved_word',
    'viewed_progress',
    'changed_target_language',
    'started_article',
    'translated_article',
    'extracted_vocabulary',
    'used_ai_chat',
    'saved_flashcard_set',
    'completed_lesson',
    'updated_profile'
  )),
  
  target_type TEXT NOT NULL CHECK (target_type IN (
    'article',
    'flashcard_set',
    'word',
    'setting',
    'profile',
    'vocabulary',
    'translation',
    'ai_chat'
  )),
  
  target_id TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON public.user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action_type ON public.user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON public.user_actions(created_at DESC);

-- Create unique index for idempotent actions
CREATE UNIQUE INDEX IF NOT EXISTS idx_idempotent_actions 
ON public.user_actions(user_id, action_type, target_id) 
WHERE action_type IN ('read_article', 'saved_word', 'saved_flashcard_set');

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for vocabulary_items
CREATE POLICY "Users can view own vocabulary" ON public.vocabulary_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary" ON public.vocabulary_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary" ON public.vocabulary_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vocabulary" ON public.vocabulary_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for articles
CREATE POLICY "Users can view own articles" ON public.articles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own articles" ON public.articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own articles" ON public.articles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_actions
CREATE POLICY "Users can view own actions" ON public.user_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions" ON public.user_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulary_items_updated_at BEFORE UPDATE ON public.vocabulary_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

