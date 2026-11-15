"use client";

import React from "react";

/**
 * 1. Card Corner Bracket Ornament
 * Sits at the four corners of each profile card, linking the outer and inner borders.
 */
export function CardCornerBracket({
  position,
  color,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color: string;
}) {
  const transform =
    position === "top-right"
      ? "scaleX(-1)"
      : position === "bottom-left"
      ? "scaleY(-1)"
      : position === "bottom-right"
      ? "scale(-1)"
      : undefined;

  const posClasses =
    position === "top-left"
      ? "top-3 left-3"
      : position === "top-right"
      ? "top-3 right-3"
      : position === "bottom-left"
      ? "bottom-3 left-3"
      : "bottom-3 right-3";

  return (
    <svg
      className={`absolute ${posClasses} w-8 h-8 pointer-events-none select-none z-10`}
      style={{ transform }}
      viewBox="0 0 36 36"
      fill="none"
      stroke={color}
      aria-hidden="true"
    >
      {/* Outer Corner Curve */}
      <path
        d="M 3 16 C 3 8.8 8.8 3 16 3 M 3 26 C 3 13.3 13.3 3 26 3"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Inner Accent Flourish */}
      <path
        d="M 6 6 C 10 4 16 5 18 9 C 19.5 13 15 16 12 15 C 9 14 10 10 13 9"
        strokeWidth="0.9"
        fill="none"
        opacity="0.8"
      />
      {/* Corner Knot Rivet */}
      <rect
        x="3"
        y="3"
        width="3.5"
        height="3.5"
        transform="rotate(45 4.75 4.75)"
        fill={color}
        stroke="none"
      />
    </svg>
  );
}

/**
 * 2. Background Mandala Watermark
 * Delicate, multi-tiered Indian circular mandala linework rendered at low opacity.
 */
export function BackgroundMandalaWatermark({
  color,
  position = "right",
}: {
  color: string;
  position?: "left" | "right";
}) {
  const posClasses =
    position === "right"
      ? "-top-12 -right-16 sm:-right-10"
      : "-top-12 -left-16 sm:-left-10";

  return (
    <div
      className={`absolute ${posClasses} w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 pointer-events-none select-none z-0 opacity-[0.16]`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        fill="none"
        stroke={color}
        strokeWidth="0.9"
      >
        <circle cx="200" cy="200" r="190" strokeDasharray="3 4" strokeWidth="0.75" />
        <circle cx="200" cy="200" r="182" strokeWidth="0.85" />
        <circle cx="200" cy="200" r="168" strokeDasharray="6 4" strokeWidth="0.85" />
        <circle cx="200" cy="200" r="148" strokeWidth="0.95" />

        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <g key={`mandala-outer-${i}`} transform={`rotate(${angle} 200 200)`}>
              <path
                d="M 200 52 C 215 90 228 125 200 148 C 172 125 185 90 200 52 Z"
                strokeWidth="0.8"
              />
              <path d="M 200 65 L 200 135" strokeDasharray="2 3" strokeWidth="0.5" />
              <circle cx="200" cy="45" r="2.4" fill={color} stroke="none" />
            </g>
          );
        })}

        <circle cx="200" cy="200" r="115" strokeWidth="0.85" />
        <circle cx="200" cy="200" r="95" strokeDasharray="2 3" strokeWidth="0.65" />

        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8 + 22.5;
          return (
            <g key={`mandala-mid-${i}`} transform={`rotate(${angle} 200 200)`}>
              <path
                d="M 200 105 C 220 135 215 165 200 180 C 185 165 180 135 200 105 Z"
                strokeWidth="0.95"
              />
              <circle cx="200" cy="100" r="2.2" fill={color} stroke="none" />
            </g>
          );
        })}

        <circle cx="200" cy="200" r="60" strokeWidth="0.95" />
        <circle cx="200" cy="200" r="42" strokeDasharray="3 3" strokeWidth="0.65" />
        <circle cx="200" cy="200" r="24" strokeWidth="1" />
        <circle cx="200" cy="200" r="6" fill={color} stroke="none" />
      </svg>
    </div>
  );
}

