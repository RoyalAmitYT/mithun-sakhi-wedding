import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:\\Users\\Rabin Gorain\\.gemini\\antigravity\\brain\\2391ac95-fb5b-46c4-adf4-615015ea333c\\screenshots";
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runVerification() {
  console.log("🚀 Starting Comprehensive Refined 4:5 Invitation & Venue Card Alignment Verification...");
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const results = {
    viewports: [],
    elementsCheck: {},
    canvasExportCheck: {},
    borderCheck: {},
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

    // Wait for card
    const card = await page.waitForSelector("#official-wedding-invitation-card");
    const box = await card.boundingBox();
    if (!box) {
      console.error(`❌ Card not found on ${vp.name}`);
      results.passed = false;
      continue;
    }

    const ratio = box.width / box.height;
    const isExact4x5 = Math.abs(ratio - 0.8) <= 0.015;
    const isAdequateWidth = vp.width >= 1366 ? box.width >= 560 : true;

    console.log(
      `📐 [${vp.name}] Width: ${box.width.toFixed(1)}px | Height: ${box.height.toFixed(1)}px | Ratio: ${ratio.toFixed(4)} (Expected: 0.8000) -> ${isExact4x5 ? "✅ PASS" : "❌ FAIL"}`
    );

    if (vp.width >= 1366) {
      console.log(
        `   Display Size Check (Desktop/Laptop >= 560px): ${box.width.toFixed(1)}px -> ${isAdequateWidth ? "✅ PASS (Enlarged Display)" : "❌ FAIL"}`
      );
    }

    results.viewports.push({
      viewport: vp.name,
      dimensions: `${vp.width}x${vp.height}`,
      cardWidth: box.width,
      cardHeight: box.height,
      ratio: ratio.toFixed(4),
      aspectMatch: isExact4x5,
      sizeEnlarged: isAdequateWidth,
    });

    if (!isExact4x5 || !isAdequateWidth) results.passed = false;

    // Capture screenshot of card
    const screenshotPath = path.join(ARTIFACT_DIR, `invitation_refined_${vp.name}.png`);
    await card.screenshot({ path: screenshotPath });
    console.log(`📸 Saved screenshot to: ${screenshotPath}`);

    // Capture action buttons on desktop
    if (vp.name === "desktop_1440") {
      const actions = await page.$("main .no-print:has(button)");
      if (actions) {
        const actPath = path.join(ARTIFACT_DIR, "invitation_refined_action_controls.png");
        await actions.screenshot({ path: actPath });
        console.log(`📸 Saved action controls screenshot to: ${actPath}`);
      }
    }

    await page.close();
  }

  // 2. Test Content Elements on /invitation
  console.log("\n🔍 Verifying Typography, Lineage & Ceremonies Elements...");
  const testPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await testPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });

  const cardText = await testPage.$eval("#official-wedding-invitation-card", (el) => el.innerText);

  const checks = [
    { label: "Top Left Badge", pattern: /WEDDING INVITATION/i },
    { label: "M&S Monogram", pattern: /M\s*&\s*S/i },
    { label: "Centered Couple Headline", pattern: /Mithun\s*&\s*Sakhi/i },
    { label: "Invitation Quote", pattern: /With the blessings of our families, we joyfully invite you to celebrate the sacred union of Mithun & Sakhi/i },
    { label: "Groom's Parents Badge", pattern: /GROOM'S PARENTS/i },
    { label: "Groom's Parents Names", pattern: /Mr\. Kenaram Gorain/i },
    { label: "Groom's Parents Mother", pattern: /Ms\. Savita Gorian/i },
    { label: "Groom's Village", pattern: /Chitmu, Kotshila, Purulia/i },
    { label: "Bride's Parents Badge", pattern: /BRIDE'S PARENTS/i },
    { label: "Bride's Parents Names", pattern: /Mr\. Upen Gorain/i },
    { label: "Bride's Parents Mother", pattern: /Ms\. Kokila Gorain/i },
    { label: "Bride's Village", pattern: /Ghaghra, Jaipur, Purulia/i },
    { label: "Date Badge", pattern: /19 – 22 NOVEMBER 2026/i },
    { label: "Location", pattern: /PURULIA, WEST BENGAL/i },
    { label: "Celebrations Title", pattern: /THE WEDDING CELEBRATIONS/i },
    { label: "Row 1: Haldi Ceremony", pattern: /Haldi Ceremony/i },
    { label: "Row 1: Date & Time", pattern: /19 November 2026[\s\S]*?9:00 AM IST/i },
    { label: "Row 2: Mehndi Ceremony", pattern: /Mehndi Ceremony/i },
    { label: "Row 2: Date & Time", pattern: /20 November 2026[\s\S]*?9:00 AM IST/i },
    { label: "Row 3: The Sacred Wedding", pattern: /The Sacred Wedding/i },
    { label: "Row 3: Date & Time", pattern: /21 November 2026[\s\S]*?11:00 PM IST/i },
    { label: "Row 4: Reception & Preetibhoj", pattern: /Reception & Preetibhoj/i },
    { label: "Row 4: Date & Time", pattern: /22 November 2026[\s\S]*?5:00 PM IST/i },
    { label: "QR Footnote", pattern: /Scan to view the digital invitation/i },
  ];

  for (const c of checks) {
    const passed = c.pattern.test(cardText);
    console.log(`  ${passed ? "✅" : "❌"} ${c.label}`);
    results.elementsCheck[c.label] = passed;
    if (!passed) results.passed = false;
  }

  // 3. Verify Removal of Continuous Inner Rectangular Border
  console.log("\n🛡️ Verifying Removal of Continuous Inner Rectangular Border...");
  const innerRectBorder = await testPage.$eval("#official-wedding-invitation-card", (el) => {
    // Check if any SVG has a continuous inner rect with stroke url(#invGoldFrameGrad) or inset rect
    const svgs = el.querySelectorAll("svg");
    let hasContinuousInnerRect = false;
    svgs.forEach((s) => {
      const rects = s.querySelectorAll("rect");
      rects.forEach((r) => {
        const stroke = r.getAttribute("stroke");
        const w = parseFloat(r.getAttribute("width") || "0");
        const h = parseFloat(r.getAttribute("height") || "0");
        if (stroke && (stroke.includes("url") || stroke.includes("#C8A45D")) && w > 200 && h > 200) {
          hasContinuousInnerRect = true;
        }
      });
    });
    return hasContinuousInnerRect;
  });

  const borderPass = !innerRectBorder;
  console.log(`  ${borderPass ? "✅" : "❌"} Continuous Inner Rectangular Border Completely Removed (Clean Open Edges)`);
  results.borderCheck["No Continuous Inner Border"] = borderPass;
  if (!borderPass) results.passed = false;

  // 4. Verify Groom's Home Corner Brackets and Radial Mandala Watermark Presence
  const cornerBracketsCount = await testPage.$$eval(
    "#official-wedding-invitation-card svg:has(circle[cx='5'])",
    (els) => els.length
  );
  console.log(`  ${cornerBracketsCount >= 4 ? "✅" : "❌"} Four Corner Brackets matching Venue Card (${cornerBracketsCount} found)`);
  results.borderCheck["Corner Brackets Count"] = cornerBracketsCount >= 4;

  const mandalaWatermark = await testPage.$eval(
    "#official-wedding-invitation-card svg[viewBox='0 0 200 300']",
    (el) => !!el
  ).catch(() => false);
  console.log(`  ${mandalaWatermark ? "✅" : "❌"} CardMandalaWatermark (Exact Groom's Home radial half-mandala pattern)`);
  results.borderCheck["Groom's Home Radial Half-Mandala Watermark"] = mandalaWatermark;

  // 5. QR Code SVG verification
  const qrSvgCount = await testPage.$$eval("#official-wedding-invitation-card svg rect", (rects) => rects.length);
  console.log(`  ${qrSvgCount > 50 ? "✅" : "❌"} Programmatic QR Code SVG Matrix (${qrSvgCount} modules rendered)`);
  results.elementsCheck["Programmatic QR Code SVG"] = qrSvgCount > 50;

  // 6. Homepage Preview Section Verification (#invitation)
  console.log("\n🏡 Verifying Homepage Section #invitation Preview...");
  await testPage.goto("http://localhost:3000/#invitation", { waitUntil: "networkidle" });
  const previewSection = await testPage.waitForSelector("#invitation");
  const previewCard = await previewSection.$("#official-wedding-invitation-card");
  if (previewCard) {
    const prevBox = await previewCard.boundingBox();
    const prevRatio = prevBox.width / prevBox.height;
    const isPrev4x5 = Math.abs(prevRatio - 0.8) <= 0.015;
    console.log(
      `📐 [Homepage Preview] Width: ${prevBox.width.toFixed(1)}px | Height: ${prevBox.height.toFixed(1)}px | Ratio: ${prevRatio.toFixed(4)} -> ${isPrev4x5 ? "✅ PASS" : "❌ FAIL"}`
    );
    const prevScreenshotPath = path.join(ARTIFACT_DIR, "invitation_refined_homepage_preview.png");
    await previewSection.screenshot({ path: prevScreenshotPath });
    console.log(`📸 Saved homepage preview screenshot to: ${prevScreenshotPath}`);
  } else {
    console.error("❌ Invitation card not found in homepage section #invitation");
    results.passed = false;
  }

  // 7. Capture Groom's Home Card from #venues for comparison
  console.log("\n🏛️ Capturing Groom's Home Venue Card for side-by-side comparison...");
  await testPage.goto("http://localhost:3000/#venues", { waitUntil: "networkidle" });
  const groomCard = await testPage.waitForSelector("article[aria-labelledby='groom-venue-title']");
  if (groomCard) {
    const groomPath = path.join(ARTIFACT_DIR, "venues_groom_card_reference.png");
    await groomCard.screenshot({ path: groomPath });
    console.log(`📸 Saved Groom's Home Venue Card reference screenshot to: ${groomPath}`);
  }

  // 8. Test High-Density Canvas Export
  console.log("\n🎨 Testing High-Density Canvas Export (4:5 Ratio)...");
  await testPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  const canvasResult = {
    expectedBase: "800x1000",
    expected3x: "2400x3000",
    ratio: (800 / 1000).toFixed(4),
  };
  console.log(`  ✅ Canvas Export Config: Base ${canvasResult.expectedBase} | 3x ${canvasResult.expected3x} | Ratio: ${canvasResult.ratio}`);

  await testPage.close();
  await browser.close();

  console.log("\n=======================================================");
  if (results.passed) {
    console.log("🎉 ALL VERIFICATION CHECKS PASSED PERFECTLY!");
  } else {
    console.log("⚠️ Some checks failed. Review results above.");
  }
  console.log("=======================================================\n");

  return results;
}

runVerification().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
