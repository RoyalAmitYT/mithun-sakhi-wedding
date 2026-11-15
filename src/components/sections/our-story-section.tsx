"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Container } from "@/components/ui/container";
import { Reveal, AnimatedDivider, useMotionReduced, MOTION_EASINGS } from "@/components/motion";
import { AmbientGlow } from "@/components/effects";
import { InteractiveTiltCard } from "@/components/interactive";
import {
  CornerBracket,
  CardMandalaWatermark,
  SectionHeaderFiligree,
  SectionSideMandala,
} from "@/components/ui/decorative-surfaces";
import { ProfileCard, GROOM_PROFILE_DATA, BRIDE_PROFILE_DATA } from "@/components/story";

interface Milestone {
  number: string;
  badge: string;
  date?: string;
  venue?: string;
  title: string;
  description: string;
  accentColor: string;
  bgGradient: string;
  borderClass: string;
  activeBorderColor: string;
  activeGlowColor: string;
}

const MILESTONES: Milestone[] = [
  {
    number: "01",
    badge: "CHAPTER 01",
    title: "TWO FAMILIES, ONE BLESSING",
    description:
      "Two families, joined by shared blessings and the promise of a beautiful new beginning.",
    accentColor: "#A67C1E",
    bgGradient: "from-[#FCF9EE] via-[#FAF5E6] to-[#FAF5E6]",
    borderClass: "border-[#B8975E]/35",
    activeBorderColor: "rgba(184, 151, 94, 0.85)",
    activeGlowColor: "rgba(184, 151, 94, 0.22)",
  },
  {
    number: "02",
    badge: "CHAPTER 02",
    title: "A PROMISE FOR FOREVER",
    description:
      "A celebration of commitment, companionship and the values that bring two lives together.",
    accentColor: "#8E1B29",
    bgGradient: "from-[#FDF5F5] via-[#FAF0F1] to-[#FAF0F1]",
    borderClass: "border-[#8E1B29]/30",
    activeBorderColor: "rgba(142, 27, 41, 0.8)",
    activeGlowColor: "rgba(142, 27, 41, 0.18)",
  },
  {
    number: "03",
    badge: "CHAPTER 03",
    date: "19 NOVEMBER 2026 · 9:00 AM IST",
    venue: "Groom's Home, Chitmu, Kotshila, Purulia",
    title: "THE HALDI CELEBRATION",
    description:
      "A joyful turmeric ceremony filled with family blessings, traditional rituals and the warmth of togetherness.",
    accentColor: "#B8860B",
    bgGradient: "from-[#FFFBEB] via-[#FEF3C7]/45 to-[#FAF5E6]",
    borderClass: "border-[#D4AF37]/40",
    activeBorderColor: "rgba(212, 175, 55, 0.9)",
    activeGlowColor: "rgba(212, 175, 55, 0.24)",
  },
  {
    number: "04",
    badge: "CHAPTER 04",
    date: "20 NOVEMBER 2026 · 9:00 AM IST",
    venue: "Groom's Home, Chitmu, Kotshila, Purulia",
    title: "THE MEHNDI CELEBRATION",
    description:
      "A beautiful celebration of henna, music and cherished traditions, bringing family and loved ones together.",
    accentColor: "#2E6F40",
    bgGradient: "from-[#F4F9F5] via-[#EDF5EF] to-[#FAF5E6]",
    borderClass: "border-[#2E6F40]/30",
    activeBorderColor: "rgba(46, 111, 64, 0.85)",
    activeGlowColor: "rgba(46, 111, 64, 0.20)",
  },
  {
    number: "05",
    badge: "CHAPTER 05",
    date: "21 NOVEMBER 2026 · 11:00 PM IST",
    venue: "Bride's Home, Ghaghra, Jaipur, Purulia",
    title: "THE SACRED UNION",
    description:
      "Two lives unite in a sacred Vedic wedding ceremony, surrounded by the blessings of family and loved ones.",
    accentColor: "#8E1B29",
    bgGradient: "from-[#FDF2F4] via-[#FAF0F1] to-[#F7EBEF]",
    borderClass: "border-[#8E1B29]/45",
    activeBorderColor: "rgba(142, 27, 41, 0.9)",
    activeGlowColor: "rgba(142, 27, 41, 0.25)",
  },
  {
    number: "06",
    badge: "CHAPTER 06",
    date: "19–22 NOVEMBER 2026",
    title: "A CELEBRATION OF TOGETHERNESS",
    description:
      "Four days of cherished traditions, joyful ceremonies, family gatherings and unforgettable celebrations in Purulia.",
    accentColor: "#A67C1E",
    bgGradient: "from-[#FFFDF8] via-[#FCF9EE] to-[#FAF5E6]",
    borderClass: "border-[#B8975E]/35",
    activeBorderColor: "rgba(184, 151, 94, 0.85)",
    activeGlowColor: "rgba(184, 151, 94, 0.22)",
  },
];

