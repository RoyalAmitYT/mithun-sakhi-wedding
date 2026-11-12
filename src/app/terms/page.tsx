import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navigation";
import { EditorialFooter } from "@/components/sections";
import { Container } from "@/components/ui/container";
import { SectionKicker } from "@/components/ui/section-kicker";
import { OrnamentalDivider } from "@/components/ui/ornamental-divider";
import { Reveal } from "@/components/motion";
import { WEDDING_DATA } from "@/data/wedding-data";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use and visitor guidance for the Mithun & Sakhi personal wedding celebration website.",
  openGraph: {
    title: "Terms of Use — Mithun & Sakhi Wedding",
    description:
      "Terms of use and visitor guidance for the Mithun & Sakhi personal wedding celebration website.",
  },
};

export default function TermsPage() {
  const { contact } = WEDDING_DATA;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FFFCF6] pt-28 sm:pt-36 pb-32 sm:pb-28">
        <Container size="reading">
          {/* Header */}
          <Reveal className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <SectionKicker variant="framed" className="mb-3">
              Visitor Guidance &bull; Personal Site
            </SectionKicker>
            <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-[#292322] leading-[1.15]">
              Terms of Use
            </h1>
            <p className="font-serif italic text-base sm:text-lg text-[#5C5452] mt-2">
              Visitor principles for our personal wedding celebration website.
            </p>
            <OrnamentalDivider variant="gold" size="sm" className="my-5" />
            <span className="text-xs text-[#8A8280]">
              Last Updated: 27 October 2026 &bull; Personal Family Website
            </span>
          </Reveal>

          {/* Terms Content */}
          <Reveal delay={0.1} className="p-8 sm:p-12 rounded-[6px] bg-white border border-[rgba(184,151,94,0.3)] shadow-[0_4px_20px_-2px_rgba(41,35,34,0.04)] space-y-8 text-sm text-[#292322] leading-relaxed">
            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                1. Purpose of the Website
              </h2>
              <p className="text-[#5C5452]">
                This website is created solely for personal, non-commercial purposes to share wedding celebration announcements, ceremony schedules, and venue directions for the marriage of Mithun Gorain and Sakhi Gorain with invited guests, family members, and well-wishers.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                2. Respectful Use &bull; Community Standards
              </h2>
              <p className="text-[#5C5452]">
                We warmly ask that all visitors treat the couple, both families, and fellow guests with courtesy and cultural reverence. Any unauthorized automated scraping, malicious attacks, or improper use of contact channels is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                3. Event Information &amp; Schedule Updates
              </h2>
              <p className="text-[#5C5452]">
                All ceremony dates, timings (in Asia/Kolkata), and venue addresses are provided in good faith based on current family arrangements. While we strive to maintain complete accuracy, ceremonial timings and weather-related adjustments may occur. Guests are encouraged to check the site or connect with the family coordination desk for late-breaking announcements.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                4. Intellectual Property &amp; Personal Media
              </h2>
              <p className="text-[#5C5452]">
                The visual identity, custom Mandap vector ornaments, typography designs, and digital invitation layouts are created specifically for Mithun &amp; Sakhi. Once published, all wedding photographs and films remain the personal intellectual property of the couple and their photographers. Guests may view and share them for personal, non-commercial celebration purposes only.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                5. External Links
              </h2>
              <p className="text-[#5C5452]">
                This website contains links to third-party services such as Google Maps (for venue navigation) and WhatsApp (for guest communications). We are not responsible for the availability, terms, or privacy practices of these external platforms.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                6. Questions &amp; Family Inquiries
              </h2>
              <p className="text-[#5C5452]">
                If you have any questions regarding these terms, ceremony schedules, or travel accommodations, please reach out to the family coordination desk directly:
              </p>
              <div className="mt-3 p-4 rounded-[4px] bg-[#F7F1E6]/60 border border-[rgba(184,151,94,0.2)]">
                <p className="font-medium text-[#292322]">Wedding Hospitality Team</p>
                <p className="text-xs text-[#5C5452] mt-0.5">Purulia, West Bengal &bull; Phone / WhatsApp: {contact.formattedPhone}</p>
                <p className="text-xs text-[#A52232] mt-1">
                  <a href={contact.telHref} className="hover:underline">Call {contact.formattedPhone}</a>
                  {" "}&bull;{" "}
                  <a href={contact.whatsAppHref} target="_blank" rel="noopener noreferrer" className="hover:underline">WhatsApp Message</a>
                </p>
              </div>
            </section>
          </Reveal>

          <div className="mt-10 text-center">
            <Link href="/" className="text-xs font-semibold uppercase tracking-wider text-[#B8975E] hover:text-[#A52232] transition-colors">
              &larr; Return to Wedding Home
            </Link>
          </div>
        </Container>
      </main>

      <EditorialFooter />
    </>
  );
}
