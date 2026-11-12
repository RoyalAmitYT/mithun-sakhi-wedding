-- ==============================================================================
-- pgTAP Test: 10_admin_dashboard_and_notifications.sql
-- Description: Tests Phase P-11 Unified Admin Dashboard, Permissions & Notifications:
--   1. Single Super Admin unique partial constraint (idx_single_super_admin).
--   2. Automated notification generation triggers on access requests, wishes, conversations.
--   3. Notification scoping by permission group.
--   4. Notification read-state RPCs (admin_mark_notification_read, admin_mark_all_notifications_read).
--   5. Super Admin team management and privilege elevation blocks (get_admin_team, admin_manage_admin_user).
--   6. Unified dashboard metrics RPC permission filtering (get_admin_dashboard_metrics).
-- ==============================================================================

BEGIN;
SELECT plan(18);

-- ------------------------------------------------------------------------------
-- 0. TEST FIXTURES SETUP
-- ------------------------------------------------------------------------------
RESET ROLE;

INSERT INTO auth.users (id, email) VALUES
  ('71717171-1111-1111-1111-111111111111', 'p11_super@wedding.test'),
  ('72727272-2222-2222-2222-222222222222', 'p11_wishes_admin@wedding.test'),
  ('73737373-3333-3333-3333-333333333333', 'p11_guest@wedding.test'),
  ('74747474-4444-4444-4444-444444444444', 'p11_candidate@wedding.test')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles SET full_name = 'Super Admin Mithun', is_approved_guest = TRUE WHERE id = '71717171-1111-1111-1111-111111111111';
UPDATE public.profiles SET full_name = 'Wishes Admin Priya', is_approved_guest = TRUE WHERE id = '72727272-2222-2222-2222-222222222222';
UPDATE public.profiles SET full_name = 'Guest Rohan', is_approved_guest = FALSE WHERE id = '73737373-3333-3333-3333-333333333333';
UPDATE public.profiles SET full_name = 'Candidate Sunita', is_approved_guest = TRUE WHERE id = '74747474-4444-4444-4444-444444444444';

-- Ensure 7171... is Super Admin
INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('71717171-1111-1111-1111-111111111111', TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = TRUE, is_active = TRUE;

-- 7272... is Wishes-only Admin
INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('72727272-2222-2222-2222-222222222222', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = FALSE, is_active = TRUE;

DELETE FROM public.admin_permissions WHERE admin_id = '72727272-2222-2222-2222-222222222222';
INSERT INTO public.admin_permissions (admin_id, permission_group)
VALUES ('72727272-2222-2222-2222-222222222222', 'wishes');

-- ------------------------------------------------------------------------------
-- 1. TEST: SINGLE SUPER ADMIN UNIQUE CONSTRAINT (TC-ADM-01)
-- ------------------------------------------------------------------------------
SELECT throws_ok(
  $$
    UPDATE public.admin_users
    SET is_super_admin = TRUE
    WHERE id = '72727272-2222-2222-2222-222222222222';
  $$,
  'duplicate key value violates unique constraint "idx_single_super_admin"',
  'Database prevents multiple super admins via partial unique index'
);

-- ------------------------------------------------------------------------------
-- 2. TEST: AUTOMATED NOTIFICATION TRIGGERS (TC-ADM-04)
-- ------------------------------------------------------------------------------
-- Perform guest operations as authenticated guest Rohan
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '73737373-3333-3333-3333-333333333333', true);
SELECT set_config('request.jwt.claims', '{"sub": "73737373-3333-3333-3333-333333333333", "role": "authenticated"}', true);

-- A. Access request trigger
INSERT INTO public.access_requests (id, profile_id, invited_family_name, relationship_to_couple, status)
VALUES ('c1111111-0000-0000-0000-000000000000', '73737373-3333-3333-3333-333333333333', 'Rohan Family', 'College Friend', 'pending')
ON CONFLICT (id) DO NOTHING;

-- B. Wish submission trigger
INSERT INTO public.wishes (id, profile_id, author_display_name, wish_text, status)
VALUES ('c2222222-0000-0000-0000-000000000000', '73737373-3333-3333-3333-333333333333', 'Rohan', 'Wishing happiness!', 'pending')
ON CONFLICT (id) DO NOTHING;

-- C. Conversation message trigger
INSERT INTO public.conversations (id, profile_id, status)
VALUES ('c3333333-0000-0000-0000-000000000000', '73737373-3333-3333-3333-333333333333', 'new')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.conversation_messages (conversation_id, sender_id, message_body, is_from_admin)
VALUES ('c3333333-0000-0000-0000-000000000000', '73737373-3333-3333-3333-333333333333', 'Question about timings', FALSE);

RESET ROLE;

SELECT results_eq(
  $$
    SELECT permission_group, title
    FROM public.admin_notifications
    WHERE related_entity_id = 'c1111111-0000-0000-0000-000000000000'
  $$,
  $$ VALUES ('guest_rsvp', 'New Access Request') $$,
  'Access request submission automatically creates guest_rsvp notification'
);

SELECT results_eq(
  $$
    SELECT permission_group, title
    FROM public.admin_notifications
    WHERE related_entity_id = 'c2222222-0000-0000-0000-000000000000'
  $$,
  $$ VALUES ('wishes', 'New Blessing Submitted') $$,
  'Wish submission automatically creates wishes notification'
);

SELECT results_eq(
  $$
    SELECT permission_group, title
    FROM public.admin_notifications
    WHERE related_entity_id = 'c3333333-0000-0000-0000-000000000000'
  $$,
  $$ VALUES ('questions', 'New Guest Inquiry') $$,
  'Guest question automatically creates questions notification'
);

-- Cache notification IDs in temporary table for subsequent tests
CREATE TEMP TABLE p11_notifs AS
SELECT id, permission_group, related_entity_id FROM public.admin_notifications;
GRANT SELECT ON p11_notifs TO authenticated;

-- ------------------------------------------------------------------------------
-- 3. TEST: NOTIFICATION VISIBILITY & SCOPING VIA RLS
-- ------------------------------------------------------------------------------
-- Wishes admin only sees wishes notifications
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '72727272-2222-2222-2222-222222222222', true);
SELECT set_config('request.jwt.claims', '{"sub": "72727272-2222-2222-2222-222222222222", "role": "authenticated"}', true);

