import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:\\Users\\Rabin Gorain\\.gemini\\antigravity\\brain\\2391ac95-fb5b-46c4-adf4-615015ea333c\\screenshots";
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runVerification() {
  console.log("🚀 Starting Step 622 Homepage Preview Card Restoration Verification...\n");

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

  let passed = true;

  // 1. Capture screenshots of #invitation on homepage across viewports
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

    // Minimize music player so it doesn't occlude mobile screenshot
    const minBtn = await page.$('button[aria-label="Minimize player to edge"]');
    if (minBtn) {
      await minBtn.click();
      await page.waitForTimeout(300);
    }

    const invitationSection = await page.$("#invitation");
    if (!invitationSection) {
      console.error(`❌ #invitation section not found on ${vp.name}`);
      passed = false;
      await page.close();
      continue;
    }

    await invitationSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const screenshotPath = path.join(ARTIFACT_DIR, `original_step_622_${vp.name}.png`);
    await invitationSection.screenshot({ path: screenshotPath });
    console.log(`📸 Saved screenshot (${vp.name}) to: ${screenshotPath}`);

    await page.close();
  }

  // 2. Test Content Elements of Step 622
  console.log("\n🔍 Verifying Step 622 Content Elements...");
  const testPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await testPage.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const sectionText = await testPage.$eval("#invitation", (el) => el.innerText);

  const checks = [
    { label: "Section Kicker: Ceremonial Patra", pattern: /Ceremonial Patra/i },
    { label: "Section Title: Digital Invitation Preview", pattern: /Digital Invitation Preview/i },
    { label: "Vedic Invocation: ॥ শ্রী শ্রী প্রজাপতয়ে নমঃ ॥", pattern: /॥ শ্রী শ্রী প্রজাপতয়ে নমঃ ॥/ },
    { label: "Divine Blessings Kicker", pattern: /With the divine blessings of our ancestors and families/i },
    { label: "Groom's Parents Lineage: Mr. Kenaram Gorain & Ms. Savita Gorian", pattern: /Mr\.\s*Kenaram\s*Gorain\s*&\s*Ms\.\s*Savita\s*Gorian/i },
    { label: "Invitation Host Line: cordially invite your gracious presence...", pattern: /cordially invite your gracious presence to celebrate the marriage of their son/i },
    { label: "Couple Display: Mithun with Kabita (Manjura)", pattern: /Mithun[\s\S]*with[\s\S]*Kabita[\s\S]*\(Manjura\)/i },
    { label: "Bride's Parents Lineage: Daughter of Mr. Upen Gorain & Ms. Kokila Gorain", pattern: /Daughter of Mr\.\s*Upen\s*Gorain\s*&\s*Ms\.\s*Kokila\s*Gorain/i },
    { label: "Dates: 19 – 22 November 2026", pattern: /19\s*[–-]\s*22\s*November\s*2026/i },
    { label: "Events List: Purulia, West Bengal • Haldi • Mehndi • Vivaha • Preetibhoj", pattern: /Purulia,\s*West Bengal[\s\S]*Haldi[\s\S]*Mehndi[\s\S]*Vivaha[\s\S]*Preetibhoj/i },
    { label: "P-13 Release Notice", pattern: /Personalized high-resolution PDF download and formal studio pass will open during the invitation release \(Phase P-13\)/i },
    { label: "Button CTA: View Ceremony Schedule & Maps →", pattern: /View Ceremony Schedule & Maps/i },
  ];

  for (const chk of checks) {
    const isMatch = chk.pattern.test(sectionText);
    console.log(`  ${isMatch ? "✅" : "❌"} ${chk.label}`);
    if (!isMatch) passed = false;
  }

  // 3. Verify CTA destination
  console.log("\n🔗 Verifying CTA Button Destination...");
  const ctaHref = await testPage.$eval("#invitation a[href='#ceremonies']", (el) => el.getAttribute("href"));
  if (ctaHref === "#ceremonies") {
    console.log("  ✅ CTA button correctly links to '#ceremonies'");
  } else {
    console.log(`  ❌ CTA button links to '${ctaHref}', expected '#ceremonies'`);
    passed = false;
  }

  // 4. Verify Public /invitation page is intact
  console.log("\n🌐 Verifying Public /invitation Route...");
  const invResp = await testPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  if (invResp?.status() === 200) {
    console.log("  ✅ Public /invitation route responds with HTTP 200");
  } else {
    console.log(`  ❌ Public /invitation responded with status: ${invResp?.status()}`);
    passed = false;
  }

  await testPage.close();
  await browser.close();

  console.log("\n==========================================");
  console.log(passed ? "🎉 ALL VERIFICATIONS PASSED!" : "⚠️ SOME CHECKS FAILED!");
  console.log("==========================================");

  process.exit(passed ? 0 : 1);
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
