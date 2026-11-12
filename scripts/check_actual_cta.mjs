import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  const ctaBtn = page.locator("#hero a:has-text('EXPLORE CELEBRATIONS')");
  const ctaBox = await ctaBtn.boundingBox();
  const fab = page.locator("[aria-label*='wedding music']");
  const fabBox = await fab.boundingBox();

  console.log("CTA button box:", ctaBox);
  console.log("FAB box:", fabBox);

  await browser.close();
}

main().catch(console.error);
