"use client";

import React from "react";

/* ========================================================================= */
/* 1. ARCHITECTURAL CORNER BRACKETS (Venues-Inspired Primary Reference)      */
/* ========================================================================= */

export interface CornerBracketProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color?: string;
  size?: number;
  className?: string;
}

/**
 * Architectural Corner Bracket Ornament
 * Recreates the signature corner brackets of the Venues cards:
 * Crisp curved corner trajectory with an anchored circular finial dot.
 */
export function CornerBracket({
  position,
  color = "#B8975E",
  size = 16,
  className = "",
}: CornerBracketProps) {
  const classes = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2 scale-x-[-1]",
    "bottom-left": "bottom-2 left-2 scale-y-[-1]",
    "bottom-right": "bottom-2 right-2 scale-[-1]",
  }[position];

  return (
    <svg
      className={`absolute ${classes} pointer-events-none select-none z-10 ${className}`}
      style={{ width: size, height: size }}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M 1 12 V 4 C 1 2.34 2.34 1 4 1 H 12"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="5" cy="5" r="1.5" fill={color} />
    </svg>
  );
}

/**
 * Convenience helper that renders all four Corner Brackets on a card container
 */
export function CardCornerBrackets({
  color = "#B8975E",
  size = 16,
  className = "",
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <>
      <CornerBracket position="top-left" color={color} size={size} className={className} />
      <CornerBracket position="top-right" color={color} size={size} className={className} />
      <CornerBracket position="bottom-left" color={color} size={size} className={className} />
      <CornerBracket position="bottom-right" color={color} size={size} className={className} />
    </>
  );
}

/* ========================================================================= */
/* 2. CARD WATERMARKS (Radial Mandala & Botanical Linework)                  */
/* ========================================================================= */

export interface CardMandalaWatermarkProps {
  strokeColor?: string;
  position?: "right" | "left" | "top-right" | "bottom-right" | "center";
  opacity?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Reusable Half-Mandala Watermark Linework along card edges
 * Matches the reference Venues cards: concentric dashed/solid rings, rotated petal arcs,
 * and circular orbit finials that evoke royal stationery engraving.
 */
export function CardMandalaWatermark({
  strokeColor = "#B8975E",
  position = "right",
  opacity = 0.2,
  size = "md",
  className = "",
}: CardMandalaWatermarkProps) {
  const angles = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340];
  const dotAngles = [10, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230, 250, 270, 290, 310, 330, 350];

  const sizeClasses = {
    sm: "w-36 sm:w-48 h-56 sm:h-72",
    md: "w-48 sm:w-64 h-72 sm:h-96",
    lg: "w-64 sm:w-80 h-96 sm:h-[420px]",
  }[size];

  const posClasses = {
    right: "right-0 top-1/2 -translate-y-1/2",
    left: "left-0 top-1/2 -translate-y-1/2 scale-x-[-1]",
    "top-right": "right-0 top-0",
    "bottom-right": "right-0 bottom-0 scale-y-[-1]",
    center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
  }[position];

  return (
    <svg
      className={`absolute ${posClasses} ${sizeClasses} pointer-events-none select-none overflow-visible ${className}`}
      style={{ opacity }}
      viewBox="0 0 200 300"
      fill="none"
      stroke={strokeColor}
      strokeWidth="1"
      aria-hidden="true"
    >
      <circle cx="200" cy="150" r="180" strokeDasharray="3 3" />
      <circle cx="200" cy="150" r="150" />
      <circle cx="200" cy="150" r="120" strokeDasharray="2 4" />
      <circle cx="200" cy="150" r="90" />
      <circle cx="200" cy="150" r="60" />
      <circle cx="200" cy="150" r="30" />
      {angles.map((deg) => (
        <path
          key={deg}
          d="M 200 150 Q 150 120 120 150 Q 150 180 200 150"
          transform={`rotate(${deg} 200 150)`}
          strokeWidth="0.75"
        />
      ))}
      {dotAngles.map((deg) => (
        <circle
          key={deg}
          cx="140"
          cy="150"
          r="2.5"
          transform={`rotate(${deg} 200 150)`}
          fill={strokeColor}
          fillOpacity="0.5"
        />
      ))}
    </svg>
  );
}

/**
 * Corner Mandala Watermark (Quadrant Mandala for upper/lower card corners)
 */