/**
 * 3. Top Role Plaque Banner
 * Luxurious notched velvet cartouche with flanking gold filigree wings.
 */
export function RolePlaqueBanner({
  label,
  bgColor,
  textColor,
  borderColor,
  wingColor,
}: {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  wingColor: string;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center select-none pt-2 pb-1">
      {/* Top Arched Finial Bracket */}
      <div className="flex items-center gap-1.5 opacity-85 mb-1.5" aria-hidden="true">
        <span
          className="w-10 sm:w-14 h-[1px]"
          style={{
            background: `linear-gradient(to right, transparent, ${wingColor})`,
          }}
        />
        <div
          className="w-1.5 h-1.5 rotate-45 border"
          style={{ borderColor: wingColor, backgroundColor: wingColor }}
        />
        <span
          className="w-10 sm:w-14 h-[1px]"
          style={{
            background: `linear-gradient(to left, transparent, ${wingColor})`,
          }}
        />
      </div>

      {/* Cartouche + Flanking Wings */}
      <div className="inline-flex items-center gap-2 sm:gap-3">
        {/* Left Botanical Wing */}
        <svg
          className="w-7 sm:w-9 h-3.5 text-current shrink-0"
          style={{ color: wingColor }}
          viewBox="0 0 36 14"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            d="M 36 7 L 8 7 M 8 7 C 12 3 18 2 26 2 M 8 7 C 12 11 18 12 26 12"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <circle cx="4" cy="7" r="1.8" fill="currentColor" stroke="none" />
          <path d="M 14 7 L 16 3.5 M 22 7 L 24 3.5" strokeWidth="0.9" />
          <path d="M 14 7 L 16 10.5 M 22 7 L 24 10.5" strokeWidth="0.9" />
        </svg>

        {/* Center Velvet Cartouche */}
        <div
          style={{
            background: bgColor,
            borderColor: borderColor,
            boxShadow:
              "0 4px 16px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.45)",
          }}
          className="relative px-6 py-1.5 sm:px-7 sm:py-2 rounded-full border-[1.5px] flex items-center justify-center transition-transform duration-300"
        >
          <span
            className="text-[11px] sm:text-[12px] font-sans font-bold uppercase tracking-[0.28em] whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
            style={{ color: textColor }}
          >
            {label}
          </span>
        </div>

        {/* Right Botanical Wing */}
        <svg
          className="w-7 sm:w-9 h-3.5 text-current shrink-0"
          style={{ color: wingColor, transform: "scaleX(-1)" }}
          viewBox="0 0 36 14"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            d="M 36 7 L 8 7 M 8 7 C 12 3 18 2 26 2 M 8 7 C 12 11 18 12 26 12"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <circle cx="4" cy="7" r="1.8" fill="currentColor" stroke="none" />
          <path d="M 14 7 L 16 3.5 M 22 7 L 24 3.5" strokeWidth="0.9" />
          <path d="M 14 7 L 16 10.5 M 22 7 L 24 10.5" strokeWidth="0.9" />
        </svg>
      </div>
    </div>
  );
}

/**
 * 4. Mughal Cusped Jharokha Arch Path Generator
 * Box dimension: 280 (width) x 334 (height)
 */
const JHAROKHA_PATH = `
  M 140 12
  C 147 24, 158 35, 172 40
  C 183 44, 192 40, 198 52
  C 204 64, 197 78, 214 90
  C 226 99, 238 108, 246 122
  C 252 133, 252 148, 252 165
  L 252 300
  C 252 314, 241 322, 226 322
  L 54 322
  C 39 322, 28 314, 28 300
  L 28 165
  C 28 148, 28 133, 34 122
  C 42 108, 54 99, 66 90
  C 83 78, 76 64, 82 52
  C 88 40, 97 44, 108 40
  C 122 35, 133 24, 140 12
  Z
`;

