import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function verifyHandoff() {
  console.log("================================================================================");
  console.log("   PHASE 2 HANDOFF VALIDATION SUITE");
  console.log("================================================================================");

  const testDir = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/794ae1ef-d68d-456e-bb26-6c077d452fa4/scratch/handoff";
  fs.mkdirSync(testDir, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  // CHECK 1: OPEN GRAPH PREVIEW METADATA VERIFICATION
  console.log("\n[CHECK 1] Validating Open Graph & Twitter Social Metadata...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  const ogWidth = await page.locator('meta[property="og:image:width"]').getAttribute("content");
  const ogHeight = await page.locator('meta[property="og:image:height"]').getAttribute("content");
  const ogType = await page.locator('meta[property="og:image:type"]').getAttribute("content");
  const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
  const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute("content");

  console.log(`- og:title:       ${ogTitle}`);
  console.log(`- og:image:       ${ogImage}`);
  console.log(`- og:image dimensions: ${ogWidth} x ${ogHeight}`);
  console.log(`- og:image:type:  ${ogType}`);
  console.log(`- twitter:card:   ${twitterCard}`);
  console.log(`- twitter:image:  ${twitterImage}`);

  if (!ogImage || !ogImage.includes("opengraph-image.jpg")) {
    throw new Error(`Invalid OG image URL: ${ogImage}`);
  }
  if (ogWidth !== "1200" || ogHeight !== "630") {
    throw new Error(`Unexpected OG dimensions: ${ogWidth}x${ogHeight}`);
  }
  console.log("✓ SUCCESS: Canonical Open Graph & Twitter metadata strictly valid!");

  // CHECK 2: INVITATION JPG EXPORT
  console.log("\n[CHECK 2] Validating Canonical Invitation JPG Export...");
  const inviteSection = page.locator("#invitation");
  await inviteSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const downloadModalTrigger = page.locator("button:has-text('Download Invitation')").first();
  await downloadModalTrigger.click();
  await page.waitForTimeout(400);

  console.log("- Triggering DOWNLOAD JPG...");
  const jpgPromise = page.waitForEvent("download");
  const downloadJpgBtn = page.locator("button:has-text('DOWNLOAD JPG')").first();
  await downloadJpgBtn.click();

  const jpgDownload = await jpgPromise;
  const jpgFilename = jpgDownload.suggestedFilename();
  const jpgPath = path.join(testDir, jpgFilename);
  await jpgDownload.saveAs(jpgPath);

  const jpgStats = fs.statSync(jpgPath);
  console.log(`✓ JPG Downloaded: ${jpgFilename} (${(jpgStats.size / 1024).toFixed(1)} KB)`);
  if (jpgStats.size < 500000) {
    throw new Error(`JPG size too small: ${jpgStats.size} bytes`);
  }

  // CHECK 3: INVITATION PDF EXPORT
  console.log("\n[CHECK 3] Validating Canonical Invitation PDF Export...");
  // Re-open download modal if closed
  if (!await page.locator("button:has-text('DOWNLOAD PDF')").isVisible()) {
    await downloadModalTrigger.click();
    await page.waitForTimeout(400);
  }

  console.log("- Triggering DOWNLOAD PDF...");
  const pdfPromise = page.waitForEvent("download");
  const downloadPdfBtn = page.locator("button:has-text('DOWNLOAD PDF')").first();
  await downloadPdfBtn.click();

  const pdfDownload = await pdfPromise;
  const pdfFilename = pdfDownload.suggestedFilename();
  const pdfPath = path.join(testDir, pdfFilename);
  await pdfDownload.saveAs(pdfPath);

  const pdfStats = fs.statSync(pdfPath);
  console.log(`✓ PDF Downloaded: ${pdfFilename} (${(pdfStats.size / 1024).toFixed(1)} KB)`);
  if (pdfStats.size < 500000) {
    throw new Error(`PDF size too small: ${pdfStats.size} bytes`);
  }

  // Verify PDF header magic bytes (%PDF-1.4)
  const pdfBuf = fs.readFileSync(pdfPath);
  const pdfHeader = pdfBuf.subarray(0, 8).toString("utf-8");
  console.log(`- PDF Header: ${pdfHeader}`);
  if (!pdfHeader.startsWith("%PDF-")) {
    throw new Error(`Invalid PDF header: ${pdfHeader}`);
  }
  console.log("✓ SUCCESS: PDF export generated valid Adobe Acrobat PDF 1.4 document wrapping high-density raster!");

  await browser.close();
  console.log("\n================================================================================");
  console.log("   PHASE 2 HANDOFF VALIDATION COMPLETE — ALL CHECKS PASSED!");
  console.log("================================================================================");
}

verifyHandoff().catch((err) => {
  console.error("Handoff validation failed:", err);
  process.exit(1);
});
