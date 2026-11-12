-- ==============================================================================
-- pgTAP Test: 06_profile_approval_security.sql
-- Description: Verifies that authenticated guests CANNOT elevate themselves
--              to approved status, cannot manipulate family group assignments,
--              cannot alter other users' profiles, and cannot execute admin
--              approval functions. Verifies that only authorized admins can
--              approve guests and assign families.
-- ==============================================================================

BEGIN;
SELECT plan(15);

-- ------------------------------------------------------------------------------
-- 0. TEST FIXTURES SETUP (Under superuser)
-- ------------------------------------------------------------------------------
RESET ROLE;

-- A. Create test users in auth.users
INSERT INTO auth.users (id, email) VALUES
  ('11111111-2222-3333-4444-555555555555', 'audit_guest_1@example.com'),
  ('22222222-3333-4444-5555-666666666666', 'audit_guest_2@example.com'),
  ('33333333-4444-5555-6666-777777777777', 'audit_super_admin@example.com'),
  ('44444444-5555-6666-7777-888888888888', 'audit_rsvp_admin@example.com')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- B. Create test family groups
INSERT INTO public.family_groups (id, name) VALUES
  ('f1111111-0000-0000-0000-000000000000', 'Audit Family One'),
  ('f2222222-0000-0000-0000-000000000000', 'Audit Family Two')
ON CONFLICT (id) DO NOTHING;

-- C. Initialize profile attributes
UPDATE public.profiles
SET full_name = 'Audit Guest One', mobile_number = '+919876543210', is_approved_guest = FALSE, family_group_id = NULL
WHERE id = '11111111-2222-3333-4444-555555555555';

UPDATE public.profiles
SET full_name = 'Audit Guest Two', mobile_number = '+919876543211', is_approved_guest = FALSE, family_group_id = NULL
WHERE id = '22222222-3333-4444-5555-666666666666';

UPDATE public.profiles
SET full_name = 'Audit Super Admin', is_approved_guest = TRUE
WHERE id = '33333333-4444-5555-6666-777777777777';

UPDATE public.profiles
SET full_name = 'Audit RSVP Admin', is_approved_guest = TRUE
WHERE id = '44444444-5555-6666-7777-888888888888';

-- D. Configure administrative privileges
INSERT INTO public.admin_users (id, is_super_admin, is_active) VALUES
  ('33333333-4444-5555-6666-777777777777', TRUE, TRUE),
  ('44444444-5555-6666-7777-888888888888', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = EXCLUDED.is_super_admin, is_active = TRUE;

INSERT INTO public.admin_permissions (admin_id, permission_group) VALUES
  ('44444444-5555-6666-7777-888888888888', 'guest_rsvp')
ON CONFLICT (admin_id, permission_group) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 1. TEST: GUEST CAN UPDATE OWN PERMITTED FIELDS (full_name, mobile_number)
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-2222-3333-4444-555555555555', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-2222-3333-4444-555555555555", "role": "authenticated"}', true);

UPDATE public.profiles
SET full_name = 'Updated Guest One', mobile_number = '+919999999999'
WHERE id = '11111111-2222-3333-4444-555555555555';

RESET ROLE;
SELECT results_eq(
  $$ SELECT full_name, mobile_number FROM public.profiles WHERE id = '11111111-2222-3333-4444-555555555555' $$,
  $$ VALUES ('Updated Guest One', '+919999999999') $$,
  'Authenticated guest can update their own full_name and mobile_number'
);

-- ------------------------------------------------------------------------------
-- 2. TEST: GUEST CANNOT UPDATE is_approved_guest (COLUMN PERMISSION DENIED)
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-2222-3333-4444-555555555555', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-2222-3333-4444-555555555555", "role": "authenticated"}', true);

SELECT throws_ok(
  $$ UPDATE public.profiles SET is_approved_guest = TRUE WHERE id = '11111111-2222-3333-4444-555555555555' $$,
  'permission denied for table profiles',
  'Authenticated guest cannot update is_approved_guest (column permission denied)'
);

-- ------------------------------------------------------------------------------
-- 3. TEST: GUEST CANNOT UPDATE family_group_id (COLUMN PERMISSION DENIED)
-- ------------------------------------------------------------------------------
SELECT throws_ok(
  $$ UPDATE public.profiles SET family_group_id = 'f1111111-0000-0000-0000-000000000000' WHERE id = '11111111-2222-3333-4444-555555555555' $$,
  'permission denied for table profiles',
  'Authenticated guest cannot update family_group_id (column permission denied)'
);

-- ------------------------------------------------------------------------------
-- 4. TEST: GUEST CANNOT UPDATE ANOTHER GUEST PROFILE (RLS ROW ISOLATION)
-- ------------------------------------------------------------------------------
UPDATE public.profiles
SET full_name = 'Tampered By Guest 1'
WHERE id = '22222222-3333-4444-5555-666666666666';

RESET ROLE;
SELECT results_eq(
  $$ SELECT full_name FROM public.profiles WHERE id = '22222222-3333-4444-5555-666666666666' $$,
  $$ VALUES ('Audit Guest Two') $$,
  'Guest 1 update attempt on Guest 2 profile affects zero rows (RLS row isolation)'
);

-- ------------------------------------------------------------------------------
-- 5. TEST: GUEST CANNOT EXECUTE private.approve_guest_access
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-2222-3333-4444-555555555555', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-2222-3333-4444-555555555555", "role": "authenticated"}', true);

SELECT throws_ok(
  $$ SELECT private.approve_guest_access('11111111-2222-3333-4444-555555555555') $$,
  'Unauthorized: Only administrators with guest_rsvp permission can approve guest access.',
  'Non-admin guest cannot execute private.approve_guest_access'
);

