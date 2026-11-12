import { chromium } from "playwright";

async function testOne() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });

  await page.goto("https://www.pexels.com/search/indian%20bride/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(2000);

  const found = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    return imgs.map(img => img.src).filter(src => src.includes("images.pexels.com/photos/"));
  });

  console.log("Found images:", found.length, found.slice(0, 5));
  await browser.close();
}

testOne().catch(console.error);