SELECT results_eq(
  $$
    SELECT DISTINCT permission_group
    FROM public.admin_notifications
    WHERE related_entity_id IN ('c1111111-0000-0000-0000-000000000000', 'c2222222-0000-0000-0000-000000000000', 'c3333333-0000-0000-0000-000000000000')
  $$,
  $$ VALUES ('wishes') $$,
  'Wishes admin only sees wishes notifications (guest_rsvp & questions filtered out by RLS)'
);

-- Super admin sees all notifications
SELECT set_config('request.jwt.claim.sub', '71717171-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "71717171-1111-1111-1111-111111111111", "role": "authenticated"}', true);

SELECT results_eq(
  $$
    SELECT COUNT(DISTINCT permission_group)::integer
    FROM public.admin_notifications
    WHERE related_entity_id IN ('c1111111-0000-0000-0000-000000000000', 'c2222222-0000-0000-0000-000000000000', 'c3333333-0000-0000-0000-000000000000')
  $$,
  $$ VALUES (3) $$,
  'Super Admin sees notifications across all permission groups'
);

-- ------------------------------------------------------------------------------
-- 4. TEST: NOTIFICATION READ STATE MANAGEMENT RPCS
-- ------------------------------------------------------------------------------
-- Wishes admin marks their notification as read
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '72727272-2222-2222-2222-222222222222', true);
SELECT set_config('request.jwt.claims', '{"sub": "72727272-2222-2222-2222-222222222222", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    SELECT public.admin_mark_notification_read(
      (SELECT id FROM p11_notifs WHERE related_entity_id = 'c2222222-0000-0000-0000-000000000000' LIMIT 1)
    );
  $$,
  'Wishes admin can mark a wishes notification as read'
);

-- Wishes admin attempts to mark an unauthorized notification as read
SELECT throws_ok(
  $$
    SELECT public.admin_mark_notification_read(
      (SELECT id FROM p11_notifs WHERE related_entity_id = 'c1111111-0000-0000-0000-000000000000' LIMIT 1)
    );
  $$,
  'Unauthorized: Caller does not hold permission for this notification.',
  'Admin cannot mark notification of an unauthorized permission group as read'
);

-- ------------------------------------------------------------------------------
-- 5. TEST: SUPER ADMIN TEAM MANAGEMENT RPCS (TC-ADM-02, TC-ADM-03)
-- ------------------------------------------------------------------------------
-- Non-super admin calling get_admin_team is blocked
SELECT throws_ok(
  $$ SELECT public.get_admin_team(); $$,
  'Unauthorized: Only Super Administrator can view admin team roster.',
  'Non-super admin cannot view admin team roster'
);

