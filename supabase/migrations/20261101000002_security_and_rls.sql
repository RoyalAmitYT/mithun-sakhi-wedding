-- Migration: 20261101000002_security_and_rls.sql
-- Description: Row Level Security (RLS) policies, table privilege grants, and security definers
-- Authoritative Architecture: docs/ARCHITECTURE_AND_SECURITY.md

-- ==============================================================================
-- 1. SECURITY DEFINER HELPER FUNCTIONS (Schema: private)
-- ==============================================================================

-- Helper: Check if user is active Super Admin
CREATE OR REPLACE FUNCTION private.is_super_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = check_user_id
      AND is_super_admin = TRUE
      AND is_active = TRUE
  );
END;
$$;

-- Helper: Check if user holds active admin permission group (Super Admin has all permissions)
CREATE OR REPLACE FUNCTION private.has_admin_permission(check_permission TEXT, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = check_user_id
      AND is_super_admin = TRUE
      AND is_active = TRUE
  ) THEN
    RETURN TRUE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users u
    JOIN public.admin_permissions p ON p.admin_id = u.id
    WHERE u.id = check_user_id
      AND u.is_active = TRUE
      AND p.permission_group = check_permission
  );
END;
$$;

-- Helper: Check if user is active manager of specific family group
CREATE OR REPLACE FUNCTION private.is_active_family_manager(check_family_id UUID, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF check_user_id IS NULL OR check_family_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.family_managers
    WHERE family_group_id = check_family_id
      AND profile_id = check_user_id
      AND is_active = TRUE
  );
END;
$$;

-- Helper: Check if user is a member of family group
CREATE OR REPLACE FUNCTION private.is_family_member(check_family_id UUID, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF check_user_id IS NULL OR check_family_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = check_user_id
      AND family_group_id = check_family_id
  );
END;
$$;

