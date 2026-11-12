"use client";

import React from "react";

/**
 * Venues-Inspired Golden Card Architectural Surface & Watermarks
 * 
 * Recreates the exact visual design language of the Groom's Home golden card
 * from the Venues section:
 * - Thin antique-gold perimeter frame with rounded architectural corners
 * - Signature curved corner brackets with anchored circular finial dots in all 4 corners
 * - Asymmetrical background mandala watermarks:
 *   1. Upper-Right radial mandala & concentric dashed geometry
 *   2. Mid-Left blooming radial arcs
 *   3. Lower-Right concentric ambient arcs
 * - Exact 4:5 portrait aspect ratio geometry (viewBox 0 0 400 500)
 */
export function InvitationVenuesCardSurface({
  className = "",
}: {
  className?: string;
}) {
  const angles = [0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336];

  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="invGoldFrameGrad" x1="0" y1="0" x2="400" y2="500" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C8A45D" />
          <stop offset="30%" stopColor="#E2CA8E" />
          <stop offset="60%" stopColor="#C8A45D" />
          <stop offset="100%" stopColor="#A88238" />
        </linearGradient>

        <radialGradient id="upperRightMandalaGrad" cx="390" cy="110" r="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B8975E" stopOpacity="0.22" />
          <stop offset="50%" stopColor="#B8975E" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#B8975E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* =================================================================== */}
      {/* 1. ASYMMETRICAL GEOMETRIC MANDALA WATERMARKS                        */}
      {/* =================================================================== */}

      {/* A. Upper-Right Radial Mandala (Venues Card Signature) */}
      <g stroke="#B8975E" opacity="0.20" strokeWidth="0.8">
        {/* Concentric rings */}
        <circle cx="390" cy="110" r="160" strokeDasharray="3 3" />
        <circle cx="390" cy="110" r="135" />
        <circle cx="390" cy="110" r="110" strokeDasharray="2 3" />
        <circle cx="390" cy="110" r="85" />
        <circle cx="390" cy="110" r="60" strokeDasharray="2 2" />
        <circle cx="390" cy="110" r="40" />
        <circle cx="390" cy="110" r="20" />

        {/* Rotated sacred petal loops */}
        {angles.map((deg) => (
          <path
            key={`ur-petal-${deg}`}
            d="M 390 110 Q 325 75 285 110 Q 325 145 390 110"
            transform={`rotate(${deg} 390 110)`}
            strokeWidth="0.6"
          />
        ))}

        {/* Orbit dots */}
        {angles.map((deg) => (
          <circle
            key={`ur-dot-${deg}`}
            cx="300"
            cy="110"
            r="1.8"
            transform={`rotate(${deg + 12} 390 110)`}
            fill="#B8975E"
            fillOpacity="0.3"
            stroke="none"
          />
        ))}
      </g>

      {/* B. Mid-Left Blooming Radial Arcs (Behind Family Attributions) */}
      <g stroke="#B8975E" opacity="0.15" strokeWidth="0.75">
        <circle cx="10" cy="240" r="130" strokeDasharray="3 4" />
        <circle cx="10" cy="240" r="100" />
        <circle cx="10" cy="240" r="70" strokeDasharray="2 3" />
        <circle cx="10" cy="240" r="45" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <path
            key={`ml-arc-${deg}`}
            d="M 10 240 Q 65 210 90 240 Q 65 270 10 240"
            transform={`rotate(${deg} 10 240)`}
            strokeWidth="0.5"
          />
        ))}
      </g>

      {/* C. Lower-Right Subtle Concentric Arcs */}
      <g stroke="#B8975E" opacity="0.14" strokeWidth="0.75">
        <circle cx="380" cy="460" r="120" strokeDasharray="3 3" />
        <circle cx="380" cy="460" r="90" />
        <circle cx="380" cy="460" r="60" strokeDasharray="2 3" />
        <circle cx="380" cy="460" r="35" />
      </g>

      {/* =================================================================== */}
      {/* 2. FOUR CORNER BRACKETS (NO continuous inner rectangular border)     */}
      {/* =================================================================== */}

      {/* Four Signature Venues-Style Corner Brackets with Finial Circles */}
      {/* Top-Left Bracket */}
      <g stroke="#B8975E" strokeWidth="1.25" strokeLinecap="round">
        <path d="M 12 24 V 16 C 12 13.8 13.8 12 16 12 H 24" />
        <circle cx="17.5" cy="17.5" r="1.5" fill="#B8975E" stroke="none" />
      </g>

      {/* Top-Right Bracket */}
      <g stroke="#B8975E" strokeWidth="1.25" strokeLinecap="round">
        <path d="M 388 24 V 16 C 388 13.8 386.2 12 384 12 H 376" />
        <circle cx="382.5" cy="17.5" r="1.5" fill="#B8975E" stroke="none" />
      </g>

      {/* Bottom-Left Bracket */}
      <g stroke="#B8975E" strokeWidth="1.25" strokeLinecap="round">
        <path d="M 12 476 V 484 C 12 486.2 13.8 488 16 488 H 24" />
        <circle cx="17.5" cy="482.5" r="1.5" fill="#B8975E" stroke="none" />
      </g>

      {/* Bottom-Right Bracket */}
      <g stroke="#B8975E" strokeWidth="1.25" strokeLinecap="round">
        <path d="M 388 476 V 484 C 388 486.2 386.2 488 384 488 H 376" />
        <circle cx="382.5" cy="482.5" r="1.5" fill="#B8975E" stroke="none" />
      </g>
    </svg>
  );
}

