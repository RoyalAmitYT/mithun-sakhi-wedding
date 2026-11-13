"use client";

import React, { useSyncExternalStore, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Container } from "@/components/ui/container";
import { getCurrentTimeMs } from "@/lib/lifecycle";
import { useMotionReduced, MOTION_EASINGS } from "@/lib/motion";
import { Reveal } from "@/components/motion/reveal";
import { AnimatedDivider } from "@/components/motion/animated-divider";
import { AmbientGlow, GoldLightSweep, GlassReflection } from "@/components/effects";
import { MagneticButton } from "@/components/interactive";
import { CountdownDigit } from "@/components/hero/hero-countdown";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export interface CeremonySectionData {
  id: string;
  dayIndex: string; // e.g. "01"
  dayLabel: string; // e.g. "DAY 01"
  kickerName: string; // e.g. "HALDI CEREMONY"
  titleLead: string; // e.g. "Haldi "
  titleHighlight: string; // e.g. "Ceremony"
  titleHighlightColor: string; // e.g. "#E8C882"
  subtitle: string;
  description: string;
  targetIso: string;
  dateDisplay: string;
  dayOfWeek: string;
  timeDisplay: string;
  timeLabel: string;
  venueName: string;
  venueCity: string;
  venueSubtext: string;
  fullAddress: string;
  mapUrl: string;
  calendarTitle: string;
  calendarDates: string; // YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ
  calendarDetails: string;
  imageSrc: string;
  imageDesktopWebp: string;
  imageDesktopAvif: string;
  imageMobileWebp: string;
  objectPosition: string;
  buttonColor: string; // Filled button background class
  primaryButtonClass: string;
  countdownAccent: string;
}

