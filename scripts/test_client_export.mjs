import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function testExportDownload() {
  console.log("=== Testing Client PNG Export Download ===");
  const downloadDir = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/scratch/downloads";
  fs.mkdirSync(downloadDir, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    acceptDownloads: true,
  });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });

  const downloadPromise = page.waitForEvent("download");
  const downloadBtn = page.getByRole("button", { name: /Download PNG/i });
  await downloadBtn.click();

  const download = await downloadPromise;
  const filename = download.suggestedFilename();
  console.log(`Suggested filename: ${filename}`);

  const savePath = path.join(downloadDir, filename);
  await download.saveAs(savePath);

  const stats = fs.statSync(savePath);
  console.log(`Downloaded file size: ${stats.size} bytes`);

  if (stats.size < 50000) {
    throw new Error(`Exported PNG seems too small (${stats.size} bytes)`);
  }

  console.log("✓ PNG export successfully verified! Valid high-resolution image file generated on client.");
  await browser.close();
}

testExportDownload().catch((err) => {
  console.error("Export test failed:", err);
  process.exit(1);
});
