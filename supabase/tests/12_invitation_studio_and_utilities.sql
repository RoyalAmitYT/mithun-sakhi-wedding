-- pgTAP Test: 12_invitation_studio_and_utilities.sql
-- Description: Tests invitation studio configuration, permissions boundaries, public vs admin RPCs, and dashboard metric extensions.

BEGIN;
SELECT plan(18);

RESET ROLE;

-- ------------------------------------------------------------------------------
-- 1. FIXTURE SETUP
-- ------------------------------------------------------------------------------
DELETE FROM auth.users WHERE email IN (
  'super_pgtap_inv@wedding.local',
  'inv_pgtap_admin@wedding.local',
  'wishes_pgtap_no_inv@wedding.local',
  'guest_pgtap_inv@wedding.local'
);

-- 1.1 Super Admin
INSERT INTO auth.users (id, email)
VALUES ('99999999-9999-9999-9999-999999999999', 'super_pgtap_inv@wedding.local')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Mithun Gorain'
WHERE id = '99999999-9999-9999-9999-999999999999';

INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('99999999-9999-9999-9999-999999999999', TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = TRUE, is_active = TRUE;

-- 1.2 Invitation Studio Admin
INSERT INTO auth.users (id, email)
VALUES ('66666666-6666-6666-6666-666666666666', 'inv_pgtap_admin@wedding.local')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Invitation Coordinator'
WHERE id = '66666666-6666-6666-6666-666666666666';

INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('66666666-6666-6666-6666-666666666666', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = FALSE, is_active = TRUE;

DELETE FROM public.admin_permissions WHERE admin_id = '66666666-6666-6666-6666-666666666666';
INSERT INTO public.admin_permissions (admin_id, permission_group)
VALUES ('66666666-6666-6666-6666-666666666666', 'invitation_studio');

-- 1.3 Wishes-only Admin (Lacks invitation_studio)
INSERT INTO auth.users (id, email)
VALUES ('55555555-5555-5555-5555-555555555555', 'wishes_pgtap_no_inv@wedding.local')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Wishes Only Admin'
WHERE id = '55555555-5555-5555-5555-555555555555';

INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('55555555-5555-5555-5555-555555555555', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = FALSE, is_active = TRUE;

DELETE FROM public.admin_permissions WHERE admin_id = '55555555-5555-5555-5555-555555555555';
INSERT INTO public.admin_permissions (admin_id, permission_group)
VALUES ('55555555-5555-5555-5555-555555555555', 'wishes');

-- 1.4 Regular Approved Guest
INSERT INTO auth.users (id, email)
VALUES ('44444444-4444-4444-4444-444444444444', 'guest_pgtap_inv@wedding.local')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Regular Guest', is_approved_guest = TRUE
WHERE id = '44444444-4444-4444-4444-444444444444';

-- ------------------------------------------------------------------------------
-- 2. SCHEMA & COLUMNS TESTS
-- ------------------------------------------------------------------------------
SELECT has_column('public', 'invitation_settings', 'default_template', 'invitation_settings table has default_template column');
SELECT has_column('public', 'invitation_settings', 'custom_announcement', 'invitation_settings table has custom_announcement column');

-- Check constraint prevents invalid templates
SELECT throws_ok(
  $$
    INSERT INTO public.invitation_settings (id, headline_text, intro_text, qr_code_target_url, default_template)
    VALUES ('test_bad', 'Headline', 'Intro', 'https://example.com', 'invalid_template')
  $$,
  '23514',
  NULL,
  'Cannot insert invalid template name into invitation_settings'
);

-- ------------------------------------------------------------------------------
-- 3. PUBLIC RPC ACCESS (ANON & AUTHENTICATED)
-- ------------------------------------------------------------------------------
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);

-- Test 4: Anon can call get_invitation_settings()
SELECT lives_ok(
  $$ SELECT public.get_invitation_settings() $$,
  'Anon can invoke get_invitation_settings()'
);

-- Test 5: Anon cannot invoke admin_get_invitation_settings()
SELECT throws_ok(
  $$ SELECT public.admin_get_invitation_settings() $$,
  '28000',
  'Authentication required.',
  'Anon blocked from admin_get_invitation_settings()'
);

-- Test 6: Anon cannot invoke admin_update_invitation_settings()
SELECT throws_ok(
  $$ SELECT public.admin_update_invitation_settings('Title', 'Intro', 'https://example.com', 'cinematic', true, 'Custom') $$,
  '28000',
  'Authentication required.',
  'Anon blocked from admin_update_invitation_settings()'
);

-- ------------------------------------------------------------------------------
-- 4. GUEST & UNAUTHORIZED ADMIN ACCESS BOUNDARIES
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '44444444-4444-4444-4444-444444444444', true);

-- Test 7: Regular guest blocked from admin_get_invitation_settings
SELECT throws_ok(
  $$ SELECT public.admin_get_invitation_settings() $$,
  '42501',
  'Unauthorized: Caller lacks invitation_studio permission.',
  'Guest blocked from admin_get_invitation_settings()'
);

-- Test 8: Regular guest blocked from admin_update_invitation_settings
SELECT throws_ok(
  $$ SELECT public.admin_update_invitation_settings('Title', 'Intro', 'https://example.com', 'cinematic', true, 'Custom') $$,
  '42501',
  'Unauthorized: Caller lacks invitation_studio permission.',
  'Guest blocked from admin_update_invitation_settings()'
);

-- Switch to Wishes-only Admin
SELECT set_config('request.jwt.claim.sub', '55555555-5555-5555-5555-555555555555', true);

-- Test 9: Wishes admin blocked from admin_get_invitation_settings
SELECT throws_ok(
  $$ SELECT public.admin_get_invitation_settings() $$,
  '42501',
  'Unauthorized: Caller lacks invitation_studio permission.',
  'Wishes-only admin blocked from admin_get_invitation_settings()'
);

-- Test 10: Wishes admin blocked from admin_update_invitation_settings
SELECT throws_ok(
  $$ SELECT public.admin_update_invitation_settings('Title', 'Intro', 'https://example.com', 'cinematic', true, 'Custom') $$,
  '42501',
  'Unauthorized: Caller lacks invitation_studio permission.',
  'Wishes-only admin blocked from admin_update_invitation_settings()'
);

-- ------------------------------------------------------------------------------
-- 5. AUTHORIZED ADMIN ACCESS (invitation_studio)
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', '66666666-6666-6666-6666-666666666666', true);

-- Test 11: Invitation admin can read settings
SELECT lives_ok(
  $$ SELECT public.admin_get_invitation_settings() $$,
  'Invitation admin can call admin_get_invitation_settings()'
);

-- Test 12: Invitation admin can update settings to traditional
SELECT is(
  (
    SELECT (public.admin_update_invitation_settings(
      'Royal Wedding Celebration',
      'Honored guests are invited to the auspicious union.',
      'https://mithun-sakhi-wedding.vercel.app/rsvp',
      'traditional',
      true,
      'Auspicious Celebrations begin 19 November 2026'
    )->>'default_template')
  ),
  'traditional',
  'Invitation admin successfully updates default_template to traditional'
);

-- Test 13: Invalid template rejected by RPC
SELECT throws_ok(
  $$
    SELECT public.admin_update_invitation_settings(
      'Title',
      'Intro',
      'https://example.com',
      'futuristic_neon',
      true,
      NULL
    )
  $$,
  NULL,
  'Invalid default template: futuristic_neon. Must be cinematic or traditional.',
  'admin_update_invitation_settings rejects invalid template'
);

-- Test 14: Public RPC reflects the updated settings
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);

