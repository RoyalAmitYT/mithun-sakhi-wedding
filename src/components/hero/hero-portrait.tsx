"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import {
  LotusBlossom,
  NameFlourishUnderline,
  CenterFiligree,
} from "./hero-ornaments";
import { HeroCountdownPortrait } from "./hero-countdown-portrait";
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

export function HeroPortrait() {
  const shouldReduceMotion = useMotionReduced();
  const lifecycleState = useSyncExternalStore<WeddingLifecycleState>(
    emptySubscribe,
    () => getWeddingLifecycleState(),
    () => "pre_wedding"
  );

  const narrative = getHeroLifecycleNarrative(lifecycleState);

  // Parallax and scroll-linked depth transitions
  const { scrollY } = useScroll();
  const bgParallaxY = useTransform(scrollY, [0, 900], [0, 90]);
  const contentOpacity = useTransform(scrollY, [0, 500, 950], [1, 0.94, 0.45]);
  const contentScale = useTransform(scrollY, [0, 950], [1, 0.985]);

  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];

  return (
    <div
      className="relative w-full min-h-[100dvh] pt-14 xs:pt-16 sm:pt-20 md:pt-24 pb-24 xs:pb-28 sm:pb-32 flex flex-col justify-between overflow-hidden bg-[#150409]"
    >
      {/* =========================================================================
          1. FULL-BLEED CINEMATIC BACKGROUND IMAGE & ATMOSPHERIC VIGNETTES
          ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        {/* Solid canvas base */}
        <div className="absolute inset-0 bg-[#150409] -z-20" />

        {/* Master Background Artwork Layer */}
        <motion.div
          suppressHydrationWarning
          initial={
            shouldReduceMotion
              ? { opacity: 1, scale: 1 }
              : { opacity: 0.88, scale: 1.02 }
          }
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
          <img
            src="/images/hero/mithun-sakhi-cinematic-hero-bg.webp"
            alt="Mithun and Sakhi - The Sacred Wedding Celebration"
            fetchPriority="high"
            decoding="sync"
            className="w-full h-full object-cover object-[center_top]"
          />
        </motion.div>

        {/* Top Navbar Scrim: Guarantees high-contrast readability for monogram & menu */}
        <div
          className="absolute top-0 inset-x-0 h-32 sm:h-36 bg-gradient-to-b from-[#0C0205]/85 via-[#130308]/45 to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Mid-Shadow Enhancer: Ensures high-contrast legibility for typography over couple's attire */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#140307]/25 via-42% to-[#140307]/80 pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Ambient Warm Golden Center Glow */}
        <div
          className="absolute top-[35%] sm:top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(229,193,88,0.12)_0%,rgba(165,34,50,0.06)_45%,transparent_70%)] pointer-events-none blur-2xl z-10"
          aria-hidden="true"
        />
      </div>

      {/* =========================================================================
          2. EDITORIAL HERO CONTENT COMPOSITION (VERTICAL SINGLE-COLUMN STACK)
          ========================================================================= */}
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
        className="relative z-20 w-full max-w-[540px] mx-auto px-4 xs:px-5 sm:px-6 md:px-8 mt-auto flex flex-col items-center text-center"
      >
        {/* Top Spacer on mobile: Preserves visibility of Mithun kissing Sakhi's forehead */}
        <div className="w-full h-8 xs:h-12 sm:h-16 shrink-0 pointer-events-none" aria-hidden="true" />

        {/* -------------------------------------------------------------
            2A. TOP ORNAMENTAL LOTUS BLOSSOM MOTIF
            ------------------------------------------------------------- */}
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 8, scale: 0.92 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.5,
            delay: 0.08,
            ease: luxuryEase,
          }}
          className="flex justify-center mb-1 sm:mb-1.5"
          aria-hidden="true"
        >
          <LotusBlossom className="w-7 h-5 sm:w-8 sm:h-6 text-[#E5C158] drop-shadow-[0_2px_8px_rgba(229,193,88,0.35)]" />
        </motion.div>

        {/* -------------------------------------------------------------
            2B. CEREMONIAL EYEBROW
            ------------------------------------------------------------- */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.5,
            delay: 0.12,
            ease: luxuryEase,
          }}
          className="mb-1 xs:mb-1.5 sm:mb-2"
        >
          <div className="inline-flex items-center gap-2 xs:gap-2.5 sm:gap-3 select-none">
            <motion.span
              initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.45,
                delay: 0.22,
                ease: luxuryEase,
              }}
              className="w-5 xs:w-8 sm:w-12 h-[1px] bg-gradient-to-r from-transparent via-[#E5C158]/80 to-[#E5C158] origin-right"
              aria-hidden="true"
            />
            <span className="text-[9px] xs:text-[10px] sm:text-[11.5px] font-sans font-bold tracking-[0.24em] xs:tracking-[0.26em] uppercase text-[#E5C158] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] whitespace-nowrap">
              The Sacred Wedding Celebration
            </span>
            <motion.span
              initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.45,
                delay: 0.22,
                ease: luxuryEase,
              }}
              className="w-5 xs:w-8 sm:w-12 h-[1px] bg-gradient-to-l from-transparent via-[#E5C158]/80 to-[#E5C158] origin-left"
              aria-hidden="true"
            />
          </div>
        </motion.div>

        {/* -------------------------------------------------------------
            2C. MAIN COUPLE CALLIGRAPHIC BRANDING — "Mithun & Sakhi"
            ------------------------------------------------------------- */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.65,
            delay: 0.16,
            ease: luxuryEase,
          }}
          className="w-full relative flex flex-col items-center"
        >
          {/* Ambient Gold Radiance behind Couple Names */}
          <AmbientGlow
            variant="gold"
            position="center"
            size="lg"
            opacity={0.38}
            pulse={true}
            className="-z-10"
          />

          <h1
            id="hero-title-portrait"
            className="font-script text-[clamp(2.85rem,10.5vw,4.5rem)] sm:text-[clamp(4.2rem,8.2vw,5.6rem)] font-normal tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF8] via-[#FFE8A3] to-[#E5C158] leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] select-none px-2 py-0.5"
            style={{
              textShadow:
                "0 2px 10px rgba(0, 0, 0, 0.95), 0 0 25px rgba(229, 193, 88, 0.45), 0 0 50px rgba(212, 175, 55, 0.25)",
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
              <>Mithun &amp; Sakhi</>
            )}
          </h1>

          {/* Decorative Flourish Underline with Diamond Knot */}
          <NameFlourishUnderline className="w-48 xs:w-56 sm:w-64 md:w-72 h-3.5 mx-auto mt-0.5 text-[#E5C158] drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]" />
        </motion.div>

        {/* -------------------------------------------------------------
            2D. ROMANTIC DEDICATION / BLESSING MESSAGE
            ------------------------------------------------------------- */}
        <motion.p
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.55,
            delay: 0.22,
            ease: luxuryEase,
          }}
          className="font-serif italic text-[0.84rem] xs:text-[0.92rem] sm:text-[1.05rem] text-[#FFFDF8] mt-1.5 xs:mt-2 max-w-[340px] xs:max-w-[400px] sm:max-w-xl leading-[1.45] xs:leading-[1.5] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] tracking-wide"
        >
          &ldquo;With our families&apos; blessings, two hearts begin a timeless
          <br className="inline" />
          journey &mdash; united by sacred Vedic vows and a love to cherish forever.&rdquo;
        </motion.p>

        {/* -------------------------------------------------------------
            2E. DELICATE CENTER FILIGREE DIVIDER
            ------------------------------------------------------------- */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.7 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.55,
            delay: 0.26,
            ease: luxuryEase,
          }}
          className="flex items-center justify-center my-1.5 xs:my-2 sm:my-2.5 select-none origin-center"
          aria-hidden="true"
        >
          <CenterFiligree className="w-28 xs:w-32 sm:w-40 h-3.5 text-[#D4AF37] drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]" />
        </motion.div>

        {/* -------------------------------------------------------------
            2F. DOUBLE-COLUMN LUXURY INFORMATION PLAQUE
            ------------------------------------------------------------- */}
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 12, scale: 0.98 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.6,
            delay: 0.3,
            ease: luxuryEase,
          }}
          className="w-full max-w-[340px] xs:max-w-[370px] sm:max-w-[400px] relative select-none group mb-2.5 xs:mb-3"
        >
          {/* Outer Plaque Frame with Champagne-Gold Hairline Border */}
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-[#E5C158]/55 via-[#D4AF37]/30 to-[#E5C158]/45 shadow-[0_8px_32px_rgba(0,0,0,0.7)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.8)] transition-all duration-300">
            {/* Top-Center Ornate Jewel Crest */}
            <div
              className="absolute -top-[5px] left-1/2 -translate-x-1/2 flex items-center gap-1 z-30 pointer-events-none select-none whitespace-nowrap opacity-85"
              aria-hidden="true"
            >
              <span className="w-4 xs:w-6 h-[1px] bg-gradient-to-r from-transparent via-[#E5C158]/70 to-[#E5C158]" />
              <div className="w-2 h-2 rotate-45 border border-[#E5C158] bg-[#2A060F] flex items-center justify-center">
                <span className="w-0.5 h-0.5 bg-[#FFE8A3]" />
              </div>
              <span className="w-4 xs:w-6 h-[1px] bg-gradient-to-l from-transparent via-[#E5C158]/70 to-[#E5C158]" />
            </div>

            {/* Specular Corner Accents */}
            <div
              className="absolute -top-[1px] -left-[1px] w-3 h-3 rounded-tl-xl border-t border-l border-[#FFE8A3]/70 opacity-70 pointer-events-none z-20"
              aria-hidden="true"
            />
            <div
              className="absolute -top-[1px] -right-[1px] w-3 h-3 rounded-tr-xl border-t border-r border-[#FFE8A3]/70 opacity-70 pointer-events-none z-20"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-[1px] -left-[1px] w-3 h-3 rounded-bl-xl border-b border-l border-[#FFE8A3]/60 opacity-60 pointer-events-none z-20"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-[1px] -right-[1px] w-3 h-3 rounded-br-xl border-b border-r border-[#FFE8A3]/60 opacity-60 pointer-events-none z-20"
              aria-hidden="true"
            />

            {/* Inner Velvet Maroon Glass Surface */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(32, 5, 12, 0.88) 0%, rgba(22, 4, 9, 0.92) 50%, rgba(14, 2, 6, 0.95) 100%)",
                backdropFilter: "blur(20px) saturate(140%)",
                WebkitBackdropFilter: "blur(20px) saturate(140%)",
                boxShadow:
                  "inset 0 1px 1px rgba(255, 235, 175, 0.15), inset 0 -1px 1px rgba(0, 0, 0, 0.5)",
              }}
              className="relative rounded-[15px] px-3.5 py-2.5 xs:px-4 xs:py-3 sm:px-5 sm:py-3.5 overflow-hidden border border-[#D4AF37]/25"
            >
              <GlassReflection intensity="subtle" />

              {/* Main Grid: Date Column (Left) | Architectural Divider | Venue Column (Right) */}
              <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] gap-1.5 sm:gap-2 items-center">
                {/* LEFT: Date Block */}
                <div className="flex flex-col items-center text-center px-0.5">
                  <div className="flex items-center gap-1 mb-0.5 text-[8.5px] xs:text-[9.5px] font-sans font-bold uppercase tracking-[0.18em] text-[#E5C158] whitespace-nowrap">
                    <svg
                      className="w-2.5 h-2.5 text-[#E5C158] shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Auspicious Dates</span>
                  </div>
                  <div className="font-serif text-[1.4rem] xs:text-[1.62rem] sm:text-[1.85rem] font-normal text-[#FFFDF8] tracking-tight leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] my-0.5">
                    19 &ndash; 22
                  </div>
                  <div className="text-[8px] xs:text-[8.5px] sm:text-[9.5px] font-sans uppercase tracking-[0.16em] text-[#E5C388] font-bold whitespace-nowrap">
                    November 2026
                  </div>
                </div>

                {/* CENTER: Architectural Divider with Diamond Ornament */}
                <div
                  className="flex flex-col items-center justify-center h-8 sm:h-10 px-0.5 select-none opacity-85"
                  aria-hidden="true"
                >
                  <span className="w-[1px] h-2 sm:h-2.5 bg-gradient-to-b from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
                  <div className="my-0.5 w-1.5 h-1.5 rotate-45 border border-[#FFE8A3] bg-[#3B0C15] flex items-center justify-center shadow-[0_0_4px_rgba(212,175,55,0.8)]">
                    <span className="w-0.5 h-0.5 bg-[#FFE8A3]" />
                  </div>
                  <span className="w-[1px] h-2 sm:h-2.5 bg-gradient-to-t from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
                </div>

                {/* RIGHT: Venue Block */}
                <div className="flex flex-col items-center text-center px-0.5">
                  <div className="flex items-center gap-1 mb-0.5 text-[8.5px] xs:text-[9.5px] font-sans font-bold uppercase tracking-[0.18em] text-[#E5C158] whitespace-nowrap">
                    <svg
                      className="w-2.5 h-2.5 text-[#E5C158] shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Celebration Venue</span>
                  </div>
                  <div className="font-serif text-[1.4rem] xs:text-[1.62rem] sm:text-[1.85rem] font-normal text-[#FFFDF8] tracking-tight leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] my-0.5">
                    Purulia,
                  </div>
                  <div className="text-[8px] xs:text-[8.5px] sm:text-[9.5px] font-sans uppercase tracking-[0.16em] text-[#E5C388] font-bold whitespace-nowrap">
                    West Bengal, India
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* -------------------------------------------------------------
            2G. REFERENCE-ACCURATE COUNTDOWN DAIS
            ------------------------------------------------------------- */}
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 12, scale: 0.98 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.6,
            delay: 0.34,
            ease: luxuryEase,
          }}
          className="w-full max-w-[340px] xs:max-w-[370px] sm:max-w-[400px] flex items-center justify-center mb-2.5 xs:mb-3"
        >
          <HeroCountdownPortrait className="w-full !mx-0" />
        </motion.div>

        {/* -------------------------------------------------------------
            2H. CTA BUTTONS (Side-by-side velvet crimson & translucent gold)
            ------------------------------------------------------------- */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.55,
            delay: 0.4,
            ease: luxuryEase,
          }}
          className="flex flex-row items-center justify-center gap-2 xs:gap-2.5 sm:gap-3.5 w-full max-w-[340px] xs:max-w-[370px] sm:max-w-[420px] mb-3 xs:mb-3.5"
        >
          {/* Primary CTA: EXPLORE CELEBRATIONS */}
          <MagneticButton className="flex-1">
            <Link
              href={narrative.primaryCtaHref}
              className="group w-full h-10 xs:h-11 sm:h-12 px-3 xs:px-4 sm:px-6 rounded-full bg-gradient-to-r from-[#7D1525] via-[#A81E32] to-[#7D1525] hover:from-[#8E1B29] hover:via-[#B82238] hover:to-[#8E1B29] text-white border border-[#FFE8A3]/60 shadow-[0_6px_20px_rgba(168,30,50,0.42),inset_0_1px_0_rgba(255,255,255,0.35)] hover:shadow-[0_10px_26px_rgba(168,30,50,0.55),0_0_18px_rgba(255,232,163,0.3)] flex items-center justify-center gap-1.5 xs:gap-2 text-[10px] xs:text-[11px] sm:text-xs font-sans font-bold uppercase tracking-[0.14em] xs:tracking-[0.16em] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#150409] cursor-pointer whitespace-nowrap"
            >
              <span>{narrative.primaryCtaText.replace(" ↓", "")}</span>
              <span
                className="text-xs sm:text-sm font-normal group-hover:translate-x-1 transition-transform duration-300"
                aria-hidden="true"
              >
                &rarr;
              </span>
            </Link>
          </MagneticButton>

          {/* Secondary CTA: VIEW INVITATION */}
          <MagneticButton className="flex-1">
            <Link
              href={narrative.secondaryCtaHref}
              className="group w-full h-10 xs:h-11 sm:h-12 px-3 xs:px-4 sm:px-6 rounded-full bg-[#1F060D]/85 hover:bg-[#2B0812]/90 text-[#FFFDF8] border border-[#D4AF37]/70 hover:border-[#FFE8A3] shadow-[0_6px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_10px_26px_rgba(212,175,55,0.25),0_0_16px_rgba(255,232,163,0.2)] flex items-center justify-center gap-1.5 xs:gap-2 text-[10px] xs:text-[11px] sm:text-xs font-sans font-bold uppercase tracking-[0.14em] xs:tracking-[0.16em] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#150409] cursor-pointer backdrop-blur-md whitespace-nowrap"
            >
              <svg
                className="w-3.5 h-3.5 text-[#E5C158] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shrink-0"
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
              <span
                className="text-xs sm:text-sm font-normal text-[#E5C158] group-hover:translate-x-1 transition-transform duration-300"
                aria-hidden="true"
              >
                &rarr;
              </span>
            </Link>
          </MagneticButton>
        </motion.div>

        {/* -------------------------------------------------------------
            2I. SCROLL INDICATOR (Embedded directly below buttons)
            ------------------------------------------------------------- */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.55,
            delay: 0.46,
            ease: luxuryEase,
          }}
          className="w-full flex justify-center"
        >
          <ScrollIndicator />
        </motion.div>
      </motion.div>
    </div>
  );
}
