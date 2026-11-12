// scripts/test_visual_surfaces_enhancement.mjs
// Verification of the website-wide visual enhancements: surfaces, cards, corner brackets, watermarks

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR =
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots";

async function main() {
  console.log("================================================================================");
  console.log("   WEBSITE-WIDE VISUAL ENHANCEMENT VERIFICATION (SURFACES & CARDS)");
  console.log("================================================================================");

  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  try {
    // 1. DESKTOP (1440x900)
    console.log("\n--- Testing Desktop Viewport (1440x900) ---");
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5,
    });
    const desktopPage = await desktopContext.newPage();

    console.log("Navigating to Homepage...");
    await desktopPage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(1000);

    // Section 1: Venues (#venues)
    console.log("Capturing Venues Section...");
    const venuesElem = desktopPage.locator("#venues");
    await venuesElem.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, "surfaces_venues_desktop_1440.png"),
      clip: await venuesElem.boundingBox(),
    });

    // Section 2: Celebrations (#celebrations)
    console.log("Capturing Celebrations Section...");
    const celebrationsElem = desktopPage.locator("#celebrations");
    await celebrationsElem.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, "surfaces_celebrations_desktop_1440.png"),
      clip: await celebrationsElem.boundingBox(),
    });

    // Section 3: Countdown (#countdown)
    console.log("Capturing Countdown Section...");
    const countdownElem = desktopPage.locator("#countdown");
    if (await countdownElem.count() > 0) {
      await countdownElem.scrollIntoViewIfNeeded();
      await desktopPage.waitForTimeout(600);
      await desktopPage.screenshot({
        path: path.join(SCREENSHOTS_DIR, "surfaces_countdown_desktop_1440.png"),
        clip: await countdownElem.boundingBox(),
      });
    }

    // Section 4: Family (#family)
    console.log("Capturing Family Section...");
    const familyElem = desktopPage.locator("#family");
    await familyElem.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, "surfaces_family_desktop_1440.png"),
      clip: await familyElem.boundingBox(),
    });

    // Section 5: Hospitality & Contact (#hospitality)
    console.log("Capturing Hospitality & Contact Section...");
    const hospitalityElem = desktopPage.locator("#hospitality");
    await hospitalityElem.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, "surfaces_hospitality_desktop_1440.png"),
      clip: await hospitalityElem.boundingBox(),
    });

    // Section 6: Wishes & Blessings (#wishes)
    console.log("Capturing Wishes Section...");
    const wishesElem = desktopPage.locator("#wishes");
    await wishesElem.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, "surfaces_wishes_desktop_1440.png"),
      clip: await wishesElem.boundingBox(),
    });

    // Section 7: RSVP Preview (#rsvp)
    console.log("Capturing RSVP Section...");
    const rsvpElem = desktopPage.locator("#rsvp");
    await rsvpElem.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, "surfaces_rsvp_desktop_1440.png"),
      clip: await rsvpElem.boundingBox(),
    });

    // Section 8: Invitation Preview (#invitation)
    console.log("Capturing Invitation Preview Section...");
    const invitationElem = desktopPage.locator("#invitation");
    await invitationElem.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, "surfaces_invitation_preview_desktop_1440.png"),
      clip: await invitationElem.boundingBox(),
    });

    // Dedicated Page 1: Gallery (/gallery)
    console.log("\nNavigating to /gallery...");
    await desktopPage.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, "surfaces_gallery_page_desktop_1440.png"),
      fullPage: false,
    });

    // Dedicated Page 2: Invitation (/invitation)
    console.log("Navigating to /invitation...");
    await desktopPage.goto(`${BASE_URL}/invitation`, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, "surfaces_invitation_page_desktop_1440.png"),
      fullPage: false,
    });

    // Dedicated Page 3: Login (/login)
    console.log("Navigating to /login...");
    await desktopPage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, "surfaces_auth_login_desktop_1440.png"),
      fullPage: false,
    });

    await desktopContext.close();

    // 2. MOBILE (390x844)
    console.log("\n--- Testing Mobile Viewport (390x844) ---");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();

    console.log("Capturing Mobile Venues...");
    await mobilePage.goto(`${BASE_URL}/#venues`, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(1000);
    const mobileVenues = mobilePage.locator("#venues");
    await mobileVenues.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({
      path: path.join(SCREENSHOTS_DIR, "surfaces_venues_mobile_390.png"),
      clip: await mobileVenues.boundingBox(),
    });

    console.log("Capturing Mobile Login...");
    await mobilePage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({
      path: path.join(SCREENSHOTS_DIR, "surfaces_auth_mobile_390.png"),
      fullPage: false,
    });

    await mobileContext.close();

    // 3. TABLET (768x1024)
    console.log("\n--- Testing Tablet Viewport (768x1024) ---");
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 2,
    });
    const tabletPage = await tabletContext.newPage();

    console.log("Capturing Tablet Celebrations...");
    await tabletPage.goto(`${BASE_URL}/#celebrations`, { waitUntil: "networkidle" });
    await tabletPage.waitForTimeout(1000);
    const tabletCelebrations = tabletPage.locator("#celebrations");
    await tabletCelebrations.scrollIntoViewIfNeeded();
    await tabletPage.waitForTimeout(600);
    await tabletPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, "surfaces_celebrations_tablet_768.png"),
      clip: await tabletCelebrations.boundingBox(),
    });

    await tabletContext.close();

    console.log("\n================================================================================");
    console.log("   ALL SCREENSHOTS CAPTURED SUCCESSFULLY!");
    console.log("================================================================================");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
