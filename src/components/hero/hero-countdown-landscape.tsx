"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  getWeddingCountdown,
  type WeddingCountdownData,
  WEDDING_CEREMONY_TARGET_ISO,
  WEDDING_CEREMONY_TARGET_UTC,
} from "@/lib/lifecycle";
import { useMotionReduced, MOTION_EASINGS } from "@/lib/motion";
import { AmbientGlow, GoldLightSweep } from "@/components/effects";

interface CountdownClientSnapshot extends WeddingCountdownData {
  mounted: boolean;
}

const SERVER_SNAPSHOT: CountdownClientSnapshot = {
  days: 24,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isPast: false,
  isWeddingArrived: false,
  isMemoriesMode: false,
  targetIso: WEDDING_CEREMONY_TARGET_ISO,
  targetUtc: WEDDING_CEREMONY_TARGET_UTC,
  targetFormatted: "21 November 2026 · 11:00 PM IST",
  mounted: false,
};

let currentSnapshot: CountdownClientSnapshot = SERVER_SNAPSHOT;

function updateSnapshot() {
  const data = getWeddingCountdown();
  currentSnapshot = {
    ...data,
    mounted: true,
  };
}

function subscribe(callback: () => void) {
  let idleTimer: ReturnType<typeof setTimeout> | number | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const startTicking = () => {
    updateSnapshot();
    callback();
    if (!intervalId) {
      intervalId = setInterval(() => {
        if (typeof document !== "undefined" && document.hidden) return;
        updateSnapshot();
        callback();
      }, 1000);
    }
  };

  // Settle live client countdown on idle to avoid hydration main-thread contention
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    idleTimer = window.requestIdleCallback(startTicking, { timeout: 3500 });
  } else {
    idleTimer = setTimeout(startTicking, 2500);
  }

  return () => {
    if (idleTimer !== null) {
      if (typeof window !== "undefined" && "cancelIdleCallback" in window && typeof idleTimer === "number") {
        window.cancelIdleCallback(idleTimer);
      } else {
        clearTimeout(idleTimer as ReturnType<typeof setTimeout>);
      }
    }
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  };
}

function getSnapshot(): CountdownClientSnapshot {
  return currentSnapshot;
}

function getServerSnapshot(): CountdownClientSnapshot {
  return SERVER_SNAPSHOT;
}

export interface HeroCountdownProps {
  className?: string;
}

/**
 * Animated Countdown Digit with fixed-width tabular numerals.
 * Ensures zero layout shift while delivering a smooth luxury settling motion when values update.
 */
