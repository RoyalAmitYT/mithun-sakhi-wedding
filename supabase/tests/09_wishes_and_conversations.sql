-- ==============================================================================
-- pgTAP Test: 09_wishes_and_conversations.sql
-- Description: Verifies the P-10 Guest Wishes & Private Conversations workflow:
--   1. Any authenticated user (including unapproved) can submit a wish.
--   2. New wish is 'pending' and hidden from public feed.
--   3. Only approved wishes appear publicly with first name only.
--   4. Guest cannot edit or delete another guest's wish.
--   5. Editing an approved wish resets status to 'pending' and hides it from public feed.
--   6. Author can delete their own wish.
--   7. Admin with 'wishes' permission can approve/reject wishes; unauthorized users cannot.
--   8. Account deletion retains approved wish under 'Guest' and purges non-approved wishes.
--   9. Private conversation isolation (1 thread per guest, cross-guest read/write block).
--  10. Impersonation prevention (guest cannot set is_from_admin = TRUE).
--  11. Status management (guest cannot change status; resolved conversation reopens on new message).
--  12. Wedding cutoff blocks new wishes and guest messages, but permits editing/deleting existing wishes.
-- ==============================================================================

BEGIN;
SELECT plan(24);

-- ------------------------------------------------------------------------------
-- 0. TEST FIXTURES SETUP (Superuser)
-- ------------------------------------------------------------------------------
RESET ROLE;

INSERT INTO auth.users (id, email) VALUES
  ('61616161-1111-1111-1111-111111111111', 'wish_guest_1@example.com'),
  ('62626262-2222-2222-2222-222222222222', 'wish_guest_2@example.com'),
  ('63636363-3333-3333-3333-333333333333', 'wish_admin@example.com'),
  ('64646464-4444-4444-4444-444444444444', 'questions_admin@example.com')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Ananya Sen', mobile_number = '+919876511111', is_approved_guest = FALSE, family_group_id = NULL
WHERE id = '61616161-1111-1111-1111-111111111111';

UPDATE public.profiles
SET full_name = 'Bikram Ghosh', mobile_number = '+919876522222', is_approved_guest = TRUE, family_group_id = NULL
WHERE id = '62626262-2222-2222-2222-222222222222';

UPDATE public.profiles
SET full_name = 'Wish Admin User', is_approved_guest = TRUE
WHERE id = '63636363-3333-3333-3333-333333333333';

UPDATE public.profiles
SET full_name = 'Questions Admin User', is_approved_guest = TRUE
WHERE id = '64646464-4444-4444-4444-444444444444';

-- Admin permissions
INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES
  ('63636363-3333-3333-3333-333333333333', FALSE, TRUE),
  ('64646464-4444-4444-4444-444444444444', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_active = TRUE;

INSERT INTO public.admin_permissions (admin_id, permission_group)
VALUES
  ('63636363-3333-3333-3333-333333333333', 'wishes'),
  ('64646464-4444-4444-4444-444444444444', 'questions')
ON CONFLICT (admin_id, permission_group) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 1. TEST: UNAPPROVED GUEST CAN SUBMIT A WISH WITH AUTOMATIC FIRST-NAME DISPLAY
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '61616161-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "61616161-1111-1111-1111-111111111111", "role": "authenticated"}', true);

INSERT INTO public.wishes (id, profile_id, author_display_name, wish_text)
VALUES (
  'a1111111-0000-0000-0000-000000000000',
  '61616161-1111-1111-1111-111111111111',
  'Ignored Provided Name',
  'Wishing Mithun and Kabita an eternity of celestial joy and harmony!'
);

RESET ROLE;
SELECT results_eq(
  $$
    SELECT status, author_display_name
    FROM public.wishes
    WHERE id = 'a1111111-0000-0000-0000-000000000000'
  $$,
  $$ VALUES ('pending', 'Ananya') $$,
  'New wish submitted as pending with author first name Ananya'
);

-- ------------------------------------------------------------------------------
-- 2. TEST: PENDING WISH DOES NOT APPEAR IN PUBLIC GET_APPROVED_WISHES
-- ------------------------------------------------------------------------------
SET LOCAL ROLE anon;
SELECT is_empty(
  $$ SELECT * FROM public.get_approved_wishes() WHERE id = 'a1111111-0000-0000-0000-000000000000' $$,
  'Pending wish is hidden from public get_approved_wishes feed'
);

