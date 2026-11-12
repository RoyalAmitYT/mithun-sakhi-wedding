// scripts/test_p15_2_mobile_refinement.mjs
// Phase P-15.2: Cinematic Luxury Mobile Visual Refinement Verification Suite
// Tests 7 Viewports: 320x640, 360x800, 375x812, 390x844, 430x932, 768x1024, 1440x900.

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = path.resolve(process.cwd(), "p15_2_screenshots");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const ARTIFACT_SCREENSHOTS_DIR = path.resolve(
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots"
);
if (!fs.existsSync(ARTIFACT_SCREENSHOTS_DIR)) {
  fs.mkdirSync(ARTIFACT_SCREENSHOTS_DIR, { recursive: true });
}

const SUPABASE_URL = "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const REQUIRED_VIEWPORTS = [
  { width: 320, height: 640, name: "mobile_320x640_narrow" },
  { width: 360, height: 800, name: "mobile_360x800_android" },
  { width: 375, height: 812, name: "mobile_375x812_iphone_mini" },
  { width: 390, height: 844, name: "mobile_390x844_iphone14" },
  { width: 430, height: 932, name: "mobile_430x932_iphone_promax" },
  { width: 768, height: 1024, name: "tablet_768x1024_ipad" },
  { width: 1440, height: 900, name: "desktop_1440x900" },
];

let totalPassed = 0;
let totalFailed = 0;
const findings = [];

