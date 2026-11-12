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
  console.log("TEST SUITE: FOUR CINEMATIC FULLSCREEN CEREMONY SECTIONS VERIFICATION");
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
    // SUITE 1: DESKTOP VIEWPORT (1440x900) - CEREMONY SECTIONS & STICKY STACKING
    // =========================================================================
    console.log("SUITE 1: Desktop Viewport (1440x900) - Four Ceremony Sections Verification");
    const deskContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const deskPage = await deskContext.newPage();
    await deskPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await deskPage.waitForTimeout(2000);

    const ceremoniesStack = deskPage.locator("#ceremonies-stack");
    const count = await ceremoniesStack.count();
    console.log("DEBUG: ceremonies-stack count is", count, "page URL is", deskPage.url());
    assert(count >= 1, "#ceremonies-stack container is present");

    const ceremonies = [
      {
        id: "haldi",
        dayLabel: "DAY 01",
        kicker: "HALDI CEREMONY",
        title: "Haldi Ceremony",
        date: "19 November 2026",
        time: "9:00 AM IST",
        venue: "Groom's Home",
        mapUrl: "https://maps.app.goo.gl/Lt8BRMxAEUy371NVA",
        imageSubstr: "haldi-section-bg-portrait",
      },
      {
        id: "mehndi",
        dayLabel: "DAY 02",
        kicker: "MEHNDI CEREMONY",
        title: "Mehndi Ceremony",
        date: "20 November 2026",
        time: "9:00 AM IST",
        venue: "Groom's Home",
        mapUrl: "https://maps.app.goo.gl/Lt8BRMxAEUy371NVA",
        imageSubstr: "mehendi-portrait",
      },
      {
        id: "wedding",
        dayLabel: "DAY 03",
        kicker: "THE SACRED WEDDING",
        title: "The Sacred Wedding",
        date: "21 November 2026",
        time: "11:00 PM IST",
        venue: "Bride's Home",
        mapUrl: "https://maps.app.goo.gl/x1zvibZRTMTNTWCn7",
        imageSubstr: "the-sacred-wedding",
      },
      {
        id: "reception",
        dayLabel: "DAY 04",
        kicker: "RECEPTION & PREETIBHOJ",
        title: "Reception & Preetibhoj",
        date: "22 November 2026",
        time: "5:00 PM IST",
        venue: "Groom's Home",
        mapUrl: "https://maps.app.goo.gl/Lt8BRMxAEUy371NVA",
        imageSubstr: "reception-section-bg-portrait",
      },
    ];

    for (const c of ceremonies) {
      console.log(`\n  Checking Section #${c.id}...`);
      const section = deskPage.locator(`#${c.id}`);
      assert((await section.count()) >= 1, `Section #${c.id} exists`);

      // Scroll section into view
      await section.scrollIntoViewIfNeeded();
      await deskPage.waitForTimeout(600);

      // Verify Eyebrow & Kicker
      const kickerText = await section.locator("div.select-none").first().innerText();
      assert(kickerText.includes(c.dayLabel), `Section #${c.id} contains ${c.dayLabel}`);
      assert(kickerText.includes(c.kicker), `Section #${c.id} contains ${c.kicker}`);

      // Verify Main Heading
      const heading = section.locator(`#${c.id}-title`);
      assert(await heading.isVisible(), `Heading #${c.id}-title is visible`);
      const headingText = await heading.innerText();
      assert(headingText.replace(/\s+/g, " ").includes(c.title), `Heading text matches '${c.title}'`);

      // Verify Live Countdown
      const countdown = section.locator("div[role='timer']");
      if ((await countdown.count()) > 0) {
        assert(await countdown.isVisible(), `Countdown timer is visible in #${c.id}`);
        const countdownText = (await countdown.innerText()).toUpperCase();
        console.log(`    Timer text in #${c.id}: ${countdownText.replace(/\n+/g, " ")}`);
        assert(
          countdownText.includes("DAY") &&
            countdownText.includes("HOUR") &&
            countdownText.includes("MIN") &&
            countdownText.includes("SEC"),
          `Countdown in #${c.id} displays Days, Hours, Minutes, Seconds`
        );
      } else {
        // Lifecycle concluded state fallback
        console.log(`  ℹ Info: #${c.id} is in concluded or underway state`);
      }

      // Verify Metadata (Date, Time, Venue)
      const sectionText = await section.innerText();
      assert(sectionText.includes(c.date), `Section #${c.id} displays correct date '${c.date}'`);
      assert(sectionText.includes(c.time), `Section #${c.id} displays correct time '${c.time}'`);
      assert(sectionText.includes(c.venue), `Section #${c.id} displays correct venue '${c.venue}'`);

      // Verify Action Buttons
      const calendarBtn = section.locator("a:has-text('Add to Calendar')");
      assert(await calendarBtn.isVisible(), `'Add to Calendar' button visible in #${c.id}`);
      const calHref = await calendarBtn.getAttribute("href");
      assert(calHref.includes("calendar.google.com"), `'Add to Calendar' links to Google Calendar`);
      assert(
        (await calendarBtn.getAttribute("target")) === "_blank",
        `'Add to Calendar' opens in new tab`
      );

      const directionsBtn = section.locator("a:has-text('Get Directions')");
      assert(await directionsBtn.isVisible(), `'Get Directions' button visible in #${c.id}`);
      const dirHref = await directionsBtn.getAttribute("href");
      assert(dirHref === c.mapUrl, `'Get Directions' links to verified URL: ${c.mapUrl}`);
      assert(
        (await directionsBtn.getAttribute("target")) === "_blank",
        `'Get Directions' opens in new tab`
      );

      // Verify Background Image
      const bgImg = section.locator("img").first();
      assert(await bgImg.isVisible(), `Background portrait image visible in #${c.id}`);
      const imgSrc = await bgImg.getAttribute("src");
      assert(
        imgSrc.includes(c.imageSubstr),
        `Background portrait matches '${c.imageSubstr}' (got: ${imgSrc})`
      );

      // Verify No Horizontal Overflow
      const overflow = await deskPage.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      assert(overflow, `No horizontal overflow at #${c.id}`);

      // Capture desktop screenshot
      const shotPath = path.join(SCREENSHOTS_DIR, `ceremony_${c.id}_desktop_1440.png`);
      await deskPage.screenshot({ path: shotPath });
      console.log(`  📸 Saved screenshot: ${shotPath}`);
    }

    // =========================================================================
    // SUITE 2: NAVBAR DYNAMIC SURFACE TRANSITION TEST
    // =========================================================================
    console.log("\nSUITE 2: Dynamic Navbar Dark / Light Glass Surface Transitions");
    const navbar = deskPage.locator("header");

    // 1. At Hero (top)
    await deskPage.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await deskPage.waitForTimeout(600);
    let navClass = await navbar.getAttribute("class");
    assert(
      navClass.includes("bg-transparent"),
      "Navbar is transparent over Hero at top=0"
    );

    // 2. Over Celebrations Overview
    const celebrationsSection = deskPage.locator("#celebrations");
    await celebrationsSection.scrollIntoViewIfNeeded();
    await deskPage.waitForTimeout(600);
    navClass = await navbar.getAttribute("class");
    assert(
      navClass.includes("bg-[#FFFCF6]/92") || navClass.includes("backdrop-blur"),
      "Navbar is light champagne/glass over Celebrations Overview"
    );

    // 3. Over Haldi Ceremony
    const haldiSection = deskPage.locator("#haldi");
    await haldiSection.scrollIntoViewIfNeeded();
    await deskPage.waitForTimeout(600);
    navClass = await navbar.getAttribute("class");
    assert(
      navClass.includes("bg-black/40") || navClass.includes("border-white/10"),
      "Navbar transitions to dark glass over Ceremony Section (#haldi)"
    );

    // 4. Over Reception Ceremony
    const receptionSection = deskPage.locator("#reception");
    await receptionSection.scrollIntoViewIfNeeded();
    await deskPage.waitForTimeout(600);
    navClass = await navbar.getAttribute("class");
    assert(
      navClass.includes("bg-black/40") || navClass.includes("border-white/10"),
      "Navbar remains dark glass over Ceremony Section (#reception)"
    );

    // 5. Over Venues Section
    const venuesSection = deskPage.locator("#venues");
    await venuesSection.scrollIntoViewIfNeeded();
    await deskPage.waitForTimeout(600);
    navClass = await navbar.getAttribute("class");
    assert(
      navClass.includes("bg-[#FFFCF6]/92") || navClass.includes("backdrop-blur"),
      "Navbar restores light champagne appearance over Venues Section"
    );

    await deskContext.close();

    // =========================================================================
    // SUITE 3: RESPONSIVE VIEWPORTS (TABLET 768x1024, MOBILE 390x844, NARROW 320x640)
    // =========================================================================
    console.log("\nSUITE 3: Responsive Viewport Verification");
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

      for (const c of ceremonies) {
        const sec = page.locator(`#${c.id}`);
        await sec.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        // Verify elements are visible
        const heading = sec.locator(`#${c.id}-title`);
        assert(await heading.isVisible(), `Heading #${c.id}-title visible on ${vp.name}`);

        const calBtn = sec.locator("a:has-text('Add to Calendar')");
        assert(await calBtn.isVisible(), `'Add to Calendar' button visible on ${vp.name}`);

        const dirBtn = sec.locator("a:has-text('Get Directions')");
        assert(await dirBtn.isVisible(), `'Get Directions' button visible on ${vp.name}`);

        // Horizontal overflow check
        const hasNoOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth <= window.innerWidth;
        });
        assert(hasNoOverflow, `No horizontal overflow at #${c.id} on ${vp.name}`);
      }

      // Capture screenshot of Haldi and Wedding on this viewport
      const haldi = page.locator("#haldi");
      await haldi.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const shotHaldi = path.join(SCREENSHOTS_DIR, `ceremony_haldi_${vp.name}.png`);
      await page.screenshot({ path: shotHaldi });
      console.log(`  📸 Saved screenshot: ${shotHaldi}`);

      const wedding = page.locator("#wedding");
      await wedding.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const shotWedding = path.join(SCREENSHOTS_DIR, `ceremony_wedding_${vp.name}.png`);
      await page.screenshot({ path: shotWedding });
      console.log(`  📸 Saved screenshot: ${shotWedding}`);

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
