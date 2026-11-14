"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { AnimatedDivider } from "@/components/motion/animated-divider";
import { useMotionReduced, MOTION_EASINGS } from "@/lib/motion";
import { AmbientGlow, GoldLightSweep } from "@/components/effects";
import { MagneticButton } from "@/components/interactive";
import {
  CardCornerBrackets,
  SectionHeaderFiligree,
} from "@/components/ui/decorative-surfaces";

const emptySubscribe = () => () => {};

export interface PublishedPhotoItem {
  id: string;
  src: string;
  fullSrc?: string;
  alt: string;
  title: string;
  category: string;
  rawCategory?: string;
  caption?: string;
  isTall?: boolean;
  displayOrder?: number;
  createdAt?: string;
}

export type GalleryPreviewState =
  | { status: "empty" }
  | { status: "published"; photos: PublishedPhotoItem[] }
  | { status: "error"; message?: string };

export const REFERENCE_CURATED_PHOTOS: PublishedPhotoItem[] = [
  {
    id: "groom-portrait",
    src: "/images/groom-portrait-tall.webp",
    fullSrc: "/images/groom-portrait-lightbox.webp",
    alt: "Mithun Gorain — Groom in Royal Wedding Sherwani and Safa",
    title: "Mithun Gorain",
    category: "The Groom",
    caption: "The Groom adorned in traditional wedding sherwani and safa",
  },
  {
    id: "bride-portrait",
    src: "/images/bride-portrait-gallery.webp",
    fullSrc: "/images/bride-portrait-lightbox.webp",
    alt: "Sakhi Gorain — Bride adorned in crimson wedding lehenga and traditional jewelry",
    title: "Sakhi Gorain",
    category: "The Bride",
    caption: "The Bride radiant in ceremonial crimson and intricate gold ornaments",
  },
  {
    id: "the-sacred-wedding",
    src: "/images/the-sacred-wedding-card.webp",
    fullSrc: "/images/the-sacred-wedding-desktop.webp",
    alt: "The Sacred Wedding — Sacred Vedic wedding rituals and seven vows",
    title: "The Sacred Wedding",
    category: "The Sacred Wedding",
    caption: "Sacred Vedic wedding rituals and timeless matrimonial vows",
  },
  {
    id: "ceremony-haldi",
    src: "/images/haldi-portrait-card.webp",
    fullSrc: "/images/haldi-portrait-lightbox.webp",
    alt: "Joyful Haldi celebration with turmeric blessings and cheerful smiles",
    title: "Haldi Blessings",
    category: "Haldi Ceremony",
    caption: "Joyous laughter and golden turmeric blessings with loved ones",
  },
  {
    id: "sacred-union",
    src: "/images/hero-portrait-card.webp",
    fullSrc: "/images/hero-portrait-desktop.webp",
    alt: "Mithun & Sakhi — Royal couple portrait in wedding finery",
    title: "Eternal Union",
    category: "Mithun & Sakhi",
    caption: "Mithun & Sakhi united in everlasting love and sacred matrimonial bliss",
  },
  {
    id: "ceremony-mehndi",
    src: "/images/mehendi-portrait-card.webp",
    fullSrc: "/images/mehendi-portrait-desktop.webp",
    alt: "Intricate bridal henna and floral Mehndi celebrations",
    title: "Mehndi Celebration",
    category: "Mehndi Ceremony",
    caption: "Intricate henna motifs woven with traditional songs and celebration",
  },
  {
    id: "ceremony-reception",
    src: "/images/reception-portrait-card.webp",
    fullSrc: "/images/reception-portrait-lightbox.webp",
    alt: "Elegant reception banquet setting with candles, florals, and festive dining",
    title: "Reception",
    category: "Reception",
    caption: "Grand evening banquet welcoming family, friends, and warm blessings",
  },
];

interface SquarePhotoCardProps {
  photo: PublishedPhotoItem;
  originalIndex: number;
  onClick: () => void;
  priority?: boolean;
}

