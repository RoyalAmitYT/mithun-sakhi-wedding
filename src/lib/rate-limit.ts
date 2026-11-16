import crypto from "node:crypto";
import { headers } from "next/headers";
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  retryAfter: number; // in seconds
  error?: string;
}

export interface RateLimitOptions {
  limit?: number;
  windowSeconds?: number;
}

// In-memory sliding-window backup store for local fallback
const memoryStore = new Map<string, number[]>();

// Cached server-only service-role client for executing restricted RPCs
let cachedServiceRoleClient: SupabaseClient | null = null;

function getServiceRoleClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  if (!cachedServiceRoleClient) {
    cachedServiceRoleClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cachedServiceRoleClient;
}

/**
 * Server-only helper to derive the deployment environment from trusted runtime variables.
 * Never allows client-supplied values or query parameters to select database environments.
 */
export function getDeploymentEnvironment(): "production" | "preview" | "development" {
  if (process.env.VERCEL_ENV === "preview") {
    return "preview";
  }
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return "production";
  }
  return "development";
}

/**
 * Resolves the cryptographic salt for IP pseudonymization.
 *
 * Deployed Policy:
 * In deployed environments (Vercel Preview/Production or NODE_ENV === 'production'),
 * an explicitly configured, high-entropy RATE_LIMIT_SALT is strictly required.
 * If missing, throws a controlled MissingDeployedSaltError so callers fail safely
 * and reject submissions rather than processing with predictable or unpseudonymized keys.
 *
 * Local Development Policy:
 * When running locally outside of deployed environments, falls back to a documented
 * development-only constant with a logged warning, preventing local onboarding breakage.
 */
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

/**
 * Derives a privacy-preserving HMAC-SHA256 hash of the client's IP address.
 * Never stores or transmits raw guest IP addresses.
 * Prioritizes trusted non-spoofable edge proxy headers on Vercel.
 */
export async function getClientIdentifierHash(): Promise<string> {
  const salt = getRateLimitSalt(); // May throw MISSING_DEPLOYED_SALT in deployed mode if unconfigured

  try {
    const headerList = await headers();
    const realIp = headerList.get("x-real-ip");
    const vercelIp = headerList.get("x-vercel-ip");
    const cfIp = headerList.get("cf-connecting-ip");
    const forwarded = headerList.get("x-forwarded-for");

    let ip = "127.0.0.1";
    // 1. Prioritize trusted proxy-set headers (non-spoofable on Vercel Edge / Cloudflare)
    if (realIp && realIp.trim().length > 0) {
      ip = realIp.trim();
    } else if (vercelIp && vercelIp.trim().length > 0) {
      ip = vercelIp.trim();
    } else if (cfIp && cfIp.trim().length > 0) {
      ip = cfIp.trim();
    } else if (forwarded && forwarded.trim().length > 0) {
      // In multi-hop proxy chains, pick the last client-facing IP appended by trusted ingress
      const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
      ip = parts[parts.length - 1] || parts[0] || "127.0.0.1";
    }

    // Cryptographically sound HMAC-SHA256 IP pseudonymization
    return crypto
      .createHmac("sha256", salt)
      .update(ip)
      .digest("hex")
      .slice(0, 32);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "MISSING_DEPLOYED_SALT") {
      throw err;
    }
    return "anon_fallback_client";
  }
}

/**
 * Checks in-memory sliding-window rate limit as the reliable zero-dependency fallback.
 */
function checkMemoryRateLimit(
  bucketKey: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const timestamps = memoryStore.get(bucketKey) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= limit) {
    memoryStore.set(bucketKey, validTimestamps);
    const earliest = validTimestamps[0] || now;
    const retryAfter = Math.max(1, Math.ceil((earliest + windowMs - now) / 1000));
    return {
      allowed: false,
      currentCount: validTimestamps.length,
      limit,
      retryAfter,
    };
  }

  validTimestamps.push(now);
  memoryStore.set(bucketKey, validTimestamps);
  return {
    allowed: true,
    currentCount: validTimestamps.length,
    limit,
    retryAfter: 0,
  };
}

