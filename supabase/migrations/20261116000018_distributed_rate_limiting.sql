-- =============================================================================
-- Migration: 20261116000018_distributed_rate_limiting.sql
-- Project:   Mithun & Sakhi Wedding Website (wsfbvpvymwjyzxllxpvj)
-- Created:   2026-11-16
-- Depends:   000001 – 000017
--
-- Summary of changes (forward-only & idempotent):
--   1. Create private.rate_limit_buckets table for distributed state across Vercel serverless instances
--   2. Add indexing on window_start for efficient expiration cleanup
--   3. Create public.check_rate_limit_atomic(TEXT, TEXT, INTEGER, INTEGER, TEXT) RPC with:
--        - SECURITY DEFINER and SET search_path = ''
--        - p_env TEXT DEFAULT NULL (prevents silent fallback to production if omitted)
--        - Strict environment whitelist validation ('production', 'preview', 'development')
--        - Environment bucket partitioning to isolate Preview testing from Production quotas
--        - Endpoint namespace whitelist validation
--        - Atomic UPSERT with clock_timestamp() alignment
--        - Opportunistic auto-cleanup of expired buckets
--        - Returns { allowed: boolean, current_count: int, limit: int, retry_after: int }
--   4. Least-Privilege Execution Model:
--        - REVOKE ALL from PUBLIC, anon, and authenticated
--        - GRANT EXECUTE exclusively to service_role (eliminates public PostgREST attack surface)
-- =============================================================================

-- Ensure private schema exists (already initialized in migration 000002)
CREATE SCHEMA IF NOT EXISTS private;

-- -----------------------------------------------------------------------------
-- 1. Private Rate Limit Buckets Table
--    Direct access strictly prevented; only accessible via service_role / RPC
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS private.rate_limit_buckets (
  bucket_key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (bucket_key, window_start)
);

-- Index supporting opportunistic cleanup of expired records
CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_window
  ON private.rate_limit_buckets (window_start);

-- -----------------------------------------------------------------------------
-- 2. Atomic Distributed Rate Limiter Function
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_rate_limit_atomic(
  p_identifier_hash TEXT,
  p_endpoint TEXT,
  p_limit INTEGER DEFAULT 5,
  p_window_seconds INTEGER DEFAULT 60,
  p_env TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_window_start TIMESTAMPTZ;
  v_bucket_key TEXT;
  v_count INTEGER;
  v_allowed BOOLEAN;
  v_retry_after INTEGER;
BEGIN
  -- 1. Strict environment whitelist validation
  -- Enforces explicit caller-specified environment ('production', 'preview', 'development').
  -- Setting DEFAULT NULL guarantees missing arguments are rejected (ERRCODE 22023) rather
  -- than silently defaulting to 'production', preventing cross-environment contamination.
  IF p_env IS NULL OR p_env NOT IN ('production', 'preview', 'development') THEN
    RAISE EXCEPTION 'Invalid or missing rate limit environment identifier: %', p_env USING ERRCODE = '22023';
  END IF;

  -- 2. Endpoint namespace whitelist validation (prevents arbitrary namespace pollution)
  IF p_endpoint IS NULL OR p_endpoint NOT IN ('wishes', 'rsvp', 'media', 'auth', 'default') THEN
    RAISE EXCEPTION 'Invalid rate limit endpoint namespace: %', p_endpoint USING ERRCODE = '22023';
  END IF;

  -- 3. Identifier hash format validation (prevents unbounded or malformed key injection)
  IF p_identifier_hash IS NULL OR length(trim(p_identifier_hash)) = 0 OR length(p_identifier_hash) > 64 OR p_identifier_hash !~ '^[a-zA-Z0-9_\-]+$' THEN
    p_identifier_hash := 'anonymous';
  END IF;

  -- 4. Bounded limits and windows
  p_limit := LEAST(GREATEST(COALESCE(p_limit, 5), 1), 100);
  p_window_seconds := LEAST(GREATEST(COALESCE(p_window_seconds, 60), 1), 3600);

  -- Construct compound bucket key partitioned by environment: env:endpoint:hash
  v_bucket_key := trim(p_env) || ':' || trim(p_endpoint) || ':' || trim(p_identifier_hash);

  -- Compute current epoch-aligned window boundary
  v_window_start := to_timestamp(floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds);

  -- Opportunistically purge obsolete buckets older than 5 minutes
  DELETE FROM private.rate_limit_buckets
  WHERE window_start < (v_now - INTERVAL '5 minutes');

  -- Atomic UPSERT to record and increment request count
  INSERT INTO private.rate_limit_buckets (bucket_key, window_start, request_count)
  VALUES (v_bucket_key, v_window_start, 1)
  ON CONFLICT (bucket_key, window_start)
  DO UPDATE SET request_count = private.rate_limit_buckets.request_count + 1
  RETURNING request_count INTO v_count;

  v_allowed := (v_count <= p_limit);
  v_retry_after := CASE
    WHEN v_allowed THEN 0
    ELSE GREATEST(1, CEIL(extract(epoch from (v_window_start + (p_window_seconds * INTERVAL '1 second') - v_now))))::INTEGER
  END;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_count', v_count,
    'limit', p_limit,
    'retry_after', v_retry_after
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- 3. Least-Privilege Security Grants
-- -----------------------------------------------------------------------------

-- Direct table access strictly restricted
REVOKE ALL ON TABLE private.rate_limit_buckets FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE private.rate_limit_buckets TO service_role;

-- RPC execution strictly restricted to service_role (Least-Privilege Principle)
-- External browsers and anonymous callers via PostgREST cannot invoke this function
REVOKE ALL ON FUNCTION public.check_rate_limit_atomic(TEXT, TEXT, INTEGER, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit_atomic(TEXT, TEXT, INTEGER, INTEGER, TEXT) TO service_role;

-- =============================================================================
-- End of migration 20261116000018_distributed_rate_limiting.sql
-- =============================================================================
