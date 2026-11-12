-- ==============================================================================
-- Mithun & Kabita Wedding Website
-- Database Migration: 20261101000003_protect_profile_approval.sql
-- Description: Hardens profile access control, prevents guest self-approval,
--              enforces column-level least privilege on public.profiles,
--              adds defensive BEFORE UPDATE trigger, and implements
--              strictly authorized admin guest approval procedures.
-- Phase: P-07.2 Profile Approval Security Audit Remediation
-- ==============================================================================

-- ==============================================================================
-- 1. COLUMN-LEVEL PRIVILEGE RESTRICTION ON PROFILES
-- ==============================================================================
-- Previously, table-level UPDATE was granted to 'authenticated'.
-- Because PostgreSQL Row-Level Security evaluates row-matching conditions
-- (USING / WITH CHECK) rather than column boundaries, an authenticated user
-- could update any column on their own row, including 'is_approved_guest'
-- and 'family_group_id'.
--
-- We revoke broad table-level UPDATE from 'authenticated' and grant UPDATE
-- strictly on the user-editable profile attributes.
REVOKE UPDATE ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE (full_name, mobile_number, avatar_url) ON public.profiles TO authenticated;

-- ==============================================================================
-- 2. DEFENSIVE BEFORE UPDATE TRIGGER (DEFENSE-IN-DEPTH LAYER)
-- ==============================================================================
-- Enforces that even if table-level permissions or policies are modified,
-- access-controlling and identity fields ('is_approved_guest', 'family_group_id',
-- 'email', 'id') can NEVER be modified by non-admin authenticated users.
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_caller_id UUID;
  v_role TEXT;
  v_is_authorized_admin BOOLEAN := FALSE;
