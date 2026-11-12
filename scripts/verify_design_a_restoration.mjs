import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:\\Users\\Rabin Gorain\\.gemini\\antigravity\\brain\\2391ac95-fb5b-46c4-adf4-615015ea333c\\screenshots";
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runVerification() {
  console.log("🚀 Starting Refined Design A Verification...");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const results = {
    viewports: [],
    elementsCheck: {},
    absenceChecks: {},
    scheduleCheck: {},
    passed: true,
  };

  const viewports = [
    { name: "desktop_1440", width: 1440, height: 900 },
    { name: "laptop_1366", width: 1366, height: 768 },
    { name: "mobile_390", width: 390, height: 844 },
    { name: "mobile_360", width: 360, height: 800 },
  ];

  // 1. Test each viewport on /invitation
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });

    // Locate card
    const card = await page.waitForSelector("#official-wedding-invitation-card");

    // Minimize music player so it doesn't occlude mobile screenshot
    const minBtn = await page.$('button[aria-label="Minimize player to edge"]');
    if (minBtn) {
      await minBtn.click();
      await page.waitForTimeout(300);
    }

    const box = await card.boundingBox();
    if (!box) {
      console.error(`❌ Card not found on ${vp.name}`);
      results.passed = false;
      continue;
    }

    const ratio = box.width / box.height;
    const isExact4x5 = Math.abs(ratio - 0.8) <= 0.015;

    console.log(
      `📐 [${vp.name}] Width: ${box.width.toFixed(1)}px | Height: ${box.height.toFixed(1)}px | Ratio: ${ratio.toFixed(4)} (Expected: 0.8000) -> ${isExact4x5 ? "✅ PASS" : "❌ FAIL"}`
    );

    results.viewports.push({
      viewport: vp.name,
      dimensions: `${vp.width}x${vp.height}`,
      cardWidth: box.width,
      cardHeight: box.height,
      ratio: ratio.toFixed(4),
      aspectMatch: isExact4x5,
    });

    if (!isExact4x5) results.passed = false;

    // Capture screenshot of the refined card
    const screenshotPath = path.join(ARTIFACT_DIR, `design_a_refined_${vp.name}.png`);
    await card.screenshot({ path: screenshotPath });
    console.log(`📸 Saved screenshot to: ${screenshotPath}`);

    // If desktop, capture action controls
    if (vp.name === "desktop_1440") {
      const actions = await page.$("main .no-print:has(button)");
      if (actions) {
        const actPath = path.join(ARTIFACT_DIR, "design_a_refined_action_controls.png");
        await actions.screenshot({ path: actPath });
        console.log(`📸 Saved action controls screenshot to: ${actPath}`);
      }
    }

    await page.close();
  }

  // 2. Test Content Elements on /invitation
  console.log("\n🔍 Verifying Typography, Lineage, 3-Column Schedule & Finishing...");
  const testPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await testPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });

  const cardText = await testPage.$eval("#official-wedding-invitation-card", (el) => el.innerText);

  const checks = [
    { label: "Monogram Seal: M•S", pattern: /M\s*[•&]\s*S/i },
    { label: "Headline Kicker: Celebrate the Wedding of", pattern: /Celebrate the Wedding of/i },
    { label: "Prominent Couple Headline: Mithun & Sakhi", pattern: /Mithun\s*&\s*Sakhi/i },
    { label: "Sacred Vedic Quote", pattern: /Bound by sacred Vedic vows, blessed by eternal love/i },
    { label: "Refined Luxury Blessing Message (Unboxed)", pattern: /With the blessings of our families, we warmly invite you to share in the joy of our sacred union and bless the beginning of our forever/i },
    { label: "Wedding Dates: 19 – 22 NOVEMBER 2026", pattern: /19\s*[–-]\s*22\s*NOVEMBER\s*2026/i },
    { label: "Location: PURULIA, WEST BENGAL", pattern: /PURULIA,\s*WEST BENGAL/i },
    { label: "Ceremony Schedule Heading", pattern: /CEREMONY SCHEDULE/i },
    { label: "Row 1 Name: HALDI CEREMONY", pattern: /HALDI CEREMONY/i },
    { label: "Row 1 Date: 19 November 2026", pattern: /19 November 2026/i },
    { label: "Row 1 Time: 9:00 AM IST", pattern: /9:00 AM IST/i },
    { label: "Row 2 Name: MEHNDI CEREMONY", pattern: /MEHNDI CEREMONY/i },
    { label: "Row 2 Date: 20 November 2026", pattern: /20 November 2026/i },
    { label: "Row 3 Name: THE SACRED WEDDING", pattern: /THE SACRED WEDDING/i },
    { label: "Row 3 Date: 21 November 2026", pattern: /21 November 2026/i },
    { label: "Row 3 Time: 11:00 PM IST", pattern: /11:00 PM IST/i },
    { label: "Row 4 Name: RECEPTION & PREETIBHOJ", pattern: /RECEPTION & PREETIBHOJ/i },
    { label: "Row 4 Date: 22 November 2026", pattern: /22 November 2026/i },
    { label: "Row 4 Time: 5:00 PM IST", pattern: /5:00 PM IST/i },
    { label: "Refined QR Caption: SCAN FOR THE COMPLETE WEDDING DETAILS", pattern: /SCAN FOR THE COMPLETE WEDDING DETAILS/i },
  ];

  for (const chk of checks) {
    const passed = chk.pattern.test(cardText);
    console.log(`  ${passed ? "✅" : "❌"} ${chk.label}`);
    results.elementsCheck[chk.label] = passed;
    if (!passed) results.passed = false;
  }

  // 3. Strict Absence Checks (Removed Dev Labels, No Parents Section, No Venue in Schedule, No Design B)
  console.log("\n🚫 Verifying Absence of Development Labels, Parents Section, Schedule Venues & Deprecated Terms...");
  const absenceChecks = [
    { label: "No Parents Section (GROOM'S PARENTS / BRIDE'S PARENTS)", pattern: /GROOM'S PARENTS|BRIDE'S PARENTS|Kenaram|Savita|Kokila|Chitmu/i },
    { label: "No 'DESIGN EDITION A' on card", pattern: /DESIGN EDITION A/i },
    { label: "No 'CINEMATIC EDITORIAL' on card", pattern: /CINEMATIC EDITORIAL/i },
    { label: "No 'DIGITAL GUEST STUDIO' on card", pattern: /DIGITAL GUEST STUDIO/i },
    { label: "No Venue text in Ceremony Schedule ('Groom's Home' / 'Bride's Home')", pattern: /Groom's Home|Bride's Home/i },
    { label: "No Design B / Traditional Royal Patra", pattern: /Traditional Royal Patra|Design Edition B/i },
    { label: "No Kabita", pattern: /\bKabita\b/i },
    { label: "No Manjura", pattern: /\bManjura\b/i },
  ];

  for (const achk of absenceChecks) {
    const found = achk.pattern.test(cardText);
    const passed = !found;
    console.log(`  ${passed ? "✅" : "❌"} ${achk.label}: ${passed ? "CLEAN" : "DETECTED PROHIBITED STRING"}`);
    results.absenceChecks[achk.label] = passed;
    if (!passed) results.passed = false;
  }

  // 4. Verify 3-Column CSS Grid Layout of Ceremony Rows
  console.log("\n📊 Verifying 3-Column Grid Structure on Ceremony Rows...");
  const gridRows = await testPage.$$(
    "#official-wedding-invitation-card .grid-cols-\\[1\\.25fr_1fr_0\\.8fr\\]"
  );
  console.log(`  Found ${gridRows.length} ceremony rows with exact CSS grid-cols-[1.25fr_1fr_0.8fr]`);
  if (gridRows.length === 4) {
    console.log("  ✅ Exactly 4 ceremony rows configured with 3-column grid");
    results.scheduleCheck["4_rows_3_column_grid"] = true;
  } else {
    console.error("  ❌ Expected 4 rows with 3-column grid");
    results.scheduleCheck["4_rows_3_column_grid"] = false;
    results.passed = false;
  }

  // 5. Verify Background Texture SVG is Present
  const textureSvg = await testPage.$("#official-wedding-invitation-card pattern#stationery-texture-pattern");
  if (textureSvg) {
    console.log("  ✅ Subtle stationery lattice background pattern verified");
  } else {
    console.error("  ❌ Background texture pattern missing");
    results.passed = false;
  }

  // 6. Homepage Preview Section Check
  console.log("\n🏠 Verifying Homepage Preview Section (#invitation)...");
  await testPage.goto("http://localhost:3000/#invitation", { waitUntil: "networkidle" });
  const homeCard = await testPage.waitForSelector("#invitation #official-wedding-invitation-card");
  const homeBox = await homeCard.boundingBox();
  if (homeBox) {
    const homeRatio = homeBox.width / homeBox.height;
    const isHome4x5 = Math.abs(homeRatio - 0.8) <= 0.015;
    console.log(`  Homepage Card: ${homeBox.width.toFixed(1)}px x ${homeBox.height.toFixed(1)}px | Ratio: ${homeRatio.toFixed(4)} -> ${isHome4x5 ? "✅ PASS" : "❌ FAIL"}`);
    if (!isHome4x5) results.passed = false;

    const homeScreenshotPath = path.join(ARTIFACT_DIR, "design_a_refined_homepage_preview.png");
    await homeCard.screenshot({ path: homeScreenshotPath });
    console.log(`📸 Saved homepage preview screenshot to: ${homeScreenshotPath}`);
  } else {
    console.error("❌ Homepage invitation card not found");
    results.passed = false;
  }

  await testPage.close();
  await browser.close();

  console.log(`\n==========================================`);
  console.log(`Overall Verification: ${results.passed ? "🎉 ALL CHECKS PASSED!" : "⚠️ SOME CHECKS FAILED"}`);
  console.log(`==========================================`);
}

runVerification().catch((err) => {
  console.error("Fatal error during verification:", err);
  process.exit(1);
});
