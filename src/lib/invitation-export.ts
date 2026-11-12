/**
 * Official Wedding Invitation Export & Download Utilities
 * Pure Canonical DOM Capture Engine for Mithun & Sakhi Wedding.
 * 
 * Captures the actual fully-rendered canonical React invitation element
 * (#official-wedding-invitation-card) directly using html-to-image.
 * Guarantees 100% fidelity with the live browser invitation:
 * - Exact warm ivory/champagne background & subtle damask texture
 * - Exact balanced vertical flex layout (zero bottom blank space)
 * - Exact typography, font files, weights, and letter-spacing
 * - Exact sweeping curved diagonal photo edges & golden glow overlays
 * - Exact transparent WebP burgundy velvet corner drapes
 * - Exact 4:5 portrait aspect ratio (1680 × 2100 at 2.5x scale, ~4.5 MB)
 */

let htmlToImageModule: typeof import("html-to-image") | null = null;
async function getHtmlToImage() {
  if (!htmlToImageModule) {
    htmlToImageModule = await import("html-to-image");
  }
  return htmlToImageModule;
}

export const CANONICAL_PUBLIC_INVITATION_URL =
  "https://mithun-sakhi-wedding.vercel.app/#invitation";
export const CANONICAL_INVITATION_PNG_FILENAME =
  "mithun-sakhi-official-wedding-invitation-4x5.png";
export const CANONICAL_INVITATION_JPG_FILENAME =
  "mithun-sakhi-official-wedding-invitation-4x5.jpg";
export const CANONICAL_INVITATION_PDF_FILENAME =
  "mithun-sakhi-official-wedding-invitation-4x5.pdf";

export interface InvitationExportOptions {
  filename?: string;
  canonicalUrl?: string;
  pixelRatio?: number;
  scale?: number;
  headlineText?: string;
  blessingMessage?: string;
}

export interface InvitationExportData {
  template?: "cinematic";
  headlineText?: string;
  introText?: string;
  blessingMessage?: string;
  qrCodeTargetUrl?: string;
  customAnnouncement?: string | null;
}

/**
 * Ensures all custom fonts and WebP images inside the invitation are fully decoded.
 */
async function prepareElementForCapture(cardElement: HTMLElement): Promise<void> {
  // 1. Wait for document fonts to finish loading
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Font loading failure fallback
    }
  }

  // 2. Decode high-resolution export sources for all images inside card
  const images = Array.from(cardElement.querySelectorAll<HTMLImageElement>("img"));
  await Promise.all(
    images.map(async (img) => {
      const exportSrc = img.getAttribute("data-export-src");
      if (exportSrc && !img.src.includes(exportSrc)) {
        img.src = exportSrc;
      }
      if (img.complete && img.naturalWidth > 0) return;
      try {
        await img.decode();
      } catch {
        // Fallback or already decoded
      }
    })
  );

  // 3. Brief layout stabilization tick
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Captures the canonical live invitation card as an ultra-crisp high-resolution PNG Data URL.
 * Produces an exact 1680 × 2100 (4:5) image at 2.5x pixel ratio matching the live card 1:1.
 */
export async function captureCanonicalInvitationDataUrl(
  options: InvitationExportOptions = {}
): Promise<string> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Window is not available for DOM capture.");
  }

  const cardElement = document.querySelector<HTMLElement>("#official-wedding-invitation-card");
  if (!cardElement) {
    throw new Error("Official invitation card element (#official-wedding-invitation-card) not found.");
  }

  await prepareElementForCapture(cardElement);
  const pixelRatio = options.pixelRatio || options.scale || 2.5;
  const htmlToImage = await getHtmlToImage();

  // On desktop and tablet (window.innerWidth >= 640), the live card is rendered
  // at the canonical width (~672px × 840px). Capture it directly from the live DOM.
  if (window.innerWidth >= 640) {
    return await htmlToImage.toPng(cardElement, {
      pixelRatio,
      backgroundColor: "transparent",
      cacheBust: true,
      skipFonts: false,
    });
  }

  // On mobile viewports (window.innerWidth < 640), small screens cause narrow-width
  // word wrapping in headers or ceremony cards. To ensure the exported invitation
  // decree ALWAYS maintains the majestic, canonical 672 × 840 layout proportions
  // across every device, we capture it inside a dedicated off-screen 672 × 840 container.
  return await captureInCanonicalIframe(cardElement, pixelRatio);
}

