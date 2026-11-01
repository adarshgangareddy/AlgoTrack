-- ==========================================================================
-- ALGOTRACK MIGRATION: User AI Usage & Encrypted BYOK Provider Keys
-- ==========================================================================

-- 1. Create User AI Free Usage Table
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

-- 2. Create User Personal API Keys Table (Encrypted BYOK Storage)
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

