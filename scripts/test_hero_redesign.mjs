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

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("  HERO SECTION FINAL VISUAL REFINEMENTS VERIFICATION");
  console.log("========================================================\n");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  try {
    // ------------------------------------------------------------------
    // TEST 1: DESKTOP VIEWPORT (1440 x 900)
    // ------------------------------------------------------------------
    console.log("--- 1. Testing Desktop (1440x900) ---");
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(1000);

    // 1.1 Left alignment verification
    const navbarMonogram = await desktopPage.$("header >> text=M·K");
    const heroHeading = await desktopPage.$("h1#hero-title");
    const weddingCard = await desktopPage.$("div.max-w-xl:has-text('HALDI')");

    const navBox = await navbarMonogram.boundingBox();
    const headingBox = await heroHeading.boundingBox();
    const cardBox = await weddingCard.boundingBox();

    console.log(`  Position measurement:`);
    console.log(`    Navbar M·K left: ${navBox.x}px`);
    console.log(`    Heading left:    ${headingBox.x}px`);
    console.log(`    Card left:       ${cardBox.x}px`);

    // The left content should be close to 48px from screen edge (shifted left, matching navbar)
    assert(
      Math.abs(headingBox.x - navBox.x) < 20,
      `Hero heading is aligned with navbar logo (within 20px: heading=${Math.round(headingBox.x)}px, nav=${Math.round(navBox.x)}px)`
    );
    assert(
      headingBox.x < 75,
      `Hero left content is shifted left (left offset = ${Math.round(headingBox.x)}px < 75px)`
    );
    assert(
      Math.abs(cardBox.x - headingBox.x) < 20,
      `Wedding info card is aligned with hero heading (card=${Math.round(cardBox.x)}px, heading=${Math.round(headingBox.x)}px)`
    );

    // 1.2 Glow on main heading
    const headingShadow = await heroHeading.evaluate((el) => {
      return window.getComputedStyle(el).textShadow;
    });
    console.log(`    Heading text-shadow: ${headingShadow}`);
    assert(
      headingShadow && headingShadow !== "none",
      "Main heading has soft golden text-shadow and luminous aura applied"
    );

    // 1.3 Countdown 15% smaller and positioned in upper-right
    const countdownEls = await desktopPage.$$("div[aria-label='Wedding ceremony countdown timer']");
    let countdownBox = null;
    for (const el of countdownEls) {
      const box = await el.boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        countdownBox = box;
        break;
      }
    }
    console.log(`    Countdown visible box: width=${countdownBox?.width}px, height=${countdownBox?.height}px, x=${countdownBox?.x}px, y=${countdownBox?.y}px`);

    assert(
      countdownBox !== null && countdownBox.width <= 335,
      `Countdown card width is ~15% smaller (width=${Math.round(countdownBox?.width || 0)}px <= 335px)`
    );
    assert(
      countdownBox !== null && countdownBox.x > 950,
      `Countdown is positioned in upper-right corner (x=${Math.round(countdownBox?.x || 0)}px > 950px)`
    );

    // 1.4 Countdown details
    const countdownHeading = await desktopPage.$("text=THE SACRED VOWS BEGIN IN");
    assert(countdownHeading !== null, "Countdown card displays heading 'THE SACRED VOWS BEGIN IN'");

    const countdownDays = await desktopPage.$("text=DAYS");
    const countdownHours = await desktopPage.$("text=HOURS");
    const countdownMins = await desktopPage.$("text=MINS");
    const countdownSecs = await desktopPage.$("text=SECS");
    assert(
      countdownDays !== null &&
        countdownHours !== null &&
        countdownMins !== null &&
        countdownSecs !== null,
      "Countdown displays all 4 units (DAYS, HOURS, MINS, SECS)"
    );

    const countdownFooter = await desktopPage.$("text=21 NOVEMBER 2026 · 11:00 PM IST");
    assert(countdownFooter !== null, "Countdown footer displays '21 NOVEMBER 2026 · 11:00 PM IST'");

    // 1.5 CTA buttons & Music Player preserved
    const exploreBtn = await desktopPage.$("a:has-text('EXPLORE CELEBRATIONS')");
    assert(exploreBtn !== null, "Primary CTA button is preserved");

    const scheduleBtn = await desktopPage.$("a:has-text('CEREMONY SCHEDULE')");
    assert(scheduleBtn !== null, "Secondary CTA button is preserved");

    const playerTitle = await desktopPage.$("aside >> text=Sajna");
    assert(playerTitle !== null, "Compact music player is preserved");

    // Desktop Screenshot
    const desktopScreenshotPath = path.join(SCREENSHOT_DIR, "hero_refined_desktop_1440.png");
    await desktopPage.screenshot({
      path: desktopScreenshotPath,
      fullPage: false,
    });
    console.log(`  📸 Saved desktop screenshot: ${desktopScreenshotPath}`);
    await desktopContext.close();

    // ------------------------------------------------------------------
    // TEST 2: TABLET VIEWPORT (768 x 1024)
    // ------------------------------------------------------------------
    console.log("\n--- 2. Testing Tablet (768x1024) ---");
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 2,
    });
    const tabletPage = await tabletContext.newPage();
    await tabletPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await tabletPage.waitForTimeout(800);

    const tabletHeading = await tabletPage.$("h1#hero-title");
    assert(tabletHeading !== null, "Tablet view renders hero heading");

    const tabletCountdown = await tabletPage.$("text=THE SACRED VOWS BEGIN IN");
    assert(tabletCountdown !== null, "Tablet view renders countdown plaque");

    const tabletScreenshotPath = path.join(SCREENSHOT_DIR, "hero_refined_tablet_768.png");
    await tabletPage.screenshot({
      path: tabletScreenshotPath,
      fullPage: false,
    });
    console.log(`  📸 Saved tablet screenshot: ${tabletScreenshotPath}`);
    await tabletContext.close();

    // ------------------------------------------------------------------
    // TEST 3: MOBILE VIEWPORT (390 x 844)
    // ------------------------------------------------------------------
    console.log("\n--- 3. Testing Mobile (390x844) ---");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(BASE_URL, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(800);

    const mobileHeading = await mobilePage.$("h1#hero-title");
    assert(mobileHeading !== null, "Mobile view renders hero heading");

    const mobileCountdown = await mobilePage.$("text=THE SACRED VOWS BEGIN IN");
    assert(mobileCountdown !== null, "Mobile view renders countdown plaque");

    const mobileMusicPlayer = await mobilePage.$("aside >> text=Sajna");
    assert(mobileMusicPlayer !== null, "Mobile view renders compact music player");

    // Check no horizontal scroll on mobile
    const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
    assert(
      scrollWidth <= clientWidth,
      `Mobile page has no horizontal overflow (scrollWidth=${scrollWidth} <= clientWidth=${clientWidth})`
    );

    const mobileScreenshotPath = path.join(SCREENSHOT_DIR, "hero_refined_mobile_390.png");
    await mobilePage.screenshot({
      path: mobileScreenshotPath,
      fullPage: false,
    });
    console.log(`  📸 Saved mobile screenshot: ${mobileScreenshotPath}`);
    await mobileContext.close();

  } finally {
    await browser.close();
  }

  console.log("\n========================================================");
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
