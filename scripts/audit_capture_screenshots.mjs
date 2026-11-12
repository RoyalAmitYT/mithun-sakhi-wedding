// scripts/audit_capture_screenshots.mjs
// Captures comprehensive desktop and mobile screenshots for Pre-Launch Visual & UX Review

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = path.resolve(process.cwd(), "audit_screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const SUPABASE_URL = "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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

async function captureScreenshots() {
  console.log("Starting Pre-Launch Visual Audit Screenshot Capture...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const TEST_GUEST_EMAIL = "audit_guest@wedding.local";
  const TEST_ADMIN_EMAIL = "audit_superadmin@wedding.local";
  const TEST_PASSWORD = "Password123!Audit";

  const guest = await getOrCreateUser(TEST_GUEST_EMAIL, TEST_PASSWORD, "Audit Guest");
  const admin = await getOrCreateUser(TEST_ADMIN_EMAIL, TEST_PASSWORD, "Audit SuperAdmin");

  await adminClient
    .from("admin_users")
    .upsert({ id: admin.id, is_super_admin: true, is_active: true });

  try {
    // -----------------------------------------------------------
    // 1. DESKTOP PUBLIC PAGES
    // -----------------------------------------------------------
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await desktopContext.newPage();

    console.log("Capturing Desktop Homepage sections...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-01-home-hero.png") });

    // Scroll down to countdown and overview
    await page.evaluate(() => window.scrollTo(0, 850));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-02-home-countdown.png") });

    // Scroll to schedule & venues
    await page.evaluate(() => window.scrollTo(0, 1800));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-03-home-schedule.png") });

    // Scroll to venues
    await page.evaluate(() => window.scrollTo(0, 2700));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-04-home-venues.png") });

    // Scroll to family section
    await page.evaluate(() => window.scrollTo(0, 3600));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-05-home-family.png") });

    // Scroll to invitation & gallery preview
    await page.evaluate(() => window.scrollTo(0, 4500));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-06-home-invitation-gallery.png") });

    // Scroll to wishes & RSVP preview & contact
    await page.evaluate(() => window.scrollTo(0, 5600));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-07-home-wishes-rsvp-contact.png") });

    // Events Page
    console.log("Capturing Desktop /events...");
    await page.goto(`${BASE_URL}/events`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-08-events-page.png") });

    // Gallery Page
    console.log("Capturing Desktop /gallery...");
    await page.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-09-gallery-page.png") });

    // Invitation Page (Cinematic & Traditional)
    console.log("Capturing Desktop /invitation...");
    await page.goto(`${BASE_URL}/invitation`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-10-invitation-cinematic.png") });

    const traditionalBtn = page.locator('button:has-text("Design B: Traditional")').first();
    await traditionalBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-11-invitation-traditional.png") });

    // Login & Register Pages
    console.log("Capturing Desktop /login and /register...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-12-login-page.png") });

    await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-13-register-page.png") });

    // -----------------------------------------------------------
    // 2. AUTHENTICATED GUEST DASHBOARD
    // -----------------------------------------------------------
    console.log("Capturing Authenticated /account...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', TEST_GUEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname.startsWith("/account"), { timeout: 10000 });
    await page.screenshot({ path: path.join(OUTPUT_DIR, "desktop-14-guest-account.png") });

    // -----------------------------------------------------------
    // 3. AUTHENTICATED ADMIN CONSOLE
    // -----------------------------------------------------------
    console.log("Capturing Authenticated /admin console...");
    const adminContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const adminPage = await adminContext.newPage();
    await adminPage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await adminPage.fill('input[type="email"]', TEST_ADMIN_EMAIL);
    await adminPage.fill('input[type="password"]', TEST_PASSWORD);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL((url) => url.pathname.startsWith("/account") || url.pathname.startsWith("/admin"), { timeout: 10000 });

    await adminPage.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
    await adminPage.screenshot({ path: path.join(OUTPUT_DIR, "desktop-15-admin-dashboard.png") });

    await adminPage.goto(`${BASE_URL}/admin/access-requests`, { waitUntil: "networkidle" });
    await adminPage.screenshot({ path: path.join(OUTPUT_DIR, "desktop-16-admin-access-requests.png") });

    await adminPage.goto(`${BASE_URL}/admin/rsvps`, { waitUntil: "networkidle" });
    await adminPage.screenshot({ path: path.join(OUTPUT_DIR, "desktop-17-admin-rsvps.png") });

    await adminPage.goto(`${BASE_URL}/admin/wishes`, { waitUntil: "networkidle" });
    await adminPage.screenshot({ path: path.join(OUTPUT_DIR, "desktop-18-admin-wishes.png") });

    await adminPage.goto(`${BASE_URL}/admin/conversations`, { waitUntil: "networkidle" });
    await adminPage.screenshot({ path: path.join(OUTPUT_DIR, "desktop-19-admin-conversations.png") });

    await adminPage.goto(`${BASE_URL}/admin/media`, { waitUntil: "networkidle" });
    await adminPage.screenshot({ path: path.join(OUTPUT_DIR, "desktop-20-admin-media.png") });

    await adminPage.goto(`${BASE_URL}/admin/invitation`, { waitUntil: "networkidle" });
    await adminPage.screenshot({ path: path.join(OUTPUT_DIR, "desktop-21-admin-invitation.png") });

    // -----------------------------------------------------------
    // 4. MOBILE VIEWPORT PAGES
    // -----------------------------------------------------------
    console.log("Capturing Mobile Viewport screenshots...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    });
    const mobPage = await mobileContext.newPage();

    await mobPage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await mobPage.screenshot({ path: path.join(OUTPUT_DIR, "mobile-01-home-hero.png") });

    // Open mobile menu drawer
    const menuBtn = mobPage.locator('button[aria-label="Open navigation menu"]');
    await menuBtn.click();
    await mobPage.waitForTimeout(400);
    await mobPage.screenshot({ path: path.join(OUTPUT_DIR, "mobile-02-navigation-drawer.png") });

    const closeBtn = mobPage.locator('button[aria-label="Close navigation menu"]');
    await closeBtn.click();
    await mobPage.waitForTimeout(300);

    // Mobile events
    await mobPage.goto(`${BASE_URL}/events`, { waitUntil: "networkidle" });
    await mobPage.screenshot({ path: path.join(OUTPUT_DIR, "mobile-03-events.png") });

    // Mobile invitation
    await mobPage.goto(`${BASE_URL}/invitation`, { waitUntil: "networkidle" });
    await mobPage.screenshot({ path: path.join(OUTPUT_DIR, "mobile-04-invitation.png") });

    // Mobile gallery
    await mobPage.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });
    await mobPage.screenshot({ path: path.join(OUTPUT_DIR, "mobile-05-gallery.png") });

    await desktopContext.close();
    await adminContext.close();
    await mobileContext.close();
    console.log("Screenshot capture completed successfully!");
  } finally {
    await browser.close();

    // Teardown test actors
    if (guest) await adminClient.auth.admin.deleteUser(guest.id);
    if (admin) {
      await adminClient.from("admin_users").delete().eq("id", admin.id);
      await adminClient.auth.admin.deleteUser(admin.id);
    }
  }
}

captureScreenshots().catch(console.error);
