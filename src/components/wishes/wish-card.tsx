"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useMotionReduced } from "@/lib/motion";
import { CardCornerBrackets } from "@/components/ui/decorative-surfaces";
import type { ApprovedWish } from "@/components/sections/wishes-preview-wall";

interface WishCardProps {
  wish: ApprovedWish;
  variant?: "marquee" | "grid";
  accent?: boolean;
}

const emptySubscribe = () => () => {};

export const WishCard = React.memo(function WishCard({
  wish,
  variant = "marquee",
  accent = false,
}: WishCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const shouldReduceMotion = useMotionReduced();

  const isLong = wish.wish_text.length > 140;

  // Format date safely
  const formattedDate = wish.created_at
    ? new Date(wish.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  // Initials for avatar
  const initials = wish.author_display_name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("");

  // Lock scroll for detail modal
  useEffect(() => {
    if (!isDetailOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsDetailOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, [isDetailOpen]);

  const cardWidthClass =
    variant === "marquee"
      ? "w-[310px] sm:w-[350px] md:w-[370px] shrink-0"
      : "w-full";

  return (
    <>
      <article
        tabIndex={0}
        role="article"
        aria-label={`Blessing from ${wish.author_display_name}`}
        onClick={() => {
          if (isLong) setIsDetailOpen(true);
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && isLong) {
            e.preventDefault();
            setIsDetailOpen(true);
          }
        }}
        style={{ contain: "paint", transform: "translateZ(0)" }}
        className={`group relative ${cardWidthClass} h-[210px] sm:h-[220px] rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 select-none overflow-hidden ${
          isLong ? "cursor-pointer" : "cursor-default"
        } ${
          accent
            ? "bg-gradient-to-b from-[#FFFDF9] via-[#FAF3F4] to-[#F7EBEF] border border-[#8E1B29]/30 shadow-[0_8px_24px_rgba(142,27,41,0.06)] hover:border-[#8E1B29]/55 hover:shadow-[0_12px_32px_rgba(142,27,41,0.12)]"
            : "bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC]/90 to-[#F6EFE3]/80 border border-[#B8975E]/30 shadow-[0_8px_24px_rgba(184,151,94,0.06)] hover:border-[#B8975E]/60 hover:shadow-[0_12px_32px_rgba(184,151,94,0.12)]"
        }`}
      >
        {/* Corner Brackets */}
        <CardCornerBrackets
          color={accent ? "#8E1B29" : "#B8975E"}
          size={12}
        />

        {/* Botanical watermark */}
        <svg
          className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-15 select-none overflow-visible"
          viewBox="0 0 100 100"
          fill="none"
          stroke={accent ? "#8E1B29" : "#B8975E"}
          strokeWidth="0.75"
          aria-hidden="true"
        >
          <circle cx="100" cy="0" r="75" strokeDasharray="2 3" strokeWidth="0.5" />
          <circle cx="100" cy="0" r="55" strokeWidth="0.5" />
          <circle cx="100" cy="0" r="35" strokeDasharray="1 2" strokeWidth="0.5" />
          <circle cx="100" cy="0" r="18" strokeWidth="0.5" />
          <path d="M 100 0 C 85 20 65 30 50 25 C 45 23 42 20 40 15 C 38 10 38 5 40 0" />
          <path d="M 100 0 C 80 15 70 35 75 50 C 77 55 80 58 85 60 C 90 62 95 62 100 60" />
        </svg>

        {/* Top: Quote Glyph & Date */}
        <div className="flex items-center justify-between">
          <div
            className={`font-serif text-3xl sm:text-4xl leading-none select-none ${
              accent ? "text-[#A52232]/75" : "text-[#B8975E]/80"
            }`}
            aria-hidden="true"
          >
            &ldquo;
          </div>
          {formattedDate && (
            <span className="font-sans text-[10.5px] sm:text-[11px] lg:text-[10px] tracking-wider uppercase text-[#8A8280]">
              {formattedDate}
            </span>
          )}
        </div>

        {/* Middle: Blessing Text (Line clamped for strict uniform card dimensions) */}
        <div className="my-auto relative z-10">
          <p className="font-serif italic text-[14px] sm:text-[15.5px] leading-[1.65] text-[#181312] line-clamp-3 sm:line-clamp-4">
            {wish.wish_text}
          </p>
          {isLong && (
            <span className="inline-block mt-1 text-[11.5px] sm:text-xs lg:text-[11px] font-sans font-medium text-[#7B1D28] group-hover:underline">
              Read more &rarr;
            </span>
          )}
        </div>

        {/* Bottom: Author Display */}
        <div className="flex items-center pt-2.5 border-t border-[rgba(184,151,94,0.18)] mt-2">
          {/* Avatar / Monogram */}
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 font-sans font-semibold text-[11px] sm:text-xs shadow-xs ${
              accent
                ? "bg-[#FDF2F4] border border-[#A52232]/35 text-[#A52232]"
                : "bg-[#F7F1E6] border border-[#B8975E]/40 text-[#8E6D38]"
            }`}
          >
            {initials || "♥"}
          </div>

          {/* Author Name */}
          <span className="font-sans font-semibold text-[12.5px] sm:text-[13px] lg:text-xs text-[#292322] tracking-wide ml-2.5 truncate">
            {wish.author_display_name}
          </span>

          {/* Symmetrical Trailing Line */}
          <div
            className={`flex-1 h-[1px] ml-3 ${
              accent
                ? "bg-gradient-to-r from-[#A52232]/30 to-transparent"
                : "bg-gradient-to-r from-[#B8975E]/30 to-transparent"
            }`}
          />
        </div>
      </article>

      {/* DETAIL DIALOG MODAL (When card is expanded) */}
      {mounted &&
        isDetailOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            <div
              className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
              role="presentation"
            >
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
                  onClick={() => setIsDetailOpen(false)}
                  aria-hidden="true"
                  className="fixed inset-0 bg-[#292322]/70 backdrop-blur-md"
                />

                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={`wish-dialog-title-${wish.id}`}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.95, y: 16 }
                  }
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.95, y: 12 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.25,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative z-10 w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC] to-[#F5ECE0] border border-[#B8975E]/40 p-6 sm:p-8 shadow-[0_24px_64px_rgba(41,35,34,0.35)] overflow-hidden"
                >
                  <CardCornerBrackets color="#B8975E" size={16} />

                  <button
                    type="button"
                    onClick={() => setIsDetailOpen(false)}
                    aria-label="Close message"
                    className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/80 border border-[#B8975E]/30 flex items-center justify-center text-[#292322] hover:bg-white hover:text-[#7B1D28] transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-2 mb-3 select-none">
                    <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
                    <span className="font-sans text-[11px] font-semibold tracking-[0.2em] text-[#A67C1E] uppercase">
                      HEARTFELT BLESSINGS
                    </span>
                    <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
                  </div>

                  <div
                    className="font-serif text-4xl text-[#B8975E]/70 select-none -mb-2"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </div>

                  <p className="font-serif italic text-base sm:text-lg leading-relaxed text-[#181312] max-h-[50vh] overflow-y-auto pr-2">
                    {wish.wish_text}
                  </p>

                  <div className="flex items-center justify-between pt-5 mt-5 border-t border-[rgba(184,151,94,0.25)]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#F7F1E6] border border-[#B8975E]/40 text-[#8E6D38] flex items-center justify-center font-sans font-semibold text-xs">
                        {initials || "♥"}
                      </div>
                      <div>
                        <div
                          id={`wish-dialog-title-${wish.id}`}
                          className="font-sans font-semibold text-sm text-[#292322]"
                        >
                          {wish.author_display_name}
                        </div>
                        {formattedDate && (
                          <div className="font-sans text-[11px] text-[#8A8280]">
                            {formattedDate}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDetailOpen(false)}
                      className="px-5 py-2 rounded-full border border-[#B8975E]/35 bg-white/70 hover:bg-white text-xs font-sans font-semibold uppercase tracking-wider text-[#292322] cursor-pointer"
                    >
                      CLOSE
                    </button>
                  </div>
                </motion.div>
              </div>
            </AnimatePresence>,
            document.body
          )}
      </>
    );
  }
);
