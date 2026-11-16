"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useMotionReduced, MOTION_EASINGS } from "@/lib/motion";
import { useToast } from "@/components/ui/toast";
import {
  CANONICAL_PUBLIC_INVITATION_URL,
  APPROVED_WHATSAPP_INVITATION_MESSAGE,
  downloadInvitationCardAsJpg,
  downloadInvitationCardAsPdf,
} from "@/lib/invitation-export";
import { QrCodeDisplay } from "./qr-code-display";
import { CornerBracket } from "@/components/ui/decorative-surfaces";

export interface InvitationShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  canonicalUrl?: string;
}

export function InvitationShareModal({
  isOpen,
  onClose,
  canonicalUrl = CANONICAL_PUBLIC_INVITATION_URL,
}: InvitationShareModalProps) {
  const shouldReduceMotion = useMotionReduced();
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];
  const { toast } = useToast();

  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState<"jpg" | "pdf" | null>(null);

  const modalContainerRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setCopiedLink(false);
    setShowQrCode(false);
    setDownloadLoading(null);
    onClose();
  }, [onClose]);

  // Lock body scroll and attach Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Focus inside modal
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
  }, [isOpen, handleClose]);

  // 1. WhatsApp share URL using the exact approved invitation message
  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(
    APPROVED_WHATSAPP_INVITATION_MESSAGE
  )}`;

  // 2. Native Share API Handler
  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Mithun & Sakhi — Wedding Celebration",
          text: "With immense joy and the blessings of our families, we cordially invite you to celebrate the wedding festivities of Mithun & Sakhi.",
          url: canonicalUrl,
        });
        toast.success("Shared Successfully", "Invitation link shared with your guests.");
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          // User canceled sharing sheet - no error
          return;
        }
      }
    }

    // Fallback: copy link if native share unavailable or failed
    await handleCopyLink();
  };

  // 3. One-click Copy Link Handler with Fallback
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(canonicalUrl);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = canonicalUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopiedLink(true);
      toast.success("Invitation Link Copied", "Invitation link copied successfully!");
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      toast.info("Invitation Link", canonicalUrl);
    }
  };

  // 4. Download Handlers
  const handleDownloadJpg = async () => {
    try {
      setDownloadLoading("jpg");
      await downloadInvitationCardAsJpg();
      toast.success("JPG Decree Downloaded", "High-quality invitation image saved successfully.");
    } catch (err) {
      console.error("Failed to generate JPG invitation:", err);
      toast.error("Download Error", "Unable to render invitation image. Please try PDF.");
    } finally {
      setDownloadLoading(null);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadLoading("pdf");
      await downloadInvitationCardAsPdf();
      toast.success("PDF Decree Downloaded", "Print-ready wedding invitation decree saved successfully.");
    } catch (err) {
      console.error("Failed to generate PDF invitation:", err);
      toast.error("Download Error", "Unable to generate PDF decree. Please try JPG export.");
    } finally {
      setDownloadLoading(null);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 xs:p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#120307]/80 backdrop-blur-md cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalContainerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            initial={
              shouldReduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.95, y: 16 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : { opacity: 0, scale: 0.95, y: 12 }
            }
            transition={{ duration: shouldReduceMotion ? 0 : 0.32, ease: luxuryEase }}
            className="relative z-10 w-full max-w-[500px] max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC] to-[#F5EEDC] border border-[#B8975E]/50 shadow-[0_25px_70px_rgba(30,5,10,0.5),0_0_35px_rgba(184,151,94,0.18)] overflow-hidden text-left"
          >
            {/* Architectural Corner Brackets */}
            <CornerBracket position="top-left" color="#B8975E" size={14} />
            <CornerBracket position="top-right" color="#B8975E" size={14} />
            <CornerBracket position="bottom-left" color="#B8975E" size={14} />
            <CornerBracket position="bottom-right" color="#B8975E" size={14} />

            {/* Header Lockup */}
            <div className="relative pt-5 sm:pt-6 px-5 sm:px-7 pb-3 sm:pb-4 border-b border-[#B8975E]/20 shrink-0">
              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close share invitation modal"
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 rounded-full border border-[#B8975E]/30 bg-white/70 hover:bg-[#FAF4E6] text-[#7A6B68] hover:text-[#6A1220] flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col items-center text-center">
                {/* M&S Wedding Monogram */}
                <div className="w-9 h-9 rounded-full border border-[#B8975E]/60 bg-gradient-to-br from-white via-[#FAF5EB] to-[#F5EEDC] flex items-center justify-center shadow-xs mb-2">
                  <span className="font-serif text-xs font-semibold text-[#8E6322] tracking-wider">
                    M&bull;S
                  </span>
                </div>

                {/* Eyebrow */}
                <div className="flex items-center justify-center gap-1.5 text-[9.5px] xs:text-[10px] font-sans font-bold uppercase tracking-[0.22em] text-[#8E6322] mb-1 select-none">
                  <span className="text-[7px]">◆</span>
                  <span>Royal Wedding Invitation</span>
                  <span className="text-[7px]">◆</span>
                </div>

                {/* Modal Heading */}
                <h2
                  id="share-modal-title"
                  className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#48070F] uppercase leading-tight"
                >
                  Share the Joy of Our Celebration
                </h2>

                {/* Supporting Message */}
                <p className="font-serif italic text-xs sm:text-[13px] text-[#5C5452] mt-1 max-w-sm leading-relaxed">
                  Let your loved ones be a part of our beautiful beginning.
                </p>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4">
              {/* Compact Visual Preview of the Official Wedding Invitation */}
              <div
                className="relative rounded-xl border border-[#B8975E]/40 bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F7F1E4] p-3 sm:p-3.5 shadow-xs overflow-hidden select-none"
                aria-label="Invitation Card Preview"
              >
                {/* Mini Top Velvet Corner Drape Accent */}
                <div
                  className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-40 z-0 bg-no-repeat bg-contain"
                  style={{ backgroundImage: "url('/images/corner-drape-top-left.webp')" }}
                  aria-hidden="true"
                />

                <div className="relative z-10 flex items-center gap-3">
                  {/* Left Mini Seal */}
                  <div className="w-12 h-14 sm:w-14 sm:h-16 shrink-0 rounded-lg border border-[#B8975E]/50 bg-white/90 flex flex-col items-center justify-center shadow-2xs p-1 text-center">
                    <span className="text-[8px] font-sans font-bold tracking-widest text-[#B8975E] uppercase leading-none mb-0.5">
                      INVITE
                    </span>
                    <span className="font-serif text-sm sm:text-base font-bold text-[#6A1220] leading-none">
                      M&bull;S
                    </span>
                    <span className="text-[7.5px] font-sans font-semibold text-[#8E6322] leading-none mt-1">
                      2026
                    </span>
                  </div>

                  {/* Center Text Details */}
                  <div className="flex-1 min-w-0 text-left">
                    <span className="block text-[8.5px] sm:text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#8E6322] truncate">
                      With the Divine Blessings of Our Families
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-normal text-[#48070F] tracking-tight leading-tight truncate">
                      Mithun &amp; Sakhi
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-sans text-[#5C5452] mt-0.5">
                      <span className="font-semibold text-[#6A1220]">19–22 Nov 2026</span>
                      <span>&bull;</span>
                      <span className="truncate">Purulia, West Bengal</span>
                    </div>

                    {/* 4 Miniature Ceremony Badges */}
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      <span className="px-1.5 py-0.5 rounded-[4px] bg-[#E5A93C]/15 border border-[#E5A93C]/40 text-[#8E5D0E] text-[8.5px] font-sans font-bold">
                        Haldi
                      </span>
                      <span className="px-1.5 py-0.5 rounded-[4px] bg-[#2B5E3F]/15 border border-[#2B5E3F]/40 text-[#1E4E34] text-[8.5px] font-sans font-bold">
                        Mehndi
                      </span>
                      <span className="px-1.5 py-0.5 rounded-[4px] bg-[#8E1B29]/15 border border-[#8E1B29]/40 text-[#8E1B29] text-[8.5px] font-sans font-bold">
                        Wedding
                      </span>
                      <span className="px-1.5 py-0.5 rounded-[4px] bg-[#6A2234]/15 border border-[#6A2234]/40 text-[#541A25] text-[8.5px] font-sans font-bold">
                        Reception
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRIMARY ACTION: SHARE ON WHATSAPP */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#25D366] via-[#20BA5A] to-[#128C7E] hover:from-[#20BA5A] hover:to-[#0F7A6E] text-white shadow-[0_8px_20px_rgba(37,211,102,0.28)] hover:shadow-[0_12px_26px_rgba(37,211,102,0.36)] flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="font-serif font-bold text-base sm:text-lg block tracking-wide text-white drop-shadow-xs">
                      Share on WhatsApp
                    </span>
                    <span className="text-[11px] sm:text-xs text-white/90 block leading-tight">
                      Send official invitation decree to family &amp; friends
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-bold text-white">&rarr;</span>
                </div>
              </a>

              {/* SECONDARY ACTIONS: GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Action B: Share via... (Native Web Share API) */}
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="p-3 rounded-xl bg-white/90 hover:bg-white border border-[#B8975E]/35 hover:border-[#8E6322] flex items-center gap-3 transition-all duration-200 hover:shadow-xs cursor-pointer text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FAF5EC] border border-[#B8975E]/40 text-[#8E6322] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-serif font-semibold text-xs sm:text-sm text-[#292322] block truncate">
                      Share via...
                    </span>
                    <span className="text-[10.5px] text-[#7A6B68] block leading-tight">
                      System apps &amp; options
                    </span>
                  </div>
                </button>

                {/* Action C: Copy Invitation Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-3 rounded-xl bg-white/90 hover:bg-white border border-[#B8975E]/35 hover:border-[#8E6322] flex items-center gap-3 transition-all duration-200 hover:shadow-xs cursor-pointer text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FAF5EC] border border-[#B8975E]/40 text-[#8E6322] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {copiedLink ? (
                      <svg className="w-4 h-4 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-serif font-semibold text-xs sm:text-sm text-[#292322] block truncate">
                      {copiedLink ? "Link Copied! ✓" : "Copy Invitation Link"}
                    </span>
                    <span className="text-[10.5px] text-[#7A6B68] block leading-tight truncate">
                      {canonicalUrl}
                    </span>
                  </div>
                </button>
              </div>

              {/* ACTION D: DOWNLOAD DECREE (JPG & PDF) */}
              <div className="p-3 sm:p-3.5 rounded-xl border border-[#B8975E]/30 bg-white/70">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-[#8E6322]">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span>Download Invitation Decree</span>
                  </div>
                  <span className="text-[9.5px] font-sans text-[#7A6B68]">
                    Official High-Res Cards
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadJpg}
                    disabled={downloadLoading !== null}
                    className="h-9 px-3 rounded-lg border border-[#B8975E]/40 bg-gradient-to-r from-[#FFFDF9] to-[#FAF5EC] hover:bg-white text-[#48070F] text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {downloadLoading === "jpg" ? (
                      <span className="w-3 h-3 border-2 border-[#8E6322] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5 text-[#8E6322]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    <span>Download JPG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={downloadLoading !== null}
                    className="h-9 px-3 rounded-lg border border-[#B8975E]/40 bg-gradient-to-r from-[#FFFDF9] to-[#FAF5EC] hover:bg-white text-[#48070F] text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {downloadLoading === "pdf" ? (
                      <span className="w-3 h-3 border-2 border-[#8E6322] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5 text-[#8E6322]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* ACTION E: SHOW INVITATION QR CODE (ACCORDION/EXPANDER) */}
              <div className="rounded-xl border border-[#B8975E]/30 bg-white/70 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowQrCode((prev) => !prev)}
                  aria-expanded={showQrCode}
                  className="w-full p-3 flex items-center justify-between text-left cursor-pointer hover:bg-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#FAF5EC] border border-[#B8975E]/40 text-[#8E6322] flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </span>
                    <span className="font-serif font-semibold text-xs sm:text-sm text-[#292322]">
                      Show Invitation QR Code
                    </span>
                  </div>

                  <span className="text-xs font-sans text-[#8E6322] font-semibold flex items-center gap-1">
                    {showQrCode ? "Hide QR ▲" : "View QR ▼"}
                  </span>
                </button>

                <AnimatePresence>
                  {showQrCode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                      className="px-4 pb-4 pt-1 flex flex-col items-center justify-center border-t border-[#B8975E]/20"
                    >
                      <div className="my-2 p-2.5 bg-white rounded-xl border border-[#B8975E]/40 shadow-xs flex flex-col items-center">
                        <QrCodeDisplay
                          url={canonicalUrl}
                          size={135}
                          label="SCAN TO EXPLORE THE WEDDING"
                          labelClassName="text-[9.5px] font-sans font-bold uppercase tracking-[0.16em] text-[#8E6322] mt-2 block"
                        />
                      </div>
                      <p className="font-serif italic text-xs text-[#5C5452] text-center mt-1">
                        Guests can scan this code using any phone camera to view the celebration portal.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#B8975E]/20 bg-[#FAF6EE]/90 flex items-center justify-between text-xs text-[#7A6B68] shrink-0">
              <span className="font-serif italic truncate max-w-[280px]">
                Official Decree &bull; Mithun &amp; Sakhi Wedding
              </span>

              <button
                type="button"
                onClick={handleClose}
                className="font-sans font-semibold uppercase tracking-wider text-[#8E6322] hover:text-[#48070F] transition-colors px-2 py-1 rounded"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
