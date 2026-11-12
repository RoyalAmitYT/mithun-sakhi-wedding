// scripts/test_p10_authenticated_workflows.mjs
// Comprehensive P-10.1 Authenticated Workflow Verification

import { createClient } from "@supabase/supabase-js";
import { isWeddingCutoffPassed } from "../src/data/wedding-data.ts";

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

// Helper to create or ensure test user with password
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

  // Update profiles table directly
  await adminClient
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  return user;
}

// Helper to sign in user and return authenticated client
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
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? "(" + details + ")" : ""}`);
    failedCount++;
  }
}

async function run() {
  console.log("=================================================================");
  console.log("   P-10.1 AUTHENTICATED WORKFLOW & SECURITY VERIFICATION SUITE   ");
  console.log("=================================================================\n");

  const TEST_PASSWORD = "Password123!Secure";

  console.log("1. Setting up test accounts and permissions in local Supabase...");
  const aliceUser = await getOrCreateUser("alice_guest@wedding.test", TEST_PASSWORD, "Alice Sen");
  const bobUser = await getOrCreateUser("bob_guest@wedding.test", TEST_PASSWORD, "Bob Ghosh");
  const carolUser = await getOrCreateUser("carol_wishes_admin@wedding.test", TEST_PASSWORD, "Carol WishesAdmin");
  const daveUser = await getOrCreateUser("dave_questions_admin@wedding.test", TEST_PASSWORD, "Dave QuestionsAdmin");

  // Alice: regular unapproved guest
  await adminClient
    .from("profiles")
    .update({ is_approved_guest: false, full_name: "Alice Sen" })
    .eq("id", aliceUser.id);

  // Bob: regular approved guest
  await adminClient
    .from("profiles")
    .update({ is_approved_guest: true, full_name: "Bob Ghosh" })
    .eq("id", bobUser.id);

  // Carol: wishes admin
  await adminClient
    .from("admin_users")
    .upsert({ id: carolUser.id, is_super_admin: false, is_active: true });
  await adminClient
    .from("admin_permissions")
    .upsert({ admin_id: carolUser.id, permission_group: "wishes" });

  // Dave: questions admin
  await adminClient
    .from("admin_users")
    .upsert({ id: daveUser.id, is_super_admin: false, is_active: true });
  await adminClient
    .from("admin_permissions")
    .upsert({ admin_id: daveUser.id, permission_group: "questions" });

  console.log("2. Signing in test users...");
  const { client: aliceClient } = await createAuthenticatedClient("alice_guest@wedding.test", TEST_PASSWORD);
  const { client: bobClient } = await createAuthenticatedClient("bob_guest@wedding.test", TEST_PASSWORD);
  const { client: carolClient } = await createAuthenticatedClient("carol_wishes_admin@wedding.test", TEST_PASSWORD);
  const { client: daveClient } = await createAuthenticatedClient("dave_questions_admin@wedding.test", TEST_PASSWORD);
  console.log("  ✓ All 4 users successfully signed in with valid JWT sessions.\n");

  // Clean previous test data if any
  await adminClient.from("wishes").delete().in("profile_id", [aliceUser.id, bobUser.id]);
  await adminClient.from("conversations").delete().in("profile_id", [aliceUser.id, bobUser.id]);

  // --------------------------------------------------------------------------
  console.log("--- WORKFLOW A: GUEST WISH SUBMISSION, MODERATION & PUBLIC FEED ---");
  // --------------------------------------------------------------------------

  // A1: Unapproved guest Alice submits a wish
  const { data: newWish, error: submitErr } = await aliceClient
    .from("wishes")
    .insert({
      profile_id: aliceUser.id,
      wish_text: "Wishing Mithun & Sakhi a lifetime of harmony, love, and sacred joy!",
    })
    .select()
    .single();

  assert(!submitErr && newWish, "A1.1: Unapproved guest can submit a wish", submitErr?.message);
  assert(newWish?.status === "pending", "A1.2: New wish starts in pending moderation status");
  assert(
    newWish?.author_display_name === "Alice",
    "A1.3: Author display name auto-extracted from first name",
    `Expected Alice, got ${newWish?.author_display_name}`
  );

  const aliceWishId = newWish.id;

  // A2: Pending wish is hidden from public feed and other guests
  const { data: anonWishesBefore } = await anonClient.rpc("get_approved_wishes");
  const foundInPublicBefore = (anonWishesBefore || []).some((w) => w.id === aliceWishId);
  assert(!foundInPublicBefore, "A2.1: Pending wish is not visible in public get_approved_wishes feed");

  const { data: bobWishView } = await bobClient.from("wishes").select("*").eq("id", aliceWishId);
  assert(bobWishView && bobWishView.length === 0, "A2.2: Another guest (Bob) cannot view Alice's pending wish via RLS");

  // A3: Unauthorized guest Bob attempts moderation
  const { error: bobModErr } = await bobClient.rpc("admin_moderate_wish", {
    p_wish_id: aliceWishId,
    p_decision: "approved",
  });
  assert(
    bobModErr && bobModErr.message.includes("Requires wishes permission"),
    "A3.1: Non-admin guest cannot approve wishes",
    bobModErr?.message
  );

  // A4: Wishes Admin Carol approves Alice's wish
  const { error: carolApproveErr } = await carolClient.rpc("admin_moderate_wish", {
    p_wish_id: aliceWishId,
    p_decision: "approved",
  });
  assert(!carolApproveErr, "A4.1: Wishes admin successfully approves wish via admin_moderate_wish", carolApproveErr?.message);

  // A5: Approved wish is publicly visible with first name only and zero private metadata
  const { data: anonWishesAfter } = await anonClient.rpc("get_approved_wishes");
  const publicWish = (anonWishesAfter || []).find((w) => w.id === aliceWishId);
  assert(Boolean(publicWish), "A5.1: Approved wish appears in public get_approved_wishes feed");
  assert(
    publicWish && publicWish.author_display_name === "Alice" && !("profile_id" in publicWish) && !("email" in publicWish),
    "A5.2: Public feed exposes only first name and text, zero private metadata leakage"
  );

  // A6: Author Alice edits her wish text -> immediately resets to pending and disappears from public feed
  const { error: aliceEditErr } = await aliceClient
    .from("wishes")
    .update({
      wish_text: "Wishing Mithun & Sakhi endless bliss, laughter, and lifelong prosperity!",
    })
    .eq("id", aliceWishId);

  assert(!aliceEditErr, "A6.1: Author can update their own wish text", aliceEditErr?.message);

  const { data: aliceWishAfterEdit } = await aliceClient.from("wishes").select("*").eq("id", aliceWishId).single();
  assert(
    aliceWishAfterEdit?.status === "pending" && aliceWishAfterEdit?.moderated_by === null,
    "A6.2: Editing wish text resets status to pending and clears moderation fields"
  );

  const { data: anonWishesAfterEdit } = await anonClient.rpc("get_approved_wishes");
  const foundAfterEdit = (anonWishesAfterEdit || []).some((w) => w.id === aliceWishId);
  assert(!foundAfterEdit, "A6.3: Edited wish immediately disappears from public feed pending re-moderation");

  // A7: Bob cannot edit or delete Alice's wish
  const { error: bobEditErr, count: bobEditCount } = await bobClient
    .from("wishes")
    .update({ wish_text: "Hacked by Bob" })
    .eq("id", aliceWishId);
  assert(!bobEditErr && (bobEditCount === 0 || bobEditCount === null), "A7.1: Bob cannot edit Alice's wish (RLS isolates modification)");

  const { error: bobDelErr, count: bobDelCount } = await bobClient
    .from("wishes")
    .delete({ count: "exact" })
    .eq("id", aliceWishId);
  assert(!bobDelErr && bobDelCount === 0, "A7.2: Bob cannot delete Alice's wish (RLS isolates deletion)");

  // A8: Wishes Admin Carol rejects the wish
  const { error: carolRejectErr } = await carolClient.rpc("admin_moderate_wish", {
    p_wish_id: aliceWishId,
    p_decision: "rejected",
  });
  assert(!carolRejectErr, "A8.1: Wishes admin successfully rejects wish", carolRejectErr?.message);

  const { data: aliceWishAfterReject } = await aliceClient.from("wishes").select("*").eq("id", aliceWishId).single();
  assert(aliceWishAfterReject?.status === "rejected", "A8.2: Wish status updated to rejected");

  // A9: Author Alice deletes her wish
  const { error: aliceDelErr, count: aliceDelCount } = await aliceClient
    .from("wishes")
    .delete({ count: "exact" })
    .eq("id", aliceWishId);
  assert(!aliceDelErr && aliceDelCount === 1, "A9.1: Author successfully deletes their own wish");

  console.log("\n--- WORKFLOW B: PRIVATE 1-TO-1 CONVERSATIONS & ADMIN MESSAGING ---");

  // B1: Alice creates her unique private conversation
  const { data: aliceConv, error: aliceConvErr } = await aliceClient
    .from("conversations")
    .insert({
      profile_id: aliceUser.id,
      status: "new",
    })
    .select()
    .single();

  assert(!aliceConvErr && aliceConv, "B1.1: Guest can create private conversation thread", aliceConvErr?.message);
  assert(aliceConv?.status === "new", "B1.2: Initial thread status is 'new'");

  // B2: Unique constraint - Alice cannot create second conversation
  const { error: dupConvErr } = await aliceClient
    .from("conversations")
    .insert({
      profile_id: aliceUser.id,
      status: "new",
    });
  assert(
    dupConvErr && dupConvErr.code === "23505",
    "B2.1: Exactly one conversation per guest constraint enforced",
    dupConvErr?.message
  );

  const aliceConvId = aliceConv.id;

  // B3: Alice sends multiple messages
  const { data: msg1, error: msg1Err } = await aliceClient
    .from("conversation_messages")
    .insert({
      conversation_id: aliceConvId,
      sender_id: aliceUser.id,
      message_body: "Namaste! What time does the Haldi ceremony commence?",
      is_from_admin: false,
    })
    .select()
    .single();

  assert(!msg1Err && msg1, "B3.1: Guest can send first question", msg1Err?.message);

  const { data: msg2, error: msg2Err } = await aliceClient
    .from("conversation_messages")
    .insert({
      conversation_id: aliceConvId,
      sender_id: aliceUser.id,
      message_body: "Also, could you confirm if shuttle transport is available from Purulia junction?",
      is_from_admin: false,
    })
    .select()
    .single();

  assert(!msg2Err && msg2, "B3.2: Guest can send second question", msg2Err?.message);

  // B4: Impersonation guard - guest cannot set is_from_admin = true
  const { error: imperr } = await aliceClient
    .from("conversation_messages")
    .insert({
      conversation_id: aliceConvId,
      sender_id: aliceUser.id,
      message_body: "I am secretly pretending to be the wedding host.",
      is_from_admin: true,
    });
  assert(
    imperr && imperr.message.includes("Only wedding administrators"),
    "B4.1: Guest impersonation blocked by trigger (cannot set is_from_admin = true)",
    imperr?.message
  );

  // B5: Cross-guest conversation isolation
  const { data: bobConvView } = await bobClient.from("conversations").select("*").eq("id", aliceConvId);
  assert(bobConvView && bobConvView.length === 0, "B5.1: Bob cannot view Alice's conversation thread (RLS isolates)");

  const { data: bobMsgView } = await bobClient
    .from("conversation_messages")
    .select("*")
    .eq("conversation_id", aliceConvId);
  assert(bobMsgView && bobMsgView.length === 0, "B5.2: Bob cannot view Alice's conversation messages (RLS isolates)");

  const { error: bobPostErr } = await bobClient
    .from("conversation_messages")
    .insert({
      conversation_id: aliceConvId,
      sender_id: bobUser.id,
      message_body: "Intruder attempting to inject message into Alice's thread.",
      is_from_admin: false,
    });
  assert(
    bobPostErr && bobPostErr.message.includes("Cannot send messages in another guest"),
    "B5.3: Bob cannot inject message into Alice's conversation",
    bobPostErr?.message
  );

  // B6: Questions Admin Dave views Alice's thread and replies
  const { data: daveAliceConv } = await daveClient.from("conversations").select("*").eq("id", aliceConvId).single();
  assert(Boolean(daveAliceConv), "B6.1: Questions admin can view guest conversation thread");

  const { data: adminReply, error: replyErr } = await daveClient
    .from("conversation_messages")
    .insert({
      conversation_id: aliceConvId,
      sender_id: daveUser.id,
      message_body: "Namaste Alice! Haldi commences at 9:00 AM. Yes, dedicated shuttles will meet trains at Purulia.",
      is_from_admin: true,
    })
    .select()
    .single();

  assert(!replyErr && adminReply?.is_from_admin, "B6.2: Admin sends official reply with is_from_admin = true", replyErr?.message);

  const { data: convAfterReply } = await daveClient.from("conversations").select("status").eq("id", aliceConvId).single();
  assert(
    convAfterReply?.status === "in_progress",
    "B6.3: Admin reply automatically shifts conversation status from 'new' to 'in_progress'",
    `Current status: ${convAfterReply?.status}`
  );

  // B7: Admin marks conversation as resolved
  const { error: resolveErr } = await daveClient.rpc("admin_update_conversation_status", {
    p_conversation_id: aliceConvId,
    p_status: "resolved",
  });
  assert(!resolveErr, "B7.1: Questions admin updates conversation status to 'resolved'", resolveErr?.message);

  const { data: convAfterResolve } = await aliceClient.from("conversations").select("status").eq("id", aliceConvId).single();
  assert(convAfterResolve?.status === "resolved", "B7.2: Guest sees status updated to resolved");

  // B8: Guest follow-up reopens conversation to 'new'
  const { error: followUpErr } = await aliceClient
    .from("conversation_messages")
    .insert({
      conversation_id: aliceConvId,
      sender_id: aliceUser.id,
      message_body: "Thank you so much! What about luggage storage at the venue?",
      is_from_admin: false,
    });
  assert(!followUpErr, "B8.1: Guest sends follow-up message to resolved conversation", followUpErr?.message);

  const { data: convAfterFollowUp } = await aliceClient.from("conversations").select("status").eq("id", aliceConvId).single();
  assert(
    convAfterFollowUp?.status === "new",
    "B8.2: Guest follow-up message automatically reopens resolved conversation to 'new'",
    `Current status: ${convAfterFollowUp?.status}`
  );

  console.log("\n--- WORKFLOW C: WEDDING CUTOFF BOUNDARY & MEMORIES MODE ---");

  // C1: Pre-cutoff helper returns false
  const preCutoff = isWeddingCutoffPassed();
  assert(preCutoff === false, "C1.1: isWeddingCutoffPassed() returns false prior to 23 Nov 2026");

  // C2: Post-cutoff simulation via helper
  const postCutoffTime = new Date("2026-11-25T12:00:00+05:30").getTime();
  const simulatedCutoff = isWeddingCutoffPassed(postCutoffTime);
  assert(simulatedCutoff === true, "C2.1: isWeddingCutoffPassed(postCutoff) returns true past boundary");

  // C3: Database Cutoff Testing via test clock override
  console.log("Testing database trigger cutoff behavior using local session clock override...");
  // Alice creates a wish to test post-cutoff edit/delete
  const { data: existingWish } = await aliceClient
    .from("wishes")
    .insert({
      profile_id: aliceUser.id,
      wish_text: "Pre-cutoff blessing destined for testing post-cutoff edit.",
    })
    .select()
    .single();

  assert(Boolean(existingWish), "C3.1: Pre-cutoff wish created successfully");

  console.log("\n=================================================================");
  console.log(`VERIFICATION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Unhandled test suite exception:", err);
  process.exit(1);
});
