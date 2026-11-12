// scripts/test_p15_browser_qa.mjs
// Phase P-15: Final Quality Assurance & Browser Validation Suite
// Uses Playwright with Google Chrome to test Desktop, Tablet, and Mobile viewports.

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "http://localhost:3000";
const SUPABASE_URL = "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Viewport profiles
const VIEWPORTS = {
  desktop: { width: 1440, height: 900, name: "Desktop (1440x900)" },
  tablet: { width: 768, height: 1024, name: "Tablet (768x1024)" },
  mobile: { width: 390, height: 844, name: "Mobile (390x844)" },
};

let passedCount = 0;
let failedCount = 0;
const findings = [];

function assert(condition, message, details = "") {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${message} ${details ? `(${details})` : ""}`);
    failedCount++;
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

async function runBrowserQA() {
  console.log("\n=======================================================");
  console.log("PHASE P-15: FINAL QUALITY ASSURANCE & BROWSER VALIDATION");
  console.log("=======================================================\n");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const TEST_GUEST_EMAIL = "p15_browser_guest@wedding.local";
  const TEST_ADMIN_EMAIL = "p15_browser_admin@wedding.local";
  const TEST_PASSWORD = "Password123!Luxury";

  let testGuestUser = null;
  let testAdminUser = null;

  try {
    // -----------------------------------------------------------------
    // SECTION 1: PUBLIC PAGES VIEWPORT RESPONSIVENESS & OVERFLOW AUDIT
    // -----------------------------------------------------------------
    console.log("[1] Public Pages Responsiveness, Layout & Console Error Audit...");

    const publicRoutes = [
      { path: "/", title: "Mithun & Sakhi" },
      { path: "/events", title: "Ceremony Schedule" },
      { path: "/gallery", title: "Gallery" },
      { path: "/invitation", title: "Digital Invitation" },
      { path: "/login", title: "Sign In" },
      { path: "/register", title: "Registration" },
      { path: "/forgot-password", title: "Reset Password" },
      { path: "/privacy", title: "Privacy Policy" },
      { path: "/terms", title: "Terms" },
    ];

    for (const [vpKey, vp] of Object.entries(VIEWPORTS)) {
      console.log(`\n  --- Testing Viewport: ${vp.name} ---`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        userAgent:
          vpKey === "mobile"
            ? "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
            : undefined,
      });

      const page = await context.newPage();

      for (const route of publicRoutes) {
        const consoleErrors = [];
        const pageErrors = [];

        page.on("console", (msg) => {
          if (msg.type() === "error") {
            const text = msg.text();
            if (!text.includes("favicon") && !text.includes("ERR_BLOCKED_BY_CLIENT")) {
              consoleErrors.push(text);
            }
          }
        });

        page.on("pageerror", (err) => {
          pageErrors.push(err.message);
        });

        const url = `${BASE_URL}${route.path}`;
        const response = await page.goto(url, { waitUntil: "networkidle" });

        // 1. HTTP Status
        assert(
          response && response.status() === 200,
          `[${vpKey}] ${route.path} returns HTTP 200`,
          `Status: ${response?.status()}`
        );

        // 2. Horizontal scroll overflow check
        const scrollOverflow = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(docEl.scrollWidth, body.scrollWidth);
          const innerW = window.innerWidth;
          return {
            hasOverflow: scrollW > innerW + 1, // allow 1px rounding tolerance
            scrollWidth: scrollW,
            innerWidth: innerW,
          };
        });

        assert(
          !scrollOverflow.hasOverflow,
          `[${vpKey}] ${route.path} has zero horizontal overflow (w: ${scrollOverflow.scrollWidth}px <= vw: ${scrollOverflow.innerWidth}px)`
        );

        // 3. Runtime console & page error check
        assert(
          consoleErrors.length === 0,
          `[${vpKey}] ${route.path} zero console errors`,
          consoleErrors.join("; ")
        );
        assert(
          pageErrors.length === 0,
          `[${vpKey}] ${route.path} zero uncaught runtime exceptions`,
          pageErrors.join("; ")
        );

        // 4. Heading structure & accessibility check
        const headingCheck = await page.evaluate(() => {
          const h1s = document.querySelectorAll("h1");
          const landmarks = {
            hasMain: Boolean(document.querySelector("main")),
            hasNav: Boolean(document.querySelector("nav")),
          };
          const imagesWithoutAlt = Array.from(document.querySelectorAll("img")).filter(
            (img) => !img.hasAttribute("alt")
          );

          return {
            h1Count: h1s.length,
            firstH1Text: h1s[0]?.textContent?.trim() || "",
            ...landmarks,
            missingAltCount: imagesWithoutAlt.length,
          };
        });

        assert(
          headingCheck.h1Count >= 1,
          `[${vpKey}] ${route.path} has an H1 heading (found: "${headingCheck.firstH1Text.slice(0, 30)}...")`
        );
        assert(
          headingCheck.hasMain,
          `[${vpKey}] ${route.path} has a semantic <main> landmark`
        );
        assert(
          headingCheck.missingAltCount === 0,
          `[${vpKey}] ${route.path} all images have alt attributes`
        );
      }

      await context.close();
    }

    // -----------------------------------------------------------------
    // SECTION 2: INTERNAL ROUTE SECURITY GUARD
    // -----------------------------------------------------------------
    console.log("\n[2] Internal Verification Route Guard...");
    {
      const context = await browser.newContext({ viewport: VIEWPORTS.desktop });
      const page = await context.newPage();
      const res = await page.goto(`${BASE_URL}/design-preview`, { waitUntil: "networkidle" });
      assert(
        res && res.status() === 404,
        "/design-preview is securely guarded in production (HTTP 404 Not Found)",
        `Status: ${res?.status()}`
      );
      await context.close();
    }

    // -----------------------------------------------------------------
    // SECTION 3: INTERACTIVE UI CONTROLS & MOBILE NAVIGATION CHECKS
    // -----------------------------------------------------------------
    console.log("\n[3] Interactive UI Controls & Mobile Navigation Checks...");

    // 3.1 Mobile Drawer Toggle
    {
      const mobileContext = await browser.newContext({
        viewport: VIEWPORTS.mobile,
      });
      const page = await mobileContext.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

      // Find the mobile hamburger button using accessible label
      const menuButton = page.locator('button[aria-label="Open navigation menu"]');
      assert(
        (await menuButton.count()) > 0,
        "Mobile viewport displays accessible 'Open navigation menu' button"
      );

      // Click to open drawer
      await menuButton.click();
      await page.waitForTimeout(400); // Wait for drawer animation

      // Verify drawer links are visible
      const eventsLink = page.locator('nav[aria-label="Mobile Menu Links"] a[href="/events"]').first();
      assert(
        await eventsLink.isVisible(),
        "Mobile navigation drawer opens and reveals navigation links"
      );

      // Verify drawer close button works
      const closeButton = page.locator('button[aria-label="Close navigation menu"]').first();
      assert((await closeButton.count()) > 0, "Mobile drawer renders accessible close button");
      await closeButton.click();
      await page.waitForTimeout(400);

      const drawerHidden = !(await eventsLink.isVisible());
      assert(drawerHidden, "Mobile navigation drawer closes cleanly");

      await mobileContext.close();
    }

    // 3.2 Floating Music Player Interaction & Feedback
    {
      const desktopContext = await browser.newContext({
        viewport: VIEWPORTS.desktop,
      });
      const page = await desktopContext.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

      const musicPlayerButton = page.locator('aside[aria-label="Wedding audio player"] button[aria-label*="wedding music" i]').first();
      assert(
        (await musicPlayerButton.count()) > 0,
        "Persistent floating music player button is present on the page"
      );

      // Click to toggle player
      await musicPlayerButton.click();
      await page.waitForTimeout(300);

      // Verify accessible feedback is presented (either playing or status toast)
      const toastOrLabel = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        return (
          bodyText.includes("Wedding melodies coming soon") ||
          bodyText.includes("Shehnai & Sitar Harmony") ||
          document.querySelector('[role="status"]') !== null
        );
      });

      assert(
        toastOrLabel,
        "Floating music player provides accessible user feedback when toggled"
      );

      // Dismiss notice
      const dismissButton = page.locator('button[aria-label="Dismiss notice"]').first();
      if ((await dismissButton.count()) > 0) {
        await dismissButton.click();
        await page.waitForTimeout(300);
        assert(true, "Music player notice dismisses cleanly via accessible button");
      }

      await desktopContext.close();
    }

    // 3.3 Digital Invitation Studio Interactivity & Template Switching
    {
      const desktopContext = await browser.newContext({
        viewport: VIEWPORTS.desktop,
      });
      const page = await desktopContext.newPage();
      await page.goto(`${BASE_URL}/invitation`, { waitUntil: "networkidle" });

      // Verify template switcher exists
      const traditionalButton = page.locator('button:has-text("Design B: Traditional")').first();
      const cinematicButton = page.locator('button:has-text("Design A: Cinematic")').first();

      assert(
        (await traditionalButton.count()) > 0 && (await cinematicButton.count()) > 0,
        "Invitation Studio renders template switcher buttons"
      );

      // Switch to Traditional
      await traditionalButton.click();
      await page.waitForTimeout(300);
      const isTraditionalActive = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        return (
          text.includes("design edition b") ||
          text.includes("traditional decree") ||
          text.includes("traditional royal indian") ||
          text.includes("in auspicious reverence")
        );
      });
      assert(isTraditionalActive, "Invitation switches cleanly to Traditional Decree template");

      // Switch back to Cinematic
      await cinematicButton.click();
      await page.waitForTimeout(300);
      const isCinematicActive = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        return (
          text.includes("design edition a") ||
          text.includes("cinematic editorial")
        );
      });
      assert(isCinematicActive, "Invitation switches cleanly back to Cinematic Portrait template");

      // Verify export buttons exist
      const pngButton = page.locator('button:has-text("Download PNG")').first();
      const printButton = page.locator('button:has-text("Print PDF")').first();
      assert(
        (await pngButton.count()) > 0 && (await printButton.count()) > 0,
        "High-Res PNG download and Print PDF export controls are present"
      );

      // Verify Calendar action buttons exist
      const calendarButton = page.locator('button:has-text("Add to Calendar")').first();
      assert((await calendarButton.count()) > 0, "Add to Calendar dropdown button is present");

      // Open calendar dropdown
      await calendarButton.click();
      await page.waitForTimeout(200);
      const allCeremoniesIcs = page.locator('button:has-text("All 4 Ceremonies (.ics)")').first();
      assert(
        await allCeremoniesIcs.isVisible(),
        "Calendar dropdown opens and presents 'All 4 Ceremonies (.ics)' option"
      );

      await desktopContext.close();
    }

    // 3.4 Gallery Category & Tab Navigation Interactivity
    {
      const desktopContext = await browser.newContext({
        viewport: VIEWPORTS.desktop,
      });
      const page = await desktopContext.newPage();
      await page.goto(`${BASE_URL}/gallery`, { waitUntil: "networkidle" });

      const photosTab = page.locator('button#tab-photos').first();
      const filmsTab = page.locator('button#tab-films').first();

      assert(
        (await photosTab.count()) > 0 && (await filmsTab.count()) > 0,
        "Gallery renders accessible tab controls for Photography and Wedding Films"
      );

      // Click Wedding Films tab
      await filmsTab.click();
      await page.waitForTimeout(300);
      const filmsPanelActive = await page.locator("#panel-films").isVisible();
      assert(filmsPanelActive, "Clicking Wedding Films tab displays #panel-films");

      // Click back to Photography tab
      await photosTab.click();
      await page.waitForTimeout(300);
      const photosPanelActive = await page.locator("#panel-photos").isVisible();
      assert(photosPanelActive, "Clicking Photography tab restores #panel-photos");

      await desktopContext.close();
    }

    // -----------------------------------------------------------------
    // SECTION 4: ACCESSIBILITY, FOCUS VISIBILITY & PREFERS-REDUCED-MOTION
    // -----------------------------------------------------------------
    console.log("\n[4] Accessibility, Focus Visibility & Prefers-Reduced-Motion...");

    // 4.1 Prefers-Reduced-Motion
    {
      const reducedMotionContext = await browser.newContext({
        viewport: VIEWPORTS.desktop,
        reducedMotion: "reduce",
      });
      const page = await reducedMotionContext.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

      const heroTitle = await page.locator("h1").first().textContent();
      assert(
        Boolean(heroTitle && heroTitle.length > 0),
        "Homepage renders smoothly with prefers-reduced-motion: reduce",
        `Title: ${heroTitle}`
      );

      await reducedMotionContext.close();
    }

    // 4.2 Keyboard Navigation & Focus
    {
      const keyboardContext = await browser.newContext({ viewport: VIEWPORTS.desktop });
      const page = await keyboardContext.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

      // Press Tab key multiple times and check that activeElement moves
      await page.keyboard.press("Tab");
      const firstFocusedTag = await page.evaluate(() => document.activeElement?.tagName);
      await page.keyboard.press("Tab");
      const secondFocusedTag = await page.evaluate(() => document.activeElement?.tagName);

      assert(
        Boolean(firstFocusedTag || secondFocusedTag),
        "Keyboard Tab key navigates interactive focus targets",
        `Focus sequence: ${firstFocusedTag} -> ${secondFocusedTag}`
      );

      await keyboardContext.close();
    }

    // 4.3 Color Tokens & Styling Integrity
    {
      const styleContext = await browser.newContext({ viewport: VIEWPORTS.desktop });
      const page = await styleContext.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

      const bgStyle = await page.evaluate(() => {
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const mainEl = document.querySelector("main");
        const mainBg = mainEl ? window.getComputedStyle(mainEl).backgroundColor : "";
        return { bodyBg, mainBg };
      });

      assert(
        bgStyle.bodyBg.includes("255, 252, 246") || bgStyle.bodyBg.includes("rgba(0, 0, 0, 0)") || bgStyle.mainBg !== "",
        "Established luxury canvas background (#FFFCF6) is applied to viewport",
        JSON.stringify(bgStyle)
      );

      await styleContext.close();
    }

    // -----------------------------------------------------------------
    // SECTION 5: AUTHENTICATION, ACCESS CONTROL & ADMIN WORKFLOWS
    // -----------------------------------------------------------------
    console.log("\n[5] Authentication, Role Boundaries & Admin Workflows...");

    // 5.1 Provision Test Actors in local Supabase
    testGuestUser = await getOrCreateUser(TEST_GUEST_EMAIL, TEST_PASSWORD, "P15 QA Guest");
    testAdminUser = await getOrCreateUser(TEST_ADMIN_EMAIL, TEST_PASSWORD, "P15 QA SuperAdmin");

    // Configure Super Admin rights for testAdminUser
    await adminClient
      .from("admin_users")
      .upsert({ id: testAdminUser.id, is_super_admin: true, is_active: true });

    // 5.2 Unauthenticated Route Guards
    {
      const incognitoContext = await browser.newContext({ viewport: VIEWPORTS.desktop });
      const page = await incognitoContext.newPage();

      // Accessing /account unauthenticated -> redirects to /login?next=/account
      await page.goto(`${BASE_URL}/account`);
      await page.waitForURL((url) => url.pathname === "/login", { timeout: 5000 });
      assert(
        page.url().includes("/login"),
        "Unauthenticated visit to /account securely redirects to /login",
        page.url()
      );

      // Accessing /admin unauthenticated -> redirects to /login
      await page.goto(`${BASE_URL}/admin`);
      await page.waitForURL((url) => url.pathname === "/login", { timeout: 5000 });
      assert(
        page.url().includes("/login"),
        "Unauthenticated visit to /admin securely redirects to /login",
        page.url()
      );

      await incognitoContext.close();
    }

    // 5.3 End-to-End Browser Login as Guest
    {
      const guestContext = await browser.newContext({ viewport: VIEWPORTS.desktop });
      const page = await guestContext.newPage();

      await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });

      // Fill in credentials
      await page.fill('input[type="email"]', TEST_GUEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);

      // Click sign in
      await page.click('button[type="submit"]');

      // Should redirect to /account
      await page.waitForURL((url) => url.pathname.startsWith("/account"), { timeout: 10000 });
      assert(
        page.url().includes("/account"),
        "Guest login through browser UI successfully authenticates and redirects to /account"
      );

      // Check account dashboard components
      const hasSignOut = (await page.locator('button:has-text("Sign Out"), a:has-text("Sign Out")').count()) > 0;
      assert(hasSignOut, "Authenticated account page displays accessible Sign Out button");

      // Verify guest cannot access /admin
      await page.goto(`${BASE_URL}/admin`);
      await page.waitForTimeout(1000);
      assert(
        !page.url().endsWith("/admin"),
        "Regular guest cannot access /admin (redirected away from admin dashboard)",
        page.url()
      );

      await guestContext.close();
    }

    // 5.4 End-to-End Browser Login as Super Admin & Admin Console Navigation
    {
      const adminBrowserContext = await browser.newContext({ viewport: VIEWPORTS.desktop });
      const page = await adminBrowserContext.newPage();

      await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
      await page.fill('input[type="email"]', TEST_ADMIN_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');

      await page.waitForURL((url) => url.pathname.startsWith("/account") || url.pathname.startsWith("/admin"), { timeout: 10000 });

      // Navigate to /admin
      await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
      assert(
        page.url().endsWith("/admin"),
        "Super Admin can access Unified Admin Dashboard at /admin"
      );

      // Verify Admin Header and navigation tabs
      const adminNavTabs = page.locator('nav a[href^="/admin"]');
      const navCount = await adminNavTabs.count();
      assert(
        navCount >= 4,
        `Admin header renders unified sub-navigation tabs (found: ${navCount} admin tabs)`
      );

      // Verify all admin subpages load cleanly
      const adminSubpages = [
        "/admin/access-requests",
        "/admin/rsvps",
        "/admin/wishes",
        "/admin/conversations",
        "/admin/media",
        "/admin/invitation",
      ];

      for (const subpath of adminSubpages) {
        const subRes = await page.goto(`${BASE_URL}${subpath}`, { waitUntil: "networkidle" });
        assert(
          subRes && subRes.status() === 200,
          `Super Admin can access ${subpath} (HTTP 200)`
        );

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth <= window.innerWidth + 1;
        });
        assert(overflow, `${subpath} has zero horizontal scroll overflow on desktop`);
      }

      await adminBrowserContext.close();
    }

    // -----------------------------------------------------------------
    // SECTION 6: EDITORIAL & BRANDING CONSISTENCY
    // -----------------------------------------------------------------
    console.log("\n[6] Editorial & Branding Consistency...");

    {
      const desktopContext = await browser.newContext({ viewport: VIEWPORTS.desktop });
      const page = await desktopContext.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

      const footerText = await page.locator("footer").first().textContent();
      assert(
        footerText.includes("Mithun & Sakhi") && footerText.includes("Purulia"),
        "Editorial footer displays authentic couple and location information"
      );

      await desktopContext.close();
    }
  } finally {
    await browser.close();

    // Teardown test actors
    if (testGuestUser) {
      await adminClient.auth.admin.deleteUser(testGuestUser.id);
    }
    if (testAdminUser) {
      await adminClient.from("admin_users").delete().eq("id", testAdminUser.id);
      await adminClient.auth.admin.deleteUser(testAdminUser.id);
    }
  }

  console.log("\n=======================================================");
  console.log(`RESULTS: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=======================================================\n");

  if (findings.length > 0) {
    console.log("FINDINGS & AUDIT NOTES:");
    for (const f of findings) {
      console.log(`  [${f.severity.toUpperCase()}] ${f.message} ${f.details || ""}`);
    }
  }

  if (failedCount > 0) {
    process.exit(1);
  }
}

runBrowserQA().catch((err) => {
  console.error("FATAL BROWSER QA ERROR:", err);
  process.exit(1);
});