export function CountdownDigit({
  value,
  colorClass = "text-[#FFFDF8]",
  shadowClass = "drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]",
  style,
  shouldReduceMotion = false,
}: {
  value: string;
  colorClass?: string;
  shadowClass?: string;
  style?: React.CSSProperties;
  shouldReduceMotion?: boolean;
}) {
  if (shouldReduceMotion) {
    return (
      <span
        style={style}
        className={`font-serif text-[1.48rem] sm:text-[2.08rem] font-medium leading-none tracking-tight tabular-nums inline-block w-[2.2ch] text-center ${colorClass} ${shadowClass}`}
      >
        {value}
      </span>
    );
  }

  return (
    <span className="font-serif text-[1.48rem] sm:text-[2.08rem] font-medium leading-none tracking-tight tabular-nums relative inline-block overflow-hidden h-[1.15em] w-[2.2ch] text-center align-middle">
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          initial={{ y: "-40%", opacity: 0.3 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "40%", opacity: 0 }}
          transition={{
            duration: 0.22,
            ease: MOTION_EASINGS.luxury as [number, number, number, number],
          }}
          style={style}
          className={`absolute inset-0 flex items-center justify-center ${colorClass} ${shadowClass}`}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * HeroCountdown — Original Dark Wine-Glass Wedding Countdown Plaque (10% Enhanced Visual Presence)
 * 
 * Floating translucent deep burgundy / dark wine-glass plaque positioned in the upper-right
 * area of the full-bleed hero portrait beneath the navigation.
 * 
 * Features:
 * - Deep burgundy / dark wine-glass surface with blur
 * - Specular gold corner highlights
 * - Cormorant Garamond tabular digits with smooth settling motion
 * - Gold labels: DAYS, HOURS, MINS, SECS (SECS in sindoor red)
 * - Exact countdown target: 21 November 2026 · 11:00 PM IST
 */
export function HeroCountdownLandscape({ className = "" }: HeroCountdownProps) {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const shouldReduceMotion = useMotionReduced();

  return (
    <div
      aria-label="Wedding ceremony countdown timer"
      className={`relative w-[310px] sm:w-[335px] lg:w-[345px] xl:w-[360px] max-w-full mx-auto lg:mr-0 lg:ml-auto pt-2.5 sm:pt-3 select-none ${className}`}
    >
      {/* Ambient Atmospheric Underglow */}
      <AmbientGlow
        variant="gold"
        position="center"
        size="sm"
        opacity={0.35}
        pulse={true}
        className="-z-10"
      />

      {/* Layer 1: Outer Plaque (overflow-visible to prevent clipping top decorations & corner highlights) */}
      <div className="relative rounded-2xl sm:rounded-[18px] p-[3px] border border-[#D4AF37]/65 shadow-[0_14px_42px_rgba(0,0,0,0.75),0_0_24px_rgba(212,175,55,0.25)] transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_32px_rgba(212,175,55,0.35)] overflow-visible">
        {/* Layer 2: Isolated Gold Light Sweep (clipped inside plaque radius) */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-[18px] overflow-hidden pointer-events-none z-0">
          <GoldLightSweep trigger="continuous" durationSeconds={8} intensity="subtle" />
        </div>

        {/* Specular Corner Glows (illuminated gold highlights) */}
        <div
          className="absolute -top-[1px] -left-[1px] w-5 sm:w-6 h-5 sm:h-6 rounded-tl-2xl border-t-2 border-l-2 border-[#FFE8A3] opacity-90 drop-shadow-[0_0_4px_rgba(255,232,163,0.85)] pointer-events-none z-10"
          aria-hidden="true"
        />
        <div
          className="absolute -top-[1px] -right-[1px] w-5 sm:w-6 h-5 sm:h-6 rounded-tr-2xl border-t-2 border-r-2 border-[#FFE8A3] opacity-90 drop-shadow-[0_0_4px_rgba(255,232,163,0.85)] pointer-events-none z-10"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-[1px] -left-[1px] w-5 sm:w-6 h-5 sm:h-6 rounded-bl-2xl border-b-2 border-l-2 border-[#FFE8A3] opacity-75 drop-shadow-[0_0_3px_rgba(255,232,163,0.7)] pointer-events-none z-10"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-[1px] -right-[1px] w-5 sm:w-6 h-5 sm:h-6 rounded-br-2xl border-b-2 border-r-2 border-[#FFE8A3] opacity-75 drop-shadow-[0_0_3px_rgba(255,232,163,0.7)] pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Layer 3A: Refined Ornamental Diamond Centered on the Top Border (fully unclipped) */}
        <div
          className="absolute -top-[6px] left-1/2 -translate-x-1/2 flex items-center gap-1 z-30 pointer-events-none select-none whitespace-nowrap"
          aria-hidden="true"
        >
          <span className="w-6 sm:w-9 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <div className="relative w-3.5 h-3.5 rotate-45 border border-[#D4AF37] bg-[#220B13] flex items-center justify-center shadow-[0_0_8px_rgba(212,175,55,0.75)]">
            <span className="w-1.5 h-1.5 bg-[#D4AF37]" />
          </div>
          <span className="w-6 sm:w-9 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </div>

        {/* Layer 3B: Inner Plaque: Translucent Deep Burgundy Glass with Second Hairline Border */}
        <div
          style={{
            backgroundColor: "rgba(35, 10, 18, 0.84)",
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
          }}
          className="relative z-10 rounded-[12px] sm:rounded-[15px] px-3 py-2 sm:px-3.5 sm:py-2.5 border border-[#D4AF37]/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_-1px_1px_rgba(212,175,55,0.16)]"
        >
          {time.isMemoriesMode ? (
            /* ============================================================ */
            /* STATE 1: MEMORIES MODE (Post 23 Nov 00:00 IST)               */
            /* ============================================================ */
            <div className="text-center py-0.5">
              <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-sans font-semibold uppercase tracking-[0.16em] text-[#D4AF37] bg-[#B8975E]/20 border border-[#D4AF37]/40 mb-0.5">
                Eternal Memories Archive
              </span>

              <h3 className="font-serif text-sm sm:text-base font-normal text-[#FFFDF8] tracking-wide">
                Solemnized With Divine Blessings
              </h3>

              <p className="font-serif italic text-[11px] text-[#E8DFD5] mt-0.5 leading-relaxed max-w-xs mx-auto">
                Our sacred Vedic rituals have concluded with eternal joy.
              </p>

              <div className="mt-1.5 pt-1 border-t border-[#D4AF37]/25">
                <Link
                  href="/gallery"
                  className="inline-flex items-center justify-center gap-1 text-[9.5px] font-sans font-semibold uppercase tracking-wider text-[#FF6B7A] hover:text-[#FFA3B0] transition-colors"
                >
                  <span>View Wedding Memories Gallery</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          ) : time.isWeddingArrived ? (
            /* ============================================================ */
            /* STATE 2: WEDDING CEREMONY UNDERWAY (From 21 Nov 11:00 PM IST)*/
            /* ============================================================ */
            <div className="text-center py-0.5">
              <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-sans font-semibold uppercase tracking-[0.16em] text-[#FF6B7A] bg-[#A52232]/25 border border-[#FF6B7A]/40 mb-0.5">
                The Sacred Wedding Is Underway
              </span>

              <h3 className="font-serif text-sm sm:text-base font-normal text-[#FFFDF8] tracking-wide">
                Saat Phere &amp; Sindoor Daan
              </h3>

              <p className="font-serif italic text-[11px] text-[#E8DFD5] mt-0.5 leading-relaxed max-w-xs mx-auto">
                Under the holy floral Mandap, Mithun &amp; Sakhi unite in sacred matrimony.
              </p>

              <div className="mt-1.5 pt-1 border-t border-[#D4AF37]/25 text-[9.5px] text-[#F3ECE0] font-sans font-medium">
                21 November 2026 &bull; 11:00 PM IST
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* STATE 3: PRE-WEDDING COUNTDOWN (Target: 21 Nov 11:00 PM IST) */
            /* ============================================================ */
            <>
              {/* Heading: THE SACRED VOWS BEGIN IN flanked by thin horizontal gold lines */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 pb-1 select-none">
                <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#D4AF37]/80" />
                <span className="text-[9.5px] sm:text-[10px] lg:text-[9.5px] font-sans font-semibold uppercase tracking-[0.24em] text-[#E8C882] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  The Sacred Vows Begin In
                </span>
                <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#D4AF37]/80" />
              </div>

              {/* 4 Values Horizontal Strip with Diamond-Centered Hairline Dividers */}
              <div
                className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center text-center my-1 sm:my-1.5"
                role="timer"
                aria-live="polite"
              >
                {/* Days */}
                <div className="flex flex-col items-center justify-center px-0.5 sm:px-1">
                  <CountdownDigit
                    value={time.mounted ? String(time.days).padStart(2, "0") : "--"}
                    colorClass="text-[#FFFDF8]"
                    shadowClass="drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <span className="text-[9px] sm:text-[9.5px] lg:text-[8.5px] font-sans font-semibold uppercase tracking-[0.2em] text-[#D4AF37]/90 mt-1">
                    Days
                  </span>
                </div>

                {/* Divider 1 */}
                <div className="flex flex-col items-center justify-center h-8 sm:h-9 select-none opacity-85 px-0.5 sm:px-1" aria-hidden="true">
                  <span className="w-[1px] h-3 bg-gradient-to-b from-transparent to-[#D4AF37]/60" />
                  <span className="text-[6px] text-[#D4AF37] leading-none my-0.5 drop-shadow-[0_0_3px_rgba(212,175,55,0.6)]">◆</span>
                  <span className="w-[1px] h-3 bg-gradient-to-t from-transparent to-[#D4AF37]/60" />
                </div>

                {/* Hours */}
                <div className="flex flex-col items-center justify-center px-0.5 sm:px-1">
                  <CountdownDigit
                    value={time.mounted ? String(time.hours).padStart(2, "0") : "--"}
                    colorClass="text-[#FFFDF8]"
                    shadowClass="drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <span className="text-[9px] sm:text-[9.5px] lg:text-[8.5px] font-sans font-semibold uppercase tracking-[0.2em] text-[#D4AF37]/90 mt-1">
                    Hours
                  </span>
                </div>

                {/* Divider 2 */}
                <div className="flex flex-col items-center justify-center h-8 sm:h-9 select-none opacity-85 px-0.5 sm:px-1" aria-hidden="true">
                  <span className="w-[1px] h-3 bg-gradient-to-b from-transparent to-[#D4AF37]/60" />
                  <span className="text-[6px] text-[#D4AF37] leading-none my-0.5 drop-shadow-[0_0_3px_rgba(212,175,55,0.6)]">◆</span>
                  <span className="w-[1px] h-3 bg-gradient-to-t from-transparent to-[#D4AF37]/60" />
                </div>

                {/* Minutes */}
                <div className="flex flex-col items-center justify-center px-0.5 sm:px-1">
                  <CountdownDigit
                    value={time.mounted ? String(time.minutes).padStart(2, "0") : "--"}
                    colorClass="text-[#FFFDF8]"
                    shadowClass="drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <span className="text-[9px] sm:text-[9.5px] lg:text-[8.5px] font-sans font-semibold uppercase tracking-[0.2em] text-[#D4AF37]/90 mt-1">
                    Mins
                  </span>
                </div>

                {/* Divider 3 */}
                <div className="flex flex-col items-center justify-center h-8 sm:h-9 select-none opacity-85 px-0.5 sm:px-1" aria-hidden="true">
                  <span className="w-[1px] h-3 bg-gradient-to-b from-transparent to-[#D4AF37]/60" />
                  <span className="text-[6px] text-[#D4AF37] leading-none my-0.5 drop-shadow-[0_0_3px_rgba(212,175,55,0.6)]">◆</span>
                  <span className="w-[1px] h-3 bg-gradient-to-t from-transparent to-[#D4AF37]/60" />
                </div>

                {/* Seconds (Vivid Sindoor Red with Subtle Luminous Glow) */}
                <div className="flex flex-col items-center justify-center px-0.5 sm:px-1">
                  <CountdownDigit
                    value={time.mounted ? String(time.seconds).padStart(2, "0") : "--"}
                    colorClass="text-[#E63946]"
                    shadowClass="drop-shadow-[0_0_10px_rgba(230,57,70,0.55)]"
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <span className="text-[9px] sm:text-[9.5px] lg:text-[8.5px] font-sans font-semibold uppercase tracking-[0.2em] text-[#E63946] mt-1">
                    Secs
                  </span>
                </div>
              </div>

              {/* Authoritative Target Reference Footer Separated by Delicate Gold Line */}
              <div className="pt-2 sm:pt-2.5 mt-1 border-t border-[#D4AF37]/35 flex items-center justify-between text-[8.5px] sm:text-[9px] lg:text-[8.5px] font-sans tracking-[0.14em] uppercase select-none">
                <span className="text-[#FFFDF8] font-medium whitespace-nowrap">
                  21 NOVEMBER 2026 · 11:00 PM IST
                </span>
                <span className="h-2 w-[1px] bg-[#D4AF37]/45 mx-1.5" aria-hidden="true" />
                <span className="text-[#E8C882] font-semibold whitespace-nowrap">
                  PURULIA, WEST BENGAL
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