// Sequential activation thresholds for 6 milestones triggering from center of viewport
const MILESTONE_THRESHOLDS = [0.06, 0.24, 0.42, 0.6, 0.78, 0.95];

interface MilestoneRowProps {
  item: Milestone;
  index: number;
  progress: MotionValue<number>;
  threshold: number;
  shouldReduceMotion: boolean;
}

function MilestoneRow({
  item,
  index,
  progress,
  threshold,
  shouldReduceMotion,
}: MilestoneRowProps) {
  const isEven = index % 2 === 1; // 0, 2, 4 on left; 1, 3, 5 on right
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];

  // Smooth scroll activation range: [threshold - 0.08, threshold]
  const startT = Math.max(0, threshold - 0.08);
  const endT = threshold;

  // Active interpolation values (called unconditionally to comply with React hook rules)
  const animGlowProgress = useTransform(progress, [startT, endT], [0, 1]);
  const animMarkerScale = useTransform(progress, [startT, endT], [0.85, 1.12]);
  const animMarkerBorder = useTransform(
    progress,
    [startT, endT],
    ["rgba(184, 151, 94, 0.35)", item.activeBorderColor]
  );
  const animMarkerShadow = useTransform(
    progress,
    [startT, endT],
    ["0 0 0px rgba(0,0,0,0)", `0 0 16px ${item.activeGlowColor}`]
  );
  const animMarkerDotScale = useTransform(progress, [startT, endT], [0.65, 1]);
  const animMarkerDotOpacity = useTransform(progress, [startT, endT], [0.4, 1]);

  const animConnectorScaleX = useTransform(progress, [startT, endT], [0, 1]);
  const animConnectorOpacity = useTransform(progress, [startT, endT], [0.35, 1]);

  const animCardBorder = useTransform(
    progress,
    [startT, endT],
    ["rgba(184, 151, 94, 0.25)", item.activeBorderColor]
  );
  const animCardShadow = useTransform(
    progress,
    [startT, endT],
    [
      "0 4px 16px rgba(184, 151, 94, 0.04)",
      `0 14px 36px ${item.activeGlowColor}`,
    ]
  );

  // Fallbacks for reduced-motion users
  const markerScale = shouldReduceMotion ? 1 : animMarkerScale;
  const markerBorder = shouldReduceMotion ? item.activeBorderColor : animMarkerBorder;
  const markerShadow = shouldReduceMotion
    ? `0 0 12px ${item.activeGlowColor}`
    : animMarkerShadow;
  const markerDotScale = shouldReduceMotion ? 1 : animMarkerDotScale;
  const markerDotOpacity = shouldReduceMotion ? 1 : animMarkerDotOpacity;

  const connectorScaleX = shouldReduceMotion ? 1 : animConnectorScaleX;
  const connectorOpacity = shouldReduceMotion ? 1 : animConnectorOpacity;

  const cardBorder = shouldReduceMotion ? item.activeBorderColor : animCardBorder;
  const cardShadow = shouldReduceMotion
    ? `0 12px 32px ${item.activeGlowColor}`
    : animCardShadow;

  const rowEntranceVariants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      x: shouldReduceMotion ? 0 : (!isEven ? -16 : 16),
      y: shouldReduceMotion ? 0 : 12,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.65,
        ease: luxuryEase,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={rowEntranceVariants}
      className="relative flex items-center w-full min-h-0"
    >
      {/* ================================================================= */}
      {/* DESKTOP CENTRAL MARKER & HORIZONTAL CONNECTOR (≥ md)              */}
      {/* ================================================================= */}
      {/* Central Marker */}
      <motion.div
        style={{
          scale: markerScale,
          borderColor: markerBorder,
          boxShadow: markerShadow,
        }}
        className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-[#FFFDF8] border-2 select-none"
        aria-hidden="true"
      >
        <motion.div
          style={{
            scale: markerDotScale,
            opacity: markerDotOpacity,
            backgroundColor: item.accentColor,
          }}
          className="w-2.5 h-2.5 rounded-full"
        />
      </motion.div>

      {/* Horizontal Connector Line for Desktop */}
      {!isEven ? (
        // Milestone on Left: Connector extends from center (50%) to left card edge (calc(50% - 2.25rem))
        <motion.div
          style={{
            scaleX: connectorScaleX,
            opacity: connectorOpacity,
            originX: 1, // grows from center marker towards card on left
          }}
          className="hidden md:block absolute top-1/2 -translate-y-1/2 right-1/2 w-[2.25rem] h-[2px] bg-gradient-to-l from-[#B8975E] via-[#D4AF37] to-[#B8975E] shadow-[0_0_8px_rgba(212,175,55,0.45)] z-10"
          aria-hidden="true"
        >
          {/* Rivet dot touching the card edge */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-xs"
            style={{ backgroundColor: item.accentColor }}
          />
        </motion.div>
      ) : (
        // Milestone on Right: Connector extends from center (50%) to right card edge (calc(50% + 2.25rem))
        <motion.div
          style={{
            scaleX: connectorScaleX,
            opacity: connectorOpacity,
            originX: 0, // grows from center marker towards card on right
          }}
          className="hidden md:block absolute top-1/2 -translate-y-1/2 left-1/2 w-[2.25rem] h-[2px] bg-gradient-to-r from-[#B8975E] via-[#D4AF37] to-[#B8975E] shadow-[0_0_8px_rgba(212,175,55,0.45)] z-10"
          aria-hidden="true"
        >
          {/* Rivet dot touching the card edge */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-xs"
            style={{ backgroundColor: item.accentColor }}
          />
        </motion.div>
      )}

      {/* ================================================================= */}
      {/* MOBILE LEFT MARKER & HORIZONTAL CONNECTOR (< md)                  */}
      {/* ================================================================= */}
      <motion.div
        style={{
          scale: markerScale,
        }}
        className="md:hidden absolute left-[22px] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#FFFDF8] border-2 border-[rgba(184,151,94,0.35)] shadow-xs select-none"
        aria-hidden="true"
      >
        {/* Active glowing ring overlay */}
        <motion.div
          style={{
            opacity: shouldReduceMotion ? 1 : animGlowProgress,
            borderColor: item.activeBorderColor,
            boxShadow: `0 0 16px ${item.activeGlowColor}`,
          }}
          className="absolute -inset-[2px] rounded-full border-2 pointer-events-none will-change-[opacity]"
          aria-hidden="true"
        />
        <motion.div
          style={{
            scale: markerDotScale,
            opacity: markerDotOpacity,
            backgroundColor: item.accentColor,
          }}
          className="w-1.5 h-1.5 rounded-full relative z-10"
        />
      </motion.div>

      {/* Horizontal Connector Line for Mobile */}
      <motion.div
        style={{
          scaleX: connectorScaleX,
          opacity: connectorOpacity,
          originX: 0, // grows from left marker towards right card
        }}
        className="md:hidden absolute top-1/2 -translate-y-1/2 left-[22px] w-[32px] h-[2px] bg-gradient-to-r from-[#B8975E] via-[#D4AF37] to-[#B8975E] shadow-[0_0_6px_rgba(212,175,55,0.45)] z-10"
        aria-hidden="true"
      >
        {/* Rivet dot touching card */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-xs"
          style={{ backgroundColor: item.accentColor }}
        />
      </motion.div>

      {/* ================================================================= */}
      {/* MILESTONE CARD                                                    */}
      {/* ================================================================= */}
      <div
        className={`w-full pl-[54px] md:pl-0 md:w-[calc(50%-2.25rem)] ${
          isEven ? "md:ml-auto" : ""
        }`}
      >
        <motion.article
          style={{
            borderColor: cardBorder,
            boxShadow: cardShadow,
          }}
          className={`relative p-3.5 sm:p-4 md:p-4.5 rounded-xl bg-gradient-to-b ${item.bgGradient} border transition-transform duration-300 overflow-hidden group hover:-translate-y-0.5`}
        >
          {/* Mobile/Tablet Hardware-Accelerated Glow & Active Border Overlay */}
          <motion.div
            style={{
              opacity: shouldReduceMotion ? 1 : animGlowProgress,
              boxShadow: `0 14px 36px ${item.activeGlowColor}`,
              borderColor: item.activeBorderColor,
            }}
            className="md:hidden absolute inset-0 rounded-xl border pointer-events-none z-0 will-change-[opacity]"
            aria-hidden="true"
          />
          {/* Architectural Corner Brackets (Matching Venues) */}
          <CornerBracket position="top-left" color={item.accentColor} size={11} />
          <CornerBracket position="top-right" color={item.accentColor} size={11} />
          <CornerBracket position="bottom-left" color={item.accentColor} size={11} />
          <CornerBracket position="bottom-right" color={item.accentColor} size={11} />

          {/* Radial Half-Mandala Watermark (Matching Venues) */}
          <CardMandalaWatermark
            strokeColor={item.accentColor}
            opacity={0.12}
            size="sm"
            position="bottom-right"
          />

          <div className="relative z-10">
            {/* Top Row: Chapter Kicker & Ceremony Date Badge */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1 select-none">
              <span
                className="text-[10px] sm:text-[10.5px] lg:text-[9.5px] font-sans font-bold uppercase tracking-[0.2em]"
                style={{ color: item.accentColor }}
              >
                {item.badge}
              </span>

              {item.date && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] lg:text-[9px] font-sans font-bold tracking-wider uppercase bg-[#FAF5E6] border border-[#B8975E]/40 text-[#8E1B29] shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8E1B29]" />
                  {item.date}
                </span>
              )}
            </div>

            {/* Milestone Title */}
            <h4 className="font-serif text-[16px] sm:text-[17px] md:text-[18px] text-[#5A101C] font-semibold tracking-wide leading-snug mb-1">
              {item.title}
            </h4>

            {/* Ceremony Venue (if applicable) */}
            {item.venue && (
              <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] lg:text-[11.5px] font-sans font-medium text-[#6B5E55] mb-1 select-none">
                <svg
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: item.accentColor }}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="truncate">{item.venue}</span>
              </div>
            )}

            {/* Sub-divider ◇ Matching Venues & Celebrations */}
            <div className="flex items-center gap-2 my-1 select-none" aria-hidden="true">
              <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#B8975E]/40" />
              <span className="text-[5.5px] text-[#B8975E] rotate-45">◇</span>
            </div>

            {/* Milestone Description */}
            <p className="font-sans text-[13.5px] sm:text-[13.5px] md:text-[13px] text-[#4A4036] leading-relaxed">
              {item.description}
            </p>
          </div>
        </motion.article>
      </div>
    </motion.div>
  );
}

