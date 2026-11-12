// scripts/test_p15_2_4_3_countdown_polish.mjs
// Verification for Phase P-15.2.4.3: Final Countdown Card Polish

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const LOCAL_SCREENSHOTS_DIR = path.resolve(process.cwd(), "p15_2_4_3_screenshots");
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
  console.log("PHASE P-15.2.4.3: FINAL COUNTDOWN CARD POLISH VERIFICATION");
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
    // DESKTOP (1440x900)
    // =========================================================================
    const deskContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const deskPage = await deskContext.newPage();
    await deskPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await deskPage.waitForTimeout(1000);

    const hero = deskPage.locator("#hero");
    assert((await hero.count()) >= 1, "Hero section is rendered");
    const heroBox = await hero.boundingBox();

    // -------------------------------------------------------------------------
    // SUITE 1: Genuine Liquid-Glass Surface & Translucency
    // -------------------------------------------------------------------------
    console.log("\nSUITE 1: Genuine Liquid-Glass Surface & Translucency");

    const countdown = deskPage.locator(".lg\\:col-span-4 [aria-label='Wedding ceremony countdown timer']").first();
    assert((await countdown.count()) >= 1 && (await countdown.isVisible()), "Desktop countdown plaque is visible");

    const cdBox = await countdown.boundingBox();
    assert(cdBox !== null, "Countdown bounding box obtained");

    // Check translucent background class and alpha
    const plaqueEl = countdown.locator("[class*='backdrop-blur']").first();
    assert((await plaqueEl.count()) >= 1, "Plaque has backdrop-blur styling");

    const plaqueStyles = await plaqueEl.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      const bg = computed.backgroundColor;
      let alpha = 1.0;
      if (bg.includes("/")) {
        const slashParts = bg.split("/");
        const alphaStr = slashParts[slashParts.length - 1].replace(/[^\d.]/g, "").trim();
        if (alphaStr) alpha = parseFloat(alphaStr);
      } else {
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match && match[4] !== undefined) alpha = parseFloat(match[4]);
      }
      return {
        backgroundColor: bg,
        alpha,
        borderColor: computed.borderColor,
        boxShadow: computed.boxShadow,
        className: el.className,
      };
    });

    console.log(`    Observed background-color: ${plaqueStyles.backgroundColor} (alpha: ${plaqueStyles.alpha})`);
    assert(plaqueStyles.alpha < 0.60 && plaqueStyles.alpha >= 0.20, `Plaque is genuinely translucent liquid-glass (alpha=${plaqueStyles.alpha}, expected 0.20-0.60, not opaque cream >= 0.70)`);
    assert(plaqueStyles.className.includes("bg-[#FFFCF6]"), "Plaque retains champagne-tinted surface token (#FFFCF6)");
    assert(plaqueStyles.className.includes("border-[#B8975E]"), "Plaque features fine delicate gold border (#B8975E)");
    assert(plaqueStyles.className.includes("inset_0_1px_1px"), "Plaque features top internal glass rim highlight");

    // -------------------------------------------------------------------------
    // SUITE 2: Positioning Near Upper-Right Edge (40-56px from Right Edge)
    // -------------------------------------------------------------------------
    console.log("\nSUITE 2: Positioning Near Upper-Right Edge (40-56px Target)");

    const nav = await deskPage.locator("header[role='banner']").boundingBox();
    const distFromRight = heroBox.width - (cdBox.x + cdBox.width);
    console.log(`    Hero width: ${heroBox.width}px, Card X: ${cdBox.x.toFixed(1)}px, Card Width: ${cdBox.width.toFixed(1)}px, Card Right: ${(cdBox.x + cdBox.width).toFixed(1)}px`);
    console.log(`    Distance from hero right edge: ${distFromRight.toFixed(1)}px (Target: 40–56px)`);

    assert(distFromRight >= 38 && distFromRight <= 58, `Card sits approximately 40–56px from hero right edge: actual=${distFromRight.toFixed(1)}px`);
    assert(cdBox.x >= 1050, `Card floats in upper-right negative space, completely clearing couple portraits: x=${cdBox.x.toFixed(1)}px (>= 1050px)`);

    // Vertical gap beneath navigation (32-48px)
    const distFromNav = nav ? cdBox.y - (nav.y + nav.height) : 0;
    console.log(`    Vertical gap beneath navigation: ${distFromNav.toFixed(1)}px (Target: 32–48px)`);
    assert(distFromNav >= 30 && distFromNav <= 55, `Vertical gap beneath navigation is comfortable: gap=${distFromNav.toFixed(1)}px`);

    // Compact dimensions
    assert(cdBox.width >= 280 && cdBox.width <= 315, `Card width is compact: width=${cdBox.width.toFixed(1)}px`);
    assert(cdBox.height <= 135, `Card height is compact: height=${cdBox.height.toFixed(1)}px`);

    // -------------------------------------------------------------------------
    // SUITE 3: Content Preservation & Dark Ink Readability
    // -------------------------------------------------------------------------
    console.log("\nSUITE 3: Content Preservation & Dark Ink Readability");

    const headingText = await countdown.locator("div.text-center").first().innerText();
    assert(headingText.toUpperCase().includes("THE SACRED VOWS BEGIN IN"), "Editorial heading 'The Sacred Vows Begin In' is present");

    const timerUnits = (await countdown.locator("[role='timer']").innerText()).toUpperCase();
    assert(timerUnits.includes("DAYS"), "Timer contains Days unit");
    assert(timerUnits.includes("HOURS"), "Timer contains Hours unit");
    assert(timerUnits.includes("MINS"), "Timer contains Mins unit");
    assert(timerUnits.includes("SECS"), "Timer contains Secs unit");

    // Sindoor red accent on seconds
    const secsValue = countdown.locator("[role='timer'] span[class*='text-[#A52232]']").first();
    assert((await secsValue.count()) >= 1, "Seconds counter features sindoor-red (#A52232) accent");

    // Event date and venue
    const footerText = await countdown.locator("div[class*='border-t']").first().innerText();
    assert(footerText.includes("21 November 2026") && footerText.includes("11:00 PM IST"), "Footer references 21 November 2026 • 11:00 PM IST");
    assert(footerText.includes("Purulia"), "Footer references Purulia venue");

    // Check dark ink contrast
    const daysDigitColor = await countdown.locator("[role='timer'] span[class*='text-[#1A1414]']").first().evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log(`    Days digit computed text color: ${daysDigitColor}`);
    assert(daysDigitColor.includes("26, 20, 20") || daysDigitColor.includes("rgb("), "Days digits rendered in dark ink typography for high contrast");

    // Capture desktop screenshots
    await captureAndCopy(deskPage, "p15_2_4_3_01_desktop_hero_1440.png");

    // Close-up clip of countdown plaque
    await captureAndCopy(deskPage, "p15_2_4_3_02_countdown_glass_closeup.png", {
      x: Math.max(0, cdBox.x - 20),
      y: Math.max(0, cdBox.y - 15),
      width: cdBox.width + 40,
      height: cdBox.height + 30,
    });

    // -------------------------------------------------------------------------
    // SUITE 4: Mobile Responsive Layout & Collision Immunity (390x844)
    // -------------------------------------------------------------------------
    console.log("\nSUITE 4: Mobile Responsive Layout & Collision Immunity (390x844)");

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

    const mobCountdown = mobPage.locator("#hero [aria-label='Wedding ceremony countdown timer']").first();
    assert((await mobCountdown.count()) >= 1 && (await mobCountdown.isVisible()), "Countdown is visible on mobile");

    const mobCdBox = await mobCountdown.boundingBox();
    assert(mobCdBox && mobCdBox.width <= 360, `Mobile countdown width fits screen: width=${mobCdBox?.width?.toFixed(1)}px`);

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

    await captureAndCopy(mobPage, "p15_2_4_3_03_mobile_hero_390.png");

    await deskContext.close();
    await mobContext.close();
  } finally {
    await browser.close();
  }

  console.log("\n================================================================================");
  console.log(`P-15.2.4.3 TEST SUMMARY: ${passedTests}/${totalTests} Passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log("================================================================================\n");
}

runVerification().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
