"use client";

import React from "react";

/**
 * Centered Royal Lotus Blossom atop the wedding eyebrow.
 * Recreates the golden lotus motif from the design reference.
 */
export function LotusBlossom({ className = "w-9 h-7 text-[#D4AF37]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lotusGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2BF" />
          <stop offset="50%" stopColor="#E5C158" />
          <stop offset="100%" stopColor="#B38938" />
        </linearGradient>
      </defs>
      {/* Center upright petal */}
      <path
        d="M18 3 C18 3, 21.5 9, 21.5 14 C21.5 17.5, 19.8 20, 18 20 C16.2 20, 14.5 17.5, 14.5 14 C14.5 9, 18 3, 18 3 Z"
        fill="url(#lotusGoldGrad)"
        fillOpacity="0.45"
        stroke="url(#lotusGoldGrad)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Left inner petal */}
      <path
        d="M16 8 C16 8, 11 12, 10 16.5 C9.2 20, 12 21.5, 14 21 C15.8 20.5, 17.2 18, 17.2 16"
        fill="url(#lotusGoldGrad)"
        fillOpacity="0.3"
        stroke="url(#lotusGoldGrad)"
        strokeWidth="1.1"
      />
      {/* Right inner petal */}
      <path
        d="M20 8 C20 8, 25 12, 26 16.5 C26.8 20, 24 21.5, 22 21 C20.2 20.5, 18.8 18, 18.8 16"
        fill="url(#lotusGoldGrad)"
        fillOpacity="0.3"
        stroke="url(#lotusGoldGrad)"
        strokeWidth="1.1"
      />
      {/* Left outer swooping petal */}
      <path
        d="M14 15 C14 15, 6 17, 3 21 C2 22.5, 4 23.5, 6.5 23 C10 22.5, 13.5 19.5, 15 17.5"
        fill="url(#lotusGoldGrad)"
        fillOpacity="0.2"
        stroke="url(#lotusGoldGrad)"
        strokeWidth="1"
      />
      {/* Right outer swooping petal */}
      <path
        d="M22 15 C22 15, 30 17, 33 21 C34 22.5, 32 23.5, 29.5 23 C26 22.5, 22.5 19.5, 21 17.5"
        fill="url(#lotusGoldGrad)"
        fillOpacity="0.2"
        stroke="url(#lotusGoldGrad)"
        strokeWidth="1"
      />
      {/* Base jewel dot */}
      <circle cx="18" cy="23.5" r="1.3" fill="url(#lotusGoldGrad)" />
      <circle cx="13" cy="23.5" r="0.8" fill="url(#lotusGoldGrad)" fillOpacity="0.7" />
      <circle cx="23" cy="23.5" r="0.8" fill="url(#lotusGoldGrad)" fillOpacity="0.7" />
    </svg>
  );
}

/**
 * Centered Lotus Blossom atop the countdown panel frame.
 * Includes radiant gold aura and petal wings.
 */
