"use client";

import React, { useMemo } from "react";
import { generateQrSvg } from "@/lib/qr-code";

export interface OfficialWeddingInvitationProps {
  id?: string;
  variant?: "full" | "preview";
  className?: string;
  canonicalUrl?: string;
  headlineText?: string;
  blessingMessage?: string;
  introText?: string;
}

export function OfficialWeddingInvitation({
  id = "official-wedding-invitation-card",
  variant = "full",
  className = "",
  canonicalUrl = "https://mithun-sakhi-wedding.vercel.app/#invitation",
  headlineText = "WITH THE DIVINE BLESSINGS OF OUR FAMILIES",
  blessingMessage: rawBlessingMessage,
  introText,
}: OfficialWeddingInvitationProps) {
  const customMessage = rawBlessingMessage || introText;
  const isPreview = variant === "preview";

  const qrSvgMarkup = useMemo(() => {
    return generateQrSvg(canonicalUrl, {
      size: 130,
      fgColor: "#292322",
      bgColor: "#FFFFFF",
      margin: 1,
    });
  }, [canonicalUrl]);

  return (
    <article
      id={id}
      data-testid="official-wedding-invitation-card"
      aria-label="Official Digital Wedding Invitation — Mithun Gorain and Sakhi Gorain"
      className={`
        relative mx-auto select-text overflow-hidden
        aspect-[4/5] w-full
        ${isPreview ? "max-w-[620px] sm:max-w-[680px] md:max-w-[730px]" : "max-w-[640px] sm:max-w-[700px] md:max-w-[750px]"}
        bg-gradient-to-b from-[#FAF6EE] via-[#F8F3E6] to-[#F4ECE0]
        border border-[rgba(184,151,94,0.45)]
        text-[#292322] transition-all duration-300
        rounded-2xl sm:rounded-3xl
        shadow-[0_25px_60px_-15px_rgba(45,15,20,0.20),0_0_0_1px_rgba(255,255,255,0.85)_inset]
        p-2 xs:p-2.5 sm:p-3.5 md:p-4
        flex flex-col justify-between
        print:shadow-none print:m-auto
        ${className}
      `}
    >
      {/* Invisible global SVG defs for reusable clipping paths and glow filters */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Sweeping Curved Diagonal Crescent clip-path: 38% at top sweeping down-left to 17% at bottom */}
          <clipPath id="ceremony-crescent-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0 0 L 0.38 0 C 0.32 0.35, 0.23 0.70, 0.17 1 L 0 1 Z" />
          </clipPath>
          <filter id="ceremony-gold-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* =================================================================== */}
      {/* 1. BACKGROUND TEXTURE, GLOW & ARCHITECTURAL FRAMING                 */}
      {/* =================================================================== */}

      {/* Inset Precision-Metered Outer Gallery Frame */}
      <div
        className="absolute inset-2 sm:inset-3 rounded-xl sm:rounded-2xl border border-[rgba(184,151,94,0.4)] pointer-events-none z-0"
        aria-hidden="true"
      />
      {/* Inset Precision-Metered Inner Hairline Frame */}
      <div
        className="absolute inset-[11px] sm:inset-[16px] rounded-lg sm:rounded-xl border border-[rgba(184,151,94,0.22)] pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Subtle Botanical Damask Watermark Pattern (Pure Inline SVG) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] mix-blend-multiply z-0"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <defs>
          <pattern id="cinematic-luxury-damask" width="64" height="64" patternUnits="userSpaceOnUse">
            <path
              d="M32 6 C22 18, 14 24, 6 32 C14 40, 22 46, 32 58 C42 46, 50 40, 58 32 C50 24, 42 18, 32 6 Z"
              fill="none"
              stroke="#B8975E"
              strokeWidth="0.8"
            />
            <circle cx="32" cy="32" r="3.5" fill="#B8975E" />
            <path d="M0 0 L16 16 M64 0 L48 16 M0 64 L16 48 M64 64 L48 48" stroke="#B8975E" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cinematic-luxury-damask)" />
      </svg>

      {/* Ambient Center Illumination Glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,255,255,0.95)_0%,rgba(250,246,238,0.6)_55%,transparent_85%)]"
        aria-hidden="true"
      />

      {/* Architectural Corner L-Brackets (Top-Right & Bottom-Left) */}
      <div className="absolute top-3.5 right-3.5 sm:top-4.5 sm:right-4.5 w-4 h-4 pointer-events-none z-10" aria-hidden="true">
        <span className="absolute top-0 right-0 w-4 h-[1.5px] bg-[#B8975E]/85" />
        <span className="absolute top-0 right-0 h-4 w-[1.5px] bg-[#B8975E]/85" />
        <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-[#B8975E]/60" />
      </div>
      <div className="absolute bottom-3.5 left-3.5 sm:bottom-4.5 sm:left-4.5 w-4 h-4 pointer-events-none z-10" aria-hidden="true">
        <span className="absolute bottom-0 left-0 w-4 h-[1.5px] bg-[#B8975E]/85" />
        <span className="absolute bottom-0 left-0 h-4 w-[1.5px] bg-[#B8975E]/85" />
        <span className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-[#B8975E]/60" />
      </div>

      {/* Delicate Faint Gold Leaf Branch Flourishes at Outer Lower-Left Margin */}
      <div className="absolute bottom-5 left-5 w-20 h-20 pointer-events-none z-0 opacity-25 text-[#B8975E]" aria-hidden="true">
        <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M4 56 C14 42, 28 32, 48 20" />
          <path d="M16 46 C18 42, 24 40, 26 44 C24 48, 18 48, 16 46 Z" fill="currentColor" opacity="0.6" />
          <path d="M26 38 C30 34, 36 34, 38 38 C34 42, 28 40, 26 38 Z" fill="currentColor" opacity="0.6" />
          <path d="M38 28 C42 24, 48 26, 48 30 C44 32, 40 30, 38 28 Z" fill="currentColor" opacity="0.6" />
        </svg>
      </div>

      {/* =================================================================== */}
      {/* 2. REAL TRANSPARENT WEBP BURGUNDY FABRIC CORNER OVERLAYS            */}
      {/* =================================================================== */}

      {/* Upper-Left Burgundy Fabric Corner Overlay (Real Transparent WebP) */}
      <div className="absolute top-0 left-0 w-[29.3%] aspect-[1032/851] pointer-events-none z-20 select-none overflow-hidden rounded-tl-2xl sm:rounded-tl-3xl drop-shadow-[2px_3px_10px_rgba(30,4,8,0.45)]">
        <img
          src="/images/invitationcard-topleft-display.webp"
          data-export-src="/images/invitationcard-topleftcorner-overlay.webp"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain object-top-left"
          loading="lazy"
        />
      </div>

      {/* Lower-Right Burgundy Fabric Corner Overlay (Real Transparent WebP) */}
      <div className="absolute bottom-0 right-0 w-[34.4%] aspect-[1100/733] pointer-events-none z-20 select-none overflow-hidden rounded-br-2xl sm:rounded-br-3xl drop-shadow-[-2px_-3px_10px_rgba(30,4,8,0.45)]">
        <img
          src="/images/invitationcard-bottomright-display.webp"
          data-export-src="/images/invitationcard-bottomrightcorner-overlay.webp"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain object-bottom-right"
          loading="lazy"
        />
      </div>

      {/* =================================================================== */}
      {/* 3. TOP HEADER BAR: M&S MONOGRAM, TITLE & PURULIA METADATA           */}
      {/* =================================================================== */}
      <div className="relative z-10 w-full pt-0.5 sm:pt-1">
        <header className="flex items-center justify-between pb-1 sm:pb-1.5 pl-[29%] pr-1 sm:pr-2">
          {/* Left: Navbar Brand Seal Logo & Title */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="flex items-center justify-center w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-[3px] border border-[rgba(184,151,94,0.4)] bg-white/80 text-[#B8975E] shadow-xs shrink-0">
              <span className="font-serif text-[10px] xs:text-xs sm:text-sm font-semibold tracking-tighter">
                M·S
              </span>
            </span>
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.24em] text-[#6B111E]">
              Wedding Invitation
            </span>
          </div>

          {/* Right: Location & Year Metadata */}
          <div className="flex items-center gap-1.5 text-[7px] xs:text-[8px] sm:text-[9.5px] font-sans font-semibold uppercase tracking-[0.2em] text-[#7A6250]">
            <span>Purulia, WB</span>
            <span className="text-[#B8975E]/60">&bull;</span>
            <span>2026</span>
          </div>
        </header>

        {/* Separator Hairline with Centered 5-Petal Gold Lotus Crest */}
        <div className="relative flex items-center justify-center my-0.5 sm:my-1 select-none" aria-hidden="true">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#B8975E]/45 to-transparent" />
          <div className="absolute bg-[#FAF6EE] px-2.5">
            <svg width="24" height="13" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0 C10 5, 8 9, 12 13 C16 9, 14 5, 12 0 Z" fill="#B8975E" />
              <path d="M7 4 C6 7, 7 10, 11 13 C9 10, 8 7, 7 4 Z" fill="#B8975E" opacity="0.8" />
              <path d="M17 4 C18 7, 17 10, 13 13 C15 10, 16 7, 17 4 Z" fill="#B8975E" opacity="0.8" />
              <path d="M3 8 C3 11, 6 12, 10 13 C7 12, 5 10, 3 8 Z" fill="#B8975E" opacity="0.6" />
              <path d="M21 8 C21 11, 18 12, 14 13 C17 12, 19 10, 21 8 Z" fill="#B8975E" opacity="0.6" />
            </svg>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. DIVINE BLESSING & COUPLE BRANDING (MITHUN & SAKHI)               */}
      {/* =================================================================== */}
      <div className="relative z-10 text-center my-0.5 sm:my-1">
        {/* Eyebrow Kicker with Gold Star Diamonds */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-0.5">
          <span className="text-[7.5px] sm:text-[9.5px] text-[#B8975E] select-none" aria-hidden="true">✦ ✦</span>
          <span className="text-[7.5px] xs:text-[8.5px] sm:text-[10.5px] md:text-[11.5px] font-sans font-bold uppercase tracking-[0.26em] text-[#6B111E]">
            {headlineText}
          </span>
          <span className="text-[7.5px] sm:text-[9.5px] text-[#B8975E] select-none" aria-hidden="true">✦ ✦</span>
        </div>

        {/* Main Couple Branding — Dominant Luxury Display Typography (Increased Prominence) */}
        <h1 className="font-serif text-[40px] xs:text-[48px] sm:text-[66px] md:text-[76px] font-normal text-[#42070D] tracking-tight leading-none my-0.5 drop-shadow-[0_2px_4px_rgba(66,7,13,0.12)]">
          <span className="inline-block">Mithun</span>
          <span className="font-light italic text-[#B8975E] text-[32px] xs:text-[40px] sm:text-[56px] md:text-[64px] mx-2 sm:mx-3 align-baseline">
            &amp;
          </span>
          <span className="inline-block">Sakhi</span>
        </h1>

        {/* Divider A: Symmetrical Gold Hairline with Refined 3-Petal Lotus Crest & Calligraphic Scrolls */}
        <div className="flex items-center justify-center my-0.5 sm:my-1 select-none text-[#B8975E]" aria-hidden="true">
          <div className="w-16 xs:w-24 sm:w-36 h-[1px] bg-gradient-to-r from-transparent to-[#B8975E]/70" />
          <svg width="68" height="22" viewBox="0 0 68 22" fill="none" className="mx-2 shrink-0">
            <path d="M34 2 C32 6, 31 11, 34 15 C37 11, 36 6, 34 2 Z" fill="#B8975E" />
            <path d="M32.5 7 C28.5 8, 25.5 11, 24.5 14 C28 15, 30.5 13, 32.5 7 Z" fill="#B8975E" opacity="0.9" />
            <path d="M35.5 7 C39.5 8, 42.5 11, 43.5 14 C40 15, 37.5 13, 35.5 7 Z" fill="#B8975E" opacity="0.9" />
            <path d="M34 15 C29 17.5, 21 17.5, 16 12 C11 6.5, 5 11, 0 14" stroke="#B8975E" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M34 15 C39 17.5, 47 17.5, 52 12 C57 6.5, 63 11, 68 14" stroke="#B8975E" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <circle cx="34" cy="15.5" r="1.2" fill="#B8975E" />
          </svg>
          <div className="w-16 xs:w-24 sm:w-36 h-[1px] bg-gradient-to-l from-transparent to-[#B8975E]/70" />
        </div>

        {/* Prominent Central Invitation Message (Exactly Two Lines with explicit <br /> and +25% size) */}
        <div className="relative px-2 sm:px-4 my-0.5 sm:my-1 max-w-[560px] sm:max-w-[620px] mx-auto text-center">
          <p className="font-serif italic text-[14.5px] xs:text-[16.5px] sm:text-[20px] md:text-[22px] text-[#38060E] leading-[1.36] sm:leading-[1.40] select-text font-normal px-2">
            {customMessage ? (
              customMessage.includes("\n") ? (
                customMessage.split("\n").map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))
              ) : (
                customMessage
              )
            ) : (
              <>
                With joyful hearts, we invite you to celebrate our sacred union<br />
                and bless the beautiful beginning of our life together.
              </>
            )}
          </p>
        </div>

        {/* Divider B: Symmetrical Gold Hairline with Refined 4-Point Star Diamond & Accent Diamonds */}
        <div className="flex items-center justify-center my-0.5 sm:my-1 select-none text-[#B8975E]" aria-hidden="true">
          <div className="w-20 xs:w-28 sm:w-44 h-[1px] bg-gradient-to-r from-transparent to-[#B8975E]/70" />
          <svg width="48" height="18" viewBox="0 0 48 18" fill="none" className="mx-2 shrink-0">
            <path d="M24 1 L28.5 9 L24 17 L19.5 9 Z" stroke="#B8975E" strokeWidth="1.2" fill="none" />
            <path d="M24 4 L26.5 9 L24 14 L21.5 9 Z" fill="#B8975E" />
            <path d="M10 9 L12.5 6.5 L15 9 L12.5 11.5 Z" stroke="#B8975E" strokeWidth="1" fill="none" />
            <path d="M33 9 L35.5 6.5 L38 9 L35.5 11.5 Z" stroke="#B8975E" strokeWidth="1" fill="none" />
          </svg>
          <div className="w-20 xs:w-28 sm:w-44 h-[1px] bg-gradient-to-l from-transparent to-[#B8975E]/70" />
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5. PARENTS' INFORMATION PANEL (ORNATE ARCHITECTURAL PLAQUE)         */}
      {/* =================================================================== */}
      <div className="relative z-10 my-0.5 sm:my-1 px-1 sm:px-2">
        <div className="relative rounded-2xl border border-[#B8975E]/50 bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EB]/95 to-[#FFFDF9] shadow-[0_4px_16px_rgba(184,151,94,0.12)] py-1.5 sm:py-2 px-3 sm:px-5">
          {/* Inner hairline border */}
          <div className="absolute inset-[3px] rounded-xl border border-[#B8975E]/20 pointer-events-none" />

          {/* Left Decorative Botanical Laurel Sprig SVG */}
          <div className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 pointer-events-none select-none text-[#B8975E]" aria-hidden="true">
            <svg width="18" height="36" viewBox="0 0 18 36" fill="currentColor">
              <path d="M9 0 C7 6, 2 11, 0 18 C5 16, 8 11, 9 0 Z" />
              <path d="M9 9 C11 14, 16 16, 18 21 C13 21, 10 16, 9 9 Z" />
              <path d="M9 18 C7 23, 2 27, 0 32 C5 30, 8 25, 9 18 Z" />
              <path d="M9 25 C11 30, 16 32, 18 36 C13 36, 10 32, 9 25 Z" />
              <line x1="9" y1="0" x2="9" y2="36" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>

          {/* Right Decorative Botanical Laurel Sprig SVG */}
          <div className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 pointer-events-none select-none text-[#B8975E] scale-x-[-1]" aria-hidden="true">
            <svg width="18" height="36" viewBox="0 0 18 36" fill="currentColor">
              <path d="M9 0 C7 6, 2 11, 0 18 C5 16, 8 11, 9 0 Z" />
              <path d="M9 9 C11 14, 16 16, 18 21 C13 21, 10 16, 9 9 Z" />
              <path d="M9 18 C7 23, 2 27, 0 32 C5 30, 8 25, 9 18 Z" />
              <path d="M9 25 C11 30, 16 32, 18 36 C13 36, 10 32, 9 25 Z" />
              <line x1="9" y1="0" x2="9" y2="36" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>

          {/* Interior Two Balanced Columns */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center gap-2 sm:gap-4 relative z-10">
            {/* Groom's Parents */}
            <div>
              <span className="text-[8px] xs:text-[9px] sm:text-[10.5px] md:text-[11.5px] font-sans font-extrabold uppercase tracking-[0.22em] text-[#6B111E] block mb-0.5 sm:mb-1">
                ✦ GROOM&apos;S PARENTS ✦
              </span>
              <p className="font-serif text-[12px] xs:text-[13px] sm:text-[16px] md:text-[17.5px] text-[#1A1110] font-bold leading-tight tracking-[0.025em]">
                Mr. Kenaram Gorain<br />
                <span className="font-medium text-[#8F6C34] text-[10px] xs:text-[11px] sm:text-[14px] md:text-[15px] font-serif italic">&amp;</span> Ms. Savita Gorian
              </p>
            </div>

            {/* Center Vertical Divider with Rotated Gold Diamond */}
            <div className="flex flex-col items-center justify-center select-none px-1" aria-hidden="true">
              <span className="w-[1px] h-4 sm:h-6 bg-[#B8975E]/70" />
              <span className="w-2.5 h-2.5 rotate-45 border border-[#B8975E] bg-[#FFFDF9] my-0.5 shadow-2xs" />
              <span className="w-[1px] h-4 sm:h-6 bg-[#B8975E]/70" />
            </div>

            {/* Bride's Parents */}
            <div>
              <span className="text-[8px] xs:text-[9px] sm:text-[10.5px] md:text-[11.5px] font-sans font-extrabold uppercase tracking-[0.22em] text-[#6B111E] block mb-0.5 sm:mb-1">
                ✦ BRIDE&apos;S PARENTS ✦
              </span>
              <p className="font-serif text-[12px] xs:text-[13px] sm:text-[16px] md:text-[17.5px] text-[#1A1110] font-bold leading-tight tracking-[0.025em]">
                Mr. Upen Gorain<br />
                <span className="font-medium text-[#8F6C34] text-[10px] xs:text-[11px] sm:text-[14px] md:text-[15px] font-serif italic">&amp;</span> Ms. Kokila Gorain
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 6. WEDDING DATE & LOCATION PLAQUE                                  */}
      {/* =================================================================== */}
      <div className="relative z-10 text-center my-0 sm:my-0.5">
        <div className="inline-flex items-center gap-2 sm:gap-3">
          <span className="w-10 sm:w-20 h-[1.5px] bg-gradient-to-r from-transparent to-[#B8975E]" aria-hidden="true" />
          <span className="font-serif text-[14px] xs:text-[16px] sm:text-[20px] md:text-[23px] font-bold tracking-[0.24em] text-[#4A0A10]">
            19 – 22 NOVEMBER 2026
          </span>
          <span className="w-10 sm:w-20 h-[1.5px] bg-gradient-to-l from-transparent to-[#B8975E]" aria-hidden="true" />
        </div>
        <span className="text-[8.5px] xs:text-[10px] sm:text-[12px] md:text-[13px] font-sans font-bold tracking-[0.28em] uppercase text-[#5A4232] block mt-0.5">
          PURULIA, WEST BENGAL
        </span>
      </div>

      {/* =================================================================== */}
      {/* 7. FOUR PHOTOGRAPHIC CEREMONY CARDS (SWEEPING CURVED DIAGONAL EDGE) */}
      {/* =================================================================== */}
      <div className="relative z-10 my-0.5">
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">

          {/* CARD 1: HALDI CEREMONY */}
          <div className="relative flex rounded-xl sm:rounded-2xl border border-[#E5C788]/80 overflow-hidden shadow-xs bg-gradient-to-r from-[#FFFDF7] via-[#FFFBF2] to-[#FFF8E7] min-h-[58px] xs:min-h-[66px] sm:min-h-[78px] md:min-h-[84px]">
            {/* Photographic Area with Sweeping Curved Diagonal Crescent Clip */}
            <div
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              style={{ clipPath: "url(#ceremony-crescent-clip)" }}
            >
              <img
                src="/images/invitationcard-haldi-display.webp"
                data-export-src="/images/invitationcard-haldi-image.webp"
                alt="Haldi Ceremony"
                className="w-[50%] h-full object-cover object-center"
                loading="lazy"
              />
            </div>

            {/* Sweeping Curved Diagonal Golden Glowing Edge Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Layer 1: Soft Warm Golden Outer Glow Aura */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="rgba(218, 175, 85, 0.45)"
                strokeWidth="4.5"
                filter="url(#ceremony-gold-glow)"
                vectorEffect="non-scaling-stroke"
              />
              {/* Layer 2: Antique Gold Core Line */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="#C59B4B"
                strokeWidth="2.2"
                vectorEffect="non-scaling-stroke"
              />
              {/* Layer 3: Luminous Golden Highlight */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="#FFE9A3"
                strokeWidth="1.0"
                opacity="0.92"
                vectorEffect="non-scaling-stroke"
              />
              {/* Layer 4: Specular Core Highlight */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="#FFFDF5"
                strokeWidth="0.5"
                opacity="0.8"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Turmeric-Gold Rich Mandala & Botanical Background Texture */}
            <svg
              viewBox="0 0 80 80"
              className="absolute -bottom-2 -right-2 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none opacity-[0.22] text-[#D4A347] z-0"
              aria-hidden="true"
            >
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 2" fill="none" />
              <circle cx="40" cy="40" r="20" stroke="currentColor" strokeWidth="0.7" fill="none" />
              <circle cx="40" cy="40" r="10" stroke="currentColor" strokeWidth="0.6" fill="none" />
              <circle cx="40" cy="40" r="4" fill="currentColor" opacity="0.6" />
              {/* Radiating 12 Petals */}
              <g stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.8">
                <path d="M40 12 C37 20, 37 28, 40 30 C43 28, 43 20, 40 12 Z" />
                <path d="M40 68 C37 60, 37 52, 40 50 C43 52, 43 60, 40 68 Z" />
                <path d="M12 40 C20 37, 28 37, 30 40 C28 43, 20 43, 12 40 Z" />
                <path d="M68 40 C60 37, 52 37, 50 40 C52 43, 60 43, 68 40 Z" />
                <path d="M20 20 C27 23, 31 29, 33 33 C29 31, 23 27, 20 20 Z" />
                <path d="M60 60 C53 57, 49 51, 47 47 C51 49, 57 53, 60 60 Z" />
                <path d="M60 20 C57 27, 51 31, 47 33 C49 29, 53 23, 60 20 Z" />
                <path d="M20 60 C23 53, 29 49, 33 47 C31 51, 27 57, 20 60 Z" />
              </g>
            </svg>

            {/* Right Information Area */}
            <div className="flex-1 pl-[39%] xs:pl-[39%] sm:pl-[40%] pr-2 sm:pr-3 py-1 xs:py-1.5 sm:py-2 flex flex-col justify-center min-w-0 relative z-10">
              <div className="text-[7px] xs:text-[8px] sm:text-[9.5px] md:text-[10px] font-sans font-extrabold uppercase tracking-wider text-[#8A151B] leading-none mb-0.5 whitespace-nowrap">
                19 NOVEMBER &bull; 9:00 AM IST
              </div>
              <div className="font-serif font-bold text-[13px] xs:text-[14.5px] sm:text-[17px] md:text-[18.5px] text-[#421804] leading-tight">
                Haldi Ceremony
              </div>
              <p className="font-serif italic text-[9.5px] xs:text-[10.5px] sm:text-[12px] md:text-[13px] text-[#36221A] leading-[1.28] mt-0.5 select-text">
                The sacred turmeric blessing marking a joyous new beginning.
              </p>
            </div>
          </div>

          {/* CARD 2: MEHNDI CEREMONY */}
          <div className="relative flex rounded-xl sm:rounded-2xl border border-[#8FB89E]/80 overflow-hidden shadow-xs bg-gradient-to-r from-[#F8FAF9] via-[#F2F7F4] to-[#EEF6F0] min-h-[58px] xs:min-h-[66px] sm:min-h-[78px] md:min-h-[84px]">
            {/* Photographic Area with Sweeping Curved Diagonal Crescent Clip */}
            <div
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              style={{ clipPath: "url(#ceremony-crescent-clip)" }}
            >
              <img
                src="/images/invitationcard-mehndi-display.webp"
                data-export-src="/images/invitationcard-mehndi-image.webp"
                alt="Mehndi Ceremony"
                className="w-[50%] h-full object-cover object-[25%_center]"
                loading="lazy"
              />
            </div>

            {/* Sweeping Curved Diagonal Sage-Gold Glowing Edge Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Layer 1: Soft Warm Golden Outer Glow Aura */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="rgba(218, 175, 85, 0.45)"
                strokeWidth="4.5"
                filter="url(#ceremony-gold-glow)"
                vectorEffect="non-scaling-stroke"
              />
              {/* Layer 2: Antique Gold / Theme Metallic Line */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="#8FB89E"
                strokeWidth="2.2"
                vectorEffect="non-scaling-stroke"
              />
              {/* Layer 3: Luminous Golden Highlight */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="#FFE9A3"
                strokeWidth="1.0"
                opacity="0.92"
                vectorEffect="non-scaling-stroke"
              />
              {/* Layer 4: Specular Core Highlight */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="#FFFDF5"
                strokeWidth="0.5"
                opacity="0.8"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Botanical Sage-Green Rich Mandala & Vine Texture */}
            <svg
              viewBox="0 0 80 80"
              className="absolute -bottom-2 -right-2 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none opacity-[0.20] text-[#2E7D4E] z-0"
              aria-hidden="true"
            >
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 2" fill="none" />
              <circle cx="40" cy="40" r="18" stroke="currentColor" strokeWidth="0.7" fill="none" />
              <circle cx="40" cy="40" r="4" fill="currentColor" opacity="0.6" />
              {/* Botanical Henna Leaf Flourishes */}
              <g stroke="currentColor" strokeWidth="0.6" fill="none">
                <path d="M40 14 C34 22, 38 32, 40 40 C42 32, 46 22, 40 14 Z" />
                <path d="M40 66 C34 58, 38 48, 40 40 C42 48, 46 58, 40 66 Z" />
                <path d="M14 40 C22 34, 32 38, 40 40 C32 42, 22 46, 14 40 Z" />
                <path d="M66 40 C58 34, 48 38, 40 40 C48 42, 58 46, 66 40 Z" />
              </g>
            </svg>

            {/* Right Information Area */}
            <div className="flex-1 pl-[39%] xs:pl-[39%] sm:pl-[40%] pr-2 sm:pr-3 py-1 xs:py-1.5 sm:py-2 flex flex-col justify-center min-w-0 relative z-10">
              <div className="text-[7px] xs:text-[8px] sm:text-[9.5px] md:text-[10px] font-sans font-extrabold uppercase tracking-wider text-[#14532D] leading-none mb-0.5 whitespace-nowrap">
                20 NOVEMBER &bull; 9:00 AM IST
              </div>
              <div className="font-serif font-bold text-[13px] xs:text-[14.5px] sm:text-[17px] md:text-[18.5px] text-[#082B14] leading-tight">
                Mehndi Ceremony
              </div>
              <p className="font-serif italic text-[9.5px] xs:text-[10.5px] sm:text-[12px] md:text-[13px] text-[#203326] leading-[1.28] mt-0.5 select-text">
                A vibrant celebration of henna, music and togetherness.
              </p>
            </div>
          </div>

          {/* CARD 3: THE SACRED WEDDING */}
          <div className="relative flex rounded-xl sm:rounded-2xl border border-[#D68F99]/80 overflow-hidden shadow-xs bg-gradient-to-r from-[#FCF8F9] via-[#FAF1F3] to-[#F9EEF1] min-h-[58px] xs:min-h-[66px] sm:min-h-[78px] md:min-h-[84px]">
            {/* Photographic Area with Sweeping Curved Diagonal Crescent Clip */}
            <div
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              style={{ clipPath: "url(#ceremony-crescent-clip)" }}
            >
              <img
                src="/images/invitationcard-wedding-display.webp"
                data-export-src="/images/invitationcard-wedding-image.webp"
                alt="The Sacred Wedding"
                className="w-[50%] h-full object-cover object-center"
                loading="lazy"
              />
            </div>

            {/* Sweeping Curved Diagonal Rose-Gold Glowing Edge Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Layer 1: Soft Warm Golden Outer Glow Aura */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="rgba(218, 175, 85, 0.45)"
                strokeWidth="4.5"
                filter="url(#ceremony-gold-glow)"
                vectorEffect="non-scaling-stroke"
              />
              {/* Layer 2: Antique Gold / Theme Metallic Line */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="#D68F99"
                strokeWidth="2.2"
                vectorEffect="non-scaling-stroke"
              />
              {/* Layer 3: Luminous Golden Highlight */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="#FFE9A3"
                strokeWidth="1.0"
                opacity="0.92"
                vectorEffect="non-scaling-stroke"
              />
              {/* Layer 4: Specular Core Highlight */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="#FFFDF5"
                strokeWidth="0.5"
                opacity="0.8"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Rich Rose & Burgundy Filigree Mandala Texture */}
            <svg
              viewBox="0 0 80 80"
              className="absolute -bottom-2 -right-2 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none opacity-[0.22] text-[#A8283B] z-0"
              aria-hidden="true"
            >
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 2" fill="none" />
              <circle cx="40" cy="40" r="20" stroke="currentColor" strokeWidth="0.7" fill="none" />
              <circle cx="40" cy="40" r="4" fill="currentColor" opacity="0.6" />
              {/* Vedic 8-Point Starburst Petals */}
              <g stroke="currentColor" strokeWidth="0.6" fill="none">
                <path d="M40 8 L44 26 L56 16 L48 30 L66 32 L49 39 L64 48 L48 48 L56 62 L44 52 L40 70 L36 52 L24 62 L32 48 L16 48 L31 39 L14 32 L32 30 L24 16 L36 26 Z" opacity="0.7" />
              </g>
            </svg>

            {/* Right Information Area */}
            <div className="flex-1 pl-[39%] xs:pl-[39%] sm:pl-[40%] pr-2 sm:pr-3 py-1 xs:py-1.5 sm:py-2 flex flex-col justify-center min-w-0 relative z-10">
              <div className="text-[7px] xs:text-[8px] sm:text-[9.5px] md:text-[10px] font-sans font-extrabold uppercase tracking-wider text-[#8A151B] leading-none mb-0.5 whitespace-nowrap">
                21 NOVEMBER &bull; 11:00 PM IST
              </div>
              <div className="font-serif font-bold text-[13px] xs:text-[14.5px] sm:text-[17px] md:text-[18.5px] text-[#48070F] leading-tight">
                The Sacred Wedding
              </div>
              <p className="font-serif italic text-[9.5px] xs:text-[10.5px] sm:text-[12px] md:text-[13px] text-[#381F23] leading-[1.28] mt-0.5 select-text">
                The sacred Vedic marriage ceremony uniting two hearts for a lifetime.
              </p>
            </div>
          </div>

          {/* CARD 4: RECEPTION */}
          <div className="relative flex rounded-xl sm:rounded-2xl border border-[#B58FB8]/80 overflow-hidden shadow-xs bg-gradient-to-r from-[#FAF7FB] via-[#F6F0F8] to-[#F3EDF7] min-h-[58px] xs:min-h-[66px] sm:min-h-[78px] md:min-h-[84px]">
            {/* Photographic Area with Sweeping Curved Diagonal Crescent Clip */}
            <div
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              style={{ clipPath: "url(#ceremony-crescent-clip)" }}
            >
              <img
                src="/images/invitationcard-reception-display.webp"
                data-export-src="/images/invitationcard-reception-image.webp"
                alt="Reception Ceremony"
                className="w-[50%] h-full object-cover object-[20%_center]"
                loading="lazy"
              />
            </div>

            {/* Sweeping Curved Diagonal Mauve-Gold Glowing Edge Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Layer 1: Soft Warm Golden Outer Glow Aura */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="rgba(218, 175, 85, 0.45)"
                strokeWidth="4.5"
                filter="url(#ceremony-gold-glow)"
                vectorEffect="non-scaling-stroke"
              />
              {/* Layer 2: Antique Gold / Theme Metallic Line */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="#B58FB8"
                strokeWidth="2.2"
                vectorEffect="non-scaling-stroke"
              />
              {/* Layer 3: Luminous Golden Highlight */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="#FFE9A3"
                strokeWidth="1.0"
                opacity="0.92"
                vectorEffect="non-scaling-stroke"
              />
              {/* Layer 4: Specular Core Highlight */}
              <path
                d="M 38 0 C 32 35, 23 70, 17 100"
                fill="none"
                stroke="#FFFDF5"
                strokeWidth="0.5"
                opacity="0.8"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Dusty-Rose & Champagne Medallion Texture */}
            <svg
              viewBox="0 0 80 80"
              className="absolute -bottom-2 -right-2 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none opacity-[0.20] text-[#8A3D82] z-0"
              aria-hidden="true"
            >
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 2" fill="none" />
              <circle cx="40" cy="40" r="18" stroke="currentColor" strokeWidth="0.7" fill="none" />
              <circle cx="40" cy="40" r="4" fill="currentColor" opacity="0.6" />
              {/* Royal Medallion Floral Geometry */}
              <g stroke="currentColor" strokeWidth="0.6" fill="none">
                <circle cx="40" cy="22" r="6" />
                <circle cx="40" cy="58" r="6" />
                <circle cx="22" cy="40" r="6" />
                <circle cx="58" cy="40" r="6" />
                <circle cx="27" cy="27" r="4" />
                <circle cx="53" cy="53" r="4" />
                <circle cx="53" cy="27" r="4" />
                <circle cx="27" cy="53" r="4" />
              </g>
            </svg>

            {/* Right Information Area */}
            <div className="flex-1 pl-[39%] xs:pl-[39%] sm:pl-[40%] pr-2 sm:pr-3 py-1 xs:py-1.5 sm:py-2 flex flex-col justify-center min-w-0 relative z-10">
              <div className="text-[7px] xs:text-[8px] sm:text-[9.5px] md:text-[10px] font-sans font-extrabold uppercase tracking-wider text-[#4C1D54] leading-none mb-0.5 whitespace-nowrap">
                22 NOVEMBER &bull; 5:00 PM IST
              </div>
              <div className="font-serif font-bold text-[13px] xs:text-[14.5px] sm:text-[17px] md:text-[18.5px] text-[#330938] leading-tight">
                Reception
              </div>
              <p className="font-serif italic text-[9.5px] xs:text-[10.5px] sm:text-[12px] md:text-[13px] text-[#301E33] leading-[1.28] mt-0.5 select-text">
                A grand celebration banquet with family, friends and heartfelt blessings.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* =================================================================== */}
      {/* 8. BOTTOM QR CODE SECTION: SINGLE-LINE DESKTOP HEADING             */}
      {/* =================================================================== */}
      <div className="relative z-10 w-full pt-0.5 sm:pt-1">
        {/* Divider C: Refined Horizontal Champagne-Gold Line with Central Diamond & Dot Flourish */}
        <div className="flex items-center justify-center mb-1 sm:mb-1.5 select-none text-[#B8975E]" aria-hidden="true">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#B8975E]/50 to-transparent" />
          <svg width="44" height="14" viewBox="0 0 44 14" fill="none" className="mx-2 shrink-0">
            {/* Center horizontal diamond */}
            <path d="M16 7 L22 3 L28 7 L22 11 Z" stroke="#B8975E" strokeWidth="1.2" fill="none" />
            <circle cx="22" cy="7" r="1.5" fill="#B8975E" />
            {/* Left dot and connecting stroke */}
            <circle cx="9" cy="7" r="1.6" fill="#B8975E" />
            <line x1="10.6" y1="7" x2="15.5" y2="7" stroke="#B8975E" strokeWidth="1" />
            {/* Right dot and connecting stroke */}
            <circle cx="35" cy="7" r="1.6" fill="#B8975E" />
            <line x1="28.5" y1="7" x2="33.4" y2="7" stroke="#B8975E" strokeWidth="1" />
          </svg>
          <div className="w-full h-[1px] bg-gradient-to-l from-transparent via-[#B8975E]/50 to-transparent" />
        </div>

        {/* Balanced Two-Column Footer — High Contrast & Elevated Readability */}
        <footer className="flex items-center gap-2.5 sm:gap-4 pb-0.5 sm:pb-1 pl-3 xs:pl-5 sm:pl-7 pr-[28%] sm:pr-[30%] md:pr-[32%]">
          {/* LEFT: Square Dynamic Vector QR Code in Crisp White Tile with Gold Double Border */}
          <div className="shrink-0 p-1 sm:p-1.5 bg-white rounded-xl border border-[#B8975E]/80 shadow-[0_2px_8px_rgba(184,151,94,0.18)] flex items-center justify-center">
            <div
              className="w-[44px] h-[44px] xs:w-[50px] xs:h-[50px] sm:w-[60px] sm:h-[60px] md:w-[66px] md:h-[66px] aspect-square [&>svg]:w-full [&>svg]:h-full flex items-center justify-center overflow-hidden"
              dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
              aria-label={`Scannable QR Code linking to ${canonicalUrl}`}
              role="img"
            />
          </div>

          {/* RIGHT: Bracketed Details Column (Single-Line Desktop Heading) */}
          <div className="flex-1 min-w-0 border-l-[1.5px] border-[#B8975E]/70 pl-2.5 sm:pl-3.5 text-left">
            <div className="text-[10px] xs:text-[11.5px] sm:text-[14px] md:text-[16px] lg:text-[17.5px] font-serif font-bold uppercase tracking-[0.06em] text-[#4A0A10] sm:whitespace-nowrap leading-tight">
              SCAN FOR COMPLETE WEDDING DETAILS
            </div>

            {/* Loop Flourish */}
            <div className="my-0.5 sm:my-1 select-none" aria-hidden="true">
              <svg width="34" height="6" viewBox="0 0 40 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 3 C10 3, 15 1, 20 3 C25 5, 30 3, 40 3" stroke="#B8975E" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
              </svg>
            </div>

            <p className="font-serif italic text-[7.5px] xs:text-[8.5px] sm:text-[10.5px] md:text-[11.5px] text-[#302120] leading-snug">
              Ceremony schedule, venues, directions, RSVP and more.
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}