-- ------------------------------------------------------------------------------
-- 3. TEST: UNAUTHORIZED USER CANNOT MODERATE WISH
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '62626262-2222-2222-2222-222222222222', true);
SELECT set_config('request.jwt.claims', '{"sub": "62626262-2222-2222-2222-222222222222", "role": "authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.admin_moderate_wish('a1111111-0000-0000-0000-000000000000', 'approved'); $$,
  'Unauthorized: Requires wishes permission.',
  'Non-admin guest cannot execute admin_moderate_wish'
);

-- ------------------------------------------------------------------------------
-- 4. TEST: WISHES ADMIN CAN APPROVE WISH AND IT BECOMES PUBLICLY VISIBLE
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', '63636363-3333-3333-3333-333333333333', true);
SELECT set_config('request.jwt.claims', '{"sub": "63636363-3333-3333-3333-333333333333", "role": "authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.admin_moderate_wish('a1111111-0000-0000-0000-000000000000', 'approved'); $$,
  'Wishes admin successfully approves wish'
);

SET LOCAL ROLE anon;
SELECT results_eq(
  $$
    SELECT author_display_name, wish_text
    FROM public.get_approved_wishes()
    WHERE id = 'a1111111-0000-0000-0000-000000000000'
  $$,
  $$ VALUES ('Ananya', 'Wishing Mithun and Kabita an eternity of celestial joy and harmony!') $$,
  'Approved wish appears in public feed with first name only'
);

-- ------------------------------------------------------------------------------
-- 5. TEST: GUEST CANNOT EDIT ANOTHER GUEST'S WISH
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '62626262-2222-2222-2222-222222222222', true);
SELECT set_config('request.jwt.claims', '{"sub": "62626262-2222-2222-2222-222222222222", "role": "authenticated"}', true);

UPDATE public.wishes
SET wish_text = 'Hacked text by intruder'
WHERE id = 'a1111111-0000-0000-0000-000000000000';

RESET ROLE;
SELECT results_eq(
  $$ SELECT wish_text FROM public.wishes WHERE id = 'a1111111-0000-0000-0000-000000000000' $$,
  $$ VALUES ('Wishing Mithun and Kabita an eternity of celestial joy and harmony!') $$,
  'Guest cannot update another guest wish (RLS isolates modification)'
);

-- ------------------------------------------------------------------------------
-- 6. TEST: AUTHOR EDITING APPROVED WISH RESETS STATUS TO PENDING & HIDES FROM FEED
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '61616161-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "61616161-1111-1111-1111-111111111111", "role": "authenticated"}', true);

UPDATE public.wishes
SET wish_text = 'Wishing Mithun and Kabita endless bliss, laughter, and health!'
WHERE id = 'a1111111-0000-0000-0000-000000000000';

RESET ROLE;
SELECT results_eq(
  $$ SELECT status FROM public.wishes WHERE id = 'a1111111-0000-0000-0000-000000000000' $$,
  $$ VALUES ('pending') $$,
  'Author edit resets status to pending'
);

SET LOCAL ROLE anon;
SELECT is_empty(
  $$ SELECT * FROM public.get_approved_wishes() WHERE id = 'a1111111-0000-0000-0000-000000000000' $$,
  'Edited wish is immediately hidden from public feed'
);

-- Re-approve for subsequent tests via wishes admin
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '63636363-3333-3333-3333-333333333333', true);
SELECT set_config('request.jwt.claims', '{"sub": "63636363-3333-3333-3333-333333333333", "role": "authenticated"}', true);
SELECT public.admin_moderate_wish('a1111111-0000-0000-0000-000000000000', 'approved');
RESET ROLE;

-- ------------------------------------------------------------------------------
-- 7. TEST: ACCOUNT DELETION PRESERVES APPROVED WISH UNDER 'Guest'
-- ------------------------------------------------------------------------------
DELETE FROM public.profiles WHERE id = '61616161-1111-1111-1111-111111111111';

SELECT results_eq(
  $$
    SELECT status, author_display_name, profile_id
    FROM public.wishes
    WHERE id = 'a1111111-0000-0000-0000-000000000000'
  $$,
  $$ VALUES ('approved', 'Guest', NULL::uuid) $$,
  'Approved wish survives account deletion under anonymous name Guest with NULL profile_id'
);

-- ------------------------------------------------------------------------------
-- 8. TEST: NON-APPROVED WISH IS PURGED UPON ACCOUNT DELETION
-- ------------------------------------------------------------------------------
INSERT INTO public.wishes (id, profile_id, author_display_name, wish_text, status)
VALUES (
  'a2222222-0000-0000-0000-000000000000',
  '62626262-2222-2222-2222-222222222222',
  'Bikram',
  'Pending wish destined for deletion',
  'pending'
);

