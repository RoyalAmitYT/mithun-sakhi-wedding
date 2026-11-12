-- Migration 9: Digital Invitation Studio & Wedding Utilities (Phase P-13)
-- Architecture: docs/ARCHITECTURE_AND_SECURITY.md (Section 14)
-- Acceptance Criteria: TC-INV-01, TC-INV-02, TC-INV-03, TC-CAL-01, TC-CAL-02, TC-AUD-01

-- 1. ADD TEMPLATE & CUSTOMIZATION COLUMNS TO INVITATION SETTINGS
ALTER TABLE public.invitation_settings
  ADD COLUMN IF NOT EXISTS default_template TEXT NOT NULL DEFAULT 'cinematic',
  ADD COLUMN IF NOT EXISTS custom_announcement TEXT NULL;

-- Enforce valid template options
ALTER TABLE public.invitation_settings
  DROP CONSTRAINT IF EXISTS chk_invitation_default_template;

ALTER TABLE public.invitation_settings
  ADD CONSTRAINT chk_invitation_default_template CHECK (
    default_template IN ('cinematic', 'traditional')
  );

-- 2. PUBLIC RPC: GET INVITATION SETTINGS
-- Returns the active invitation configuration for public rendering.
CREATE OR REPLACE FUNCTION public.get_invitation_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', s.id,
    'headline_text', s.headline_text,
    'intro_text', s.intro_text,
    'qr_code_target_url', s.qr_code_target_url,
    'default_template', s.default_template,
    'custom_announcement', s.custom_announcement,
    'is_published', s.is_published,
    'updated_at', s.updated_at
  )
  INTO v_result
  FROM public.invitation_settings s
  WHERE s.id = 'default' AND s.is_published = TRUE;

  IF v_result IS NULL THEN
    -- Fallback default settings if unconfigured
    RETURN jsonb_build_object(
      'id', 'default',
      'headline_text', 'Celebrate the Wedding of',
      'intro_text', 'With the blessings of our parents, we warmly invite you to join us in celebrating the holy union of Mithun & Kabita.',
      'qr_code_target_url', 'https://mithun-kabita-wedding.vercel.app',
      'default_template', 'cinematic',
      'is_published', true
    );
  END IF;

  RETURN v_result;
END;
$$;

-- 3. ADMIN RPC: GET INVITATION SETTINGS
-- Strictly restricted to Super Admin or staff with the 'invitation_studio' permission group.
CREATE OR REPLACE FUNCTION public.admin_get_invitation_settings()
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

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('invitation_studio', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized: Caller lacks invitation_studio permission.' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'id', s.id,
    'headline_text', s.headline_text,
    'intro_text', s.intro_text,
    'qr_code_target_url', s.qr_code_target_url,
    'default_template', s.default_template,
    'custom_announcement', s.custom_announcement,
    'is_published', s.is_published,
    'created_at', s.created_at,
    'updated_at', s.updated_at
  )
  INTO v_result
  FROM public.invitation_settings s
  WHERE s.id = 'default';

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- 4. ADMIN RPC: UPDATE INVITATION SETTINGS
CREATE OR REPLACE FUNCTION public.admin_update_invitation_settings(
  p_headline_text TEXT,
  p_intro_text TEXT,
  p_qr_code_target_url TEXT,
  p_default_template TEXT,
  p_is_published BOOLEAN,
  p_custom_announcement TEXT DEFAULT NULL
)
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

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('invitation_studio', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized: Caller lacks invitation_studio permission.' USING ERRCODE = '42501';
  END IF;

  IF p_default_template NOT IN ('cinematic', 'traditional') THEN
    RAISE EXCEPTION 'Invalid default template: %. Must be cinematic or traditional.', p_default_template;
  END IF;

  IF p_headline_text IS NULL OR length(trim(p_headline_text)) = 0 THEN
    RAISE EXCEPTION 'Headline text cannot be empty.';
  END IF;

  IF p_qr_code_target_url IS NULL OR length(trim(p_qr_code_target_url)) = 0 THEN
    RAISE EXCEPTION 'QR Code target URL cannot be empty.';
  END IF;

  INSERT INTO public.invitation_settings (
    id,
    headline_text,
    intro_text,
    qr_code_target_url,
    default_template,
    is_published,
    custom_announcement,
    updated_at
  ) VALUES (
    'default',
    trim(p_headline_text),
    trim(p_intro_text),
    trim(p_qr_code_target_url),
    p_default_template,
    p_is_published,
    trim(p_custom_announcement),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    headline_text = EXCLUDED.headline_text,
    intro_text = EXCLUDED.intro_text,
    qr_code_target_url = EXCLUDED.qr_code_target_url,
    default_template = EXCLUDED.default_template,
    is_published = EXCLUDED.is_published,
    custom_announcement = EXCLUDED.custom_announcement,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'id', 'default',
    'headline_text', trim(p_headline_text),
    'default_template', p_default_template,
    'is_published', p_is_published
  );
END;
$$;

-- 5. UPDATE UNIFIED DASHBOARD METRICS WITH INVITATION METRICS
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
  v_has_invitation BOOLEAN;
  
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
  v_invitation_settings JSONB := NULL;
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
  v_has_invitation := v_is_super OR private.has_admin_permission('invitation_studio', v_caller_id);

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

  -- 6. Invitation Studio metrics (if authorized)
  IF v_has_invitation THEN
    SELECT jsonb_build_object(
      'is_published', s.is_published,
      'default_template', s.default_template,
      'headline_text', s.headline_text
    )
    INTO v_invitation_settings
    FROM public.invitation_settings s
    WHERE s.id = 'default';
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

  IF v_has_invitation AND v_invitation_settings IS NOT NULL THEN
    v_result := v_result || jsonb_build_object(
      'invitation_metrics', v_invitation_settings
    );
  END IF;

  RETURN v_result;
END;
$$;

-- 6. GRANTS
GRANT EXECUTE ON FUNCTION public.get_invitation_settings() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_invitation_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_invitation_settings(TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;
