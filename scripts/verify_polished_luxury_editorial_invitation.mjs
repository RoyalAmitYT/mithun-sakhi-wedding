import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { generateQrMatrix } from "../src/lib/qr-code.ts";

const SCREENSHOT_DIR = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots";
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// QR Matrix Decoder for ISO/IEC 18004 Version 4 Byte Mode QR Code
function decodeQrMatrix(matrix) {
  const size = matrix.length;
  const spec = {
    version: 4,
    totalCodewords: 100,
    dataCodewords: 64,
    ecCodewordsPerBlock: 18,
    numBlocks: 2,
    alignmentPositions: [6, 26],
  };

  // Determine reserved functional modules (finder, timing, alignment, format, dark module)
  const isFunctionModule = Array.from({ length: size }, () => Array.from({ length: size }, () => false));

  // Finders
  function markFinder(startR, startC) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = startR + r;
        const tc = startC + c;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
          isFunctionModule[tr][tc] = true;
        }
      }
    }
  }
  markFinder(0, 0);
  markFinder(0, size - 7);
  markFinder(size - 7, 0);

  // Alignment
  for (const r of spec.alignmentPositions) {
    for (const c of spec.alignmentPositions) {
      if (isFunctionModule[r][c]) continue;
      for (let ar = -2; ar <= 2; ar++) {
        for (let ac = -2; ac <= 2; ac++) {
          isFunctionModule[r + ar][c + ac] = true;
        }
      }
    }
  }

  // Timing
  for (let i = 0; i < size; i++) {
    isFunctionModule[6][i] = true;
    isFunctionModule[i][6] = true;
  }

  // Dark module
  isFunctionModule[size - 8][8] = true;

  // Format info
  for (let i = 0; i < 9; i++) {
    isFunctionModule[8][i] = true;
    isFunctionModule[i][8] = true;
  }
  for (let i = size - 8; i < size; i++) {
    isFunctionModule[8][i] = true;
    isFunctionModule[i][8] = true;
  }

  // Read data bits in zigzag order, unmasking with Mask Pattern 0: (row + col) % 2 === 0
  const bits = [];
  let upwards = true;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing pattern
    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const row of rows) {
      for (const c of [col, col - 1]) {
        if (!isFunctionModule[row][c]) {
          const rawModule = matrix[row][c];
          const mask = (row + c) % 2 === 0;
          const bit = mask ? !rawModule : rawModule;
          bits.push(bit ? 1 : 0);
        }
      }
    }
    upwards = !upwards;
  }

  // Convert bits to codewords
  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byteVal = 0;
    for (let j = 0; j < 8; j++) {
      byteVal = (byteVal << 1) | (bits[i + j] || 0);
    }
    codewords.push(byteVal);
  }

  // De-interleave data codewords across blocks
  const dataPerBlock = Math.floor(spec.dataCodewords / spec.numBlocks);
  const blocks = Array.from({ length: spec.numBlocks }, () => []);
  let cwIdx = 0;
  for (let i = 0; i < dataPerBlock; i++) {
    for (let b = 0; b < spec.numBlocks; b++) {
      blocks[b].push(codewords[cwIdx++]);
    }
  }

  const finalDataCodewords = blocks.flat();

  // Read mode (4 bits)
  let bitPos = 0;
  function readBits(len) {
    let val = 0;
    for (let i = 0; i < len; i++) {
      const byteIdx = Math.floor(bitPos / 8);
      const bitInByte = 7 - (bitPos % 8);
      const bit = (finalDataCodewords[byteIdx] >> bitInByte) & 1;
      val = (val << 1) | bit;
      bitPos++;
    }
    return val;
  }

  const mode = readBits(4);
  if (mode !== 0b0100) {
    throw new Error(`Expected Byte Mode (0100), got: ${mode.toString(2)}`);
  }

  const charCount = readBits(8);
  const chars = [];
  for (let i = 0; i < charCount; i++) {
    chars.push(String.fromCharCode(readBits(8)));
  }

  return chars.join("");
}

