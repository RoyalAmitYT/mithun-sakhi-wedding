// scripts/test_p11_admin_dashboard.mjs
// Comprehensive P-11 Unified Wedding Admin Dashboard & Security Verification Pass

import { createClient } from "@supabase/supabase-js";

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

// Helper to create or get test user
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

  // Ensure profile exists
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

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
    passedCount++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${testName} ${details ? `(${details})` : ""}`);
    failedCount++;
  }
}

async function runP11VerificationSuite() {
  console.log("================================================================================");
  console.log("   P-11 UNIFIED ADMIN DASHBOARD & SECURITY VERIFICATION SUITE");
  console.log("================================================================================");

  const TEST_PASSWORD = "Password123!Secure";

  let superAdminUser;
  let wishesAdminUser;
  let regularGuestUser;

  try {
    // 1. Prepare identities
    console.log("\n[Setup] Provisioning test actors...");
    
    // Super Admin: mithun@wedding.local (from seed)
    superAdminUser = await getOrCreateUser(
      "mithun@wedding.local",
      TEST_PASSWORD,
      "Mithun Gorain"
    );
    await adminClient
      .from("admin_users")
      .upsert({ id: superAdminUser.id, is_super_admin: true, is_active: true });

    // Wishes-only Staff Admin
    wishesAdminUser = await getOrCreateUser(
      "staff_wishes@wedding.local",
      TEST_PASSWORD,
      "Wishes Staff Coordinator"
    );
    await adminClient
      .from("admin_users")
      .upsert({ id: wishesAdminUser.id, is_super_admin: false, is_active: true });
    await adminClient
      .from("admin_permissions")
      .delete()
      .eq("admin_id", wishesAdminUser.id);
    await adminClient
      .from("admin_permissions")
      .insert({ admin_id: wishesAdminUser.id, permission_group: "wishes" });

    // Regular Guest (not an admin)
    regularGuestUser = await getOrCreateUser(
      "regular_guest@wedding.local",
      TEST_PASSWORD,
      "Regular Guest User"
    );
  await adminClient.from("admin_users").delete().eq("id", regularGuestUser.id);
  await adminClient
    .from("profiles")
    .update({ is_approved_guest: true })
    .eq("id", regularGuestUser.id);

  // Authenticate clients
  const { client: superAdminAuth } = await createAuthenticatedClient(
    "mithun@wedding.local",
    TEST_PASSWORD
  );
  const { client: wishesAdminAuth } = await createAuthenticatedClient(
    "staff_wishes@wedding.local",
    TEST_PASSWORD
  );
  const { client: guestAuth } = await createAuthenticatedClient(
    "regular_guest@wedding.local",
    TEST_PASSWORD
  );

  console.log("Actors prepared successfully.");

  // ----------------------------------------------------------------------------
  // TEST GROUP 1: UNAUTHENTICATED & NON-ADMIN ACCESS RESTRICTIONS
  // ----------------------------------------------------------------------------
  console.log("\n[Test Group 1: Unauthenticated & Guest Authorization Boundary]");

  // 1.1 Unauthenticated caller cannot get dashboard metrics
  const { error: anonMetricsErr } = await anonClient.rpc(
    "get_admin_dashboard_metrics"
  );
  assert(
    Boolean(anonMetricsErr),
    "1.1 Unauthenticated caller cannot execute get_admin_dashboard_metrics",
    anonMetricsErr?.message
  );

  // 1.2 Unauthenticated caller cannot get admin team roster
  const { error: anonTeamErr } = await anonClient.rpc("get_admin_team");
  assert(
    Boolean(anonTeamErr),
    "1.2 Unauthenticated caller cannot execute get_admin_team",
    anonTeamErr?.message
  );

  // 1.3 Regular guest cannot get dashboard metrics
  const { error: guestMetricsErr } = await guestAuth.rpc(
    "get_admin_dashboard_metrics"
  );
  assert(
    Boolean(guestMetricsErr),
    "1.3 Regular guest cannot execute get_admin_dashboard_metrics",
    guestMetricsErr?.message
  );

  // 1.4 Regular guest cannot get admin team roster
  const { error: guestTeamErr } = await guestAuth.rpc("get_admin_team");
  assert(
    Boolean(guestTeamErr),
    "1.4 Regular guest cannot execute get_admin_team",
    guestTeamErr?.message
  );

  // 1.5 Regular guest cannot execute admin_manage_admin_user
  const { error: guestManageErr } = await guestAuth.rpc(
    "admin_manage_admin_user",
    {
      p_admin_id: guestAuth.auth ? regularGuestUser.id : "00000000-0000-0000-0000-000000000000",
      p_is_active: true,
      p_permissions: ["wishes"],
    }
  );
  assert(
    Boolean(guestManageErr),
    "1.5 Regular guest cannot execute admin_manage_admin_user",
    guestManageErr?.message
  );

  // ----------------------------------------------------------------------------
  // TEST GROUP 2: PERMISSION-SCOPED DASHBOARD METRICS
  // ----------------------------------------------------------------------------
  console.log("\n[Test Group 2: Permission-Scoped Dashboard Metrics & Zero Data Leakage]");

  // 2.1 Wishes-only admin receives only wishes_metrics
  const { data: wishesMetrics, error: wishesMetricsErr } = await wishesAdminAuth.rpc(
    "get_admin_dashboard_metrics"
  );
  assert(
    !wishesMetricsErr && wishesMetrics !== null,
    "2.1 Wishes admin successfully calls get_admin_dashboard_metrics",
    wishesMetricsErr?.message
  );

  assert(
    wishesMetrics?.is_super_admin === false,
    "2.2 Wishes admin correctly identified as is_super_admin = false"
  );

  assert(
    wishesMetrics?.wishes_metrics !== undefined && wishesMetrics?.wishes_metrics !== null,
    "2.3 Wishes admin receives wishes_metrics in payload"
  );

  assert(
    wishesMetrics?.rsvp_metrics === undefined,
    "2.4 Wishes admin does NOT receive rsvp_metrics (zero RSVP leakage)"
  );

  assert(
    wishesMetrics?.conversations_metrics === undefined,
    "2.5 Wishes admin does NOT receive conversations_metrics (zero inquiry leakage)"
  );

  // 2.2 Super Admin receives complete unified metrics across all areas
  const { data: superMetrics, error: superMetricsErr } = await superAdminAuth.rpc(
    "get_admin_dashboard_metrics"
  );
  assert(
    !superMetricsErr && superMetrics !== null,
    "2.6 Super Admin successfully calls get_admin_dashboard_metrics",
    superMetricsErr?.message
  );

  assert(
    superMetrics?.is_super_admin === true,
    "2.7 Super Admin correctly identified as is_super_admin = true"
  );

  assert(
    superMetrics?.rsvp_metrics !== undefined &&
      typeof superMetrics?.rsvp_metrics?.attending_headcount === "number",
    "2.8 Super Admin receives rsvp_metrics with attending headcount"
  );

  assert(
    superMetrics?.wishes_metrics !== undefined &&
      typeof superMetrics?.wishes_metrics?.pending_wishes === "number",
    "2.9 Super Admin receives wishes_metrics"
  );

  assert(
    superMetrics?.conversations_metrics !== undefined &&
      typeof superMetrics?.conversations_metrics?.new_inquiries === "number",
    "2.10 Super Admin receives conversations_metrics"
  );

  // ----------------------------------------------------------------------------
  // TEST GROUP 3: SUPER ADMIN ROSTER & STAFF MANAGEMENT
  // ----------------------------------------------------------------------------
  console.log("\n[Test Group 3: Super Admin Roster Management & Safeguards]");

  // 3.1 Wishes admin cannot fetch team roster
  const { error: deniedTeamErr } = await wishesAdminAuth.rpc("get_admin_team");
  assert(
    Boolean(deniedTeamErr),
    "3.1 Non-Super Admin cannot fetch team roster",
    deniedTeamErr?.message
  );

  // 3.2 Super Admin can fetch team roster
  const { data: teamRoster, error: teamRosterErr } = await superAdminAuth.rpc("get_admin_team");
  assert(
    !teamRosterErr && Array.isArray(teamRoster),
    "3.2 Super Admin successfully retrieves admin team roster",
    teamRosterErr?.message
  );

  const superInRoster = teamRoster?.find((m) => m.id === superAdminUser.id);
  assert(
    superInRoster && superInRoster.is_super_admin === true,
    "3.3 Super Admin is present in roster with is_super_admin = true"
  );

  // 3.3 Super Admin cannot deactivate own account
  const { error: selfDeactErr } = await superAdminAuth.rpc(
    "admin_manage_admin_user",
    {
      p_admin_id: superAdminUser.id,
      p_is_active: false,
      p_permissions: [],
    }
  );
  assert(
    Boolean(selfDeactErr),
    "3.4 Super Admin cannot deactivate own account (safeguard enforced)",
    selfDeactErr?.message
  );

  // 3.4 Super Admin manages staff admin permissions
  const { data: updatedStaff, error: updatedStaffErr } = await superAdminAuth.rpc(
    "admin_manage_admin_user",
    {
      p_admin_id: wishesAdminUser.id,
      p_is_active: true,
      p_permissions: ["wishes", "questions"],
    }
  );
  assert(
    !updatedStaffErr && updatedStaff?.success === true,
    "3.5 Super Admin successfully updates staff permissions to ['wishes', 'questions']",
    updatedStaffErr?.message
  );

  // Verify staff now receives both wishes and questions metrics
  const { data: expandedMetrics } = await wishesAdminAuth.rpc("get_admin_dashboard_metrics");
  assert(
    expandedMetrics?.wishes_metrics !== undefined &&
      expandedMetrics?.conversations_metrics !== undefined &&
      expandedMetrics?.rsvp_metrics === undefined,
    "3.6 Updated staff immediately receives both wishes and conversations metrics, still no rsvp"
  );

  // Reset staff permissions back to wishes only
  await superAdminAuth.rpc("admin_manage_admin_user", {
    p_admin_id: wishesAdminUser.id,
    p_is_active: true,
    p_permissions: ["wishes"],
  });

  // ----------------------------------------------------------------------------
  // TEST GROUP 4: NOTIFICATIONS & READ STATE WORKFLOW
  // ----------------------------------------------------------------------------
  console.log("\n[Test Group 4: Notification Center & Read State Workflow]");

  // 4.1 Create test notifications for guest_rsvp and wishes
  const { data: rsvpNotif, error: rsvpNotifErr } = await adminClient
    .from("admin_notifications")
    .insert({
      permission_group: "guest_rsvp",
      title: "P-11 Test RSVP Alert",
      message: "Test notification for guest_rsvp",
      is_read: false,
    })
    .select("id")
    .single();

  const { data: wishNotif, error: wishNotifErr } = await adminClient
    .from("admin_notifications")
    .insert({
      permission_group: "wishes",
      title: "P-11 Test Wish Alert",
      message: "Test notification for wishes",
      is_read: false,
    })
    .select("id")
    .single();

  assert(
    !rsvpNotifErr && !wishNotifErr,
    "4.1 Test notifications seeded for guest_rsvp and wishes"
  );

  // 4.2 Wishes admin cannot mark RSVP notification as read
  const { error: deniedMarkErr } = await wishesAdminAuth.rpc("admin_mark_notification_read", {
    p_notification_id: rsvpNotif.id,
  });
  assert(
    Boolean(deniedMarkErr),
    "4.2 Wishes admin cannot mark guest_rsvp notification as read (unauthorized)",
    deniedMarkErr?.message
  );

  // 4.3 Wishes admin can mark wish notification as read
  const { error: markWishErr } = await wishesAdminAuth.rpc("admin_mark_notification_read", {
    p_notification_id: wishNotif.id,
  });
  assert(
    !markWishErr,
    "4.3 Wishes admin successfully marks wishes notification as read",
    markWishErr?.message
  );

  // Verify wish notification is now read
  const { data: readWishCheck } = await adminClient
    .from("admin_notifications")
    .select("is_read")
    .eq("id", wishNotif.id)
    .single();
  assert(
    readWishCheck?.is_read === true,
    "4.4 Database confirms notification is_read = true"
  );

  // 4.4 Super Admin can mark all notifications read
  const { error: markAllErr } = await superAdminAuth.rpc("admin_mark_all_notifications_read");
  assert(
    !markAllErr,
    "4.5 Super Admin successfully calls admin_mark_all_notifications_read",
    markAllErr?.message
  );

  // Clean up test notifications
  await adminClient.from("admin_notifications").delete().in("id", [rsvpNotif.id, wishNotif.id]);

  } finally {
    console.log("\n[Teardown] Cleaning up persistent test actors...");
    await adminClient.from("admin_permissions").delete().neq("permission_group", "none");
    await adminClient.from("admin_users").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    console.log("Teardown complete.");
  }

  // ----------------------------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`VERIFICATION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("================================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runP11VerificationSuite().catch((err) => {
  console.error("Unhandled verification exception:", err);
  process.exit(1);
});
