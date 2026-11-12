"use client";

import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion";
import {
  CornerBracket,
  CardCornerWatermark,
  SectionHeaderFiligree,
  SectionSideMandala,
} from "@/components/ui/decorative-surfaces";

export function FamilySection() {
  return (
    <section
      id="family"
      aria-labelledby="family-title"
      className="relative pt-12 sm:pt-14 md:pt-16 pb-20 sm:pb-24 bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] border-t border-[rgba(184,151,94,0.2)] scroll-mt-14 overflow-hidden"
    >
      {/* Background Section Filigree Linework & Side Mandalas */}
      <SectionHeaderFiligree color="#B8975E" opacity={0.16} />
      <SectionSideMandala side="left" color="#B8975E" opacity={0.14} />
      <SectionSideMandala side="right" color="#B8975E" opacity={0.14} />

      <Container size="wide" className="relative z-10">
        {/* ================================================================ */}
        {/* SECTION HEADER                                                  */}
        {/* ================================================================ */}
        <Reveal className="text-center max-w-2xl mx-auto mb-5 sm:mb-6">
          {/* Eyebrow with Gold Diamonds */}
          <div className="flex items-center justify-center gap-2 mb-1.5 sm:mb-2 select-none">
            <span className="text-[9px] text-[#B8975E] rotate-45 font-bold">◆</span>
            <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.24em] text-[#B8975E]">
              With Reverence &amp; Gratitude
            </span>
            <span className="text-[9px] text-[#B8975E] rotate-45 font-bold">◆</span>
          </div>

          {/* Main Two-Tone Heading */}
          <h2
            id="family-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight text-[#292322]"
          >
            <span>The Couple &amp; Their </span>
            <span className="italic text-[#A67C1E] font-normal">Beloved Parents</span>
          </h2>

          {/* Supporting Subtitle */}
          <p className="font-sans text-xs sm:text-sm text-[#6B615F] mt-1.5 sm:mt-2 font-normal">
            Rooted in tradition, blessed by generations.
          </p>

          {/* Center Ornamental Symmetrical Divider */}
          <div className="flex items-center justify-center gap-2 mt-3 select-none" aria-hidden="true">
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-[#B8975E]/60" />
            <span className="text-[6.5px] text-[#B8975E] rotate-45 font-bold">◇</span>
            <span className="text-[9px] text-[#B8975E] rotate-45 font-bold">◆</span>
            <span className="text-[6.5px] text-[#B8975E] rotate-45 font-bold">◇</span>
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-[#B8975E]/60" />
          </div>
        </Reveal>

        {/* ================================================================ */}
        {/* CENTRAL COUPLE PLAQUE                                           */}
        {/* ================================================================ */}
        <Reveal className="max-w-2xl sm:max-w-3xl mx-auto mb-7 sm:mb-9">
          <div className="relative p-5 sm:p-7 rounded-2xl bg-gradient-to-b from-[#FCF9EE] to-[#FAF5E6] border border-[#B8975E]/35 shadow-[0_12px_36px_rgba(184,151,94,0.08)] hover:shadow-[0_16px_48px_rgba(184,151,94,0.14)] hover:-translate-y-0.5 transition-all duration-300 text-center overflow-hidden">
            {/* Corner Brackets */}
            <CornerBracket position="top-left" color="#B8975E" />
            <CornerBracket position="top-right" color="#B8975E" />
            <CornerBracket position="bottom-left" color="#B8975E" />
            <CornerBracket position="bottom-right" color="#B8975E" />

            {/* Left and Right Watermark Accents */}
            <CardCornerWatermark position="top-left" color="#B8975E" opacity={0.16} />
            <CardCornerWatermark position="top-right" color="#B8975E" opacity={0.16} />

            <div className="relative z-10">
              {/* Emblem Monogram: M · S in Oval Pill */}
              <div className="inline-flex items-center justify-center px-4 py-1 rounded-full border border-[#B8975E]/50 bg-[#FAF5E6]/90 shadow-2xs mb-2">
                <span className="font-serif text-base sm:text-lg tracking-wider text-[#A67C1E] font-medium">
                  M &bull; S
                </span>
              </div>

              {/* Couple Main Heading */}
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#292322] font-normal tracking-tight mb-1.5">
                Mithun &amp; Sakhi
              </h3>

              {/* Sub-bar */}
              <div className="flex items-center justify-center gap-2.5 my-1 select-none" aria-hidden="true">
                <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#B8975E]/40" />
                <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#8E6D38]">
                  United in Love &bull; Blessed by Family
                </span>
                <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#B8975E]/40" />
              </div>

              {/* Center Tiny Diamond Flourish */}
              <div className="flex items-center justify-center gap-1.5 my-1 select-none" aria-hidden="true">
                <span className="text-[6px] text-[#B8975E]/70 rotate-45">◇</span>
                <span className="text-[7.5px] text-[#B8975E] rotate-45 font-bold">◆</span>
                <span className="text-[6px] text-[#B8975E]/70 rotate-45">◇</span>
              </div>

              {/* Location & Date */}
              <p className="text-[9.5px] sm:text-[10.5px] font-sans font-bold uppercase tracking-[0.2em] text-[#A52232] mt-1">
                Purulia, West Bengal &bull; November 2026
              </p>
            </div>
          </div>
        </Reveal>

        {/* ================================================================ */}
        {/* TWO LARGE FAMILY CARDS (SIDE-BY-SIDE EQUAL HEIGHT ON DESKTOP)   */}
        {/* ================================================================ */}
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Center Diamond Flourish between cards on Desktop */}
          <div
            className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 select-none pointer-events-none z-20"
            aria-hidden="true"
          >
            <span className="text-[7px] text-[#B8975E]/80 rotate-45 font-bold">◇</span>
            <div className="w-[1px] h-20 bg-gradient-to-b from-[#B8975E]/40 via-[#B8975E]/70 to-[#B8975E]/40" />
            <span className="text-[9px] text-[#B8975E] rotate-45 font-bold">◆</span>
            <div className="w-[1px] h-20 bg-gradient-to-b from-[#B8975E]/40 via-[#B8975E]/70 to-[#B8975E]/40" />
            <span className="text-[7px] text-[#B8975E]/80 rotate-45 font-bold">◇</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 items-stretch">
          {/* -------------------------------------------------------------- */}
          {/* CARD 01: GROOM'S FAMILY                                        */}
          {/* -------------------------------------------------------------- */}
          <Reveal className="h-full">
            <article
              aria-labelledby="groom-family-title"
              className="relative h-full flex flex-col justify-between p-5 sm:p-6 md:p-7 rounded-2xl bg-gradient-to-b from-[#FCF9EE] to-[#FAF5E6] border border-[#B8975E]/35 shadow-[0_12px_40px_rgba(184,151,94,0.08)] hover:shadow-[0_16px_48px_rgba(184,151,94,0.14)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              {/* Corner Ornaments */}
              <CornerBracket position="top-left" color="#B8975E" />
              <CornerBracket position="top-right" color="#B8975E" />
              <CornerBracket position="bottom-left" color="#B8975E" />
              <CornerBracket position="bottom-right" color="#B8975E" />

              {/* Watermark in top-right */}
              <CardCornerWatermark position="top-right" color="#B8975E" opacity={0.18} />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  {/* Top Label */}
                  <div className="flex items-center justify-center gap-2 pb-2.5 sm:pb-3 border-b border-[#B8975E]/20 mb-4 sm:mb-5 select-none">
                    <span className="text-[8px] text-[#B8975E] rotate-45 font-bold">◆</span>
                    <span className="text-[9.5px] sm:text-[10.5px] font-sans font-bold uppercase tracking-[0.22em] text-[#A67C1E]">
                      Groom&apos;s Family
                    </span>
                    <span className="text-[8px] text-[#B8975E] rotate-45 font-bold">◆</span>
                  </div>

                  {/* Split Content: Portrait (Left) + Information (Right) */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-start">
                    {/* Portrait Arched Frame */}
                    <div className="relative w-40 sm:w-44 md:w-48 aspect-[3/4] shrink-0 rounded-t-[72px] sm:rounded-t-[80px] rounded-b-xl overflow-hidden border-2 border-[#B8975E]/45 shadow-sm bg-[#FAF5E6]">
                      <Image
                        src="/images/groom-portrait-card.webp"
                        alt="Illustrative Portrait: Mithun Gorain (Groom)"
                        fill
                        sizes="(max-width: 640px) 160px, (max-width: 1024px) 176px, 192px"
                        className="object-cover object-top hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute bottom-2 inset-x-2 text-center text-[8px] sm:text-[8.5px] font-sans font-bold uppercase tracking-[0.16em] py-0.5 rounded-full bg-[#1F1A19]/85 text-[#FFFDF9] backdrop-blur-xs border border-[#B8975E]/40 shadow-xs select-none">
                        Illustrative Portrait
                      </span>
                    </div>

                    {/* Information Side */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 text-left w-full sm:w-auto">
                      <div>
                        {/* Small Eyebrow */}
                        <span className="text-[9px] sm:text-[9.5px] font-sans font-bold uppercase tracking-[0.22em] text-[#A67C1E] block">
                          The Groom
                        </span>

                        {/* Name */}
                        <h4
                          id="groom-family-title"
                          className="font-serif text-2xl sm:text-3xl text-[#292322] font-normal tracking-tight mt-0.5 mb-1"
                        >
                          Mithun Gorain
                        </h4>

                        {/* Divider */}
                        <div className="flex items-center gap-2 my-1.5 select-none" aria-hidden="true">
                          <div className="h-[1px] w-6 bg-[#B8975E]/40" />
                          <span className="text-[6.5px] text-[#B8975E] rotate-45">◇</span>
                        </div>

                        {/* Parents Header Block */}
                        <div className="mt-3">
                          <span className="text-[9px] sm:text-[9.5px] font-sans font-bold uppercase tracking-[0.2em] text-[#8E6D38] block mb-1">
                            Beloved Parents
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
                      <div className="mt-4 pt-3 border-t border-[#B8975E]/20">
                        <div className="flex items-start gap-1.5 text-xs text-[#6B615F]">
                          <svg className="w-3.5 h-3.5 text-[#A67C1E] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          <div>
                            <span className="font-sans font-semibold text-[#292322] block text-[11.5px] sm:text-xs">
                              Chitmu &bull; Kotshila &bull; Purulia
                            </span>
                            <span className="text-[10.5px] text-[#8A8280]">
                              Family Residence &bull; PIN 723215
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Blessing Quotation */}
                <div className="mt-5 pt-3 border-t border-[#B8975E]/20 text-center select-none">
                  <p className="font-serif italic text-xs sm:text-[13px] text-[#6B615F]">
                    &ldquo;With ancestral blessings and the love of our kin, we celebrate this sacred union.&rdquo;
                  </p>
                </div>
              </div>
            </article>
          </Reveal>

          {/* -------------------------------------------------------------- */}
          {/* CARD 02: BRIDE'S FAMILY                                        */}
          {/* -------------------------------------------------------------- */}
          <Reveal className="h-full">
            <article
              aria-labelledby="bride-family-title"
              className="relative h-full flex flex-col justify-between p-5 sm:p-6 md:p-7 rounded-2xl bg-gradient-to-b from-[#FDF5F5] to-[#FAF0F1] border border-[#8E1B29]/30 shadow-[0_12px_40px_rgba(142,27,41,0.06)] hover:shadow-[0_16px_48px_rgba(142,27,41,0.12)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              {/* Corner Ornaments */}
              <CornerBracket position="top-left" color="#8E1B29" />
              <CornerBracket position="top-right" color="#8E1B29" />
              <CornerBracket position="bottom-left" color="#8E1B29" />
              <CornerBracket position="bottom-right" color="#8E1B29" />

              {/* Watermark in top-right */}
              <CardCornerWatermark position="top-right" color="#8E1B29" opacity={0.16} />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  {/* Top Label */}
                  <div className="flex items-center justify-center gap-2 pb-2.5 sm:pb-3 border-b border-[#8E1B29]/20 mb-4 sm:mb-5 select-none">
                    <span className="text-[8px] text-[#8E1B29] rotate-45 font-bold">◆</span>
                    <span className="text-[9.5px] sm:text-[10.5px] font-sans font-bold uppercase tracking-[0.22em] text-[#8E1B29]">
                      Bride&apos;s Family
                    </span>
                    <span className="text-[8px] text-[#8E1B29] rotate-45 font-bold">◆</span>
                  </div>

                  {/* Split Content: Portrait (Left) + Information (Right) */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-start">
                    {/* Portrait Arched Frame */}
                    <div className="relative w-40 sm:w-44 md:w-48 aspect-[3/4] shrink-0 rounded-t-[72px] sm:rounded-t-[80px] rounded-b-xl overflow-hidden border-2 border-[#8E1B29]/40 shadow-sm bg-[#FAF0F1]">
                      <Image
                        src="/images/bride-portrait-card.webp"
                        alt="Illustrative Portrait: Sakhi Gorain (Bride)"
                        fill
                        sizes="(max-width: 640px) 160px, (max-width: 1024px) 176px, 192px"
                        className="object-cover object-top hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute bottom-2 inset-x-2 text-center text-[8px] sm:text-[8.5px] font-sans font-bold uppercase tracking-[0.16em] py-0.5 rounded-full bg-[#1F1A19]/85 text-[#FFFDF9] backdrop-blur-xs border border-[#8E1B29]/40 shadow-xs select-none">
                        Illustrative Portrait
                      </span>
                    </div>

                    {/* Information Side */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 text-left w-full sm:w-auto">
                      <div>
                        {/* Small Eyebrow */}
                        <span className="text-[9px] sm:text-[9.5px] font-sans font-bold uppercase tracking-[0.22em] text-[#8E1B29] block">
                          The Bride
                        </span>

                        {/* Name */}
                        <h4
                          id="bride-family-title"
                          className="font-serif text-2xl sm:text-3xl text-[#8E1B29] font-normal tracking-tight mt-0.5 mb-1"
                        >
                          Sakhi Gorain
                        </h4>

                        {/* Divider */}
                        <div className="flex items-center gap-2 my-1.5 select-none" aria-hidden="true">
                          <div className="h-[1px] w-6 bg-[#8E1B29]/35" />
                          <span className="text-[6.5px] text-[#8E1B29] rotate-45">◇</span>
                        </div>

                        {/* Parents Header Block */}
                        <div className="mt-3">
                          <span className="text-[9px] sm:text-[9.5px] font-sans font-bold uppercase tracking-[0.2em] text-[#8E1B29] block mb-1">
                            Beloved Parents
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
                      <div className="mt-4 pt-3 border-t border-[#8E1B29]/20">
                        <div className="flex items-start gap-1.5 text-xs text-[#6B615F]">
                          <svg className="w-3.5 h-3.5 text-[#8E1B29] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          <div>
                            <span className="font-sans font-semibold text-[#292322] block text-[11.5px] sm:text-xs">
                              Ghaghra &bull; Jaipur &bull; Purulia
                            </span>
                            <span className="text-[10.5px] text-[#8A8280]">
                              Family Residence &bull; PIN 723201
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Blessing Quotation */}
                <div className="mt-5 pt-3 border-t border-[#8E1B29]/20 text-center select-none">
                  <p className="font-serif italic text-xs sm:text-[13px] text-[#6B615F]">
                    &ldquo;May every step forward together bring timeless peace, joy, and prosperity.&rdquo;
                  </p>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
        </div>
      </Container>
    </section>
  );
}
