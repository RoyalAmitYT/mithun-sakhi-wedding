-- Migration 8: Media Manager & Published Gallery Integration (Phase P-12)
-- Architecture: docs/ARCHITECTURE_AND_SECURITY.md (Section 13)
-- Acceptance Criteria: TC-MED-01, TC-MED-02, TC-MED-03, TC-ADM-02

-- 1. ADD MEDIA METADATA COLUMNS
ALTER TABLE public.media_items
  ADD COLUMN IF NOT EXISTS file_name TEXT NULL,
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT NULL,
  ADD COLUMN IF NOT EXISTS mime_type TEXT NULL,
  ADD COLUMN IF NOT EXISTS width INTEGER NULL,
  ADD COLUMN IF NOT EXISTS height INTEGER NULL,
  ADD COLUMN IF NOT EXISTS thumbnail_path TEXT NULL;

-- 2. ENFORCE PAYLOAD INTEGRITY CONSTRAINT
ALTER TABLE public.media_items
  DROP CONSTRAINT IF EXISTS chk_media_payload;

ALTER TABLE public.media_items
  ADD CONSTRAINT chk_media_payload CHECK (
    (media_type = 'photo' AND storage_path IS NOT NULL AND length(trim(storage_path)) > 0)
    OR
    (media_type = 'video' AND youtube_url IS NOT NULL AND length(trim(youtube_url)) > 0)
  );

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_media_items_published
  ON public.media_items (is_published, category, display_order ASC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_items_uploaded_by
  ON public.media_items (uploaded_by);

-- 4. PUBLIC RPC: GET PUBLISHED MEDIA
-- Returns only published photographs and videos.
-- Excludes internal audit identifiers (e.g. uploaded_by) to prevent guest identity leakage.
CREATE OR REPLACE FUNCTION public.get_published_media(p_category TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF p_category IS NOT NULL AND p_category NOT IN ('haldi', 'mehndi', 'wedding', 'reception', 'portraits') THEN
    RAISE EXCEPTION 'Invalid media category: %', p_category;
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
        'download_enabled', m.download_enabled,
        'display_order', m.display_order,
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
  FROM public.media_items m
  WHERE m.is_published = TRUE
    AND (p_category IS NULL OR m.category = p_category);

  RETURN v_result;
END;
$$;

-- 5. ADMIN RPC: GET ALL MEDIA ITEMS
-- Returns both draft and published items with uploader metadata.
-- Strictly guarded: Requires Super Admin or 'photos' permission group.
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

-- 6. ADMIN RPC: CREATE MEDIA ITEM
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

  -- Validate category
  IF p_category NOT IN ('haldi', 'mehndi', 'wedding', 'reception', 'portraits') THEN
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

-- 7. ADMIN RPC: UPDATE MEDIA ITEM
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

  IF p_category NOT IN ('haldi', 'mehndi', 'wedding', 'reception', 'portraits') THEN
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

-- 8. ADMIN RPC: DELETE MEDIA ITEM
CREATE OR REPLACE FUNCTION public.admin_delete_media_item(p_media_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_deleted RECORD;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('photos', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized: Caller lacks photos permission.' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.media_items
  WHERE id = p_media_id
  RETURNING id, storage_path, media_type INTO v_deleted;

  IF v_deleted IS NULL THEN
    RAISE EXCEPTION 'Media item not found: %', p_media_id USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_id', p_media_id,
    'storage_path', v_deleted.storage_path,
    'media_type', v_deleted.media_type
  );
END;
$$;

-- 9. ADMIN RPC: TOGGLE PUBLISHED STATUS
CREATE OR REPLACE FUNCTION public.admin_toggle_media_published(p_media_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_new_status BOOLEAN;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('photos', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized: Caller lacks photos permission.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.media_items
  SET is_published = NOT is_published,
      updated_at = NOW()
  WHERE id = p_media_id
  RETURNING is_published INTO v_new_status;

  IF v_new_status IS NULL THEN
    RAISE EXCEPTION 'Media item not found: %', p_media_id USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object(
    'id', p_media_id,
    'is_published', v_new_status,
    'success', true
  );
END;
$$;

-- 10. ADMIN RPC: TOGGLE DOWNLOAD STATUS
CREATE OR REPLACE FUNCTION public.admin_toggle_media_download(p_media_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_new_status BOOLEAN;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('photos', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized: Caller lacks photos permission.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.media_items
  SET download_enabled = NOT download_enabled,
      updated_at = NOW()
  WHERE id = p_media_id
  RETURNING download_enabled INTO v_new_status;

  IF v_new_status IS NULL THEN
    RAISE EXCEPTION 'Media item not found: %', p_media_id USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object(
    'id', p_media_id,
    'download_enabled', v_new_status,
    'success', true
  );
END;
$$;

-- 11. ENHANCED UNIFIED DASHBOARD METRICS RPC WITH PHOTOS METRICS
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_is_super BOOLEAN;
  v_has_rsvp BOOLEAN;
  v_has_wishes BOOLEAN;
  v_has_questions BOOLEAN;
  v_has_photos BOOLEAN;
  
  v_unread_notifications INTEGER := 0;
  v_pending_requests INTEGER := 0;
  v_total_families INTEGER := 0;
  v_attending_headcount INTEGER := 0;
  v_pending_wishes INTEGER := 0;
  v_approved_wishes INTEGER := 0;
  v_new_inquiries INTEGER := 0;
  v_in_progress_inquiries INTEGER := 0;
  v_resolved_inquiries INTEGER := 0;
  v_draft_photos INTEGER := 0;
  v_published_photos INTEGER := 0;
  v_published_videos INTEGER := 0;
  v_total_media INTEGER := 0;
  v_events_summary JSONB := '[]'::jsonb;
  v_recent_notifications JSONB := '[]'::jsonb;
  v_result JSONB;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  -- Verify active administrator status
  SELECT is_super_admin INTO v_is_super
  FROM public.admin_users
  WHERE id = v_caller_id AND is_active = TRUE;

  IF v_is_super IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller is not an active administrator.' USING ERRCODE = '42501';
  END IF;

  v_has_rsvp := v_is_super OR private.has_admin_permission('guest_rsvp', v_caller_id);
  v_has_wishes := v_is_super OR private.has_admin_permission('wishes', v_caller_id);
  v_has_questions := v_is_super OR private.has_admin_permission('questions', v_caller_id);
  v_has_photos := v_is_super OR private.has_admin_permission('photos', v_caller_id);

  -- 1. Unread notifications count & recent notifications list scoped to caller's permissions
  IF v_is_super THEN
    SELECT COUNT(*) INTO v_unread_notifications
    FROM public.admin_notifications
    WHERE is_read = FALSE;

    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', n.id,
          'permission_group', n.permission_group,
          'title', n.title,
          'message', n.message,
          'related_entity_id', n.related_entity_id,
          'is_read', n.is_read,
          'created_at', n.created_at
        )
        ORDER BY n.created_at DESC
      ),
      '[]'::jsonb
    )
    INTO v_recent_notifications
    FROM (
      SELECT * FROM public.admin_notifications
      ORDER BY created_at DESC
      LIMIT 10
    ) n;
  ELSE
    SELECT COUNT(*) INTO v_unread_notifications
    FROM public.admin_notifications n
    WHERE n.is_read = FALSE
      AND private.has_admin_permission(n.permission_group, v_caller_id);

    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', n.id,
          'permission_group', n.permission_group,
          'title', n.title,
          'message', n.message,
          'related_entity_id', n.related_entity_id,
          'is_read', n.is_read,
          'created_at', n.created_at
        )
        ORDER BY n.created_at DESC
      ),
      '[]'::jsonb
    )
    INTO v_recent_notifications
    FROM (
      SELECT * FROM public.admin_notifications
      WHERE private.has_admin_permission(permission_group, v_caller_id)
      ORDER BY created_at DESC
      LIMIT 10
    ) n;
  END IF;

  -- 2. RSVP & Access Request metrics (if authorized)
  IF v_has_rsvp THEN
    SELECT COUNT(*) INTO v_pending_requests
    FROM public.access_requests
    WHERE status = 'pending';

    SELECT COUNT(*) INTO v_total_families
    FROM public.family_groups;

    SELECT COUNT(a.id) INTO v_attending_headcount
    FROM public.attendees a
    JOIN public.rsvps r ON r.id = a.rsvp_id
    WHERE r.status = 'attending';

    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'title', e.title,
          'ceremony_date', e.ceremony_date,
          'attending_count', (
            SELECT COUNT(*) FROM public.rsvps r WHERE r.event_id = e.id AND r.status = 'attending'
          ),
          'headcount', (
            SELECT COUNT(a.id) FROM public.attendees a
            JOIN public.rsvps r ON r.id = a.rsvp_id
            WHERE r.event_id = e.id AND r.status = 'attending'
          )
        )
        ORDER BY e.display_order ASC
      ),
      '[]'::jsonb
    )
    INTO v_events_summary
    FROM public.events e
    WHERE e.is_published = TRUE;
  END IF;

  -- 3. Wishes metrics (if authorized)
  IF v_has_wishes THEN
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending'),
      COUNT(*) FILTER (WHERE status = 'approved')
    INTO v_pending_wishes, v_approved_wishes
    FROM public.wishes;
  END IF;

  -- 4. Conversations metrics (if authorized)
  IF v_has_questions THEN
    SELECT
      COUNT(*) FILTER (WHERE status = 'new'),
      COUNT(*) FILTER (WHERE status = 'in_progress'),
      COUNT(*) FILTER (WHERE status = 'resolved')
    INTO v_new_inquiries, v_in_progress_inquiries, v_resolved_inquiries
    FROM public.conversations;
  END IF;

  -- 5. Media & Photos metrics (if authorized)
  IF v_has_photos THEN
    SELECT
      COUNT(*) FILTER (WHERE media_type = 'photo' AND is_published = FALSE),
      COUNT(*) FILTER (WHERE media_type = 'photo' AND is_published = TRUE),
      COUNT(*) FILTER (WHERE media_type = 'video' AND is_published = TRUE),
      COUNT(*)
    INTO v_draft_photos, v_published_photos, v_published_videos, v_total_media
    FROM public.media_items;
  END IF;

  -- Assemble final JSON payload
  v_result := jsonb_build_object(
    'is_super_admin', v_is_super,
    'unread_notifications_count', v_unread_notifications,
    'recent_notifications', v_recent_notifications
  );

  IF v_has_rsvp THEN
    v_result := v_result || jsonb_build_object(
      'rsvp_metrics', jsonb_build_object(
        'pending_access_requests', v_pending_requests,
        'total_families', v_total_families,
        'attending_headcount', v_attending_headcount,
        'events_summary', v_events_summary
      )
    );
  END IF;

  IF v_has_wishes THEN
    v_result := v_result || jsonb_build_object(
      'wishes_metrics', jsonb_build_object(
        'pending_wishes', v_pending_wishes,
        'approved_wishes', v_approved_wishes
      )
    );
  END IF;

  IF v_has_questions THEN
    v_result := v_result || jsonb_build_object(
      'conversations_metrics', jsonb_build_object(
        'new_inquiries', v_new_inquiries,
        'in_progress_inquiries', v_in_progress_inquiries,
        'resolved_inquiries', v_resolved_inquiries
      )
    );
  END IF;

  IF v_has_photos THEN
    v_result := v_result || jsonb_build_object(
      'photos_metrics', jsonb_build_object(
        'draft_photos', v_draft_photos,
        'published_photos', v_published_photos,
        'published_videos', v_published_videos,
        'total_media', v_total_media
      )
    );
  END IF;

  RETURN v_result;
END;
$$;

-- 12. GRANTS ON ALL NEW RPCS
GRANT EXECUTE ON FUNCTION public.get_published_media(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_all_media(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_media_item(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, INTEGER, TEXT, BIGINT, TEXT, INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_media_item(UUID, TEXT, TEXT, BOOLEAN, BOOLEAN, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_media_item(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_media_published(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_media_download(UUID) TO authenticated;
