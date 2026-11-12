-- ==============================================================================
-- Migration: 20261101000012_login_based_family_rsvp.sql
-- Description:
--   Refactors the RSVP architecture to:
--   ONE GUEST ACCOUNT = ONE HOUSEHOLD = MULTIPLE FAMILY MEMBERS
--
--   1. Creates public.family_members table for self-service household members.
--   2. Links public.attendees to public.family_members (removes age category requirement).
--   3. Adds unique constraint: (rsvp_id, family_member_id) to prevent duplicate attendee selections.
--   4. Creates public.initialize_user_household() to automatically create a private household
--      and initial member for every registered user.
--   5. Updates handle_new_user() trigger to automatically initialize households upon registration
--      with immediate ordinary guest approval (is_approved_guest = TRUE).
--   6. Migrates existing profiles so all registered users have immediate access and initialized households.
--   7. Updates public.submit_family_rsvp() RPC to support member-based selection,
--      prevent duplicate RSVPs (ONE HOUSEHOLD + ONE CEREMONY = ONE RSVP), and maintain deadline locking.
--   8. Updates public.get_admin_rsvp_report() RPC to report confirmed individual attendees
--      without Adult/Child/Infant categories.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CREATE PUBLIC.FAMILY_MEMBERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_members_family_group_id
  ON public.family_members (family_group_id);

DROP TRIGGER IF EXISTS trg_family_members_set_updated_at ON public.family_members;
CREATE TRIGGER trg_family_members_set_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 2. LINK ATTENDEES TO FAMILY MEMBERS & RELAX AGE CATEGORY CONSTRAINT
-- ------------------------------------------------------------------------------
ALTER TABLE public.attendees
  ADD COLUMN IF NOT EXISTS family_member_id UUID NULL REFERENCES public.family_members(id) ON DELETE CASCADE;

-- Drop NOT NULL and check constraint on age_category for new attendee records
ALTER TABLE public.attendees
  ALTER COLUMN age_category DROP NOT NULL;

ALTER TABLE public.attendees
  DROP CONSTRAINT IF EXISTS attendees_age_category_check;

ALTER TABLE public.attendees
  ADD CONSTRAINT attendees_age_category_check
  CHECK (age_category IS NULL OR age_category IN ('adult', 'child', 'infant'));

-- Prevent duplicate member selections within a single ceremony RSVP
CREATE UNIQUE INDEX IF NOT EXISTS uq_rsvp_family_member
  ON public.attendees (rsvp_id, family_member_id)
  WHERE family_member_id IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 3. ROW-LEVEL SECURITY ON FAMILY_MEMBERS
-- ------------------------------------------------------------------------------
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "family_members_select_policy" ON public.family_members;
CREATE POLICY "family_members_select_policy"
  ON public.family_members
  FOR SELECT
  TO authenticated
  USING (
    family_group_id = (SELECT p.family_group_id FROM public.profiles p WHERE p.id = auth.uid())
    OR private.is_active_family_manager(family_group_id, auth.uid())
    OR private.is_super_admin(auth.uid())
    OR private.has_admin_permission('guest_rsvp', auth.uid())
  );

DROP POLICY IF EXISTS "family_members_insert_policy" ON public.family_members;
CREATE POLICY "family_members_insert_policy"
  ON public.family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    family_group_id = (SELECT p.family_group_id FROM public.profiles p WHERE p.id = auth.uid())
    OR private.is_active_family_manager(family_group_id, auth.uid())
    OR private.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "family_members_update_policy" ON public.family_members;
