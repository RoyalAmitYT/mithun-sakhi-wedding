import React from "react";

export default function RootLoading() {
  return (
    <div
      aria-label="Loading Mithun & Sakhi Wedding Celebration..."
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] px-4 pointer-events-none"
    >
      <div className="relative flex flex-col items-center space-y-5 text-center">
        {/* Monogram Seal with Soft Glowing Ring */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#1F070B] via-[#2A0A10] to-[#150408] border border-[#B8975E]/60 flex items-center justify-center shadow-[0_10px_30px_rgba(184,151,94,0.25)]">
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#D4AF37]">
            M&middot;S
          </span>
          <span className="absolute -inset-1 rounded-full border border-[#B8975E]/30 animate-pulse pointer-events-none" />
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <span className="block text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.25em] text-[#8E6D38]">
            WEDDING CELEBRATION
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#292322] font-normal tracking-tight">
            Mithun &amp; Sakhi
          </h2>
        </div>

        {/* Shimmer Bar */}
        <div className="w-36 sm:w-44 h-[2px] rounded-full overflow-hidden bg-[#B8975E]/20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A52232] to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
}
