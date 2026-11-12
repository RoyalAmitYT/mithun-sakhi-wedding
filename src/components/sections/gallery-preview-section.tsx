"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore, useRef } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => {};
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { AnimatedDivider } from "@/components/motion/animated-divider";
import { useMotionReduced, MOTION_EASINGS } from "@/lib/motion";
import { AmbientGlow, GoldLightSweep } from "@/components/effects";
import { MagneticButton } from "@/components/interactive";
import { getHomepageFeaturedMediaAction } from "@/actions/media";
import {
  CardCornerBrackets,
  SectionHeaderFiligree,
} from "@/components/ui/decorative-surfaces";

// Fallback curated photographs matching the visual design reference 1:1
interface CuratedPhoto {
  id: string;
  src: string;
  fullSrc?: string;
  alt: string;
  title: string;
  category: string;
  caption?: string;
  isTall?: boolean;
}

const REFERENCE_CURATED_PHOTOS: CuratedPhoto[] = [
  {
    id: "groom-portrait",
    src: "/images/groom-portrait-tall.webp",
    fullSrc: "/images/groom-portrait-lightbox.webp",
    alt: "Mithun Gorain — Groom in Royal Wedding Sherwani and Safa",
    title: "Mithun Gorain",
    category: "The Groom",
    caption: "The Groom adorned in traditional wedding sherwani and safa",
    isTall: true,
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

export function GalleryPreviewSection() {
  const shouldReduceMotion = useMotionReduced();
  const luxuryEase = MOTION_EASINGS.luxury as [number, number, number, number];

  const [photos, setPhotos] = useState<CuratedPhoto[]>(REFERENCE_CURATED_PHOTOS);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [photoBatchIndex, setPhotoBatchIndex] = useState<number>(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Defer loading admin-featured photos until gallery is near viewport (preserves initial TBT)
  useEffect(() => {
    let isMounted = true;
    async function loadFeaturedPhotos() {
      try {
        const featuredItems = await getHomepageFeaturedMediaAction(12);
        if (!isMounted || !featuredItems || featuredItems.length === 0) return;

        const dbPhotos: CuratedPhoto[] = featuredItems
          .filter((item) => item.media_type === "photo" && item.storage_path)
          .map((item, index) => ({
            id: item.id,
            src: `/api/media/${item.id}`,
            alt: item.caption || `Curated wedding photograph ${index + 1}`,
            title: item.caption || "Ceremonial Photograph",
            category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
            caption: item.caption,
            isTall: index === 0,
          }));

        if (dbPhotos.length >= 4) {
          setPhotos(dbPhotos);
        }
      } catch (err) {
        console.warn("Using baseline curated media fallback:", err);
      }
    }

    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(loadFeaturedPhotos, 2500);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadFeaturedPhotos();
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(el);

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, []);

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === "Escape") setSelectedPhotoIndex(null);
      if (e.key === "ArrowRight") {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev + 1) % photos.length : null
        );
      }
      if (e.key === "ArrowLeft") {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev - 1 + photos.length) % photos.length : null
        );
      }
    },
    [selectedPhotoIndex, photos.length]
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

  const maxBatches = Math.max(1, Math.ceil(photos.length / 7));

  const handlePrevPage = () => {
    setPhotoBatchIndex((prev) => (prev > 0 ? prev - 1 : maxBatches - 1));
  };

  const handleNextPage = () => {
    setPhotoBatchIndex((prev) => (prev + 1) % maxBatches);
  };

  // Select the 7 photos for the active batch
  const currentBatch = photos.slice(photoBatchIndex * 7, (photoBatchIndex + 1) * 7);
  const activePhotos = currentBatch.length >= 7 ? currentBatch : photos.slice(0, 7);

  // Group photos into the 4 columns matching the reference layout:
  // Column 1: Tall Groom Portrait
  // Column 2: Bride (top) + Mandap (bottom)
  // Column 3: Haldi (top) + Sacred Wedding (bottom)
  // Column 4: Mehndi (top) + Reception (bottom)
  const col1Photo = activePhotos[0];
  const col2Top = activePhotos[1];
  const col2Bottom = activePhotos[2];
  const col3Top = activePhotos[3];
  const col3Bottom = activePhotos[4];
  const col4Top = activePhotos[5];
  const col4Bottom = activePhotos[6];

  return (
    <section
      ref={sectionRef}
      id="gallery"
      aria-labelledby="gallery-title"
      className="relative pt-24 sm:pt-28 md:pt-32 pb-20 sm:pb-24 md:pb-28 bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB] border-t border-[rgba(184,151,94,0.2)] scroll-mt-24 overflow-hidden"
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
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
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
        <Reveal preset="luxury" direction="up" distance={14} delay={0.20} threshold={0.15}>
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
              <p className="font-serif italic text-xs sm:text-sm text-[#5C5452] mt-2">
                A special selection of memories from our celebrations. Explore the complete collection in the Gallery.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ==================================================================== */}
        {/* 3. MASONRY PHOTO GALLERY GRID (STAGGERED CHOREOGRAPHED ENTRANCE)    */}
        {/* ==================================================================== */}
        <div className="relative max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
          {/* Circular Left Chevron Navigation Pill */}
          <motion.button
            type="button"
            onClick={handlePrevPage}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Previous curated gallery moments"
            className="hidden sm:flex absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/95 border border-[#B8975E]/40 shadow-md items-center justify-center text-[#292322] hover:bg-[#FFFCF6] hover:border-[#B8975E] transition-all duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/50"
          >
            <svg
              className="w-4 h-4 text-[#292322]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </motion.button>

          {/* Circular Right Chevron Navigation Pill */}
          <motion.button
            type="button"
            onClick={handleNextPage}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Next curated gallery moments"
            className="hidden sm:flex absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/95 border border-[#B8975E]/40 shadow-md items-center justify-center text-[#292322] hover:bg-[#FFFCF6] hover:border-[#B8975E] transition-all duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/50"
          >
            <svg
              className="w-4 h-4 text-[#292322]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </motion.button>

          {/* 4-Column Balanced Grid with Staggered Column Reveals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-4 items-stretch">
            {/* COLUMN 1: Tall Groom Portrait */}
            {col1Photo && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.75,
                  delay: 0.10,
                  ease: luxuryEase,
                }}
                className="sm:col-span-1 h-[360px] sm:h-[440px] lg:h-auto min-h-[360px] sm:min-h-[440px] lg:min-h-[460px] flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex(0)}
                  className="group relative w-full h-full rounded-2xl overflow-hidden border border-[#B8975E]/25 shadow-xs hover:shadow-md hover:border-[#B8975E]/60 transition-all duration-300 text-left bg-[#292322]/5 focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/60 cursor-pointer"
                >
                  <GoldLightSweep trigger="hover" intensity="subtle" />
                  <Image
                    src={col1Photo.src}
                    alt={col1Photo.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top sm:object-center group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="text-[9px] uppercase font-sans font-semibold tracking-wider text-[#FFFCF6]/80 block">
                      {col1Photo.category}
                    </span>
                    <p className="font-serif text-sm font-medium text-white truncate">
                      {col1Photo.title}
                    </p>
                  </div>
                </button>
              </motion.div>
            )}

            {/* COLUMN 2: Bride Portrait (Top) + Mandap Setup (Bottom) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.75,
                delay: 0.18,
                ease: luxuryEase,
              }}
              className="sm:col-span-1 flex flex-col gap-3.5 sm:gap-4 h-full min-h-[360px] sm:min-h-[440px] lg:min-h-[460px]"
            >
              {col2Top && (
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex(1)}
                  className="group relative w-full flex-1 min-h-[160px] sm:min-h-[190px] lg:min-h-0 rounded-2xl overflow-hidden border border-[#B8975E]/25 shadow-xs hover:shadow-md hover:border-[#B8975E]/60 transition-all duration-300 text-left bg-[#292322]/5 focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/60 cursor-pointer"
                >
                  <GoldLightSweep trigger="hover" intensity="subtle" />
                  <Image
                    src={col2Top.src}
                    alt={col2Top.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="text-[9px] uppercase font-sans font-semibold tracking-wider text-[#FFFCF6]/80 block">
                      {col2Top.category}
                    </span>
                    <p className="font-serif text-sm font-medium text-white truncate">
                      {col2Top.title}
                    </p>
                  </div>
                </button>
              )}

              {col2Bottom && (
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex(2)}
                  className="group relative w-full flex-1 min-h-[160px] sm:min-h-[190px] lg:min-h-0 rounded-2xl overflow-hidden border border-[#B8975E]/25 shadow-xs hover:shadow-md hover:border-[#B8975E]/60 transition-all duration-300 text-left bg-[#292322]/5 focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/60 cursor-pointer"
                >
                  <GoldLightSweep trigger="hover" intensity="subtle" />
                  <Image
                    src={col2Bottom.src}
                    alt={col2Bottom.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="text-[9px] uppercase font-sans font-semibold tracking-wider text-[#FFFCF6]/80 block">
                      {col2Bottom.category}
                    </span>
                    <p className="font-serif text-sm font-medium text-white truncate">
                      {col2Bottom.title}
                    </p>
                  </div>
                </button>
              )}
            </motion.div>

            {/* COLUMN 3: Haldi Joy (Top) + Sacred Wedding Fire (Bottom) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.75,
                delay: 0.26,
                ease: luxuryEase,
              }}
              className="sm:col-span-1 flex flex-col gap-3.5 sm:gap-4 h-full min-h-[360px] sm:min-h-[440px] lg:min-h-[460px]"
            >
              {col3Top && (
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex(3)}
                  className="group relative w-full flex-1 min-h-[160px] sm:min-h-[190px] lg:min-h-0 rounded-2xl overflow-hidden border border-[#B8975E]/25 shadow-xs hover:shadow-md hover:border-[#B8975E]/60 transition-all duration-300 text-left bg-[#292322]/5 focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/60 cursor-pointer"
                >
                  <Image
                    src={col3Top.src}
                    alt={col3Top.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="text-[9px] uppercase font-sans font-semibold tracking-wider text-[#FFFCF6]/80 block">
                      {col3Top.category}
                    </span>
                    <p className="font-serif text-sm font-medium text-white truncate">
                      {col3Top.title}
                    </p>
                  </div>
                </button>
              )}

              {col3Bottom && (
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex(4)}
                  className="group relative w-full flex-1 min-h-[160px] sm:min-h-[190px] lg:min-h-0 rounded-2xl overflow-hidden border border-[#B8975E]/25 shadow-xs hover:shadow-md hover:border-[#B8975E]/60 transition-all duration-300 text-left bg-[#292322]/5 focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/60 cursor-pointer"
                >
                  <Image
                    src={col3Bottom.src}
                    alt={col3Bottom.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="text-[9px] uppercase font-sans font-semibold tracking-wider text-[#FFFCF6]/80 block">
                      {col3Bottom.category}
                    </span>
                    <p className="font-serif text-sm font-medium text-white truncate">
                      {col3Bottom.title}
                    </p>
                  </div>
                </button>
              )}
            </motion.div>

            {/* COLUMN 4: Mehndi Henna Details (Top) + Reception Banquet (Bottom) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.75,
                delay: 0.34,
                ease: luxuryEase,
              }}
              className="sm:col-span-1 flex flex-col gap-3.5 sm:gap-4 h-full min-h-[360px] sm:min-h-[440px] lg:min-h-[460px]"
            >
              {col4Top && (
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex(5)}
                  className="group relative w-full flex-1 min-h-[160px] sm:min-h-[190px] lg:min-h-0 rounded-2xl overflow-hidden border border-[#B8975E]/25 shadow-xs hover:shadow-md hover:border-[#B8975E]/60 transition-all duration-300 text-left bg-[#292322]/5 focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/60 cursor-pointer"
                >
                  <Image
                    src={col4Top.src}
                    alt={col4Top.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="text-[9px] uppercase font-sans font-semibold tracking-wider text-[#FFFCF6]/80 block">
                      {col4Top.category}
                    </span>
                    <p className="font-serif text-sm font-medium text-white truncate">
                      {col4Top.title}
                    </p>
                  </div>
                </button>
              )}

              {col4Bottom && (
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex(6)}
                  className="group relative w-full flex-1 min-h-[160px] sm:min-h-[190px] lg:min-h-0 rounded-2xl overflow-hidden border border-[#B8975E]/25 shadow-xs hover:shadow-md hover:border-[#B8975E]/60 transition-all duration-300 text-left bg-[#292322]/5 focus:outline-hidden focus:ring-2 focus:ring-[#B8975E]/60 cursor-pointer"
                >
                  <Image
                    src={col4Bottom.src}
                    alt={col4Bottom.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="text-[9px] uppercase font-sans font-semibold tracking-wider text-[#FFFCF6]/80 block">
                      {col4Bottom.category}
                    </span>
                    <p className="font-serif text-sm font-medium text-white truncate">
                      {col4Bottom.title}
                    </p>
                  </div>
                </button>
              )}
            </motion.div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 4. CTA BUTTON WITH STAGE 1 MICRO-INTERACTIONS                        */}
        {/* ==================================================================== */}
        <Reveal preset="luxury" direction="up" distance={14} delay={0.28} threshold={0.15}>
          <div className="mt-12 sm:mt-14">
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
                    <span>Explore Complete Gallery</span>
                    <span aria-hidden="true" className="group-hover:translate-x-1.5 transition-transform duration-200">&rarr;</span>
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

            {/* Discreet Disclosure Footnote */}
            <p className="font-sans text-[11px] sm:text-xs text-[#8A8280] text-center tracking-wide mt-5">
              Illustrative preview imagery &middot; Official wedding photographs coming soon.
            </p>
          </div>
        </Reveal>
      </Container>

      {/* ==================================================================== */}
      {/* 5. HIGH-RESOLUTION LIGHTBOX MODAL (PORTALED TO ESCAPE CONTAINER OFFSETS) */}
      {/* ==================================================================== */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={photos[selectedPhotoIndex].title}
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
                  className="relative max-w-4xl w-full max-h-[88vh] sm:max-h-[85vh] bg-[#FFFCF6] rounded-2xl overflow-hidden border border-[#B8975E]/40 shadow-2xl flex flex-col my-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header / Close Bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 border-b border-[#B8975E]/20 bg-[#FFFDF9] shrink-0">
                    <div>
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-[#A67C1E] block">
                        {photos[selectedPhotoIndex].category}
                      </span>
                      <h3 className="font-serif text-base sm:text-lg font-medium text-[#292322] leading-tight mt-0.5">
                        {photos[selectedPhotoIndex].title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#8A8280]">
                        {selectedPhotoIndex + 1} / {photos.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoIndex(null)}
                        className="w-8 h-8 rounded-full bg-[#292322]/10 hover:bg-[#292322]/20 text-[#292322] flex items-center justify-center transition-colors text-lg font-serif cursor-pointer"
                        aria-label="Close photo preview"
                      >
                        &times;
                      </button>
                    </div>
                  </div>

                  {/* Photo Display (Strictly No Distortion / Aspect Ratio Preserved) */}
                  <div className="relative flex-1 min-h-[220px] max-h-[58vh] sm:max-h-[64vh] w-full bg-[#141010] flex items-center justify-center p-2 overflow-hidden">
                    <Image
                      src={photos[selectedPhotoIndex].fullSrc || photos[selectedPhotoIndex].src}
                      alt={photos[selectedPhotoIndex].alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 1200px"
                      className="object-contain"
                      priority
                    />

                    {/* Prev in Modal */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoIndex((prev) =>
                          prev !== null ? (prev - 1 + photos.length) % photos.length : null
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors border border-white/20 cursor-pointer shadow-lg"
                      aria-label="Previous photograph"
                    >
                      &#8249;
                    </button>

                    {/* Next in Modal */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoIndex((prev) =>
                          prev !== null ? (prev + 1) % photos.length : null
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors border border-white/20 cursor-pointer shadow-lg"
                      aria-label="Next photograph"
                    >
                      &#8250;
                    </button>
                  </div>

                  {/* Footer / Caption Bar */}
                  {photos[selectedPhotoIndex].caption && (
                    <div className="px-4 py-2 sm:px-5 sm:py-2.5 border-t border-[#B8975E]/20 bg-[#FFFDF9] text-center shrink-0">
                      <p className="font-serif italic text-xs sm:text-sm text-[#5C5452] line-clamp-2">
                        &ldquo;{photos[selectedPhotoIndex].caption}&rdquo;
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
