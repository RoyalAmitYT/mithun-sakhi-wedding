import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  // Check homepage hero first
  await page.goto("http://localhost:3000/");
  await page.screenshot({ path: "p15_1_screenshots/debug_home_hero.png", fullPage: false });

  // Check invitation studio
  await page.goto("http://localhost:3000/invitation");
  await page.screenshot({ path: "p15_1_screenshots/debug_invitation.png", fullPage: false });
  const invPlayer = await page.locator('aside[aria-label="Wedding audio player"]').boundingBox();
  console.log("Invitation Player bounding box:", invPlayer);

  // Check account page after login
  await page.goto("http://localhost:3000/login");
  await page.fill('input[type="email"]', "p15_1_guest@wedding.local");
  await page.fill('input[type="password"]', "Password123!Luxury");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/account", { timeout: 10000 });
  await page.screenshot({ path: "p15_1_screenshots/debug_account.png", fullPage: false });
  const accPlayer = await page.locator('aside[aria-label="Wedding audio player"]').boundingBox();
  console.log("Account Player bounding box:", accPlayer);

  // Check what's under the player on account page
  const accElementUnder = await page.evaluate(({ x, y, width, height }) => {
    // Hide player temporarily to see what's directly underneath it
    const playerEl = document.querySelector('aside[aria-label="Wedding audio player"]');
    if (playerEl) playerEl.style.display = 'none';
    const el = document.elementFromPoint(x + width/2, y + height/2);
    if (playerEl) playerEl.style.display = '';
    return el ? { tag: el.tagName, text: el.textContent?.trim().slice(0, 80), class: el.className } : null;
  }, accPlayer);
  console.log("Element under account player:", accElementUnder);

  // Check what's under the player on invitation page
  await page.goto("http://localhost:3000/invitation");
  const invElementUnder = await page.evaluate(({ x, y, width, height }) => {
    const playerEl = document.querySelector('aside[aria-label="Wedding audio player"]');
    if (playerEl) playerEl.style.display = 'none';
    const el = document.elementFromPoint(x + width/2, y + height/2);
    if (playerEl) playerEl.style.display = '';
    return el ? { tag: el.tagName, text: el.textContent?.trim().slice(0, 80), class: el.className } : null;
  }, invPlayer);
  console.log("Element under invitation player:", invElementUnder);

  await browser.close();
}

run().catch(console.error);
