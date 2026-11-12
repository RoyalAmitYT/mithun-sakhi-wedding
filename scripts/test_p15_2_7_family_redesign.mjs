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
  console.log("TEST SUITE: COUPLE & FAMILY CINEMATIC EDITORIAL REDESIGN VERIFICATION");
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
    console.log("SUITE 1: Desktop Viewport (1440x900) - Reference Match Verification");
    const deskContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const deskPage = await deskContext.newPage();
    await deskPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await deskPage.waitForTimeout(1500);

    const familySection = deskPage.locator("#family");
    assert((await familySection.count()) >= 1, "#family section is present");

    // Scroll to #family
    await familySection.scrollIntoViewIfNeeded();
    await deskPage.waitForTimeout(600);

    // 1. Header Checks
    const eyebrow = familySection.locator("text=WITH REVERENCE & GRATITUDE").first();
    assert(await eyebrow.isVisible(), "Eyebrow 'WITH REVERENCE & GRATITUDE' is visible");

    const title = familySection.locator("#family-title");
    assert(await title.isVisible(), "Main title #family-title is visible");
    const titleText = await title.innerText();
    assert(titleText.includes("The Couple & Their"), "Title contains 'The Couple & Their'");
    assert(titleText.includes("Families"), "Title contains 'Families'");

    const subtitle = familySection.locator("text=Honoring the couple and the beloved parents").first();
    assert(await subtitle.isVisible(), "Subtitle honoring parents is visible");

    // 2. Central Couple Plaque Checks
    console.log("\n  Checking Central Couple Plaque...");
    const monogram = familySection.locator("text=M • S").first();
    assert(await monogram.isVisible(), "Central plaque monogram 'M • S' is visible");

    const coupleNames = familySection.locator("h3:has-text('Mithun & Sakhi')").first();
    assert(await coupleNames.isVisible(), "Couple names 'Mithun & Sakhi' is visible on plaque");

    const coupleSubBar = familySection.locator("text=UNITED IN LOVE • BLESSED BY FAMILY").first();
    assert(await coupleSubBar.isVisible(), "Plaque sub-bar 'UNITED IN LOVE • BLESSED BY FAMILY' is visible");

    const plaqueDate = familySection.locator("text=PURULIA, WEST BENGAL • NOVEMBER 2026").first();
    assert(await plaqueDate.isVisible(), "Plaque date 'PURULIA, WEST BENGAL • NOVEMBER 2026' is visible");

    // 3. Card 01: Groom's Family
    console.log("\n  Checking Card 01: Groom's Family...");
    const groomCard = familySection.locator("article[aria-labelledby='groom-family-title']");
    assert(await groomCard.count() >= 1, "Groom's Family article card is present");

    const groomLabel = groomCard.locator("text=Groom's Family");
    assert(await groomLabel.isVisible(), "Label 'Groom's Family' is visible");

    const groomEyebrow = groomCard.locator("text=The Groom");
    assert(await groomEyebrow.isVisible(), "Eyebrow 'The Groom' is visible");

    const groomName = groomCard.locator("#groom-family-title");
    assert(await groomName.isVisible(), "Groom name 'Mithun Gorain' is visible");

    // Groom's Portrait
    const groomImg = groomCard.locator("img[src*='groom-portrait']");
    assert(await groomImg.count() >= 1, "Groom portrait image is present");
    assert(await groomImg.first().isVisible(), "Groom portrait image is visible");

    const groomBadge = groomCard.locator("text=Illustrative Portrait");
    assert(await groomBadge.isVisible(), "Groom portrait 'Illustrative Portrait' badge is visible");

    // Groom's Parents
    const groomBlessings = groomCard.locator("text=With Blessings From");
    assert(await groomBlessings.isVisible(), "Groom 'With Blessings From' is visible");

    const fatherGroom = groomCard.locator("text=Mr. Kenaram Gorain");
    assert(await fatherGroom.isVisible(), "Father 'Mr. Kenaram Gorain' is visible");

    const motherGroom = groomCard.locator("text=Ms. Savita Gorian");
    assert(await motherGroom.isVisible(), "Mother 'Ms. Savita Gorian' is visible");

    const groomResidence = groomCard.locator("text=Residence: Chitmu, Kotshila, Purulia");
    assert(await groomResidence.isVisible(), "Groom residence 'Chitmu, Kotshila, Purulia' is visible");

    // 4. Card 02: Bride's Family
    console.log("\n  Checking Card 02: Bride's Family...");
    const brideCard = familySection.locator("article[aria-labelledby='bride-family-title']");
    assert(await brideCard.count() >= 1, "Bride's Family article card is present");

    const brideLabel = brideCard.locator("text=Bride's Family");
    assert(await brideLabel.isVisible(), "Label 'Bride's Family' is visible");

    const brideEyebrow = brideCard.locator("text=The Bride");
    assert(await brideEyebrow.isVisible(), "Eyebrow 'The Bride' is visible");

    const brideName = brideCard.locator("#bride-family-title");
    assert(await brideName.isVisible(), "Bride name 'Sakhi Gorain' is visible");

    const brideNickname = brideCard.locator("text=(Manjura)");
    assert((await brideNickname.count()) === 0, "Bride nickname '(Manjura)' is strictly absent");

    // Bride's Portrait
    const brideImg = brideCard.locator("img[src*='bride-portrait']");
    assert(await brideImg.count() >= 1, "Bride portrait image is present");
    assert(await brideImg.first().isVisible(), "Bride portrait image is visible");

    const brideBadge = brideCard.locator("text=Illustrative Portrait");
    assert(await brideBadge.isVisible(), "Bride portrait 'Illustrative Portrait' badge is visible");

    // Bride's Parents
    const brideBlessings = brideCard.locator("text=With Blessings From");
    assert(await brideBlessings.isVisible(), "Bride 'With Blessings From' is visible");

    const fatherBride = brideCard.locator("text=Mr. Upen Gorain");
    assert(await fatherBride.isVisible(), "Father 'Mr. Upen Gorain' is visible");

    const motherBride = brideCard.locator("text=Ms. Kokila Gorain");
    assert(await motherBride.isVisible(), "Mother 'Ms. Kokila Gorain' is visible");

    const brideResidence = brideCard.locator("text=Residence: Ghaghra, Jaipur, Purulia");
    assert(await brideResidence.isVisible(), "Bride residence 'Ghaghra, Jaipur, Purulia' is visible");

    // 5. Desktop Equal Card Height Check
    const groomBox = await groomCard.boundingBox();
    const brideBox = await brideCard.boundingBox();
    const heightDiff = Math.abs(groomBox.height - brideBox.height);
    console.log(`\n  Desktop Card Heights: Groom = ${groomBox.height}px, Bride = ${brideBox.height}px (Diff: ${heightDiff}px)`);
    assert(heightDiff <= 2, `Family cards have equal desktop height (Diff: ${heightDiff}px <= 2px)`);

    // 6. Section Bottom Footnote
    const footnote = familySection.locator("text=official wedding photographs of Mithun, Sakhi, and family will be published here");
    assert(await footnote.isVisible(), "Bottom footnote disclosure is visible");

    // 7. No Horizontal Overflow
    const noOverflow = await deskPage.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    assert(noOverflow, "Zero horizontal overflow on desktop");

    // Scroll precisely so heading starts comfortably below fixed navbar
    const sectionTop = await familySection.evaluate((el) => {
      let top = 0;
      let curr = el;
      while (curr) {
        top += curr.offsetTop;
        curr = curr.offsetParent;
      }
      return top;
    });
    await deskPage.evaluate((y) => window.scrollTo({ top: y - 60, behavior: "instant" }), sectionTop);
    await deskPage.waitForTimeout(600);

    // Hide floating music player temporarily for clean section screenshot
    await deskPage.evaluate(() => {
      const player = document.querySelector('aside[aria-label="Wedding audio player"]');
      if (player) player.style.display = "none";
    });

    // Screenshot Desktop Viewport
    const shotDesk = path.join(SCREENSHOTS_DIR, "family_section_desktop_1440.png");
    await deskPage.screenshot({ path: shotDesk });
    console.log(`  📸 Saved desktop viewport screenshot: ${shotDesk}`);

    // Screenshot Full Section Element
    const shotSection = path.join(SCREENSHOTS_DIR, "family_section_desktop_1440_fullsection.png");
    await familySection.screenshot({ path: shotSection });
    console.log(`  📸 Saved full section screenshot: ${shotSection}`);

    await deskContext.close();

    // =========================================================================
    // SUITE 2: RESPONSIVE VIEWPORT TESTING (320, 360, 390, 430, 768)
    // =========================================================================
    console.log("\nSUITE 2: Responsive Viewport Testing");
    const viewports = [
      { name: "narrow_320", width: 320, height: 640 },
      { name: "android_360", width: 360, height: 800 },
      { name: "mobile_390", width: 390, height: 844 },
      { name: "iphone_plus_430", width: 430, height: 932 },
      { name: "tablet_768", width: 768, height: 1024 },
    ];

    for (const vp of viewports) {
      console.log(`\n  Testing Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);

      const sec = page.locator("#family");
      await sec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const gTitle = sec.locator("#groom-family-title");
      assert(await gTitle.isVisible(), `Groom title visible on ${vp.name}`);

      const bTitle = sec.locator("#bride-family-title");
      assert(await bTitle.isVisible(), `Bride title visible on ${vp.name}`);

      const gImg = sec.locator("img[src*='groom-portrait']").first();
      assert(await gImg.isVisible(), `Groom portrait visible on ${vp.name}`);

      const bImg = sec.locator("img[src*='bride-portrait']").first();
      assert(await bImg.isVisible(), `Bride portrait visible on ${vp.name}`);

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      assert(overflow, `Zero horizontal overflow on ${vp.name}`);

      // Hide music player for clean capture
      await page.evaluate(() => {
        const player = document.querySelector('aside[aria-label="Wedding audio player"]');
        if (player) player.style.display = "none";
      });

      const shotPath = path.join(SCREENSHOTS_DIR, `family_section_${vp.name}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`  📸 Saved screenshot: ${shotPath}`);

      await ctx.close();
    }

    console.log("\n================================================================================");
    console.log(`ALL VERIFICATION TESTS COMPLETED: ${passedTests}/${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log("================================================================================\n");
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
