-- Migration 11: Homepage Featured Media Selection (Phase P-15.3)
-- Architecture: docs/ARCHITECTURE_AND_SECURITY.md (Section 13)
-- Core Requirement: Administrator-controlled curated selection of approved photographs for the homepage.

-- 1. ADD IS_FEATURED COLUMN TO MEDIA_ITEMS
ALTER TABLE public.media_items
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. INDEX FOR EFFICIENT FEATURED QUERYING
CREATE INDEX IF NOT EXISTS idx_media_items_featured
  ON public.media_items (is_featured, is_published, display_order ASC, created_at DESC);

-- 3. PUBLIC RPC: GET HOMEPAGE FEATURED MEDIA
-- Returns only published, administrator-selected featured photos.
-- Limited to a curated count (default 12, max 20).
-- Excludes internal audit metadata (uploaded_by) to protect guest privacy.
CREATE OR REPLACE FUNCTION public.get_homepage_featured_media(p_limit INTEGER DEFAULT 12)
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
        'id', m.id,
        'media_type', m.media_type,
        'storage_path', m.storage_path,
        'youtube_url', m.youtube_url,
        'category', m.category,
        'caption', m.caption,
        'download_enabled', m.download_enabled,
        'display_order', m.display_order,
        'is_featured', m.is_featured,
        'file_name', m.file_name,
        'file_size_bytes', m.file_size_bytes,
        'mime_type', m.mime_type,
        'width', m.width,
        'height', m.height,
        'thumbnail_path', m.thumbnail_path,
        'created_at', m.created_at
      )
      ORDER BY m.display_order ASC, m.created_at DESC
    ),
    '[]'::jsonb
  )
  INTO v_result
  FROM (
    SELECT *
    FROM public.media_items
    WHERE is_published = TRUE
      AND is_featured = TRUE
      AND media_type = 'photo'
    ORDER BY display_order ASC, created_at DESC
    LIMIT LEAST(p_limit, 20)
  ) m;

  RETURN v_result;
END;
$$;

-- 4. UPDATE ADMIN RPC: GET ALL MEDIA ITEMS
-- Includes is_featured flag in the returned items.
CREATE OR REPLACE FUNCTION public.admin_get_all_media(
  p_category TEXT DEFAULT NULL,
  p_media_type TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_result JSONB;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('photos', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized: Caller lacks photos permission.' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', m.id,
        'media_type', m.media_type,
        'storage_path', m.storage_path,
        'youtube_url', m.youtube_url,
        'category', m.category,
        'caption', m.caption,
        'is_published', m.is_published,
        'download_enabled', m.download_enabled,
        'display_order', m.display_order,
        'is_featured', m.is_featured,
        'file_name', m.file_name,
        'file_size_bytes', m.file_size_bytes,
        'mime_type', m.mime_type,
        'width', m.width,
        'height', m.height,
        'thumbnail_path', m.thumbnail_path,
        'created_at', m.created_at,
        'updated_at', m.updated_at,
        'uploaded_by', m.uploaded_by,
        'uploader_name', p.full_name,
        'uploader_email', p.email
      )
      ORDER BY m.display_order ASC, m.created_at DESC
    ),
    '[]'::jsonb
  )
  INTO v_result
  FROM public.media_items m
  LEFT JOIN public.profiles p ON p.id = m.uploaded_by
  WHERE (p_category IS NULL OR m.category = p_category)
    AND (p_media_type IS NULL OR m.media_type = p_media_type);

  RETURN v_result;
END;
$$;

-- 5. ADMIN RPC: TOGGLE MEDIA FEATURED STATUS ON HOMEPAGE
-- Strictly guarded: Requires Super Admin or 'photos' permission group.
-- Enforces a maximum curated limit (12 featured items) to prevent homepage clutter.
CREATE OR REPLACE FUNCTION public.admin_toggle_media_featured(p_media_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_current_status BOOLEAN;
  v_new_status BOOLEAN;
  v_featured_count INTEGER;
  v_is_published BOOLEAN;
  v_media_type TEXT;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('photos', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized: Caller lacks photos permission.' USING ERRCODE = '42501';
  END IF;

  SELECT is_featured, is_published, media_type
  INTO v_current_status, v_is_published, v_media_type
  FROM public.media_items
  WHERE id = p_media_id;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Media item % does not exist.', p_media_id USING ERRCODE = 'P0002';
  END IF;

  v_new_status := NOT v_current_status;

  -- Only approved/published photos can be featured on homepage
  IF v_new_status = TRUE THEN
    IF v_is_published IS NOT TRUE THEN
      RAISE EXCEPTION 'Only published media can be featured on the homepage. Please publish this item first.'
        USING ERRCODE = '22023';
    END IF;

    IF v_media_type != 'photo' THEN
      RAISE EXCEPTION 'Only photography can be featured in the homepage memories gallery.'
        USING ERRCODE = '22023';
    END IF;

    -- Enforce maximum limit of 12 featured items on homepage
    SELECT count(*) INTO v_featured_count
    FROM public.media_items
    WHERE is_featured = TRUE AND is_published = TRUE;

    IF v_featured_count >= 12 THEN
      RAISE EXCEPTION 'Homepage featured limit reached (maximum 12 photos). Please remove an existing featured photo before adding a new one.'
        USING ERRCODE = '22023';
    END IF;
  END IF;

  UPDATE public.media_items
  SET is_featured = v_new_status,
      updated_at = NOW()
  WHERE id = p_media_id;

  RETURN jsonb_build_object(
    'id', p_media_id,
    'is_featured', v_new_status
  );
END;
$$;

-- 6. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION public.get_homepage_featured_media(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_media_featured(UUID) TO authenticated;
