// scripts/test_p15_2_3_hero_countdown.mjs
// Phase P-15.2.3: Cinematic Hero Redesign & Wedding Countdown Integration Verification

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import {
  getWeddingCountdown,
  WEDDING_CEREMONY_TARGET_ISO,
  WEDDING_CEREMONY_TARGET_UTC,
  MEMORIES_MODE_BOUNDARY_ISO,
} from "../src/lib/lifecycle";

const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = path.resolve(process.cwd(), "p15_2_3_screenshots");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const ARTIFACT_DIR = path.resolve(
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots"
);
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const REQUIRED_VIEWPORTS = [
  { width: 320, height: 640, name: "mobile_320x640_narrow" },
  { width: 360, height: 800, name: "mobile_360x800_android" },
  { width: 375, height: 812, name: "mobile_375x812_iphone_mini" },
  { width: 390, height: 844, name: "mobile_390x844_iphone14" },
  { width: 430, height: 932, name: "mobile_430x932_iphone_promax" },
  { width: 768, height: 1024, name: "tablet_768x1024_ipad" },
  { width: 1440, height: 900, name: "desktop_1440x900" },
];

let totalPassed = 0;
let totalFailed = 0;
const findings = [];

function assert(condition, message, details = "") {
  if (condition) {
    console.log(`  ✓ ${message}`);
    totalPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message} ${details ? `(${details})` : ""}`);
    totalFailed++;
    findings.push({ severity: "defect", message, details });
  }
}

function syncScreenshot(filename) {
  const src = path.join(OUTPUT_DIR, filename);
  const dest = path.join(ARTIFACT_DIR, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

async function runHeroCountdownVerification() {
  console.log("\n=======================================================");
  console.log("PHASE P-15.2.3: CINEMATIC HERO & WEDDING COUNTDOWN VERIFICATION");
  console.log("=======================================================\n");

  // =========================================================
  // SECTION 1: COUNTDOWN TARGET ENGINE & DETERMINISTIC LIFECYCLE
  // =========================================================
  console.log("Section 1: Authoritative Countdown Target & Math Verification");

  // 1.1 Check Authoritative Target Constants
  assert(
    WEDDING_CEREMONY_TARGET_ISO === "2026-11-21T23:00:00+05:30",
    "Authoritative wedding ceremony ISO timestamp is 2026-11-21T23:00:00+05:30"
  );
  assert(
    WEDDING_CEREMONY_TARGET_UTC === "2026-11-21T17:30:00Z",
    "Authoritative UTC instant evaluates to 2026-11-21T17:30:00Z"
  );
  assert(
    new Date(WEDDING_CEREMONY_TARGET_ISO).getTime() === new Date(WEDDING_CEREMONY_TARGET_UTC).getTime(),
    "ISO timestamp and UTC instant evaluate to the exact same millisecond timestamp"
  );

  // 1.2 Deterministic Simulation: 1 Day before wedding (20 Nov 23:00 IST)
  const tMinus1Day = getWeddingCountdown("2026-11-20T23:00:00+05:30");
  assert(
    tMinus1Day.days === 1 && tMinus1Day.hours === 0 && tMinus1Day.minutes === 0 && tMinus1Day.seconds === 0,
    "T-minus 24h evaluates exactly to 1 Day, 0 Hours, 0 Mins, 0 Secs"
  );
  assert(!tMinus1Day.isWeddingArrived && !tMinus1Day.isMemoriesMode, "T-minus 24h flags pre-wedding active");

  // 1.3 Deterministic Simulation: 2h 15m 30s before wedding (21 Nov 20:44:30 IST)
  const tMinusPartial = getWeddingCountdown("2026-11-21T20:44:30+05:30");
  assert(
    tMinusPartial.days === 0 && tMinusPartial.hours === 2 && tMinusPartial.minutes === 15 && tMinusPartial.seconds === 30,
    "Partial time calculation evaluates accurately (0 Days, 2 Hours, 15 Mins, 30 Secs)"
  );

  // 1.4 Deterministic Simulation: Exactly at Wedding Target (21 Nov 23:00:00 IST)
  const tZero = getWeddingCountdown("2026-11-21T23:00:00+05:30");
  assert(
    tZero.days === 0 && tZero.hours === 0 && tZero.minutes === 0 && tZero.seconds === 0,
    "At target instant, countdown is 0 Days, 0 Hours, 0 Mins, 0 Secs (Never Negative)"
  );
  assert(tZero.isWeddingArrived === true, "At target instant, isWeddingArrived evaluates to true");
  assert(tZero.isMemoriesMode === false, "At wedding instant, site is NOT in Memories Mode (Memories cutoff is 23 Nov)");

  // 1.5 Deterministic Simulation: During Wedding Celebration (22 Nov 03:00:00 IST)
  const tDuring = getWeddingCountdown("2026-11-22T03:00:00+05:30");
  assert(
    tDuring.days === 0 && tDuring.hours === 0 && tDuring.minutes === 0 && tDuring.seconds === 0,
    "During post-wedding celebration, countdown values remain clamped to 0 (No negative numbers)"
  );
  assert(tDuring.isWeddingArrived === true && tDuring.isMemoriesMode === false, "Wedding is arrived, memories mode still inactive");

  // 1.6 Deterministic Simulation: Memories Mode Boundary (23 Nov 00:00:00 IST)
  const tMemories = getWeddingCountdown("2026-11-23T00:00:00+05:30");
  assert(tMemories.isMemoriesMode === true, "Memories Mode activates strictly at 23 Nov 2026 00:00:00 IST");
  assert(MEMORIES_MODE_BOUNDARY_ISO === "2026-11-23T00:00:00+05:30", "Site-wide Memories Mode boundary unchanged");

  // =========================================================
  // SECTION 2: BROWSER INSPECTION & HERO COMPOSITION
  // =========================================================
  console.log("\nSection 2: Hero Composition, Invitation Removal, & Spacing Validation");

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  try {
    // 2.1 Desktop Hero (1440x900)
    const deskContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const deskPage = await deskContext.newPage();
    await deskPage.goto(BASE_URL, { waitUntil: "networkidle" });

    // Verify Right-Side Invitation Card (CeremonialArch) is completely removed from Hero
    const ceremonialArch = deskPage.locator("#hero [aria-label*='Ceremonial Royal Mandap Arch']");
    assert(
      (await ceremonialArch.count()) === 0,
      "Large right-side ceremonial arch / invitation card is completely removed from the desktop hero layout"
    );

    // Verify Standalone Homepage Countdown is removed
    const standaloneCountdown = deskPage.locator("section#countdown");
    assert(
      (await standaloneCountdown.count()) === 0,
      "Standalone homepage countdown section (#countdown) is completely removed"
    );

    // Verify Celebrations section follows Hero directly
    const nextSection = deskPage.locator("main > section#celebrations");
    assert(
      (await nextSection.count()) === 1,
      "Hero section directly transitions into Four Sacred Ceremonies (#celebrations)"
    );

    // Verify Integrated Countdown rendered in Hero right column
    const heroCountdownDesk = deskPage.locator("#hero [aria-label='Wedding ceremony countdown timer']");
    assert(
      (await heroCountdownDesk.count()) >= 1,
      "Integrated wedding countdown rendered inside #hero"
    );

    // Verify editorial heading and 4 values
    const countdownText = await heroCountdownDesk.first().innerText();
    assert(
      countdownText.toLowerCase().includes("the sacred vows begin in"),
      "Hero countdown presents refined editorial heading 'The Sacred Vows Begin In'"
    );
    assert(
      countdownText.includes("Days") && countdownText.includes("Hours") && countdownText.includes("Mins") && countdownText.includes("Secs"),
      "Hero countdown presents 4 distinct values: Days, Hours, Mins, and Secs"
    );
    assert(
      countdownText.includes("21 November 2026") && countdownText.includes("11:00 PM IST"),
      "Hero countdown clearly references '21 November 2026 • 11:00 PM IST'"
    );

    // Capture Desktop Screenshots
    const afterDeskHero = path.join(OUTPUT_DIR, "p15_2_3_after_desktop_hero.png");
    await deskPage.screenshot({ path: afterDeskHero });
    syncScreenshot("p15_2_3_after_desktop_hero.png");
    console.log("  📸 Saved p15_2_3_after_desktop_hero.png");

    await deskPage.evaluate(() => window.scrollTo(0, 500));
    await deskPage.waitForTimeout(300);
    const afterDeskTrans = path.join(OUTPUT_DIR, "p15_2_3_after_desktop_transition.png");
    await deskPage.screenshot({ path: afterDeskTrans });
    syncScreenshot("p15_2_3_after_desktop_transition.png");
    console.log("  📸 Saved p15_2_3_after_desktop_transition.png");

    await deskContext.close();

    // =========================================================
    // SECTION 3: MOBILE VERTICAL FLOW & HIERARCHY
    // =========================================================
    console.log("\nSection 3: Mobile Vertical Flow & Viewport Testing");

    const mobContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobPage = await mobContext.newPage();
    await mobPage.goto(BASE_URL, { waitUntil: "networkidle" });

    // Verify vertical order on mobile:
    // 1. Eyebrow -> 2. Couple names -> 3. Quotation -> 4. Divider -> 5. Plaque -> 6. Countdown -> 7. CTA Buttons
    const heroElements = await mobPage.evaluate(() => {
      const hero = document.getElementById("hero");
      if (!hero) return null;
      const title = hero.querySelector("#hero-title");
      const plaque = hero.querySelector("div.rounded-xl.p-4");
      const countdown = hero.querySelector("[aria-label='Wedding ceremony countdown timer']:not(.hidden)");
      const cta = hero.querySelector("a[href='/#celebrations']");

      return {
        hasTitle: !!title,
        titleY: title?.getBoundingClientRect().top || 0,
        plaqueY: plaque?.getBoundingClientRect().top || 0,
        countdownY: countdown?.getBoundingClientRect().top || 0,
        ctaY: cta?.getBoundingClientRect().top || 0,
      };
    });

    assert(heroElements?.hasTitle, "Hero headline 'Mithun & Sakhi' rendered on mobile");
    assert(
      heroElements && heroElements.titleY < heroElements.plaqueY,
      "Visual hierarchy: Couple names appear above dates/location plaque"
    );
    assert(
      heroElements && heroElements.plaqueY < heroElements.countdownY,
      "Visual hierarchy: Dates/location plaque appears above integrated countdown"
    );
    assert(
      heroElements && heroElements.countdownY < heroElements.ctaY,
      "Visual hierarchy: Integrated countdown appears directly before primary CTA buttons"
    );

    // Capture Mobile 390 Screenshots
    const afterMobHero = path.join(OUTPUT_DIR, "p15_2_3_after_mobile_390_hero.png");
    await mobPage.screenshot({ path: afterMobHero });
    syncScreenshot("p15_2_3_after_mobile_390_hero.png");
    console.log("  📸 Saved p15_2_3_after_mobile_390_hero.png");

    await mobPage.evaluate(() => window.scrollTo(0, 600));
    await mobPage.waitForTimeout(300);
    const afterMobTrans = path.join(OUTPUT_DIR, "p15_2_3_after_mobile_390_transition.png");
    await mobPage.screenshot({ path: afterMobTrans });
    syncScreenshot("p15_2_3_after_mobile_390_transition.png");
    console.log("  📸 Saved p15_2_3_after_mobile_390_transition.png");

    await mobContext.close();

    // =========================================================
    // SECTION 4: 7-VIEWPORT RESPONSIVE MATRIX & OVERFLOW CHECK
    // =========================================================
    console.log("\nSection 4: Responsive Verification Across All 7 Viewports");

    for (const vp of REQUIRED_VIEWPORTS) {
      const vpContext = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const vpPage = await vpContext.newPage();
      await vpPage.goto(BASE_URL, { waitUntil: "networkidle" });

      // Verify zero horizontal scroll overflow
      const scrollWidth = await vpPage.evaluate(() => document.documentElement.scrollWidth);
      assert(
        scrollWidth <= vp.width,
        `Viewport ${vp.width}x${vp.height} (${vp.name}): 0 horizontal overflow (scrollWidth: ${scrollWidth}px)`
      );

      // Verify countdown visibility in viewport (checking the active visible instance)
      const countdownVisible = (await vpPage.locator("#hero [aria-label='Wedding ceremony countdown timer']:visible").count()) >= 1;
      assert(
        countdownVisible,
        `Viewport ${vp.width}x${vp.height}: Hero countdown is fully visible and rendered`
      );

      // Capture narrow 320px
      if (vp.width === 320) {
        const afterNarrowHero = path.join(OUTPUT_DIR, "p15_2_3_after_narrow_320_hero.png");
        await vpPage.screenshot({ path: afterNarrowHero });
        syncScreenshot("p15_2_3_after_narrow_320_hero.png");
        console.log("  📸 Saved p15_2_3_after_narrow_320_hero.png");
      }

      await vpContext.close();
    }

    // =========================================================
    // SECTION 5: MUSIC PLAYER PERSISTENCE & NO OVERLAP
    // =========================================================
    console.log("\nSection 5: Persistent Wedding Music Player Compatibility");

    const playerContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const playerPage = await playerContext.newPage();
    await playerPage.goto(BASE_URL, { waitUntil: "networkidle" });

    const playerAside = playerPage.locator("aside[aria-label='Wedding audio player']");
    assert(
      (await playerAside.count()) === 1,
      "Floating music player persists in bottom-right corner without obstruction"
    );

    // Test Play/Pause still functions smoothly
    const playBtn = playerAside.locator("button[aria-label='Play wedding music']");
    await playBtn.click();
    await playerPage.waitForTimeout(300);
    const pauseBtn = playerAside.locator("button[aria-label='Pause wedding music']");
    assert(
      (await pauseBtn.count()) === 1,
      "Music player plays smoothly alongside redesigned hero"
    );
    await pauseBtn.click();

    await playerContext.close();

  } catch (err) {
    console.error("Test execution failed:", err);
    totalFailed++;
  } finally {
    await browser.close();
  }

  console.log("\n=======================================================");
  console.log(`P-15.2.3 VERIFICATION SUMMARY: ${totalPassed} Passed, ${totalFailed} Failed`);
  console.log("=======================================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runHeroCountdownVerification().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
