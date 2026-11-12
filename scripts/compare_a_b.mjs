import sharp from 'sharp';

const svg = `<svg width="1000" height="220" viewBox="0 0 1000 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Case A: Crescent Inward Bow (38% to 18%) -->
    <clipPath id="case-a" clipPathUnits="objectBoundingBox">
      <path d="M 0 0 L 0.38 0 C 0.32 0.35, 0.23 0.70, 0.18 1 L 0 1 Z" />
    </clipPath>
    <!-- Case B: Outward Bow then sweep (38% to 18%) -->
    <clipPath id="case-b" clipPathUnits="objectBoundingBox">
      <path d="M 0 0 L 0.38 0 C 0.39 0.35, 0.31 0.70, 0.18 1 L 0 1 Z" />
    </clipPath>
  </defs>

  <g transform="translate(10, 20)">
    <rect width="470" height="170" rx="16" fill="#FFFDF7" stroke="#E5C788" stroke-width="1.5" />
    <g clip-path="url(#case-a)"><rect width="240" height="170" fill="#C07008" /></g>
    <path d="M 178.6 0 C 150.4 59.5, 108.1 119, 84.6 170" fill="none" stroke="#E5C788" stroke-width="2.2" />
    <path d="M 179.6 0 C 151.4 59.5, 109.1 119, 85.6 170" fill="none" stroke="#FFF5D6" stroke-width="0.8" opacity="0.7" />
    <text x="210" y="85" font-family="serif" font-size="20">Case A: Crescent Inward Bow</text>
  </g>

  <g transform="translate(510, 20)">
    <rect width="470" height="170" rx="16" fill="#FFFDF7" stroke="#E5C788" stroke-width="1.5" />
    <g clip-path="url(#case-b)"><rect width="240" height="170" fill="#C07008" /></g>
    <path d="M 178.6 0 C 183.3 59.5, 145.7 119, 84.6 170" fill="none" stroke="#E5C788" stroke-width="2.2" />
    <path d="M 179.6 0 C 184.3 59.5, 146.7 119, 85.6 170" fill="none" stroke="#FFF5D6" stroke-width="0.8" opacity="0.7" />
    <text x="210" y="85" font-family="serif" font-size="20">Case B: Outward Bow then Sweep</text>
  </g>
</svg>`;

async function run() {
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  const refCard1 = await sharp('images/digita-invitation-card-reference.png')
    .extract({ left: 55, top: 715, width: 495, height: 170 })
    .toBuffer();
    
  await sharp({
    create: { width: 1040, height: 420, channels: 4, background: { r: 20, g: 20, b: 20, alpha: 1 } }
  })
  .composite([
    { input: refCard1, left: 20, top: 15 },
    { input: buf, left: 20, top: 195 }
  ])
  .toFile('visual_compare_a_b.png');
  console.log('Saved visual_compare_a_b.png');
}
run();
