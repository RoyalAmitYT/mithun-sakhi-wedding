import { chromium } from "playwright";

async function testVideo() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });

  await page.goto("https://www.pexels.com/search/videos/indian%20wedding/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(2000);

  const videoLinks = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a[href*='/video/']"));
    return anchors.map(a => a.href).filter(href => /\/video\/[a-z0-9-]+-[0-9]+\//.test(href) || /\/video\/[0-9]+\//.test(href));
  });

  console.log("Found video links:", videoLinks.slice(0, 5));

  if (videoLinks.length > 0) {
    await page.goto(videoLinks[0], { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    const videoData = await page.evaluate(() => {
      const v = document.querySelector("video");
      const source = v?.querySelector("source") || v;
      const downloadBtn = document.querySelector("a[href*='download']");
      return {
        videoSrc: v?.src || source?.src,
        poster: v?.poster,
        downloadHref: downloadBtn?.getAttribute("href")
      };
    });
    console.log("First video details:", videoData);
  }

  await browser.close();
}

testVideo().catch(console.error);
