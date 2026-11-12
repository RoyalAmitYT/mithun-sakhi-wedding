import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR = path.resolve(
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots"
);
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log("================================================================================");
  console.log("TEST SUITE: CINEMATIC WEDDING MEMORIES HOMEPAGE REDESIGN VERIFICATION (P-15.3)");
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
    // SUITE 1: DESKTOP VIEWPORT (1440x900) - REFERENCE RECREATION VERIFICATION
    // =========================================================================
    console.log("SUITE 1: Desktop Viewport (1440x900) - Visual Reference Match Verification");
    const deskContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const deskPage = await deskContext.newPage();
    await deskPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await deskPage.waitForTimeout(1500);

    const gallerySection = deskPage.locator("#gallery");
    assert((await gallerySection.count()) >= 1, "#gallery section is present");

    // Scroll to #gallery
    await gallerySection.scrollIntoViewIfNeeded();
    await deskPage.waitForTimeout(600);

    // 1. Header Checks
    const eyebrow = gallerySection.locator("text=VISUAL CHRONICLE").first();
    assert(await eyebrow.isVisible(), "Eyebrow 'VISUAL CHRONICLE' is visible");

    const title = gallerySection.locator("#gallery-title");
    assert(await title.isVisible(), "Main title #gallery-title is visible");
    const titleText = await title.innerText();
    assert(
      titleText.includes("Wedding") && titleText.includes("Memories"),
      "Title contains 'Wedding Memories'"
    );

    const subtitle = gallerySection.locator("text=A glimpse into our celebrations").first();
    assert(await subtitle.isVisible(), "Subtitle description is visible");

    // 2. Curated Moments Panel
    const curatedBadge = gallerySection.locator("text=CURATED MOMENTS").first();
    assert(await curatedBadge.isVisible(), "Badge 'CURATED MOMENTS' is visible");

    const panelText = gallerySection.locator("text=A special selection of memories").first();
    assert(await panelText.isVisible(), "Curated Moments panel description is visible");

    // 3. Grid & Photos Verification
    const photoButtons = gallerySection.locator("div.grid button");
    const photoCount = await photoButtons.count();
    assert(photoCount === 7, `Exactly 7 curated photographs rendered (found ${photoCount})`);

    // Verify Groom tall portrait
    const groomImg = gallerySection.locator('img[src*="groom-portrait"]').first();
    assert(await groomImg.isVisible(), "Groom portrait is visible in Column 1");

    // Verify Bride portrait
    const brideImg = gallerySection.locator('img[src*="bride-portrait"]').first();
    assert(await brideImg.isVisible(), "Bride portrait is visible in Column 2 top");

    // Verify Mandap photo
    const mandapImg = gallerySection.locator('img[src*="mandap"]').first();
    assert(await mandapImg.isVisible(), "Mandap photo is visible in Column 2 bottom");

    // Verify Haldi photo
    const haldiImg = gallerySection.locator('img[src*="haldi-portrait"]').first();
    assert(await haldiImg.isVisible(), "Haldi photo is visible in Column 3 top");

    // Verify Sacred wedding photo
    const sacredImg = gallerySection.locator('img[src*="the-sacred-wedding"]').first();
    assert(await sacredImg.isVisible(), "The Sacred Wedding photo is visible in Column 3 bottom");

    // Verify Mehndi photo
    const mehndiImg = gallerySection.locator('img[src*="mehendi-portrait"]').first();
    assert(await mehndiImg.isVisible(), "Mehndi photo is visible in Column 4 top");

    // Verify Reception photo
    const receptionImg = gallerySection.locator('img[src*="reception-portrait"]').first();
    assert(await receptionImg.isVisible(), "Reception photo is visible in Column 4 bottom");

    // 4. Circular Navigation Arrows
    const navButtons = gallerySection.locator('button[aria-label*="curated gallery moments"]');
    assert((await navButtons.count()) === 2, "Left and right circular navigation arrows exist");

    // 5. CTA Button & Disclaimer
    const ctaLink = gallerySection.locator('a[href="/gallery"]');
    assert(await ctaLink.isVisible(), "CTA link to /gallery is visible");
    const ctaText = await ctaLink.innerText();
    assert(ctaText.includes("VIEW FULL GALLERY"), "CTA button text is 'VIEW FULL GALLERY'");

    const disclaimer = gallerySection.locator("text=Illustrative preview imagery").first();
    assert(await disclaimer.isVisible(), "Discreet disclaimer text is visible");

    // 6. Test Interactive Lightbox Modal
    console.log("  Testing Lightbox modal open and close...");
    await photoButtons.first().click();
    await deskPage.waitForTimeout(500);

    const modal = deskPage.locator('div[role="dialog"]');
    assert(await modal.isVisible(), "Lightbox modal opens on clicking photo");

    const modalCloseBtn = modal.locator('button[aria-label="Close photo preview"]');
    await modalCloseBtn.click();
    await deskPage.waitForTimeout(400);
    assert((await modal.count()) === 0, "Lightbox modal closes cleanly on close button");

    // 7. Desktop Screenshots
    // Scroll cleanly so heading starts comfortably below fixed navbar
    const sectionTop = await gallerySection.evaluate((el) => {
      let top = 0;
      let curr = el;
      while (curr) {
        top += curr.offsetTop;
        curr = curr.offsetParent;
      }
      return top;
    });
    await deskPage.evaluate((y) => window.scrollTo({ top: y - 20, behavior: "instant" }), sectionTop);
    await deskPage.waitForTimeout(600);

    // Hide floating audio player and fixed navbar temporarily for clean capture
    await deskPage.evaluate(() => {
      const player = document.querySelector('aside[aria-label="Wedding audio player"]');
      if (player) player.style.display = "none";
      const nav = document.querySelector("header");
      if (nav) nav.style.display = "none";
    });

    const desktopScreenshotPath = path.join(SCREENSHOTS_DIR, "gallery_preview_desktop_1440.png");
    await gallerySection.screenshot({ path: desktopScreenshotPath });
    console.log(`  ✓ Saved: ${desktopScreenshotPath}`);

    const fullSectionScreenshotPath = path.join(
      SCREENSHOTS_DIR,
      "gallery_preview_desktop_1440_fullsection.png"
    );
    await deskPage.screenshot({ path: fullSectionScreenshotPath, fullPage: false });
    console.log(`  ✓ Saved: ${fullSectionScreenshotPath}`);

    await deskContext.close();

    // =========================================================================
    // SUITE 2: TABLET VIEWPORT (768x1024)
    // =========================================================================
    console.log("\nSUITE 2: Tablet Viewport (768x1024)");
    const tabContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 1,
    });
    const tabPage = await tabContext.newPage();
    await tabPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await tabPage.waitForTimeout(1000);

    const tabGallery = tabPage.locator("#gallery");
    await tabGallery.scrollIntoViewIfNeeded();
    await tabPage.evaluate(() => {
      const player = document.querySelector('aside[aria-label="Wedding audio player"]');
      if (player) player.style.display = "none";
      const nav = document.querySelector("header");
      if (nav) nav.style.display = "none";
    });
    await tabPage.waitForTimeout(500);

    const tabScreenshotPath = path.join(SCREENSHOTS_DIR, "gallery_preview_tablet_768.png");
    await tabGallery.screenshot({ path: tabScreenshotPath });
    console.log(`  ✓ Saved: ${tabScreenshotPath}`);
    await tabContext.close();

    // =========================================================================
    // SUITE 3: MOBILE VIEWPORTS (430, 390, 360, 320)
    // =========================================================================
    const mobileViewports = [
      { name: "iphone_plus_430", width: 430, height: 932 },
      { name: "mobile_390", width: 390, height: 844 },
      { name: "android_360", width: 360, height: 800 },
      { name: "narrow_320", width: 320, height: 640 },
    ];

    for (const vp of mobileViewports) {
      console.log(`\nSUITE 3: Mobile Viewport (${vp.name} - ${vp.width}x${vp.height})`);
      const mobContext = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const mobPage = await mobContext.newPage();
      await mobPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await mobPage.waitForTimeout(1000);

      const mobGallery = mobPage.locator("#gallery");
      await mobGallery.scrollIntoViewIfNeeded();
      await mobPage.evaluate(() => {
        const player = document.querySelector('aside[aria-label="Wedding audio player"]');
        if (player) player.style.display = "none";
        const nav = document.querySelector("header");
        if (nav) nav.style.display = "none";
      });
      await mobPage.waitForTimeout(500);

      assert(await mobGallery.isVisible(), `Gallery is visible on ${vp.name}`);

      const mobScreenshotPath = path.join(SCREENSHOTS_DIR, `gallery_preview_${vp.name}.png`);
      await mobGallery.screenshot({ path: mobScreenshotPath });
      console.log(`  ✓ Saved: ${mobScreenshotPath}`);
      await mobContext.close();
    }

    console.log("\n================================================================================");
    console.log(`ALL TESTS PASSED: ${passedTests}/${totalTests} (100%)`);
    console.log("================================================================================\n");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
