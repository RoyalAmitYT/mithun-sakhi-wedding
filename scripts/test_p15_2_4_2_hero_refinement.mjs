// scripts/test_p15_2_4_2_hero_refinement.mjs
// Verification for Phase P-15.2.4.2: Cinematic Luxury Hero Refinement

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const LOCAL_SCREENSHOTS_DIR = path.resolve(process.cwd(), "p15_2_4_2_screenshots");
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
  console.log("PHASE P-15.2.4.2: CINEMATIC LUXURY HERO REFINEMENT VERIFICATION");
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
    // SUITE 1: Desktop Hero Composition (1440x900) & White Fade Elimination
    // -------------------------------------------------------------------------
    console.log("SUITE 1: Bottom Edge Rich Continuity & White Fade Removal (1440x900)");
    const deskContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const deskPage = await deskContext.newPage();
    await deskPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await deskPage.waitForTimeout(500);

    // Verify background image in #hero
    const bgImage = deskPage.locator("#hero img[src*='hero-portrait.png']");
    assert((await bgImage.count()) >= 1, "Full-bleed background image exists in #hero");

    // Verify white bottom fade is completely removed
    const whiteFade = await deskPage.locator("#hero [class*='bg-gradient-to-t from-[#FFFCF6]']").count();
    assert(whiteFade === 0, "White bottom gradient/fade layer is completely removed");

    // -------------------------------------------------------------------------
    // SUITE 2: Enlarged Single-Line Couple Typography
    // -------------------------------------------------------------------------
    console.log("\nSUITE 2: Enlarged Single-Line Couple Typography");
    const title = deskPage.locator("#hero-title");
    const titleText = (await title.innerText()).replace(/\n/g, " ");
    assert(titleText.includes("Mithun & Sakhi"), `Hero displays 'Mithun & Sakhi' (found: '${titleText}')`);

    const titleBox = await title.boundingBox();
    assert(titleBox && titleBox.height < 90, `Couple names fit on ONE single line on desktop: height=${titleBox?.height?.toFixed(1)}px (< 90px)`);

    const titleFontSize = parseFloat(await title.evaluate((el) => window.getComputedStyle(el).fontSize));
    assert(titleFontSize >= 70, `Couple heading is enlarged: font-size=${titleFontSize.toFixed(1)}px (>= 70px)`);

    // -------------------------------------------------------------------------
    // SUITE 3: Translucent Champagne Glass Bar Eyebrow
    // -------------------------------------------------------------------------
    console.log("\nSUITE 3: Translucent Champagne Glass Bar Eyebrow");
    const eyebrow = deskPage.locator("#hero :text('THE SACRED WEDDING CELEBRATION')").first();
    assert((await eyebrow.count()) >= 1 && (await eyebrow.isVisible()), "Eyebrow is visible");

    const eyebrowContainer = deskPage.locator("#hero .inline-flex.items-center:has-text('THE SACRED WEDDING CELEBRATION')").first();
    const eyebrowBg = await eyebrowContainer.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const eyebrowColor = await eyebrow.evaluate((el) => window.getComputedStyle(el).color);

    // Should NOT be opaque white (rgb(255, 255, 255))
    assert(eyebrowBg !== "rgb(255, 255, 255)", `Eyebrow has translucent surface, not opaque white (${eyebrowBg})`);
    assert(eyebrowColor === "rgb(255, 253, 248)" || eyebrowColor.includes("255"), `Eyebrow text has crisp ivory contrast (${eyebrowColor})`);

    // -------------------------------------------------------------------------
    // SUITE 4: Increased Spacing Between Wedding Details and CTA Buttons
    // -------------------------------------------------------------------------
    console.log("\nSUITE 4: Vertical Gap Between Details Card and CTA Buttons");
    const plaque = deskPage.locator("#hero :text('19–22 Nov 2026')").first();
    const plaqueBottom = await plaque.evaluate((el) => {
      let curr = el;
      while (curr && !curr.className.includes("rounded-xl")) curr = curr.parentElement;
      return curr ? curr.getBoundingClientRect().bottom : 0;
    });
    const ctaPrimary = deskPage.locator("#hero a:has-text('EXPLORE CELEBRATIONS')").first();
    const ctaPrimaryBox = await ctaPrimary.boundingBox();
    const gap = ctaPrimaryBox ? ctaPrimaryBox.y - plaqueBottom : 0;

    assert(gap >= 28, `Vertical gap beneath details card is increased: gap=${gap.toFixed(1)}px (>= 28px)`);
    assert(ctaPrimaryBox && (ctaPrimaryBox.y + ctaPrimaryBox.height) < 750, `CTA buttons fit comfortably within initial desktop viewport: bottom=${(ctaPrimaryBox?.y + ctaPrimaryBox?.height)?.toFixed(1)}px (< 750px)`);

    // -------------------------------------------------------------------------
    // SUITE 5: Liquid-Glass Countdown Plaque Positioned in Upper-Right beneath Nav
    // -------------------------------------------------------------------------
    console.log("\nSUITE 5: Liquid-Glass Countdown Positioned in Upper-Right beneath Nav");
    const nav = await deskPage.locator("header[role='banner']").boundingBox();
    const countdown = deskPage.locator(".lg\\:col-span-4 [aria-label='Wedding ceremony countdown timer']").first();
    assert((await countdown.count()) >= 1 && (await countdown.isVisible()), "Countdown plaque is rendered in desktop upper-right column");

    const cdBox = await countdown.boundingBox();
    assert(cdBox && cdBox.width <= 320 && cdBox.width >= 280, `Countdown width is compact in 280-320px range: width=${cdBox?.width?.toFixed(1)}px`);
    assert(cdBox && cdBox.height <= 140, `Countdown height is compact: height=${cdBox?.height?.toFixed(1)}px (<= 140px)`);

    // Distance beneath navigation (32–48px)
    const distFromNav = cdBox && nav ? cdBox.y - (nav.y + nav.height) : 0;
    assert(distFromNav >= 30 && distFromNav <= 55, `Countdown is positioned beneath navigation with intentional separation: distance=${distFromNav.toFixed(1)}px (approx 32-48px)`);

    // Upper-right positioning (x >= 1000px, avoiding couple faces at center)
    assert(cdBox && cdBox.x >= 1000, `Countdown is positioned in the upper right negative space: x=${cdBox?.x?.toFixed(1)}px (>= 1000px)`);
    assert(cdBox && cdBox.y < 160, `Countdown is in the upper area of the hero: y=${cdBox?.y?.toFixed(1)}px (< 160px)`);

    // Verify liquid-glass appearance
    const glassSurface = countdown.locator("[class*='bg-[#FFFCF6]']").first();
    assert((await glassSurface.count()) >= 1, "Countdown uses translucent liquid-glass champagne surface");

    // Capture screenshots
    await captureAndCopy(deskPage, "p15_2_4_2_01_desktop_hero_1440.png");

    if (cdBox && nav) {
      await captureAndCopy(deskPage, "p15_2_4_2_05_countdown_beneath_navigation.png", {
        x: Math.max(0, cdBox.x - 20),
        y: 0,
        width: cdBox.width + 40,
        height: cdBox.y + cdBox.height + 30,
      });
    }

    // Capture hero bottom transition (showing no white fade)
    await captureAndCopy(deskPage, "p15_2_4_2_07_no_white_bottom_fade.png", {
      x: 0,
      y: 750,
      width: 1440,
      height: 250,
    });

    // -------------------------------------------------------------------------
    // SUITE 6: Navigation States (Transparent vs Scrolled Glass)
    // -------------------------------------------------------------------------
    console.log("\nSUITE 6: Dynamic Transparent-to-Scrolled Navigation");
    const header = deskPage.locator("header[role='banner']");
    const initialHeaderClass = await header.getAttribute("class");
    assert(initialHeaderClass && initialHeaderClass.includes("bg-transparent"), "Header is transparent when at top of hero");

    const brandName = deskPage.locator("header[role='banner'] a:has-text('Mithun & Sakhi') span.font-serif").last();
    const brandColor = await brandName.evaluate((el) => window.getComputedStyle(el).color);
    assert(brandColor === "rgb(255, 255, 255)", `Brand logo text is high-contrast white over hero (${brandColor})`);

    await deskPage.evaluate(() => window.scrollTo({ top: 150, behavior: "instant" }));
    await deskPage.waitForTimeout(400);

    const scrolledHeaderClass = await header.getAttribute("class");
    assert(scrolledHeaderClass && scrolledHeaderClass.includes("backdrop-blur-md"), "Header transitions to glassmorphism on scroll");
    assert(scrolledHeaderClass && scrolledHeaderClass.includes("bg-[#FFFCF6]/92"), "Header transitions to champagne glass on scroll");

    await captureAndCopy(deskPage, "p15_2_4_2_06_nav_transparent_and_scrolled.png", {
      x: 0,
      y: 0,
      width: 1440,
      height: 120,
    });

    await deskPage.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await deskPage.waitForTimeout(200);

    // -------------------------------------------------------------------------
    // SUITE 7: Mobile-First Responsive Matrix across 7 Viewports
    // -------------------------------------------------------------------------
    console.log("\nSUITE 7: Mobile-First Responsive Matrix across 7 Viewports");
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      await page.waitForTimeout(300);

      // Check horizontal overflow
      const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      assert(docWidth <= clientWidth, `No horizontal overflow at ${vp.name} (${vp.width}x${vp.height}): scroll=${docWidth}, client=${clientWidth}`);

      // Verify headline is visible and on one single line
      const t = page.locator("#hero-title");
      assert(await t.isVisible(), `Headline is visible at ${vp.name}`);
      const tBox = await t.boundingBox();
      assert(tBox && tBox.height < 95, `Headline fits on ONE line at ${vp.name}: height=${tBox?.height?.toFixed(1)}px`);

      // Verify countdown is visible
      const cdCount = await page.locator("[aria-label='Wedding ceremony countdown timer']").count();
      let cdFound = false;
      for (let i = 0; i < cdCount; i++) {
        const item = page.locator("[aria-label='Wedding ceremony countdown timer']").nth(i);
        if (await item.isVisible()) {
          cdFound = true;
          break;
        }
      }
      assert(cdFound, `Countdown is visible at ${vp.name}`);

      // Verify zero collision with Music Player FAB
      const fab = page.locator("[aria-label*='wedding music' i]").first();
      const fabBox = (await fab.count()) > 0 ? await fab.boundingBox() : null;
      const cta = page.locator("#hero a:has-text('EXPLORE CELEBRATIONS')").first();
      const pCtaBox = (await cta.count()) > 0 ? await cta.boundingBox() : null;

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
      if (vp.name === "iphone_12_390") {
        await captureAndCopy(page, "p15_2_4_2_02_mobile_hero_390.png");
      } else if (vp.name === "narrow_320") {
        await captureAndCopy(page, "p15_2_4_2_03_narrow_mobile_320.png");
      } else if (vp.name === "tablet_768") {
        await captureAndCopy(page, "p15_2_4_2_04_tablet_hero_768.png");
      }

      await page.close();
    }

    // -------------------------------------------------------------------------
    // SUITE 8: Music Player Compatibility & Persistence
    // -------------------------------------------------------------------------
    console.log("\nSUITE 8: Music Player Non-Obstruction & Persistence");
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
  console.log(`P-15.2.4.2 TEST SUMMARY: ${passedTests}/${totalTests} Passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log("================================================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
