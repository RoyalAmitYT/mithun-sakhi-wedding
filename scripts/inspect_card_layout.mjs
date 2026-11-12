import { chromium } from "playwright";

async function inspectLayout() {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/#invitation", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const card = page.locator("#official-wedding-invitation-card").first();
  const cardBox = await card.boundingBox();
  console.log("Card Box:", cardBox);

  const children = await card.locator("> div, > article, > header, > section, > footer").all();
  console.log("Card direct elements count:", children.length);

  const innerHTML = await page.evaluate(() => {
    const card = document.getElementById("official-wedding-invitation-card");
    const kids = Array.from(card.children);
    return kids.map((k, i) => {
      const rect = k.getBoundingClientRect();
      return {
        tag: k.tagName,
        className: String(k.className).slice(0, 40),
        top: rect.top - card.getBoundingClientRect().top,
        height: rect.height,
        bottom: rect.bottom - card.getBoundingClientRect().top
      };
    });
  });

  console.log("Elements within card:", JSON.stringify(innerHTML, null, 2));
  await browser.close();
}

inspectLayout();