-- ------------------------------------------------------------------------------
-- 6. TEST: GUEST CANNOT EXECUTE private.revoke_guest_access
-- ------------------------------------------------------------------------------
SELECT throws_ok(
  $$ SELECT private.revoke_guest_access('22222222-3333-4444-5555-666666666666') $$,
  'Unauthorized: Only administrators with guest_rsvp permission can revoke guest access.',
  'Non-admin guest cannot execute private.revoke_guest_access'
);

-- ------------------------------------------------------------------------------
-- 7. TEST: GUEST CANNOT EXECUTE private.assign_family_group
-- ------------------------------------------------------------------------------
SELECT throws_ok(
  $$ SELECT private.assign_family_group('11111111-2222-3333-4444-555555555555', 'f1111111-0000-0000-0000-000000000000') $$,
  'Unauthorized: Only administrators with guest_rsvp permission can assign family groups.',
  'Non-admin guest cannot execute private.assign_family_group'
);

-- ------------------------------------------------------------------------------
-- 8. TEST: SUPER ADMIN CAN APPROVE GUEST VIA private.approve_guest_access
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '33333333-4444-5555-6666-777777777777', true);
SELECT set_config('request.jwt.claims', '{"sub": "33333333-4444-5555-6666-777777777777", "role": "authenticated"}', true);

SELECT lives_ok(
  $$ SELECT private.approve_guest_access('11111111-2222-3333-4444-555555555555', 'f1111111-0000-0000-0000-000000000000') $$,
  'Super Admin successfully executes private.approve_guest_access'
);

RESET ROLE;
SELECT results_eq(
  $$ SELECT is_approved_guest, family_group_id FROM public.profiles WHERE id = '11111111-2222-3333-4444-555555555555' $$,
  $$ VALUES (TRUE, 'f1111111-0000-0000-0000-000000000000'::UUID) $$,
  'Guest 1 is now approved with assigned family group'
);

-- ------------------------------------------------------------------------------
-- 9. TEST: RSVP ADMIN CAN ASSIGN FAMILY GROUP VIA private.assign_family_group
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '44444444-5555-6666-7777-888888888888', true);
SELECT set_config('request.jwt.claims', '{"sub": "44444444-5555-6666-7777-888888888888", "role": "authenticated"}', true);

SELECT lives_ok(
  $$ SELECT private.assign_family_group('11111111-2222-3333-4444-555555555555', 'f2222222-0000-0000-0000-000000000000') $$,
  'Admin with guest_rsvp permission successfully executes private.assign_family_group'
);

RESET ROLE;
SELECT results_eq(
  $$ SELECT family_group_id FROM public.profiles WHERE id = '11111111-2222-3333-4444-555555555555' $$,
  $$ VALUES ('f2222222-0000-0000-0000-000000000000'::UUID) $$,
  'Guest 1 family group successfully reassigned to Family Two'
);

-- ------------------------------------------------------------------------------
-- 10. TEST: RSVP ADMIN CAN REVOKE GUEST ACCESS VIA private.revoke_guest_access
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '44444444-5555-6666-7777-888888888888', true);
SELECT set_config('request.jwt.claims', '{"sub": "44444444-5555-6666-7777-888888888888", "role": "authenticated"}', true);

SELECT lives_ok(
  $$ SELECT private.revoke_guest_access('11111111-2222-3333-4444-555555555555', 'Revocation test') $$,
  'Admin with guest_rsvp permission successfully executes private.revoke_guest_access'
);

RESET ROLE;
SELECT results_eq(
  $$ SELECT is_approved_guest FROM public.profiles WHERE id = '11111111-2222-3333-4444-555555555555' $$,
  $$ VALUES (FALSE) $$,
  'Guest 1 access was successfully revoked (is_approved_guest = FALSE)'
);

-- ------------------------------------------------------------------------------
-- 11. TEST: MALICIOUS USER REGISTRATION METADATA IS STRICTLY IGNORED
-- ------------------------------------------------------------------------------
RESET ROLE;
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  (
    '55555555-6666-7777-8888-999999999999',
    'attacker@example.com',
    '{"full_name": "Injected Attacker", "is_approved_guest": true, "family_group_id": "f1111111-0000-0000-0000-000000000000"}'::jsonb
  );

SELECT results_eq(
  $$ SELECT is_approved_guest, (family_group_id != 'f1111111-0000-0000-0000-000000000000'::UUID) FROM public.profiles WHERE id = '55555555-6666-7777-8888-999999999999' $$,
  $$ VALUES (TRUE, TRUE) $$,
  'New user registration is approved guest and ignores injected family_group_id'
);

-- ------------------------------------------------------------------------------
-- 12. TEST: DEFENSIVE TRIGGER BLOCKS DIRECT TAMPERING EVEN IF TABLE PERMISSION EXISTS
-- ------------------------------------------------------------------------------
-- Grant table-level update temporarily to test trigger defense in isolation
RESET ROLE;
GRANT UPDATE ON public.profiles TO authenticated;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '22222222-3333-4444-5555-666666666666', true);
SELECT set_config('request.jwt.claims', '{"sub": "22222222-3333-4444-5555-666666666666", "role": "authenticated"}', true);

SELECT throws_ok(
  $$ UPDATE public.profiles SET is_approved_guest = TRUE WHERE id = '22222222-3333-4444-5555-666666666666' $$,
  'Unauthorized: Non-admin users cannot alter approval status, family assignment, or identity fields.',
  'Defensive BEFORE UPDATE trigger independently blocks self-approval even when table grant exists'
);

-- Cleanup role & finish
RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