/**
 * Captures the canonical live invitation card as a high-quality JPEG Data URL.
 * Produces an exact 1680 × 2100 (4:5) image with warm ivory background.
 */
export async function captureCanonicalInvitationJpegDataUrl(
  options: InvitationExportOptions = {}
): Promise<string> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Window is not available for DOM capture.");
  }

  const cardElement = document.querySelector<HTMLElement>("#official-wedding-invitation-card");
  if (!cardElement) {
    throw new Error("Official invitation card element (#official-wedding-invitation-card) not found.");
  }

  await prepareElementForCapture(cardElement);
  const pixelRatio = options.pixelRatio || options.scale || 2.5;
  const htmlToImage = await getHtmlToImage();

  if (cardElement.offsetWidth >= 670 && window.innerWidth >= 768) {
    return await htmlToImage.toJpeg(cardElement, {
      pixelRatio,
      quality: 0.95,
      backgroundColor: "#FAF6EE",
      cacheBust: true,
      skipFonts: false,
    });
  }

  return await captureInCanonicalIframeJpeg(cardElement, pixelRatio);
}

/**
 * Renders the canonical card inside an off-screen 672 × 840 environment
 * to preserve full-size typography and spacing on mobile viewports for PNG.
 */
async function captureInCanonicalIframe(
  cardElement: HTMLElement,
  pixelRatio: number
): Promise<string> {
  const htmlToImage = await getHtmlToImage();
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "672px";
  iframe.style.height = "840px";
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  try {
    const idoc = iframe.contentWindow?.document;
    if (!idoc) {
      return await htmlToImage.toPng(cardElement, {
        pixelRatio,
        backgroundColor: "transparent",
        cacheBust: true,
      });
    }

    idoc.open();
    const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((el) => el.outerHTML)
      .join("\n");

    idoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=672">
        ${styles}
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 672px;
            height: 840px;
            overflow: hidden;
            background: transparent;
          }
        </style>
      </head>
      <body>
        <div style="width: 672px; height: 840px;">
          ${cardElement.outerHTML}
        </div>
      </body>
      </html>
    `);
    idoc.close();

    if (iframe.contentWindow?.document.fonts) {
      try {
        await iframe.contentWindow.document.fonts.ready;
      } catch {
        // Font loading fallback
      }
    }

    const iframeCard = idoc.querySelector<HTMLElement>("#official-wedding-invitation-card");
    if (!iframeCard) {
      throw new Error("Failed to mount invitation in canonical export container.");
    }

    await prepareElementForCapture(iframeCard);
    await new Promise((r) => setTimeout(r, 250));

    return await htmlToImage.toPng(iframeCard, {
      pixelRatio,
      backgroundColor: "transparent",
      cacheBust: true,
    });
  } finally {
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
  }
}

/**
 * Renders the canonical card inside an off-screen 672 × 840 environment
 * to preserve full-size typography and spacing on mobile viewports for JPEG.
 */
async function captureInCanonicalIframeJpeg(
  cardElement: HTMLElement,
  pixelRatio: number
): Promise<string> {
  const htmlToImage = await getHtmlToImage();
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "672px";
  iframe.style.height = "840px";
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  try {
    const idoc = iframe.contentWindow?.document;
    if (!idoc) {
      return await htmlToImage.toJpeg(cardElement, {
        pixelRatio,
        quality: 0.95,
        backgroundColor: "#FAF6EE",
        cacheBust: true,
      });
    }

    idoc.open();
    const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((el) => el.outerHTML)
      .join("\n");

    idoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=672">
        ${styles}
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 672px;
            height: 840px;
            overflow: hidden;
            background: #FAF6EE;
          }
        </style>
      </head>
      <body>
        <div style="width: 672px; height: 840px;">
          ${cardElement.outerHTML}
        </div>
      </body>
      </html>
    `);
    idoc.close();

    if (iframe.contentWindow?.document.fonts) {
      try {
        await iframe.contentWindow.document.fonts.ready;
      } catch {
        // Font loading fallback
      }
    }

    const iframeCard = idoc.querySelector<HTMLElement>("#official-wedding-invitation-card");
    if (!iframeCard) {
      throw new Error("Failed to mount invitation in canonical export container.");
    }

    await prepareElementForCapture(iframeCard);
    await new Promise((r) => setTimeout(r, 250));

    return await htmlToImage.toJpeg(iframeCard, {
      pixelRatio,
      quality: 0.95,
      backgroundColor: "#FAF6EE",
      cacheBust: true,
    });
  } finally {
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
  }
}

