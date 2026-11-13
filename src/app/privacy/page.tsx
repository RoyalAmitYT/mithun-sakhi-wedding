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
  title: "Privacy Policy",
  description:
    "Privacy and guest RSVP/blessings data handling notice for the Mithun & Sakhi wedding celebration website.",
  openGraph: {
    title: "Privacy Policy — Mithun & Sakhi Wedding",
    description:
      "Privacy and guest RSVP/blessings data handling notice for the Mithun & Sakhi wedding celebration website.",
  },
};

export default function PrivacyPage() {
  const { contact } = WEDDING_DATA;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FFFCF6] pt-28 sm:pt-36 pb-32 sm:pb-28">
        <Container size="reading">
          {/* Header */}
          <Reveal className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <SectionKicker variant="framed" className="mb-3">
              Transparency &bull; Guest Information Notice
            </SectionKicker>
            <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-[#292322] leading-[1.15]">
              Privacy Policy
            </h1>
            <p className="font-serif italic text-base sm:text-lg text-[#5C5452] mt-2">
              Information governance, RSVP privacy, and wedding data protection standards.
            </p>
            <OrnamentalDivider variant="gold" size="sm" className="my-5" />
            <span className="text-xs text-[#8A8280]">
              Last Updated: 12 November 2026 &bull; Public RSVP &amp; Guestbook Notice
            </span>
          </Reveal>

          {/* Policy Document Content */}
          <Reveal
            delay={0.1}
            className="p-8 sm:p-12 rounded-[6px] bg-white border border-[rgba(184,151,94,0.3)] shadow-[0_4px_20px_-2px_rgba(41,35,34,0.04)] space-y-8 text-sm text-[#292322] leading-relaxed"
          >
            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                1. Nature of This Website
              </h2>
              <p className="text-[#5C5452]">
                This website is a personal wedding celebration portal for the marriage of Mithun Gorain and Sakhi Gorain. Guests can explore ceremony schedules, venues, digital invitations, published wedding memories, blessings, and submit RSVPs directly without creating an account or logging in.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                2. Public RSVP &amp; Guest Blessings Information
              </h2>
              <p className="text-[#5C5452] mb-3">
                When you voluntarily confirm your attendance or share a blessing, we collect only the details you submit:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[#5C5452] pl-2">
                <li>
                  <strong>RSVP Details:</strong> Your full name, guest headcount, ceremony attendance choices, and optional contact number, village/city address, and relationship to the couple. Used solely for wedding hospitality, seating, and catering coordination.
                </li>
                <li>
                  <strong>Wedding Wishes &amp; Blessings:</strong> Your display name and blessing message, displayed publicly on the wedding guestbook wall.
                </li>
              </ul>
              <p className="text-[#5C5452] mt-3">
                We do not sell, license, rent, or commercially share any guest information.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                3. Data Isolation &amp; Security Boundaries
              </h2>
              <p className="text-[#5C5452]">
                Public RSVP submissions are protected by PostgreSQL Row Level Security (RLS) so public visitors cannot view, list, or browse other guests&apos; RSVP contact details. Access to the RSVP roster and unpublished media drafts is restricted strictly to authorized wedding administrators.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                4. Essential Cookies &amp; Administrative Sessions
              </h2>
              <p className="text-[#5C5452]">
                Public guests do not require accounts or login cookies. Essential first-party HTTP cookies are used solely for authorized administrator authentication sessions. We do not use third-party advertising cookies, tracking pixels, or commercial behavioral analytics.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                5. Removal or Update Requests
              </h2>
              <p className="text-[#5C5452]">
                If you would like to update an RSVP or remove a submitted blessing or contact record, please reach out to our wedding coordination desk via telephone or WhatsApp at{" "}
                <a
                  href={contact.telHref}
                  className="text-[#A52232] font-semibold hover:underline"
                >
                  {contact.formattedPhone}
                </a>
                , and your request will be handled promptly.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                6. Contact for Privacy Inquiries
              </h2>
              <p className="text-[#5C5452]">
                For any privacy inquiries or assistance regarding your RSVP or shared blessing, please contact the wedding coordination desk:
              </p>
              <div className="mt-3 p-4 rounded-[4px] bg-[#F7F1E6] border border-[rgba(184,151,94,0.25)] space-y-1 text-xs">
                <p>
                  <strong>Wedding Coordination Desk:</strong>{" "}
                  <a
                    href={contact.telHref}
                    className="text-[#A52232] hover:underline"
                  >
                    {contact.formattedPhone}
                  </a>
                </p>
                <p>
                  <strong>WhatsApp Desk:</strong>{" "}
                  <a
                    href={contact.whatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A52232] hover:underline"
                  >
                    Open WhatsApp Chat
                  </a>
                </p>
                <p className="text-[#8A8280]">
                  Purulia, West Bengal 723215, India
                </p>
              </div>
            </section>
          </Reveal>

          {/* Back Navigation */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-xs uppercase tracking-wider text-[#A52232] hover:text-[#B8975E] transition-colors"
            >
              &larr; Return to Wedding Home
            </Link>
          </div>
        </Container>
      </main>

      <EditorialFooter />
    </>
  );
}