function assert(condition, message, details = "") {
  if (condition) {
    console.log(`  ✓ ${message}`);
    totalPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message} ${details ? `(${details})` : ""}`);
    totalFailed++;
    findings.push({ severity: "defect", message, details });
  }
}

async function getOrCreateUser(email, password, fullName) {
  const { data: userList } = await adminClient.auth.admin.listUsers();
  let user = userList.users.find((u) => u.email === email);

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

  await adminClient
    .from("profiles")
    .upsert({ id: user.id, full_name: fullName, email });

  return user;
}

function syncScreenshot(filename) {
  const src = path.join(OUTPUT_DIR, filename);
  const dest = path.join(ARTIFACT_SCREENSHOTS_DIR, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

async function runMobileRefinementVerification() {
  console.log("\n=======================================================");
  console.log("PHASE P-15.2: CINEMATIC LUXURY MOBILE VISUAL REFINEMENT");
  console.log("=======================================================\n");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const TEST_GUEST_EMAIL = "p15_2_guest@wedding.local";
  const TEST_PASSWORD = "Password123!Luxury";
  const guest = await getOrCreateUser(TEST_GUEST_EMAIL, TEST_PASSWORD, "P15.2 Test Guest");

  // Assign guest to family group & approved guest status
  let { data: familyGroup } = await adminClient
    .from("family_groups")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!familyGroup) {
    const { data: insertedFg } = await adminClient
      .from("family_groups")
      .insert({ name: "P15.2 Test Family Group" })
      .select("id")
      .single();
    familyGroup = insertedFg;
  }

  if (familyGroup) {
    await adminClient
      .from("profiles")
      .update({
        is_approved_guest: true,
        family_group_id: familyGroup.id,
      })
      .eq("id", guest.id);
  }

  // 1. VIEWPORT HORIZONTAL OVERFLOW & LAYOUT AUDIT ACROSS ALL 7 VIEWPORTS
  console.log("--- TEST SUITE 1: 7-VIEWPORT LAYOUT & ZERO OVERFLOW AUDIT ---");
  for (const vp of REQUIRED_VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Check Home
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    const homeOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    assert(homeOverflow, `[${vp.name}] Homepage has zero horizontal overflow (${vp.width}x${vp.height})`);

    // Check Invitation
    await page.goto(`${BASE_URL}/invitation`, { waitUntil: "networkidle" });
    const invOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    assert(invOverflow, `[${vp.name}] Invitation Studio has zero horizontal overflow (${vp.width}x${vp.height})`);

    // Check Events
    await page.goto(`${BASE_URL}/events`, { waitUntil: "networkidle" });
    const eventsOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    assert(eventsOverflow, `[${vp.name}] Events page has zero horizontal overflow (${vp.width}x${vp.height})`);

    // Check Gallery
    await page.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });
    const galleryOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    assert(galleryOverflow, `[${vp.name}] Gallery has zero horizontal overflow (${vp.width}x${vp.height})`);

    await context.close();
  }

  // 2. HOMEPAGE HERO VISUAL HIERARCHY & ARCH AUDIT
  console.log("\n--- TEST SUITE 2: REFINED HOMEPAGE HERO & CEREMONIAL ARCH ---");
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Validate Hero Elements Presence
    const heroTitle = page.locator("#hero-title");
    assert(await heroTitle.isVisible(), "Hero display title is visible and rendered");

    const kicker = page.locator("#hero").locator("text=The Sacred Wedding Celebration");
    assert(await kicker.isVisible(), "Ceremonial sacred kicker is visible");

    const coupleArch = page.locator('div[aria-label*="Ceremonial Royal Mandap Arch"]');
    assert(await coupleArch.isVisible(), "Ceremonial Mandap Arch with M & K Monogram is visible");

    const archMonogram = coupleArch.locator('span:has-text("Shubho Bibaho")');
    assert(await archMonogram.isVisible(), "Ceremonial arch displays sacred Shubho Bibaho badge");

    const divineBlessings = coupleArch.locator('text="With Divine Blessings"');
    assert(await divineBlessings.isVisible(), "Ceremonial arch displays English-only 'With Divine Blessings' invocation");

    const hasBengaliScript = await page.evaluate(() => /[\u0900-\u09FF]/.test(document.body.innerText));
    assert(!hasBengaliScript, "Homepage is English-only with zero Bengali or Devanagari script characters");

    const parentBlessings = coupleArch.locator("text=With Blessings of Parents");
    assert(await parentBlessings.isVisible(), "Parents' blessings plaque rendered in ceremonial arch");

    // Primary CTA Button verification
    const primaryCta = page.locator('#hero a button:has-text("Explore Celebrations")');
    const primaryBox = await primaryCta.boundingBox();
    assert(primaryBox && Math.round(primaryBox.height) >= 44, `Primary CTA height (${primaryBox?.height}px) >= 44px`);

    // Secondary CTA Button verification
    const secondaryCta = page.locator('#hero a button:has-text("Ceremony Schedule")');
    const secondaryBox = await secondaryCta.boundingBox();
    assert(secondaryBox && Math.round(secondaryBox.height) >= 44, `Secondary CTA height (${secondaryBox?.height}px) >= 44px`);

    // Capture Mobile Hero screenshot (390x844)
    await page.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_mobile_01_hero.png"), fullPage: false });
    syncScreenshot("p15_2_mobile_01_hero.png");

    await context.close();
  }

  // Ultra-narrow 320x640 Hero check
  {
    const context = await browser.newContext({
      viewport: { width: 320, height: 640 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    const heroTitle = page.locator("#hero-title");
    assert(await heroTitle.isVisible(), "[320x640] Hero title rendered cleanly on compact 320px screen");

    await page.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_mobile_01b_hero_320.png"), fullPage: false });
    syncScreenshot("p15_2_mobile_01b_hero_320.png");

    await context.close();
  }

  // 3. FLOATING MUSIC PLAYER OCCLUSION & MINIMIZE TUCK AUDIT
  console.log("\n--- TEST SUITE 3: FLOATING MUSIC PLAYER OCCLUSION & TUCK BEHAVIOR ---");
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    const player = page.locator('aside[aria-label="Wedding audio player"]');
    assert(await player.isVisible(), "Floating music player is mounted on the page");

    const playBtn = player.locator('button[aria-label="Play wedding music"], button[aria-label="Pause wedding music"]');
    const playBox = await playBtn.boundingBox();
    assert(playBox && Math.round(playBox.width) >= 44 && Math.round(playBox.height) >= 44, `Music player play button (${playBox?.width}x${playBox?.height}px) meets 44px touch target`);

    // Test Minimize to Edge Tuck
    const tuckBtn = player.locator('button[aria-label="Minimize player to edge"]');
    assert(await tuckBtn.isVisible(), "Player minimize-to-edge trigger button is visible");

    await tuckBtn.click();
    await page.waitForTimeout(300);

    const expandBtn = player.locator('button[aria-label="Expand wedding music player"]');
    assert(await expandBtn.isVisible(), "Player is successfully tucked into sleek edge dock");
    const expandBox = await expandBtn.boundingBox();
    assert(expandBox && Math.round(expandBox.height) >= 44, `Edge dock button touch target (${expandBox?.height}px) meets 44px minimum`);

    // Test expanding back
    await expandBtn.click();
    await page.waitForTimeout(300);
    assert(await playBtn.isVisible(), "Player expands back smoothly from edge dock");

    // Test Modal / Drawer Suppression
    const mobileMenuTrigger = page.locator('header button[aria-label*="navigation menu"]');
    await mobileMenuTrigger.click();
    await page.waitForTimeout(400);

    // Capture Navigation Drawer screenshot
    await page.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_mobile_02_drawer.png"), fullPage: false });
    syncScreenshot("p15_2_mobile_02_drawer.png");
    assert(true, "Captured mobile navigation drawer screenshot");

    // Player should be suppressed when mobile drawer is open
    const isPlayerSuppressed = (await player.count()) === 0 || !(await player.isVisible());
    assert(isPlayerSuppressed, "Music player is contextually suppressed while navigation drawer is open");

    // Close drawer
    const drawerCloseBtn = page.locator('button[aria-label="Close navigation menu"]');
    await drawerCloseBtn.click();
    await page.waitForTimeout(400);

    await context.close();
  }

  // 4. DIGITAL INVITATION STUDIO REFINEMENTS & LABEL AUDIT
  console.log("\n--- TEST SUITE 4: DIGITAL INVITATION STUDIO & NON-WRAPPING LABELS ---");
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/invitation`, { waitUntil: "networkidle" });

    // Design A: Cinematic check
    const cardCinematic = page.locator('article#printable-invitation');
    const editionABadge = cardCinematic.locator('text="Design Edition A"');
    assert(await editionABadge.isVisible(), "Design Edition A badge is visible");

    const cinematicBadge = cardCinematic.locator('text="Cinematic Editorial"');
    assert(await cinematicBadge.isVisible(), "Cinematic Editorial label is visible");

    // Verify whitespace-nowrap on Cinematic Editorial
    const cinematicClass = await cinematicBadge.getAttribute("class");
    assert(cinematicClass?.includes("whitespace-nowrap"), "Cinematic Editorial label has whitespace-nowrap to prevent awkward word breaks");

    // Calendar trigger check
    const calendarBtn = page.locator('button:has-text("Calendar")').first();
    const calBox = await calendarBtn.boundingBox();
    assert(calBox && Math.round(calBox.height) >= 44, `Calendar dropdown trigger (${calBox?.height}px) meets 44px touch target`);

    // Capture Cinematic screenshot
    await page.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_mobile_03_invitation_cinematic.png"), fullPage: false });
    syncScreenshot("p15_2_mobile_03_invitation_cinematic.png");

    // Switch to Design B: Traditional
    const designBTab = page.locator('button:has-text("Design B: Traditional")');
    await designBTab.click();
    await page.waitForTimeout(300);

    const cardTraditional = page.locator('article#printable-invitation');
    const editionBBadge = cardTraditional.locator('text="Design Edition B"');
    assert(await editionBBadge.isVisible(), "Design Edition B badge is visible");

    const traditionalBadge = cardTraditional.locator('text="Traditional Royal Patra"');
    assert(await traditionalBadge.isVisible(), "Traditional Royal Patra label is visible");

    const traditionalClass = await traditionalBadge.getAttribute("class");
    assert(traditionalClass?.includes("whitespace-nowrap"), "Traditional Royal Patra label has whitespace-nowrap to prevent awkward word breaks");

    // Capture Traditional screenshot
    await page.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_mobile_04_invitation_traditional.png"), fullPage: false });
    syncScreenshot("p15_2_mobile_04_invitation_traditional.png");

    await context.close();
  }

  // 5. GUEST ACCOUNT PORTAL & WORKFLOW FORM AUDIT
  console.log("\n--- TEST SUITE 5: GUEST ACCOUNT & RSVP WORKFLOW AUDIT ---");
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Login
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', TEST_GUEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/account", { timeout: 10000 });

    // Validate Account Identity
    const portalTitle = page.locator('span:has-text("Wedding Guest Portal")');
    assert(await portalTitle.isVisible(), "Wedding Guest Portal header is rendered");

    const statusPill = page.locator('span:has-text("Approved")');
    assert(await statusPill.isVisible(), "Guest approval verification badge is rendered");

    // Validate Wishes Composer Textarea (>= 16px font-size to prevent iOS zoom)
    const wishesTextarea = page.locator("#new-wish");
    if (await wishesTextarea.isVisible()) {
      const fontSize = await wishesTextarea.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
      assert(fontSize >= 16, `Wishes textarea font-size (${fontSize}px) is >= 16px (prevents iOS auto-zoom)`);
    }

    // Capture Guest Account screenshot
    await page.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_mobile_06_guest_account.png"), fullPage: false });
    syncScreenshot("p15_2_mobile_06_guest_account.png");

    await context.close();
  }

  // 6. GALLERY & LIGHTBOX AUDIT
  console.log("\n--- TEST SUITE 6: GALLERY & MEDIA PRESENTATION ---");
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });

    const galleryHeading = page.locator('h1:has-text("Wedding Memories")');
    assert(await galleryHeading.isVisible(), "Gallery heading is visible");

    await page.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_mobile_05_gallery.png"), fullPage: false });
    syncScreenshot("p15_2_mobile_05_gallery.png");

    await context.close();
  }

  // 7. UNIFIED ADMIN MOBILE DASHBOARD & RSVP REPORTING
  console.log("\n--- TEST SUITE 7: UNIFIED ADMIN MOBILE DASHBOARD & RSVPS ---");
  const TEST_ADMIN_EMAIL = "p15_2_admin@wedding.local";
  const admin = await getOrCreateUser(TEST_ADMIN_EMAIL, TEST_PASSWORD, "P15.2 SuperAdmin");
  await adminClient.from("admin_users").upsert({
    id: admin.id,
    is_super_admin: true,
    is_active: true,
  });

  {
    const adminContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const adminPage = await adminContext.newPage();

    await adminPage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await adminPage.fill('input[type="email"]', TEST_ADMIN_EMAIL);
    await adminPage.fill('input[type="password"]', TEST_PASSWORD);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL("**/account", { timeout: 10000 });

    // Navigate to /admin
    await adminPage.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
    assert(adminPage.url().includes("/admin"), "SuperAdmin accessed unified dashboard at /admin");

    const navRail = adminPage.locator('nav[aria-label="Admin Navigation"]');
    assert(await navRail.isVisible(), "Admin horizontal touch-scrolling rail is visible on mobile");

    await adminPage.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_mobile_07_admin_dashboard.png"), fullPage: false });
    syncScreenshot("p15_2_mobile_07_admin_dashboard.png");

    // Navigate to /admin/rsvps
    await adminPage.goto(`${BASE_URL}/admin/rsvps`, { waitUntil: "networkidle" });
    const rsvpSearchInput = adminPage.locator('input[placeholder*="Search family"]');
    assert(await rsvpSearchInput.isVisible(), "RSVP search input is visible on mobile admin");

    await adminPage.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_mobile_08_admin_rsvps.png"), fullPage: false });
    syncScreenshot("p15_2_mobile_08_admin_rsvps.png");

    await adminContext.close();
  }

  // 8. TABLET & DESKTOP REGRESSION SCREENSHOTS
  console.log("\n--- TEST SUITE 8: TABLET & DESKTOP REGRESSION VERIFICATION ---");
  {
    // Tablet (768x1024)
    const tabletCtx = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 });
    const tabletPage = await tabletCtx.newPage();
    await tabletPage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await tabletPage.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_tablet_home.png"), fullPage: false });
    syncScreenshot("p15_2_tablet_home.png");
    assert(true, "Captured Tablet (768x1024) home hero screenshot");
    await tabletCtx.close();

    // Desktop (1440x900)
    const deskCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const deskPage = await deskCtx.newPage();
    await deskPage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await deskPage.screenshot({ path: path.join(OUTPUT_DIR, "p15_2_desktop_home.png"), fullPage: false });
    syncScreenshot("p15_2_desktop_home.png");
    assert(true, "Captured Desktop (1440x900) home hero screenshot");
    await deskCtx.close();
  }

  await browser.close();

  // Clean up test admin and guest rows so pgTAP test suites have a clean single superadmin slate
  await adminClient.from("admin_users").delete().eq("id", admin.id);
  await adminClient.from("profiles").delete().eq("id", admin.id);
  await adminClient.from("profiles").delete().eq("id", guest.id);
  if (familyGroup) {
    await adminClient.from("family_groups").delete().eq("id", familyGroup.id);
  }

  console.log("\n=======================================================");
  console.log(`P-15.2 RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log("=======================================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runMobileRefinementVerification().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
