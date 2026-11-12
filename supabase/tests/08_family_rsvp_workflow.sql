-- ==============================================================================
-- pgTAP Test: 08_family_rsvp_workflow.sql
-- Description: Verifies the P-09 Family RSVP Engine:
--   1. Active family manager submission with valid attendees.
--   2. Strict attendee validation (reject empty list, blank names, invalid categories).
--   3. Automatic attendee purging on status change to 'not_attending' or 'not_sure'.
--   4. Authorization guards (non-manager family member, unapproved guest, cross-family manager).
--   5. Strict deadline locking across both rsvps and attendees (INSERT, UPDATE, DELETE).
--   6. Admin deadline override block (zero backdoor late edits).
--   7. Admin reporting RPC authorization and accurate derived response calculations.
-- ==============================================================================

BEGIN;
SELECT plan(17);

-- ------------------------------------------------------------------------------
-- 0. TEST FIXTURES SETUP (Superuser)
-- ------------------------------------------------------------------------------
RESET ROLE;

-- A. Create test user accounts
INSERT INTO auth.users (id, email) VALUES
  ('11111111-aaaa-bbbb-cccc-111111111111', 'rsvp_mgr_a@example.com'),
  ('22222222-aaaa-bbbb-cccc-222222222222', 'rsvp_member_a@example.com'),
  ('33333333-aaaa-bbbb-cccc-333333333333', 'rsvp_mgr_b@example.com'),
  ('44444444-aaaa-bbbb-cccc-444444444444', 'rsvp_unapproved@example.com'),
  ('55555555-aaaa-bbbb-cccc-555555555555', 'rsvp_admin@example.com')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- B. Create family groups
INSERT INTO public.family_groups (id, name) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'Roy Family Unit'),
  ('f2222222-2222-2222-2222-222222222222', 'Das Family Unit')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- C. Configure profiles
UPDATE public.profiles
SET full_name = 'Subhash Roy', mobile_number = '+919876500001', is_approved_guest = TRUE, family_group_id = 'f1111111-1111-1111-1111-111111111111'
WHERE id = '11111111-aaaa-bbbb-cccc-111111111111';

UPDATE public.profiles
SET full_name = 'Mitali Roy', mobile_number = '+919876500002', is_approved_guest = TRUE, family_group_id = 'f1111111-1111-1111-1111-111111111111'
WHERE id = '22222222-aaaa-bbbb-cccc-222222222222';

UPDATE public.profiles
SET full_name = 'Animesh Das', mobile_number = '+919876500003', is_approved_guest = TRUE, family_group_id = 'f2222222-2222-2222-2222-222222222222'
WHERE id = '33333333-aaaa-bbbb-cccc-333333333333';

UPDATE public.profiles
SET full_name = 'Stranger User', mobile_number = '+919876500004', is_approved_guest = FALSE, family_group_id = NULL
WHERE id = '44444444-aaaa-bbbb-cccc-444444444444';

UPDATE public.profiles
SET full_name = 'RSVP Admin User', mobile_number = '+919876500005', is_approved_guest = TRUE, family_group_id = NULL
WHERE id = '55555555-aaaa-bbbb-cccc-555555555555';

-- D. Assign active family managers
DELETE FROM public.family_managers WHERE family_group_id IN ('f1111111-1111-1111-1111-111111111111', 'f2222222-2222-2222-2222-222222222222');
INSERT INTO public.family_managers (family_group_id, profile_id, is_active)
VALUES
  ('f1111111-1111-1111-1111-111111111111', '11111111-aaaa-bbbb-cccc-111111111111', TRUE),
  ('f2222222-2222-2222-2222-222222222222', '33333333-aaaa-bbbb-cccc-333333333333', TRUE);

