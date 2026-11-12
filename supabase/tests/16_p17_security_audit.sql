-- ==============================================================================
-- pgTAP Test: 16_p17_security_audit.sql
-- Description: Focused Security and Integrity Audit for P-16/P-17 Architecture:
--   1. Migration & Constraint Integrity (uq_event_family_rsvp, uq_rsvp_family_member)
--   2. Cross-Household Isolation (Guest A vs Guest B across members, RSVPs, attendees)
--   3. Household ID Tampering Guards (profiles.family_group_id defensiveness)
--   4. Cross-User Household Initialization Blocking (initialize_user_household auth guard)
--   5. Privilege Escalation Defense (metadata injection, RLS on admin tables, RPC guards)
--   6. RSVP Integrity (duplicate selection, atomic update, deadline locking)
-- ==============================================================================

BEGIN;
SELECT plan(30);

-- ------------------------------------------------------------------------------
-- 0. FIXTURE SETUP
-- ------------------------------------------------------------------------------
RESET ROLE;

-- Create two ordinary guest users and one admin user
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'audit_guest_alpha@example.com', '{"full_name": "Alpha Guest"}'::jsonb),
  ('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'audit_guest_beta@example.com', '{"full_name": "Beta Guest"}'::jsonb),
  ('33333333-cccc-cccc-cccc-cccccccccccc', 'audit_admin_user@example.com', '{"full_name": "Audit Admin"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('33333333-cccc-cccc-cccc-cccccccccccc', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = FALSE, is_active = TRUE;

INSERT INTO public.admin_permissions (admin_id, permission_group)
VALUES ('33333333-cccc-cccc-cccc-cccccccccccc', 'guest_rsvp')
ON CONFLICT (admin_id, permission_group) DO NOTHING;

-- Retrieve household IDs & member IDs while superuser
CREATE TEMP TABLE _fixture_vars AS
SELECT
  (SELECT family_group_id FROM public.profiles WHERE id = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa') AS fg_alpha,
  (SELECT family_group_id FROM public.profiles WHERE id = '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb') AS fg_beta,
  (SELECT id FROM public.family_members WHERE family_group_id = (SELECT family_group_id FROM public.profiles WHERE id = '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb') LIMIT 1) AS beta_member_id;

GRANT SELECT ON _fixture_vars TO authenticated;

-- ------------------------------------------------------------------------------
-- PART 1: CROSS-HOUSEHOLD ISOLATION (FAMILY MEMBERS)
-- ------------------------------------------------------------------------------
-- As Guest Alpha:
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);

-- 1. Guest Alpha cannot view Guest Beta's family members
SELECT is_empty(
  $$
    SELECT * FROM public.family_members
    WHERE family_group_id = (SELECT fg_beta FROM _fixture_vars)
  $$,
  '1. Guest Alpha cannot view Guest Beta family members (RLS SELECT isolation)'
);

-- 2. Guest Alpha cannot insert a member into Guest Beta's household
SELECT throws_ok(
  $$
    INSERT INTO public.family_members (family_group_id, name)
    VALUES ((SELECT fg_beta FROM _fixture_vars), 'Alpha Intruder');
  $$,
  '42501',
  NULL,
  '2. Guest Alpha cannot insert into Guest Beta household (RLS INSERT isolation)'
);

-- 3. Guest Alpha cannot update Guest Beta's family member
SELECT lives_ok(
  $$
    UPDATE public.family_members
    SET name = 'Hacked Name'
    WHERE family_group_id = (SELECT fg_beta FROM _fixture_vars);
  $$,
  'Guest Alpha update query runs without syntax error'
);

RESET ROLE;
SELECT is_empty(
  $$
    SELECT * FROM public.family_members
    WHERE family_group_id = (SELECT fg_beta FROM _fixture_vars)
      AND name = 'Hacked Name'
  $$,
  '3. Guest Beta member was not updated by Guest Alpha (RLS UPDATE isolation)'
);

-- 4. Guest Alpha cannot delete Guest Beta's family member
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    DELETE FROM public.family_members
    WHERE family_group_id = (SELECT fg_beta FROM _fixture_vars);
  $$,
  'Guest Alpha delete query runs without syntax error'
);

RESET ROLE;
SELECT isnt_empty(
  $$
    SELECT * FROM public.family_members
    WHERE family_group_id = (SELECT fg_beta FROM _fixture_vars)
  $$,
  '4. Guest Beta member was not deleted by Guest Alpha (RLS DELETE isolation)'
);

-- ------------------------------------------------------------------------------
-- PART 2: CROSS-HOUSEHOLD ISOLATION (RSVPS & ATTENDEES)
-- ------------------------------------------------------------------------------
-- Beta submits Haldi RSVP first
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true);
SELECT set_config('request.jwt.claims', '{"sub": "22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    WITH beta_members AS (
      SELECT jsonb_agg(id::text) AS m_ids
      FROM public.family_members
      WHERE family_group_id = (SELECT fg_beta FROM _fixture_vars)
    )
    SELECT public.submit_family_rsvp(
      p_event_id := 'haldi',
      p_family_group_id := (SELECT fg_beta FROM _fixture_vars),
      p_status := 'attending',
      p_attendees := (SELECT m_ids FROM beta_members)
    );
  $$,
  '5. Beta submits Haldi RSVP successfully'
);

