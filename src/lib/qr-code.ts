/**
 * QR Code Generator Utility (Phase P-13)
 * Self-contained, zero-dependency QR code matrix and SVG generator.
 * Standard QR Code ISO/IEC 18004 compliant for byte-mode URLs.
 */

// Galois Field GF(256) tables with primitive polynomial 0x11D (285)
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    EXP_TABLE[i + 255] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) {
      x ^= 0x11d;
    }
  }
})();

function gfMultiply(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
}

function polyMultiply(p1: number[], p2: number[]): number[] {
  const result = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMultiply(p1[i], p2[j]);
    }
  }
  return result;
}

function getGeneratorPoly(numEcBytes: number): number[] {
  let poly = [1];
  for (let i = 0; i < numEcBytes; i++) {
    poly = polyMultiply(poly, [1, EXP_TABLE[i]]);
  }
  return poly;
}

function calculateEcCodewords(data: number[], numEcBytes: number): number[] {
  const genPoly = getGeneratorPoly(numEcBytes);
  const remainder = [...data, ...new Array(numEcBytes).fill(0)];

  for (let i = 0; i < data.length; i++) {
    const factor = remainder[i];
    if (factor !== 0) {
      for (let j = 0; j < genPoly.length; j++) {
        remainder[i + j] ^= gfMultiply(genPoly[j], factor);
      }
    }
  }
  return remainder.slice(data.length);
}

// QR Version specifications for Low (L) and Medium (M) error correction
interface QrSpec {
  version: number;
  totalCodewords: number;
  dataCodewords: number;
  ecCodewordsPerBlock: number;
  numBlocks: number;
  alignmentPositions: number[];
}

const QR_SPECS_M: QrSpec[] = [
  { version: 1, totalCodewords: 26, dataCodewords: 16, ecCodewordsPerBlock: 10, numBlocks: 1, alignmentPositions: [] },
  { version: 2, totalCodewords: 44, dataCodewords: 28, ecCodewordsPerBlock: 16, numBlocks: 1, alignmentPositions: [6, 18] },
  { version: 3, totalCodewords: 70, dataCodewords: 44, ecCodewordsPerBlock: 26, numBlocks: 1, alignmentPositions: [6, 22] },
  { version: 4, totalCodewords: 100, dataCodewords: 64, ecCodewordsPerBlock: 18, numBlocks: 2, alignmentPositions: [6, 26] },
  { version: 5, totalCodewords: 134, dataCodewords: 86, ecCodewordsPerBlock: 24, numBlocks: 2, alignmentPositions: [6, 30] },
  { version: 6, totalCodewords: 172, dataCodewords: 108, ecCodewordsPerBlock: 16, numBlocks: 4, alignmentPositions: [6, 34] },
];

