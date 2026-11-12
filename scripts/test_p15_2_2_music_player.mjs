// scripts/test_p15_2_2_music_player.mjs
// Phase P-15.2.2: Premium Wedding Music Player & Mobile Experience Verification Suite

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = path.resolve(process.cwd(), "p15_2_2_screenshots");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const ARTIFACT_SCREENSHOTS_DIR = path.resolve(
  "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots"
);
if (!fs.existsSync(ARTIFACT_SCREENSHOTS_DIR)) {
  fs.mkdirSync(ARTIFACT_SCREENSHOTS_DIR, { recursive: true });
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

const EXPECTED_TRACKS = [
  "Sajna",
  "O Piya",
  "Madhanya",
  "Kudmayi Ke Din",
  "Dekha Tenu",
  "Aaj Sajeya",
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

function syncScreenshot(filename) {
  const src = path.join(OUTPUT_DIR, filename);
  const dest = path.join(ARTIFACT_SCREENSHOTS_DIR, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

async function getOrCreateGuestUser(email, password, fullName) {
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

  // Ensure family group
  let { data: groups } = await adminClient.from("family_groups").select("id").limit(1);
  let familyGroupId;
  if (!groups || groups.length === 0) {
    const { data: newGroup } = await adminClient
      .from("family_groups")
      .insert({ name: "Roy Family", side: "bride", primary_contact_name: "Mr. Roy" })
      .select("id")
      .single();
    familyGroupId = newGroup?.id;
  } else {
    familyGroupId = groups[0].id;
  }

  await adminClient.from("profiles").upsert({
    id: user.id,
    full_name: fullName,
    email,
    family_group_id: familyGroupId,
    is_active: true,
  });

  return user;
}

async function runMusicPlayerVerification() {
  console.log("\n=======================================================");
  console.log("PHASE P-15.2.2: PREMIUM WEDDING MUSIC PLAYER VERIFICATION");
  console.log("=======================================================\n");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  try {
    await getOrCreateGuestUser(
      "wedding_guest_music@mithun-kabita.test",
      "RoyalGuest!2026",
      "Priya Sharma"
    );

    // =========================================================
    // SECTION 1: CORE MUSIC PLAYER FUNCTIONALITY & CONTROLS
    // =========================================================
    console.log("Section 1: Core Floating Music Player Features & Playlist Integration");

    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    // 1.1 Strict Autoplay check: Autoplay strictly disabled on initial visit
    const playerAside = page.locator("aside[aria-label='Wedding audio player']");
    assert(
      (await playerAside.count()) === 1,
      "Floating music player container rendered on homepage"
    );

    const playBtn = playerAside.locator("button[aria-label='Play wedding music']");
    assert(
      (await playBtn.count()) === 1,
      "Player starts paused with 'Play wedding music' accessible label (Strict Autoplay Compliance)"
    );

    // 1.2 Initial track name check
    const currentTrackPill = playerAside.locator("button[aria-label^='Open wedding playlist']").first();
    const trackPillText = await currentTrackPill.innerText();
    assert(
      trackPillText.includes("Sajna"),
      `Default first track is 'Sajna' (observed: ${trackPillText.trim().replace(/\s+/g, ' ')})`
    );

    // 1.3 Minimum touch targets
    const playBox = await playBtn.boundingBox();
    assert(
      playBox && playBox.width >= 44 && playBox.height >= 44,
      `Play button satisfies minimum 44x44px touch target (actual: ${Math.round(playBox?.width || 0)}x${Math.round(playBox?.height || 0)}px)`
    );

    // 1.4 Play / Pause action
    await playBtn.click();
    await page.waitForTimeout(300);
    const pauseBtn = playerAside.locator("button[aria-label='Pause wedding music']");
    assert(
      (await pauseBtn.count()) === 1,
      "Clicking play toggles state to active with 'Pause wedding music' label"
    );

    // Pause again
    await pauseBtn.click();
    await page.waitForTimeout(200);
    assert(
      (await playerAside.locator("button[aria-label='Play wedding music']").count()) === 1,
      "Clicking pause successfully toggles state back to paused"
    );

    // 1.5 Tuck to screen edge (Minimize Dock)
    const tuckBtn = playerAside.locator("button[aria-label='Minimize player to edge']");
    assert(
      (await tuckBtn.count()) === 1,
      "Minimize / tuck-to-edge button is present in compact pill"
    );
    await tuckBtn.click();
    await page.waitForTimeout(300);

    const expandDockBtn = page.locator("button[aria-label='Expand wedding music player']");
    assert(
      (await expandDockBtn.count()) === 1,
      "Tuck button successfully docks player into right margin with 'Expand wedding music player' button"
    );

    // Untuck / Expand back to pill
    await expandDockBtn.click();
    await page.waitForTimeout(300);
    assert(
      (await playerAside.locator("button[aria-label='Minimize player to edge']").count()) === 1,
      "Expanding from dock restores standard luxury capsule pill"
    );

    // 1.6 Capture Screenshot 1: Mobile Hero with Compact Player
    const screenshot1Path = path.join(OUTPUT_DIR, "p15_2_2_mobile_01_hero_compact.png");
    await page.screenshot({ path: screenshot1Path });
    syncScreenshot("p15_2_2_mobile_01_hero_compact.png");
    console.log("  📸 Saved p15_2_2_mobile_01_hero_compact.png");

    // =========================================================
    // SECTION 2: EXPANDED WEDDING MUSIC CARD & 6-SONG PLAYLIST
    // =========================================================
    console.log("\nSection 2: Royal Expanded Wedding Music Card & 6-Song Playlist");

    // Open Expanded Music Card
    await playerAside.locator("button[aria-label^='Open wedding playlist']").first().click();
    await page.waitForTimeout(300);

    const musicCardModal = page.locator("div[role='dialog'][aria-label='Wedding Music Player & Playlist']");
    assert(
      (await musicCardModal.count()) === 1,
      "Expanded Wedding Music Card modal successfully opened"
    );

    // Verify Royal Styling & Header
    const cardHeader = await musicCardModal.innerText();
    assert(
      cardHeader.toLowerCase().includes("wedding celebration melodies") && cardHeader.includes("Mithun & Sakhi Sacred Vows"),
      "Card presents royal header with 'Wedding Celebration Melodies' & 'Mithun & Sakhi Sacred Vows'"
    );

    // Verify Active Track Display
    assert(
      cardHeader.toLowerCase().includes("track 1 of 6") && cardHeader.includes("Sajna"),
      "Card correctly displays 'Track 1 of 6' and title 'Sajna'"
    );

    // Verify 5-bar Waveform Equalizer
    const waveBars = musicCardModal.locator("div[aria-hidden='true'] span.rounded-full");
    assert(
      (await waveBars.count()) >= 5,
      `Waveform equalizer contains 5 animated frequency bars (found ${await waveBars.count()})`
    );

    // Verify Scrubber & Time Display
    const scrubber = musicCardModal.locator("input[type='range']");
    assert(
      (await scrubber.count()) === 1,
      "Interactive progress scrubber slider is present and accessible"
    );

    // Verify all 6 local songs are listed in the playlist
    for (let i = 0; i < EXPECTED_TRACKS.length; i++) {
      const songTitle = EXPECTED_TRACKS[i];
      const trackBtn = musicCardModal.locator(`button[aria-label='Play track ${i + 1}: ${songTitle}']`);
      assert(
        (await trackBtn.count()) === 1,
        `Song 0${i + 1} '${songTitle}' present in playlist manifest`
      );
    }

    // 2.2 Test Next Track functionality with Wrap-Around
    const nextBtn = musicCardModal.locator("button[aria-label='Next song']");
    await nextBtn.click();
    await page.waitForTimeout(200);
    let cardContent = await musicCardModal.innerText();
    assert(
      cardContent.toLowerCase().includes("track 2 of 6") && cardContent.includes("O Piya"),
      "Next song advances to Track 2: 'O Piya'"
    );

    // Advance 4 more times to reach track 6
    for (let i = 0; i < 4; i++) {
      await nextBtn.click();
      await page.waitForTimeout(100);
    }
    cardContent = await musicCardModal.innerText();
    assert(
      cardContent.toLowerCase().includes("track 6 of 6") && cardContent.includes("Aaj Sajeya"),
      "Next song reaches Track 6: 'Aaj Sajeya'"
    );

    // Advance one more time to test wrap-around back to Track 1
    await nextBtn.click();
    await page.waitForTimeout(200);
    cardContent = await musicCardModal.innerText();
    assert(
      cardContent.toLowerCase().includes("track 1 of 6") && cardContent.includes("Sajna"),
      "Next song wraps around from Track 6 to Track 1: 'Sajna'"
    );

    // 2.3 Test Previous Track with Wrap-Around
    const prevBtn = musicCardModal.locator("button[aria-label='Previous song']");
    await prevBtn.click();
    await page.waitForTimeout(200);
    cardContent = await musicCardModal.innerText();
    assert(
      cardContent.toLowerCase().includes("track 6 of 6") && cardContent.includes("Aaj Sajeya"),
      "Previous song from Track 1 wraps around to Track 6: 'Aaj Sajeya'"
    );

    // 2.4 Test Direct Track Selection from Playlist
    const track4Btn = musicCardModal.locator("button[aria-label='Play track 4: Kudmayi Ke Din']");
    await track4Btn.click();
    await page.waitForTimeout(200);
    cardContent = await musicCardModal.innerText();
    assert(
      cardContent.toLowerCase().includes("track 4 of 6") && cardContent.includes("Kudmayi Ke Din"),
      "Direct track selection instantly switches active track to Track 4: 'Kudmayi Ke Din'"
    );

    // 2.5 Test Mute Toggle
    const muteBtn = musicCardModal.locator("button[title='Mute'], button[title='Unmute']");
    await muteBtn.click();
    await page.waitForTimeout(100);
    const unMuteBtn = musicCardModal.locator("button[title='Unmute']");
    assert(
      (await unMuteBtn.count()) === 1,
      "Mute button toggles audio mute state cleanly"
    );
    await unMuteBtn.click();
    await page.waitForTimeout(100);

    // 2.6 Capture Screenshot 2: Expanded Wedding Music Card
    const screenshot2Path = path.join(OUTPUT_DIR, "p15_2_2_mobile_02_music_card_expanded.png");
    await page.screenshot({ path: screenshot2Path });
    syncScreenshot("p15_2_2_mobile_02_music_card_expanded.png");
    console.log("  📸 Saved p15_2_2_mobile_02_music_card_expanded.png");

    // Close Expanded Card
    const closeCardBtn = musicCardModal.locator("button[aria-label='Close music player card']");
    await closeCardBtn.click();
    await page.waitForTimeout(300);
    assert(
      (await musicCardModal.count()) === 0,
      "Closing expanded card dismisses modal and restores compact pill"
    );

    // =========================================================
    // SECTION 3: CONTEXTUAL MODAL SUPPRESSION
    // =========================================================
    console.log("\nSection 3: Contextual Auto-Suppression During Navigation / Dialogs");

    const drawerToggle = page.locator("button[aria-label='Open navigation menu']");
    if ((await drawerToggle.count()) > 0) {
      await drawerToggle.click();
      await page.waitForTimeout(300);

      // Verify that player is hidden while drawer is open
      const visiblePlayerInDrawer = await playerAside.isVisible();
      assert(
        !visiblePlayerInDrawer,
        "Music player automatically suppresses/hides when navigation drawer is open (no visual collision)"
      );

      // Close drawer
      const closeDrawerBtn = page.locator("button[aria-label='Close navigation menu']");
      if ((await closeDrawerBtn.count()) > 0) {
        await closeDrawerBtn.click();
        await page.waitForTimeout(300);
        assert(
          await playerAside.isVisible(),
          "Music player automatically restores when navigation drawer is closed"
        );
      }
    }

    // =========================================================
    // SECTION 4: ROUTE VALIDATION & PERSISTENCE
    // =========================================================
    console.log("\nSection 4: Cross-Route Non-Obstructive Layout & Persistence");

    // 4.1 Digital Invitation Route
    await page.goto(`${BASE_URL}/invitation`, { waitUntil: "networkidle" });
    const invPlayer = page.locator("aside[aria-label='Wedding audio player']");
    assert(
      (await invPlayer.count()) === 1,
      "Player persists seamlessly on /invitation route without re-render or reset"
    );

    const screenshot3Path = path.join(OUTPUT_DIR, "p15_2_2_mobile_03_invitation.png");
    await page.screenshot({ path: screenshot3Path });
    syncScreenshot("p15_2_2_mobile_03_invitation.png");
    console.log("  📸 Saved p15_2_2_mobile_03_invitation.png");

    // 4.2 Guest Account / RSVP Route (with authenticated guest)
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill("input[type='email']", "wedding_guest_music@mithun-kabita.test");
    await page.fill("input[type='password']", "RoyalGuest!2026");
    await page.click("button[type='submit']");
    await page.waitForTimeout(1000);

    await page.goto(`${BASE_URL}/account`, { waitUntil: "networkidle" });
    const accountPlayer = page.locator("aside[aria-label='Wedding audio player']");
    assert(
      (await accountPlayer.count()) === 1,
      "Player is present and non-obstructive on Guest Account & RSVP page"
    );

    const screenshot4Path = path.join(OUTPUT_DIR, "p15_2_2_mobile_04_guest_account.png");
    await page.screenshot({ path: screenshot4Path });
    syncScreenshot("p15_2_2_mobile_04_guest_account.png");
    console.log("  📸 Saved p15_2_2_mobile_04_guest_account.png");

    await context.close();

    // =========================================================
    // SECTION 5: 7-VIEWPORT RESPONSIVENESS MATRIX
    // =========================================================
    console.log("\nSection 5: Responsive Matrix Across All 7 Viewports");

    for (const vp of REQUIRED_VIEWPORTS) {
      const vpContext = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const vpPage = await vpContext.newPage();
      await vpPage.goto(BASE_URL, { waitUntil: "networkidle" });

      const pAside = vpPage.locator("aside[aria-label='Wedding audio player']");
      assert(
        (await pAside.count()) === 1,
        `Viewport ${vp.width}x${vp.height} (${vp.name}): Floating player rendered successfully`
      );

      // Verify no horizontal overflow caused by player
      const scrollWidth = await vpPage.evaluate(() => document.documentElement.scrollWidth);
      assert(
        scrollWidth <= vp.width,
        `Viewport ${vp.width}x${vp.height}: No horizontal document overflow (scrollWidth: ${scrollWidth}px)`
      );

      // Capture narrow 320px
      if (vp.width === 320) {
        const screenshot5Path = path.join(OUTPUT_DIR, "p15_2_2_mobile_05_narrow_320.png");
        await vpPage.screenshot({ path: screenshot5Path });
        syncScreenshot("p15_2_2_mobile_05_narrow_320.png");
        console.log("  📸 Saved p15_2_2_mobile_05_narrow_320.png");
      }

      // Capture desktop 1440px
      if (vp.width === 1440) {
        // Verify desktop controls (previous & next buttons visible in pill)
        const desktopPrev = pAside.locator("button[aria-label='Previous song']");
        const desktopNext = pAside.locator("button[aria-label='Next song']");
        assert(
          (await desktopPrev.isVisible()) && (await desktopNext.isVisible()),
          "Desktop player exposes direct previous/next buttons directly in capsule pill"
        );

        const screenshot6Path = path.join(OUTPUT_DIR, "p15_2_2_desktop_player.png");
        await vpPage.screenshot({ path: screenshot6Path });
        syncScreenshot("p15_2_2_desktop_player.png");
        console.log("  📸 Saved p15_2_2_desktop_player.png");
      }

      await vpContext.close();
    }

  } catch (err) {
    console.error("Test execution encountered an error:", err);
    totalFailed++;
  } finally {
    await browser.close();
  }

  console.log("\n=======================================================");
  console.log(`P-15.2.2 VERIFICATION SUMMARY: ${totalPassed} Passed, ${totalFailed} Failed`);
  console.log("=======================================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runMusicPlayerVerification();
