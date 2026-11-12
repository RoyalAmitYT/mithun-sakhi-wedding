"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
  AnimatedDivider,
  useMotionReduced,
  MOTION_EASINGS,
} from "@/components/motion";
import { AmbientGlow, GoldLightSweep } from "@/components/effects";
import { InteractiveTiltCard, MagneticButton } from "@/components/interactive";
import {
  SectionHeaderFiligree,
  SectionSideMandala,
  CornerBracket,
  CardMandalaWatermark,
} from "@/components/ui/decorative-surfaces";

/**
 * Ceremony specifications matching the visual reference image 1:1
 * Uses the four owner-supplied portraits with bespoke object-positioning
 */
const CEREMONIES = [
  {
    id: "haldi",
    ritualNumber: "RITUAL 01",
    dayNumber: "19",
    month: "NOV",
    time: "9:00 AM IST",
    title: "Haldi Ceremony",
    description: "The sacred turmeric blessing marking a joyous new beginning.",
    venue: "Groom's Home, Purulia",
    imageSrc: "/images/haldi-portrait-card.webp",
    objectPosition: "66% 40%",
    altText: "Mithun & Sakhi Haldi Ceremony Celebration in Purulia",
    cardBg: "#FCF9EE",
    borderClass: "border-[#D4AF37]/40 hover:border-[#D4AF37]/75",
    badgeBg: "#B38218",
    accentColor: "#A67C1E",
    titleColor: "#292322",
    pinColor: "#B38218",
  },
  {
    id: "mehndi",
    ritualNumber: "RITUAL 02",
    dayNumber: "20",
    month: "NOV",
    time: "9:00 AM IST",
    title: "Mehndi Ceremony",
    description: "A vibrant celebration of henna, music and togetherness.",
    venue: "Groom's Home, Purulia",
    imageSrc: "/images/mehendi-portrait-card.webp",
    objectPosition: "62% center",
    altText: "Intricate Bridal Mehndi Celebration & Henna Art",
    cardBg: "#F3F7F3",
    borderClass: "border-[#2B5E3F]/35 hover:border-[#2B5E3F]/70",
    badgeBg: "#1E4E34",
    accentColor: "#2B5E3F",
    titleColor: "#292322",
    pinColor: "#1E4E34",
  },
  {
    id: "wedding",
    ritualNumber: "RITUAL 03",
    dayNumber: "21",
    month: "NOV",
    time: "11:00 PM IST",
    title: "The Sacred Wedding",
    description: "The sacred Vedic marriage ceremony uniting two hearts for a lifetime.",
    venue: "Bride's Home, Purulia",
    imageSrc: "/images/the-sacred-wedding-card.webp",
    objectPosition: "68% center",
    altText: "Sacred Vedic Wedding Ceremony under the Floral Mandap",
    cardBg: "#FDF5F5",
    borderClass: "border-[#8E1B29]/45 hover:border-[#8E1B29]/80",
    badgeBg: "#8E1B29",
    accentColor: "#8E1B29",
    titleColor: "#8E1B29", // Crimson title emphasis matching design reference
    pinColor: "#8E1B29",
  },
  {
    id: "reception",
    ritualNumber: "RITUAL 04",
    dayNumber: "22",
    month: "NOV",
    time: "5:00 PM IST",
    title: "Reception",
    description: "A grand celebration banquet with family, friends and heartfelt blessings.",
    venue: "Groom's Home, Purulia",
    imageSrc: "/images/reception-portrait-card.webp",
    objectPosition: "84% 35%",
    altText: "Grand Evening Wedding Reception Stage & Celebration Banquet",
    cardBg: "#FAF5F6",
    borderClass: "border-[#6A2234]/35 hover:border-[#6A2234]/70",
    badgeBg: "#541A25",
    accentColor: "#6A2234",
    titleColor: "#292322",
    pinColor: "#541A25",
  },
];

