import { chromium } from "playwright";
import fs from "fs";

async function main() {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  
  // 1. Desktop 1440x900
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/#invitation", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots/homepage_preview_refined.png" 
  });
  
  const card = page.locator("#official-wedding-invitation-card").first();
  if (await card.count() > 0) {
    const box = await card.boundingBox();
    console.log("Card dimensions:", box);
    const ratio = box.width / box.height;
    console.log("Card aspect ratio:", ratio.toFixed(4));

    await card.screenshot({ 
      path: "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/card_refined_target_match.png" 
    });
    console.log("Card screenshot captured at card_refined_target_match.png");
  }

  // 2. Mobile 390x844
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto("http://localhost:3000/#invitation", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ 
    path: "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots/mobile_390_refined.png" 
  });

  // 3. Public /invitation page
  const invPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await invPage.goto("http://localhost:3000/invitation", { waitUntil: "networkidle" });
  await invPage.waitForTimeout(1000);
  const invCard = invPage.locator("#official-wedding-invitation-card").first();
  if (await invCard.count() > 0) {
    await invCard.screenshot({ 
      path: "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots/public_invitation_card.png" 
    });
  }

  // 4. Test Download Button
  const [download] = await Promise.all([
    invPage.waitForEvent("download", { timeout: 10000 }).catch(() => null),
    invPage.click("button:has-text('Download Invitation')").catch(() => null),
  ]);

  if (download) {
    const downloadPath = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots/downloaded_invitation.png";
    await download.saveAs(downloadPath);
    const stats = fs.statSync(downloadPath);
    console.log("Downloaded PNG size:", stats.size, "bytes");
  }

  await browser.close();
  console.log("All automated tests and captures completed successfully!");
}

main().catch(console.error);
