import sharp from 'sharp';

const svg = `<svg width="500" height="170" viewBox="0 0 500 170" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- S-curve that bends INWARD at top and OUTWARD at bottom -->
    <clipPath id="test-s-clip-v2" clipPathUnits="objectBoundingBox">
      <path d="M 0 0 L 0.36 0 C 0.25 0.26, 0.26 0.44, 0.33 0.54 C 0.41 0.66, 0.43 0.82, 0.31 1 L 0 1 Z" />
    </clipPath>
  </defs>

  <rect width="500" height="170" rx="16" fill="#FFFDF7" stroke="#E5C788" stroke-width="1.5" />

  <g clip-path="url(#test-s-clip-v2)">
    <rect width="250" height="170" fill="#E6A817" />
    <circle cx="90" cy="85" r="40" fill="#C07008" />
  </g>

  <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; width: 100%; height: 100%;">
    <path d="M 36 0 C 25 26, 26 44, 33 54 C 41 66, 43 82, 31 100" 
          fill="none" stroke="#E5C788" stroke-width="2.5" vector-effect="non-scaling-stroke" />
    <path d="M 36.3 0 C 25.3 26, 26.3 44, 33.3 54 C 41.3 66, 43.3 82, 31.3 100" 
          fill="none" stroke="#FFF5D6" stroke-width="0.9" opacity="0.75" vector-effect="non-scaling-stroke" />
  </svg>
</svg>`;

async function run() {
  const testBuf = await sharp(Buffer.from(svg)).png().toBuffer();
  
  const card1 = await sharp('images/digita-invitation-card-reference.png')
    .extract({ left: 60, top: 720, width: 490, height: 165 })
    .toBuffer();
    
  await sharp({
    create: { width: 1020, height: 200, channels: 4, background: { r: 30, g: 30, b: 30, alpha: 1 } }
  })
  .composite([
    { input: card1, left: 15, top: 15 },
    { input: testBuf, left: 515, top: 15 }
  ])
  .toFile('compare_card_haldi_v2.png');
  console.log('compare_card_haldi_v2.png saved!');
}
run();
