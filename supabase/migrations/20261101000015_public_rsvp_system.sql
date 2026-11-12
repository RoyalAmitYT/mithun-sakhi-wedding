-- ==============================================================================
-- Migration: 20261101000015_public_rsvp_system.sql
-- Description:
--   1. Creates public.public_rsvps table for open guest RSVP submissions.
--   2. Strict Row Level Security: public cannot SELECT, UPDATE or DELETE.
--   3. Only verified administrators (guest_rsvp permission) can view and manage submissions.
--   4. Introduces public.submit_public_rsvp(...) RPC with honeypot & server sanitization.
--   5. Introduces public.get_admin_public_rsvps() RPC for administrative intelligence.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CREATE PUBLIC_RSVPS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.public_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  mobile_number TEXT,
  address TEXT,
  relationship TEXT,
  guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count >= 1 AND guest_count <= 50),
  attending_haldi BOOLEAN NOT NULL DEFAULT FALSE,
  attending_mehndi BOOLEAN NOT NULL DEFAULT FALSE,
  attending_wedding BOOLEAN NOT NULL DEFAULT FALSE,
  attending_reception BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'tentative')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin chronological retrieval and fast searching
CREATE INDEX IF NOT EXISTS idx_public_rsvps_created_at ON public.public_rsvps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_rsvps_guest_name ON public.public_rsvps(guest_name);

-- ------------------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY & ADMIN-ONLY ACCESS POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.public_rsvps ENABLE ROW LEVEL SECURITY;

-- Anonymous and standard public users have ZERO direct SELECT/UPDATE/DELETE access
DROP POLICY IF EXISTS "Admins can view public rsvps" ON public.public_rsvps;
CREATE POLICY "Admins can view public rsvps"
  ON public.public_rsvps FOR SELECT
  TO authenticated
  USING (private.has_admin_permission('guest_rsvp', auth.uid()));

DROP POLICY IF EXISTS "Admins can update public rsvps" ON public.public_rsvps;
CREATE POLICY "Admins can update public rsvps"
  ON public.public_rsvps FOR UPDATE
  TO authenticated
  USING (private.has_admin_permission('guest_rsvp', auth.uid()))
  WITH CHECK (private.has_admin_permission('guest_rsvp', auth.uid()));

DROP POLICY IF EXISTS "Admins can delete public rsvps" ON public.public_rsvps;
CREATE POLICY "Admins can delete public rsvps"
  ON public.public_rsvps FOR DELETE
  TO authenticated
  USING (private.has_admin_permission('guest_rsvp', auth.uid()));

-- ------------------------------------------------------------------------------
-- 3. SECURE INSERT-ONLY RPC: submit_public_rsvp
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_public_rsvp(
  p_guest_name TEXT,
  p_mobile TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_relationship TEXT DEFAULT NULL,
  p_guest_count INTEGER DEFAULT 1,
  p_attending_haldi BOOLEAN DEFAULT FALSE,
  p_attending_mehndi BOOLEAN DEFAULT FALSE,
  p_attending_wedding BOOLEAN DEFAULT FALSE,
  p_attending_reception BOOLEAN DEFAULT FALSE,
  p_honeypot TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_name TEXT;
  v_mobile TEXT;
  v_address TEXT;
  v_relation TEXT;
  v_count INTEGER;
  v_new_id UUID;
BEGIN
  -- Anti-Spam Honeypot: If filled by automated bot, reject immediately
  IF p_honeypot IS NOT NULL AND length(trim(p_honeypot)) > 0 THEN
    RETURN jsonb_build_object('success', true, 'rsvp_id', gen_random_uuid());
  END IF;

  -- Cutoff check: RSVP blocked past Memories Mode cutoff (2026-11-22 18:30:00+00)
  IF COALESCE(NULLIF(current_setting('app.test_time_override', true), '')::timestamptz, NOW()) >= '2026-11-22 18:30:00+00'::timestamptz THEN
    RAISE EXCEPTION 'Wedding celebration RSVP submissions have concluded.';
  END IF;

  -- Clean and sanitize inputs
  v_name := TRIM(REGEXP_REPLACE(COALESCE(p_guest_name, ''), '<[^>]*>', '', 'g'));
  v_mobile := NULLIF(TRIM(REGEXP_REPLACE(COALESCE(p_mobile, ''), '<[^>]*>', '', 'g')), '');
  v_address := NULLIF(TRIM(REGEXP_REPLACE(COALESCE(p_address, ''), '<[^>]*>', '', 'g')), '');
  v_relation := NULLIF(TRIM(REGEXP_REPLACE(COALESCE(p_relationship, ''), '<[^>]*>', '', 'g')), '');

  -- Input validations
  IF v_name IS NULL OR length(v_name) < 2 OR length(v_name) > 100 THEN
    RAISE EXCEPTION 'Full name must be between 2 and 100 characters.';
  END IF;

  v_count := COALESCE(p_guest_count, 1);
  IF v_count < 1 OR v_count > 50 THEN
    RAISE EXCEPTION 'Number of guests must be at least 1.';
  END IF;

  -- Insert into public.public_rsvps
  INSERT INTO public.public_rsvps (
    guest_name,
    mobile_number,
    address,
    relationship,
    guest_count,
    attending_haldi,
    attending_mehndi,
    attending_wedding,
    attending_reception,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_name,
    v_mobile,
    v_address,
    v_relation,
    v_count,
    COALESCE(p_attending_haldi, FALSE),
    COALESCE(p_attending_mehndi, FALSE),
    COALESCE(p_attending_wedding, FALSE),
    COALESCE(p_attending_reception, FALSE),
    'confirmed',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'rsvp_id', v_new_id
  );
END;
$$;

-- Grant execution to anon (public) and authenticated roles
GRANT EXECUTE ON FUNCTION public.submit_public_rsvp TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 4. ADMIN INTELLIGENCE RPC: get_admin_public_rsvps
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_public_rsvps()
RETURNS TABLE (
  id UUID,
  guest_name TEXT,
  mobile_number TEXT,
  address TEXT,
  relationship TEXT,
  guest_count INTEGER,
  attending_haldi BOOLEAN,
  attending_mehndi BOOLEAN,
  attending_wedding BOOLEAN,
  attending_reception BOOLEAN,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Strict administrator permission check
  IF NOT (private.is_super_admin(auth.uid()) OR private.has_admin_permission('guest_rsvp', auth.uid())) THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    r.id,
    r.guest_name,
    r.mobile_number,
    r.address,
    r.relationship,
    r.guest_count,
    r.attending_haldi,
    r.attending_mehndi,
    r.attending_wedding,
    r.attending_reception,
    r.status,
    r.created_at,
    r.updated_at
  FROM public.public_rsvps r
  ORDER BY r.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_public_rsvps TO authenticated;
