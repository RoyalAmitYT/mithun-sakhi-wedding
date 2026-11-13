import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/navigation";
import { EditorialFooter } from "@/components/sections";
import { PageTransition } from "@/components/motion";
import { PublicRsvpForm } from "@/components/rsvp/public-rsvp-form";
import { SectionHeaderFiligree } from "@/components/ui/decorative-surfaces";

export const instant = false;

export const metadata: Metadata = {
  title: "Confirm Your Presence (RSVP)",
  description:
    "Confirm your attendance for the sacred wedding celebrations of Mithun Gorain & Sakhi Gorain in Purulia, West Bengal. 19–22 November 2026.",
  openGraph: {
    title: "Confirm Your Presence (RSVP) — Mithun & Sakhi Wedding",
    description:
      "Confirm your presence for the sacred wedding ceremonies of Mithun Gorain & Sakhi Gorain. 19–22 November 2026, Purulia, West Bengal.",
  },
};

export default function RsvpPage() {
  return (
    <>
      {/* Shared Public Navigation Header */}
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] pt-28 sm:pt-36 pb-24 sm:pb-32 relative overflow-hidden">
        {/* Soft Decorative Filigree Background */}
        <SectionHeaderFiligree color="#B8975E" opacity={0.16} />

        <PageTransition>
          <PublicRsvpForm />
        </PageTransition>
      </main>

      {/* Editorial Footer */}
      <EditorialFooter />
    </>
  );
}
