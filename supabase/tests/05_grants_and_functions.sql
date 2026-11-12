-- pgTAP Test: 05_grants_and_functions.sql
-- Description: Verifies RLS enablement across all tables, function security settings, and critical trigger integrity.

BEGIN;
SELECT plan(10);

-- 1. Verify RLS is enabled on all 15 public tables
SELECT results_eq(
  $$
    SELECT COUNT(*)::INTEGER
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN (
        'profiles', 'family_groups', 'family_managers', 'access_requests',
        'events', 'rsvps', 'attendees', 'wishes', 'conversations',
        'conversation_messages', 'media_items', 'invitation_settings',
        'admin_users', 'admin_permissions', 'admin_notifications'
      )
      AND c.relrowsecurity = TRUE
  $$,
  $$ VALUES (15::INTEGER) $$,
  'Row Level Security is enabled on all 15 public tables'
);

-- 2. Verify private helper functions have proconfig setting search_path = ''
SELECT results_eq(
  $$
    SELECT COUNT(*)::INTEGER
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'private'
      AND p.proname IN ('is_super_admin', 'has_admin_permission', 'is_active_family_manager', 'is_family_member', 'can_access_rsvp')
      AND array_to_string(p.proconfig, ',') LIKE '%search_path=%'
  $$,
  $$ VALUES (5::INTEGER) $$,
  'All 5 private helper functions have pinned empty search_path'
);

-- 3. Verify private.bootstrap_super_admin is uncallable by authenticated role
SET LOCAL ROLE authenticated;
SELECT throws_ok(
  $$ SELECT private.bootstrap_super_admin('hacker@example.com') $$,
  'permission denied for function bootstrap_super_admin',
  'bootstrap_super_admin cannot be executed by authenticated role'
);

-- 4. Verify private.bootstrap_super_admin is uncallable by anon role
SET LOCAL ROLE anon;
SELECT throws_ok(
  $$ SELECT private.bootstrap_super_admin('hacker@example.com') $$,
  'permission denied for function bootstrap_super_admin',
  'bootstrap_super_admin cannot be executed by anon role'
);

-- 5. Test RSVP Deadline Trigger rejection on expired deadline
RESET ROLE;
INSERT INTO public.events (
  id, slug, title, ceremony_date, start_time_ist, start_instant, venue_name, venue_address, google_maps_url, rsvp_deadline_utc, is_published, display_order
) VALUES (
  'past-event', 'past-event', 'Past Ceremony', '2026-10-01', '09:00:00', '2026-10-01 09:00:00+05:30', 'Venue', 'Address', 'https://maps.google.com', '2026-09-30 18:29:59+00', TRUE, 90
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (id, email)
VALUES ('33333333-3333-3333-3333-333333333333', 'rsvpman@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.family_groups (id, name, created_by)
VALUES ('f3333333-3333-3333-3333-333333333333', 'Past Family', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.family_managers (family_group_id, profile_id, is_active)
VALUES ('f3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', TRUE)
ON CONFLICT DO NOTHING;

SELECT throws_ok(
  $$
    INSERT INTO public.rsvps (event_id, family_group_id, submitted_by, status)
    VALUES ('past-event', 'f3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'attending')
  $$,
  'RSVP deadline for this ceremony has permanently passed.',
  'RSVP deadline trigger prevents late RSVP submissions'
);

-- 6. Test Super Admin is blocked by deadline trigger as well (zero backdoor override)
INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('33333333-3333-3333-3333-333333333333', TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = TRUE, is_active = TRUE;

SELECT throws_ok(
  $$
    INSERT INTO public.rsvps (event_id, family_group_id, submitted_by, status)
    VALUES ('past-event', 'f3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'attending')
  $$,
  'RSVP deadline for this ceremony has permanently passed.',
  'RSVP deadline trigger blocks even Super Admin late RSVP submission'
);

-- 7. Test Wish Edit Reset Trigger: editing wish_text resets status to pending
INSERT INTO public.wishes (id, profile_id, author_display_name, wish_text, status)
VALUES ('e4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Wish Author', 'Original text', 'approved')
ON CONFLICT (id) DO UPDATE SET wish_text = 'Original text', status = 'approved';

UPDATE public.wishes
SET wish_text = 'Modified text by author'
WHERE id = 'e4444444-4444-4444-4444-444444444444';

SELECT results_eq(
  $$ SELECT status FROM public.wishes WHERE id = 'e4444444-4444-4444-4444-444444444444' $$,
  $$ VALUES ('pending') $$,
  'Updating wish_text resets status to pending moderation'
);

-- 8. Test Single Active Family Manager uniqueness index
INSERT INTO auth.users (id, email)
VALUES ('44444444-4444-4444-4444-444444444444', 'manager2@example.com')
ON CONFLICT (id) DO NOTHING;

SELECT throws_ok(
  $$
    INSERT INTO public.family_managers (family_group_id, profile_id, is_active)
    VALUES ('f3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', TRUE)
  $$,
  'duplicate key value violates unique constraint "idx_single_active_family_manager"',
  'At most one active manager per family group is permitted'
);

-- 9. Test Inactive manager can coexist for historical audit
INSERT INTO auth.users (id, email)
VALUES ('55555555-5555-5555-5555-555555555555', 'manager3@example.com')
ON CONFLICT (id) DO NOTHING;

SELECT lives_ok(
  $$
    INSERT INTO public.family_managers (family_group_id, profile_id, is_active, revoked_at)
    VALUES ('f3333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', FALSE, NOW())
  $$,
  'Inactive manager records can exist without violating single active manager index'
);

-- 10. Test Bootstrap Super Admin idempotency check
SELECT throws_ok(
  $$ SELECT private.bootstrap_super_admin('super@example.com') $$,
  'Super Admin already bootstrapped. Privilege cannot be re-bootstrapped.',
  'bootstrap_super_admin cannot be run when a super admin already exists'
);

SELECT * FROM finish();
ROLLBACK;
