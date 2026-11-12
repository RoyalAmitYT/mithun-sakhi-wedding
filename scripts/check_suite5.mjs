import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  const data = await page.evaluate(() => {
    const fab = document.querySelector("[aria-label*='wedding music']");
    const cta = document.querySelector("#hero a[href='#celebrations']");
    const cd = document.querySelector("#hero [aria-label='Wedding ceremony countdown timer']");
    const fabRect = fab ? fab.getBoundingClientRect() : null;
    const ctaRect = cta ? cta.getBoundingClientRect() : null;
    const cdRect = cd ? cd.getBoundingClientRect() : null;

    function rectsOverlap(r1, r2) {
      if (!r1 || !r2) return false;
      return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
    }

    return {
      fabRect,
      ctaRect,
      cdRect,
      ctaOverlap: rectsOverlap(fabRect, ctaRect),
      cdOverlap: rectsOverlap(fabRect, cdRect),
    };
  });

  console.log("Evaluation on 390x844:", data);
  await browser.close();
}

main().catch(console.error);
