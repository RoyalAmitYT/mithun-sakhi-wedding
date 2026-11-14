"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { AnimatedDivider } from "@/components/motion/animated-divider";
import { useMotionReduced } from "@/lib/motion";
import { AmbientGlow, GoldLightSweep } from "@/components/effects";
import {
  SectionHeaderFiligree,
  CardCornerBrackets,
  CardMandalaWatermark,
} from "@/components/ui/decorative-surfaces";
import { WishCard } from "@/components/wishes/wish-card";
import { WishSubmissionModal } from "@/components/wishes/wish-submission-modal";
import { MagneticButton } from "@/components/interactive";


export interface ApprovedWish {
  id: string;
  author_display_name: string;
  wish_text: string;
  created_at: string;
}

interface WishesPreviewWallProps {
  initialWishes?: ApprovedWish[];
}

export function WishesPreviewSkeleton() {
  return (
    <section
      id="wishes"
      aria-labelledby="wishes-title"
      className="relative pt-16 sm:pt-22 md:pt-26 lg:pt-32 pb-14 sm:pb-18 md:pb-22 lg:pb-28 bg-[#FFFCF6] border-t border-[rgba(184,151,94,0.2)] scroll-mt-24 overflow-hidden"
    >
      <Container size="wide" className="px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-9 lg:mb-12 animate-pulse">
          <div className="h-4 w-48 bg-[#B8975E]/20 mx-auto rounded-full mb-3" />
          <div className="h-10 w-72 bg-[#B8975E]/25 mx-auto rounded-md mb-3" />
          <div className="h-4 w-96 bg-[#B8975E]/15 mx-auto rounded-md" />
        </div>
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#FFFDF9] border border-[#B8975E]/20 p-8 sm:p-12 text-center shadow-xs animate-pulse">
          <div className="w-16 h-16 rounded-full bg-[#B8975E]/15 mx-auto mb-4" />
          <div className="h-7 w-64 bg-[#B8975E]/20 mx-auto rounded mb-3" />
          <div className="h-4 w-80 bg-[#B8975E]/15 mx-auto rounded" />
        </div>
      </Container>
    </section>
  );
}

/**
 * Doubles a row's items so a 0% -> -50% CSS translation loop is 100% gapless.
 */
function makeSeamlessTrack(items: ApprovedWish[], minLength = 5): ApprovedWish[] {
  if (items.length === 0) return [];
  let base = [...items];
  while (base.length < minLength) {
    base = [...base, ...items];
  }
  return [...base, ...base];
}