BEGIN
  -- If sensitive columns are untouched, permit update without additional checks
  IF (OLD.is_approved_guest IS NOT DISTINCT FROM NEW.is_approved_guest)
     AND (OLD.family_group_id IS NOT DISTINCT FROM NEW.family_group_id)
     AND (OLD.email IS NOT DISTINCT FROM NEW.email)
     AND (OLD.id IS NOT DISTINCT FROM NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Read caller context from Supabase auth environment
  v_role := auth.role();
  v_caller_id := auth.uid();

  -- Permit service_role backend operations or direct database administrative sessions
  -- (e.g. migrations or seeds run by postgres/supabase_admin without JWT)
  IF v_role = 'service_role'
     OR (v_role IS NULL AND v_caller_id IS NULL AND session_user IN ('postgres', 'supabase_admin')) THEN
    RETURN NEW;
  END IF;

  -- For authenticated users, verify administrator authorization
  IF v_caller_id IS NOT NULL THEN
    v_is_authorized_admin := private.is_super_admin(v_caller_id)
                          OR private.has_admin_permission('guest_rsvp', v_caller_id);
  END IF;

  IF v_is_authorized_admin THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter approval status, family assignment, or identity fields.';
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_fields();

-- ==============================================================================
-- 3. AUDITED ADMINISTRATIVE APPROVAL & FAMILY ASSIGNMENT PROCEDURES
-- ==============================================================================
-- Provides atomic, secure procedures for authorized administrators to approve
-- guests, revoke access, and assign family groups.

-- A. Approve Guest Access
CREATE OR REPLACE FUNCTION private.approve_guest_access(
  target_profile_id UUID,
  assigned_family_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
BEGIN
  IF v_admin_id IS NULL OR NOT (
    private.is_super_admin(v_admin_id) OR private.has_admin_permission('guest_rsvp', v_admin_id)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators with guest_rsvp permission can approve guest access.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_profile_id) THEN
    RAISE EXCEPTION 'Target profile does not exist: %', target_profile_id;
  END IF;

  IF assigned_family_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.family_groups WHERE id = assigned_family_id) THEN
    RAISE EXCEPTION 'Target family group does not exist: %', assigned_family_id;
  END IF;

  UPDATE public.profiles
  SET is_approved_guest = TRUE,
      family_group_id = COALESCE(assigned_family_id, family_group_id),
      updated_at = NOW()
  WHERE id = target_profile_id;

  -- Also approve any pending access request for this profile
  UPDATE public.access_requests
  SET status = 'approved',
      reviewed_by = v_admin_id,
      reviewed_at = NOW(),
      updated_at = NOW()
  WHERE profile_id = target_profile_id
    AND status = 'pending';
END;
$$;

-- B. Revoke Guest Access
CREATE OR REPLACE FUNCTION private.revoke_guest_access(
  target_profile_id UUID,
  revocation_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
BEGIN
  IF v_admin_id IS NULL OR NOT (
    private.is_super_admin(v_admin_id) OR private.has_admin_permission('guest_rsvp', v_admin_id)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators with guest_rsvp permission can revoke guest access.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_profile_id) THEN
    RAISE EXCEPTION 'Target profile does not exist: %', target_profile_id;
  END IF;

  UPDATE public.profiles
  SET is_approved_guest = FALSE,
      updated_at = NOW()
  WHERE id = target_profile_id;

  -- Record rejection reason if active request exists
  UPDATE public.access_requests
  SET status = 'rejected',
      rejection_reason = COALESCE(revocation_reason, 'Access revoked by administrator'),
      reviewed_by = v_admin_id,
      reviewed_at = NOW(),
      updated_at = NOW()
  WHERE profile_id = target_profile_id
    AND status = 'approved';
END;
$$;

-- C. Assign Family Group
CREATE OR REPLACE FUNCTION private.assign_family_group(
  target_profile_id UUID,
  target_family_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
BEGIN
  IF v_admin_id IS NULL OR NOT (
    private.is_super_admin(v_admin_id) OR private.has_admin_permission('guest_rsvp', v_admin_id)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators with guest_rsvp permission can assign family groups.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_profile_id) THEN
    RAISE EXCEPTION 'Target profile does not exist: %', target_profile_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.family_groups WHERE id = target_family_id) THEN
    RAISE EXCEPTION 'Target family group does not exist: %', target_family_id;
  END IF;

  UPDATE public.profiles
  SET family_group_id = target_family_id,
      updated_at = NOW()
  WHERE id = target_profile_id;
END;
$$;

-- Grant execution to authenticated role so client admins can execute via RPC
REVOKE ALL ON FUNCTION private.approve_guest_access(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.approve_guest_access(UUID, UUID) TO authenticated;

REVOKE ALL ON FUNCTION private.revoke_guest_access(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.revoke_guest_access(UUID, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION private.assign_family_group(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.assign_family_group(UUID, UUID) TO authenticated;

-- ==============================================================================
-- 4. REFINED ROW LEVEL SECURITY (RLS) POLICIES ON PROFILES
-- ==============================================================================
DROP POLICY IF EXISTS "profiles_update_own_or_super_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;

CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR private.is_super_admin(auth.uid())
    OR private.has_admin_permission('guest_rsvp', auth.uid())
  )
  WITH CHECK (
    id = auth.uid()
    OR private.is_super_admin(auth.uid())
    OR private.has_admin_permission('guest_rsvp', auth.uid())
  );

-- ==============================================================================
-- 5. RE-ASSERT METADATA ISOLATION IN HANDLE_NEW_USER
-- ==============================================================================
-- Explicitly guarantees that self-registered users cannot inject approval
-- or family assignment via auth metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    is_approved_guest,
    family_group_id
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Guest'),
    NEW.email,
    FALSE,
    NULL
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = CASE
        WHEN public.profiles.full_name = 'Guest' AND EXCLUDED.full_name != 'Guest'
        THEN EXCLUDED.full_name
        ELSE public.profiles.full_name
      END;
  RETURN NEW;
END;
$$;
