"use client";

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { WEDDING_DATA, Ceremony } from "@/data/wedding-data";
import { MagneticButton } from "@/components/interactive";
import { useMotionReduced, MOTION_EASINGS } from "@/lib/motion";
import {
  generateCeremonyIcs,
  generateAllCeremoniesIcs,
  generateGoogleCalendarUrl,
  triggerCalendarDownload,
} from "@/lib/calendar";
import {
  CANONICAL_PUBLIC_INVITATION_URL,
  downloadInvitationCardAsJpg,
  downloadInvitationCardAsPdf,
  shareOrCopyInvitationUrl,
} from "@/lib/invitation-export";
import { useToast } from "@/components/ui/toast";

interface InvitationActionButtonsProps {
  variant?: "full" | "preview";
  className?: string;
}

export function InvitationActionButtons({
  variant = "preview",
  className = "",
}: InvitationActionButtonsProps) {
  // Silence unused variant prop for interface compatibility
  void variant;

  const shouldReduceMotion = useMotionReduced();
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];
  const { toast } = useToast();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Modal active states: "calendar" | "download" | "share" | null
  const [activeModal, setActiveModal] = useState<"calendar" | "download" | "share" | null>(null);
  const [downloadFormatLoading, setDownloadFormatLoading] = useState<"pdf" | "jpg" | "png" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // References to restore focus when a modal closes
  const triggerCalendarRef = useRef<HTMLButtonElement>(null);
  const triggerDownloadRef = useRef<HTMLButtonElement>(null);
  const triggerShareRef = useRef<HTMLButtonElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Close active modal helper
  const closeModal = useCallback(() => {
    const prevModal = activeModal;
    setActiveModal(null);
    setCopiedLink(false);

    // Return focus to triggering button
    setTimeout(() => {
      if (prevModal === "calendar") triggerCalendarRef.current?.focus();
      else if (prevModal === "download") triggerDownloadRef.current?.focus();
      else if (prevModal === "share") triggerShareRef.current?.focus();
    }, 50);
  }, [activeModal]);

  // Lock body scroll and attach Escape key handler while any modal is open
  useEffect(() => {
    if (!activeModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Focus inside modal container
    const focusTimer = setTimeout(() => {
      if (modalContainerRef.current) {
        const focusable = modalContainerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0]?.focus();
        }
      }
    }, 60);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [activeModal, closeModal]);

  // Temporary feedback toast helper
  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------

  // 1. Calendar handlers
  const handleDownloadAllIcs = () => {
    try {
      const ics = generateAllCeremoniesIcs(WEDDING_DATA.ceremonies);
      triggerCalendarDownload("mithun-sakhi-wedding-all-ceremonies.ics", ics);
      showFeedback("All 4 ceremonies calendar (.ics) downloaded!");
      toast.success("Calendar Schedule Saved", "All 4 wedding ceremony dates added to your calendar bundle.");
      closeModal();
    } catch (err) {
      console.error("Failed to download calendar bundle:", err);
      showFeedback("Calendar generation failed. Please try single events.");
      toast.error("Calendar Download Failed", "Please try downloading individual ceremony links.");
    }
  };

  const handleDownloadSingleIcs = (ceremony: Ceremony) => {
    try {
      const ics = generateCeremonyIcs(ceremony);
      triggerCalendarDownload(`mithun-sakhi-${ceremony.id}-ceremony.ics`, ics);
      showFeedback(`${ceremony.name} calendar event downloaded!`);
      toast.success(`${ceremony.name} Calendar Saved`, "Ceremony date and venue details added to your calendar.");
    } catch (err) {
      console.error("Failed to download single ceremony ics:", err);
      toast.error("Calendar Download Issue", "Unable to download this ceremony calendar event.");
    }
  };

  // 2. Download handlers
  const handleDownloadPdf = async () => {
    try {
      setDownloadFormatLoading("pdf");
      showFeedback("Generating print-ready PDF invitation...");
      await downloadInvitationCardAsPdf();
      showFeedback("High-resolution invitation PDF downloaded!");
      toast.success("PDF Decree Downloaded", "High-resolution wedding invitation decree saved successfully.");
      closeModal();
    } catch (err) {
      console.error("Failed to generate PDF invitation:", err);
      showFeedback("PDF generation encountered an issue. Please try JPG.");
      toast.error("PDF Export Issue", "Unable to generate PDF decree. Please try JPG export.");
    } finally {
      setDownloadFormatLoading(null);
    }
  };

  const handleDownloadJpg = async () => {
    try {
      setDownloadFormatLoading("jpg");
      showFeedback("Rendering high-quality JPG invitation...");
      await downloadInvitationCardAsJpg();
      showFeedback("High-quality invitation JPG downloaded!");
      toast.success("JPG Decree Downloaded", "High-quality invitation image decree saved successfully.");
      closeModal();
    } catch (err) {
      console.error("Failed to generate JPG invitation:", err);
      showFeedback("JPG generation encountered an issue. Please try PDF.");
      toast.error("JPG Export Issue", "Unable to render invitation image. Please try PDF.");
    } finally {
      setDownloadFormatLoading(null);
    }
  };

  // 3. Share handlers
  const handleShareClick = async () => {
    // If native sharing is supported, invoke it directly
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        const res = await shareOrCopyInvitationUrl(CANONICAL_PUBLIC_INVITATION_URL);
        if (res.success) {
          showFeedback(res.message);
          toast.success("Shared Successfully", res.message);
        }
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          // User closed the native share sheet - no action needed
          return;
        }
      }
    }

    // Fallback: open elegant in-page share dialog
    setActiveModal("share");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(CANONICAL_PUBLIC_INVITATION_URL);
      setCopiedLink(true);
      showFeedback("Invitation link copied!");
      toast.success("Link Copied to Clipboard", "Shareable wedding invitation link is ready to paste.");
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      showFeedback(`Public Link: ${CANONICAL_PUBLIC_INVITATION_URL}`);
      toast.info("Invitation Link", CANONICAL_PUBLIC_INVITATION_URL);
    }
  };

  // Construct WhatsApp sharing URL
  const whatsAppShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `We warmly invite you to celebrate the wedding festivities of Mithun & Sakhi, from 19–22 November 2026 in Purulia, West Bengal.\n\nView Official Invitation Decree:\n${CANONICAL_PUBLIC_INVITATION_URL}`
  )}`;

  return (
    <div id="official-invitation-actions" className={`relative space-y-4 ${className}`}>
      {/* ==================================================================== */}
      {/* Accessible Feedback Toast                                            */}
      {/* ==================================================================== */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="no-print mx-auto max-w-sm rounded-full bg-[#4A0A10] border border-[#D4AF37]/80 px-4 py-2 text-center text-xs font-serif text-[#FFFDF8] shadow-[0_8px_20px_rgba(74,10,16,0.3)] animate-in fade-in zoom-in-95 duration-200"
        >
          {feedback}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4 SIGNATURE ACTION BUTTONS                                           */}
      {/* Coordinated with approved Venues Signature Button design language    */}
      {/* ==================================================================== */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 max-w-4xl mx-auto">
        {/* ------------------------------------------------------------------ */}
        {/* 1. ADD TO CALENDAR BUTTON                                          */}
        {/* ------------------------------------------------------------------ */}
        <MagneticButton className="w-full xs:w-[calc(50%-0.4rem)] sm:w-auto">
          <button
            ref={triggerCalendarRef}
            type="button"
            onClick={() => setActiveModal("calendar")}
            aria-haspopup="dialog"
            aria-expanded={activeModal === "calendar"}
            className="group w-full sm:w-auto h-[46px] sm:h-[48px] rounded-full px-4 sm:px-6
              bg-gradient-to-r from-[#9E722C] via-[#B88738] to-[#8E6322] hover:from-[#AD7E32] hover:via-[#C5923F] hover:to-[#9E722C]
              text-white border border-[#FFE396]/60
              shadow-[0_8px_24px_rgba(158,114,44,0.32),inset_0_1px_0_rgba(255,255,255,0.35)]
              hover:shadow-[0_12px_28px_rgba(158,114,44,0.45),0_0_20px_rgba(255,227,150,0.25)]
              flex items-center justify-center gap-2 text-xs sm:text-[12.5px] font-sans font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em]
              transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E] focus-visible:ring-offset-2 cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-[#FFFDF8] shrink-0 group-hover:scale-110 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Add to Calendar</span>
          </button>
        </MagneticButton>

        {/* ------------------------------------------------------------------ */}
        {/* 2. DOWNLOAD INVITATION BUTTON                                      */}
        {/* ------------------------------------------------------------------ */}
        <MagneticButton className="w-full xs:w-[calc(50%-0.4rem)] sm:w-auto">
          <button
            ref={triggerDownloadRef}
            type="button"
            onClick={() => setActiveModal("download")}
            aria-haspopup="dialog"
            aria-expanded={activeModal === "download"}
            className="group w-full sm:w-auto h-[46px] sm:h-[48px] rounded-full px-4 sm:px-6
              bg-gradient-to-r from-[#FFFDF9] via-[#FAF4E6] to-[#F5EEDC] hover:from-[#FFFFFF] hover:via-[#FDF9F0] hover:to-[#FAF4E6]
              text-[#6A1220] border border-[#B8975E]/75 hover:border-[#8E6322]
              shadow-[0_6px_20px_rgba(184,151,94,0.18),inset_0_1px_0_rgba(255,255,255,0.85)]
              hover:shadow-[0_10px_24px_rgba(184,151,94,0.30)]
              flex items-center justify-center gap-2 text-xs sm:text-[12.5px] font-sans font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em]
              transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E] focus-visible:ring-offset-2 cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-[#8E6322] shrink-0 group-hover:translate-y-0.5 transition-transform duration-300"
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
            <span>Download Invitation</span>
          </button>
        </MagneticButton>

        {/* ------------------------------------------------------------------ */}
        {/* 3. SHARE INVITATION BUTTON                                         */}
        {/* ------------------------------------------------------------------ */}
        <MagneticButton className="w-full xs:w-[calc(50%-0.4rem)] sm:w-auto">
          <button
            ref={triggerShareRef}
            type="button"
            onClick={handleShareClick}
            aria-haspopup="dialog"
            aria-expanded={activeModal === "share"}
            className="group w-full sm:w-auto h-[46px] sm:h-[48px] rounded-full px-4 sm:px-6
              bg-gradient-to-r from-[#FFFDF9] via-[#FAF4E6] to-[#F5EEDC] hover:from-[#FFFFFF] hover:via-[#FDF9F0] hover:to-[#FAF4E6]
              text-[#6A1220] border border-[#B8975E]/75 hover:border-[#8E6322]
              shadow-[0_6px_20px_rgba(184,151,94,0.18),inset_0_1px_0_rgba(255,255,255,0.85)]
              hover:shadow-[0_10px_24px_rgba(184,151,94,0.30)]
              flex items-center justify-center gap-2 text-xs sm:text-[12.5px] font-sans font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em]
              transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E] focus-visible:ring-offset-2 cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-[#8E6322] shrink-0 group-hover:scale-110 transition-transform duration-300"
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
            <span>Share Invitation</span>
          </button>
        </MagneticButton>

        {/* ------------------------------------------------------------------ */}
        {/* 4. CONFIRM RSVP BUTTON                                             */}
        {/* ------------------------------------------------------------------ */}
        <MagneticButton className="w-full xs:w-[calc(50%-0.4rem)] sm:w-auto">
          <Link
            href="/rsvp"
            className="group w-full sm:w-auto h-[46px] sm:h-[48px] rounded-full px-5 sm:px-6
              bg-gradient-to-r from-[#7D1525] via-[#8E1B29] to-[#6A1220] hover:from-[#8E1B29] hover:via-[#9E2030] hover:to-[#7D1525]
              text-white border border-[#E8929E]/45
              shadow-[0_8px_24px_rgba(142,27,41,0.32),inset_0_1px_0_rgba(255,255,255,0.35)]
              hover:shadow-[0_12px_28px_rgba(142,27,41,0.45),0_0_20px_rgba(232,146,158,0.25)]
              flex items-center justify-center gap-2 text-xs sm:text-[12.5px] font-sans font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em]
              transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E1B29] focus-visible:ring-offset-2 cursor-pointer"
          >
            <span>Confirm RSVP</span>
            <span
              className="text-sm font-normal group-hover:translate-x-1.5 transition-transform duration-300"
              aria-hidden="true"
            >
              &rarr;
            </span>
          </Link>
        </MagneticButton>
      </div>

      {/* ==================================================================== */}
      {/* MODAL DIALOGS BACKDROP & OVERLAYS (PORTALED DIRECTLY TO BODY)        */}
      {/* ==================================================================== */}
      {mounted && typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {activeModal && (
                <div
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
                  role="presentation"
                >
                  {/* Backdrop with Blur */}
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    onClick={closeModal}
                    aria-hidden="true"
                    className="fixed inset-0 bg-[#292322]/70 backdrop-blur-md"
                  />

            {/* ---------------------------------------------------------------- */}
            {/* MODAL 1: ADD TO CALENDAR                                         */}
            {/* ---------------------------------------------------------------- */}
            {activeModal === "calendar" && (
              <motion.div
                ref={modalContainerRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="calendar-modal-title"
                initial={
                  shouldReduceMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.96, y: 14 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0, transition: { duration: 0 } }
                    : { opacity: 0, scale: 0.96, y: 10 }
                }
                transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: luxuryEase }}
                className="relative z-10 w-full max-w-lg rounded-2xl bg-[#FFFDF9] border border-[#B8975E]/40 p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(45,15,20,0.35)] text-left my-auto"
              >
                {/* Header with Close Button */}
                <div className="flex items-start justify-between border-b border-[#B8975E]/20 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#B8975E] mb-1">
                      <span>◆</span>
                      <span>Wedding Festivities Calendar</span>
                    </div>
                    <h3
                      id="calendar-modal-title"
                      className="font-serif text-2xl sm:text-3xl font-medium text-[#7D1525] tracking-tight"
                    >
                      Add to Calendar
                    </h3>
                    <p className="font-sans text-xs text-[#5C5452] mt-1">
                      19–22 November 2026 &bull; Purulia, West Bengal &bull; IST (Asia/Kolkata)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close calendar modal"
                    className="p-1.5 rounded-full text-[#8A8280] hover:text-[#7D1525] hover:bg-[#FAF4E6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Bundle Download Option */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleDownloadAllIcs}
                    className="w-full p-3 rounded-xl bg-gradient-to-r from-[#FAF4E6] via-[#F5EEDC] to-[#FAF4E6] hover:from-[#F5EEDC] hover:to-[#EEDFC6] border border-[#B8975E]/40 flex items-center justify-between transition-all group shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-[#9E722C]/15 border border-[#9E722C]/30 flex items-center justify-center text-[#9E722C] shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <div className="text-left">
                        <span className="font-serif font-semibold text-sm sm:text-base text-[#292322] block group-hover:text-[#7D1525] transition-colors">
                          All 4 Ceremonies (.ics Bundle)
                        </span>
                        <span className="text-[11px] text-[#5C5452]">
                          One-click download for Apple Calendar, Outlook &amp; iCal
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#9E722C] group-hover:translate-x-0.5 transition-transform shrink-0">
                      Download &darr;
                    </span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-3">
                  <div className="h-px flex-1 bg-[rgba(184,151,94,0.2)]" />
                  <span className="text-[10px] uppercase font-sans font-bold tracking-[0.18em] text-[#8A8280]">
                    Individual Ceremonies
                  </span>
                  <div className="h-px flex-1 bg-[rgba(184,151,94,0.2)]" />
                </div>

                {/* List of 4 Ceremonies */}
                <div className="space-y-2.5 max-h-[44vh] overflow-y-auto pr-1">
                  {WEDDING_DATA.ceremonies.map((c, index) => {
                    const ceremonyNum = String(index + 1).padStart(2, "0");
                    return (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-white border border-[#B8975E]/20 hover:border-[#B8975E]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-[11px] font-bold text-[#B8975E] tracking-wider">
                              {ceremonyNum}.
                            </span>
                            <span className="font-serif font-semibold text-sm sm:text-base text-[#292322] truncate">
                              {c.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#5C5452] mt-0.5 font-sans">
                            <span className="font-medium text-[#7D1525]">{c.formattedDate}</span>
                            <span className="mx-1.5 text-[#B8975E]">&bull;</span>
                            <span>{c.timeString}</span>
                            <span className="mx-1.5 text-[#B8975E]">&bull;</span>
                            <span className="truncate">{c.venueName}</span>
                          </div>
                        </div>

                        {/* Direct Calendar Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <a
                            href={generateGoogleCalendarUrl(c)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-full bg-[#FAF4E6] hover:bg-[#F5EEDC] border border-[#B8975E]/40 text-[#8E6322] hover:text-[#7D1525] text-[11px] font-sans font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B8975E]"
                            title={`Add ${c.name} to Google Calendar`}
                          >
                            <span>Google</span>
                            <span aria-hidden="true">&nearr;</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDownloadSingleIcs(c)}
                            className="px-2.5 py-1.5 rounded-full bg-white hover:bg-[#FAF4E6] border border-[#B8975E]/30 text-[#5C5452] hover:text-[#292322] text-[11px] font-sans font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B8975E]"
                            title={`Download .ics file for ${c.name}`}
                          >
                            .ics &darr;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Note */}
                <div className="mt-4 pt-3 border-t border-[#B8975E]/15 text-center">
                  <p className="font-serif italic text-xs text-[#8A8280]">
                    * Exact ceremony dates and start times confirmed in Asia/Kolkata timezone.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* MODAL 2: DOWNLOAD FORMAT SELECTION (PDF / JPG)                   */}
            {/* ---------------------------------------------------------------- */}
            {activeModal === "download" && (
              <motion.div
                ref={modalContainerRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="download-modal-title"
                initial={
                  shouldReduceMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.96, y: 14 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0, transition: { duration: 0 } }
                    : { opacity: 0, scale: 0.96, y: 10 }
                }
                transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: luxuryEase }}
                className="relative z-10 w-full max-w-lg rounded-2xl bg-[#FFFDF9] border border-[#B8975E]/40 p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(45,15,20,0.35)] text-left my-auto"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#B8975E]/20 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#B8975E] mb-1">
                      <span>◆</span>
                      <span>Official Invitation Decree</span>
                    </div>
                    <h3
                      id="download-modal-title"
                      className="font-serif text-2xl sm:text-3xl font-medium text-[#7D1525] tracking-tight"
                    >
                      DOWNLOAD YOUR INVITATION
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#5C5452] mt-1">
                      Choose your preferred invitation format.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close download modal"
                    className="p-1.5 rounded-full text-[#8A8280] hover:text-[#7D1525] hover:bg-[#FAF4E6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Format Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                  {/* OPTION 01 — PDF */}
                  <div className="p-4 rounded-xl bg-white border border-[#B8975E]/30 hover:border-[#B8975E] transition-all flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#9E722C]">
                          Option 01 &bull; Document
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF4E6] border border-[#B8975E]/30 text-[10px] font-mono font-semibold text-[#8E6322]">
                          PDF
                        </span>
                      </div>
                      <h4 className="font-serif text-lg font-medium text-[#292322] mb-1">
                        Printable PDF
                      </h4>
                      <p className="text-xs text-[#5C5452] leading-relaxed mb-4">
                        Printable invitation format preserving original 4:5 card proportions. Suitable for printing, physical keepsakes, and document sharing.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={downloadFormatLoading !== null}
                      className="w-full h-10 rounded-full bg-gradient-to-r from-[#9E722C] via-[#B88738] to-[#8E6322] hover:from-[#AD7E32] hover:via-[#C5923F] hover:to-[#9E722C] text-white text-xs font-sans font-bold uppercase tracking-[0.14em] shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>{downloadFormatLoading === "pdf" ? "Preparing PDF..." : "DOWNLOAD PDF"}</span>
                    </button>
                  </div>

                  {/* OPTION 02 — JPG */}
                  <div className="p-4 rounded-xl bg-white border border-[#B8975E]/30 hover:border-[#B8975E] transition-all flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#7D1525]">
                          Option 02 &bull; Image
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF4E6] border border-[#B8975E]/30 text-[10px] font-mono font-semibold text-[#8E6322]">
                          JPG
                        </span>
                      </div>
                      <h4 className="font-serif text-lg font-medium text-[#292322] mb-1">
                        High-Quality JPG
                      </h4>
                      <p className="text-xs text-[#5C5452] leading-relaxed mb-4">
                        High-resolution 2.5x retina image. Preserves original composition and gold artwork. Suitable for WhatsApp, Instagram, and social sharing.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadJpg}
                      disabled={downloadFormatLoading !== null}
                      className="w-full h-10 rounded-full bg-gradient-to-r from-[#7D1525] via-[#8E1B29] to-[#6A1220] hover:from-[#8E1B29] hover:via-[#9E2030] hover:to-[#7D1525] text-white text-xs font-sans font-bold uppercase tracking-[0.14em] shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E1B29]"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>{downloadFormatLoading === "jpg" ? "Preparing JPG..." : "DOWNLOAD JPG"}</span>
                    </button>
                  </div>
                </div>

                {/* Footer Note and Cancel */}
                <div className="border-t border-[#B8975E]/15 pt-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <span className="font-serif italic text-xs text-[#8A8280]">
                    * Captures canonical vector decree directly at 1680 &times; 2100 resolution. No login required.
                  </span>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-xs font-sans font-semibold uppercase tracking-wider text-[#8A8280] hover:text-[#292322] transition-colors px-3 py-1.5 rounded-full"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* MODAL 3: SHARE INVITATION FALLBACK DIALOG                        */}
            {/* ---------------------------------------------------------------- */}
            {activeModal === "share" && (
              <motion.div
                ref={modalContainerRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-modal-title"
                initial={
                  shouldReduceMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.96, y: 14 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0, transition: { duration: 0 } }
                    : { opacity: 0, scale: 0.96, y: 10 }
                }
                transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: luxuryEase }}
                className="relative z-10 w-full max-w-md rounded-2xl bg-[#FFFDF9] border border-[#B8975E]/40 p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(45,15,20,0.35)] text-left my-auto"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#B8975E]/20 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#B8975E] mb-1">
                      <span>◆</span>
                      <span>Wedding Invitation</span>
                    </div>
                    <h3
                      id="share-modal-title"
                      className="font-serif text-2xl sm:text-3xl font-medium text-[#7D1525] tracking-tight"
                    >
                      Share Invitation
                    </h3>
                    <p className="font-sans text-xs text-[#5C5452] mt-1">
                      Share the sacred celebration decree with family &amp; friends.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close share modal"
                    className="p-1.5 rounded-full text-[#8A8280] hover:text-[#7D1525] hover:bg-[#FAF4E6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Share Options */}
                <div className="space-y-3 mb-5">
                  {/* 1. Share on WhatsApp */}
                  <a
                    href={whatsAppShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3.5 rounded-xl bg-gradient-to-r from-[#25D366]/10 to-[#128C7E]/10 hover:from-[#25D366]/20 hover:to-[#128C7E]/20 border border-[#25D366]/40 flex items-center justify-between transition-all group shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                        </svg>
                      </span>
                      <div className="text-left">
                        <span className="font-serif font-semibold text-sm sm:text-base text-[#128C7E] block">
                          Share on WhatsApp
                        </span>
                        <span className="text-[11px] text-[#5C5452]">
                          Send invitation decree directly to contacts &amp; groups
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-[#128C7E] group-hover:translate-x-1 transition-transform shrink-0" aria-hidden="true">
                      &rarr;
                    </span>
                  </a>

                  {/* 2. Copy Invitation Link */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full p-3.5 rounded-xl bg-white hover:bg-[#FAF4E6] border border-[#B8975E]/30 flex items-center justify-between transition-all group shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-[#FAF4E6] border border-[#B8975E]/40 text-[#8E6322] flex items-center justify-center shrink-0 shadow-xs">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </span>
                      <div className="text-left">
                        <span className="font-serif font-semibold text-sm sm:text-base text-[#292322] block group-hover:text-[#7D1525] transition-colors">
                          {copiedLink ? "Link Copied!" : "Copy Invitation Link"}
                        </span>
                        <span className="text-[11px] text-[#5C5452] font-mono truncate max-w-[200px] sm:max-w-xs block">
                          {CANONICAL_PUBLIC_INVITATION_URL}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#9E722C] group-hover:translate-x-0.5 transition-transform shrink-0">
                      {copiedLink ? "Copied ✓" : "Copy"}
                    </span>
                  </button>
                </div>

                {/* Footer and Close */}
                <div className="border-t border-[#B8975E]/15 pt-3.5 flex items-center justify-between">
                  <span className="font-serif italic text-xs text-[#8A8280]">
                    * Public link accessible to all wedding guests.
                  </span>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-xs font-sans font-semibold uppercase tracking-wider text-[#8A8280] hover:text-[#292322] transition-colors px-3 py-1.5 rounded-full"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>,
      document.body
    )
  : null}
    </div>
  );
}