export const CEREMONIES_FULLSCREEN_DATA: CeremonySectionData[] = [
  {
    id: "haldi",
    dayIndex: "01",
    dayLabel: "DAY 01",
    kickerName: "HALDI CEREMONY",
    titleLead: "Haldi ",
    titleHighlight: "Ceremony",
    titleHighlightColor: "#E8C882",
    subtitle: "The sacred turmeric blessing marking a joyous new beginning.",
    description:
      "The auspicious commencement of the wedding rites. Fresh turmeric paste is lovingly applied by elders and family to invoke divine protection, radiant joy, and blessings.",
    targetIso: "2026-11-19T09:00:00+05:30",
    dateDisplay: "19 November 2026",
    dayOfWeek: "Thursday",
    timeDisplay: "9:00 AM IST",
    timeLabel: "Start Time",
    venueName: "Groom's Home",
    venueCity: "Purulia",
    venueSubtext: "Chitmu, Kotshila • Turmeric Anointment • Family Blessings",
    fullAddress: "Chitmu, Kotshila, Purulia, West Bengal 723215",
    mapUrl: "https://maps.app.goo.gl/Lt8BRMxAEUy371NVA",
    calendarTitle: "Haldi Ceremony — Mithun & Sakhi Wedding",
    calendarDates: "20261119T033000Z/20261119T073000Z",
    calendarDetails:
      "The sacred turmeric blessing marking a joyous new beginning for Mithun & Sakhi. Venue: Groom's Home, Chitmu, Kotshila, Purulia.",
    imageSrc: "/images/haldi-section-bg-portrait.webp",
    imageDesktopWebp: "/images/haldi-section-bg-desktop.webp",
    imageDesktopAvif: "/images/haldi-section-bg-desktop.avif",
    imageMobileWebp: "/images/haldi-section-bg-mobile.webp",
    objectPosition: "66% 40%",
    buttonColor: "bg-[#B38218] hover:bg-[#C8922C] border-[#B38218]",
    primaryButtonClass:
      "bg-gradient-to-r from-[#B87B14] via-[#DDA028] to-[#B87B14] hover:from-[#C88A1A] hover:via-[#ECC048] hover:to-[#C88A1A] text-white border border-[#FFE396]/65 shadow-[0_8px_24px_rgba(200,138,26,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] hover:shadow-[0_12px_28px_rgba(200,138,26,0.5),0_0_20px_rgba(255,227,150,0.3)]",
    countdownAccent: "#E8C882",
  },
  {
    id: "mehndi",
    dayIndex: "02",
    dayLabel: "DAY 02",
    kickerName: "MEHNDI CEREMONY",
    titleLead: "Mehndi ",
    titleHighlight: "Ceremony",
    titleHighlightColor: "#7FB093",
    subtitle: "A vibrant celebration of henna, folk music, and joyous togetherness.",
    description:
      "An exuberant gathering where intricate henna patterns are adorned onto hands amidst joyous folk melodies, sweet celebrations, and heartfelt laughter.",
    targetIso: "2026-11-20T09:00:00+05:30",
    dateDisplay: "20 November 2026",
    dayOfWeek: "Friday",
    timeDisplay: "9:00 AM IST",
    timeLabel: "Start Time",
    venueName: "Groom's Home",
    venueCity: "Purulia",
    venueSubtext: "Chitmu, Kotshila • Intricate Henna Art • Folk Melodies",
    fullAddress: "Chitmu, Kotshila, Purulia, West Bengal 723215",
    mapUrl: "https://maps.app.goo.gl/Lt8BRMxAEUy371NVA",
    calendarTitle: "Mehndi Ceremony — Mithun & Sakhi Wedding",
    calendarDates: "20261120T033000Z/20261120T083000Z",
    calendarDetails:
      "A vibrant celebration of henna, folk melodies, and sweet togetherness for Mithun & Sakhi. Venue: Groom's Home, Chitmu, Kotshila, Purulia.",
    imageSrc: "/images/mehendi-portrait.webp",
    imageDesktopWebp: "/images/mehendi-portrait-desktop.webp",
    imageDesktopAvif: "/images/mehendi-portrait-desktop.avif",
    imageMobileWebp: "/images/mehendi-portrait-mobile.webp",
    objectPosition: "62% center",
    buttonColor: "bg-[#1E4E34] hover:bg-[#2B5E3F] border-[#1E4E34]",
    primaryButtonClass:
      "bg-gradient-to-r from-[#17462D] via-[#246A45] to-[#17462D] hover:from-[#1E5738] hover:via-[#2F8557] hover:to-[#1E5738] text-white border border-[#8FE0B2]/55 shadow-[0_8px_24px_rgba(27,83,54,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_28px_rgba(36,106,69,0.55),0_0_20px_rgba(143,224,178,0.3)]",
    countdownAccent: "#7FB093",
  },
  {
    id: "wedding",
    dayIndex: "03",
    dayLabel: "DAY 03",
    kickerName: "THE SACRED WEDDING",
    titleLead: "The Sacred ",
    titleHighlight: "Wedding",
    titleHighlightColor: "#E8C882",
    subtitle: "Two hearts, one sacred journey under the blessings of the divine.",
    description:
      "The sacred Vedic marriage ceremony solemnized under the floral Mandap. Featuring Kanyadaan, Saat Phere around the holy Agni, and auspicious Sindoor Daan in the presence of loved ones.",
    targetIso: "2026-11-21T23:00:00+05:30",
    dateDisplay: "21 November 2026",
    dayOfWeek: "Saturday",
    timeDisplay: "11:00 PM IST",
    timeLabel: "Start Time",
    venueName: "Bride's Home",
    venueCity: "Purulia",
    venueSubtext: "Ghaghra, Jaipur • Saat Phere (Seven Vows) • Sindoor Daan",
    fullAddress: "Ghaghra, Jaipur, Purulia, West Bengal 723201",
    mapUrl: "https://maps.app.goo.gl/x1zvibZRTMTNTWCn7",
    calendarTitle: "The Sacred Wedding — Mithun & Sakhi",
    calendarDates: "20261121T173000Z/20261121T223000Z",
    calendarDetails:
      "The sacred Vedic marriage ceremony uniting Mithun & Sakhi under the holy Mandap. Featuring Kanyadaan, Saat Phere, and Sindoor Daan. Venue: Bride's Home, Ghaghra, Jaipur, Purulia.",
    imageSrc: "/images/the-sacred-wedding.webp",
    imageDesktopWebp: "/images/the-sacred-wedding-desktop.webp",
    imageDesktopAvif: "/images/the-sacred-wedding-desktop.avif",
    imageMobileWebp: "/images/the-sacred-wedding-mobile.webp",
    objectPosition: "68% center",
    buttonColor: "bg-[#8E1B29] hover:bg-[#A52232] border-[#8E1B29]",
    primaryButtonClass:
      "bg-gradient-to-r from-[#8B1422] via-[#B82236] to-[#8B1422] hover:from-[#9E1B2B] hover:via-[#CF283F] hover:to-[#9E1B2B] text-white border border-[#FFA6B2]/55 shadow-[0_8px_24px_rgba(158,27,43,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_28px_rgba(184,34,54,0.6),0_0_20px_rgba(255,166,178,0.35)]",
    countdownAccent: "#E63946",
  },
  {
    id: "reception",
    dayIndex: "04",
    dayLabel: "DAY 04",
    kickerName: "RECEPTION",
    titleLead: "",
    titleHighlight: "Reception",
    titleHighlightColor: "#E8A598",
    subtitle: "An evening of celebratory dining, warm congratulations, and shared joy.",
    description:
      "A grand celebration banquet welcoming the newlywed bride to the groom's family, seeking blessings from extended community, friends, and family over celebratory dining.",
    targetIso: "2026-11-22T17:00:00+05:30",
    dateDisplay: "22 November 2026",
    dayOfWeek: "Sunday",
    timeDisplay: "5:00 PM IST",
    timeLabel: "Start Time",
    venueName: "Groom's Home",
    venueCity: "Purulia",
    venueSubtext: "Chitmu, Kotshila • Grand Feast • Blessings Ceremony",
    fullAddress: "Chitmu, Kotshila, Purulia, West Bengal 723215",
    mapUrl: "https://maps.app.goo.gl/Lt8BRMxAEUy371NVA",
    calendarTitle: "Reception — Mithun & Sakhi Wedding",
    calendarDates: "20261122T113000Z/20261122T163000Z",
    calendarDetails:
      "A grand celebration banquet welcoming newlywed bride Sakhi to the groom's family in Purulia. Venue: Groom's Home, Chitmu, Kotshila, Purulia.",
    imageSrc: "/images/reception-section-bg-portrait.webp",
    imageDesktopWebp: "/images/reception-section-bg-desktop.webp",
    imageDesktopAvif: "/images/reception-section-bg-desktop.avif",
    imageMobileWebp: "/images/reception-section-bg-mobile.webp",
    objectPosition: "84% 35%",
    buttonColor: "bg-[#541A25] hover:bg-[#6A2234] border-[#541A25]",
    primaryButtonClass:
      "bg-gradient-to-r from-[#591D28] via-[#7A2A38] to-[#591D28] hover:from-[#6A2230] hover:via-[#8E3244] hover:to-[#6A2230] text-white border border-[#F2B6C0]/55 shadow-[0_8px_24px_rgba(104,36,50,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_28px_rgba(122,42,56,0.55),0_0_20px_rgba(242,182,192,0.3)]",
    countdownAccent: "#E8A598",
  },
];

interface CeremonyCountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isUnderway: boolean;
  mounted: boolean;
}

function calculateCeremonyTime(targetIso: string): CeremonyCountdownState {
  const targetMs = new Date(targetIso).getTime();
  const nowMs = getCurrentTimeMs();
  const diff = targetMs - nowMs;
  const isPast = diff <= 0;
  // Underway if started and within 8 hours
  const isUnderway = diff <= 0 && diff > -8 * 3600 * 1000;

  if (isPast) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      isUnderway,
      mounted: true,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    isUnderway: false,
    mounted: true,
  };
}

const SERVER_COUNTDOWN_FALLBACK: CeremonyCountdownState = {
  days: 20,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isPast: false,
  isUnderway: false,
  mounted: false,
};

const ceremonySnapshots = new Map<string, CeremonyCountdownState>();

