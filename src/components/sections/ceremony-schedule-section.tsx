import React from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { WEDDING_DATA } from "@/data/wedding-data";

export function CeremonyScheduleSection() {
  const { ceremonies } = WEDDING_DATA;

  return (
    <section
      id="ceremonies"
      aria-labelledby="ceremonies-title"
      className="py-20 sm:py-28 md:py-32 bg-[#F7F1E6]/35 border-t border-[rgba(184,151,94,0.2)] scroll-mt-20"
    >
      <Container size="editorial">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <SectionHeading
            kicker="Confirmed Schedule"
            kickerVariant="gold"
            title="Complete Ceremony Schedule"
            subtitle="Confirmed dates, times, and venue locations for each sacred event across both family residences."
            align="center"
            withDivider
          />
        </Reveal>

        {/* Chronological Ceremony List */}
        <StaggerGroup className="space-y-6 sm:space-y-8">
          {ceremonies.map((c, index) => (
            <StaggerItem key={c.id}>
              <div className="bg-white rounded-[6px] border border-[rgba(184,151,94,0.25)] shadow-[0_4px_20px_-2px_rgba(41,35,34,0.04)] overflow-hidden">
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-center">
                {/* Left Column: Date & Time Lockup (4 cols) */}
                <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[rgba(184,151,94,0.2)] pb-4 lg:pb-0 lg:pr-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#A52232]">
                      Day 0{index + 1}
                    </span>
                    <span className="text-[11px] font-sans text-[#8A8280]">
                      &bull;
                    </span>
                    <span className="text-xs font-serif italic text-[#8A8280]">
                      {c.traditionalTitle}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#292322] leading-tight">
                    {c.formattedDate}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#A52232]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{c.timeString}</span>
                  </div>
                  <span className="text-[11px] text-[#8A8280] block mt-0.5">
                    Start time in Asia/Kolkata (IST)
                  </span>
                </div>

                {/* Center Column: Ceremony Name, Venue & Ritual Meaning (5 cols) */}
                <div className="lg:col-span-5 lg:px-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B8975E] block mb-1">
                    {c.tagline}
                  </span>
                  <h4 className="font-serif text-xl sm:text-2xl font-medium text-[#292322] leading-snug">
                    {c.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#5C5452] mt-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-[rgba(184,151,94,0.15)] flex flex-col gap-0.5 text-xs text-[#292322]">
                    <span className="font-medium text-[#B8975E]">
                      Venue: {c.venueName}
                    </span>
                    <span className="text-[#5C5452] leading-relaxed">
                      {c.address}
                    </span>
                  </div>
                </div>

                {/* Right Column: Direction Action Button (3 cols) */}
                <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-[rgba(184,151,94,0.15)]">
                  <a
                    href={c.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                    aria-label={`Get Google Maps directions for ${c.name} at ${c.venueName}`}
                  >
                    <Button variant="outline-gold" size="sm" className="w-full justify-center">
                      <span className="flex items-center gap-1.5">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polygon points="3 11 22 2 13 21 11 13 3 11" />
                        </svg>
                        <span>Directions</span>
                      </span>
                    </Button>
                  </a>
                  <span className="text-[10px] text-[#8A8280] text-left lg:text-right">
                    Opens Google Maps
                  </span>
                </div>
              </div>
            </div>
          </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