-- E. Configure admin permissions
INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('55555555-aaaa-bbbb-cccc-555555555555', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = FALSE, is_active = TRUE;

INSERT INTO public.admin_permissions (admin_id, permission_group)
VALUES ('55555555-aaaa-bbbb-cccc-555555555555', 'guest_rsvp')
ON CONFLICT (admin_id, permission_group) DO NOTHING;

-- F. Create a past-deadline ceremony fixture to test strict deadline locking
INSERT INTO public.events (
  id, slug, title, ceremony_date, start_time_ist, start_instant, rsvp_deadline_utc, is_published, display_order, venue_name, venue_address, google_maps_url
) VALUES (
  'past_ceremony',
  'past-ceremony',
  'Past Ceremony Test',
  '2026-11-15',
  '10:00:00',
  '2026-11-15 10:00:00+05:30',
  NOW() + INTERVAL '2 hours',
  TRUE,
  99,
  'Test Hall',
  'Purulia',
  'https://maps.google.com'
) ON CONFLICT (id) DO UPDATE SET rsvp_deadline_utc = NOW() + INTERVAL '2 hours';

-- Pre-populate an RSVP row before the deadline closes
INSERT INTO public.rsvps (id, event_id, family_group_id, submitted_by, status)
VALUES (
  'e9999999-0000-0000-0000-000000000000',
  'past_ceremony',
  'f2222222-2222-2222-2222-222222222222',
  '33333333-aaaa-bbbb-cccc-333333333333',
  'attending'
) ON CONFLICT (event_id, family_group_id) DO UPDATE SET status = 'attending';

-- Now transition ceremony deadline into the past
UPDATE public.events
SET rsvp_deadline_utc = NOW() - INTERVAL '2 hours'
WHERE id = 'past_ceremony';

-- ------------------------------------------------------------------------------
-- 1. TEST: ACTIVE MANAGER SUBMITS 'attending' WITH VALID ATTENDEES (PRE-DEADLINE)
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-aaaa-bbbb-cccc-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-aaaa-bbbb-cccc-111111111111", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    SELECT public.submit_family_rsvp(
      'haldi',
      'f1111111-1111-1111-1111-111111111111',
      'attending',
      '[{"full_name": "Subhash Roy", "age_category": "adult"}, {"full_name": "Mitali Roy", "age_category": "adult"}, {"full_name": "Little Roy", "age_category": "child"}]'::jsonb,
      'Reaching Purulia by Rupashi Bangla Express at 8 AM',
      'Strictly vegetarian for Haldi'
    );
  $$,
  'Active manager successfully submits attending RSVP with 3 attendees'
);

-- ------------------------------------------------------------------------------
-- 2. TEST: VERIFY DATABASE PERSISTENCE AND ATTENDEE HEADCOUNT DERIVATION
-- ------------------------------------------------------------------------------
RESET ROLE;
SELECT results_eq(
  $$
    SELECT r.status, COUNT(a.id)::int
    FROM public.rsvps r
    JOIN public.attendees a ON a.rsvp_id = r.id
    WHERE r.event_id = 'haldi' AND r.family_group_id = 'f1111111-1111-1111-1111-111111111111'
    GROUP BY r.status
  $$,
  $$ VALUES ('attending', 3) $$,
  'RSVP status is attending and headcount is accurately 3 from child attendee records'
);

-- ------------------------------------------------------------------------------
-- 3. TEST: ATTENDING WITH ZERO ATTENDEES IS REJECTED
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-aaaa-bbbb-cccc-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-aaaa-bbbb-cccc-111111111111", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    SELECT public.submit_family_rsvp(
      'mehndi',
      'f1111111-1111-1111-1111-111111111111',
      'attending',
      '[]'::jsonb
    );
  $$,
  'At least one attendee is required when attending.',
  'Attending RSVP with zero attendees is rejected'
);

-- ------------------------------------------------------------------------------
-- 4. TEST: ATTENDEE WITH BLANK NAME IS REJECTED
-- ------------------------------------------------------------------------------
SELECT throws_ok(
  $$
    SELECT public.submit_family_rsvp(
      'mehndi',
      'f1111111-1111-1111-1111-111111111111',
      'attending',
      '[{"full_name": "   ", "age_category": "adult"}]'::jsonb
    );
  $$,
  'Attendee full name cannot be blank.',
  'Attendee with blank name is rejected'
);