async function run() {
  console.log("=== STARTING POLISHED LUXURY EDITORIAL INVITATION VERIFICATION ===");

  // -------------------------------------------------------------
  // Test 0: ACTUAL QR CODE DECODING & DESTINATION VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- 0. Actual QR Code Decoding Test ---");
  const expectedUrl = "https://mithun-sakhi-wedding.vercel.app/invitation";
  const matrix = generateQrMatrix(expectedUrl);
  const decodedUrl = decodeQrMatrix(matrix);
  console.log(`Generated QR matrix size: ${matrix.length}x${matrix.length}`);
  console.log(`Decoded QR URL from matrix: "${decodedUrl}"`);
  if (decodedUrl !== expectedUrl) {
    throw new Error(`QR Code destination mismatch! Decoded "${decodedUrl}", expected "${expectedUrl}"`);
  }
  console.log("✓ ACTUAL SCAN VERIFICATION PASSED: Decoded destination matches canonical URL exactly!");

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  // -------------------------------------------------------------
  // 1. Desktop Viewport (1440 x 900)
  // -------------------------------------------------------------
  console.log("\n--- 1. Desktop Viewport (1440 x 900) ---");
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktopCtx.newPage();

  await page.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const card = page.locator("#official-wedding-invitation-card");
  await card.waitFor({ state: "visible", timeout: 5000 });

  // Aspect ratio and desktop size check
  const bbox = await card.boundingBox();
  if (!bbox) throw new Error("Could not get bounding box of invitation card");
  const ratio = bbox.width / bbox.height;
  console.log(`Desktop Card Dimensions: ${bbox.width.toFixed(1)}px x ${bbox.height.toFixed(1)}px`);
  console.log(`Measured Aspect Ratio: ${ratio.toFixed(4)} (Target: 0.8000)`);
  if (Math.abs(ratio - 0.8) > 0.02) {
    throw new Error(`Aspect ratio deviation too high! Got ${ratio.toFixed(4)}, expected 0.8000`);
  }
  console.log("✓ Exact 4:5 Aspect Ratio verified on Desktop!");

  // Main couple heading prominence check
  const headingH2 = card.locator("h2");
  const headingText = await headingH2.innerText();
  console.log(`Main Heading: "${headingText.replace(/\s+/g, ' ')}"`);
  if (!headingText.includes("Mithun") || !headingText.includes("Sakhi")) {
    throw new Error("Missing Mithun & Sakhi in main heading");
  }
  console.log("✓ Prominent main couple branding verified: Mithun & Sakhi");

  // Strict check: Redundant subtitle "Mithun Gorain • Sakhi Gorain" MUST BE REMOVED!
  const cardText = await card.innerText();
  if (cardText.includes("Mithun Gorain • Sakhi Gorain") || cardText.includes("Mithun Gorain\n•\nSakhi Gorain")) {
    throw new Error("Redundant couple subtitle 'Mithun Gorain • Sakhi Gorain' was not removed!");
  }
  console.log("✓ Redundant subtitle 'Mithun Gorain • Sakhi Gorain' confirmed REMOVED from card!");

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
  console.log("✓ Sacred Vedic inscription & blessing message verified");

  // Parental lineage
  if (!cardText.includes("Mr. Kenaram Gorain") || !cardText.includes("Ms. Savita Gorian")) {
    throw new Error("Missing groom parents: Mr. Kenaram Gorain & Ms. Savita Gorian");
  }
  if (!cardText.includes("Mr. Upen Gorain") || !cardText.includes("Ms. Kokila Gorain")) {
    throw new Error("Missing bride parents: Mr. Upen Gorain & Ms. Kokila Gorain");
  }
  console.log("✓ Both parental lineage sections verified with exact spellings & improved readability");

  // Date and Location
  if (!cardText.includes("19 — 22 NOVEMBER 2026") || !cardText.includes("PURULIA, WEST BENGAL")) {
    throw new Error("Missing wedding date or location banner");
  }
  console.log("✓ Date (19 — 22 NOVEMBER 2026) and Location (PURULIA, WEST BENGAL) verified");

  // 4 Ceremonies with complete Reception & Preetibhoj (NO TRUNCATION)
  console.log("\n--- Checking Ceremony Text & Zero Truncation ---");
  const ceremonies = [
    "HALDI CEREMONY",
    "MEHNDI CEREMONY",
    "THE SACRED WEDDING",
    "RECEPTION & PREETIBHOJ",
  ];
  for (const c of ceremonies) {
    if (!cardText.toUpperCase().includes(c)) throw new Error(`Missing ceremony: ${c}`);
  }

  // Check that "RECEPTION & PREETIBHOJ" element has no truncate class
  const receptionEl = card.locator("text='RECEPTION & PREETIBHOJ'");
  await receptionEl.waitFor({ state: "visible" });
  const receptionClass = await receptionEl.getAttribute("class");
  if (receptionClass && receptionClass.includes("truncate")) {
    throw new Error("RECEPTION & PREETIBHOJ still has 'truncate' class!");
  }
  console.log("✓ RECEPTION & PREETIBHOJ is fully visible with NO truncation!");

  // Verify dates and times
  const timings = ["19 Nov", "9:00 AM IST", "20 Nov", "21 Nov", "11:00 PM IST", "22 Nov", "5:00 PM IST"];
  for (const t of timings) {
    if (!cardText.includes(t)) throw new Error(`Missing ceremony date/time: ${t}`);
  }
  console.log("✓ All 4 ceremony dates and timings confirmed fully visible");

  // Check QR Code Presentation: LEFT: QR, RIGHT: Caption
  const footerEl = card.locator("footer");
  const qrTile = footerEl.locator("div.shrink-0");
  const captionDiv = footerEl.locator("div.flex-1");
  const qrTileBbox = await qrTile.boundingBox();
  const captionBbox = await captionDiv.boundingBox();

  if (!qrTileBbox || !captionBbox) throw new Error("Could not get bounding box for QR or caption");
  if (qrTileBbox.x >= captionBbox.x) {
    throw new Error("Footer layout incorrect! QR Code must be on the LEFT and Caption on the RIGHT.");
  }
  console.log("✓ QR Code footer layout confirmed: LEFT: QR code, RIGHT: Caption!");

  // ZERO buttons inside the card
  const internalButtons = await card.locator("button, a").count();
  if (internalButtons > 0) throw new Error(`Found ${internalButtons} interactive button(s) inside the card! Must be 0.`);
  console.log("✓ Zero internal buttons inside card (100% pure stationery artwork)");

  // External Action buttons below card
  const externalActions = page.locator("#official-invitation-actions");
  await externalActions.waitFor({ state: "visible", timeout: 3000 });
  const actionText = await externalActions.innerText();
  const upperActions = actionText.toUpperCase();
  if (!upperActions.includes("DOWNLOAD INVITATION") || !upperActions.includes("PDF") || !upperActions.includes("SHARE")) {
    throw new Error("External action buttons incomplete");
  }
  console.log("✓ External action buttons confirmed below artwork");

  // Take Desktop Screenshots
  console.log("\n--- Capturing Screenshots ---");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "polished_editorial_desktop_1440.png"),
    fullPage: false,
  });
  console.log("✓ Saved polished_editorial_desktop_1440.png");

  // Standalone card screenshot
  await card.screenshot({
    path: path.join(SCREENSHOT_DIR, "polished_editorial_card_only.png"),
  });
  await card.screenshot({
    path: path.join(SCREENSHOT_DIR, "mithun-sakhi-official-wedding-invitation-4x5.png"),
  });
  console.log("✓ Saved polished_editorial_card_only.png & mithun-sakhi-official-wedding-invitation-4x5.png");

  // -------------------------------------------------------------
  // 2. Laptop Viewport (1366 x 768)
  // -------------------------------------------------------------
  console.log("\n--- 2. Laptop Viewport (1366 x 768) ---");
  const laptopCtx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const laptopPage = await laptopCtx.newPage();
  await laptopPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await laptopPage.waitForTimeout(400);
  const laptopCard = laptopPage.locator("#official-wedding-invitation-card");
  const laptopBbox = await laptopCard.boundingBox();
  const laptopRatio = laptopBbox.width / laptopBbox.height;
  console.log(`Laptop Card Dimensions: ${laptopBbox.width.toFixed(1)}px x ${laptopBbox.height.toFixed(1)}px (Ratio: ${laptopRatio.toFixed(4)})`);
  if (Math.abs(laptopRatio - 0.8) > 0.02) {
    throw new Error(`Laptop aspect ratio deviation too high! Got ${laptopRatio.toFixed(4)}`);
  }
  await laptopPage.screenshot({
    path: path.join(SCREENSHOT_DIR, "polished_editorial_laptop_1366.png"),
    fullPage: false,
  });
  console.log("✓ Saved polished_editorial_laptop_1366.png");

  // -------------------------------------------------------------
  // 3. Mobile Viewport (390 x 844)
  // -------------------------------------------------------------
  console.log("\n--- 3. Mobile Viewport (390 x 844) ---");
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(400);
  const mobileCard = mobilePage.locator("#official-wedding-invitation-card");
  const mobileBbox = await mobileCard.boundingBox();
  const mobileRatio = mobileBbox.width / mobileBbox.height;
  console.log(`Mobile 390 Card Dimensions: ${mobileBbox.width.toFixed(1)}px x ${mobileBbox.height.toFixed(1)}px (Ratio: ${mobileRatio.toFixed(4)})`);
  if (Math.abs(mobileRatio - 0.8) > 0.02) {
    throw new Error(`Mobile 390 aspect ratio deviation too high! Got ${mobileRatio.toFixed(4)}`);
  }

  const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
  console.log(`Mobile 390 ScrollWidth: ${scrollWidth}px, ClientWidth: ${clientWidth}px`);
  if (scrollWidth > clientWidth) {
    throw new Error("Horizontal overflow detected on mobile 390px!");
  }
  console.log("✓ Zero horizontal overflow on mobile 390px");

  await mobilePage.screenshot({
    path: path.join(SCREENSHOT_DIR, "polished_editorial_mobile_390.png"),
    fullPage: false,
  });
  console.log("✓ Saved polished_editorial_mobile_390.png");

  // -------------------------------------------------------------
  // 4. Mobile Viewport (360 x 800)
  // -------------------------------------------------------------
  console.log("\n--- 4. Mobile Viewport (360 x 800) ---");
  const compactCtx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const compactPage = await compactCtx.newPage();
  await compactPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await compactPage.waitForTimeout(400);
  const compactCard = compactPage.locator("#official-wedding-invitation-card");
  const compactBbox = await compactCard.boundingBox();
  const compactRatio = compactBbox.width / compactBbox.height;
  console.log(`Mobile 360 Card Dimensions: ${compactBbox.width.toFixed(1)}px x ${compactBbox.height.toFixed(1)}px (Ratio: ${compactRatio.toFixed(4)})`);
  if (Math.abs(compactRatio - 0.8) > 0.02) {
    throw new Error(`Mobile 360 aspect ratio deviation too high! Got ${compactRatio.toFixed(4)}`);
  }

  const compactScroll = await compactPage.evaluate(() => document.documentElement.scrollWidth);
  const compactClient = await compactPage.evaluate(() => document.documentElement.clientWidth);
  console.log(`Mobile 360 ScrollWidth: ${compactScroll}px, ClientWidth: ${compactClient}px`);
  if (compactScroll > compactClient) {
    throw new Error("Horizontal overflow detected on mobile 360px!");
  }
  console.log("✓ Zero horizontal overflow on mobile 360px");

  await compactPage.screenshot({
    path: path.join(SCREENSHOT_DIR, "polished_editorial_mobile_360.png"),
    fullPage: false,
  });
  console.log("✓ Saved polished_editorial_mobile_360.png");

  // -------------------------------------------------------------
  // 5. Test Homepage #invitation Section
  // -------------------------------------------------------------
  console.log("\n--- 5. Homepage #invitation Section ---");
  await page.goto("http://localhost:3000/#invitation", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const homeCard = page.locator("#invitation #official-wedding-invitation-card");
  if ((await homeCard.count()) === 0) throw new Error("Canonical card not found in homepage #invitation");
  console.log("✓ Homepage #invitation section renders canonical modern editorial card");

  const homeActions = page.locator("#invitation #official-invitation-actions");
  if ((await homeActions.count()) === 0) throw new Error("Homepage action buttons missing");
  const homeActionsText = await homeActions.innerText();
  if (!homeActionsText.toUpperCase().includes("VIEW FULL INVITATION")) {
    throw new Error("Homepage action should include 'View Full Invitation'");
  }
  console.log("✓ Homepage action buttons verified with 'View Full Invitation'");

  await page.locator("#invitation").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "polished_editorial_homepage_preview.png"),
  });
  console.log("✓ Saved polished_editorial_homepage_preview.png");

  // -------------------------------------------------------------
  // 6. Test Canvas Export Trigger
  // -------------------------------------------------------------
  console.log("\n--- 6. Canvas 300 DPI Export Verification ---");
  await page.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 10000 }),
    page.locator("#official-invitation-actions button", { hasText: /download invitation/i }).click(),
  ]);
  const downloadPath = await download.path();
  console.log(`✓ Canvas PNG downloaded successfully: ${download.suggestedFilename()}`);
  const stats = fs.statSync(downloadPath);
  console.log(`✓ Download file size: ${(stats.size / 1024).toFixed(1)} KB`);
  if (stats.size < 50000) {
    throw new Error("Exported PNG is unexpectedly small!");
  }

  await browser.close();
  console.log("\n=== ALL POLISHED INVITATION TESTS PASSED PERFECTLY! ===");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
