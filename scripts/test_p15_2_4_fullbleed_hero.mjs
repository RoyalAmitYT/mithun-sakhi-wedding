// scripts/test_p15_2_4_fullbleed_hero.mjs
// Comprehensive Verification for Phase P-15.2.4: Full-Bleed Cinematic Luxury Wedding Hero

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const LOCAL_SCREENSHOTS_DIR = path.resolve(process.cwd(), "p15_2_4_screenshots");
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
  console.log("PHASE P-15.2.4: FULL-BLEED CINEMATIC WEDDING HERO VERIFICATION");
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

  // ---------------------------------------------------------------------------
  // SUITE 1: Image Source File & Path Verification
  // ---------------------------------------------------------------------------
  console.log("SUITE 1: Hero Background Image File Verification");
  const originalImagePath = path.resolve(process.cwd(), "images/hero-portrait.png");
  const publicImagePath = path.resolve(process.cwd(), "public/images/hero-portrait.png");

  const origExists = fs.existsSync(originalImagePath);
  const pubExists = fs.existsSync(publicImagePath);
  const origSize = origExists ? fs.statSync(originalImagePath).size : 0;
  const pubSize = pubExists ? fs.statSync(publicImagePath).size : 0;

  assert(origExists && origSize > 1000000, `Original image exists in images/ (${(origSize / 1024 / 1024).toFixed(2)} MB)`);
  assert(pubExists && pubSize === origSize, `Public image copied to public/images/hero-portrait.png (${(pubSize / 1024 / 1024).toFixed(2)} MB)`);

  // Launch Playwright
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  try {
    // -------------------------------------------------------------------------
    // SUITE 2: Desktop Hero Composition & Full-Bleed Background
    // -------------------------------------------------------------------------
    console.log("\nSUITE 2: Desktop Hero Composition (1440x900)");
    const deskContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const deskPage = await deskContext.newPage();
    await deskPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await deskPage.waitForTimeout(500);

    // Verify background image in #hero
    const bgImage = deskPage.locator("#hero img[src*='hero-portrait.png']");
    assert((await bgImage.count()) >= 1, "Full-bleed background image exists in #hero");

    // Verify background image covers full hero width and height
    const bgBox = await bgImage.first().boundingBox();
    assert(bgBox && bgBox.width >= 1400 && bgBox.height >= 800, `Background image covers full hero: width=${bgBox?.width}px, height=${bgBox?.height}px`);

    // Verify NO separate portrait card exists in hero
    const separatePortraitCard = deskPage.locator("#hero img[src*='hero_couple_portrait.jpg'], #hero [aria-label='Ceremonial Couple Portrait Preview']");
    assert((await separatePortraitCard.count()) === 0, "No separate portrait card remains in hero");

    // Verify couple names typography
    const heroTitle = await deskPage.textContent("#hero-title");
    assert(heroTitle.includes("Mithun") && heroTitle.includes("Sakhi"), "Hero displays Mithun & Sakhi");

    // Verify glass information plaque
    const infoPlaque = deskPage.locator("#hero :text('19–22 Nov 2026')");
    assert((await infoPlaque.count()) >= 1 && (await infoPlaque.first().isVisible()), "Glass information plaque displays 19–22 Nov 2026");

    // Verify CTAs
    const cta1 = deskPage.locator("#hero a:has-text('Explore Celebrations')");
    const cta2 = deskPage.locator("#hero a:has-text('Ceremony Schedule')");
    assert((await cta1.count()) >= 1 && (await cta1.first().isVisible()), "Primary CTA 'EXPLORE CELEBRATIONS' is visible");
    assert((await cta2.count()) >= 1 && (await cta2.first().isVisible()), "Secondary CTA 'CEREMONY SCHEDULE' is visible");

    // Verify Countdown in desktop right column
    const desktopCountdown = deskPage.locator(".lg\\:col-span-4 [aria-label='Wedding ceremony countdown timer'], .lg\\:col-span-5 [aria-label='Wedding ceremony countdown timer']");
    assert((await desktopCountdown.count()) >= 1 && (await desktopCountdown.first().isVisible()), "Countdown timer is rendered in desktop right column");

    const countdownText = await desktopCountdown.innerText();
    assert(
      countdownText.includes("DAYS") &&
      countdownText.includes("HOURS") &&
      countdownText.includes("MINS") &&
      countdownText.includes("SECS"),
      "Desktop countdown displays Days, Hours, Mins, and Secs"
    );
    assert(countdownText.includes("21 November 2026") && countdownText.includes("11:00 PM IST"), "Countdown references 21 November 2026 • 11:00 PM IST");

    // Verify discreet asset disclosure
    const disclosure = deskPage.locator("#hero :text('Illustrative preview imagery')");
    assert((await disclosure.count()) >= 1 && (await disclosure.first().isVisible()), "Discreet preview imagery disclosure is visible at base of hero");

    await captureAndCopy(deskPage, "p15_2_4_01_desktop_hero_1440.png");

    // Close-up clip of countdown glass panel
    const cdBox = await desktopCountdown.boundingBox();
    if (cdBox) {
      await captureAndCopy(deskPage, "p15_2_4_07_countdown_glass_panel.png", {
        x: Math.max(0, cdBox.x - 20),
        y: Math.max(0, cdBox.y - 20),
        width: cdBox.width + 40,
        height: cdBox.height + 40,
      });
    }

    // -------------------------------------------------------------------------
    // SUITE 3: Navigation States (Transparent vs Scrolled Glass)
    // -------------------------------------------------------------------------
    console.log("\nSUITE 3: Transparent Luxury Navigation & Scrolled Transition");

    // Initial state (over full-bleed hero, not scrolled)
    const header = deskPage.locator("header[role='banner']");
    const initialHeaderClass = await header.getAttribute("class");
    assert(initialHeaderClass && initialHeaderClass.includes("bg-transparent"), "Header is transparent when at top of hero");

    // Verify brand logo is light/cream text over dark image
    const brandName = deskPage.locator("header[role='banner'] a:has-text('Mithun & Sakhi') span.font-serif").last();
    const brandColor = await brandName.evaluate((el) => window.getComputedStyle(el).color);
    // rgb(255, 255, 255) for white
    assert(brandColor === "rgb(255, 255, 255)", `Brand logo text is high-contrast white over hero (${brandColor})`);

    // Capture transparent nav
    await captureAndCopy(deskPage, "p15_2_4_05_nav_transparent_over_hero.png", {
      x: 0,
      y: 0,
      width: 1440,
      height: 120,
    });

    // Scroll down 400px beyond hero top
    await deskPage.evaluate(() => window.scrollTo(0, 400));
    await deskPage.waitForTimeout(400);

    const scrolledHeaderClass = await header.getAttribute("class");
    assert(scrolledHeaderClass && scrolledHeaderClass.includes("backdrop-blur-md"), "Header transitions to glassmorphism with backdrop-blur-md on scroll");
    assert(scrolledHeaderClass && scrolledHeaderClass.includes("bg-[#FFFCF6]"), "Header transitions to champagne glass background on scroll");

    const scrolledBrandColor = await brandName.evaluate((el) => window.getComputedStyle(el).color);
    // rgb(41, 35, 34) for #292322
    assert(scrolledBrandColor === "rgb(41, 35, 34)", `Brand logo text transitions to dark charcoal on scrolled glass (${scrolledBrandColor})`);

    await captureAndCopy(deskPage, "p15_2_4_06_nav_scrolled_glass.png", {
      x: 0,
      y: 0,
      width: 1440,
      height: 120,
    });

    // Reset scroll
    await deskPage.evaluate(() => window.scrollTo(0, 0));
    await deskPage.waitForTimeout(300);
    await deskContext.close();

    // -------------------------------------------------------------------------
    // SUITE 4: Mobile & Tablet Viewport Verification (7 Viewports)
    // -------------------------------------------------------------------------
    console.log("\nSUITE 4: Mobile-First Responsive Matrix (7 Viewports)");

    for (const vp of VIEWPORTS) {
      const mobContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const mobPage = await mobContext.newPage();
      await mobPage.goto(BASE_URL, { waitUntil: "networkidle" });
      await mobPage.waitForTimeout(400);

      // Verify zero horizontal overflow
      const overflow = await mobPage.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        };
      });
      assert(!overflow.hasOverflow, `No horizontal overflow at ${vp.name} (${vp.width}x${vp.height}): scroll=${overflow.scrollWidth}, client=${overflow.clientWidth}`);

      // Verify background image exists and covers
      const mobBgImg = mobPage.locator("#hero img[src*='hero-portrait.png']");
      assert((await mobBgImg.count()) >= 1, `Background image rendered at ${vp.name}`);

      // Verify countdown exists
      const mobCd = mobPage.locator("#hero [aria-label='Wedding ceremony countdown timer']:visible");
      assert((await mobCd.count()) >= 1, `Countdown timer is visible at ${vp.name}`);

      // Verify headline exists
      const mobTitle = mobPage.locator("#hero-title");
      assert((await mobTitle.count()) >= 1 && (await mobTitle.isVisible()), `Mithun & Sakhi headline is visible at ${vp.name}`);

      // Mobile vertical order check on phone viewports (390px)
      if (vp.width === 390) {
        const orderCheck = await mobPage.evaluate(() => {
          const title = document.getElementById("hero-title");
          const plaque = document.querySelector("#hero .grid.grid-cols-1.sm\\:grid-cols-2");
          const cd = document.querySelector("#hero [aria-label='Wedding ceremony countdown timer']");
          const cta = document.querySelector("#hero a[href*='celebrations']:not([aria-label*='Scroll'])") || document.querySelector("#hero a[href*='celebrations']");
          if (!title || !plaque || !cd || !cta) return null;
          const tTop = title.getBoundingClientRect().top;
          const pTop = plaque.getBoundingClientRect().top;
          const cdTop = cd.getBoundingClientRect().top;
          const ctaTop = cta.getBoundingClientRect().top;
          return {
            titleBeforePlaque: tTop < pTop,
            plaqueBeforeCd: pTop < cdTop,
            cdBeforeCta: cdTop < ctaTop,
          };
        });

        assert(orderCheck && orderCheck.titleBeforePlaque, "Mobile hierarchy: Names appear above information plaque");
        assert(orderCheck && orderCheck.plaqueBeforeCd, "Mobile hierarchy: Plaque appears above countdown");
        assert(orderCheck && orderCheck.cdBeforeCta, "Mobile hierarchy: Countdown appears above CTA buttons");

        await captureAndCopy(mobPage, "p15_2_4_02_mobile_hero_390.png");
      }

      if (vp.width === 320) {
        await captureAndCopy(mobPage, "p15_2_4_03_narrow_mobile_320.png");
      }

      if (vp.width === 768) {
        await captureAndCopy(mobPage, "p15_2_4_04_tablet_hero_768.png");
      }

      await mobContext.close();
    }

    // -------------------------------------------------------------------------
    // SUITE 5: Persistent Music Player Compatibility
    // -------------------------------------------------------------------------
    console.log("\nSUITE 5: Music Player Non-Obstruction & Persistence");
    const musicContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const musicPage = await musicContext.newPage();
    await musicPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await musicPage.waitForTimeout(400);

    const playerFab = musicPage.locator("[aria-label*='wedding music']");
    assert((await playerFab.count()) >= 1, "Floating music player FAB is present on homepage");

    // Check FAB coordinates do not overlap CTAs or countdown
    const playerOverlap = await musicPage.evaluate(() => {
      const fab = document.querySelector("[aria-label*='wedding music']");
      const cta = document.querySelector("#hero a[href*='celebrations']:not([aria-label*='Scroll'])") || document.querySelector("#hero a[href*='celebrations']");
      const cd = document.querySelector("#hero [aria-label='Wedding ceremony countdown timer']");
      if (!fab || !cta || !cd) return false;
      const fabRect = fab.getBoundingClientRect();
      const ctaRect = cta.getBoundingClientRect();
      const cdRect = cd.getBoundingClientRect();

      function rectsOverlap(r1, r2) {
        return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
      }

      return rectsOverlap(fabRect, ctaRect) || rectsOverlap(fabRect, cdRect);
    });

    assert(!playerOverlap, "Music player FAB does not overlap CTAs or countdown timer");
    await musicContext.close();

  } finally {
    await browser.close();
  }

  console.log("\n================================================================================");
  console.log(`P-15.2.4 TEST SUMMARY: ${passedTests}/${totalTests} Passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log("================================================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
