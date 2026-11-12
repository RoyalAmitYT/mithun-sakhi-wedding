import { chromium } from "playwright";
import fs from "fs";

const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #1a1617; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
    .card {
      position: relative;
      width: 480px;
      height: 165px;
      border-radius: 18px;
      background: linear-gradient(to right, #FFFDF7, #FFFBF2, #FFF8E7);
      border: 1.5px solid rgba(229, 199, 136, 0.85);
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .photo-container {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      clip-path: url(#crescent-gold-clip);
    }
    .photo {
      width: 52%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    .content {
      position: absolute;
      inset: 0;
      padding-left: 39%;
      padding-right: 16px;
      padding-top: 12px;
      padding-bottom: 12px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      z-index: 10;
    }
    .date-time {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #995805;
      margin-bottom: 4px;
      white-space: nowrap;
    }
    .title {
      font-family: Georgia, serif;
      font-size: 20px;
      font-weight: bold;
      color: #421804;
      line-height: 1.15;
      margin-bottom: 6px;
    }
    .desc {
      font-family: Georgia, serif;
      font-style: italic;
      font-size: 14.5px;
      color: #36221A;
      line-height: 1.35;
    }
  </style>
</head>
<body>
  <!-- Clip Path: 
       Starts at top x = 0.38 (38% card width)
       Curves smoothly diagonally down-left with a single gentle bend
       Ends at bottom x = 0.17 (17% card width)
  -->
  <svg width="0" height="0" style="position: absolute;">
    <defs>
      <clipPath id="crescent-gold-clip" clipPathUnits="objectBoundingBox">
        <path d="M 0 0 L 0.38 0 C 0.33 0.32, 0.24 0.68, 0.17 1 L 0 1 Z" />
      </clipPath>
      
      <!-- Filter for restrained soft metallic golden glow -->
      <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="
          1 0 0 0 0.85
          0 1 0 0 0.70
          0 0 1 0 0.35
          0 0 0 0.6 0" result="goldGlow" />
        <feMerge>
          <feMergeNode in="goldGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>

  <div class="card">
    <div class="photo-container">
      <img class="photo" src="http://localhost:3000/images/invitationcard-haldi-image.webp" alt="Haldi" />
    </div>

    <!-- Golden Glowing Edge Overlay -->
    <svg style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5;" viewBox="0 0 100 100" preserveAspectRatio="none">
      <!-- 1. Soft diffused golden outer aura -->
      <path d="M 38 0 C 33 32, 24 68, 17 100" fill="none" stroke="rgba(218, 175, 85, 0.50)" stroke-width="4.5" stroke-linecap="round" vector-effect="non-scaling-stroke" style="filter: drop-shadow(0 0 2px rgba(218, 175, 85, 0.6));" />
      <!-- 2. Refined antique-gold metallic base stroke -->
      <path d="M 38 0 C 33 32, 24 68, 17 100" fill="none" stroke="#C59B4B" stroke-width="2.2" vector-effect="non-scaling-stroke" />
      <!-- 3. Luminous warm-gold highlight stroke -->
      <path d="M 38.2 0 C 33.2 32, 24.2 68, 17.2 100" fill="none" stroke="#FFE9A3" stroke-width="1.0" opacity="0.9" vector-effect="non-scaling-stroke" />
      <!-- 4. Delicate inner core specular highlight -->
      <path d="M 38.3 0 C 33.3 32, 24.3 68, 17.3 100" fill="none" stroke="#FFFDF5" stroke-width="0.5" opacity="0.75" vector-effect="non-scaling-stroke" />
    </svg>

    <div class="content">
      <div class="date-time">19 NOVEMBER 2026 &bull; 9:00 AM IST</div>
      <div class="title">Haldi Ceremony</div>
      <div class="desc">The sacred turmeric blessing marking a joyous new beginning.</div>
    </div>
  </div>
</body>
</html>`;

async function testGoldenGlow() {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({ viewport: { width: 600, height: 300 } });
  await page.setContent(html);
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test_golden_glowing_edge.png" });
  await browser.close();
  console.log("Captured test_golden_glowing_edge.png successfully!");
}

testGoldenGlow().catch(console.error);