-- ------------------------------------------------------------------------------
-- 5. TEST: ATTENDEE WITH INVALID AGE CATEGORY IS REJECTED
-- ------------------------------------------------------------------------------
SELECT throws_ok(
  $$
    SELECT public.submit_family_rsvp(
      'mehndi',
      'f1111111-1111-1111-1111-111111111111',
      'attending',
      '[{"full_name": "Valid Name", "age_category": "teenager"}]'::jsonb
    );
  $$,
  'Invalid age category: teenager. Must be adult, child, or infant.',
  'Attendee with invalid age category is rejected'
);

-- ------------------------------------------------------------------------------
-- 6. TEST: SWITCHING TO 'not_attending' AUTOMATICALLY PURGES ATTENDEES
-- ------------------------------------------------------------------------------
SELECT lives_ok(
  $$
    SELECT public.submit_family_rsvp(
      'haldi',
      'f1111111-1111-1111-1111-111111111111',
      'not_attending',
      '[{"full_name": "Should Be Ignored", "age_category": "adult"}]'::jsonb
    );
  $$,
  'Active manager switches Haldi to not_attending'
);

RESET ROLE;
SELECT results_eq(
  $$
    SELECT r.status, COUNT(a.id)::int
    FROM public.rsvps r
    LEFT JOIN public.attendees a ON a.rsvp_id = r.id
    WHERE r.event_id = 'haldi' AND r.family_group_id = 'f1111111-1111-1111-1111-111111111111'
    GROUP BY r.status
  $$,
  $$ VALUES ('not_attending', 0) $$,
  'Switching to not_attending successfully purged all child attendee records'
);

-- ------------------------------------------------------------------------------
-- 7. TEST: APPROVED NON-MANAGER MEMBER CANNOT SUBMIT RSVP
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '22222222-aaaa-bbbb-cccc-222222222222', true);
SELECT set_config('request.jwt.claims', '{"sub": "22222222-aaaa-bbbb-cccc-222222222222", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    SELECT public.submit_family_rsvp(
      'wedding',
      'f1111111-1111-1111-1111-111111111111',
      'not_sure'
    );
  $$,
  'Only the designated active family manager may submit RSVPs for this family group.',
  'Non-manager family member cannot submit family RSVP'
);

-- ------------------------------------------------------------------------------
-- 8. TEST: UNAPPROVED GUEST CANNOT SUBMIT RSVP
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', '44444444-aaaa-bbbb-cccc-444444444444', true);
SELECT set_config('request.jwt.claims', '{"sub": "44444444-aaaa-bbbb-cccc-444444444444", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    SELECT public.submit_family_rsvp(
      'wedding',
      'f1111111-1111-1111-1111-111111111111',
      'not_sure'
    );
  $$,
  'Caller is not an approved wedding guest.',
  'Unapproved guest cannot submit family RSVP'
);

-- ------------------------------------------------------------------------------
-- 9. TEST: MANAGER OF FAMILY B CANNOT SUBMIT FOR FAMILY A
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', '33333333-aaaa-bbbb-cccc-333333333333', true);
SELECT set_config('request.jwt.claims', '{"sub": "33333333-aaaa-bbbb-cccc-333333333333", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    SELECT public.submit_family_rsvp(
      'wedding',
      'f1111111-1111-1111-1111-111111111111',
      'attending',
      '[{"full_name": "Intruder", "age_category": "adult"}]'::jsonb
    );
  $$,
  'Only the designated active family manager may submit RSVPs for this family group.',
  'Manager of Family B cannot submit RSVP for Family A'
);

