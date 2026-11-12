import { chromium } from "playwright";
import assert from "node:assert";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SCREENSHOT_DIR = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runGlobalIdentityTests() {
  console.log("================================================================================");
  console.log("MITHUN & SAKHI — GLOBAL IDENTITY & CANONICAL BRANDING VERIFICATION SUITE");
  console.log(`Target: ${BASE_URL}`);
  console.log("================================================================================\n");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // -------------------------------------------------------------------------
    // TEST 1: HOMEPAGE HERO & GLOBAL IDENTITY
    // -------------------------------------------------------------------------
    console.log("1. Testing Homepage ('/') Hero & Navigation Branding...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Page Title
    const homeTitle = await page.title();
    console.log(`   Page Title: "${homeTitle}"`);
    assert(
      homeTitle.includes("Mithun & Sakhi"),
      `Homepage title must include 'Mithun & Sakhi' (found: '${homeTitle}')`
    );
    assert(
      !homeTitle.includes("Kabita") && !homeTitle.includes("Manjura"),
      "Homepage title must NOT contain 'Kabita' or 'Manjura'"
    );

    // Navbar Brand Text & Monogram
    const navMonogram = await page.locator("header nav a span:has-text('M·S')").first();
    assert(
      (await navMonogram.count()) > 0,
      "Navbar brand monogram displays 'M·S'"
    );
    const navCoupleText = await page.locator("header nav").textContent();
    assert(
      navCoupleText.includes("Mithun & Sakhi"),
      "Navbar brand title displays 'Mithun & Sakhi'"
    );

    // Hero Section Couple Heading
    const heroHeading = await page.locator("#hero-title").textContent();
    console.log(`   Hero Heading: "${heroHeading.replace(/\s+/g, " ").trim()}"`);
    assert(
      heroHeading.includes("Mithun") && heroHeading.includes("Sakhi"),
      "Hero heading displays 'Mithun & Sakhi'"
    );
    assert(
      !heroHeading.includes("Kabita") && !heroHeading.includes("Manjura"),
      "Hero heading must NOT contain 'Kabita' or 'Manjura'"
    );

    // Capture Hero Screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "identity_hero_desktop_1440.png"),
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
    console.log("   ✓ Hero desktop screenshot saved.");

    // -------------------------------------------------------------------------
    // TEST 2: HOMEPAGE CEREMONIES & EVENTS SECTION
    // -------------------------------------------------------------------------
    console.log("\n2. Testing Events & Ceremony Fullscreen Sections...");
    const eventsText = await page.locator("#events").textContent();
    assert(
      !eventsText.includes("Kabita") && !eventsText.includes("Manjura"),
      "Events section DOM must NOT contain 'Kabita' or 'Manjura'"
    );

    // Verify calendar button links in #events use Mithun & Sakhi
    const weddingCalLink = await page.locator("#wedding a[href*='calendar.google.com']").getAttribute("href");
    assert(
      weddingCalLink && (weddingCalLink.includes("Mithun%20%26%20Sakhi") || weddingCalLink.includes("Sakhi")),
      "Wedding ceremony calendar link in #events uses 'Mithun & Sakhi'"
    );
    assert(
      weddingCalLink && !weddingCalLink.includes("Kabita") && !weddingCalLink.includes("Manjura"),
      "Wedding ceremony calendar link must NOT contain 'Kabita' or 'Manjura'"
    );

    // -------------------------------------------------------------------------
    // TEST 3: FAMILY SECTION STRICT IDENTITY CHECK
    // -------------------------------------------------------------------------
    console.log("\n3. Testing Family Section ('#family')...");
    const familySection = page.locator("#family");
    await familySection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const familyText = await familySection.textContent();

    // Central Plaque Monogram
    const familyPlaqueMonogram = familySection.locator("text=M • S");
    assert(
      (await familyPlaqueMonogram.count()) > 0,
      "Central family plaque displays 'M • S' monogram"
    );

    // Central Plaque Couple Name
    const familyPlaqueHeading = familySection.locator("h3:has-text('Mithun & Sakhi')");
    assert(
      (await familyPlaqueHeading.count()) > 0,
      "Central family plaque heading displays 'Mithun & Sakhi'"
    );

    // Bride Card Details
    const brideCard = familySection.locator("article[aria-labelledby='bride-family-title']");
    const brideName = await brideCard.locator("#bride-family-title").textContent();
    console.log(`   Bride Card Title: "${brideName.trim()}"`);
    assert(
      brideName.trim() === "Sakhi Gorain",
      `Bride card name must be strictly 'Sakhi Gorain' (found: '${brideName.trim()}')`
    );

    // Strict Absences in Bride Card
    assert(
      !familyText.includes("Kabita"),
      "Family section must NOT contain 'Kabita'"
    );
    assert(
      !familyText.includes("Manjura"),
      "Family section must NOT contain '(Manjura)' or 'Manjura'"
    );

    // Parents Preservation
    assert(
      familyText.includes("Mr. Kenaram Gorain") && familyText.includes("Ms. Savita Gorian"),
      "Groom's parents 'Mr. Kenaram Gorain & Ms. Savita Gorian' preserved exactly"
    );
    assert(
      familyText.includes("Mr. Upen Gorain") && familyText.includes("Ms. Kokila Gorain"),
      "Bride's parents 'Mr. Upen Gorain & Ms. Kokila Gorain' preserved exactly"
    );

    // Capture Family Screenshot
    await brideCard.screenshot({
      path: path.join(SCREENSHOT_DIR, "identity_family_bride_card.png"),
    });
    console.log("   ✓ Family bride card screenshot saved.");

    // -------------------------------------------------------------------------
    // TEST 4: FOOTER IDENTITY & COPYRIGHT
    // -------------------------------------------------------------------------
    console.log("\n4. Testing Editorial Footer...");
    const footer = page.locator("footer[role='contentinfo']");
    await footer.scrollIntoViewIfNeeded();
    const footerText = await footer.textContent();

    assert(
      footerText.includes("M•S") || footerText.includes("M·S") || (await footer.locator("text=M•S").count()) > 0,
      "Footer renders M•S monogram"
    );
    assert(
      footerText.includes("Mithun & Sakhi"),
      "Footer renders 'Mithun & Sakhi'"
    );
    assert(
      footerText.includes("© 2026 Mithun Gorain & Sakhi Gorain"),
      "Footer copyright line renders '© 2026 Mithun Gorain & Sakhi Gorain'"
    );
    assert(
      !footerText.includes("Kabita") && !footerText.includes("Manjura"),
      "Footer must NOT contain 'Kabita' or 'Manjura'"
    );

    // -------------------------------------------------------------------------
    // TEST 5: DEDICATED RSVP ROUTE ('/rsvp')
    // -------------------------------------------------------------------------
    console.log("\n5. Testing Dedicated RSVP Route ('/rsvp')...");
    await page.goto(`${BASE_URL}/rsvp`, { waitUntil: "networkidle" });
    const rsvpTitle = await page.title();
    console.log(`   RSVP Title: "${rsvpTitle}"`);
    assert(
      rsvpTitle.includes("Mithun & Sakhi"),
      `RSVP title must include 'Mithun & Sakhi' (found: '${rsvpTitle}')`
    );
    const rsvpBodyText = await page.locator("body").textContent();
    assert(
      !rsvpBodyText.includes("Kabita") && !rsvpBodyText.includes("Manjura"),
      "/rsvp route DOM must NOT contain 'Kabita' or 'Manjura'"
    );

    // -------------------------------------------------------------------------
    // TEST 6: GALLERY ROUTE ('/gallery')
    // -------------------------------------------------------------------------
    console.log("\n6. Testing Gallery Route ('/gallery')...");
    await page.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });
    const galleryTitle = await page.title();
    console.log(`   Gallery Title: "${galleryTitle}"`);
    assert(
      galleryTitle.includes("Mithun & Sakhi"),
      `Gallery title must include 'Mithun & Sakhi' (found: '${galleryTitle}')`
    );
    const galleryBodyText = await page.locator("body").textContent();
    assert(
      !galleryBodyText.includes("Kabita") && !galleryBodyText.includes("Manjura"),
      "/gallery route DOM must NOT contain 'Kabita' or 'Manjura'"
    );

    // -------------------------------------------------------------------------
    // TEST 7: AUTHENTICATION ROUTES ('/login' & '/register')
    // -------------------------------------------------------------------------
    console.log("\n7. Testing Unified Auth Routes ('/login' & '/register')...");
    await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });
    const authTitle = await page.title();
    console.log(`   Auth Title: "${authTitle}"`);
    assert(
      authTitle.includes("Mithun & Sakhi"),
      `Auth title must include 'Mithun & Sakhi' (found: '${authTitle}')`
    );

    const authCardEyebrow = await page.locator("body").textContent();
    assert(
      authCardEyebrow.includes("Mithun & Sakhi · 19–22 November 2026"),
      "Auth card subtitle renders 'Mithun & Sakhi · 19–22 November 2026'"
    );
    const authMonogram = page.locator("text=M·S");
    assert(
      (await authMonogram.count()) > 0,
      "Auth card renders M·S monogram emblem"
    );
    assert(
      !authCardEyebrow.includes("Kabita") && !authCardEyebrow.includes("Manjura"),
      "Auth card must NOT contain 'Kabita' or 'Manjura'"
    );

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "identity_auth_register_card.png"),
      clip: { x: 400, y: 100, width: 640, height: 750 },
    });
    console.log("   ✓ Auth card screenshot saved.");

    // -------------------------------------------------------------------------
    // TEST 8: MOBILE DRAWER CHECK (Viewport 390px)
    // -------------------------------------------------------------------------
    console.log("\n8. Testing Mobile Drawer (390px Viewport)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    const openDrawerBtn = mobilePage.locator("button[aria-label='Open navigation menu']");
    await openDrawerBtn.click();
    await mobilePage.waitForTimeout(400);

    await mobilePage.locator("div[role='dialog'], nav[aria-label='Mobile Navigation']").waitFor({ state: "visible" });
    const drawerText = await mobilePage.locator("body").textContent();

    assert(
      drawerText.includes("M•S") || (await mobilePage.locator("text=M•S").count()) > 0,
      "Mobile drawer renders 'M•S' monogram"
    );
    assert(
      drawerText.includes("Mithun & Sakhi"),
      "Mobile drawer header renders 'Mithun & Sakhi'"
    );
    assert(
      !drawerText.includes("Kabita") && !drawerText.includes("Manjura"),
      "Mobile drawer must NOT contain 'Kabita' or 'Manjura'"
    );

    await mobilePage.screenshot({
      path: path.join(SCREENSHOT_DIR, "identity_mobile_drawer_390.png"),
    });
    console.log("   ✓ Mobile drawer screenshot saved.");
    await mobileContext.close();

    // -------------------------------------------------------------------------
    // TEST 9: LEGAL ROUTES ('/privacy' & '/terms')
    // -------------------------------------------------------------------------
    console.log("\n9. Testing Legal Routes ('/privacy' & '/terms')...");
    await page.goto(`${BASE_URL}/privacy`, { waitUntil: "networkidle" });
    const privacyText = await page.locator("body").textContent();
    assert(
      privacyText.includes("Mithun Gorain and Sakhi Gorain"),
      "Privacy policy mentions 'Mithun Gorain and Sakhi Gorain'"
    );
    assert(
      !privacyText.includes("Kabita") && !privacyText.includes("Manjura"),
      "Privacy policy must NOT contain 'Kabita' or 'Manjura'"
    );

    await page.goto(`${BASE_URL}/terms`, { waitUntil: "networkidle" });
    const termsText = await page.locator("body").textContent();
    assert(
      termsText.includes("Mithun Gorain and Sakhi Gorain"),
      "Terms of use mentions 'Mithun Gorain and Sakhi Gorain'"
    );
    assert(
      termsText.includes("Mithun & Sakhi"),
      "Terms of use mentions 'Mithun & Sakhi'"
    );
    assert(
      !termsText.includes("Kabita") && !termsText.includes("Manjura"),
      "Terms of use must NOT contain 'Kabita' or 'Manjura'"
    );

    await context.close();
    console.log("\n================================================================================");
    console.log("ALL 9 GLOBAL IDENTITY VERIFICATION SUITES PASSED FLAWLESSLY! (0 ERRORS)");
    console.log("================================================================================");
  } finally {
    await browser.close();
  }
}

runGlobalIdentityTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
