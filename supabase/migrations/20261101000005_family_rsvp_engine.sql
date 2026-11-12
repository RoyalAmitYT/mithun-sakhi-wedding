-- ==============================================================================
-- Migration: 20261101000005_family_rsvp_engine.sql
-- Phase: P-09 — Family RSVP Engine, Attendee Management & Admin Reporting
-- Description:
--   1. Upgrades RSVP deadline trigger to cover DELETE operations.
--   2. Adds deadline trigger to public.attendees covering INSERT, UPDATE, DELETE.
--   3. Implements atomic public.submit_family_rsvp(...) RPC with strict attendee
--      validation for 'attending', automatic purging on 'not_attending'/'not_sure',
--      and active family manager verification.
--   4. Implements public.get_admin_rsvp_report() RPC with ceremony summaries,
--      headcount breakdowns, derived 'no_response' calculation, and family drilldown.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HARDEN RSVP DEADLINE TRIGGER TO COVER DELETE OPERATIONS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_rsvp_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_id TEXT;
  v_deadline TIMESTAMPTZ;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_event_id := OLD.event_id;
  ELSE
    v_event_id := NEW.event_id;
  END IF;

  SELECT rsvp_deadline_utc INTO v_deadline
  FROM public.events
  WHERE id = v_event_id;

  IF v_deadline IS NOT NULL AND NOW() >= v_deadline THEN
    RAISE EXCEPTION 'RSVP deadline for this ceremony has permanently passed.';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_rsvps_check_deadline ON public.rsvps;
CREATE TRIGGER trg_rsvps_check_deadline
  BEFORE INSERT OR UPDATE OR DELETE ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.check_rsvp_deadline();

-- ------------------------------------------------------------------------------
-- 2. ATTENDEE DEADLINE GUARD TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_attendee_rsvp_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rsvp_id UUID;
  v_deadline TIMESTAMPTZ;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_rsvp_id := OLD.rsvp_id;
  ELSE
    v_rsvp_id := NEW.rsvp_id;
  END IF;

  SELECT e.rsvp_deadline_utc INTO v_deadline
  FROM public.rsvps r
  JOIN public.events e ON e.id = r.event_id
  WHERE r.id = v_rsvp_id;

  IF v_deadline IS NOT NULL AND NOW() >= v_deadline THEN
    RAISE EXCEPTION 'RSVP deadline for this ceremony has permanently passed.';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_attendees_check_deadline ON public.attendees;
CREATE TRIGGER trg_attendees_check_deadline
  BEFORE INSERT OR UPDATE OR DELETE ON public.attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.check_attendee_rsvp_deadline();

-- ------------------------------------------------------------------------------
-- 3. ATOMIC FAMILY RSVP SUBMISSION RPC
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
  v_deadline TIMESTAMPTZ;
  v_arrival TEXT;
  v_dietary TEXT;
  v_rsvp_id UUID;
  v_elem JSONB;
  v_name TEXT;
  v_category TEXT;
  v_attendee_count INTEGER := 0;
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

  -- 6. Validate attendees if attending
  IF p_status = 'attending' THEN
    IF p_attendees IS NULL OR jsonb_typeof(p_attendees) != 'array' OR jsonb_array_length(p_attendees) = 0 THEN
      RAISE EXCEPTION 'At least one attendee is required when attending.';
    END IF;

    FOR v_elem IN SELECT * FROM jsonb_array_elements(p_attendees) LOOP
      v_name := TRIM(COALESCE(v_elem->>'full_name', ''));
      v_category := LOWER(TRIM(COALESCE(v_elem->>'age_category', '')));

      IF v_name = '' THEN
        RAISE EXCEPTION 'Attendee full name cannot be blank.';
      END IF;

      IF v_category NOT IN ('adult', 'child', 'infant') THEN
        RAISE EXCEPTION 'Invalid age category: %. Must be adult, child, or infant.', v_category;
      END IF;
    END LOOP;
  END IF;

  -- 7. Upsert RSVP record
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

  -- 9. Insert new attendees if status is attending
  IF p_status = 'attending' THEN
    FOR v_elem IN SELECT * FROM jsonb_array_elements(p_attendees) LOOP
      v_name := TRIM(COALESCE(v_elem->>'full_name', ''));
      v_category := LOWER(TRIM(COALESCE(v_elem->>'age_category', '')));

      INSERT INTO public.attendees (rsvp_id, full_name, age_category)
      VALUES (v_rsvp_id, v_name, v_category);
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
-- 4. ADMINISTRATOR RSVP REPORTING RPC
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

  -- Build summaries for each of the 4 events (ordered by display_order)
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
      v_adults INTEGER := 0;
      v_children INTEGER := 0;
      v_infants INTEGER := 0;
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
        -- Derived no_response: total eligible families who did not submit an RSVP
        v_no_response_count := GREATEST(0, v_total_families - v_responded_total);
        v_awaiting_count := 0;
      ELSE
        v_no_response_count := 0;
        v_awaiting_count := GREATEST(0, v_total_families - v_responded_total);
      END IF;

      -- Attendees breakdown for attending RSVPs for this event
      SELECT
        COUNT(a.id),
        COUNT(a.id) FILTER (WHERE a.age_category = 'adult'),
        COUNT(a.id) FILTER (WHERE a.age_category = 'child'),
        COUNT(a.id) FILTER (WHERE a.age_category = 'infant')
      INTO
        v_total_attendees,
        v_adults,
        v_children,
        v_infants
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
        'adult_count', v_adults,
        'child_count', v_children,
        'infant_count', v_infants
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
                  'full_name', a.full_name,
                  'age_category', a.age_category
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
