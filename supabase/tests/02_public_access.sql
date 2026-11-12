-- pgTAP Test: 02_public_access.sql
-- Description: Tests anonymous (unauthenticated public) access boundaries and isolation.

BEGIN;
SELECT plan(15);

-- 1. Anonymous role can read published events
SET LOCAL ROLE anon;
SELECT ok(
  (SELECT COUNT(*) FROM public.events WHERE is_published = TRUE) = 4,
  'Anon can read published events'
);

-- 2. Anonymous role CANNOT read unpublished events
RESET ROLE;
INSERT INTO public.events (
  id, slug, title, ceremony_date, start_time_ist, start_instant, venue_name, venue_address, google_maps_url, rsvp_deadline_utc, is_published, display_order
) VALUES (
  'draft-event', 'draft-event', 'Draft Ceremony', '2026-11-23', '10:00:00', '2026-11-23 10:00:00+05:30', 'Venue', 'Address', 'https://maps.google.com', '2026-11-22 18:29:59+00', FALSE, 99
);

SET LOCAL ROLE anon;
SELECT is_empty(
  $$ SELECT id FROM public.events WHERE id = 'draft-event' $$,
  'Anon cannot read unpublished/draft events'
);

-- 3. Anonymous role can read approved wishes, but CANNOT read pending/rejected wishes
RESET ROLE;
INSERT INTO public.wishes (id, author_display_name, wish_text, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Approved Friend', 'Congratulations Mithun & Kabita!', 'approved'),
  ('00000000-0000-0000-0000-000000000002', 'Pending Cousin', 'Wishing you both the best!', 'pending'),
  ('00000000-0000-0000-0000-000000000003', 'Rejected Spam', 'Buy cheap crypto now!', 'rejected');

SET LOCAL ROLE anon;
SELECT results_eq(
  $$ SELECT author_display_name FROM public.wishes WHERE id = '00000000-0000-0000-0000-000000000001' $$,
  $$ VALUES ('Approved Friend') $$,
  'Anon reads only approved wishes'
);

-- 4. Anonymous role can read published media items, but CANNOT read draft media
RESET ROLE;
-- Fixture user for uploaded_by foreign key
INSERT INTO auth.users (id, email)
VALUES ('00000000-0000-0000-0000-000000000099', 'uploader@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.media_items (
  id, media_type, storage_path, category, is_published, download_enabled, uploaded_by
) VALUES (
  '00000000-0000-0000-0000-000000000010', 'photo', 'public/haldi1.jpg', 'haldi', TRUE, TRUE, '00000000-0000-0000-0000-000000000099'
), (
  '00000000-0000-0000-0000-000000000011', 'photo', 'drafts/secret.jpg', 'wedding', FALSE, TRUE, '00000000-0000-0000-0000-000000000099'
);

SET LOCAL ROLE anon;
SELECT results_eq(
  $$ SELECT storage_path FROM public.media_items WHERE id IN ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011') $$,
  $$ VALUES ('public/haldi1.jpg') $$,
  'Anon reads only published media items'
);

-- 5. Anonymous role CANNOT read private tables (permission denied)
SELECT throws_ok(
  $$ SELECT * FROM public.profiles $$,
  'permission denied for table profiles',
  'Anon SELECT on public.profiles is denied'
);

SELECT throws_ok(
  $$ SELECT * FROM public.family_groups $$,
  'permission denied for table family_groups',
  'Anon SELECT on public.family_groups is denied'
);

SELECT throws_ok(
  $$ SELECT * FROM public.family_managers $$,
  'permission denied for table family_managers',
  'Anon SELECT on public.family_managers is denied'
);

SELECT throws_ok(
  $$ SELECT * FROM public.access_requests $$,
  'permission denied for table access_requests',
  'Anon SELECT on public.access_requests is denied'
);

SELECT throws_ok(
  $$ SELECT * FROM public.rsvps $$,
  'permission denied for table rsvps',
  'Anon SELECT on public.rsvps is denied'
);

SELECT throws_ok(
  $$ SELECT * FROM public.attendees $$,
  'permission denied for table attendees',
  'Anon SELECT on public.attendees is denied'
);

SELECT throws_ok(
  $$ SELECT * FROM public.conversations $$,
  'permission denied for table conversations',
  'Anon SELECT on public.conversations is denied'
);

SELECT throws_ok(
  $$ SELECT * FROM public.conversation_messages $$,
  'permission denied for table conversation_messages',
  'Anon SELECT on public.conversation_messages is denied'
);

SELECT throws_ok(
  $$ SELECT * FROM public.admin_users $$,
  'permission denied for table admin_users',
  'Anon SELECT on public.admin_users is denied'
);

SELECT throws_ok(
  $$ SELECT * FROM public.admin_permissions $$,
  'permission denied for table admin_permissions',
  'Anon SELECT on public.admin_permissions is denied'
);

SELECT throws_ok(
  $$ SELECT * FROM public.admin_notifications $$,
  'permission denied for table admin_notifications',
  'Anon SELECT on public.admin_notifications is denied'
);

SELECT * FROM finish();
ROLLBACK;
