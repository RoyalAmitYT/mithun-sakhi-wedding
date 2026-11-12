// scripts/capture_p15_2_3_baseline.mjs
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = path.resolve(process.cwd(), "p15_2_3_screenshots");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const ARTIFACT_DIR = path.resolve(
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots"
);
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function syncScreenshot(filename) {
  const src = path.join(OUTPUT_DIR, filename);
  const dest = path.join(ARTIFACT_DIR, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

async function captureBaselines() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  // 1. Desktop Hero (1440x900)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_3_before_desktop_hero.png") });
    syncScreenshot("p15_2_3_before_desktop_hero.png");

    // Transition from hero to next section (scroll down slightly)
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_3_before_desktop_transition.png") });
    syncScreenshot("p15_2_3_before_desktop_transition.png");
    await page.close();
  }

  // 2. Mobile Hero (390x844)
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_3_before_mobile_390_hero.png") });
    syncScreenshot("p15_2_3_before_mobile_390_hero.png");

    // Transition from hero to next section
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_3_before_mobile_390_transition.png") });
    syncScreenshot("p15_2_3_before_mobile_390_transition.png");
    await page.close();
  }

  // 3. Narrow Mobile Hero (320x640)
  {
    const page = await browser.newPage({ viewport: { width: 320, height: 640 } });
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_3_before_narrow_320_hero.png") });
    syncScreenshot("p15_2_3_before_narrow_320_hero.png");
    await page.close();
  }

  await browser.close();
  console.log("✓ Baseline 'BEFORE' screenshots captured successfully.");
}

captureBaselines().catch(console.error);
