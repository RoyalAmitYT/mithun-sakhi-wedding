import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR = path.resolve(
  process.env.USERPROFILE || process.env.HOME || "",
  ".gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots"
);

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

let passed = 0;
let failed = 0;

function assert(condition, message, details = "") {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message} ${details ? `(${details})` : ""}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("  EVENTS NAVIGATION & ROUTE REFACTOR VERIFICATION");
  console.log("========================================================\n");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  try {
    // ------------------------------------------------------------------
    // TEST 1: HOMEPAGE OFFICIAL EVENTS SECTION & HEADING
    // ------------------------------------------------------------------
    console.log("--- 1. Testing Homepage Official Events Section ---");
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // 1.1 Exactly ONE section with id="events"
    const eventSections = await page.$$("section#events");
    assert(
      eventSections.length === 1,
      `Homepage has exactly one official Events section with ID 'events' (count=${eventSections.length})`
    );

    // 1.2 Eyebrow: FOUR DAYS · FOUR SPECIAL MOMENTS
    const eyebrowEl = await page.$(
      "section#events >> text=FOUR DAYS · FOUR SPECIAL MOMENTS"
    );
    assert(
      eyebrowEl !== null,
      "Official Events section renders eyebrow 'FOUR DAYS · FOUR SPECIAL MOMENTS'"
    );

    // 1.3 Main Heading: THE CEREMONIAL JOURNEY
    const headingEl = await page.$(
      "section#events h2#events-heading >> text=THE CEREMONIAL JOURNEY"
    );
    assert(
      headingEl !== null,
      "Official Events section renders main heading 'THE CEREMONIAL JOURNEY'"
    );

    // 1.4 Antique gold decorative divider beneath heading
    const dividerEl = await page.$(
      "section#events >> div:has-text('THE CEREMONIAL JOURNEY') + div"
    );
    assert(dividerEl !== null, "Antique-gold decorative divider appears beneath heading");

    // 1.5 Heading appears immediately before Haldi ceremony
    const headingBox = await headingEl.boundingBox();
    const haldiEl = await page.$("section#haldi");
    const haldiBox = await haldiEl.boundingBox();
    assert(
      headingBox && haldiBox && headingBox.y < haldiBox.y,
      `Heading appears immediately before the first ceremony (Haldi) (heading.y=${Math.round(
        headingBox?.y || 0
      )}, haldi.y=${Math.round(haldiBox?.y || 0)})`
    );

    // 1.6 All 4 ceremony sections remain visually and functionally intact
    const haldiTitle = await page.$("section#haldi >> text=Haldi");
    const mehndiTitle = await page.$("section#mehndi >> text=Mehndi");
    const weddingTitle = await page.$("section#wedding >> text=The Sacred Wedding");
    const receptionTitle = await page.$("section#reception >> text=Reception & Preetibhoj");

    assert(haldiTitle !== null, "Haldi Ceremony section intact");
    assert(mehndiTitle !== null, "Mehndi Ceremony section intact");
    assert(weddingTitle !== null, "The Sacred Wedding ceremony section intact");
    assert(receptionTitle !== null, "Reception & Preetibhoj ceremony section intact");

    // ------------------------------------------------------------------
    // TEST 2: NAVBAR EVENTS LINK & SMOOTH SCROLLING
    // ------------------------------------------------------------------
    console.log("\n--- 2. Testing Navbar Events Link & In-Page Navigation ---");

    // 2.1 Navbar Events link points to #events on homepage
    const navbarEventsLink = await page.$(
      "header[role='banner'] a:has-text('Events')"
    );
    const eventsHref = await navbarEventsLink.getAttribute("href");
    assert(
      eventsHref === "#events",
      `Navbar 'Events' link points to '#events' on homepage (actual: ${eventsHref})`
    );

    // 2.2 Click Events link in navbar and verify smooth scroll to #events
    await navbarEventsLink.click();
    await page.waitForTimeout(1000);

    // Verify heading is visible in viewport and not obscured by navbar
    const navbarEl = await page.$("header[role='banner']");
    const navBox = await navbarEl.boundingBox();
    const currentHeadingBox = await headingEl.boundingBox();

    assert(
      currentHeadingBox &&
        currentHeadingBox.y >= (navBox?.height || 70) - 10 &&
        currentHeadingBox.y < 300,
      `Navbar does not cover 'THE CEREMONIAL JOURNEY' heading after navigation (heading.y=${Math.round(
        currentHeadingBox?.y || 0
      )}px, navbar.height=${Math.round(navBox?.height || 70)}px)`
    );

    // Screenshot of the official Events section on desktop
    const desktopScreenshotPath = path.join(
      SCREENSHOT_DIR,
      "events_section_heading_desktop.png"
    );
    await page.screenshot({
      path: desktopScreenshotPath,
      fullPage: false,
    });
    console.log(`  📸 Saved desktop screenshot: ${desktopScreenshotPath}`);

    // ------------------------------------------------------------------
    // TEST 3: CROSS-PAGE NAVIGATION FROM /GALLERY TO /#EVENTS
    // ------------------------------------------------------------------
    console.log("\n--- 3. Testing Cross-Page Navigation from Public Route ---");
    await page.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const galleryEventsLink = await page.$(
      "header[role='banner'] a:has-text('Events')"
    );
    const galleryEventsHref = await galleryEventsLink.getAttribute("href");
    assert(
      galleryEventsHref === "/#events",
      `From /gallery, navbar 'Events' link points to '/#events' (actual: ${galleryEventsHref})`
    );

    // Click Events from gallery
    await galleryEventsLink.click();
    await page.waitForURL("**/#events", { timeout: 8000 });
    await page.waitForTimeout(1000);

    const arrivedHeading = await page.$("h2#events-heading");
    assert(
      arrivedHeading !== null && page.url().includes("#events"),
      "Successfully navigated from /gallery to homepage #events section"
    );

    await context.close();

    // ------------------------------------------------------------------
    // TEST 4: MOBILE RESPONSIVE NAVIGATION & DRAWER
    // ------------------------------------------------------------------
    console.log("\n--- 4. Testing Mobile Drawer Events Link ---");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(800);

    // Open mobile hamburger menu
    const menuBtn = await mobilePage.$("button[aria-label='Open navigation menu']");
    await menuBtn.click();
    await mobilePage.waitForTimeout(500);

    // Check Events link in mobile drawer
    const mobileEventsLink = await mobilePage.$(
      "nav[aria-label='Mobile Menu Links'] a:has-text('Events')"
    );
    assert(mobileEventsLink !== null, "Mobile drawer renders 'Events' navigation link");

    const mobileEventsHref = await mobileEventsLink.getAttribute("href");
    assert(
      mobileEventsHref === "#events",
      `Mobile drawer Events link points to '#events' (actual: ${mobileEventsHref})`
    );

    // Click mobile events link
    await mobileEventsLink.click();
    await mobilePage.waitForTimeout(1000);

    const mobileHeading = await mobilePage.$("h2#events-heading");
    const mobHeadingBox = await mobileHeading.boundingBox();
    assert(
      mobHeadingBox !== null && mobHeadingBox.y < 400,
      `Mobile view scrolled to Events heading (y=${Math.round(mobHeadingBox?.y || 0)}px)`
    );

    const mobileScreenshotPath = path.join(
      SCREENSHOT_DIR,
      "events_section_heading_mobile.png"
    );
    await mobilePage.screenshot({
      path: mobileScreenshotPath,
      fullPage: false,
    });
    console.log(`  📸 Saved mobile screenshot: ${mobileScreenshotPath}`);
    await mobileContext.close();

    // ------------------------------------------------------------------
    // TEST 5: REMOVED /EVENTS ROUTE VERIFICATION (404)
    // ------------------------------------------------------------------
    console.log("\n--- 5. Testing Route Deletion & 404 Status ---");
    const standalonePage = await browser.newPage();
    const response = await standalonePage.goto(`${BASE_URL}/events`, {
      waitUntil: "networkidle",
    });
    assert(
      response.status() === 404,
      `Separate /events route returns HTTP 404 Not Found (actual status: ${response.status()})`
    );

    const notFoundText = await standalonePage.$("text=404");
    assert(notFoundText !== null, "Page displays standard Next.js 404 Not Found response");
    await standalonePage.close();

    // ------------------------------------------------------------------
    // TEST 6: SITEMAP VERIFICATION
    // ------------------------------------------------------------------
    console.log("\n--- 6. Testing Sitemap ---");
    const sitemapPage = await browser.newPage();
    const sitemapResp = await sitemapPage.goto(`${BASE_URL}/sitemap.xml`);
    const sitemapText = await sitemapResp.text();

    assert(
      !sitemapText.includes("/events</loc>") && !sitemapText.includes("/events/"),
      "Sitemap does not list the deleted /events route"
    );
    assert(
      sitemapText.includes("/gallery") && sitemapText.includes("/invitation"),
      "Sitemap still contains valid public routes (/gallery, /invitation)"
    );
    await sitemapPage.close();
  } catch (err) {
    console.error("Test execution failed:", err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log("\n========================================================");
  console.log(`  EVENTS REFACTOR RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
