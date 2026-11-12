-- ==============================================================================
-- BOOTSTRAP SUPER ADMIN: skamitboss4148@gmail.com
-- ==============================================================================
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'skamitboss4148@gmail.com';
BEGIN
  -- 1. Verify user exists in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = LOWER(TRIM(v_email));

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User % not found in auth.users. Please create the user in Supabase Auth before bootstrapping.', v_email;
  END IF;

  -- 2. Ensure profile exists in public.profiles
  INSERT INTO public.profiles (id, email, full_name, is_approved_guest)
  VALUES (v_user_id, v_email, 'Super Admin', TRUE)
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      is_approved_guest = TRUE;

  -- 3. Execute official private.bootstrap_super_admin procedure
  PERFORM private.bootstrap_super_admin(v_email);

  -- 4. Explicitly assign all 6 admin permission groups for dashboard visibility
  INSERT INTO public.admin_permissions (admin_id, permission_group)
  VALUES
    (v_user_id, 'guest_rsvp'),
    (v_user_id, 'photos'),
    (v_user_id, 'wishes'),
    (v_user_id, 'questions'),
    (v_user_id, 'events_website'),
    (v_user_id, 'invitation_studio')
  ON CONFLICT (admin_id, permission_group) DO NOTHING;

  RAISE NOTICE 'Super Admin % successfully bootstrapped with all permissions.', v_email;
END $$;
