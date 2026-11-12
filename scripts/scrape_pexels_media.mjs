import { chromium } from "playwright";
import fs from "fs";

async function scrape() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });

  const categories = [
    { key: "hero_couple", query: "indian wedding couple" },
    { key: "bride_portrait", query: "indian bride" },
    { key: "groom_portrait", query: "indian groom" },
    { key: "haldi_ceremony", query: "haldi ceremony" },
    { key: "mehndi_ceremony", query: "henna hands" },
    { key: "wedding_ceremony", query: "indian wedding mandap" },
    { key: "reception", query: "indian wedding reception" },
    { key: "decor", query: "wedding flowers decor" },
  ];

  const results = {};

  for (const cat of categories) {
    console.log(`Searching Pexels for: ${cat.query}...`);
    try {
      await page.goto(`https://www.pexels.com/search/${encodeURIComponent(cat.query)}/`, {
        waitUntil: "domcontentloaded",
        timeout: 25000
      });
      await page.waitForTimeout(3000);

      const items = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img[src*='images.pexels.com/photos/']"));
        const seen = new Set();
        const list = [];

        for (const img of imgs) {
          const src = img.getAttribute("src") || "";
          const match = src.match(/photos\/([0-9]+)\//);
          if (!match) continue;
          const id = match[1];
          if (seen.has(id)) continue;
          seen.add(id);

          const card = img.closest("article") || img.closest("div");
          const authorEl = card?.querySelector("a[href*='/@']");
          const title = img.getAttribute("alt") || "Indian Wedding Stock Photo";

          // Construct high-res URL
          const highResUrl = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`;

          list.push({
            id,
            title,
            previewUrl: src,
            highResUrl,
            pageUrl: `https://www.pexels.com/photo/${id}/`,
            author: authorEl?.innerText?.trim() || "Pexels Contributor",
            license: "Pexels License (Free to use, commercial and non-commercial, attribution not required)"
          });

          if (list.length >= 4) break;
        }

        return list;
      });

      results[cat.key] = items;
      console.log(`  Found ${items.length} items for ${cat.key}`);
    } catch (err) {
      console.error(`  Failed for ${cat.query}:`, err.message);
    }
  }

  // Videos
  const videoCategories = [
    { key: "video_ceremony", query: "indian wedding" },
    { key: "video_bride", query: "indian bride" },
  ];

  for (const vcat of videoCategories) {
    console.log(`Searching Pexels Videos for: ${vcat.query}...`);
    try {
      await page.goto(`https://www.pexels.com/search/videos/${encodeURIComponent(vcat.query)}/`, {
        waitUntil: "domcontentloaded",
        timeout: 25000
      });
      await page.waitForTimeout(3000);

      const vids = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("a[href*='/video/']"));
        const seen = new Set();
        const list = [];

        for (const a of links) {
          const href = a.getAttribute("href") || "";
          const match = href.match(/video\/[a-z0-9-]+-([0-9]+)\//) || href.match(/video\/([0-9]+)\//);
          if (!match) continue;
          const id = match[1];
          if (seen.has(id)) continue;
          seen.add(id);

          const card = a.closest("article") || a.closest("div");
          const img = card?.querySelector("img");
          const video = card?.querySelector("video");
          const authorEl = card?.querySelector("a[href*='/@']");
          const videoSrc = video?.getAttribute("src") || video?.querySelector("source")?.getAttribute("src") || "";

          list.push({
            id,
            title: img?.getAttribute("alt") || "Indian Wedding Celebration Highlight",
            poster: img?.getAttribute("src") || "",
            videoSrc,
            pageUrl: `https://www.pexels.com/video/${id}/`,
            author: authorEl?.innerText?.trim() || "Pexels Video Creator",
            license: "Pexels License (Free to use, commercial and non-commercial, attribution not required)"
          });

          if (list.length >= 3) break;
        }
        return list;
      });

      results[vcat.key] = vids;
      console.log(`  Found ${vids.length} videos for ${vcat.key}`);
    } catch (err) {
      console.error(`  Failed video for ${vcat.query}:`, err.message);
    }
  }

  await browser.close();

  fs.writeFileSync("scripts/pexels_scraped.json", JSON.stringify(results, null, 2));
  console.log("✓ Saved scrape results to scripts/pexels_scraped.json");
}

scrape().catch(console.error);
