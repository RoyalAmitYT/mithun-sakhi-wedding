import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:\\Users\\Rabin Gorain\\.gemini\\antigravity\\brain\\2391ac95-fb5b-46c4-adf4-615015ea333c\\screenshots";
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function verifyRestoredCard() {
  console.log("================================================================================");
  console.log("   VERIFYING RESTORED IMMEDIATELY PRECEDING INVITATION CARD");
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

  try {
    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

      const minBtn = await page.$('button[aria-label="Minimize player to edge"]');
      if (minBtn) {
        await minBtn.click();
        await page.waitForTimeout(300);
      }

      const card = await page.locator("#official-wedding-invitation-card").first();
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const box = await card.boundingBox();
      const ratio = box ? box.width / box.height : 0;
      console.log(`Viewport ${vp.name}: width=${box?.width.toFixed(1)}px, height=${box?.height.toFixed(1)}px, aspect ratio=${ratio.toFixed(4)}`);

      const section = page.locator("#invitation");
      const sectionPath = path.join(ARTIFACT_DIR, `restored_immediately_preceding_${vp.name}.png`);
      await section.screenshot({ path: sectionPath });
      console.log(`✓ Section screenshot saved to: ${sectionPath}`);

      if (vp.name === "desktop_1440") {
        const cardPath = path.join(ARTIFACT_DIR, `restored_immediately_preceding_card_only.png`);
        await card.screenshot({ path: cardPath });
        console.log(`✓ Card screenshot saved to: ${cardPath}`);
      }

      await page.close();
    }

    // Verify content on Desktop
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    const cardText = await page.locator("#official-wedding-invitation-card").innerText();

    console.log("\n--- Card Content Audit ---");
    console.log("Arch Monogram: M•S present?", cardText.includes("M•S"));
    console.log("Kicker: Celebrate the Wedding of present?", /Celebrate the Wedding of/i.test(cardText));
    console.log("Couple Branding: Mithun & Sakhi present?", /Mithun[\s\S]*&[\s\S]*Sakhi/i.test(cardText));
    console.log("Parents Section removed?", !cardText.includes("GROOM'S PARENTS") && !cardText.includes("BRIDE'S PARENTS"));
    console.log("Unboxed Blessing Message present?", /With the blessings of our families, we warmly invite you/i.test(cardText));
    console.log("Ceremony Schedule present?", /CEREMONY SCHEDULE/i.test(cardText) && /HALDI/i.test(cardText));
    console.log("QR Code & Caption present?", /SCAN FOR THE COMPLETE WEDDING DETAILS/i.test(cardText));

    const internalButtons = await page.locator("#official-wedding-invitation-card button, #official-wedding-invitation-card a").count();
    console.log("Internal buttons count:", internalButtons);

    await page.close();
  } finally {
    await browser.close();
  }
}

verifyRestoredCard().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
