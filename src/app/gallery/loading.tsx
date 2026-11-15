import React from "react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] pt-28 sm:pt-36 pb-32 sm:pb-36 relative overflow-hidden">
      <Container size="default" className="relative z-10">
        {/* Symmetrical Header Skeleton */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3 flex flex-col items-center">
          <Skeleton className="h-4 w-36 rounded-full" />
          <Skeleton className="h-10 sm:h-12 w-64 sm:w-80 rounded-xl" />
          <Skeleton className="h-5 w-4/5 max-w-md rounded-md" />
          <div className="w-24 h-0.5 bg-[#B8975E]/30 rounded-full my-4" />
        </div>

        {/* Category Filter Pills Skeleton */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 sm:w-28 rounded-full" />
          ))}
        </div>

        {/* Photo Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#B8975E]/20 bg-white/70 overflow-hidden shadow-xs space-y-3 pb-4"
            >
              <Skeleton className="aspect-4/3 w-full rounded-none" />
              <div className="px-4 space-y-2">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-3.5 w-1/2 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
