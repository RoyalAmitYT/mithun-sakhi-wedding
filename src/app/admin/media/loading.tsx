import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminMediaLoading() {
  return (
    <main className="min-h-screen bg-[#FFFCF6] pt-32 pb-32 sm:pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Admin Header Skeleton */}
        <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded-full" />
              <Skeleton className="h-7 w-48 rounded-lg" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="w-11 h-11 rounded-full" />
              <Skeleton className="h-11 w-28 rounded-full" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#B8975E]/15">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 sm:w-28 rounded-full" />
            ))}
          </div>
        </div>

        {/* Control Bar Skeleton */}
        <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full" />
            ))}
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
        </div>

        {/* Media Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white/90 border border-[#B8975E]/30 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <Skeleton className="aspect-4/3 w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
                <div className="pt-3 border-t border-[#B8975E]/15 flex items-center justify-between gap-2">
                  <Skeleton className="h-8 w-20 rounded-xl" />
                  <Skeleton className="h-8 w-20 rounded-xl" />
                  <Skeleton className="h-8 w-16 rounded-xl" />
                  <Skeleton className="w-8 h-8 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
