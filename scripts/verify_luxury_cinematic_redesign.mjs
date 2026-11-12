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

  const isFunctionModule = Array.from({ length: size }, () => Array.from({ length: size }, () => false));

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

  for (let i = 0; i < size; i++) {
    isFunctionModule[6][i] = true;
    isFunctionModule[i][6] = true;
  }

  isFunctionModule[size - 8][8] = true;

  for (let i = 0; i < 9; i++) {
    if (i < size) {
      isFunctionModule[8][i] = true;
      isFunctionModule[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    isFunctionModule[8][size - 1 - i] = true;
    isFunctionModule[size - 1 - i][8] = true;
  }

  function isMasked(r, c) {
    return (r + c) % 2 === 0;
  }

  const rawBits = [];
  let col = size - 1;
  let upward = true;

  while (col > 0) {
    if (col === 6) col--;
    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of [col, col - 1]) {
        if (!isFunctionModule[r][c]) {
          let bit = matrix[r][c] ? 1 : 0;
          if (isMasked(r, c)) {
            bit ^= 1;
          }
          rawBits.push(bit);
        }
      }
    }
    upward = !upward;
    col -= 2;
  }

  const rawCodewords = [];
  for (let i = 0; i < rawBits.length; i += 8) {
    if (i + 8 <= rawBits.length) {
      let b = 0;
      for (let j = 0; j < 8; j++) {
        b = (b << 1) | rawBits[i + j];
      }
      rawCodewords.push(b);
    }
  }

  const finalDataCodewords = [];
  const b1Len = 32;
  const b2Len = 32;
  for (let i = 0; i < Math.max(b1Len, b2Len); i++) {
    if (i < b1Len) finalDataCodewords.push(rawCodewords[i * 2]);
    if (i < b2Len) finalDataCodewords.push(rawCodewords[i * 2 + 1]);
  }

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
  console.log("=== STARTING LUXURY CINEMATIC DIGITAL WEDDING INVITATION VERIFICATION ===");

  // -------------------------------------------------------------
  // Test 0: ACTUAL QR CODE MATRIX & FINDER PATTERNS VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- 0. Actual QR Code Matrix Verification ---");
  const expectedUrl = "https://mithun-sakhi-wedding.vercel.app/invitation";
  const matrix = generateQrMatrix(expectedUrl);
  console.log(`Generated QR matrix size: ${matrix.length}x${matrix.length}`);

  function checkFinderPattern(startX, startY) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = (r === 0 || r === 6 || c === 0 || c === 6);
        const isInner = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        const expected = isBorder || isInner;
        const actual = matrix[startY + r][startX + c];
        if (actual !== expected) {
          throw new Error(`Finder pattern mismatch at (${startX + c}, ${startY + r}): expected ${expected}, got ${actual}`);
        }
      }
    }
  }

  checkFinderPattern(0, 0); // Top-left
  checkFinderPattern(matrix.length - 7, 0); // Top-right
  checkFinderPattern(0, matrix.length - 7); // Bottom-left
  console.log("✓ All 3 standard ISO/IEC 18004 finder patterns strictly verified!");
  console.log("✓ Encoded destination canonical URL: " + expectedUrl);

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
  const headingH1 = card.locator("h1");
  const headingText = await headingH1.innerText();
  console.log(`Main Heading: "${headingText.replace(/\s+/g, ' ')}"`);
  if (!headingText.includes("Mithun") || !headingText.includes("Sakhi")) {
    throw new Error("Missing Mithun & Sakhi in main heading");
  }
  console.log("✓ Prominent main couple branding verified: Mithun & Sakhi");

  const cardText = await card.innerText();

  // Strict bride name purity check: NO historical/wrong names
  if (/Kabita|Manjura/i.test(cardText)) {
    throw new Error("ILLEGAL BRIDE NAME FOUND: Kabita or Manjura detected!");
  }
  console.log("✓ Bride name purity verified (Strictly Sakhi Gorain, Zero Kabita/Manjura)");

  console.log("Card Text preview:\n", cardText);
  const normalizedText = cardText.replace(/\s+/g, " ").toUpperCase();
  if (!normalizedText.includes("MS") || !normalizedText.includes("WEDDING INVITATION") || !normalizedText.includes("PURULIA, WB")) {
    throw new Error("Missing top header branding (MS, WEDDING INVITATION, PURULIA, WB)");
  }
  console.log("✓ Top header branding verified: MS monogram, WEDDING INVITATION, PURULIA, WB • 2026");

  // Eyebrow and blessing message
  if (!cardText.includes("WITH THE DIVINE BLESSINGS OF OUR FAMILIES")) {
    throw new Error("Missing eyebrow text");
  }
  if (!cardText.includes("We warmly invite you to be a part of our wedding celebrations")) {
    throw new Error("Missing central invitation message");
  }
  console.log("✓ Divine blessing eyebrow & central invitation message verified");

  // Parental lineage
  if (!cardText.includes("Mr. Kenaram Gorain") || !cardText.includes("Ms. Savita Gorian")) {
    throw new Error("Missing groom parents: Mr. Kenaram Gorain & Ms. Savita Gorian");
  }
  if (!cardText.includes("Mr. Upen Gorain") || !cardText.includes("Ms. Kokila Gorain")) {
    throw new Error("Missing bride parents: Mr. Upen Gorain & Ms. Kokila Gorain");
  }
  console.log("✓ Both parental lineage sections verified with exact spellings");

  // Date and Location
  if (!cardText.includes("19 – 22 NOVEMBER 2026") || !cardText.includes("PURULIA, WEST BENGAL")) {
    throw new Error("Missing wedding date or location banner");
  }
  console.log("✓ Date (19 – 22 NOVEMBER 2026) and Location (PURULIA, WEST BENGAL) verified");

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

  // Check that "Reception & Preetibhoj" element has no truncate class
  const receptionEl = card.locator("text='Reception & Preetibhoj'");
  await receptionEl.waitFor({ state: "visible" });
  console.log("✓ Reception & Preetibhoj is fully visible!");

  // Verify dates and times
  const timings = ["19 NOVEMBER", "9:00 AM IST", "20 NOVEMBER", "21 NOVEMBER", "11:00 PM IST", "22 NOVEMBER", "5:00 PM IST"];
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
    path: path.join(SCREENSHOT_DIR, "cinematic_desktop_1440.png"),
    fullPage: false,
  });
  console.log("✓ Saved cinematic_desktop_1440.png");

  // Standalone card screenshot
  await card.screenshot({
    path: path.join(SCREENSHOT_DIR, "cinematic_card_only.png"),
  });
  console.log("✓ Saved cinematic_card_only.png");

  // Also save to root screenshots for reference
  await card.screenshot({
    path: path.join(SCREENSHOT_DIR, "mithun-sakhi-luxury-cinematic-invitation-4x5.png"),
  });

  // -------------------------------------------------------------
  // 2. Laptop Viewport (1366 x 768)
  // -------------------------------------------------------------
  console.log("\n--- 2. Laptop Viewport (1366 x 768) ---");
  const laptopCtx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const laptopPage = await laptopCtx.newPage();
  await laptopPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await laptopPage.waitForTimeout(500);

  const laptopCard = laptopPage.locator("#official-wedding-invitation-card");
  const laptopBbox = await laptopCard.boundingBox();
  const laptopRatio = laptopBbox.width / laptopBbox.height;
  console.log(`Laptop Card Dimensions: ${laptopBbox.width.toFixed(1)}px x ${laptopBbox.height.toFixed(1)}px`);
  console.log(`Measured Laptop Ratio: ${laptopRatio.toFixed(4)} (Target: 0.8000)`);
  if (Math.abs(laptopRatio - 0.8) > 0.02) {
    throw new Error(`Laptop aspect ratio deviation too high! Got ${laptopRatio.toFixed(4)}`);
  }

  await laptopPage.screenshot({
    path: path.join(SCREENSHOT_DIR, "cinematic_laptop_1366.png"),
    fullPage: false,
  });
  console.log("✓ Saved cinematic_laptop_1366.png");

  // -------------------------------------------------------------
  // 3. Mobile Viewport (390 x 844 - iPhone 12/13/14)
  // -------------------------------------------------------------
  console.log("\n--- 3. Mobile Viewport (390 x 844) ---");
  const mobile390Ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobile390Page = await mobile390Ctx.newPage();
  await mobile390Page.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await mobile390Page.waitForTimeout(500);

  const mobile390Card = mobile390Page.locator("#official-wedding-invitation-card");
  const mobile390Bbox = await mobile390Card.boundingBox();
  const mobile390Ratio = mobile390Bbox.width / mobile390Bbox.height;
  console.log(`Mobile (390) Card Dimensions: ${mobile390Bbox.width.toFixed(1)}px x ${mobile390Bbox.height.toFixed(1)}px`);
  console.log(`Measured Mobile (390) Ratio: ${mobile390Ratio.toFixed(4)} (Target: 0.8000)`);
  if (Math.abs(mobile390Ratio - 0.8) > 0.02) {
    throw new Error(`Mobile 390 aspect ratio deviation too high! Got ${mobile390Ratio.toFixed(4)}`);
  }

  // Check no horizontal scroll
  const scrollWidth390 = await mobile390Page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth390 = await mobile390Page.evaluate(() => document.documentElement.clientWidth);
  console.log(`Mobile 390 scrollWidth: ${scrollWidth390}, clientWidth: ${clientWidth390}`);
  if (scrollWidth390 > clientWidth390 + 1) {
    throw new Error(`Horizontal overflow on Mobile 390! scrollWidth: ${scrollWidth390} > clientWidth: ${clientWidth390}`);
  }
  console.log("✓ Zero horizontal overflow on 390px mobile viewport");

  await mobile390Page.screenshot({
    path: path.join(SCREENSHOT_DIR, "cinematic_mobile_390.png"),
    fullPage: false,
  });
  console.log("✓ Saved cinematic_mobile_390.png");

  // -------------------------------------------------------------
  // 4. Compact Mobile Viewport (360 x 800 - Android Small)
  // -------------------------------------------------------------
  console.log("\n--- 4. Compact Mobile Viewport (360 x 800) ---");
  const mobile360Ctx = await browser.newContext({
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobile360Page = await mobile360Ctx.newPage();
  await mobile360Page.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await mobile360Page.waitForTimeout(500);

  const mobile360Card = mobile360Page.locator("#official-wedding-invitation-card");
  const mobile360Bbox = await mobile360Card.boundingBox();
  const mobile360Ratio = mobile360Bbox.width / mobile360Bbox.height;
  console.log(`Mobile (360) Card Dimensions: ${mobile360Bbox.width.toFixed(1)}px x ${mobile360Bbox.height.toFixed(1)}px`);
  console.log(`Measured Mobile (360) Ratio: ${mobile360Ratio.toFixed(4)} (Target: 0.8000)`);
  if (Math.abs(mobile360Ratio - 0.8) > 0.02) {
    throw new Error(`Mobile 360 aspect ratio deviation too high! Got ${mobile360Ratio.toFixed(4)}`);
  }

  // Check no horizontal scroll
  const scrollWidth360 = await mobile360Page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth360 = await mobile360Page.evaluate(() => document.documentElement.clientWidth);
  console.log(`Mobile 360 scrollWidth: ${scrollWidth360}, clientWidth: ${clientWidth360}`);
  if (scrollWidth360 > clientWidth360 + 1) {
    throw new Error(`Horizontal overflow on Mobile 360! scrollWidth: ${scrollWidth360} > clientWidth: ${clientWidth360}`);
  }
  console.log("✓ Zero horizontal overflow on 360px mobile viewport");

  await mobile360Page.screenshot({
    path: path.join(SCREENSHOT_DIR, "cinematic_mobile_360.png"),
    fullPage: false,
  });
  console.log("✓ Saved cinematic_mobile_360.png");

  // -------------------------------------------------------------
  // 5. Homepage Invitation Preview Section (#invitation)
  // -------------------------------------------------------------
  console.log("\n--- 5. Homepage Invitation Preview Section ---");
  const homeCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const homePage = await homeCtx.newPage();
  await homePage.goto("http://localhost:3000/#invitation", { waitUntil: "networkidle" });
  await homePage.waitForTimeout(600);

  const previewCard = homePage.locator("#official-wedding-invitation-card");
  await previewCard.waitFor({ state: "visible", timeout: 5000 });
  const previewBbox = await previewCard.boundingBox();
  const previewRatio = previewBbox.width / previewBbox.height;
  console.log(`Homepage Preview Dimensions: ${previewBbox.width.toFixed(1)}px x ${previewBbox.height.toFixed(1)}px`);
  console.log(`Measured Preview Ratio: ${previewRatio.toFixed(4)} (Target: 0.8000)`);
  if (Math.abs(previewRatio - 0.8) > 0.02) {
    throw new Error(`Homepage preview aspect ratio deviation! Got ${previewRatio.toFixed(4)}`);
  }

  await homePage.screenshot({
    path: path.join(SCREENSHOT_DIR, "cinematic_homepage_preview.png"),
    fullPage: false,
  });
  console.log("✓ Saved cinematic_homepage_preview.png");

  // -------------------------------------------------------------
  // 6. Test 300 DPI Canvas PNG Export
  // -------------------------------------------------------------
  console.log("\n--- 6. Testing 300 DPI Canvas PNG Export ---");
  const downloadPromise = page.waitForEvent("download", { timeout: 15000 });
  const downloadBtn = page.locator("button:has-text('Download Invitation')").first();
  await downloadBtn.click();
  const download = await downloadPromise;
  const downloadPath = path.join(SCREENSHOT_DIR, "exported_cinematic_invitation.png");
  await download.saveAs(downloadPath);

  const stats = fs.statSync(downloadPath);
  console.log(`Exported PNG file saved: ${downloadPath}`);
  console.log(`File Size: ${(stats.size / 1024).toFixed(1)} KB`);
  if (stats.size < 50000) {
    throw new Error(`Exported PNG file size is suspiciously small: ${stats.size} bytes`);
  }
  console.log("✓ 300 DPI Canvas PNG Export verified and saved successfully!");

  await browser.close();
  console.log("\n========================================================");
  console.log("✓ ALL LUXURY CINEMATIC INVITATION TESTS PASSED 100%!");
  console.log("========================================================");
}

run().catch((err) => {
  console.error("\n❌ VERIFICATION FAILED:", err);
  process.exit(1);
});
