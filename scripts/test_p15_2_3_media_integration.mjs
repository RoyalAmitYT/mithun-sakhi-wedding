// scripts/test_p15_2_3_media_integration.mjs
// Comprehensive Verification for P-15.2.3: Hero Redesign & Temporary Wedding Media Integration

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import {
  TEMPORARY_PHOTOS,
  TEMPORARY_VIDEOS,
  TEMPORARY_MEDIA_DISCLAIMER,
} from "../src/data/temporary-media";

const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR = path.resolve(process.cwd(), "p15_2_3_media_screenshots");
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const ARTIFACT_DIR = path.resolve(
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots"
);
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function captureAndCopy(page, filename) {
  const localPath = path.join(SCREENSHOTS_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: localPath, fullPage: false });
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
  console.log("PHASE P-15.2.3: TEMPORARY WEDDING MEDIA & HERO INTEGRATION VERIFICATION");
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
  // SUITE 1: Temporary Media Disk Assets & Manifest Integrity
  // ---------------------------------------------------------------------------
  console.log("SUITE 1: Disk Asset Inventory & Manifest");
  assert(TEMPORARY_PHOTOS.length === 9, "Catalog contains 9 temporary photos");
  assert(TEMPORARY_VIDEOS.length === 2, "Catalog contains 2 temporary video clips");
  assert(
    TEMPORARY_MEDIA_DISCLAIMER.includes("Illustrative preview imagery"),
    "Disclaimer is accurately configured"
  );

  for (const photo of TEMPORARY_PHOTOS) {
    const filePath = path.resolve(process.cwd(), "public", photo.localPath.replace(/^\//, ""));
    const exists = fs.existsSync(filePath);
    const size = exists ? fs.statSync(filePath).size : 0;
    assert(exists && size > 50000, `Photo asset exists on disk (>50KB): ${path.basename(photo.localPath)} (${size} B)`);
  }

  for (const video of TEMPORARY_VIDEOS) {
    const vPath = path.resolve(process.cwd(), "public", video.localPath.replace(/^\//, ""));
    const pPath = path.resolve(process.cwd(), "public", video.posterPath.replace(/^\//, ""));
    const vExists = fs.existsSync(vPath);
    const pExists = fs.existsSync(pPath);
    const vSize = vExists ? fs.statSync(vPath).size : 0;
    const pSize = pExists ? fs.statSync(pPath).size : 0;
    assert(vExists && vSize > 1000000, `Video asset exists (>1MB): ${path.basename(video.localPath)} (${(vSize / 1024 / 1024).toFixed(2)} MB)`);
    assert(pExists && pSize > 20000, `Poster asset exists (>20KB): ${path.basename(video.posterPath)} (${(pSize / 1024).toFixed(1)} KB)`);
  }

  // ---------------------------------------------------------------------------
  // Launch Playwright Browser
  // ---------------------------------------------------------------------------
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  try {
    // -------------------------------------------------------------------------
    // SUITE 2: Desktop Hero Arched Couple Portrait & Countdown Layout
    // -------------------------------------------------------------------------
    console.log("\nSUITE 2: Desktop Hero Arched Couple Portrait & Countdown");
    const deskContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const deskPage = await deskContext.newPage();
    await deskPage.goto(BASE_URL, { waitUntil: "networkidle" });

    // Hero title & names
    const heroTitle = await deskPage.textContent("#hero-title");
    assert(heroTitle.includes("Mithun") && heroTitle.includes("Sakhi"), "Hero displays Mithun & Sakhi");

    // Right column portrait / background image check
    const heroImg = deskPage.locator("#hero img[src*='hero-portrait.png'], #hero img[src*='hero_couple_portrait.jpg']");
    assert((await heroImg.count()) >= 1, "Hero couple portrait imagery is present in hero");

    // Preview badge / disclosure on hero
    const previewBadge = deskPage.locator("#hero :text('Illustrative preview')");
    assert((await previewBadge.count()) >= 1, "Hero displays 'Illustrative preview' disclosure");

    // Countdown presence
    const countdown = deskPage.locator("#hero [aria-label='Wedding ceremony countdown timer']:visible");
    assert((await countdown.count()) >= 1, "Compact wedding countdown timer is rendered in hero on desktop");
    const countdownText = await countdown.first().innerText();
    assert(
      countdownText.includes("DAYS") &&
      countdownText.includes("HOURS") &&
      countdownText.includes("MINS") &&
      countdownText.includes("SECS"),
      "Hero countdown shows Days, Hours, Mins, and Secs"
    );

    await captureAndCopy(deskPage, "p15_2_3_media_01_desktop_hero_portrait.png");

    // -------------------------------------------------------------------------
    // SUITE 3: Family Section Solo Portraits
    // -------------------------------------------------------------------------
    console.log("\nSUITE 3: Family Section Solo Portraits & Disclaimer");
    const familySection = deskPage.locator("#family");
    assert((await familySection.count()) === 1, "Family section exists on homepage");

    await familySection.scrollIntoViewIfNeeded();
    await deskPage.waitForTimeout(600);

    const groomImg = deskPage.locator("#family img[src*='groom_solo_portrait.jpg']");
    const brideImg = deskPage.locator("#family img[src*='bride_solo_portrait.jpg']");
    assert((await groomImg.count()) === 1 && (await groomImg.isVisible()), "Groom solo portrait is visible in Family section");
    assert((await brideImg.count()) === 1 && (await brideImg.isVisible()), "Bride solo portrait is visible in Family section");

    const familyDisclaimer = deskPage.locator("#family :text('Illustrative preview imagery')");
    assert((await familyDisclaimer.count()) >= 1, "Family section renders illustrative preview disclaimer");

    await captureAndCopy(deskPage, "p15_2_3_media_02_family_portraits.png");

    // -------------------------------------------------------------------------
    // SUITE 4: Celebrations Overview Ceremony Imagery
    // -------------------------------------------------------------------------
    console.log("\nSUITE 4: Celebrations Overview Ceremony Photography");
    const celebSection = deskPage.locator("#celebrations");
    await celebSection.scrollIntoViewIfNeeded();
    await deskPage.waitForTimeout(600);

    const haldiImg = deskPage.locator("#celebrations img[src*='ceremony_haldi.jpg']");
    const mehndiImg = deskPage.locator("#celebrations img[src*='ceremony_mehndi.jpg']");
    const mandapImg = deskPage.locator("#celebrations img[src*='ceremony_wedding_mandap.jpg']");
    const receptionImg = deskPage.locator("#celebrations img[src*='ceremony_reception.jpg']");

    assert((await haldiImg.count()) === 1 && (await haldiImg.isVisible()), "Haldi ceremony preview photo is rendered");
    assert((await mehndiImg.count()) === 1 && (await mehndiImg.isVisible()), "Mehndi ceremony preview photo is rendered");
    assert((await mandapImg.count()) === 1 && (await mandapImg.isVisible()), "Vedic mandap ceremony preview photo is rendered");
    assert((await receptionImg.count()) === 1 && (await receptionImg.isVisible()), "Reception stage ceremony preview photo is rendered");

    await captureAndCopy(deskPage, "p15_2_3_media_03_celebrations_overview.png");

    // -------------------------------------------------------------------------
    // SUITE 5: Gallery Preview Section Photos & Videos
    // -------------------------------------------------------------------------
    console.log("\nSUITE 5: Gallery Preview Section (Photos & Videos)");
    const gallerySection = deskPage.locator("#gallery");
    await gallerySection.scrollIntoViewIfNeeded();
    await deskPage.waitForTimeout(600);

    const galleryPhotos = deskPage.locator("#gallery img");
    assert((await galleryPhotos.count()) >= 4, "Gallery preview renders 4 photo previews");

    const galleryVideos = deskPage.locator("#gallery video");
    assert((await galleryVideos.count()) === 2, "Gallery preview renders 2 HTML5 video players");

    const video1Poster = await galleryVideos.nth(0).getAttribute("poster");
    const video2Poster = await galleryVideos.nth(1).getAttribute("poster");
    assert(video1Poster && video1Poster.includes("poster_haldi_film.jpg"), "Video 1 has correct Haldi poster");
    assert(video2Poster && video2Poster.includes("poster_bridal_film.jpg"), "Video 2 has correct Bridal poster");

    await captureAndCopy(deskPage, "p15_2_3_media_04_gallery_preview.png");

    // -------------------------------------------------------------------------
    // SUITE 6: Public /gallery Page Tabs, Lightbox & Video Screening
    // -------------------------------------------------------------------------
    console.log("\nSUITE 6: Dedicated /gallery Page, Lightbox & Video Tabs");
    await deskPage.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });
    await deskPage.waitForTimeout(600);

    // Photos tab active by default
    const photoTab = deskPage.locator("#tab-photos");
    assert((await photoTab.getAttribute("aria-selected")) === "true", "Photographs tab is active by default");

    const fullGalleryPhotos = deskPage.locator("#panel-photos img");
    assert((await fullGalleryPhotos.count()) >= 8, "Gallery page renders 8 temporary photographs");

    // Category filter test
    const portraitsFilter = deskPage.locator("button:has-text('Couple Portraits')");
    if ((await portraitsFilter.count()) > 0) {
      await portraitsFilter.click();
      await deskPage.waitForTimeout(300);
      const filteredCount = await deskPage.locator("#panel-photos img").count();
      assert(filteredCount === 4, `Filter 'Couple Portraits' displays exactly 4 photos (found: ${filteredCount})`);
    }

    // Reset filter
    const allFilter = deskPage.locator("button:has-text('All Photographs')");
    await allFilter.click();
    await deskPage.waitForTimeout(300);

    // Lightbox modal opening test
    const firstPhotoCard = deskPage.locator("#panel-photos .group .cursor-pointer").first();
    await firstPhotoCard.click();
    await deskPage.waitForTimeout(500);

    const lightbox = deskPage.locator(".fixed.inset-0.z-50");
    assert((await lightbox.count()) === 1 && (await lightbox.isVisible()), "Clicking photo card opens full-screen Lightbox modal");

    const lightboxImg = lightbox.locator("img");
    assert((await lightboxImg.count()) === 1, "Lightbox displays high-resolution image");

    await captureAndCopy(deskPage, "p15_2_3_media_05_gallery_lightbox.png");

    // Close Lightbox via Escape key
    await deskPage.keyboard.press("Escape");
    await deskPage.waitForTimeout(400);
    assert((await lightbox.count()) === 0, "Escape key successfully closes Lightbox modal");

    // Switch to Films Tab
    const filmsTab = deskPage.locator("#tab-films");
    await filmsTab.click();
    await deskPage.waitForTimeout(500);
    assert((await filmsTab.getAttribute("aria-selected")) === "true", "Wedding Films tab is now active");

    const filmsPanelVideos = deskPage.locator("#panel-films video");
    assert((await filmsPanelVideos.count()) === 2, "Wedding Films tab displays 2 video screening cards");

    await captureAndCopy(deskPage, "p15_2_3_media_06_gallery_films_tab.png");

    await deskContext.close();

    // -------------------------------------------------------------------------
    // SUITE 7: Mobile Viewport Validation (320px, 390px, 430px)
    // -------------------------------------------------------------------------
    console.log("\nSUITE 7: Mobile-First Viewports & Interaction Quality");

    for (const vp of VIEWPORTS) {
      const mobContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const mobPage = await mobContext.newPage();
      await mobPage.goto(BASE_URL, { waitUntil: "networkidle" });
      await mobPage.waitForTimeout(400);

      // Verify no horizontal overflow
      const overflow = await mobPage.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        };
      });

      assert(!overflow.hasOverflow, `No horizontal overflow at ${vp.name} (${vp.width}x${vp.height}): scroll=${overflow.scrollWidth}, client=${overflow.clientWidth}`);

      // Verify mobile hero background / portrait & countdown presence
      const heroPortraitMob = mobPage.locator("#hero img[src*='hero-portrait.png'], #hero img[src*='hero_couple_portrait.jpg']");
      assert((await heroPortraitMob.count()) >= 1, `Hero imagery is present at ${vp.name}`);

      const heroCountdownMob = mobPage.locator("#hero [aria-label='Wedding ceremony countdown timer']:visible");
      assert((await heroCountdownMob.count()) >= 1, `Hero countdown is visible at ${vp.name}`);

      // Capture key mobile screenshots
      if (vp.width === 390) {
        await captureAndCopy(mobPage, "p15_2_3_media_07_mobile_390_hero.png");

        // Scroll to celebrations
        await mobPage.locator("#celebrations").scrollIntoViewIfNeeded();
        await mobPage.waitForTimeout(400);
        await captureAndCopy(mobPage, "p15_2_3_media_08_mobile_390_celebrations.png");

        // Scroll to gallery preview
        await mobPage.locator("#gallery").scrollIntoViewIfNeeded();
        await mobPage.waitForTimeout(400);
        await captureAndCopy(mobPage, "p15_2_3_media_09_mobile_390_gallery.png");
      }

      if (vp.width === 320) {
        await captureAndCopy(mobPage, "p15_2_3_media_10_narrow_320_hero.png");
      }

      await mobContext.close();
    }

  } finally {
    await browser.close();
  }

  console.log("\n================================================================================");
  console.log(`P-15.2.3 TEST SUMMARY: ${passedTests}/${totalTests} Passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log("================================================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