/**
 * Distributed persistent rate limiter.
 *
 * Uses the Supabase PostgreSQL atomic check_rate_limit_atomic RPC as the primary
 * distributed store across all Vercel serverless instances.
 *
 * Authorization Architecture:
 * - RPC execution privileges are restricted exclusively to `service_role` (least-privilege).
 * - Public callers over PostgREST (anon / authenticated) are strictly denied by database RBAC.
 * - Authoritative Server Actions invoke this check using a server-only service-role client.
 * - Environment bucket partitioning (env:endpoint:hash) guarantees Preview traffic never exhausts
 *   rate limit quotas for Production users sharing the same database.
 *
 * Documented Fallback Policy:
 * If the database connection encounters an error (or migration 18 has not yet been applied,
 * or SUPABASE_SERVICE_ROLE_KEY is unconfigured in local dev), it logs a diagnostic notice
 * and seamlessly enforces rate limiting using the local sliding-window limiter.
 * This guarantees rate protection remains active while preventing accidental guest outages.
 *
 * Missing Salt Policy:
 * If RATE_LIMIT_SALT is unconfigured in deployed environments, checkRateLimit fails safely,
 * returning allowed=false with a controlled generic error so public submissions are rejected.
 *
 * @param endpoint - Distinct namespace for the endpoint (e.g. "wishes" or "rsvp")
 * @param options - Custom limit (default: 5) and window in seconds (default: 60)
 */
export async function checkRateLimit(
  endpoint: string,
  options?: RateLimitOptions
): Promise<RateLimitResult> {
  const limit = options?.limit ?? 5;
  const windowSeconds = options?.windowSeconds ?? 60;
  const isDeployed = Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";

  let identifierHash: string;
  try {
    identifierHash = await getClientIdentifierHash();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "MISSING_DEPLOYED_SALT") {
      // In deployed environments without configured salt:
      // Fail safely: DO NOT accept submissions without the intended rate-limit protection.
      // Return a controlled temporary service error rather than exposing internal details.
      return {
        allowed: false,
        currentCount: 0,
        limit,
        retryAfter: 60,
        error: "Service temporarily unavailable. Please try again in a few moments.",
      };
    }
    identifierHash = "anon_fallback_client";
  }

  const env = getDeploymentEnvironment();
  const memoryBucketKey = `${env}:${endpoint}:${identifierHash}`;

  const supabase = getServiceRoleClient();
  if (!supabase) {
    if (isDeployed) {
      console.warn(
        "[RATE_LIMIT_SERVICE_ROLE_NOTICE] SUPABASE_SERVICE_ROLE_KEY is unconfigured in deployed environment. Falling back to local sliding-window rate limiter."
      );
    }
    return checkMemoryRateLimit(memoryBucketKey, limit, windowSeconds);
  }

  try {
    const { data, error } = await supabase.rpc("check_rate_limit_atomic", {
      p_identifier_hash: identifierHash,
      p_endpoint: endpoint,
      p_limit: limit,
      p_window_seconds: windowSeconds,
      p_env: env,
    });

    if (error || !data) {
      if (error && isDeployed) {
        console.warn(
          `[RATE_LIMIT_RPC_NOTICE] Database check_rate_limit_atomic returned error: ${error.message}. Enforcing fallback rate limit via memory sliding window.`
        );
      }
      return checkMemoryRateLimit(memoryBucketKey, limit, windowSeconds);
    }

    const res = data as {
      allowed?: boolean;
      current_count?: number;
      limit?: number;
      retry_after?: number;
    };

    return {
      allowed: Boolean(res.allowed),
      currentCount: Number(res.current_count) || 1,
      limit: Number(res.limit) || limit,
      retryAfter: Number(res.retry_after) || 0,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (isDeployed) {
      console.warn(
        `[RATE_LIMIT_EXCEPTION] Unexpected error during rate limit check: ${message}. Falling back to in-memory sliding window.`
      );
    }
    return checkMemoryRateLimit(memoryBucketKey, limit, windowSeconds);
  }
}
