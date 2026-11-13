-- =============================================================================
-- Migration: 20261112000017_storage_rls_and_media_others_sync.sql
-- Project:   Mithun & Sakhi Wedding Website (wsfbvpvymwjyzxllxpvj)
-- Created:   2026-11-12
-- Depends:   000001 – 000016 (already applied; do NOT modify those files)
--
-- Summary of changes (forward-only & idempotent):
--   1. Sync get_published_media(TEXT) using m.display_order (fixes 42703)
--   2. Add partial index on public.media_items(storage_path) WHERE is_published
--   3. Harden storage.objects SELECT RLS for private 'wedding-media' bucket:
--        - Public / authenticated visitors: published media objects only
--        - Super Admins & 'photos' admins: all objects (drafts + uploads)
--   4. Update admin_create_media_item(...) to accept the 'others' category
--   5. Update admin_update_media_item(...) to accept the 'others' category
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Sync get_published_media() RPC — uses m.display_order & allows 'others'
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
        'id',               m.id,
        'media_type',       m.media_type,
        'storage_path',     m.storage_path,
        'youtube_url',      m.youtube_url,
        'category',         m.category,
        'caption',          m.caption,
        'download_enabled', m.download_enabled,
        'display_order',    m.display_order,
        'file_name',        m.file_name,
        'file_size_bytes',  m.file_size_bytes,
        'mime_type',        m.mime_type,
        'width',            m.width,
        'height',           m.height,
        'thumbnail_path',   m.thumbnail_path,
        'created_at',       m.created_at
      )
      ORDER BY m.display_order ASC, m.created_at DESC
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
-- 2. Partial index supporting Storage RLS published-object lookups
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_media_items_published_storage_path
  ON public.media_items (storage_path)
  WHERE is_published = TRUE;


-- ---------------------------------------------------------------------------
-- 3. Harden storage.objects SELECT RLS policies for 'wedding-media' bucket
--    Preserves existing INSERT, UPDATE, and DELETE policies unchanged.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public can read wedding media" ON storage.objects;
DROP POLICY IF EXISTS "Public can read published wedding media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all wedding media" ON storage.objects;

-- 3a. Public & authenticated visitors: ONLY objects linked to published media_items
CREATE POLICY "Public can read published wedding media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'wedding-media'
    AND EXISTS (
      SELECT 1
      FROM public.media_items m
      WHERE m.storage_path = storage.objects.name
        AND m.is_published = TRUE
    )
  );

-- 3b. Super Admins and 'photos' admins: all objects in wedding-media (drafts + uploads)
CREATE POLICY "Admins can read all wedding media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'wedding-media'
    AND (
      private.is_super_admin(auth.uid())
      OR private.has_admin_permission('photos', auth.uid())
    )
  );