-- Non-super admin calling admin_manage_admin_user is blocked
SELECT throws_ok(
  $$ SELECT public.admin_manage_admin_user('74747474-4444-4444-4444-444444444444', TRUE, ARRAY['photos']); $$,
  'Unauthorized: Only the Super Administrator can manage admin roles.',
  'Non-super admin cannot promote or manage administrators'
);

-- Super admin executes get_admin_team
SELECT set_config('request.jwt.claim.sub', '71717171-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "71717171-1111-1111-1111-111111111111", "role": "authenticated"}', true);

SELECT lives_ok(
  $$ SELECT public.get_admin_team(); $$,
  'Super Admin successfully executes get_admin_team'
);

-- Super admin promotes Candidate Sunita with 'guest_rsvp' and 'wishes' permissions
SELECT lives_ok(
  $$ SELECT public.admin_manage_admin_user('74747474-4444-4444-4444-444444444444', TRUE, ARRAY['guest_rsvp', 'wishes']); $$,
  'Super Admin successfully configures administrator permissions'
);

RESET ROLE;
SELECT results_eq(
  $$
    SELECT is_active, is_super_admin
    FROM public.admin_users
    WHERE id = '74747474-4444-4444-4444-444444444444'
  $$,
  $$ VALUES (TRUE, FALSE) $$,
  'Candidate user promoted to active admin (non-super)'
);

SELECT results_eq(
  $$
    SELECT permission_group
    FROM public.admin_permissions
    WHERE admin_id = '74747474-4444-4444-4444-444444444444'
    ORDER BY permission_group
  $$,
  $$ VALUES ('guest_rsvp'), ('wishes') $$,
  'Candidate granted exactly assigned permissions'
);

-- Super admin cannot be deactivated
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '71717171-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "71717171-1111-1111-1111-111111111111", "role": "authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.admin_manage_admin_user('71717171-1111-1111-1111-111111111111', FALSE, ARRAY['guest_rsvp']); $$,
  'Super Administrator account cannot be deactivated.',
  'Super Administrator deactivation guard prevents self-lockout'
);

-- ------------------------------------------------------------------------------
-- 6. TEST: UNIFIED DASHBOARD METRICS RPC PERMISSION FILTERING
-- ------------------------------------------------------------------------------
-- Regular guest is blocked
SELECT set_config('request.jwt.claim.sub', '73737373-3333-3333-3333-333333333333', true);
SELECT set_config('request.jwt.claims', '{"sub": "73737373-3333-3333-3333-333333333333", "role": "authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.get_admin_dashboard_metrics(); $$,
  'Unauthorized: Caller is not an active administrator.',
  'Regular guest cannot execute get_admin_dashboard_metrics'
);

-- Wishes admin executes get_admin_dashboard_metrics -> receives wishes_metrics, but rsvp_metrics is omitted
SELECT set_config('request.jwt.claim.sub', '72727272-2222-2222-2222-222222222222', true);
SELECT set_config('request.jwt.claims', '{"sub": "72727272-2222-2222-2222-222222222222", "role": "authenticated"}', true);

SELECT results_eq(
  $$
    SELECT
      ((public.get_admin_dashboard_metrics()) ? 'wishes_metrics')::boolean,
      ((public.get_admin_dashboard_metrics()) ? 'rsvp_metrics')::boolean
  $$,
  $$ VALUES (TRUE, FALSE) $$,
  'Wishes admin receives wishes metrics while unauthorized rsvp metrics are securely omitted'
);

-- Super admin executes get_admin_dashboard_metrics -> receives all metric sections
SELECT set_config('request.jwt.claim.sub', '71717171-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "71717171-1111-1111-1111-111111111111", "role": "authenticated"}', true);

SELECT results_eq(
  $$
    SELECT
      ((public.get_admin_dashboard_metrics()) ? 'rsvp_metrics')::boolean,
      ((public.get_admin_dashboard_metrics()) ? 'wishes_metrics')::boolean,
      ((public.get_admin_dashboard_metrics()) ? 'conversations_metrics')::boolean
  $$,
  $$ VALUES (TRUE, TRUE, TRUE) $$,
  'Super Admin dashboard metrics include all operational sections'
);

ROLLBACK;
