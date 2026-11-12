-- =============================================================================
-- Migration: 20261102000016_system_simplification.sql
-- Project:   Mithun & Sakhi Wedding Website (wsfbvpvymwjyzxllxpvj)
-- Created:   2026-11-02
-- Depends:   000001 – 000015 (already applied; do NOT modify those files)
--
-- Summary of changes:
--   1.  media_items.category CHECK — add 'others' value
--   2.  wishes.source_type column — new TEXT NOT NULL DEFAULT 'guest_submission'
--   3.  handle_wish_submission() trigger — auto-approve + source_type handling
--   4.  submit_public_wish() RPC — set status = 'approved', add source_type
--   5.  get_published_media() RPC — allow 'others' category
--   6.  get_public_wishes() RPC — public wall, approved wishes only
--   7.  get_admin_wishes() RPC — admin-only, all wishes + source_type
--   8.  admin_delete_wish() RPC — admin-only permanent deletion
--   9.  get_admin_dashboard_metrics() RPC — full rewrite with public_rsvps
--  10.  storage.objects RLS policies for wedding-media bucket
--  11.  Idempotent seed of host-curated wishes
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Add 'others' to media_items.category CHECK constraint
-- ---------------------------------------------------------------------------

-- Drop the old constraint (name may vary; use IF EXISTS for safety)
ALTER TABLE public.media_items
  DROP CONSTRAINT IF EXISTS media_items_category_check;

-- Re-add with 'others' included
ALTER TABLE public.media_items
  ADD CONSTRAINT media_items_category_check
  CHECK (category IN ('haldi', 'mehndi', 'wedding', 'reception', 'portraits', 'others'));


-- ---------------------------------------------------------------------------
-- 2. Add source_type column to public.wishes
-- ---------------------------------------------------------------------------

ALTER TABLE public.wishes
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'guest_submission'
  CHECK (source_type IN ('guest_submission', 'host_curated'));


-- ---------------------------------------------------------------------------
-- 3. Update handle_wish_submission() trigger function
--    - Auto-approve all new submissions (status = 'approved')
--    - Preserve source_type = 'host_curated' when already set; otherwise
--      default to 'guest_submission'
--    - All existing security checks (cutoff, sanitisation, etc.) are kept
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_wish_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cutoff TIMESTAMPTZ;
  v_sanitised_name TEXT;
  v_sanitised_text TEXT;
BEGIN
  -- ----------------------------------------------------------------
  -- Cutoff check — reject submissions after the configured deadline
  -- ----------------------------------------------------------------
  SELECT wish_submission_cutoff
  INTO v_cutoff
  FROM public.site_settings
  LIMIT 1;

  IF v_cutoff IS NOT NULL AND NOW() > v_cutoff THEN
    RAISE EXCEPTION 'Wish submissions are closed.' USING ERRCODE = 'P0001';
  END IF;

  -- ----------------------------------------------------------------
  -- Input sanitisation — strip leading/trailing whitespace
  -- ----------------------------------------------------------------
  v_sanitised_name := TRIM(NEW.author_display_name);
  v_sanitised_text := TRIM(NEW.wish_text);

  -- ----------------------------------------------------------------
  -- Length validation
  -- ----------------------------------------------------------------
  IF LENGTH(v_sanitised_name) < 2 OR LENGTH(v_sanitised_name) > 100 THEN
    RAISE EXCEPTION 'Author display name must be between 2 and 100 characters.' USING ERRCODE = 'P0001';
  END IF;

  IF LENGTH(v_sanitised_text) < 10 OR LENGTH(v_sanitised_text) > 1000 THEN
    RAISE EXCEPTION 'Wish text must be between 10 and 1000 characters.' USING ERRCODE = 'P0001';
  END IF;

  NEW.author_display_name := v_sanitised_name;
  NEW.wish_text            := v_sanitised_text;

  -- ----------------------------------------------------------------
  -- Auto-approve all new submissions
  -- ----------------------------------------------------------------
  NEW.status := 'approved';

  -- ----------------------------------------------------------------
  -- source_type — preserve 'host_curated' if explicitly set,
  -- otherwise always tag as 'guest_submission'
  -- ----------------------------------------------------------------
  IF NEW.source_type IS DISTINCT FROM 'host_curated' THEN
    NEW.source_type := 'guest_submission';
  END IF;

  RETURN NEW;
END;
$$;


