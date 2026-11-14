"use client";

import React, { useState, useRef, useEffect, useCallback, useTransition, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useMotionReduced } from "@/lib/motion";
import { CardCornerBrackets } from "@/components/ui/decorative-surfaces";
import { submitPublicWishAction } from "@/actions/wishes";
import { useToast } from "@/components/ui/toast";

interface WishSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const emptySubscribe = () => () => {};

interface WishSubmissionModalDialogProps {
  onClose: () => void;
  onSuccess?: () => void;
  shouldReduceMotion: boolean;
}

function WishSubmissionModalDialog({
  onClose,
  onSuccess,
  shouldReduceMotion,
}: WishSubmissionModalDialogProps) {
  const { toast } = useToast();
  const [authorName, setAuthorName] = useState("");
  const [wishText, setWishText] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const modalRef = useRef<HTMLDivElement>(null);
  const initialInputRef = useRef<HTMLInputElement>(null);

  // Body scroll lock & Escape listener
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Auto-focus first input after animation
    const focusTimer = setTimeout(() => {
      if (initialInputRef.current) {
        initialInputRef.current.focus();
      }
    }, 120);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [onClose]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);

      const trimmedName = authorName.trim();
      const trimmedText = wishText.trim();

      if (trimmedName.length < 2 || trimmedName.length > 80) {
        const msg = "Please enter your name (2–80 characters).";
        setErrorMessage(msg);
        toast.error("Name Required", msg);
        return;
      }

      if (trimmedText.length < 3 || trimmedText.length > 1000) {
        const msg = "Please share a blessing between 3 and 1000 characters.";
        setErrorMessage(msg);
        toast.error("Blessing Message Required", msg);
        return;
      }

      startTransition(async () => {
        try {
          const res = await submitPublicWishAction({
            authorName: trimmedName,
            wishText: trimmedText,
            honeypot,
          });

          if (!res.success) {
            const errText = res.error || "Unable to send your blessing. Please try again.";
            setErrorMessage(errText);
            toast.error("Blessing Submission Failed", errText);
            return;
          }

          setIsSubmitted(true);
          toast.success(
            "Blessing Received with Gratitude!",
            "Thank you for showering Mithun & Sakhi with your heartfelt love."
          );
          if (onSuccess) {
            onSuccess();
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
          setErrorMessage(msg);
          toast.error("Error Sending Blessing", msg);
        }
      });
    },
    [authorName, wishText, honeypot, onSuccess, toast]
  );

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="presentation"
    >
      {/* Backdrop with Blur */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-[#292322]/75 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wish-modal-title"
        initial={
          shouldReduceMotion
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.96, y: 16 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.96, y: 12 }
        }
        transition={{
          duration: shouldReduceMotion ? 0 : 0.28,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC] to-[#F5ECE0] border border-[#B8975E]/40 p-6 sm:p-8 shadow-[0_24px_64px_rgba(41,35,34,0.35)] overflow-hidden"
      >
        {/* Corner Filigree Brackets */}
        <CardCornerBrackets color="#B8975E" size={16} />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/80 border border-[#B8975E]/30 flex items-center justify-center text-[#292322] hover:bg-white hover:text-[#7B1D28] active:scale-[0.88] md:active:scale-100 transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#B8975E] cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {isSubmitted ? (
          /* ========================================================== */
          /* SUCCESS CONFIRMATION STATE                                */
          /* ========================================================== */
          <div className="text-center py-4 sm:py-6">
            {/* Glowing Sacred Blessing Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#FFFDF9] to-[#F3E7D3] border border-[#B8975E]/50 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(184,151,94,0.35)] ring-4 ring-[#B8975E]/15">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-[#8E1B29]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2 select-none">
              <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
              <span className="font-sans text-[11px] font-semibold tracking-[0.2em] text-[#A67C1E] uppercase">
                BLESSING RECORDED
              </span>
              <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
            </div>

            <h3
              id="wish-modal-title"
              className="font-serif text-2xl sm:text-3xl text-[#292322] font-normal leading-snug tracking-tight mb-2"
            >
              YOUR BLESSING HAS BEEN RECEIVED
            </h3>

            <p className="font-serif italic text-sm sm:text-base text-[#5C5452] max-w-md mx-auto leading-relaxed mb-5">
              Thank you for showering Mithun &amp; Sakhi with your love, prayers, and heartfelt warmth.
            </p>

            {/* Moderation note box */}
            <div className="rounded-xl bg-white/90 border border-[#B8975E]/25 p-4 text-xs sm:text-[13px] text-[#5C5452] font-sans leading-relaxed mb-6">
              <div className="font-semibold text-[#7B1D28] mb-1 flex items-center justify-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Family Reverence Review</span>
              </div>
              To preserve the sacred beauty of the guestbook, your message will be illuminated on the blessings wall shortly upon review by the family.
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#7B1D28] via-[#8C1E2B] to-[#68141F] text-white font-sans text-xs sm:text-[13px] font-semibold tracking-[0.14em] uppercase shadow-md shadow-[#7B1D28]/30 hover:shadow-lg hover:shadow-[#7B1D28]/40 active:scale-[0.976] md:active:scale-100 transition-all duration-150 cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        ) : (
          /* ========================================================== */
          /* SUBMISSION FORM STATE                                      */
          /* ========================================================== */
          <div>
            {/* Header Filigree Eyebrow */}
            <div className="text-center mb-5">
              <div className="flex items-center justify-center gap-2 mb-2 select-none">
                <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
                <span className="font-sans text-[11px] font-semibold tracking-[0.25em] text-[#A67C1E] uppercase">
                  BLESSINGS &middot; SACRED GUESTBOOK
                </span>
                <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
              </div>

              <h3
                id="wish-modal-title"
                className="font-serif text-2xl sm:text-3xl text-[#292322] font-normal tracking-tight"
              >
                LEAVE YOUR BLESSINGS
              </h3>

              <p className="font-serif italic text-xs sm:text-sm text-[#5C5452] mt-1.5 max-w-sm mx-auto leading-relaxed">
                Your heartfelt words will become part of the memories we cherish forever.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-4 rounded-xl bg-[#FDF2F4] border border-[#A52232]/30 p-3 text-xs text-[#8E1B29] font-sans flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 shrink-0 text-[#8E1B29]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot anti-spam (invisible to humans) */}
              <div aria-hidden="true" className="hidden">
                <label htmlFor="wedding_website_verification">Leave blank</label>
                <input
                  id="wedding_website_verification"
                  type="text"
                  name="wedding_website_verification"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Name Field */}
              <div>
                <label
                  htmlFor="guest_author_name"
                  className="block font-sans text-xs font-semibold text-[#292322] tracking-wider uppercase mb-1.5"
                >
                  YOUR NAME <span className="text-[#A52232]">*</span>
                </label>
                <input
                  ref={initialInputRef}
                  id="guest_author_name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  disabled={isPending}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Smt. & Shri Mukherjee, or Ananya Sen"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#B8975E]/30 text-sm font-sans text-[#292322] placeholder:text-[#5C5452]/50 focus:border-[#B8975E] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/30 transition-all disabled:opacity-60"
                />
              </div>

              {/* Blessing Message Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="guest_wish_text"
                    className="block font-sans text-xs font-semibold text-[#292322] tracking-wider uppercase"
                  >
                    YOUR BLESSING <span className="text-[#A52232]">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-sans ${
                      wishText.length > 950
                        ? "text-[#A52232] font-semibold"
                        : "text-[#5C5452]"
                    }`}
                  >
                    {wishText.length} / 1000
                  </span>
                </div>
                <textarea
                  id="guest_wish_text"
                  required
                  minLength={3}
                  maxLength={1000}
                  rows={4}
                  disabled={isPending}
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  placeholder="Write your prayers, blessings, or warmest thoughts for Mithun & Sakhi as they begin their sacred journey together..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#B8975E]/30 text-sm font-serif italic text-[#292322] placeholder:font-serif placeholder:italic placeholder:text-[#5C5452]/50 focus:border-[#B8975E] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/30 transition-all resize-none disabled:opacity-60 leading-relaxed"
                />
              </div>

              {/* Moderation assurance note */}
              <p className="text-[11px] text-[#5C5452] font-sans italic leading-tight">
                * Submissions are reviewed by the family prior to publication to keep the blessings wall sacred and serene.
              </p>

              {/* Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#B8975E]/30 bg-white/60 text-[#292322] font-sans text-xs font-semibold tracking-wider uppercase hover:bg-white active:scale-[0.94] md:active:scale-100 transition-all duration-150 cursor-pointer disabled:opacity-50"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto px-7 py-2.5 rounded-full bg-gradient-to-r from-[#7B1D28] via-[#8C1E2B] to-[#68141F] text-white font-sans text-xs font-semibold tracking-[0.14em] uppercase shadow-md shadow-[#7B1D28]/25 hover:shadow-lg hover:shadow-[#7B1D28]/35 active:scale-[0.976] md:active:scale-100 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <span>SENDING...</span>
                    </>
                  ) : (
                    <>
                      {/* Quill icon */}
                      <svg
                        className="w-3.5 h-3.5 text-white/90"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                      <span>SEND MY BLESSING</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function WishSubmissionModal({
  isOpen,
  onClose,
  onSuccess,
}: WishSubmissionModalProps) {
  const shouldReduceMotion = useMotionReduced();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <WishSubmissionModalDialog
          onClose={onClose}
          onSuccess={onSuccess}
          shouldReduceMotion={shouldReduceMotion}
        />
      )}
    </AnimatePresence>,
    document.body
  );
}