function getCeremonySnapshot(targetIso: string): CeremonyCountdownState {
  let snap = ceremonySnapshots.get(targetIso);
  if (!snap) {
    snap = calculateCeremonyTime(targetIso);
    ceremonySnapshots.set(targetIso, snap);
  }
  return snap;
}

function updateCeremonySnapshots() {
  for (const c of CEREMONIES_FULLSCREEN_DATA) {
    ceremonySnapshots.set(c.targetIso, calculateCeremonyTime(c.targetIso));
  }
}

let subscribers: Array<() => void> = [];
let ceremonyTimer: NodeJS.Timeout | null = null;
let ceremonyScrollListenerAttached = false;

function subscribeToCeremonies(callback: () => void) {
  subscribers.push(callback);
  if (!ceremonyTimer && typeof window !== "undefined") {
    const startTimer = () => {
      if (ceremonyTimer) return;
      updateCeremonySnapshots();
      subscribers.forEach((cb) => cb());
      ceremonyTimer = setInterval(() => {
        if (typeof document !== "undefined" && document.hidden) return;
        updateCeremonySnapshots();
        subscribers.forEach((cb) => cb());
      }, 1000);
    };

    // If user has already scrolled near ceremonies, start immediately; otherwise defer until scroll or post-load idle
    if (window.scrollY > 300) {
      startTimer();
    } else {
      const onScrollCheck = () => {
        if (window.scrollY > 300) {
          window.removeEventListener("scroll", onScrollCheck);
          ceremonyScrollListenerAttached = false;
          startTimer();
        }
      };

      if (!ceremonyScrollListenerAttached) {
        ceremonyScrollListenerAttached = true;
        window.addEventListener("scroll", onScrollCheck, { passive: true });
      }

      // Fallback: start on idle after page load has completely settled (avoids initial hydration contention)
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(startTimer, { timeout: 7000 });
      } else {
        setTimeout(startTimer, 6000);
      }
    }
  }
  return () => {
    subscribers = subscribers.filter((cb) => cb !== callback);
    if (subscribers.length === 0 && ceremonyTimer) {
      clearInterval(ceremonyTimer);
      ceremonyTimer = null;
    }
  };
}

function useCeremonyCountdown(targetIso: string): CeremonyCountdownState {
  return useSyncExternalStore(
    subscribeToCeremonies,
    () => getCeremonySnapshot(targetIso),
    () => SERVER_COUNTDOWN_FALLBACK
  );
}

interface CeremonyPlaqueTheme {
  outerBorder: string;
  shadow: string;
  hoverShadow: string;
  cornerBorder: string;
  cornerGlow: string;
  diamondBorder: string;
  diamondBg: string;
  diamondGlow: string;
  innerBg: string;
  innerBorder: string;
  ambientVariant: "gold" | "haldi" | "mehndi" | "wedding" | "reception";
  accentColor: string;
  accentShadow: string;
  topCaption: string;
}

const CEREMONY_PLAQUE_THEMES: Record<string, CeremonyPlaqueTheme> = {
  haldi: {
    outerBorder: "border-[#D4AF37]/65",
    shadow: "shadow-[0_14px_42px_rgba(0,0,0,0.75),0_0_24px_rgba(212,175,55,0.22)]",
    hoverShadow: "hover:shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_32px_rgba(212,175,55,0.32)]",
    cornerBorder: "border-[#FFE8A3]",
    cornerGlow: "drop-shadow-[0_0_4px_rgba(255,232,163,0.85)]",
    diamondBorder: "border-[#D4AF37]",
    diamondBg: "bg-[#281A08]",
    diamondGlow: "shadow-[0_0_8px_rgba(212,175,55,0.75)]",
    innerBg: "rgba(28, 16, 8, 0.86)",
    innerBorder: "border-[#D4AF37]/45",
    ambientVariant: "haldi",
    accentColor: "#F5BA42",
    accentShadow: "drop-shadow-[0_0_10px_rgba(245,186,66,0.55)]",
    topCaption: "Haldi Begins In",
  },
  mehndi: {
    outerBorder: "border-[#7FB093]/70",
    shadow: "shadow-[0_14px_42px_rgba(0,0,0,0.75),0_0_24px_rgba(127,176,147,0.22)]",
    hoverShadow: "hover:shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_32px_rgba(127,176,147,0.32)]",
    cornerBorder: "border-[#A8E6C1]",
    cornerGlow: "drop-shadow-[0_0_4px_rgba(168,230,193,0.85)]",
    diamondBorder: "border-[#7FB093]",
    diamondBg: "bg-[#0E2316]",
    diamondGlow: "shadow-[0_0_8px_rgba(127,176,147,0.75)]",
    innerBg: "rgba(12, 28, 18, 0.86)",
    innerBorder: "border-[#7FB093]/45",
    ambientVariant: "mehndi",
    accentColor: "#7FB093",
    accentShadow: "drop-shadow-[0_0_10px_rgba(127,176,147,0.55)]",
    topCaption: "Mehndi Begins In",
  },
  wedding: {
    outerBorder: "border-[#D4AF37]/65",
    shadow: "shadow-[0_14px_42px_rgba(0,0,0,0.75),0_0_24px_rgba(212,175,55,0.25)]",
    hoverShadow: "hover:shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_32px_rgba(212,175,55,0.35)]",
    cornerBorder: "border-[#FFE8A3]",
    cornerGlow: "drop-shadow-[0_0_4px_rgba(255,232,163,0.85)]",
    diamondBorder: "border-[#D4AF37]",
    diamondBg: "bg-[#220B13]",
    diamondGlow: "shadow-[0_0_8px_rgba(212,175,55,0.75)]",
    innerBg: "rgba(35, 10, 18, 0.86)",
    innerBorder: "border-[#D4AF37]/45",
    ambientVariant: "wedding",
    accentColor: "#E63946",
    accentShadow: "drop-shadow-[0_0_10px_rgba(230,57,70,0.55)]",
    topCaption: "The Sacred Vows Begin In",
  },
  reception: {
    outerBorder: "border-[#E8A598]/65",
    shadow: "shadow-[0_14px_42px_rgba(0,0,0,0.75),0_0_24px_rgba(232,165,152,0.22)]",
    hoverShadow: "hover:shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_32px_rgba(232,165,152,0.32)]",
    cornerBorder: "border-[#FFD2CA]",
    cornerGlow: "drop-shadow-[0_0_4px_rgba(255,210,202,0.85)]",
    diamondBorder: "border-[#E8A598]",
    diamondBg: "bg-[#240C14]",
    diamondGlow: "shadow-[0_0_8px_rgba(232,165,152,0.75)]",
    innerBg: "rgba(32, 12, 18, 0.86)",
    innerBorder: "border-[#E8A598]/45",
    ambientVariant: "reception",
    accentColor: "#E8A598",
    accentShadow: "drop-shadow-[0_0_10px_rgba(232,165,152,0.55)]",
    topCaption: "Reception Begins In",
  },
};

