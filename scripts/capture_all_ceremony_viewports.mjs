import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR = path.resolve(
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots"
);
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function capture() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const ceremonyIds = ["haldi", "mehndi", "wedding", "reception"];

  // 1. Desktop Viewport 1440x900
  console.log("Capturing Desktop 1440x900 screenshots...");
  const deskContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const deskPage = await deskContext.newPage();
  await deskPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await deskPage.waitForTimeout(1500);

  // Measure offsets
  const offsetsDesk = await deskPage.evaluate((ids) => {
    return ids.map((id) => {
      const el = document.getElementById(id);
      let top = 0;
      let curr = el;
      while (curr) {
        top += curr.offsetTop;
        curr = curr.offsetParent;
      }
      return { id, top };
    });
  }, ceremonyIds);

  for (const { id, top } of offsetsDesk) {
    await deskPage.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
    await deskPage.waitForTimeout(400);
    const shotPath = path.join(SCREENSHOTS_DIR, `ceremony_${id}_desktop_1440.png`);
    await deskPage.screenshot({ path: shotPath });
    console.log(`Saved: ${shotPath}`);
  }
  await deskContext.close();

  // 2. Mobile Viewport 390x844
  console.log("Capturing Mobile 390x844 screenshots...");
  const mobContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const mobPage = await mobContext.newPage();
  await mobPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await mobPage.waitForTimeout(1500);

  const offsetsMob = await mobPage.evaluate((ids) => {
    return ids.map((id) => {
      const el = document.getElementById(id);
      let top = 0;
      let curr = el;
      while (curr) {
        top += curr.offsetTop;
        curr = curr.offsetParent;
      }
      return { id, top };
    });
  }, ceremonyIds);

  for (const { id, top } of offsetsMob) {
    await mobPage.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
    await mobPage.waitForTimeout(400);
    const shotPath = path.join(SCREENSHOTS_DIR, `ceremony_${id}_mobile_390.png`);
    await mobPage.screenshot({ path: shotPath });
    console.log(`Saved: ${shotPath}`);
  }
  await mobContext.close();

  await browser.close();
  console.log("Done capturing screenshots!");
}

capture().catch(console.error);
