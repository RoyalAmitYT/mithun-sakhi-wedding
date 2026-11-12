import React from "react";

export interface CeremonialArchProps {
  className?: string;
}

export function CeremonialArch({ className = "" }: CeremonialArchProps) {
  return (
    <div
      className={`relative w-full max-w-[290px] xs:max-w-[330px] sm:max-w-[390px] lg:max-w-[430px] mx-auto select-none ${className}`}
      aria-label="Ceremonial Royal Mandap Arch with M & S Monogram"
    >
      {/* Outer Glow / Soft Ambient Radiant Halo */}
      <div
        className="absolute -inset-4 sm:-inset-6 rounded-t-full opacity-70 blur-xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(184,151,94,0.22), rgba(165,34,50,0.06) 55%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      {/* Main Arch Frame Container */}
      <div className="relative rounded-t-[170px] sm:rounded-t-[210px] rounded-b-[10px] p-3 xs:p-4 sm:p-5 bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#F7F1E6] border-2 border-[rgba(184,151,94,0.45)] shadow-[0_16px_40px_-6px_rgba(41,35,34,0.08),0_2px_12px_-2px_rgba(184,151,94,0.08)]">
        {/* Inner Scalloped Gold Hairline Border */}
        <div className="relative rounded-t-[150px] sm:rounded-t-[190px] rounded-b-[6px] p-4 xs:p-5 sm:p-7 border border-[rgba(184,151,94,0.35)] bg-gradient-to-b from-[#FFFDF8] via-[#FFFFFF] to-[#FAF5EB] flex flex-col items-center text-center overflow-hidden">
          {/* Top Traditional Mandap Kalash / Crest Finial */}
          <div className="w-12 h-10 mb-2 text-[#B8975E] flex items-center justify-center">
            <svg
              viewBox="0 0 48 40"
              fill="none"
              stroke="currentColor"
              className="w-10 h-8"
              aria-hidden="true"
            >
              {/* Kalash Top Bindu & Coconut Leaves */}
              <circle cx="24" cy="5" r="2.5" fill="currentColor" />
              <path
                d="M24 8 C20 12, 16 16, 14 20 C18 20, 22 17, 24 14 C26 17, 30 20, 34 20 C32 16, 28 12, 24 8 Z"
                fill="rgba(184,151,94,0.3)"
                stroke="currentColor"
                strokeWidth="1"
              />
              {/* Sacred Pot (Kalash Body) */}
              <ellipse
                cx="24"
                cy="26"
                rx="10"
                ry="8"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
              {/* Pot Base & Swastik / Auspicious Center Dot */}
              <circle cx="24" cy="26" r="1.5" fill="currentColor" />
              <path
                d="M17 34 L31 34"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Auspicious Invocation */}
          <span className="text-[10px] font-sans uppercase tracking-[0.22em] text-[#A52232] font-semibold mb-2 block">
            With Divine Blessings
          </span>

          {/* Dedicated Royal Portrait / Monogram Medallion
              Slot designated for genuine portrait photograph of Mithun & Sakhi */}
          <div
            className="w-28 h-32 xs:w-32 xs:h-36 sm:w-40 sm:h-44 rounded-t-full rounded-b-md border-2 border-[#B8975E]/60 bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#F7F1E6] flex flex-col items-center justify-center p-3 shadow-inner my-2 relative overflow-hidden group"
            title="Ceremonial Portrait Frame"
          >
            {/* Subtle inner gold arch hairline */}
            <div className="absolute inset-1 rounded-t-full rounded-b-[3px] border border-[#B8975E]/30 pointer-events-none" />

            {/* Regal Monogram Seal */}
            <span className="font-serif text-3xl xs:text-4xl sm:text-5xl font-normal text-[#292322] tracking-normal z-10 leading-none">
              M
              <span className="font-serif italic text-xl xs:text-2xl sm:text-3xl font-light text-[#B8975E] mx-0.5">
                &amp;
              </span>
              S
            </span>
            <span className="text-[9px] xs:text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#A52232] mt-2 z-10">
              Auspicious Wedding
            </span>
          </div>

          {/* Couple Full Names in Arch */}
          <div className="mt-2 text-center">
            <div className="font-serif text-base xs:text-lg sm:text-xl font-medium text-[#292322] tracking-wide leading-tight">
              Mithun Gorain
            </div>
            <div className="text-[11px] font-serif italic text-[#8A8280] my-0.5">
              and
            </div>
            <div className="font-serif text-base xs:text-lg sm:text-xl font-medium text-[#292322] tracking-wide leading-tight">
              Sakhi Gorain
            </div>
          </div>

          {/* Delicate Divider Flank */}
          <div className="flex items-center gap-2 my-3 w-3/4 max-w-[180px]">
            <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#B8975E]/50" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#B8975E]" />
            <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#B8975E]/50" />
          </div>

          {/* Blessings of Parents Plaque */}
          <div className="text-center px-1">
            <p className="text-[10px] xs:text-[11px] font-sans uppercase tracking-[0.16em] text-[#B8975E] font-semibold">
              With Blessings of Parents
            </p>
            <p className="font-serif text-xs sm:text-sm text-[#5C5452] mt-1 leading-snug">
              Mr. Kenaram Gorain &amp; Ms. Savita Gorian
            </p>
            <p className="font-serif text-xs sm:text-sm text-[#5C5452] leading-snug">
              Mr. Upen Gorain &amp; Ms. Kokila Gorain
            </p>
          </div>

          {/* Auspicious Base Notice */}
          <div className="mt-4 pt-3 border-t border-[rgba(184,151,94,0.25)] w-full">
            <p className="text-[10px] sm:text-[11px] font-sans tracking-wider uppercase text-[#8A8280] font-medium">
              Purulia, West Bengal &bull; 19–22 Nov 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
