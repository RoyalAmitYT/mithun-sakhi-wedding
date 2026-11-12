-- pgTAP Test: 11_media_manager_and_gallery.sql
-- Description: Tests media manager workflows, private draft isolation, public gallery RPC, download toggle, and photos permission boundaries.

BEGIN;
SELECT plan(19);

RESET ROLE;

-- ------------------------------------------------------------------------------
-- 1. FIXTURE SETUP
-- ------------------------------------------------------------------------------
DELETE FROM auth.users WHERE email IN (
  'super_pgtap_media@wedding.local',
  'photo_pgtap_admin@wedding.local',
  'wishes_pgtap_admin@wedding.local',
  'guest_pgtap_media@wedding.local'
);

-- 1.1 Super Admin (mithun@wedding.local)
INSERT INTO auth.users (id, email)
VALUES ('99999999-9999-9999-9999-999999999999', 'super_pgtap_media@wedding.local')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Mithun Gorain'
WHERE id = '99999999-9999-9999-9999-999999999999';

INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('99999999-9999-9999-9999-999999999999', TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = TRUE, is_active = TRUE;

-- 1.2 Photos Admin
INSERT INTO auth.users (id, email)
VALUES ('88888888-8888-8888-8888-888888888888', 'photo_pgtap_admin@wedding.local')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Photo Coordinator'
WHERE id = '88888888-8888-8888-8888-888888888888';

INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('88888888-8888-8888-8888-888888888888', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = FALSE, is_active = TRUE;

DELETE FROM public.admin_permissions WHERE admin_id = '88888888-8888-8888-8888-888888888888';
INSERT INTO public.admin_permissions (admin_id, permission_group)
VALUES ('88888888-8888-8888-8888-888888888888', 'photos');

-- 1.3 Wishes-only Admin
INSERT INTO auth.users (id, email)
VALUES ('77777777-7777-7777-7777-777777777777', 'wishes_pgtap_admin@wedding.local')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Wishes Coordinator'
WHERE id = '77777777-7777-7777-7777-777777777777';

INSERT INTO public.admin_users (id, is_super_admin, is_active)
VALUES ('77777777-7777-7777-7777-777777777777', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET is_super_admin = FALSE, is_active = TRUE;

DELETE FROM public.admin_permissions WHERE admin_id = '77777777-7777-7777-7777-777777777777';
INSERT INTO public.admin_permissions (admin_id, permission_group)
VALUES ('77777777-7777-7777-7777-777777777777', 'wishes');

-- 1.4 Regular Guest
INSERT INTO auth.users (id, email)
VALUES ('66666666-6666-6666-6666-666666666666', 'guest_pgtap_media@wedding.local')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

UPDATE public.profiles
SET full_name = 'Regular Guest'
WHERE id = '66666666-6666-6666-6666-666666666666';

DELETE FROM public.admin_users WHERE id = '66666666-6666-6666-6666-666666666666';

-- ------------------------------------------------------------------------------
-- 2. SCHEMA & CONSTRAINT INTEGRITY
-- ------------------------------------------------------------------------------
-- 2.1 Verify new metadata columns exist
SELECT has_column('public', 'media_items', 'file_name', 'media_items has file_name');
SELECT has_column('public', 'media_items', 'file_size_bytes', 'media_items has file_size_bytes');
SELECT has_column('public', 'media_items', 'mime_type', 'media_items has mime_type');
SELECT has_column('public', 'media_items', 'thumbnail_path', 'media_items has thumbnail_path');

-- 2.2 Verify constraint chk_media_payload rejects photo without storage_path
SELECT throws_ok(
  $$
    INSERT INTO public.media_items (media_type, category, uploaded_by)
    VALUES ('photo', 'haldi', '88888888-8888-8888-8888-888888888888');
  $$,
  'new row for relation "media_items" violates check constraint "chk_media_payload"',
  'Constraint chk_media_payload rejects photo with null storage_path'
);

-- 2.3 Verify constraint chk_media_payload rejects video without youtube_url
SELECT throws_ok(
  $$
    INSERT INTO public.media_items (media_type, category, uploaded_by)
    VALUES ('video', 'haldi', '88888888-8888-8888-8888-888888888888');
  $$,
  'new row for relation "media_items" violates check constraint "chk_media_payload"',
  'Constraint chk_media_payload rejects video with null youtube_url'
);

-- ------------------------------------------------------------------------------
-- 3. PHOTOS ADMIN RPC WORKFLOWS
-- ------------------------------------------------------------------------------
-- Act as Photos Admin
SET LOCAL "request.jwt.claim.sub" = '88888888-8888-8888-8888-888888888888';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL ROLE authenticated;

-- 3.1 Create draft photo item
CREATE TEMP TABLE t_created_photo AS
SELECT public.admin_create_media_item(
  p_media_type := 'photo',
  p_storage_path := '/uploads/media/test_draft.jpg',
  p_category := 'haldi',
  p_caption := 'Auspicious Gaye Holud turmeric ceremony',
  p_is_published := FALSE,
  p_download_enabled := TRUE,
  p_display_order := 1,
  p_file_name := 'test_draft.jpg',
  p_file_size_bytes := 1048576,
  p_mime_type := 'image/jpeg'
) AS item;

SELECT is(
  (SELECT (item->>'is_published')::boolean FROM t_created_photo),
  FALSE,
  '3.1 Photo Admin successfully creates draft photo item with is_published = false'
);

-- 3.2 Create published video item
CREATE TEMP TABLE t_created_video AS
SELECT public.admin_create_media_item(
  p_media_type := 'video',
  p_youtube_url := 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  p_category := 'wedding',
  p_caption := 'Vedic Vows & Saat Phere',
  p_is_published := TRUE,
  p_download_enabled := FALSE,
  p_display_order := 2
) AS item;

SELECT is(
  (SELECT (item->>'is_published')::boolean FROM t_created_video),
  TRUE,
  '3.2 Photo Admin successfully creates published video item'
);

-- 3.3 Photo Admin retrieves all media (including drafts)
SELECT is(
  (SELECT jsonb_array_length(public.admin_get_all_media())),
  2,
  '3.3 Photo Admin retrieves both draft and published items via admin_get_all_media'
);

-- 3.4 Toggle publication status
SELECT is(
  (SELECT (public.admin_toggle_media_published((SELECT (item->>'id')::uuid FROM t_created_photo))->>'is_published')::boolean),
  TRUE,
  '3.4 Photo Admin successfully toggles draft photo to published'
);

-- 3.5 Toggle download status
SELECT is(
  (SELECT (public.admin_toggle_media_download((SELECT (item->>'id')::uuid FROM t_created_photo))->>'download_enabled')::boolean),
  FALSE,
  '3.5 Photo Admin successfully toggles download_enabled to false'
);

-- ------------------------------------------------------------------------------
-- 4. PUBLIC GALLERY ISOLATION (ANON ROLE)
-- ------------------------------------------------------------------------------
-- Revert photo to draft to test public isolation
SELECT public.admin_toggle_media_published((SELECT (item->>'id')::uuid FROM t_created_photo));

-- Switch to anon role
SET LOCAL "request.jwt.claim.sub" = '';
SET LOCAL "request.jwt.claim.role" = 'anon';
SET LOCAL ROLE anon;

-- 4.1 Anonymous visitor calling get_published_media sees ONLY published items
SELECT is(
  (SELECT jsonb_array_length(public.get_published_media())),
  1,
  '4.1 Anonymous visitor sees only published items (draft photo strictly excluded)'
);

-- 4.2 Verify public payload does NOT leak uploaded_by
SELECT is(
  (SELECT (public.get_published_media()->0) ? 'uploaded_by'),
  FALSE,
  '4.2 Public get_published_media strictly omits uploaded_by foreign key'
);

-- 4.3 Filter by category works accurately
SELECT is(
  (SELECT jsonb_array_length(public.get_published_media('wedding'))),
  1,
  '4.3 Anonymous visitor can filter published media by category'
);

SELECT is(
  (SELECT jsonb_array_length(public.get_published_media('haldi'))),
  0,
  '4.4 Anonymous visitor sees 0 items for category with only draft items'
);

-- ------------------------------------------------------------------------------
-- 5. PERMISSION BOUNDARIES & RESTRICTIONS
-- ------------------------------------------------------------------------------
-- 5.1 Anonymous visitor CANNOT call admin_get_all_media
SELECT throws_ok(
  $$ SELECT public.admin_get_all_media() $$,
  'Authentication required.',
  '5.1 Anonymous visitor cannot execute admin_get_all_media'
);

-- Switch to Wishes Admin (lacks photos permission)
SET LOCAL "request.jwt.claim.sub" = '77777777-7777-7777-7777-777777777777';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL ROLE authenticated;

-- 5.2 Wishes Admin CANNOT call admin_get_all_media
SELECT throws_ok(
  $$ SELECT public.admin_get_all_media() $$,
  'Unauthorized: Caller lacks photos permission.',
  '5.2 Wishes Admin cannot execute admin_get_all_media (42501)'
);

-- 5.3 Wishes Admin CANNOT create media item
SELECT throws_ok(
  $$
    SELECT public.admin_create_media_item(
      p_media_type := 'photo',
      p_storage_path := '/uploads/test.jpg',
      p_category := 'wedding'
    );
  $$,
  'Unauthorized: Caller lacks photos permission.',
  '5.3 Wishes Admin cannot execute admin_create_media_item'
);

-- 5.4 Wishes Admin dashboard metrics does NOT leak photos_metrics
SELECT is(
  (SELECT public.get_admin_dashboard_metrics() ? 'photos_metrics'),
  FALSE,
  '5.4 Wishes Admin dashboard metrics does not contain photos_metrics'
);

ROLLBACK;