-- ---------------------------------------------------------------------------
-- 4. Update admin_create_media_item() — add 'others' category validation
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_create_media_item(
  p_media_type TEXT,
  p_storage_path TEXT DEFAULT NULL,
  p_youtube_url TEXT DEFAULT NULL,
  p_category TEXT DEFAULT 'wedding',
  p_caption TEXT DEFAULT NULL,
  p_is_published BOOLEAN DEFAULT FALSE,
  p_download_enabled BOOLEAN DEFAULT TRUE,
  p_display_order INTEGER DEFAULT 0,
  p_file_name TEXT DEFAULT NULL,
  p_file_size_bytes BIGINT DEFAULT NULL,
  p_mime_type TEXT DEFAULT NULL,
  p_width INTEGER DEFAULT NULL,
  p_height INTEGER DEFAULT NULL,
  p_thumbnail_path TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_new_id UUID;
  v_result JSONB;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('photos', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized: Caller lacks photos permission.' USING ERRCODE = '42501';
  END IF;

  -- Validate media type
  IF p_media_type NOT IN ('photo', 'video') THEN
    RAISE EXCEPTION 'Invalid media type: %. Must be photo or video.', p_media_type;
  END IF;

  -- Validate category (matches media_items_category_check in 000016)
  IF p_category NOT IN ('haldi', 'mehndi', 'wedding', 'reception', 'portraits', 'others') THEN
    RAISE EXCEPTION 'Invalid category: %.', p_category;
  END IF;

  -- Validate payload
  IF p_media_type = 'photo' AND (p_storage_path IS NULL OR length(trim(p_storage_path)) = 0) THEN
    RAISE EXCEPTION 'Storage path is required for photographs.';
  END IF;

  IF p_media_type = 'video' AND (p_youtube_url IS NULL OR length(trim(p_youtube_url)) = 0) THEN
    RAISE EXCEPTION 'YouTube URL is required for video items.';
  END IF;

  INSERT INTO public.media_items (
    media_type,
    storage_path,
    youtube_url,
    category,
    caption,
    is_published,
    download_enabled,
    display_order,
    file_name,
    file_size_bytes,
    mime_type,
    width,
    height,
    thumbnail_path,
    uploaded_by
  ) VALUES (
    p_media_type,
    trim(p_storage_path),
    trim(p_youtube_url),
    p_category,
    trim(p_caption),
    COALESCE(p_is_published, FALSE),
    COALESCE(p_download_enabled, TRUE),
    COALESCE(p_display_order, 0),
    trim(p_file_name),
    p_file_size_bytes,
    trim(p_mime_type),
    p_width,
    p_height,
    trim(p_thumbnail_path),
    v_caller_id
  )
  RETURNING id INTO v_new_id;

  SELECT jsonb_build_object(
    'id', m.id,
    'media_type', m.media_type,
    'storage_path', m.storage_path,
    'youtube_url', m.youtube_url,
    'category', m.category,
    'caption', m.caption,
    'is_published', m.is_published,
    'download_enabled', m.download_enabled,
    'display_order', m.display_order,
    'file_name', m.file_name,
    'created_at', m.created_at
  )
  INTO v_result
  FROM public.media_items m
  WHERE m.id = v_new_id;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_create_media_item(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, INTEGER, TEXT, BIGINT, TEXT, INTEGER, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_media_item(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, INTEGER, TEXT, BIGINT, TEXT, INTEGER, INTEGER, TEXT) TO authenticated;


-- ---------------------------------------------------------------------------
-- 5. Update admin_update_media_item() — add 'others' category validation
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_update_media_item(
  p_media_id UUID,
  p_category TEXT,
  p_caption TEXT,
  p_is_published BOOLEAN,
  p_download_enabled BOOLEAN,
  p_display_order INTEGER,
  p_youtube_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_existing RECORD;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('photos', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized: Caller lacks photos permission.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_existing FROM public.media_items WHERE id = p_media_id;
  IF v_existing IS NULL THEN
    RAISE EXCEPTION 'Media item not found: %', p_media_id USING ERRCODE = 'P0002';
  END IF;

  IF p_category NOT IN ('haldi', 'mehndi', 'wedding', 'reception', 'portraits', 'others') THEN
    RAISE EXCEPTION 'Invalid category: %.', p_category;
  END IF;

  UPDATE public.media_items
  SET category = p_category,
      caption = trim(p_caption),
      is_published = p_is_published,
      download_enabled = p_download_enabled,
      display_order = COALESCE(p_display_order, 0),
      youtube_url = CASE WHEN v_existing.media_type = 'video' THEN COALESCE(trim(p_youtube_url), v_existing.youtube_url) ELSE v_existing.youtube_url END,
      updated_at = NOW()
  WHERE id = p_media_id;

  RETURN jsonb_build_object(
    'id', p_media_id,
    'category', p_category,
    'caption', trim(p_caption),
    'is_published', p_is_published,
    'download_enabled', p_download_enabled,
    'display_order', p_display_order,
    'success', true
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_media_item(UUID, TEXT, TEXT, BOOLEAN, BOOLEAN, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_media_item(UUID, TEXT, TEXT, BOOLEAN, BOOLEAN, INTEGER, TEXT) TO authenticated;

-- =============================================================================
-- End of migration 20261112000017_storage_rls_and_media_others_sync.sql
-- =============================================================================
