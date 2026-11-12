-- pgTAP Test: 01_schema_integrity.sql
-- Description: Verifies schema, tables, keys, constraints, and confirmed event seed facts.

BEGIN;
SELECT plan(32);

-- 1. Verify all 15 public tables exist
SELECT has_table('public', 'profiles', 'Table public.profiles exists');
SELECT has_table('public', 'family_groups', 'Table public.family_groups exists');
SELECT has_table('public', 'family_managers', 'Table public.family_managers exists');
SELECT has_table('public', 'access_requests', 'Table public.access_requests exists');
SELECT has_table('public', 'events', 'Table public.events exists');
SELECT has_table('public', 'rsvps', 'Table public.rsvps exists');
SELECT has_table('public', 'attendees', 'Table public.attendees exists');
SELECT has_table('public', 'wishes', 'Table public.wishes exists');
SELECT has_table('public', 'conversations', 'Table public.conversations exists');
SELECT has_table('public', 'conversation_messages', 'Table public.conversation_messages exists');
SELECT has_table('public', 'media_items', 'Table public.media_items exists');
SELECT has_table('public', 'invitation_settings', 'Table public.invitation_settings exists');
SELECT has_table('public', 'admin_users', 'Table public.admin_users exists');
SELECT has_table('public', 'admin_permissions', 'Table public.admin_permissions exists');
SELECT has_table('public', 'admin_notifications', 'Table public.admin_notifications exists');

-- 2. Verify primary keys
SELECT has_pk('public', 'profiles', 'profiles has primary key');
SELECT has_pk('public', 'family_groups', 'family_groups has primary key');
SELECT has_pk('public', 'events', 'events has primary key');
SELECT has_pk('public', 'rsvps', 'rsvps has primary key');
SELECT has_pk('public', 'attendees', 'attendees has primary key');
SELECT has_pk('public', 'wishes', 'wishes has primary key');
SELECT has_pk('public', 'admin_users', 'admin_users has primary key');

-- 3. Verify unique constraints
SELECT results_eq(
  $$ SELECT COUNT(*)::INTEGER FROM pg_indexes WHERE tablename = 'family_managers' AND indexname = 'idx_single_active_family_manager' $$,
  $$ VALUES (1::INTEGER) $$,
  'family_managers has partial unique index for single active manager'
);

SELECT results_eq(
  $$ SELECT COUNT(*)::INTEGER FROM information_schema.table_constraints WHERE table_name = 'rsvps' AND constraint_name = 'uq_event_family_rsvp' $$,
  $$ VALUES (1::INTEGER) $$,
  'rsvps has unique constraint uq_event_family_rsvp'
);

SELECT results_eq(
  $$ SELECT COUNT(*)::INTEGER FROM information_schema.table_constraints WHERE table_name = 'admin_permissions' AND constraint_name = 'uq_admin_permission' $$,
  $$ VALUES (1::INTEGER) $$,
  'admin_permissions has unique constraint uq_admin_permission'
);

-- 4. Verify 4 Confirmed Wedding Events in Seed Data
SELECT results_eq(
  $$ SELECT COUNT(*)::INTEGER FROM public.events $$,
  $$ VALUES (4::INTEGER) $$,
  'Exactly 4 wedding ceremonies seeded'
);

SELECT results_eq(
  $$ SELECT id, ceremony_date::TEXT, start_time_ist::TEXT, venue_name, end_instant FROM public.events WHERE id = 'haldi' $$,
  $$ VALUES ('haldi', '2026-11-19', '09:00:00', 'Groom''s Home', NULL::TIMESTAMPTZ) $$,
  'Haldi ceremony seed data is accurate with NULL end instant'
);

SELECT results_eq(
  $$ SELECT id, ceremony_date::TEXT, start_time_ist::TEXT, venue_name, end_instant FROM public.events WHERE id = 'mehndi' $$,
  $$ VALUES ('mehndi', '2026-11-20', '09:00:00', 'Groom''s Home', NULL::TIMESTAMPTZ) $$,
  'Mehndi ceremony seed data is accurate with NULL end instant'
);

SELECT results_eq(
  $$ SELECT id, ceremony_date::TEXT, start_time_ist::TEXT, venue_name, end_instant FROM public.events WHERE id = 'wedding' $$,
  $$ VALUES ('wedding', '2026-11-21', '23:00:00', 'Bride''s Home', NULL::TIMESTAMPTZ) $$,
  'Wedding ceremony seed data is accurate with NULL end instant'
);

SELECT results_eq(
  $$ SELECT id, ceremony_date::TEXT, start_time_ist::TEXT, venue_name, end_instant FROM public.events WHERE id = 'reception' $$,
  $$ VALUES ('reception', '2026-11-22', '17:00:00', 'Groom''s Home', NULL::TIMESTAMPTZ) $$,
  'Reception ceremony seed data is accurate with NULL end instant'
);

-- 5. Verify zero fake end times across all events
SELECT is_empty(
  $$ SELECT id FROM public.events WHERE end_instant IS NOT NULL $$,
  'All ceremony end instants are strictly NULL'
);

-- 6. Verify default invitation settings seeded
SELECT results_eq(
  $$ SELECT id, is_published FROM public.invitation_settings WHERE id = 'default' $$,
  $$ VALUES ('default', TRUE) $$,
  'Default invitation settings seeded and published'
);

SELECT * FROM finish();
ROLLBACK;
