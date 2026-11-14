"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { OrnamentalDivider } from "@/components/ui/ornamental-divider";
import { WEDDING_DATA } from "@/data/wedding-data";
import { SectionHeaderFiligree } from "@/components/ui/decorative-surfaces";
import { useMotionReduced, MOTION_EASINGS } from "@/lib/motion";

export function EditorialFooter() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { couple, contact } = WEDDING_DATA;
  const shouldReduceMotion = useMotionReduced();
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];

  return (
    <footer
      role="contentinfo"
      className="relative -mt-px pt-12 sm:pt-16 lg:pt-20 pb-28 xs:pb-32 sm:pb-32 lg:pb-20 bg-gradient-to-b from-[#FAF5EB] via-[#FAF5EB] to-[#F5EEDC] border-t border-[rgba(184,151,94,0.2)] text-center text-xs text-[#5C5452] overflow-hidden"
    >
      <SectionHeaderFiligree color="#B8975E" opacity={0.14} />
      <Container size="editorial" className="relative z-10">
        {/* Monogram Seal & Names */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "-40px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: luxuryEase }}
          className="flex flex-col items-center"
        >
          <Link
            href={isHome ? "#top" : "/"}
            className="group inline-flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E] rounded-[2px] p-2"
            aria-label="Back to home page"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-[3px] border border-[rgba(184,151,94,0.4)] bg-white group-hover:border-[#B8975E] group-hover:bg-[#F7F1E6] transition-colors mb-3 shadow-xs">
              <span className="font-serif text-base font-semibold text-[#B8975E]">
                M&bull;S
              </span>
            </span>

            <span className="font-serif text-3xl sm:text-4xl lg:text-4xl font-medium text-[#292322] tracking-tight group-hover:text-[#B8975E] transition-colors">
              {couple.displayTitle}
            </span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#150409] text-[#FFE8A3] border border-[#D4AF37]/35 text-[10px] xs:text-[10.5px] sm:text-xs font-sans font-semibold uppercase tracking-[0.18em] sm:tracking-[0.22em] mt-2 mb-1 shadow-xs select-none">
            <span>{couple.weddingDatesDisplay}</span>
            <span className="text-[#D4AF37] font-normal" aria-hidden="true">&bull;</span>
            <span>{couple.locationDisplay}</span>
          </div>

          <p className="font-serif italic text-sm text-[#5C5452] mt-2 max-w-md leading-relaxed px-2">
            &ldquo;United in sacred Vedic matrimony with the divine blessings of our beloved families.&rdquo;
          </p>

          <OrnamentalDivider variant="gold" size="sm" className="my-4 sm:my-6" />

          {/* Mobile & Tablet Editorial Navigation Groups (< 1024px) */}
          <nav
            aria-label="Footer Mobile Navigation"
            className="w-full max-w-2xl mx-auto my-3 sm:my-4 block lg:hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center sm:text-left">
              {/* Group 1: The Sacred Journey */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-white/60 border border-[rgba(184,151,94,0.2)] shadow-2xs">
                <span className="text-[10.5px] font-sans font-bold uppercase tracking-[0.2em] text-[#A52232] flex items-center justify-center sm:justify-start gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37]" aria-hidden="true" />
                  The Journey
                </span>
                <div className="flex flex-col gap-0.5">
                  <Link
                    href={isHome ? "#top" : "/"}
                    className="min-h-[44px] flex items-center justify-center sm:justify-start px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#292322] hover:text-[#B8975E] active:scale-[0.98] transition-colors rounded-sm"
                  >
                    Home
                  </Link>
                  <Link
                    href={isHome ? "#our-story" : "/#our-story"}
                    className="min-h-[44px] flex items-center justify-center sm:justify-start px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#292322] hover:text-[#B8975E] active:scale-[0.98] transition-colors rounded-sm"
                  >
                    Our Story
                  </Link>
                  <Link
                    href={isHome ? "#celebrations" : "/#celebrations"}
                    className="min-h-[44px] flex items-center justify-center sm:justify-start px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#292322] hover:text-[#B8975E] active:scale-[0.98] transition-colors rounded-sm"
                  >
                    Celebrations
                  </Link>
                  <Link
                    href={isHome ? "#events" : "/#events"}
                    className="min-h-[44px] flex items-center justify-center sm:justify-start px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#292322] hover:text-[#B8975E] active:scale-[0.98] transition-colors rounded-sm"
                  >
                    Events &amp; Schedule
                  </Link>
                </div>
              </div>

              {/* Group 2: Guest Experience */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-white/60 border border-[rgba(184,151,94,0.2)] shadow-2xs">
                <span className="text-[10.5px] font-sans font-bold uppercase tracking-[0.2em] text-[#A52232] flex items-center justify-center sm:justify-start gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37]" aria-hidden="true" />
                  Guest Guide
                </span>
                <div className="flex flex-col gap-0.5">
                  <Link
                    href={isHome ? "#venues" : "/#venues"}
                    className="min-h-[44px] flex items-center justify-center sm:justify-start px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#292322] hover:text-[#B8975E] active:scale-[0.98] transition-colors rounded-sm"
                  >
                    Wedding Venues
                  </Link>
                  <Link
                    href={isHome ? "#invitation" : "/#invitation"}
                    className="min-h-[44px] flex items-center justify-center sm:justify-start px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#292322] hover:text-[#B8975E] active:scale-[0.98] transition-colors rounded-sm"
                  >
                    Official Invitation
                  </Link>
                  <Link
                    href="/gallery"
                    className="min-h-[44px] flex items-center justify-center sm:justify-start px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#292322] hover:text-[#B8975E] active:scale-[0.98] transition-colors rounded-sm"
                  >
                    Memories Gallery
                  </Link>
                </div>
              </div>

              {/* Group 3: Attendance & Wishes */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-white/60 border border-[rgba(184,151,94,0.2)] shadow-2xs">
                <span className="text-[10.5px] font-sans font-bold uppercase tracking-[0.2em] text-[#A52232] flex items-center justify-center sm:justify-start gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37]" aria-hidden="true" />
                  RSVP &amp; Wishes
                </span>
                <div className="flex flex-col gap-0.5">
                  <Link
                    href={isHome ? "#wishes" : "/#wishes"}
                    className="min-h-[44px] flex items-center justify-center sm:justify-start px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#292322] hover:text-[#B8975E] active:scale-[0.98] transition-colors rounded-sm"
                  >
                    Wishes Wall
                  </Link>
                  <Link
                    href={isHome ? "#rsvp" : "/#rsvp"}
                    className="min-h-[44px] flex items-center justify-center sm:justify-start px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#7D1525] hover:text-[#9E2030] active:scale-[0.98] transition-colors rounded-sm"
                  >
                    Confirm RSVP &rarr;
                  </Link>
                  <Link
                    href={isHome ? "#contact" : "/#contact"}
                    className="min-h-[44px] flex items-center justify-center sm:justify-start px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#292322] hover:text-[#B8975E] active:scale-[0.98] transition-colors rounded-sm"
                  >
                    Contact Desk
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Desktop Quick Navigation Links (100% Frozen & Bit-for-Bit Preserved) */}
          <nav
            aria-label="Footer Quick Navigation"
            className="hidden lg:flex flex-wrap justify-center gap-x-5 gap-y-2 sm:gap-x-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#292322] my-2"
          >
            <Link
              href={isHome ? "#top" : "/"}
              className="hover:text-[#B8975E] transition-colors"
            >
              Home
            </Link>
            <Link
              href={isHome ? "#events" : "/#events"}
              className="hover:text-[#B8975E] transition-colors"
            >
              Events
            </Link>
            <Link
              href={isHome ? "#celebrations" : "/#celebrations"}
              className="hover:text-[#B8975E] transition-colors"
            >
              Celebrations
            </Link>
            <Link
              href={isHome ? "#venues" : "/#venues"}
              className="hover:text-[#B8975E] transition-colors"
            >
              Venues
            </Link>
            <Link
              href={isHome ? "#our-story" : "/#our-story"}
              className="hover:text-[#B8975E] transition-colors"
            >
              Our Story
            </Link>
            <Link
              href="/gallery"
              className="hover:text-[#B8975E] transition-colors"
            >
              Gallery
            </Link>
            <Link
              href={isHome ? "#wishes" : "/#wishes"}
              className="hover:text-[#B8975E] transition-colors"
            >
              Wishes
            </Link>
            <Link
              href={isHome ? "#rsvp" : "/#rsvp"}
              className="hover:text-[#A52232] transition-colors"
            >
              RSVP
            </Link>
            <Link
              href={isHome ? "#contact" : "/#contact"}
              className="hover:text-[#B8975E] transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Mobile & Tablet Parents & Hospitality Card (< 1024px) */}
          <div className="w-full max-w-xl mx-auto my-5 p-4 sm:p-5 rounded-2xl bg-white/70 border border-[rgba(184,151,94,0.3)] shadow-2xs block lg:hidden">
            <span className="text-[10px] sm:text-[10.5px] font-sans font-bold uppercase tracking-[0.22em] text-[#A52232] block mb-1">
              Divine Blessings &amp; Hospitality
            </span>
            <p className="font-serif text-sm sm:text-base text-[#292322] leading-snug">
              Hosted with immense pride &amp; love by
            </p>
            <p className="font-serif italic text-xs sm:text-sm text-[#5C5452] mt-1 leading-relaxed">
              Mr. Kenaram Gorain &amp; Mrs. Savita Gorain<br />
              Mr. Upen Gorain &amp; Mrs. Kokila Gorain
            </p>
            <div className="mt-3 pt-3 border-t border-[rgba(184,151,94,0.2)] flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="text-xs text-[#8A8280]">Guest Hospitality Desk:</span>
              <a
                href={contact.telHref}
                className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#150409] text-[#FFE8A3] hover:text-white border border-[#D4AF37]/50 active:scale-95 transition-all text-xs font-semibold"
                aria-label={`Call hospitality desk at ${contact.formattedPhone}`}
              >
                <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{contact.formattedPhone}</span>
              </a>
            </div>
          </div>

          {/* Desktop Parents Acknowledgement (100% Frozen & Bit-for-Bit Preserved) */}
          <div className="hidden lg:block mt-6 pt-5 border-t border-[rgba(184,151,94,0.15)] max-w-xl text-[12px] sm:text-xs lg:text-[11px] text-[#8A8280] leading-relaxed">
            <p>
              Hosted with pride and love by Mr. Kenaram Gorain &amp; Ms. Savita Gorian, and Mr. Upen Gorain &amp; Ms. Kokila Gorain.
            </p>
            <p className="mt-1">
              Contact desk:{" "}
              <a href={contact.telHref} className="text-[#A52232] underline underline-offset-2">
                {contact.formattedPhone}
              </a>
            </p>
          </div>

          {/* Copyright, Legal Links & Safe Area Padding */}
          <div className="mt-6 sm:mt-8 pt-4 border-t border-[rgba(184,151,94,0.15)] w-full flex flex-col sm:flex-row items-center justify-between text-[11.5px] sm:text-xs lg:text-[11px] text-[#8A8280] gap-2.5 sm:gap-3">
            <span>
              &copy; 2026 Mithun Gorain &amp; Sakhi Gorain. All rights reserved.
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/privacy"
                className="min-h-[44px] inline-flex items-center px-2.5 py-1.5 hover:text-[#B8975E] transition-colors"
              >
                Privacy Policy
              </Link>
              <span aria-hidden="true">&bull;</span>
              <Link
                href="/terms"
                className="min-h-[44px] inline-flex items-center px-2.5 py-1.5 hover:text-[#B8975E] transition-colors"
              >
                Terms of Use
              </Link>
            </div>
          </div>
        </motion.div>
      </Container>
    </footer>
  );
}
