import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";

const BASE_URL = "http://localhost:3000";
const SUPABASE_URL = "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SCREENSHOT_DIR = path.resolve(
  process.env.USERPROFILE || process.env.HOME || "",
  ".gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots"
);

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

let passed = 0;
let failed = 0;

function assert(condition, message, details = "") {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message} ${details ? `(${details})` : ""}`);
    failed++;
  }
}

async function getOrCreateAdminUser(email, password, fullName) {
  const { data: userList } = await adminClient.auth.admin.listUsers();
  let user = userList?.users?.find((u) => u.email === email);

  if (!user) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw error;
    user = data.user;
  } else {
    await adminClient.auth.admin.updateUserById(user.id, {
      password,
      user_metadata: { full_name: fullName },
    });
  }

  // Ensure admin entry exists
  await adminClient.from("admin_users").upsert({
    id: user.id,
    is_super_admin: true,
    is_active: true,
  });

  return user;
}

async function runTests() {
  console.log("\n========================================================");
  console.log("  OFFICIAL DIGITAL WEDDING INVITATION INTEGRATION TESTS");
  console.log("========================================================\n");

  const TEST_ADMIN_EMAIL = "mithun@wedding.local";
  const TEST_PASSWORD = "Password123!Secure";
  await getOrCreateAdminUser(TEST_ADMIN_EMAIL, TEST_PASSWORD, "Mithun Gorain");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  try {
    // ------------------------------------------------------------------
    // TEST 1: CANONICAL ASSET VERIFICATION ON FILESYSTEM & HTTP
    // ------------------------------------------------------------------
    console.log("--- 1. Testing Canonical Official Image Asset ---");
    const assetPath = path.resolve("public/images/mithun&sakhi-wedding-invitation.webp");
    assert(
      fs.existsSync(assetPath),
      `Canonical image asset exists at public/images/mithun&sakhi-wedding-invitation.webp`
    );

    // Old images must NOT exist in public/images
    const oldAssets = [
      "public/images/wedding-invitation-cinematic.png",
      "public/images/wedding-invitation-traditional.png",
      "public/images/wedding-invitation-official.png",
    ];
    for (const oldAsset of oldAssets) {
      assert(
        !fs.existsSync(path.resolve(oldAsset)),
        `Retired asset permanently removed: ${oldAsset}`
      );
    }

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // ------------------------------------------------------------------
    // TEST 2: HOMEPAGE DIGITAL INVITATION PREVIEW SECTION (#invitation)
    // ------------------------------------------------------------------
    console.log("\n--- 2. Testing Homepage Digital Invitation Preview ---");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const homeInvitationSection = await page.$("section#invitation");
    assert(homeInvitationSection !== null, "Homepage renders <section id='invitation'>");

    // Scroll to section
    await page.evaluate(() => {
      document.getElementById("invitation")?.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(500);

    const homeImage = await page.$("section#invitation img");
    assert(homeImage !== null, "Homepage preview displays invitation image");

    const homeImageSrc = await homeImage.getAttribute("src");
    assert(
      homeImageSrc.includes("mithun%26sakhi-wedding-invitation.webp") ||
      homeImageSrc.includes("mithun&sakhi-wedding-invitation.webp"),
      `Homepage preview uses canonical image asset (src: ${homeImageSrc})`
    );

    // Verify aspect ratio preservation
    const homeImageBox = await homeImage.boundingBox();
    if (homeImageBox) {
      const ratio = homeImageBox.width / homeImageBox.height;
      const expectedRatio = 1087 / 1447;
      const ratioDiff = Math.abs(ratio - expectedRatio);
      assert(
        ratioDiff < 0.05,
        `Homepage preview preserves original aspect ratio (actual ratio: ${ratio.toFixed(4)}, expected: ${expectedRatio.toFixed(4)})`
      );
    }

    // Verify action buttons on homepage
    const homeViewFullBtn = await page.$("section#invitation a[href='/invitation']");
    assert(homeViewFullBtn !== null, "Homepage preview has 'View Full Invitation' link to /invitation");

    const homeDownloadBtn = await page.$("section#invitation a[download*='mithun']");
    assert(homeDownloadBtn !== null, "Homepage preview has direct 'Download Card' button");
    const downloadHref = await homeDownloadBtn.getAttribute("href");
    assert(
      downloadHref.includes("mithun&sakhi-wedding-invitation.webp"),
      `Download href points to official WebP asset (actual: ${downloadHref})`
    );

    const homeScreenshot = path.join(SCREENSHOT_DIR, "invitation_homepage_preview.png");
    await page.screenshot({ path: homeScreenshot, fullPage: false });
    console.log(`  📸 Saved screenshot: ${homeScreenshot}`);

    // ------------------------------------------------------------------
    // TEST 3: PUBLIC /invitation PAGE
    // ------------------------------------------------------------------
    console.log("\n--- 3. Testing Public /invitation Page ---");
    const invResponse = await page.goto(`${BASE_URL}/invitation`, { waitUntil: "networkidle" });
    assert(invResponse.status() === 200, "Unauthenticated public visitor receives HTTP 200 on /invitation");
    await page.waitForTimeout(600);

    const publicHeading = await page.$("h1:has-text('The Wedding Invitation')");
    assert(publicHeading !== null, "Public /invitation renders 'The Wedding Invitation' heading");

    // Central card image
    const publicCardImg = await page.$("main img");
    assert(publicCardImg !== null, "Public page displays central invitation card image");

    const publicCardSrc = await publicCardImg.getAttribute("src");
    assert(
      publicCardSrc.includes("mithun%26sakhi-wedding-invitation.webp") ||
      publicCardSrc.includes("mithun&sakhi-wedding-invitation.webp"),
      `Public page uses canonical official WebP asset (src: ${publicCardSrc})`
    );

    // Verify NO design switcher exists on public page
    const publicSwitcher = await page.$("button:has-text('Design A')");
    const publicSwitcherB = await page.$("button:has-text('Design B')");
    const publicSwitcherTrad = await page.$("button:has-text('Traditional')");
    assert(
      publicSwitcher === null && publicSwitcherB === null && publicSwitcherTrad === null,
      "Public /invitation page has strictly NO template or design switcher buttons"
    );

    // Action buttons
    const publicDownloadBtn = await page.$("a[download*='mithun']");
    assert(publicDownloadBtn !== null, "Public page renders 'Download Official Card' button");

    const publicCalendarBtn = await page.$("button:has-text('Add to Calendar')");
    assert(publicCalendarBtn !== null, "Public page provides 'Add to Calendar' dropdown");

    const publicRsvpBtn = await page.$("a[href='/rsvp']");
    assert(publicRsvpBtn !== null, "Public page provides 'Confirm RSVP' button linking to /rsvp");

    const publicScreenshot = path.join(SCREENSHOT_DIR, "invitation_public_page_desktop.png");
    await page.screenshot({ path: publicScreenshot, fullPage: false });
    console.log(`  📸 Saved screenshot: ${publicScreenshot}`);

    // ------------------------------------------------------------------
    // TEST 4: ADMIN /admin/invitation STUDIO (AUTHORIZATION & INTERFACE)
    // ------------------------------------------------------------------
    console.log("\n--- 4. Testing Admin /admin/invitation Studio ---");

    // 4.1 Unauthenticated access redirect check
    const unauthContext = await browser.newContext();
    const unauthPage = await unauthContext.newPage();
    await unauthPage.goto(`${BASE_URL}/admin/invitation`, { waitUntil: "networkidle" });
    assert(
      unauthPage.url().includes("/login") || unauthPage.url().includes("/account"),
      `Unauthenticated visitor is blocked from /admin/invitation (redirected to ${unauthPage.url()})`
    );
    await unauthContext.close();

    // 4.2 Sign in as admin
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    const signInTab = await page.$("button:has-text('SIGN IN')");
    if (signInTab) await signInTab.click();
    await page.waitForTimeout(300);

    await page.fill("input[type='email']", TEST_ADMIN_EMAIL);
    await page.fill("input[name='password']", TEST_PASSWORD);
    await page.click("button:has-text('SIGN IN TO YOUR ACCOUNT')");
    await page.waitForTimeout(1000);

    // Navigate to /admin/invitation
    await page.goto(`${BASE_URL}/admin/invitation`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const adminHeading = await page.$("h1:has-text('Invitation Studio')");
    assert(adminHeading !== null, "Admin page renders 'Invitation Studio & Asset Management'");

    // Verify admin preview displays canonical image
    const adminImg = await page.$("main img[alt*='Official Wedding Invitation']");
    assert(adminImg !== null, "Admin Studio displays official invitation card preview");

    const adminImgSrc = await adminImg?.getAttribute("src");
    assert(
      adminImgSrc?.includes("mithun%26sakhi-wedding-invitation.webp") ||
      adminImgSrc?.includes("mithun&sakhi-wedding-invitation.webp"),
      `Admin Studio uses canonical image asset (src: ${adminImgSrc})`
    );

    // Verify Design A / Design B selector has been removed
    const adminDesignA = await page.$("button:has-text('Design A')");
    const adminDesignB = await page.$("button:has-text('Design B')");
    const adminRadioA = await page.$("input[value='traditional']");
    assert(
      adminDesignA === null && adminDesignB === null && adminRadioA === null,
      "Admin Studio has strictly NO template switcher or Edition A/B radio buttons"
    );

    // Verify useful management controls remain intact
    const adminDownloadBtn = await page.$("button:has-text('Download WebP')");
    assert(adminDownloadBtn !== null, "Admin Studio provides 'Download WebP' button");

    const adminPrintPdfBtn = await page.$("button:has-text('Print PDF')");
    assert(adminPrintPdfBtn !== null, "Admin Studio provides 'Print PDF' button");

    const adminShareBtn = await page.$("button:has-text('Share Link')");
    assert(adminShareBtn !== null, "Admin Studio provides 'Share Link' button");

    const adminScreenshot = path.join(SCREENSHOT_DIR, "invitation_admin_studio_desktop.png");
    await page.screenshot({ path: adminScreenshot, fullPage: false });
    console.log(`  📸 Saved screenshot: ${adminScreenshot}`);

    // ------------------------------------------------------------------
    // TEST 5: MOBILE RESPONSIVENESS (390x844 iPhone 14)
    // ------------------------------------------------------------------
    console.log("\n--- 5. Testing Mobile Public /invitation Page (390x844) ---");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE_URL}/invitation`, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(600);

    const mobileCard = await mobilePage.$("main img");
    assert(mobileCard !== null, "Mobile page renders invitation card image");

    // Check horizontal overflow
    const mobileDimensions = await mobilePage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    assert(
      mobileDimensions.scrollWidth <= mobileDimensions.clientWidth,
      `Mobile page has strictly NO horizontal overflow (${mobileDimensions.scrollWidth} <= ${mobileDimensions.clientWidth})`
    );

    const mobileScreenshot = path.join(SCREENSHOT_DIR, "invitation_public_page_mobile.png");
    await mobilePage.screenshot({ path: mobileScreenshot, fullPage: false });
    console.log(`  📸 Saved screenshot: ${mobileScreenshot}`);

    await context.close();
    await mobileContext.close();
  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log("\n========================================================");
  console.log(`  SUMMARY: Passed: ${passed} | Failed: ${failed}`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
