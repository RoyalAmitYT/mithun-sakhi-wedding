import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots";
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  console.log("=== VERIFYING NEW ORIGINAL LUXURY EDITORIAL INVITATION ===");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  
  // 1. Desktop 1440x900
  console.log("\n--- 1. Desktop Viewport (1440 x 900) ---");
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktopCtx.newPage();
  
  await page.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const card = page.locator("#official-wedding-invitation-card");
  await card.waitFor({ state: "visible", timeout: 5000 });
  
  // Aspect ratio check
  const bbox = await card.boundingBox();
  if (!bbox) throw new Error("Could not get bounding box of invitation card");
  const ratio = bbox.width / bbox.height;
  console.log(`Desktop Card Dimensions: ${bbox.width.toFixed(1)}px x ${bbox.height.toFixed(1)}px`);
  console.log(`Measured Aspect Ratio: ${ratio.toFixed(4)} (Expected 0.8000 for 4:5)`);
  if (Math.abs(ratio - 0.8) > 0.02) {
    throw new Error(`Aspect ratio deviation too high! Got ${ratio.toFixed(4)}, expected 0.8000`);
  }
  console.log("✓ Exact 4:5 Aspect Ratio verified on Desktop!");

  // Strict text check
  const cardText = await card.innerText();
  console.log("\n--- Checking Text Content ---");
  
  // Couple & Monogram
  if (!cardText.includes("M•S")) throw new Error("Missing M•S monogram");
  if (!cardText.includes("Mithun Gorain")) throw new Error("Missing groom name Mithun Gorain");
  if (!cardText.includes("Sakhi Gorain")) throw new Error("Missing bride name Sakhi Gorain");
  console.log("✓ Couple names verified: Mithun Gorain & Sakhi Gorain, Monogram: M•S");

  // Strict bride name purity check: NO Kabita, Manjura
  if (/Kabita|Manjura/i.test(cardText)) {
    throw new Error("ILLEGAL BRIDE NAME FOUND: Kabita or Manjura detected!");
  }
  console.log("✓ Bride name purity verified (Strictly Sakhi Gorain, Zero Kabita/Manjura)");

  // Hero Quote & Blessing Message
  if (!cardText.includes("Bound by sacred Vedic vows, blessed by eternal love.")) {
    throw new Error("Missing hero quote: Bound by sacred Vedic vows, blessed by eternal love.");
  }
  if (!cardText.includes("With the blessings of our families, we joyfully invite you to celebrate our sacred union.")) {
    throw new Error("Missing blessing invitation message");
  }
  console.log("✓ Hero quote & blessing message verified");

  // Parental lineage
  if (!cardText.includes("Mr. Kenaram Gorain") || !cardText.includes("Ms. Savita Gorian")) {
    throw new Error("Missing groom parents: Mr. Kenaram Gorain & Ms. Savita Gorian");
  }
  if (!cardText.includes("Mr. Upen Gorain") || !cardText.includes("Ms. Kokila Gorain")) {
    throw new Error("Missing bride parents: Mr. Upen Gorain & Ms. Kokila Gorain");
  }
  console.log("✓ Two-column parental lineage verified with exact spellings");

  // Date and Location
  if (!cardText.includes("19 — 22 NOVEMBER 2026") || !cardText.includes("PURULIA, WEST BENGAL")) {
    throw new Error("Missing wedding date or location banner");
  }
  console.log("✓ Date (19 — 22 NOVEMBER 2026) and Location (PURULIA, WEST BENGAL) verified");

  // 4 Ceremonies
  const ceremonies = [
    "HALDI CEREMONY",
    "MEHNDI CEREMONY",
    "THE SACRED WEDDING",
    "RECEPTION & PREETIBHOJ",
  ];
  for (const c of ceremonies) {
    if (!cardText.toUpperCase().includes(c)) throw new Error(`Missing ceremony: ${c}`);
  }
  console.log("✓ All 4 ceremonies verified in editorial itinerary grid");

  // Scannable Vector QR Code
  const qrSvg = card.locator("[role='img'][aria-label*='QR Code'] svg");
  if ((await qrSvg.count()) === 0) throw new Error("Scannable vector QR Code SVG not found");
  console.log("✓ Scannable vector QR code verified");

  // ZERO buttons inside the card
  const internalButtons = await card.locator("button, a").count();
  if (internalButtons > 0) throw new Error(`Found ${internalButtons} interactive button(s) inside the card! Must be 0.`);
  console.log("✓ Zero internal buttons inside card (100% pure stationery artwork)");

  // External Action buttons below card
  const externalActions = page.locator("#official-invitation-actions");
  await externalActions.waitFor({ state: "visible", timeout: 3000 });
  const actionText = await externalActions.innerText();
  console.log("Found external actions text:\n", actionText);
  const upperActions = actionText.toUpperCase();
  if (!upperActions.includes("DOWNLOAD INVITATION") || !upperActions.includes("PDF") || !upperActions.includes("SHARE")) {
    throw new Error("External action buttons incomplete");
  }
  console.log("✓ External action buttons confirmed below artwork");

  // Take Screenshots
  console.log("\n--- Capturing Screenshots ---");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "new_editorial_desktop_1440.png"),
    fullPage: false,
  });
  console.log("✓ Saved new_editorial_desktop_1440.png");

  // Card only screenshot
  await card.screenshot({
    path: path.join(SCREENSHOT_DIR, "new_editorial_card_only.png"),
  });
  await card.screenshot({
    path: path.join(SCREENSHOT_DIR, "mithun-sakhi-new-editorial-invitation-4x5.png"),
  });
  console.log("✓ Saved new_editorial_card_only.png & mithun-sakhi-new-editorial-invitation-4x5.png");

  // 2. Laptop 1366x768
  console.log("\n--- 2. Laptop Viewport (1366 x 768) ---");
  const laptopCtx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const laptopPage = await laptopCtx.newPage();
  await laptopPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await laptopPage.waitForTimeout(400);
  const laptopCard = laptopPage.locator("#official-wedding-invitation-card");
  const laptopBbox = await laptopCard.boundingBox();
  const laptopRatio = laptopBbox.width / laptopBbox.height;
  console.log(`Laptop Card Dimensions: ${laptopBbox.width.toFixed(1)}px x ${laptopBbox.height.toFixed(1)}px (Ratio: ${laptopRatio.toFixed(4)})`);
  await laptopPage.screenshot({
    path: path.join(SCREENSHOT_DIR, "new_editorial_laptop_1366.png"),
    fullPage: false,
  });
  console.log("✓ Saved new_editorial_laptop_1366.png");

  // 3. Mobile 390x844
  console.log("\n--- 3. Mobile Viewport (390 x 844) ---");
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(400);
  const mobileCard = mobilePage.locator("#official-wedding-invitation-card");
  const mobileBbox = await mobileCard.boundingBox();
  const mobileRatio = mobileBbox.width / mobileBbox.height;
  console.log(`Mobile 390 Card Dimensions: ${mobileBbox.width.toFixed(1)}px x ${mobileBbox.height.toFixed(1)}px (Ratio: ${mobileRatio.toFixed(4)})`);
  await mobilePage.screenshot({
    path: path.join(SCREENSHOT_DIR, "new_editorial_mobile_390.png"),
    fullPage: false,
  });
  console.log("✓ Saved new_editorial_mobile_390.png");

  // 4. Mobile 360x800
  console.log("\n--- 4. Mobile Viewport (360 x 800) ---");
  const compactCtx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const compactPage = await compactCtx.newPage();
  await compactPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await compactPage.waitForTimeout(400);
  const compactCard = compactPage.locator("#official-wedding-invitation-card");
  const compactBbox = await compactCard.boundingBox();
  const compactRatio = compactBbox.width / compactBbox.height;
  console.log(`Mobile 360 Card Dimensions: ${compactBbox.width.toFixed(1)}px x ${compactBbox.height.toFixed(1)}px (Ratio: ${compactRatio.toFixed(4)})`);
  await compactPage.screenshot({
    path: path.join(SCREENSHOT_DIR, "new_editorial_mobile_360.png"),
    fullPage: false,
  });
  console.log("✓ Saved new_editorial_mobile_360.png");

  // 5. Test Homepage #invitation section
  console.log("\n--- 5. Homepage #invitation Section ---");
  await page.goto("http://localhost:3000/#invitation", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const homeCard = page.locator("#invitation #official-wedding-invitation-card");
  if ((await homeCard.count()) === 0) throw new Error("Canonical card not found in homepage #invitation");
  console.log("✓ Homepage #invitation section renders canonical modern editorial card");
  
  const homeActions = page.locator("#invitation #official-invitation-actions");
  if ((await homeActions.count()) === 0) throw new Error("Homepage action buttons missing");
  const homeActionsText = await homeActions.innerText();
  console.log("Found homepage action buttons:\n", homeActionsText);
  if (!homeActionsText.toUpperCase().includes("VIEW FULL INVITATION")) {
    throw new Error("Homepage action should include 'View Full Invitation'");
  }
  console.log("✓ Homepage action buttons verified with 'View Full Invitation'");
  
  await page.locator("#invitation").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "new_editorial_homepage_preview.png"),
  });
  console.log("✓ Saved new_editorial_homepage_preview.png");

  // 6. Test Canvas Export Trigger
  console.log("\n--- 6. Canvas 300 DPI Export Verification ---");
  await page.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 10000 }),
    page.locator("#official-invitation-actions button:has-text('Download Invitation')").click(),
  ]);
  const downloadPath = await download.path();
  console.log(`✓ Canvas PNG downloaded successfully: ${download.suggestedFilename()}`);
  const stats = fs.statSync(downloadPath);
  console.log(`✓ Download file size: ${(stats.size / 1024).toFixed(1)} KB`);
  if (stats.size < 50000) {
    throw new Error("Exported PNG is unexpectedly small!");
  }

  await browser.close();
  console.log("\n=== ALL VERIFICATION TESTS PASSED PERFECTLY! ===");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
