import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/navigation";
import { EditorialFooter } from "@/components/sections";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
import { GalleryView, type PublishedMediaItem } from "./gallery-view";
import { SectionHeaderFiligree } from "@/components/ui/decorative-surfaces";
import { Reveal } from "@/components/motion/reveal";
import { AnimatedDivider } from "@/components/motion/animated-divider";
import { PageTransition } from "@/components/motion/page-transition";

export const instant = false;

export const metadata: Metadata = {
  title: "Wedding Memories Gallery — Mithun & Sakhi",
  description:
    "Official photography and cinematic film gallery for Mithun & Sakhi's wedding celebrations in Purulia, West Bengal.",
  openGraph: {
    title: "Wedding Memories Gallery — Mithun & Sakhi Wedding",
    description:
      "Official photography and cinematic film gallery for Mithun & Sakhi's wedding celebrations in Purulia, West Bengal.",
  },
};

export default async function GalleryPage() {
  const supabase = await createClient();

  // Hydrate only approved & published media items from the database
  const { data: rawMedia } = await supabase.rpc("get_published_media");
  const publishedMedia = (rawMedia as unknown as PublishedMediaItem[]) || [];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] pt-28 sm:pt-36 pb-32 sm:pb-36 relative overflow-hidden">
        <PageTransition>
          {/* Background Corner Filigree */}
        <SectionHeaderFiligree color="#B8975E" opacity={0.16} />

        {/* Subtle Flowing Golden Wave Ribbons in Background matching Visual Reference */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          {/* Upper Golden Flowing Wave Ribbon */}
          <svg
            className="absolute -top-12 left-0 w-[140%] max-w-none h-96 opacity-35"
            viewBox="0 0 1600 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M-100,120 C300,260 650,20 1050,180 C1350,300 1550,140 1800,220 L1800,0 L-100,0 Z"
              fill="url(#gold-wave-upper)"
            />
            <path
              d="M-50,180 C320,320 700,80 1100,220 C1400,340 1600,200 1850,270"
              stroke="url(#gold-wave-line-1)"
              strokeWidth="1.5"
              fill="none"
            />
            <defs>
              <linearGradient
                id="gold-wave-upper"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#DFCEB5" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#FAF1E3" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#DFCEB5" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient
                id="gold-wave-line-1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#C49E60" stopOpacity="0.1" />
                <stop offset="40%" stopColor="#B8975E" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Lower Golden Flowing Wave Ribbon */}
          <svg
            className="absolute -bottom-16 left-0 w-[140%] max-w-none h-[420px] opacity-35"
            viewBox="0 0 1600 420"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M-100,320 C350,180 750,360 1150,220 C1450,120 1650,260 1850,180 L1850,420 L-100,420 Z"
              fill="url(#gold-wave-lower)"
            />
            <path
              d="M-80,260 C380,120 780,310 1180,170 C1480,70 1680,210 1880,130"
              stroke="url(#gold-wave-line-2)"
              strokeWidth="1.5"
              fill="none"
            />
            <defs>
              <linearGradient
                id="gold-wave-lower"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#DFCEB5" stopOpacity="0.5" />
                <stop offset="60%" stopColor="#F7EEDF" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#DFCEB5" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient
                id="gold-wave-line-2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#B8975E" stopOpacity="0.1" />
                <stop offset="60%" stopColor="#C49E60" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#B8975E" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <Container size="default" className="relative z-10">
          {/* Symmetrical Header Lockup matching Target Reference */}
          <header id="gallery-header" className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            {/* Symmetrical Eyebrow */}
            <div className="inline-flex items-center justify-center gap-2 mb-3 select-none">
              <span className="text-[#B8975E] text-[10px] sm:text-xs">◆</span>
              <span className="font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-[#8E6D38]">
                CINEMATIC MEMORIES
              </span>
              <span className="text-[#B8975E] text-[10px] sm:text-xs">◆</span>
            </div>

            {/* Main Editorial Heading */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal sm:font-medium tracking-tight text-[#292322] leading-[1.1]">
              Wedding Memories
            </h1>

            {/* Subtitle */}
            <p className="font-serif italic text-base sm:text-lg md:text-xl text-[#5C5452] mt-3.5 max-w-2xl mx-auto leading-relaxed">
              &ldquo;Moments of sacred romance, family laughter, and joyous celebration captured forever.&rdquo;
            </p>

            {/* Symmetrical Central Animated Gold Divider */}
            <div className="flex justify-center my-6 sm:my-7">
              <AnimatedDivider variant="gold" size="sm" />
            </div>
          </header>

          {/* Interactive Tabbed Gallery Component */}
          <GalleryView initialMedia={publishedMedia} />
        </Container>
        </PageTransition>
      </main>

      <EditorialFooter />
    </>
  );
}