-- ---------------------------------------------------------------------------
-- 4. Update submit_public_wish() RPC
--    - Insert with status = 'approved'
--    - Set source_type = 'guest_submission'
--    - All security (SECURITY DEFINER, SET search_path, cutoff, sanitisation,
--      length validation) is preserved
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.submit_public_wish(
  p_author_name TEXT,
  p_wish_text   TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cutoff          TIMESTAMPTZ;
  v_sanitised_name  TEXT;
  v_sanitised_text  TEXT;
  v_new_id          UUID;
BEGIN
  -- Cutoff check
  SELECT wish_submission_cutoff
  INTO v_cutoff
  FROM public.site_settings
  LIMIT 1;

  IF v_cutoff IS NOT NULL AND NOW() > v_cutoff THEN
    RAISE EXCEPTION 'Wish submissions are closed.' USING ERRCODE = 'P0001';
  END IF;

  -- Sanitise inputs
  v_sanitised_name := TRIM(p_author_name);
  v_sanitised_text := TRIM(p_wish_text);

  -- Length validation
  IF LENGTH(v_sanitised_name) < 2 OR LENGTH(v_sanitised_name) > 100 THEN
    RAISE EXCEPTION 'Author display name must be between 2 and 100 characters.' USING ERRCODE = 'P0001';
  END IF;

  IF LENGTH(v_sanitised_text) < 10 OR LENGTH(v_sanitised_text) > 1000 THEN
    RAISE EXCEPTION 'Wish text must be between 10 and 1000 characters.' USING ERRCODE = 'P0001';
  END IF;

  -- Insert — approved immediately, tagged as guest_submission
  INSERT INTO public.wishes (
    author_display_name,
    wish_text,
    status,
    source_type
  ) VALUES (
    v_sanitised_name,
    v_sanitised_text,
    'approved',
    'guest_submission'
  )
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object('success', TRUE, 'wish_id', v_new_id);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_public_wish(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_public_wish(TEXT, TEXT) TO anon, authenticated;


-- ---------------------------------------------------------------------------
-- 5. Update get_published_media() RPC — allow 'others' category
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_published_media(p_category TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Validate category when provided
  IF p_category IS NOT NULL AND p_category NOT IN ('haldi', 'mehndi', 'wedding', 'reception', 'portraits', 'others') THEN
    RAISE EXCEPTION 'Invalid category: %', p_category USING ERRCODE = 'P0001';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',          m.id,
        'category',    m.category,
        'media_type',  m.media_type,
        'storage_path',m.storage_path,
        'caption',     m.caption,
        'sort_order',  m.sort_order,
        'created_at',  m.created_at
      )
      ORDER BY m.sort_order ASC, m.created_at DESC
    ),
    '[]'::jsonb
  )
  INTO v_result
  FROM public.media_items m
  WHERE m.is_published = TRUE
    AND (p_category IS NULL OR m.category = p_category);

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_published_media(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_published_media(TEXT) TO anon, authenticated;


-- ---------------------------------------------------------------------------
-- 6. Create get_public_wishes() RPC — public wish wall (approved only)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_public_wishes()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',                  w.id,
        'author_display_name', w.author_display_name,
        'wish_text',           w.wish_text,
        'created_at',          w.created_at
      )
      ORDER BY w.created_at DESC
    ),
    '[]'::jsonb
  )
  INTO v_result
  FROM public.wishes w
  WHERE w.status = 'approved';

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_wishes() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_wishes() TO anon, authenticated;


-- ---------------------------------------------------------------------------
-- 7. Create get_admin_wishes() RPC — admin-only, all wishes + source_type
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_admin_wishes()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_result    JSONB;
BEGIN
  v_caller_id := auth.uid();

  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('wishes', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized.' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',                  w.id,
        'profile_id',          w.profile_id,
        'author_display_name', w.author_display_name,
        'wish_text',           w.wish_text,
        'status',              w.status,
        'source_type',         w.source_type,
        'created_at',          w.created_at,
        'updated_at',          w.updated_at
      )
      ORDER BY w.created_at DESC
    ),
    '[]'::jsonb
  )
  INTO v_result
  FROM public.wishes w;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_wishes() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_wishes() TO authenticated;