interface CeremonyOverlayConfig {
  horizontal: string;
  vertical: string;
  colorWash: string;
}

const CEREMONY_OVERLAYS: Record<string, CeremonyOverlayConfig> = {
  haldi: {
    // Haldi: Turmeric yellow, marigold, and warm golden illumination (Left side darkened +10% for enhanced text/card contrast)
    horizontal: "from-black/96 via-black/75 via-45% to-black/25 sm:to-transparent",
    vertical: "from-black/65 via-transparent to-black/48",
    colorWash: "from-[#B87B14]/16 via-[#DDA028]/8 to-transparent",
  },
  mehndi: {
    // Mehndi: Emerald green, botanical decorations, and henna art (Left side darkened +10% for enhanced text/card contrast)
    horizontal: "from-black/96 via-black/75 via-45% to-black/25 sm:to-transparent",
    vertical: "from-black/65 via-transparent to-black/48",
    colorWash: "from-[#17462D]/16 via-[#246A45]/8 to-transparent",
  },
  wedding: {
    // The Sacred Wedding: Burgundy, red bridal garments, gold ornaments (Left side darkened +10% for enhanced text/card contrast)
    horizontal: "from-black/98 via-black/78 via-45% to-black/25 sm:to-transparent",
    vertical: "from-black/66 via-transparent to-black/50",
    colorWash: "from-[#8B1422]/16 via-[#B82236]/8 to-transparent",
  },
  reception: {
    // Reception: Champagne gold, dusty rose, celebratory banquet lighting (Left side darkened +10% for enhanced text/card contrast)
    horizontal: "from-black/96 via-black/75 via-45% to-black/25 sm:to-transparent",
    vertical: "from-black/65 via-transparent to-black/48",
    colorWash: "from-[#591D28]/16 via-[#7A2A38]/8 to-transparent",
  },
};

/**
 * CeremonyLiveCountdown — Liquid-Glass Countdown Plaque Matching Approved Hero Timer Design
 * 
 * Features:
 * - Architectural outer border with specular corner highlights
 * - Centered top diamond ornament (fully unclipped)
 * - Inner plaque with deep translucent glass matching ceremony-specific identity
 * - GoldLightSweep & GlassReflection inside isolated clipping layer
 * - Dynamic rolling typography via CountdownDigit
 * - DAYS / HOURS / MINS / SECS hierarchy with diamond-flanked hairline dividers
 * - Authoritative metadata footer (Date & Time | Venue)
 */