SELECT is(
  (SELECT (public.get_invitation_settings()->>'default_template')),
  'traditional',
  'Public RPC get_invitation_settings reflects updated default_template'
);

-- Test 15: Public RPC reflects updated headline
SELECT is(
  (SELECT (public.get_invitation_settings()->>'headline_text')),
  'Royal Wedding Celebration',
  'Public RPC get_invitation_settings reflects updated headline'
);

-- ------------------------------------------------------------------------------
-- 6. DASHBOARD METRICS INTEGRATION
-- ------------------------------------------------------------------------------
-- Test 16: Invitation admin dashboard metrics includes invitation_metrics
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '66666666-6666-6666-6666-666666666666', true);

SELECT is(
  (SELECT (public.get_admin_dashboard_metrics()->'invitation_metrics'->>'default_template')),
  'traditional',
  'Invitation admin receives invitation_metrics in get_admin_dashboard_metrics'
);

-- Test 17: Wishes admin dashboard metrics DOES NOT include invitation_metrics
SELECT set_config('request.jwt.claim.sub', '55555555-5555-5555-5555-555555555555', true);

SELECT is(
  (SELECT (public.get_admin_dashboard_metrics()->'invitation_metrics')),
  NULL,
  'Wishes admin does NOT receive invitation_metrics in get_admin_dashboard_metrics'
);

-- Test 18: Super Admin receives invitation_metrics
SELECT set_config('request.jwt.claim.sub', '99999999-9999-9999-9999-999999999999', true);

SELECT is(
  (SELECT (public.get_admin_dashboard_metrics()->'invitation_metrics'->>'is_published')::boolean),
  true,
  'Super admin receives invitation_metrics in get_admin_dashboard_metrics'
);

SELECT * FROM finish();
ROLLBACK;
