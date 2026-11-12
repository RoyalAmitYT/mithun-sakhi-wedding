-- ==============================================================================
-- pgTAP Test: 07_access_request_workflow.sql
-- Description: Verifies the access request lifecycle: single pending request
--              constraint, rejection with mandatory reason, resubmission upon
--              rejection, atomic administrative approval with family assignment,
--              active family manager uniqueness, and blocking approved guests
--              from redundant requests.
-- ==============================================================================

BEGIN;
SELECT plan(12);

-- ------------------------------------------------------------------------------
-- 0. TEST FIXTURES SETUP (Superuser)
-- ------------------------------------------------------------------------------
RESET ROLE;

INSERT INTO auth.users (id, email) VALUES
  ('12121212-1212-1212-1212-121212121212', 'ar_guest_1@example.com'),
  ('34343434-3434-3434-3434-343434343434', 'ar_admin_1@example.com')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'AR Test Guest', mobile_number = '+919876543210', is_approved_guest = FALSE, family_group_id = NULL
WHERE id = '12121212-1212-1212-1212-121212121212';

DELETE FROM public.family_managers
WHERE profile_id = '12121212-1212-1212-1212-121212121212';

UPDATE public.profiles
SET full_name = 'AR Test Admin', is_approved_guest = TRUE
WHERE id = '34343434-3434-3434-3434-343434343434';

INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('34343434-3434-3434-3434-343434343434', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = FALSE, is_active = TRUE;

INSERT INTO public.admin_permissions (admin_id, permission_group)
VALUES ('34343434-3434-3434-3434-343434343434', 'guest_rsvp')
ON CONFLICT (admin_id, permission_group) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 1. TEST: GUEST CAN INSERT A PENDING ACCESS REQUEST
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '12121212-1212-1212-1212-121212121212', true);
SELECT set_config('request.jwt.claims', '{"sub": "12121212-1212-1212-1212-121212121212", "role": "authenticated"}', true);

INSERT INTO public.access_requests (id, profile_id, invited_family_name, relationship_to_couple, message, status)
VALUES (
  'e1111111-0000-0000-0000-000000000000',
  '12121212-1212-1212-1212-121212121212',
  'The Sen Family',
  'Cousin of Groom',
  'Looking forward to celebrating with you!',
  'pending'
);

RESET ROLE;
SELECT results_eq(
  $$ SELECT status FROM public.access_requests WHERE id = 'e1111111-0000-0000-0000-000000000000' $$,
  $$ VALUES ('pending') $$,
  'Guest successfully submitted a pending access request'
);

-- ------------------------------------------------------------------------------
-- 2. TEST: GUEST CANNOT SUBMIT DUPLICATE PENDING REQUEST (UNIQUE CONSTRAINT)
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '12121212-1212-1212-1212-121212121212', true);
SELECT set_config('request.jwt.claims', '{"sub": "12121212-1212-1212-1212-121212121212", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    INSERT INTO public.access_requests (id, profile_id, invited_family_name, relationship_to_couple, status)
    VALUES (
      'e2222222-0000-0000-0000-000000000000',
      '12121212-1212-1212-1212-121212121212',
      'The Sen Family Duplicate',
      'Cousin of Groom',
      'pending'
    )
  $$,
  'duplicate key value violates unique constraint "idx_single_pending_access_request"',
  'Guest cannot submit duplicate pending access request'
);

-- ------------------------------------------------------------------------------
-- 3. TEST: UNAUTHORIZED USER CANNOT EXECUTE admin_review_access_request
-- ------------------------------------------------------------------------------
SELECT throws_ok(
  $$ SELECT public.admin_review_access_request('e1111111-0000-0000-0000-000000000000', 'approved') $$,
  'Unauthorized: Only administrators with guest_rsvp permission can review access requests.',
  'Non-admin user cannot execute admin_review_access_request'
);

-- ------------------------------------------------------------------------------
-- 4. TEST: ADMIN REVIEW REJECTS INVALID DECISION VALUE
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '34343434-3434-3434-3434-343434343434', true);
SELECT set_config('request.jwt.claims', '{"sub": "34343434-3434-3434-3434-343434343434", "role": "authenticated"}', true);

SELECT throws_ok(
  $$ SELECT public.admin_review_access_request('e1111111-0000-0000-0000-000000000000', 'maybe') $$,
  'Invalid decision: maybe (must be "approved" or "rejected")',
  'Admin review rejects invalid decision'
);

