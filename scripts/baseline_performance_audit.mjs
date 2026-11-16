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

async function measureRoute(browser, route) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
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

  // Extract Navigation and Web Vital metrics from Performance API
  const metrics = await page.evaluate(async () => {
    const navEntries = performance.getEntriesByType("navigation");
    const nav = navEntries.length > 0 ? navEntries[0] : null;

    const paintEntries = performance.getEntriesByType("paint");
    let fcp = 0;
    for (const p of paintEntries) {
      if (p.name === "first-contentful-paint") fcp = p.startTime;
    }

    // CLS
    let cls = 0;
    const layoutShiftEntries = performance.getEntriesByType("layout-shift");
    for (const entry of layoutShiftEntries) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    }

    // LCP
    let lcp = 0;
    const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
    if (lcpEntries.length > 0) {
      lcp = lcpEntries[lcpEntries.length - 1].startTime;
    }

    // Long Tasks (TBT approximation)
    let totalLongTaskDuration = 0;
    const longTasks = performance.getEntriesByType("longtask");
    for (const task of longTasks) {
      if (task.duration > 50) {
        totalLongTaskDuration += (task.duration - 50);
      }
    }

    // Memory (if available)
    let usedHeap = 0;
    if (performance.memory) {
      usedHeap = performance.memory.usedJSHeapSize;
    }

    return {
      ttfb: nav ? nav.responseStart - nav.requestStart : 0,
      domInteractive: nav ? nav.domInteractive : 0,
      domComplete: nav ? nav.domComplete : 0,
      loadEventEnd: nav ? nav.loadEventEnd : 0,
      fcp,
      lcp,
      cls,
      tbt: totalLongTaskDuration,
      usedHeap,
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
    usedHeapMB: (metrics.usedHeap / 1024 / 1024).toFixed(1),
  };
}

async function measureNavigationTransitions(browser) {
  console.log("\n--- Measuring Client-Side Button & Navigation Latency ---");
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const results = [];

  // 1. Hero -> Explore Celebrations (#celebrations)
  const btn1 = page.locator("a[href='#celebrations'], button:has-text('Explore Celebrations'), a:has-text('Celebrations')").first();
  if (await btn1.count() > 0) {
    const t0 = Date.now();
    await btn1.click();
    await page.waitForTimeout(300);
    results.push({ name: "Hero -> Celebrations (Scroll)", durationMs: Date.now() - t0 });
  }

  // 2. Hero -> View Invitation (#invitation)
  const btn2 = page.locator("a[href='#invitation'], a:has-text('Invitation')").first();
  if (await btn2.count() > 0) {
    const t0 = Date.now();
    await btn2.click();
    await page.waitForTimeout(300);
    results.push({ name: "Hero -> Invitation (Scroll)", durationMs: Date.now() - t0 });
  }

  // 3. Navigation to /gallery
  const galleryLink = page.locator("nav a[href='/gallery'], a[href='/gallery']").first();
  if (await galleryLink.count() > 0) {
    const t0 = Date.now();
    await galleryLink.click();
    await page.waitForURL("**/gallery");
    results.push({ name: "Homepage -> /gallery (Route)", durationMs: Date.now() - t0 });
  }

  // 4. Navigation to /wishes
  const wishesLink = page.locator("nav a[href='/wishes'], a[href='/wishes']").first();
  if (await wishesLink.count() > 0) {
    const t0 = Date.now();
    await wishesLink.click();
    await page.waitForURL("**/wishes");
    results.push({ name: "Gallery -> /wishes (Route)", durationMs: Date.now() - t0 });
  }

  // 5. Navigation to /rsvp
  const rsvpLink = page.locator("nav a[href='/rsvp'], a[href='/rsvp']").first();
  if (await rsvpLink.count() > 0) {
    const t0 = Date.now();
    await rsvpLink.click();
    await page.waitForURL("**/rsvp");
    results.push({ name: "Wishes -> /rsvp (Route)", durationMs: Date.now() - t0 });
  }

  await context.close();
  return results;
}

async function runBaselineAudit() {
  console.log("================================================================================");
  console.log("   PHASE 3.0 — BASELINE PERFORMANCE AUDIT");
  console.log("================================================================================");

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const routeResults = [];
  for (const route of ROUTES) {
    process.stdout.write(`Auditing route: ${route.name} (${route.path})... `);
    const res = await measureRoute(browser, route);
    routeResults.push(res);
    console.log(`Done! (FCP: ${res.fcp}ms, LCP: ${res.lcp}ms, JS: ${res.jsBytes} KB, Total: ${res.totalBytes} KB)`);
  }

  const navResults = await measureNavigationTransitions(browser);

  await browser.close();

  console.log("\n================================================================================");
  console.log("   BASELINE AUDIT SUMMARY TABLE");
  console.log("================================================================================");
  console.table(routeResults.map(r => ({
    Route: r.name,
    Path: r.path,
    "TTFB (ms)": r.ttfb,
    "FCP (ms)": r.fcp,
    "LCP (ms)": r.lcp,
    "CLS": r.cls,
    "TBT (ms)": r.tbt,
    "JS (KB)": r.jsBytes,
    "CSS (KB)": r.cssBytes,
    "Total (KB)": r.totalBytes,
    "Nav (ms)": r.navDuration,
  })));

  console.log("\nNavigation Interaction Latencies:");
  console.table(navResults);

  const outPath = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/794ae1ef-d68d-456e-bb26-6c077d452fa4/scratch/baseline_results.json";
  fs.writeFileSync(outPath, JSON.stringify({ routes: routeResults, transitions: navResults }, null, 2));
  console.log(`Saved baseline results to: ${outPath}`);
}

runBaselineAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