/**
 * Ceremony Card Venues-Style Watermark:
 * 3 concentric quarter circles in bottom-right corner + corner brackets
 */
export function CeremonyCardWatermark({
  className = "",
  color = "#B8975E",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div className={`absolute inset-0 pointer-events-none select-none overflow-hidden rounded-lg ${className}`} aria-hidden="true">
      {/* Top-Left Micro Bracket */}
      <svg
        className="absolute top-1 left-1 w-3.5 h-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      >
        <path d="M 2 10 V 4 C 2 2.9 2.9 2 4 2 H 10" />
      </svg>

      {/* Top-Right Micro Bracket */}
      <svg
        className="absolute top-1 right-1 w-3.5 h-3.5 scale-x-[-1]"
        viewBox="0 0 16 16"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      >
        <path d="M 2 10 V 4 C 2 2.9 2.9 2 4 2 H 10" />
      </svg>

      {/* Bottom-Right Concentric Arcs (Signature Venues Aesthetic) */}
      <svg
        className="absolute bottom-0 right-0 w-12 h-12 overflow-visible"
        viewBox="0 0 48 48"
        fill="none"
        stroke={color}
        strokeWidth="0.75"
        opacity="0.32"
      >
        <path d="M 48 16 A 32 32 0 0 0 16 48" />
        <path d="M 48 24 A 24 24 0 0 0 24 48" strokeDasharray="2 2" />
        <path d="M 48 32 A 16 16 0 0 0 32 48" />
        <path d="M 48 40 A 8 8 0 0 0 40 48" />
      </svg>
    </div>
  );
}

/**
 * Calligraphic Underline Flourish for Couple Names
 */
export function CalligraphicUnderlineFlourish({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-44 sm:w-56 h-3 sm:h-4 pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <path
        d="M 12 18 C 65 6, 175 4, 228 14 C 185 20, 105 18, 55 22"
        stroke="#C8A45D"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

/**
 * Editorial Gold Divider with Diamond Accents
 */
export function GoldDiamondDivider({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-2 select-none pointer-events-none ${className}`} aria-hidden="true">
      <span className="w-8 sm:w-14 h-[0.5px] bg-gradient-to-r from-transparent to-[#B8975E]" />
      <span className="text-[6.5px] text-[#B8975E]">◇</span>
      {label ? (
        <span className="text-[8px] sm:text-[9.5px] font-sans font-bold uppercase tracking-[0.22em] text-[#5A0F1A] px-1">
          {label}
        </span>
      ) : null}
      <span className="text-[6.5px] text-[#B8975E]">◇</span>
      <span className="w-8 sm:w-14 h-[0.5px] bg-gradient-to-l from-transparent to-[#B8975E]" />
    </div>
  );
}

// Backward-compatibility aliases for existing imports
export const InvitationArchitecturalFrame = InvitationVenuesCardSurface;
export const RadiantHaloWatermark = () => null;
export const EditorialGoldDivider = GoldDiamondDivider;
export const RoyalMonogramSeal = ({ size = 36, className = "" }: { size?: number; className?: string }) => (
  <div
    style={{ width: size, height: size }}
    className={`inline-flex items-center justify-center rounded-full border border-[#B8975E]/60 bg-[#FAF5E6]/80 text-[#5A0F1A] font-serif font-semibold text-xs tracking-wider shadow-2xs ${className}`}
  >
    M&amp;S
  </div>
);
export const InvitationCornerBracket = () => null;
export const InvitationTopArchCrest = () => null;
export const InvitationGeometricDivider = GoldDiamondDivider;
export const InvitationMandalaFlank = () => null;
export const InvitationDatePlaque = () => null;
export const CardCornerAccent = () => null;
export const InvitationCornerOrnament = () => null;
export const InvitationArchOutline = () => null;
export const InvitationMonogramSeal = RoyalMonogramSeal;
export const InvitationDividerFlourish = GoldDiamondDivider;
export const InvitationKalashMotif = () => null;