const JHAROKHA_INNER_PATH = `
  M 140 22
  C 146 32, 156 42, 168 47
  C 178 51, 186 47, 191 58
  C 196 68, 191 80, 206 91
  C 217 99, 228 107, 235 120
  C 240 130, 240 144, 240 160
  L 240 292
  C 240 305, 231 312, 218 312
  L 62 312
  C 49 312, 40 305, 40 292
  L 40 160
  C 40 144, 40 130, 45 120
  C 52 107, 63 99, 74 91
  C 89 80, 84 68, 89 58
  C 94 47, 102 51, 112 47
  C 124 42, 134 32, 140 22
  Z
`;

/**
 * 5. Arched Portrait Component
 * Renders the full 3D sculpted jharokha frame with inner photo clipping,
 * climbing leafy golden vines, lush corner blooms, and base medallion.
 */
export function ArchedPortraitFrame({
  imageSrc,
  imageAlt,
  primaryGold,
  secondaryGold,
  flowerPetalPrimary,
  flowerPetalSecondary,
  clipId,
}: {
  imageSrc: string;
  imageAlt: string;
  primaryGold: string;
  secondaryGold: string;
  flowerPetalPrimary: string;
  flowerPetalSecondary: string;
  clipId: string;
}) {
  return (
    <div className="relative w-full max-w-[270px] sm:max-w-[285px] md:max-w-[300px] lg:max-w-[290px] xl:max-w-[310px] mx-auto select-none">
      {/* 3D Drop Shadow Beneath Arch */}
      <div
        className="absolute inset-x-6 bottom-4 h-20 rounded-full blur-xl pointer-events-none opacity-45 -z-10"
        style={{ backgroundColor: primaryGold }}
      />

      <div className="relative w-full aspect-[280/334]">
        <svg
          viewBox="0 0 280 334"
          className="w-full h-full block select-none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId}>
              <path d={JHAROKHA_INNER_PATH} />
            </clipPath>

            <linearGradient id={`goldMetallic-${clipId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={secondaryGold} />
              <stop offset="25%" stopColor={primaryGold} />
              <stop offset="50%" stopColor="#FFF9E0" />
              <stop offset="75%" stopColor={primaryGold} />
              <stop offset="100%" stopColor={secondaryGold} />
            </linearGradient>

            <linearGradient id={`goldShine-${clipId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="50%" stopColor={secondaryGold} stopOpacity="0.7" />
              <stop offset="100%" stopColor={primaryGold} stopOpacity="0.1" />
            </linearGradient>

            {/* Petal Gradients for Luscious Flowers */}
            <radialGradient id={`petalGrad-${clipId}`} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor={flowerPetalPrimary} />
              <stop offset="70%" stopColor={flowerPetalSecondary} />
              <stop offset="100%" stopColor="#30050B" />
            </radialGradient>
          </defs>

          {/* ===============================================================
              0. THE PHOTOGRAPH LAYER (Inside SVG for 100% vector-locked scaling)
              =============================================================== */}
          <g clipPath={`url(#${clipId})`}>
            <image
              href={imageSrc}
              aria-label={imageAlt}
              x="0"
              y="0"
              width="280"
              height="334"
              preserveAspectRatio="xMidYMin slice"
            >
              <title>{imageAlt}</title>
            </image>
            {/* Soft Warm Radial Vignette at Bottom of Photo */}
            <rect
              x="0"
              y="180"
              width="280"
              height="154"
              fill={primaryGold}
              opacity="0.08"
            />
          </g>

          {/* 3D Outer Cast Shadow Path */}
          <path
            d={JHAROKHA_PATH}
            stroke="rgba(0,0,0,0.24)"
            strokeWidth="7"
            transform="translate(0, 3)"
            opacity="0.6"
          />

          {/* Outer Heavy Sculpted Metallic Frame */}
          <path
            d={JHAROKHA_PATH}
            stroke={`url(#goldMetallic-${clipId})`}
            strokeWidth="5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Inner Accent Hairline Frame */}
          <path
            d={JHAROKHA_INNER_PATH}
            stroke={primaryGold}
            strokeWidth="1.6"
            strokeOpacity="0.9"
          />

          {/* Top Specular Arc Highlight */}
          <path
            d="M 108 40 C 122 35, 133 24, 140 12 C 147 24, 158 35, 172 40"
            stroke={`url(#goldShine-${clipId})`}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* ===============================================================
              FLANKING BOTANICAL SPRIGS (Climbing Golden Leaf Branches)
              =============================================================== */}
          {/* Left Botanical Branch */}
          <g>
            <path
              d="M 40 210 C 24 175 20 130 38 92 C 46 76 58 64 74 52"
              stroke={primaryGold}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            {/* Elegant climbing leaf pairs */}
            <path
              d="M 34 175 C 16 172 10 158 20 152 C 30 148 36 160 34 175 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />
            <path
              d="M 28 145 C 12 138 12 122 24 122 C 34 122 34 136 28 145 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />
            <path
              d="M 32 115 C 18 106 22 92 34 96 C 42 100 38 112 32 115 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />
            <path
              d="M 48 85 C 38 74 44 60 56 65 C 64 70 56 82 48 85 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />
            <path
              d="M 68 58 C 62 46 72 36 82 42 C 88 47 80 58 68 58 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />
          </g>

          {/* Right Botanical Branch (Mirrored) */}
          <g transform="translate(280, 0) scale(-1, 1)">
            <path
              d="M 40 210 C 24 175 20 130 38 92 C 46 76 58 64 74 52"
              stroke={primaryGold}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M 34 175 C 16 172 10 158 20 152 C 30 148 36 160 34 175 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />
            <path
              d="M 28 145 C 12 138 12 122 24 122 C 34 122 34 136 28 145 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />
            <path
              d="M 32 115 C 18 106 22 92 34 96 C 42 100 38 112 32 115 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />
            <path
              d="M 48 85 C 38 74 44 60 56 65 C 64 70 56 82 48 85 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />
            <path
              d="M 68 58 C 62 46 72 36 82 42 C 88 47 80 58 68 58 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />
          </g>

          {/* ===============================================================
              LUSH LOWER CORNER FLORAL BLOOMS (Multi-petaled Hibiscus/Rose)
              =============================================================== */}
          {/* Bottom-Left Floral Cluster */}
          <g transform="translate(30, 276)">
            {/* Supporting Golden Leaves */}
            <path
              d="M 0 0 C -16 6 -20 22 -10 30 C 0 34 10 20 0 0 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />
            <path
              d="M -10 -10 C -26 -16 -30 -4 -18 8 C -8 16 0 2 -10 -10 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />

            {/* Overlapping Velvet Petals */}
            <circle cx="-6" cy="4" r="15" fill={`url(#petalGrad-${clipId})`} />
            {/* Symmetrical Petal Fans */}
            <path
              d="M -6 -12 C -1 -12 6 -6 3 0 C 0 6 -9 4 -12 0 C -14 -6 -11 -12 -6 -12 Z"
              fill={flowerPetalPrimary}
              stroke={primaryGold}
              strokeWidth="0.5"
            />
            <path
              d="M -19 0 C -22 -5 -18 -12 -12 -10 C -6 -8 -6 -1 -10 4 C -15 8 -18 6 -19 0 Z"
              fill={flowerPetalPrimary}
              stroke={primaryGold}
              strokeWidth="0.5"
            />
            <path
              d="M -16 12 C -20 8 -18 1 -13 0 C -7 0 -6 6 -8 11 C -10 16 -14 16 -16 12 Z"
              fill={flowerPetalPrimary}
              stroke={primaryGold}
              strokeWidth="0.5"
            />
            <path
              d="M -2 18 C -7 20 -14 17 -13 11 C -11 5 -5 6 0 11 C 3 14 2 17 -2 18 Z"
              fill={flowerPetalPrimary}
              stroke={primaryGold}
              strokeWidth="0.5"
            />
            <path
              d="M 6 8 C 4 14 -3 16 -5 11 C -6 6 -1 1 5 2 C 8 3 8 6 6 8 Z"
              fill={flowerPetalPrimary}
              stroke={primaryGold}
              strokeWidth="0.5"
            />

            {/* Radiant Golden Stamen Pistils */}
            <circle cx="-6" cy="4" r="4.5" fill={secondaryGold} />
            <circle cx="-6" cy="4" r="2.2" fill="#FFF9E0" />
            <circle cx="-9" cy="2" r="1.2" fill="#FFEAA7" />
            <circle cx="-3" cy="3" r="1.2" fill="#FFEAA7" />
            <circle cx="-6" cy="7" r="1.2" fill="#FFEAA7" />
          </g>

          {/* Bottom-Right Floral Cluster (Mirrored) */}
          <g transform="translate(250, 276) scale(-1, 1)">
            <path
              d="M 0 0 C -16 6 -20 22 -10 30 C 0 34 10 20 0 0 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />
            <path
              d="M -10 -10 C -26 -16 -30 -4 -18 8 C -8 16 0 2 -10 -10 Z"
              fill={secondaryGold}
              stroke={primaryGold}
              strokeWidth="0.8"
            />
            <circle cx="-6" cy="4" r="15" fill={`url(#petalGrad-${clipId})`} />
            <path
              d="M -6 -12 C -1 -12 6 -6 3 0 C 0 6 -9 4 -12 0 C -14 -6 -11 -12 -6 -12 Z"
              fill={flowerPetalPrimary}
              stroke={primaryGold}
              strokeWidth="0.5"
            />
            <path
              d="M -19 0 C -22 -5 -18 -12 -12 -10 C -6 -8 -6 -1 -10 4 C -15 8 -18 6 -19 0 Z"
              fill={flowerPetalPrimary}
              stroke={primaryGold}
              strokeWidth="0.5"
            />
            <path
              d="M -16 12 C -20 8 -18 1 -13 0 C -7 0 -6 6 -8 11 C -10 16 -14 16 -16 12 Z"
              fill={flowerPetalPrimary}
              stroke={primaryGold}
              strokeWidth="0.5"
            />
            <path
              d="M -2 18 C -7 20 -14 17 -13 11 C -11 5 -5 6 0 11 C 3 14 2 17 -2 18 Z"
              fill={flowerPetalPrimary}
              stroke={primaryGold}
              strokeWidth="0.5"
            />
            <path
              d="M 6 8 C 4 14 -3 16 -5 11 C -6 6 -1 1 5 2 C 8 3 8 6 6 8 Z"
              fill={flowerPetalPrimary}
              stroke={primaryGold}
              strokeWidth="0.5"
            />
            <circle cx="-6" cy="4" r="4.5" fill={secondaryGold} />
            <circle cx="-6" cy="4" r="2.2" fill="#FFF9E0" />
            <circle cx="-9" cy="2" r="1.2" fill="#FFEAA7" />
            <circle cx="-3" cy="3" r="1.2" fill="#FFEAA7" />
            <circle cx="-6" cy="7" r="1.2" fill="#FFEAA7" />
          </g>

          {/* ===============================================================
              BOTTOM-CENTER FILIGREE MEDALLION CREST
              =============================================================== */}
          <g transform="translate(140, 316)">
            <rect
              x="-18"
              y="-18"
              width="36"
              height="36"
              transform="rotate(45)"
              fill="rgba(0,0,0,0.25)"
            />
            <rect
              x="-16"
              y="-16"
              width="32"
              height="32"
              transform="rotate(45)"
              fill={`url(#goldMetallic-${clipId})`}
              stroke={secondaryGold}
              strokeWidth="1.2"
            />
            <rect
              x="-11"
              y="-11"
              width="22"
              height="22"
              transform="rotate(45)"
              fill={primaryGold}
              stroke="#FFF9E0"
              strokeWidth="0.9"
            />
            <circle cx="0" cy="0" r="4.5" fill="#FFF9E0" />
            <circle cx="0" cy="0" r="2.5" fill={flowerPetalSecondary} />
            <circle cx="-20" cy="0" r="1.8" fill={secondaryGold} />
            <circle cx="20" cy="0" r="1.8" fill={secondaryGold} />
            <circle cx="0" cy="-20" r="1.8" fill={secondaryGold} />
            <circle cx="0" cy="20" r="1.8" fill={secondaryGold} />
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * 6. Decorative Diamond Divider
 * Tapered hairline with central 4-point star & diamond beads.
 */
export function DecorativeDiamondDivider({ color }: { color: string }) {
  return (
    <div className="relative flex items-center justify-center w-full max-w-[280px] sm:max-w-[320px] mx-auto my-2.5 sm:my-3 select-none">
      <span
        className="flex-1 h-[1px]"
        style={{
          background: `linear-gradient(to right, transparent, ${color})`,
        }}
      />
      <div className="inline-flex items-center gap-1.5 px-2.5">
        <span
          className="w-1.5 h-1.5 rotate-45 border"
          style={{ borderColor: color, backgroundColor: "transparent" }}
        />
        <svg
          className="w-4 h-4 text-current"
          style={{ color }}
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 0 L9.8 6.2 L16 8 L9.8 9.8 L8 16 L6.2 9.8 L0 8 L6.2 6.2 Z" />
        </svg>
        <span
          className="w-1.5 h-1.5 rotate-45 border"
          style={{ borderColor: color, backgroundColor: "transparent" }}
        />
      </div>
      <span
        className="flex-1 h-[1px]"
        style={{
          background: `linear-gradient(to left, transparent, ${color})`,
        }}
      />
    </div>
  );
}

/**
 * 7. Parents Icon & Residence Pin Icon
 */
export function ParentsIcon({ color }: { color: string }) {
  return (
    <svg
      className="w-5 h-5 shrink-0"
      style={{ color }}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="3.5" />
      <path d="M2.5 19 C2.5 15.5 5 13.5 8 13.5 C11 13.5 13.5 15.5 13.5 19 Z" />
      <circle cx="16" cy="9.5" r="3" opacity="0.9" />
      <path
        d="M11 19 C11.5 16.5 13.5 15 16 15 C18.5 15 20.5 16.5 21 19 Z"
        opacity="0.9"
      />
    </svg>
  );
}

export function ResidencePinIcon({ color }: { color: string }) {
  return (
    <svg
      className="w-5 h-5 shrink-0"
      style={{ color }}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

/**
 * 8. Radiant Golden Lotus Medallion
 * Multi-petaled Indian golden lotus emblem sitting atop the sculpted plinth.
 */
export function RadiantGoldLotus({
  primaryGold,
  secondaryGold,
  glowColor,
}: {
  primaryGold: string;
  secondaryGold: string;
  glowColor: string;
}) {
  return (
    <div className="relative flex items-center justify-center select-none">
      <div
        className="absolute w-16 h-16 rounded-full blur-xl opacity-90 pointer-events-none"
        style={{ backgroundColor: glowColor }}
      />

      <svg
        className="w-14 h-10 sm:w-16 sm:h-11 text-current relative z-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
        viewBox="0 0 56 36"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lotusGoldGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={secondaryGold} />
            <stop offset="50%" stopColor="#FFF9E0" />
            <stop offset="100%" stopColor={secondaryGold} />
          </linearGradient>
        </defs>

        <path
          d="M 28 26 C 20 28, 6 22, 2 12 C 10 12, 22 18, 28 26 Z"
          fill={primaryGold}
          stroke={secondaryGold}
          strokeWidth="1"
        />
        <path
          d="M 28 26 C 36 28, 50 22, 54 12 C 46 12, 34 18, 28 26 Z"
          fill={primaryGold}
          stroke={secondaryGold}
          strokeWidth="1"
        />

        <path
          d="M 28 25 C 18 24, 10 16, 8 4 C 18 8, 24 16, 28 25 Z"
          fill="url(#lotusGoldGrad2)"
          stroke={primaryGold}
          strokeWidth="1"
        />
        <path
          d="M 28 25 C 38 24, 46 16, 48 4 C 38 8, 32 16, 28 25 Z"
          fill="url(#lotusGoldGrad2)"
          stroke={primaryGold}
          strokeWidth="1"
        />

        <path
          d="M 28 2 C 24 10, 22 18, 28 26 C 34 18, 32 10, 28 2 Z"
          fill="#FFFDF4"
          stroke={primaryGold}
          strokeWidth="1.2"
        />
        <circle cx="28" cy="14" r="1.8" fill={primaryGold} />

        <path
          d="M 14 27 C 22 31, 34 31, 42 27"
          stroke={secondaryGold}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * 9. Sculpted Bottom Wave with Lotus & Blessing
 * The regal curved plinth anchoring the card's bottom edge with authentic
 * sculpted double-arch contour and golden scalloped ribbon.
 */
export function ProfileBlessingFooter({
  blessing,
  bgGradient,
  goldBorder,
  primaryGold,
  secondaryGold,
  glowColor,
}: {
  blessing: string;
  bgGradient: string;
  goldBorder: string;
  primaryGold: string;
  secondaryGold: string;
  glowColor: string;
}) {
  return (
    <div className="relative w-full mt-4 select-none overflow-hidden rounded-b-[26px] sm:rounded-b-[30px]">
      {/* Golden Lotus Centered Over Curved Crest */}
      <div className="relative -mb-4 z-20 flex justify-center">
        <RadiantGoldLotus
          primaryGold={primaryGold}
          secondaryGold={secondaryGold}
          glowColor={glowColor}
        />
      </div>

      {/* Sculpted Plinth SVG Container with Curved Gold Scalloped Trim */}
      <div className="relative w-full">
        {/* Curved Top Ribbon SVG */}
        <svg
          viewBox="0 0 600 50"
          className="w-full h-8 sm:h-9 block -mb-[1px] pointer-events-none"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="scallopGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={goldBorder} stopOpacity="0.4" />
              <stop offset="30%" stopColor={goldBorder} />
              <stop offset="50%" stopColor="#FFF9E0" />
              <stop offset="70%" stopColor={goldBorder} />
              <stop offset="100%" stopColor={goldBorder} stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Plinth Upper Curve Path Fill (Seamlessly matches background gradient) */}
          <path
            d="M 0 50 L 0 28 C 120 28, 200 6, 300 6 C 400 6, 480 28, 600 28 L 600 50 Z"
            fill={bgGradient.includes("#641C27") ? "#641C27" : "#8E1B29"}
          />

          {/* Double Gleaming Golden Ribbon Trim */}
          <path
            d="M 0 28 C 120 28, 200 6, 300 6 C 400 6, 480 28, 600 28"
            stroke="url(#scallopGoldGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 0 32 C 120 32, 200 10, 300 10 C 400 10, 480 32, 600 32"
            stroke={goldBorder}
            strokeWidth="0.8"
            strokeOpacity="0.75"
          />
        </svg>

        {/* Plinth Body with Blessing Text */}
        <div
          className="relative pt-1 pb-4 sm:pb-5 px-5 sm:px-8 text-center"
          style={{
            background: bgGradient,
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.25)",
          }}
        >
          <p className="font-serif italic text-[12px] xs:text-[12.5px] sm:text-[13.5px] text-[#FFE8A3] leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] max-w-sm sm:max-w-md mx-auto">
            &ldquo;{blessing}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
