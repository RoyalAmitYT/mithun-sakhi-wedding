import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR = path.resolve(
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots"
);
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log("================================================================================");
  console.log("TEST SUITE: VENUES & DIRECTIONS EDITORIAL REDESIGN VERIFICATION");
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
    // SUITE 1: DESKTOP VIEWPORT (1440x900) - VENUES SECTION & REFERENCE MATCH
    // =========================================================================
    console.log("SUITE 1: Desktop Viewport (1440x900) - Reference Match Verification");
    const deskContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const deskPage = await deskContext.newPage();
    await deskPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await deskPage.waitForTimeout(1500);

    const venuesSection = deskPage.locator("#venues");
    assert((await venuesSection.count()) >= 1, "#venues section is present");

    // Scroll to #venues
    await venuesSection.scrollIntoViewIfNeeded();
    await deskPage.waitForTimeout(600);

    // 1. Header Checks
    const eyebrow = venuesSection.locator("text=PURULIA • WEST BENGAL").first();
    assert(await eyebrow.isVisible(), "Eyebrow 'PURULIA • WEST BENGAL' is visible");

    const title = venuesSection.locator("#venues-title");
    assert(await title.isVisible(), "Main title #venues-title is visible");
    const titleHtml = await title.innerHTML();
    assert(titleHtml.includes("Venues &amp;"), "Title contains 'Venues &'");
    assert(titleHtml.includes("Directions") && titleHtml.includes("text-[#A67C1E]"), "Title features gold 'Directions'");

    const subtitle = venuesSection.locator("text=Two family homes. Four days of celebration.");
    assert(await subtitle.isVisible(), "Subtitle 'Two family homes. Four days of celebration.' is visible");

    // 2. Decorative Route Connection Checks
    const leftNode = venuesSection.locator("text=CHITMU • KOTSHILA").first();
    assert(await leftNode.isVisible(), "Route node 'Chitmu • Kotshila' is visible");

    const rightNode = venuesSection.locator("text=GHAGHRA • JAIPUR").first();
    assert(await rightNode.isVisible(), "Route node 'Ghaghra • Jaipur' is visible");

    const heartIcon = venuesSection.locator("svg path[d*='20.84']").first();
    assert(await heartIcon.count() >= 1, "Central heart ornament exists in route connection");

    // 3. Venue Card 01 (Groom's Home)
    console.log("\n  Checking Venue Card 01: Groom's Home...");
    const groomTitle = venuesSection.locator("#groom-venue-title");
    assert(await groomTitle.isVisible(), "Groom's Home title is visible");

    const groomCard = venuesSection.locator("article[aria-labelledby='groom-venue-title']");
    assert(await groomCard.count() >= 1, "Groom's Home article card is present");

    const groomBadge = groomCard.locator("text=Family Residence 01");
    assert(await groomBadge.isVisible(), "Badge 'Family Residence 01' is visible");

    const groomPin = groomCard.locator("text=PIN 723215");
    assert(await groomPin.isVisible(), "PIN '723215' is visible");

    const groomAddress = groomCard.locator("text=Chitmu, Kotshila, Purulia, West Bengal 723215");
    assert(await groomAddress.isVisible(), "Confirmed address 'Chitmu, Kotshila...' is visible");

    const groomHierarchy = groomCard.locator("text=Village: Chitmu • Block: Kotshila • District: Purulia");
    assert(await groomHierarchy.isVisible(), "Location hierarchy is visible");

    // Groom's Ceremonies (3 ceremonies)
    const haldiRow = groomCard.locator("text=Haldi");
    assert(await haldiRow.isVisible(), "Haldi celebration row is visible");
    const mehndiRow = groomCard.locator("text=Mehndi");
    assert(await mehndiRow.isVisible(), "Mehndi celebration row is visible");
    const receptionRow = groomCard.locator("text=Reception & Preetibhoj");
    assert(await receptionRow.isVisible(), "Reception & Preetibhoj celebration row is visible");

    const groomCelebrationRows = groomCard.locator("a[href^='#']");
    assert((await groomCelebrationRows.count()) === 3, "Groom's card has exactly 3 celebration rows");

    // Groom's Directions Button
    const groomDirBtn = groomCard.locator("a:has-text('Get Directions')");
    assert(await groomDirBtn.isVisible(), "Groom's 'Get Directions' button is visible");
    const groomMapsUrl = await groomDirBtn.getAttribute("href");
    assert(
      groomMapsUrl === "https://maps.app.goo.gl/Lt8BRMxAEUy371NVA",
      `Groom's button links to confirmed URL: ${groomMapsUrl}`
    );
    assert((await groomDirBtn.getAttribute("target")) === "_blank", "Opens in new tab safely");

    // 4. Venue Card 02 (Bride's Home)
    console.log("\n  Checking Venue Card 02: Bride's Home...");
    const brideTitle = venuesSection.locator("#bride-venue-title");
    assert(await brideTitle.isVisible(), "Bride's Home title is visible");

    const brideCard = venuesSection.locator("article[aria-labelledby='bride-venue-title']");
    assert(await brideCard.count() >= 1, "Bride's Home article card is present");

    const brideBadge = brideCard.locator("text=Family Residence 02");
    assert(await brideBadge.isVisible(), "Badge 'Family Residence 02' is visible");

    const bridePin = brideCard.locator("text=PIN 723201");
    assert(await bridePin.isVisible(), "PIN '723201' is visible");

    const brideAddress = brideCard.locator("text=Ghaghra, Jaipur, Purulia, West Bengal 723201");
    assert(await brideAddress.isVisible(), "Confirmed address 'Ghaghra, Jaipur...' is visible");

    const brideHierarchy = brideCard.locator("text=Village: Ghaghra • Block: Jaipur • District: Purulia");
    assert(await brideHierarchy.isVisible(), "Location hierarchy is visible");

    // Bride's Ceremony (Exactly 1 ceremony)
    const weddingRow = brideCard.locator("text=The Sacred Wedding");
    assert(await weddingRow.isVisible(), "The Sacred Wedding celebration row is visible");

    const brideCelebrationRows = brideCard.locator("a[href^='#']");
    assert((await brideCelebrationRows.count()) === 1, "Bride's card has exactly 1 celebration row");

    // Bride's Directions Button
    const brideDirBtn = brideCard.locator("a:has-text('Get Directions')");
    assert(await brideDirBtn.isVisible(), "Bride's 'Get Directions' button is visible");
    const brideMapsUrl = await brideDirBtn.getAttribute("href");
    assert(
      brideMapsUrl === "https://maps.app.goo.gl/x1zvibZRTMTNTWCn7",
      `Bride's button links to confirmed URL: ${brideMapsUrl}`
    );
    assert((await brideDirBtn.getAttribute("target")) === "_blank", "Opens in new tab safely");

    // 5. Card Heights Equality on Desktop
    const groomBox = await groomCard.boundingBox();
    const brideBox = await brideCard.boundingBox();
    const heightDiff = Math.abs(groomBox.height - brideBox.height);
    console.log(`  Card heights: Groom = ${groomBox.height}px, Bride = ${brideBox.height}px (Diff: ${heightDiff}px)`);
    assert(heightDiff <= 2, `Cards have equal desktop height (Diff: ${heightDiff}px <= 2px)`);

    // 6. Bottom Clarification Note
    const bottomNote = venuesSection.locator("text=All ceremony locations are family residences in Purulia district.");
    assert(await bottomNote.isVisible(), "Bottom clarification note is visible");

    // 7. No Horizontal Overflow
    const hasNoOverflow = await deskPage.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    assert(hasNoOverflow, "Zero horizontal overflow on desktop");

    // Scroll precisely so heading starts right below fixed navbar (60px)
    const sectionTop = await venuesSection.evaluate((el) => {
      let top = 0;
      let curr = el;
      while (curr) {
        top += curr.offsetTop;
        curr = curr.offsetParent;
      }
      return top;
    });
    await deskPage.evaluate((y) => window.scrollTo({ top: y - 60, behavior: "instant" }), sectionTop);
    await deskPage.waitForTimeout(600);

    // Hide floating music player temporarily for pristine section photography
    await deskPage.evaluate(() => {
      const player = document.querySelector('[class*="bottom-4 right-4"]');
      if (player) player.style.opacity = "0";
    });

    // Screenshot Desktop Viewport
    const shotDesk = path.join(SCREENSHOTS_DIR, "venues_directions_desktop_1440.png");
    await deskPage.screenshot({ path: shotDesk });
    console.log(`  📸 Saved viewport screenshot: ${shotDesk}`);

    // Screenshot Full Section Element
    const shotSection = path.join(SCREENSHOTS_DIR, "venues_directions_desktop_1440_fullsection.png");
    await venuesSection.screenshot({ path: shotSection });
    console.log(`  📸 Saved full section screenshot: ${shotSection}`);

    await deskContext.close();

    // =========================================================================
    // SUITE 2: RESPONSIVE VIEWPORTS (TABLET, MOBILE, NARROW MOBILE)
    // =========================================================================
    console.log("\nSUITE 2: Responsive Viewport Verification");
    const viewports = [
      { name: "tablet_768", width: 768, height: 1024 },
      { name: "mobile_390", width: 390, height: 844 },
      { name: "narrow_320", width: 320, height: 640 },
    ];

    for (const vp of viewports) {
      console.log(`\n  Testing Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);

      const sec = page.locator("#venues");
      await sec.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Verify essential elements
      const gTitle = sec.locator("#groom-venue-title");
      assert(await gTitle.isVisible(), `Groom's Home title visible on ${vp.name}`);

      const bTitle = sec.locator("#bride-venue-title");
      assert(await bTitle.isVisible(), `Bride's Home title visible on ${vp.name}`);

      const gBtn = sec.locator("article[aria-labelledby='groom-venue-title'] a:has-text('Get Directions')");
      assert(await gBtn.isVisible(), `Groom's button visible on ${vp.name}`);

      const bBtn = sec.locator("article[aria-labelledby='bride-venue-title'] a:has-text('Get Directions')");
      assert(await bBtn.isVisible(), `Bride's button visible on ${vp.name}`);

      // Check overflow
      const noOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      assert(noOverflow, `Zero horizontal overflow on ${vp.name}`);

      // Screenshot
      const shotPath = path.join(SCREENSHOTS_DIR, `venues_directions_${vp.name}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`  📸 Saved screenshot: ${shotPath}`);

      await ctx.close();
    }

    console.log("\n================================================================================");
    console.log(`ALL VERIFICATION TESTS COMPLETED: ${passedTests}/${totalTests} PASSED (100%)`);
    console.log("================================================================================\n");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("FATAL ERROR in test execution:", err);
  process.exit(1);
});
