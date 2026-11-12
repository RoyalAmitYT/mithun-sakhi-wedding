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
  console.log("MASTER TASK: RECREATE WEDDING CELEBRATIONS DESIGN REFERENCE VERIFICATION");
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
    // SUITE 1: DESKTOP VIEWPORT (1440x900) - Reference Match
    // =========================================================================
    console.log("SUITE 1: Desktop Viewport (1440x900) - Exact Reference Match");
    const deskContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const deskPage = await deskContext.newPage();
    await deskPage.goto(`${BASE_URL}#celebrations`, { waitUntil: "domcontentloaded" });
    await deskPage.waitForTimeout(1800);

    const celebrations = deskPage.locator("#celebrations");
    assert((await celebrations.count()) >= 1, "#celebrations section is present");

    // Header checks
    const eyebrow = celebrations.locator("text=FOUR SACRED CEREMONIES").first();
    assert(await eyebrow.isVisible(), "Eyebrow 'FOUR SACRED CEREMONIES' is visible");

    const title = celebrations.locator("#celebrations-title");
    assert(await title.isVisible(), "Main title 'The Wedding Celebrations' is visible");
    const titleHtml = await title.innerHTML();
    assert(titleHtml.includes("text-[#8E1B29]"), "Title features two-tone crimson emphasis on 'Celebrations'");

    const subtitle = celebrations.locator("text=Four days of sacred rituals, joyful music, and cherished blessings in Purulia.");
    assert(await subtitle.isVisible(), "Subtitle matching reference is visible");

    // Ceremony Cards Count
    const cards = celebrations.locator("article");
    const cardCount = await cards.count();
    assert(cardCount === 4, `Found exactly 4 ceremony cards (found ${cardCount})`);

    // Verify Card 1: Haldi Ceremony
    const card1 = cards.nth(0);
    const text1 = await card1.innerText();
    assert(text1.includes("19\nNOV") || (text1.includes("19") && text1.includes("NOV")), "Card 1 has '19 NOV' hanging date badge");
    assert(text1.includes("RITUAL 01"), "Card 1 has 'RITUAL 01'");
    assert(text1.includes("9:00 AM IST"), "Card 1 confirmed time is '9:00 AM IST'");
    assert(text1.includes("Haldi Ceremony"), "Card 1 title is 'Haldi Ceremony'");
    assert(text1.includes("The sacred turmeric blessing marking a joyous new beginning."), "Card 1 description matches reference");
    assert(text1.includes("Groom's Home, Purulia"), "Card 1 venue is 'Groom's Home, Purulia'");
    assert(text1.toUpperCase().includes("VIEW CEREMONY"), "Card 1 has 'VIEW CEREMONY' link");
    const img1 = card1.locator("img").first();
    assert((await img1.getAttribute("src")).includes("haldi-portrait"), "Card 1 uses 'haldi-portrait.png'");

    // Verify Card 2: Mehndi Ceremony
    const card2 = cards.nth(1);
    const text2 = await card2.innerText();
    assert(text2.includes("20\nNOV") || (text2.includes("20") && text2.includes("NOV")), "Card 2 has '20 NOV' hanging date badge");
    assert(text2.includes("RITUAL 02"), "Card 2 has 'RITUAL 02'");
    assert(text2.includes("9:00 AM IST"), "Card 2 confirmed time is '9:00 AM IST'");
    assert(text2.includes("Mehndi Ceremony"), "Card 2 title is 'Mehndi Ceremony'");
    assert(text2.includes("A vibrant celebration of henna, music and togetherness."), "Card 2 description matches reference");
    assert(text2.includes("Groom's Home, Purulia"), "Card 2 venue is 'Groom's Home, Purulia'");
    const img2 = card2.locator("img").first();
    assert((await img2.getAttribute("src")).includes("mehendi-portrait"), "Card 2 uses 'mehendi-portrait.png'");

    // Verify Card 3: The Sacred Wedding
    const card3 = cards.nth(2);
    const text3 = await card3.innerText();
    assert(text3.includes("21\nNOV") || (text3.includes("21") && text3.includes("NOV")), "Card 3 has '21 NOV' hanging date badge");
    assert(text3.includes("RITUAL 03"), "Card 3 has 'RITUAL 03'");
    assert(text3.includes("11:00 PM IST"), "Card 3 confirmed time is '11:00 PM IST'");
    assert(text3.includes("The Sacred Wedding"), "Card 3 title is 'The Sacred Wedding'");
    assert(text3.includes("The sacred Vedic marriage ceremony uniting two hearts for a lifetime."), "Card 3 description matches reference");
    assert(text3.includes("Bride's Home, Purulia"), "Card 3 venue is 'Bride's Home, Purulia'");
    const img3 = card3.locator("img").first();
    assert((await img3.getAttribute("src")).includes("the-sacred-wedding"), "Card 3 uses 'the-sacred-wedding.png'");

    // Verify Card 4: Reception & Preetibhoj
    const card4 = cards.nth(3);
    const text4 = await card4.innerText();
    assert(text4.includes("22\nNOV") || (text4.includes("22") && text4.includes("NOV")), "Card 4 has '22 NOV' hanging date badge");
    assert(text4.includes("RITUAL 04"), "Card 4 has 'RITUAL 04'");
    assert(text4.includes("5:00 PM IST"), "Card 4 confirmed time is '5:00 PM IST'");
    assert(text4.includes("Reception & Preetibhoj"), "Card 4 title is 'Reception & Preetibhoj'");
    assert(text4.includes("A grand celebration banquet with family, friends and heartfelt blessings."), "Card 4 description matches reference");
    assert(text4.includes("Groom's Home, Purulia"), "Card 4 venue is 'Groom's Home, Purulia'");
    const img4 = card4.locator("img").first();
    assert((await img4.getAttribute("src")).includes("reception-portrait"), "Card 4 uses 'reception-portrait.png'");

    // S-Curve Wave Verification: Check all 4 cards have wave SVG transition
    const waveSvgs = celebrations.locator("svg[viewBox='0 0 320 28']");
    assert((await waveSvgs.count()) === 4, "All 4 cards have the curved S-wave image-bottom SVG transition");

    // Check Schedule Link and Music Player Clearance
    const scheduleLink = celebrations.locator("a[href='#ceremonies']").first();
    assert(await scheduleLink.isVisible(), "Schedule link button is visible");

    await scheduleLink.scrollIntoViewIfNeeded();
    await deskPage.waitForTimeout(500);
    const linkBox = await scheduleLink.boundingBox();
    const musicPlayer = deskPage.locator("aside[aria-label*='audio'], aside[aria-label*='music']").first();
    if (await musicPlayer.isVisible()) {
      const mBox = await musicPlayer.boundingBox();
      const overlap = !(
        linkBox.x + linkBox.width < mBox.x ||
        mBox.x + mBox.width < linkBox.x ||
        linkBox.y + linkBox.height < mBox.y ||
        mBox.y + mBox.height < linkBox.y
      );
      assert(!overlap, `No collision between Schedule CTA and floating music player (overlap=${overlap})`);
    }

    // Clean section screenshot without fixed viewport slice artifacts
    await deskPage.evaluate(() => {
      const header = document.querySelector("header");
      if (header) header.style.display = "none";
      const music = document.querySelector("aside[aria-label*='audio'], aside[aria-label*='music']");
      if (music) music.style.display = "none";
    });

    const desktopScreenshotPath = path.join(SCREENSHOTS_DIR, "p15_2_5_reference_desktop_1440.png");
    await celebrations.screenshot({ path: desktopScreenshotPath });
    console.log(`  📸 Saved screenshot: p15_2_5_reference_desktop_1440.png`);
    await deskContext.close();

    // =========================================================================
    // SUITE 2: MOBILE VIEWPORT (390x844 - iPhone 14)
    // =========================================================================
    console.log("\nSUITE 2: Mobile Viewport (390x844)");
    const mobContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
    });
    const mobPage = await mobContext.newPage();
    await mobPage.goto(`${BASE_URL}#celebrations`, { waitUntil: "domcontentloaded" });
    await mobPage.waitForTimeout(1800);

    const mobOverflow = await mobPage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    assert(!mobOverflow, "No horizontal document overflow at 390x844");

    const mobCelebrations = mobPage.locator("#celebrations");
    assert((await mobCelebrations.locator("article").count()) === 4, "All 4 ceremony cards rendered on mobile");

    await mobPage.evaluate(() => {
      const header = document.querySelector("header");
      if (header) header.style.display = "none";
      const music = document.querySelector("aside[aria-label*='audio'], aside[aria-label*='music']");
      if (music) music.style.display = "none";
    });

    const mobScreenshotPath = path.join(SCREENSHOTS_DIR, "p15_2_5_reference_mobile_390.png");
    await mobCelebrations.screenshot({ path: mobScreenshotPath });
    console.log(`  📸 Saved screenshot: p15_2_5_reference_mobile_390.png`);
    await mobContext.close();

    // =========================================================================
    // SUITE 3: NARROW MOBILE VIEWPORT (320x640)
    // =========================================================================
    console.log("\nSUITE 3: Narrow Mobile Viewport (320x640)");
    const narrowContext = await browser.newContext({
      viewport: { width: 320, height: 640 },
      deviceScaleFactor: 1,
    });
    const narrowPage = await narrowContext.newPage();
    await narrowPage.goto(`${BASE_URL}#celebrations`, { waitUntil: "domcontentloaded" });
    await narrowPage.waitForTimeout(1800);

    const narrowOverflow = await narrowPage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    assert(!narrowOverflow, "No horizontal document overflow at 320x640");

    await narrowPage.evaluate(() => {
      const header = document.querySelector("header");
      if (header) header.style.display = "none";
      const music = document.querySelector("aside[aria-label*='audio'], aside[aria-label*='music']");
      if (music) music.style.display = "none";
    });

    const narrowCelebrations = narrowPage.locator("#celebrations");
    const narrowScreenshotPath = path.join(SCREENSHOTS_DIR, "p15_2_5_reference_narrow_320.png");
    await narrowCelebrations.screenshot({ path: narrowScreenshotPath });
    console.log(`  📸 Saved screenshot: p15_2_5_reference_narrow_320.png`);
    await narrowContext.close();

    // =========================================================================
    // SUITE 4: TABLET VIEWPORT (768x1024 - iPad)
    // =========================================================================
    console.log("\nSUITE 4: Tablet Viewport (768x1024)");
    const tabContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 1,
    });
    const tabPage = await tabContext.newPage();
    await tabPage.goto(`${BASE_URL}#celebrations`, { waitUntil: "domcontentloaded" });
    await tabPage.waitForTimeout(1800);

    await tabPage.evaluate(() => {
      const header = document.querySelector("header");
      if (header) header.style.display = "none";
      const music = document.querySelector("aside[aria-label*='audio'], aside[aria-label*='music']");
      if (music) music.style.display = "none";
    });

    const tabCelebrations = tabPage.locator("#celebrations");
    const tabScreenshotPath = path.join(SCREENSHOTS_DIR, "p15_2_5_reference_tablet_768.png");
    await tabCelebrations.screenshot({ path: tabScreenshotPath });
    console.log(`  📸 Saved screenshot: p15_2_5_reference_tablet_768.png`);
    await tabContext.close();

  } finally {
    await browser.close();
  }

  console.log("\n================================================================================");
  console.log(`MASTER TASK TEST SUMMARY: ${passedTests}/${totalTests} Passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log("================================================================================\n");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
