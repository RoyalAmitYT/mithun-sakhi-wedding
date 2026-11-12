-- pgTAP Test: 03_guest_isolation.sql
-- Description: Verifies that authenticated guests are strictly isolated from other guests' private data.

BEGIN;
SELECT plan(10);

-- Setup test fixtures under superuser
RESET ROLE;

-- Create two test profiles via auth.users
INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'guest1@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'guest2@example.com')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Guest One', is_approved_guest = TRUE
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE public.profiles
SET full_name = 'Guest Two', is_approved_guest = TRUE
WHERE id = '22222222-2222-2222-2222-222222222222';

-- Create two access requests
INSERT INTO public.access_requests (id, profile_id, invited_family_name, relationship_to_couple, status)
VALUES
  ('a1111111-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Family One', 'Cousin', 'pending'),
  ('a2222222-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'Family Two', 'Friend', 'pending');

-- Create two private conversations
INSERT INTO public.conversations (id, profile_id, status)
VALUES
  ('c1111111-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'new'),
  ('c2222222-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'new');

INSERT INTO public.conversation_messages (id, conversation_id, sender_id, message_body)
VALUES
  ('d1111111-0000-0000-0000-000000000000', 'c1111111-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Question from Guest 1'),
  ('d2222222-0000-0000-0000-000000000000', 'c2222222-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'Question from Guest 2');

-- Switch to Guest One
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);

-- 1. Guest 1 can see own profile
SELECT results_eq(
  $$ SELECT email FROM public.profiles $$,
  $$ VALUES ('guest1@example.com') $$,
  'Guest 1 can read only their own profile'
);

-- 2. Guest 1 cannot see Guest 2 profile
SELECT is_empty(
  $$ SELECT id FROM public.profiles WHERE id = '22222222-2222-2222-2222-222222222222' $$,
  'Guest 1 cannot read Guest 2 profile'
);

-- 3. Guest 1 can see own access request
SELECT results_eq(
  $$ SELECT invited_family_name FROM public.access_requests $$,
  $$ VALUES ('Family One') $$,
  'Guest 1 can read only their own access request'
);

-- 4. Guest 1 cannot see Guest 2 access request
SELECT is_empty(
  $$ SELECT id FROM public.access_requests WHERE id = 'a2222222-0000-0000-0000-000000000000' $$,
  'Guest 1 cannot read Guest 2 access request'
);

-- 5. Guest 1 can see own conversation
SELECT results_eq(
  $$ SELECT id FROM public.conversations $$,
  $$ VALUES ('c1111111-0000-0000-0000-000000000000'::UUID) $$,
  'Guest 1 can read only their own conversation thread'
);

-- 6. Guest 1 cannot see Guest 2 conversation messages
SELECT is_empty(
  $$ SELECT id FROM public.conversation_messages WHERE conversation_id = 'c2222222-0000-0000-0000-000000000000' $$,
  'Guest 1 cannot read Guest 2 conversation messages'
);

-- 7. Guest 1 cannot update Guest 2 profile (RLS blocks row update)
UPDATE public.profiles SET full_name = 'Hacked Name' WHERE id = '22222222-2222-2222-2222-222222222222';
RESET ROLE;
SELECT results_eq(
  $$ SELECT full_name FROM public.profiles WHERE id = '22222222-2222-2222-2222-222222222222' $$,
  $$ VALUES ('Guest Two') $$,
  'Guest 1 update on Guest 2 profile has zero effect (RLS blocks rows)'
);

-- 8. Guest 1 cannot approve their own access request
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
UPDATE public.access_requests SET status = 'approved' WHERE profile_id = '11111111-1111-1111-1111-111111111111';

RESET ROLE;
SELECT results_eq(
  $$ SELECT status FROM public.access_requests WHERE profile_id = '11111111-1111-1111-1111-111111111111' $$,
  $$ VALUES ('pending') $$,
  'Guest 1 cannot approve their own access request'
);

-- 9. Guest 1 cannot elevate themselves to admin_users
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
SELECT throws_ok(
  $$ INSERT INTO public.admin_users (id, is_super_admin, is_active) VALUES ('11111111-1111-1111-1111-111111111111', TRUE, TRUE) $$,
  'new row violates row-level security policy for table "admin_users"',
  'Guest 1 cannot insert self into admin_users'
);

-- 10. Guest 1 cannot insert permissions into admin_permissions
SELECT throws_ok(
  $$ INSERT INTO public.admin_permissions (admin_id, permission_group) VALUES ('11111111-1111-1111-1111-111111111111', 'guest_rsvp') $$,
  'new row violates row-level security policy for table "admin_permissions"',
  'Guest 1 cannot grant self admin permissions'
);

SELECT * FROM finish();
ROLLBACK;
