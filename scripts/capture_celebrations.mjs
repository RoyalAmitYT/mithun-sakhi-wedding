import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = path.resolve(
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots"
);
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function capture(prefix) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const viewports = [
    { name: "desktop_1440", width: 1440, height: 900 },
    { name: "mobile_390", width: 390, height: 844 },
    { name: "narrow_320", width: 320, height: 640 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto("http://localhost:3000#celebrations", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const celebrations = page.locator("#celebrations");
    const filename = `${prefix}_${vp.name}.png`;
    const artifactPath = path.join(ARTIFACT_DIR, filename);

    if (await celebrations.count() > 0) {
      await celebrations.screenshot({ path: filename });
      fs.copyFileSync(filename, artifactPath);
      console.log(`Saved ${filename}`);
    } else {
      console.log(`Celebrations section not found at ${vp.name}`);
    }
    await page.close();
  }

  await browser.close();
}

capture("before_celebrations").catch(console.error);
