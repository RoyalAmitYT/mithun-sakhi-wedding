import sharp from 'sharp';

const svg = `<svg width="1000" height="400" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Variant A: S-curve (Outward top, Inward bottom) -->
    <clipPath id="clip-a">
      <path d="M 0 0 L 160 0 C 220 40, 110 120, 165 160 L 0 160 Z" />
    </clipPath>
    <!-- Variant B: Tilted S-curve (Inward top, Outward bottom) -->
    <clipPath id="clip-b">
      <path d="M 0 0 L 175 0 C 115 40, 225 120, 160 160 L 0 160 Z" />
    </clipPath>
    <!-- Variant C: Flowing organic S with two cubic segments -->
    <clipPath id="clip-c">
      <path d="M 0 0 L 165 0 C 210 30, 210 65, 175 85 C 140 105, 135 135, 160 160 L 0 160 Z" />
    </clipPath>
    <!-- Variant D: Flowing organic S reversed -->
    <clipPath id="clip-d">
      <path d="M 0 0 L 165 0 C 120 30, 120 65, 155 85 C 190 105, 200 135, 165 160 L 0 160 Z" />
    </clipPath>
  </defs>

  <!-- Card A -->
  <g transform="translate(10, 20)">
    <rect width="470" height="160" rx="16" fill="#FFFDF7" stroke="#E5C788" stroke-width="1.5" />
    <g clip-path="url(#clip-a)"><rect width="240" height="160" fill="#C07008" /></g>
    <path d="M 160 0 C 220 40, 110 120, 165 160" fill="none" stroke="#E5C788" stroke-width="2.5" />
    <text x="250" y="80" font-family="serif" font-size="20">Variant A</text>
  </g>

  <!-- Card B -->
  <g transform="translate(510, 20)">
    <rect width="470" height="160" rx="16" fill="#FFFDF7" stroke="#E5C788" stroke-width="1.5" />
    <g clip-path="url(#clip-b)"><rect width="240" height="160" fill="#C07008" /></g>
    <path d="M 175 0 C 115 40, 225 120, 160 160" fill="none" stroke="#E5C788" stroke-width="2.5" />
    <text x="250" y="80" font-family="serif" font-size="20">Variant B</text>
  </g>

  <!-- Card C -->
  <g transform="translate(10, 210)">
    <rect width="470" height="160" rx="16" fill="#FFFDF7" stroke="#E5C788" stroke-width="1.5" />
    <g clip-path="url(#clip-c)"><rect width="240" height="160" fill="#C07008" /></g>
    <path d="M 165 0 C 210 30, 210 65, 175 85 C 140 105, 135 135, 160 160" fill="none" stroke="#E5C788" stroke-width="2.5" />
    <text x="250" y="80" font-family="serif" font-size="20">Variant C (Flowing S)</text>
  </g>

  <!-- Card D -->
  <g transform="translate(510, 210)">
    <rect width="470" height="160" rx="16" fill="#FFFDF7" stroke="#E5C788" stroke-width="1.5" />
    <g clip-path="url(#clip-d)"><rect width="240" height="160" fill="#C07008" /></g>
    <path d="M 165 0 C 120 30, 120 65, 155 85 C 190 105, 200 135, 165 160" fill="none" stroke="#E5C788" stroke-width="2.5" />
    <text x="250" y="80" font-family="serif" font-size="20">Variant D (Flowing S Rev)</text>
  </g>
</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile('test_s_variants.png')
  .then(() => console.log('Saved test_s_variants.png'));
