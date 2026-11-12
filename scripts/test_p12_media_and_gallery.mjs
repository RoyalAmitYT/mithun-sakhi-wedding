// scripts/test_p12_media_and_gallery.mjs
// Comprehensive P-12 Media Manager & Published Gallery Verification Pass

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import { extractYouTubeVideoId } from "../src/lib/youtube.ts";

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

async function runP12VerificationSuite() {
  console.log("================================================================================");
  console.log("   P-12 MEDIA MANAGER & PUBLISHED GALLERY VERIFICATION SUITE");
  console.log("================================================================================");

  const TEST_PASSWORD = "Password123!Secure";
  let photoAdminUser;
  let wishesAdminUser;
  let regularGuestUser;
  const createdMediaIds = [];
  const createdFilePaths = [];

  try {
    console.log("\n[Setup] Provisioning test actors...");

    // Photos Admin
    photoAdminUser = await getOrCreateUser(
      "photo_admin@wedding.local",
      TEST_PASSWORD,
      "Photo Coordinator"
    );
    await adminClient
      .from("admin_users")
      .upsert({ id: photoAdminUser.id, is_super_admin: false, is_active: true });
    await adminClient
      .from("admin_permissions")
      .delete()
      .eq("admin_id", photoAdminUser.id);
    await adminClient
      .from("admin_permissions")
      .insert({ admin_id: photoAdminUser.id, permission_group: "photos" });

    // Wishes Admin (lacks photos permission)
    wishesAdminUser = await getOrCreateUser(
      "wishes_admin@wedding.local",
      TEST_PASSWORD,
      "Wishes Coordinator"
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

    // Regular Guest
    regularGuestUser = await getOrCreateUser(
      "regular_guest@wedding.local",
      TEST_PASSWORD,
      "Regular Guest"
    );
    await adminClient.from("admin_users").delete().eq("id", regularGuestUser.id);
    await adminClient
      .from("profiles")
      .update({ is_approved_guest: true })
      .eq("id", regularGuestUser.id);

    // Authenticated Clients
    const { client: photoAuth } = await createAuthenticatedClient(
      "photo_admin@wedding.local",
      TEST_PASSWORD
    );
    const { client: wishesAuth } = await createAuthenticatedClient(
      "wishes_admin@wedding.local",
      TEST_PASSWORD
    );
    const { client: guestAuth } = await createAuthenticatedClient(
      "regular_guest@wedding.local",
      TEST_PASSWORD
    );

    console.log("Actors prepared successfully.");

    // ----------------------------------------------------------------------------
    // TEST GROUP 1: PRIVATE DRAFT ISOLATION (TC-MED-01)
    // ----------------------------------------------------------------------------
    console.log("\n[Test Group 1: Private Draft Isolation (TC-MED-01)]");

    // 1.1 Photo Admin creates a private draft photograph
    const draftStoragePath = "/storage/media/test_private_draft.jpg";
    const testDiskPath = path.join(process.cwd(), "storage", "media", "test_private_draft.jpg");
    await fs.writeFile(testDiskPath, Buffer.from("fake-jpeg-binary-content"));
    createdFilePaths.push(testDiskPath);

    const { data: createdDraft, error: createDraftErr } = await photoAuth.rpc(
      "admin_create_media_item",
      {
        p_media_type: "photo",
        p_storage_path: draftStoragePath,
        p_category: "haldi",
        p_caption: "Private Haldi Draft Photograph",
        p_is_published: false,
        p_download_enabled: true,
        p_file_name: "test_private_draft.jpg",
        p_file_size_bytes: 1024,
        p_mime_type: "image/jpeg",
      }
    );

    assert(
      !createDraftErr && createdDraft?.id,
      "1.1 Photo Admin successfully creates private draft photograph",
      createDraftErr?.message
    );
    const draftId = createdDraft.id;
    createdMediaIds.push(draftId);

    // 1.2 Unauthenticated caller calling get_published_media does NOT see the draft
    const { data: anonMediaList } = await anonClient.rpc("get_published_media");
    const anonDraftFound = (anonMediaList || []).some((m) => m.id === draftId);
    assert(
      !anonDraftFound,
      "1.2 Anonymous visitor cannot see unapproved/draft photo in get_published_media"
    );

    // 1.3 Regular guest calling get_published_media does NOT see the draft
    const { data: guestMediaList } = await guestAuth.rpc("get_published_media");
    const guestDraftFound = (guestMediaList || []).some((m) => m.id === draftId);
    assert(
      !guestDraftFound,
      "1.3 Authenticated regular guest cannot see unapproved/draft photo in get_published_media"
    );

    // 1.4 Photo Admin CAN see the draft in admin_get_all_media
    const { data: adminMediaList, error: adminListErr } = await photoAuth.rpc("admin_get_all_media");
    assert(
      !adminListErr && (adminMediaList || []).some((m) => m.id === draftId),
      "1.4 Photo Admin successfully retrieves private draft in admin_get_all_media",
      adminListErr?.message
    );

    // 1.5 Direct SELECT on media_items via anon role returns 0 rows for draft
    const { data: directAnonSelect } = await anonClient
      .from("media_items")
      .select("*")
      .eq("id", draftId);
    assert(
      !directAnonSelect || directAnonSelect.length === 0,
      "1.5 Direct database query on media_items as anon role isolates draft (0 rows returned)"
    );

    // ----------------------------------------------------------------------------
    // TEST GROUP 2: PUBLIC GALLERY HYDRATION & PUBLICATION TOGGLE
    // ----------------------------------------------------------------------------
    console.log("\n[Test Group 2: Public Gallery Hydration & Publication Toggle]");

    // 2.1 Photo Admin publishes the draft photo
    const { data: pubToggleRes, error: pubToggleErr } = await photoAuth.rpc(
      "admin_toggle_media_published",
      { p_media_id: draftId }
    );
    assert(
      !pubToggleErr && pubToggleRes?.is_published === true,
      "2.1 Photo Admin successfully publishes photograph via admin_toggle_media_published",
      pubToggleErr?.message
    );

    // 2.2 Anonymous caller now receives the published photograph
    const { data: anonPublishedList } = await anonClient.rpc("get_published_media");
    const publishedItem = (anonPublishedList || []).find((m) => m.id === draftId);
    assert(
      Boolean(publishedItem),
      "2.2 Anonymous visitor now receives the published photograph in get_published_media"
    );

    // 2.3 Public payload strictly omits uploaded_by foreign key
    assert(
      publishedItem && publishedItem.uploaded_by === undefined,
      "2.3 Public get_published_media payload strictly omits uploaded_by foreign key (no user ID leakage)"
    );

    // 2.4 Category filtering works accurately
    const { data: haldiOnly } = await anonClient.rpc("get_published_media", {
      p_category: "haldi",
    });
    assert(
      (haldiOnly || []).some((m) => m.id === draftId),
      "2.4 Filtering by 'haldi' returns the published haldi photograph"
    );

    const { data: receptionOnly } = await anonClient.rpc("get_published_media", {
      p_category: "reception",
    });
    assert(
      !(receptionOnly || []).some((m) => m.id === draftId),
      "2.5 Filtering by 'reception' excludes the haldi photograph"
    );

    // ----------------------------------------------------------------------------
    // TEST GROUP 3: IMAGE DOWNLOAD TOGGLE (TC-MED-02)
    // ----------------------------------------------------------------------------
    console.log("\n[Test Group 3: Image Download Toggle (TC-MED-02)]");

    // 3.1 Initial state: download_enabled is true
    assert(
      publishedItem?.download_enabled === true,
      "3.1 Newly published photograph has download_enabled = true"
    );

    // 3.2 Photo Admin toggles download_enabled to false
    const { data: dlToggleRes, error: dlToggleErr } = await photoAuth.rpc(
      "admin_toggle_media_download",
      { p_media_id: draftId }
    );
    assert(
      !dlToggleErr && dlToggleRes?.download_enabled === false,
      "3.2 Photo Admin successfully sets download_enabled = false via admin_toggle_media_download",
      dlToggleErr?.message
    );

    // 3.3 Public get_published_media reflects download_enabled = false
    const { data: anonDlCheck } = await anonClient.rpc("get_published_media");
    const disabledDlItem = (anonDlCheck || []).find((m) => m.id === draftId);
    assert(
      disabledDlItem?.download_enabled === false,
      "3.3 Public get_published_media confirms download_enabled = false"
    );

    // 3.4 Photo Admin toggles download_enabled back to true
    await photoAuth.rpc("admin_toggle_media_download", { p_media_id: draftId });
    const { data: anonDlRestored } = await anonClient.rpc("get_published_media");
    const restoredDlItem = (anonDlRestored || []).find((m) => m.id === draftId);
    assert(
      restoredDlItem?.download_enabled === true,
      "3.4 Photo Admin successfully restores download_enabled = true"
    );

    // ----------------------------------------------------------------------------
    // TEST GROUP 4: YOUTUBE VIDEO INTEGRATION (TC-MED-03)
    // ----------------------------------------------------------------------------
    console.log("\n[Test Group 4: YouTube Video Integration (TC-MED-03)]");

    // 4.1 Verify extractYouTubeVideoId helper
    const standardUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const shortUrl = "https://youtu.be/dQw4w9WgXcQ";
    const unlistedEmbed = "https://www.youtube.com/embed/dQw4w9WgXcQ?si=abcdef12345";
    assert(
      extractYouTubeVideoId(standardUrl) === "dQw4w9WgXcQ" &&
        extractYouTubeVideoId(shortUrl) === "dQw4w9WgXcQ" &&
        extractYouTubeVideoId(unlistedEmbed) === "dQw4w9WgXcQ",
      "4.1 extractYouTubeVideoId accurately parses standard, short, and unlisted embed URLs"
    );

    // 4.2 Photo Admin creates published video item
    const { data: createdVideo, error: videoCreateErr } = await photoAuth.rpc(
      "admin_create_media_item",
      {
        p_media_type: "video",
        p_youtube_url: standardUrl,
        p_category: "wedding",
        p_caption: "Official Vedic Wedding Ceremony Film",
        p_is_published: true,
        p_download_enabled: false,
      }
    );
    assert(
      !videoCreateErr && createdVideo?.id,
      "4.2 Photo Admin successfully registers YouTube video in admin_create_media_item",
      videoCreateErr?.message
    );
    const videoId = createdVideo.id;
    createdMediaIds.push(videoId);

    // 4.3 Public caller retrieves the published YouTube video
    const { data: anonVideoList } = await anonClient.rpc("get_published_media", {
      p_category: "wedding",
    });
    const videoItem = (anonVideoList || []).find((m) => m.id === videoId);
    assert(
      videoItem && videoItem.media_type === "video" && videoItem.youtube_url === standardUrl,
      "4.3 Public get_published_media returns YouTube video with canonical URL"
    );

    // ----------------------------------------------------------------------------
    // TEST GROUP 5: PERMISSION BOUNDARIES & RESTRICTIONS (TC-ADM-02)
    // ----------------------------------------------------------------------------
    console.log("\n[Test Group 5: Permission Boundaries & Cross-Domain Restrictions (TC-ADM-02)]");

    // 5.1 Wishes Admin (lacking photos) cannot get all media
    const { error: wishesGetErr } = await wishesAuth.rpc("admin_get_all_media");
    assert(
      Boolean(wishesGetErr),
      "5.1 Wishes Admin cannot execute admin_get_all_media (42501 Unauthorized)",
      wishesGetErr?.message
    );

    // 5.2 Wishes Admin cannot create media item
    const { error: wishesCreateErr } = await wishesAuth.rpc("admin_create_media_item", {
      p_media_type: "photo",
      p_storage_path: "/uploads/unauthorized.jpg",
      p_category: "wedding",
    });
    assert(
      Boolean(wishesCreateErr),
      "5.2 Wishes Admin cannot execute admin_create_media_item",
      wishesCreateErr?.message
    );

    // 5.3 Wishes Admin cannot toggle published status
    const { error: wishesToggleErr } = await wishesAuth.rpc("admin_toggle_media_published", {
      p_media_id: draftId,
    });
    assert(
      Boolean(wishesToggleErr),
      "5.3 Wishes Admin cannot execute admin_toggle_media_published",
      wishesToggleErr?.message
    );

    // 5.4 Regular guest cannot execute admin media functions
    const { error: guestCreateErr } = await guestAuth.rpc("admin_create_media_item", {
      p_media_type: "photo",
      p_storage_path: "/uploads/guest.jpg",
      p_category: "wedding",
    });
    assert(
      Boolean(guestCreateErr),
      "5.4 Regular guest cannot execute admin_create_media_item",
      guestCreateErr?.message
    );

    // 5.5 Dashboard metrics: Wishes Admin payload does NOT contain photos_metrics
    const { data: wishesDashMetrics } = await wishesAuth.rpc("get_admin_dashboard_metrics");
    assert(
      wishesDashMetrics?.photos_metrics === undefined,
      "5.5 Wishes Admin dashboard metrics does not contain photos_metrics (zero data leakage)"
    );

    // 5.6 Dashboard metrics: Photo Admin payload DOES contain photos_metrics
    const { data: photoDashMetrics } = await photoAuth.rpc("get_admin_dashboard_metrics");
    assert(
      photoDashMetrics?.photos_metrics !== undefined &&
        typeof photoDashMetrics.photos_metrics.total_media === "number",
      "5.6 Photo Admin dashboard metrics contains photos_metrics with total_media count"
    );

    // 5.7 Photo Admin deletes media items
    const { data: deleteRes, error: deleteErr } = await photoAuth.rpc("admin_delete_media_item", {
      p_media_id: draftId,
    });
    assert(
      !deleteErr && deleteRes?.success === true,
      "5.7 Photo Admin successfully deletes media item via admin_delete_media_item",
      deleteErr?.message
    );

    await photoAuth.rpc("admin_delete_media_item", { p_media_id: videoId });
  } finally {
    console.log("\n[Teardown] Cleaning up test data & disk files...");
    if (createdMediaIds.length > 0) {
      await adminClient.from("media_items").delete().in("id", createdMediaIds);
    }
    for (const p of createdFilePaths) {
      await fs.unlink(p).catch(() => {});
    }
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

runP12VerificationSuite().catch((err) => {
  console.error("Unhandled verification exception:", err);
  process.exit(1);
});
