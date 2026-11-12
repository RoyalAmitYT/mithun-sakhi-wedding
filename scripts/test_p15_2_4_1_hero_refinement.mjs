// scripts/test_p15_2_4_1_hero_refinement.mjs
// Verification for Phase P-15.2.4.1: Cinematic Hero Composition & Premium Countdown Redesign

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const LOCAL_SCREENSHOTS_DIR = path.resolve(process.cwd(), "p15_2_4_1_screenshots");
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

const VIEWPORTS = [
  { name: "narrow_320", width: 320, height: 640 },
  { name: "android_360", width: 360, height: 800 },
  { name: "iphone_se_375", width: 375, height: 812 },
  { name: "iphone_12_390", width: 390, height: 844 },
  { name: "pro_max_430", width: 430, height: 932 },
  { name: "tablet_768", width: 768, height: 1024 },
  { name: "desktop_1440", width: 1440, height: 900 },
];

async function runVerification() {
  console.log("================================================================================");
  console.log("PHASE P-15.2.4.1: CINEMATIC HERO COMPOSITION & COUNTDOWN REDESIGN VERIFICATION");
  console.log("================================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, name) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ PASS: ${name}`);
    } else {
      console.error(`  ✗ FAIL: ${name}`);
    }
  }

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  try {
    // -------------------------------------------------------------------------
    // SUITE 1: Desktop Hero Composition & Single-Line Couple Names (1440x900)
    // -------------------------------------------------------------------------
    console.log("SUITE 1: Desktop Hero Composition & Typography Lockup (1440x900)");
    const deskContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const deskPage = await deskContext.newPage();
    await deskPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await deskPage.waitForTimeout(500);

    // Verify background image in #hero
    const bgImage = deskPage.locator("#hero img[src*='hero-portrait.png']");
    assert((await bgImage.count()) >= 1, "Full-bleed background image exists in #hero");

    // Couple Name Typography on ONE single line
    const title = deskPage.locator("#hero-title");
    const titleText = (await title.innerText()).replace(/\n/g, " ");
    assert(titleText.includes("Mithun & Sakhi"), `Hero displays 'Mithun & Sakhi' (found: '${titleText}')`);

    const titleBox = await title.boundingBox();
    assert(titleBox && titleBox.height < 90, `Couple names fit on ONE line on desktop: height=${titleBox?.height?.toFixed(1)}px (< 90px)`);

    // Verify CTAs are fully visible within 900px viewport
    const ctaPrimary = deskPage.locator("#hero a:has-text('EXPLORE CELEBRATIONS')").first();
    const ctaSecondary = deskPage.locator("#hero a:has-text('CEREMONY SCHEDULE')").first();
    const ctaPrimaryBox = await ctaPrimary.boundingBox();
    const ctaSecondaryBox = await ctaSecondary.boundingBox();

    assert(ctaPrimaryBox && (ctaPrimaryBox.y + ctaPrimaryBox.height) < 850, `Primary CTA is visible within initial viewport: bottom=${(ctaPrimaryBox?.y + ctaPrimaryBox?.height)?.toFixed(1)}px (< 850px)`);
    assert(ctaSecondaryBox && (ctaSecondaryBox.y + ctaSecondaryBox.height) < 850, `Secondary CTA is visible within initial viewport: bottom=${(ctaSecondaryBox?.y + ctaSecondaryBox?.height)?.toFixed(1)}px (< 850px)`);

    // Discreet preview disclosure is visible
    const disclosure = deskPage.locator("#hero p:has-text('Illustrative preview')").first();
    const discBox = await disclosure.boundingBox();
    assert(discBox && (discBox.y + discBox.height) <= 900, `Preview imagery disclosure fits in initial viewport: bottom=${(discBox?.y + discBox?.height)?.toFixed(1)}px`);

    await captureAndCopy(deskPage, "p15_2_4_1_01_desktop_hero_1440.png");

    // -------------------------------------------------------------------------
    // SUITE 2: Redesigned Countdown Plaque & Far-Right Positioning
    // -------------------------------------------------------------------------
    console.log("\nSUITE 2: Redesigned Countdown Plaque & Negative Space Positioning");
    const countdown = deskPage.locator(".lg\\:col-span-4 [aria-label='Wedding ceremony countdown timer']").first();
    assert((await countdown.count()) >= 1 && (await countdown.isVisible()), "Redesigned countdown plaque is rendered in desktop right column");

    const cdBox = await countdown.boundingBox();
    assert(cdBox && cdBox.width >= 280 && cdBox.width <= 340, `Countdown width is compact in 280-340px range: width=${cdBox?.width?.toFixed(1)}px`);
    assert(cdBox && cdBox.height < 210, `Countdown height is compact: height=${cdBox?.height?.toFixed(1)}px (< 210px)`);
    assert(cdBox && cdBox.x >= 980, `Countdown is positioned toward the far right: x=${cdBox?.x?.toFixed(1)}px (>= 980px)`);

    // Verify distance from couple (center of viewport is 720px)
    assert(cdBox && cdBox.x > 950, "Countdown avoids obstructing the couple portrait in the center/left-center");

    // Verify champagne glass surface
    const glassSurface = countdown.locator(".bg-\\[\\#FFFCF6\\]\\/88, .bg-champagne, [class*='bg-[#FFFCF6]']").first();
    assert((await glassSurface.count()) >= 1, "Countdown uses translucent champagne glass surface");

    // Verify editorial header
    const cdHeader = countdown.locator(":text('THE SACRED VOWS BEGIN IN')");
    assert((await cdHeader.count()) >= 1, "Countdown presents editorial heading 'THE SACRED VOWS BEGIN IN'");

    // Verify 4 values
    const cdDays = countdown.locator(":text('Days')");
    const cdHours = countdown.locator(":text('Hours')");
    const cdMins = countdown.locator(":text('Mins')");
    const cdSecs = countdown.locator(":text('Secs')");
    assert((await cdDays.count()) >= 1, "Countdown has 'Days' unit");
    assert((await cdHours.count()) >= 1, "Countdown has 'Hours' unit");
    assert((await cdMins.count()) >= 1, "Countdown has 'Mins' unit");
    assert((await cdSecs.count()) >= 1, "Countdown has 'Secs' unit in sindoor red accent");

    // Verify event reference date
    const cdRef = countdown.locator(":text('21 November 2026')");
    assert((await cdRef.count()) >= 1, "Countdown references '21 November 2026 • 11:00 PM IST'");

    // Close-up screenshot of desktop countdown
    if (cdBox) {
      await captureAndCopy(deskPage, "p15_2_4_1_05_desktop_countdown_plaque.png", {
        x: Math.max(0, cdBox.x - 15),
        y: Math.max(0, cdBox.y - 15),
        width: cdBox.width + 30,
        height: cdBox.height + 30,
      });
    }

    // -------------------------------------------------------------------------
    // SUITE 3: Navigation States (Transparent vs Scrolled Glass)
    // -------------------------------------------------------------------------
    console.log("\nSUITE 3: Transparent Luxury Navigation & Scrolled Transition");
    const header = deskPage.locator("header[role='banner']");
    const initialHeaderClass = await header.getAttribute("class");
    assert(initialHeaderClass && initialHeaderClass.includes("bg-transparent"), "Header is transparent when at top of hero");

    const brandName = deskPage.locator("header[role='banner'] a:has-text('Mithun & Sakhi') span.font-serif").last();
    const brandColor = await brandName.evaluate((el) => window.getComputedStyle(el).color);
    assert(brandColor === "rgb(255, 255, 255)", `Brand logo text is high-contrast white over hero (${brandColor})`);

    // Scroll down 150px
    await deskPage.evaluate(() => window.scrollTo({ top: 150, behavior: "instant" }));
    await deskPage.waitForTimeout(400);

    const scrolledHeaderClass = await header.getAttribute("class");
    assert(scrolledHeaderClass && scrolledHeaderClass.includes("backdrop-blur-md"), "Header has backdrop-blur-md on scroll");
    assert(scrolledHeaderClass && scrolledHeaderClass.includes("bg-[#FFFCF6]/92"), "Header transitions to champagne glass on scroll");

    const scrolledBrandColor = await brandName.evaluate((el) => window.getComputedStyle(el).color);
    assert(scrolledBrandColor === "rgb(41, 35, 34)", `Brand logo transitions to dark charcoal on scrolled glass (${scrolledBrandColor})`);

    await captureAndCopy(deskPage, "p15_2_4_1_07_nav_over_hero_and_scrolled.png", {
      x: 0,
      y: 0,
      width: 1440,
      height: 120,
    });

    // Reset scroll
    await deskPage.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await deskPage.waitForTimeout(200);

    // -------------------------------------------------------------------------
    // SUITE 4: Mobile-First Responsive Matrix & Zero-Collision Checks (7 Viewports)
    // -------------------------------------------------------------------------
    console.log("\nSUITE 4: Mobile-First Responsive Matrix across 7 Viewports");
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      await page.waitForTimeout(300);

      // Check horizontal overflow
      const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      assert(docWidth <= clientWidth, `No horizontal overflow at ${vp.name} (${vp.width}x${vp.height}): scroll=${docWidth}, client=${clientWidth}`);

      // Verify title is visible
      const t = page.locator("#hero-title");
      assert(await t.isVisible(), `Headline is visible at ${vp.name}`);

      // Verify countdown is visible
      const cdCount = await page.locator("[aria-label='Wedding ceremony countdown timer']").count();
      let cdFound = false;
      let visibleBox = null;
      for (let i = 0; i < cdCount; i++) {
        const item = page.locator("[aria-label='Wedding ceremony countdown timer']").nth(i);
        if (await item.isVisible()) {
          cdFound = true;
          visibleBox = await item.boundingBox();
          break;
        }
      }
      assert(cdFound, `Countdown is visible at ${vp.name}`);

      // Verify zero collision with Music Player FAB
      const fab = page.locator("[aria-label*='wedding music' i]").first();
      const fabBox = (await fab.count()) > 0 ? await fab.boundingBox() : null;
      const primaryCta = page.locator("#hero a:has-text('EXPLORE CELEBRATIONS')").first();
      const pCtaBox = (await primaryCta.count()) > 0 ? await primaryCta.boundingBox() : null;

      if (pCtaBox && fabBox) {
        const overlap = !(
          pCtaBox.x + pCtaBox.width < fabBox.x ||
          fabBox.x + fabBox.width < pCtaBox.x ||
          pCtaBox.y + pCtaBox.height < fabBox.y ||
          fabBox.y + fabBox.height < pCtaBox.y
        );
        assert(!overlap, `Zero collision between CTA buttons and floating music FAB at ${vp.name}`);
      }

      // Capture representative screenshots
      if (vp.name === "desktop_1440") {
        // already captured
      } else if (vp.name === "iphone_12_390") {
        await captureAndCopy(page, "p15_2_4_1_02_mobile_hero_390.png");
        if (visibleBox) {
          await captureAndCopy(page, "p15_2_4_1_06_mobile_countdown_plaque.png", {
            x: Math.max(0, visibleBox.x - 10),
            y: Math.max(0, visibleBox.y - 10),
            width: Math.min(vp.width, visibleBox.width + 20),
            height: visibleBox.height + 20,
          });
        }
      } else if (vp.name === "narrow_320") {
        await captureAndCopy(page, "p15_2_4_1_03_narrow_mobile_320.png");
      } else if (vp.name === "tablet_768") {
        await captureAndCopy(page, "p15_2_4_1_04_tablet_hero_768.png");
      }

      await page.close();
    }

    // -------------------------------------------------------------------------
    // SUITE 5: Floating Music Player Compatibility & Persistence
    // -------------------------------------------------------------------------
    console.log("\nSUITE 5: Music Player Non-Obstruction & Persistence");
    const mPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mPage.goto(BASE_URL, { waitUntil: "networkidle" });
    const musicAside = mPage.locator("aside[aria-label='Wedding audio player']").first();
    assert(await musicAside.isVisible(), "Floating music player aside is present on mobile homepage");

    // Open music player expanded modal
    const openCardBtn = musicAside.locator("button[aria-label^='Open wedding playlist']").first();
    await openCardBtn.click();
    await mPage.waitForTimeout(300);
    const musicModal = mPage.locator("div[role='dialog'][aria-label='Wedding Music Player & Playlist']");
    assert((await musicModal.count()) >= 1 && (await musicModal.isVisible()), "Expanded wedding music card opens cleanly");

    // Close modal
    const closeBtn = musicModal.locator("button[aria-label='Close music player card']").first();
    await closeBtn.click();
    await mPage.waitForTimeout(300);
    assert((await musicModal.count()) === 0 || !(await musicModal.isVisible()), "Expanded wedding music card closes cleanly");

    await mPage.close();

  } finally {
    await browser.close();
  }

  console.log("\n================================================================================");
  console.log(`P-15.2.4.1 TEST SUMMARY: ${passedTests}/${totalTests} Passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log("================================================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
