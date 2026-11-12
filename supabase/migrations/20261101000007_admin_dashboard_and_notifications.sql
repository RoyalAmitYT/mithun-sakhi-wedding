-- ==============================================================================
-- Migration: 20261101000007_admin_dashboard_and_notifications.sql
-- Description: Phase P-11 Unified Wedding Admin Dashboard & Notifications Engine:
--   1. Single Super Admin unique partial index constraint (TC-ADM-01).
--   2. Internal notification automation triggers (TC-ADM-04).
--   3. Notification read-state management RPCs.
--   4. Super Admin team management RPCs (TC-ADM-02, TC-ADM-03).
--   5. Unified permission-scoped dashboard metrics RPC.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SINGLE SUPER ADMIN PARTIAL UNIQUE INDEX (TC-ADM-01)
-- ------------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_super_admin
  ON public.admin_users (is_super_admin)
  WHERE is_super_admin = TRUE;

-- ------------------------------------------------------------------------------
-- 2. NOTIFICATION AUTOMATION HELPER & TRIGGERS (TC-ADM-04)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.create_admin_notification(
  p_permission_group TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_entity_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.admin_notifications (
    permission_group,
    title,
    message,
    related_entity_id,
    is_read,
    created_at
  )
  VALUES (
    p_permission_group,
    p_title,
    p_message,
    p_related_entity_id,
    FALSE,
    NOW()
  );
END;
$$;

-- Trigger: Notify guest_rsvp admins when an access request is submitted
CREATE OR REPLACE FUNCTION public.handle_access_request_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.role() = 'authenticated' THEN
    PERFORM private.create_admin_notification(
      'guest_rsvp',
      'New Access Request',
      'Guest request submitted for: ' || COALESCE(NEW.invited_family_name, 'Family') || ' (' || COALESCE(NEW.relationship_to_couple, 'Guest') || ')',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_access_requests_notify ON public.access_requests;
CREATE TRIGGER trg_access_requests_notify
  AFTER INSERT ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_access_request_notification();

-- Trigger: Notify wishes admins when a blessing is submitted
CREATE OR REPLACE FUNCTION public.handle_wish_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.role() = 'authenticated' AND NEW.status = 'pending' THEN
    PERFORM private.create_admin_notification(
      'wishes',
      'New Blessing Submitted',
      'A blessing from ' || COALESCE(NEW.author_display_name, 'a guest') || ' is awaiting review.',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wishes_notify ON public.wishes;
CREATE TRIGGER trg_wishes_notify
  AFTER INSERT ON public.wishes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_wish_notification();

-- Trigger: Notify questions admins when a guest sends a message
CREATE OR REPLACE FUNCTION public.handle_conversation_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.role() = 'authenticated' AND NOT NEW.is_from_admin THEN
    PERFORM private.create_admin_notification(
      'questions',
      'New Guest Inquiry',
      'A new private question was received from a guest.',
      NEW.conversation_id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_conversation_messages_notify ON public.conversation_messages;
CREATE TRIGGER trg_conversation_messages_notify
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_conversation_message_notification();

-- ------------------------------------------------------------------------------
-- 3. NOTIFICATION MANAGEMENT RPCS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_mark_notification_read(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_perm_group TEXT;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  SELECT permission_group INTO v_perm_group
  FROM public.admin_notifications
  WHERE id = p_notification_id;

  IF v_perm_group IS NULL THEN
    RAISE EXCEPTION 'Notification not found.' USING ERRCODE = 'P0002';
  END IF;

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission(v_perm_group, v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized: Caller does not hold permission for this notification.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.admin_notifications
  SET is_read = TRUE
  WHERE id = p_notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_is_super BOOLEAN;
  v_updated_count INTEGER := 0;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  v_is_super := private.is_super_admin(v_caller_id);

  IF v_is_super THEN
    UPDATE public.admin_notifications
    SET is_read = TRUE
    WHERE is_read = FALSE;
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  ELSE
    UPDATE public.admin_notifications n
    SET is_read = TRUE
    WHERE n.is_read = FALSE
      AND private.has_admin_permission(n.permission_group, v_caller_id);
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  END IF;

  RETURN v_updated_count;
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. SUPER ADMIN TEAM MANAGEMENT RPCS (TC-ADM-02, TC-ADM-03)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_team()
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

  IF NOT private.is_super_admin(v_caller_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only Super Administrator can view admin team roster.' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', u.id,
      'is_super_admin', u.is_super_admin,
      'is_active', u.is_active,
      'created_at', u.created_at,
      'full_name', p.full_name,
      'email', p.email,
      'mobile_number', p.mobile_number,
      'permissions', COALESCE(
        (
          SELECT jsonb_agg(perm.permission_group ORDER BY perm.permission_group)
          FROM public.admin_permissions perm
          WHERE perm.admin_id = u.id
        ),
        '[]'::jsonb
      )
    )
    ORDER BY u.is_super_admin DESC, u.created_at ASC
  )
  INTO v_result
  FROM public.admin_users u
  JOIN public.profiles p ON p.id = u.id;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_manage_admin_user(
  p_admin_id UUID,
  p_is_active BOOLEAN,
  p_permissions TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_is_target_super BOOLEAN;
  v_perm TEXT;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  -- 1. Strictly enforce Super Admin authority
  IF NOT private.is_super_admin(v_caller_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only the Super Administrator can manage admin roles.' USING ERRCODE = '42501';
  END IF;

  -- 2. Prevent tampering with Super Admin record
  SELECT is_super_admin INTO v_is_target_super
  FROM public.admin_users
  WHERE id = p_admin_id;

  IF v_is_target_super = TRUE THEN
    IF p_is_active = FALSE THEN
      RAISE EXCEPTION 'Super Administrator account cannot be deactivated.';
    END IF;
    -- Super Admin already possesses all privileges implicitly
    RETURN jsonb_build_object('success', true, 'message', 'Super Administrator status preserved.');
  END IF;

  -- 3. Upsert admin user record
  INSERT INTO public.admin_users (id, is_super_admin, is_active, updated_at)
  VALUES (p_admin_id, FALSE, p_is_active, NOW())
  ON CONFLICT (id) DO UPDATE
  SET is_active = EXCLUDED.is_active,
      updated_at = NOW();

  -- 4. Replace permissions
  DELETE FROM public.admin_permissions WHERE admin_id = p_admin_id;

  IF p_permissions IS NOT NULL AND array_length(p_permissions, 1) > 0 THEN
    FOREACH v_perm IN ARRAY p_permissions LOOP
      IF v_perm NOT IN ('guest_rsvp', 'photos', 'wishes', 'questions', 'events_website', 'invitation_studio') THEN
        RAISE EXCEPTION 'Invalid permission group: %', v_perm;
      END IF;

      INSERT INTO public.admin_permissions (admin_id, permission_group)
      VALUES (p_admin_id, v_perm)
      ON CONFLICT (admin_id, permission_group) DO NOTHING;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'admin_id', p_admin_id,
    'is_active', p_is_active,
    'permissions', COALESCE(p_permissions, ARRAY[]::text[])
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. UNIFIED PERMISSION-SCOPED DASHBOARD METRICS RPC
-- ------------------------------------------------------------------------------
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

  RETURN v_result;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.admin_mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_mark_all_notifications_read() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_team() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_manage_admin_user(UUID, BOOLEAN, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_metrics() TO authenticated;
