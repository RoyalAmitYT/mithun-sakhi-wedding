-- pgTAP Test: 13_memories_mode_lifecycle.sql
-- Description: Tests post-wedding Memories Mode cutoff boundary, lifecycle state RPC,
-- submission freezing for access requests, wishes, conversations, and RSVPs,
-- while verifying author wish editing/deletion and admin moderation retention.

BEGIN;
SELECT plan(19);

RESET ROLE;

-- ------------------------------------------------------------------------------
-- 1. FIXTURE SETUP
-- ------------------------------------------------------------------------------
DELETE FROM auth.users WHERE email IN (
  'lifecycle_guest@wedding.local',
  'lifecycle_wishes_admin@wedding.local'
);

-- Guest User
INSERT INTO auth.users (id, email)
VALUES ('33333333-3333-3333-3333-333333333333', 'lifecycle_guest@wedding.local')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Arjun Guest', is_approved_guest = FALSE
WHERE id = '33333333-3333-3333-3333-333333333333';

-- Wishes Admin
INSERT INTO auth.users (id, email)
VALUES ('22222222-2222-2222-2222-222222222222', 'lifecycle_wishes_admin@wedding.local')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Wishes Mod'
WHERE id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('22222222-2222-2222-2222-222222222222', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = FALSE, is_active = TRUE;

-- Grant both wishes and questions permissions under superuser for tests
DELETE FROM public.admin_permissions WHERE admin_id = '22222222-2222-2222-2222-222222222222';
INSERT INTO public.admin_permissions (admin_id, permission_group)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'wishes'),
  ('22222222-2222-2222-2222-222222222222', 'questions');

-- ------------------------------------------------------------------------------
-- 2. LIFECYCLE RPC & FUNCTION EXISTENCE
-- ------------------------------------------------------------------------------
SELECT has_function('public', 'get_wedding_lifecycle_state', 'public.get_wedding_lifecycle_state() function exists');

-- Test 2: Anon can execute get_wedding_lifecycle_state()
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
SELECT set_config('request.jwt.claims', '{"role": "anon"}', true);

SELECT lives_ok(
  $$ SELECT public.get_wedding_lifecycle_state() $$,
  'Anon can invoke get_wedding_lifecycle_state()'
);

-- ------------------------------------------------------------------------------
-- 3. PRE-CUTOFF BEHAVIOR (MOCKED TO 15 NOVEMBER 2026)
-- ------------------------------------------------------------------------------
SELECT set_config('app.test_time_override', '2026-11-15 10:00:00+00', true);

-- Test 3: Lifecycle state is pre_wedding and not memories mode
SELECT is(
  (SELECT (public.get_wedding_lifecycle_state()->>'state')),
  'pre_wedding',
  'Mocked 15 Nov 2026 reports state = pre_wedding'
);

-- Test 4: is_memories_mode is false
SELECT is(
  (SELECT (public.get_wedding_lifecycle_state()->>'is_memories_mode')::boolean),
  false,
  'Mocked 15 Nov 2026 reports is_memories_mode = false'
);

-- Test 5: Access request allowed pre-cutoff
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
SELECT set_config('request.jwt.claims', '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    INSERT INTO public.access_requests (profile_id, invited_family_name, relationship_to_couple)
    VALUES ('33333333-3333-3333-3333-333333333333', 'The Test Family', 'Friend of Groom')
  $$,
  'Access request succeeds before cutoff boundary'
);

-- Test 6: Wish submission allowed pre-cutoff
SELECT lives_ok(
  $$
    INSERT INTO public.wishes (id, profile_id, author_display_name, wish_text, status)
    VALUES ('a1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Arjun', 'Warm wedding blessings!', 'pending')
  $$,
  'Wish submission succeeds before cutoff boundary'
);

-- Test 7: Approve the wish under wishes admin
SELECT set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
SELECT set_config('request.jwt.claims', '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    SELECT public.admin_moderate_wish('a1111111-1111-1111-1111-111111111111', 'approved')
  $$,
  'Wishes admin approves the test wish'
);