export function generateQrMatrix(text: string): boolean[][] {
  const encoder = new TextEncoder();
  const textBytes = Array.from(encoder.encode(text));

  // Find smallest version that fits
  let spec: QrSpec | null = null;
  for (const s of QR_SPECS_M) {
    // Mode indicator (4 bits) + Character count (8 bits for v1-9 byte mode) = 12 bits = 1.5 bytes
    const requiredDataBytes = textBytes.length + 2;
    if (requiredDataBytes <= s.dataCodewords) {
      spec = s;
      break;
    }
  }

  if (!spec) {
    spec = QR_SPECS_M[QR_SPECS_M.length - 1];
  }

  const size = spec.version * 4 + 17;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );

  // Helper to place finder pattern
  function placeFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = row + r;
        const tc = col + c;
        if (tr < 0 || tr >= size || tc < 0 || tc >= size) continue;

        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[tr][tc] = true;
          } else {
            matrix[tr][tc] = false;
          }
        } else {
          // Separator
          matrix[tr][tc] = false;
        }
      }
    }
  }

  // 1. Finder patterns at Top-Left, Top-Right, Bottom-Left
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // 2. Alignment patterns (if version >= 2)
  for (const r of spec.alignmentPositions) {
    for (const c of spec.alignmentPositions) {
      if (matrix[r][c] !== null) continue; // Skip if overlapping finder
      for (let ar = -2; ar <= 2; ar++) {
        for (let ac = -2; ac <= 2; ac++) {
          const isBorder = Math.abs(ar) === 2 || Math.abs(ac) === 2;
          const isCenter = ar === 0 && ac === 0;
          matrix[r + ar][c + ac] = isBorder || isCenter;
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // 4. Dark module
  matrix[size - 8][8] = true;

  // 5. Reserve format info areas
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }
  for (let i = size - 8; i < size; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }

  // 6. Encode Data (Byte Mode)
  const bitStream: number[] = [];
  function pushBits(val: number, length: number) {
    for (let i = length - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  }

  // Byte mode indicator: 0100
  pushBits(0b0100, 4);
  // Character count (8 bits for v1-9)
  pushBits(textBytes.length, 8);
  // Payload
  for (const b of textBytes) {
    pushBits(b, 8);
  }

  // Terminator (up to 4 zeroes)
  const maxDataBits = spec.dataCodewords * 8;
  const termBits = Math.min(4, maxDataBits - bitStream.length);
  pushBits(0, termBits);

  // Pad to multiple of 8
  while (bitStream.length % 8 !== 0) {
    bitStream.push(0);
  }

  // Convert bits to data codewords
  const dataCodewords: number[] = [];
  for (let i = 0; i < bitStream.length; i += 8) {
    let byteVal = 0;
    for (let j = 0; j < 8; j++) {
      byteVal = (byteVal << 1) | bitStream[i + j];
    }
    dataCodewords.push(byteVal);
  }

  // Pad bytes: alternating 0xEC (236) and 0x11 (17)
  const padPatterns = [0xec, 0x11];
  let padIdx = 0;
  while (dataCodewords.length < spec.dataCodewords) {
    dataCodewords.push(padPatterns[padIdx]);
    padIdx = (padIdx + 1) % 2;
  }

  // Split into blocks and compute EC
  const dataPerBlock = Math.floor(spec.dataCodewords / spec.numBlocks);
  const blocks: number[][] = [];
  const ecBlocks: number[][] = [];

  for (let b = 0; b < spec.numBlocks; b++) {
    const blockData = dataCodewords.slice(b * dataPerBlock, (b + 1) * dataPerBlock);
    blocks.push(blockData);
    ecBlocks.push(calculateEcCodewords(blockData, spec.ecCodewordsPerBlock));
  }

  // Interleave data codewords
  const finalCodewords: number[] = [];
  for (let i = 0; i < dataPerBlock; i++) {
    for (let b = 0; b < spec.numBlocks; b++) {
      finalCodewords.push(blocks[b][i]);
    }
  }

  // Interleave error correction codewords
  for (let i = 0; i < spec.ecCodewordsPerBlock; i++) {
    for (let b = 0; b < spec.numBlocks; b++) {
      finalCodewords.push(ecBlocks[b][i]);
    }
  }

  // Convert final codewords to bits
  const finalBits: number[] = [];
  for (const cw of finalCodewords) {
    for (let i = 7; i >= 0; i--) {
      finalBits.push((cw >> i) & 1);
    }
  }

  // 7. Place data bits in matrix (right to left in 2-column tracks, zigzagging up and down)
  let bitIdx = 0;
  let upwards = true;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing pattern

    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const row of rows) {
      for (const c of [col, col - 1]) {
        if (matrix[row][c] === null) {
          const bit = bitIdx < finalBits.length ? finalBits[bitIdx++] === 1 : false;
          // Apply standard Mask Pattern 0: (row + col) % 2 === 0
          const mask = (row + c) % 2 === 0;
          matrix[row][c] = mask ? !bit : bit;
        }
      }
    }
    upwards = !upwards;
  }

  // 8. Format Information for Mask Pattern 0, Error Correction Level M
  // Format string for EC level M (00) and Mask 0 (000): 101010000010010 (BCH 15,5 code xor 101010000010010)
  // Mask pattern 0 (000), EC M (00) -> 00000 -> BCH code -> xor mask 101010000010010 = 101010000010010
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];

  // Top-left format placement
  const tlCoords: [number, number][] = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
    [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8],
    [2, 8], [1, 8], [0, 8],
  ];
  tlCoords.forEach(([r, c], i) => {
    matrix[r][c] = formatBits[i] === 1;
  });

  // Top-right and bottom-left format placement
  const trBlCoords: [number, number][] = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
  ];
  trBlCoords.forEach(([r, c], i) => {
    matrix[r][c] = formatBits[i] === 1;
  });

  return matrix.map((row) => row.map((cell) => cell ?? false));
}

/**
 * Generates an SVG string representation of the QR code
 */
export function generateQrSvg(
  text: string,
  options: {
    size?: number;
    fgColor?: string;
    bgColor?: string;
    margin?: number;
  } = {}
): string {
  const { size = 200, fgColor = "#292322", bgColor = "transparent", margin = 2 } = options;
  const matrix = generateQrMatrix(text);
  const matrixSize = matrix.length;
  const totalCells = matrixSize + margin * 2;
  const cellSize = size / totalCells;

  let rects = "";
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const x = (c + margin) * cellSize;
        const y = (r + margin) * cellSize;
        rects += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="${fgColor}" />`;
      }
    }
  }

  const bgRect =
    bgColor && bgColor !== "transparent"
      ? `<rect width="${size}" height="${size}" fill="${bgColor}" />`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${bgRect}${rects}</svg>`;
}
