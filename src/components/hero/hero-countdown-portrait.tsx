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
import { CountdownLotusCrest, TimestampFiligree } from "./hero-ornaments";

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
  shadowClass = "drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]",
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
        className={`font-serif text-[1.65rem] xs:text-[1.85rem] sm:text-[2.1rem] font-medium leading-none tracking-tight tabular-nums inline-block w-[2.1ch] text-center ${colorClass} ${shadowClass}`}
      >
        {value}
      </span>
    );
  }

  return (
    <span className="font-serif text-[1.65rem] xs:text-[1.85rem] sm:text-[2.1rem] font-medium leading-none tracking-tight tabular-nums relative inline-block overflow-hidden h-[1.12em] w-[2.1ch] text-center align-middle">
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
 * HeroCountdown — Reference-Accurate Ornate Countdown Panel
 *
 * Implements the exact ornate silhouette, lotus crest, double-border frame,
 * tabular numerals, sindoor-accented seconds, and date callout from the Hero design reference.
 */
export function HeroCountdownPortrait({ className = "" }: HeroCountdownProps) {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const shouldReduceMotion = useMotionReduced();

  return (
    <div
      aria-label="Wedding ceremony countdown timer"
      className={`relative w-full max-w-[340px] xs:max-w-[365px] sm:max-w-[390px] mx-auto select-none ${className}`}
    >
      {/* Top Center Lotus Blossom Crest */}
      <div
        className="flex justify-center -mb-2.5 relative z-20 pointer-events-none select-none"
        aria-hidden="true"
      >
        <CountdownLotusCrest className="w-9 h-6 xs:w-10 xs:h-7 drop-shadow-[0_0_8px_rgba(255,232,163,0.7)]" />
      </div>

      {/* Main Ornate Outer Frame */}
      <div className="relative rounded-[16px] xs:rounded-[18px] p-[1.5px] bg-gradient-to-b from-[#E5C158]/70 via-[#B8975E]/40 to-[#E5C158]/60 shadow-[0_12px_36px_rgba(0,0,0,0.75),0_0_24px_rgba(212,175,55,0.22)]">
        {/* Decorative Scalloped / Bracketed Corner Flourishes */}
        <div className="absolute -top-[1px] -left-[1px] w-4 h-4 rounded-tl-[15px] border-t-2 border-l-2 border-[#FFE8A3] opacity-85 pointer-events-none z-20" aria-hidden="true" />
        <div className="absolute -top-[1px] -right-[1px] w-4 h-4 rounded-tr-[15px] border-t-2 border-r-2 border-[#FFE8A3] opacity-85 pointer-events-none z-20" aria-hidden="true" />
        <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 rounded-bl-[15px] border-b-2 border-l-2 border-[#FFE8A3] opacity-85 pointer-events-none z-20" aria-hidden="true" />
        <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 rounded-br-[15px] border-b-2 border-r-2 border-[#FFE8A3] opacity-85 pointer-events-none z-20" aria-hidden="true" />

        {/* Inner Translucent Burgundy Glass Surface */}
        <div
          style={{
            backgroundColor: "rgba(26, 4, 10, 0.86)",
            backdropFilter: "blur(16px) saturate(140%)",
            WebkitBackdropFilter: "blur(16px) saturate(140%)",
            boxShadow: "inset 0 1px 1px rgba(255, 235, 175, 0.15), inset 0 -1px 1px rgba(0, 0, 0, 0.5)",
          }}
          className="relative z-10 rounded-[14px] xs:rounded-[16px] pt-2 pb-2.5 px-3 xs:px-3.5 sm:px-4 border border-[#D4AF37]/35 overflow-hidden"
        >
          {/* Inner Hairline Framing Line */}
          <div className="absolute inset-1 xs:inset-1.5 rounded-[11px] border border-[#D4AF37]/15 pointer-events-none" aria-hidden="true" />

          {time.isMemoriesMode ? (
            /* ============================================================ */
            /* STATE 1: MEMORIES MODE (Post 23 Nov 00:00 IST)               */
            /* ============================================================ */
            <div className="text-center py-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[8.5px] font-sans font-semibold uppercase tracking-[0.18em] text-[#D4AF37] bg-[#B8975E]/20 border border-[#D4AF37]/40 mb-1">
                Eternal Memories Archive
              </span>
              <h3 className="font-serif text-sm xs:text-base font-normal text-[#FFFDF8] tracking-wide">
                Solemnized With Divine Blessings
              </h3>
              <p className="font-serif italic text-xs text-[#E8DFD5] mt-0.5 leading-relaxed max-w-xs mx-auto">
                Our sacred Vedic rituals have concluded with eternal joy.
              </p>
              <div className="mt-2 pt-1.5 border-t border-[#D4AF37]/25">
                <Link
                  href="/gallery"
                  className="inline-flex items-center justify-center gap-1.5 text-[10px] font-sans font-semibold uppercase tracking-wider text-[#FF6B7A] hover:text-[#FFA3B0] transition-colors"
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
            <div className="text-center py-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[8.5px] font-sans font-semibold uppercase tracking-[0.18em] text-[#FF6B7A] bg-[#A52232]/25 border border-[#FF6B7A]/40 mb-1">
                The Sacred Wedding Is Underway
              </span>
              <h3 className="font-serif text-sm xs:text-base font-normal text-[#FFFDF8] tracking-wide">
                Saat Phere &amp; Sindoor Daan
              </h3>
              <p className="font-serif italic text-xs text-[#E8DFD5] mt-0.5 leading-relaxed max-w-xs mx-auto">
                Under the holy floral Mandap, Mithun &amp; Sakhi unite in sacred matrimony.
              </p>
              <div className="mt-2 pt-1.5 border-t border-[#D4AF37]/25 text-[10px] text-[#F3ECE0] font-sans font-medium">
                21 November 2026 &bull; 11:00 PM IST
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* STATE 3: PRE-WEDDING COUNTDOWN (Target: 21 Nov 11:00 PM IST) */
            /* ============================================================ */
            <>
              {/* Heading: THE SACRED VOWS BEGIN IN flanked by thin horizontal gold lines */}
              <div className="flex items-center justify-center gap-1.5 xs:gap-2.5 pb-1 select-none">
                <span className="h-[1px] w-6 xs:w-10 sm:w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
                <span className="text-[9px] xs:text-[10px] sm:text-[10.5px] font-cinzel font-semibold uppercase tracking-[0.22em] text-[#FFE8A3] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] whitespace-nowrap">
                  The Sacred Vows Begin In
                </span>
                <span className="h-[1px] w-6 xs:w-10 sm:w-12 bg-gradient-to-l from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
              </div>

              {/* 4 Values Horizontal Strip with Diamond-Centered Hairline Dividers */}
              <div
                className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center text-center my-0.5 xs:my-1"
                role="timer"
                aria-live="polite"
              >
                {/* Days */}
                <div className="flex flex-col items-center justify-center px-0.5">
                  <CountdownDigit
                    value={time.mounted ? String(time.days).padStart(2, "0") : "--"}
                    colorClass="text-[#FFFDF8]"
                    shadowClass="drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <span className="text-[8.5px] xs:text-[9.5px] font-cinzel font-semibold uppercase tracking-[0.2em] text-[#E5C158] mt-0.5 xs:mt-1">
                    Days
                  </span>
                </div>

                {/* Divider 1 */}
                <div className="flex flex-col items-center justify-center h-8 xs:h-9 select-none opacity-80 px-0.5" aria-hidden="true">
                  <span className="w-[1px] h-3 bg-gradient-to-b from-transparent to-[#D4AF37]" />
                  <span className="text-[6.5px] text-[#FFE8A3] leading-none my-0.5 drop-shadow-[0_0_3px_rgba(255,232,163,0.8)]">◆</span>
                  <span className="w-[1px] h-3 bg-gradient-to-t from-transparent to-[#D4AF37]" />
                </div>

                {/* Hours */}
                <div className="flex flex-col items-center justify-center px-0.5">
                  <CountdownDigit
                    value={time.mounted ? String(time.hours).padStart(2, "0") : "--"}
                    colorClass="text-[#FFFDF8]"
                    shadowClass="drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <span className="text-[8.5px] xs:text-[9.5px] font-cinzel font-semibold uppercase tracking-[0.2em] text-[#E5C158] mt-0.5 xs:mt-1">
                    Hours
                  </span>
                </div>

                {/* Divider 2 */}
                <div className="flex flex-col items-center justify-center h-8 xs:h-9 select-none opacity-80 px-0.5" aria-hidden="true">
                  <span className="w-[1px] h-3 bg-gradient-to-b from-transparent to-[#D4AF37]" />
                  <span className="text-[6.5px] text-[#FFE8A3] leading-none my-0.5 drop-shadow-[0_0_3px_rgba(255,232,163,0.8)]">◆</span>
                  <span className="w-[1px] h-3 bg-gradient-to-t from-transparent to-[#D4AF37]" />
                </div>

                {/* Minutes */}
                <div className="flex flex-col items-center justify-center px-0.5">
                  <CountdownDigit
                    value={time.mounted ? String(time.minutes).padStart(2, "0") : "--"}
                    colorClass="text-[#FFFDF8]"
                    shadowClass="drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <span className="text-[8.5px] xs:text-[9.5px] font-cinzel font-semibold uppercase tracking-[0.2em] text-[#E5C158] mt-0.5 xs:mt-1">
                    Mins
                  </span>
                </div>

                {/* Divider 3 */}
                <div className="flex flex-col items-center justify-center h-8 xs:h-9 select-none opacity-80 px-0.5" aria-hidden="true">
                  <span className="w-[1px] h-3 bg-gradient-to-b from-transparent to-[#D4AF37]" />
                  <span className="text-[6.5px] text-[#FFE8A3] leading-none my-0.5 drop-shadow-[0_0_3px_rgba(255,232,163,0.8)]">◆</span>
                  <span className="w-[1px] h-3 bg-gradient-to-t from-transparent to-[#D4AF37]" />
                </div>

                {/* Seconds (Vivid Rose-Crimson Accent exactly matching reference) */}
                <div className="flex flex-col items-center justify-center px-0.5">
                  <CountdownDigit
                    value={time.mounted ? String(time.seconds).padStart(2, "0") : "--"}
                    colorClass="text-[#E84A5F]"
                    shadowClass="drop-shadow-[0_0_10px_rgba(232,74,95,0.6)]"
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <span className="text-[8.5px] xs:text-[9.5px] font-cinzel font-semibold uppercase tracking-[0.2em] text-[#E84A5F] mt-0.5 xs:mt-1">
                    Secs
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Target Timestamp Footer Callout */}
      {!time.isMemoriesMode && !time.isWeddingArrived && (
        <div className="mt-1.5 xs:mt-2 text-center select-none flex flex-col items-center">
          <div className="inline-flex items-center justify-center gap-1.5 text-[9.5px] xs:text-[10.5px] font-cinzel uppercase tracking-[0.16em] text-[#FFE8A3] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            <svg
              className="w-3 h-3 text-[#E5C158] shrink-0"
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
            <span>21 NOVEMBER 2026 · 11:00 PM IST</span>
          </div>

          {/* Delicate diamond divider beneath timestamp */}
          <div className="mt-1">
            <TimestampFiligree className="w-14 xs:w-16 h-2 text-[#E5C158]" />
          </div>
        </div>
      )}
    </div>
  );
}
