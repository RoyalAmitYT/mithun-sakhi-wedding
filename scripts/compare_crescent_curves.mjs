import sharp from 'sharp';

const svg = `<svg width="1000" height="400" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Variant 1: Cubic Bézier sweeping from 38% at top to 15% at bottom, gently bowed inward -->
    <clipPath id="crescent-clip-1" clipPathUnits="objectBoundingBox">
      <path d="M 0 0 L 0.38 0 C 0.32 0.35, 0.22 0.70, 0.15 1 L 0 1 Z" />
    </clipPath>
    <!-- Variant 2: Sweeping from 40% at top to 18% at bottom, very smooth gentle bow -->
    <clipPath id="crescent-clip-2" clipPathUnits="objectBoundingBox">
      <path d="M 0 0 L 0.40 0 C 0.35 0.30, 0.26 0.70, 0.18 1 L 0 1 Z" />
    </clipPath>
    <!-- Variant 3: Sweeping from 37% at top to 12% at bottom, more pronounced diagonal sweep -->
    <clipPath id="crescent-clip-3" clipPathUnits="objectBoundingBox">
      <path d="M 0 0 L 0.37 0 C 0.30 0.35, 0.18 0.70, 0.12 1 L 0 1 Z" />
    </clipPath>
    <!-- Variant 4: Sweeping from 38% at top to 20% at bottom, subtle sweep -->
    <clipPath id="crescent-clip-4" clipPathUnits="objectBoundingBox">
      <path d="M 0 0 L 0.38 0 C 0.34 0.35, 0.27 0.70, 0.20 1 L 0 1 Z" />
    </clipPath>
  </defs>

  <!-- Card 1 -->
  <g transform="translate(10, 20)">
    <rect width="470" height="160" rx="16" fill="#FFFDF7" stroke="#E5C788" stroke-width="1.5" />
    <g clip-path="url(#crescent-clip-1)"><rect width="240" height="160" fill="#C07008" /></g>
    <path d="M 178.6 0 C 150.4 56, 103.4 112, 70.5 160" fill="none" stroke="#E5C788" stroke-width="2.2" />
    <path d="M 179.6 0 C 151.4 56, 104.4 112, 71.5 160" fill="none" stroke="#FFF5D6" stroke-width="0.8" opacity="0.7" />
    <text x="200" y="80" font-family="serif" font-size="18">Variant 1 (38% to 15%)</text>
  </g>

  <!-- Card 2 -->
  <g transform="translate(510, 20)">
    <rect width="470" height="160" rx="16" fill="#FFFDF7" stroke="#E5C788" stroke-width="1.5" />
    <g clip-path="url(#crescent-clip-2)"><rect width="240" height="160" fill="#C07008" /></g>
    <path d="M 188 0 C 164.5 48, 122.2 112, 84.6 160" fill="none" stroke="#E5C788" stroke-width="2.2" />
    <path d="M 189 0 C 165.5 48, 123.2 112, 85.6 160" fill="none" stroke="#FFF5D6" stroke-width="0.8" opacity="0.7" />
    <text x="200" y="80" font-family="serif" font-size="18">Variant 2 (40% to 18%)</text>
  </g>

  <!-- Card 3 -->
  <g transform="translate(10, 210)">
    <rect width="470" height="160" rx="16" fill="#FFFDF7" stroke="#E5C788" stroke-width="1.5" />
    <g clip-path="url(#crescent-clip-3)"><rect width="240" height="160" fill="#C07008" /></g>
    <path d="M 173.9 0 C 141 56, 84.6 112, 56.4 160" fill="none" stroke="#E5C788" stroke-width="2.2" />
    <path d="M 174.9 0 C 142 56, 85.6 112, 57.4 160" fill="none" stroke="#FFF5D6" stroke-width="0.8" opacity="0.7" />
    <text x="200" y="80" font-family="serif" font-size="18">Variant 3 (37% to 12%)</text>
  </g>

  <!-- Card 4 -->
  <g transform="translate(510, 210)">
    <rect width="470" height="160" rx="16" fill="#FFFDF7" stroke="#E5C788" stroke-width="1.5" />
    <g clip-path="url(#crescent-clip-4)"><rect width="240" height="160" fill="#C07008" /></g>
    <path d="M 178.6 0 C 159.8 56, 126.9 112, 94 160" fill="none" stroke="#E5C788" stroke-width="2.2" />
    <path d="M 179.6 0 C 160.8 56, 127.9 112, 95 160" fill="none" stroke="#FFF5D6" stroke-width="0.8" opacity="0.7" />
    <text x="200" y="80" font-family="serif" font-size="18">Variant 4 (38% to 20%)</text>
  </g>
</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile('test_crescent_variants.png')
  .then(() => console.log('Saved test_crescent_variants.png'));
