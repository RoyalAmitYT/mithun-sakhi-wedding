"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { isMemoriesModeActive } from "@/lib/lifecycle";
import { useMotionReduced, MOTION_EASINGS } from "@/lib/motion";
import {
  CardCornerBrackets,
} from "@/components/ui/decorative-surfaces";
import { MagneticButton } from "@/components/interactive";

const emptySubscribe = () => () => {};

/**
 * Top Archway Framing with Royal Indian Scalloped Arch & Hanging Floral Garlands
 * Recreates the ceremonial mandap toran framing seen in the reference design.
 */
function IndianMandapArchway({ isRight = false }: { isRight?: boolean }) {
  const transform = isRight ? "scaleX(-1)" : undefined;
  return (
    <div
      className={`hidden sm:block absolute top-0 ${
        isRight ? "right-0" : "left-0"
      } sm:w-72 md:w-88 lg:w-[420px] sm:h-96 md:h-[420px] pointer-events-none select-none overflow-hidden z-0`}
      style={{ transform }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 420 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Ambient Radiance behind archway */}
        <radialGradient
          id={`archGlow-${isRight ? "r" : "l"}`}
          cx="0"
          cy="0"
          r="320"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#B8975E" stopOpacity="0.2" />
          <stop offset="60%" stopColor="#B8975E" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#B8975E" stopOpacity="0" />
        </radialGradient>
        <circle cx="0" cy="0" r="320" fill={`url(#archGlow-${isRight ? "r" : "l"})`} />

        {/* Outer Palace Scalloped Arch (Jharokha Arch) */}
        <path
          d="M 0 0 L 260 0 C 275 30 250 60 240 75 C 265 100 250 140 220 155 C 235 185 210 225 175 245 C 185 280 150 315 105 335 C 70 355 30 368 0 375 Z"
          fill="#FFF9F0"
          fillOpacity="0.55"
          stroke="#B8975E"
          strokeWidth="1.4"
          strokeOpacity="0.45"
        />

        {/* Inner Parallel Arch Line */}
        <path
          d="M 0 12 L 245 12 C 260 38 238 62 228 76 C 251 98 238 132 210 146 C 223 172 200 208 166 226 C 174 256 142 290 98 310 C 65 328 26 340 0 348"
          stroke="#B8975E"
          strokeWidth="0.85"
          strokeDasharray="3 3"
          strokeOpacity="0.5"
        />

        {/* Delicate Scallop Cusps Accents */}
        <circle cx="240" cy="75" r="3" fill="#B8975E" fillOpacity="0.6" />
        <circle cx="220" cy="155" r="3" fill="#B8975E" fillOpacity="0.6" />
        <circle cx="175" cy="245" r="3" fill="#B8975E" fillOpacity="0.6" />
        <circle cx="105" cy="335" r="3" fill="#B8975E" fillOpacity="0.6" />

        {/* Top Horizontal Floral Swag / Toran Header along the roofline */}
        <g opacity="0.95">
          {/* Floral base swag line */}
          <path
            d="M 0 15 Q 120 28 240 15"
            stroke="#B8975E"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          {/* Cluster of red roses and golden marigolds along the top border */}
          {[
            { cx: 20, cy: 12, r: 12, c: "#9B1E30" },
            { cx: 38, cy: 16, r: 10, c: "#E5A93C" },
            { cx: 56, cy: 14, r: 13, c: "#7D1525" },
            { cx: 75, cy: 17, r: 10, c: "#B32438" },
            { cx: 94, cy: 15, r: 12, c: "#E5A93C" },
            { cx: 114, cy: 18, r: 14, c: "#9B1E30" },
            { cx: 135, cy: 16, r: 11, c: "#FFF8EB" },
            { cx: 155, cy: 19, r: 13, c: "#7D1525" },
            { cx: 176, cy: 17, r: 11, c: "#E5A93C" },
            { cx: 198, cy: 18, r: 13, c: "#B32438" },
            { cx: 220, cy: 16, r: 11, c: "#9B1E30" },
            { cx: 240, cy: 14, r: 9, c: "#E5A93C" },
          ].map((fl, idx) => (
            <g key={`swag-${idx}`}>
              <circle cx={fl.cx} cy={fl.cy} r={fl.r} fill={fl.c} opacity="0.9" />
              <circle
                cx={fl.cx}
                cy={fl.cy}
                r={fl.r * 0.55}
                fill={fl.c === "#E5A93C" ? "#FFF8EB" : "#E8929E"}
                opacity="0.8"
              />
              <circle cx={fl.cx} cy={fl.cy} r={fl.r * 0.25} fill="#FFFDF9" />
            </g>
          ))}
        </g>

        {/* Hanging Floral Garlands (Genda / Marigold, Mogra & Crimson Roses) */}
        {/* String 1: Outer long garland */}
        <g opacity="0.92">
          <path
            d="M 240 15 C 240 55 235 105 230 160 C 226 200 222 245 220 285"
            stroke="#B8975E"
            strokeWidth="0.7"
            strokeDasharray="1 2.5"
            strokeOpacity="0.55"
          />
          {/* Marigold & Jasmine Floral Beads */}
          {[28, 48, 68, 88, 108, 128, 148, 168, 188, 208, 228, 248, 268].map(
            (y, i) => (
              <g key={`s1-${y}`}>
                <circle
                  cx={238 - i * 1.3}
                  cy={y}
                  r={i % 2 === 0 ? "5" : "3.8"}
                  fill={i % 3 === 0 ? "#9B1E30" : i % 2 === 0 ? "#E5A93C" : "#FFF8EB"}
                  stroke="#B8975E"
                  strokeWidth="0.5"
                />
                {i % 3 === 0 && (
                  <circle
                    cx={238 - i * 1.3}
                    cy={y}
                    r="2"
                    fill="#FFF8EB"
                  />
                )}
              </g>
            )
          )}
          {/* Pendant tassel */}
          <path
            d="M 221 285 L 221 305 M 218 305 L 224 305 M 221 305 L 221 315"
            stroke="#A52232"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>

        {/* String 2: Medium garland */}
        <g opacity="0.88">
          <path
            d="M 195 145 C 190 180 185 215 180 255"
            stroke="#B8975E"
            strokeWidth="0.65"
            strokeDasharray="1 2.5"
            strokeOpacity="0.5"
          />
          {[160, 180, 200, 220, 240, 260].map((y, i) => (
            <circle
              key={`s2-${y}`}
              cx={192 - i * 2.2}
              cy={y}
              r={i % 2 === 0 ? "4.5" : "3.2"}
              fill={i % 2 === 0 ? "#E5A93C" : "#A52232"}
              stroke="#B8975E"
              strokeWidth="0.5"
            />
          ))}
          <path
            d="M 179 265 L 179 282"
            stroke="#A52232"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>

        {/* String 3: Inner delicate hanging pendant */}
        <g opacity="0.85">
          <path
            d="M 155 225 C 150 255 145 285 140 310"
            stroke="#B8975E"
            strokeWidth="0.6"
            strokeDasharray="1 2"
            strokeOpacity="0.45"
          />
          {[238, 258, 278, 298].map((y, i) => (
            <circle
              key={`s3-${y}`}
              cx={152 - i * 3.2}
              cy={y}
              r="3.5"
              fill={i % 2 === 0 ? "#FFF8EB" : "#E5A93C"}
              stroke="#B8975E"
              strokeWidth="0.5"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

/**
 * Bottom Corner Wedding Rose & Gold Foliage Cluster
 */
function IndianBottomFloralCluster({ isRight = false }: { isRight?: boolean }) {
  const transform = isRight ? "scaleX(-1)" : undefined;
  return (
    <div
      className={`hidden sm:block absolute bottom-0 ${
        isRight ? "right-0" : "left-0"
      } sm:w-60 md:w-72 lg:w-80 sm:h-52 md:h-60 pointer-events-none select-none overflow-hidden z-0`}
      style={{ transform }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft warm pinkish-gold base gradient */}
        <radialGradient
          id={`botGlow-${isRight ? "r" : "l"}`}
          cx="0"
          cy="240"
          r="200"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#A52232" stopOpacity="0.12" />
          <stop offset="50%" stopColor="#B8975E" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#B8975E" stopOpacity="0" />
        </radialGradient>
        <circle cx="0" cy="240" r="200" fill={`url(#botGlow-${isRight ? "r" : "l"})`} />

        {/* Botanical stems & golden leaves */}
        <path
          d="M 0 240 C 40 200 80 170 140 160 C 180 155 210 170 230 190"
          stroke="#B8975E"
          strokeWidth="1.2"
          strokeOpacity="0.4"
        />
        <path
          d="M 50 205 C 70 175 105 150 150 145"
          stroke="#B8975E"
          strokeWidth="0.8"
          strokeOpacity="0.35"
        />

        {/* Leaves */}
        <path
          d="M 120 165 C 135 150 150 155 145 170 C 135 175 125 170 120 165 Z"
          fill="#B8975E"
          fillOpacity="0.3"
          stroke="#B8975E"
          strokeWidth="0.6"
        />
        <path
          d="M 85 185 C 95 170 110 172 105 185 C 95 190 90 188 85 185 Z"
          fill="#B8975E"
          fillOpacity="0.25"
          stroke="#B8975E"
          strokeWidth="0.6"
        />

        {/* Crimson Rose Petal Clusters */}
        {/* Main Corner Blossom */}
        <circle cx="35" cy="210" r="26" fill="#7D1525" fillOpacity="0.85" />
        <circle cx="35" cy="210" r="21" fill="#9B1E30" fillOpacity="0.9" />
        <circle cx="35" cy="210" r="15" fill="#B32438" fillOpacity="0.95" />
        <circle cx="35" cy="210" r="9" fill="#C93248" />
        <circle cx="35" cy="210" r="4" fill="#E8929E" />

        {/* Secondary Blossom */}
        <circle cx="85" cy="218" r="19" fill="#7D1525" fillOpacity="0.8" />
        <circle cx="85" cy="218" r="14" fill="#9B1E30" fillOpacity="0.85" />
        <circle cx="85" cy="218" r="9" fill="#B32438" fillOpacity="0.9" />

        {/* Tertiary Blossom */}
        <circle cx="55" cy="170" r="15" fill="#9B1E30" fillOpacity="0.75" />
        <circle cx="55" cy="170" r="10" fill="#B32438" fillOpacity="0.8" />
        <circle cx="55" cy="170" r="5" fill="#E8929E" />

        {/* Small Golden Bud */}
        <circle cx="150" cy="145" r="6" fill="#E5A93C" fillOpacity="0.85" />
        <circle cx="150" cy="145" r="3" fill="#FFF8EB" />
      </svg>
    </div>
  );
}

/**
 * Corner Botanical Watermark SVG for Central RSVP Card
 */
function CardCornerWatermark({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  let styleClasses = "absolute w-24 h-24 sm:w-28 sm:h-28 pointer-events-none opacity-22 select-none";
  if (position === "top-left") {
    styleClasses += " top-0 left-0";
  } else if (position === "top-right") {
    styleClasses += " top-0 right-0 scale-x-[-1]";
  } else if (position === "bottom-left") {
    styleClasses += " bottom-0 left-0 scale-y-[-1]";
  } else {
    styleClasses += " bottom-0 right-0 scale-[-1]";
  }

  return (
    <svg
      className={styleClasses}
      viewBox="0 0 100 100"
      fill="none"
      stroke="#B8975E"
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

/**
 * Elegant Golden Lotus Blossom sitting atop the central card
 */
function LotusTopOrnament() {
  return (
    <div
      className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center px-3 py-0.5 bg-[#FFFDF9] rounded-full shadow-xs border border-[#B8975E]/30"
      aria-hidden="true"
    >
      <svg
        className="w-8 h-6 text-[#B8975E]"
        viewBox="0 0 32 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Center Lotus Petal */}
        <path
          d="M16 2 C16 2 18.5 8 18.5 13 C18.5 17 16 19 16 19 C16 19 13.5 17 13.5 13 C13.5 8 16 2 16 2 Z"
          fill="#B8975E"
          fillOpacity="0.22"
        />
        {/* Inner Left Petal */}
        <path d="M16 19 C14 17 10 13 10 8 C10 5 12 3 12 3 C12 3 13.5 9 16 14" />
        {/* Inner Right Petal */}
        <path d="M16 19 C18 17 22 13 22 8 C22 5 20 3 20 3 C20 3 18.5 9 16 14" />
        {/* Outer Left Petal */}
        <path d="M16 19 C12 18 5 15 5 10 C5 7 8 6 8 6 C8 6 10 12 16 16" />
        {/* Outer Right Petal */}
        <path d="M16 19 C20 18 27 15 27 10 C27 7 24 6 24 6 C24 6 22 12 16 16" />
        {/* Lotus Calyx Base Curve */}
        <path d="M10 20 C13 22.5 19 22.5 22 20" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

/**
 * Main Guest RSVP & Attendance Section
 * Follows the minimalist luxury wedding RSVP design reference 1:1.
 */
export function RsvpPreviewSection() {
  const shouldReduceMotion = useMotionReduced();
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];
  const isMemories = useSyncExternalStore(
    emptySubscribe,
    () => isMemoriesModeActive(),
    () => false
  );

  return (
    <section
      id="rsvp"
      aria-labelledby="rsvp-title"
      className="relative py-14 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] border-t border-[rgba(184,151,94,0.2)] scroll-mt-24 overflow-hidden"
    >
      {/* 1. Indian Mandap Archway & Hanging Floral Framing (Top Left & Top Right) */}
      <IndianMandapArchway isRight={false} />
      <IndianMandapArchway isRight={true} />

      {/* 2. Indian Bottom Corner Rose & Gold Foliage Clusters (Bottom Left & Bottom Right) */}
      <IndianBottomFloralCluster isRight={false} />
      <IndianBottomFloralCluster isRight={true} />

      <Container size="editorial" className="relative z-10 px-4 sm:px-6 lg:px-8">
        {/* ==================================================================== */}
        {/* SECTION HEADING                                                     */}
        {/* ==================================================================== */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: luxuryEase }}
          className="text-center max-w-2xl mx-auto mb-7 sm:mb-9 lg:mb-12"
        >
          {/* Centered Eyebrow: GUEST RSVP & ATTENDANCE */}
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-2.5 select-none">
            <span className="text-[7px] text-[#A52232] font-bold">◆</span>
            <span className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.24em] text-[#A52232] uppercase">
              {isMemories
                ? "GUEST CELEBRATION ARCHIVE"
                : "GUEST RSVP & ATTENDANCE"}
            </span>
            <span className="text-[7px] text-[#A52232] font-bold">◆</span>
          </div>

          {/* Main Heading: Confirm Your Presence */}
          <h2
            id="rsvp-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-normal tracking-tight text-[#292322] leading-tight"
          >
            {isMemories ? "Sacred Celebrations Concluded" : "Confirm Your Presence"}
          </h2>

          {/* Supporting Subtitle */}
          <p className="font-serif text-sm sm:text-base md:text-[17px] text-[#5C5452] max-w-xl mx-auto mt-2.5 sm:mt-3 leading-relaxed">
            {isMemories
              ? "With deep joy and gratitude, our wedding ceremonies have concluded. We thank our guests for honoring us with their presence and prayers."
              : "Let us know if you'll be joining us for our wedding celebrations."}
          </p>

          {/* Delicate Symmetrical Gold Ornamental Divider */}
          <div
            className="flex items-center justify-center gap-2 mt-4 select-none"
            aria-hidden="true"
          >
            <span className="w-12 sm:w-20 h-[1px] bg-gradient-to-r from-transparent to-[#B8975E]/60" />
            <span className="text-[7px] text-[#B8975E] rotate-45 font-bold">◇</span>
            <span className="text-[9px] text-[#B8975E] rotate-45 font-bold">◆</span>
            <span className="text-[7px] text-[#B8975E] rotate-45 font-bold">◇</span>
            <span className="w-12 sm:w-20 h-[1px] bg-gradient-to-l from-transparent to-[#B8975E]/60" />
          </div>
        </motion.div>

        {/* ==================================================================== */}
        {/* SINGLE CENTRAL RSVP CARD                                             */}
        {/* ==================================================================== */}
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 18, scale: 0.985 }
          }
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.75, delay: 0.08, ease: luxuryEase }}
          className="relative max-w-[680px] mx-auto mt-4 sm:mt-6 lg:mt-8"
        >
          {/* Small Ornamental Lotus Blossom at top center */}
          <LotusTopOrnament />

          {/* Card Body */}
          <div className="relative rounded-[24px] sm:rounded-[28px] bg-gradient-to-b from-[#FFFDF9] to-[#FFF9F0] border border-[#B8975E]/40 p-5 sm:p-7 lg:p-10 shadow-[0_16px_40px_-12px_rgba(184,151,94,0.18),0_4px_16px_-4px_rgba(41,35,34,0.06)] overflow-hidden">
            {/* Architectural Corner Brackets */}
            <CardCornerBrackets color="#B8975E" size={18} />

            {/* Delicate Floral Corner Line-Art Decorations (all 4 corners) */}
            <CardCornerWatermark position="top-left" />
            <CardCornerWatermark position="top-right" />
            <CardCornerWatermark position="bottom-left" />
            <CardCornerWatermark position="bottom-right" />

            {/* Upper Content: Left Circular Badge + Right Text Lockup */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
              {/* LEFT: Circular Soft-Champagne Icon Container */}
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-[#FDF6E9] via-[#F8ECE0] to-[#EEDCC8] border border-[#B8975E]/40 flex items-center justify-center shadow-xs shrink-0">
                {/* Invitation Envelope Icon with Heart Flap Badge */}
                <svg
                  className="w-8 h-8 sm:w-9 sm:h-9 text-[#A52232]"
                  viewBox="0 0 32 32"
                  fill="none"
                  aria-hidden="true"
                >
                  {/* Envelope Base Body */}
                  <rect
                    x="4.5"
                    y="8.5"
                    width="23"
                    height="16"
                    rx="2"
                    stroke="#8A1524"
                    strokeWidth="1.6"
                    fill="#FFFDF9"
                  />
                  {/* Flap V-Line */}
                  <path
                    d="M5 9.5 L16 18.5 L27 9.5"
                    stroke="#8A1524"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Bottom diagonal envelope folds */}
                  <path
                    d="M5 23.5 L11.5 16.5 M27 23.5 L20.5 16.5"
                    stroke="#8A1524"
                    strokeWidth="1.2"
                    strokeOpacity="0.35"
                    strokeLinecap="round"
                  />
                  {/* Sacred Red Heart Seal on Flap */}
                  <path
                    d="M16 17 C14.6 15.3 12.5 16 12.5 17.5 C12.5 19 16 21.5 16 21.5 C16 21.5 19.5 19 19.5 17.5 C19.5 16 17.4 15.3 16 17 Z"
                    fill="#A52232"
                  />
                </svg>
              </div>

              {/* RIGHT: Eyebrow, Heading & Description */}
              <div className="flex-1">
                <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.22em] text-[#A52232] block">
                  {isMemories ? "CELEBRATION ARCHIVE" : "GUEST RSVP"}
                </span>
                <h3 className="font-serif text-2xl sm:text-[28px] md:text-3xl font-normal text-[#292322] mt-0.5 leading-snug">
                  {isMemories ? "Attendance Concluded" : "Are You Joining Us?"}
                </h3>
                <p className="font-sans text-[13.5px] sm:text-[14px] lg:text-xs text-[#5C5452] mt-1.5 leading-relaxed">
                  {isMemories
                    ? "Ceremony attendance confirmations have concluded. Thank you for your warm love and blessings."
                    : "We would be honoured to celebrate these special moments with you. Let us know which ceremonies you'll be joining."}
                </p>
              </div>
            </div>

            {/* Lower Content: Action Buttons */}
            <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-5 sm:mt-6 lg:mt-7 pt-1">
              {/* PRIMARY BUTTON: Submit Your RSVP */}
              <MagneticButton className="flex-1 sm:flex-[1.2] w-full">
                <Link
                  href={isMemories ? "/gallery" : "/rsvp"}
                  className="w-full h-12 sm:h-12.5 px-5 sm:px-6 rounded-xl bg-gradient-to-r from-[#7D1525] via-[#9B1E30] to-[#6A1220] hover:brightness-110 active:scale-[0.98] text-white border border-[#D4AF37]/50 shadow-[0_6px_20px_rgba(155,30,48,0.32)] font-sans font-medium text-sm sm:text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer"
                >
                  {/* Calendar / Checkmark Icon */}
                  <svg
                    className="w-4 h-4 text-white shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <span>
                    {isMemories ? "Explore Memories" : "Submit Your RSVP"}
                  </span>
                  <span aria-hidden="true" className="text-base font-light">
                    &rarr;
                  </span>
                </Link>
              </MagneticButton>

              {/* SECONDARY BUTTON: View Invitation */}
              <MagneticButton className="flex-1 sm:flex-[1.0] w-full sm:w-auto">
                <Link
                  href="/#invitation"
                  className="w-full h-12 sm:h-12.5 px-5 sm:px-6 rounded-xl bg-[#FFFDF9] hover:bg-[#FDF6E8] active:scale-[0.98] text-[#7D1525] border border-[#B8975E]/60 hover:border-[#B8975E] shadow-xs font-sans font-medium text-sm sm:text-[15px] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
                >
                  {/* Invitation Scroll / Sparkle Icon */}
                  <svg
                    className="w-4 h-4 text-[#7D1525] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  <span>View Invitation</span>
                </Link>
              </MagneticButton>
            </div>
          </div>

          {/* Delicate Symmetrical Gold Ornamental Divider Beneath Card */}
          <div
            className="flex items-center justify-center gap-2 mt-8 sm:mt-10 select-none"
            aria-hidden="true"
          >
            <span className="w-16 sm:w-24 h-[1px] bg-gradient-to-r from-transparent to-[#B8975E]/60" />
            <span className="text-[7px] text-[#B8975E] rotate-45 font-bold">◇</span>
            <span className="text-[9px] text-[#B8975E] rotate-45 font-bold">◆</span>
            <span className="text-[7px] text-[#B8975E] rotate-45 font-bold">◇</span>
            <span className="w-16 sm:w-24 h-[1px] bg-gradient-to-l from-transparent to-[#B8975E]/60" />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
