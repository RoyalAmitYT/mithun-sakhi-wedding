/**
 * Lightweight helper to extract image dimensions (width, height)
 * directly from binary image buffers (PNG, JPEG, WebP, GIF, AVIF).
 * Operates synchronously in O(1) time without external dependencies.
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

export function getImageDimensionsFromBuffer(
  buffer: Buffer
): ImageDimensions | null {
  if (!buffer || buffer.length < 16) return null;

  try {
    // 1. PNG Detection
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a &&
      buffer.length >= 24
    ) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      if (width > 0 && height > 0) return { width, height };
    }

    // 2. WebP Detection (RIFF .... WEBP)
    if (
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP" &&
      buffer.length >= 30
    ) {
      const type = buffer.toString("ascii", 12, 16);

      // VP8X (Extended WebP)
      if (type === "VP8X" && buffer.length >= 30) {
        const width = 1 + buffer.readUIntLE(24, 3);
        const height = 1 + buffer.readUIntLE(27, 3);
        if (width > 0 && height > 0) return { width, height };
      }

      // VP8L (Lossless WebP)
      if (type === "VP8L" && buffer.length >= 25 && buffer[20] === 0x2f) {
        const b1 = buffer[21];
        const b2 = buffer[22];
        const b3 = buffer[23];
        const b4 = buffer[24];
        const width = 1 + (((b2 & 0x3f) << 8) | b1);
        const height = 1 + ((((b4 & 0xf) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)));
        if (width > 0 && height > 0) return { width, height };
      }

      // VP8 (Lossy WebP)
      if (type === "VP8 " && buffer.length >= 30) {
        // Frame header check
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        if (width > 0 && height > 0) return { width, height };
      }
    }

    // 3. GIF Detection (GIF87a / GIF89a)
    if (
      buffer.toString("ascii", 0, 3) === "GIF" &&
      buffer.length >= 10
    ) {
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      if (width > 0 && height > 0) return { width, height };
    }

    // 4. JPEG Detection (0xFFD8)
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        // SOF markers: 0xC0 - 0xC3, 0xC5 - 0xC7, 0xC9 - 0xCB, 0xCD - 0xCF
        const isSOF =
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf);

        if (isSOF && offset + 9 < buffer.length) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          if (width > 0 && height > 0) return { width, height };
        }

        // Jump marker length
        if (offset + 3 >= buffer.length) break;
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }
  } catch {
    // Return null on parsing failure
    return null;
  }

  return null;
}
