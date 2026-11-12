import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/screenshots";

async function testAdminInvitation() {
  console.log("=== Testing Admin Invitation Studio ===");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // In test environment, navigating to /admin/invitation may redirect if not logged in or show login
  await page.goto("http://localhost:3000/admin/invitation", { waitUntil: "networkidle" });
  console.log("Current URL:", page.url());

  // Capture screenshot of admin or redirected state
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "admin_invitation_route_check.png"),
  });
  console.log("✓ Captured admin invitation route check screenshot.");
  await browser.close();
}

testAdminInvitation().catch(console.error);
