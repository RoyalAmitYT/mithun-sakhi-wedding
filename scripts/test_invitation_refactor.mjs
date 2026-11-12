import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "http://localhost:3000";
const SUPABASE_URL = "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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
      is_super_admin: true,
      is_active: true,
    });
  } else {
    await adminClient.from("admin_users").delete().eq("id", user.id);
  }

  return user;
}

async function runTests() {
  console.log("=== Digital Invitation System Refactor Verification ===");

  const timestamp = Date.now();
  const guestEmail = `guest_inv_${timestamp}@example.com`;
  const guestPassword = "Password123!";
  const guestName = "Suresh Sen";

  const adminEmail = "wedding.admin@example.com";
  const adminPassword = "Password123!";
  const adminName = "Wedding Administrator";

  console.log("1. Preparing test users...");
  const guestUser = await getOrCreateUser(guestEmail, guestPassword, guestName, false);
  const adminUser = await getOrCreateUser(adminEmail, adminPassword, adminName, true);
  console.log(`   Guest user: ${guestUser.id} (${guestEmail})`);
  console.log(`   Admin user: ${adminUser.id} (${adminEmail})`);

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  // -------------------------------------------------------------
  // Test 1: Public Navbar has no Invitation item on Desktop or Mobile
  // -------------------------------------------------------------
  console.log("2. Testing Public Navigation...");
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Desktop navbar
    const desktopNavLinks = await page.$$eval("header nav a, header .hidden.md\\:flex a", (els) =>
      els.map((e) => e.textContent?.trim().toLowerCase())
    );
    const hasDesktopInvitation = desktopNavLinks.some((t) => t === "invitation");
    assert(!hasDesktopInvitation, "Desktop navbar does NOT contain 'Invitation' nav link");

    // Check footer as well
    const footerLinks = await page.$$eval("footer a", (els) =>
      els.map((e) => e.textContent?.trim().toLowerCase())
    );
    const hasFooterInvitation = footerLinks.some((t) => t === "invitation");
    assert(!hasFooterInvitation, "Public footer does NOT contain 'Invitation' link");

    await page.close();
  }

  {
    // Mobile navigation drawer
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Click mobile drawer hamburger button
    const menuBtn = await page.$("button[aria-label='Open navigation menu']");
    if (menuBtn) {
      await menuBtn.click();
      await page.waitForTimeout(300);

      const mobileLinks = await page.$$eval("nav[aria-label='Mobile Menu Links'] a", (els) =>
        els.map((e) => e.textContent?.trim().toLowerCase())
      );
      const hasMobileInvitation = mobileLinks.some((t) => t.includes("invitation"));
      assert(!hasMobileInvitation, "Mobile drawer menu does NOT contain 'Invitation' nav link");
    } else {
      assert(false, "Mobile menu button not found");
    }

    await page.close();
  }

  // -------------------------------------------------------------
  // Test 2: Homepage preview has no "View Full Invitation Studio" button
  // -------------------------------------------------------------
  console.log("3. Testing Homepage Preview Section...");
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    const invitationSection = await page.$("#invitation");
    assert(invitationSection !== null, "Homepage contains the #invitation preview section");

    const studioButton = await page.$("text=View Full Invitation Studio");
    assert(studioButton === null, "Homepage preview has NO 'View Full Invitation Studio' button");

    const studioLinks = await page.$$eval("#invitation a", (els) =>
      els.map((e) => e.getAttribute("href"))
    );
    const linksToInvitation = studioLinks.filter((h) => h === "/invitation" || h?.includes("invitation"));
    assert(linksToInvitation.length === 0, "Homepage preview does NOT link to Invitation Studio");

    await page.close();
  }

  // -------------------------------------------------------------
  // Test 3 & 4: Unauthenticated visitor can access /invitation
  // -------------------------------------------------------------
  console.log("4. Testing Unauthenticated Public Invitation Page Access...");
  {
    const context = await browser.newContext(); // completely fresh unauthenticated session
    const page = await context.newPage({ viewport: { width: 1440, height: 900 } });
    const response = await page.goto(`${BASE_URL}/invitation`, { waitUntil: "networkidle" });

    assert(response.status() === 200, "Unauthenticated visitor receives HTTP 200 on /invitation");

    // Check heading
    const pageTitle = await page.$eval("h1", (el) => el.textContent?.trim());
    assert(pageTitle === "The Wedding Invitation", "Page renders 'The Wedding Invitation' title");

    // Check official image asset is displayed
    const imgEl = await page.$("img[alt*='Official Wedding Invitation']");
    assert(imgEl !== null, "Displays official invitation card image asset");

    const imgSrc = await imgEl?.getAttribute("src");
    assert(imgSrc?.includes("wedding-invitation"), `Invitation image asset src is valid: ${imgSrc}`);

    // Check that NO design editor controls or template switchers exist
    const templateSwitcherBtn = await page.$("button:has-text('Side-by-Side')");
    assert(templateSwitcherBtn === null, "Public page contains NO template switcher buttons");

    // Check download button exists
    const downloadBtn = await page.$("text=Download Official Card");
    assert(downloadBtn !== null, "Public page contains 'Download Official Card' button");

    // Check RSVP button exists
    const rsvpBtn = await page.$("text=Confirm RSVP");
    assert(rsvpBtn !== null, "Public page contains 'Confirm RSVP' button");

    await context.close();
  }

  // -------------------------------------------------------------
  // Test 5 & 6: Ordinary authenticated guest cannot access Invitation Studio
  // -------------------------------------------------------------
  console.log("5. Testing Guest Protection & Invitation Studio Access Denied...");
  {
    const context = await browser.newContext();
    const page = await context.newPage({ viewport: { width: 1440, height: 900 } });

    // Login as ordinary guest
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill("input[name='email']", guestEmail);
    await page.fill("input[name='password']", guestPassword);
    await page.click("button[type='submit']");
    await page.waitForURL("**/account", { timeout: 10000 });

    assert(page.url().includes("/account"), "Guest successfully logged in and routed to /account");

    // Try direct navigation to /admin/invitation
    await page.goto(`${BASE_URL}/admin/invitation`, { waitUntil: "networkidle" });

    // Should be redirected away (to /account or /admin or /login)
    const finalUrl = page.url();
    assert(
      !finalUrl.includes("/admin/invitation"),
      `Guest is denied access to /admin/invitation (redirected to: ${finalUrl})`
    );

    await context.close();
  }

  // -------------------------------------------------------------
  // Test 7: Authorized administrator can access and use Invitation Studio
  // -------------------------------------------------------------
  console.log("6. Testing Authorized Administrator Studio Access...");
  {
    const context = await browser.newContext();
    const page = await context.newPage({ viewport: { width: 1440, height: 900 } });

    // Login as admin
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill("input[name='email']", adminEmail);
    await page.fill("input[name='password']", adminPassword);
    await page.click("button[type='submit']");
    await page.waitForURL("**/account", { timeout: 10000 });

    // Go to /admin/invitation
    await page.goto(`${BASE_URL}/admin/invitation`, { waitUntil: "networkidle" });
    assert(page.url().includes("/admin/invitation"), "Admin allowed on /admin/invitation");

    // Check Admin Header & Studio
    const studioHeading = await page.$("text=Invitation Studio & Asset Management");
    assert(studioHeading !== null, "Admin page displays 'Invitation Studio & Asset Management'");

    const designSwitcher = await page.$("button:has-text('Design A: Cinematic')");
    assert(designSwitcher !== null, "Admin page includes interactive template switcher");

    const settingsForm = await page.$("#headline_text");
    assert(settingsForm !== null, "Admin page includes invitation settings configuration form");

    const pngDownload = await page.$("button:has-text('Download PNG')");
    assert(pngDownload !== null, "Admin page includes 300 DPI 'Download PNG' button");

    const pdfPrint = await page.$("button:has-text('Print PDF')");
    assert(pdfPrint !== null, "Admin page includes 'Print PDF' button");

    await context.close();
  }

  // -------------------------------------------------------------
  // Test 8: All guests receive the same invitation page and card
  // -------------------------------------------------------------
  console.log("7. Testing Single Canonical Invitation Page & Absence of Personalized Routes...");
  {
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto(`${BASE_URL}/invitation`, { waitUntil: "networkidle" });
    const contentA = await pageA.content();

    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.goto(`${BASE_URL}/invitation`, { waitUntil: "networkidle" });
    const contentB = await pageB.content();

    assert(Math.abs(contentA.length - contentB.length) <= 50, "Both unauthenticated visitors receive identical content length");

    // Check that personalized query parameters do not alter identity
    await pageB.goto(`${BASE_URL}/invitation?guest=john&token=12345`, { waitUntil: "networkidle" });
    const titleWithParams = await pageB.$eval("h1", (el) => el.textContent?.trim());
    assert(titleWithParams === "The Wedding Invitation", "Query params have zero effect; title remains common");

    await contextA.close();
    await contextB.close();
  }

  await browser.close();

  console.log("\n=======================================================");
  console.log(`INVITATION REFACTOR TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
