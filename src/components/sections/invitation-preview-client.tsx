"use client";

import React from "react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { AnimatedDivider } from "@/components/motion/animated-divider";
import { useMotionReduced, MOTION_EASINGS } from "@/lib/motion";
import { AmbientGlow } from "@/components/effects";
import {
  OfficialWeddingInvitation,
  InvitationActionButtons,
} from "@/components/invitation";
import {
  SectionHeaderFiligree,
  SectionSideMandala,
} from "@/components/ui/decorative-surfaces";

export interface InvitationPreviewSettings {
  id?: string;
  headline_text?: string;
  intro_text?: string;
  qr_code_target_url?: string;
  default_template?: string;
  custom_announcement?: string | null;
  is_published?: boolean;
}

export interface InvitationPreviewClientProps {
  settings?: InvitationPreviewSettings;
}

export function InvitationPreviewClient({ settings }: InvitationPreviewClientProps = {}) {
  const shouldReduceMotion = useMotionReduced();
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];

  const canonicalUrl =
    settings?.qr_code_target_url || "https://mithun-sakhi-wedding.vercel.app/#invitation";
  const headlineText =
    settings?.headline_text || "WITH THE DIVINE BLESSINGS OF OUR FAMILIES";
  const introText =
    settings?.intro_text ||
    "With joyful hearts, we invite you to celebrate our sacred union\nand bless the beautiful beginning of our life together.";

  return (
    <section
      id="invitation"
      aria-labelledby="invitation-title"
      className="relative py-14 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] border-t border-[rgba(184,151,94,0.2)] scroll-mt-24 overflow-hidden"
    >
      {/* Background Architectural Corner Filigree & Side Mandalas */}
      <SectionHeaderFiligree color="#B8975E" opacity={0.18} />
      <SectionSideMandala side="left" color="#B8975E" opacity={0.12} />
      <SectionSideMandala side="right" color="#B8975E" opacity={0.12} />

      {/* Atmospheric Ambient Lighting Layers */}
      <AmbientGlow variant="champagne" position="top-center" size="lg" opacity={0.4} />
      <AmbientGlow variant="gold" position="bottom-center" size="lg" opacity={0.3} />

      <Container size="reading" className="relative z-10">
        {/* ================================================================ */}
        {/* SECTION HEADING LOCKUP                                          */}
        {/* ================================================================ */}
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-10 lg:mb-14">
          {/* Eyebrow with Gold Diamond Accents */}
          <Reveal preset="luxury" direction="up" distance={10} threshold={0.15}>
            <div className="flex items-center justify-center gap-2 mb-2 select-none">
              <span className="text-[9px] text-[#B8975E] rotate-45">◆</span>
              <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.24em] text-[#B8975E]">
                Wedding Invitation
              </span>
              <span className="text-[9px] text-[#B8975E] rotate-45">◆</span>
            </div>
          </Reveal>

          {/* Main Two-Tone Heading */}
          <Reveal preset="luxury" direction="up" distance={16} delay={0.08} threshold={0.15}>
            <h2
              id="invitation-title"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight leading-[1.15] text-[#292322]"
            >
              <span>The Wedding </span>
              <span className="italic text-[#A67C1E] font-medium">Invitation</span>
            </h2>
          </Reveal>

          {/* Supporting Subtitle */}
          <Reveal preset="luxury" direction="up" distance={12} delay={0.16} threshold={0.15}>
            <p className="font-sans text-sm sm:text-base text-[#5C5452] mt-3 max-w-xl mx-auto leading-relaxed">
              Official ceremonial decree for the sacred wedding celebration of Mithun &amp; Sakhi.
            </p>
          </Reveal>

          {/* Central Ornamental Animated Divider */}
          <div className="flex justify-center mt-3 sm:mt-4">
            <AnimatedDivider variant="gold" size="sm" />
          </div>
        </div>

        {/* ================================================================ */}
        {/* CANONICAL OFFICIAL INVITATION CARD PRESENTATION STAGE            */}
        {/* (Outer presentation wrapper with soft ambient depth & reveal)   */}
        {/* ================================================================ */}
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 22, scale: 0.985 }
          }
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.85,
            delay: 0.14,
            ease: luxuryEase,
          }}
          className="relative max-w-xl sm:max-w-2xl lg:max-w-[730px] mx-auto group transition-transform duration-500 will-change-transform"
        >
          {/* Ambient Soft Under-Glow / Presentation Halo */}
          <AmbientGlow
            variant="gold"
            position="center"
            size="md"
            opacity={0.32}
            pulse={true}
            className="-z-10"
          />
          <div
            className="absolute -inset-2 sm:-inset-3 rounded-[28px] sm:rounded-[36px] bg-gradient-to-b from-[#D4AF37]/15 via-[#B8975E]/8 to-transparent blur-xl pointer-events-none -z-10 opacity-70 group-hover:opacity-95 transition-opacity duration-700"
            aria-hidden="true"
          />

          {/* Canonical Official Invitation Card (100% Vector & Code-Generated, Art & Proportions Intact) */}
          <OfficialWeddingInvitation
            variant="preview"
            canonicalUrl={canonicalUrl}
            headlineText={headlineText}
            introText={introText}
          />
        </motion.div>

        {/* ================================================================ */}
        {/* ACTION CONTROLS & OFFICIAL NOTICE                                */}
        {/* ================================================================ */}
        <Reveal preset="luxury" direction="up" distance={14} delay={0.28} threshold={0.15}>
          <div className="mt-6 sm:mt-8 lg:mt-10 text-center space-y-3.5 sm:space-y-4">
            <InvitationActionButtons variant="preview" />

            <p className="font-serif italic text-[12.5px] sm:text-xs text-[#8A8280] max-w-lg mx-auto leading-relaxed pt-1">
              Official digital wedding invitation card for Mithun &amp; Sakhi &bull; 19–22 November 2026 &bull; Purulia, West Bengal
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
