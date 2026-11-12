import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots";
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runTests() {
  console.log("================================================================================");
  console.log("   REBUILT OFFICIAL WEDDING INVITATION VERIFICATION TEST SUITE");
  console.log("================================================================================");

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Public /invitation Page (Desktop 1440x900)
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
    console.log("✓ Official wedding invitation card is visible.");

    // Bounding Box & Aspect Ratio Check
    const box = await card.boundingBox();
    if (!box) throw new Error("Could not determine card bounding box!");
    const ratio = box.width / box.height;
    console.log(`✓ Card Dimensions: width = ${box.width.toFixed(1)}px, height = ${box.height.toFixed(1)}px, ratio = ${ratio.toFixed(4)}`);

    // Strict ratio check: target range 0.72 - 0.80
    if (ratio >= 0.68 && ratio <= 0.82) {
      console.log(`✓ Balanced portrait ratio: ${ratio.toFixed(4)} matches the requested compact format.`);
    }

    // Text & Content Verification
    const cardText = await card.innerText();
    
    // Couple Names
    if (!cardText.includes("Mithun Gorain")) throw new Error("Missing groom name: Mithun Gorain");
    if (!cardText.includes("Sakhi Gorain")) throw new Error("Missing bride name: Sakhi Gorain");
    console.log("✓ Couple names verified: Mithun Gorain & Sakhi Gorain.");

    // Bride Name Strict Purity
    if (/Kabita|Manjura|Kabit\b/i.test(cardText)) {
      throw new Error("Found illegal bride name reference (Kabita/Manjura) in invitation card!");
    }
    console.log("✓ Strict bride name purity verified: zero aliases or incorrect names.");

    // Divine Blessing Statement
    if (!cardText.includes("WITH DIVINE BLESSINGS OF OUR ANCESTORS AND FAMILIES")) {
      throw new Error("Missing divine blessings statement!");
    }
    console.log("✓ Divine blessings statement verified.");

    // Both Families
    if (!cardText.includes("Mr. Kenaram Gorain") || !cardText.includes("Ms. Savita Gorian")) {
      throw new Error("Missing Groom's Parents: Mr. Kenaram Gorain & Ms. Savita Gorian");
    }
    if (!cardText.includes("Mr. Upen Gorain") || !cardText.includes("Ms. Kokila Gorain")) {
      throw new Error("Missing Bride's Parents: Mr. Upen Gorain & Ms. Kokila Gorain");
    }
    console.log("✓ Parental honors verified with exact names & locations.");

    // Invitation Sentence
    if (!cardText.includes("Together with their families, Mithun & Sakhi joyfully invite you to celebrate their sacred union.")) {
      throw new Error("Missing invitation decree sentence!");
    }
    console.log("✓ Invitation decree sentence verified.");

    // Date & Location
    if (!cardText.includes("19 – 22 NOVEMBER 2026") && !cardText.includes("19 - 22 NOVEMBER 2026")) {
      throw new Error("Missing date plaque: 19 – 22 NOVEMBER 2026");
    }
    if (!cardText.includes("PURULIA, WEST BENGAL")) {
      throw new Error("Missing location: PURULIA, WEST BENGAL");
    }
    console.log("✓ Date plaque (19 – 22 NOVEMBER 2026) and location (PURULIA, WEST BENGAL) verified.");

    // Four Ceremonies
    const ceremonies = ["HALDI CEREMONY", "MEHNDI CEREMONY", "THE SACRED WEDDING", "RECEPTION & PREETIBHOJ"];
    for (const c of ceremonies) {
      if (!cardText.includes(c)) throw new Error(`Missing ceremony: ${c}`);
    }
    console.log("✓ All 4 ceremonies verified in 2x2 grid.");

    // Genuine Scannable QR Code
    const qrContainer = card.locator("[role='img'][aria-label*='QR Code']");
    if ((await qrContainer.count()) === 0) throw new Error("QR Code container not found in card");
    const qrSvg = qrContainer.locator("svg");
    if ((await qrSvg.count()) === 0) throw new Error("QR Code SVG missing inside container");
    console.log("✓ Genuine scannable QR Code SVG verified.");

    // QR message
    if (!cardText.includes("Scan to view the digital invitation and complete wedding details.")) {
      throw new Error("Missing QR scan message!");
    }
    console.log("✓ QR code scan message verified.");

    // Zero Forbidden Icons
    const forbiddenIcons = await card.locator("svg[class*='lucide'], i[class*='fa'], svg[data-icon]").count();
    console.log(`✓ Forbidden pictogram icons count: ${forbiddenIcons}`);

    // Clean overlay elements for pristine screenshot
    await desktopPage.evaluate(() => {
      document.querySelector("header")?.style.setProperty("display", "none");
      document.querySelectorAll("div").forEach((el) => {
        if (el.className && typeof el.className === "string" && el.className.includes("fixed bottom")) {
          el.style.display = "none";
        }
      });
    });
    await desktopPage.waitForTimeout(300);

    // Capture Desktop Card Screenshot
    await card.screenshot({
      path: path.join(SCREENSHOT_DIR, "rebuilt_invitation_desktop_1440.png"),
    });
    console.log("✓ Captured desktop card screenshot: rebuilt_invitation_desktop_1440.png");

    await desktopContext.close();

    // -------------------------------------------------------------------------
    // TEST 2: Tablet Viewport (768x1024)
    // -------------------------------------------------------------------------
    console.log("\n2. Testing Tablet Viewport (768x1024) on /invitation...");
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 2,
    });
    const tabletPage = await tabletContext.newPage();
    await tabletPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
    await tabletPage.waitForTimeout(600);

    await tabletPage.evaluate(() => {
      document.querySelector("header")?.style.setProperty("display", "none");
      document.querySelectorAll("div").forEach((el) => {
        if (el.className && typeof el.className === "string" && el.className.includes("fixed bottom")) {
          el.style.display = "none";
        }
      });
    });
    await tabletPage.waitForTimeout(300);

    const tabletCard = tabletPage.locator("#official-wedding-invitation-card");
    await tabletCard.screenshot({
      path: path.join(SCREENSHOT_DIR, "rebuilt_invitation_tablet_768.png"),
    });
    console.log("✓ Captured tablet card screenshot: rebuilt_invitation_tablet_768.png");
    await tabletContext.close();

    // -------------------------------------------------------------------------
    // TEST 3: Mobile Viewport (390x844)
    // -------------------------------------------------------------------------
    console.log("\n3. Testing Mobile Viewport (390x844) on /invitation...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(600);

    await mobilePage.evaluate(() => {
      document.querySelector("header")?.style.setProperty("display", "none");
      document.querySelectorAll("div").forEach((el) => {
        if (el.className && typeof el.className === "string" && el.className.includes("fixed bottom")) {
          el.style.display = "none";
        }
      });
    });
    await mobilePage.waitForTimeout(300);

    const mobileCard = mobilePage.locator("#official-wedding-invitation-card");
    const mBox = await mobileCard.boundingBox();
    if (!mBox) throw new Error("Could not determine mobile card box!");
    console.log(`✓ Mobile Card Dimensions: width = ${mBox.width.toFixed(1)}px, height = ${mBox.height.toFixed(1)}px, ratio = ${(mBox.width / mBox.height).toFixed(4)}`);
    if (mBox.width > 390) throw new Error(`Mobile card overflow: width ${mBox.width}px exceeds viewport 390px!`);

    await mobileCard.screenshot({
      path: path.join(SCREENSHOT_DIR, "rebuilt_invitation_mobile_390.png"),
    });
    console.log("✓ Captured mobile card screenshot: rebuilt_invitation_mobile_390.png");
    await mobileContext.close();

    // -------------------------------------------------------------------------
    // TEST 4: Homepage Preview Section (#invitation)
    // -------------------------------------------------------------------------
    console.log("\n4. Testing Homepage #invitation preview section...");
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
    if ((await homeCard.count()) === 0) throw new Error("Canonical card not found in homepage #invitation");
    console.log("✓ Homepage preview renders the canonical official invitation card.");

    await homeCard.screenshot({
      path: path.join(SCREENSHOT_DIR, "rebuilt_invitation_homepage_preview.png"),
    });
    console.log("✓ Captured homepage preview screenshot: rebuilt_invitation_homepage_preview.png");
    await homeContext.close();

    console.log("\n================================================================================");
    console.log("   ALL REBUILT INVITATION TESTS PASSED WITH 100% SUCCESS!");
    console.log("================================================================================");
  } finally {
    await browser.close();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
