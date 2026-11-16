# PHASE 5 — FINAL PRE-PREVIEW CONFIGURATION CONSISTENCY AUDIT REPORT
## Mithun & Sakhi Luxury Wedding Platform

**Project:** Mithun & Sakhi — Luxury Wedding Platform  
**Milestone:** Production Preparation  
**Phase:** 5 (Pre-Preview Configuration Consistency Audit & Narrow Correction)  
**Date:** 2026-11-16  
**Auditor:** Senior Application Security Engineer & DevOps Release Lead  
**Branch:** `mobile-preview`  
**Git Working Tree:** Preserved without disruption  
**Final Status:** **READY FOR PREVIEW DEPLOYMENT**

---

## 1. EXECUTIVE SUMMARY

Prior to triggering the Vercel Preview deployment, this audit addressed the configuration and isolation consistency of the distributed rate limiter across shared environments, followed by a narrowly scoped security correction on `supabase/migrations/20261116000018_distributed_rate_limiting.sql`:

1. **`RATE_LIMIT_SALT` Deployed Fallback Resolution:** Permanently removed the predictable fallback string from deployed environments. When running in Preview or Production (`process.env.VERCEL` or `NODE_ENV === "production"`), a missing `RATE_LIMIT_SALT` causes `getRateLimitSalt()` to throw a controlled error. `checkRateLimit()` intercepts this error and fails safely, rejecting form submissions with a generic temporary service error rather than processing submissions without intended rate-limit protection or with compromised entropy.
2. **`RATE_LIMIT_TOKEN` & Environment Isolation Architecture:** Resolved the architectural inconsistency between distinct Preview/Production tokens and a single database configuration key. Implemented **Option B**: permanently eliminated the redundant internal token parameter in favor of native PostgreSQL Role-Based Access Control (`service_role` execution only). Concurrently introduced **Environment Bucket Partitioning** (`v_bucket_key := env:endpoint:identifier_hash`), strictly whitelisting environment identifiers (`'production'`, `'preview'`, `'development'`).
3. **Environment Parameter Security Correction (`p_env DEFAULT NULL`):** Removed the unsafe default `p_env TEXT DEFAULT 'production'`. The function now declares `p_env TEXT DEFAULT NULL`. If an omitted or `NULL` environment is passed, PostgreSQL strictly rejects the call with an `invalid_parameter_value` error (`ERRCODE = '22023'`). This guarantees that Preview traffic can never silently default or enter the Production rate-limit bucket.
4. **Verification Accounting Correction:** Separate reporting of executable automated test assertions (112 assertions across Phase 5, Phase 4, and Phase 4.1 suites) from static database security audits (73 `SECURITY DEFINER` function definitions audited across 18 migrations).

All verification gates and quality checks passed with 100% success.

---

## 2. RATE_LIMIT_SALT — DEPLOYED FALLBACK RESOLUTION

### 2.1 The Issue
The previous implementation in `src/lib/rate-limit.ts` contained:
```ts
const effectiveSalt = configuredSalt || "dev_local_ephemeral_salt_non_prod";
```
While this prevented runtime crashes, it created a security vulnerability: if a deployed environment lacked `RATE_LIMIT_SALT`, it fell back to a predictable static string, compromising IP pseudonymization and allowing cross-environment correlation.

