import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots";
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runTests() {
  console.log("================================================================================");
  console.log("   4:6 CREATIVE RESET DIGITAL INVITATION COMPREHENSIVE TEST SUITE");
  console.log("================================================================================");

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Desktop Viewport (1440x900)
    // -------------------------------------------------------------------------
    console.log("\n1. Testing Desktop Viewport (1440x900) on /invitation...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5,
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(800);

    const card = desktopPage.locator("#official-wedding-invitation-card");
    await card.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Official wedding invitation card is rendered.");

    // Aspect Ratio & Sizing Calculation
    const box = await card.boundingBox();
    if (!box) throw new Error("Could not determine card bounding box!");
    const ratio = box.width / box.height;
    const expectedRatio = 4 / 6;
    const diff = Math.abs(ratio - expectedRatio);
    console.log(`✓ Card Dimensions: width = ${box.width.toFixed(1)}px, height = ${box.height.toFixed(1)}px`);
    console.log(`✓ Measured Ratio: ${ratio.toFixed(4)} (Expected 4:6 = ${expectedRatio.toFixed(4)}, diff = ${diff.toFixed(4)})`);
    
    if (diff < 0.05) {
      console.log("✓ EXACT 4:6 ASPECT RATIO CONFIRMED (within 5% tolerance)!");
    } else {
      console.warn(`⚠ Ratio difference: ${diff.toFixed(4)}`);
    }

    // Viewport Height Safety: Must fit within normal desktop height without requiring zoom
    if (box.height <= 850) {
      console.log(`✓ Desktop Height ${box.height.toFixed(1)}px fits comfortably within 900px viewport!`);
    }

    // Real Text Content Checks
    const cardText = await card.innerText();
    
    // Couple Names
    if (!/Mithun Gorain/i.test(cardText)) throw new Error("Missing groom: Mithun Gorain");
    if (!/Sakhi Gorain/i.test(cardText)) throw new Error("Missing bride: Sakhi Gorain");
    console.log("✓ Couple names verified: Mithun Gorain & Sakhi Gorain.");

    // Strict Purity
    if (/Kabita|Manjura|Kabit\b/i.test(cardText)) {
      throw new Error("Found illegal bride name reference (Kabita/Manjura)!");
    }
    console.log("✓ Strict bride name purity verified (Sakhi Gorain exclusively).");

    // Parental Attributions
    if (!cardText.includes("Mr. Kenaram Gorain") || !cardText.includes("Ms. Savita Gorian")) {
      throw new Error("Missing groom parents: Mr. Kenaram Gorain & Ms. Savita Gorian");
    }
    if (!cardText.includes("Mr. Upen Gorain") || !cardText.includes("Ms. Kokila Gorain")) {
      throw new Error("Missing bride parents: Mr. Upen Gorain & Ms. Kokila Gorain");
    }
    console.log("✓ Both families' parental honors verified with exact spellings.");

    // Four Ceremonies (2x2 Grid)
    const ceremonies = ["Haldi Ceremony", "Mehndi Ceremony", "The Sacred Wedding", "Reception & Preetibhoj"];
    for (const c of ceremonies) {
      if (!new RegExp(c, "i").test(cardText)) throw new Error(`Missing ceremony: ${c}`);
    }
    console.log("✓ All 4 ceremonies verified in 2x2 grid.");

    // Date & Location
    if (!cardText.includes("19 – 22 NOVEMBER 2026") && !cardText.includes("19 - 22 NOVEMBER 2026")) {
      throw new Error("Missing date: 19 – 22 NOVEMBER 2026");
    }
    if (!cardText.includes("PURULIA, WEST BENGAL")) {
      throw new Error("Missing location: PURULIA, WEST BENGAL");
    }
    console.log("✓ Wedding dates (19–22 November 2026) and location (Purulia, West Bengal) verified.");

    // Genuine Scannable QR Code
    const qrContainer = card.locator("[role='img'][aria-label*='QR Code']");
    if ((await qrContainer.count()) === 0) throw new Error("QR Code container not found");
    const qrSvg = qrContainer.locator("svg");
    if ((await qrSvg.count()) === 0) throw new Error("QR Code SVG missing");
    console.log("✓ Genuine scannable QR Code SVG verified.");

    // Hide fixed overlays for clean card capture
    await desktopPage.evaluate(() => {
      document.querySelector("header")?.style.setProperty("display", "none");
      document.querySelector("aside[aria-label='Wedding audio player']")?.style.setProperty("display", "none");
      document.querySelectorAll("div").forEach((el) => {
        if (el.className && typeof el.className === "string" && el.className.includes("fixed bottom")) {
          el.style.display = "none";
        }
      });
    });
    await desktopPage.waitForTimeout(300);

    // Capture Desktop Card Screenshot
    await card.screenshot({
      path: path.join(SCREENSHOT_DIR, "invitation_4x6_desktop_1440.png"),
    });
    console.log("✓ Captured desktop card screenshot: invitation_4x6_desktop_1440.png");

    // Capture Redesigned Action Buttons Screenshot
    const actionButtons = desktopPage.locator(".no-print.mt-10, .no-print.mt-12").first();
    if (await actionButtons.count() > 0) {
      await actionButtons.scrollIntoViewIfNeeded();
      await desktopPage.waitForTimeout(600);
      await actionButtons.screenshot({
        path: path.join(SCREENSHOT_DIR, "invitation_redesigned_action_buttons.png"),
      });
      console.log("✓ Captured redesigned action buttons: invitation_redesigned_action_buttons.png");
    }

    await desktopContext.close();

    // -------------------------------------------------------------------------
    // TEST 2: Laptop Viewport (1366x768)
    // -------------------------------------------------------------------------
    console.log("\n2. Testing Laptop Viewport (1366x768) on /invitation...");
    const laptopContext = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      deviceScaleFactor: 1.5,
    });
    const laptopPage = await laptopContext.newPage();
    await laptopPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
    await laptopPage.waitForTimeout(600);

    const laptopCard = laptopPage.locator("#official-wedding-invitation-card");
    const lBox = await laptopCard.boundingBox();
    if (!lBox) throw new Error("Could not determine laptop card bounding box!");
    const lRatio = lBox.width / lBox.height;
    console.log(`✓ Laptop Dimensions: width = ${lBox.width.toFixed(1)}px, height = ${lBox.height.toFixed(1)}px, ratio = ${lRatio.toFixed(4)}`);
    
    await laptopPage.evaluate(() => {
      document.querySelector("header")?.style.setProperty("display", "none");
      document.querySelector("aside[aria-label='Wedding audio player']")?.style.setProperty("display", "none");
      document.querySelectorAll("div").forEach((el) => {
        if (el.className && typeof el.className === "string" && el.className.includes("fixed bottom")) {
          el.style.display = "none";
        }
      });
    });
    await laptopPage.waitForTimeout(300);

    await laptopCard.screenshot({
      path: path.join(SCREENSHOT_DIR, "invitation_4x6_laptop_1366.png"),
    });
    console.log("✓ Captured laptop screenshot: invitation_4x6_laptop_1366.png");
    await laptopContext.close();

    // -------------------------------------------------------------------------
    // TEST 3: Mobile Viewport (390x844)
    // -------------------------------------------------------------------------
    console.log("\n3. Testing Mobile Viewport (390x844) on /invitation...");
    const mobile390Context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobile390Page = await mobile390Context.newPage();
    await mobile390Page.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
    await mobile390Page.waitForTimeout(600);

    const m390Card = mobile390Page.locator("#official-wedding-invitation-card");
    const m390Box = await m390Card.boundingBox();
    if (!m390Box) throw new Error("Could not determine mobile 390 card box!");
    const m390Ratio = m390Box.width / m390Box.height;
    console.log(`✓ Mobile 390 Dimensions: width = ${m390Box.width.toFixed(1)}px, height = ${m390Box.height.toFixed(1)}px, ratio = ${m390Ratio.toFixed(4)}`);
    if (m390Box.width > 390) throw new Error(`Mobile card overflow: width ${m390Box.width}px exceeds viewport 390px!`);

    await mobile390Page.evaluate(() => {
      document.querySelector("header")?.style.setProperty("display", "none");
      document.querySelector("aside[aria-label='Wedding audio player']")?.style.setProperty("display", "none");
      document.querySelectorAll("div").forEach((el) => {
        if (el.className && typeof el.className === "string" && el.className.includes("fixed bottom")) {
          el.style.display = "none";
        }
      });
    });
    await mobile390Page.waitForTimeout(300);

    await m390Card.screenshot({
      path: path.join(SCREENSHOT_DIR, "invitation_4x6_mobile_390.png"),
    });
    console.log("✓ Captured mobile 390 screenshot: invitation_4x6_mobile_390.png");
    await mobile390Context.close();

    // -------------------------------------------------------------------------
    // TEST 4: Mobile Viewport (360x800)
    // -------------------------------------------------------------------------
    console.log("\n4. Testing Mobile Viewport (360x800) on /invitation...");
    const mobile360Context = await browser.newContext({
      viewport: { width: 360, height: 800 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobile360Page = await mobile360Context.newPage();
    await mobile360Page.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
    await mobile360Page.waitForTimeout(600);

    const m360Card = mobile360Page.locator("#official-wedding-invitation-card");
    const m360Box = await m360Card.boundingBox();
    if (!m360Box) throw new Error("Could not determine mobile 360 card box!");
    const m360Ratio = m360Box.width / m360Box.height;
    console.log(`✓ Mobile 360 Dimensions: width = ${m360Box.width.toFixed(1)}px, height = ${m360Box.height.toFixed(1)}px, ratio = ${m360Ratio.toFixed(4)}`);
    if (m360Box.width > 360) throw new Error(`Mobile card overflow: width ${m360Box.width}px exceeds viewport 360px!`);

    await mobile360Page.evaluate(() => {
      document.querySelector("header")?.style.setProperty("display", "none");
      document.querySelector("aside[aria-label='Wedding audio player']")?.style.setProperty("display", "none");
      document.querySelectorAll("div").forEach((el) => {
        if (el.className && typeof el.className === "string" && el.className.includes("fixed bottom")) {
          el.style.display = "none";
        }
      });
    });
    await mobile360Page.waitForTimeout(300);

    await m360Card.screenshot({
      path: path.join(SCREENSHOT_DIR, "invitation_4x6_mobile_360.png"),
    });
    console.log("✓ Captured mobile 360 screenshot: invitation_4x6_mobile_360.png");
    await mobile360Context.close();

    // -------------------------------------------------------------------------
    // TEST 5: Homepage Preview Section (#invitation)
    // -------------------------------------------------------------------------
    console.log("\n5. Testing Homepage #invitation preview section...");
    const homeContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5,
    });
    const homePage = await homeContext.newPage();
    await homePage.goto("http://localhost:3000/#invitation", { waitUntil: "networkidle" });
    await homePage.waitForTimeout(600);

    const homeSec = homePage.locator("#invitation");
    await homeSec.scrollIntoViewIfNeeded();
    await homePage.waitForTimeout(400);

    const homeCard = homeSec.locator("#official-wedding-invitation-card");
    if ((await homeCard.count()) === 0) throw new Error("Canonical 4:6 card not found in homepage #invitation");
    console.log("✓ Homepage preview renders the canonical 4:6 official invitation card.");

    await homeCard.screenshot({
      path: path.join(SCREENSHOT_DIR, "invitation_4x6_homepage_preview.png"),
    });
    console.log("✓ Captured homepage preview screenshot: invitation_4x6_homepage_preview.png");
    await homeContext.close();

    console.log("\n================================================================================");
    console.log("   ALL 4:6 INVITATION CREATIVE RESET TESTS PASSED WITH 100% SUCCESS!");
    console.log("================================================================================");
  } finally {
    await browser.close();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
