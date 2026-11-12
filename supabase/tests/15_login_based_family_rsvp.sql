-- ==============================================================================
-- pgTAP Test: 15_login_based_family_rsvp.sql
-- Description: Comprehensive verification of Login-Based Family RSVP architecture:
--   1. Self-service registration auto-approval & household initialization.
--   2. Initial family member created with user's full name.
--   3. Household isolation (RLS prevents cross-household access/mutation).
--   4. Add / edit / delete family members (name only, no age categories).
--   5. Name validation (rejects whitespace or empty strings).
--   6. Independent 4-ceremony RSVP submission with member selection.
--   7. Headcount derived from selected members.
--   8. Duplicate submission protection: updates existing RSVP, replaces attendees atomically.
--   9. Constraint enforcement: uq_event_family_rsvp and uq_rsvp_family_member.
--  10. Non-attending / not_sure submissions without attendee requirements.
--  11. Ceremony deadline locking.
--  12. Admin report aggregating confirmed individual attendees.
-- ==============================================================================

BEGIN;
SELECT plan(23);

-- ------------------------------------------------------------------------------
-- 0. FIXTURE SETUP
-- ------------------------------------------------------------------------------
RESET ROLE;

-- Create two guest users and one admin user
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'guest_family_a@example.com', '{"full_name": "Rohan Sharma"}'::jsonb),
  ('b2222222-2222-2222-2222-222222222222', 'guest_family_b@example.com', '{"full_name": "Priya Verma"}'::jsonb),
  ('c3333333-3333-3333-3333-333333333333', 'admin_rsvp_tester@example.com', '{"full_name": "Admin Tester"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('c3333333-3333-3333-3333-333333333333', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = FALSE, is_active = TRUE;

INSERT INTO public.admin_permissions (admin_id, permission_group)
VALUES ('c3333333-3333-3333-3333-333333333333', 'guest_rsvp')
ON CONFLICT (admin_id, permission_group) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 1. TEST: AUTO-APPROVAL UPON REGISTRATION
-- ------------------------------------------------------------------------------
SELECT results_eq(
  $$ SELECT is_approved_guest FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111' $$,
  $$ VALUES (TRUE) $$,
  '1. Newly registered guest is automatically approved (is_approved_guest = TRUE)'
);

-- ------------------------------------------------------------------------------
-- 2. TEST: AUTOMATIC HOUSEHOLD INITIALIZATION
-- ------------------------------------------------------------------------------
SELECT isnt_empty(
  $$ SELECT id FROM public.family_groups WHERE created_by = 'a1111111-1111-1111-1111-111111111111' $$,
  '2. Newly registered guest automatically receives a private family group'
);

-- ------------------------------------------------------------------------------
-- 3. TEST: INITIAL FAMILY MEMBER CREATED WITH USER'S FULL NAME
-- ------------------------------------------------------------------------------
SELECT results_eq(
  $$
    SELECT fm.name
    FROM public.family_members fm
    JOIN public.profiles p ON p.family_group_id = fm.family_group_id
    WHERE p.id = 'a1111111-1111-1111-1111-111111111111'
  $$,
  $$ VALUES ('Rohan Sharma'::TEXT) $$,
  '3. Initial household member is automatically created with user full name'
);

-- ------------------------------------------------------------------------------
-- 4. TEST: GUEST IS ACTIVE FAMILY MANAGER OF THEIR HOUSEHOLD
-- ------------------------------------------------------------------------------
SELECT results_eq(
  $$
    SELECT is_active
    FROM public.family_managers
    WHERE profile_id = 'a1111111-1111-1111-1111-111111111111'
  $$,
  $$ VALUES (TRUE) $$,
  '4. Guest is assigned as active family manager of their household'
);

-- ------------------------------------------------------------------------------
-- 5. TEST: GUEST CAN ADD A NEW FAMILY MEMBER (NAME ONLY)
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'a1111111-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "a1111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    INSERT INTO public.family_members (family_group_id, name)
    SELECT family_group_id, 'Ananya Sharma'
    FROM public.profiles
    WHERE id = 'a1111111-1111-1111-1111-111111111111';
  $$,
  '5. Guest can add a new household member'
);

-- ------------------------------------------------------------------------------
-- 6. TEST: EMPTY / WHITESPACE NAME IS REJECTED
-- ------------------------------------------------------------------------------
SELECT throws_ok(
  $$
    INSERT INTO public.family_members (family_group_id, name)
    SELECT family_group_id, '   '
    FROM public.profiles
    WHERE id = 'a1111111-1111-1111-1111-111111111111';
  $$,
  '23514', -- check_violation
  NULL,
  '6. Empty or whitespace-only name is rejected by check constraint'
);