function SquarePhotoCard({
  photo,
  onClick,
  priority = false,
}: SquarePhotoCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View photograph: ${photo.title}`}
      className="group relative aspect-square w-[160px] sm:w-[210px] md:w-[250px] shrink-0 rounded-2xl overflow-hidden border border-[#B8975E]/30 bg-[#292322]/5 shadow-xs hover:shadow-md hover:border-[#B8975E]/70 active:scale-[0.98] transition-all duration-200 text-left cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/60 select-none block"
    >
      <GoldLightSweep trigger="hover" intensity="subtle" />
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 640px) 160px, (max-width: 768px) 210px, 250px"
        priority={priority}
        className="object-cover object-center"
      />
      {/* Subtle bottom gradient vignette for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute bottom-2.5 sm:bottom-3.5 left-2.5 sm:left-3.5 right-2.5 sm:right-3.5 text-white pointer-events-none">
        <span className="text-[9.5px] sm:text-[10px] lg:text-[9.5px] uppercase font-sans font-semibold tracking-wider text-[#FFFCF6]/90 block drop-shadow-xs truncate">
          {photo.category}
        </span>
        <p className="font-serif text-[13px] sm:text-sm lg:text-xs font-medium text-white truncate drop-shadow-sm mt-0.5">
          {photo.title}
        </p>
      </div>
    </button>
  );
}

export interface GalleryPreviewClientProps {
  state?: GalleryPreviewState;
  simulatedPhotos?: PublishedPhotoItem[];
  simulatedCount?: number;
}

export function GalleryPreviewClient({
  state = { status: "empty" },
  simulatedPhotos,
  simulatedCount,
}: GalleryPreviewClientProps) {
  const shouldReduceMotion = useMotionReduced();
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];

  const isReal = state.status === "published" && state.photos.length > 0;
  const isError = state.status === "error";

  const activePhotos: PublishedPhotoItem[] = useMemo(() => {
    if (typeof simulatedCount === "number" && simulatedCount > 0) {
      const simPhotos: PublishedPhotoItem[] = [];
      for (let i = 0; i < simulatedCount; i++) {
        const ref = REFERENCE_CURATED_PHOTOS[i % REFERENCE_CURATED_PHOTOS.length];
        simPhotos.push({
          ...ref,
          id: `sim-photo-${i + 1}`,
          title: `${ref.title} ${Math.floor(i / REFERENCE_CURATED_PHOTOS.length) + 1 > 1 ? `#${i + 1}` : ""}`.trim(),
        });
      }
      return simPhotos;
    }
    if (simulatedPhotos && simulatedPhotos.length > 0) {
      return simulatedPhotos;
    }
    return isReal ? state.photos : REFERENCE_CURATED_PHOTOS;
  }, [simulatedCount, simulatedPhotos, isReal, state]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === "Escape") setSelectedPhotoIndex(null);
      if (e.key === "ArrowRight") {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev + 1) % activePhotos.length : null
        );
      }
      if (e.key === "ArrowLeft") {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev - 1 + activePhotos.length) % activePhotos.length : null
        );
      }
    },
    [selectedPhotoIndex, activePhotos.length]
  );

  useEffect(() => {
    if (selectedPhotoIndex !== null) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhotoIndex, handleKeyDown]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [measuredCardWidth, setMeasuredCardWidth] = useState<number>(0);

  // ResizeObserver to dynamically track visible container width across viewports, orientation changes, and resizes
  useEffect(() => {
    if (!containerRef.current) return;
    const updateMetrics = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
        const firstCard = containerRef.current.querySelector(".aspect-square");
        if (firstCard) {
          setMeasuredCardWidth(firstCard.clientWidth);
        }
      }
    };
    updateMetrics();
    const observer = new ResizeObserver(() => {
      updateMetrics();
    });
    observer.observe(containerRef.current);
    window.addEventListener("resize", updateMetrics);
    window.addEventListener("orientationchange", updateMetrics);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateMetrics);
      window.removeEventListener("orientationchange", updateMetrics);
    };
  }, []);

  // Split photos into Top Row and Bottom Row
  // Top Row: items with even indices [0, 2, 4, ...]
  // Bottom Row: items with odd indices [1, 3, 5, ...]
  const topRowSource = useMemo(
    () => activePhotos.filter((_, i) => i % 2 === 0),
    [activePhotos]
  );
  const bottomRowSource = useMemo(
    () => activePhotos.filter((_, i) => i % 2 === 1),
    [activePhotos]
  );

  // Determine card width and gap based on container width or screen breakpoints
  const { cardWidth, cardGap } = useMemo(() => {
    const gap = containerWidth < 640 ? 12 : containerWidth < 768 ? 16 : 20;
    const fallbackWidth = containerWidth < 640 ? 160 : containerWidth < 768 ? 210 : 250;
    const width = measuredCardWidth > 0 ? measuredCardWidth : fallbackWidth;
    return { cardWidth: width, cardGap: gap };
  }, [containerWidth, measuredCardWidth]);

  // Compute natural rendered widths of unique item sequences for each row
  const topRowNaturalWidth = useMemo(() => {
    const count = topRowSource.length;
    if (count === 0) return 0;
    return count * cardWidth + Math.max(0, count - 1) * cardGap;
  }, [topRowSource.length, cardWidth, cardGap]);

  const bottomRowNaturalWidth = useMemo(() => {
    const count = bottomRowSource.length;
    if (count === 0) return 0;
    return count * cardWidth + Math.max(0, count - 1) * cardGap;
  }, [bottomRowSource.length, cardWidth, cardGap]);

  // CONDITION 1: Each row contains at least 3 unique photographs
  const hasMinUniquePhotosPerRow =
    topRowSource.length >= 3 && bottomRowSource.length >= 3;

  // CONDITION 2: The natural rendered width of each row's unique image sequence
  // exceeds its visible container width by at least one card gap
  const topRowOverflows =
    containerWidth > 0 && topRowNaturalWidth >= containerWidth + cardGap;
  const bottomRowOverflows =
    containerWidth > 0 && bottomRowNaturalWidth >= containerWidth + cardGap;

  const isMarqueeEligible =
    hasMinUniquePhotosPerRow && topRowOverflows && bottomRowOverflows;
  const isMarqueeActive = isMarqueeEligible && !shouldReduceMotion;

  // Seamless Looping Duplication: Duplicate each complete row sequence EXACTLY ONCE
  // when eligible. Zero fake individual photo repetition.
  const topMarqueeItems: PublishedPhotoItem[] = useMemo(
    () => (isMarqueeActive ? [...topRowSource, ...topRowSource] : topRowSource),
    [isMarqueeActive, topRowSource]
  );
  const bottomMarqueeItems: PublishedPhotoItem[] = useMemo(
    () => (isMarqueeActive ? [...bottomRowSource, ...bottomRowSource] : bottomRowSource),
    [isMarqueeActive, bottomRowSource]
  );

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-title"
      className="relative pt-16 sm:pt-22 md:pt-26 lg:pt-32 pb-14 sm:pb-18 md:pb-22 lg:pb-28 bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] border-t border-[rgba(184,151,94,0.2)] scroll-mt-24 overflow-hidden"
    >
      {/* Background Architectural Corner Filigree */}
      <SectionHeaderFiligree color="#B8975E" opacity={0.18} />

      {/* Atmospheric Ambient Lighting Layers */}
      <AmbientGlow variant="champagne" position="top-left" size="lg" opacity={0.35} />
      <AmbientGlow variant="gold" position="bottom-right" size="lg" opacity={0.25} />

      <Container size="wide" className="relative z-10 px-4 sm:px-6 lg:px-8">
        {/* ==================================================================== */}
        {/* 1. SECTION HEADER                                                    */}
        {/* ==================================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 lg:mb-10">
          {/* Eyebrow */}
          <Reveal preset="luxury" direction="up" distance={10} threshold={0.15}>
            <div className="flex items-center justify-center gap-2 mb-2.5 select-none">
              <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
              <span className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#A67C1E] uppercase">
                VISUAL CHRONICLE
              </span>
              <span className="text-[7px] text-[#B8975E] font-bold">◆</span>
            </div>
          </Reveal>

          {/* Main Title: Two-Tone Cormorant Garamond */}
          <Reveal preset="luxury" direction="up" distance={16} delay={0.08} threshold={0.15}>
            <h2
              id="gallery-title"
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal tracking-tight text-[#292322] leading-tight"
            >
              <span>Wedding </span>
              <span className="text-[#A67C1E] italic font-normal">Memories</span>
            </h2>
          </Reveal>

          {/* Supporting Subtitle */}
          <Reveal preset="luxury" direction="up" distance={12} delay={0.16} threshold={0.15}>
            <p className="font-serif italic text-sm sm:text-base md:text-[17px] text-[#5C5452] max-w-2xl mx-auto mt-3 leading-relaxed">
              A glimpse into our celebrations &mdash; where traditions, emotions, and
              togetherness created unforgettable moments.
            </p>
          </Reveal>

          {/* Symmetrical Central Animated Gold Divider */}
          <div className="flex justify-center mt-4">
            <AnimatedDivider variant="gold" size="sm" />
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 2. CURATED MOMENTS PANEL                                             */}
        {/* ==================================================================== */}
        <Reveal preset="luxury" direction="up" distance={14} delay={0.2} threshold={0.15}>
          <div className="max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="relative rounded-2xl bg-gradient-to-b from-[#FCF9EE] to-[#FAF5E6] border border-[#B8975E]/35 px-6 py-4 sm:py-5 text-center shadow-[0_8px_24px_rgba(184,151,94,0.06)] overflow-hidden">
              {/* Architectural Corner Brackets */}
              <CardCornerBrackets color="#B8975E" size={14} />

              {/* Subtle Inner Filigree Side Watermarks */}
              <svg
                className="absolute left-2 top-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none opacity-15 select-none"
                viewBox="0 0 60 60"
                fill="none"
                stroke="#B8975E"
                aria-hidden="true"
              >
                <circle cx="10" cy="30" r="20" strokeDasharray="2 2" />
                <path d="M 0 30 Q 20 15 30 30 Q 20 45 0 30" />
              </svg>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none opacity-15 select-none scale-x-[-1]"
                viewBox="0 0 60 60"
                fill="none"
                stroke="#B8975E"
                aria-hidden="true"
              >
                <circle cx="10" cy="30" r="20" strokeDasharray="2 2" />
                <path d="M 0 30 Q 20 15 30 30 Q 20 45 0 30" />
              </svg>

              {/* Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F1E6] border border-[#B8975E]/40 text-[#8E6D38] text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.16em]">
                <svg
                  className="w-3.5 h-3.5 text-[#B8975E]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>CURATED MOMENTS</span>
              </div>

              {/* Panel Description */}
              <p className="font-serif italic text-[13px] sm:text-sm lg:text-xs text-[#5C5452] mt-2">
                A special selection of memories from our celebrations. Explore the complete collection in the Gallery.
              </p>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* ==================================================================== */}
      {/* 3. TWO-ROW SQUARE IMAGE ADAPTIVE MARQUEE SYSTEM                      */}
      {/* ==================================================================== */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none space-y-3.5 sm:space-y-4 md:space-y-5 py-2"
      >
        {/* ------------------------------------------------------------------ */}
        {/* ROW 1: TOP ROW (Moves Right to Left: animate-marquee-left)        */}
        {/* ------------------------------------------------------------------ */}
        <div
          className="marquee-row relative overflow-hidden py-1"
          aria-label="Wedding photographs top row"
        >
          {isMarqueeActive ? (
            <div className="marquee-track flex gap-3 sm:gap-4 md:gap-5 w-max animate-marquee-left">
              {topMarqueeItems.map((photo, idx) => {
                const isDuplicate = idx >= topRowSource.length;
                const originalIdx = activePhotos.findIndex((p) => p.id === photo.id);
                return (
                  <div
                    key={`top-${photo.id}-${idx}`}
                    aria-hidden={isDuplicate ? "true" : undefined}
                  >
                    <SquarePhotoCard
                      photo={photo}
                      originalIndex={originalIdx >= 0 ? originalIdx : 0}
                      onClick={() => setSelectedPhotoIndex(originalIdx >= 0 ? originalIdx : 0)}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            /* Static Centered Layout when insufficient photos or reduced motion */
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 px-4 w-full">
              {topRowSource.map((photo) => {
                const originalIdx = activePhotos.findIndex((p) => p.id === photo.id);
                return (
                  <SquarePhotoCard
                    key={`top-static-${photo.id}`}
                    photo={photo}
                    originalIndex={originalIdx >= 0 ? originalIdx : 0}
                    onClick={() => setSelectedPhotoIndex(originalIdx >= 0 ? originalIdx : 0)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* ROW 2: BOTTOM ROW (Moves Left to Right: animate-marquee-right)    */}
        {/* ------------------------------------------------------------------ */}
        {bottomRowSource.length > 0 && (
          <div
            className="marquee-row relative overflow-hidden py-1"
            aria-label="Wedding photographs bottom row"
          >
            {isMarqueeActive ? (
              <div className="marquee-track flex gap-3 sm:gap-4 md:gap-5 w-max animate-marquee-right">
                {bottomMarqueeItems.map((photo, idx) => {
                  const isDuplicate = idx >= bottomRowSource.length;
                  const originalIdx = activePhotos.findIndex((p) => p.id === photo.id);
                  return (
                    <div
                      key={`bottom-${photo.id}-${idx}`}
                      aria-hidden={isDuplicate ? "true" : undefined}
                    >
                      <SquarePhotoCard
                        photo={photo}
                        originalIndex={originalIdx >= 0 ? originalIdx : 0}
                        onClick={() => setSelectedPhotoIndex(originalIdx >= 0 ? originalIdx : 0)}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Static Centered Layout when insufficient photos or reduced motion */
              <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 px-4 w-full">
                {bottomRowSource.map((photo) => {
                  const originalIdx = activePhotos.findIndex((p) => p.id === photo.id);
                  return (
                    <SquarePhotoCard
                      key={`bottom-static-${photo.id}`}
                      photo={photo}
                      originalIndex={originalIdx >= 0 ? originalIdx : 0}
                      onClick={() => setSelectedPhotoIndex(originalIdx >= 0 ? originalIdx : 0)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 4. CTA BUTTON & DISCLOSURE FOOTNOTE                                  */}
      {/* ==================================================================== */}
      <Container size="wide" className="relative z-10 px-4 sm:px-6 lg:px-8">
        <Reveal preset="luxury" direction="up" distance={14} delay={0.28} threshold={0.15}>
          <div className="mt-7 sm:mt-9 lg:mt-12">
            <div className="flex items-center justify-center gap-3 sm:gap-6 select-none">
              {/* Left Ornament */}
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="w-10 sm:w-20 md:w-28 h-[1px] bg-gradient-to-r from-transparent to-[#B8975E]/70" />
                <span className="text-[7.5px] text-[#B8975E] rotate-45 font-bold">◇</span>
                <span className="text-[10px] text-[#B8975E] rotate-45 font-bold">◆</span>
              </div>

              {/* Main Burgundy Pill CTA Button with Magnetic Interaction */}
              <MagneticButton>
                <Link
                  href="/gallery"
                  className="rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#B8975E] focus-visible:ring-offset-2 block"
                >
                  <motion.div
                    whileHover={{ scale: 1.025, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 sm:gap-3 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#7B1D28] via-[#8C1E2B] to-[#68141F] border border-[#B8975E]/40 text-white font-sans font-semibold text-xs sm:text-[13px] tracking-[0.16em] uppercase shadow-lg shadow-[#7B1D28]/25 hover:shadow-xl hover:shadow-[#7B1D28]/35 transition-all cursor-pointer group"
                  >
                    <svg
                      className="w-4 h-4 text-white/95 group-hover:scale-110 transition-transform duration-200"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>EXPLORE COMPLETE GALLERY</span>
                    <span
                      aria-hidden="true"
                      className="group-hover:translate-x-1.5 transition-transform duration-200"
                    >
                      &rarr;
                    </span>
                  </motion.div>
                </Link>
              </MagneticButton>

              {/* Right Ornament */}
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="text-[10px] text-[#B8975E] rotate-45 font-bold">◆</span>
                <span className="text-[7.5px] text-[#B8975E] rotate-45 font-bold">◇</span>
                <span className="w-10 sm:w-20 md:w-28 h-[1px] bg-gradient-to-l from-transparent to-[#B8975E]/70" />
              </div>
            </div>

            {/* Dynamic Footnote Message */}
            <p className="font-sans text-[11.5px] sm:text-xs lg:text-[11px] text-[#8A8280] text-center tracking-wide mt-5">
              {isReal ? (
                <span>Real moments from Mithun &amp; Sakhi&rsquo;s celebrations.</span>
              ) : isError ? (
                <span>Illustrative preview imagery &middot; Official wedding photographs coming soon.</span>
              ) : (
                <span>Illustrative preview imagery &middot; Official wedding photographs coming soon.</span>
              )}
            </p>
          </div>
        </Reveal>
      </Container>

      {/* ==================================================================== */}
      {/* 5. HIGH-RESOLUTION LIGHTBOX MODAL                                    */}
      {/* ==================================================================== */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedPhotoIndex !== null && activePhotos[selectedPhotoIndex] && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={activePhotos[selectedPhotoIndex].title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 md:p-6"
                onClick={() => setSelectedPhotoIndex(null)}
              >
                {/* Modal Container */}
                <motion.div
                  initial={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 0, scale: 0.96, y: 10 }
                  }
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 0, scale: 0.96, y: 10 }
                  }
                  transition={{ duration: 0.25, ease: luxuryEase }}
                  className="relative max-w-5xl lg:max-w-6xl w-full max-h-[92vh] sm:max-h-[94vh] bg-[#FFFCF6] rounded-2xl overflow-hidden border border-[#B8975E]/40 shadow-2xl flex flex-col my-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header / Close Bar */}
                  <div className="flex items-center justify-between px-4 py-2 sm:px-5 sm:py-2.5 border-b border-[#B8975E]/20 bg-[#FFFDF9] shrink-0">
                    <div>
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-[#A67C1E] block">
                        {activePhotos[selectedPhotoIndex].category}
                      </span>
                      <h3 className="font-serif text-base sm:text-lg font-medium text-[#292322] leading-tight mt-0.5">
                        {activePhotos[selectedPhotoIndex].title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono text-[#8A8280]">
                        {selectedPhotoIndex + 1} / {activePhotos.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoIndex(null)}
                        className="w-8 h-8 rounded-full bg-[#292322]/10 hover:bg-[#292322]/20 active:scale-90 text-[#292322] flex items-center justify-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                        aria-label="Close photo preview"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Photo Display: Full-Height Adaptive Image Presentation with Ambient Blur */}
                  <div className="relative w-full h-[58vh] sm:h-[68vh] md:h-[76vh] bg-[#120F0F] flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
                    {/* Subtle blurred, enlarged version of current photograph as ambient backdrop */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
                      <Image
                        src={
                          activePhotos[selectedPhotoIndex].fullSrc ||
                          activePhotos[selectedPhotoIndex].src
                        }
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover scale-125 blur-3xl opacity-35 brightness-75"
                        priority
                        unoptimized={isReal}
                      />
                      <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" />
                    </div>

                    {/* Sharp, Dominant Foreground Photograph */}
                    <Image
                      src={
                        activePhotos[selectedPhotoIndex].fullSrc ||
                        activePhotos[selectedPhotoIndex].src
                      }
                      alt={activePhotos[selectedPhotoIndex].alt}
                      fill
                      sizes="(max-width: 640px) 96vw, (max-width: 1024px) 92vw, 1400px"
                      className="object-contain z-10 drop-shadow-[0_16px_36px_rgba(0,0,0,0.65)]"
                      priority
                      unoptimized={isReal}
                    />

                    {/* Prev in Modal (if > 1 unique photo) */}
                    {activePhotos.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPhotoIndex((prev) =>
                            prev !== null
                              ? (prev - 1 + activePhotos.length) % activePhotos.length
                              : null
                          )
                        }
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/55 hover:bg-black/80 hover:scale-105 active:scale-90 text-white flex items-center justify-center transition-all duration-150 border border-white/25 cursor-pointer shadow-xl backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                        aria-label="Previous photograph"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                    )}

                    {/* Next in Modal (if > 1 unique photo) */}
                    {activePhotos.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPhotoIndex((prev) =>
                            prev !== null
                              ? (prev + 1) % activePhotos.length
                              : null
                          )
                        }
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/55 hover:bg-black/80 hover:scale-105 active:scale-90 text-white flex items-center justify-center transition-all duration-150 border border-white/25 cursor-pointer shadow-xl backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                        aria-label="Next photograph"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Footer / Caption Bar */}
                  {activePhotos[selectedPhotoIndex].caption && (
                    <div className="px-4 py-2 sm:px-5 sm:py-2.5 border-t border-[#B8975E]/20 bg-[#FFFDF9] text-center shrink-0">
                      <p className="font-serif italic text-xs sm:text-sm text-[#5C5452] line-clamp-2">
                        &ldquo;{activePhotos[selectedPhotoIndex].caption}&rdquo;
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
