-- ==========================================================================
-- ALGOTRACK COMPLETE DATABASE SCHEMA & TRIGGERS
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==========================================================================

-- 1. Create Public Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  target_role TEXT DEFAULT 'Software Engineer',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Ensure columns exist if table was already created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_role TEXT DEFAULT 'Software Engineer';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. User Creation Trigger (Auto-creates profile on signup & OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_username TEXT;
  v_avatar_url TEXT;
  v_base_username TEXT;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  v_base_username := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'));
  IF v_base_username = '' THEN
    v_base_username := 'user';
  END IF;

  -- Use explicit username from email signup, or generate a collision-safe one for OAuth users
  v_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    v_base_username || '_' || LEFT(REPLACE(NEW.id::TEXT, '-', ''), 6)
  );

  INSERT INTO public.profiles (id, full_name, username, email, avatar_url, bio, target_role)
  VALUES (
    NEW.id,
    v_full_name,
    v_username,
    NEW.email,
    v_avatar_url,
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->>'target_role', 'Software Engineer')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Fallback if username still collides so OAuth signup never fails
    INSERT INTO public.profiles (id, full_name, username, email, avatar_url, bio, target_role)
    VALUES (
      NEW.id,
      v_full_name,
      v_base_username || '_' || LEFT(REPLACE(NEW.id::TEXT, '-', ''), 8),
      NEW.email,
      v_avatar_url,
      COALESCE(NEW.raw_user_meta_data->>'bio', ''),
      COALESCE(NEW.raw_user_meta_data->>'target_role', 'Software Engineer')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RPC Function: Resolve email by username for Login
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
  SELECT email FROM public.profiles 
  WHERE LOWER(username) = LOWER(TRIM(LEADING '@' FROM p_username))
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO anon, authenticated;

-- 3. Topics Table
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Topics are viewable by authenticated users" ON public.topics;
CREATE POLICY "Topics are viewable by authenticated users"
  ON public.topics FOR SELECT TO authenticated USING (true);

-- 4. Problems Table
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_number INTEGER,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  pattern TEXT,
  topics TEXT[],
  description TEXT,
  theory_content TEXT,
  hints TEXT[],
  leetcode_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Problems are viewable by authenticated users" ON public.problems;
CREATE POLICY "Problems are viewable by authenticated users"
  ON public.problems FOR SELECT TO authenticated USING (true);

-- 5. User Problem Progress Table
CREATE TABLE IF NOT EXISTS public.user_problem_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'attempted', 'solved')),
  notes TEXT,
  solved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, problem_id)
);

ALTER TABLE public.user_problem_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only read their own problem progress" ON public.user_problem_progress;
CREATE POLICY "Users can only read their own problem progress"
  ON public.user_problem_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own problem progress" ON public.user_problem_progress;
CREATE POLICY "Users can insert their own problem progress"
  ON public.user_problem_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own problem progress" ON public.user_problem_progress;
CREATE POLICY "Users can update their own problem progress"
  ON public.user_problem_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. User Problem Workspace Table (Notes, Approach, Complexities, Mistakes)
CREATE TABLE IF NOT EXISTS public.user_problem_workspace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  personal_notes TEXT DEFAULT '',
  personal_approach TEXT DEFAULT '',
  time_complexity TEXT DEFAULT '',
  space_complexity TEXT DEFAULT '',
  mistakes_and_edge_cases TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, problem_id)
);

ALTER TABLE public.user_problem_workspace ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only read their own workspace" ON public.user_problem_workspace;
CREATE POLICY "Users can only read their own workspace"
  ON public.user_problem_workspace FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own workspace" ON public.user_problem_workspace;
CREATE POLICY "Users can insert their own workspace"
  ON public.user_problem_workspace FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own workspace" ON public.user_problem_workspace;
CREATE POLICY "Users can update their own workspace"
  ON public.user_problem_workspace FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. User Solutions Table (Multi-Language Code Storage)
CREATE TABLE IF NOT EXISTS public.user_problem_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL,
  source_code TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, problem_id, language)
);

ALTER TABLE public.user_problem_solutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only read their own solutions" ON public.user_problem_solutions;
CREATE POLICY "Users can only read their own solutions"
  ON public.user_problem_solutions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own solutions" ON public.user_problem_solutions;
CREATE POLICY "Users can insert their own solutions"
  ON public.user_problem_solutions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own solutions" ON public.user_problem_solutions;
CREATE POLICY "Users can update their own solutions"
  ON public.user_problem_solutions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.problems(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('attempted', 'solved', 'revisited', 'note_added')),
  problem_title TEXT,
  difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can read own activity logs"
  ON public.user_activity_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can insert own activity logs"
  ON public.user_activity_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 9. User AI Free Usage Table (Lifetime 3 Messages Limit)
CREATE TABLE IF NOT EXISTS public.user_ai_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  free_requests_used INTEGER DEFAULT 0 NOT NULL CHECK (free_requests_used >= 0),
  free_requests_limit INTEGER DEFAULT 3 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.user_ai_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own AI usage" ON public.user_ai_usage;
CREATE POLICY "Users can read own AI usage"
  ON public.user_ai_usage FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own AI usage" ON public.user_ai_usage;
CREATE POLICY "Users can update own AI usage"
  ON public.user_ai_usage FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own AI usage" ON public.user_ai_usage;
CREATE POLICY "Users can insert own AI usage"
  ON public.user_ai_usage FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 10. User Personal API Keys Table (Encrypted BYOK Storage)
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT DEFAULT 'groq' NOT NULL,
  encrypted_key TEXT NOT NULL,
  masked_key TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own api key metadata" ON public.user_api_keys;
CREATE POLICY "Users can read own api key metadata"
  ON public.user_api_keys FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own api keys" ON public.user_api_keys;
CREATE POLICY "Users can insert own api keys"
  ON public.user_api_keys FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own api keys" ON public.user_api_keys;
CREATE POLICY "Users can update own api keys"
  ON public.user_api_keys FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own api keys" ON public.user_api_keys;
CREATE POLICY "Users can delete own api keys"
  ON public.user_api_keys FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