-- Switch back to Guest Alpha
SELECT set_config('request.jwt.claim.sub', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);

-- 6. Alpha cannot view Beta's RSVP
SELECT is_empty(
  $$
    SELECT * FROM public.rsvps
    WHERE family_group_id = (SELECT fg_beta FROM _fixture_vars)
  $$,
  '6. Guest Alpha cannot view Guest Beta RSVP record (RLS SELECT isolation)'
);

-- 7. Alpha cannot update Beta's RSVP
SELECT lives_ok(
  $$
    UPDATE public.rsvps
    SET status = 'not_attending'
    WHERE family_group_id = (SELECT fg_beta FROM _fixture_vars);
  $$,
  'Guest Alpha update query runs without syntax error'
);

RESET ROLE;
SELECT results_eq(
  $$
    SELECT status FROM public.rsvps
    WHERE family_group_id = (SELECT fg_beta FROM _fixture_vars)
      AND event_id = 'haldi'
  $$,
  $$ VALUES ('attending'::text) $$,
  '7. Guest Beta RSVP status was NOT altered by Guest Alpha (RLS UPDATE isolation)'
);

-- 8. Alpha cannot submit RSVP on behalf of Beta's family group
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    SELECT public.submit_family_rsvp(
      p_event_id := 'wedding',
      p_family_group_id := (SELECT fg_beta FROM _fixture_vars),
      p_status := 'not_attending'
    );
  $$,
  'Only the designated active family manager may submit RSVPs for this family group.',
  '8. Alpha cannot submit RSVP targeting Beta household'
);

-- 9. Alpha cannot submit Beta's member ID in Alpha's own RSVP
SELECT throws_ok(
  $$
    SELECT public.submit_family_rsvp(
      p_event_id := 'haldi',
      p_family_group_id := (SELECT fg_alpha FROM _fixture_vars),
      p_status := 'attending',
      p_attendees := jsonb_build_array(
        (SELECT beta_member_id::text FROM _fixture_vars)
      )
    );
  $$,
  'Selected family member does not belong to your household.',
  '9. Submitting another household member ID is rejected'
);

-- ------------------------------------------------------------------------------
-- PART 3: HOUSEHOLD ID TAMPERING & INITIALIZATION AUDIT
-- ------------------------------------------------------------------------------
-- 10. Alpha cannot change profiles.family_group_id directly to hijack Beta household
SELECT throws_ok(
  $$
    UPDATE public.profiles
    SET family_group_id = (SELECT fg_beta FROM _fixture_vars)
    WHERE id = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  $$,
  '42501',
  NULL,
  '10. Direct alteration of profiles.family_group_id is blocked'
);