CREATE POLICY "family_members_update_policy"
  ON public.family_members
  FOR UPDATE
  TO authenticated
  USING (
    family_group_id = (SELECT p.family_group_id FROM public.profiles p WHERE p.id = auth.uid())
    OR private.is_active_family_manager(family_group_id, auth.uid())
    OR private.is_super_admin(auth.uid())
  )
  WITH CHECK (
    family_group_id = (SELECT p.family_group_id FROM public.profiles p WHERE p.id = auth.uid())
    OR private.is_active_family_manager(family_group_id, auth.uid())
    OR private.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "family_members_delete_policy" ON public.family_members;
CREATE POLICY "family_members_delete_policy"
  ON public.family_members
  FOR DELETE
  TO authenticated
  USING (
    family_group_id = (SELECT p.family_group_id FROM public.profiles p WHERE p.id = auth.uid())
    OR private.is_active_family_manager(family_group_id, auth.uid())
    OR private.is_super_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 4. HOUSEHOLD INITIALIZATION PROCEDURE
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.initialize_user_household(
  p_user_id UUID,
  p_full_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_name TEXT;
  v_existing_fg_id UUID;
  v_fg_id UUID;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check existing family_group_id on profile
  SELECT family_group_id, full_name INTO v_existing_fg_id, v_name
  FROM public.profiles
  WHERE id = p_user_id;

  v_name := COALESCE(NULLIF(TRIM(p_full_name), ''), NULLIF(TRIM(v_name), ''), 'Guest');

  IF v_existing_fg_id IS NOT NULL THEN
    -- Household already exists; ensure active manager and initial member exist
    INSERT INTO public.family_managers (family_group_id, profile_id, is_active)
    VALUES (v_existing_fg_id, p_user_id, TRUE)
    ON CONFLICT DO NOTHING;

    IF NOT EXISTS (
      SELECT 1 FROM public.family_members WHERE family_group_id = v_existing_fg_id
    ) THEN
      INSERT INTO public.family_members (family_group_id, name)
      VALUES (v_existing_fg_id, v_name);
    END IF;

    -- Ensure approved status
    UPDATE public.profiles
    SET is_approved_guest = TRUE
    WHERE id = p_user_id AND is_approved_guest = FALSE;

    RETURN v_existing_fg_id;
  END IF;

  -- Create private household for the user
  INSERT INTO public.family_groups (name, created_by)
  VALUES (v_name || ' Household', NULL)
  RETURNING id INTO v_fg_id;

  -- Update profile with household and immediate ordinary guest approval
  UPDATE public.profiles
  SET family_group_id = v_fg_id,
      is_approved_guest = TRUE
  WHERE id = p_user_id;

  -- Link created_by
  UPDATE public.family_groups
  SET created_by = p_user_id
  WHERE id = v_fg_id;

  -- Designate user as active manager of their household
  INSERT INTO public.family_managers (family_group_id, profile_id, is_active)
  VALUES (v_fg_id, p_user_id, TRUE)
  ON CONFLICT DO NOTHING;

  -- Add registered user as the initial family member
  INSERT INTO public.family_members (family_group_id, name)
  VALUES (v_fg_id, v_name);

  RETURN v_fg_id;
END;
$$;

REVOKE ALL ON FUNCTION public.initialize_user_household(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.initialize_user_household(UUID, TEXT) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 5. UPDATE HANDLE_NEW_USER TRIGGER FOR IMMEDIATE ACCESS & HOUSEHOLD SETUP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_full_name TEXT;
  v_fg_id UUID;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Guest');

  -- Create household for the newly registered user (created_by NULL initially to avoid circular FK)
  INSERT INTO public.family_groups (name, created_by)
  VALUES (v_full_name || ' Household', NULL)
  RETURNING id INTO v_fg_id;

  -- Insert profile: immediate ordinary approval, NO admin permissions granted
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    is_approved_guest,
    family_group_id
  )
  VALUES (
    NEW.id,
    v_full_name,
    NEW.email,
    TRUE,
    v_fg_id
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = CASE
        WHEN public.profiles.full_name = 'Guest' AND EXCLUDED.full_name != 'Guest'
        THEN EXCLUDED.full_name
        ELSE public.profiles.full_name
      END,
      is_approved_guest = TRUE,
      family_group_id = COALESCE(public.profiles.family_group_id, v_fg_id);

  -- Now that profile exists, update created_by on family_groups
  UPDATE public.family_groups
  SET created_by = NEW.id
  WHERE id = v_fg_id;

  -- Designate user as active manager of their household
  INSERT INTO public.family_managers (family_group_id, profile_id, is_active)
  VALUES (v_fg_id, NEW.id, TRUE)
  ON CONFLICT DO NOTHING;

  -- Add registered guest as the initial household member
  INSERT INTO public.family_members (family_group_id, name)
  VALUES (v_fg_id, v_full_name);

  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. MIGRATE EXISTING PROFILES FOR IMMEDIATE ACCESS & INITIALIZED HOUSEHOLDS
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
  v_new_fg UUID;
BEGIN
  -- A. Ensure all profiles have is_approved_guest = TRUE
  UPDATE public.profiles
  SET is_approved_guest = TRUE
  WHERE is_approved_guest = FALSE;

  -- B. Initialize households for profiles lacking one
  FOR r IN SELECT id, full_name FROM public.profiles WHERE family_group_id IS NULL LOOP
    v_new_fg := public.initialize_user_household(r.id, r.full_name);
  END LOOP;

  -- C. For existing family groups, ensure owner appears in family_members if empty
  INSERT INTO public.family_members (family_group_id, name)
  SELECT p.family_group_id, p.full_name
  FROM public.profiles p
  WHERE p.family_group_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.family_members fm WHERE fm.family_group_id = p.family_group_id
    );

  -- D. Ensure active family manager record exists for each profile's household
  INSERT INTO public.family_managers (family_group_id, profile_id, is_active)
  SELECT p.family_group_id, p.id, TRUE
  FROM public.profiles p
  WHERE p.family_group_id IS NOT NULL
  ON CONFLICT DO NOTHING;
END $$;

-- ------------------------------------------------------------------------------
-- 7. UPDATE ATOMIC FAMILY RSVP SUBMISSION RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_family_rsvp(
  p_event_id TEXT,
  p_family_group_id UUID,
  p_status TEXT,
  p_attendees JSONB DEFAULT '[]'::jsonb,
  p_arrival_details TEXT DEFAULT NULL,
  p_special_dietary_requests TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_user_fg_id UUID;
  v_deadline TIMESTAMPTZ;
  v_arrival TEXT;
  v_dietary TEXT;
  v_rsvp_id UUID;
  v_elem JSONB;
  v_member_id UUID;
  v_member_name TEXT;
  v_attendee_count INTEGER := 0;
  v_processed_members UUID[] := ARRAY[]::UUID[];
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  -- 1. Caller must be an approved wedding guest
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_caller_id AND is_approved_guest = TRUE
  ) THEN
    RAISE EXCEPTION 'Caller is not an approved wedding guest.' USING ERRCODE = '42501';
  END IF;

  -- 2. Caller must be the designated active family manager for target family group
  IF NOT private.is_active_family_manager(p_family_group_id, v_caller_id) THEN
    RAISE EXCEPTION 'Only the designated active family manager may submit RSVPs for this family group.' USING ERRCODE = '42501';
  END IF;

  -- 3. Verify event exists and deadline has not passed
  SELECT rsvp_deadline_utc INTO v_deadline
  FROM public.events
  WHERE id = p_event_id;

  IF v_deadline IS NULL THEN
    RAISE EXCEPTION 'Invalid ceremony identifier: %', p_event_id;
  END IF;

  IF NOW() >= v_deadline THEN
    RAISE EXCEPTION 'RSVP deadline for this ceremony has permanently passed.';
  END IF;

  -- 4. Validate RSVP status
  IF p_status NOT IN ('attending', 'not_attending', 'not_sure') THEN
    RAISE EXCEPTION 'Invalid RSVP status: %. Allowed statuses are attending, not_attending, not_sure.', p_status;
  END IF;

  -- 5. Sanitize optional notes
  v_arrival := NULLIF(TRIM(p_arrival_details), '');
  v_dietary := NULLIF(TRIM(p_special_dietary_requests), '');

  -- 6. Validate attendees if status is 'attending'
  IF p_status = 'attending' THEN
    IF p_attendees IS NULL OR jsonb_typeof(p_attendees) != 'array' OR jsonb_array_length(p_attendees) = 0 THEN
      RAISE EXCEPTION 'At least one attendee is required when attending.';
    END IF;
  END IF;

  -- 7. Upsert RSVP record (Guarantees ONE HOUSEHOLD + ONE CEREMONY = ONE RSVP)
  INSERT INTO public.rsvps (
    event_id,
    family_group_id,
    submitted_by,
    status,
    arrival_details,
    special_dietary_requests,
    submitted_at,
    updated_at
  ) VALUES (
    p_event_id,
    p_family_group_id,
    v_caller_id,
    p_status,
    v_arrival,
    v_dietary,
    NOW(),
    NOW()
  )
  ON CONFLICT (event_id, family_group_id) DO UPDATE SET
    submitted_by = EXCLUDED.submitted_by,
    status = EXCLUDED.status,
    arrival_details = EXCLUDED.arrival_details,
    special_dietary_requests = EXCLUDED.special_dietary_requests,
    submitted_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_rsvp_id;

  -- 8. Purge existing attendee records for this ceremony
  DELETE FROM public.attendees WHERE rsvp_id = v_rsvp_id;

  -- 9. Insert selected attendees if status is attending
  IF p_status = 'attending' THEN
    FOR v_elem IN SELECT * FROM jsonb_array_elements(p_attendees) LOOP
      v_member_id := NULL;
      v_member_name := NULL;

      -- Check if element has member_id or is a raw UUID string
      IF jsonb_typeof(v_elem) = 'string' THEN
        v_member_id := (v_elem #>> '{}')::UUID;
      ELSIF jsonb_typeof(v_elem) = 'object' AND v_elem ? 'member_id' THEN
        v_member_id := (v_elem->>'member_id')::UUID;
      END IF;

      IF v_member_id IS NOT NULL THEN
        -- Prevent duplicate member selection within a single RSVP
        IF v_member_id = ANY(v_processed_members) THEN
          RAISE EXCEPTION 'Duplicate family member selection detected in RSVP submission.';
        END IF;

        -- Verify member belongs to caller's household
        SELECT name INTO v_member_name
        FROM public.family_members
        WHERE id = v_member_id AND family_group_id = p_family_group_id;

        IF v_member_name IS NULL THEN
          RAISE EXCEPTION 'Selected family member does not belong to your household.' USING ERRCODE = '42501';
        END IF;

        INSERT INTO public.attendees (rsvp_id, family_member_id, full_name)
        VALUES (v_rsvp_id, v_member_id, v_member_name);

        v_processed_members := array_append(v_processed_members, v_member_id);
      ELSE
        -- Legacy support: object with full_name and age_category
        v_member_name := TRIM(COALESCE(v_elem->>'full_name', ''));
        IF v_member_name = '' THEN
          RAISE EXCEPTION 'Attendee full name cannot be blank.';
        END IF;

        IF v_elem ? 'age_category' THEN
          DECLARE
            v_cat TEXT := LOWER(TRIM(COALESCE(v_elem->>'age_category', '')));
          BEGIN
            IF v_cat NOT IN ('adult', 'child', 'infant') THEN
              RAISE EXCEPTION 'Invalid age category: %. Must be adult, child, or infant.', v_cat;
            END IF;
          END;
        END IF;

        INSERT INTO public.attendees (rsvp_id, full_name, age_category)
        VALUES (v_rsvp_id, v_member_name, v_elem->>'age_category');
      END IF;
    END LOOP;
  END IF;

  SELECT COUNT(*) INTO v_attendee_count FROM public.attendees WHERE rsvp_id = v_rsvp_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'rsvp_id', v_rsvp_id,
    'event_id', p_event_id,
    'status', p_status,
    'attendee_count', v_attendee_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_family_rsvp(TEXT, UUID, TEXT, JSONB, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_family_rsvp(TEXT, UUID, TEXT, JSONB, TEXT, TEXT) TO authenticated;

-- ------------------------------------------------------------------------------
-- 8. UPDATE ADMINISTRATOR RSVP REPORTING RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_rsvp_report()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
  v_total_families INTEGER;
  v_events_summary JSONB := '[]'::jsonb;
  v_family_details JSONB := '[]'::jsonb;
  v_evt RECORD;
  v_fam RECORD;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('guest_rsvp', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized: Requires guest_rsvp permission.' USING ERRCODE = '42501';
  END IF;

  -- Count total eligible family groups
  SELECT COUNT(*) INTO v_total_families FROM public.family_groups;

  -- Build summaries for each published event
  FOR v_evt IN
    SELECT
      e.id,
      e.title,
      e.ceremony_date,
      e.rsvp_deadline_utc,
      (NOW() >= e.rsvp_deadline_utc) AS is_deadline_passed
    FROM public.events e
    WHERE e.is_published = TRUE
    ORDER BY e.display_order ASC
  LOOP
    DECLARE
      v_attending_count INTEGER := 0;
      v_not_attending_count INTEGER := 0;
      v_not_sure_count INTEGER := 0;
      v_no_response_count INTEGER := 0;
      v_awaiting_count INTEGER := 0;
      v_total_attendees INTEGER := 0;
      v_responded_total INTEGER := 0;
    BEGIN
      -- Count responses per status
      SELECT
        COUNT(*) FILTER (WHERE r.status = 'attending'),
        COUNT(*) FILTER (WHERE r.status = 'not_attending'),
        COUNT(*) FILTER (WHERE r.status = 'not_sure')
      INTO
        v_attending_count,
        v_not_attending_count,
        v_not_sure_count
      FROM public.rsvps r
      WHERE r.event_id = v_evt.id;

      v_responded_total := v_attending_count + v_not_attending_count + v_not_sure_count;

      IF v_evt.is_deadline_passed THEN
        v_no_response_count := GREATEST(0, v_total_families - v_responded_total);
        v_awaiting_count := 0;
      ELSE
        v_no_response_count := 0;
        v_awaiting_count := GREATEST(0, v_total_families - v_responded_total);
      END IF;

      -- Total confirmed individual attendees across attending RSVPs
      SELECT COUNT(a.id) INTO v_total_attendees
      FROM public.rsvps r
      JOIN public.attendees a ON a.rsvp_id = r.id
      WHERE r.event_id = v_evt.id
        AND r.status = 'attending';

      v_events_summary := v_events_summary || jsonb_build_object(
        'event_id', v_evt.id,
        'title', v_evt.title,
        'ceremony_date', v_evt.ceremony_date,
        'rsvp_deadline_utc', v_evt.rsvp_deadline_utc,
        'is_deadline_passed', v_evt.is_deadline_passed,
        'total_eligible_families', v_total_families,
        'attending_families', v_attending_count,
        'not_attending_families', v_not_attending_count,
        'not_sure_families', v_not_sure_count,
        'no_response_families', v_no_response_count,
        'awaiting_response_families', v_awaiting_count,
        'total_attendees', v_total_attendees,
        'adult_count', 0,
        'child_count', 0,
        'infant_count', 0
      );
    END;
  END LOOP;

  -- Build drilldown for each family group
  FOR v_fam IN
    SELECT
      fg.id AS family_group_id,
      fg.name AS family_name,
      p.full_name AS manager_name,
      p.email AS manager_email,
      p.mobile_number AS manager_mobile
    FROM public.family_groups fg
    LEFT JOIN public.family_managers fm ON fm.family_group_id = fg.id AND fm.is_active = TRUE
    LEFT JOIN public.profiles p ON p.id = fm.profile_id
    ORDER BY fg.name ASC
  LOOP
    DECLARE
      v_family_responses JSONB := '[]'::jsonb;
      v_rsvp_rec RECORD;
    BEGIN
      FOR v_rsvp_rec IN
        SELECT
          e.id AS event_id,
          e.title AS event_title,
          e.rsvp_deadline_utc,
          (NOW() >= e.rsvp_deadline_utc) AS is_deadline_passed,
          r.id AS rsvp_id,
          r.status,
          r.arrival_details,
          r.special_dietary_requests,
          r.submitted_at
        FROM public.events e
        LEFT JOIN public.rsvps r ON r.event_id = e.id AND r.family_group_id = v_fam.family_group_id
        WHERE e.is_published = TRUE
        ORDER BY e.display_order ASC
      LOOP
        DECLARE
          v_display_status TEXT;
          v_atts JSONB := '[]'::jsonb;
          v_att_count INTEGER := 0;
        BEGIN
          IF v_rsvp_rec.status IS NOT NULL THEN
            v_display_status := v_rsvp_rec.status;
          ELSIF v_rsvp_rec.is_deadline_passed THEN
            v_display_status := 'no_response';
          ELSE
            v_display_status := 'awaiting_response';
          END IF;

          IF v_rsvp_rec.rsvp_id IS NOT NULL AND v_rsvp_rec.status = 'attending' THEN
            SELECT
              COALESCE(jsonb_agg(
                jsonb_build_object(
                  'full_name', a.full_name
                )
              ), '[]'::jsonb),
              COUNT(a.id)
            INTO v_atts, v_att_count
            FROM public.attendees a
            WHERE a.rsvp_id = v_rsvp_rec.rsvp_id;
          END IF;

          v_family_responses := v_family_responses || jsonb_build_object(
            'event_id', v_rsvp_rec.event_id,
            'event_title', v_rsvp_rec.event_title,
            'status', v_display_status,
            'has_responded', (v_rsvp_rec.status IS NOT NULL),
            'attendee_count', v_att_count,
            'attendees', v_atts,
            'arrival_details', v_rsvp_rec.arrival_details,
            'special_dietary_requests', v_rsvp_rec.special_dietary_requests,
            'submitted_at', v_rsvp_rec.submitted_at
          );
        END;
      END LOOP;

      v_family_details := v_family_details || jsonb_build_object(
        'family_group_id', v_fam.family_group_id,
        'family_name', v_fam.family_name,
        'manager_name', v_fam.manager_name,
        'manager_email', v_fam.manager_email,
        'manager_mobile', v_fam.manager_mobile,
        'responses', v_family_responses
      );
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'events_summary', v_events_summary,
    'families', v_family_details,
    'total_families', v_total_families
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_rsvp_report() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_rsvp_report() TO authenticated;
