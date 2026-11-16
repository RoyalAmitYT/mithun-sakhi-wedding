import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ROUTES = [
  { name: "Homepage", path: "/" },
  { name: "RSVP", path: "/rsvp" },
  { name: "Wishes", path: "/wishes" },
  { name: "Gallery", path: "/gallery" },
  { name: "Login (Auth)", path: "/login" },
  { name: "Admin Login", path: "/admin/login" },
];

async function measureRoute(browser, route, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  let jsBytes = 0;
  let cssBytes = 0;
  let totalBytes = 0;
  let requestCount = 0;

  page.on("response", async (res) => {
    try {
      const headers = res.headers();
      const len = parseInt(headers["content-length"] || "0", 10);
      const url = res.url();
      requestCount++;
      totalBytes += len;
      if (url.includes(".js") || headers["content-type"]?.includes("javascript")) {
        jsBytes += len;
      } else if (url.includes(".css") || headers["content-type"]?.includes("css")) {
        cssBytes += len;
      }
    } catch {
      // Ignore
    }
  });

  const startNav = Date.now();
  await page.goto(`http://localhost:3000${route.path}`, { waitUntil: "networkidle" });
  const navDuration = Date.now() - startNav;

  const metrics = await page.evaluate(async () => {
    const navEntries = performance.getEntriesByType("navigation");
    const nav = navEntries.length > 0 ? navEntries[0] : null;

    const paintEntries = performance.getEntriesByType("paint");
    let fcp = 0;
    for (const p of paintEntries) {
      if (p.name === "first-contentful-paint") fcp = p.startTime;
    }

    let cls = 0;
    const layoutShiftEntries = performance.getEntriesByType("layout-shift");
    for (const entry of layoutShiftEntries) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    }

    let lcp = 0;
    const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
    if (lcpEntries.length > 0) {
      lcp = lcpEntries[lcpEntries.length - 1].startTime;
    }

    let totalLongTaskDuration = 0;
    const longTasks = performance.getEntriesByType("longtask");
    for (const task of longTasks) {
      if (task.duration > 50) {
        totalLongTaskDuration += (task.duration - 50);
      }
    }

    return {
      ttfb: nav ? nav.responseStart - nav.requestStart : 0,
      fcp,
      lcp,
      cls,
      tbt: totalLongTaskDuration,
    };
  });

  await context.close();

  return {
    ...route,
    navDuration,
    requestCount,
    totalBytes: Math.round(totalBytes / 1024),
    jsBytes: Math.round(jsBytes / 1024),
    cssBytes: Math.round(cssBytes / 1024),
    ttfb: Math.round(metrics.ttfb),
    fcp: Math.round(metrics.fcp),
    lcp: Math.round(metrics.lcp),
    cls: parseFloat(metrics.cls.toFixed(4)),
    tbt: Math.round(metrics.tbt),
  };
}

async function measureNavigationTransitions(browser) {
  console.log("\n================================================================================");
  console.log("   MEASURING INTERACTION & NAVIGATION TRANSITIONS");
  console.log("================================================================================");

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const results = [];

  // 1. Hero CTA: Explore Celebrations (smooth scroll jump)
  const btn1 = page.locator("a:has-text('Explore Celebrations')").first();
  if (await btn1.count() > 0) {
    const t0 = Date.now();
    await btn1.click();
    await page.waitForTimeout(600);
    const scroll = await page.evaluate(() => window.scrollY);
    const durationMs = Date.now() - t0;
    results.push({ name: "Hero CTA -> Celebrations Scroll", durationMs, verified: scroll > 1500 });
    console.log(`✓ Hero CTA -> Celebrations: scrolled to ${scroll}px in ${durationMs}ms`);
  }

  // 2. Fresh page reload for clean scroll context
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  // 3. Hero CTA: View Invitation (smooth scroll jump)
  const btn2 = page.locator("a:has-text('View Invitation')").first();
  if (await btn2.count() > 0) {
    const t0 = Date.now();
    await btn2.click();
    await page.waitForTimeout(600);
    const scroll = await page.evaluate(() => window.scrollY);
    const durationMs = Date.now() - t0;
    results.push({ name: "Hero CTA -> Invitation Scroll", durationMs, verified: scroll > 3000 });
    console.log(`✓ Hero CTA -> Invitation: scrolled to ${scroll}px in ${durationMs}ms`);
  }

  // 4. Gallery Section CTA: "EXPLORE COMPLETE GALLERY" -> /gallery
  await page.goto("http://localhost:3000/#gallery", { waitUntil: "networkidle" });
  const galleryCta = page.locator("a:has-text('EXPLORE COMPLETE GALLERY')").first();
  await galleryCta.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const t0Gallery = Date.now();
  await galleryCta.click();
  await page.waitForURL("**/gallery");
  const galleryNavTime = Date.now() - t0Gallery;
  results.push({ name: "CTA: 'EXPLORE COMPLETE GALLERY' -> /gallery", durationMs: galleryNavTime, verified: true });
  console.log(`✓ CTA: 'EXPLORE COMPLETE GALLERY' navigated to /gallery in ${galleryNavTime}ms!`);

  // 5. Wishes Section CTA: "VIEW ALL BLESSINGS" -> /wishes
  await page.goto("http://localhost:3000/#wishes", { waitUntil: "networkidle" });
  const wishesCta = page.locator("a:has-text('VIEW ALL BLESSINGS')").first();
  await wishesCta.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const t0Wishes = Date.now();
  await wishesCta.click();
  await page.waitForURL("**/wishes");
  const wishesNavTime = Date.now() - t0Wishes;
  results.push({ name: "CTA: 'VIEW ALL BLESSINGS' -> /wishes", durationMs: wishesNavTime, verified: true });
  console.log(`✓ CTA: 'VIEW ALL BLESSINGS' navigated to /wishes in ${wishesNavTime}ms!`);

  // 6. Navbar Link: Homepage -> /rsvp
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const rsvpLink = page.locator("nav a[href='/rsvp'], a[href='/rsvp']").first();
  const t0Rsvp = Date.now();
  await rsvpLink.click();
  await page.waitForURL("**/rsvp");
  const rsvpNavTime = Date.now() - t0Rsvp;
  results.push({ name: "Navbar Link -> /rsvp", durationMs: rsvpNavTime, verified: true });
  console.log(`✓ Navbar Link navigated to /rsvp in ${rsvpNavTime}ms!`);

  await context.close();
  return results;
}