-- ------------------------------------------------------------------------------
-- 10. TEST: SUBMISSION FOR CEREMONY PAST DEADLINE IS REJECTED
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', '33333333-aaaa-bbbb-cccc-333333333333', true);
SELECT set_config('request.jwt.claims', '{"sub": "33333333-aaaa-bbbb-cccc-333333333333", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    SELECT public.submit_family_rsvp(
      'past_ceremony',
      'f2222222-2222-2222-2222-222222222222',
      'attending',
      '[{"full_name": "Late Guest", "age_category": "adult"}]'::jsonb
    );
  $$,
  'RSVP deadline for this ceremony has permanently passed.',
  'Submission for ceremony past deadline is rejected'
);

-- ------------------------------------------------------------------------------
-- 11. TEST: DIRECT ATTENDEE MUTATION PAST DEADLINE IS BLOCKED BY TRIGGER
-- ------------------------------------------------------------------------------
RESET ROLE;

SELECT throws_ok(
  $$
    INSERT INTO public.attendees (rsvp_id, full_name, age_category)
    VALUES ('e9999999-0000-0000-0000-000000000000', 'Bypassed Guest', 'adult');
  $$,
  'RSVP deadline for this ceremony has permanently passed.',
  'Direct attendee insert after ceremony deadline is blocked by trigger'
);

-- ------------------------------------------------------------------------------
-- 12. TEST: DIRECT RSVP UPDATE PAST DEADLINE IS BLOCKED BY TRIGGER
-- ------------------------------------------------------------------------------
SELECT throws_ok(
  $$
    UPDATE public.rsvps
    SET status = 'not_attending'
    WHERE id = 'e9999999-0000-0000-0000-000000000000';
  $$,
  'RSVP deadline for this ceremony has permanently passed.',
  'Direct RSVP update after ceremony deadline is blocked by trigger'
);

-- ------------------------------------------------------------------------------
-- 13. TEST: DIRECT RSVP DELETE PAST DEADLINE IS BLOCKED BY TRIGGER
-- ------------------------------------------------------------------------------
SELECT throws_ok(
  $$
    DELETE FROM public.rsvps
    WHERE id = 'e9999999-0000-0000-0000-000000000000';
  $$,
  'RSVP deadline for this ceremony has permanently passed.',
  'Direct RSVP delete after ceremony deadline is blocked by trigger'
);

-- ------------------------------------------------------------------------------
-- 14. TEST: DATABASE SUPERUSER / ADMIN CANNOT OVERRIDE DEADLINE (ZERO BACKDOOR LATE EDITS)
-- ------------------------------------------------------------------------------
RESET ROLE;
SELECT throws_ok(
  $$
    UPDATE public.rsvps
    SET status = 'not_sure'
    WHERE id = 'e9999999-0000-0000-0000-000000000000';
  $$,
  'RSVP deadline for this ceremony has permanently passed.',
  'Database superuser/admin cannot bypass deadline lock (zero backdoor override)'
);

-- ------------------------------------------------------------------------------
-- 15. TEST: NON-ADMIN USER CANNOT EXECUTE get_admin_rsvp_report
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', '11111111-aaaa-bbbb-cccc-111111111111', true);
SELECT set_config('request.jwt.claims', '{"sub": "11111111-aaaa-bbbb-cccc-111111111111", "role": "authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.get_admin_rsvp_report(); $$,
  'Unauthorized: Requires guest_rsvp permission.',
  'Non-admin guest cannot access get_admin_rsvp_report'
);

-- ------------------------------------------------------------------------------
-- 16. TEST: ADMIN CAN EXECUTE get_admin_rsvp_report WITH ACCURATE DERIVED DATA
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', '55555555-aaaa-bbbb-cccc-555555555555', true);
SELECT set_config('request.jwt.claims', '{"sub": "55555555-aaaa-bbbb-cccc-555555555555", "role": "authenticated"}', true);

SELECT is(
  (public.get_admin_rsvp_report() -> 'events_summary' -> 0 ->> 'event_id'),
  'haldi',
  'Admin successfully retrieves report with structured ceremony summaries'
);

ROLLBACK;
