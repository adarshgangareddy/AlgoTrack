-- ==========================================================================
-- AlgoTrack Phase 6: Code Execution & Submissions Schema
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.user_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL,
  source_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error', 'Internal Error')),
  runtime_ms NUMERIC DEFAULT 0,
  memory_kb NUMERIC DEFAULT 0,
  test_cases_passed INTEGER DEFAULT 0,
  total_test_cases INTEGER DEFAULT 0,
  stdout TEXT DEFAULT '',
  stderr TEXT DEFAULT '',
  compile_output TEXT DEFAULT '',
  error_message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_submissions_user_prob 
  ON public.user_submissions(user_id, problem_id, created_at DESC);

ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only read their own submissions" ON public.user_submissions;
CREATE POLICY "Users can only read their own submissions"
  ON public.user_submissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.user_submissions;
CREATE POLICY "Users can insert their own submissions"
  ON public.user_submissions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

