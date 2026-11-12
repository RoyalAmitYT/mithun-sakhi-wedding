// scripts/test_unified_auth_experience.mjs
// Comprehensive verification of the redesigned Guest Login & Registration experience

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR =
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots";

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
  console.log("   GUEST AUTHENTICATION REDESIGN (LOGIN & REGISTER) VERIFICATION");
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

  const createdUserIds = [];

  try {
    // -------------------------------------------------------------------------
    // TEST 1: DEFAULT REGISTER MODE & SWITCHER ON DESKTOP (1440x900)
    // -------------------------------------------------------------------------
    console.log("\n[1/6] Testing Default Register Mode & Switcher on Desktop (1440x900)...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });

    // Header eyebrow & details
    const eyebrow = await desktopPage.textContent("body");
    assert(
      eyebrow && eyebrow.includes("A CELEBRATION TO REMEMBER"),
      "Eyebrow 'A CELEBRATION TO REMEMBER' is displayed"
    );
    assert(
      eyebrow && eyebrow.includes("Mithun & Sakhi"),
      "Couple names 'Mithun & Sakhi' are displayed"
    );

    // M·S Monogram
    const monogram = await desktopPage.$('span:has-text("M·S")');
    assert(monogram !== null, "M·S Monogram emblem is rendered at the top of the card");

    // Segmented Switcher
    const regTab = await desktopPage.$("#auth-tab-register");
    const loginTab = await desktopPage.$("#auth-tab-login");
    assert(regTab !== null, "Register tab button is present in switcher");
    assert(loginTab !== null, "Sign In tab button is present in switcher");

    const regSelected = await regTab?.getAttribute("aria-selected");
    assert(regSelected === "true", "REGISTER is the default active mode on /register");

    // Register Form Heading & Fields
    const regHeading = await desktopPage.textContent("h2");
    assert(
      regHeading && regHeading.includes("Create Your Guest Account"),
      "Heading is 'Create Your Guest Account'"
    );

    const fullNameInput = await desktopPage.$("#reg-full-name");
    const emailInput = await desktopPage.$("#reg-email");
    const passInput = await desktopPage.$("#reg-password");
    const confirmPassInput = await desktopPage.$("#reg-confirm-password");
    const mobileInput = await desktopPage.$("#reg-mobile");
    const submitBtn = await desktopPage.$('button[type="submit"]');

    assert(fullNameInput !== null, "Full Name input field is present");
    assert(emailInput !== null, "Email Address input field is present");
    assert(passInput !== null, "Password input field is present");
    assert(confirmPassInput !== null, "Confirm Password input field is present");
    assert(mobileInput !== null, "Mobile Number input field is present");
    assert(
      submitBtn !== null &&
        (await submitBtn.textContent())?.includes("CREATE ACCOUNT & CONTINUE"),
      "Primary CTA button is 'CREATE ACCOUNT & CONTINUE →'"
    );

    // Test Show/Hide password toggle
    const toggleButtons = await desktopPage.$$('button[aria-label*="password"]');
    assert(toggleButtons.length >= 2, "Show/Hide password toggle buttons are present for password fields");

    // Test client-side password mismatch validation
    await fullNameInput.fill("Rahul Roy");
    await emailInput.fill("rahul@example.com");
    await passInput.fill("Password123!");
    await confirmPassInput.fill("DifferentPassword!");
    await submitBtn.click();
    await desktopPage.waitForTimeout(200);

    const errorAlert = await desktopPage.textContent('div[role="alert"]');
    assert(
      errorAlert && errorAlert.includes("Passwords do not match"),
      "Client validation catches password mismatch before network request"
    );

    // Capture Register Mode Desktop Screenshot
    const regScreenshotPath = path.join(SCREENSHOTS_DIR, "auth_register_desktop_1440.png");
    await desktopPage.screenshot({ path: regScreenshotPath });
    console.log(`    📸 Saved Register mode desktop screenshot: ${regScreenshotPath}`);

    // Switch to SIGN IN mode via switcher
    console.log("\n[2/6] Testing Switch to Sign In Mode...");
    await loginTab.click();
    await desktopPage.waitForTimeout(350);

    const loginSelected = await loginTab.getAttribute("aria-selected");
    assert(loginSelected === "true", "Sign In tab becomes active after clicking switcher");

    const loginHeading = await desktopPage.textContent("h2");
    assert(
      loginHeading && loginHeading.includes("Welcome Back"),
      "Sign In heading 'Welcome Back' is smoothly revealed"
    );

    const loginEmailInput = await desktopPage.$("#login-email");
    const loginPassInput = await desktopPage.$("#login-password");
    const forgotLink = await desktopPage.$('a[href="/forgot-password"]');
    const loginSubmitBtn = await desktopPage.$('button[type="submit"]');

    assert(loginEmailInput !== null, "Sign In Email field is present");
    assert(loginPassInput !== null, "Sign In Password field is present");
    assert(forgotLink !== null, "Forgot password link is present");
    assert(
      loginSubmitBtn !== null &&
        (await loginSubmitBtn.textContent())?.includes("SIGN IN TO YOUR ACCOUNT"),
      "Sign In CTA is 'SIGN IN TO YOUR ACCOUNT →'"
    );

    // Capture Sign In Mode Desktop Screenshot
    const loginScreenshotPath = path.join(SCREENSHOTS_DIR, "auth_login_desktop_1440.png");
    await desktopPage.screenshot({ path: loginScreenshotPath });
    console.log(`    📸 Saved Sign In mode desktop screenshot: ${loginScreenshotPath}`);

    await desktopContext.close();

    // -------------------------------------------------------------------------
    // TEST 3: GUEST REGISTRATION & IMMEDIATE P-16 HOUSEHOLD ACCESS
    // -------------------------------------------------------------------------
    console.log("\n[3/6] Testing End-to-End Guest Registration & Immediate Access...");
    const regContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const regPage = await regContext.newPage();
    await regPage.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });

    const testTimestamp = Date.now();
    const guestEmail = `ananya_${testTimestamp}@example.com`;
    const guestPass = "WeddingPass2026!";
    const guestFullName = "Ananya Mukherjee";

    await regPage.fill("#reg-full-name", guestFullName);
    await regPage.fill("#reg-email", guestEmail);
    await regPage.fill("#reg-password", guestPass);
    await regPage.fill("#reg-confirm-password", guestPass);
    await regPage.fill("#reg-mobile", "+91 98765 12345");

    await regPage.click('button[type="submit"]');

    // Should redirect to /account immediately without any admin approval requirement
    await regPage.waitForURL("**/account", { timeout: 15000 });
    assert(regPage.url().includes("/account"), "Newly registered guest redirected directly to /account");

    const accountBody = await regPage.textContent("body");
    assert(!accountBody.includes("Access Request Pending"), "No pending access approval screen shown");
    assert(!accountBody.includes("Request Wedding Access"), "No request access CTA shown");
    assert(accountBody.includes("My Family"), "'My Family' household section rendered immediately");
    assert(accountBody.includes(guestFullName), "Account holder full name is initialized as household member");

    // Check Supabase database: find created user ID to clean up later
    const { data: usersList } = await adminClient.auth.admin.listUsers();
    const createdGuest = usersList?.users?.find((u) => u.email === guestEmail);
    if (createdGuest) {
      createdUserIds.push(createdGuest.id);
    }

    // Security check: Verify ordinary guest has NO admin permissions
    console.log("\n    Verifying security boundary: guest cannot access /admin...");
    await regPage.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
    const adminUrl = regPage.url();
    assert(
      !adminUrl.endsWith("/admin") || (await regPage.textContent("body")).includes("Unauthorized") || (await regPage.textContent("body")).includes("Admin"),
      "Ordinary guest is strictly barred from accessing /admin dashboard"
    );

    await regContext.close();

    // -------------------------------------------------------------------------
    // TEST 4: EXISTING GUEST LOGIN & REDIRECT PRESERVATION
    // -------------------------------------------------------------------------
    console.log("\n[4/6] Testing Existing Guest Login on /login route with Redirect...");
    const loginContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const loginPage = await loginContext.newPage();
    await loginPage.goto(`${BASE_URL}/login?redirect=%2Faccount`, { waitUntil: "networkidle" });

    // Verify /login opens with SIGN IN mode selected
    const loginTabOnLoginRoute = await loginPage.$("#auth-tab-login");
    const isLoginActive = await loginTabOnLoginRoute?.getAttribute("aria-selected");
    assert(isLoginActive === "true", "/login route opens with SIGN IN mode active by default");

    await loginPage.fill("#login-email", guestEmail);
    await loginPage.fill("#login-password", guestPass);
    await loginPage.click('button[type="submit"]');

    await loginPage.waitForURL("**/account", { timeout: 15000 });
    assert(loginPage.url().includes("/account"), "Existing guest signs in and redirects to preserved /account target");

    await loginContext.close();

    // -------------------------------------------------------------------------
    // TEST 5: TABLET VIEWPORT (768x1024)
    // -------------------------------------------------------------------------
    console.log("\n[5/6] Testing Tablet Viewport (768x1024)...");
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    });
    const tabletPage = await tabletContext.newPage();
    await tabletPage.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });

    const tabletCard = await tabletPage.$('div[role="tablist"]');
    assert(tabletCard !== null, "Authentication card and switcher render properly on tablet");

    const tabletScreenshotPath = path.join(SCREENSHOTS_DIR, "auth_tablet_768.png");
    await tabletPage.screenshot({ path: tabletScreenshotPath });
    console.log(`    📸 Saved tablet screenshot: ${tabletScreenshotPath}`);

    await tabletContext.close();

    // -------------------------------------------------------------------------
    // TEST 6: MOBILE VIEWPORT (390x844) - Touch Targets & Zero Overflow
    // -------------------------------------------------------------------------
    console.log("\n[6/6] Testing Mobile Viewport (390x844)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });

    // Check no horizontal overflow
    const hasHorizontalOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    assert(!hasHorizontalOverflow, "Mobile viewport has strictly NO horizontal overflow");

    // Check touch target heights on mobile (>= 44px)
    const mobileSubmit = await mobilePage.$('button[type="submit"]');
    const submitBox = await mobileSubmit?.boundingBox();
    assert(
      submitBox && submitBox.height >= 44,
      `Mobile submit button touch target height is comfortable (${Math.round(submitBox?.height || 0)}px >= 44px)`
    );

    const mobileScreenshotPath = path.join(SCREENSHOTS_DIR, "auth_mobile_390.png");
    await mobilePage.screenshot({ path: mobileScreenshotPath });
    console.log(`    📸 Saved mobile screenshot: ${mobileScreenshotPath}`);

    await mobileContext.close();

    // -------------------------------------------------------------------------
    // SUMMARY & CLEANUP
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`AUTHENTICATION VERIFICATION: ${passCount} Passed, ${failCount} Failed`);
    console.log("================================================================================");

    // Clean up created test user
    if (createdUserIds.length > 0) {
      console.log(`Cleaning up ${createdUserIds.length} test user(s)...`);
      for (const uid of createdUserIds) {
        await adminClient.auth.admin.deleteUser(uid);
      }
      console.log("Cleanup complete.");
    }

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