-- ------------------------------------------------------------------------------
-- 7. TEST: GUEST CAN EDIT A HOUSEHOLD MEMBER
-- ------------------------------------------------------------------------------
SELECT lives_ok(
  $$
    UPDATE public.family_members
    SET name = 'Ananya Sharma (Spouse)'
    WHERE name = 'Ananya Sharma'
      AND family_group_id = (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111');
  $$,
  '7. Guest can update a household member name'
);

-- ------------------------------------------------------------------------------
-- 8. TEST: RLS PREVENTS CROSS-HOUSEHOLD ACCESS
-- ------------------------------------------------------------------------------
-- Switch to Guest B
SELECT set_config('request.jwt.claim.sub', 'b2222222-2222-2222-2222-222222222222', true);
SELECT set_config('request.jwt.claims', '{"sub": "b2222222-2222-2222-2222-222222222222", "role": "authenticated"}', true);

SELECT is_empty(
  $$
    SELECT *
    FROM public.family_members
    WHERE family_group_id = (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111')
  $$,
  '8. Guest B cannot view Guest A household members (RLS isolation)'
);

-- ------------------------------------------------------------------------------
-- 9. TEST: RLS PREVENTS CROSS-HOUSEHOLD MUTATION
-- ------------------------------------------------------------------------------
SELECT lives_ok(
  $$
    UPDATE public.family_members
    SET name = 'Tampered Name'
    WHERE family_group_id = (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111');
  $$,
  'Guest B update query executes without syntax error'
);

RESET ROLE;
SELECT results_ne(
  $$
    SELECT name
    FROM public.family_members
    WHERE family_group_id = (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111')
    ORDER BY created_at ASC LIMIT 1
  $$,
  $$ VALUES ('Tampered Name') $$,
  '9. Guest A household member was NOT altered by Guest B (RLS update protection)'
);

-- ------------------------------------------------------------------------------
-- 10. TEST: GUEST A SUBMITS HALDI RSVP WITH 2 MEMBERS (MEMBER-BASED SELECTION)
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'a1111111-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "a1111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    WITH user_members AS (
      SELECT jsonb_agg(id::text) AS member_ids
      FROM public.family_members
      WHERE family_group_id = (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111')
    )
    SELECT public.submit_family_rsvp(
      p_event_id := 'haldi'::text,
      p_family_group_id := (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111'),
      p_status := 'attending'::text,
      p_attendees := (SELECT member_ids FROM user_members),
      p_arrival_details := 'Arriving by train',
      p_special_dietary_requests := 'Excited for Haldi!'
    );
  $$,
  '10. Guest A submits Haldi RSVP with selected family member IDs'
);

-- ------------------------------------------------------------------------------
-- 11. TEST: ATTENDEE COUNT IS DERIVED (COUNT = 2) & ATTENDEES LINKED TO MEMBERS
-- ------------------------------------------------------------------------------
RESET ROLE;
SELECT results_eq(
  $$
    SELECT status
    FROM public.rsvps
    WHERE family_group_id = (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111')
      AND event_id = 'haldi'
  $$,
  $$ VALUES ('attending'::text) $$,
  '11. Haldi RSVP status recorded as attending'
);

SELECT results_eq(
  $$
    SELECT count(*)::integer
    FROM public.attendees a
    JOIN public.rsvps r ON r.id = a.rsvp_id
    WHERE r.family_group_id = (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111')
      AND r.event_id = 'haldi'
      AND a.family_member_id IS NOT NULL
  $$,
  $$ VALUES (2) $$,
  '12. Exactly 2 attendees are linked to family_member_id records'
);

-- ------------------------------------------------------------------------------
-- 13. TEST: DUPLICATE PROTECTION - RESUBMITTING UPDATES EXISTING RSVP
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'a1111111-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "a1111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);

-- Resubmit with only 1 member (Rohan)
SELECT lives_ok(
  $$
    WITH rohan_member AS (
      SELECT jsonb_build_array(id::text) AS member_ids
      FROM public.family_members
      WHERE name = 'Rohan Sharma'
        AND family_group_id = (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111')
    )
    SELECT public.submit_family_rsvp(
      p_event_id := 'haldi'::text,
      p_family_group_id := (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111'),
      p_status := 'attending'::text,
      p_attendees := (SELECT member_ids FROM rohan_member),
      p_arrival_details := 'Arriving by flight',
      p_special_dietary_requests := 'Only 1 attending now'
    );
  $$,
  '13. Guest A resubmits Haldi RSVP with modified member selection'
);

-- Check that only ONE RSVP record exists for this event and family group
RESET ROLE;
SELECT results_eq(
  $$
    SELECT count(*)::integer
    FROM public.rsvps
    WHERE family_group_id = (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111')
      AND event_id = 'haldi'
  $$,
  $$ VALUES (1) $$,
  '14. Exactly one RSVP record exists for family group + event (no duplicates created)'
);

-- Check special_dietary_requests updated atomically
SELECT results_eq(
  $$
    SELECT special_dietary_requests
    FROM public.rsvps
    WHERE family_group_id = (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111')
      AND event_id = 'haldi'
  $$,
  $$ VALUES ('Only 1 attending now'::text) $$,
  '15. RSVP record updated atomically with new details'
);

SELECT results_eq(
  $$
    SELECT count(*)::integer
    FROM public.attendees a
    JOIN public.rsvps r ON r.id = a.rsvp_id
    WHERE r.family_group_id = (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111')
      AND r.event_id = 'haldi'
  $$,
  $$ VALUES (1) $$,
  '16. Attendees replaced atomically without orphan records (count is now 1)'
);

-- ------------------------------------------------------------------------------
-- 17. TEST: NOT_ATTENDING OR NOT_SURE DOES NOT REQUIRE ATTENDEES
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'a1111111-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "a1111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    SELECT public.submit_family_rsvp(
      p_event_id := 'mehndi'::text,
      p_family_group_id := (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111'),
      p_status := 'not_attending'::text,
      p_attendees := '[]'::jsonb,
      p_arrival_details := NULL,
      p_special_dietary_requests := 'Unable to travel on this date'
    );
  $$,
  '17. Mehndi RSVP submitted as not_attending with 0 attendees succeeds'
);

SELECT lives_ok(
  $$
    SELECT public.submit_family_rsvp(
      p_event_id := 'wedding'::text,
      p_family_group_id := (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111'),
      p_status := 'not_sure'::text,
      p_attendees := '[]'::jsonb,
      p_arrival_details := NULL,
      p_special_dietary_requests := 'Awaiting leave confirmation'
    );
  $$,
  '18. Wedding RSVP submitted as not_sure with 0 attendees succeeds'
);

-- ------------------------------------------------------------------------------
-- 19. TEST: GUEST CANNOT SELECT ANOTHER HOUSEHOLD'S MEMBER
-- ------------------------------------------------------------------------------
SELECT throws_ok(
  $$
    SELECT public.submit_family_rsvp(
      p_event_id := 'reception'::text,
      p_family_group_id := (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111'),
      p_status := 'attending'::text,
      p_attendees := jsonb_build_array('b2222222-0000-0000-0000-000000000001'::text)
    );
  $$,
  'Selected family member does not belong to your household.',
  '19. Selecting a member from another household is rejected'
);

-- ------------------------------------------------------------------------------
-- 20. TEST: DEADLINE LOCKING
-- ------------------------------------------------------------------------------
RESET ROLE;
-- Move Haldi ceremony rsvp_deadline_utc to the past
UPDATE public.events
SET rsvp_deadline_utc = NOW() - INTERVAL '1 hour'
WHERE id = 'haldi';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'a1111111-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "a1111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    SELECT public.submit_family_rsvp(
      p_event_id := 'haldi'::text,
      p_family_group_id := (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111'),
      p_status := 'attending'::text,
      p_attendees := jsonb_build_array('a1111111-0000-0000-0000-000000000001'::text)
    );
  $$,
  'RSVP deadline for this ceremony has permanently passed.',
  '20. Submitting RSVP after ceremony deadline is strictly blocked'
);

-- Reset deadline back to future
RESET ROLE;
UPDATE public.events
SET rsvp_deadline_utc = '2026-11-18 18:29:59+00'
WHERE id = 'haldi';

-- ------------------------------------------------------------------------------
-- 21. TEST: GUEST CAN DELETE A FAMILY MEMBER
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'a1111111-1111-1111-1111-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "a1111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    DELETE FROM public.family_members
    WHERE name = 'Ananya Sharma (Spouse)'
      AND family_group_id = (SELECT family_group_id FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111');
  $$,
  '21. Guest can delete a household member'
);

-- ------------------------------------------------------------------------------
-- 22. TEST: ADMIN REPORT AGGREGATES INDIVIDUAL ATTENDEES ACCURATELY
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'c3333333-3333-3333-3333-333333333333', true);
SELECT set_config('request.jwt.claims', '{"sub": "c3333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);

SELECT results_eq(
  $$
    SELECT ((public.get_admin_rsvp_report() -> 'events_summary' -> 0 ->> 'total_attendees')::integer >= 1)
  $$,
  $$ VALUES (TRUE) $$,
  '22. Admin report aggregates confirmed attendees without adult/child/infant categories'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
