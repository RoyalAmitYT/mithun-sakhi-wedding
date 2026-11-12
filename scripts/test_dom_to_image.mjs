import { chromium } from "playwright";

async function testDomCapture() {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/#invitation", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Test native in-browser foreignObject rasterization
  const result = await page.evaluate(async () => {
    const card = document.getElementById("official-wedding-invitation-card");
    if (!card) return { error: "Card not found" };

    // Clone the card
    const clone = card.cloneNode(true);
    
    // Inline all computed styles
    function copyComputedStyles(src, dest) {
      const srcStyle = window.getComputedStyle(src);
      let cssText = "";
      for (let i = 0; i < srcStyle.length; i++) {
        const prop = srcStyle[i];
        cssText += `${prop}:${srcStyle.getPropertyValue(prop)};`;
      }
      dest.setAttribute("style", cssText);

      for (let i = 0; i < src.children.length; i++) {
        if (dest.children[i]) {
          copyComputedStyles(src.children[i], dest.children[i]);
        }
      }
    }
    copyComputedStyles(card, clone);

    // Convert images in clone to data URLs
    const images = Array.from(clone.querySelectorAll("img"));
    for (const img of images) {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth || 400;
        c.height = img.naturalHeight || 300;
        const ctx = c.getContext("2d");
        const realImg = document.querySelector(`img[src="${img.getAttribute("src")}"]`);
        if (realImg) {
          ctx.drawImage(realImg, 0, 0);
          img.src = c.toDataURL("image/webp");
        }
      } catch (e) {
        console.error("image inlining error", e);
      }
    }

    const rect = card.getBoundingClientRect();
    const width = 1200;
    const height = 1500;

    // Create SVG foreignObject
    const serializer = new XMLSerializer();
    const htmlString = serializer.serializeToString(clone);
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${rect.width} ${rect.height}">
        <foreignObject width="100%" height="100%">
          ${htmlString}
        </foreignObject>
      </svg>
    `;

    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width * 2;
        canvas.height = height * 2;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        try {
          const dataUrl = canvas.toDataURL("image/png");
          resolve({ success: true, length: dataUrl.length, slice: dataUrl.slice(0, 50) });
        } catch (err) {
          resolve({ error: err.toString() });
        }
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        resolve({ error: "Image load error" });
      };
      img.src = url;
    });
  });

  console.log("Result:", result);
  await browser.close();
}

testDomCapture();
