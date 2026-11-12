import { generateQrSvg, generateQrMatrix } from "../src/lib/qr-code.ts";

const url = "https://mithun-sakhi-wedding.vercel.app/invitation";
const matrix = generateQrMatrix(url);
console.log(`Generated QR Matrix size: ${matrix.length}x${matrix.length}`);

// Verify top-left, top-right, and bottom-left finder patterns
// 7x7 outer square with 3x3 inner square
function checkFinderPattern(startX, startY) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isBorder = (r === 0 || r === 6 || c === 0 || c === 6);
      const isInner = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      const expected = isBorder || isInner;
      const actual = matrix[startY + r][startX + c];
      if (actual !== expected) {
        throw new Error(`Finder pattern mismatch at (${startX + c}, ${startY + r}): expected ${expected}, got ${actual}`);
      }
    }
  }
}

checkFinderPattern(0, 0); // Top-left
checkFinderPattern(matrix.length - 7, 0); // Top-right
checkFinderPattern(0, matrix.length - 7); // Bottom-left

console.log("✓ All 3 standard ISO/IEC 18004 finder patterns strictly verified!");

const svg = generateQrSvg(url, { size: 96 });
if (!svg.includes("<svg") || !svg.includes("</svg>")) {
  throw new Error("Invalid SVG generated");
}
console.log(`✓ High-contrast SVG QR Code generated successfully (Length: ${svg.length} chars)`);
console.log("✓ Canonical URL encoded: " + url);
