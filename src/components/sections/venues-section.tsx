"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { AnimatedDivider } from "@/components/motion/animated-divider";
import { useMotionReduced, MOTION_EASINGS } from "@/lib/motion";
import { AmbientGlow, GoldLightSweep } from "@/components/effects";
import { InteractiveTiltCard, MagneticButton } from "@/components/interactive";
import {
  CornerBracket,
  CardMandalaWatermark,
  SectionHeaderFiligree,
} from "@/components/ui/decorative-surfaces";

export function VenuesSection() {
  const shouldReduceMotion = useMotionReduced();
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];

  const groomCelebrations = [
    {
      name: "Haldi",
      date: "19 November 2026",
      time: "9:00 AM IST",
      href: "#haldi",
    },
    {
      name: "Mehndi",
      date: "20 November 2026",
      time: "9:00 AM IST",
      href: "#mehndi",
    },
    {
      name: "Reception",
      date: "22 November 2026",
      time: "5:00 PM IST",
      href: "#reception",
    },
  ];

  const brideCelebrations = [
    {
      name: "The Sacred Wedding",
      date: "21 November 2026",
      time: "11:00 PM IST",
      href: "#wedding",
    },
  ];

  return (
    <section
      id="venues"
      aria-labelledby="venues-title"
      className="relative pt-12 sm:pt-14 md:pt-16 pb-20 sm:pb-24 bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] border-t border-[rgba(184,151,94,0.2)] scroll-mt-14 overflow-hidden"
    >
      {/* Background Corner Filigree Linework */}
      <SectionHeaderFiligree color="#B8975E" opacity={0.2} />

      {/* Atmospheric Ambient Lighting Layers */}
      <AmbientGlow variant="champagne" position="top-right" size="lg" opacity={0.35} />
      <AmbientGlow variant="gold" position="bottom-left" size="lg" opacity={0.25} />

      <Container size="wide" className="relative z-10">
        {/* ================================================================ */}
        {/* SECTION HEADER                                                  */}
        {/* ================================================================ */}
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-5">
          {/* Eyebrow with Gold Diamonds */}
          <Reveal preset="luxury" direction="up" distance={10} threshold={0.15}>
            <div className="flex items-center justify-center gap-2 mb-1.5 sm:mb-2 select-none">
              <span className="text-[9px] text-[#B8975E] rotate-45">◆</span>
              <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.24em] text-[#B8975E]">
                Purulia &bull; West Bengal
              </span>
              <span className="text-[9px] text-[#B8975E] rotate-45">◆</span>
            </div>
          </Reveal>

          {/* Main Two-Tone Heading */}
          <Reveal preset="luxury" direction="up" distance={16} delay={0.08} threshold={0.15}>
            <h2
              id="venues-title"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight text-[#292322]"
            >
              <span>Venues &amp; </span>
              <span className="italic text-[#A67C1E] font-normal">Directions</span>
            </h2>
          </Reveal>

          {/* Supporting Subtitle */}
          <Reveal preset="luxury" direction="up" distance={12} delay={0.16} threshold={0.15}>
            <p className="font-sans text-xs sm:text-sm text-[#6B615F] mt-1.5 sm:mt-2 font-normal">
              Two family homes. Four days of celebration.
            </p>
          </Reveal>
        </div>

        {/* ================================================================ */}
        {/* DECORATIVE VENUE CONNECTION                                     */}
        {/* ================================================================ */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8 px-4 sm:px-10 lg:px-16 select-none">
          {/* Center Ornamental Animated Divider above the route */}
          <div className="flex justify-center mb-3">
            <AnimatedDivider variant="gold" size="sm" />
          </div>

          <div className="flex items-start justify-between relative">
            {/* Left Location Node (Groom's Home) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.65, delay: 0.12, ease: luxuryEase }}
              className="flex flex-col items-center text-center z-10 w-28 sm:w-36"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FAF5E6] border border-[#B8975E]/50 flex items-center justify-center shadow-2xs mb-1 transition-transform hover:scale-110">
                <svg className="w-3.5 h-3.5 text-[#A67C1E]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <span className="text-[9.5px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.16em] text-[#292322] leading-tight">
                Chitmu &bull; Kotshila
              </span>
              <span className="text-[9.5px] sm:text-[10px] font-sans text-[#8A8280] mt-0.5">
                Groom&apos;s Home
              </span>
            </motion.div>

            {/* Center Curved Dotted Line with Heart */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.75, delay: 0.2, ease: luxuryEase }}
              className="flex-1 mx-2 sm:mx-6 relative self-start pt-2.5 sm:pt-3"
            >
              <svg className="w-full h-7 overflow-visible" viewBox="0 0 240 28" preserveAspectRatio="none" fill="none">
                <path
                  d="M 0 14 C 45 4, 85 6, 105 14"
                  stroke="#C4A66B"
                  strokeWidth="1.25"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                <path
                  d="M 135 14 C 155 6, 195 4, 240 14"
                  stroke="#C4A66B"
                  strokeWidth="1.25"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute left-1/2 top-2.5 sm:top-3 -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#FFFCF6] border border-[#B8975E]/60 flex items-center justify-center shadow-2xs">
                <svg
                  className="w-3 h-3 text-[#B8975E]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
            </motion.div>

            {/* Right Location Node (Bride's Home) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.65, delay: 0.12, ease: luxuryEase }}
              className="flex flex-col items-center text-center z-10 w-28 sm:w-36"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FAF0F1] border border-[#8E1B29]/50 flex items-center justify-center shadow-2xs mb-1 transition-transform hover:scale-110">
                <svg className="w-3.5 h-3.5 text-[#8E1B29]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <span className="text-[9.5px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.16em] text-[#292322] leading-tight">
                Ghaghra &bull; Jaipur
              </span>
              <span className="text-[9.5px] sm:text-[10px] font-sans text-[#8A8280] mt-0.5">
                Bride&apos;s Home
              </span>
            </motion.div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* TWO VENUE CARDS (SIDE-BY-SIDE EQUAL HEIGHT ON DESKTOP)          */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 max-w-5xl mx-auto items-stretch">
          {/* -------------------------------------------------------------- */}
          {/* VENUE CARD 01: GROOM'S HOME                                     */}
          {/* -------------------------------------------------------------- */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -18, y: 16 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.75, ease: luxuryEase }}
            className="h-full"
          >
            <InteractiveTiltCard maxRotateDeg={1.8} className="h-full">
              <article
                aria-labelledby="groom-venue-title"
                className="relative h-full flex flex-col justify-between p-5 sm:p-6 md:p-7 rounded-2xl bg-gradient-to-b from-[#FCF9EE] to-[#FAF5E6] border border-[#B8975E]/35 shadow-[0_12px_40px_rgba(184,151,94,0.08)] hover:shadow-[0_20px_50px_rgba(184,151,94,0.18)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden group"
              >
              {/* Gold Light Sweep on Hover */}
              <GoldLightSweep trigger="hover" intensity="subtle" />

              {/* Corner Ornaments */}
              <CornerBracket position="top-left" color="#B8975E" />
              <CornerBracket position="top-right" color="#B8975E" />
              <CornerBracket position="bottom-left" color="#B8975E" />
              <CornerBracket position="bottom-right" color="#B8975E" />

              {/* Faint Radial Half-Mandala Watermark */}
              <CardMandalaWatermark strokeColor="#B8975E" />

              {/* Top Content Section */}
              <div className="relative z-10 flex flex-col">
                {/* Header Badge & PIN */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.12, ease: luxuryEase }}
                  className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#B8975E]/20 mb-2.5 sm:mb-3 select-none"
                >
                  {/* Badge */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F5EEDC] border border-[#B8975E]/30 text-[#8E6D38] text-[9px] sm:text-[9.5px] font-sans font-bold uppercase tracking-[0.16em] shadow-2xs">
                    <svg className="w-3 h-3 text-[#8E6D38]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Family Residence 01</span>
                  </span>

                  {/* PIN */}
                  <span className="font-sans text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A8280]">
                    PIN 723215
                  </span>
                </motion.div>

                {/* Main Venue Title */}
                <motion.h3
                  id="groom-venue-title"
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.18, ease: luxuryEase }}
                  className="font-serif text-2xl sm:text-3xl text-[#292322] font-normal tracking-tight mb-1.5"
                >
                  Groom&apos;s Home
                </motion.h3>

                {/* Location Kicker Divider */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.85 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.24, ease: luxuryEase }}
                  className="flex items-center gap-3 my-1 select-none origin-center"
                  aria-hidden="true"
                >
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#B8975E]/40" />
                  <span className="text-[9.5px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#A67C1E]">
                    Chitmu &bull; Kotshila
                  </span>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#B8975E]/40" />
                </motion.div>

                {/* Confirmed Address Block */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.30, ease: luxuryEase }}
                  className="flex items-start gap-2.5 my-2.5 sm:my-3"
                >
                  <svg
                    className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#A67C1E] shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <div className="flex flex-col">
                    <p className="font-serif text-sm sm:text-[15px] font-medium text-[#292322] leading-snug">
                      Chitmu, Kotshila, Purulia, West Bengal 723215
                    </p>
                    <p className="font-sans text-[11px] sm:text-xs text-[#8A8280] mt-0.5">
                      Village: Chitmu &bull; Block: Kotshila &bull; District: Purulia
                    </p>
                  </div>
                </motion.div>

                {/* Sub-divider ◇ */}
                <div className="flex items-center gap-3 my-1.5 sm:my-2 select-none" aria-hidden="true">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#B8975E]/30" />
                  <span className="text-[7.5px] text-[#B8975E]/70 rotate-45">◇</span>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#B8975E]/30" />
                </div>

                {/* Celebrations Hosted Here */}
                <div className="mt-0.5">
                  <motion.span
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.36, ease: luxuryEase }}
                    className="text-[9.5px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#A67C1E] block mb-2"
                  >
                    Celebrations at this Venue
                  </motion.span>

                  <div className="space-y-1.5 sm:space-y-2">
                    {groomCelebrations.map((c, idx) => (
                      <motion.div
                        key={c.name}
                        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.45,
                          delay: shouldReduceMotion ? 0 : 0.40 + idx * 0.07,
                          ease: luxuryEase,
                        }}
                      >
                        <Link
                          href={c.href}
                          className="group flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-white/75 hover:bg-white border border-[#B8975E]/20 hover:border-[#B8975E]/50 transition-all duration-200 shadow-2xs hover:shadow-xs hover:translate-x-1"
                        >
                          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <svg
                              className="w-3.5 h-3.5 text-[#A67C1E] shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              aria-hidden="true"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                              <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0 text-[11.5px] sm:text-xs">
                              <span className="font-sans font-bold text-[#292322]">
                                {c.name}
                              </span>
                              <span className="text-[#8A8280] hidden xs:inline">&bull;</span>
                              <span className="font-sans text-[#5C5452]">
                                {c.date}
                              </span>
                              <span className="text-[#8A8280] hidden xs:inline">&bull;</span>
                              <span className="font-sans text-[#756C6A]">
                                {c.time}
                              </span>
                            </div>
                          </div>
                          <svg
                            className="w-3.5 h-3.5 text-[#B8975E] shrink-0 transform group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button: Get Directions */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.62, ease: luxuryEase }}
                className="relative z-10 mt-5 sm:mt-6 pt-1"
              >
                <MagneticButton className="w-full">
                  <a
                    href="https://maps.app.goo.gl/Lt8BRMxAEUy371NVA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      group w-full h-[46px] sm:h-[48px] rounded-full px-5 sm:px-6
                      bg-gradient-to-r from-[#A4762E] via-[#C39343] to-[#8E6322] hover:from-[#B58234] hover:via-[#D1A04E] hover:to-[#9E6E27]
                      text-white border border-[#FFE396]/60
                      shadow-[0_8px_24px_rgba(164,118,46,0.32),inset_0_1px_0_rgba(255,255,255,0.35)]
                      hover:shadow-[0_12px_28px_rgba(164,118,46,0.45),0_0_20px_rgba(255,227,150,0.25)]
                      flex items-center justify-center gap-2 text-xs sm:text-[12.5px] font-sans font-bold uppercase tracking-[0.18em]
                      transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E] focus-visible:ring-offset-2
                    `}
                  >
                    <svg
                      className="w-3.5 h-3.5 text-white shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                    <span>Get Directions</span>
                    <span className="text-sm font-normal group-hover:translate-x-1.5 transition-transform duration-300" aria-hidden="true">
                      &rarr;
                    </span>
                  </a>
                </MagneticButton>
              </motion.div>
            </article>
          </InteractiveTiltCard>
        </motion.div>

          {/* -------------------------------------------------------------- */}
          {/* VENUE CARD 02: BRIDE'S HOME                                     */}
          {/* -------------------------------------------------------------- */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 18, y: 16 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.75, delay: shouldReduceMotion ? 0 : 0.14, ease: luxuryEase }}
            className="h-full"
          >
            <InteractiveTiltCard maxRotateDeg={1.8} className="h-full">
              <article
                aria-labelledby="bride-venue-title"
                className="relative h-full flex flex-col justify-between p-5 sm:p-6 md:p-7 rounded-2xl bg-gradient-to-b from-[#FDF5F5] to-[#FAF0F1] border border-[#8E1B29]/30 shadow-[0_12px_40px_rgba(142,27,41,0.06)] hover:shadow-[0_20px_50px_rgba(142,27,41,0.16)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden group"
              >
              {/* Gold Light Sweep on Hover */}
              <GoldLightSweep trigger="hover" intensity="subtle" />

              {/* Corner Ornaments */}
              <CornerBracket position="top-left" color="#8E1B29" />
              <CornerBracket position="top-right" color="#8E1B29" />
              <CornerBracket position="bottom-left" color="#8E1B29" />
              <CornerBracket position="bottom-right" color="#8E1B29" />

              {/* Faint Radial Half-Mandala Watermark in Soft Rose/Maroon */}
              <CardMandalaWatermark strokeColor="#8E1B29" />

              {/* Top Content Section */}
              <div className="relative z-10 flex flex-col">
                {/* Header Badge & PIN */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.26, ease: luxuryEase }}
                  className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#8E1B29]/20 mb-2.5 sm:mb-3 select-none"
                >
                  {/* Badge */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F9E6E8] border border-[#8E1B29]/25 text-[#8E1B29] text-[9px] sm:text-[9.5px] font-sans font-bold uppercase tracking-[0.16em] shadow-2xs">
                    <svg className="w-3 h-3 text-[#8E1B29]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Family Residence 02</span>
                  </span>

                  {/* PIN */}
                  <span className="font-sans text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A8280]">
                    PIN 723201
                  </span>
                </motion.div>

                {/* Main Venue Title */}
                <motion.h3
                  id="bride-venue-title"
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.32, ease: luxuryEase }}
                  className="font-serif text-2xl sm:text-3xl text-[#8E1B29] font-normal tracking-tight mb-1.5"
                >
                  Bride&apos;s Home
                </motion.h3>

                {/* Location Kicker Divider */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.85 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.38, ease: luxuryEase }}
                  className="flex items-center gap-3 my-1 select-none origin-center"
                  aria-hidden="true"
                >
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#8E1B29]/35" />
                  <span className="text-[9.5px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#8E1B29]">
                    Ghaghra &bull; Jaipur
                  </span>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#8E1B29]/35" />
                </motion.div>

                {/* Confirmed Address Block */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.44, ease: luxuryEase }}
                  className="flex items-start gap-2.5 my-2.5 sm:my-3"
                >
                  <svg
                    className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8E1B29] shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <div className="flex flex-col">
                    <p className="font-serif text-sm sm:text-[15px] font-medium text-[#292322] leading-snug">
                      Ghaghra, Jaipur, Purulia, West Bengal 723201
                    </p>
                    <p className="font-sans text-[11px] sm:text-xs text-[#8A8280] mt-0.5">
                      Village: Ghaghra &bull; Block: Jaipur &bull; District: Purulia
                    </p>
                  </div>
                </motion.div>

                {/* Sub-divider ◇ */}
                <div className="flex items-center gap-3 my-1.5 sm:my-2 select-none" aria-hidden="true">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#8E1B29]/30" />
                  <span className="text-[7.5px] text-[#8E1B29]/70 rotate-45">◇</span>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#8E1B29]/30" />
                </div>

                {/* Celebrations Hosted Here */}
                <div className="mt-0.5">
                  <motion.span
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: 0.50, ease: luxuryEase }}
                    className="text-[9.5px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#8E1B29] block mb-2"
                  >
                    Celebrations at this Venue
                  </motion.span>

                  <div className="space-y-1.5 sm:space-y-2">
                    {brideCelebrations.map((c, idx) => (
                      <motion.div
                        key={c.name}
                        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.45,
                          delay: shouldReduceMotion ? 0 : 0.54 + idx * 0.07,
                          ease: luxuryEase,
                        }}
                      >
                        <Link
                          href={c.href}
                          className="group flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-white/75 hover:bg-white border border-[#8E1B29]/20 hover:border-[#8E1B29]/50 transition-all duration-200 shadow-2xs hover:shadow-xs hover:translate-x-1"
                        >
                          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <svg
                              className="w-3.5 h-3.5 text-[#8E1B29] shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              aria-hidden="true"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                              <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0 text-[11.5px] sm:text-xs">
                              <span className="font-sans font-bold text-[#292322]">
                                {c.name}
                              </span>
                              <span className="text-[#8A8280] hidden xs:inline">&bull;</span>
                              <span className="font-sans text-[#5C5452]">
                                {c.date}
                              </span>
                              <span className="text-[#8A8280] hidden xs:inline">&bull;</span>
                              <span className="font-sans text-[#756C6A]">
                                {c.time}
                              </span>
                            </div>
                          </div>
                          <svg
                            className="w-3.5 h-3.5 text-[#8E1B29] shrink-0 transform group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button: Get Directions */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.70, ease: luxuryEase }}
                className="relative z-10 mt-5 sm:mt-6 pt-1"
              >
                <MagneticButton className="w-full">
                  <a
                    href="https://maps.app.goo.gl/35p3D6uQx25PjH5t9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      group w-full h-[46px] sm:h-[48px] rounded-full px-5 sm:px-6
                      bg-gradient-to-r from-[#7D1525] via-[#8E1B29] to-[#6A1220] hover:from-[#8E1B29] hover:via-[#9E2030] hover:to-[#7D1525]
                      text-white border border-[#E8929E]/40
                      shadow-[0_8px_24px_rgba(142,27,41,0.32),inset_0_1px_0_rgba(255,255,255,0.35)]
                      hover:shadow-[0_12px_28px_rgba(142,27,41,0.45),0_0_20px_rgba(232,146,158,0.25)]
                      flex items-center justify-center gap-2 text-xs sm:text-[12.5px] font-sans font-bold uppercase tracking-[0.18em]
                      transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E1B29] focus-visible:ring-offset-2
                    `}
                  >
                    <svg
                      className="w-3.5 h-3.5 text-white shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                    <span>Get Directions</span>
                    <span className="text-sm font-normal group-hover:translate-x-1.5 transition-transform duration-300" aria-hidden="true">
                      &rarr;
                    </span>
                  </a>
                </MagneticButton>
              </motion.div>
            </article>
          </InteractiveTiltCard>
        </motion.div>
        </div>
      </Container>
    </section>
  );
}
