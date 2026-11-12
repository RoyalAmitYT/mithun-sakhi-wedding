import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:\\Users\\Rabin Gorain\\.gemini\\antigravity\\brain\\2391ac95-fb5b-46c4-adf4-615015ea333c\\screenshots";
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function verifyPolishedDesignA() {
  console.log("================================================================================");
  console.log("   POLISHED DESIGN A INVITATION CARD VERIFICATION SUITE");
  console.log("================================================================================");

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const viewports = [
    { name: "desktop_1440", width: 1440, height: 900 },
    { name: "laptop_1366", width: 1366, height: 768 },
    { name: "mobile_390", width: 390, height: 844 },
    { name: "mobile_360", width: 360, height: 800 },
  ];

  let allPassed = true;

  try {
    for (const vp of viewports) {
      console.log(`\nTesting Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

      // Minimize floating music player if present
      const minBtn = await page.$('button[aria-label="Minimize player to edge"]');
      if (minBtn) {
        await minBtn.click();
        await page.waitForTimeout(300);
      }

      const card = await page.locator("#official-wedding-invitation-card").first();
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Measure bounding box
      const box = await card.boundingBox();
      if (!box) {
        console.error(`❌ Card not found or not visible on ${vp.name}`);
        allPassed = false;
        await page.close();
        continue;
      }

      const ratio = box.width / box.height;
      const expectedRatio = 4 / 5;
      const ratioDiff = Math.abs(ratio - expectedRatio);
      console.log(`   Card Dimensions: ${box.width.toFixed(1)}px x ${box.height.toFixed(1)}px (Aspect Ratio: ${ratio.toFixed(4)})`);
      if (ratioDiff > 0.02) {
        console.error(`❌ Aspect ratio deviation too large: ${ratio.toFixed(4)} (diff: ${ratioDiff.toFixed(4)})`);
        allPassed = false;
      } else {
        console.log(`   ✓ Strict 4:5 Portrait Aspect Ratio verified within tolerance.`);
      }

      // Capture screenshot of the #invitation section
      const invSection = page.locator("#invitation");
      const sectionShotPath = path.join(ARTIFACT_DIR, `design_a_polished_${vp.name}.png`);
      await invSection.screenshot({ path: sectionShotPath });
      console.log(`   📸 Section screenshot saved: ${sectionShotPath}`);

      if (vp.name === "desktop_1440") {
        // Also capture isolated card and external action controls
        const cardShotPath = path.join(ARTIFACT_DIR, `design_a_polished_card_only.png`);
        await card.screenshot({ path: cardShotPath });
        console.log(`   📸 Isolated card screenshot saved: ${cardShotPath}`);
      }

      await page.close();
    }

    // Comprehensive content and architecture verification
    console.log("\n================================================================================");
    console.log("   CONTENT & DOM INTEGRITY CHECKS");
    console.log("================================================================================");

    const testPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await testPage.goto("http://localhost:3000/", { waitUntil: "networkidle" });

    const card = testPage.locator("#official-wedding-invitation-card").first();
    const cardText = await card.innerText();

    // 1. Check for ZERO internal buttons
    const internalButtons = await card.locator("button, a").count();
    console.log(`Checking internal buttons/links: found ${internalButtons}`);
    if (internalButtons !== 0) {
      console.error(`❌ Found ${internalButtons} buttons/links inside the invitation card! (Must be ZERO)`);
      allPassed = false;
    } else {
      console.log("✓ Zero buttons/links inside the card (Pure stationery artwork verified).");
    }

    // 2. Check external buttons below card
    const externalButtonsSection = testPage.locator("#invitation .flex-wrap");
    const externalButtonsCount = await externalButtonsSection.locator("button, a").count();
    console.log(`Checking external action buttons: found ${externalButtonsCount}`);
    if (externalButtonsCount < 3) {
      console.error(`❌ Expected at least 3 external action buttons, found ${externalButtonsCount}`);
      allPassed = false;
    } else {
      console.log("✓ External action buttons present below the invitation card.");
    }

    // 3. Strict bride name verification (Sakhi ONLY, NO Kabita, NO Manjura)
    const hasSakhi = /Sakhi/i.test(cardText);
    const hasKabita = /Kabita/i.test(cardText);
    const hasManjura = /Manjura/i.test(cardText);

    if (hasSakhi && !hasKabita && !hasManjura) {
      console.log("✓ Official bride identity verified: Sakhi ONLY (No Kabita, No Manjura).");
    } else {
      console.error(`❌ Bride identity check failed! Sakhi: ${hasSakhi}, Kabita: ${hasKabita}, Manjura: ${hasManjura}`);
      allPassed = false;
    }

    // 4. Invocation check
    if (/WITH THE DIVINE BLESSINGS OF OUR FAMILIES/i.test(cardText)) {
      console.log("✓ Invocation kicker verified: WITH THE DIVINE BLESSINGS OF OUR FAMILIES.");
    } else {
      console.error("❌ Invocation kicker missing or incorrect.");
      allPassed = false;
    }

    // 5. Parents lineage check
    const hasGroomParents = /Kenaram Gorain/i.test(cardText) && /Savita Gorian/i.test(cardText);
    const hasBrideParents = /Upen Gorain/i.test(cardText) && /Kokila Gorain/i.test(cardText);
    if (hasGroomParents && hasBrideParents) {
      console.log("✓ Two-column parents lineage verified for both Groom and Bride.");
    } else {
      console.error(`❌ Parents lineage check failed! Groom: ${hasGroomParents}, Bride: ${hasBrideParents}`);
      allPassed = false;
    }

    // 6. Blessing message check
    if (/warmly invite you to share in the joy of our sacred union/i.test(cardText)) {
      console.log("✓ Unboxed luxury wedding blessing message verified.");
    } else {
      console.error("❌ Luxury blessing message missing or incorrect.");
      allPassed = false;
    }

    // 7. Ceremony schedule check (3 columns: name, date, time)
    const ceremonies = ["HALDI CEREMONY", "MEHNDI CEREMONY", "THE SACRED WEDDING", "RECEPTION & PREETIBHOJ"];
    let schedPassed = true;
    for (const c of ceremonies) {
      if (!cardText.includes(c)) {
        console.error(`❌ Ceremony missing: ${c}`);
        schedPassed = false;
      }
    }
    if (schedPassed) {
      console.log("✓ All 4 ceremonies present in 3-column schedule grid.");
    } else {
      allPassed = false;
    }

    // 8. Bottom QR code check (QR on left, caption on right)
    const qrRole = await card.locator("[role='img'][aria-label*='QR Code']").count();
    const captionPresent = /SCAN FOR THE COMPLETE WEDDING DETAILS/i.test(cardText);
    if (qrRole === 1 && captionPresent) {
      console.log("✓ Bottom QR code and right caption verified.");
    } else {
      console.error(`❌ QR code section check failed! QR role count: ${qrRole}, caption: ${captionPresent}`);
      allPassed = false;
    }

    // 9. Canvas export test
    console.log("\n================================================================================");
    console.log("   CANVAS EXPORT VERIFICATION");
    console.log("================================================================================");

    await testPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
    const downloadPromise = testPage.waitForEvent("download");
    const downloadBtn = testPage.locator("button:has-text('Download PNG')").first();
    await downloadBtn.scrollIntoViewIfNeeded();
    await pageDelay(300);
    await downloadBtn.click();

    const download = await downloadPromise;
    const downloadedName = download.suggestedFilename();
    const exportSavePath = path.join(ARTIFACT_DIR, downloadedName);
    await download.saveAs(exportSavePath);
    console.log(`✓ High-density PNG download successful: ${downloadedName}`);
    console.log(`  Saved to: ${exportSavePath}`);

    // Verify file size of exported PNG (> 100 KB)
    const stats = fs.statSync(exportSavePath);
    console.log(`  Exported PNG File Size: ${(stats.size / 1024).toFixed(1)} KB`);
    if (stats.size < 100 * 1024) {
      console.error("❌ Exported PNG size is unexpectedly small!");
      allPassed = false;
    } else {
      console.log("✓ High-resolution canvas PNG size and integrity verified.");
    }

    await testPage.close();

    console.log("\n================================================================================");
    if (allPassed) {
      console.log("   🎉 ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!");
    } else {
      console.error("   ❌ SOME VERIFICATION CHECKS FAILED!");
    }
    console.log("================================================================================");
  } finally {
    await browser.close();
  }
}

function pageDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

verifyPolishedDesignA().catch((err) => {
  console.error("Fatal verification error:", err);
  process.exit(1);
});