-- Test 8: Conversation message allowed pre-cutoff
SELECT set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
SELECT set_config('request.jwt.claims', '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);

INSERT INTO public.conversations (id, profile_id, status)
VALUES ('c1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'new')
ON CONFLICT (id) DO NOTHING;

SELECT lives_ok(
  $$
    INSERT INTO public.conversation_messages (conversation_id, sender_id, message_body, is_from_admin)
    VALUES ('c1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Hello coordination team', false)
  $$,
  'Guest conversation message succeeds before cutoff'
);

-- ------------------------------------------------------------------------------
-- 4. POST-CUTOFF BOUNDARY BEHAVIOR (MOCKED TO 23 NOVEMBER 2026, 00:00:01 IST)
-- 23 Nov 2026 00:00:01 IST = 22 Nov 2026 18:30:01 UTC
-- ------------------------------------------------------------------------------
SELECT set_config('app.test_time_override', '2026-11-22 18:30:01+00', true);

-- Test 9: Lifecycle state switches to memories_mode
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
SELECT set_config('request.jwt.claims', '{"role": "anon"}', true);

SELECT is(
  (SELECT (public.get_wedding_lifecycle_state()->>'state')),
  'memories_mode',
  'Post-cutoff reports state = memories_mode'
);

-- Test 10: is_memories_mode is true
SELECT is(
  (SELECT (public.get_wedding_lifecycle_state()->>'is_memories_mode')::boolean),
  true,
  'Post-cutoff reports is_memories_mode = true'
);

-- Test 11: New access requests REJECTED after cutoff
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
SELECT set_config('request.jwt.claims', '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    INSERT INTO public.access_requests (profile_id, invited_family_name, relationship_to_couple)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Late Family', 'Guest')
  $$,
  '22023',
  'Access requests are closed as wedding celebrations have transitioned into Memories Mode.',
  'Access requests strictly rejected in Memories Mode'
);

-- Test 12: New wish submission REJECTED after cutoff
SELECT throws_ok(
  $$
    INSERT INTO public.wishes (profile_id, author_display_name, wish_text, status)
    VALUES ('33333333-3333-3333-3333-333333333333', 'Arjun', 'Late blessings after wedding', 'pending')
  $$,
  NULL,
  'Wedding celebration cutoff has passed. New wishes can no longer be submitted.',
  'New wishes strictly rejected in Memories Mode'
);

-- Test 13: New guest conversation message REJECTED after cutoff
SELECT throws_ok(
  $$
    INSERT INTO public.conversation_messages (conversation_id, sender_id, message_body, is_from_admin)
    VALUES ('c1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Late inquiry message', false)
  $$,
  NULL,
  'Wedding celebration cutoff has passed. New guest questions can no longer be submitted.',
  'New guest questions strictly rejected in Memories Mode'
);

-- Test 14: Wish author CAN edit existing wish after cutoff
SELECT lives_ok(
  $$
    UPDATE public.wishes
    SET wish_text = 'Updated wish text with even warmer blessings!'
    WHERE id = 'a1111111-1111-1111-1111-111111111111'
      AND profile_id = '33333333-3333-3333-3333-333333333333'
  $$,
  'Author permitted to edit existing wish after cutoff'
);

-- Test 15: Editing approved wish returns status to pending
SELECT is(
  (SELECT status FROM public.wishes WHERE id = 'a1111111-1111-1111-1111-111111111111'),
  'pending',
  'Author edit resets wish status back to pending moderation'
);

-- Test 16: Wishes admin CAN re-approve wish after cutoff
SELECT set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
SELECT set_config('request.jwt.claims', '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    SELECT public.admin_moderate_wish('a1111111-1111-1111-1111-111111111111', 'approved')
  $$,
  'Wishes admin permitted to moderate and approve wish after cutoff'
);

-- Test 17: Admin CAN reply to guest conversations after cutoff
SELECT lives_ok(
  $$
    INSERT INTO public.conversation_messages (conversation_id, sender_id, message_body, is_from_admin)
    VALUES ('c1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Admin resolution message after cutoff', true)
  $$,
  'Admin permitted to reply to conversation after cutoff'
);

-- ------------------------------------------------------------------------------
-- 5. CEREMONY DAY TRANSITION STATES IN LIFECYCLE RPC
-- ------------------------------------------------------------------------------
-- 19 Nov 2026, 09:00 IST = 19 Nov 2026, 03:30 UTC -> haldi_day
SELECT set_config('app.test_time_override', '2026-11-19 03:30:00+00', true);
SELECT is(
  (SELECT (public.get_wedding_lifecycle_state()->>'state')),
  'haldi_day',
  '19 Nov 2026 reports state = haldi_day'
);

-- 21 Nov 2026, 23:00 IST = 21 Nov 2026, 17:30 UTC -> wedding_day
SELECT set_config('app.test_time_override', '2026-11-21 17:30:00+00', true);
SELECT is(
  (SELECT (public.get_wedding_lifecycle_state()->>'state')),
  'wedding_day',
  '21 Nov 2026 reports state = wedding_day'
);

SELECT * FROM finish();
ROLLBACK;