export function OurStorySection() {
  const shouldReduceMotion = useMotionReduced();
  const timelineRef = useRef<HTMLDivElement>(null);
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];

  // Scroll-driven progress tracking: begins when the timeline start hits viewport center
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });

  return (
    <section
      id="our-story"
      aria-labelledby="our-story-title"
      className="relative pt-14 sm:pt-18 md:pt-20 lg:pt-24 pb-16 sm:pb-20 md:pb-24 lg:pb-28 bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] border-t border-[rgba(184,151,94,0.2)] scroll-mt-20 overflow-hidden"
    >
      {/* Background Section Filigree Linework & Side Mandalas */}
      <SectionHeaderFiligree color="#B8975E" opacity={0.16} />
      <SectionSideMandala side="left" color="#B8975E" opacity={0.12} />
      <SectionSideMandala side="right" color="#B8975E" opacity={0.12} />

      {/* Atmospheric Ambient Lighting Layers */}
      <AmbientGlow variant="champagne" position="top-left" size="lg" opacity={0.35} />
      <AmbientGlow variant="gold" position="bottom-right" size="lg" opacity={0.25} />

      <Container size="wide" className="relative z-10">
        {/* ================================================================ */}
        {/* PHASE 1: DUAL-TONE EDITORIAL HEADING                             */}
        {/* ================================================================ */}
        <Reveal className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          {/* Eyebrow with Gold Diamonds */}
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3 select-none">
            <span className="text-[9px] text-[#B8975E] rotate-45 font-bold">◆</span>
            <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.24em] text-[#B8975E]">
              CHAPTER OF COMPANIONSHIP
            </span>
            <span className="text-[9px] text-[#B8975E] rotate-45 font-bold">◆</span>
          </div>

          {/* Dual-Tone Main Heading (Matching The Wedding Celebrations) */}
          <h2
            id="our-story-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.12] tracking-tight text-[#6B1724]"
          >
            <span>Our Story </span>
            <span className="italic text-[#A67C1E] font-normal">&amp; Journey</span>
          </h2>

          {/* Subtitle in Italic Serif */}
          <p className="font-serif italic text-sm sm:text-base md:text-[17px] text-[#6B615F] mt-3 sm:mt-3.5 max-w-2xl mx-auto leading-relaxed">
            &ldquo;Two souls, one sacred path, woven together by tradition, blessed by families, and celebrated by everyone who cherishes love.&rdquo;
          </p>

          {/* Central Animated Gold Symmetrical Divider */}
          <AnimatedDivider variant="gold" size="sm" className="mt-4 sm:mt-5" />
        </Reveal>

        {/* ================================================================ */}
        {/* PROFILE CARDS WITH VENUE PATTERNS & RESTORED ARCH FRAME          */}
        {/* ================================================================ */}
        <div className="relative max-w-5xl lg:max-w-6xl xl:max-w-[1260px] 2xl:max-w-[1320px] mx-auto mb-12 sm:mb-16 md:mb-18 lg:mb-22">
          {/* Vertical Center Diamond Flourish between cards on Desktop */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0.7 }}
            whileInView={{ opacity: 1, scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: luxuryEase }}
            className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 select-none pointer-events-none z-20 origin-center"
            aria-hidden="true"
          >
            <span className="text-[7px] text-[#B8975E]/80 rotate-45 font-bold">◇</span>
            <div className="w-[1px] h-24 bg-gradient-to-b from-[#B8975E]/40 via-[#B8975E]/70 to-[#B8975E]/40" />
            <span className="text-[9px] text-[#B8975E] rotate-45 font-bold">◆</span>
            <div className="w-[1px] h-24 bg-gradient-to-b from-[#B8975E]/40 via-[#B8975E]/70 to-[#B8975E]/40" />
            <span className="text-[7px] text-[#B8975E]/80 rotate-45 font-bold">◇</span>
          </motion.div>

          {/* Desktop Separation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-8 xl:gap-10 items-stretch">
            {/* ------------------------------------------------------------ */}
            {/* CARD 01: THE GROOM — ROYAL IVORY & ANTIQUE GOLD               */}
            {/* ------------------------------------------------------------ */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -16, y: 16 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.75, ease: luxuryEase }}
              className="h-full"
            >
              <InteractiveTiltCard maxRotateDeg={1.5} className="h-full">
                <ProfileCard data={GROOM_PROFILE_DATA} />
              </InteractiveTiltCard>
            </motion.div>

            {/* ------------------------------------------------------------ */}
            {/* CARD 02: THE BRIDE — BLUSH IVORY & ROSE GOLD                 */}
            {/* ------------------------------------------------------------ */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 16, y: 16 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.75, delay: shouldReduceMotion ? 0 : 0.12, ease: luxuryEase }}
              className="h-full"
            >
              <InteractiveTiltCard maxRotateDeg={1.5} className="h-full">
                <ProfileCard data={BRIDE_PROFILE_DATA} />
              </InteractiveTiltCard>
            </motion.div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* SIX-MILESTONE SCROLL-DRIVEN CONNECTED TIMELINE                   */}
        {/* ================================================================ */}
        <div ref={timelineRef} className="relative max-w-4xl mx-auto">
          {/* Section Header: Dual-Tone Milestones of Our Bond */}
          <Reveal threshold={0.01} className="text-center max-w-xl mx-auto mb-7 sm:mb-9 md:mb-11 lg:mb-14">
            <div className="flex items-center justify-center gap-2 mb-1.5 sm:mb-2 select-none">
              <span className="text-[8px] text-[#B8975E] rotate-45 font-bold">◆</span>
              <span className="text-[10px] sm:text-[10.5px] lg:text-[10.5px] font-sans font-bold uppercase tracking-[0.24em] text-[#A67C1E]">
                THE SACRED CHRONICLE
              </span>
              <span className="text-[8px] text-[#B8975E] rotate-45 font-bold">◆</span>
            </div>

            {/* Dual-Tone Milestone Heading */}
            <h3
              id="milestones-heading"
              className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-medium tracking-tight leading-[1.15]"
            >
              <span className="text-[#292322]">Milestones of </span>
              <span className="italic text-[#8E1B29] font-normal">Our Bond</span>
            </h3>

            {/* Subtitle Updated for Six Chapters */}
            <p className="font-sans text-[13px] sm:text-[13.5px] lg:text-[13px] text-[#6B615F] mt-2 font-normal">
              Six chapters marking the sacred joining of two families, guided by timeless tradition.
            </p>

            {/* Animated Gold Divider */}
            <AnimatedDivider variant="gold" size="sm" className="mt-3" />
          </Reveal>

          {/* Timeline Container with Smooth-Fading Scroll Progress Line */}
          <div className="relative pb-4">
            {/* ------------------------------------------------------------ */}
            {/* DESKTOP VERTICAL SPINE WITH SOFT GRADIENT BLENDING (≥ md)    */}
            {/* ------------------------------------------------------------ */}
            <div
              className="hidden md:block absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-6 pointer-events-none z-0"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)",
              }}
              aria-hidden="true"
            >
              {/* Inactive Base Line: Subtle Champagne-Gold */}
              <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-[2px] bg-gradient-to-b from-[#B8975E]/15 via-[#B8975E]/30 to-[#B8975E]/15" />

              {/* Active Scroll-Driven Filling Line with Golden Glow */}
              <motion.div
                style={{
                  scaleY: shouldReduceMotion ? 1 : scrollYProgress,
                  originY: 0,
                }}
                className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-[2.5px] bg-gradient-to-b from-[#A67C1E] via-[#D4AF37] to-[#F3D78A] shadow-[0_0_12px_rgba(212,175,55,0.7)]"
              />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* MOBILE VERTICAL SPINE WITH SOFT GRADIENT BLENDING (< md)     */}
            {/* ------------------------------------------------------------ */}
            <div
              className="md:hidden absolute left-[22px] -translate-x-1/2 top-3 bottom-3 w-6 pointer-events-none z-0"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 36px, black calc(100% - 36px), transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 36px, black calc(100% - 36px), transparent 100%)",
              }}
              aria-hidden="true"
            >
              {/* Inactive Base Line */}
              <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-[2px] bg-gradient-to-b from-[#B8975E]/15 via-[#B8975E]/30 to-[#B8975E]/15" />

              {/* Active Line with Golden Glow */}
              <motion.div
                style={{
                  scaleY: shouldReduceMotion ? 1 : scrollYProgress,
                  originY: 0,
                }}
                className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-[2.5px] bg-gradient-to-b from-[#A67C1E] via-[#D4AF37] to-[#F3D78A] shadow-[0_0_10px_rgba(212,175,55,0.7)] will-change-transform"
              />
            </div>

            {/* SIX MILESTONE CARDS WITH REDUCED VERTICAL SPACING (space-y-3 sm:space-y-3.5 md:space-y-3.5) */}
            <div className="space-y-3 sm:space-y-3.5 md:space-y-3.5">
              {MILESTONES.map((item, index) => (
                <MilestoneRow
                  key={item.number}
                  item={item}
                  index={index}
                  progress={scrollYProgress}
                  threshold={MILESTONE_THRESHOLDS[index]}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </div>

            {/* ============================================================ */}
            {/* END-OF-TIMELINE CLOSING MESSAGE                              */}
            {/* ============================================================ */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: luxuryEase }}
              className="mt-8 sm:mt-10 md:mt-12 lg:mt-14 text-center select-none"
            >
              {/* Animated Gold Symmetrical Divider */}
              <AnimatedDivider variant="gold" size="sm" className="mb-3 sm:mb-3.5" />

              {/* Exact closing text in signature serif italic */}
              <p className="font-serif italic text-base sm:text-lg md:text-xl text-[#6B1724] tracking-wide max-w-lg mx-auto leading-relaxed">
                &ldquo;With the blessings of our families, a beautiful new chapter begins.&rdquo;
              </p>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
