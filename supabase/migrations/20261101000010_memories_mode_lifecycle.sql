-- Migration 10: Memories Mode & Lifecycle Governance (Phase P-14)
-- Architecture: docs/ARCHITECTURE_AND_SECURITY.md (Section 8 & Section 15)
-- Acceptance Criteria: TC-MEM-01, TC-MEM-02

-- ------------------------------------------------------------------------------
-- 1. HARDEN ACCESS REQUEST ELIGIBILITY TRIGGER FOR MEMORIES MODE CUTOFF
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_access_request_eligibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_effective_time TIMESTAMPTZ;
BEGIN
  -- Determine current effective time (supporting test time override for simulation)
  v_effective_time := COALESCE(NULLIF(current_setting('app.test_time_override', true), '')::timestamptz, NOW());

  -- Memories Mode Cutoff: 23 November 2026, 00:00:00 IST = 22 November 2026, 18:30:00 UTC
  IF v_effective_time >= '2026-11-22 18:30:00+00'::timestamptz THEN
    RAISE EXCEPTION 'Access requests are closed as wedding celebrations have transitioned into Memories Mode.'
      USING ERRCODE = '22023';
  END IF;

  -- Prevent already approved guests from submitting superfluous access requests
  IF auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = NEW.profile_id
      AND is_approved_guest = TRUE
  ) THEN
    RAISE EXCEPTION 'Guest profile is already approved. Cannot submit new access request.'
      USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_access_request_eligibility ON public.access_requests;
CREATE TRIGGER trg_check_access_request_eligibility
  BEFORE INSERT ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.check_access_request_eligibility();

-- ------------------------------------------------------------------------------
-- 2. HARDEN FAMILY RSVP SUBMISSION RPC FOR MEMORIES MODE CUTOFF
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
  v_effective_time TIMESTAMPTZ;
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

  v_effective_time := COALESCE(NULLIF(current_setting('app.test_time_override', true), '')::timestamptz, NOW());

  -- Memories Mode Cutoff: 23 November 2026, 00:00:00 IST = 22 November 2026, 18:30:00 UTC
  IF v_effective_time >= '2026-11-22 18:30:00+00'::timestamptz THEN
    RAISE EXCEPTION 'RSVP submissions are closed as celebrations have transitioned into Memories Mode.'
      USING ERRCODE = '22023';
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

  IF v_effective_time >= v_deadline THEN
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

      INSERT INTO public.attendees (
        rsvp_id,
        full_name,
        age_category
      ) VALUES (
        v_rsvp_id,
        v_name,
        v_category
      );

      v_attendee_count := v_attendee_count + 1;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'rsvp_id', v_rsvp_id,
    'event_id', p_event_id,
    'status', p_status,
    'attendee_count', v_attendee_count
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. PUBLIC RPC: GET WEDDING LIFECYCLE STATE
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_wedding_lifecycle_state()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_effective_time TIMESTAMPTZ;
  v_ist_date TEXT;
  v_is_memories BOOLEAN;
  v_state TEXT;
BEGIN
  v_effective_time := COALESCE(NULLIF(current_setting('app.test_time_override', true), '')::timestamptz, NOW());
  v_is_memories := v_effective_time >= '2026-11-22 18:30:00+00'::timestamptz;

  -- Convert UTC to Asia/Kolkata date format YYYY-MM-DD
  v_ist_date := to_char(v_effective_time AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD');

  IF v_is_memories THEN
    v_state := 'memories_mode';
  ELSIF v_ist_date = '2026-11-22' THEN
    v_state := 'reception_day';
  ELSIF v_ist_date = '2026-11-21' THEN
    v_state := 'wedding_day';
  ELSIF v_ist_date = '2026-11-20' THEN
    v_state := 'mehndi_day';
  ELSIF v_ist_date = '2026-11-19' THEN
    v_state := 'haldi_day';
  ELSE
    v_state := 'pre_wedding';
  END IF;

  RETURN jsonb_build_object(
    'state', v_state,
    'is_memories_mode', v_is_memories,
    'memories_mode_boundary_iso', '2026-11-23T00:00:00+05:30',
    'memories_mode_boundary_utc', '2026-11-22T18:30:00Z',
    'server_time_utc', v_effective_time,
    'ist_date', v_ist_date
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. GRANTS
-- ------------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.get_wedding_lifecycle_state() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_family_rsvp(TEXT, UUID, TEXT, JSONB, TEXT, TEXT) TO authenticated;
