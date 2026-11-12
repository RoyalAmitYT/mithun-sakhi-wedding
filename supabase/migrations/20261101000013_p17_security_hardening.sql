-- ==============================================================================
-- Migration: 20261101000013_p17_security_hardening.sql
-- Description:
--   Hardens public.initialize_user_household() against cross-user spoofing
--   and non-existent user profile IDs.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.initialize_user_household(
  p_user_id UUID,
  p_full_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_name TEXT;
  v_existing_fg_id UUID;
  v_fg_id UUID;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Security Guard: An authenticated caller can only initialize their own household,
  -- unless they are an active Super Admin or have guest_rsvp permission.
  IF auth.uid() IS NOT NULL
     AND auth.uid() != p_user_id
     AND NOT (private.is_super_admin(auth.uid()) OR private.has_admin_permission('guest_rsvp', auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized: Users can only initialize their own household.' USING ERRCODE = '42501';
  END IF;

  -- Verify user exists in profiles
  SELECT family_group_id, full_name INTO v_existing_fg_id, v_name
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found for ID %', p_user_id USING ERRCODE = 'P0002';
  END IF;

  v_name := COALESCE(NULLIF(TRIM(p_full_name), ''), NULLIF(TRIM(v_name), ''), 'Guest');

  IF v_existing_fg_id IS NOT NULL THEN
    -- Household already exists; ensure active manager and initial member exist
    INSERT INTO public.family_managers (family_group_id, profile_id, is_active)
    VALUES (v_existing_fg_id, p_user_id, TRUE)
    ON CONFLICT DO NOTHING;

    IF NOT EXISTS (
      SELECT 1 FROM public.family_members WHERE family_group_id = v_existing_fg_id
    ) THEN
      INSERT INTO public.family_members (family_group_id, name)
      VALUES (v_existing_fg_id, v_name);
    END IF;

    -- Ensure approved status
    UPDATE public.profiles
    SET is_approved_guest = TRUE
    WHERE id = p_user_id AND is_approved_guest = FALSE;

    RETURN v_existing_fg_id;
  END IF;

  -- Create private household for the user
  INSERT INTO public.family_groups (name, created_by)
  VALUES (v_name || ' Household', NULL)
  RETURNING id INTO v_fg_id;

  -- Update profile with household and immediate ordinary guest approval
  UPDATE public.profiles
  SET family_group_id = v_fg_id,
      is_approved_guest = TRUE
  WHERE id = p_user_id;

  -- Link created_by
  UPDATE public.family_groups
  SET created_by = p_user_id
  WHERE id = v_fg_id;

  -- Designate user as active manager of their household
  INSERT INTO public.family_managers (family_group_id, profile_id, is_active)
  VALUES (v_fg_id, p_user_id, TRUE)
  ON CONFLICT DO NOTHING;

  -- Add registered user as the initial family member
  INSERT INTO public.family_members (family_group_id, name)
  VALUES (v_fg_id, v_name);

  RETURN v_fg_id;
END;
$$;

REVOKE ALL ON FUNCTION public.initialize_user_household(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.initialize_user_household(UUID, TEXT) TO authenticated, service_role;