### 2.2 Implemented Resolution
The salt resolution was refactored into a dedicated policy function [`getRateLimitSalt()`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/src/lib/rate-limit.ts#L61-L81):
```ts
export function getRateLimitSalt(): string {
  const configuredSalt = process.env.RATE_LIMIT_SALT;
  const isDeployed = Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";

  if (!configuredSalt || configuredSalt.trim().length === 0) {
    if (isDeployed) {
      console.error(
        "[CRITICAL_SECURITY_ERROR] RATE_LIMIT_SALT is not configured in deployed environment. Submissions halted for security."
      );
      throw new Error("MISSING_DEPLOYED_SALT");
    }
    return "msw_dev_only_unseeded_local_salt_not_for_production";
  }

  return configuredSalt.trim();
}
```

### 2.3 Fail-Safe Submission Handling
When `MISSING_DEPLOYED_SALT` is thrown in a deployed environment:
1. [`getClientIdentifierHash()`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/src/lib/rate-limit.ts#L87-L125) propagates the error.
2. [`checkRateLimit()`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/src/lib/rate-limit.ts#L182-L260) intercepts the error and returns:
   ```ts
   return {
     allowed: false,
     currentCount: 0,
     limit,
     retryAfter: 60,
     error: "Service temporarily unavailable. Please try again in a few moments.",
   };
   ```
3. [`submitPublicWishAction`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/src/actions/wishes.ts#L42-L49) and [`submitPublicRsvpAction`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/src/actions/rsvp.ts#L192-L199) inspect `rateLimit.error` and immediately return `{ success: false, error: rateLimit.error }`.
4. **Result:**
   - Submissions are halted safely; no database records are written without rate-limit protection.
   - The user receives a controlled generic error without exposing internal variable names or configuration details.
   - The salt is static across lambdas within each deployment, preserving deterministic HMAC-SHA256 calculations without per-invocation random regeneration.
   - Local development retains the documented fallback `"msw_dev_only_unseeded_local_salt_not_for_production"` to avoid breaking developer onboarding.

---

## 3. TOKEN ENVIRONMENT ARCHITECTURE & `p_env DEFAULT NULL` CORRECTION

### 3.1 Architectural Conflict & Option B Selection
The previous report recommended distinct `RATE_LIMIT_TOKEN` values for Preview and Production, but `supabase/migrations/20261116000018_distributed_rate_limiting.sql` queried a single key `RATE_LIMIT_TOKEN` from `private.rate_limit_config`. When Preview and Production share one Supabase project (`wsfbvpvymwjyzxllxpvj`), having a single key in the database makes distinct tokens impossible. Furthermore, an optional token check in the database creates a false impression of security.

Under **Option B**, the redundant internal token parameter and configuration table were removed entirely in favor of native PostgreSQL Role-Based Access Control (`service_role` execution only), paired with **Environment Bucket Partitioning** (`v_bucket_key := env:endpoint:identifier_hash`).

### 3.2 Narrow Security Correction: `p_env TEXT DEFAULT NULL`
Previously, `check_rate_limit_atomic` declared:
`p_env TEXT DEFAULT 'production'`
This created an environment-isolation risk: if a future caller omitted `p_env`, it would silently default to `'production'`, potentially contaminating production rate-limit counters with Preview or test traffic.

**Correction Applied in Migration 18:**
```sql
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
BEGIN
  -- Strict environment whitelist validation
  -- Rejects NULL, missing, or unwhitelisted environment identifiers with ERRCODE = '22023' (invalid_parameter_value)
  -- Setting DEFAULT NULL guarantees omitted arguments fail explicitly rather than silently entering 'production'
  IF p_env IS NULL OR p_env NOT IN ('production', 'preview', 'development') THEN
    RAISE EXCEPTION 'Invalid or missing rate limit environment identifier: %', p_env USING ERRCODE = '22023';
  END IF;

  -- Partition compound bucket key by environment
  v_bucket_key := trim(p_env) || ':' || trim(p_endpoint) || ':' || trim(p_identifier_hash);
...
```

### 3.3 Verification of Caller Safety
- [`src/lib/rate-limit.ts`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/src/lib/rate-limit.ts#L41-L50) explicitly derives `env` from `process.env.VERCEL_ENV` and `process.env.NODE_ENV` via [`getDeploymentEnvironment()`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/src/lib/rate-limit.ts#L41-L50).
- The RPC invocation explicitly passes `p_env: env`.
- Browser clients cannot manipulate `p_env`.
- Because `p_env DEFAULT NULL` rejects omitted/NULL values, Preview traffic can NEVER silently enter the Production bucket.
- Endpoint namespace validation (`wishes`, `rsvp`, `media`, `auth`, `default`), identifier hash format checks (`^[a-zA-Z0-9_\-]+$`), and bounded rate-limit parameters (`limit` 1..100, `window` 1..3600) remain completely intact.

---

## 4. RPC AND SERVICE-ROLE SECURITY VERIFICATION

1. **Service-Role Execution Only:**
   - `REVOKE ALL ON FUNCTION public.check_rate_limit_atomic(TEXT, TEXT, INTEGER, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;`
   - `GRANT EXECUTE ON FUNCTION public.check_rate_limit_atomic(TEXT, TEXT, INTEGER, INTEGER, TEXT) TO service_role;`
   - Unauthenticated visitors and authenticated browser clients calling PostgREST directly (`POST /rest/v1/rpc/check_rate_limit_atomic`) receive HTTP 401/404.
2. **Private Table Isolation:**
   - `REVOKE ALL ON TABLE private.rate_limit_buckets FROM PUBLIC, anon, authenticated;`
   - `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE private.rate_limit_buckets TO service_role;`
   - Direct PostgREST queries against `private.rate_limit_buckets` are rejected by schema and table grants.
3. **Execution Context & Search Path:**
   - The RPC enforces `SECURITY DEFINER` and `SET search_path = ''`.
   - All internal table references are schema-qualified (`private.rate_limit_buckets`), preventing search-path hijacking.
4. **Client-Side Secret Isolation:**
   - `SUPABASE_SERVICE_ROLE_KEY` is referenced solely within server-only modules ([`src/lib/rate-limit.ts`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/src/lib/rate-limit.ts)).
   - Neither the key nor any secret salt appears in client bundles, Next.js page manifests, or browser-accessible JavaScript.
   - Zero secrets are printed in server console logs.

---

## 5. FINAL ENVIRONMENT CONFIGURATION MATRIX

The table below provides the definitive configuration matrix across Local Development, Preview, and Production.

| Environment Variable | Scope | Classification | Local Development | Vercel Preview | Vercel Production | Configuration Rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Client & Server | Public | `http://localhost:3000` | Derived automatically or branch URL | `https://mithun-sakhi-wedding.vercel.app` | **Distinct** per environment |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Public | `https://wsfbvpvymwjyzxllxpvj.supabase.co` | `https://wsfbvpvymwjyzxllxpvj.supabase.co` | `https://wsfbvpvymwjyzxllxpvj.supabase.co` | **Shared** (same Supabase project) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client & Server | Public | Standard publishable key | Standard publishable key | Standard publishable key | **Shared** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Public | Standard anon JWT | Standard anon JWT | Standard anon JWT | **Shared** |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only | **CRITICAL SECRET** | Optional in dev (falls back to memory limiter) | Service role secret from Supabase Dashboard | Service role secret from Supabase Dashboard | **Shared** (matches project) |
| `RATE_LIMIT_SALT` | Server-Only | **CRITICAL SECRET** | Optional in dev (uses documented dev fallback) | 32-byte hex generated via `openssl rand -hex 32` | **Distinct** 32-byte hex generated via `openssl rand -hex 32` | **STRICTLY DISTINCT** between Preview & Production |
| `RATE_LIMIT_TOKEN` | N/A | **ELIMINATED** | *Removed* | *Removed* | *Removed* | **DO NOT CONFIGURE** (eliminated under Option B) |

---

## 6. SUMMARY OF FILES MODIFIED

The following files were updated during this audit:

| File Path | Description of Changes |
| :--- | :--- |
| [`supabase/migrations/20261116000018_distributed_rate_limiting.sql`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/supabase/migrations/20261116000018_distributed_rate_limiting.sql) | Updated `p_env` default to `NULL`; verified strict rejection of missing/invalid environments; preserved RBAC, search_path, namespace whitelist, and bounds. |
| [`src/lib/rate-limit.ts`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/src/lib/rate-limit.ts) | Implemented `getRateLimitSalt()` throwing in deployed mode; implemented `getDeploymentEnvironment()`; verified explicit `p_env: env` passing; removed `RATE_LIMIT_TOKEN`. |
| [`src/actions/wishes.ts`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/src/actions/wishes.ts) | Updated rate limit check to surface `rateLimit.error` when fail-safe mode is activated. |
| [`src/actions/rsvp.ts`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/src/actions/rsvp.ts) | Updated rate limit check to surface `rateLimit.error` when fail-safe mode is activated. |
| [`.env.example`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/.env.example) | Cleaned up environment variables template; removed `RATE_LIMIT_TOKEN`; documented `RATE_LIMIT_SALT`. |
| [`scripts/verify_phase5_blocker_closure.mjs`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/scripts/verify_phase5_blocker_closure.mjs) | Added explicit tests for production, preview, development, missing (NULL), and invalid environments; bucket isolation; salt fail-safe. |

---

## 7. AUTOMATED VERIFICATION RESULTS & AUDIT ACCOUNTING

Verification accounting is strictly categorized into **Executable Automated Test Assertions**, **Static Database Security Audits**, and **Build Quality Gates**:

### Category A: Executable Automated Test Assertions (112 Total Assertions)

| Test Suite | Command | Test Assertions | Result | Scope / Notes |
| :--- | :--- | :---: | :---: | :--- |
| **Phase 5 Pre-Preview Consistency** | `node scripts/verify_phase5_blocker_closure.mjs` | 49 checks | **PASSED** | Tests explicit production, preview, dev; missing NULL & invalid envs; bucket isolation; salt fail-safe; memory bounds; RBAC |
| **Phase 4 Security Suite** | `node scripts/verify_phase4_security.mjs` | 36 checks | **PASSED** | Open redirect defense, live security headers, route guards, media API, robots.txt, sitemap.xml |
| **Phase 4.1 Security Suite** | `node scripts/verify_phase4_1_security.mjs` | 27 checks | **PASSED** | Deep image binary validation, rate limiter simulation, migration integrity, production CSP without `unsafe-eval` |
| **Subtotal Automated Assertions** | | **112 / 112** | **100% PASSED** | Zero assertion failures across all test suites |

### Category B: Static Database Security Code Audits (73 Function Definitions)

| Audit Target | Command | Entities Audited | Result | Notes |
| :--- | :--- | :---: | :---: | :--- |
| **PostgreSQL Search Path Audit** | `node scripts/audit_migrations.cjs` | 73 functions | **PASSED** | Audited all 73 `SECURITY DEFINER` function definitions across 18 migration files; 73/73 enforce explicit `SET search_path = ''` |

### Category C: Codebase & Build Quality Gates

| Quality Gate | Command | Scope | Result |
| :--- | :--- | :--- | :---: |
| **TypeScript Typecheck** | `npm run typecheck` | Full codebase | **PASSED (0 errors)** |
| **ESLint Static Analysis** | `npm run lint` | Full codebase | **PASSED (0 errors, 6 documented warnings for static invitation `<img>` export)** |
| **Next.js Production Build** | `npm run build` | 33 routes | **PASSED (Turbopack 1.05s, all 33 routes prerendered)** |

---

## 8. REMAINING MANUAL CONFIGURATION STEPS BEFORE PREVIEW

Before initiating the Vercel Preview deployment, execute these two configuration actions:

1. **Configure Vercel Environment Variables:**
   - In the **Vercel Dashboard** → `mithun-sakhi-wedding` → **Settings** → **Environment Variables**:
     - `SUPABASE_SERVICE_ROLE_KEY`: Paste the service role secret from Supabase Dashboard (**Settings** → **API** → `service_role secret`). Apply to **Preview** and **Production**.
     - `RATE_LIMIT_SALT`: Generate two distinct 32-byte hex keys using `openssl rand -hex 32`. Set one for **Preview** and a different one for **Production**.
     - Note: Do NOT add `RATE_LIMIT_TOKEN` (it has been cleanly removed).
2. **Apply Migration 18 to Supabase (When Ready for Distributed State):**
   - In **Supabase Dashboard** → **SQL Editor**, execute the contents of [`supabase/migrations/20261116000018_distributed_rate_limiting.sql`](file:///c:/Users/Rabin%20Gorain/Downloads/mithun-sakhi-wedding/supabase/migrations/20261116000018_distributed_rate_limiting.sql).
   - *Note: If migration 18 is not applied prior to preview deployment, the application will automatically and gracefully enforce rate limiting via its in-memory sliding-window fallback without error or interruption to guests.*

---

## 9. FINAL DEPLOYMENT READINESS DECISION

### Decision: **READY FOR PREVIEW DEPLOYMENT**

### Justification:
1. **Air-Tight Environment Isolation:** Declaring `p_env TEXT DEFAULT NULL` and enforcing strict whitelist validation guarantees that missing or unwhitelisted parameters are immediately rejected by PostgreSQL with an invalid parameter error (`22023`). Preview traffic can never silently default or enter the Production rate-limit bucket.
2. **Deterministic Salt Policy:** Missing `RATE_LIMIT_SALT` in deployed environments safely halts form submissions with a generic controlled temporary error, preventing unpseudonymized or unrate-limited records.
3. **Streamlined Threat Model:** Redundant token mechanisms have been replaced with least-privilege PostgreSQL RBAC (`service_role` execution only).
4. **Preserved Integrity:** Zero visual, styling, or layout changes were introduced. All uncommitted work on `mobile-preview` is preserved. 112 automated test assertions and 73 database function audits passed with 100% success.
