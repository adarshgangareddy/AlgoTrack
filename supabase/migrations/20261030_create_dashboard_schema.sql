-- ==========================================================================
-- AlgoTrack Phase 3: Dashboard & Problem Progress Schema
-- ==========================================================================

-- 1. Topics Table
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Problems Table (Curated problem library)
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  pattern TEXT,
  leetcode_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Problem-Topics Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.problem_topics (
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, topic_id)
);

-- 4. User Problem Progress Table (User-specific problem state)
CREATE TABLE IF NOT EXISTS public.user_problem_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('attempted', 'solved')),
  notes TEXT,
  solved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, problem_id)
);

-- 5. User Activity Logs Table (For activity chart and recent events)
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.problems(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('attempted', 'solved', 'revisited', 'note_added')),
  problem_title TEXT,
  difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==========================================================================
-- Row Level Security (RLS) Policies
-- ==========================================================================

-- Enable RLS on all tables
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_problem_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Topics: Read-only access for authenticated users
DROP POLICY IF EXISTS "Topics are viewable by authenticated users" ON public.topics;
CREATE POLICY "Topics are viewable by authenticated users"
  ON public.topics FOR SELECT TO authenticated USING (true);

-- 2. Problems: Read-only access for authenticated users
DROP POLICY IF EXISTS "Problems are viewable by authenticated users" ON public.problems;
CREATE POLICY "Problems are viewable by authenticated users"
  ON public.problems FOR SELECT TO authenticated USING (true);

-- 3. Problem Topics: Read-only access for authenticated users
DROP POLICY IF EXISTS "Problem topics are viewable by authenticated users" ON public.problem_topics;
CREATE POLICY "Problem topics are viewable by authenticated users"
  ON public.problem_topics FOR SELECT TO authenticated USING (true);

-- 4. User Problem Progress: STRICT User-only isolation
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

DROP POLICY IF EXISTS "Users can delete their own problem progress" ON public.user_problem_progress;
CREATE POLICY "Users can delete their own problem progress"
  ON public.user_problem_progress FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 5. User Activity Logs: STRICT User-only isolation
DROP POLICY IF EXISTS "Users can only read their own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can only read their own activity logs"
  ON public.user_activity_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can insert their own activity logs"
  ON public.user_activity_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