-- Helper: Check if user can access RSVP (family member or manager or guest_rsvp admin)
CREATE OR REPLACE FUNCTION private.can_access_rsvp(check_rsvp_id UUID, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_family_id UUID;
BEGIN
  IF check_user_id IS NULL OR check_rsvp_id IS NULL THEN
    RETURN FALSE;
  END IF;
  IF private.has_admin_permission('guest_rsvp', check_user_id) THEN
    RETURN TRUE;
  END IF;
  SELECT family_group_id INTO v_family_id
  FROM public.rsvps
  WHERE id = check_rsvp_id;

  IF v_family_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN private.is_family_member(v_family_id, check_user_id);
END;
$$;

-- Grant execution to authenticated role only (revoked from PUBLIC)
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_admin_permission(TEXT, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION private.is_active_family_manager(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_family_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_access_rsvp(UUID, UUID) TO authenticated;

-- Ensure bootstrap_super_admin can NEVER be executed by client roles
REVOKE ALL ON FUNCTION private.bootstrap_super_admin(TEXT) FROM PUBLIC, anon, authenticated;

-- ==============================================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS) ON ALL 15 PUBLIC TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. REVOKE DEFAULT TABLE PRIVILEGES & APPLY LEAST PRIVILEGE GRANTS
-- ==============================================================================
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;

-- Public / Anonymous Grants (Strictly read-only on published/approved data)
GRANT SELECT ON public.events TO anon, authenticated;
GRANT SELECT ON public.wishes TO anon, authenticated;
GRANT SELECT ON public.media_items TO anon, authenticated;
GRANT SELECT ON public.invitation_settings TO anon, authenticated;

-- Authenticated User Grants (Controlled through RLS policies)
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_managers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.access_requests TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.rsvps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendees TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wishes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT, INSERT ON public.conversation_messages TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.invitation_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_permissions TO authenticated;
GRANT SELECT, UPDATE ON public.admin_notifications TO authenticated;

-- ==============================================================================
-- 4. ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR private.has_admin_permission('guest_rsvp', auth.uid())
    OR private.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "profiles_update_own_or_super_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_super_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() OR private.is_super_admin(auth.uid())
  )
  WITH CHECK (
    id = auth.uid() OR private.is_super_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- FAMILY GROUPS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "family_groups_select" ON public.family_groups;
CREATE POLICY "family_groups_select" ON public.family_groups
  FOR SELECT TO authenticated
  USING (
    private.is_family_member(id, auth.uid())
    OR private.has_admin_permission('guest_rsvp', auth.uid())
  );

DROP POLICY IF EXISTS "family_groups_admin_manage" ON public.family_groups;
CREATE POLICY "family_groups_admin_manage" ON public.family_groups
  FOR ALL TO authenticated
  USING (private.has_admin_permission('guest_rsvp', auth.uid()))
  WITH CHECK (private.has_admin_permission('guest_rsvp', auth.uid()));

-- ------------------------------------------------------------------------------
-- FAMILY MANAGERS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "family_managers_select" ON public.family_managers;
CREATE POLICY "family_managers_select" ON public.family_managers
  FOR SELECT TO authenticated
  USING (
    private.is_family_member(family_group_id, auth.uid())
    OR private.has_admin_permission('guest_rsvp', auth.uid())
  );

DROP POLICY IF EXISTS "family_managers_super_admin_manage" ON public.family_managers;
CREATE POLICY "family_managers_super_admin_manage" ON public.family_managers
  FOR ALL TO authenticated
  USING (private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_super_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- ACCESS REQUESTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "access_requests_select" ON public.access_requests;
CREATE POLICY "access_requests_select" ON public.access_requests
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR private.has_admin_permission('guest_rsvp', auth.uid())
  );

DROP POLICY IF EXISTS "access_requests_insert_own" ON public.access_requests;
CREATE POLICY "access_requests_insert_own" ON public.access_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "access_requests_update_admin" ON public.access_requests;
CREATE POLICY "access_requests_update_admin" ON public.access_requests
  FOR UPDATE TO authenticated
  USING (private.has_admin_permission('guest_rsvp', auth.uid()))
  WITH CHECK (private.has_admin_permission('guest_rsvp', auth.uid()));

-- ------------------------------------------------------------------------------
-- EVENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "events_select_published" ON public.events;
DROP POLICY IF EXISTS "events_select_anon" ON public.events;
CREATE POLICY "events_select_anon" ON public.events
  FOR SELECT TO anon
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "events_select_authenticated" ON public.events;
CREATE POLICY "events_select_authenticated" ON public.events
  FOR SELECT TO authenticated
  USING (
    is_published = TRUE
    OR private.has_admin_permission('events_website', auth.uid())
  );

DROP POLICY IF EXISTS "events_admin_manage" ON public.events;
CREATE POLICY "events_admin_manage" ON public.events
  FOR ALL TO authenticated
  USING (private.has_admin_permission('events_website', auth.uid()))
  WITH CHECK (private.has_admin_permission('events_website', auth.uid()));

-- ------------------------------------------------------------------------------
-- RSVPS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "rsvps_select" ON public.rsvps;
CREATE POLICY "rsvps_select" ON public.rsvps
  FOR SELECT TO authenticated
  USING (private.can_access_rsvp(id, auth.uid()));

DROP POLICY IF EXISTS "rsvps_insert_manager" ON public.rsvps;
CREATE POLICY "rsvps_insert_manager" ON public.rsvps
  FOR INSERT TO authenticated
  WITH CHECK (
    private.is_active_family_manager(family_group_id, auth.uid())
    AND submitted_by = auth.uid()
  );

DROP POLICY IF EXISTS "rsvps_update_manager" ON public.rsvps;
CREATE POLICY "rsvps_update_manager" ON public.rsvps
  FOR UPDATE TO authenticated
  USING (private.is_active_family_manager(family_group_id, auth.uid()))
  WITH CHECK (private.is_active_family_manager(family_group_id, auth.uid()));

-- ------------------------------------------------------------------------------
-- ATTENDEES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "attendees_select" ON public.attendees;
CREATE POLICY "attendees_select" ON public.attendees
  FOR SELECT TO authenticated
  USING (private.can_access_rsvp(rsvp_id, auth.uid()));

DROP POLICY IF EXISTS "attendees_insert_manager" ON public.attendees;
CREATE POLICY "attendees_insert_manager" ON public.attendees
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rsvps r
      WHERE r.id = rsvp_id
        AND private.is_active_family_manager(r.family_group_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "attendees_update_manager" ON public.attendees;
CREATE POLICY "attendees_update_manager" ON public.attendees
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rsvps r
      WHERE r.id = rsvp_id
        AND private.is_active_family_manager(r.family_group_id, auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rsvps r
      WHERE r.id = rsvp_id
        AND private.is_active_family_manager(r.family_group_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "attendees_delete_manager" ON public.attendees;
CREATE POLICY "attendees_delete_manager" ON public.attendees
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rsvps r
      WHERE r.id = rsvp_id
        AND private.is_active_family_manager(r.family_group_id, auth.uid())
    )
  );

-- ------------------------------------------------------------------------------
-- WISHES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "wishes_select" ON public.wishes;
DROP POLICY IF EXISTS "wishes_select_anon" ON public.wishes;
CREATE POLICY "wishes_select_anon" ON public.wishes
  FOR SELECT TO anon
  USING (status = 'approved');

DROP POLICY IF EXISTS "wishes_select_authenticated" ON public.wishes;
CREATE POLICY "wishes_select_authenticated" ON public.wishes
  FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR (auth.uid() IS NOT NULL AND profile_id = auth.uid())
    OR private.has_admin_permission('wishes', auth.uid())
  );

DROP POLICY IF EXISTS "wishes_insert_own" ON public.wishes;
CREATE POLICY "wishes_insert_own" ON public.wishes
  FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "wishes_update_own_or_admin" ON public.wishes;
CREATE POLICY "wishes_update_own_or_admin" ON public.wishes
  FOR UPDATE TO authenticated
  USING (
    profile_id = auth.uid()
    OR private.has_admin_permission('wishes', auth.uid())
  )
  WITH CHECK (
    profile_id = auth.uid()
    OR private.has_admin_permission('wishes', auth.uid())
  );

DROP POLICY IF EXISTS "wishes_delete_own_or_admin" ON public.wishes;
CREATE POLICY "wishes_delete_own_or_admin" ON public.wishes
  FOR DELETE TO authenticated
  USING (
    profile_id = auth.uid()
    OR private.has_admin_permission('wishes', auth.uid())
  );

-- ------------------------------------------------------------------------------
-- CONVERSATIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "conversations_select" ON public.conversations;
CREATE POLICY "conversations_select" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR private.has_admin_permission('questions', auth.uid())
  );

DROP POLICY IF EXISTS "conversations_insert_own" ON public.conversations;
CREATE POLICY "conversations_insert_own" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "conversations_update_own_or_admin" ON public.conversations;
CREATE POLICY "conversations_update_own_or_admin" ON public.conversations
  FOR UPDATE TO authenticated
  USING (
    profile_id = auth.uid()
    OR private.has_admin_permission('questions', auth.uid())
  )
  WITH CHECK (
    profile_id = auth.uid()
    OR private.has_admin_permission('questions', auth.uid())
  );

-- ------------------------------------------------------------------------------
-- CONVERSATION MESSAGES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "messages_select" ON public.conversation_messages;
CREATE POLICY "messages_select" ON public.conversation_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.profile_id = auth.uid() OR private.has_admin_permission('questions', auth.uid()))
    )
  );

