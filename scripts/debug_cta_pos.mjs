import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  const ctaLink = page.locator("#hero a[href='#celebrations']");
  const linkBox = await ctaLink.boundingBox();
  const parentBox = await ctaLink.locator("..").boundingBox();
  const parentClass = await ctaLink.locator("..").getAttribute("class");
  const grandparentClass = await ctaLink.locator("../..").getAttribute("class");

  console.log("linkBox:", linkBox);
  console.log("parentBox:", parentBox);
  console.log("parentClass:", parentClass);
  console.log("grandparentClass:", grandparentClass);

  await browser.close();
}

main().catch(console.error);
