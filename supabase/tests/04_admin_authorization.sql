-- pgTAP Test: 04_admin_authorization.sql
-- Description: Tests Super Admin authority, granular admin permission boundaries, and privilege escalation guards.

BEGIN;
SELECT plan(8);

-- Fixture setup under superuser
RESET ROLE;

-- Create Super Admin profile & admin record via auth.users
INSERT INTO auth.users (id, email)
VALUES ('99999999-9999-9999-9999-999999999999', 'super@example.com')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Super Admin'
WHERE id = '99999999-9999-9999-9999-999999999999';

INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('99999999-9999-9999-9999-999999999999', TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = TRUE, is_active = TRUE;

-- Create Photos-only Admin profile & admin record via auth.users
INSERT INTO auth.users (id, email)
VALUES ('88888888-8888-8888-8888-888888888888', 'photo@example.com')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Photo Admin'
WHERE id = '88888888-8888-8888-8888-888888888888';

INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('88888888-8888-8888-8888-888888888888', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = FALSE, is_active = TRUE;

INSERT INTO public.admin_permissions (admin_id, permission_group)
VALUES ('88888888-8888-8888-8888-888888888888', 'photos')
ON CONFLICT (admin_id, permission_group) DO NOTHING;

-- Create Wishes-only Admin profile & admin record via auth.users
INSERT INTO auth.users (id, email)
VALUES ('77777777-7777-7777-7777-777777777777', 'wishes@example.com')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Wishes Admin'
WHERE id = '77777777-7777-7777-7777-777777777777';

INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('77777777-7777-7777-7777-777777777777', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = FALSE, is_active = TRUE;

INSERT INTO public.admin_permissions (admin_id, permission_group)
VALUES ('77777777-7777-7777-7777-777777777777', 'wishes')
ON CONFLICT (admin_id, permission_group) DO NOTHING;

-- Test Wish fixture
INSERT INTO public.wishes (id, author_display_name, wish_text, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Guest A', 'Warm wishes!', 'pending')
ON CONFLICT (id) DO UPDATE SET status = 'pending';

-- 1. Test Super Admin can grant permissions to admins
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '99999999-9999-9999-9999-999999999999', true);
SELECT set_config('request.jwt.claims', '{"sub": "99999999-9999-9999-9999-999999999999", "role": "authenticated"}', true);

SELECT lives_ok(
  $$ INSERT INTO public.admin_permissions (admin_id, permission_group) VALUES ('77777777-7777-7777-7777-777777777777', 'questions') $$,
  'Super Admin can grant permissions to admins'
);

-- 2. Switch to Photo Admin: Can publish/manage media
SELECT set_config('request.jwt.claim.sub', '88888888-8888-8888-8888-888888888888', true);
SELECT set_config('request.jwt.claims', '{"sub": "88888888-8888-8888-8888-888888888888", "role": "authenticated"}', true);

SELECT lives_ok(
  $$ INSERT INTO public.media_items (media_type, storage_path, category, is_published, download_enabled, uploaded_by)
     VALUES ('photo', 'gallery/pic1.jpg', 'wedding', TRUE, TRUE, '88888888-8888-8888-8888-888888888888') $$,
  'Photo Admin can manage media_items'
);

-- 3. Photo Admin CANNOT grant themselves 'guest_rsvp' or any permission
SELECT throws_ok(
  $$ INSERT INTO public.admin_permissions (admin_id, permission_group) VALUES ('88888888-8888-8888-8888-888888888888', 'guest_rsvp') $$,
  'new row violates row-level security policy for table "admin_permissions"',
  'Photo Admin cannot escalate own permissions'
);

-- 4. Photo Admin CANNOT moderate wishes
UPDATE public.wishes SET status = 'approved' WHERE id = '00000000-0000-0000-0000-000000000001';
RESET ROLE;
SELECT results_eq(
  $$ SELECT status FROM public.wishes WHERE id = '00000000-0000-0000-0000-000000000001' $$,
  $$ VALUES ('pending') $$,
  'Photo Admin cannot approve wishes (update rejected by RLS)'
);

-- 5. Switch to Wishes Admin: Can moderate wishes
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '77777777-7777-7777-7777-777777777777', true);
SELECT set_config('request.jwt.claims', '{"sub": "77777777-7777-7777-7777-777777777777", "role": "authenticated"}', true);

UPDATE public.wishes SET status = 'approved', moderated_by = '77777777-7777-7777-7777-777777777777', moderated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001';

RESET ROLE;
SELECT results_eq(
  $$ SELECT status FROM public.wishes WHERE id = '00000000-0000-0000-0000-000000000001' $$,
  $$ VALUES ('approved') $$,
  'Wishes Admin successfully approved wish'
);

-- 6. Wishes Admin CANNOT insert or manage media items
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '77777777-7777-7777-7777-777777777777', true);
SELECT set_config('request.jwt.claims', '{"sub": "77777777-7777-7777-7777-777777777777", "role": "authenticated"}', true);

SELECT throws_ok(
  $$ INSERT INTO public.media_items (media_type, storage_path, category, is_published, download_enabled, uploaded_by)
     VALUES ('photo', 'secret.jpg', 'portraits', TRUE, TRUE, '77777777-7777-7777-7777-777777777777') $$,
  'new row violates row-level security policy for table "media_items"',
  'Wishes Admin cannot manage media_items'
);

-- 7. Notification scoping: Create notifications for photos and wishes
RESET ROLE;
INSERT INTO public.admin_notifications (permission_group, title, message)
VALUES
  ('photos', 'New Photo Draft', 'A new photo was uploaded'),
  ('wishes', 'New Wish Pending', 'A new guest wish is pending');

-- 8. Switch to Photo Admin: Sees only photo notifications
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '88888888-8888-8888-8888-888888888888', true);
SELECT set_config('request.jwt.claims', '{"sub": "88888888-8888-8888-8888-888888888888", "role": "authenticated"}', true);

SELECT results_eq(
  $$ SELECT permission_group FROM public.admin_notifications $$,
  $$ VALUES ('photos') $$,
  'Photo Admin sees only photo notifications'
);

-- 9. Switch to Wishes Admin: Sees only wishes notifications
SELECT set_config('request.jwt.claim.sub', '77777777-7777-7777-7777-777777777777', true);
SELECT set_config('request.jwt.claims', '{"sub": "77777777-7777-7777-7777-777777777777", "role": "authenticated"}', true);

SELECT results_eq(
  $$ SELECT permission_group FROM public.admin_notifications $$,
  $$ VALUES ('wishes') $$,
  'Wishes Admin sees only wishes notifications'
);

SELECT * FROM finish();
ROLLBACK;