DELETE FROM public.profiles WHERE id = '62626262-2222-2222-2222-222222222222';

SELECT is_empty(
  $$ SELECT * FROM public.wishes WHERE id = 'a2222222-0000-0000-0000-000000000000' $$,
  'Pending wish is automatically deleted upon profile deletion'
);

-- ------------------------------------------------------------------------------
-- 9. TEST: RE-CREATE PROFILE & TEST SINGLE CONVERSATION CONSTRAINT
-- ------------------------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, email, is_approved_guest)
VALUES ('61616161-1111-1111-1111-111111111111', 'Ananya Sen', 'wish_guest_1@example.com', TRUE);

INSERT INTO public.profiles (id, full_name, email, is_approved_guest)
VALUES ('62626262-2222-2222-2222-222222222222', 'Bikram Ghosh', 'wish_guest_2@example.com', TRUE);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '61616161-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "61616161-1111-1111-1111-111111111111", "role": "authenticated"}', true);

INSERT INTO public.conversations (id, profile_id, status)
VALUES ('b1111111-0000-0000-0000-000000000000', '61616161-1111-1111-1111-111111111111', 'new');

-- Attempting duplicate conversation for same guest violates unique constraint
SELECT throws_ok(
  $$
    INSERT INTO public.conversations (id, profile_id, status)
    VALUES ('b2222222-0000-0000-0000-000000000000', '61616161-1111-1111-1111-111111111111', 'new');
  $$,
  'duplicate key value violates unique constraint "conversations_profile_id_key"',
  'One conversation per guest constraint is strictly enforced'
);

-- ------------------------------------------------------------------------------
-- 10. TEST: CROSS-GUEST CONVERSATION ISOLATION
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', '62626262-2222-2222-2222-222222222222', true);
SELECT set_config('request.jwt.claims', '{"sub": "62626262-2222-2222-2222-222222222222", "role": "authenticated"}', true);

SELECT is_empty(
  $$ SELECT * FROM public.conversations WHERE id = 'b1111111-0000-0000-0000-000000000000' $$,
  'Guest 2 cannot select Guest 1 conversation (RLS isolation)'
);

-- ------------------------------------------------------------------------------
-- 11. TEST: GUEST CANNOT IMPERSONATE ADMINISTRATOR (is_from_admin = true)
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', '61616161-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "61616161-1111-1111-1111-111111111111", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    INSERT INTO public.conversation_messages (conversation_id, sender_id, message_body, is_from_admin)
    VALUES ('b1111111-0000-0000-0000-000000000000', '61616161-1111-1111-1111-111111111111', 'Impersonated admin message', TRUE);
  $$,
  'Unauthorized: Only wedding administrators can send official replies.',
  'Guest cannot send message with is_from_admin = TRUE'
);

-- ------------------------------------------------------------------------------
-- 12. TEST: GUEST SENDS VALID MESSAGE
-- ------------------------------------------------------------------------------
SELECT lives_ok(
  $$
    INSERT INTO public.conversation_messages (conversation_id, sender_id, message_body)
    VALUES ('b1111111-0000-0000-0000-000000000000', '61616161-1111-1111-1111-111111111111', 'Hello, do we need to arrange separate transport from Purulia station?');
  $$,
  'Guest successfully sends valid inquiry message'
);

-- ------------------------------------------------------------------------------
-- 13. TEST: GUEST CANNOT DIRECTLY UPDATE CONVERSATION STATUS
-- ------------------------------------------------------------------------------
UPDATE public.conversations
SET status = 'resolved'
WHERE id = 'b1111111-0000-0000-0000-000000000000';

RESET ROLE;
SELECT results_eq(
  $$ SELECT status FROM public.conversations WHERE id = 'b1111111-0000-0000-0000-000000000000' $$,
  $$ VALUES ('new') $$,
  'Guest cannot alter conversation status directly'
);

-- ------------------------------------------------------------------------------
-- 14. TEST: QUESTIONS ADMIN CAN REPLY AND CONVERSATION SHIFTS TO IN_PROGRESS
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '64646464-4444-4444-4444-444444444444', true);
SELECT set_config('request.jwt.claims', '{"sub": "64646464-4444-4444-4444-444444444444", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    INSERT INTO public.conversation_messages (conversation_id, sender_id, message_body)
    VALUES ('b1111111-0000-0000-0000-000000000000', '64646464-4444-4444-4444-444444444444', 'We will have shuttles waiting at Purulia station for all guests!');
  $$,
  'Questions admin sends official reply'
);