-- ---------------------------------------------------------------------------
-- 8. Create admin_delete_wish() RPC — admin-only permanent deletion
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_delete_wish(p_wish_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
BEGIN
  v_caller_id := auth.uid();

  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('wishes', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized.' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.wishes WHERE id = p_wish_id;

  RETURN jsonb_build_object('success', TRUE, 'wish_id', p_wish_id);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_wish(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_wish(UUID) TO authenticated;


-- ---------------------------------------------------------------------------
-- 9. Full rewrite of get_admin_dashboard_metrics()
--    - Uses public_rsvps table for RSVP metrics
--    - wishes_metrics → total_wishes (approved count only)
--    - conversations_metrics section removed entirely
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id          UUID;
  v_is_super           BOOLEAN;
  v_has_rsvp           BOOLEAN;
  v_has_wishes         BOOLEAN;
  v_has_photos         BOOLEAN;
  v_has_invitation     BOOLEAN;

  v_unread_notifications  INTEGER := 0;
  v_public_rsvp_count     INTEGER := 0;
  v_attending_total       INTEGER := 0;
  v_attending_haldi       INTEGER := 0;
  v_attending_mehndi      INTEGER := 0;
  v_attending_wedding     INTEGER := 0;
  v_attending_reception   INTEGER := 0;
  v_total_wishes          INTEGER := 0;
  v_draft_photos          INTEGER := 0;
  v_published_photos      INTEGER := 0;
  v_published_videos      INTEGER := 0;
  v_total_media           INTEGER := 0;
  v_invitation_is_published BOOLEAN := FALSE;
  v_invitation_template   TEXT    := 'cinematic';
  v_invitation_headline   TEXT    := '';
  v_recent_notifications  JSONB   := '[]'::jsonb;
  v_result                JSONB;
BEGIN
  v_caller_id := auth.uid();

  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  SELECT is_super_admin INTO v_is_super
  FROM public.admin_users
  WHERE id = v_caller_id AND is_active = TRUE;

  IF v_is_super IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller is not an active administrator.' USING ERRCODE = '42501';
  END IF;

  v_has_rsvp       := v_is_super OR private.has_admin_permission('guest_rsvp',        v_caller_id);
  v_has_wishes     := v_is_super OR private.has_admin_permission('wishes',             v_caller_id);
  v_has_photos     := v_is_super OR private.has_admin_permission('photos',             v_caller_id);
  v_has_invitation := v_is_super OR private.has_admin_permission('invitation_studio',  v_caller_id);

  -- ----------------------------------------------------------------
  -- Notifications
  -- ----------------------------------------------------------------
  IF v_is_super THEN
    SELECT COUNT(*)
    INTO v_unread_notifications
    FROM public.admin_notifications
    WHERE is_read = FALSE;

    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id',                n.id,
          'permission_group',  n.permission_group,
          'title',             n.title,
          'message',           n.message,
          'related_entity_id', n.related_entity_id,
          'is_read',           n.is_read,
          'created_at',        n.created_at
        )
        ORDER BY n.created_at DESC
      ),
      '[]'::jsonb
    )
    INTO v_recent_notifications
    FROM (
      SELECT *
      FROM public.admin_notifications
      ORDER BY created_at DESC
      LIMIT 10
    ) n;
  ELSE
    SELECT COUNT(*)
    INTO v_unread_notifications
    FROM public.admin_notifications
    WHERE is_read = FALSE
      AND private.has_admin_permission(permission_group, v_caller_id);

    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id',                n.id,
          'permission_group',  n.permission_group,
          'title',             n.title,
          'message',           n.message,
          'related_entity_id', n.related_entity_id,
          'is_read',           n.is_read,
          'created_at',        n.created_at
        )
        ORDER BY n.created_at DESC
      ),
      '[]'::jsonb
    )
    INTO v_recent_notifications
    FROM (
      SELECT *
      FROM public.admin_notifications
      WHERE private.has_admin_permission(permission_group, v_caller_id)
      ORDER BY created_at DESC
      LIMIT 10
    ) n;
  END IF;

  -- ----------------------------------------------------------------
  -- Public RSVP metrics (from public_rsvps table)
  -- ----------------------------------------------------------------
  IF v_has_rsvp THEN
    SELECT
      COUNT(*),
      COALESCE(SUM(guest_count), 0),
      COALESCE(SUM(CASE WHEN attending_haldi     THEN guest_count ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN attending_mehndi    THEN guest_count ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN attending_wedding   THEN guest_count ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN attending_reception THEN guest_count ELSE 0 END), 0)
    INTO
      v_public_rsvp_count,
      v_attending_total,
      v_attending_haldi,
      v_attending_mehndi,
      v_attending_wedding,
      v_attending_reception
    FROM public.public_rsvps;
  END IF;

  -- ----------------------------------------------------------------
  -- Wishes metrics (approved count only)
  -- ----------------------------------------------------------------
  IF v_has_wishes THEN
    SELECT COUNT(*)
    INTO v_total_wishes
    FROM public.wishes
    WHERE status = 'approved';
  END IF;

  -- ----------------------------------------------------------------
  -- Photos / media metrics
  -- ----------------------------------------------------------------
  IF v_has_photos THEN
    SELECT
      COUNT(*) FILTER (WHERE NOT is_published AND media_type = 'photo'),
      COUNT(*) FILTER (WHERE     is_published AND media_type = 'photo'),
      COUNT(*) FILTER (WHERE     is_published AND media_type = 'video'),
      COUNT(*)
    INTO v_draft_photos, v_published_photos, v_published_videos, v_total_media
    FROM public.media_items;
  END IF;

  -- ----------------------------------------------------------------
  -- Invitation metrics
  -- ----------------------------------------------------------------
  IF v_has_invitation THEN
    SELECT
      is_published,
      default_template,
      COALESCE(headline_text, '')
    INTO
      v_invitation_is_published,
      v_invitation_template,
      v_invitation_headline
    FROM public.invitation_settings
    LIMIT 1;
  END IF;

  -- ----------------------------------------------------------------
  -- Assemble result object
  -- ----------------------------------------------------------------
  v_result := jsonb_build_object(
    'is_super_admin',            v_is_super,
    'unread_notifications_count', v_unread_notifications,
    'recent_notifications',      v_recent_notifications
  );

  IF v_has_rsvp THEN
    v_result := v_result || jsonb_build_object(
      'rsvp_metrics', jsonb_build_object(
        'public_rsvp_count',  v_public_rsvp_count,
        'attending_total',    v_attending_total,
        'attending_haldi',    v_attending_haldi,
        'attending_mehndi',   v_attending_mehndi,
        'attending_wedding',  v_attending_wedding,
        'attending_reception', v_attending_reception
      )
    );
  END IF;

  IF v_has_wishes THEN
    v_result := v_result || jsonb_build_object(
      'wishes_metrics', jsonb_build_object(
        'total_wishes', v_total_wishes
      )
    );
  END IF;

  IF v_has_photos THEN
    v_result := v_result || jsonb_build_object(
      'photos_metrics', jsonb_build_object(
        'draft_photos',     v_draft_photos,
        'published_photos', v_published_photos,
        'published_videos', v_published_videos,
        'total_media',      v_total_media
      )
    );
  END IF;

  IF v_has_invitation THEN
    v_result := v_result || jsonb_build_object(
      'invitation_metrics', jsonb_build_object(
        'is_published',   COALESCE(v_invitation_is_published, FALSE),
        'default_template', COALESCE(v_invitation_template, 'cinematic'),
        'headline_text',  v_invitation_headline
      )
    );
  END IF;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_metrics() TO authenticated;


