import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR = path.resolve(
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots"
);
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function runDbQuery(sql) {
  try {
    const out = execSync("npx.cmd supabase db query", {
      input: sql,
      encoding: "utf8",
    });
    return out;
  } catch (err) {
    console.error("Database query failed:", err.message);
    throw err;
  }
}

async function run() {
  console.log("================================================================================");
  console.log("TEST SUITE: WISHES & BLESSINGS WALL CINEMATIC REDESIGN VERIFICATION");
  console.log("================================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ PASS: ${message}`);
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  try {
    // =========================================================================
    // PART 1: EMPTY STATE VERIFICATION (No approved wishes in DB)
    // =========================================================================
    console.log("SUITE 1: Empty State Verification (Reference 'Blessings Are Being Gathered')");
    const emptyContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const emptyPage = await emptyContext.newPage();
    await emptyPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await emptyPage.waitForTimeout(1500);

    const wishesSection = emptyPage.locator("#wishes");
    assert((await wishesSection.count()) >= 1, "#wishes section is present");

    // Scroll cleanly to #wishes
    const sectionTop = await wishesSection.evaluate((el) => {
      let top = 0;
      let curr = el;
      while (curr) {
        top += curr.offsetTop;
        curr = curr.offsetParent;
      }
      return top;
    });
    await emptyPage.evaluate((y) => window.scrollTo({ top: y - 20, behavior: "instant" }), sectionTop);
    await emptyPage.waitForTimeout(600);

    // Hide floating audio player and fixed navbar for clean element capture
    await emptyPage.evaluate(() => {
      const player = document.querySelector('aside[aria-label="Wedding audio player"]');
      if (player) player.style.display = "none";
      const nav = document.querySelector("header");
      if (nav) nav.style.display = "none";
    });

    // 1. Header Checks
    const eyebrow = wishesSection.locator("text=ASHIRWAD · HEARTFELT BLESSINGS").first();
    assert(await eyebrow.isVisible(), "Eyebrow 'ASHIRWAD · HEARTFELT BLESSINGS' is visible");

    const title = wishesSection.locator("#wishes-title");
    assert(await title.isVisible(), "Main title #wishes-title is visible");
    const titleText = await title.innerText();
    assert(
      titleText.includes("Wishes") && titleText.includes("Blessings Wall"),
      "Title contains 'Wishes & Blessings Wall'"
    );

    const subtitle = wishesSection.locator("text=A sacred guestbook for friends").first();
    assert(await subtitle.isVisible(), "Subtitle description is visible");

    // 2. Empty State Container Checks
    const emptyHeading = wishesSection.locator("text=Blessings Are Being Gathered").first();
    assert(await emptyHeading.isVisible(), "Empty state heading 'Blessings Are Being Gathered' is visible");

    const emptyDesc = wishesSection.locator("text=As loved ones begin sending their prayers").first();
    assert(await emptyDesc.isVisible(), "Empty state description is visible");

    // 3. Guest Moderation Notice
    const moderationNotice = wishesSection.locator("text=Guest Notice · Moderation Policy").first();
    assert(await moderationNotice.isVisible(), "Moderation Policy header is visible");

    const moderationText = wishesSection.locator("text=To maintain reverence, all messages submitted via the guest dashboard").first();
    assert(await moderationText.isVisible(), "Moderation policy description is visible");

    // 4. Empty State CTA Button
    const emptyCta = wishesSection.locator('a[href="/account#wishes"]');
    assert(await emptyCta.isVisible(), "CTA link to /account#wishes is visible");
    const emptyCtaText = await emptyCta.innerText();
    assert(emptyCtaText.includes("SEND THE FIRST BLESSING"), "CTA button text is 'SEND THE FIRST BLESSING'");

    // Screenshot Desktop Empty State
    const emptyDesktopShot = path.join(SCREENSHOTS_DIR, "wishes_empty_desktop_1440.png");
    await wishesSection.screenshot({ path: emptyDesktopShot });
    console.log(`  📸 Saved desktop empty state screenshot: ${emptyDesktopShot}`);
    await emptyContext.close();

    // Mobile Empty State
    const mobEmptyContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
    });
    const mobEmptyPage = await mobEmptyContext.newPage();
    await mobEmptyPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await mobEmptyPage.waitForTimeout(1000);

    const mobEmptySection = mobEmptyPage.locator("#wishes");
    await mobEmptySection.scrollIntoViewIfNeeded();
    await mobEmptyPage.evaluate(() => {
      const player = document.querySelector('aside[aria-label="Wedding audio player"]');
      if (player) player.style.display = "none";
      const nav = document.querySelector("header");
      if (nav) nav.style.display = "none";
    });
    await mobEmptyPage.waitForTimeout(500);

    const mobEmptyShot = path.join(SCREENSHOTS_DIR, "wishes_empty_mobile_390.png");
    await mobEmptySection.screenshot({ path: mobEmptyShot });
    console.log(`  📸 Saved mobile empty state screenshot: ${mobEmptyShot}`);
    await mobEmptyContext.close();

    // =========================================================================
    // PART 2: DYNAMIC APPROVED WISHES VERIFICATION (Populated State)
    // =========================================================================
    console.log("\nSUITE 2: Dynamic Populated State (3 Approved Wishes Matching Reference)");

    // Insert 3 test approved wishes into the local database
    const setupSql = `
      INSERT INTO public.wishes (id, author_display_name, wish_text, status)
      VALUES 
        ('11111111-aaaa-bbbb-cccc-111111111111'::uuid, 'Amit Gorain', 'Heartfelt blessings to Mithun and Sakhi for a lifetime of love, happiness, and togetherness. May your journey ahead be filled with joy always.', 'approved'),
        ('22222222-aaaa-bbbb-cccc-222222222222'::uuid, 'Suman Gorain', 'Wishing you both a beautiful new chapter filled with understanding, respect, and endless happiness. God bless you always.', 'approved'),
        ('33333333-aaaa-bbbb-cccc-333333333333'::uuid, 'Kiran Gorain', 'May your marriage be a source of strength, joy, and inspiration for everyone around you. Stay blessed always, Mithun & Sakhi.', 'approved')
      ON CONFLICT (id) DO UPDATE SET 
        author_display_name = EXCLUDED.author_display_name,
        wish_text = EXCLUDED.wish_text,
        status = 'approved';
    `;
    runDbQuery(setupSql);
    console.log("  ✓ Inserted 3 approved test wishes into database");

    // Re-test Desktop Viewport with populated wishes
    const popContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const popPage = await popContext.newPage();
    await popPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await popPage.waitForTimeout(1500);

    const popWishes = popPage.locator("#wishes");
    const popTop = await popWishes.evaluate((el) => {
      let top = 0;
      let curr = el;
      while (curr) {
        top += curr.offsetTop;
        curr = curr.offsetParent;
      }
      return top;
    });
    await popPage.evaluate((y) => window.scrollTo({ top: y - 20, behavior: "instant" }), popTop);
    await popPage.waitForTimeout(600);

    await popPage.evaluate(() => {
      const player = document.querySelector('aside[aria-label="Wedding audio player"]');
      if (player) player.style.display = "none";
      const nav = document.querySelector("header");
      if (nav) nav.style.display = "none";
    });

    // 1. Verify 3 cards rendered on desktop
    const cards = popWishes.locator("article:visible");
    const cardCount = await cards.count();
    assert(cardCount === 3, `Exactly 3 guest wish cards rendered (found ${cardCount})`);

    // 2. Verify Authors
    const author1 = popWishes.locator("text=Amit Gorain").first();
    assert(await author1.isVisible(), "Author 'Amit Gorain' is visible in Card 1");

    const author2 = popWishes.locator("text=Suman Gorain").first();
    assert(await author2.isVisible(), "Author 'Suman Gorain' is visible in Card 2 (Center)");

    const author3 = popWishes.locator("text=Kiran Gorain").first();
    assert(await author3.isVisible(), "Author 'Kiran Gorain' is visible in Card 3");

    // 3. Verify Center Card Highlight
    const centerCard = cards.nth(1);
    const centerCardClass = await centerCard.getAttribute("class");
    assert(
      centerCardClass.includes("#FFF9F8") || centerCardClass.includes("border-[#A52232]"),
      "Center card has subtle rose/sindoor highlight styling"
    );

    // 4. Verify CTA Button Text updates to 'SEND A BLESSING'
    const popCta = popWishes.locator('a[href="/account#wishes"]');
    assert(await popCta.isVisible(), "Populated CTA link is visible");
    const popCtaText = await popCta.innerText();
    assert(popCtaText.includes("SEND A BLESSING"), "CTA button text is 'SEND A BLESSING'");

    // Screenshot Desktop Populated State
    const popDesktopShot = path.join(SCREENSHOTS_DIR, "wishes_desktop_1440.png");
    await popWishes.screenshot({ path: popDesktopShot });
    console.log(`  📸 Saved desktop populated screenshot: ${popDesktopShot}`);
    await popContext.close();

    // Mobile Viewport (390x844) Populated State (1 card visible at a time)
    const popMobContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
    });
    const popMobPage = await popMobContext.newPage();
    await popMobPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await popMobPage.waitForTimeout(1000);

    const popMobWishes = popMobPage.locator("#wishes");
    await popMobWishes.scrollIntoViewIfNeeded();
    await popMobPage.evaluate(() => {
      const player = document.querySelector('aside[aria-label="Wedding audio player"]');
      if (player) player.style.display = "none";
      const nav = document.querySelector("header");
      if (nav) nav.style.display = "none";
    });
    await popMobPage.waitForTimeout(500);

    // Verify 1 card visible on mobile
    const mobCards = popMobWishes.locator("article:visible");
    const mobCardCount = await mobCards.count();
    assert(mobCardCount === 1, `Exactly 1 guest wish card rendered on mobile (found ${mobCardCount})`);

    const popMobShot = path.join(SCREENSHOTS_DIR, "wishes_mobile_390.png");
    await popMobWishes.screenshot({ path: popMobShot });
    console.log(`  📸 Saved mobile populated screenshot: ${popMobShot}`);
    await popMobContext.close();

    console.log("\n================================================================================");
    console.log(`ALL TESTS PASSED: ${passedTests}/${totalTests} (100%)`);
    console.log("================================================================================\n");
  } finally {
    // Clean up test wishes from the database unconditionally
    try {
      const cleanupSql = `
        DELETE FROM public.wishes 
        WHERE id IN (
          '11111111-aaaa-bbbb-cccc-111111111111'::uuid,
          '22222222-aaaa-bbbb-cccc-222222222222'::uuid,
          '33333333-aaaa-bbbb-cccc-333333333333'::uuid
        );
      `;
      runDbQuery(cleanupSql);
      console.log("  ✓ Cleaned up test wishes from database (DB returned to clean state)");
    } catch (e) {
      console.error("Cleanup error:", e.message);
    }
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
