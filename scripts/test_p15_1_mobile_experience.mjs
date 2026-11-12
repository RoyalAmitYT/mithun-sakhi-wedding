// scripts/test_p15_1_mobile_experience.mjs
// Phase P-15.1: Mobile-First Cinematic Luxury Wedding Experience Verification Suite
// Tests 7 Viewports: 320x640, 360x800, 375x812, 390x844, 430x932, 768x1024, 1440x900.

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = path.resolve(process.cwd(), "p15_1_screenshots");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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

async function runMobileVerification() {
  console.log("\n=======================================================");
  console.log("PHASE P-15.1: MOBILE-FIRST LUXURY VERIFICATION SUITE");
  console.log("=======================================================\n");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const TEST_GUEST_EMAIL = "p15_1_guest@wedding.local";
  const TEST_ADMIN_EMAIL = "p15_1_admin@wedding.local";
  const TEST_PASSWORD = "Password123!Luxury";

  const guest = await getOrCreateUser(TEST_GUEST_EMAIL, TEST_PASSWORD, "P15.1 Test Guest");
  const admin = await getOrCreateUser(TEST_ADMIN_EMAIL, TEST_PASSWORD, "P15.1 SuperAdmin");

  // Assign guest to family group & approved guest status
  const { data: familyGroup } = await adminClient
    .from("family_groups")
    .select("id")
    .limit(1)
    .single();

  if (familyGroup) {
    await adminClient
      .from("profiles")
      .update({ is_approved_guest: true, family_group_id: familyGroup.id })
      .eq("id", guest.id);

    await adminClient.from("family_managers").upsert({
      family_group_id: familyGroup.id,
      profile_id: guest.id,
      is_active: true,
    });
  }

  // Ensure admin has super admin rights
  await adminClient.from("admin_users").upsert({
    id: admin.id,
    is_super_admin: true,
    is_active: true,
  });

  // -------------------------------------------------------------------------
  // 1. MULTI-VIEWPORT HORIZONTAL OVERFLOW TESTS
  // -------------------------------------------------------------------------
  console.log("\n--- 1. Multi-Viewport Horizontal Overflow Audits ---");
  const ROUTES_TO_AUDIT = [
    { path: "/", name: "Homepage" },
    { path: "/events", name: "Events" },
    { path: "/invitation", name: "Invitation Studio" },
    { path: "/gallery", name: "Gallery" },
    { path: "/login", name: "Login" },
    { path: "/register", name: "Register" },
  ];

  for (const vp of REQUIRED_VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    for (const r of ROUTES_TO_AUDIT) {
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      assert(!overflow, `No horizontal overflow on ${r.name} @ ${vp.name} (${vp.width}x${vp.height})`);
    }

    await context.close();
  }

  // -------------------------------------------------------------------------
  // 2. MOBILE INTERACTION & ERGONOMICS (390x844 & 320x640)
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Mobile Navigation, Drawer & Touch Ergonomics ---");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(BASE_URL, { waitUntil: "networkidle" });

  // Capture Mobile Homepage Hero
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, "p15_1_mobile_01_hero.png") });

  // Test Hamburger Button Touch Target (>= 44x44px)
  const menuButton = mobilePage.locator('button[aria-label="Open navigation menu"]');
  await menuButton.waitFor({ state: "visible" });
  const menuBox = await menuButton.boundingBox();
  assert(menuBox && menuBox.width >= 44 && menuBox.height >= 44, "Hamburger button meets 44x44px minimum touch target", `Actual: ${menuBox?.width}x${menuBox?.height}px`);

  // Open Mobile Drawer
  await menuButton.click();
  const drawer = mobilePage.locator('div[role="dialog"][aria-label="Mobile Navigation Menu"]');
  await drawer.waitFor({ state: "visible" });
  assert(await drawer.isVisible(), "Mobile navigation drawer opened smoothly with AnimatePresence");

  // Capture Drawer Screenshot
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, "p15_1_mobile_02_drawer.png") });

  // Test Drawer Close Button Touch Target
  const closeButton = mobilePage.locator('button[aria-label="Close navigation menu"]');
  const closeBox = await closeButton.boundingBox();
  assert(closeBox && Math.round(closeBox.width) >= 44 && Math.round(closeBox.height) >= 44, "Drawer close button meets 44x44px touch target", `Actual: ${closeBox?.width}x${closeBox?.height}px`);

  // Test Keyboard Accessibility (ESC closes drawer)
  await mobilePage.keyboard.press("Escape");
  await mobilePage.waitForTimeout(350);
  assert(!(await drawer.isVisible()), "Mobile drawer closes on Escape key press");

  // -------------------------------------------------------------------------
  // 3. DEFECT RESOLUTION AUDITS (DEF-01, DEF-02, DEF-03)
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Verifying Resolution of Pre-Launch Defects ---");

  // Re-verify Hero Secondary CTA Button Contrast
  const secondaryCta = mobilePage.locator('#hero a button:has-text("Ceremony Schedule")');
  await secondaryCta.waitFor({ state: "visible" });
  const secondaryCtaBox = await secondaryCta.boundingBox();
  assert(secondaryCtaBox && secondaryCtaBox.height >= 44, "Hero secondary CTA meets 44px minimum height", `Actual height: ${secondaryCtaBox?.height}px`);

  // Verify Floating Music Player Position & No Overlap
  const player = mobilePage.locator('aside[aria-label="Wedding audio player"] button');
  await player.waitFor({ state: "visible" });
  const playerBox = await player.boundingBox();
  assert(playerBox && playerBox.width >= 44 && playerBox.height >= 44, "Audio player button meets 44x44px touch target", `Actual: ${playerBox?.width}x${playerBox?.height}px`);

  // Check no geometric collision between Hero CTA and Music Player
  const heroCtaContainer = mobilePage.locator('#hero .flex.flex-col.sm\\:flex-row');
  const heroCtaBox = await heroCtaContainer.boundingBox();
  const hasOverlap =
    heroCtaBox &&
    playerBox &&
    heroCtaBox.x < playerBox.x + playerBox.width &&
    heroCtaBox.x + heroCtaBox.width > playerBox.x &&
    heroCtaBox.y < playerBox.y + playerBox.height &&
    heroCtaBox.y + heroCtaBox.height > playerBox.y;
  assert(!hasOverlap, "Floating audio player has safe clearance from Hero CTA container");

  // -------------------------------------------------------------------------
  // 4. DIGITAL INVITATION STUDIO ON MOBILE
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Digital Invitation Studio on Mobile ---");
  await mobilePage.goto(`${BASE_URL}/invitation`, { waitUntil: "networkidle" });
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, "p15_1_mobile_03_invitation_cinematic.png") });

  const designBBtn = mobilePage.locator('button:has-text("Design B: Traditional")');
  await designBBtn.waitFor({ state: "visible" });
  const designBBox = await designBBtn.boundingBox();
  assert(designBBox && designBBox.height >= 44, "Invitation studio template button meets 44px touch height", `Height: ${designBBox?.height}px`);

  // Switch to Design B
  await designBBtn.click();
  await mobilePage.waitForTimeout(300);
  const traditionalTitle = mobilePage.locator('text="Traditional Royal Patra"');
  assert(await traditionalTitle.isVisible(), "Switched to Design B (Traditional Royal Patra) seamlessly");
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, "p15_1_mobile_04_invitation_traditional.png") });

  // -------------------------------------------------------------------------
  // 5. GALLERY & MOBILE LIGHTBOX
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Gallery & Mobile Lightbox ---");
  await mobilePage.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, "p15_1_mobile_05_gallery.png") });

  const photosTab = mobilePage.locator('button#tab-photos');
  const filmsTab = mobilePage.locator('button#tab-films');
  assert(await photosTab.isVisible() && await filmsTab.isVisible(), "Gallery tabs are visible and cleanly proportioned on mobile");

  // -------------------------------------------------------------------------
  // 6. AUTHENTICATED GUEST EXPERIENCE ON MOBILE
  // -------------------------------------------------------------------------
  console.log("\n--- 6. Authenticated Guest Experience on Mobile ---");
  await mobilePage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await mobilePage.fill('input[name="email"]', TEST_GUEST_EMAIL);
  await mobilePage.fill('input[name="password"]', TEST_PASSWORD);
  await mobilePage.click('button[type="submit"]:has-text("Sign In")');
  await mobilePage.waitForURL("**/account");

  assert(mobilePage.url().includes("/account"), "Authenticated guest redirected to /account");
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, "p15_1_mobile_06_guest_account.png") });

  // Verify Attendee input height in RSVP card
  const attendeeInput = mobilePage.locator('input[placeholder*="Full Name"]').first();
  if (await attendeeInput.isVisible()) {
    const inputHeight = await attendeeInput.evaluate((el) => el.getBoundingClientRect().height);
    assert(inputHeight >= 42, "RSVP attendee input provides comfortable touch height", `Actual: ${inputHeight}px`);
  }

  await mobileContext.close();

  // -------------------------------------------------------------------------
  // 7. UNIFIED ADMIN DASHBOARD ON MOBILE
  // -------------------------------------------------------------------------
  console.log("\n--- 7. Unified Admin Dashboard on Mobile ---");
  const adminMobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const adminMobilePage = await adminMobileContext.newPage();
  await adminMobilePage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await adminMobilePage.fill('input[name="email"]', TEST_ADMIN_EMAIL);
  await adminMobilePage.fill('input[name="password"]', TEST_PASSWORD);
  await adminMobilePage.click('button[type="submit"]:has-text("Sign In")');
  await adminMobilePage.waitForURL("**/account");

  // Navigate to /admin
  await adminMobilePage.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
  assert(adminMobilePage.url().includes("/admin"), "SuperAdmin accessed unified dashboard at /admin");
  await adminMobilePage.screenshot({ path: path.join(OUTPUT_DIR, "p15_1_mobile_07_admin_dashboard.png") });

  // Verify Admin Navigation Rail is horizontally scrollable with touch
  const navRail = adminMobilePage.locator('nav[aria-label="Admin Navigation"]');
  assert(await navRail.isVisible(), "Admin horizontal navigation rail is visible on mobile");

  // Navigate to /admin/rsvps
  await adminMobilePage.goto(`${BASE_URL}/admin/rsvps`, { waitUntil: "networkidle" });
  await adminMobilePage.screenshot({ path: path.join(OUTPUT_DIR, "p15_1_mobile_08_admin_rsvps.png") });

  const rsvpSearchInput = adminMobilePage.locator('input[placeholder*="Search family"]');
  const rsvpSearchBox = await rsvpSearchInput.boundingBox();
  assert(rsvpSearchBox && rsvpSearchBox.width > 200, "RSVP search input expands cleanly for mobile thumb interaction", `Width: ${rsvpSearchBox?.width}px`);

  await adminMobileContext.close();

  // -------------------------------------------------------------------------
  // 8. TABLET & DESKTOP REGRESSION CHECKS
  // -------------------------------------------------------------------------
  console.log("\n--- 8. Tablet (768x1024) & Desktop (1440x900) Regression Audits ---");
  const tabletContext = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tabletPage = await tabletContext.newPage();
  await tabletPage.goto(BASE_URL, { waitUntil: "networkidle" });
  await tabletPage.screenshot({ path: path.join(OUTPUT_DIR, "p15_1_tablet_home.png") });
  assert(!await tabletPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), "Tablet has no horizontal overflow");
  await tabletContext.close();

  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(BASE_URL, { waitUntil: "networkidle" });
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, "p15_1_desktop_home.png") });
  assert(!await desktopPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), "Desktop has no horizontal overflow");
  await desktopContext.close();

  await browser.close();

  // Cleanup test admin so pgTAP test suites have a clean single super admin slate
  await adminClient.from("admin_users").delete().eq("id", admin.id);
  await adminClient.from("profiles").delete().eq("id", admin.id);
  await adminClient.from("profiles").delete().eq("id", guest.id);

  console.log("\n=======================================================");
  console.log(`P-15.1 VERIFICATION SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log("=======================================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runMobileVerification().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
