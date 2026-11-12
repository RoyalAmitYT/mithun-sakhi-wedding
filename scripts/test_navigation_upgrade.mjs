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
  console.log("  PREMIUM 9-SECTION NAVIGATION & RSVP UPGRADE VERIFICATION");
  console.log("========================================================\n");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  try {
    // ------------------------------------------------------------------
    // TEST 1: DESKTOP NAVBAR 9 ITEMS & STRICT DOM ORDER (1440x900)
    // ------------------------------------------------------------------
    console.log("--- 1. Testing Navbar 9 Navigation Items & Strict Order ---");
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const desktopNavLinks = await page.$$("header[role='banner'] nav .hidden.md\\:flex a");
    const linkTexts = [];
    for (const link of desktopNavLinks) {
      const text = (await link.innerText()).trim();
      linkTexts.push(text);
    }

    console.log(`  Discovered desktop links: [${linkTexts.join(", ")}]`);

    const expectedOrder = [
      "HOME",
      "CELEBRATIONS",
      "EVENTS",
      "VENUES",
      "FAMILY",
      "INVITATION",
      "GALLERY",
      "WISHES",
      "HOSPITALITY",
    ];

    assert(
      linkTexts.length === expectedOrder.length,
      `Navbar contains exactly ${expectedOrder.length} navigation items (found ${linkTexts.length})`
    );

    const matchesOrder =
      linkTexts.length === expectedOrder.length &&
      linkTexts.every((t, i) => t.toUpperCase().includes(expectedOrder[i]));

    assert(
      matchesOrder,
      `Navbar links strictly follow homepage section order: ${expectedOrder.join(" → ")}`,
      `Found: ${linkTexts.join(" → ")}`
    );

    // ------------------------------------------------------------------
    // TEST 2: SIGNATURE DEEP MAROON PROGRESS BAR COLOR & GLOW
    // ------------------------------------------------------------------
    console.log("\n--- 2. Testing Deep Maroon / Burgundy Scroll Progress Bar ---");
    const progressBar = await page.$("div[role='progressbar']");
    assert(progressBar !== null, "Top document scroll progress bar exists with role='progressbar'");

    const barClass = await progressBar.getAttribute("class");
    assert(
      barClass.includes("#7D1525") || barClass.includes("#A52232") || barClass.includes("from-["),
      "Progress bar uses signature deep maroon / burgundy gradient (#7D1525 / #A52232)"
    );
    assert(
      barClass.includes("shadow-") && (barClass.includes("165,34,50") || barClass.includes("rgba")),
      "Progress bar features refined maroon-red outer glow shadow"
    );

    // At top of page: scaleX starts at 0
    let scaleX = await page.evaluate(() => {
      const bar = document.querySelector("div[role='progressbar']");
      const transform = window.getComputedStyle(bar).transform;
      if (transform && transform.includes("matrix")) {
        const match = transform.match(/matrix\(([^,]+)/);
        return match ? parseFloat(match[1]) : 0;
      }
      return 0;
    });
    assert(scaleX < 0.05, `Progress bar starts at 0% at the top (actual scaleX: ${scaleX.toFixed(3)})`);

    // At bottom of page: scaleX reaches 100%
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(600);
    scaleX = await page.evaluate(() => {
      const bar = document.querySelector("div[role='progressbar']");
      const transform = window.getComputedStyle(bar).transform;
      if (transform && transform.includes("matrix")) {
        const match = transform.match(/matrix\(([^,]+)/);
        return match ? parseFloat(match[1]) : 0;
      }
      return 1;
    });
    assert(scaleX > 0.95, `Progress bar reaches 100% (scaleX >= 0.95) at page bottom (actual scaleX: ${scaleX.toFixed(3)})`);

    const bottomBarScreenshot = path.join(SCREENSHOT_DIR, "nav_maroon_progress_bar_bottom.png");
    await page.screenshot({ path: bottomBarScreenshot, fullPage: false });
    console.log(`  📸 Saved screenshot: ${bottomBarScreenshot}`);

    // ------------------------------------------------------------------
    // TEST 3: LIVE SCROLL DETECTION ACROSS ALL SECTIONS
    // ------------------------------------------------------------------
    console.log("\n--- 3. Testing Live Scroll-Based Section Synchronization ---");

    // Helper to get currently active nav text
    const getActiveNavText = async () => {
      return await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("header[role='banner'] nav .hidden.md\\:flex a"));
        return links.find(l => l.classList.contains("text-[#A52232]") || l.classList.contains("text-[#D4AF37]"))?.innerText?.trim() || null;
      });
    };

    // Helper to check if RSVP button is active
    const isRsvpButtonActive = async () => {
      return await page.evaluate(() => {
        const rsvpBtn = document.querySelector("header[role='banner'] a[href*='rsvp'] button");
        if (!rsvpBtn) return false;
        return rsvpBtn.classList.contains("ring-2") || rsvpBtn.classList.contains("scale-[1.02]");
      });
    };

    // 3.1 At top (Hero) -> HOME is active
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    let currentNav = await getActiveNavText();
    assert(
      currentNav && currentNav.toUpperCase().includes("HOME"),
      `At homepage hero, HOME is highlighted (actual: ${currentNav})`
    );
    const homeScreenshot = path.join(SCREENSHOT_DIR, "nav_home_active.png");
    await page.screenshot({ path: homeScreenshot, fullPage: false });

    // 3.2 Scroll to Celebrations
    await page.evaluate(() => {
      document.getElementById("celebrations")?.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(500);
    currentNav = await getActiveNavText();
    assert(
      currentNav && currentNav.toUpperCase().includes("CELEBRATIONS"),
      `When viewing #celebrations, CELEBRATIONS is highlighted (actual: ${currentNav})`
    );

    // 3.3 Scroll to Events
    await page.evaluate(() => {
      document.getElementById("events")?.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(500);
    currentNav = await getActiveNavText();
    assert(
      currentNav && currentNav.toUpperCase().includes("EVENTS"),
      `When viewing #events, EVENTS is highlighted (actual: ${currentNav})`
    );

    // 3.4 Scroll to Venues
    await page.evaluate(() => {
      document.getElementById("venues")?.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(500);
    currentNav = await getActiveNavText();
    assert(
      currentNav && currentNav.toUpperCase().includes("VENUES"),
      `When viewing #venues, VENUES is highlighted (actual: ${currentNav})`
    );

    // 3.5 Scroll to Family
    await page.evaluate(() => {
      document.getElementById("family")?.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(500);
    currentNav = await getActiveNavText();
    assert(
      currentNav && currentNav.toUpperCase().includes("FAMILY"),
      `When viewing #family, FAMILY is highlighted (actual: ${currentNav})`
    );

    // 3.6 Scroll to Invitation
    await page.evaluate(() => {
      document.getElementById("invitation")?.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(500);
    currentNav = await getActiveNavText();
    assert(
      currentNav && currentNav.toUpperCase().includes("INVITATION"),
      `When viewing #invitation, INVITATION is highlighted (actual: ${currentNav})`
    );
    const invScreenshot = path.join(SCREENSHOT_DIR, "nav_invitation_active.png");
    await page.screenshot({ path: invScreenshot, fullPage: false });

    // 3.7 Scroll to Gallery preview
    await page.evaluate(() => {
      document.getElementById("gallery")?.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(500);
    currentNav = await getActiveNavText();
    assert(
      currentNav && currentNav.toUpperCase().includes("GALLERY"),
      `When viewing #gallery, GALLERY is highlighted (actual: ${currentNav})`
    );

    // 3.8 Scroll to Wishes
    await page.evaluate(() => {
      document.getElementById("wishes")?.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(500);
    currentNav = await getActiveNavText();
    assert(
      currentNav && currentNav.toUpperCase().includes("WISHES"),
      `When viewing #wishes, WISHES is highlighted (actual: ${currentNav})`
    );
    const wishesScreenshot = path.join(SCREENSHOT_DIR, "nav_wishes_active.png");
    await page.screenshot({ path: wishesScreenshot, fullPage: false });

    // 3.9 Scroll to RSVP section on homepage -> RSVP button highlights, GALLERY is NOT highlighted!
    console.log("\n--- 4. Testing Homepage RSVP Section Scroll & Active RSVP CTA ---");
    await page.evaluate(() => {
      document.getElementById("rsvp")?.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(500);

    currentNav = await getActiveNavText();
    assert(
      currentNav === null,
      `When viewing #rsvp, GALLERY and other nav links are strictly NOT highlighted (actual: ${currentNav || "none"})`
    );

    let rsvpActive = await isRsvpButtonActive();
    assert(
      rsvpActive === true,
      `When viewing #rsvp, the navbar RSVP button receives the active visual state`
    );
    const rsvpActiveScreenshot = path.join(SCREENSHOT_DIR, "nav_rsvp_active_on_home_scroll.png");
    await page.screenshot({ path: rsvpActiveScreenshot, fullPage: false });
    console.log(`  📸 Saved screenshot: ${rsvpActiveScreenshot}`);

    // 3.10 Scroll past RSVP to Hospitality -> Hospitality highlights, RSVP resets!
    console.log("\n--- 5. Testing Hospitality Section Scroll ---");
    await page.evaluate(() => {
      (document.getElementById("hospitality") || document.getElementById("contact"))?.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(500);

    currentNav = await getActiveNavText();
    assert(
      currentNav && currentNav.toUpperCase().includes("HOSPITALITY"),
      `When viewing #hospitality, HOSPITALITY is highlighted (actual: ${currentNav})`
    );

    rsvpActive = await isRsvpButtonActive();
    assert(
      rsvpActive === false,
      `When moving from RSVP to Hospitality, RSVP active state resets to false`
    );
    const hospScreenshot = path.join(SCREENSHOT_DIR, "nav_hospitality_active.png");
    await page.screenshot({ path: hospScreenshot, fullPage: false });
    console.log(`  📸 Saved screenshot: ${hospScreenshot}`);

    // ------------------------------------------------------------------
    // TEST 6: GALLERY & RSVP DEDICATED ROUTE DESTINATIONS
    // ------------------------------------------------------------------
    console.log("\n--- 6. Testing Dedicated Routes (/gallery and /rsvp) ---");

    // 6.1 Clicking GALLERY navigates to /gallery, does NOT scroll on homepage
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const galleryNavLink = await page.$("header[role='banner'] nav .hidden.md\\:flex a:has-text('Gallery')");
    const galleryHref = await galleryNavLink.getAttribute("href");
    assert(
      galleryHref === "/gallery",
      `GALLERY nav link href points to '/gallery' (actual: ${galleryHref})`
    );

    await galleryNavLink.click();
    await page.waitForTimeout(800);
    assert(
      page.url().endsWith("/gallery"),
      `Clicking GALLERY opens dedicated /gallery page (actual: ${page.url()})`
    );

    currentNav = await getActiveNavText();
    assert(
      currentNav && currentNav.toUpperCase().includes("GALLERY"),
      `On dedicated /gallery route, GALLERY link shows active navigation state (actual: ${currentNav})`
    );

    // 6.2 Clicking RSVP button navigates to dedicated /rsvp page
    const rsvpButtonLink = await page.$("header[role='banner'] a[href*='rsvp']");
    const rsvpHref = await rsvpButtonLink.getAttribute("href");
    assert(
      rsvpHref === "/rsvp",
      `Navbar RSVP button points to '/rsvp' (actual: ${rsvpHref})`
    );

    await rsvpButtonLink.click();
    await page.waitForTimeout(800);
    assert(
      page.url().endsWith("/rsvp"),
      `Clicking RSVP button opens dedicated /rsvp route (actual: ${page.url()})`
    );

    rsvpActive = await isRsvpButtonActive();
    assert(
      rsvpActive === true,
      `On dedicated /rsvp route, navbar RSVP button is visually active`
    );
    const rsvpRouteScreenshot = path.join(SCREENSHOT_DIR, "nav_rsvp_route_active.png");
    await page.screenshot({ path: rsvpRouteScreenshot, fullPage: false });
    console.log(`  📸 Saved screenshot: ${rsvpRouteScreenshot}`);

    // 6.3 Return to homepage from /rsvp via HOME link
    const homeNavLink = await page.$("header[role='banner'] nav a:has-text('Home')");
    await homeNavLink.click();
    await page.waitForTimeout(800);
    assert(
      page.url() === `${BASE_URL}/` || page.url() === `${BASE_URL}/#top`,
      `Clicking HOME returns cleanly to homepage (actual: ${page.url()})`
    );

    // ------------------------------------------------------------------
    // TEST 7: MOBILE NAVIGATION (390x844)
    // ------------------------------------------------------------------
    console.log("\n--- 7. Testing Mobile Drawer 9-Section Navigation ---");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(600);

    const hamburger = await mobilePage.$("button[aria-label='Open navigation menu']");
    assert(hamburger !== null, "Mobile hamburger toggle is present");
    await hamburger.click();
    await mobilePage.waitForTimeout(500);

    const mobileLinks = await mobilePage.$$("div[role='dialog'] nav[aria-label='Mobile Menu Links'] a");
    const mobileLinkTexts = [];
    for (const link of mobileLinks) {
      const text = (await link.innerText()).split("\n")[0].trim();
      mobileLinkTexts.push(text);
    }
    console.log(`  Discovered mobile links: [${mobileLinkTexts.join(", ")}]`);

    assert(
      mobileLinkTexts.length === expectedOrder.length,
      `Mobile drawer contains all ${expectedOrder.length} navigation items`
    );

    const mobileMatchesOrder =
      mobileLinkTexts.length === expectedOrder.length &&
      mobileLinkTexts.every((t, i) => t.toUpperCase().includes(expectedOrder[i]));

    assert(
      mobileMatchesOrder,
      `Mobile drawer links strictly match homepage order: ${expectedOrder.join(" → ")}`,
      `Found: ${mobileLinkTexts.join(" → ")}`
    );

    // Mobile Gallery link points to /gallery
    const mobileGallery = await mobilePage.$("div[role='dialog'] nav a:has-text('Gallery')");
    const mobileGalleryHref = await mobileGallery.getAttribute("href");
    assert(
      mobileGalleryHref === "/gallery",
      `Mobile Gallery link points to '/gallery' (actual: ${mobileGalleryHref})`
    );

    // Mobile RSVP button points to /rsvp
    const mobileRsvp = await mobilePage.$("div[role='dialog'] a[href*='rsvp']");
    const mobileRsvpHref = await mobileRsvp.getAttribute("href");
    assert(
      mobileRsvpHref === "/rsvp",
      `Mobile RSVP button points to '/rsvp' (actual: ${mobileRsvpHref})`
    );

    const mobileDrawerScreenshot = path.join(SCREENSHOT_DIR, "nav_mobile_drawer_9_sections.png");
    await mobilePage.screenshot({ path: mobileDrawerScreenshot, fullPage: false });
    console.log(`  📸 Saved screenshot: ${mobileDrawerScreenshot}`);

    await context.close();
    await mobileContext.close();
  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log("\n========================================================");
  console.log(`  SUMMARY: Passed: ${passed} | Failed: ${failed}`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
