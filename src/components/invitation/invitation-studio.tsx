"use client";

import React, { useState } from "react";
import { CalendarDropdown } from "./calendar-dropdown";
import { OfficialWeddingInvitation } from "./official-wedding-invitation";
import {
  downloadInvitationCardAsPng,
  printOfficialInvitation,
  shareOrCopyInvitationUrl,
} from "@/lib/invitation-export";

export interface InvitationStudioSettings {
  id?: string;
  default_template?: string;
  headline_text?: string;
  intro_text?: string;
  qr_code_target_url?: string;
  custom_announcement?: string | null;
  is_published?: boolean;
}

interface InvitationStudioProps {
  initialSettings?: InvitationStudioSettings;
}

export function InvitationStudio({ initialSettings }: InvitationStudioProps = {}) {
  const [downloading, setDownloading] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleDownloadPng = async () => {
    try {
      setDownloading(true);
      await downloadInvitationCardAsPng();
      setShareFeedback("High-resolution PNG downloaded successfully!");
      setTimeout(() => setShareFeedback(null), 3000);
    } catch (err) {
      console.error("Failed to download PNG:", err);
      setShareFeedback("PNG generation failed. Try print/PDF.");
      setTimeout(() => setShareFeedback(null), 3000);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintPdf = async () => {
    try {
      setShareFeedback("Preparing print-ready invitation PDF...");
      await printOfficialInvitation();
      setTimeout(() => setShareFeedback(null), 3000);
    } catch {
      window.print();
    }
  };

  const handleShare = async () => {
    const res = await shareOrCopyInvitationUrl();
    setShareFeedback(res.message);
    setTimeout(() => setShareFeedback(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Studio Action Toolbar */}
      <div className="no-print bg-white/90 backdrop-blur-md border border-[rgba(184,151,94,0.3)] rounded-xl p-3.5 sm:p-5 shadow-sm max-w-4xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Status Indicator: Restored Design Edition A */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FDF9F3] border border-[#B8975E]/30">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" aria-hidden="true" />
          <span className="text-xs font-semibold text-[#292322] uppercase tracking-wider">
            Official Invitation
          </span>
          <span className="text-[11px] text-[#8A8280]">
            (Modern Luxury Editorial)
          </span>
        </div>

        {/* Action Controls */}
        <div className="w-full md:w-auto grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {/* Add to Calendar Dropdown */}
          <CalendarDropdown />

          {/* Download High-Resolution PNG */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-xs font-semibold uppercase tracking-wider text-white bg-[#292322] hover:bg-[#A52232] rounded transition-colors shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-50"
            title="Download high-resolution official PNG invitation"
          >
            <svg
              className="w-3.5 h-3.5 text-[#B8975E]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>{downloading ? "Preparing..." : "Download PNG"}</span>
          </button>

          {/* Print / Save PDF Button */}
          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-xs font-semibold uppercase tracking-wider text-[#292322] bg-white border border-[#292322]/20 hover:border-[#292322] rounded transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
            title="Print or export PDF preserving original card aspect ratio"
          >
            <svg
              className="w-3.5 h-3.5 text-[#5C5452]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span>Print PDF</span>
          </button>

          {/* Share Link Button */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-xs font-semibold uppercase tracking-wider text-[#292322] hover:text-[#A52232] bg-white border border-[#B8975E]/30 rounded transition-colors active:scale-[0.98] cursor-pointer"
            title="Share or copy common public invitation link"
          >
            <svg
              className="w-3.5 h-3.5 text-[#B8975E]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span>Share Link</span>
          </button>
        </div>
      </div>

      {/* Share Feedback Toast */}
      {shareFeedback && (
        <div
          role="status"
          className="no-print max-w-sm mx-auto text-center p-2 rounded bg-[#292322] text-[#FFFDF9] text-xs shadow-lg animate-in fade-in duration-150"
        >
          {shareFeedback}
        </div>
      )}

      {/* Official Invitation Card Live Vector Presentation */}
      <div className="max-w-2xl lg:max-w-[750px] mx-auto pb-16 sm:pb-12">
        <OfficialWeddingInvitation
          variant="full"
          headlineText={initialSettings?.headline_text}
          introText={initialSettings?.intro_text}
        />
      </div>
    </div>
  );
}
