-- Fix handle_new_user trigger so Google OAuth signups never fail on username collisions
-- and properly capture Google's `name` and `picture` metadata fields.
-- Run this in Supabase Dashboard -> SQL Editor if your database is already initialized.

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

