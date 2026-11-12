"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { AnimatedDivider } from "@/components/motion/animated-divider";
import { WishCard } from "@/components/wishes/wish-card";
import { WishSubmissionModal } from "@/components/wishes/wish-submission-modal";
import { MagneticButton } from "@/components/interactive";
import { getPublicWishes } from "@/data/sample-wishes";
import type { ApprovedWish } from "@/components/sections/wishes-preview-wall";

interface WishesViewProps {
  initialWishes: ApprovedWish[];
}

export function WishesView({ initialWishes }: WishesViewProps) {
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);

  const { wishes, isDemoSample } = useMemo(
    () => getPublicWishes(initialWishes),
    [initialWishes]
  );

  const hasWishes = wishes.length > 0;

  return (
    <>
      <Container size="wide" className="relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2 mb-2.5 select-none">
            <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
            <span className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A67C1E] uppercase">
              BLESSINGS &middot; SACRED GUESTBOOK
            </span>
            <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-normal tracking-tight text-[#292322] leading-tight">
            <span>Guest </span>
            <span className="text-[#A67C1E] font-normal">Blessings &amp; Wishes</span>
          </h1>

          <p className="font-serif italic text-sm sm:text-base md:text-[17px] text-[#5C5452] max-w-2xl mx-auto mt-3.5 leading-relaxed">
            Heartfelt prayers, blessings, and warm congratulations bestowed upon Mithun &amp; Sakhi by family, elders, and cherished friends.
          </p>

          <div className="flex justify-center mt-4">
            <AnimatedDivider variant="gold" size="sm" />
          </div>

          {/* Action Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsSubmissionOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#7B1D28] via-[#8C1E2B] to-[#68141F] text-white font-sans text-xs sm:text-[13px] font-semibold tracking-[0.14em] uppercase shadow-lg shadow-[#7B1D28]/25 hover:shadow-xl hover:shadow-[#7B1D28]/35 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <svg
                className="w-4 h-4 text-white/95"
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
              <span>WRITE A BLESSING</span>
            </button>

            {isDemoSample && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#B8975E]/15 border border-[#B8975E]/30 text-[#A67C1E] text-xs font-semibold tracking-wider uppercase select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A67C1E] animate-pulse" />
                <span>DEMO PREVIEW &middot; SAMPLE WISHES</span>
              </div>
            )}
          </div>
        </div>

        {/* Wishes Grid or Empty State */}
        {hasWishes ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {wishes.map((wish, idx) => (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  variant="grid"
                  accent={idx % 4 === 1}
                />
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="mt-16 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <MagneticButton>
                  <button
                    type="button"
                    onClick={() => setIsSubmissionOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#7B1D28] via-[#8C1E2B] to-[#68141F] text-white font-sans text-xs sm:text-[13px] font-semibold tracking-[0.14em] uppercase shadow-lg shadow-[#7B1D28]/25 hover:shadow-xl hover:shadow-[#7B1D28]/35 hover:brightness-105 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                  >
                    <svg
                      className="w-4 h-4 text-white/95"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                    <span>WRITE A BLESSING</span>
                  </button>
                </MagneticButton>

                <MagneticButton>
                  <Link
                    href="/#wishes"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/90 border border-[#B8975E]/40 text-[#292322] font-sans text-xs sm:text-[13px] font-semibold tracking-wider uppercase hover:bg-[#FFFDF9] hover:border-[#B8975E] transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <span>&larr; BACK TO WEDDING HOME</span>
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="max-w-2xl mx-auto rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC]/90 to-[#F6EFE3]/80 border border-[#B8975E]/35 p-8 sm:p-12 text-center shadow-md">
            <h3 className="font-serif text-2xl sm:text-3xl text-[#292322] font-normal mb-2">
              THE FIRST BLESSINGS ARE YET TO COME
            </h3>
            <p className="font-serif italic text-sm sm:text-base text-[#5C5452] mb-6">
              Be the first to bestow prayers and love upon Mithun &amp; Sakhi as they begin their sacred journey together.
            </p>
            <MagneticButton>
              <button
                type="button"
                onClick={() => setIsSubmissionOpen(true)}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#7B1D28] via-[#8C1E2B] to-[#68141F] text-white font-sans text-xs font-semibold tracking-wider uppercase shadow-md hover:shadow-lg hover:brightness-105 transition-all cursor-pointer inline-flex items-center gap-2 active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
                <span>WRITE A BLESSING</span>
              </button>
            </MagneticButton>
          </div>
        )}
      </Container>

      {/* Submission Modal */}
      <WishSubmissionModal
        isOpen={isSubmissionOpen}
        onClose={() => setIsSubmissionOpen(false)}
      />
    </>
  );
}
