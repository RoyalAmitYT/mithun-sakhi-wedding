import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/navigation";
import { EditorialFooter } from "@/components/sections";
import { SectionHeaderFiligree } from "@/components/ui/decorative-surfaces";
import { PageTransition } from "@/components/motion/page-transition";
import { WishesView } from "./wishes-view";
import { getCachedPublicWishes } from "@/lib/server-data";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";


export const metadata: Metadata = {
  title: "Guest Blessings & Wishes",
  description:
    "Read heartfelt prayers, blessings, and warm congratulations bestowed upon Mithun & Sakhi by family, elders, and cherished friends for their wedding in Purulia.",
  openGraph: {
    title: "Guest Blessings & Wishes — Mithun & Sakhi Wedding",
    description:
      "Read heartfelt prayers, blessings, and warm congratulations bestowed upon Mithun & Sakhi by family, elders, and cherished friends.",
  },
};

async function WishesAsyncContainer() {
  const approvedWishes = await getCachedPublicWishes();
  return <WishesView initialWishes={approvedWishes} />;
}

function WishesSkeletonFallback() {
  return (
    <Container size="default" className="relative z-10 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center max-w-3xl mx-auto space-y-3 flex flex-col items-center">
        <Skeleton className="h-4 w-36 rounded-full" />
        <Skeleton className="h-10 sm:h-12 w-64 sm:w-80 rounded-xl" />
        <Skeleton className="h-4 w-4/5 max-w-md rounded-md" />
        <div className="w-24 h-0.5 bg-[#B8975E]/30 rounded-full my-3" />
      </div>

      {/* CTA Bar Skeleton */}
      <div className="flex items-center justify-between bg-white/70 border border-[#B8975E]/30 rounded-2xl p-4 sm:p-5">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-11 w-44 rounded-full" />
      </div>

      {/* Wishes Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#B8975E]/20 bg-white/80 p-5 space-y-3.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md pt-2" />
          </div>
        ))}
      </div>
    </Container>
  );
}

export default function WishesPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] pt-28 sm:pt-36 pb-32 sm:pb-36 relative overflow-hidden">
        <PageTransition>
          <SectionHeaderFiligree color="#B8975E" opacity={0.16} />

          {/* Golden Ambient Flow Waves */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <svg
              className="absolute -top-12 left-0 w-[140%] max-w-none h-96 opacity-25"
              viewBox="0 0 1600 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M-100,120 C300,260 650,20 1050,180 C1350,300 1550,140 1800,220 L1800,0 L-100,0 Z"
                fill="url(#gold-wave-wishes)"
              />
              <defs>
                <linearGradient id="gold-wave-wishes" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B8975E" stopOpacity="0.12" />
                  <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#F5ECE0" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <Suspense fallback={<WishesSkeletonFallback />}>
            <WishesAsyncContainer />
          </Suspense>
        </PageTransition>
      </main>

      <EditorialFooter />
    </>
  );
}