async function runBenchmark() {
  console.log("================================================================================");
  console.log("   PHASE 3 PERFORMANCE OPTIMIZATION BENCHMARK SUITE");
  console.log("================================================================================");

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  // 1. Audit Desktop Routes
  console.log("\nAuditing Desktop Routes (1440x900)...");
  const desktopResults = [];
  for (const route of ROUTES) {
    process.stdout.write(`- ${route.name} (${route.path})... `);
    const res = await measureRoute(browser, route);
    desktopResults.push(res);
    console.log(`FCP: ${res.fcp}ms | LCP: ${res.lcp}ms | CLS: ${res.cls} | Total: ${res.totalBytes} KB`);
  }

  // 2. Audit Mobile Routes (390x844 - iPhone 14)
  console.log("\nAuditing Mobile Routes (390x844)...");
  const mobileResults = [];
  for (const route of ROUTES.slice(0, 4)) {
    process.stdout.write(`- Mobile ${route.name}... `);
    const res = await measureRoute(browser, route, { width: 390, height: 844 });
    mobileResults.push(res);
    console.log(`FCP: ${res.fcp}ms | LCP: ${res.lcp}ms | CLS: ${res.cls} | Total: ${res.totalBytes} KB`);
  }

  // 3. Measure Navigation Transitions
  const transitions = await measureNavigationTransitions(browser);

  await browser.close();

  console.log("\n================================================================================");
  console.log("   DESKTOP PERFORMANCE RESULTS (1440x900)");
  console.log("================================================================================");
  console.table(desktopResults.map(r => ({
    Route: r.name,
    Path: r.path,
    "TTFB (ms)": r.ttfb,
    "FCP (ms)": r.fcp,
    "LCP (ms)": r.lcp,
    "CLS": r.cls,
    "TBT (ms)": r.tbt,
    "JS (KB)": r.jsBytes,
    "Total (KB)": r.totalBytes,
  })));

  console.log("\n================================================================================");
  console.log("   MOBILE PERFORMANCE RESULTS (390x844)");
  console.log("================================================================================");
  console.table(mobileResults.map(r => ({
    Route: r.name,
    "FCP (ms)": r.fcp,
    "LCP (ms)": r.lcp,
    "CLS": r.cls,
    "Total (KB)": r.totalBytes,
  })));

  console.log("\n================================================================================");
  console.log("   NAVIGATION TRANSITIONS & BUTTON RESPONSE LATENCY");
  console.log("================================================================================");
  console.table(transitions);

  const outDir = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/794ae1ef-d68d-456e-bb26-6c077d452fa4/scratch";
  fs.writeFileSync(path.join(outDir, "phase3_benchmark_results.json"), JSON.stringify({
    desktop: desktopResults,
    mobile: mobileResults,
    transitions,
  }, null, 2));

  console.log("\n✓ All performance benchmarks completed and persisted!");
}

runBenchmark().catch(err => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