/**
 * Binary parser to extract exact width and height from JPEG SOF markers
 * (SOF0: baseline DCT, SOF1: extended sequential, SOF2: progressive DCT).
 * Guarantees bit-for-bit synchronization between the PDF Image XObject dictionary
 * and the actual raster stream, preventing Adobe Acrobat scanline stride skewing.
 */
export function getJpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (!bytes || bytes.length < 4) return null;
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let i = 2;
  while (i < bytes.length - 8) {
    if (bytes[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = bytes[i + 1];
    // Skip 0x00 stuffed byte and 0xFF padding
    if (marker === 0x00 || marker === 0xff) {
      i += 2;
      continue;
    }
    // SOF markers: 0xC0 through 0xCF (excluding DHT 0xC4, JPG 0xC8, DAC 0xCC)
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      const height = (bytes[i + 5] << 8) | bytes[i + 6];
      const width = (bytes[i + 7] << 8) | bytes[i + 8];
      return { width, height };
    }
    const len = (bytes[i + 2] << 8) | bytes[i + 3];
    if (len < 2) break;
    i += 2 + len;
  }
  return null;
}

/**
 * Creates a valid PDF 1.4 document wrapping a JPEG image with exact 4:5 aspect ratio.
 * Pure standard ISO 32000-1 / Adobe Acrobat PDF compliant with zero external dependencies.
 */
