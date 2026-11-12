import { chromium } from "playwright";
import fs from "fs";

async function collectAll() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const photoSearches = [
    { key: "hero_couple", q: "indian wedding couple" },
    { key: "bride_portrait", q: "indian bride portrait" },
    { key: "groom_portrait", q: "indian groom portrait" },
    { key: "haldi", q: "haldi ceremony" },
    { key: "mehndi", q: "mehndi ceremony" },
    { key: "wedding_ceremony", q: "indian wedding mandap" },
    { key: "reception", q: "indian wedding reception" },
    { key: "decor", q: "indian wedding flowers decor" },
  ];

  const photoResults = {};

  for (const item of photoSearches) {
    console.log(`Scraping photos for ${item.key} (${item.q})...`);
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    });
    const page = await context.newPage();

    try {
      await page.goto(`https://www.pexels.com/search/${encodeURIComponent(item.q)}/`, {
        waitUntil: "domcontentloaded",
        timeout: 25000
      });
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(2000);

      const photos = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img"));
        const map = new Map();

        for (const img of imgs) {
          const src = img.src || "";
          const m = src.match(/photos\/([0-9]+)\//);
          if (!m) continue;
          const id = m[1];
          if (map.has(id)) continue;

          const title = img.alt || "Indian Wedding Stock Photo";
          map.set(id, {
            id,
            title,
            pageUrl: `https://www.pexels.com/photo/${id}/`,
            author: "Pexels Contributor",
            highResUrl: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`,
            thumbUrl: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`
          });

          if (map.size >= 4) break;
        }

        return Array.from(map.values());
      });

      photoResults[item.key] = photos;
      console.log(`  Found ${photos.length} for ${item.key}`);
    } catch (err) {
      console.error(`  Error for ${item.key}:`, err.message);
      photoResults[item.key] = [];
    } finally {
      await context.close();
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Videos using fresh context
  const videoSearches = [
    { key: "video_ceremony", q: "indian wedding ceremony" },
    { key: "video_haldi", q: "haldi ceremony" },
    { key: "video_bride", q: "indian bride" }
  ];

  const videoResults = [];

  for (const vitem of videoSearches) {
    console.log(`Scraping videos for ${vitem.key} (${vitem.q})...`);
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    });
    const page = await context.newPage();

    try {
      await page.goto(`https://www.pexels.com/search/videos/${encodeURIComponent(vitem.q)}/`, {
        waitUntil: "domcontentloaded",
        timeout: 25000
      });
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(2000);

      const vids = await page.evaluate((categoryKey) => {
        const anchors = Array.from(document.querySelectorAll("a[href*='/download/video/']"));
        const seen = new Set();
        const list = [];

        for (const a of anchors) {
          const href = a.getAttribute("href") || "";
          const m = href.match(/\/download\/video\/([0-9]+)\//);
          if (!m) continue;
          const id = m[1];
          if (seen.has(id)) continue;
          seen.add(id);

          const card = a.closest("article") || a.closest("div");
          const img = card?.querySelector("img");
          const title = img?.getAttribute("alt") || "Indian Wedding Film Highlight";

          list.push({
            id,
            category: categoryKey,
            title,
            pageUrl: `https://www.pexels.com/video/${id}/`,
            downloadUrl: `https://www.pexels.com/download/video/${id}/`,
            posterUrl: img?.src || "",
            author: "Pexels Video Creator"
          });

          if (list.length >= 2) break;
        }

        return list;
      }, vitem.key);

      videoResults.push(...vids);
      console.log(`  Found ${vids.length} videos for ${vitem.key}`);
    } catch (err) {
      console.error(`  Error for video ${vitem.key}:`, err.message);
    } finally {
      await context.close();
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  await browser.close();

  const manifest = {
    photos: photoResults,
    videos: videoResults
  };

  fs.writeFileSync("scripts/pexels_media_manifest.json", JSON.stringify(manifest, null, 2));
  console.log("✓ Saved pexels_media_manifest.json successfully!");
}

collectAll().catch(console.error);