export function CountdownLotusCrest({ className = "w-10 h-7 text-[#FFE8A3]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 44 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="crestGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF6D1" />
          <stop offset="50%" stopColor="#E5C158" />
          <stop offset="100%" stopColor="#C49A38" />
        </linearGradient>
      </defs>
      {/* Central petal */}
      <path
        d="M22 2 C22 2, 25 7, 25 11 C25 14, 23.5 16, 22 16 C20.5 16, 19 14, 19 11 C19 7, 22 2, 22 2 Z"
        fill="url(#crestGoldGrad)"
        stroke="url(#crestGoldGrad)"
        strokeWidth="1"
      />
      {/* Left wing petal */}
      <path
        d="M20 7 C20 7, 15 10, 14 14 C13.5 16, 15.5 17.5, 17 17 C18.5 16.5, 19.5 14.5, 20 13"
        fill="url(#crestGoldGrad)"
        fillOpacity="0.75"
        stroke="url(#crestGoldGrad)"
        strokeWidth="0.9"
      />
      {/* Right wing petal */}
      <path
        d="M24 7 C24 7, 29 10, 30 14 C30.5 16, 28.5 17.5, 27 17 C25.5 16.5, 24.5 14.5, 24 13"
        fill="url(#crestGoldGrad)"
        fillOpacity="0.75"
        stroke="url(#crestGoldGrad)"
        strokeWidth="0.9"
      />
      {/* Outermost flares */}
      <path
        d="M17 13 C17 13, 10 15, 7 18 C5.5 19.5, 7 20.5, 9 20 C12 19.5, 15 17, 17 15"
        fill="url(#crestGoldGrad)"
        fillOpacity="0.4"
        stroke="url(#crestGoldGrad)"
        strokeWidth="0.8"
      />
      <path
        d="M27 13 C27 13, 34 15, 37 18 C38.5 19.5, 37 20.5, 35 20 C32 19.5, 29 17, 27 15"
        fill="url(#crestGoldGrad)"
        fillOpacity="0.4"
        stroke="url(#crestGoldGrad)"
        strokeWidth="0.8"
      />
      {/* Base jewel pedestal */}
      <path
        d="M17 21 L22 18 L27 21 L22 24 Z"
        fill="url(#crestGoldGrad)"
        stroke="url(#crestGoldGrad)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

/**
 * Decorative Flourish Underline under "Mithun & Sakhi".
 * Elegant horizontal tapered filigree with a central diamond knot.
 */
export function NameFlourishUnderline({ className = "w-48 sm:w-64 h-3 text-[#E5C158]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="flourishGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E5C158" stopOpacity="0" />
          <stop offset="25%" stopColor="#E5C158" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#FFF2BF" stopOpacity="1" />
          <stop offset="75%" stopColor="#E5C158" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E5C158" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Left tapered line */}
      <path
        d="M15 8 C50 8, 85 8, 108 8"
        stroke="url(#flourishGold)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Right tapered line */}
      <path
        d="M132 8 C155 8, 190 8, 225 8"
        stroke="url(#flourishGold)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Left accent leaf */}
      <path
        d="M95 8 C100 6, 105 7, 108 8 C105 9, 100 10, 95 8 Z"
        fill="url(#flourishGold)"
      />
      {/* Right accent leaf */}
      <path
        d="M145 8 C140 6, 135 7, 132 8 C135 9, 140 10, 145 8 Z"
        fill="url(#flourishGold)"
      />
      {/* Center diamond jewel */}
      <rect
        x="116"
        y="4"
        width="8"
        height="8"
        rx="1"
        transform="rotate(45 120 8)"
        fill="url(#flourishGold)"
        stroke="#FFF2BF"
        strokeWidth="0.8"
      />
      <circle cx="120" cy="8" r="1.2" fill="#20050C" />
      {/* Flanking dots */}
      <circle cx="111" cy="8" r="1" fill="url(#flourishGold)" />
      <circle cx="129" cy="8" r="1" fill="url(#flourishGold)" />
    </svg>
  );
}

/**
 * Filigree ornament placed between the Blessing quote and the Information Plaque.
 * Small royal crest with twin wing scrolls and central diamond.
 */
export function CenterFiligree({ className = "w-28 sm:w-36 h-4 text-[#D4AF37]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 140 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="centerFiligreeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
          <stop offset="35%" stopColor="#E5C158" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#FFF2BF" stopOpacity="1" />
          <stop offset="65%" stopColor="#E5C158" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Left scroll line */}
      <path
        d="M10 9 C30 9, 45 6, 60 9"
        stroke="url(#centerFiligreeGrad)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Right scroll line */}
      <path
        d="M80 9 C95 6, 110 9, 130 9"
        stroke="url(#centerFiligreeGrad)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Left spiral curl */}
      <path
        d="M56 9 C58 7.5, 62 6, 64 8.5 C65.5 10.5, 63 12, 61 10.5"
        stroke="url(#centerFiligreeGrad)"
        strokeWidth="0.9"
        fill="none"
      />
      {/* Right spiral curl */}
      <path
        d="M84 9 C82 7.5, 78 6, 76 8.5 C74.5 10.5, 77 12, 79 10.5"
        stroke="url(#centerFiligreeGrad)"
        strokeWidth="0.9"
        fill="none"
      />
      {/* Center diamond jewel */}
      <rect
        x="67"
        y="6"
        width="6"
        height="6"
        rx="0.8"
        transform="rotate(45 70 9)"
        fill="url(#centerFiligreeGrad)"
        stroke="#FFF6D1"
        strokeWidth="0.7"
      />
      <circle cx="70" cy="9" r="0.9" fill="#1E060C" />
      {/* Terminal diamond accents */}
      <path d="M22 9 L25 7.5 L28 9 L25 10.5 Z" fill="url(#centerFiligreeGrad)" fillOpacity="0.8" />
      <path d="M112 9 L115 7.5 L118 9 L115 10.5 Z" fill="url(#centerFiligreeGrad)" fillOpacity="0.8" />
    </svg>
  );
}

/**
 * Small Filigree Divider placed under the countdown timestamp.
 */
export function TimestampFiligree({ className = "w-16 h-3 text-[#D4AF37]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M10 6 L35 6" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />
      <path d="M45 6 L70 6" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />
      <rect x="38" y="4" width="4" height="4" transform="rotate(45 40 6)" fill="#FFE8A3" />
      <circle cx="34" cy="6" r="0.8" fill="#D4AF37" />
      <circle cx="46" cy="6" r="0.8" fill="#D4AF37" />
    </svg>
  );
}
