-- ==============================================================================
-- Mithun & Kabita Wedding Website
-- Database Migration: 20261101000004_access_request_workflow.sql
-- Description: Adds duplicate pending request constraint, approved guest request
--              guard trigger, and public atomic admin review RPC procedure.
-- Phase: P-08 Authentication, Profiles & Guest Approval Workflow
-- ==============================================================================

-- ==============================================================================
-- 1. CONSTRAINTS: PREVENT DUPLICATE PENDING REQUESTS PER PROFILE
-- ==============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_pending_access_request
  ON public.access_requests (profile_id)
  WHERE status = 'pending';

-- ==============================================================================
-- 2. TRIGGER: PREVENT ALREADY APPROVED GUESTS FROM SUBMITTING ACCESS REQUESTS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_access_request_eligibility()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = NEW.profile_id AND is_approved_guest = TRUE
  ) THEN
    RAISE EXCEPTION 'Guest profile is already approved. Cannot submit new access request.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_access_request_eligibility ON public.access_requests;
CREATE TRIGGER trg_check_access_request_eligibility
  BEFORE INSERT ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.check_access_request_eligibility();

-- ==============================================================================
-- 3. PUBLIC ADMIN REVIEW RPC PROCEDURE
-- ==============================================================================
-- Allows authenticated administrators with 'guest_rsvp' permission to review
-- access requests atomically through PostgREST RPC, managing approval,
-- rejection, family group creation/assignment, and active manager assignment.
CREATE OR REPLACE FUNCTION public.admin_review_access_request(
  p_request_id UUID,
  p_decision TEXT,
  p_rejection_reason TEXT DEFAULT NULL,
  p_family_name TEXT DEFAULT NULL,
  p_existing_family_id UUID DEFAULT NULL,
  p_make_family_manager BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_request RECORD;
  v_family_id UUID;
  v_clean_reason TEXT;
BEGIN
  -- 1. Verify administrative authorization
  IF v_admin_id IS NULL OR NOT (
    private.is_super_admin(v_admin_id) OR private.has_admin_permission('guest_rsvp', v_admin_id)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators with guest_rsvp permission can review access requests.';
  END IF;

  -- 2. Validate decision
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid decision: % (must be "approved" or "rejected")', p_decision;
  END IF;

  -- 3. Fetch target access request
  SELECT * INTO v_request
  FROM public.access_requests
  WHERE id = p_request_id;

  IF v_request.id IS NULL THEN
    RAISE EXCEPTION 'Access request not found: %', p_request_id;
  END IF;

  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'Access request has already been reviewed (current status: %)', v_request.status;
  END IF;

  -- 4. Execute rejection branch
  IF p_decision = 'rejected' THEN
    v_clean_reason := TRIM(COALESCE(p_rejection_reason, ''));
    IF v_clean_reason = '' THEN
      RAISE EXCEPTION 'A non-empty rejection reason is mandatory when rejecting an access request.';
    END IF;

    UPDATE public.access_requests
    SET status = 'rejected',
        rejection_reason = v_clean_reason,
        reviewed_by = v_admin_id,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_request_id;

    RETURN jsonb_build_object(
      'success', true,
      'request_id', p_request_id,
      'status', 'rejected',
      'rejection_reason', v_clean_reason
    );
  END IF;

  -- 5. Execute approval branch
  -- A. Determine or create family group
  IF p_existing_family_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.family_groups WHERE id = p_existing_family_id) THEN
      RAISE EXCEPTION 'Specified family group does not exist: %', p_existing_family_id;
    END IF;
    v_family_id := p_existing_family_id;
  ELSIF p_family_name IS NOT NULL AND TRIM(p_family_name) != '' THEN
    INSERT INTO public.family_groups (id, name, created_by)
    VALUES (gen_random_uuid(), TRIM(p_family_name), v_request.profile_id)
    RETURNING id INTO v_family_id;
  ELSE
    INSERT INTO public.family_groups (id, name, created_by)
    VALUES (gen_random_uuid(), TRIM(v_request.invited_family_name), v_request.profile_id)
    RETURNING id INTO v_family_id;
  END IF;

  -- B. Update profile to approved status and assign family group
  UPDATE public.profiles
  SET is_approved_guest = TRUE,
      family_group_id = v_family_id,
      updated_at = NOW()
  WHERE id = v_request.profile_id;

  -- C. Handle active family manager assignment if requested
  IF p_make_family_manager THEN
    -- Deactivate any existing active manager for this family group to maintain single-active constraint
    UPDATE public.family_managers
    SET is_active = FALSE,
        revoked_at = NOW()
    WHERE family_group_id = v_family_id AND is_active = TRUE;

    -- Insert new active manager
    INSERT INTO public.family_managers (
      family_group_id,
      profile_id,
      is_active,
      assigned_at,
      assigned_by
    ) VALUES (
      v_family_id,
      v_request.profile_id,
      TRUE,
      NOW(),
      v_admin_id
    );
  END IF;

  -- D. Update access request status to approved
  UPDATE public.access_requests
  SET status = 'approved',
      rejection_reason = NULL,
      reviewed_by = v_admin_id,
      reviewed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_request_id;

  RETURN jsonb_build_object(
    'success', true,
    'request_id', p_request_id,
    'status', 'approved',
    'family_group_id', v_family_id,
    'is_family_manager', p_make_family_manager
  );
END;
$$;

-- Revoke from public/anon, grant to authenticated
REVOKE ALL ON FUNCTION public.admin_review_access_request(UUID, TEXT, TEXT, TEXT, UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_access_request(UUID, TEXT, TEXT, TEXT, UUID, BOOLEAN) TO authenticated;