-- ---------------------------------------------------------------------------
-- 10. Storage RLS policies for wedding-media bucket
--
-- NOTE: Create the 'wedding-media' Storage bucket in Supabase Dashboard
--       BEFORE applying these policies.
--       Navigate to: Storage → New Bucket → Name: wedding-media
--                    → Private bucket (do NOT enable public access)
-- ---------------------------------------------------------------------------

-- Allow authenticated admins with 'photos' permission to upload
DROP POLICY IF EXISTS "Admins can upload wedding media" ON storage.objects;
CREATE POLICY "Admins can upload wedding media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'wedding-media'
    AND (
      private.is_super_admin(auth.uid())
      OR private.has_admin_permission('photos', auth.uid())
    )
  );

-- Allow authenticated admins with 'photos' permission to update/replace
DROP POLICY IF EXISTS "Admins can update wedding media" ON storage.objects;
CREATE POLICY "Admins can update wedding media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'wedding-media'
    AND (
      private.is_super_admin(auth.uid())
      OR private.has_admin_permission('photos', auth.uid())
    )
  );

-- Allow authenticated admins with 'photos' permission to delete
DROP POLICY IF EXISTS "Admins can delete wedding media" ON storage.objects;
CREATE POLICY "Admins can delete wedding media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'wedding-media'
    AND (
      private.is_super_admin(auth.uid())
      OR private.has_admin_permission('photos', auth.uid())
    )
  );

