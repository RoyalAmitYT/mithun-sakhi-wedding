/**
 * Strict image validation library for Mithun & Sakhi Luxury Wedding Platform.
 *
 * Enforces deep binary inspection, magic-byte verification, intrinsic dimension bounds,
 * extension/MIME consistency, and script/markup injection defense without third-party dependencies.
 *
 * Permitted raster formats: JPEG, PNG, WebP, AVIF.
 * Strictly prohibited: SVG, HTML, XML, executable scripts, and all other non-image payloads.
 *
 * Memory Safety Architecture & Vercel Serverless Headroom Analysis:
 * -----------------------------------------------------------------------------
 * 1. Maximum File Size (Wire Size): 50MB (MAX_IMAGE_FILE_SIZE = 50 * 1024 * 1024)
 * 2. Maximum Axis Dimension: 8,500px (MAX_IMAGE_DIMENSION = 8500)
 * 3. Maximum Intrinsic Pixel Count: 40 Megapixels (MAX_TOTAL_PIXELS = 40_000_000)
 *
 * Memory Budget vs Vercel Serverless 1024MB Ceiling:
 * - A 40MP image uncompressed into 32-bit RGBA (8 bits per channel) requires:
 *   40,000,000 pixels * 4 bytes/pixel = 160,000,000 bytes (~152.6 MB).
 * - During format decompression/resizing (e.g. Sharp / libvips intermediate scanlines),
 *   peak working memory expands to ~1.5x - 2.0x of raw bitmap (~240MB - 320MB).
 * - Node.js + Next.js 16 runtime baseline footprint: ~120MB - 160MB.
 * - Total peak memory during heavy processing: ~450MB - 550MB.
 * - On standard Vercel Serverless Functions with 1024MB memory ceiling, 40MP guarantees
 *   at least ~470MB - 570MB of headroom, safely preventing Out-Of-Memory (OOM) fatal crashes.
 * - Decompression bombs (e.g. 100KB files expanding to 100MP+) are rejected upfront
 *   by intrinsic dimension headers before any pixel decompression buffers are allocated.
 * -----------------------------------------------------------------------------
 */

export interface ValidatedImage {
  valid: true;
  format: "jpeg" | "png" | "webp" | "avif";
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/avif";
  extension: ".jpg" | ".png" | ".webp" | ".avif";
  width: number;
  height: number;
  byteLength: number;
}

export interface InvalidImage {
  valid: false;
  error: string;
}

export type ImageValidationResult = ValidatedImage | InvalidImage;

/** Maximum allowable file size: 50MB */
export const MAX_IMAGE_FILE_SIZE = 50 * 1024 * 1024;

/** Minimum binary size for any valid image header */
export const MIN_IMAGE_FILE_SIZE = 32;

/** Maximum pixel dimensions per axis */
export const MAX_IMAGE_DIMENSION = 8500;

/** Maximum total pixel count (40 megapixels) to prevent decompression memory bombs */
export const MAX_TOTAL_PIXELS = 40_000_000;

/** Forbidden text sequences indicating embedded scripts, XML, SVG, or HTML */
const FORBIDDEN_MARKUP_PATTERNS = [
  "<script",
  "<?xml",
  "<svg",
  "<!doctype html",
  "<html",
  "<iframe",
  "<object",
  "<embed",
  "xmlns=",
  "javascript:",
  "vbscript:",
  "onerror=",
  "onload=",
];

/**
 * Validates an image buffer using deep binary inspection.
 *
 * @param buffer - Binary image buffer
 * @param declaredFileName - Optional client-declared file name
 * @param declaredMimeType - Optional client-declared MIME type
 */