-- ------------------------------------------------------------------------------
-- 5. TEST: REJECTION WITHOUT REASON THROWS EXCEPTION
-- ------------------------------------------------------------------------------
SELECT throws_ok(
  $$ SELECT public.admin_review_access_request('e1111111-0000-0000-0000-000000000000', 'rejected', '   ') $$,
  'A non-empty rejection reason is mandatory when rejecting an access request.',
  'Rejection requires a non-empty rejection reason'
);

-- ------------------------------------------------------------------------------
-- 6. TEST: ADMIN REJECTS ACCESS REQUEST WITH VALID REASON
-- ------------------------------------------------------------------------------
SELECT lives_ok(
  $$ SELECT public.admin_review_access_request('e1111111-0000-0000-0000-000000000000', 'rejected', 'Name not recognized in guest registry') $$,
  'Admin successfully rejected access request with reason'
);

-- ------------------------------------------------------------------------------
-- 7. TEST: VERIFY STATUS AND REJECTION REASON PERSISTED
-- ------------------------------------------------------------------------------
RESET ROLE;
SELECT results_eq(
  $$ SELECT status, rejection_reason FROM public.access_requests WHERE id = 'e1111111-0000-0000-0000-000000000000' $$,
  $$ VALUES ('rejected', 'Name not recognized in guest registry') $$,
  'Request status transitioned to rejected with reason recorded'
);

-- ------------------------------------------------------------------------------
-- 8. TEST: REJECTED GUEST CAN SUBMIT A NEW ACCESS REQUEST
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '12121212-1212-1212-1212-121212121212', true);
SELECT set_config('request.jwt.claims', '{"sub": "12121212-1212-1212-1212-121212121212", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    INSERT INTO public.access_requests (id, profile_id, invited_family_name, relationship_to_couple, message, status)
    VALUES (
      'e3333333-0000-0000-0000-000000000000',
      '12121212-1212-1212-1212-121212121212',
      'The Sen Family (Corrected)',
      'First Cousin of Groom Mithun',
      'Resubmitting with clarified relationship',
      'pending'
    )
  $$,
  'Rejected guest can submit a new access request'
);

-- ------------------------------------------------------------------------------
-- 9. TEST: ADMIN APPROVES NEW REQUEST WITH NEW FAMILY & ACTIVE MANAGER
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '34343434-3434-3434-3434-343434343434', true);
SELECT set_config('request.jwt.claims', '{"sub": "34343434-3434-3434-3434-343434343434", "role": "authenticated"}', true);

SELECT lives_ok(
  $$
    SELECT public.admin_review_access_request(
      p_request_id := 'e3333333-0000-0000-0000-000000000000',
      p_decision := 'approved',
      p_family_name := 'The Sen Household',
      p_make_family_manager := TRUE
    )
  $$,
  'Admin successfully approved request with new family group and active manager'
);

-- ------------------------------------------------------------------------------
-- 10. TEST: VERIFY GUEST PROFILE IS NOW APPROVED WITH FAMILY ASSIGNED
-- ------------------------------------------------------------------------------
RESET ROLE;
SELECT results_eq(
  $$
    SELECT is_approved_guest, (family_group_id IS NOT NULL)
    FROM public.profiles
    WHERE id = '12121212-1212-1212-1212-121212121212'
  $$,
  $$ VALUES (TRUE, TRUE) $$,
  'Profile is approved with non-null family_group_id'
);

-- ------------------------------------------------------------------------------
-- 11. TEST: VERIFY GUEST IS ACTIVE FAMILY MANAGER
-- ------------------------------------------------------------------------------
SELECT results_eq(
  $$
    SELECT is_active
    FROM public.family_managers
    WHERE profile_id = '12121212-1212-1212-1212-121212121212'
  $$,
  $$ VALUES (TRUE) $$,
  'Guest is recorded as active family manager'
);

-- ------------------------------------------------------------------------------
-- 12. TEST: APPROVED GUEST CANNOT SUBMIT NEW ACCESS REQUEST (TRIGGER GUARD)
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '12121212-1212-1212-1212-121212121212', true);
SELECT set_config('request.jwt.claims', '{"sub": "12121212-1212-1212-1212-121212121212", "role": "authenticated"}', true);

SELECT throws_ok(
  $$
    INSERT INTO public.access_requests (id, profile_id, invited_family_name, relationship_to_couple, status)
    VALUES (
      'e4444444-0000-0000-0000-000000000000',
      '12121212-1212-1212-1212-121212121212',
      'Redundant Request',
      'Friend',
      'pending'
    )
  $$,
  'Guest profile is already approved. Cannot submit new access request.',
  'Trigger blocks already approved guest from submitting access request'
);

-- Finish
RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
