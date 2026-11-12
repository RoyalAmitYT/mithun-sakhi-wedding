import sharp from 'sharp';

const svg = `<svg width="500" height="170" viewBox="0 0 500 170" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="test-s-clip" clipPathUnits="objectBoundingBox">
      <path d="M 0 0 L 0.35 0 C 0.43 0.25, 0.41 0.40, 0.37 0.52 C 0.33 0.65, 0.25 0.78, 0.33 1 L 0 1 Z" />
    </clipPath>
  </defs>

  <!-- Card background -->
  <rect width="500" height="170" rx="16" fill="#FFFDF7" stroke="#E5C788" stroke-width="1.5" />

  <!-- Mock image in clipped area -->
  <g clip-path="url(#test-s-clip)">
    <rect width="250" height="170" fill="#E6A817" />
    <!-- Center symbol to show image content -->
    <circle cx="90" cy="85" r="40" fill="#C07008" />
  </g>

  <!-- Flowing S-curve gold trim -->
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; width: 100%; height: 100%;">
    <path d="M 35 0 C 43 25, 41 40, 37 52 C 33 65, 25 78, 33 100" 
          fill="none" stroke="#E5C788" stroke-width="2.5" vector-effect="non-scaling-stroke" />
    <path d="M 35.3 0 C 43.3 25, 41.3 40, 37.3 52 C 33.3 65, 25.3 78, 33.3 100" 
          fill="none" stroke="#FFF5D6" stroke-width="0.9" opacity="0.75" vector-effect="non-scaling-stroke" />
  </svg>
</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile('test_smooth_s_curve.png')
  .then(() => console.log('Saved test_smooth_s_curve.png'));
