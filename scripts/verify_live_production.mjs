const PRODUCTION_URL = "https://mithun-sakhi-wedding.vercel.app";

console.log("==================================================================");
console.log(`  VERIFYING LIVE PRODUCTION: ${PRODUCTION_URL}`);
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

async function runVerification() {
  // 1. Homepage & Security Headers
  console.log("--- 1. Live Production Homepage & Security Headers ---");
  try {
    const homeRes = await fetch(`${PRODUCTION_URL}/`);
    assert(homeRes.status === 200, `Homepage responded with HTTP ${homeRes.status}`);

    const csp = homeRes.headers.get("content-security-policy");
    const hsts = homeRes.headers.get("strict-transport-security");
    const xcto = homeRes.headers.get("x-content-type-options");
    const xfo = homeRes.headers.get("x-frame-options");

    assert(csp && csp.includes("default-src 'self'"), "CSP header is active with default-src 'self'");
    assert(csp && !csp.includes("'unsafe-eval'"), "CSP header strictly excludes 'unsafe-eval'");
    assert(hsts && hsts.includes("max-age=63072000"), "HSTS header is active with 2-year max-age");
    assert(xcto === "nosniff", "X-Content-Type-Options: nosniff is active");
    assert(xfo === "SAMEORIGIN", "X-Frame-Options: SAMEORIGIN is active");

    const html = await homeRes.text();
    assert(html.includes("Mithun") && html.includes("Sakhi"), "Homepage contains Mithun & Sakhi names");
    assert(html.includes("The Sacred Wedding"), "Homepage contains wedding celebration sections");
    assert(html.includes("RSVP"), "Homepage contains RSVP entry");
  } catch (err) {
    assert(false, `Homepage request failed: ${err.message}`);
  }

  // 2. Core Navigation & Public Routes
  console.log("\n--- 2. Core Public Routes ---");
  const routes = [
    { path: "/gallery", name: "Gallery page" },
    { path: "/wishes", name: "Wishes guestbook page" },
    { path: "/rsvp", name: "RSVP page" },
    { path: "/privacy", name: "Privacy Policy" },
    { path: "/terms", name: "Terms of Service" },
    { path: "/robots.txt", name: "Robots file" },
    { path: "/sitemap.xml", name: "Sitemap XML" },
    { path: "/manifest.webmanifest", name: "Web App Manifest" },
  ];

  for (const route of routes) {
    try {
      const res = await fetch(`${PRODUCTION_URL}${route.path}`);
      assert(res.status === 200, `${route.name} (${route.path}) responded with HTTP 200`);
    } catch (err) {
      assert(false, `${route.name} (${route.path}) request failed: ${err.message}`);
    }
  }

  // 3. SEO & Robots Configuration
  console.log("\n--- 3. SEO & Crawl Protection ---");
  try {
    const robotsRes = await fetch(`${PRODUCTION_URL}/robots.txt`);
    const robotsTxt = await robotsRes.text();
    assert(robotsTxt.includes("Disallow: /admin"), "robots.txt protects /admin");
    assert(robotsTxt.includes("Disallow: /account"), "robots.txt protects /account");
    assert(robotsTxt.includes("Sitemap:"), "robots.txt declares sitemap location");
  } catch (err) {
    assert(false, `robots.txt check failed: ${err.message}`);
  }

  // 4. Critical Optimized Assets
  console.log("\n--- 4. Critical Optimized Media Assets ---");
  const assets = [
    "/images/mehendi-portrait-desktop.avif",
    "/images/the-sacred-wedding-desktop.avif",
    "/images/hero/mithun-sakhi-cinematic-hero-bg.webp",
    "/images/invitationcard-wedding-image-optimized.webp",
    "/images/invitationcard-haldi-image-optimized.webp",
    "/images/invitationcard-mehndi-image-optimized.webp",
    "/images/invitationcard-reception-image-optimized.webp",
  ];

  for (const assetPath of assets) {
    try {
      const res = await fetch(`${PRODUCTION_URL}${assetPath}`);
      assert(res.status === 200, `Asset ${assetPath} loaded successfully (HTTP 200, size: ${res.headers.get("content-length")} bytes)`);
    } catch (err) {
      assert(false, `Asset ${assetPath} failed: ${err.message}`);
    }
  }

  // 5. Protected Administrative Routes Guard
  console.log("\n--- 5. Protected Admin Routes Guard ---");
  const adminRoutes = ["/admin", "/admin/wishes", "/admin/rsvps", "/admin/media", "/account"];
  for (const adminRoute of adminRoutes) {
    try {
      const res = await fetch(`${PRODUCTION_URL}${adminRoute}`, { redirect: "manual" });
      assert(
        res.status === 307 || res.status === 308 || res.status === 302,
        `Unauthenticated ${adminRoute} is protected with redirect (HTTP ${res.status}, location: ${res.headers.get("location")})`
      );
    } catch (err) {
      assert(false, `Admin route ${adminRoute} check failed: ${err.message}`);
    }
  }

  // 6. Media Endpoint Directory Traversal & ID Defense
  console.log("\n--- 6. Media API Endpoint Hardening ---");
  try {
    const badUuidRes = await fetch(`${PRODUCTION_URL}/api/media/not-a-uuid`);
    assert(badUuidRes.status === 404, `Invalid UUID rejected with HTTP ${badUuidRes.status}`);

    const traversalRes = await fetch(`${PRODUCTION_URL}/api/media/..%2F..%2Fetc%2Fpasswd`);
    assert(traversalRes.status === 404, `Directory traversal rejected with HTTP ${traversalRes.status}`);
  } catch (err) {
    assert(false, `Media API checks failed: ${err.message}`);
  }

  // 7. Summary
  console.log("\n==================================================================");
  console.log(`  LIVE PRODUCTION VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();