-- 11. Alpha cannot call initialize_user_household for Beta (cross-user spoofing blocked)
SELECT throws_ok(
  $$
    SELECT public.initialize_user_household(
      p_user_id := '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      p_full_name := 'Tampered Beta Household'
    );
  $$,
  'Unauthorized: Users can only initialize their own household.',
  '11. initialize_user_household blocks cross-user invocation'
);

-- 12. Calling initialize_user_household for existing self succeeds idempotently
SELECT lives_ok(
  $$
    SELECT public.initialize_user_household(
      p_user_id := '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      p_full_name := 'Self'
    );
  $$,
  '12. Calling initialize_user_household for existing self succeeds idempotently'
);

RESET ROLE;
-- 13. Idempotent call returns identical family_group_id and creates NO duplicate household
SELECT results_eq(
  $$
    SELECT public.initialize_user_household('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa') = (SELECT fg_alpha FROM _fixture_vars)
  $$,
  $$ VALUES (TRUE) $$,
  '13. initialize_user_household returns existing household ID without creating duplicates'
);

SELECT results_eq(
  $$
    SELECT count(*)::integer FROM public.family_groups
    WHERE created_by = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  $$,
  $$ VALUES (1) $$,
  '14. Exactly one household exists for Alpha user (no duplicate households)'
);

-- ------------------------------------------------------------------------------
-- PART 4: PRIVILEGE ESCALATION DEFENSE
-- ------------------------------------------------------------------------------
-- 15. Injected metadata upon signup does NOT grant admin access
RESET ROLE;
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  (
    '66666666-6666-6666-6666-666666666666',
    'attacker_metadata@example.com',
    '{"full_name": "Attacker", "is_admin": true, "is_super_admin": true, "permission_group": "guest_rsvp", "role": "admin"}'::jsonb
  );

SELECT is_empty(
  $$ SELECT * FROM public.admin_users WHERE id = '66666666-6666-6666-6666-666666666666' $$,
  '15. Metadata injection did NOT grant entry in public.admin_users'
);

SELECT is_empty(
  $$ SELECT * FROM public.admin_permissions WHERE admin_id = '66666666-6666-6666-6666-666666666666' $$,
  '16. Metadata injection did NOT grant entry in public.admin_permissions'
);

-- 17. Guest cannot call get_admin_rsvp_report
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.get_admin_rsvp_report() $$,
  'Unauthorized: Requires guest_rsvp permission.',
  '17. Ordinary guest execution of get_admin_rsvp_report is strictly blocked'
);

-- 18. Guest cannot call get_admin_dashboard_metrics
SELECT throws_ok(
  $$ SELECT public.get_admin_dashboard_metrics() $$,
  'Unauthorized: Caller is not an active administrator.',
  '18. Ordinary guest execution of get_admin_dashboard_metrics is strictly blocked'
);

-- 19. Guest cannot call admin_manage_admin_user
SELECT throws_ok(
  $$ SELECT public.admin_manage_admin_user('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', TRUE, ARRAY['guest_rsvp']) $$,
  'Unauthorized: Only the Super Administrator can manage admin roles.',
  '19. Ordinary guest execution of admin_manage_admin_user is strictly blocked'
);

-- 20. Guest cannot insert directly into admin_users (RLS)
SELECT throws_ok(
  $$ INSERT INTO public.admin_users (id, is_super_admin, is_active) VALUES ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', TRUE, TRUE) $$,
  '42501',
  NULL,
  '20. Ordinary guest direct INSERT into admin_users is blocked by RLS'
);

