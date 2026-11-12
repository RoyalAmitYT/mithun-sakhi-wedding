"use client";

import React, { useState, useRef, useEffect } from "react";
import { WEDDING_DATA, Ceremony } from "@/data/wedding-data";
import {
  generateCeremonyIcs,
  generateAllCeremoniesIcs,
  generateGoogleCalendarUrl,
  triggerCalendarDownload,
} from "@/lib/calendar";

export function CalendarDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleDownloadAllIcs = () => {
    const icsContent = generateAllCeremoniesIcs(WEDDING_DATA.ceremonies);
    triggerCalendarDownload("mithun-sakhi-wedding-all-ceremonies.ics", icsContent);
    setIsOpen(false);
  };

  const handleDownloadSingleIcs = (ceremony: Ceremony) => {
    const icsContent = generateCeremonyIcs(ceremony);
    triggerCalendarDownload(`mithun-sakhi-${ceremony.id}-ceremony.ics`, icsContent);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-xs font-semibold uppercase tracking-wider text-[#292322] bg-white border border-[#B8975E]/70 rounded hover:bg-[#FDF9F3] hover:border-[#B8975E] transition-colors shadow-xs"
      >
        <svg className="w-4 h-4 text-[#8E6D38] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span><span className="hidden xs:inline">Add to </span>Calendar</span>
        <svg className={`w-3 h-3 transition-transform text-[#8E6D38] shrink-0 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 sm:left-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg bg-white border border-[#B8975E]/30 shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Bundle Option */}
          <button
            type="button"
            role="menuitem"
            onClick={handleDownloadAllIcs}
            className="w-full text-left p-2.5 rounded-md bg-[#FDF9F3] hover:bg-[#F5EFE0] border border-[#B8975E]/30 flex items-center justify-between mb-3 transition-colors"
          >
            <div>
              <span className="font-serif font-semibold text-sm text-[#292322] block">
                All 4 Ceremonies (.ics)
              </span>
              <span className="text-[11px] text-[#5C5452]">
                Apple Calendar, Outlook, Google (.ics)
              </span>
            </div>
            <span className="text-xs font-semibold text-[#A52232]">Download</span>
          </button>

          <div className="text-[10px] uppercase font-semibold tracking-wider text-[#8A8280] px-1 pb-1 border-b border-[rgba(184,151,94,0.15)] mb-2">
            Individual Ceremonies
          </div>

          <div className="space-y-2">
            {WEDDING_DATA.ceremonies.map((c) => (
              <div
                key={c.id}
                className="p-2 rounded bg-white hover:bg-neutral-50 border border-neutral-100 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-medium text-[#292322]">{c.name}</div>
                  <div className="text-[10px] text-[#8A8280]">
                    {c.formattedDate} • {c.timeString}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={generateGoogleCalendarUrl(c)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 text-[10px] font-medium text-[#B8975E] hover:text-[#A52232] hover:bg-[#FDF9F3] rounded border border-[#B8975E]/30 transition-colors"
                    title={`Add ${c.name} to Google Calendar`}
                  >
                    Google
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingleIcs(c)}
                    className="px-2 py-1 text-[10px] font-medium text-[#5C5452] hover:text-[#292322] hover:bg-neutral-100 rounded border border-neutral-200 transition-colors"
                    title={`Download .ics file for ${c.name}`}
                  >
                    .ics
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2.5 pt-2 border-t border-[rgba(184,151,94,0.15)] text-[10px] text-[#8A8280] italic text-center">
            * End times unconfirmed per ceremony customs.
          </div>
        </div>
      )}
    </div>
  );
}
