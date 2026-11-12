// scripts/test_gallery_redesign.mjs
// Verification suite for the redesigned Wedding Memories Gallery (/gallery)

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR =
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots";

// Read Supabase credentials from .env.local
const envContent = await fs.readFile(".env.local", "utf8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, "");
}

const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  envVars.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const adminClient = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321",
  SERVICE_ROLE_KEY
);

async function main() {
  console.log("================================================================================");
  console.log("   WEDDING MEMORIES GALLERY REDESIGN VERIFICATION PASS");
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
    // PART 1: EMPTY STATE TESTING (Current database state)
    // -------------------------------------------------------------------------
    console.log("\n[PART 1] Verifying Luxury Empty State across Viewports...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });

    // Verify Symmetrical Eyebrow in gallery-header
    const eyebrow = await desktopPage.textContent("#gallery-header");
    assert(
      eyebrow && eyebrow.includes("CINEMATIC MEMORIES"),
      "Gallery header contains eyebrow 'CINEMATIC MEMORIES'"
    );

    // Verify Main Heading
    const heading = await desktopPage.textContent("h1");
    assert(
      heading && heading.includes("Wedding Memories"),
      "Main heading is 'Wedding Memories'"
    );

    // Verify Subtitle
    const subtitle = await desktopPage.textContent("#gallery-header p");
    assert(
      subtitle &&
        subtitle.includes(
          "Moments of sacred romance, family laughter, and joyous celebration captured forever."
        ),
      "Subtitle matches exact target reference text"
    );

    // Verify Media Switcher Tabs
    const photoTab = await desktopPage.$("#tab-photographs");
    const filmTab = await desktopPage.$("#tab-films");
    assert(photoTab !== null, "Photographs tab is present");
    assert(filmTab !== null, "Wedding Films tab is present");

    const photoSelected = await photoTab?.getAttribute("aria-selected");
    assert(photoSelected === "true", "Photographs tab is selected by default");

    // Verify 6 Category Filter Chips
    const chips = await desktopPage.$$(
      'button:has-text("Memories"), button:has-text("Portraits"), button:has-text("Ceremonies"), button:has-text("Family"), button:has-text("Decor"), button:has-text("Candid")'
    );
    const chipTexts = [];
    for (const chip of chips) {
      chipTexts.push((await chip.textContent())?.trim() || "");
    }
    console.log("    Detected category chips:", chipTexts);

    assert(
      chipTexts.some((t) => t.includes("All Memories")),
      "Category chip 'All Memories' is rendered"
    );
    assert(
      chipTexts.some((t) => t.includes("Couple Portraits")),
      "Category chip 'Couple Portraits' is rendered"
    );
    assert(
      chipTexts.some((t) => t.includes("Ceremonies")),
      "Category chip 'Ceremonies' is rendered"
    );
    assert(
      chipTexts.some((t) => t.includes("Family & Guests")),
      "Category chip 'Family & Guests' is rendered"
    );
    assert(
      chipTexts.some((t) => t.includes("Decor & Venues")),
      "Category chip 'Decor & Venues' is rendered"
    );
    assert(
      chipTexts.some((t) => t.includes("Candid Moments")),
      "Category chip 'Candid Moments' is rendered"
    );

    // Verify NO stock Pexels/temporary images
    const pexelsElements = await desktopPage.$$('img[src*="pexels"]');
    assert(pexelsElements.length === 0, "Strictly NO external Pexels stock photos are present");

    // Verify romantic empty state is rendered
    const emptyStateHeading = await desktopPage.$(
      'h3:has-text("Ceremony Memories in the Making"), h3:has-text("Moments Captured Soon")'
    );
    assert(
      emptyStateHeading !== null,
      "Romantic empty state is rendered when 0 published photos exist"
    );

    // Verify link to Explore Ceremonial Journey
    const exploreEventsLink = await desktopPage.$('a[href="/#events"]');
    assert(
      exploreEventsLink !== null,
      "Link to explore ceremonial journey (/#events) is present in empty state"
    );

    // Test clicking Category Chips
    const portraitsChip = await desktopPage.$('button:has-text("Couple Portraits")');
    if (portraitsChip) {
      await portraitsChip.click({ force: true });
      await desktopPage.waitForTimeout(300);
      const isPortraitsActive = await portraitsChip.evaluate((el) =>
        el.className.includes("bg-[#24181B]")
      );
      assert(
        isPortraitsActive,
        "Clicking 'Couple Portraits' chip activates it with burgundy/charcoal background"
      );

      const catEmptyHeading = await desktopPage.$(
        'h3:has-text("No Photographs in this Ceremony Category")'
      );
      assert(
        catEmptyHeading !== null,
        "Category-specific empty state reflects the active filter"
      );
    }

    // Test switching to "Wedding Films" tab
    if (filmTab) {
      await filmTab.click({ force: true });
      await desktopPage.waitForTimeout(400);
      const filmsSelected = await filmTab.getAttribute("aria-selected");
      assert(filmsSelected === "true", "Wedding Films tab becomes active when clicked");

      const filmsEmptyHeading = await desktopPage.$('h3:has-text("Wedding Films Premiere Soon")');
      assert(filmsEmptyHeading !== null, "Wedding Films empty state displays appropriately");
    }

    // Switch back to Photographs and All Memories
    if (photoTab) {
      await photoTab.click({ force: true });
      await desktopPage.waitForTimeout(400);
      const allMemoriesChip = await desktopPage.$('button:has-text("All Memories")');
      if (allMemoriesChip) await allMemoriesChip.click({ force: true });
      await desktopPage.waitForTimeout(300);
    }

    // Capture Desktop Empty State Screenshot
    const desktopEmptyScreenshotPath = path.join(
      SCREENSHOTS_DIR,
      "gallery_empty_desktop_1440.png"
    );
    await desktopPage.screenshot({ path: desktopEmptyScreenshotPath, fullPage: true });
    console.log(`    Saved desktop empty state screenshot: ${desktopEmptyScreenshotPath}`);
    await desktopContext.close();

    // Tablet Viewport
    console.log("\n[PART 1.2] Testing Tablet Viewport (768x1024)...");
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    });
    const tabletPage = await tabletContext.newPage();
    await tabletPage.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });
    const tabletHeading = await tabletPage.textContent("h1");
    assert(
      tabletHeading && tabletHeading.includes("Wedding Memories"),
      "Tablet header renders cleanly"
    );

    const tabletScreenshotPath = path.join(
      SCREENSHOTS_DIR,
      "gallery_empty_tablet_768.png"
    );
    await tabletPage.screenshot({ path: tabletScreenshotPath, fullPage: true });
    console.log(`    Saved tablet screenshot: ${tabletScreenshotPath}`);
    await tabletContext.close();

    // Mobile Viewport
    console.log("\n[PART 1.3] Testing Mobile Viewport (390x844)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });

    const hasHorizontalOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    assert(!hasHorizontalOverflow, "Mobile viewport has NO horizontal overflow");

    const mobileScreenshotPath = path.join(
      SCREENSHOTS_DIR,
      "gallery_empty_mobile_390.png"
    );
    await mobilePage.screenshot({ path: mobileScreenshotPath, fullPage: true });
    console.log(`    Saved mobile screenshot: ${mobileScreenshotPath}`);
    await mobileContext.close();

    // -------------------------------------------------------------------------
    // PART 2: POPULATED GALLERY TESTING (Cards, Frosted Badge, Pagination, Lightbox)
    // -------------------------------------------------------------------------
    console.log("\n[PART 2] Testing Populated Gallery (Cards, Grid, Pagination, Lightbox)...");

    // Insert 12 test published items to test 9-card 3x3 grid and pagination
    const testIds = [];
    const categoriesList = ["wedding", "haldi", "mehndi", "reception", "portraits"];
    const { data: userList } = await adminClient.auth.admin.listUsers();
    const testUserId = userList?.users?.[0]?.id;

    if (!testUserId) {
      console.log("    No test user found, skipping temporary populated test.");
    } else {
      console.log(`    Using admin user ${testUserId} to insert 11 test items...`);
      for (let i = 1; i <= 11; i++) {
        const cat = categoriesList[(i - 1) % categoriesList.length];
        const { data: inserted, error: insErr } = await adminClient
          .from("media_items")
          .insert({
            uploaded_by: testUserId,
            media_type: "photo",
            storage_path: "/images/the-sacred-wedding.png",
            category: cat,
            caption: `Ceremonial Memory ${i} — Sacred Purulia Celebrations`,
            is_published: true,
            download_enabled: true,
            file_name: `ceremony-moment-${i}.jpg`,
            file_size_bytes: 204800,
            mime_type: "image/jpeg",
            display_order: i,
          })
          .select()
          .single();

        if (insErr) {
          console.error("    Error inserting test item:", insErr.message);
        } else if (inserted) {
          testIds.push(inserted.id);
        }
      }
    }

    if (testIds.length > 0) {
      console.log(`    Successfully inserted ${testIds.length} test published photos.`);

      const populatedContext = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      });
      const popPage = await populatedContext.newPage();
      await popPage.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });

      // Verify that 9 cards are displayed on page 1
      const photoCards = await popPage.$$('div[role="button"][aria-label*="Wedding photograph"], div[role="button"][aria-label*="Ceremonial Memory"]');
      console.log(`    Cards rendered on page 1: ${photoCards.length}`);
      assert(photoCards.length === 9, "Exactly 9 photograph cards rendered on page 1 (3x3 grid)");

      // Verify frosted glass media indicator pill at bottom-right
      const frostedBadges = await popPage.$$('div[aria-hidden="true"] svg rect[x="3"]');
      assert(frostedBadges.length >= 9, "Frosted glass media type indicator pills rendered on all cards");

      // Verify circular pagination controls (‹ 1 2 ›)
      const pageTwoBtn = await popPage.$('button[aria-current="page"] ~ button, nav[aria-label="Gallery Pagination"] button:has-text("2")');
      assert(pageTwoBtn !== null, "Pagination button for Page 2 is rendered");

      // Test Page 2 navigation
      if (pageTwoBtn) {
        await pageTwoBtn.click({ force: true });
        await popPage.waitForTimeout(400);
        const page2Cards = await popPage.$$('div[role="button"][aria-label*="Wedding photograph"], div[role="button"][aria-label*="Ceremonial Memory"]');
        assert(page2Cards.length === 2, "Page 2 displays remaining 2 items (11 total)");
      }

      // Return to Page 1
      const pageOneBtn = await popPage.$('nav[aria-label="Gallery Pagination"] button:has-text("1")');
      if (pageOneBtn) {
        await pageOneBtn.click({ force: true });
        await popPage.waitForTimeout(400);
      }

      // Test Lightbox Viewer
      const firstCard = (await popPage.$$('div[role="button"][aria-label*="Ceremonial Memory"]'))[0];
      if (firstCard) {
        await firstCard.click({ force: true });
        await popPage.waitForTimeout(400);

        const lightboxDialog = await popPage.$('div[role="dialog"][aria-modal="true"]');
        assert(lightboxDialog !== null, "Clicking card opens high-resolution lightbox modal");

        // Verify next arrow in lightbox
        const nextArrow = await popPage.$('button[aria-label="Next photograph"]');
        assert(nextArrow !== null, "Lightbox provides next photo navigation control");

        // Verify download button
        const downloadBtn = await popPage.$('a:has-text("Download High-Resolution")');
        assert(downloadBtn !== null, "Lightbox includes Download High-Resolution button when download_enabled");

        // Close lightbox via Escape
        await popPage.keyboard.press("Escape");
        await popPage.waitForTimeout(300);
        const closedDialog = await popPage.$('div[role="dialog"][aria-modal="true"]');
        assert(closedDialog === null, "Pressing Escape closes the lightbox modal");
      }

      // Capture Populated Gallery Desktop Screenshot
      const popDesktopPath = path.join(
        SCREENSHOTS_DIR,
        "gallery_populated_desktop_1440.png"
      );
      await popPage.screenshot({ path: popDesktopPath, fullPage: true });
      console.log(`    Saved populated desktop screenshot: ${popDesktopPath}`);

      await populatedContext.close();

      // Clean up test items
      console.log("    Cleaning up temporary test items from database...");
      const { error: delErr } = await adminClient
        .from("media_items")
        .delete()
        .in("id", testIds);
      if (delErr) {
        console.error("    Error cleaning up test items:", delErr.message);
      } else {
        console.log("    Cleanup complete. Database state restored.");
      }
    }

    // -------------------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`VERIFICATION COMPLETE: ${passCount} Passed, ${failCount} Failed`);
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