export function CardCornerWatermark({
  position = "top-right",
  color = "#B8975E",
  opacity = 0.22,
  size = 112,
  className = "",
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color?: string;
  opacity?: number;
  size?: number;
  className?: string;
}) {
  const transform = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0 scale-x-[-1]",
    "bottom-left": "bottom-0 left-0 scale-y-[-1]",
    "bottom-right": "bottom-0 right-0 scale-[-1]",
  }[position];

  return (
    <svg
      className={`absolute ${transform} pointer-events-none select-none overflow-visible ${className}`}
      style={{ width: size, height: size, opacity }}
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeWidth="0.75"
      aria-hidden="true"
    >
      <circle cx="0" cy="0" r="75" strokeDasharray="2 3" strokeWidth="0.5" />
      <circle cx="0" cy="0" r="55" strokeWidth="0.5" />
      <circle cx="0" cy="0" r="35" strokeDasharray="1 2" strokeWidth="0.5" />
      <circle cx="0" cy="0" r="18" strokeWidth="0.5" />
      <path d="M 0 0 C 15 20 35 30 50 25 C 55 23 58 20 60 15 C 62 10 62 5 60 0" />
      <path d="M 0 0 C 20 15 30 35 25 50 C 23 55 20 58 15 60 C 10 62 5 62 0 60" />
      <path d="M 0 0 C 25 25 50 50 55 75 C 57 85 65 95 80 100" />
      <path d="M 35 0 C 35 18 18 30 0 35" />
      <path d="M 55 0 C 55 25 30 42 0 50" />
    </svg>
  );
}

/* ========================================================================= */
/* 3. SECTION-LEVEL BACKGROUND DECORATIVE BACKDROPS                          */
/* ========================================================================= */

/**
 * Architectural Section Corner Filigree Linework
 * Placed in top-left / top-right / bottom margins of major editorial sections.
 */
export function SectionCornerFiligree({
  position = "top-left",
  color = "#B8975E",
  opacity = 0.18,
  className = "",
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color?: string;
  opacity?: number;
  className?: string;
}) {
  const transform = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0 scale-x-[-1]",
    "bottom-left": "bottom-0 left-0 scale-y-[-1]",
    "bottom-right": "bottom-0 right-0 scale-[-1]",
  }[position];

  return (
    <svg
      className={`absolute ${transform} w-48 sm:w-64 md:w-72 h-48 sm:h-64 md:h-72 pointer-events-none select-none ${className}`}
      style={{ opacity }}
      viewBox="0 0 200 200"
      fill="none"
      stroke={color}
      aria-hidden="true"
    >
      <path d="M 0 0 C 80 20 120 60 140 140 C 150 180 180 200 200 200" strokeWidth="0.75" />
      <path d="M 0 40 C 60 55 95 90 110 160" strokeWidth="0.5" strokeDasharray="3 3" />
      <path d="M 40 0 C 55 60 90 95 160 110" strokeWidth="0.5" strokeDasharray="3 3" />
      {/* Delicate diamond star at the vertex */}
      <path
        d="M 6 6 L 9 3 L 12 6 L 9 9 Z"
        fill={color}
        fillOpacity="0.6"
      />
    </svg>
  );
}

/**
 * Symmetrical Section Corner Linework (renders both Top-Left and Top-Right)
 */
export function SectionHeaderFiligree({
  color = "#B8975E",
  opacity = 0.18,
}: {
  color?: string;
  opacity?: number;
}) {
  return (
    <>
      <SectionCornerFiligree position="top-left" color={color} opacity={opacity} />
      <SectionCornerFiligree position="top-right" color={color} opacity={opacity} />
    </>
  );
}

/**
 * Bilateral Side Margin Mandala Arcs for Editorial Sections (e.g. Family, Celebrations)
 */
export function SectionSideMandala({
  side = "left",
  color = "#B8975E",
  opacity = 0.15,
  className = "",
}: {
  side?: "left" | "right";
  color?: string;
  opacity?: number;
  className?: string;
}) {
  const isRight = side === "right";
  return (
    <svg
      className={`absolute top-1/2 -translate-y-1/2 ${
        isRight ? "right-0 scale-x-[-1]" : "left-0"
      } w-52 sm:w-64 md:w-80 h-80 sm:h-96 md:h-[440px] pointer-events-none select-none ${className}`}
      style={{ opacity }}
      viewBox="0 0 200 300"
      fill="none"
      stroke={color}
      aria-hidden="true"
    >
      <circle cx="0" cy="150" r="160" strokeDasharray="4 4" strokeWidth="0.75" />
      <circle cx="0" cy="150" r="130" strokeWidth="0.75" />
      <circle cx="0" cy="150" r="100" strokeDasharray="2 4" strokeWidth="0.5" />
      <circle cx="0" cy="150" r="70" strokeWidth="0.5" />
      <path d="M 0 150 C 60 90 90 90 140 150 C 90 210 60 210 0 150" strokeWidth="0.75" />
      <circle cx="140" cy="150" r="3" fill={color} fillOpacity="0.4" />
    </svg>
  );
}

/* ========================================================================= */
/* 4. REUSABLE DECORATIVE CARD WRAPPER                                       */
/* ========================================================================= */

