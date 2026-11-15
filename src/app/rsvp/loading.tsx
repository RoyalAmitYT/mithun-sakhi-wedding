import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RsvpLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] pt-28 sm:pt-36 pb-24 sm:pb-32 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-10 sm:h-12 w-72 sm:w-96 rounded-xl" />
          <Skeleton className="h-4 w-4/5 max-w-md rounded-md" />
        </div>

        {/* Card Form Skeleton */}
        <div className="rounded-3xl border border-[#B8975E]/30 bg-white/80 p-6 sm:p-9 space-y-6 shadow-md backdrop-blur-xs">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-32 rounded-md" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* Ceremonies Skeletons */}
          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-36 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-[#B8975E]/20 bg-[#FFFCF6] space-y-2">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-40 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button Skeleton */}
          <Skeleton className="h-13 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}
