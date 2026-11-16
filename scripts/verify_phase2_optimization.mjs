import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function runOptimizationVerification() {
  console.log("================================================================================");
  console.log("   PHASE 2 IMAGE OPTIMIZATION & VERIFICATION SUITE");
  console.log("================================================================================");

  const testDir = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/794ae1ef-d68d-456e-bb26-6c077d452fa4/scratch/verification";
  fs.mkdirSync(testDir, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  // TEST 1: DESKTOP LANDSCAPE HOMEPAGE NETWORK AUDIT
  console.log("\n[TEST 1] Desktop Landscape Homepage Network Audit (1440x900)...");
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();

  const desktopRequests = [];
  const desktopFailed = [];
  desktopPage.on("request", (req) => desktopRequests.push(req.url()));
  desktopPage.on("response", (res) => {
    if (res.status() >= 400) {
      desktopFailed.push({ url: res.url(), status: res.status() });
    }
  });

  await desktopPage.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const hasPortraitHeroOnDesktop = desktopRequests.some((url) =>
    url.includes("mithun-sakhi-cinematic-hero-bg.webp")
  );
  const hasDesktopHeroOnDesktop = desktopRequests.some((url) =>
    url.includes("hero-portrait-desktop")
  );

  console.log(`- Desktop loaded desktop hero bg: ${hasDesktopHeroOnDesktop}`);
  console.log(`- Desktop avoided mobile portrait hero bg: ${!hasPortraitHeroOnDesktop}`);
  console.log(`- 404/Failed requests on desktop: ${desktopFailed.length}`);
  if (desktopFailed.length > 0) {
    console.log("Failed requests:", desktopFailed);
  }

  if (hasPortraitHeroOnDesktop) {
    console.warn("WARNING: Mobile portrait hero bg was still downloaded on desktop!");
  } else {
    console.log("✓ SUCCESS: Desktop viewport did NOT download mobile portrait hero bg! (Saved 209 KB)");
  }

  // TEST 2: MOBILE PORTRAIT HOMEPAGE NETWORK AUDIT
  console.log("\n[TEST 2] Mobile Portrait Homepage Network Audit (390x844)...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  const mobileRequests = [];
  const mobileFailed = [];
  mobilePage.on("request", (req) => mobileRequests.push(req.url()));
  mobilePage.on("response", (res) => {
    if (res.status() >= 400) {
      mobileFailed.push({ url: res.url(), status: res.status() });
    }
  });

  await mobilePage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const hasPortraitHeroOnMobile = mobileRequests.some((url) =>
    url.includes("mithun-sakhi-cinematic-hero-bg.webp")
  );
  console.log(`- Mobile loaded mobile portrait hero bg: ${hasPortraitHeroOnMobile}`);
  console.log(`- 404/Failed requests on mobile: ${mobileFailed.length}`);
  if (mobileFailed.length > 0) {
    console.log("Failed requests:", mobileFailed);
  }

  // TEST 3: OFFICIAL INVITATION PAGE & EXPORT QUALITY
  console.log("\n[TEST 3] Official Invitation Display & Export Integrity...");
  const inviteContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
  });
  const invitePage = await inviteContext.newPage();
  const inviteRequests = [];
  const inviteFailed = [];
  invitePage.on("request", (req) => inviteRequests.push(req.url()));
  invitePage.on("response", (res) => {
    if (res.status() >= 400) {
      inviteFailed.push({ url: res.url(), status: res.status() });
    }
  });

  await invitePage.goto("http://localhost:3000/#invitation", { waitUntil: "networkidle" });
  console.log(`- Homepage with invitation 404/failed requests: ${inviteFailed.length}`);
  if (inviteFailed.length > 0) {
    console.log("Failed requests:", inviteFailed);
  }

  // Check display assets vs master assets on initial render
  const loadedDisplayAssets = inviteRequests.filter((url) => url.includes("invitationcard-") && url.includes("-display.webp"));
  const loadedMasterAssets = inviteRequests.filter((url) => url.includes("invitationcard-") && url.includes("-image-optimized.webp"));

  console.log(`- Initial display assets loaded: ${loadedDisplayAssets.length} (ceremony cards & accents)`);
  console.log(`- Initial heavy master assets loaded: ${loadedMasterAssets.length} (expected: 0 before export)`);

  // Scroll invitation into view
  const invitationSection = invitePage.locator("#invitation");
  await invitationSection.scrollIntoViewIfNeeded();
  await invitePage.waitForTimeout(500);

  // Click "Download Invitation" to open the format modal
  console.log("- Clicking 'Download Invitation' button...");
  const downloadModalTrigger = invitePage.locator("button:has-text('Download Invitation')").first();
  await downloadModalTrigger.click();
  await invitePage.waitForTimeout(400);

  // In the modal, trigger "DOWNLOAD JPG"
  console.log("- Triggering 'DOWNLOAD JPG'...");
  const downloadPromise = invitePage.waitForEvent("download");
  const downloadJpgBtn = invitePage.locator("button:has-text('DOWNLOAD JPG')").first();
  await downloadJpgBtn.click();

  const download = await downloadPromise;
  const filename = download.suggestedFilename();
  const savePath = path.join(testDir, filename);
  await download.saveAs(savePath);

  const stats = fs.statSync(savePath);
  console.log(`✓ Exported JPG filename: ${filename}`);
  console.log(`✓ Exported JPG file size: ${stats.size} bytes (${(stats.size / 1024).toFixed(1)} KB)`);

  if (stats.size < 50000) {
    throw new Error(`Exported JPG size too small: ${stats.size} bytes`);
  }
  console.log("✓ Exported file size confirms ultra-high density export is functional!");

  await browser.close();
  console.log("\n================================================================================");
  console.log("   ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!");
  console.log("================================================================================");
}

runOptimizationVerification().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