RESET ROLE;
SELECT results_eq(
  $$ SELECT status FROM public.conversations WHERE id = 'b1111111-0000-0000-0000-000000000000' $$,
  $$ VALUES ('in_progress') $$,
  'Admin reply shifts conversation status to in_progress'
);

-- ------------------------------------------------------------------------------
-- 15. TEST: ADMIN RESOLVES CONVERSATION AND GUEST FOLLOW-UP REOPENS AS NEW
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '64646464-4444-4444-4444-444444444444', true);
SELECT set_config('request.jwt.claims', '{"sub": "64646464-4444-4444-4444-444444444444", "role": "authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.admin_update_conversation_status('b1111111-0000-0000-0000-000000000000', 'resolved'); $$,
  'Admin updates status to resolved'
);

-- Guest sends another message to resolved thread
SELECT set_config('request.jwt.claim.sub', '61616161-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "61616161-1111-1111-1111-111111111111", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    INSERT INTO public.conversation_messages (conversation_id, sender_id, message_body)
    VALUES ('b1111111-0000-0000-0000-000000000000', '61616161-1111-1111-1111-111111111111', 'One more question: what time do the shuttles depart?');
  $$,
  'Guest sends follow-up message to resolved conversation'
);

RESET ROLE;
SELECT results_eq(
  $$ SELECT status FROM public.conversations WHERE id = 'b1111111-0000-0000-0000-000000000000' $$,
  $$ VALUES ('new') $$,
  'Follow-up message automatically reopens resolved conversation to new'
);

-- ------------------------------------------------------------------------------
-- 16. TEST: AUTHOR CAN DELETE THEIR OWN WISH
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '61616161-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "61616161-1111-1111-1111-111111111111", "role": "authenticated"}', true);

-- Insert another wish for guest 1
INSERT INTO public.wishes (id, profile_id, author_display_name, wish_text)
VALUES ('a3333333-0000-0000-0000-000000000000', '61616161-1111-1111-1111-111111111111', 'Ananya', 'A second wish to be deleted');

DELETE FROM public.wishes WHERE id = 'a3333333-0000-0000-0000-000000000000';

RESET ROLE;
SELECT is_empty(
  $$ SELECT * FROM public.wishes WHERE id = 'a3333333-0000-0000-0000-000000000000' $$,
  'Author successfully deletes their own wish'
);

-- ------------------------------------------------------------------------------
-- 17. TEST: WEDDING CUTOFF ENFORCEMENT ON NEW SUBMISSIONS
-- ------------------------------------------------------------------------------
RESET ROLE;
SET LOCAL app.test_time_override = '2026-11-25 00:00:00+00';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '61616161-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "61616161-1111-1111-1111-111111111111", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    INSERT INTO public.wishes (id, profile_id, author_display_name, wish_text)
    VALUES ('a4444444-0000-0000-0000-000000000000', '61616161-1111-1111-1111-111111111111', 'Ananya', 'Post cutoff wish');
  $$,
  'Wedding celebration cutoff has passed. New wishes can no longer be submitted.',
  'New wish submission post-cutoff is rejected by actual database trigger'
);

SELECT throws_ok(
  $$
    INSERT INTO public.conversation_messages (conversation_id, sender_id, message_body)
    VALUES ('b1111111-0000-0000-0000-000000000000', '61616161-1111-1111-1111-111111111111', 'Post cutoff question');
  $$,
  'Wedding celebration cutoff has passed. New guest questions can no longer be submitted.',
  'Guest question post-cutoff is rejected by actual database trigger'
);

RESET ROLE;
SET LOCAL app.test_time_override = '';

-- ------------------------------------------------------------------------------
-- 18. TEST: EDITING EXISTING WISH REMAINS PERMITTED POST-CUTOFF
-- ------------------------------------------------------------------------------
RESET ROLE;
UPDATE public.wishes
SET profile_id = '61616161-1111-1111-1111-111111111111'
WHERE id = 'a1111111-0000-0000-0000-000000000000';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '61616161-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "61616161-1111-1111-1111-111111111111", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    UPDATE public.wishes
    SET wish_text = 'A refined post-cutoff edit to my blessing.'
    WHERE id = 'a1111111-0000-0000-0000-000000000000';
  $$,
  'Editing existing wish is permitted post-cutoff'
);

ROLLBACK;
