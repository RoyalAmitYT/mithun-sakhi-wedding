"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/container";
import { OrnamentalDivider } from "@/components/ui/ornamental-divider";
import { WEDDING_DATA } from "@/data/wedding-data";
import { SectionHeaderFiligree } from "@/components/ui/decorative-surfaces";

export function EditorialFooter() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { couple, contact } = WEDDING_DATA;

  return (
    <footer
      role="contentinfo"
      className="relative -mt-px pt-16 pb-28 sm:py-20 bg-gradient-to-b from-[#FAF5EB] via-[#FAF5EB] to-[#F5EEDC] border-t border-[rgba(184,151,94,0.2)] text-center text-xs text-[#5C5452] pb-[max(6rem,calc(env(safe-area-inset-bottom)+4rem))] overflow-hidden"
    >
      <SectionHeaderFiligree color="#B8975E" opacity={0.14} />
      <Container size="editorial" className="relative z-10">
        {/* Monogram Seal & Names */}
        <div className="flex flex-col items-center">
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

            <span className="font-serif text-3xl sm:text-4xl font-medium text-[#292322] tracking-tight group-hover:text-[#B8975E] transition-colors">
              {couple.displayTitle}
            </span>
          </Link>

          <p className="text-xs uppercase tracking-[0.22em] text-[#A52232] font-semibold mt-1">
            {couple.weddingDatesDisplay} &bull; {couple.locationDisplay}
          </p>

          <p className="font-serif italic text-sm text-[#5C5452] mt-2 max-w-md">
            &ldquo;United in sacred Vedic matrimony with the divine blessings of our beloved families.&rdquo;
          </p>

          <OrnamentalDivider variant="gold" size="sm" className="my-6" />

          {/* Quick In-Page Navigation Links */}
          <nav
            aria-label="Footer Quick Navigation"
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#292322] my-2"
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
          <div className="mt-6 pt-5 border-t border-[rgba(184,151,94,0.15)] max-w-xl text-[11px] text-[#8A8280] leading-relaxed">
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

          {/* Copyright, Legal Links & Internal Verification */}
          <div className="mt-8 pt-4 border-t border-[rgba(184,151,94,0.15)] w-full flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8A8280] gap-3">
            <span>
              &copy; 2026 Mithun Gorain &amp; Sakhi Gorain. All rights reserved.
            </span>
            <div className="flex items-center gap-3">
              <Link href="/privacy" className="hover:text-[#B8975E] transition-colors">
                Privacy Policy
              </Link>
              <span>&bull;</span>
              <Link href="/terms" className="hover:text-[#B8975E] transition-colors">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