export function WishesPreviewWall({ initialWishes = [] }: WishesPreviewWallProps) {
  const shouldReduceMotion = useMotionReduced();
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: "250px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Use initialWishes directly (real DB data only — no sample fixtures in production)
  const wishes = initialWishes;
  const hasWishes = wishes.length > 0;

  // Split wishes into two alternating rows
  const { topRow, bottomRow } = useMemo(() => {
    if (!hasWishes) return { topRow: [], bottomRow: [] };
    const row1: ApprovedWish[] = [];
    const row2: ApprovedWish[] = [];

    wishes.forEach((w, idx) => {
      if (idx % 2 === 0) {
        row1.push(w);
      } else {
        row2.push(w);
      }
    });

    // Ensure both rows have at least some items if available
    if (row2.length === 0 && row1.length > 1) {
      row2.push(row1.pop()!);
    }

    return {
      topRow: makeSeamlessTrack(row1, 6),
      bottomRow: makeSeamlessTrack(row2.length > 0 ? row2 : row1, 6),
    };
  }, [wishes, hasWishes]);

  return (
    <section
      ref={sectionRef}
      id="wishes"
      aria-labelledby="wishes-title"
      className="relative pt-16 sm:pt-22 md:pt-26 lg:pt-32 pb-14 sm:pb-18 md:pb-22 lg:pb-28 bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] border-t border-[rgba(184,151,94,0.2)] scroll-mt-24 overflow-hidden"
    >
      {/* Background Architectural Corner Filigree */}
      <SectionHeaderFiligree color="#B8975E" opacity={0.18} />

      {/* Atmospheric Ambient Lighting Layers */}
      <AmbientGlow variant="champagne" position="top-center" size="lg" opacity={0.35} />
      <AmbientGlow variant="gold" position="bottom-center" size="lg" opacity={0.25} />

      <Container size="wide" className="relative z-10 px-4 sm:px-6 lg:px-8">
        {/* ==================================================================== */}
        {/* 1. SECTION HEADER                                                    */}
        {/* ==================================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-9 lg:mb-12">
          {/* Eyebrow */}
          <Reveal preset="luxury" direction="up" distance={10} threshold={0.15}>
            <div className="flex items-center justify-center gap-2 mb-2.5 select-none">
              <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
              <span className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A67C1E] uppercase">
                BLESSINGS &middot; HEARTFELT GUESTBOOK
              </span>
              <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
            </div>
          </Reveal>

          {/* Main Title: Two-Tone Cormorant Garamond */}
          <Reveal preset="luxury" direction="up" distance={16} delay={0.08} threshold={0.15}>
            <h2
              id="wishes-title"
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal tracking-tight text-[#292322] leading-tight"
            >
              <span>Wishes &amp; </span>
              <span className="text-[#A67C1E] font-normal">Blessings Wall</span>
            </h2>
          </Reveal>

          {/* Supporting Subtitle */}
          <Reveal preset="luxury" direction="up" distance={12} delay={0.16} threshold={0.15}>
            <p className="font-serif italic text-sm sm:text-base md:text-[17px] text-[#5C5452] max-w-2xl mx-auto mt-3 leading-relaxed">
              A sacred guestbook for friends, elders, and loved ones to bestow prayers upon Mithun &amp; Sakhi.
            </p>
          </Reveal>

          {/* Symmetrical Central Animated Gold Divider */}
          <div className="flex justify-center mt-4">
            <AnimatedDivider variant="gold" size="sm" />
          </div>
        </div>

        {/* Top Toolbar: Demo indicator & Play/Pause Controls */}
        {hasWishes && (
          <div className="flex items-center justify-between mb-4 px-2 sm:px-4 max-w-7xl mx-auto">
            {/* Blessings count indicator */}
            <div className="font-sans text-xs text-[#5C5452] tracking-wide select-none">
              {wishes.length} {wishes.length === 1 ? "blessing" : "blessings"} shared
            </div>

            {/* Accessible Animation Play/Pause Toggle */}
            <MagneticButton maxDistanceX={5} maxDistanceY={4}>
              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                aria-label={isPaused ? "Resume blessings animation" : "Pause blessings animation"}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/85 border border-[#B8975E]/35 text-[#5C5452] hover:text-[#292322] hover:bg-white text-xs font-sans transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {isPaused ? (
                  <>
                    <svg
                      className="w-3 h-3 text-[#7B1D28] fill-current"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span className="font-medium">Play Motion</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3 text-[#7B1D28] fill-current"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    <span className="font-medium">Pause Motion</span>
                  </>
                )}
              </button>
            </MagneticButton>
          </div>
        )}
      </Container>

      {/* ==================================================================== */}
      {/* 2. BLESSINGS WALL PRESENTATION — GENUINE FULL-BLEED VIEWPORT TRACKS  */}
      {/* ==================================================================== */}
      {hasWishes ? (
        <div
          className={`relative w-full overflow-x-hidden select-none py-2 my-2 ${
            isPaused || !isInView ? "is-paused" : ""
          }`}
        >
          {/* ROW 1: TOP ROW (LEFT TO RIGHT) */}
          <div
            className="marquee-row relative w-full overflow-hidden py-2 mb-3 sm:mb-4"
            aria-label="Guest blessings moving row 1"
          >
            <div
              className={`marquee-track flex gap-4 sm:gap-6 w-max ${
                shouldReduceMotion ? "" : "animate-marquee-right"
              }`}
            >
              {topRow.map((wish, idx) => {
                const isDuplicate = idx >= topRow.length / 2;
                return (
                  <div
                    key={`top-${wish.id}-${idx}`}
                    aria-hidden={isDuplicate ? "true" : undefined}
                  >
                    <WishCard
                      wish={wish}
                      variant="marquee"
                      accent={idx % 3 === 0}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ROW 2: BOTTOM ROW (RIGHT TO LEFT) */}
          <div
            className="marquee-row relative w-full overflow-hidden py-2"
            aria-label="Guest blessings moving row 2"
          >
            <div
              className={`marquee-track flex gap-4 sm:gap-6 w-max ${
                shouldReduceMotion ? "" : "animate-marquee-left"
              }`}
            >
              {bottomRow.map((wish, idx) => {
                const isDuplicate = idx >= bottomRow.length / 2;
                return (
                  <div
                    key={`bottom-${wish.id}-${idx}`}
                    aria-hidden={isDuplicate ? "true" : undefined}
                  >
                    <WishCard
                      wish={wish}
                      variant="marquee"
                      accent={idx % 3 === 1}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ================================================================== */
        /* EMPTY STATE (0 approved wishes in production)                      */
        /* ================================================================== */
        <Container size="wide" className="relative z-10 px-4 sm:px-6 lg:px-8 mb-4">
          <Reveal preset="luxury" direction="up" distance={16} delay={0.2} threshold={0.15}>
            <div className="relative max-w-4xl mx-auto px-4">
              <div className="relative rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC]/90 to-[#F6EFE3]/80 border border-[#B8975E]/35 p-8 sm:p-12 text-center shadow-[0_16px_48px_rgba(184,151,94,0.1)] overflow-hidden">
                <GoldLightSweep trigger="continuous" durationSeconds={12} intensity="subtle" />
                <CardCornerBrackets color="#B8975E" />
                <CardMandalaWatermark strokeColor="#B8975E" opacity={0.14} position="right" />
                <CardMandalaWatermark strokeColor="#B8975E" opacity={0.14} position="left" />

                <div className="relative w-16 h-16 rounded-full bg-[#FFFDF9] border border-[#B8975E]/40 flex items-center justify-center mx-auto mb-4 shadow-[0_0_28px_rgba(184,151,94,0.28)] ring-4 ring-[#FAF5EC]/80 select-none">
                  <AmbientGlow variant="gold" position="center" size="sm" opacity={0.35} pulse={true} className="-z-10" />
                  <svg
                    className="w-8 h-8 text-[#B8975E]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 3v14" strokeWidth="0.8" strokeDasharray="1 1.5" />
                    <path d="M8.5 7.5C8.5 5 10.5 3 12 3c1.5 0 3.5 2 3.5 4.5v8c0 2-1.5 4.5-3.5 5.5-2-1-3.5-3.5-3.5-5.5v-8z" />
                    <path d="M6.5 11c-.5 1-.5 2.5 0 4 .5 1.5 2 2.5 3 3" />
                    <path d="M17.5 11c.5 1 .5 2.5 0 4-.5 1.5-2 2.5-3 3" />
                  </svg>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-normal tracking-tight text-[#292322]">
                  THE FIRST BLESSINGS ARE YET TO COME
                </h3>

                <p className="font-serif italic text-xs sm:text-sm md:text-[15px] text-[#5C5452] max-w-xl mx-auto mt-2 leading-relaxed">
                  Be the first to bestow prayers and love upon Mithun &amp; Sakhi as they begin their sacred journey together.
                </p>

                <div className="mt-6">
                  <MagneticButton>
                    <button
                      type="button"
                      onClick={() => setIsSubmissionOpen(true)}
                      className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#7B1D28] via-[#8C1E2B] to-[#68141F] text-white font-sans text-xs sm:text-[13px] font-semibold tracking-[0.14em] uppercase shadow-lg shadow-[#7B1D28]/30 hover:shadow-xl hover:shadow-[#7B1D28]/40 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                      <span>WRITE A BLESSING</span>
                    </button>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      )}

      <Container size="wide" className="relative z-10 px-4 sm:px-6 lg:px-8">

        {/* ==================================================================== */}
        {/* 3. MODERATION POLICY BOX                                             */}
        {/* ==================================================================== */}
        <div className="max-w-2xl mx-auto rounded-xl bg-white/80 border border-[#B8975E]/25 px-5 py-3.5 sm:py-4 text-center shadow-xs backdrop-blur-xs mt-8 sm:mt-10">
          <div className="inline-flex items-center gap-1.5 font-sans font-semibold text-[11px] sm:text-xs text-[#7B1D28] tracking-wide mb-1">
            <svg
              className="w-3.5 h-3.5 text-[#7B1D28]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Guest Notice &middot; Moderation Policy</span>
          </div>
          <p className="font-serif text-xs sm:text-[13px] text-[#5C5452] leading-relaxed">
            To preserve reverence, all guest blessings are lovingly reviewed by the family prior to publication on the wall.
          </p>
        </div>

        {/* ==================================================================== */}
        {/* 4. DUAL ACTION BUTTONS (WRITE A BLESSING + VIEW ALL BLESSINGS)       */}
        {/* ==================================================================== */}
        <Reveal preset="luxury" direction="up" distance={14} delay={0.28} threshold={0.15}>
          <div className="mt-7 sm:mt-9 lg:mt-12 text-center select-none">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-full px-2">
              {/* Button 1: Write a Blessing (Primary Burgundy Pill) */}
              <MagneticButton className="w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsSubmissionOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-2.5 px-7 sm:px-9 py-3.5 rounded-full bg-gradient-to-r from-[#7B1D28] via-[#8C1E2B] to-[#68141F] border border-[#B8975E]/40 text-white font-sans font-semibold text-xs sm:text-[13px] tracking-[0.14em] uppercase shadow-lg shadow-[#7B1D28]/25 hover:shadow-xl hover:shadow-[#7B1D28]/35 hover:brightness-105 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/95 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                  <span>WRITE A BLESSING</span>
                </button>
              </MagneticButton>

              {/* Button 2: View All Blessings (Secondary Champagne/Gold Pill) */}
              <MagneticButton className="w-full sm:w-auto">
                <Link
                  href="/wishes"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-2.5 px-7 sm:px-9 py-3.5 rounded-full bg-white/90 hover:bg-[#FFFDF9] border border-[#B8975E]/45 text-[#292322] font-sans font-semibold text-xs sm:text-[13px] tracking-[0.14em] uppercase shadow-md shadow-[#B8975E]/10 hover:shadow-lg hover:border-[#B8975E] hover:brightness-105 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  <span>VIEW ALL BLESSINGS</span>
                  <svg
                    className="w-3.5 h-3.5 text-[#A67C1E] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* Anonymous Guest Wish Submission Modal */}
      <WishSubmissionModal
        isOpen={isSubmissionOpen}
        onClose={() => setIsSubmissionOpen(false)}
      />
    </section>
  );
}
