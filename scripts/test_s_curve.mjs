import sharp from 'sharp';

const svg = `<svg width="490" height="160" viewBox="0 0 490 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- S-curve path:
         At y=0: x=175
         Upper half: sweeps rightward/outward (curves out towards text)
         Midpoint: inflects around y=80, x=175
         Lower half: sweeps leftward/inward (curves in towards image)
         At y=160: ends around x=165
    -->
    <clipPath id="s-curve-clip">
      <path d="M 0 0 L 175 0 C 215 35, 205 65, 175 80 C 145 95, 140 125, 165 160 L 0 160 Z" />
    </clipPath>
  </defs>
  <rect width="490" height="160" rx="16" fill="#FFFDF7" stroke="#E5C788" stroke-width="2" />
  
  <g clip-path="url(#s-curve-clip)">
    <rect width="240" height="160" fill="#C07008" />
  </g>
  
  <path d="M 175 0 C 215 35, 205 65, 175 80 C 145 95, 140 125, 165 160" 
        fill="none" stroke="#E5C788" stroke-width="2.5" />
  <path d="M 176.5 0 C 216.5 35, 206.5 65, 176.5 80 C 146.5 95, 141.5 125, 166.5 160" 
        fill="none" stroke="#FFF5D6" stroke-width="1" opacity="0.7" />
</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile('test_s_curve_render.png')
  .then(() => console.log('Saved test_s_curve_render.png'));
