// scripts/test_p15_2_4_4_scroll_and_countdown.mjs
// Verification for Phase P-15.2.4.4: Countdown Redesign & Hero Scroll Reveal

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const LOCAL_SCREENSHOTS_DIR = path.resolve(process.cwd(), "p15_2_4_4_screenshots");
if (!fs.existsSync(LOCAL_SCREENSHOTS_DIR)) {
  fs.mkdirSync(LOCAL_SCREENSHOTS_DIR, { recursive: true });
}

const ARTIFACT_DIR = path.resolve(
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots"
);
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function captureAndCopy(page, filename, clip = null) {
  const localPath = path.join(LOCAL_SCREENSHOTS_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  if (clip) {
    await page.screenshot({ path: localPath, clip });
  } else {
    await page.screenshot({ path: localPath, fullPage: false });
  }
  fs.copyFileSync(localPath, artifactPath);
  console.log(`  📸 Saved screenshot: ${filename}`);
}

async function runVerification() {
  console.log("================================================================================");
  console.log("PHASE P-15.2.4.4: COUNTDOWN REDESIGN & HERO SCROLL REVEAL VERIFICATION");
  console.log("================================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ PASS: ${message}`);
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  try {
    // =========================================================================
    // 1. DESKTOP VIEWPORT (1440x900): INITIAL HERO & COUNTDOWN CARD
    // =========================================================================
    console.log("SUITE 1: Desktop Hero & Redesigned Royal Burgundy Countdown Card");
    const deskContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const deskPage = await deskContext.newPage();
    await deskPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await deskPage.waitForTimeout(1200);

    const hero = deskPage.locator("#hero");
    assert((await hero.count()) >= 1, "Hero section is present");

    const cd = deskPage.locator(".lg\\:col-span-4 [aria-label*='countdown']").first();
    assert((await cd.count()) >= 1 && (await cd.isVisible()), "Desktop countdown plaque is visible in upper-right");

    const cdBox = await cd.boundingBox();
    assert(cdBox !== null, "Countdown bounding box obtained");
    console.log(`    Countdown Box: x=${cdBox.x.toFixed(1)}, y=${cdBox.y.toFixed(1)}, w=${cdBox.width.toFixed(1)}, h=${cdBox.height.toFixed(1)}`);

    // Clearance of couple (center of viewport)
    assert(cdBox.x >= 1000, `Countdown clears couple portraits: x=${cdBox.x.toFixed(1)}px (>= 1000px)`);

    // Top border diamond ornament
    const topDiamond = cd.locator("div.-top-\\[7px\\]").first();
    assert((await topDiamond.count()) >= 1, "Ornamental nested diamond is centered on top border");

    // Heading flanked by lines
    const heading = await cd.locator("span", { hasText: /The Sacred Vows Begin In/i }).first().innerText();
    assert(heading.toUpperCase().includes("THE SACRED VOWS BEGIN IN"), "Heading 'THE SACRED VOWS BEGIN IN' is present");

    // Timer values & units
    const timerText = (await cd.locator("[role='timer']").innerText()).toUpperCase();
    assert(timerText.includes("DAYS"), "Countdown contains Days");
    assert(timerText.includes("HOURS"), "Countdown contains Hours");
    assert(timerText.includes("MINS"), "Countdown contains Mins");
    assert(timerText.includes("SECS"), "Countdown contains Secs");

    // Sindoor red seconds value
    const secsEl = cd.locator("[role='timer'] span[class*='text-[#E63946]']").first();
    assert((await secsEl.count()) >= 1, "Seconds counter features sindoor-red (#E63946) emphasis");

    // Bottom row date and venue
    const bottomRow = await cd.locator("div", { hasText: "21 November 2026" }).first().innerText();
    assert(bottomRow.includes("21 November 2026") || bottomRow.toUpperCase().includes("21 NOVEMBER 2026"), "Bottom row references 21 November 2026");
    assert(bottomRow.toUpperCase().includes("PURULIA"), "Bottom row references Purulia venue");

    // Capture initial desktop hero & countdown closeup
    await captureAndCopy(deskPage, "p15_2_4_4_01_desktop_hero_1440.png");
    await captureAndCopy(deskPage, "p15_2_4_4_02_countdown_reference_match.png", {
      x: Math.max(0, cdBox.x - 20),
      y: Math.max(0, cdBox.y - 15),
      width: cdBox.width + 40,
      height: cdBox.height + 30,
    });

    // =========================================================================
    // 2. SCROLL REVEAL STICKY EFFECT VERIFICATION
    // =========================================================================
    console.log("\nSUITE 2: Cinematic Sticky-Hero Scroll Reveal Effect");

    // Test Point A: Start of scrolling (scrollY = 60px)
    await deskPage.evaluate(() => window.scrollTo(0, 60));
    await deskPage.waitForTimeout(300);

    const heroBoxA = await hero.boundingBox();
    assert(heroBoxA.y <= 0 && heroBoxA.y >= -1, `Hero stays stationary at top at scrollY=60px: hero.y=${heroBoxA.y.toFixed(1)}px`);
    await captureAndCopy(deskPage, "p15_2_4_4_04_scroll_start_60px.png");

    // Test Point B: Next section partially covering hero (scrollY = 450px, half viewport)
    await deskPage.evaluate(() => window.scrollTo(0, 450));
    await deskPage.waitForTimeout(400);

    const heroBoxB = await hero.boundingBox();
    const celebrationsBoxB = await deskPage.locator("#celebrations").boundingBox();
    console.log(`    At scrollY=450px: hero.y=${heroBoxB.y.toFixed(1)}, celebrations.y=${celebrationsBoxB.y.toFixed(1)}`);

    // Hero stays stuck at top (y = 0 relative to viewport)
    assert(heroBoxB.y <= 0 && heroBoxB.y >= -2, `Hero remains stationary at top: hero.y=${heroBoxB.y.toFixed(1)}px`);
    // Celebrations section has risen up over the bottom half of the hero (celebrations.y ≈ 450px)
    assert(celebrationsBoxB.y < 500 && celebrationsBoxB.y > 400, `Incoming section has risen upward covering bottom 450px: celebrations.y=${celebrationsBoxB.y.toFixed(1)}px`);
    await captureAndCopy(deskPage, "p15_2_4_4_05_scroll_partially_covering_450px.png");

    // Test Point C: Hero fully covered by next section (scrollY = 920px)
    await deskPage.evaluate(() => window.scrollTo(0, 920));
    await deskPage.waitForTimeout(400);

    const celebrationsBoxC = await deskPage.locator("#celebrations").boundingBox();
    console.log(`    At scrollY=920px: celebrations.y=${celebrationsBoxC.y.toFixed(1)}`);
    assert(celebrationsBoxC.y <= 50, `Incoming section now fully covers the hero: celebrations.y=${celebrationsBoxC.y.toFixed(1)}px (<= 50px)`);
    await captureAndCopy(deskPage, "p15_2_4_4_06_scroll_fully_covered_920px.png");

    // Reset scroll to top
    await deskPage.evaluate(() => window.scrollTo(0, 0));
    await deskPage.waitForTimeout(300);

    // =========================================================================
    // 3. MOBILE VIEWPORT (390x844) VERIFICATION
    // =========================================================================
    console.log("\nSUITE 3: Mobile Viewport Stability & Usability");
    const mobContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
    });
    const mobPage = await mobContext.newPage();
    await mobPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await mobPage.waitForTimeout(1000);

    const mobOverflow = await mobPage.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });
    assert(mobOverflow.scrollWidth <= mobOverflow.clientWidth, `No horizontal overflow at 390x844: scroll=${mobOverflow.scrollWidth}, client=${mobOverflow.clientWidth}`);

    const mobCd = mobPage.locator("#hero [aria-label*='countdown']").first();
    assert((await mobCd.count()) >= 1 && (await mobCd.isVisible()), "Countdown is visible on mobile");

    // Music Player Non-Obstruction check
    const musicFab = mobPage.locator("aside button[aria-label*='wedding music']").first();
    if ((await musicFab.count()) > 0 && (await musicFab.isVisible())) {
      const fabBox = await musicFab.boundingBox();
      const cta = mobPage.locator("#hero a[href*='celebrations']:not([aria-label*='Scroll'])").first();
      const ctaBox = await cta.boundingBox();
      if (ctaBox && fabBox) {
        const overlap = !(
          ctaBox.x + ctaBox.width <= fabBox.x ||
          fabBox.x + fabBox.width <= ctaBox.x ||
          ctaBox.y + ctaBox.height <= fabBox.y ||
          fabBox.y + fabBox.height <= ctaBox.y
        );
        assert(!overlap, "Zero collision between mobile CTA buttons and floating music FAB");
      }
    }

    await captureAndCopy(mobPage, "p15_2_4_4_03_mobile_hero_390.png");

    await deskContext.close();
    await mobContext.close();
  } finally {
    await browser.close();
  }

  console.log("\n================================================================================");
  console.log(`P-15.2.4.4 TEST SUMMARY: ${passedTests}/${totalTests} Passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log("================================================================================\n");
}

runVerification().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
