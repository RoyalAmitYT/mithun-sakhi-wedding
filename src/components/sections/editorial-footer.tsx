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
      className="relative -mt-px pt-12 sm:pt-16 lg:pt-20 pb-28 sm:pb-24 lg:pb-20 bg-gradient-to-b from-[#FAF5EB] via-[#FAF5EB] to-[#F5EEDC] border-t border-[rgba(184,151,94,0.2)] text-center text-xs text-[#5C5452] pb-[max(6.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] overflow-hidden"
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

          {/* Quick In-Page Navigation Links */}
          <nav
            aria-label="Footer Quick Navigation"
            className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:gap-x-6 text-[11.5px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-[#292322] my-2"
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

          {/* Parents Acknowledgement */}
          <div className="mt-6 pt-5 border-t border-[rgba(184,151,94,0.15)] max-w-xl text-[12px] sm:text-xs lg:text-[11px] text-[#8A8280] leading-relaxed">
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
