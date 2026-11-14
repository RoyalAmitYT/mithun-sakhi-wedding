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
import {
  AmbientGlow,
  GoldLightSweep,
  PhotoAmbientHalo,
} from "@/components/effects";
import { InteractiveTiltCard } from "@/components/interactive";
import {
  CornerBracket,
  CardMandalaWatermark,
  SectionHeaderFiligree,
  SectionSideMandala,
} from "@/components/ui/decorative-surfaces";

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
          borderColor: markerBorder,
          boxShadow: markerShadow,
        }}
        className="md:hidden absolute left-[22px] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#FFFDF8] border-2 shadow-xs select-none"
        aria-hidden="true"
      >
        <motion.div
          style={{
            scale: markerDotScale,
            opacity: markerDotOpacity,
            backgroundColor: item.accentColor,
          }}
          className="w-1.5 h-1.5 rounded-full"
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
          className={`relative p-3.5 sm:p-4 md:p-4.5 rounded-xl bg-gradient-to-b ${item.bgGradient} border transition-all duration-300 overflow-hidden group hover:-translate-y-0.5`}
        >
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
        <div className="relative max-w-5xl lg:max-w-6xl xl:max-w-[1180px] mx-auto mb-12 sm:mb-16 md:mb-18 lg:mb-22">
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

          {/* Desktop Separation (gap-14 xl:gap-16) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-14 xl:gap-16 items-stretch">
            {/* ------------------------------------------------------------ */}
            {/* CARD 01: THE GROOM                                           */}
            {/* ------------------------------------------------------------ */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -16, y: 16 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.75, ease: luxuryEase }}
              className="h-full"
            >
              <InteractiveTiltCard maxRotateDeg={1.8} className="h-full">
                <article
                  aria-labelledby="groom-card-title"
                  className="relative h-full flex flex-col justify-between p-5 sm:p-6 md:p-7 rounded-2xl bg-gradient-to-b from-[#FCF9EE] to-[#FAF5E6] border border-[#B8975E]/35 shadow-[0_12px_40px_rgba(184,151,94,0.08)] hover:shadow-[0_18px_48px_rgba(184,151,94,0.15)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                >
                {/* Gold Light Sweep on Hover */}
                <GoldLightSweep trigger="hover" intensity="subtle" />

                {/* Architectural Corner Brackets (Exact Venues Language) */}
                <CornerBracket position="top-left" color="#B8975E" />
                <CornerBracket position="top-right" color="#B8975E" />
                <CornerBracket position="bottom-left" color="#B8975E" />
                <CornerBracket position="bottom-right" color="#B8975E" />

                {/* Radial Half-Mandala Watermark (Exact Venues Language) */}
                <CardMandalaWatermark strokeColor="#B8975E" opacity={0.16} size="md" position="right" />

                {/* Subtle Decorative Initial Watermark: M */}
                <div
                  className="absolute -right-3 -bottom-5 font-serif text-[130px] sm:text-[150px] font-bold text-[#B8975E]/[0.035] select-none pointer-events-none leading-none z-0"
                  aria-hidden="true"
                >
                  M
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    {/* Top Label */}
                    <div className="flex items-center justify-center gap-2 pb-2.5 sm:pb-3 border-b border-[#B8975E]/20 mb-4 sm:mb-5 select-none">
                      <span className="text-[8px] text-[#B8975E] rotate-45 font-bold">◆</span>
                      <span className="text-[10px] sm:text-[10.5px] lg:text-[10.5px] font-sans font-bold uppercase tracking-[0.22em] text-[#A67C1E]">
                        THE GROOM
                      </span>
                      <span className="text-[8px] text-[#B8975E] rotate-45 font-bold">◆</span>
                    </div>

                    {/* Split Content: Restored Arched Architectural Frame (Left) + Information (Right) */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-start">
                      {/* Restored Elegant Arched Frame (Preserving increased 2:3 height) */}
                      <div className="relative w-40 sm:w-44 md:w-48 aspect-[2/3] shrink-0 p-1.5 sm:p-2 rounded-t-[84px] sm:rounded-t-[92px] rounded-b-xl border-2 border-[#B8975E]/55 bg-gradient-to-b from-[#FFFDF9] via-[#FAF5E6] to-[#F5EEDC] shadow-[0_10px_28px_rgba(184,151,94,0.16)] transition-all duration-500 group-hover:border-[#B8975E]/85">
                        {/* Ambient Studio Rim Halo */}
                        <PhotoAmbientHalo color="#D4AF37" size="md" opacity={0.25} />

                        {/* Top Arch Finial Accent */}
                        <div
                          className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 select-none pointer-events-none z-20"
                          aria-hidden="true"
                        >
                          <span className="text-[5px] text-[#B8975E] rotate-45">◇</span>
                          <span className="text-[7.5px] text-[#A67C1E] rotate-45 font-bold">◆</span>
                          <span className="text-[5px] text-[#B8975E] rotate-45">◇</span>
                        </div>

                        {/* Inner Inset Arched Frame */}
                        <div className="relative w-full h-full rounded-t-[74px] sm:rounded-t-[82px] rounded-b-lg overflow-hidden border border-[#B8975E]/40 shadow-inner bg-[#FAF5E6]">
                          <div className="relative w-full h-full">
                            <picture className="absolute inset-0 w-full h-full">
                              <img
                                src="/images/portraits/mithun-groom-portrait.webp"
                                alt="Mithun Gorain — Groom Portrait"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                              />
                            </picture>
                          </div>
                          {/* Inset Highlight Ring */}
                          <div className="absolute inset-0 pointer-events-none rounded-t-[74px] sm:rounded-t-[82px] rounded-b-lg ring-1 ring-inset ring-white/40 z-10" />
                        </div>
                      </div>

                      {/* Information Side */}
                      <div className="flex-1 flex flex-col justify-between min-w-0 text-left w-full sm:w-auto">
                        <div>
                          {/* Eyebrow */}
                          <span className="text-[10px] sm:text-[10.5px] lg:text-[9.5px] font-sans font-bold uppercase tracking-[0.22em] text-[#A67C1E] block">
                            The Groom
                          </span>

                          {/* Name */}
                          <h3
                            id="groom-card-title"
                            className="font-serif text-[1.82rem] sm:text-[2.28rem] text-[#292322] font-normal tracking-tight leading-tight mt-0.5 mb-1"
                          >
                            Mithun Gorain
                          </h3>

                          {/* Sub-divider ◇ Matching Venues */}
                          <div className="flex items-center gap-2 my-1.5 select-none" aria-hidden="true">
                            <div className="h-[1px] w-6 bg-[#B8975E]/40" />
                            <span className="text-[6.5px] text-[#B8975E] rotate-45">◇</span>
                          </div>

                          {/* Personal Introduction */}
                          <p className="font-serif italic text-[13.5px] sm:text-[13.5px] lg:text-[13px] text-[#5C5351] leading-relaxed my-2">
                            &ldquo;Rooted in family values and cherished traditions, Mithun carries forward the warmth of his family&apos;s heritage as he begins a beautiful new chapter of life.&rdquo;
                          </p>

                          {/* Parents Header Block */}
                          <div className="mt-3 pt-2.5 border-t border-[#B8975E]/20">
                            <span className="text-[10px] sm:text-[10.5px] lg:text-[9.5px] font-sans font-bold uppercase tracking-[0.2em] text-[#8E6D38] block mb-1">
                              BELOVED PARENTS
                            </span>
                            <p className="font-serif text-base sm:text-[17px] font-medium text-[#292322] leading-snug">
                              Mr. Kenaram Gorain
                            </p>
                            <p className="font-serif text-base sm:text-[17px] font-medium text-[#292322] leading-snug">
                              &amp; Ms. Savita Gorian
                            </p>
                          </div>
                        </div>

                        {/* Residence Location Pill */}
                        <div
                          className="mt-3.5 pt-2.5 border-t border-[#B8975E]/20"
                        >
                          <div className="flex items-start gap-1.5 text-xs text-[#6B615F]">
                            <svg className="w-3.5 h-3.5 text-[#A67C1E] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            <div>
                              <span className="font-sans font-semibold text-[#292322] block text-[12px] sm:text-xs lg:text-[11.5px]">
                                Chitmu &bull; Kotshila &bull; Purulia
                              </span>
                              <span className="text-[11px] sm:text-[11.5px] lg:text-[10.5px] text-[#8A8280]">
                                Family Residence &bull; PIN 723215
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Blessing Quotation */}
                  <div
                    className="mt-4 pt-3 border-t border-[#B8975E]/20 text-center select-none"
                  >
                    <p className="font-serif italic text-[13px] sm:text-[13.5px] lg:text-[13px] text-[#6B615F]">
                      &ldquo;With ancestral blessings and the love of our kin, we celebrate this sacred union.&rdquo;
                    </p>
                  </div>
                </div>
              </article>
            </InteractiveTiltCard>
          </motion.div>

            {/* ------------------------------------------------------------ */}
            {/* CARD 02: THE BRIDE                                           */}
            {/* ------------------------------------------------------------ */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 16, y: 16 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.75, delay: shouldReduceMotion ? 0 : 0.12, ease: luxuryEase }}
              className="h-full"
            >
              <InteractiveTiltCard maxRotateDeg={1.8} className="h-full">
                <article
                  aria-labelledby="bride-card-title"
                  className="relative h-full flex flex-col justify-between p-5 sm:p-6 md:p-7 rounded-2xl bg-gradient-to-b from-[#FDF5F5] to-[#FAF0F1] border border-[#8E1B29]/30 shadow-[0_12px_40px_rgba(142,27,41,0.06)] hover:shadow-[0_18px_48px_rgba(142,27,41,0.13)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                >
                {/* Gold Light Sweep on Hover */}
                <GoldLightSweep trigger="hover" intensity="subtle" />

                {/* Architectural Corner Brackets (Exact Venues Language) */}
                <CornerBracket position="top-left" color="#8E1B29" />
                <CornerBracket position="top-right" color="#8E1B29" />
                <CornerBracket position="bottom-left" color="#8E1B29" />
                <CornerBracket position="bottom-right" color="#8E1B29" />

                {/* Radial Half-Mandala Watermark (Exact Venues Language) */}
                <CardMandalaWatermark strokeColor="#8E1B29" opacity={0.14} size="md" position="right" />

                {/* Subtle Decorative Initial Watermark: S */}
                <div
                  className="absolute -right-3 -bottom-5 font-serif text-[130px] sm:text-[150px] font-bold text-[#8E1B29]/[0.035] select-none pointer-events-none leading-none z-0"
                  aria-hidden="true"
                >
                  S
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    {/* Top Label */}
                    <div className="flex items-center justify-center gap-2 pb-2.5 sm:pb-3 border-b border-[#8E1B29]/20 mb-4 sm:mb-5 select-none">
                      <span className="text-[8px] text-[#8E1B29] rotate-45 font-bold">◆</span>
                      <span className="text-[10px] sm:text-[10.5px] lg:text-[10.5px] font-sans font-bold uppercase tracking-[0.22em] text-[#8E1B29]">
                        THE BRIDE
                      </span>
                      <span className="text-[8px] text-[#8E1B29] rotate-45 font-bold">◆</span>
                    </div>

                    {/* Split Content: Restored Arched Architectural Frame (Left) + Information (Right) */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-start">
                      {/* Restored Elegant Arched Frame (Preserving increased 2:3 height) */}
                      <div className="relative w-40 sm:w-44 md:w-48 aspect-[2/3] shrink-0 p-1.5 sm:p-2 rounded-t-[84px] sm:rounded-t-[92px] rounded-b-xl border-2 border-[#8E1B29]/45 bg-gradient-to-b from-[#FFFDF9] via-[#FAF0F1] to-[#F5E6E8] shadow-[0_10px_28px_rgba(142,27,41,0.14)] transition-all duration-500 group-hover:border-[#8E1B29]/80">
                        {/* Ambient Studio Rim Halo */}
                        <PhotoAmbientHalo color="#A52232" size="md" opacity={0.22} />

                        {/* Top Arch Finial Accent */}
                        <div
                          className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 select-none pointer-events-none z-20"
                          aria-hidden="true"
                        >
                          <span className="text-[5px] text-[#8E1B29]/70 rotate-45">◇</span>
                          <span className="text-[7.5px] text-[#8E1B29] rotate-45 font-bold">◆</span>
                          <span className="text-[5px] text-[#8E1B29]/70 rotate-45">◇</span>
                        </div>

                        {/* Inner Inset Arched Frame */}
                        <div className="relative w-full h-full rounded-t-[74px] sm:rounded-t-[82px] rounded-b-lg overflow-hidden border border-[#8E1B29]/35 shadow-inner bg-[#FAF0F1]">
                          <div className="relative w-full h-full">
                            <picture className="absolute inset-0 w-full h-full">
                              <img
                                src="/images/portraits/sakhi-bride-portrait.webp"
                                alt="Sakhi Gorain — Bride Portrait"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                              />
                            </picture>
                          </div>
                          {/* Inset Highlight Ring */}
                          <div className="absolute inset-0 pointer-events-none rounded-t-[74px] sm:rounded-t-[82px] rounded-b-lg ring-1 ring-inset ring-white/40 z-10" />
                        </div>
                      </div>

                      {/* Information Side */}
                      <div className="flex-1 flex flex-col justify-between min-w-0 text-left w-full sm:w-auto">
                        <div>
                          {/* Eyebrow */}
                          <span className="text-[10px] sm:text-[10.5px] lg:text-[9.5px] font-sans font-bold uppercase tracking-[0.22em] text-[#8E1B29] block">
                            The Bride
                          </span>

                          {/* Name */}
                          <h3
                            id="bride-card-title"
                            className="font-serif text-[1.82rem] sm:text-[2.28rem] text-[#8E1B29] font-normal tracking-tight leading-tight mt-0.5 mb-1"
                          >
                            Sakhi Gorain
                          </h3>

                          {/* Sub-divider ◇ Matching Venues */}
                          <div className="flex items-center gap-2 my-1.5 select-none" aria-hidden="true">
                            <div className="h-[1px] w-6 bg-[#8E1B29]/35" />
                            <span className="text-[6.5px] text-[#8E1B29] rotate-45">◇</span>
                          </div>

                          {/* Personal Introduction */}
                          <p className="font-serif italic text-[13.5px] sm:text-[13.5px] lg:text-[13px] text-[#5C5351] leading-relaxed my-2">
                            &ldquo;Graceful in spirit and deeply connected to her family and traditions, Sakhi steps into a new journey filled with love, togetherness and beautiful possibilities.&rdquo;
                          </p>

                          {/* Parents Header Block */}
                          <div className="mt-3 pt-2.5 border-t border-[#8E1B29]/20">
                            <span className="text-[10px] sm:text-[10.5px] lg:text-[9.5px] font-sans font-bold uppercase tracking-[0.2em] text-[#8E1B29] block mb-1">
                              BELOVED PARENTS
                            </span>
                            <p className="font-serif text-base sm:text-[17px] font-medium text-[#292322] leading-snug">
                              Mr. Upen Gorain
                            </p>
                            <p className="font-serif text-base sm:text-[17px] font-medium text-[#292322] leading-snug">
                              &amp; Ms. Kokila Gorain
                            </p>
                          </div>
                        </div>

                        {/* Residence Location Pill */}
                        <div
                          className="mt-3.5 pt-2.5 border-t border-[#8E1B29]/20"
                        >
                          <div className="flex items-start gap-1.5 text-xs text-[#6B615F]">
                            <svg className="w-3.5 h-3.5 text-[#8E1B29] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            <div>
                              <span className="font-sans font-semibold text-[#292322] block text-[12px] sm:text-xs lg:text-[11.5px]">
                                Ghaghra &bull; Jaipur &bull; Purulia
                              </span>
                              <span className="text-[11px] sm:text-[11.5px] lg:text-[10.5px] text-[#8A8280]">
                                Family Residence &bull; PIN 723201
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Blessing Quotation */}
                  <div
                    className="mt-4 pt-3 border-t border-[#8E1B29]/20 text-center select-none"
                  >
                    <p className="font-serif italic text-[13px] sm:text-[13.5px] lg:text-[13px] text-[#6B615F]">
                      &ldquo;May every step forward together bring timeless peace, joy, and prosperity.&rdquo;
                    </p>
                  </div>
                </div>
              </article>
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
                className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-[2.5px] bg-gradient-to-b from-[#A67C1E] via-[#D4AF37] to-[#F3D78A] shadow-[0_0_10px_rgba(212,175,55,0.7)]"
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
