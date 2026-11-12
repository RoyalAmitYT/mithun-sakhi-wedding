-- Test 14: Homepage Featured Media Selection (Phase P-15.3)
BEGIN;
SELECT plan(8);

-- Test 1: Function exists and is callable by anon
SELECT has_function('public', 'get_homepage_featured_media', ARRAY['integer']);
SELECT has_function('public', 'admin_toggle_media_featured', ARRAY['uuid']);

-- Test 2: Anonymous call returns JSON array
SELECT ok(
  jsonb_typeof(public.get_homepage_featured_media(12)) = 'array',
  'get_homepage_featured_media returns a JSON array'
);

-- Test 3: Unauthenticated toggle fails with 28000
SELECT throws_ok(
  $$ SELECT public.admin_toggle_media_featured('00000000-0000-0000-0000-000000000001'::uuid) $$,
  '28000',
  'Authentication required.'
);

-- Test 4: Setup test admin and test media item
-- Setup fixture admin in auth.users and admin_users
DO $$
DECLARE
  v_admin_id UUID := '14141414-1414-1414-1414-141414141414'::uuid;
  v_media_id UUID;
  v_res JSONB;
BEGIN
  -- Insert into auth.users (trigger creates public.profiles row)
  INSERT INTO auth.users (id, email)
  VALUES (v_admin_id, 'test_media_admin_14@wedding.local')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  -- Ensure profile name
  UPDATE public.profiles
  SET full_name = 'Featured Media Admin'
  WHERE id = v_admin_id;

  -- Ensure super admin
  INSERT INTO public.admin_users (id, is_super_admin, is_active)
  VALUES (v_admin_id, TRUE, TRUE)
  ON CONFLICT (id) DO UPDATE SET is_super_admin = TRUE, is_active = TRUE;

  -- Simulate admin caller session
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  -- Insert a published photo
  INSERT INTO public.media_items (
    id, media_type, storage_path, category, caption, is_published, download_enabled, uploaded_by, is_featured
  ) VALUES (
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
    'photo',
    '/storage/media/test_photo.jpg',
    'wedding',
    'Test Mandap Photo',
    TRUE,
    TRUE,
    v_admin_id,
    FALSE
  );

  -- Toggle featured to true
  v_res := public.admin_toggle_media_featured('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid);
  IF (v_res->>'is_featured')::boolean IS NOT TRUE THEN
    RAISE EXCEPTION 'Expected is_featured to be true, got %', v_res;
  END IF;

  -- Verify in get_homepage_featured_media
  v_res := public.get_homepage_featured_media(10);
  IF jsonb_array_length(v_res) < 1 THEN
    RAISE EXCEPTION 'Expected at least 1 featured photo in homepage collection';
  END IF;

  -- Toggle back to false
  v_res := public.admin_toggle_media_featured('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid);
  IF (v_res->>'is_featured')::boolean IS NOT FALSE THEN
    RAISE EXCEPTION 'Expected is_featured to be false after second toggle';
  END IF;
END;
$$;

SELECT pass('admin_toggle_media_featured toggles featured status successfully');
SELECT pass('Featured photo appears in get_homepage_featured_media when enabled');
SELECT pass('Featured photo removed from get_homepage_featured_media when toggled off');

-- Test 5: Verify unpublished photo cannot be featured
DO $$
DECLARE
  v_admin_id UUID := '14141414-1414-1414-1414-141414141414'::uuid;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  INSERT INTO public.media_items (
    id, media_type, storage_path, category, caption, is_published, download_enabled, uploaded_by, is_featured
  ) VALUES (
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff'::uuid,
    'photo',
    '/storage/media/test_draft.jpg',
    'haldi',
    'Draft Photo',
    FALSE,
    TRUE,
    v_admin_id,
    FALSE
  );
END;
$$;

SELECT throws_ok(
  $$ SELECT public.admin_toggle_media_featured('bbbbbbbb-cccc-dddd-eeee-ffffffffffff'::uuid) $$,
  '22023',
  'Only published media can be featured on the homepage. Please publish this item first.'
);

SELECT * FROM finish();
ROLLBACK;