-- ------------------------------------------------------------------------------
-- PART 5: RSVP INTEGRITY & DUPLICATE SUBMISSION PROTECTION
-- ------------------------------------------------------------------------------
-- 21. Re-submitting Haldi RSVP updates existing record (ONE HOUSEHOLD + ONE CEREMONY = ONE RSVP)
SELECT lives_ok(
  $$
    WITH alpha_m AS (
      SELECT jsonb_agg(id::text) AS m_ids
      FROM public.family_members
      WHERE family_group_id = (SELECT fg_alpha FROM _fixture_vars)
    )
    SELECT public.submit_family_rsvp(
      p_event_id := 'haldi',
      p_family_group_id := (SELECT fg_alpha FROM _fixture_vars),
      p_status := 'attending',
      p_attendees := (SELECT m_ids FROM alpha_m),
      p_special_dietary_requests := 'Initial submission'
    );
  $$,
  '21. Alpha submits initial Haldi RSVP'
);

SELECT lives_ok(
  $$
    WITH alpha_m AS (
      SELECT jsonb_agg(id::text) AS m_ids
      FROM public.family_members
      WHERE family_group_id = (SELECT fg_alpha FROM _fixture_vars)
    )
    SELECT public.submit_family_rsvp(
      p_event_id := 'haldi',
      p_family_group_id := (SELECT fg_alpha FROM _fixture_vars),
      p_status := 'attending',
      p_attendees := (SELECT m_ids FROM alpha_m),
      p_special_dietary_requests := 'Updated submission'
    );
  $$,
  'Alpha resubmits Haldi RSVP'
);

RESET ROLE;
SELECT results_eq(
  $$
    SELECT count(*)::integer FROM public.rsvps
    WHERE family_group_id = (SELECT fg_alpha FROM _fixture_vars)
      AND event_id = 'haldi'
  $$,
  $$ VALUES (1) $$,
  '22. Exactly 1 RSVP record exists for (haldi, fg_alpha) - duplicate prevented'
);

SELECT results_eq(
  $$
    SELECT special_dietary_requests FROM public.rsvps
    WHERE family_group_id = (SELECT fg_alpha FROM _fixture_vars)
      AND event_id = 'haldi'
  $$,
  $$ VALUES ('Updated submission'::text) $$,
  '23. RSVP record updated atomically with latest details'
);

-- 24. Duplicate attendee selection within same submission is rejected
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    WITH alpha_m AS (
      SELECT id::text AS m_id
      FROM public.family_members
      WHERE family_group_id = (SELECT fg_alpha FROM _fixture_vars)
      LIMIT 1
    )
    SELECT public.submit_family_rsvp(
      p_event_id := 'mehndi',
      p_family_group_id := (SELECT fg_alpha FROM _fixture_vars),
      p_status := 'attending',
      p_attendees := jsonb_build_array((SELECT m_id FROM alpha_m), (SELECT m_id FROM alpha_m))
    );
  $$,
  'Duplicate family member selection detected in RSVP submission.',
  '24. Duplicate member selection within single RSVP is strictly rejected'
);

-- 25. not_attending requires 0 attendees
SELECT lives_ok(
  $$
    SELECT public.submit_family_rsvp(
      p_event_id := 'wedding',
      p_family_group_id := (SELECT fg_alpha FROM _fixture_vars),
      p_status := 'not_attending',
      p_attendees := '[]'::jsonb
    );
  $$,
  '25. not_attending succeeds without attendees'
);

-- 26. Deadline enforcement: past cutoff rejects RSVP
RESET ROLE;
UPDATE public.events
SET rsvp_deadline_utc = NOW() - INTERVAL '1 minute'
WHERE id = 'reception';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    SELECT public.submit_family_rsvp(
      p_event_id := 'reception',
      p_family_group_id := (SELECT fg_alpha FROM _fixture_vars),
      p_status := 'attending',
      p_attendees := jsonb_build_array(
        (SELECT id::text FROM public.family_members WHERE family_group_id = (SELECT fg_alpha FROM _fixture_vars) LIMIT 1)
      )
    );
  $$,
  'RSVP deadline for this ceremony has permanently passed.',
  '26. Submitting RSVP after cutoff deadline is permanently blocked'
);

RESET ROLE;
UPDATE public.events
SET rsvp_deadline_utc = '2026-11-21 18:29:59+00'
WHERE id = 'reception';

SELECT * FROM finish();
ROLLBACK;
