// scripts/test_gallery_chips_layout.mjs
// Targeted verification of category filter chip layout on /gallery

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR =
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots";

async function main() {
  console.log("================================================================================");
  console.log("   GALLERY CATEGORY FILTER CHIP LAYOUT VERIFICATION");
  console.log("================================================================================");

  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
      passCount++;
    } else {
      console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
      failCount++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: DESKTOP (1440x900) - Single Centered Row with Breathing Room
    // -------------------------------------------------------------------------
    console.log("\n[1/3] Testing Desktop (1440x900)...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });

    // Locate the 6 category chips
    const chipSelector = 'button:has-text("Memories"), button:has-text("Portraits"), button:has-text("Ceremonies"), button:has-text("Family"), button:has-text("Decor"), button:has-text("Candid")';
    const desktopChips = await desktopPage.$$(chipSelector);
    assert(desktopChips.length === 6, `Found all 6 category chips (found ${desktopChips.length})`);

    // Get bounding boxes of all 6 chips
    const boxes = [];
    for (let i = 0; i < desktopChips.length; i++) {
      const box = await desktopChips[i].boundingBox();
      const text = (await desktopChips[i].textContent())?.trim();
      boxes.push({ index: i, text, ...box });
    }

    console.log("    Chip bounding boxes on 1440px desktop:");
    for (const b of boxes) {
      console.log(`      Chip [${b.text}]: x=${Math.round(b.x)}, y=${Math.round(b.y)}, w=${Math.round(b.width)}, h=${Math.round(b.height)}`);
    }

    // Check single row: all chips have essentially the same y coordinate (within 4px)
    const yCoordinates = boxes.map((b) => Math.round(b.y));
    const allSameY = yCoordinates.every((y) => Math.abs(y - yCoordinates[0]) <= 4);
    assert(
      allSameY,
      `All 6 category chips sit in ONE single horizontal row on desktop (y-range: ${Math.min(...yCoordinates)} - ${Math.max(...yCoordinates)})`
    );

    // Check no clipping: all chips are strictly within viewport bounds with padding
    const firstChip = boxes[0];
    const lastChip = boxes[boxes.length - 1];

    assert(
      firstChip.x >= 20,
      `First chip ('${firstChip.text}') has sufficient left breathing room (left offset = ${Math.round(firstChip.x)}px >= 20px)`
    );

    const rightMargin = 1440 - (lastChip.x + lastChip.width);
    assert(
      rightMargin >= 20,
      `Last chip ('${lastChip.text}') has sufficient right breathing room (right margin = ${Math.round(rightMargin)}px >= 20px)`
    );

    // Check horizontal centering: left offset of first chip and right offset of last chip are balanced
    const centerDifference = Math.abs(firstChip.x - rightMargin);
    assert(
      centerDifference <= 40,
      `Chip group is horizontally centered (left=${Math.round(firstChip.x)}px, right=${Math.round(rightMargin)}px, diff=${Math.round(centerDifference)}px)`
    );

    // Capture screenshot on 1440px
    const desktopShotPath = path.join(SCREENSHOTS_DIR, "gallery_chips_desktop_1440.png");
    await desktopPage.screenshot({ path: desktopShotPath });
    console.log(`    📸 Saved desktop screenshot: ${desktopShotPath}`);

    // Test clicking functionality
    const couplePortraitsChip = desktopChips[1];
    await couplePortraitsChip.click({ force: true });
    await desktopPage.waitForTimeout(300);
    const isPortraitsActive = await couplePortraitsChip.evaluate((el) =>
      el.className.includes("bg-[#24181B]")
    );
    assert(isPortraitsActive, "Clicking category chip updates active styling to bg-[#24181B]");

    // Click back to All Memories
    await desktopChips[0].click({ force: true });
    await desktopPage.waitForTimeout(300);

    await desktopContext.close();

    // -------------------------------------------------------------------------
    // TEST 2: TABLET (768x1024) - Natural Centered Multi-Row Wrapping
    // -------------------------------------------------------------------------
    console.log("\n[2/3] Testing Tablet (768x1024)...");
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    });
    const tabletPage = await tabletContext.newPage();
    await tabletPage.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });

    const tabletChips = await tabletPage.$$(chipSelector);
    assert(tabletChips.length === 6, `Tablet renders all 6 chips (found ${tabletChips.length})`);

    const tabletBoxes = [];
    for (let i = 0; i < tabletChips.length; i++) {
      const box = await tabletChips[i].boundingBox();
      const text = (await tabletChips[i].textContent())?.trim();
      tabletBoxes.push({ index: i, text, ...box });
    }

    console.log("    Chip bounding boxes on 768px tablet:");
    for (const b of tabletBoxes) {
      console.log(`      Chip [${b.text}]: x=${Math.round(b.x)}, y=${Math.round(b.y)}, w=${Math.round(b.width)}, h=${Math.round(b.height)}`);
    }

    // Check wrapping: chips wrap into multiple rows on 768px tablet
    const uniqueTabletYs = [...new Set(tabletBoxes.map((b) => Math.round(b.y / 10) * 10))];
    assert(
      uniqueTabletYs.length >= 2,
      `Chips naturally wrap into multiple rows on tablet (rows detected: ${uniqueTabletYs.length})`
    );

    // Verify all chips are fully within viewport width (no clipping)
    let anyTabletClipped = false;
    for (const b of tabletBoxes) {
      if (b.x < 0 || b.x + b.width > 768) {
        anyTabletClipped = true;
      }
    }
    assert(!anyTabletClipped, "No category chips are clipped on tablet (all 0 <= x + width <= 768)");

    // Verify zero horizontal page overflow
    const tabletOverflow = await tabletPage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    assert(!tabletOverflow, "Tablet viewport has NO horizontal page overflow");

    // Capture tablet screenshot
    const tabletShotPath = path.join(SCREENSHOTS_DIR, "gallery_chips_tablet_768.png");
    await tabletPage.screenshot({ path: tabletShotPath });
    console.log(`    📸 Saved tablet screenshot: ${tabletShotPath}`);

    await tabletContext.close();

    // -------------------------------------------------------------------------
    // TEST 3: MOBILE (390x844) - Clean Responsive Wrapping Layout
    // -------------------------------------------------------------------------
    console.log("\n[3/3] Testing Mobile (390x844)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });

    const mobileChips = await mobilePage.$$(chipSelector);
    assert(mobileChips.length === 6, `Mobile renders all 6 chips (found ${mobileChips.length})`);

    const mobileBoxes = [];
    for (let i = 0; i < mobileChips.length; i++) {
      const box = await mobileChips[i].boundingBox();
      const text = (await mobileChips[i].textContent())?.trim();
      mobileBoxes.push({ index: i, text, ...box });
    }

    console.log("    Chip bounding boxes on 390px mobile:");
    for (const b of mobileBoxes) {
      console.log(`      Chip [${b.text}]: x=${Math.round(b.x)}, y=${Math.round(b.y)}, w=${Math.round(b.width)}, h=${Math.round(b.height)}`);
    }

    // Verify all chips are fully within viewport bounds
    let anyMobileClipped = false;
    for (const b of mobileBoxes) {
      if (b.x < 0 || b.x + b.width > 390) {
        anyMobileClipped = true;
      }
    }
    assert(!anyMobileClipped, "No category chips are clipped on mobile (all 0 <= x + width <= 390)");

    // Verify zero horizontal page overflow
    const mobileOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    assert(!mobileOverflow, "Mobile viewport has strictly NO horizontal page overflow");

    // Capture mobile screenshot
    const mobileShotPath = path.join(SCREENSHOTS_DIR, "gallery_chips_mobile_390.png");
    await mobilePage.screenshot({ path: mobileShotPath });
    console.log(`    📸 Saved mobile screenshot: ${mobileShotPath}`);

    await mobileContext.close();

    // -------------------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`CATEGORY CHIP VERIFICATION: ${passCount} Passed, ${failCount} Failed`);
    console.log("================================================================================");

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
