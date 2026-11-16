import { chromium } from "playwright";

async function testAnchorClicks() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  console.log("Initial scrollY:", await page.evaluate(() => window.scrollY));

  // Click Explore Celebrations
  const btn1 = page.locator("a:has-text('Explore Celebrations')").first();
  console.log("Button 1 count:", await btn1.count(), "visible:", await btn1.isVisible());
  const t0 = Date.now();
  await btn1.click();
  await page.waitForTimeout(1000);
  const scroll1 = await page.evaluate(() => window.scrollY);
  console.log(`Explore Celebrations clicked: scrollY is now ${scroll1} (took ${Date.now() - t0}ms)`);

  // Click View Invitation
  const btn2 = page.locator("a:has-text('View Invitation')").first();
  console.log("Button 2 count:", await btn2.count(), "visible:", await btn2.isVisible());
  const t1 = Date.now();
  await btn2.click();
  await page.waitForTimeout(1000);
  const scroll2 = await page.evaluate(() => window.scrollY);
  console.log(`View Invitation clicked: scrollY is now ${scroll2} (took ${Date.now() - t1}ms)`);

  await browser.close();
}

testAnchorClicks().catch(console.error);