export function CelebrationsOverviewSection() {
  const shouldReduceMotion = useMotionReduced();
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];

  return (
    <section
      id="celebrations"
      aria-labelledby="celebrations-title"
      className="relative pt-16 sm:pt-20 md:pt-24 pb-28 sm:pb-36 lg:pb-40 bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] scroll-mt-20 overflow-hidden"
    >
      {/* Background Architectural Filigree & Side Mandalas */}
      <SectionHeaderFiligree color="#B8975E" opacity={0.16} />
      <SectionSideMandala side="left" color="#B8975E" opacity={0.12} />
      <SectionSideMandala side="right" color="#B8975E" opacity={0.12} />

      {/* Atmospheric Ambient Lighting Layers */}
      <AmbientGlow variant="champagne" position="top-center" size="lg" opacity={0.35} />
      <AmbientGlow variant="gold" position="bottom-center" size="lg" opacity={0.25} />

      <Container size="wide" className="relative z-10">
        {/* ================================================================ */}
        {/* SECTION HEADER: Matches Visual Reference Exactly                 */}
        {/* ================================================================ */}
        <Reveal className="mb-10 sm:mb-12 text-center max-w-3xl mx-auto">
          {/* Eyebrow: FOUR SACRED CEREMONIES */}
          <div className="flex items-center justify-center gap-2 mb-2.5 select-none">
            <span className="text-[7.5px] text-[#8E1B29]" aria-hidden="true">
              ◆
            </span>
            <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.24em] text-[#8E1B29]">
              Four Sacred Ceremonies
            </span>
            <span className="text-[7.5px] text-[#8E1B29]" aria-hidden="true">
              ◆
            </span>
          </div>

          {/* Main Title: The Wedding Celebrations with Two-tone Styling */}
          <h2
            id="celebrations-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#1A1717] leading-[1.12]"
          >
            <span>The Wedding </span>
            <span className="text-[#8E1B29]">Celebrations</span>
          </h2>

          {/* Subtitle */}
          <p className="mt-3 text-sm sm:text-base md:text-lg font-serif italic text-[#5C5452] max-w-2xl mx-auto leading-relaxed">
            Four days of sacred rituals, joyful music, and cherished blessings in Purulia.
          </p>

          {/* Reusable Animated Gold Ornamental Divider */}
          <AnimatedDivider variant="gold" size="sm" className="mt-3.5 mb-2" />
        </Reveal>

        {/* ================================================================ */}
        {/* FOUR CEREMONY EDITORIAL CARDS: S-Curve Wave + Color Identities   */}
        {/* ================================================================ */}
        <StaggerGroup
          staggerDelay={0.12}
          threshold={0.12}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-5 xl:gap-6 items-stretch"
        >
          {CEREMONIES.map((c, index) => {
            return (
              <StaggerItem key={c.id} distance={20} className="h-full">
                <InteractiveTiltCard maxRotateDeg={1.6} className="h-full">
                  <article
                    aria-label={`${c.title} — ${c.dayNumber} ${c.month}`}
                    style={{ backgroundColor: c.cardBg }}
                    className={`
                      group relative flex flex-col h-full rounded-2xl overflow-hidden
                      border ${c.borderClass} shadow-[0_12px_36px_rgba(41,35,34,0.06)]
                      hover:shadow-[0_20px_48px_rgba(41,35,34,0.14)] hover:-translate-y-1.5
                      transition-all duration-300
                    `}
                  >
                  {/* Subtle Gold Light Sweep on Card Hover */}
                  <GoldLightSweep trigger="hover" intensity="subtle" />
                  {/* Top Image Container with Hanging Date Ribbon Badge & Wave Bottom */}
                  <div className="relative w-full h-[215px] sm:h-[225px] overflow-hidden bg-[#F7F1E6]">
                    {/* Hanging Date Ribbon Badge */}
                    <motion.div
                      initial={shouldReduceMotion ? { y: 0, opacity: 1 } : { y: -14, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.5,
                        delay: 0.15 + index * 0.08,
                        ease: luxuryEase,
                      }}
                      className="absolute top-0 left-4 w-11 sm:w-12 pt-2 pb-2.5 rounded-b-xl text-center text-white shadow-md z-20 pointer-events-none select-none"
                      style={{ backgroundColor: c.badgeBg }}
                    >
                      <span className="font-serif text-lg sm:text-[1.35rem] font-bold leading-none block drop-shadow-sm">
                        {c.dayNumber}
                      </span>
                      <span className="text-[8.5px] font-sans font-bold tracking-[0.16em] uppercase block mt-0.5 text-white/95">
                        {c.month}
                      </span>
                    </motion.div>

                    {/* Ceremony Portrait Image with Gentle Scale Settling */}
                    <motion.div
                      suppressHydrationWarning
                      initial={false}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.85,
                        delay: 0.1 + index * 0.08,
                        ease: luxuryEase,
                      }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={c.imageSrc}
                        alt={c.altText}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        style={{ objectPosition: c.objectPosition }}
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </motion.div>

                    {/* Subtle Photographic Depth Vignette */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-10"
                      aria-hidden="true"
                    />

                    {/* Elegant Curved / S-Wave Bottom Transition */}
                    <svg
                      viewBox="0 0 320 28"
                      preserveAspectRatio="none"
                      className="absolute bottom-0 left-0 right-0 w-full h-7 sm:h-8 z-10 pointer-events-none select-none"
                      style={{ fill: c.cardBg }}
                      aria-hidden="true"
                    >
                      <path d="M 0 14 C 60 14, 90 26, 140 26 C 210 26, 250 4, 320 4 L 320 28 L 0 28 Z" />
                    </svg>
                  </div>

                  {/* Card Content Area with Architectural Ornaments */}
                  <div className="relative flex-1 flex flex-col justify-between p-5 pt-3 sm:p-6 sm:pt-4 overflow-hidden">
                    {/* Corner Ornaments */}
                    <CornerBracket position="bottom-left" color={c.accentColor} size={14} />
                    <CornerBracket position="bottom-right" color={c.accentColor} size={14} />

                    {/* Subtle Radial Mandala Watermark */}
                    <CardMandalaWatermark
                      strokeColor={c.accentColor}
                      opacity={0.14}
                      size="sm"
                      position="bottom-right"
                    />

                    <div className="relative z-10">
                      {/* Ceremony Number & Confirmed Time */}
                      <div
                        className="text-[10px] sm:text-[10.5px] font-sans font-bold uppercase tracking-[0.18em] mb-1.5 select-none"
                        style={{ color: c.accentColor }}
                      >
                        <span>{c.ritualNumber}</span>
                        <span className="mx-1.5 opacity-60">&bull;</span>
                        <span>{c.time}</span>
                      </div>

                      {/* Ceremony Title */}
                      <h3
                        className="font-serif text-2xl sm:text-[1.65rem] font-medium leading-snug tracking-tight mb-2"
                        style={{ color: c.titleColor }}
                      >
                        {c.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs sm:text-[13px] text-[#635B59] leading-relaxed mb-4">
                        {c.description}
                      </p>
                    </div>

                    {/* Venue & Action Link */}
                    <div className="relative z-10">
                      {/* Venue with Color-Matched Pin Icon */}
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B615F] mb-4">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill={c.pinColor}
                          className="shrink-0"
                          aria-hidden="true"
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <span>{c.venue}</span>
                      </div>

                      {/* Centered Action Link with Micro-Divider */}
                      <div className="pt-3 border-t border-black/[0.06] text-center">
                        <Link
                          href={`#${c.id}`}
                          className="inline-flex items-center justify-center gap-1.5 text-[10.5px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.18em] group-hover:gap-2.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E] rounded-[2px]"
                          style={{ color: c.accentColor }}
                        >
                          <span>View Ceremony</span>
                          <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </InteractiveTiltCard>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      {/* ================================================================ */}
      {/* Footnote: Required Temporary Media Disclaimer                    */}
      {/* ================================================================ */}
      <div className="mt-8 sm:mt-10 text-center max-w-xl mx-auto px-4">
        <p className="text-[11px] text-[#8A8280] font-sans leading-relaxed">
          Illustrative preview imagery &bull; Official wedding photographs coming soon.
        </p>
      </div>

      {/* ================================================================ */}
      {/* Action Link: View Complete Ceremony Schedule                      */}
      {/* ================================================================ */}
      <Reveal delay={0.2} className="mt-5 sm:mt-6 text-center">
        <MagneticButton>
          <Link
            href="#haldi"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFFDF8] border border-[#B8975E]/50 text-[#8E6D38] hover:text-[#A52232] hover:border-[#A52232]/60 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition-all duration-200 text-[11px] sm:text-xs font-sans font-semibold uppercase tracking-[0.16em] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E] focus-visible:ring-offset-2"
          >
            <span>View Complete Ceremony Schedule</span>
            <span
              className="text-sm font-normal transform group-hover:translate-y-0.5 transition-transform"
              aria-hidden="true"
            >
              &darr;
            </span>
          </Link>
        </MagneticButton>
      </Reveal>
      </Container>
    </section>
  );
}