DROP POLICY IF EXISTS "messages_insert" ON public.conversation_messages;
CREATE POLICY "messages_insert" ON public.conversation_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.profile_id = auth.uid() OR private.has_admin_permission('questions', auth.uid()))
    )
  );

-- ------------------------------------------------------------------------------
-- MEDIA ITEMS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "media_select_published" ON public.media_items;
DROP POLICY IF EXISTS "media_select_anon" ON public.media_items;
CREATE POLICY "media_select_anon" ON public.media_items
  FOR SELECT TO anon
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "media_select_authenticated" ON public.media_items;
CREATE POLICY "media_select_authenticated" ON public.media_items
  FOR SELECT TO authenticated
  USING (
    is_published = TRUE
    OR private.has_admin_permission('photos', auth.uid())
  );

DROP POLICY IF EXISTS "media_admin_manage" ON public.media_items;
CREATE POLICY "media_admin_manage" ON public.media_items
  FOR ALL TO authenticated
  USING (private.has_admin_permission('photos', auth.uid()))
  WITH CHECK (private.has_admin_permission('photos', auth.uid()));

-- ------------------------------------------------------------------------------
-- INVITATION SETTINGS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "invitation_select_published" ON public.invitation_settings;
DROP POLICY IF EXISTS "invitation_select_anon" ON public.invitation_settings;
CREATE POLICY "invitation_select_anon" ON public.invitation_settings
  FOR SELECT TO anon
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "invitation_select_authenticated" ON public.invitation_settings;
CREATE POLICY "invitation_select_authenticated" ON public.invitation_settings
  FOR SELECT TO authenticated
  USING (
    is_published = TRUE
    OR private.has_admin_permission('invitation_studio', auth.uid())
  );

DROP POLICY IF EXISTS "invitation_admin_manage" ON public.invitation_settings;
CREATE POLICY "invitation_admin_manage" ON public.invitation_settings
  FOR ALL TO authenticated
  USING (private.has_admin_permission('invitation_studio', auth.uid()))
  WITH CHECK (private.has_admin_permission('invitation_studio', auth.uid()));

-- ------------------------------------------------------------------------------
-- ADMIN USERS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_users_select" ON public.admin_users;
CREATE POLICY "admin_users_select" ON public.admin_users
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR private.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "admin_users_super_admin_manage" ON public.admin_users;
CREATE POLICY "admin_users_super_admin_manage" ON public.admin_users
  FOR ALL TO authenticated
  USING (private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_super_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- ADMIN PERMISSIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_permissions_select" ON public.admin_permissions;
CREATE POLICY "admin_permissions_select" ON public.admin_permissions
  FOR SELECT TO authenticated
  USING (
    admin_id = auth.uid()
    OR private.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "admin_permissions_super_admin_manage" ON public.admin_permissions;
CREATE POLICY "admin_permissions_super_admin_manage" ON public.admin_permissions
  FOR ALL TO authenticated
  USING (private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_super_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- ADMIN NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_notifications_select" ON public.admin_notifications;
CREATE POLICY "admin_notifications_select" ON public.admin_notifications
  FOR SELECT TO authenticated
  USING (
    private.has_admin_permission(permission_group, auth.uid())
    OR private.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "admin_notifications_update" ON public.admin_notifications;
CREATE POLICY "admin_notifications_update" ON public.admin_notifications
  FOR UPDATE TO authenticated
  USING (
    private.has_admin_permission(permission_group, auth.uid())
    OR private.is_super_admin(auth.uid())
  )
  WITH CHECK (
    private.has_admin_permission(permission_group, auth.uid())
    OR private.is_super_admin(auth.uid())
  );
