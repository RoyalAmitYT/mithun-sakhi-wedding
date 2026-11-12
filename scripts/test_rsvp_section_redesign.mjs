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
  console.log("  GUEST RSVP & ATTENDANCE SECTION REDESIGN VERIFICATION");
  console.log("========================================================\n");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  try {
    // ------------------------------------------------------------------
    // TEST 1: DESKTOP VIEWPORT (1440 x 900)
    // ------------------------------------------------------------------
    console.log("--- 1. Testing Desktop Viewport (1440x900) ---");
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(`${BASE_URL}/#rsvp`, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(1000);

    // 1.1 Section existence & Anchor
    const rsvpSection = await desktopPage.$("section#rsvp");
    assert(rsvpSection !== null, "Homepage renders <section id='rsvp'>");

    // 1.2 Section Eyebrow, Main Heading, Subtitle
    const eyebrowEl = await desktopPage.$("section#rsvp >> text=GUEST RSVP & ATTENDANCE");
    assert(eyebrowEl !== null, "Eyebrow 'GUEST RSVP & ATTENDANCE' is rendered");

    const headingEl = await desktopPage.$("h2#rsvp-title >> text=Confirm Your Presence");
    assert(headingEl !== null, "Main heading 'Confirm Your Presence' is rendered");

    const subtitleEl = await desktopPage.$(
      "section#rsvp >> text=Let us know if you'll be joining us for our wedding celebrations."
    );
    assert(subtitleEl !== null, "Subtitle text is rendered accurately");

    // 1.3 Single Central RSVP Card Content
    const cardEyebrow = await desktopPage.$("section#rsvp >> text=GUEST RSVP");
    assert(cardEyebrow !== null, "Card eyebrow 'GUEST RSVP' is rendered");

    const cardHeading = await desktopPage.$("section#rsvp >> text=Submit Your RSVP");
    assert(cardHeading !== null, "Card heading 'Submit Your RSVP' is rendered");

    const cardDesc = await desktopPage.$(
      "section#rsvp >> text=Create an account and confirm your attendance for the wedding ceremonies."
    );
    assert(cardDesc !== null, "Card description is rendered accurately");

    // 1.4 Action Buttons
    const primaryBtn = await desktopPage.$(
      "section#rsvp a[href='/register'] >> text=Create Account & RSVP"
    );
    assert(
      primaryBtn !== null,
      "Primary button 'Create Account & RSVP →' links directly to /register"
    );

    const secondaryBtn = await desktopPage.$(
      "section#rsvp a[href='/login'] >> text=Sign In"
    );
    assert(
      secondaryBtn !== null,
      "Secondary button 'Sign In' links directly to /login"
    );

    // 1.5 Strict verification of removed obsolete elements
    const obsoleteOpeningSoon = await desktopPage.$("text=Digital RSVP Opening Soon");
    assert(
      obsoleteOpeningSoon === null,
      "Strict check: 'Digital RSVP Opening Soon' is completely removed"
    );

    const obsoleteConnectFamily = await desktopPage.$("text=Connect with Family Team");
    assert(
      obsoleteConnectFamily === null,
      "Strict check: 'Connect with Family Team' button is completely removed"
    );

    const obsoleteDeadlinesTable = await desktopPage.$(
      "text=Scheduled RSVP Confirmation Deadlines"
    );
    assert(
      obsoleteDeadlinesTable === null,
      "Strict check: Scheduled RSVP deadlines table is completely removed"
    );

    const obsoleteCategories = await desktopPage.$("text=Adult / Child / Infant");
    assert(
      obsoleteCategories === null,
      "Strict check: No Adult/Child/Infant categories mentioned"
    );

    const obsoleteHowItWorks = await desktopPage.$("text=How It Works");
    assert(
      obsoleteHowItWorks === null,
      "Strict check: No 'How It Works' instructional cards added"
    );

    // 1.6 Desktop Button Alignment (Side by side on desktop)
    const primaryBox = await primaryBtn.boundingBox();
    const secondaryBox = await secondaryBtn.boundingBox();
    assert(
      primaryBox && secondaryBox && Math.abs(primaryBox.y - secondaryBox.y) < 10,
      `Buttons are positioned side-by-side on desktop (primary.y=${Math.round(
        primaryBox?.y || 0
      )}, secondary.y=${Math.round(secondaryBox?.y || 0)})`
    );

    // 1.7 Scroll into view and capture high-res desktop screenshot
    await rsvpSection.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(500);

    const desktopScreenshotPath = path.join(
      SCREENSHOT_DIR,
      "rsvp_section_desktop_1440.png"
    );
    await desktopPage.screenshot({
      path: desktopScreenshotPath,
      fullPage: false,
    });
    console.log(`  📸 Saved desktop screenshot: ${desktopScreenshotPath}`);

    // 1.8 Test Navigation to /register from primary button
    console.log("  Testing navigation to /register...");
    await primaryBtn.click();
    await desktopPage.waitForURL("**/register", { timeout: 5000 });
    assert(
      desktopPage.url().includes("/register"),
      "Clicking 'Create Account & RSVP' smoothly navigates to /register"
    );

    await desktopContext.close();

    // ------------------------------------------------------------------
    // TEST 2: TABLET VIEWPORT (768 x 1024)
    // ------------------------------------------------------------------
    console.log("\n--- 2. Testing Tablet Viewport (768x1024) ---");
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 2,
    });
    const tabletPage = await tabletContext.newPage();
    await tabletPage.goto(`${BASE_URL}/#rsvp`, { waitUntil: "networkidle" });
    await tabletPage.waitForTimeout(800);

    const tabletSection = await tabletPage.$("section#rsvp");
    await tabletSection.scrollIntoViewIfNeeded();
    await tabletPage.waitForTimeout(400);

    const tabletHeading = await tabletPage.$("h2#rsvp-title >> text=Confirm Your Presence");
    assert(tabletHeading !== null, "Tablet view renders main heading");

    const tabletCard = await tabletPage.$("section#rsvp >> text=Submit Your RSVP");
    assert(tabletCard !== null, "Tablet view renders central RSVP card");

    const tabletScreenshotPath = path.join(
      SCREENSHOT_DIR,
      "rsvp_section_tablet_768.png"
    );
    await tabletPage.screenshot({
      path: tabletScreenshotPath,
      fullPage: false,
    });
    console.log(`  📸 Saved tablet screenshot: ${tabletScreenshotPath}`);
    await tabletContext.close();

    // ------------------------------------------------------------------
    // TEST 3: MOBILE VIEWPORT (390 x 844)
    // ------------------------------------------------------------------
    console.log("\n--- 3. Testing Mobile Viewport (390x844) ---");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE_URL}/#rsvp`, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(1000);

    const mobileHeading = await mobilePage.$("h2#rsvp-title >> text=Confirm Your Presence");
    assert(mobileHeading !== null, "Mobile view renders main heading");
    if (mobileHeading) {
      await mobileHeading.scrollIntoViewIfNeeded();
      await mobilePage.waitForTimeout(500);
    }

    const mobilePrimary = await mobilePage.$(
      "section#rsvp a[href='/register'] button"
    );
    const mobileSecondary = await mobilePage.$(
      "section#rsvp a[href='/login'] button"
    );
    assert(mobilePrimary !== null && mobileSecondary !== null, "Mobile view renders both action buttons");

    const mobPriBox = await mobilePrimary.boundingBox();
    const mobSecBox = await mobileSecondary.boundingBox();
    console.log(`  Mobile buttons: primary.y=${Math.round(mobPriBox?.y || 0)}, secondary.y=${Math.round(mobSecBox?.y || 0)}`);
    assert(
      mobPriBox && mobSecBox && mobSecBox.y > mobPriBox.y + 30,
      `Buttons stack vertically on mobile (primary.y=${Math.round(
        mobPriBox?.y || 0
      )}, secondary.y=${Math.round(mobSecBox?.y || 0)})`
    );

    // Check no horizontal overflow
    const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
    console.log(`  Mobile page dimensions: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
    assert(scrollWidth <= clientWidth, "Mobile page has zero horizontal overflow");

    const mobileScreenshotPath = path.join(
      SCREENSHOT_DIR,
      "rsvp_section_mobile_390.png"
    );
    await mobilePage.screenshot({
      path: mobileScreenshotPath,
      fullPage: false,
    });
    console.log(`  📸 Saved mobile screenshot: ${mobileScreenshotPath}`);

    // 3.4 Test Secondary button navigation to /login
    console.log("  Testing navigation to /login...");
    await mobileSecondary.click();
    await mobilePage.waitForURL("**/login", { timeout: 5000 });
    assert(
      mobilePage.url().includes("/login"),
      "Clicking 'Sign In' smoothly navigates to /login"
    );

    await mobileContext.close();
  } catch (err) {
    console.error("Test execution failed with error:", err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log("\n========================================================");
  console.log(`  RSVP REDESIGN TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
