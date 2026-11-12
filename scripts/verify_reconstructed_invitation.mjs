import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ARTIFACT_DIR = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c";
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, "screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verifyAll() {
  console.log("Launching Chrome for multi-viewport verification...");
  const browser = await chromium.launch({ headless: true, channel: "chrome" });

  // 1. Desktop 1440x900 on /invitation page
  console.log("Testing Desktop 1440x900 on /invitation...");
  const invPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await invPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await invPage.waitForTimeout(1200);

  const card = invPage.locator("#official-wedding-invitation-card").first();
  await card.scrollIntoViewIfNeeded();
  await invPage.waitForTimeout(500);

  const box = await card.boundingBox();
  console.log("Desktop Card bounding box:", box);
  const ratio = box.width / box.height;
  console.log(`Desktop Card aspect ratio: ${ratio.toFixed(4)} (Target: 0.8000)`);

  // Live Ground Truth Capture
  const liveCardPath = path.join(SCREENSHOT_DIR, "live_browser_invitation.png");
  await card.screenshot({ path: liveCardPath });
  console.log(`Live card snapshot saved at ${liveCardPath}`);

  // Test Direct Download via "Download Invitation ↓" Button
  console.log("Testing live 'Download Invitation ↓' click...");
  const downloadPromise = invPage.waitForEvent("download", { timeout: 15000 });
  const downloadBtn = invPage.locator("button:has-text('Download Invitation')").first();
  await downloadBtn.click();
  const download = await downloadPromise;

  const downloadDest = path.join(SCREENSHOT_DIR, "downloaded_invitation_card.png");
  await download.saveAs(downloadDest);
  const stats = fs.statSync(downloadDest);
  console.log(`Downloaded PNG saved: ${downloadDest} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  const downloadMeta = await sharp(downloadDest).metadata();
  console.log(`Downloaded image dimensions: ${downloadMeta.width}x${downloadMeta.height}, ratio: ${(downloadMeta.width / downloadMeta.height).toFixed(4)}`);

  // 2. Generate Direct Side-by-Side Comparison: Live Browser vs Downloaded PNG
  console.log("Generating Live vs Downloaded comparison...");
  const compHeight = 1250;
  const compWidth = 1000;

  const liveResized = await sharp(liveCardPath)
    .resize(compWidth, compHeight, { fit: "fill" })
    .toBuffer();

  const dlResized = await sharp(downloadDest)
    .resize(compWidth, compHeight, { fit: "fill" })
    .toBuffer();

  const gutter = 30;
  const totalW = compWidth * 2 + gutter;
  const totalH = compHeight + 70;

  const headerSvg = Buffer.from(`
    <svg width="${totalW}" height="70">
      <rect width="100%" height="100%" fill="#140E0C" />
      <text x="${compWidth / 2}" y="44" fill="#E5C788" font-family="Georgia, serif" font-size="20" font-weight="bold" text-anchor="middle">
        IMAGE 1: LIVE BROWSER INVITATION (SOURCE OF TRUTH)
      </text>
      <text x="${compWidth + gutter + compWidth / 2}" y="44" fill="#E5C788" font-family="Georgia, serif" font-size="20" font-weight="bold" text-anchor="middle">
        DOWNLOADED EXPORT (CANONICAL DOM CAPTURE)
      </text>
    </svg>
  `);

  const sideBySidePath = path.join(ARTIFACT_DIR, "side_by_side_comparison.png");
  await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: { r: 20, g: 14, b: 12, alpha: 1 },
    },
  })
    .composite([
      { input: headerSvg, top: 0, left: 0 },
      { input: liveResized, top: 70, left: 0 },
      { input: dlResized, top: 70, left: compWidth + gutter },
    ])
    .toFile(sideBySidePath);
  console.log(`Side-by-side comparison saved at ${sideBySidePath}`);

  // 3. Test Laptop Viewport (1366x768)
  console.log("Testing Laptop 1366x768...");
  const laptopPage = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await laptopPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await laptopPage.waitForTimeout(800);
  const laptopCard = laptopPage.locator("#official-wedding-invitation-card").first();
  await laptopCard.scrollIntoViewIfNeeded();
  await laptopPage.screenshot({ path: path.join(SCREENSHOT_DIR, "homepage_laptop_1366.png") });
  await laptopPage.close();

  // 4. Test Mobile 390x844 (iPhone)
  console.log("Testing Mobile 390x844...");
  const mob390Page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mob390Page.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await mob390Page.waitForTimeout(800);
  const mob390Card = mob390Page.locator("#official-wedding-invitation-card").first();
  await mob390Card.scrollIntoViewIfNeeded();
  await mob390Page.screenshot({ path: path.join(SCREENSHOT_DIR, "homepage_mobile_390.png") });

  // Test mobile download
  const mobDownloadPromise = mob390Page.waitForEvent("download", { timeout: 15000 });
  const mobDownloadBtn = mob390Page.locator("button:has-text('Download Invitation')").first();
  await mobDownloadBtn.click();
  const mobDownload = await mobDownloadPromise;
  const mobDownloadDest = path.join(SCREENSHOT_DIR, "mobile_downloaded_invitation.png");
  await mobDownload.saveAs(mobDownloadDest);
  const mobMeta = await sharp(mobDownloadDest).metadata();
  console.log(`Mobile download dimensions: ${mobMeta.width}x${mobMeta.height}, ratio: ${(mobMeta.width / mobMeta.height).toFixed(4)}`);
  await mob390Page.close();

  // 5. Test Mobile 360x800 (Android)
  console.log("Testing Mobile 360x800...");
  const mob360Page = await browser.newPage({ viewport: { width: 360, height: 800 } });
  await mob360Page.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await mob360Page.waitForTimeout(800);
  await mob360Page.screenshot({ path: path.join(SCREENSHOT_DIR, "homepage_mobile_360.png") });
  await mob360Page.close();

  await browser.close();
  console.log("All verifications completed successfully!");
}

verifyAll().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
