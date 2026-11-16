const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

// Replicate getSafeRedirectUrl logic for verification
function getSafeRedirectUrl(targetUrl, fallback = "/account") {
  if (!targetUrl || typeof targetUrl !== "string") {
    return fallback;
  }
  const trimmed = targetUrl.trim();
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("\\\\") ||
    trimmed.includes("://") ||
    /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ||
    /[\r\n]/.test(trimmed)
  ) {
    return fallback;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  return fallback;
}

async function runTests() {
  console.log("=== PHASE 4: SECURITY & DEPLOYMENT VERIFICATION ===");
  console.log(`Targeting: ${BASE_URL}\n`);

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

  // 1. OPEN REDIRECT DEFENSE UNIT TESTS
  console.log("1. Open Redirect Defense Unit Tests:");
  assert(getSafeRedirectUrl("//evil.com") === "/account", "Rejects protocol-relative //evil.com");
  assert(getSafeRedirectUrl("https://evil.com/phish") === "/account", "Rejects absolute https://evil.com");
  assert(getSafeRedirectUrl("http://evil.com") === "/account", "Rejects absolute http://evil.com");
  assert(getSafeRedirectUrl("javascript:alert(1)") === "/account", "Rejects javascript: scheme");
  assert(getSafeRedirectUrl("\\\\evil.com") === "/account", "Rejects backslash \\\\evil.com");
  assert(getSafeRedirectUrl("/admin/media") === "/admin/media", "Accepts safe relative /admin/media");
  assert(getSafeRedirectUrl("/gallery") === "/gallery", "Accepts safe relative /gallery");

  // 2. HTTP SECURITY HEADERS & ROUTE PROTECTION (Live Production Server)
  console.log("\n2. Testing Live Server Security Headers & Route Protection:");
  try {
    const homeRes = await fetch(`${BASE_URL}/`, { redirect: "manual" });
    assert(homeRes.status === 200, `Homepage status is 200 (got ${homeRes.status})`);
    
    const headers = homeRes.headers;
    const nosniff = headers.get("x-content-type-options");
    const frameOptions = headers.get("x-frame-options");
    const referrerPolicy = headers.get("referrer-policy");
    const hsts = headers.get("strict-transport-security");
    const permPolicy = headers.get("permissions-policy");
    const csp = headers.get("content-security-policy");

    assert(nosniff === "nosniff", `Header X-Content-Type-Options: nosniff (got ${nosniff})`);
    assert(frameOptions === "SAMEORIGIN", `Header X-Frame-Options: SAMEORIGIN (got ${frameOptions})`);
    assert(referrerPolicy === "strict-origin-when-cross-origin", `Header Referrer-Policy: strict-origin-when-cross-origin (got ${referrerPolicy})`);
    assert(hsts?.includes("max-age=63072000"), `Header Strict-Transport-Security: max-age=63072000 (got ${hsts})`);
    assert(permPolicy?.includes("camera=()"), `Header Permissions-Policy disables camera/mic (got ${permPolicy})`);
    assert(csp?.includes("default-src 'self'"), `Header Content-Security-Policy includes default-src 'self'`);
    assert(csp?.includes("youtube-nocookie.com"), `Header CSP permits youtube-nocookie.com`);

    // 3. ADMIN ROUTE REDIRECTION (UNAUTHENTICATED ACCESS PREVENTION)
    console.log("\n3. Testing Unauthenticated Route Protection:");
    const routesToTest = [
      { path: "/admin", expectedRedirect: "/admin/login" },
      { path: "/admin/media", expectedRedirect: "/admin/login" },
      { path: "/admin/rsvps", expectedRedirect: "/admin/login" },
      { path: "/admin/wishes", expectedRedirect: "/admin/login" },
      { path: "/admin/invitation", expectedRedirect: "/admin/login" },
      { path: "/account", expectedRedirect: "/login" },
    ];

    for (const route of routesToTest) {
      const res = await fetch(`${BASE_URL}${route.path}`, { redirect: "manual" });
      const status = res.status;
      const location = res.headers.get("location") || "";
      const isRedirect = status >= 300 && status < 400;
      const targetMatch = location.includes(route.expectedRedirect);
      assert(isRedirect && targetMatch, `Unauthenticated ${route.path} redirected to ${route.expectedRedirect} (status ${status}, location ${location})`);
    }

    // 4. MEDIA ENDPOINT DEFENSE
    console.log("\n4. Testing Media Endpoint Security:");
    const badMediaRes = await fetch(`${BASE_URL}/api/media/malicious-path-traversal-attempt`, { redirect: "manual" });
    assert(badMediaRes.status === 404, `Media API rejects non-UUID with 404 (got ${badMediaRes.status})`);

    const badExtMediaRes = await fetch(`${BASE_URL}/api/media/../../../etc/passwd`, { redirect: "manual" });
    assert(badExtMediaRes.status === 404 || badExtMediaRes.status === 400, `Media API rejects directory traversal (got ${badExtMediaRes.status})`);

    const nonExistentMediaRes = await fetch(`${BASE_URL}/api/media/00000000-0000-0000-0000-000000000000`, { redirect: "manual" });
    assert(nonExistentMediaRes.status === 404, `Media API returns 404 for non-existent item (got ${nonExistentMediaRes.status})`);

    // 5. PUBLIC ROUTES & SEO
    console.log("\n5. Testing Public Routes & SEO Assets:");
    const publicRoutes = ["/", "/gallery", "/wishes", "/rsvp", "/admin/login", "/privacy", "/terms"];
    for (const p of publicRoutes) {
      const res = await fetch(`${BASE_URL}${p}`);
      assert(res.status === 200, `Public route ${p} returns 200 OK (got ${res.status})`);
    }

    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    assert(robotsRes.status === 200, "robots.txt is accessible (200 OK)");
    const robotsText = await robotsRes.text();
    assert(robotsText.includes("Disallow: /admin"), "robots.txt disallows /admin");
    assert(robotsText.includes("Disallow: /account"), "robots.txt disallows /account");

    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    assert(sitemapRes.status === 200, "sitemap.xml is accessible (200 OK)");
    const sitemapText = await sitemapRes.text();
    assert(sitemapText.includes(BASE_URL) || sitemapText.includes("https://mithun-sakhi-wedding.vercel.app"), "sitemap.xml references valid base URL");

  } catch (err) {
    console.error("Live server test exception:", err.message);
    failed++;
  }

  console.log(`\n==========================================`);
  console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log(`==========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