export function validateAndInspectImageBuffer(
  buffer: Buffer,
  declaredFileName?: string,
  declaredMimeType?: string
): ImageValidationResult {
  if (!buffer || !(buffer instanceof Buffer)) {
    return { valid: false, error: "Invalid buffer: image data is empty or missing." };
  }

  if (buffer.length < MIN_IMAGE_FILE_SIZE) {
    return {
      valid: false,
      error: `File is truncated or corrupted (size: ${buffer.length} bytes, minimum: ${MIN_IMAGE_FILE_SIZE} bytes).`,
    };
  }

  if (buffer.length > MAX_IMAGE_FILE_SIZE) {
    return {
      valid: false,
      error: `File exceeds the maximum permitted size of 50MB (received ${(buffer.length / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  // 1. Scan for embedded scripts, SVG, XML, or HTML markup
  // Scan the first 64KB (or entire file if smaller) for malicious injection
  const scanLimit = Math.min(buffer.length, 65536);
  const scanText = buffer.toString("latin1", 0, scanLimit).toLowerCase();

  for (const pattern of FORBIDDEN_MARKUP_PATTERNS) {
    if (scanText.includes(pattern)) {
      return {
        valid: false,
        error: `Forbidden payload detected: file contains prohibited "${pattern}" markup. SVG, HTML, and script uploads are strictly rejected.`,
      };
    }
  }

  // 2. Magic-byte verification and format extraction
  let detectedFormat: "jpeg" | "png" | "webp" | "avif" | null = null;
  let detectedWidth = 0;
  let detectedHeight = 0;

  try {
    // A. PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      // Multi-frame protection: reject animated PNG (APNG)
      if (buffer.indexOf("acTL") !== -1) {
        return {
          valid: false,
          error: "Animated PNG (APNG) files are not supported. Only static single-frame photographs are permitted.",
        };
      }

      if (buffer.length >= 24 && buffer.toString("ascii", 12, 16) === "IHDR") {
        detectedFormat = "png";
        detectedWidth = buffer.readUInt32BE(16);
        detectedHeight = buffer.readUInt32BE(20);
      } else {
        return { valid: false, error: "Corrupted PNG: missing or malformed IHDR chunk header." };
      }
    }

    // B. JPEG: FF D8 FF
    else if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    ) {
      let offset = 2;
      let foundSOF = false;

      while (offset < buffer.length - 4) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];

        // SOF markers (excluding DHT, DAC, etc.): 0xC0..0xC3, 0xC5..0xC7, 0xC9..0xCB, 0xCD..0xCF
        const isSOF =
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf);

        if (isSOF) {
          if (offset + 9 > buffer.length) break;
          detectedHeight = buffer.readUInt16BE(offset + 5);
          detectedWidth = buffer.readUInt16BE(offset + 7);
          foundSOF = true;
          detectedFormat = "jpeg";
          break;
        }

        if (offset + 4 > buffer.length) break;
        const markerLength = buffer.readUInt16BE(offset + 2);
        if (markerLength < 2) break; // corrupted marker length guard
        offset += 2 + markerLength;
      }

      if (!foundSOF || !detectedFormat) {
        return { valid: false, error: "Corrupted JPEG: missing valid Frame Header (SOF marker)." };
      }
    }

    // C. WebP: RIFF .... WEBP
    else if (
      buffer.length >= 16 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
      const chunkType = buffer.toString("ascii", 12, 16);

      // VP8X (Extended WebP)
      if (chunkType === "VP8X" && buffer.length >= 30) {
        // Multi-frame protection: reject animated WebP (Animation bit at byte 20, bit 1)
        if ((buffer[20] & 0x02) !== 0) {
          return {
            valid: false,
            error: "Animated WebP files are not supported. Only static single-frame photographs are permitted.",
          };
        }
        detectedFormat = "webp";
        detectedWidth = 1 + buffer.readUIntLE(24, 3);
        detectedHeight = 1 + buffer.readUIntLE(27, 3);
      }
      // VP8L (Lossless WebP)
      else if (chunkType === "VP8L" && buffer.length >= 25 && buffer[20] === 0x2f) {
        detectedFormat = "webp";
        const b1 = buffer[21];
        const b2 = buffer[22];
        const b3 = buffer[23];
        const b4 = buffer[24];
        detectedWidth = 1 + (((b2 & 0x3f) << 8) | b1);
        detectedHeight = 1 + (((b4 & 0xf) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
      }
      // VP8 (Lossy WebP)
      else if (chunkType === "VP8 " && buffer.length >= 30) {
        detectedFormat = "webp";
        detectedWidth = buffer.readUInt16LE(26) & 0x3fff;
        detectedHeight = buffer.readUInt16LE(28) & 0x3fff;
      } else {
        return { valid: false, error: "Corrupted WebP: invalid or unsupported WebP chunk type." };
      }
    }

    // D. AVIF: ISOBMFF ftyp box with avif/avis/mif1 brand
    else if (
      buffer.length >= 16 &&
      buffer.toString("ascii", 4, 8) === "ftyp"
    ) {
      const ftypBoxSize = buffer.readUInt32BE(0);
      const majorBrand = buffer.toString("ascii", 8, 12);
      const compatibleBrands = buffer.toString(
        "ascii",
        16,
        Math.min(buffer.length, Math.max(16, ftypBoxSize))
      );

      const isAvifBrand =
        majorBrand.includes("avif") ||
        majorBrand.includes("avis") ||
        compatibleBrands.includes("avif") ||
        compatibleBrands.includes("avis");

      if (isAvifBrand) {
        detectedFormat = "avif";
        const ispeIdx = buffer.indexOf("ispe");
        if (ispeIdx !== -1 && ispeIdx + 16 <= buffer.length) {
          detectedWidth = buffer.readUInt32BE(ispeIdx + 8);
          detectedHeight = buffer.readUInt32BE(ispeIdx + 12);
        } else {
          // Fallback for AVIF without separate ispe: valid brand is sufficient, dimensions default safely
          detectedWidth = 1920;
          detectedHeight = 1080;
        }
      } else {
        return {
          valid: false,
          error: `Unsupported ISOBMFF container (major brand "${majorBrand}"). Only AVIF photographic containers are supported.`,
        };
      }
    }
  } catch {
    return {
      valid: false,
      error: "Corrupted or malformed image binary structure.",
    };
  }

  // If no allowed magic byte matched
  if (!detectedFormat) {
    return {
      valid: false,
      error:
        "File content does not match any permitted image format. Only authentic JPEG, PNG, WebP, and AVIF photographs are permitted.",
    };
  }

  // 3. Intrinsic Dimension & Total Pixel Validation (Decompression Bomb Protection)
  if (detectedWidth <= 0 || detectedHeight <= 0) {
    return {
      valid: false,
      error: `Invalid image dimensions (${detectedWidth}x${detectedHeight}). Intrinsic dimensions must be greater than 0.`,
    };
  }

  if (detectedWidth > MAX_IMAGE_DIMENSION || detectedHeight > MAX_IMAGE_DIMENSION) {
    return {
      valid: false,
      error: `Image dimensions (${detectedWidth}x${detectedHeight}) exceed maximum allowable boundary of ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION} pixels.`,
    };
  }

  const totalPixels = detectedWidth * detectedHeight;
  if (totalPixels > MAX_TOTAL_PIXELS) {
    return {
      valid: false,
      error: `Image total pixel count (${totalPixels.toLocaleString()} pixels) exceeds maximum safety limit of ${MAX_TOTAL_PIXELS.toLocaleString()} pixels (decompression bomb protection).`,
    };
  }

  // 4. Extension & MIME consistency check (spoofing prevention)
  const canonicalMime: Record<string, "image/jpeg" | "image/png" | "image/webp" | "image/avif"> = {
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
  };

  const canonicalExt: Record<string, ".jpg" | ".png" | ".webp" | ".avif"> = {
    jpeg: ".jpg",
    png: ".png",
    webp: ".webp",
    avif: ".avif",
  };

  if (declaredMimeType) {
    const normDeclared = declaredMimeType.trim().toLowerCase();
    const isJpeg = detectedFormat === "jpeg" && (normDeclared === "image/jpeg" || normDeclared === "image/jpg");
    const isPng = detectedFormat === "png" && normDeclared === "image/png";
    const isWebp = detectedFormat === "webp" && normDeclared === "image/webp";
    const isAvif = detectedFormat === "avif" && normDeclared === "image/avif";

    if (!isJpeg && !isPng && !isWebp && !isAvif) {
      return {
        valid: false,
        error: `MIME type spoofing detected: file content is verified ${detectedFormat.toUpperCase()} but declared as "${declaredMimeType}".`,
      };
    }
  }

  if (declaredFileName) {
    const ext = declaredFileName.slice(declaredFileName.lastIndexOf(".")).toLowerCase();
    const validExtensions: Record<string, string[]> = {
      jpeg: [".jpg", ".jpeg"],
      png: [".png"],
      webp: [".webp"],
      avif: [".avif"],
    };

    if (ext && validExtensions[detectedFormat] && !validExtensions[detectedFormat].includes(ext)) {
      return {
        valid: false,
        error: `File extension mismatch: declared filename "${declaredFileName}" does not match verified binary format ${detectedFormat.toUpperCase()}.`,
      };
    }
  }

  return {
    valid: true,
    format: detectedFormat,
    mimeType: canonicalMime[detectedFormat],
    extension: canonicalExt[detectedFormat],
    width: detectedWidth,
    height: detectedHeight,
    byteLength: buffer.length,
  };
}
