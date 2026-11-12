import { chromium } from "playwright";
import fs from "fs";

const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #121212; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .card {
      position: relative;
      width: 490px;
      height: 160px;
      border-radius: 16px;
      background: #FFFDF7;
      border: 1.5px solid #E5C788;
      overflow: hidden;
    }
    .photo-masked {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      clip-path: url(#s-curve-clip);
      object-fit: cover;
    }
    .text-content {
      position: absolute;
      top: 0;
      left: 40%;
      right: 0;
      bottom: 0;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-family: Georgia, serif;
    }
  </style>
</head>
<body>
  <!-- Inline SVG defs for clipPath -->
  <svg width="0" height="0" style="position: absolute;">
    <defs>
      <clipPath id="s-curve-clip" clipPathUnits="objectBoundingBox">
        <!-- 
          Normalized coordinates (0 to 1):
          Start at (0, 0) -> (0.36, 0)
          Cubic Bézier S-curve:
          P0 = (0.36, 0)
          C1 = (0.43, 0.28)  [outward bulge into text area]
          C2 = (0.28, 0.72)  [inward sweep into photo area]
          P1 = (0.35, 1.0)
          Then down to (0, 1) and close.
        -->
        <path d="M 0 0 L 0.36 0 C 0.44 0.28, 0.28 0.72, 0.35 1 L 0 1 Z" />
      </clipPath>
    </defs>
  </svg>

  <div class="card">
    <!-- Image clipped by S-curve -->
    <img class="photo-masked" src="http://localhost:3000/images/invitationcard-haldi-image.webp" alt="Haldi" />
    
    <!-- S-curve gold trim overlay -->
    <svg style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="M 36 0 C 44 28, 28 72, 35 100" fill="none" stroke="#E5C788" stroke-width="2.5" vector-effect="non-scaling-stroke" />
      <path d="M 36.3 0 C 44.3 28, 28.3 72, 35.3 100" fill="none" stroke="#FFF2C2" stroke-width="0.8" opacity="0.6" vector-effect="non-scaling-stroke" />
    </svg>

    <div class="text-content">
      <div style="font-size: 11px; font-weight: bold; color: #995805; font-family: sans-serif; letter-spacing: 0.1em;">19 NOVEMBER 2026 · 9:00 AM IST</div>
      <div style="font-size: 20px; font-weight: bold; color: #421804; margin: 4px 0;">Haldi Ceremony</div>
      <div style="font-size: 13px; font-style: italic; color: #36221A;">The sacred turmeric blessing marking a joyous new beginning.</div>
    </div>
  </div>
</body>
</html>`;

async function testClip() {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({ viewport: { width: 600, height: 300 } });
  await page.setContent(html);
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test_s_curve_browser.png" });
  await browser.close();
  console.log("Captured test_s_curve_browser.png successfully!");
}

testClip().catch(console.error);