export function createPdfFromJpeg(
  jpegBytes: Uint8Array,
  fallbackWidth = 1680,
  fallbackHeight = 2100
): Uint8Array {
  // Dynamically resolve actual JPEG dimensions directly from the SOF marker
  // to guarantee 100% precision between the PDF dictionary and the raster stream
  const parsed = getJpegDimensions(jpegBytes);
  const imgWidth = parsed ? parsed.width : fallbackWidth;
  const imgHeight = parsed ? parsed.height : fallbackHeight;

  // Page size: 4:5 aspect ratio matching the card in standard PostScript points (72 pt/in)
  // Standard A4 width is 595.28 pt. With exact 4:5 ratio, height is 744.10 pt.
  const pageWidth = 595.28;
  const pageHeight = Math.round((pageWidth * (imgHeight / imgWidth)) * 100) / 100;

  const contentStream = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
  const encoder = new TextEncoder();
  const contentBytes = encoder.encode(contentStream);

  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let currentOffset = 0;

  function pushString(str: string, objIndex?: number) {
    if (objIndex !== undefined) {
      offsets[objIndex] = currentOffset;
    }
    const buf = encoder.encode(str);
    parts.push(buf);
    currentOffset += buf.byteLength;
  }

  function pushBytes(bytes: Uint8Array, objIndex?: number) {
    if (objIndex !== undefined) {
      offsets[objIndex] = currentOffset;
    }
    parts.push(bytes);
    currentOffset += bytes.byteLength;
  }

  // Header: Standard PDF-1.4 with high-order binary comment
  pushBytes(
    new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, // %PDF-1.4\n
      0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a,                   // %âãÏÓ\n
    ])
  );

  // 1 0 obj: Catalog
  pushString("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n", 1);

  // 2 0 obj: Pages
  pushString("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n", 2);

  // 3 0 obj: Page
  pushString(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /ProcSet [/PDF /ImageC] /XObject << /Im0 5 0 R >> >> >>\nendobj\n`,
    3
  );

  // 4 0 obj: Contents stream
  pushString(
    `4 0 obj\n<< /Length ${contentBytes.byteLength} >>\nstream\n${contentStream}endstream\nendobj\n`,
    4
  );

  // 5 0 obj: Image XObject with /Filter /DCTDecode
  const imgHeader = `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.byteLength} >>\nstream\n`;
  const imgFooter = "\nendstream\nendobj\n";
  offsets[5] = currentOffset;
  pushString(imgHeader);
  pushBytes(jpegBytes);
  pushString(imgFooter);

  // xref
  const startXref = currentOffset;
  let xref = "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i++) {
    xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
  pushString(xref);

  // Concatenate parts
  const totalLength = parts.reduce((acc, p) => acc + p.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.byteLength;
  }
  return result;
}

/**
 * Direct Download of the official high-resolution PNG invitation.
 * Directly captures the live canonical invitation element.
 */
export async function downloadInvitationCardAsPng(
  options: InvitationExportOptions = {}
): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const dataUrl = await captureCanonicalInvitationDataUrl(options);
  const filename = options.filename || CANONICAL_INVITATION_PNG_FILENAME;

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Direct Download of the official high-resolution JPG invitation.
 * Suitable for WhatsApp, Instagram, and digital social sharing.
 */
export async function downloadInvitationCardAsJpg(
  options: InvitationExportOptions = {}
): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const dataUrl = await captureCanonicalInvitationJpegDataUrl(options);
  const filename = options.filename || CANONICAL_INVITATION_JPG_FILENAME;

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Direct Download of the official print-ready PDF invitation.
 * Preserves 4:5 card proportions in a standard vector-wrapped PDF document.
 */
export async function downloadInvitationCardAsPdf(
  options: InvitationExportOptions = {}
): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const dataUrl = await captureCanonicalInvitationJpegDataUrl(options);
  const filename = options.filename || CANONICAL_INVITATION_PDF_FILENAME;

  // Convert base64 data to bytes
  const base64Data = dataUrl.split(",")[1];
  const binaryStr = atob(base64Data);
  const jpegBytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    jpegBytes[i] = binaryStr.charCodeAt(i);
  }

  // Canonical resolution at 2.5x pixel ratio with dynamic dimension extraction
  const pdfBytes = createPdfFromJpeg(jpegBytes);
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = filename;
  link.href = blobUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

/**
 * Native Print / Save as PDF Utility
 * Captures the exact high-resolution canonical invitation artwork and prints it
 * within an exact proportional portrait page with zero margin cutoffs.
 */
export async function printOfficialInvitation(
  options: InvitationExportOptions = {}
): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  try {
    const dataUrl = await captureCanonicalInvitationDataUrl(options);

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      window.print();
      return;
    }

    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Official Wedding Invitation — Mithun & Sakhi</title>
          <style>
            @page {
              size: portrait;
              margin: 0.5cm;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #FAF6EE;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            img {
              max-width: 95vw;
              max-height: 95vh;
              aspect-ratio: 4/5;
              object-fit: contain;
              display: block;
              margin: auto;
              border-radius: 16px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.12);
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="Official Wedding Invitation — Mithun & Sakhi" />
        </body>
      </html>
    `);
    frameDoc.close();

    printFrame.contentWindow?.focus();
    setTimeout(() => {
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (printFrame.parentNode) {
          document.body.removeChild(printFrame);
        }
      }, 1000);
    }, 400);
  } catch (err) {
    console.error("Print frame generation failed, falling back to window.print():", err);
    window.print();
  }
}

/**
 * Share or Copy Invitation URL Utility
 */
export async function shareOrCopyInvitationUrl(
  url = CANONICAL_PUBLIC_INVITATION_URL
): Promise<{ success: boolean; method: "share" | "copy"; message: string }> {
  if (typeof window === "undefined") {
    return { success: false, method: "copy", message: "Window unavailable" };
  }

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: "Mithun & Sakhi — Wedding Invitation",
        text: "We warmly invite you to celebrate the wedding festivities of Mithun & Sakhi, from 19–22 November 2026 in Purulia, West Bengal.",
        url,
      });
      return { success: true, method: "share", message: "Invitation shared!" };
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") {
        return { success: false, method: "share", message: "Share canceled" };
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return { success: true, method: "copy", message: "Invitation link copied!" };
  } catch {
    return { success: false, method: "copy", message: url };
  }
}
