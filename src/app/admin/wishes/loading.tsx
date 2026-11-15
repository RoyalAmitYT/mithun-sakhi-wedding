import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminWishesLoading() {
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

        {/* Stats Row Skeleton */}
        <div className="flex flex-wrap gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-[#B8975E]/30 rounded-xl px-5 py-3 flex items-baseline gap-2">
              <Skeleton className="h-7 w-10 rounded-md" />
              <Skeleton className="h-3.5 w-24 rounded-md" />
            </div>
          ))}
        </div>

        {/* Filter Tabs Skeleton */}
        <div className="flex gap-2 flex-wrap border-b border-[#B8975E]/20 pb-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-full" />
          ))}
        </div>

        {/* Wishes List Skeleton */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#B8975E]/25 rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-36 rounded-md" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-4/5 rounded-md" />
                  <Skeleton className="h-3 w-28 rounded-md pt-1" />
                </div>
                <Skeleton className="h-10 w-20 rounded-xl shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
