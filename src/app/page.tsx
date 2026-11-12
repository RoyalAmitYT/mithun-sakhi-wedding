import React, { Suspense } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/navigation";
import { HeroSection } from "@/components/hero";
import {
  WishesPreviewSection,
  WishesPreviewSkeleton,
} from "@/components/sections/wishes-preview-section";

// Below-the-fold sections code-split with full SSR static pre-rendering
const OurStorySection = dynamic(
  () =>
    import("@/components/sections/our-story-section").then(
      (m) => m.OurStorySection
    )
);

const CelebrationsOverviewSection = dynamic(
  () =>
    import("@/components/sections/celebrations-overview-section").then(
      (m) => m.CelebrationsOverviewSection
    )
);

const CeremonyFullscreenSections = dynamic(
  () =>
    import("@/components/sections/ceremony-fullscreen-sections").then(
      (m) => m.CeremonyFullscreenSections
    )
);

const VenuesSection = dynamic(
  () =>
    import("@/components/sections/venues-section").then(
      (m) => m.VenuesSection
    )
);

const InvitationPreviewSection = dynamic(
  () =>
    import("@/components/sections/invitation-preview-section").then(
      (m) => m.InvitationPreviewSection
    )
);

const GalleryPreviewSection = dynamic(
  () =>
    import("@/components/sections/gallery-preview-section").then(
      (m) => m.GalleryPreviewSection
    )
);

const RsvpPreviewSection = dynamic(
  () =>
    import("@/components/sections/rsvp-preview-section").then(
      (m) => m.RsvpPreviewSection
    )
);

const ContactSection = dynamic(
  () =>
    import("@/components/sections/contact-section").then(
      (m) => m.ContactSection
    )
);

const EditorialFooter = dynamic(
  () =>
    import("@/components/sections/editorial-footer").then(
      (m) => m.EditorialFooter
    )
);

export const metadata: Metadata = {
  title: "Mithun & Sakhi — Wedding Celebration",
  description:
    "Official wedding celebration website for Mithun Gorain and Sakhi Gorain. 19–22 November 2026 • Purulia, West Bengal.",
  openGraph: {
    title: "Mithun & Sakhi Wedding Celebration",
    description:
      "Join us in celebrating the sacred union of Mithun & Sakhi. 19–22 November 2026, Purulia, West Bengal.",
    type: "website",
    locale: "en_IN",
  },
};

export default function HomePage() {
  return (
    <>
      {/* Anchor for Smooth Scroll to Top */}
      <div id="top" />

      {/* Shared Public Navigation Header */}
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* Section A: Signature Cinematic Sticky Hero Experience with Integrated Countdown */}
        <HeroSection />

        {/* Cinematic Scroll-Reveal Container: Incoming Opaque Champagne-White Content Layer */}
        <div
          style={{ transform: "translate3d(0, 0, 0)", willChange: "transform" }}
          className="relative z-10 bg-[#FFFCF6] shadow-[0_-24px_48px_rgba(0,0,0,0.35)]"
        >
          {/* Section B: Our Story & Journey (Mithun & Sakhi, Parents, Milestones) */}
          <OurStorySection />

          {/* Section C: Celebrations Overview (Four Sacred Events) */}
          <CelebrationsOverviewSection />
        </div>

        {/* Four Consecutive Fullscreen Cinematic Ceremony Sections (Sticky-Stacked Scroll) */}
        <CeremonyFullscreenSections />

        {/* Lower Content Layer: Curtain Sliding Over Ceremony Sections */}
        <div
          style={{ transform: "translate3d(0, 0, 0)", willChange: "transform" }}
          className="relative z-20 -mt-[100svh] bg-[#FFFCF6] shadow-[0_-24px_48px_rgba(0,0,0,0.35)]"
        >
          {/* Section E: Venues & Google Maps Navigation */}
          <VenuesSection />

          {/* Section G: Digital Royal Invitation Studio Preview */}
          <InvitationPreviewSection />

          {/* Section H: Wedding Memories Gallery Preview */}
          <GalleryPreviewSection />

          {/* Section I: Wishes & Blessings Wall Preview */}
          <Suspense fallback={<WishesPreviewSkeleton />}>
            <WishesPreviewSection />
          </Suspense>

          {/* Section J: Guest Attendance & RSVP Workflow Preview */}
          <RsvpPreviewSection />

          {/* Section K: Hospitality Coordination Desk & Contact */}
          <ContactSection />

          {/* Section L: Editorial Footer */}
          <EditorialFooter />
        </div>
      </main>
    </>
  );
}