export type DecorativeCardVariant =
  | "gold"       // Champagne Gold (Groom's Home / Venues / Countdown / Hospitality)
  | "rose"       // Soft Blush / Crimson (Bride's Home / Wedding / Ceremonial)
  | "turmeric"   // Turmeric Gold (Haldi)
  | "botanical"  // Muted botanical green (Mehndi)
  | "maroon"     // Deep royal wedding burgundy
  | "parchment";  // Warm ivory stationery

export interface DecorativeCardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: DecorativeCardVariant;
  withCornerBrackets?: boolean;
  withWatermark?: boolean;
  watermarkPosition?: "right" | "left" | "top-right" | "bottom-right";
  interactive?: boolean;
  as?: "article" | "div" | "section";
  children: React.ReactNode;
}

const VARIANT_CONFIGS = {
  gold: {
    bg: "bg-gradient-to-b from-[#FCF9EE] to-[#FAF5E6]",
    border: "border-[#B8975E]/35",
    hoverBorder: "hover:border-[#B8975E]/60",
    shadow: "shadow-[0_12px_40px_rgba(184,151,94,0.08)]",
    hoverShadow: "hover:shadow-[0_16px_48px_rgba(184,151,94,0.14)]",
    bracketColor: "#B8975E",
    watermarkColor: "#B8975E",
  },
  rose: {
    bg: "bg-gradient-to-b from-[#FDF5F5] to-[#FAF0F1]",
    border: "border-[#8E1B29]/30",
    hoverBorder: "hover:border-[#8E1B29]/55",
    shadow: "shadow-[0_12px_40px_rgba(142,27,41,0.06)]",
    hoverShadow: "hover:shadow-[0_16px_48px_rgba(142,27,41,0.12)]",
    bracketColor: "#8E1B29",
    watermarkColor: "#8E1B29",
  },
  turmeric: {
    bg: "bg-gradient-to-b from-[#FEFBF2] to-[#FAF4E2]",
    border: "border-[#D4AF37]/40",
    hoverBorder: "hover:border-[#D4AF37]/75",
    shadow: "shadow-[0_12px_40px_rgba(212,175,55,0.08)]",
    hoverShadow: "hover:shadow-[0_16px_48px_rgba(212,175,55,0.15)]",
    bracketColor: "#B38218",
    watermarkColor: "#D4AF37",
  },
  botanical: {
    bg: "bg-gradient-to-b from-[#F5F9F6] to-[#EDF5F0]",
    border: "border-[#2B5E3F]/35",
    hoverBorder: "hover:border-[#2B5E3F]/65",
    shadow: "shadow-[0_12px_40px_rgba(43,94,63,0.06)]",
    hoverShadow: "hover:shadow-[0_16px_48px_rgba(43,94,63,0.12)]",
    bracketColor: "#2B5E3F",
    watermarkColor: "#2B5E3F",
  },
  maroon: {
    bg: "bg-gradient-to-b from-[#FDF5F6] to-[#F8ECEE]",
    border: "border-[#641522]/35",
    hoverBorder: "hover:border-[#641522]/65",
    shadow: "shadow-[0_12px_40px_rgba(100,21,34,0.08)]",
    hoverShadow: "hover:shadow-[0_16px_48px_rgba(100,21,34,0.14)]",
    bracketColor: "#641522",
    watermarkColor: "#641522",
  },
  parchment: {
    bg: "bg-gradient-to-b from-[#FFFDF9] via-[#FAF6ED] to-[#F7F1E6]",
    border: "border-[#B8975E]/30",
    hoverBorder: "hover:border-[#B8975E]/50",
    shadow: "shadow-[0_12px_40px_rgba(41,35,34,0.05)]",
    hoverShadow: "hover:shadow-[0_16px_48px_rgba(41,35,34,0.09)]",
    bracketColor: "#B8975E",
    watermarkColor: "#B8975E",
  },
};

export function DecorativeCard({
  variant = "gold",
  withCornerBrackets = true,
  withWatermark = true,
  watermarkPosition = "right",
  interactive = true,
  as = "article",
  className = "",
  children,
  ...rest
}: DecorativeCardProps) {
  const config = VARIANT_CONFIGS[variant];
  const Component = as;

  return (
    <Component
      className={`
        relative flex flex-col rounded-2xl border overflow-hidden
        ${config.bg} ${config.border} ${config.shadow}
        ${interactive ? `${config.hoverBorder} ${config.hoverShadow} hover:-translate-y-0.5 transition-all duration-300` : ""}
        ${className}
      `}
      {...rest}
    >
      {/* 4 Architectural Corner Brackets */}
      {withCornerBrackets && <CardCornerBrackets color={config.bracketColor} />}

      {/* Subtle Radial Mandala Watermark */}
      {withWatermark && (
        <CardMandalaWatermark
          strokeColor={config.watermarkColor}
          position={watermarkPosition}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
