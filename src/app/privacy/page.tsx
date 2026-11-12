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
    "Privacy, personal profile handling, and guest access verification notice for the Mithun & Sakhi wedding website.",
  openGraph: {
    title: "Privacy Policy — Mithun & Sakhi Wedding",
    description:
      "Privacy, personal profile handling, and guest access verification notice for the Mithun & Sakhi wedding website.",
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
              Information governance, profile handling, and guest verification standards.
            </p>
            <OrnamentalDivider variant="gold" size="sm" className="my-5" />
            <span className="text-xs text-[#8A8280]">
              Last Updated: 27 October 2026 &bull; Family RSVP &amp; Attendee Management Notice
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
                This website is a private wedding celebration portal for the marriage of Mithun Gorain and Sakhi Gorain. It serves two distinct functions: providing public wedding schedules and venue navigation for guests, and managing a private, verified guest portal for celebration coordination.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                2. Guest Account Registration &amp; Profile Data
              </h2>
              <p className="text-[#5C5452] mb-3">
                When visitors create an optional guest account, we collect only the necessary identifying details:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[#5C5452] pl-2">
                <li>
                  <strong>Full Name:</strong> Used to identify you in the wedding guest registry and on your personalized portal.
                </li>
                <li>
                  <strong>Email Address:</strong> Used strictly for secure authentication credentials, session verification, and password recovery.
                </li>
                <li>
                  <strong>Mobile Number (Optional):</strong> Used solely for direct wedding coordination and emergency logistical updates.
                </li>
              </ul>
              <p className="text-[#5C5452] mt-3">
                We do not sell, license, rent, or commercially share your contact details.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                3. Guest Access Request &amp; Family Verification
              </h2>
              <p className="text-[#5C5452] mb-3">
                Registering an account does not automatically grant RSVP permissions. To ensure celebration intimacy and accurate catering planning across the four ceremonies, unapproved guests must submit an Access Request detailing:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[#5C5452] pl-2">
                <li>Your invited family or party name (e.g., &ldquo;The Mukherjee Family&rdquo;).</li>
                <li>Your relationship to the bride or groom (e.g., &ldquo;Cousin of Groom&rdquo;).</li>
                <li>An optional personal greeting or note to the couple.</li>
              </ul>
              <p className="text-[#5C5452] mt-3">
                Designated wedding administrators review incoming requests. Upon verification:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[#5C5452] pl-2">
                <li>
                  <strong>Approval:</strong> Your profile transitions to verified guest status, assigning you to an official family group.
                </li>
                <li>
                  <strong>Rejection:</strong> If your registration cannot be verified, the request is marked declined with a specific explanation visible only on your account dashboard. You may submit a clarified request if needed.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                4. Data Isolation &amp; Security Boundaries
              </h2>
              <p className="text-[#5C5452]">
                Your account details, access request submissions, and rejection notices are strictly isolated using PostgreSQL Row Level Security (RLS) and column-level permission grants. No guest can inspect, modify, or browse another guest&apos;s registration data. Access to pending requests is restricted exclusively to the wedding couple and administrators holding verified <code>guest_rsvp</code> privileges.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                5. Session Cookies &amp; Storage
              </h2>
              <p className="text-[#5C5452]">
                This website uses essential first-party HTTP cookies strictly to maintain your authenticated login session and security tokens. We do not use third-party advertising cookies, external tracking pixels, or commercial behavioral analytics scripts.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                6. Family RSVP Engine, Attendee Management &amp; Dietary Requests
              </h2>
              <p className="text-[#5C5452] mb-3">
                Verified wedding guests assigned to a family unit participate in our ceremony-by-ceremony RSVP system:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[#5C5452] pl-2">
                <li>
                  <strong>Designated Family Manager:</strong> Each family unit has a single active representative authorized to submit and update ceremony attendance on behalf of the family. Non-manager family members can view confirmed responses in a secure read-only view.
                </li>
                <li>
                  <strong>Individual Attendee Roster:</strong> When marking a ceremony as &ldquo;Attending&rdquo;, the manager submits individual attendee names and age classifications (Adult, Child, Infant). Catering headcounts and seating arrangements are strictly derived from these explicit child attendee records.
                </li>
                <li>
                  <strong>Optional Logistics &amp; Dietary Information:</strong> Managers may optionally provide arrival travel details (train/flight schedules) and dietary requirements (e.g. pure vegetarian, Jain, allergies). This information is encrypted and isolated; it is accessible only to the wedding coordination team and never shared with other guests or public directories.
                </li>
                <li>
                  <strong>Strict Deadline Enforcement:</strong> Submissions and edits automatically lock at 11:59:59 PM IST on the preceding day for each of the four ceremonies. After the deadline, database constraints permanently prevent mutations by any user role.
                </li>
                <li>
                  <strong>Zero External Spreadsheets or Exports:</strong> Guest attendance rosters are strictly managed within the secure wedding database; direct export to external CSV or Excel spreadsheets is disabled to prevent accidental data dissemination.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                7. Features In Progress &amp; Data Deletion Support
              </h2>
              <p className="text-[#5C5452] mb-3">
                Please note that public wishes and interactive media galleries are scheduled for upcoming release phases (P-10 &amp; P-11).
              </p>
              <p className="text-[#5C5452]">
                Self-service account deletion will be made available in the guest dashboard during Phase P-10. If you wish to delete your account or withdraw an access request immediately, please reach out to the wedding coordination desk via telephone or WhatsApp at{" "}
                <a
                  href={contact.telHref}
                  className="text-[#A52232] font-semibold hover:underline"
                >
                  {contact.formattedPhone}
                </a>
                . Your account records will be promptly purged upon request.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-[#292322] mb-2">
                8. Contact for Privacy Inquiries
              </h2>
              <p className="text-[#5C5452]">
                For any privacy inquiries or assistance regarding your guest registration, please contact the wedding coordination desk:
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
