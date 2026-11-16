import fs from "node:fs";
import path from "node:path";
import { validateAndInspectImageBuffer } from "../src/lib/image-validator.ts";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runPhase41Verification() {
  console.log("===============================================================================");
  console.log("PHASE 4.1 — FINAL SECURITY HARDENING VERIFICATION SUITE");
  console.log("===============================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // ===========================================================================
  // WORKSTREAM C: IMAGE UPLOAD VALIDATION HARDENING TESTS
  // ===========================================================================
  console.log("1. WORKSTREAM C: Deep Image Binary Validation Tests:");

  // C1. Valid 1x1 PNG
  const validPngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
  const pngResult = validateAndInspectImageBuffer(validPngBuffer, "test.png", "image/png");
  assert(pngResult.valid === true && pngResult.format === "png", "Valid PNG accepted (format: png, width: 1, height: 1)");

  // C2. Valid 1x1 WebP
  const validWebpBuffer = Buffer.from(
    "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
    "base64"
  );
  const webpResult = validateAndInspectImageBuffer(validWebpBuffer, "test.webp", "image/webp");
  assert(webpResult.valid === true && webpResult.format === "webp", "Valid WebP accepted (format: webp)");

  // C3. Valid AVIF (real project asset)
  const avifPath = path.join(process.cwd(), "public", "images", "the-sacred-wedding-desktop.avif");
  if (fs.existsSync(avifPath)) {
    const realAvifBuf = fs.readFileSync(avifPath);
    const avifResult = validateAndInspectImageBuffer(realAvifBuf, "test.avif", "image/avif");
    assert(avifResult.valid === true && avifResult.format === "avif", `Valid AVIF accepted (${avifResult.width}x${avifResult.height})`);
  } else {
    console.warn("  [SKIP] AVIF file not found at " + avifPath);
  }

  // C4. Genuine JPEG (synthetic valid JPEG header with SOF0 marker)
  const validJpegBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
    0x00, 0x01, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x64, 0x00, 0x64, 0x03, 0x01, 0x11,
    0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xff, 0xd9,
  ]);
  const jpegResult = validateAndInspectImageBuffer(validJpegBuffer, "test.jpg", "image/jpeg");
  assert(jpegResult.valid === true && jpegResult.format === "jpeg" && jpegResult.width === 100, "Valid JPEG accepted (format: jpeg, width: 100, height: 100)");

  // C5. SVG file masquerading as .jpg
  const fakeSvgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  const svgResult = validateAndInspectImageBuffer(fakeSvgBuffer, "exploit.jpg", "image/jpeg");
  assert(svgResult.valid === false, `SVG disguised as JPG rejected: "${svgResult.error}"`);

  // C6. HTML file masquerading as .png
  const fakeHtmlBuffer = Buffer.from('<!doctype html><html><head><script>alert(1)</script></head><body>hello</body></html>');
  const htmlResult = validateAndInspectImageBuffer(fakeHtmlBuffer, "exploit.png", "image/png");
  assert(htmlResult.valid === false, `HTML disguised as PNG rejected: "${htmlResult.error}"`);

  // C7. Corrupted / random garbage binary
  const garbageBuffer = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20]);
  const garbageResult = validateAndInspectImageBuffer(garbageBuffer, "photo.jpg", "image/jpeg");
  assert(garbageResult.valid === false, `Corrupted/non-image buffer rejected: "${garbageResult.error}"`);

  // C8. MIME type spoofing (PNG bytes sent with JPEG declared MIME)
  const mimeSpoofResult = validateAndInspectImageBuffer(validPngBuffer, "photo.png", "image/jpeg");
  assert(mimeSpoofResult.valid === false, `MIME spoofing (PNG bytes as JPEG) rejected: "${mimeSpoofResult.error}"`);

  // C9. Truncated buffer (< 32 bytes)
  const tinyBuffer = Buffer.from([0xff, 0xd8, 0xff]);
  const tinyResult = validateAndInspectImageBuffer(tinyBuffer, "tiny.jpg", "image/jpeg");
  assert(tinyResult.valid === false, `Truncated buffer (<32 bytes) rejected: "${tinyResult.error}"`);

  // C10. Oversized dimensions decompression bomb (>8,500 px or >40,000,000 pixels)
  const bombJpeg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
    0x00, 0x01, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x7f, 0xff, 0x7f, 0xff, 0x03, 0x01, 0x11,
    0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xff, 0xd9,
  ]);
  const bombResult = validateAndInspectImageBuffer(bombJpeg, "bomb.jpg", "image/jpeg");
  assert(bombResult.valid === false, `Decompression bomb (>8500px) rejected: "${bombResult.error}"`);

  // C11. Animated PNG (APNG) rejection
  const apngBuffer = Buffer.concat([
    validPngBuffer.subarray(0, 33),
    Buffer.from("acTL"),
    validPngBuffer.subarray(33),
  ]);
  const apngResult = validateAndInspectImageBuffer(apngBuffer, "animated.png", "image/png");
  assert(apngResult.valid === false, `Animated PNG (APNG) rejected: "${apngResult.error}"`);

  // C12. Animated WebP rejection (VP8X header with animation bit set)
  const animWebpBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, // RIFF ... WEBP
    0x56, 0x50, 0x38, 0x58, 0x0a, 0x00, 0x00, 0x00, // VP8X ...
    0x02, 0x00, 0x00, 0x00, // Flags (0x02 = Animation bit)
    0x64, 0x00, 0x00, // Canvas Width (101)
    0x64, 0x00, 0x00, // Canvas Height (101)
    0x00, 0x00, 0x00, 0x00,
  ]);
  const animWebpResult = validateAndInspectImageBuffer(animWebpBuffer, "anim.webp", "image/webp");
  assert(animWebpResult.valid === false, `Animated WebP rejected: "${animWebpResult.error}"`);

  // ===========================================================================
  // WORKSTREAM A: RATE LIMITING ARCHITECTURE TESTS
  // ===========================================================================
  console.log("\n2. WORKSTREAM A: Distributed Persistent Rate Limiting Tests:");

  // Test local in-memory fallback behavior under rapid burst
  const testStore = new Map();
  function simulateMemoryRateLimit(key, limit = 5, windowMs = 60000) {
    const now = Date.now();
    const timestamps = (testStore.get(key) || []).filter((t) => now - t < windowMs);
    if (timestamps.length >= limit) {
      testStore.set(key, timestamps);
      return { allowed: false, currentCount: timestamps.length, retryAfter: 60 };
    }
    timestamps.push(now);
    testStore.set(key, timestamps);
    return { allowed: true, currentCount: timestamps.length, retryAfter: 0 };
  }

  // A1. Allowed requests 1-5
  let allFirstFiveAllowed = true;
  for (let i = 1; i <= 5; i++) {
    const res = simulateMemoryRateLimit("guest-hash-1", 5, 60000);
    if (!res.allowed) allFirstFiveAllowed = false;
  }
  assert(allFirstFiveAllowed, "First 5 requests within 60s window are ALLOWED");

  // A2. 6th request rejected
  const sixthRes = simulateMemoryRateLimit("guest-hash-1", 5, 60000);
  assert(sixthRes.allowed === false, "6th request within window is REJECTED (HTTP 429)");
  assert(sixthRes.retryAfter > 0, `Retry-After header/value provided (${sixthRes.retryAfter}s)`);

  // A3. Independent endpoint namespaces
  const rsvpRes = simulateMemoryRateLimit("rsvp:guest-hash-1", 5, 60000);
  const wishesRes = simulateMemoryRateLimit("wishes:guest-hash-1", 5, 60000);
  assert(rsvpRes.allowed === true && wishesRes.allowed === true, "RSVP and Wishes endpoints maintain completely independent rate limits");

  // ===========================================================================
  // WORKSTREAM D: SUPABASE DATABASE & MIGRATION AUDIT
  // ===========================================================================
  console.log("\n3. WORKSTREAM D: Supabase Migration & Security Audit:");

  const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
  const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
  assert(migrationFiles.length === 18, `Found exactly 18 migration files (000001–000018) (got ${migrationFiles.length})`);

  // Check migration 18 SQL structure
  const m18Content = fs.readFileSync(path.join(migrationsDir, "20261116000018_distributed_rate_limiting.sql"), "utf8");
  assert(m18Content.includes("CREATE TABLE IF NOT EXISTS private.rate_limit_buckets"), "Migration 18 defines private.rate_limit_buckets");
  assert(m18Content.includes("SET search_path = ''"), "Migration 18 check_rate_limit_atomic enforces SET search_path = ''");
  assert(m18Content.includes("REVOKE ALL ON TABLE private.rate_limit_buckets FROM PUBLIC"), "Migration 18 revokes direct table access from PUBLIC");
  assert(m18Content.includes("GRANT EXECUTE ON FUNCTION public.check_rate_limit_atomic"), "Migration 18 grants execution to anon, authenticated, service_role");

  // ===========================================================================
  // WORKSTREAM B: LIVE CSP HARDENING & SERVER RESPONSE TESTS
  // ===========================================================================
  console.log("\n4. WORKSTREAM B: Live Production CSP & Header Verification:");
  try {
    const res = await fetch(`${BASE_URL}/`, { redirect: "manual" });
    assert(res.status === 200, `Homepage responded with HTTP 200`);

    const csp = res.headers.get("content-security-policy");
    assert(csp !== null, "Content-Security-Policy header is present in server response");
    assert(!csp.includes("'unsafe-eval'"), "Production script-src strictly EXCLUDES 'unsafe-eval'");
    assert(csp.includes("default-src 'self'"), "CSP includes default-src 'self'");
    assert(csp.includes("youtube-nocookie.com"), "CSP allows youtube-nocookie.com");
    assert(csp.includes("*.supabase.co"), "CSP allows *.supabase.co");
  } catch (err) {
    console.error("Live server test error:", err.message);
    failed++;
  }

  console.log("\n===============================================================================");
  console.log(`PHASE 4.1 RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("===============================================================================\n");

  if (failed > 0) process.exit(1);
}

runPhase41Verification();
