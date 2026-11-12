// scripts/test_p13_invitation_and_utilities.mjs
// Comprehensive P-13 Digital Invitation Studio & Utilities Verification Pass

import { createClient } from "@supabase/supabase-js";
import { generateQrMatrix, generateQrSvg } from "../src/lib/qr-code.ts";
import {
  generateCeremonyIcs,
  generateAllCeremoniesIcs,
  generateGoogleCalendarUrl,
} from "../src/lib/calendar.ts";
import { WEDDING_DATA } from "../src/data/wedding-data.ts";

const SUPABASE_URL = "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let testPassed = 0;
let testFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testFailed++;
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

async function createAuthenticatedClient(email, password) {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { client, session: data.session, user: data.user };
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("PHASE P-13: DIGITAL INVITATION STUDIO & UTILITIES TESTS");
  console.log("=======================================================\n");

  const TEST_SUPER_EMAIL = "super_p13_test@wedding.local";
  const TEST_INV_EMAIL = "inv_admin_p13_test@wedding.local";
  const TEST_WISHES_EMAIL = "wishes_admin_p13_test@wedding.local";
  const TEST_PASSWORD = "Password123!Safe";

  let superUser = null;
  let invUser = null;
  let wishesUser = null;

  try {
    // -----------------------------------------------------------------
    // SECTION 1: QR CODE GENERATOR TESTS (TC-INV-03)
    // -----------------------------------------------------------------
    console.log("[1] Verifying Self-Contained QR Code Generator (TC-INV-03)...");

    const testUrl = "https://mithun-sakhi-wedding.vercel.app";
    const matrix = generateQrMatrix(testUrl);

    assert(Array.isArray(matrix) && matrix.length >= 21, `QR Matrix generated successfully (${matrix.length}x${matrix.length} grid)`);
    assert(matrix[0][0] === true && matrix[0][6] === true, "Top-left finder pattern present in matrix");
    assert(matrix[0][matrix.length - 1] === true, "Top-right finder pattern present in matrix");
    assert(matrix[matrix.length - 1][0] === true, "Bottom-left finder pattern present in matrix");

    const svgOutput = generateQrSvg(testUrl, { size: 180, fgColor: "#292322" });
    assert(svgOutput.startsWith("<svg") && svgOutput.endsWith("</svg>"), "QR SVG output contains valid SVG tags");
    assert(svgOutput.includes('viewBox="0 0 180 180"'), "QR SVG contains correct viewBox matching size option");
    assert(svgOutput.includes('fill="#292322"'), "QR SVG uses specified foreground wedding charcoal fill color");

    // -----------------------------------------------------------------
    // SECTION 2: CALENDAR INTEGRATION TESTS (TC-CAL-01 & TC-CAL-02)
    // -----------------------------------------------------------------
    console.log("\n[2] Verifying Calendar Utilities & Zero Invented End Times (TC-CAL-01, TC-CAL-02)...");

    const haldiCeremony = WEDDING_DATA.ceremonies.find((c) => c.id === "haldi");
    assert(Boolean(haldiCeremony), "Loaded Haldi ceremony definition from WEDDING_DATA");

    const singleIcs = generateCeremonyIcs(haldiCeremony);
    assert(singleIcs.includes("BEGIN:VCALENDAR") && singleIcs.includes("END:VCALENDAR"), "Single ceremony .ics has valid VCALENDAR wrapper");
    assert(singleIcs.includes("VERSION:2.0"), "Single ceremony .ics uses RFC 5545 VERSION:2.0");
    assert(singleIcs.includes("BEGIN:VTIMEZONE") && singleIcs.includes("TZID:Asia/Kolkata"), "VTIMEZONE component configured for Asia/Kolkata");
    assert(singleIcs.includes("DTSTART;TZID=Asia/Kolkata:20261119T090000"), "Haldi ceremony start timestamp matches 19 Nov 2026 9:00 AM IST");
    assert(!singleIcs.includes("DTEND"), "TC-CAL-02 PASS: Single ceremony .ics strictly omits DTEND (Zero invented end times)");
    assert(singleIcs.includes("UID:haldi-202611@mithun-sakhi-wedding.vercel.app"), "Event UID conforms to wedding domain scheme");

    const allIcs = generateAllCeremoniesIcs();
    const eventCount = (allIcs.match(/BEGIN:VEVENT/g) || []).length;
    assert(eventCount === 4, `All-in-One .ics contains exactly 4 ceremony events (found: ${eventCount})`);
    assert(allIcs.includes("Haldi Ceremony") && allIcs.includes("Mehndi Ceremony") && allIcs.includes("The Sacred Wedding") && allIcs.includes("Reception & Preetibhoj"), "All 4 ceremonies present in .ics bundle");
    assert(!allIcs.includes("DTEND"), "TC-CAL-02 PASS: Entire 4-ceremony .ics bundle strictly omits DTEND (Zero invented end times)");

    const googleUrl = generateGoogleCalendarUrl(haldiCeremony);
    assert(googleUrl.startsWith("https://calendar.google.com/calendar/render?action=TEMPLATE"), "Google Calendar URL uses correct action=TEMPLATE base");
    assert(googleUrl.includes("20261119T033000Z/20261119T033000Z"), "Google Calendar dates use UTC point-in-time range without fabricated end time");
    assert(googleUrl.includes("ctz=Asia/Kolkata"), "Google Calendar URL sets ctz=Asia/Kolkata");

    // -----------------------------------------------------------------
    // SECTION 3: DATABASE MIGRATION & RPC INTEGRATION
    // -----------------------------------------------------------------
    console.log("\n[3] Setting up test actors in local Supabase...");

    // Setup Super Admin
    superUser = await getOrCreateUser(TEST_SUPER_EMAIL, TEST_PASSWORD, "Super Admin P13");
    await adminClient.from("admin_users").upsert({ id: superUser.id, is_super_admin: true, is_active: true });

    // Setup Invitation Studio Staff Admin
    invUser = await getOrCreateUser(TEST_INV_EMAIL, TEST_PASSWORD, "Invitation Admin P13");
    await adminClient.from("admin_users").upsert({ id: invUser.id, is_super_admin: false, is_active: true });
    await adminClient.from("admin_permissions").delete().eq("admin_id", invUser.id);
    await adminClient.from("admin_permissions").insert({ admin_id: invUser.id, permission_group: "invitation_studio" });

    // Setup Wishes-only Staff Admin
    wishesUser = await getOrCreateUser(TEST_WISHES_EMAIL, TEST_PASSWORD, "Wishes Admin P13");
    await adminClient.from("admin_users").upsert({ id: wishesUser.id, is_super_admin: false, is_active: true });
    await adminClient.from("admin_permissions").delete().eq("admin_id", wishesUser.id);
    await adminClient.from("admin_permissions").insert({ admin_id: wishesUser.id, permission_group: "wishes" });

    console.log("  ✓ Test actors provisioned.");

    console.log("\n[4] Testing Public vs Admin RPC Authorization Boundaries...");

    // Public RPC test with Anonymous client
    const { data: pubSettings, error: pubError } = await anonClient.rpc("get_invitation_settings");
    assert(!pubError && pubSettings && typeof pubSettings === "object", "Anon can read public get_invitation_settings()");
    assert(pubSettings.default_template === "cinematic" || pubSettings.default_template === "traditional", `Public settings contain valid default_template: ${pubSettings.default_template}`);

    // Anon blocked from admin RPCs
    const { error: anonGetError } = await anonClient.rpc("admin_get_invitation_settings");
    assert(Boolean(anonGetError), "Anon blocked from admin_get_invitation_settings()");

    const { error: anonUpdateError } = await anonClient.rpc("admin_update_invitation_settings", {
      p_headline_text: "Hack",
      p_intro_text: "Intro",
      p_qr_code_target_url: "https://hack.com",
      p_default_template: "cinematic",
      p_is_published: true,
    });
    assert(Boolean(anonUpdateError), "Anon blocked from admin_update_invitation_settings()");

    // Wishes-only admin blocked
    const { client: wishesClient } = await createAuthenticatedClient(TEST_WISHES_EMAIL, TEST_PASSWORD);
    const { error: wishesGetError } = await wishesClient.rpc("admin_get_invitation_settings");
    assert(Boolean(wishesGetError), "Wishes-only admin blocked from admin_get_invitation_settings() (42501)");

    const { error: wishesUpdateError } = await wishesClient.rpc("admin_update_invitation_settings", {
      p_headline_text: "Hack",
      p_intro_text: "Intro",
      p_qr_code_target_url: "https://hack.com",
      p_default_template: "cinematic",
      p_is_published: true,
    });
    assert(Boolean(wishesUpdateError), "Wishes-only admin blocked from admin_update_invitation_settings() (42501)");

    // Wishes admin dashboard metrics should NOT contain invitation_metrics
    const { data: wishesMetrics } = await wishesClient.rpc("get_admin_dashboard_metrics");
    assert(!wishesMetrics?.invitation_metrics, "Wishes admin does NOT receive invitation_metrics in get_admin_dashboard_metrics");

    console.log("\n[5] Testing Authorized Invitation Studio Administration...");

    // Invitation Admin succeeds
    const { client: invClient } = await createAuthenticatedClient(TEST_INV_EMAIL, TEST_PASSWORD);
    const { data: adminSettings, error: invGetError } = await invClient.rpc("admin_get_invitation_settings");
    assert(!invGetError && adminSettings, "Invitation admin successfully calls admin_get_invitation_settings()");

    // Update settings to traditional
    const { data: updateRes, error: updateError } = await invClient.rpc("admin_update_invitation_settings", {
      p_headline_text: "Royal Wedding Celebration",
      p_intro_text: "We invite you to the sacred union.",
      p_qr_code_target_url: "https://mithun-sakhi-wedding.vercel.app/rsvp",
      p_default_template: "traditional",
      p_is_published: true,
      p_custom_announcement: "Special transport from Purulia junction arranged.",
    });
    assert(!updateError && updateRes?.default_template === "traditional", "Invitation admin successfully updates default_template to 'traditional'");

    // Verify public RPC reflects updated template
    const { data: updatedPubSettings } = await anonClient.rpc("get_invitation_settings");
    assert(updatedPubSettings.default_template === "traditional", "Public RPC get_invitation_settings reflects new 'traditional' default_template");
    assert(updatedPubSettings.headline_text === "Royal Wedding Celebration", "Public RPC reflects updated headline text");
    assert(updatedPubSettings.custom_announcement === "Special transport from Purulia junction arranged.", "Public RPC reflects custom announcement");

    // Invitation admin dashboard metrics includes invitation_metrics
    const { data: invMetrics } = await invClient.rpc("get_admin_dashboard_metrics");
    assert(invMetrics?.invitation_metrics?.default_template === "traditional", "Invitation admin receives invitation_metrics with template 'traditional'");

    // Invalid template rejected
    const { error: invalidTplError } = await invClient.rpc("admin_update_invitation_settings", {
      p_headline_text: "Royal Wedding",
      p_intro_text: "Intro",
      p_qr_code_target_url: "https://mithun-sakhi-wedding.vercel.app",
      p_default_template: "cyberpunk_neon",
      p_is_published: true,
    });
    assert(Boolean(invalidTplError), "Invalid template 'cyberpunk_neon' rejected by RPC validation");

    // Restore to default cinematic
    await invClient.rpc("admin_update_invitation_settings", {
      p_headline_text: "Celebrate the Wedding of",
      p_intro_text: "With the blessings of our parents, we warmly invite you to join us in celebrating the holy union of Mithun & Sakhi.",
      p_qr_code_target_url: "https://mithun-sakhi-wedding.vercel.app",
      p_default_template: "cinematic",
      p_is_published: true,
      p_custom_announcement: null,
    });
    console.log("  ✓ Restored default invitation settings.");
  } finally {
    // Teardown test actors
    console.log("\n[6] Tearing down test actors...");
    if (invUser) {
      await adminClient.from("admin_permissions").delete().eq("admin_id", invUser.id);
      await adminClient.from("admin_users").delete().eq("id", invUser.id);
      await adminClient.auth.admin.deleteUser(invUser.id);
    }
    if (wishesUser) {
      await adminClient.from("admin_permissions").delete().eq("admin_id", wishesUser.id);
      await adminClient.from("admin_users").delete().eq("id", wishesUser.id);
      await adminClient.auth.admin.deleteUser(wishesUser.id);
    }
    if (superUser) {
      await adminClient.from("admin_users").delete().eq("id", superUser.id);
      await adminClient.auth.admin.deleteUser(superUser.id);
    }
    console.log("  ✓ Teardown complete.");
  }

  console.log("\n=======================================================");
  console.log(`RESULTS: ${testPassed} Passed, ${testFailed} Failed`);
  console.log("=======================================================\n");

  if (testFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Unhandled test suite exception:", err);
  process.exit(1);
});
