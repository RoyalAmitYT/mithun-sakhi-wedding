-- ==============================================================================
-- Migration: 20261101000014_public_anonymous_wishes.sql
-- Description:
--   1. Upgrades handle_wish_submission() trigger to support anonymous public guest submissions.
--   2. Introduces public.submit_public_wish(p_author_name, p_wish_text) RPC function.
--   3. Maintains strict security: all guest submissions default to 'pending' moderation.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. UPGRADE WISH SUBMISSION TRIGGER TO ALLOW ANONYMOUS GUESTS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_wish_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_first_name TEXT;
BEGIN
  -- 1. Cutoff check: new wishes blocked past Memories Mode cutoff (2026-11-22 18:30:00+00)
  IF COALESCE(NULLIF(current_setting('app.test_time_override', true), '')::timestamptz, NOW()) >= '2026-11-22 18:30:00+00'::timestamptz THEN
    RAISE EXCEPTION 'Wedding celebration cutoff has passed. New wishes can no longer be submitted.';
  END IF;

  -- 2. Derive author display name from profile if authenticated with profile_id,
  --    otherwise preserve guest's entered display name
  IF NEW.profile_id IS NOT NULL THEN
    SELECT NULLIF(SPLIT_PART(TRIM(full_name), ' ', 1), '') INTO v_first_name
    FROM public.profiles
    WHERE id = NEW.profile_id;

    NEW.author_display_name := COALESCE(v_first_name, 'Guest');
  ELSE
    NEW.author_display_name := COALESCE(NULLIF(TRIM(NEW.author_display_name), ''), 'Guest');
  END IF;

  -- 3. Initial state is always pending moderation
  NEW.status := 'pending';
  NEW.moderated_by := NULL;
  NEW.moderated_at := NULL;

  NEW.created_at := COALESCE(NEW.created_at, NOW());
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. PUBLIC SECURE RPC TO SUBMIT ANONYMOUS GUEST WISH
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_public_wish(
  p_author_name TEXT,
  p_wish_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_name TEXT;
  v_text TEXT;
  v_new_id UUID;
BEGIN
  -- 1. Cutoff check
  IF COALESCE(NULLIF(current_setting('app.test_time_override', true), '')::timestamptz, NOW()) >= '2026-11-22 18:30:00+00'::timestamptz THEN
    RAISE EXCEPTION 'Wedding celebration cutoff has passed. New wishes can no longer be submitted.';
  END IF;

  -- 2. Clean and validate inputs
  v_name := TRIM(REGEXP_REPLACE(COALESCE(p_author_name, ''), '<[^>]*>', '', 'g'));
  v_text := TRIM(REGEXP_REPLACE(COALESCE(p_wish_text, ''), '<[^>]*>', '', 'g'));

  IF v_name IS NULL OR length(v_name) < 2 OR length(v_name) > 80 THEN
    RAISE EXCEPTION 'Name must be between 2 and 80 characters.';
  END IF;

  IF v_text IS NULL OR length(v_text) < 3 OR length(v_text) > 1000 THEN
    RAISE EXCEPTION 'Blessing message must be between 3 and 1000 characters.';
  END IF;

  -- 3. Insert into public.wishes with status 'pending'
  INSERT INTO public.wishes (
    profile_id,
    author_display_name,
    wish_text,
    status
  ) VALUES (
    NULL,
    v_name,
    v_text,
    'pending'
  )
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'wish_id', v_new_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_public_wish(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_public_wish(TEXT, TEXT) TO anon, authenticated;