function CeremonyLiveCountdown({
  ceremony,
  shouldReduceMotion = false,
}: {
  ceremony: CeremonySectionData;
  shouldReduceMotion?: boolean;
}) {
  const time = useCeremonyCountdown(ceremony.targetIso);
  const theme = CEREMONY_PLAQUE_THEMES[ceremony.id] || CEREMONY_PLAQUE_THEMES.wedding;

  return (
    <div
      aria-label={`${ceremony.kickerName} live countdown timer`}
      className="relative w-[310px] sm:w-[335px] lg:w-[345px] xl:w-[360px] max-w-full pt-2 sm:pt-2.5 my-1.5 sm:my-2 select-none overflow-visible"
    >
      {/* Ambient Atmospheric Underglow */}
      <AmbientGlow
        variant={theme.ambientVariant}
        position="center"
        size="sm"
        opacity={0.35}
        pulse={true}
        className="-z-10"
      />

      {/* Layer 1: Outer Plaque (overflow-visible to prevent clipping top decorations & corner highlights) */}
      <div
        className={`relative rounded-2xl sm:rounded-[18px] p-[3px] border ${theme.outerBorder} ${theme.shadow} transition-all duration-300 ${theme.hoverShadow} overflow-visible`}
      >
        {/* Layer 2: Isolated Gold Light Sweep & Glass Reflection (clipped inside plaque radius) */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-[18px] overflow-hidden pointer-events-none z-0">
          <GlassReflection intensity="subtle" />
          <GoldLightSweep trigger="continuous" durationSeconds={8} intensity="subtle" />
        </div>

        {/* Specular Corner Glows (illuminated highlights) */}
        <div
          className={`absolute -top-[1px] -left-[1px] w-5 sm:w-6 h-5 sm:h-6 rounded-tl-2xl border-t-2 border-l-2 ${theme.cornerBorder} opacity-90 ${theme.cornerGlow} pointer-events-none z-10`}
          aria-hidden="true"
        />
        <div
          className={`absolute -top-[1px] -right-[1px] w-5 sm:w-6 h-5 sm:h-6 rounded-tr-2xl border-t-2 border-r-2 ${theme.cornerBorder} opacity-90 ${theme.cornerGlow} pointer-events-none z-10`}
          aria-hidden="true"
        />
        <div
          className={`absolute -bottom-[1px] -left-[1px] w-5 sm:w-6 h-5 sm:h-6 rounded-bl-2xl border-b-2 border-l-2 ${theme.cornerBorder} opacity-75 ${theme.cornerGlow} pointer-events-none z-10`}
          aria-hidden="true"
        />
        <div
          className={`absolute -bottom-[1px] -right-[1px] w-5 sm:w-6 h-5 sm:h-6 rounded-br-2xl border-b-2 border-r-2 ${theme.cornerBorder} opacity-75 ${theme.cornerGlow} pointer-events-none z-10`}
          aria-hidden="true"
        />

        {/* Layer 3A: Refined Ornamental Diamond Centered on the Top Border (fully unclipped) */}
        <div
          className="absolute -top-[6px] left-1/2 -translate-x-1/2 flex items-center gap-1 z-30 pointer-events-none select-none whitespace-nowrap"
          aria-hidden="true"
        >
          <span className="w-6 sm:w-9 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <div
            className={`relative w-3.5 h-3.5 rotate-45 border ${theme.diamondBorder} ${theme.diamondBg} flex items-center justify-center ${theme.diamondGlow}`}
          >
            <span className="w-1.5 h-1.5 bg-[#D4AF37]" />
          </div>
          <span className="w-6 sm:w-9 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </div>

        {/* Layer 3B: Inner Plaque: Translucent Deep Glass with Second Hairline Border */}
        <div
          style={{
            backgroundColor: theme.innerBg,
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
          }}
          className={`relative z-10 rounded-[12px] sm:rounded-[15px] px-3 py-1.5 sm:px-3.5 sm:py-2 border ${theme.innerBorder} shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_-1px_1px_rgba(212,175,55,0.16)]`}
        >
          {time.isUnderway ? (
            <div className="py-1 text-center">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-sans font-semibold uppercase tracking-[0.18em] text-[#FF6B7A] bg-[#A52232]/25 border border-[#FF6B7A]/40 mb-1">
                Sacred Ritual Underway
              </span>
              <h3 className="font-serif text-sm sm:text-base font-normal text-[#FFFDF8] tracking-wide">
                {ceremony.kickerName}
              </h3>
              <p className="font-serif italic text-[11px] text-[#E8DFD5] mt-0.5 leading-relaxed max-w-xs mx-auto">
                This sacred ceremony is currently underway in Purulia.
              </p>
              <div className="mt-1.5 pt-1 border-t border-[#D4AF37]/25 text-[8.5px] text-[#F3ECE0] font-sans font-medium uppercase tracking-[0.14em]">
                {ceremony.dateDisplay} &bull; {ceremony.timeDisplay}
              </div>
            </div>
          ) : time.isPast ? (
            <div className="py-1 text-center">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-sans font-semibold uppercase tracking-[0.18em] text-[#D4AF37] bg-[#B8975E]/20 border border-[#D4AF37]/40 mb-1">
                Solemnized With Divine Blessings
              </span>
              <h3 className="font-serif text-sm sm:text-base font-normal text-[#FFFDF8] tracking-wide">
                {ceremony.kickerName}
              </h3>
              <p className="font-serif italic text-[11px] text-[#E8DFD5] mt-0.5 leading-relaxed max-w-xs mx-auto">
                Sacred rites concluded with family blessings &amp; joy.
              </p>
              <div className="mt-1.5 pt-1 border-t border-[#D4AF37]/25 text-[8.5px] text-[#F3ECE0] font-sans font-medium uppercase tracking-[0.14em]">
                Memories Preserved in Archive
              </div>
            </div>
          ) : (
            <>
              {/* Heading: Ceramic Capsule flanked by thin horizontal gold lines */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 pb-0.5 select-none">
                <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#D4AF37]/80" />
                <span className="text-[8px] sm:text-[9.5px] font-sans font-semibold uppercase tracking-[0.24em] text-[#E8C882] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {theme.topCaption}
                </span>
                <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#D4AF37]/80" />
              </div>

              {/* 4 Values Horizontal Strip with Diamond-Centered Hairline Dividers */}
              <div
                className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center text-center my-0.5 sm:my-1"
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
                  <span className="text-[7.5px] sm:text-[8px] font-sans font-semibold uppercase tracking-[0.18em] text-[#D4AF37]/90 mt-0.5">
                    Days
                  </span>
                </div>

                {/* Divider 1 */}
                <div
                  className="flex flex-col items-center justify-center h-6.5 sm:h-7.5 select-none opacity-85 px-0.5 sm:px-1"
                  aria-hidden="true"
                >
                  <span className="w-[1px] h-2.5 bg-gradient-to-b from-transparent to-[#D4AF37]/60" />
                  <span className="text-[5.5px] text-[#D4AF37] leading-none my-0.5 drop-shadow-[0_0_3px_rgba(212,175,55,0.6)]">
                    ◆
                  </span>
                  <span className="w-[1px] h-2.5 bg-gradient-to-t from-transparent to-[#D4AF37]/60" />
                </div>

                {/* Hours */}
                <div className="flex flex-col items-center justify-center px-0.5 sm:px-1">
                  <CountdownDigit
                    value={time.mounted ? String(time.hours).padStart(2, "0") : "--"}
                    colorClass="text-[#FFFDF8]"
                    shadowClass="drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <span className="text-[7.5px] sm:text-[8px] font-sans font-semibold uppercase tracking-[0.18em] text-[#D4AF37]/90 mt-0.5">
                    Hours
                  </span>
                </div>

                {/* Divider 2 */}
                <div
                  className="flex flex-col items-center justify-center h-6.5 sm:h-7.5 select-none opacity-85 px-0.5 sm:px-1"
                  aria-hidden="true"
                >
                  <span className="w-[1px] h-2.5 bg-gradient-to-b from-transparent to-[#D4AF37]/60" />
                  <span className="text-[5.5px] text-[#D4AF37] leading-none my-0.5 drop-shadow-[0_0_3px_rgba(212,175,55,0.6)]">
                    ◆
                  </span>
                  <span className="w-[1px] h-2.5 bg-gradient-to-t from-transparent to-[#D4AF37]/60" />
                </div>

                {/* Minutes */}
                <div className="flex flex-col items-center justify-center px-0.5 sm:px-1">
                  <CountdownDigit
                    value={time.mounted ? String(time.minutes).padStart(2, "0") : "--"}
                    colorClass="text-[#FFFDF8]"
                    shadowClass="drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <span className="text-[7.5px] sm:text-[8px] font-sans font-semibold uppercase tracking-[0.18em] text-[#D4AF37]/90 mt-0.5">
                    Mins
                  </span>
                </div>

                {/* Divider 3 */}
                <div
                  className="flex flex-col items-center justify-center h-6.5 sm:h-7.5 select-none opacity-85 px-0.5 sm:px-1"
                  aria-hidden="true"
                >
                  <span className="w-[1px] h-2.5 bg-gradient-to-b from-transparent to-[#D4AF37]/60" />
                  <span className="text-[5.5px] text-[#D4AF37] leading-none my-0.5 drop-shadow-[0_0_3px_rgba(212,175,55,0.6)]">
                    ◆
                  </span>
                  <span className="w-[1px] h-2.5 bg-gradient-to-t from-transparent to-[#D4AF37]/60" />
                </div>

                {/* Seconds */}
                <div className="flex flex-col items-center justify-center px-0.5 sm:px-1">
                  <CountdownDigit
                    value={time.mounted ? String(time.seconds).padStart(2, "0") : "--"}
                    style={{ color: theme.accentColor }}
                    shadowClass={theme.accentShadow}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <span
                    style={{ color: theme.accentColor }}
                    className="text-[7.5px] sm:text-[8px] font-sans font-semibold uppercase tracking-[0.18em] mt-0.5"
                  >
                    Secs
                  </span>
                </div>
              </div>

              {/* Authoritative Target Reference Footer */}
              <div className="pt-1.5 sm:pt-2 mt-0.5 border-t border-[#D4AF37]/35 flex items-center justify-between text-[7px] sm:text-[8px] font-sans tracking-[0.12em] uppercase select-none">
                <span className="text-[#FFFDF8] font-medium whitespace-nowrap">
                  {ceremony.dateDisplay.toUpperCase()} &bull; {ceremony.timeDisplay.toUpperCase()}
                </span>
                <span className="h-2 w-[1px] bg-[#D4AF37]/45 mx-1" aria-hidden="true" />
                <span className="text-[#E8C882] font-semibold whitespace-nowrap">
                  {ceremony.venueName.toUpperCase()}, {ceremony.venueCity.toUpperCase()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Single Full-Screen Ceremony Section with Cinematic Motion & Parallax
 */
function SingleCeremonySection({
  ceremony,
  zIndex,
  index,
  scrollYProgress,
  shouldReduceMotion,
}: {
  ceremony: CeremonySectionData;
  zIndex: number;
  index: number;
  scrollYProgress: MotionValue<number>;
  shouldReduceMotion: boolean;
}) {
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];
  const mounted = useMounted();

  // Parallax: each ceremony has its active scroll range across 4 equal intervals:
  // [0.00 -> 0.25]: Haldi active (pinned), receding as Mehndi stacks on top
  // [0.25 -> 0.50]: Mehndi active (pinned), receding as Sacred Wedding stacks on top
  // [0.50 -> 0.75]: Sacred Wedding active (pinned), receding as Reception stacks on top
  // [0.75 -> 1.00]: Reception active (pinned), receding as Venues curtain stacks on top
  const bgParallaxY = useTransform(
    scrollYProgress,
    index === 0
      ? [0.0, 0.25]
      : index === 1
      ? [0.0, 0.25, 0.5]
      : index === 2
      ? [0.25, 0.5, 0.75]
      : [0.5, 0.75, 1.0],
    index === 0
      ? [0, 28]
      : index === 1
      ? [-24, 0, 28]
      : index === 2
      ? [-24, 0, 28]
      : [-24, 0, 28]
  );

  // Depth-dimming and receding scale as next ceremony / curtain stacks on top
  const depthOpacity = useTransform(
    scrollYProgress,
    index === 0
      ? [0.10, 0.25]
      : index === 1
      ? [0.35, 0.50]
      : index === 2
      ? [0.60, 0.75]
      : [0.85, 1.00],
    [1, 0.35]
  );

  const depthScale = useTransform(
    scrollYProgress,
    index === 0
      ? [0.10, 0.25]
      : index === 1
      ? [0.35, 0.50]
      : index === 2
      ? [0.60, 0.75]
      : [0.85, 1.00],
    [1, 0.96]
  );

  const depthY = useTransform(
    scrollYProgress,
    index === 0
      ? [0.10, 0.25]
      : index === 1
      ? [0.35, 0.50]
      : index === 2
      ? [0.60, 0.75]
      : [0.85, 1.00],
    [0, -24]
  );

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    ceremony.calendarTitle
  )}&dates=${ceremony.calendarDates}&details=${encodeURIComponent(
    ceremony.calendarDetails
  )}&location=${encodeURIComponent(ceremony.fullAddress)}`;

  const overlay = CEREMONY_OVERLAYS[ceremony.id] || CEREMONY_OVERLAYS.wedding;

  return (
    <section
      id={ceremony.id}
      data-navbar-theme="dark"
      aria-labelledby={`${ceremony.id}-title`}
      style={{
        zIndex,
        transform: "translate3d(0, 0, 0)",
        willChange: "transform",
      }}
      className={`
        sticky top-0 w-full min-h-[100svh] h-[100svh] overflow-hidden
        flex flex-col justify-center text-white
        ${index > 0 ? "shadow-[0_-20px_50px_rgba(0,0,0,0.5)]" : ""}
      `}
    >
      {/* Full-bleed Background Photograph with Restrained Scale Settling & Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          suppressHydrationWarning
          initial={false}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 1.1,
            ease: luxuryEase,
          }}
          style={
            shouldReduceMotion || !mounted
              ? undefined
              : {
                  y: bgParallaxY,
                  scale: depthScale,
                  willChange: "transform",
                }
          }
          className="absolute inset-0 w-full h-full"
        >
          <picture className="absolute inset-0 w-full h-full">
            <source
              media="(max-width: 768px)"
              type="image/webp"
              srcSet={ceremony.imageMobileWebp}
            />
            <source
              type="image/avif"
              srcSet={ceremony.imageDesktopAvif}
            />
            <source
              type="image/webp"
              srcSet={ceremony.imageDesktopWebp}
            />
            <img
              src={ceremony.imageDesktopWebp}
              alt={ceremony.subtitle}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: ceremony.objectPosition }}
              className="w-full h-full object-cover"
            />
          </picture>
        </motion.div>

        {/* Cinematic Vignette Overlay: Refined horizontal multi-stop vignette for clear subject visibility while retaining 100% text contrast */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${overlay.horizontal} pointer-events-none`}
          aria-hidden="true"
        />
        {/* Subtle vertical gradients for smooth top navbar and bottom integration */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${overlay.vertical} pointer-events-none`}
          aria-hidden="true"
        />
        {/* Ceremonial Ambient Color Wash: Subtle ritual-specific illumination */}
        <div
          className={`absolute inset-0 bg-gradient-to-tr ${overlay.colorWash} pointer-events-none mix-blend-screen opacity-60`}
          aria-hidden="true"
        />
      </div>

      {/* Left Editorial Content Area with Scroll Depth & Choreographed Entrance */}
      <motion.div
        suppressHydrationWarning
        style={
          shouldReduceMotion || !mounted
            ? undefined
            : {
                opacity: depthOpacity,
                scale: depthScale,
                y: depthY,
              }
        }
        className="relative z-10 w-full pt-16 sm:pt-20 pb-10 sm:pb-14 origin-center"
      >
        {/* Ceremony-Specific Ambient Lighting Glow */}
        <AmbientGlow
          variant={
            ceremony.id === "haldi"
              ? "haldi"
              : ceremony.id === "mehndi"
              ? "mehndi"
              : ceremony.id === "wedding"
              ? "wedding"
              : "reception"
          }
          position="top-left"
          size="lg"
          opacity={0.32}
          pulse={true}
        />

        <Container size="wide">
          <motion.div
            suppressHydrationWarning
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: luxuryEase }}
            className="max-w-xl lg:max-w-3xl flex flex-col items-start text-left -translate-y-2 sm:-translate-y-5 lg:-translate-y-5"
          >
            {/* Step 3: Ceremony Eyebrow: DAY 0X ──── CEREMONY NAME */}
            <div className="flex items-center gap-2 sm:gap-3 mb-2 select-none">
              <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.24em] text-[#E8C882]">
                {ceremony.dayLabel}
              </span>
              <span className="w-8 sm:w-12 h-[1px] bg-[#D4AF37]/65" aria-hidden="true" />
              <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.22em] text-[#FFFDF8]">
                {ceremony.kickerName}
              </span>
            </div>

            {/* Step 4: Ceremony Title: Two-Tone Cormorant Garamond */}
            <h2
              id={`${ceremony.id}-title`}
              className="font-serif text-[2.25rem] sm:text-[2.75rem] md:text-[3.25rem] lg:text-[3.85rem] xl:text-[4.25rem] font-normal leading-[1.04] tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]"
            >
              <span>{ceremony.titleLead}</span>
              <span
                style={{ color: ceremony.titleHighlightColor }}
                className="font-serif italic font-normal"
              >
                {ceremony.titleHighlight}
              </span>
            </h2>

            {/* Step 5: Poetic Subtitle */}
            <p className="font-serif italic text-base sm:text-lg md:text-xl text-[#F3ECE0] font-normal leading-relaxed mt-1.5 sm:mt-2 max-w-xl drop-shadow-sm">
              {ceremony.subtitle}
            </p>

            {/* Step 6: Delicate Gold Ornamental Divider: ── ❖ ── */}
            <div
              className="flex items-center gap-2 my-2.5 sm:my-3.5 max-w-xs origin-left select-none"
              aria-hidden="true"
            >
              <span className="w-8 sm:w-12 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/80" />
              <span className="text-[6.5px] text-[#D4AF37] rotate-45 font-bold">◆</span>
              <span className="text-[9.5px] text-[#D4AF37] rotate-45 font-bold">◆</span>
              <span className="text-[6.5px] text-[#D4AF37] rotate-45 font-bold">◆</span>
              <span className="w-14 sm:w-20 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/80" />
            </div>

            {/* Step 7: Ceremony Description */}
            <p className="text-xs sm:text-sm text-[#E8DFD5] leading-relaxed max-w-xl mb-1">
              {ceremony.description}
            </p>

            {/* Step 8: Ceremony-Specific Live Countdown Plaque */}
            <div className="w-fit">
              <CeremonyLiveCountdown
                ceremony={ceremony}
                shouldReduceMotion={shouldReduceMotion}
              />
            </div>

            {/* Step 9: Event Metadata Row (Date • Time • Venue) */}
            <div
              className="w-full max-w-lg my-1 sm:my-2 pt-2.5 border-t border-[#D4AF37]/30 grid grid-cols-2 sm:grid-cols-[1fr_auto_1fr_auto_1.4fr] gap-2.5 sm:gap-3 items-start select-none"
            >
              {/* Date Block */}
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
                    Date
                  </span>
                  <span className="font-serif text-xs sm:text-[13px] font-medium text-white leading-tight">
                    {ceremony.dateDisplay}
                  </span>
                  <span className="font-serif italic text-[11px] text-[#E8DFD5]">
                    {ceremony.dayOfWeek}
                  </span>
                </div>
              </div>

              {/* Divider 1 */}
              <div className="h-9 w-[1px] bg-[#D4AF37]/35 hidden sm:block" aria-hidden="true" />

              {/* Time Block */}
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
                    Time
                  </span>
                  <span className="font-serif text-xs sm:text-[13px] font-medium text-white leading-tight">
                    {ceremony.timeDisplay}
                  </span>
                  <span className="font-serif italic text-[11px] text-[#E8DFD5]">
                    {ceremony.timeLabel}
                  </span>
                </div>
              </div>

              {/* Divider 2 */}
              <div className="h-9 w-[1px] bg-[#D4AF37]/35 hidden sm:block" aria-hidden="true" />

              {/* Venue Block */}
              <div className="flex items-start gap-2 col-span-2 sm:col-span-1">
                <svg
                  className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
                    Venue
                  </span>
                  <span className="font-serif text-xs sm:text-[13px] font-medium text-white leading-tight">
                    {ceremony.venueName}, {ceremony.venueCity}
                  </span>
                  <span className="font-serif italic text-[11px] text-[#E8DFD5] truncate max-w-[170px]">
                    {ceremony.venueSubtext}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 10: Action Buttons: Add to Calendar & Get Directions with Magnetic Hover */}
            <div
              className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-1"
            >
              {/* Add to Calendar Button — Ultra-Premium Bespoke Ceremonial Gradient Pill */}
              <MagneticButton>
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    group relative inline-flex items-center justify-center gap-2.5
                    h-12 sm:h-[54px] px-6 sm:px-8 rounded-full
                    ${ceremony.primaryButtonClass}
                    text-[11.5px] sm:text-[12px] font-sans font-bold uppercase tracking-[0.18em]
                    transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-black
                  `}
                >
                  <svg
                    className="w-4 h-4 sm:w-[17px] sm:h-[17px] text-white shrink-0 drop-shadow-xs transition-transform duration-300 group-hover:scale-110"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                    <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <circle cx="8" cy="14" r="1" fill="currentColor" />
                    <circle cx="12" cy="14" r="1" fill="currentColor" />
                    <circle cx="16" cy="14" r="1" fill="currentColor" />
                    <circle cx="8" cy="18" r="1" fill="currentColor" />
                    <circle cx="12" cy="18" r="1" fill="currentColor" />
                    <circle cx="16" cy="18" r="1" fill="currentColor" />
                  </svg>
                  <span>Add to Calendar</span>
                </a>
              </MagneticButton>

              {/* Get Directions Button — Ultra-Premium Dark Translucent Liquid-Glass Pill */}
              <MagneticButton>
                <a
                  href={ceremony.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-2.5 h-12 sm:h-[54px] px-6 sm:px-8 rounded-full bg-[rgba(16,10,12,0.68)] hover:bg-[rgba(26,16,20,0.85)] text-[#FFFDF8] hover:text-white text-[11.5px] sm:text-[12px] font-sans font-bold uppercase tracking-[0.18em] border border-[#D4AF37]/75 hover:border-[#F3D78A] backdrop-blur-md shadow-[0_6px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.14)] hover:shadow-[0_8px_26px_rgba(0,0,0,0.65),0_0_18px_rgba(212,175,55,0.25)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <svg
                    className="w-4 h-4 sm:w-[17px] sm:h-[17px] text-[#E8C882] group-hover:text-[#FFE396] transition-all duration-300 shrink-0 drop-shadow-xs group-hover:scale-110 group-hover:rotate-12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polygon points="3 11 22 2 13 21 11 13 3 11" fill="currentColor" fillOpacity="0.25" />
                  </svg>
                  <span>Get Directions</span>
                </a>
              </MagneticButton>
            </div>
          </motion.div>
        </Container>
      </motion.div>
    </section>
  );
}

/**
 * CeremonyFullscreenSections — Official Events Section & 4 Consecutive Sticky-Stacked Cinematic Ceremony Sections
 * 
 * Includes the official section heading:
 * Eyebrow: FOUR DAYS · FOUR SPECIAL MOMENTS
 * Main Heading: THE CEREMONIAL JOURNEY
 * 
 * Order:
 * 1. Haldi Ceremony (19 Nov, 9:00 AM IST) - Groom's Home
 * 2. Mehndi Ceremony (20 Nov, 9:00 AM IST) - Groom's Home
 * 3. The Sacred Wedding (21 Nov, 11:00 PM IST) - Bride's Home
 * 4. Reception (22 Nov, 5:00 PM IST) - Groom's Home
 */
export function CeremonyFullscreenSections() {
  const shouldReduceMotion = useMotionReduced();
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="events" aria-labelledby="events-heading" className="relative scroll-mt-24">
      {/* 1. Official Events Section Heading with Luxury Reveal */}
      <div className="relative z-10 bg-[#FFFCF6] pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 border-t border-[rgba(184,151,94,0.2)]">
        <Container size="editorial">
          <div className="text-center max-w-2xl mx-auto">
            {/* Centered Eyebrow: FOUR DAYS · FOUR SPECIAL MOMENTS */}
            <Reveal preset="luxury" direction="up" distance={10} threshold={0.15}>
              <div className="flex items-center justify-center gap-2 mb-2 sm:mb-2.5 select-none">
                <span className="text-[7px] text-[#A52232] font-bold">◆</span>
                <span className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A52232] uppercase">
                  FOUR DAYS &middot; FOUR SPECIAL MOMENTS
                </span>
                <span className="text-[7px] text-[#A52232] font-bold">◆</span>
              </div>
            </Reveal>

            {/* Main Heading: The Ceremonial Journey with Dual-Tone Styling */}
            <Reveal preset="luxury" direction="up" distance={16} delay={0.08} threshold={0.15}>
              <h2
                id="events-heading"
                className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#1A1717] leading-[1.12]"
              >
                <span>The Ceremonial </span>
                <span className="text-[#8E1B29]">Journey</span>
              </h2>
            </Reveal>

            {/* Subtle Antique-Gold Decorative Animated Divider */}
            <div className="flex justify-center mt-4">
              <AnimatedDivider variant="gold" size="sm" />
            </div>
          </div>
        </Container>
      </div>

      {/* 2. Four Fullscreen Ceremony Experiences with Sticky-Stacked Continuous Scroll */}
      <div id="ceremonies-stack" ref={stackRef} className="relative">
        {CEREMONIES_FULLSCREEN_DATA.map((ceremony, index) => (
          <SingleCeremonySection
            key={ceremony.id}
            ceremony={ceremony}
            zIndex={index + 1}
            index={index}
            scrollYProgress={scrollYProgress}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
        {/* Scroll Runway for Final Chapter (Reception) to remain pinned through its intended interval */}
        <div className="h-[100svh] w-full pointer-events-none" aria-hidden="true" />
      </div>
    </section>
  );
}
