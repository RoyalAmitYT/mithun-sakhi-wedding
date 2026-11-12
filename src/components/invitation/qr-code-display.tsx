"use client";

import React, { useMemo } from "react";
import { generateQrSvg } from "@/lib/qr-code";

interface QrCodeDisplayProps {
  url: string;
  size?: number;
  label?: string;
  className?: string;
}

export function QrCodeDisplay({
  url,
  size = 140,
  label = "Scan for Ceremony Details & Updates",
  className = "",
}: QrCodeDisplayProps) {
  const svgMarkup = useMemo(() => {
    return generateQrSvg(url, {
      size,
      fgColor: "#292322",
      bgColor: "transparent",
      margin: 1,
    });
  }, [url, size]);

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div
        className="p-2.5 bg-white rounded-lg border border-[rgba(184,151,94,0.3)] shadow-xs transition-transform hover:scale-105 duration-200"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
        aria-label={`QR Code linking to ${url}`}
        role="img"
      />
      {label && (
        <span className="text-[11px] font-sans text-[#8A8280] mt-2 max-w-[160px] leading-tight">
          {label}
        </span>
      )}
    </div>
  );
}
