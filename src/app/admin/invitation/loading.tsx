import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminInvitationLoading() {
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

        {/* Settings Panels Skeleton */}
        <div className="space-y-8 max-w-4xl">
          <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-3 w-28 rounded-full" />
                <Skeleton className="h-7 w-64 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>

          <div className="bg-white/80 border border-[#B8975E]/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <Skeleton className="h-3 w-32 rounded-full" />
              <Skeleton className="h-7 w-56 rounded-lg" />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32 rounded-md" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>

            <div className="flex items-center justify-end pt-4">
              <Skeleton className="h-12 w-44 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
