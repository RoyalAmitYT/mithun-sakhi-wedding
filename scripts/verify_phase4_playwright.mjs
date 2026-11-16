import { chromium } from "playwright";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

const VIEWPORTS = [
  { name: "Desktop", width: 1440, height: 900 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Mobile", width: 375, height: 667 },
];

async function runBrowserAudit() {
  console.log("=== PLAYWRIGHT MULTI-DEVICE SECURITY & REGRESSION AUDIT ===");
  console.log(`Connecting to: ${BASE_URL}\n`);

  const browser = await chromium.launch({
    headless: true,
    channel: "msedge",
  });
  let totalErrors = 0;

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent:
        vp.name === "Mobile"
          ? "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1"
          : undefined,
    });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        // Filter out expected third-party favicon 404s or dev noise if any
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    // 1. Homepage
    console.log(`  Checking Homepage (/)`);
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const heroTitle = await page.title();
    console.log(`    Title: "${heroTitle}"`);

    // Check Hero headings
    const hasHero = await page.locator("h1").first().isVisible();
    console.log(`    H1 Visible: ${hasHero}`);

    // Check Audio Player widget
    const hasAudioToggle = await page.locator('button[aria-label*="audio" i], button[aria-label*="music" i]').first().isVisible().catch(() => false);
    console.log(`    Music button present: ${hasAudioToggle}`);

    // 2. Gallery (/gallery)
    console.log(`  Checking Gallery (/gallery)`);
    await page.goto(`${BASE_URL}/gallery`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const galleryHeading = await page.locator("h1, h2").first().textContent();
    console.log(`    Gallery heading: "${galleryHeading?.trim()}"`);

    // 3. Wishes (/wishes)
    console.log(`  Checking Wishes (/wishes)`);
    await page.goto(`${BASE_URL}/wishes`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const wishesHeading = await page.locator("h1, h2").first().textContent();
    console.log(`    Wishes heading: "${wishesHeading?.trim()}"`);

    // 4. RSVP (/rsvp)
    console.log(`  Checking RSVP (/rsvp)`);
    await page.goto(`${BASE_URL}/rsvp`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const rsvpHeading = await page.locator("h1, h2").first().textContent();
    console.log(`    RSVP heading: "${rsvpHeading?.trim()}"`);

    // 5. Admin Login (/admin/login)
    console.log(`  Checking Admin Login (/admin/login)`);
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const hasLoginForm = await page.locator("form").first().isVisible();
    console.log(`    Admin Login form visible: ${hasLoginForm}`);

    // Filter serious CSP or hydration errors
    const seriousErrors = consoleErrors.filter(
      (e) =>
        e.includes("Content-Security-Policy") ||
        e.includes("violates the following Content Security Policy") ||
        e.includes("Hydration failed") ||
        e.includes("Minified React error")
    );

    if (seriousErrors.length > 0) {
      console.error(`    [FAIL] Serious console/CSP errors on ${vp.name}:`, seriousErrors);
      totalErrors += seriousErrors.length;
    } else {
      console.log(`    [PASS] Clean execution with zero CSP/Hydration errors.`);
    }

    await context.close();
  }

  await browser.close();

  console.log(`\n==========================================`);
  if (totalErrors === 0) {
    console.log("ALL VIEWPORTS PASSED WITH ZERO SECURITY OR RENDERING ERRORS!");
  } else {
    console.error(`FAILED: ${totalErrors} serious errors encountered.`);
    process.exit(1);
  }
}

runBrowserAudit();
