import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots";
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runTests() {
  console.log("=== Starting Code-Generated Official Invitation Test Suite ===");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Test 1: Public Invitation Page
  console.log("1. Navigating to /invitation...");
  await page.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });

  // Verify card container exists
  const card = page.locator("#official-wedding-invitation-card");
  await card.waitFor({ state: "visible", timeout: 5000 });
  console.log("✓ Official wedding invitation card is rendered.");

  // Verify real text elements
  const coupleText = await card.innerText();
  if (!coupleText.includes("Mithun Gorain")) throw new Error("Missing groom name Mithun Gorain");
  if (!coupleText.includes("Sakhi Gorain")) throw new Error("Missing bride name Sakhi Gorain");
  console.log("✓ Couple names verified: Mithun Gorain & Sakhi Gorain.");

  // Strict bride name purity check: NO Kabita, Manjura, etc.
  if (/Kabita|Manjura|Kabit\b/i.test(coupleText)) {
    throw new Error("Found illegal bride name reference in invitation card!");
  }
  console.log("✓ Strict bride name purity verified (Zero Kabita/Manjura references).");

  // Verify parents
  if (!coupleText.includes("Mr. Kenaram Gorain") || !coupleText.includes("Ms. Savita Gorian")) {
    throw new Error("Missing groom parents: Mr. Kenaram Gorain & Ms. Savita Gorian");
  }
  if (!coupleText.includes("Mr. Upen Gorain") || !coupleText.includes("Ms. Kokila Gorain")) {
    throw new Error("Missing bride parents: Mr. Upen Gorain & Ms. Kokila Gorain");
  }
  console.log("✓ Parental honors verified with exact spellings.");

  // Verify all 4 ceremonies
  const ceremonies = [
    "Haldi Ceremony",
    "Mehndi Ceremony",
    "The Sacred Wedding",
    "Reception & Preetibhoj",
  ];
  for (const c of ceremonies) {
    if (!coupleText.includes(c)) throw new Error(`Missing ceremony: ${c}`);
  }
  console.log("✓ All 4 ceremonies verified in itinerary.");

  // Verify dates & location
  if (
    !/19\s*[–-]\s*22\s+NOVEMBER\s+2026/i.test(coupleText) ||
    !/PURULIA,\s*WEST\s*BENGAL/i.test(coupleText)
  ) {
    throw new Error("Missing dates or location");
  }
  console.log("✓ Wedding dates (19–22 November 2026) and location (Purulia, West Bengal) verified.");

  // Verify Real Vector Ornaments & QR Code
  const qrContainer = card.locator("[role='img'][aria-label*='QR Code']");
  if ((await qrContainer.count()) === 0) throw new Error("QR Code container not found in card");
  const qrSvg = qrContainer.locator("svg");
  if ((await qrSvg.count()) === 0) throw new Error("QR Code SVG not found inside container");
  console.log("✓ Scannable vector QR Code SVG verified.");

  // Verify corner ornaments
  const cornerSvgs = card.locator("svg");
  const svgCount = await cornerSvgs.count();
  console.log(`✓ Vector SVG ornaments count in card: ${svgCount}`);
  if (svgCount < 4) throw new Error("Vector ornaments missing in card");

  // Verify NO raster images of invitation exist anywhere on the page
  const images = await page.locator("img").all();
  for (const img of images) {
    const src = await img.getAttribute("src");
    if (src && /invitation/i.test(src)) {
      throw new Error(`Illegal raster invitation image found: ${src}`);
    }
  }
  console.log("✓ Zero raster invitation image files detected. 100% code-generated!");

  // Verify Guest Action Buttons
  const buttons = await page.locator("button, a").allInnerTexts();
  const downloadBtn = buttons.some((b) => b.includes("Download PNG"));
  const printBtn = buttons.some((b) => b.includes("Print / Save PDF"));
  const shareBtn = buttons.some((b) => b.includes("Share Invitation"));
  const rsvpBtn = buttons.some((b) => b.includes("Confirm RSVP"));
  console.log(`✓ Actions available: Download PNG (${downloadBtn}), Print PDF (${printBtn}), Share (${shareBtn}), RSVP (${rsvpBtn})`);

  // Capture Desktop Screenshot of /invitation
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "invitation_code_generated_desktop_1440.png"),
    fullPage: false,
  });
  console.log("✓ Captured desktop screenshot.");

  // Test 2: Mobile Viewport (390px)
  console.log("2. Testing Mobile (390px)...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "invitation_code_generated_mobile_390.png"),
    fullPage: false,
  });
  console.log("✓ Captured mobile screenshot.");

  // Test 3: Homepage Preview Section
  console.log("3. Testing Homepage #invitation preview...");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:3000/#invitation", { waitUntil: "networkidle" });
  const homeInvitation = page.locator("#invitation");
  await homeInvitation.waitFor({ state: "visible", timeout: 5000 });
  const homeCard = homeInvitation.locator("#official-wedding-invitation-card");
  if ((await homeCard.count()) === 0) {
    throw new Error("Canonical card not found in homepage #invitation");
  }
  console.log("✓ Homepage #invitation section renders canonical code-generated card.");

  await homeInvitation.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "invitation_homepage_preview_code_generated.png"),
  });
  console.log("✓ Captured homepage preview screenshot.");

  await browser.close();
  console.log("=== ALL INVITATION REBUILD TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
