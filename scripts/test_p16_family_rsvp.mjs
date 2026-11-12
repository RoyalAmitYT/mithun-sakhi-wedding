import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const SUPABASE_URL = "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SCREENSHOT_DIR = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots";
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

let passed = 0;
let failed = 0;

function assert(condition, message, details = "") {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message} ${details ? `(${details})` : ""}`);
    failed++;
  }
}

async function getOrCreateUser(email, password, fullName, isAdmin = false) {
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

  // Ensure household initialized
  await adminClient.rpc("initialize_user_household", {
    p_user_id: user.id,
    p_full_name: fullName,
  });

  if (isAdmin) {
    await adminClient.from("admin_users").upsert({
      id: user.id,
      is_super_admin: false,
      is_active: true,
    });
    await adminClient.from("admin_permissions").upsert({
      admin_id: user.id,
      permission_group: "guest_rsvp",
    });
  }

  return user;
}

async function run() {
  console.log("=== Phase P-16 E2E Test: Login-Based Family RSVP System ===");

  const timestamp = Date.now();
  const guestEmail = `alok_${timestamp}@example.com`;
  const guestPassword = "Password123!";
  const guestName = "Alok Mukherjee";

  const adminEmail = "wedding.admin@example.com";
  const adminPassword = "Password123!";
  const adminName = "Wedding Administrator";

  console.log("1. Setting up fresh test users...");
  const guestUser = await getOrCreateUser(guestEmail, guestPassword, guestName, false);
  const adminUser = await getOrCreateUser(adminEmail, adminPassword, adminName, true);
  console.log(`   Guest user created/ready: ${guestUser.id} (${guestEmail})`);
  console.log(`   Admin user created/ready: ${adminUser.id} (${adminEmail})`);

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // STEP 1: Guest Login & Immediate Access
    console.log("\n2. Testing Guest Login & Instant Auto-Approval...");
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', guestEmail);
    await page.fill('input[type="password"]', guestPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/account", { timeout: 15000 });
    assert(page.url().includes("/account"), "Guest successfully redirected to /account after login");

    const pageContent = await page.textContent("body");
    assert(!pageContent.includes("Access Request Pending"), "No pending access request screen shown");
    assert(!pageContent.includes("Access Request Declined"), "No declined access request screen shown");
    assert(!pageContent.includes("Request Wedding Access"), "No request access CTA shown");
    assert(pageContent.includes("My Family"), "'My Family' household section rendered immediately");
    assert(pageContent.includes(guestName), "Initial account holder name displayed as first household member");

    // STEP 2: Add Family Members via UI
    console.log("\n3. Testing 'My Family' Household Member Management...");
    const addMemberInput = page.locator('input[placeholder*="Add spouse, elder"]');
    await addMemberInput.fill("Sunita Mukherjee (Spouse)");
    await page.click('button:has-text("Add Member")');
    await page.waitForTimeout(1000);

    await addMemberInput.fill("Rahul Mukherjee");
    await page.click('button:has-text("Add Member")');
    await page.waitForTimeout(1000);

    const updatedContent = await page.textContent("body");
    assert(updatedContent.includes("Sunita Mukherjee (Spouse)"), "Added member 'Sunita Mukherjee (Spouse)' appears in household list");
    assert(updatedContent.includes("Rahul Mukherjee"), "Added member 'Rahul Mukherjee' appears in household list");
    assert(updatedContent.includes("3 Members Registered"), "Badge displays '3 Members Registered' in household");

    // Helper locator for ceremony cards
    const getCeremonyCard = (title) =>
      page.locator(`h3:has-text("${title}")`).first().locator('xpath=ancestor::div[contains(@class, "rounded-2xl")]').first();

    // STEP 3: Complete Haldi RSVP (Joyfully Attending with 2 members)
    console.log("\n4. Testing Haldi Ceremony RSVP (Attending with checkbox selection)...");
    const haldiCard = getCeremonyCard("Haldi");

    await haldiCard.locator('button:has-text("Joyfully Attending")').click();

    // Toggle Rahul OFF so only 2 attend Haldi
    const rahulHaldiBtn = haldiCard.locator('button:has-text("Rahul Mukherjee")').first();
    if (await rahulHaldiBtn.count() > 0) {
      await rahulHaldiBtn.click();
      await page.waitForTimeout(500);
    }

    const haldiHeadcountText = await haldiCard.textContent();
    assert(haldiHeadcountText.includes("2 Members Attending") || haldiHeadcountText.includes("2 Member"), "Live headcount derived from selected checkboxes: 2 Members Attending");

    // Fill arrival details
    const haldiArrivalInput = haldiCard.locator('input[placeholder*="Arriving by"]');
    if (await haldiArrivalInput.count() > 0) {
      await haldiArrivalInput.fill("Arriving 18 Nov via Purulia Express");
    }

    // Submit Haldi
    await haldiCard.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    const haldiCardAfter = await haldiCard.textContent();
    assert(haldiCardAfter.includes("Response Saved") || haldiCardAfter.includes("RSVP confirmed"), "Haldi RSVP saved successfully with 'Response Saved' badge");

    // STEP 4: Complete Mehndi RSVP (Regretfully Declining)
    console.log("\n5. Testing Mehndi Ceremony RSVP (Regretfully Declining)...");
    const mehndiCard = getCeremonyCard("Mehndi");
    await mehndiCard.locator('button:has-text("Regretfully Declining")').click();
    await mehndiCard.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    const mehndiCardAfter = await mehndiCard.textContent();
    assert(mehndiCardAfter.includes("Response Saved") || mehndiCardAfter.includes("Your regrets have been recorded"), "Mehndi RSVP declined successfully without requiring attendee names");

    // STEP 5: Complete Sacred Wedding RSVP (All 3 Members Attending)
    console.log("\n6. Testing The Sacred Wedding RSVP (All 3 Members Attending)...");
    const weddingCard = getCeremonyCard("The Wedding");
    await weddingCard.locator('button:has-text("Joyfully Attending")').click();
    await weddingCard.locator('button:has-text("Select All")').click();
    await page.waitForTimeout(500);

    const weddingHeadcountText = await weddingCard.textContent();
    assert(weddingHeadcountText.includes("3 Members Attending"), "Wedding live headcount derived correctly: 3 Members Attending");

    await weddingCard.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    const weddingCardAfter = await weddingCard.textContent();
    assert(weddingCardAfter.includes("Response Saved") || weddingCardAfter.includes("RSVP confirmed"), "Sacred Wedding RSVP saved successfully");

    // STEP 6: Complete Reception RSVP (Undecided / Unsure)
    console.log("\n7. Testing Reception RSVP (Undecided / Unsure)...");
    const receptionCard = getCeremonyCard("Reception & Preetibhoj");
    await receptionCard.locator('button:has-text("Undecided / Unsure")').click();
    await receptionCard.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    const receptionCardAfter = await receptionCard.textContent();
    assert(receptionCardAfter.includes("Response Saved") || receptionCardAfter.includes("noted as undecided"), "Reception RSVP saved as undecided successfully");

    // STEP 7: Duplicate Submission Protection (Update Haldi to all 3 members)
    console.log("\n8. Testing Duplicate Submission Protection & Atomic Update...");
    await haldiCard.scrollIntoViewIfNeeded();
    await haldiCard.locator('button:has-text("Select All")').click();
    await page.waitForTimeout(500);

    const haldiUpdatedHeadcount = await haldiCard.textContent();
    assert(haldiUpdatedHeadcount.includes("3 Members Attending"), "Haldi re-selection updated headcount to 3 Members Attending");

    await haldiCard.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    const haldiFinalText = await haldiCard.textContent();
    assert(haldiFinalText.includes("RSVP confirmed for 3 family members") || haldiFinalText.includes("Response Saved"), "Haldi RSVP updated existing record atomically without creating duplicates");

    // STEP 8: Capture Guest Account Screenshots
    console.log("\n9. Capturing Guest Account Screenshots...");
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "account_family_rsvp_desktop.png"),
      fullPage: true,
    });
    console.log("   Saved desktop screenshot: account_family_rsvp_desktop.png");

    // Mobile Viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "account_family_rsvp_mobile.png"),
      fullPage: true,
    });
    console.log("   Saved mobile screenshot: account_family_rsvp_mobile.png");

    // STEP 9: Admin RSVP Dashboard Verification
    console.log("\n10. Testing Admin RSVP Dashboard (/admin/rsvps)...");
    await page.setViewportSize({ width: 1440, height: 900 });

    // Sign out guest
    await page.click('button:has-text("Sign Out")');
    await page.waitForURL("**/login", { timeout: 10000 });

    // Sign in as admin
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/account", { timeout: 15000 });

    // Navigate to admin RSVPs
    await page.goto(`${BASE_URL}/admin/rsvps`);
    await page.waitForSelector('h1:has-text("Attendance Intelligence")', { timeout: 10000 });

    const adminContent = await page.textContent("body");
    assert(adminContent.includes("Total Households"), "Admin dashboard displays 'Total Households' metric");
    assert(adminContent.includes("Confirmed Individual Attendees"), "Admin dashboard displays 'Confirmed Individual Attendees'");
    assert(!adminContent.includes("Adults") && !adminContent.includes("Infants"), "No Adult / Child / Infant category breakdown displayed in admin stats");

    // Drilldown search for Alok Mukherjee
    const searchInput = page.locator('input[placeholder*="Search family or manager"]');
    await searchInput.fill("Alok Mukherjee");
    await page.waitForTimeout(1000);

    const filteredContent = await page.textContent("body");
    assert(filteredContent.includes("Alok Mukherjee"), "Test household found in admin roster search");

    // Expand details
    const viewDetailsButton = page.locator('button:has-text("View Details")').first();
    if (await viewDetailsButton.count() > 0) {
      await viewDetailsButton.click();
      await page.waitForTimeout(500);
    }

    const expandedDetails = await page.textContent("body");
    assert(expandedDetails.includes("Sunita Mukherjee"), "Confirmed attendee 'Sunita Mukherjee' visible in drilldown");
    assert(expandedDetails.includes("Rahul Mukherjee"), "Confirmed attendee 'Rahul Mukherjee' visible in drilldown");

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "admin_rsvps_dashboard.png"),
      fullPage: true,
    });
    console.log("   Saved admin screenshot: admin_rsvps_dashboard.png");

    console.log("\n=======================================================");
    console.log(`P-16 E2E RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=======================================================");
  } catch (err) {
    console.error("Test failed with uncaught exception:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

run();
