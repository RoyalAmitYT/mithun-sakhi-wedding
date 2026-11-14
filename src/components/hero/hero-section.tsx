"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { HeroCountdown } from "./hero-countdown";
import { ScrollIndicator } from "./scroll-indicator";
import {
  getWeddingLifecycleState,
  getHeroLifecycleNarrative,
  type WeddingLifecycleState,
} from "@/lib/lifecycle";
import { useMotionReduced, MOTION_EASINGS } from "@/lib/motion";
import { AmbientGlow, GlassReflection } from "@/components/effects";
import { MagneticButton } from "@/components/interactive";

const emptySubscribe = () => () => {};

export function HeroSection() {
  const shouldReduceMotion = useMotionReduced();
  const lifecycleState = useSyncExternalStore<WeddingLifecycleState>(
    emptySubscribe,
    () => getWeddingLifecycleState(),
    () => "pre_wedding"
  );

  const narrative = getHeroLifecycleNarrative(lifecycleState);

  // Parallax and scroll-linked depth transitions on desktop
  const { scrollY } = useScroll();
  const bgParallaxY = useTransform(scrollY, [0, 800], [0, 80]);
  const contentOpacity = useTransform(scrollY, [0, 450, 850], [1, 0.92, 0.45]);
  const contentScale = useTransform(scrollY, [0, 850], [1, 0.985]);

  // Transition eases formatted as tuples for Motion
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      style={{ transform: "translate3d(0, 0, 0)", willChange: "transform" }}
      className="relative motion-safe:lg:sticky motion-safe:lg:top-0 motion-safe:lg:z-0 min-h-screen lg:h-screen lg:min-h-0 pt-14 xs:pt-16 sm:pt-20 md:pt-24 lg:pt-[118px] pb-2 xs:pb-3 sm:pb-4 lg:pb-6 flex flex-col justify-between overflow-hidden bg-[#150409]"
    >
      {/* 1. Full-Bleed Cinematic Background Image & Sophisticated Layered Burgundy Overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        {/* Exact Hero Couple Photograph Preserved with Choreographed Initial Entrance & Parallax */}
        <motion.div
          suppressHydrationWarning
          initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0.9, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 1.2,
            ease: luxuryEase,
          }}
          style={
            shouldReduceMotion
              ? undefined
              : {
                  y: bgParallaxY,
                  transform: "translate3d(0, 0, 0)",
                  willChange: "transform",
                }
          }
          className="absolute inset-0 w-full h-full"
        >
          <picture className="absolute inset-0 w-full h-full">
            <source
              media="(max-width: 768px)"
              type="image/avif"
              srcSet="/images/hero-portrait-mobile.avif"
            />
            <source
              media="(max-width: 768px)"
              type="image/webp"
              srcSet="/images/hero-portrait-mobile.webp"
            />
            <source
              type="image/avif"
              srcSet="/images/hero-portrait-desktop.avif"
            />
            <source
              type="image/webp"
              srcSet="/images/hero-portrait-desktop.webp"
            />
            <img
              src="/images/hero-portrait-desktop.webp"
              alt="Mithun and Sakhi - The Sacred Wedding Celebration"
              fetchPriority="high"
              decoding="sync"
              className="w-full h-full object-cover object-[68%_20%] sm:object-[68%_22%] md:object-[68%_22%] lg:object-[68%_20%]"
            />
          </picture>
        </motion.div>

        {/* Fallback solid background */}
        <div className="absolute inset-0 bg-[#150409] -z-10" />

        {/* Layer 0: Global Cinematic Dark Scrim (Decreased by 5% to 6% for luminous clarity) */}
        <div
          className="absolute inset-0 bg-[#0C0205]/6 pointer-events-none"
          aria-hidden="true"
        />

        {/* Layer 0b: Middle Ambient Radial Darkening (Decreased by 5% to 12% peak / 0% outer) */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_52%_42%,rgba(12,2,5,0.12)_0%,rgba(12,2,5,0)_65%,transparent_100%)] pointer-events-none"
          aria-hidden="true"
        />

        {/* Layer 1: Left-side Deep Burgundy Vignette (Protects contrast while seamlessly blending into couple on right) */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.85, delay: 0.05, ease: luxuryEase }}
          className="absolute inset-0 hidden lg:block bg-gradient-to-r from-[#140307]/98 via-[#180309]/92 via-[#1E050D]/80 via-[#20060E]/50 via-[#18040A]/24 to-transparent w-full max-w-[68%]"
          aria-hidden="true"
        />

        {/* Layer 2: Mobile/Tablet Luminous Editorial Vignette — Preserves vivid portrait clarity while providing crisp readability */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.85, delay: 0.05, ease: luxuryEase }}
          className="absolute inset-0 block lg:hidden pointer-events-none"
          aria-hidden="true"
        >
          {/* Subtle top-to-bottom cinematic tone gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#140307]/55 via-[#18040A]/20 via-transparent to-[#140307]/92" />
          {/* Soft atmospheric radial gold-amber warmth focused behind bottom text */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_75%_at_50%_100%,rgba(20,3,7,0.85)_0%,rgba(24,4,10,0.45)_55%,transparent_100%)]" />
        </motion.div>

        {/* Layer 3: Top Navbar Protection Scrim */}
        <div
          className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#120206]/90 via-[#1A050B]/40 to-transparent"
          aria-hidden="true"
        />

        {/* Layer 4: Bottom Scrim for Luminous Wave & Scroll Indicator */}
        <div
          className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#120206] via-[#1A050B]/65 to-transparent"
          aria-hidden="true"
        />

        {/* Layer 5: Luminous Flowing Golden Wave Arcs (Inline lightweight SVG) */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: 0.2, ease: luxuryEase }}
          className="absolute bottom-0 inset-x-0 h-40 pointer-events-none overflow-hidden select-none z-0"
          aria-hidden="true"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 160"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="goldWave1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
                <stop offset="20%" stopColor="#D4AF37" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#FFE8A3" stopOpacity="0.85" />
                <stop offset="75%" stopColor="#D4AF37" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="goldWave2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#B8975E" stopOpacity="0" />
                <stop offset="35%" stopColor="#D4AF37" stopOpacity="0.3" />
                <stop offset="65%" stopColor="#FFE8A3" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#B8975E" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Luminous soft outer halo (pure GPU vector glow) */}
            <path
              d="M-50,130 C300,68 600,138 950,82 C1200,42 1350,108 1500,78"
              stroke="url(#goldWave1)"
              strokeWidth="5.5"
              strokeOpacity="0.35"
            />
            {/* Crisp central gold filament */}
            <path
              d="M-50,130 C300,68 600,138 950,82 C1200,42 1350,108 1500,78"
              stroke="url(#goldWave1)"
              strokeWidth="2.5"
            />
            <path
              d="M-30,145 C350,98 680,152 1050,106 C1280,76 1400,126 1520,102"
              stroke="url(#goldWave2)"
              strokeWidth="1.5"
            />
          </svg>
        </motion.div>
      </div>

      {/* 2. Main Content Composition with Scroll Dimming */}
      <motion.div
        style={
          shouldReduceMotion
            ? undefined
            : {
                opacity: contentOpacity,
                scale: contentScale,
                transform: "translate3d(0, 0, 0)",
                willChange: "opacity, transform",
              }
        }
        className="relative z-10 w-full max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 lg:pl-12 lg:pr-3.5 xl:pl-12 xl:pr-4 2xl:pr-6 my-auto lg:my-0"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
          {/* Left Column: Asymmetrical Editorial Typography Lockup & Information Card (8 cols) */}
          <div className="lg:col-span-8 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Step 2A: Top Ornamental Lotus Blossom Motif */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.08, ease: luxuryEase }}
              className="flex justify-center lg:justify-start mb-1 sm:mb-1.5"
              aria-hidden="true"
            >
              <svg
                className="w-7 h-5 sm:w-8 sm:h-6 text-[#D4AF37]"
                viewBox="0 0 28 20"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 2C14 2 16 7 20 9C20 9 17 11.5 14 11.5C11 11.5 8 9 8 9C12 7 14 2 14 2Z"
                  fill="#D4AF37"
                  fillOpacity="0.3"
                />
                <path
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 11.5C14 11.5 18 14 22.5 12.5C22.5 12.5 21 16.5 14 18C7 16.5 5.5 12.5 5.5 12.5C10 14 14 11.5 14 11.5Z"
                  fill="#D4AF37"
                  fillOpacity="0.2"
                />
                <circle cx="14" cy="18.5" r="1" fill="#D4AF37" />
              </svg>
            </motion.div>

            {/* Step 2B: Ceremonial Eyebrow */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.12, ease: luxuryEase }}
              className="mb-1.5 xs:mb-2 sm:mb-2.5"
            >
              <div className="inline-flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 select-none">
                <motion.span
                  initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: 0.22, ease: luxuryEase }}
                  className="w-4 xs:w-6 sm:w-8 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37] origin-right"
                  aria-hidden="true"
                />
                <span className="text-[9.5px] xs:text-[10.5px] sm:text-xs font-sans font-semibold tracking-[0.22em] xs:tracking-[0.24em] uppercase text-[#D4AF37] drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                  The Sacred Wedding Celebration
                </span>
                <motion.span
                  initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: 0.22, ease: luxuryEase }}
                  className="w-4 xs:w-6 sm:w-8 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37] origin-left"
                  aria-hidden="true"
                />
              </div>
            </motion.div>

            {/* Step 3: Main Couple Branding — Mithun & Sakhi */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.65, delay: 0.16, ease: luxuryEase }}
              className="w-full relative"
            >
              {/* Cinematic Ambient Gold Radiance behind Couple Names */}
              <AmbientGlow
                variant="gold"
                position="center"
                size="lg"
                opacity={0.34}
                pulse={true}
                className="-z-10"
              />
              <h1
                id="hero-title"
                className="font-serif text-[clamp(2.35rem,8.6vw,3.4rem)] sm:text-[clamp(3.5rem,6.8vw,4.8rem)] md:text-[clamp(4.2rem,6.2vw,5.5rem)] lg:text-[4.85rem] xl:text-[5.5rem] 2xl:text-[6.2rem] font-normal tracking-tight text-[#FFFDF8] leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] max-xs:whitespace-normal whitespace-nowrap"
                style={{
                  textShadow:
                    "0 2px 10px rgba(0, 0, 0, 0.95), 0 0 25px rgba(212, 175, 55, 0.42), 0 0 50px rgba(184, 151, 94, 0.22)",
                }}
              >
                {narrative.isMemories ? (
                  <>
                    {narrative.titlePrefix}{" "}
                    <span className="font-light italic text-[#FF8595]">
                      {narrative.titleHighlight}
                    </span>
                  </>
                ) : (
                  <>
                    <span>Mithun</span>{" "}
                    <span
                      className="font-light italic text-[#D4AF37] text-[0.88em] inline-block mx-1"
                      style={{
                        textShadow:
                          "0 2px 8px rgba(0, 0, 0, 0.9), 0 0 28px rgba(212, 175, 55, 0.65), 0 0 55px rgba(212, 175, 55, 0.3)",
                      }}
                    >
                      &amp;
                    </span>{" "}
                    <span>Sakhi</span>
                  </>
                )}
              </h1>
            </motion.div>

            {/* Step 4A: Romantic Dedication Message */}
            <motion.p
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.22, ease: luxuryEase }}
              className="font-serif italic text-[0.92rem] xs:text-[0.98rem] sm:text-[1.12rem] lg:text-[1.32rem] text-[#FFFDF8] mt-1.5 sm:mt-2.5 max-w-[340px] xs:max-w-md sm:max-w-xl lg:max-w-2xl leading-[1.48] sm:leading-[1.6] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-wide"
            >
              &ldquo;With our families&apos; blessings, two hearts begin a timeless journey&mdash;
              <br className="hidden sm:inline" />
              {" "}united by sacred Vedic vows and a love to cherish forever.&rdquo;
            </motion.p>

            {/* Step 4B: Delicate Ornamental Gold Divider */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.7 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.28, ease: luxuryEase }}
              className="flex items-center justify-center lg:justify-start gap-1.5 xs:gap-2 my-2.5 xs:my-3 sm:my-3.5 select-none origin-center"
              aria-hidden="true"
            >
              <span className="w-8 xs:w-12 sm:w-20 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-[#D4AF37]" />
              <span className="text-[8px] text-[#D4AF37]">◆</span>
              <span className="text-[10px] text-[#D4AF37]">◇</span>
              <span className="text-[8px] text-[#D4AF37]">◆</span>
              <span className="w-8 xs:w-12 sm:w-20 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/80 to-[#D4AF37]" />
            </motion.div>

            {/* Step 5 & 7B: Responsive Dual-Plaque Dais (Side-by-Side on Tablet, Stacked on Mobile, Left-Aligned on Desktop) */}
            <div className="w-full flex flex-col md:flex-row items-center md:items-stretch justify-center lg:justify-start gap-3 xs:gap-3.5 md:gap-5 lg:gap-0 mb-3.5 sm:mb-4 lg:mb-5">
              {/* Step 5: Miniature Luxury Wedding Information Plaque (Regal Velvet Maroon Edition) */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: 0.32, ease: luxuryEase }}
                className="w-full max-w-[410px] xs:max-w-[440px] md:max-w-[360px] lg:max-w-[460px] relative select-none group flex flex-col justify-center"
              >
                {/* Outer Architectural Plaque Frame with Refined Champagne-Gold Hairline Border */}
                <div className="relative rounded-2xl p-[1px] sm:p-[1.5px] bg-gradient-to-b from-[#D4AF37]/45 via-[#B8975E]/20 to-[#D4AF37]/35 shadow-[0_12px_36px_rgba(0,0,0,0.65)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.75)] transition-all duration-300 overflow-visible">
                  {/* Specular Corner Accents (Subtle Antique Gold Highlights) */}
                  <div className="absolute -top-[1px] -left-[1px] w-3.5 h-3.5 rounded-tl-xl border-t border-l border-[#FFE8A3]/60 opacity-60 pointer-events-none z-20" aria-hidden="true" />
                  <div className="absolute -top-[1px] -right-[1px] w-3.5 h-3.5 rounded-tr-xl border-t border-r border-[#FFE8A3]/60 opacity-60 pointer-events-none z-20" aria-hidden="true" />
                  <div className="absolute -bottom-[1px] -left-[1px] w-3.5 h-3.5 rounded-bl-xl border-b border-l border-[#FFE8A3]/50 opacity-50 pointer-events-none z-20" aria-hidden="true" />
                  <div className="absolute -bottom-[1px] -right-[1px] w-3.5 h-3.5 rounded-br-xl border-b border-r border-[#FFE8A3]/50 opacity-50 pointer-events-none z-20" aria-hidden="true" />

                  {/* Top Center Ornamental Jewel Crest */}
                  <div
                    className="absolute -top-[4px] left-1/2 -translate-x-1/2 flex items-center gap-1 z-30 pointer-events-none select-none whitespace-nowrap opacity-75"
                    aria-hidden="true"
                  >
                    <span className="w-5 sm:w-8 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
                    <div className="relative w-2.5 h-2.5 rotate-45 border border-[#D4AF37]/80 bg-[#1E060C] flex items-center justify-center">
                      <span className="w-1 h-1 bg-[#FFE8A3]" />
                    </div>
                    <span className="w-5 sm:w-8 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
                  </div>

                  {/* Inner Plaque: Deep Regal Velvet Maroon Glass Surface */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(30, 7, 13, 0.90) 0%, rgba(20, 5, 9, 0.93) 50%, rgba(13, 3, 6, 0.95) 100%)",
                      backdropFilter: "blur(20px) saturate(140%)",
                      WebkitBackdropFilter: "blur(20px) saturate(140%)",
                      boxShadow: "inset 0 1px 1px rgba(255, 235, 175, 0.12), inset 0 -1px 1px rgba(0, 0, 0, 0.4)",
                    }}
                    className="relative rounded-[15px] px-3.5 py-2.5 sm:px-4.5 sm:py-3 overflow-hidden border border-[#D4AF37]/25"
                  >
                    {/* Subtle Isolated Glass Reflection */}
                    <GlassReflection intensity="subtle" />

                    {/* Inner Delicate Framing Stroke */}
                    <div className="absolute inset-1 sm:inset-1.5 rounded-[10px] border border-[#D4AF37]/15 pointer-events-none" aria-hidden="true" />

                    {/* Main Content Grid: Date Area (Left) | Architectural Divider | Location Area (Right) */}
                    <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] gap-1.5 sm:gap-2 items-center">
                      {/* LEFT: Date Block */}
                      <div className="flex flex-col items-center sm:items-start text-center sm:text-left px-0.5 sm:px-1.5">
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1 text-[9.5px] xs:text-[10px] sm:text-[10.5px] lg:text-[8px] font-sans font-bold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-[#E8C882] whitespace-nowrap">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E8C882] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Auspicious Dates</span>
                        </div>
                        <div className="font-serif text-[1.3rem] xs:text-[1.58rem] sm:text-[1.98rem] font-normal text-[#FFFDF9] tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                          19 &ndash; 22
                        </div>
                        <div className="text-[9px] xs:text-[9.5px] sm:text-[10.5px] lg:text-[9.5px] font-sans uppercase tracking-[0.16em] sm:tracking-[0.22em] text-[#E5C388] font-bold mt-0.5 sm:mt-1 whitespace-nowrap">
                          November 2026
                        </div>
                      </div>

                      {/* CENTER: Architectural Divider with Diamond Ornament */}
                      <div className="flex flex-col items-center justify-center h-9 sm:h-11 px-1 sm:px-1.5 select-none opacity-85" aria-hidden="true">
                        <span className="w-[1px] h-2.5 sm:h-3 bg-gradient-to-b from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
                        <div className="my-0.5 sm:my-1 w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 rotate-45 border border-[#FFE8A3] bg-[#420E18] flex items-center justify-center shadow-[0_0_4px_rgba(212,175,55,0.8)]">
                          <span className="w-0.5 h-0.5 bg-[#FFE8A3]" />
                        </div>
                        <span className="w-[1px] h-2.5 sm:h-3 bg-gradient-to-t from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
                      </div>

                      {/* RIGHT: Location Block */}
                      <div className="flex flex-col items-center sm:items-start text-center sm:text-left px-0.5 sm:px-1.5">
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1 text-[9.5px] xs:text-[10px] sm:text-[10.5px] lg:text-[8px] font-sans font-bold uppercase tracking-[0.18em] sm:tracking-[0.24em] text-[#E8C882] whitespace-nowrap">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E8C882] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Celebration Venues</span>
                        </div>
                        <div className="font-serif text-[1.3rem] xs:text-[1.58rem] sm:text-[1.98rem] font-normal text-[#FFFDF9] tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                          Purulia,
                        </div>
                        <div className="text-[9px] xs:text-[9.5px] sm:text-[10.5px] lg:text-[9.5px] font-sans uppercase tracking-[0.16em] sm:tracking-[0.22em] text-[#E5C388] font-bold mt-0.5 sm:mt-1 whitespace-nowrap">
                          West Bengal, India
                        </div>
                      </div>
                    </div>

                    {/* Supporting Ceremony Strip with Integrated Filigree Capsule */}
                    <div className="relative z-10 mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-[#D4AF37]/20 flex items-center justify-center select-none">
                      <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 rounded-full bg-[#140306]/80 border border-[#D4AF37]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                        <span className="text-[6.5px] sm:text-[7px] lg:text-[6.5px] text-[#D4AF37]" aria-hidden="true">◆</span>
                        <span className="text-[8.5px] xs:text-[9px] sm:text-[9.5px] lg:text-[8.5px] font-sans font-semibold uppercase tracking-[0.16em] sm:tracking-[0.20em] text-[#FFF9F0] drop-shadow-sm whitespace-nowrap">
                          Haldi <span className="text-[#D4AF37] mx-0.5 sm:mx-1">·</span> Mehndi <span className="text-[#D4AF37] mx-0.5 sm:mx-1">·</span> Wedding <span className="text-[#D4AF37] mx-0.5 sm:mx-1">·</span> Reception
                        </span>
                        <span className="text-[6.5px] sm:text-[7px] lg:text-[6.5px] text-[#D4AF37]" aria-hidden="true">◆</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 7B: Mobile/Tablet Integrated Countdown */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: 0.36, ease: luxuryEase }}
                className="w-full max-w-[340px] md:max-w-[340px] block lg:hidden flex items-center justify-center"
              >
                <HeroCountdown className="w-full !mx-0" />
              </motion.div>
            </div>

            {/* Step 6: CTA Buttons with Micro-Interactions & Magnetic Hover */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.42, ease: luxuryEase }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 xs:gap-3.5 sm:gap-4 w-full sm:w-auto self-center lg:self-start"
            >
              <MagneticButton className="w-full sm:w-auto">
                <Link
                  href={narrative.primaryCtaHref}
                  className="group w-full sm:w-auto min-w-[190px] xs:min-w-[210px] sm:min-w-[230px] h-11 xs:h-12 sm:h-[50px] px-5 xs:px-6 sm:px-8 rounded-full bg-gradient-to-r from-[#7D1525] via-[#8E1B29] to-[#6A1220] hover:from-[#8E1B29] hover:via-[#9E2030] hover:to-[#7D1525] text-white border border-[#E8929E]/40 shadow-[0_8px_24px_rgba(142,27,41,0.38),inset_0_1px_0_rgba(255,255,255,0.35)] hover:shadow-[0_12px_28px_rgba(142,27,41,0.52),0_0_20px_rgba(232,146,158,0.28)] flex items-center justify-center gap-2 text-xs sm:text-[12.5px] font-sans font-bold uppercase tracking-[0.18em] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.964] md:active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#150409] cursor-pointer"
                >
                  <span>{narrative.primaryCtaText.replace(" ↓", "")}</span>
                  <span className="text-sm font-normal group-hover:translate-x-1.5 transition-transform duration-300" aria-hidden="true">&rarr;</span>
                </Link>
              </MagneticButton>

              <MagneticButton className="w-full sm:w-auto">
                <Link
                  href={narrative.secondaryCtaHref}
                  className="group w-full sm:w-auto min-w-[180px] xs:min-w-[200px] sm:min-w-[220px] h-11 xs:h-12 sm:h-[50px] px-5 xs:px-6 sm:px-8 rounded-full bg-gradient-to-r from-[#22070F]/85 via-[#300B16]/90 to-[#22070F]/85 hover:from-[#300B16] hover:via-[#420F1F] hover:to-[#300B16] text-[#FFFDF8] border border-[#D4AF37]/65 hover:border-[#FFE8A3] shadow-[0_8px_24px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_12px_28px_rgba(212,175,55,0.25),0_0_16px_rgba(255,232,163,0.18)] flex items-center justify-center gap-2.5 text-xs sm:text-[12.5px] font-sans font-bold uppercase tracking-[0.18em] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.964] md:active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#150409] cursor-pointer backdrop-blur-md"
                >
                  <svg
                    className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{narrative.secondaryCtaText}</span>
                  <span className="text-sm font-normal text-[#D4AF37] group-hover:translate-x-1.5 transition-transform duration-300" aria-hidden="true">&rarr;</span>
                </Link>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Step 7A: Right Column: Liquid-Glass Ceremonial Plaque in Upper-Right (4 cols on desktop) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: 0.36, ease: luxuryEase }}
            className="hidden lg:flex lg:col-span-4 flex-col justify-start items-end w-full lg:pt-0"
          >
            <HeroCountdown className="w-full max-w-[340px] xl:max-w-[360px] lg:mr-0 lg:ml-auto" />
          </motion.div>
        </div>
      </motion.div>

      {/* Step 8: Base of Hero: Scroll Indicator */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.55, ease: luxuryEase }}
        className="relative z-10 text-center mt-2 xs:mt-3 sm:mt-4 pb-1 xs:pb-2"
      >
        <ScrollIndicator />
      </motion.div>
    </section>
  );
}
