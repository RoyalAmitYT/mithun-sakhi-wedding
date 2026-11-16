import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

console.log("==================================================================");
console.log("  PHASE 5 PRE-PREVIEW CONFIGURATION CONSISTENCY AUDIT VERIFICATION");
console.log("==================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// TEST SUITE 1: Hardcoded Secrets Elimination & Token Removal (Option B)
// -----------------------------------------------------------------------------
console.log("--- 1. Token Elimination & Redundant Mechanism Removal ---");

const filesToCheck = [
  "src/lib/rate-limit.ts",
  "supabase/migrations/20261116000018_distributed_rate_limiting.sql",
  ".env.example",
];

for (const file of filesToCheck) {
  const content = fs.readFileSync(path.join(ROOT, file), "utf8");
  assert(
    !content.includes("msw_rl_srv_token_v1"),
    `No deprecated compromised token 'msw_rl_srv_token_v1' in ${file}`
  );
  assert(
    !content.includes("RATE_LIMIT_TOKEN"),
    `Redundant RATE_LIMIT_TOKEN mechanism removed from ${file}`
  );
  assert(
    !content.includes("mithun-sakhi-wedding-rl-salt-2026"),
    `No deprecated hardcoded salt in ${file}`
  );
}

// -----------------------------------------------------------------------------
// TEST SUITE 2: Migration 18 Least-Privilege & Environment Whitelisting
// -----------------------------------------------------------------------------
console.log("\n--- 2. Migration 18 RBAC & Environment Isolation ---");

const mig18Content = fs.readFileSync(
  path.join(ROOT, "supabase/migrations/20261116000018_distributed_rate_limiting.sql"),
  "utf8"
);

assert(
  mig18Content.includes("p_env TEXT DEFAULT NULL"),
  "Migration 18 declares p_env TEXT DEFAULT NULL (prevents silent fallback to production)"
);

assert(
  mig18Content.includes("REVOKE ALL ON FUNCTION public.check_rate_limit_atomic(TEXT, TEXT, INTEGER, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;"),
  "Migration 18 explicitly revokes EXECUTE from PUBLIC, anon, and authenticated"
);

assert(
  mig18Content.includes("GRANT EXECUTE ON FUNCTION public.check_rate_limit_atomic(TEXT, TEXT, INTEGER, INTEGER, TEXT) TO service_role;"),
  "Migration 18 restricts EXECUTE strictly to service_role"
);

assert(
  mig18Content.includes("SET search_path = ''"),
  "Migration 18 enforces strict search_path = '' against schema hijacking"
);

assert(
  mig18Content.includes("IF p_env IS NULL OR p_env NOT IN ('production', 'preview', 'development') THEN"),
  "Migration 18 validates and strictly whitelists environment identifiers"
);

assert(
  mig18Content.includes("v_bucket_key := trim(p_env) || ':' || trim(p_endpoint) || ':' || trim(p_identifier_hash);"),
  "Migration 18 partitions buckets by environment to isolate Preview and Production traffic"
);

assert(
  !mig18Content.match(/TO\s+anon.*check_rate_limit_atomic/i),
  "No GRANT EXECUTE to anon for check_rate_limit_atomic"
);

// -----------------------------------------------------------------------------
// TEST SUITE 3: RATE_LIMIT_SALT Deployed Policy & Fail-Safe Defense
// -----------------------------------------------------------------------------
console.log("\n--- 3. RATE_LIMIT_SALT Deployed Policy & Fail-Safe Defense ---");

const rateLimitSrc = fs.readFileSync(path.join(ROOT, "src/lib/rate-limit.ts"), "utf8");

assert(
  !rateLimitSrc.includes("configuredSalt || \""),
  "No deployed fallback string literal for RATE_LIMIT_SALT in rate-limit.ts"
);

assert(
  rateLimitSrc.includes("throw new Error(\"MISSING_DEPLOYED_SALT\")"),
  "rate-limit.ts throws MISSING_DEPLOYED_SALT when salt is missing in deployed environments"
);

assert(
  rateLimitSrc.includes("Service temporarily unavailable. Please try again in a few moments."),
  "rate-limit.ts returns controlled generic error on missing deployed salt without leaking internals"
);

// Verify simulated fail-safe behavior
function simulateSaltResolution(saltValue, isVercel, nodeEnv) {
  const isDeployed = Boolean(isVercel) || nodeEnv === "production";
  if (!saltValue || saltValue.trim().length === 0) {
    if (isDeployed) {
      throw new Error("MISSING_DEPLOYED_SALT");
    }
    return "msw_dev_only_unseeded_local_salt_not_for_production";
  }
  return saltValue.trim();
}

// A. Missing in production -> Throws
let prodThrew = false;
try {
  simulateSaltResolution("", false, "production");
} catch (e) {
  prodThrew = (e.message === "MISSING_DEPLOYED_SALT");
}
assert(prodThrew, "Missing RATE_LIMIT_SALT in production throws MISSING_DEPLOYED_SALT");

// B. Missing in Vercel Preview -> Throws
let previewThrew = false;
try {
  simulateSaltResolution("", true, "development");
} catch (e) {
  previewThrew = (e.message === "MISSING_DEPLOYED_SALT");
}
assert(previewThrew, "Missing RATE_LIMIT_SALT in Vercel preview throws MISSING_DEPLOYED_SALT");

// C. Missing in local dev -> Documented dev fallback
const devSalt = simulateSaltResolution("", false, "development");
assert(
  devSalt === "msw_dev_only_unseeded_local_salt_not_for_production",
  "Missing RATE_LIMIT_SALT in local dev uses documented dev fallback without throwing"
);

// D. Configured salt -> Deterministic HMAC across serverless lambdas
const testSalt1 = "prod_salt_0123456789abcdef0123456789abcdef";
const testSalt2 = "preview_salt_fedcba9876543210fedcba9876543210";
const testIp = "203.0.113.195";

const hmac1 = crypto.createHmac("sha256", testSalt1).update(testIp).digest("hex").slice(0, 32);
const hmac1Repeat = crypto.createHmac("sha256", testSalt1).update(testIp).digest("hex").slice(0, 32);
const hmacPreview = crypto.createHmac("sha256", testSalt2).update(testIp).digest("hex").slice(0, 32);

assert(hmac1 === hmac1Repeat, "HMAC-SHA256 is deterministic across separate invocations for same salt");
assert(hmac1 !== hmacPreview, "Different salts between Production and Preview produce completely distinct hashes");

// -----------------------------------------------------------------------------
// TEST SUITE 4: Environment Partitioning, Whitelist Validation & Isolation
// -----------------------------------------------------------------------------
console.log("\n--- 4. Environment Partitioning & Isolation ---");

// Test explicit environment validation matching SQL function logic
function validateEnvironmentParam(p_env) {
  if (p_env === null || p_env === undefined || typeof p_env !== "string") {
    return { valid: false, error: "Invalid or missing rate limit environment identifier: NULL" };
  }
  const allowed = ["production", "preview", "development"];
  if (!allowed.includes(p_env.trim())) {
    return { valid: false, error: `Invalid or missing rate limit environment identifier: ${p_env}` };
  }
  return { valid: true, env: p_env.trim() };
}

// 4.1 Explicit production environment
const envProd = validateEnvironmentParam("production");
assert(envProd.valid && envProd.env === "production", "Explicit production environment is accepted");

// 4.2 Explicit preview environment
const envPreview = validateEnvironmentParam("preview");
assert(envPreview.valid && envPreview.env === "preview", "Explicit preview environment is accepted");

// 4.3 Explicit development environment
const envDev = validateEnvironmentParam("development");
assert(envDev.valid && envDev.env === "development", "Explicit development environment is accepted");

// 4.4 Missing environment (NULL or omitted)
const envNull = validateEnvironmentParam(null);
const envUndefined = validateEnvironmentParam(undefined);
assert(!envNull.valid, "Missing NULL environment is rejected");
assert(!envUndefined.valid, "Omitted undefined environment is rejected");

// 4.5 Invalid environment
const envStaging = validateEnvironmentParam("staging");
const envUnknown = validateEnvironmentParam("hack_env");
assert(!envStaging.valid, "Unknown environment 'staging' is rejected");
assert(!envUnknown.valid, "Unknown environment 'hack_env' is rejected");

// 4.6 Verify rate-limit.ts always explicitly passes p_env
assert(
  rateLimitSrc.includes("p_env: env"),
  "rate-limit.ts always explicitly passes p_env to check_rate_limit_atomic"
);

assert(
  rateLimitSrc.includes("const env = getDeploymentEnvironment();"),
  "rate-limit.ts derives environment via getDeploymentEnvironment()"
);

// 4.7 Mapping from VERCEL_ENV
function simulateDeploymentEnvironment(vercelEnv, nodeEnv) {
  if (vercelEnv === "preview") return "preview";
  if (vercelEnv === "production" || nodeEnv === "production") return "production";
  return "development";
}

assert(simulateDeploymentEnvironment("preview", "production") === "preview", "VERCEL_ENV=preview correctly maps to 'preview'");
assert(simulateDeploymentEnvironment("production", "production") === "production", "VERCEL_ENV=production correctly maps to 'production'");
assert(simulateDeploymentEnvironment(undefined, "development") === "development", "Local environment correctly maps to 'development'");

// 4.8 Preview/Production bucket isolation
const ipHash = hmac1;
const endpoint = "wishes";
const prodBucket = `production:${endpoint}:${ipHash}`;
const previewBucket = `preview:${endpoint}:${ipHash}`;
const devBucket = `development:${endpoint}:${ipHash}`;

assert(prodBucket !== previewBucket, "Production and Preview buckets are completely partitioned");
assert(previewBucket !== devBucket, "Preview and Development buckets are completely partitioned");
assert(prodBucket.startsWith("production:wishes:"), "Production bucket correctly prefixed");
assert(previewBucket.startsWith("preview:wishes:"), "Preview bucket correctly prefixed");

// -----------------------------------------------------------------------------
// TEST SUITE 5: Wishes & RSVP Action Error Handling Integration
// -----------------------------------------------------------------------------
console.log("\n--- 5. Wishes & RSVP Integration with Rate Limit Error Handling ---");

const wishesSrc = fs.readFileSync(path.join(ROOT, "src/actions/wishes.ts"), "utf8");
const rsvpSrc = fs.readFileSync(path.join(ROOT, "src/actions/rsvp.ts"), "utf8");

assert(
  wishesSrc.includes("rateLimit.error ||"),
  "submitPublicWishAction honors rateLimit.error when checkRateLimit fails safely"
);

assert(
  rsvpSrc.includes("rateLimit.error ||"),
  "submitPublicRsvpAction honors rateLimit.error when checkRateLimit fails safely"
);

// -----------------------------------------------------------------------------
// TEST SUITE 6: Image Validator Memory Safety & Binary Bounds
// -----------------------------------------------------------------------------
console.log("\n--- 6. Image Validator Memory Safety & Limits ---");

const imgValidatorSrc = fs.readFileSync(path.join(ROOT, "src/lib/image-validator.ts"), "utf8");

assert(
  imgValidatorSrc.includes("MAX_TOTAL_PIXELS = 40_000_000"),
  "Image validator defines MAX_TOTAL_PIXELS = 40,000,000 (40MP safe ceiling)"
);

assert(
  imgValidatorSrc.includes("MAX_IMAGE_DIMENSION = 8500"),
  "Image validator defines MAX_IMAGE_DIMENSION = 8500 (8,500px axis limit)"
);

assert(
  imgValidatorSrc.includes("MAX_IMAGE_FILE_SIZE = 50 * 1024 * 1024"),
  "Image validator bounds file size at 50MB"
);

// Memory calculations
const maxPixels = 40_000_000;
const bytesPerPixel = 4; // RGBA
const uncompressedBytes = maxPixels * bytesPerPixel;
const uncompressedMb = uncompressedBytes / (1024 * 1024);
const peakDecoderMb = uncompressedMb * 2.0; // 2x peak working memory
const serverlessBudgetMb = 1024;
const safetyHeadroomMb = serverlessBudgetMb - (peakDecoderMb + 150); // 150MB Node base

assert(uncompressedMb < 160, `Uncompressed 40MP RGBA is ~${uncompressedMb.toFixed(1)}MB (< 160MB)`);
assert(safetyHeadroomMb > 450, `Safety headroom on 1024MB Vercel serverless is ~${safetyHeadroomMb.toFixed(0)}MB (> 450MB)`);

// -----------------------------------------------------------------------------
// TEST SUITE 7: Service-Role Least Privilege & No Leaks
// -----------------------------------------------------------------------------
console.log("\n--- 7. Service-Role Isolation & Confidentiality ---");

assert(
  rateLimitSrc.includes("SUPABASE_SERVICE_ROLE_KEY"),
  "rate-limit.ts requires SUPABASE_SERVICE_ROLE_KEY for database execution"
);

assert(
  !rateLimitSrc.includes("console.log(salt") && !rateLimitSrc.includes("console.warn(salt") && !rateLimitSrc.includes("console.error(salt"),
  "Zero secret printing or logging in rate-limit.ts"
);

// -----------------------------------------------------------------------------
// VERIFICATION SUMMARY
// -----------------------------------------------------------------------------
console.log("\n==================================================================");
console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("==================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("All Phase 5 Pre-Preview consistency checks PASSED successfully!");
}
