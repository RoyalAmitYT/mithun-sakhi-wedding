"use client";

import React from "react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { AnimatedDivider } from "@/components/motion/animated-divider";
import { useMotionReduced, MOTION_EASINGS } from "@/lib/motion";
import { AmbientGlow, GoldLightSweep } from "@/components/effects";
import { InteractiveTiltCard, MagneticButton } from "@/components/interactive";
import { WEDDING_DATA } from "@/data/wedding-data";
import {
  SectionHeaderFiligree,
  CardCornerBrackets,
  CardMandalaWatermark,
} from "@/components/ui/decorative-surfaces";

export function ContactSection() {
  const { contact } = WEDDING_DATA;
  const shouldReduceMotion = useMotionReduced();
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];

  return (
    <section
      id="hospitality"
      aria-labelledby="contact-title"
      className="py-20 sm:py-28 md:py-32 bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] border-t border-[rgba(184,151,94,0.2)] scroll-mt-20 relative overflow-hidden"
    >
      {/* Background Section Filigree Linework */}
      <SectionHeaderFiligree color="#B8975E" opacity={0.2} />

      {/* Atmospheric Ambient Lighting Layers */}
      <AmbientGlow variant="champagne" position="top-center" size="lg" opacity={0.35} />
      <AmbientGlow variant="gold" position="bottom-center" size="lg" opacity={0.25} />

      {/* Anchor for legacy #contact links */}
      <div id="contact" className="absolute -top-20 left-0 pointer-events-none" aria-hidden="true" />

      <Container size="reading" className="relative z-10 px-4 sm:px-6">
        {/* ==================================================================== */}
        {/* 1. SECTION HEADER LOCKUP WITH CHOREOGRAPHED REVEAL                   */}
        {/* ==================================================================== */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          {/* Eyebrow */}
          <Reveal preset="luxury" direction="up" distance={10} threshold={0.15}>
            <div className="flex items-center justify-center gap-2 mb-2.5 select-none">
              <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
              <span className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A67C1E] uppercase">
                DIRECT COORDINATION
              </span>
              <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
            </div>
          </Reveal>

          {/* Main Title: Two-Tone Cormorant Garamond */}
          <Reveal preset="luxury" direction="up" distance={16} delay={0.08} threshold={0.15}>
            <h2
              id="contact-title"
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal tracking-tight text-[#292322] leading-tight"
            >
              <span>Contact &amp; </span>
              <span className="text-[#A67C1E] font-normal">Assistance</span>
            </h2>
          </Reveal>

          {/* Supporting Subtitle */}
          <Reveal preset="luxury" direction="up" distance={12} delay={0.16} threshold={0.15}>
            <p className="font-serif italic text-sm sm:text-base md:text-[17px] text-[#5C5452] max-w-xl mx-auto mt-3 leading-relaxed">
              Have questions regarding directions, guest accommodations, or ceremony rituals? Connect directly with our family coordination desk.
            </p>
          </Reveal>

          {/* Symmetrical Central Animated Gold Divider */}
          <div className="flex justify-center mt-4">
            <AnimatedDivider variant="gold" size="sm" />
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 2. REFINED HOSPITALITY & COORDINATION DESK CARD                      */}
        {/* ==================================================================== */}
        <Reveal preset="luxury" direction="up" distance={18} delay={0.22} threshold={0.15}>
          <InteractiveTiltCard maxRotateDeg={1.5} className="w-full">
            <motion.article
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              transition={{ duration: 0.3, ease: luxuryEase }}
              className="group relative p-7 sm:p-10 md:p-12 rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC]/90 to-[#F6EFE3]/80 border border-[#B8975E]/35 shadow-[0_16px_48px_rgba(184,151,94,0.1)] text-center overflow-hidden transition-shadow duration-300 hover:shadow-[0_24px_64px_rgba(184,151,94,0.18)] hover:border-[#B8975E]/60"
            >
              {/* Subtle Gold Light Sweep on Hover */}
              <GoldLightSweep trigger="hover" intensity="subtle" />

              {/* Architectural Corner Brackets */}
              <CardCornerBrackets color="#B8975E" />

              {/* Subtle Radial Mandala Watermarks */}
              <CardMandalaWatermark strokeColor="#B8975E" opacity={0.18} position="right" />
              <CardMandalaWatermark strokeColor="#B8975E" opacity={0.12} position="left" />

              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5EEDC] border border-[#B8975E]/30 text-[#8E6D38] text-[9.5px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em] shadow-2xs mb-3.5">
                  <svg
                    className="w-3.5 h-3.5 text-[#8E6D38]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>Family Coordination Desk</span>
                </div>

                {/* Phone Display */}
                <p className="font-serif text-3xl sm:text-4xl md:text-[42px] font-medium text-[#292322] tracking-tight">
                  {contact.formattedPhone}
                </p>

                <p className="font-serif italic text-xs sm:text-sm text-[#5C5452] mt-2">
                  Purulia District &bull; West Bengal &bull; Primary Phone &amp; WhatsApp
                </p>

                {/* Decorative Divider */}
                <div className="flex items-center justify-center gap-3 my-6 sm:my-7 select-none" aria-hidden="true">
                  <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-r from-transparent to-[#B8975E]/40" />
                  <span className="text-[8px] text-[#B8975E] rotate-45 font-bold">◇</span>
                  <span className="text-[10px] text-[#A52232] font-bold">◆</span>
                  <span className="text-[8px] text-[#B8975E] rotate-45 font-bold">◇</span>
                  <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-l from-transparent to-[#B8975E]/40" />
                </div>

                {/* Action Buttons: Phone & WhatsApp with Stage 3.2 Magnetic Interactions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
                  {/* Direct Call Link */}
                  <MagneticButton className="w-full sm:w-1/2">
                    <motion.a
                      href={contact.telHref}
                      whileHover={shouldReduceMotion ? undefined : { scale: 1.025, y: -1 }}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                      aria-label={`Call wedding coordination desk at ${contact.formattedPhone}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-full bg-gradient-to-r from-[#7B1D28] via-[#8C1E2B] to-[#68141F] border border-[#B8975E]/40 text-white font-sans font-semibold text-xs sm:text-[13px] tracking-[0.12em] uppercase shadow-md shadow-[#7B1D28]/20 hover:shadow-lg hover:shadow-[#7B1D28]/30 transition-shadow cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E] focus-visible:ring-offset-2"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>Call Coordination</span>
                    </motion.a>
                  </MagneticButton>

                  {/* Direct WhatsApp Link */}
                  <MagneticButton className="w-full sm:w-1/2">
                    <motion.a
                      href={contact.whatsAppHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={shouldReduceMotion ? undefined : { scale: 1.025, y: -1 }}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                      aria-label="Send a message on WhatsApp to wedding coordination desk"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-full bg-[#F4F9F5] text-[#1B4332] border border-[#2D6A4F]/40 hover:bg-[#1B4332] hover:text-white font-sans font-semibold text-xs sm:text-[13px] tracking-[0.12em] uppercase shadow-xs hover:shadow-md transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      <span>WhatsApp Message</span>
                    </motion.a>
                  </MagneticButton>
                </div>
              </div>
            </motion.article>
          </InteractiveTiltCard>
        </Reveal>
      </Container>
    </section>
  );
}
