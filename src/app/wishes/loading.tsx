import React from "react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishesLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] pt-28 sm:pt-36 pb-32 sm:pb-36 relative overflow-hidden">
      <Container size="default" className="relative z-10 space-y-8">
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
    </main>
  );
}
