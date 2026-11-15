import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOverviewLoading() {
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
          {/* Navigation Pills Skeleton */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#B8975E]/15">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 sm:w-28 rounded-full" />
            ))}
          </div>
        </div>

        {/* 4 KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white/90 border border-[#B8975E]/30 rounded-2xl p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-28 rounded-full" />
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
              </div>
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md pt-2 border-t border-[#B8975E]/10" />
            </div>
          ))}
        </div>

        {/* Ceremony Breakdown Skeleton */}
        <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#B8975E]/15 pb-3">
            <div className="space-y-1">
              <Skeleton className="h-3 w-32 rounded-full" />
              <Skeleton className="h-6 w-48 rounded-md" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-[#B8975E]/20 bg-[#FFFCF6]/80 space-y-3">
                <Skeleton className="h-4 w-28 rounded-md" />
                <div className="pt-2 border-t border-[#B8975E]/15 flex items-baseline justify-between">
                  <Skeleton className="h-3 w-12 rounded-md" />
                  <Skeleton className="h-6 w-10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