-- Public visitors can SELECT (read) published media objects.
-- Access control is handled at the application layer via signed URLs;
-- broad read access to storage.objects is therefore intentional here.
DROP POLICY IF EXISTS "Public can read wedding media" ON storage.objects;
CREATE POLICY "Public can read wedding media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'wedding-media');


-- ---------------------------------------------------------------------------
-- 11. Idempotent seed of host-curated blessings
--
-- These are NOT attributed to real guests; they are editorial / curated
-- content provided by the wedding host for display on the public wall.
-- ON CONFLICT (id) DO NOTHING makes this re-runnable safely.
-- ---------------------------------------------------------------------------

INSERT INTO public.wishes (
  id,
  profile_id,
  author_display_name,
  wish_text,
  status,
  source_type,
  created_at
) VALUES
  (
    'a1b2c3d4-0001-0001-0001-000000000001',
    NULL,
    'Sunil & Anita Mukherjee',
    'May your journey together be filled with endless happiness, unconditional love, and beautiful memories. Wishing you both a lifetime of togetherness!',
    'approved',
    'host_curated',
    '2026-11-08 10:30:00+00'
  ),
  (
    'a1b2c3d4-0001-0001-0001-000000000002',
    NULL,
    'Dr. B. K. Roy',
    'Wishing dearest Mithun & Sakhi a lifetime of togetherness, joyous laughter, and divine blessings as you begin this sacred Vedic union in Purulia.',
    'approved',
    'host_curated',
    '2026-11-08 12:15:00+00'
  ),
  (
    'a1b2c3d4-0001-0001-0001-000000000003',
    NULL,
    'Debashis & Sharmila Sen',
    'May the sacred bond you share today grow stronger with each passing year. May your home always be illuminated with peace, prosperity, and joy.',
    'approved',
    'host_curated',
    '2026-11-08 14:45:00+00'
  ),
  (
    'a1b2c3d4-0001-0001-0001-000000000004',
    NULL,
    'Priya Sharma & Family',
    'Two wonderful souls coming together! Sending our deepest blessings and warmest prayers for a joyous marriage and heartfelt celebrations.',
    'approved',
    'host_curated',
    '2026-11-08 16:20:00+00'
  ),
  (
    'a1b2c3d4-0001-0001-0001-000000000005',
    NULL,
    'Alok & Rina Ganguly',
    'Heartfelt congratulations to dearest Mithun and Sakhi! May the divine light guide every step of your sacred marriage through all seasons of life.',
    'approved',
    'host_curated',
    '2026-11-08 18:05:00+00'
  ),
  (
    'a1b2c3d4-0001-0001-0001-000000000006',
    NULL,
    'Sanjay Gorain & Family',
    'May every new chapter bring peace, prosperity, and countless reasons to smile. Heartiest congratulations to both the Gorain families!',
    'approved',
    'host_curated',
    '2026-11-09 08:10:00+00'
  ),
  (
    'a1b2c3d4-0001-0001-0001-000000000007',
    NULL,
    'Meenakshi Dutta',
    'Sending heartfelt blessings for a beautiful and joyful married life. May your union be blessed with endless companionship, deep respect, and harmony.',
    'approved',
    'host_curated',
    '2026-11-09 09:30:00+00'
  ),
  (
    'a1b2c3d4-0001-0001-0001-000000000008',
    NULL,
    'The Banerjee Family',
    'May your love story be blessed with eternal happiness, shared dreams, and wonderful adventures together. With all our love and warm prayers.',
    'approved',
    'host_curated',
    '2026-11-09 11:40:00+00'
  ),
  (
    'a1b2c3d4-0001-0001-0001-000000000009',
    NULL,
    'Kalyan & Supriya Mondal',
    'A marriage solemnized under sacred Vedic mantras! Wishing Mithun and Sakhi boundless bliss, good health, and enduring fortune on this auspicious wedding.',
    'approved',
    'host_curated',
    '2026-11-09 13:25:00+00'
  ),
  (
    'a1b2c3d4-0001-0001-0001-000000000010',
    NULL,
    'Anirban Sengupta',
    'Heartiest congratulations Mithun & Sakhi! May the celebrations in Purulia be filled with music, laughter, and timeless memories.',
    'approved',
    'host_curated',
    '2026-11-09 15:50:00+00'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- End of migration 20261102000016_system_simplification.sql
-- =============================================================================
