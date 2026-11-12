"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { extractYouTubeVideoId, type MediaCategory } from "@/actions/media";

export type PublishedMediaItem = {
  id: string;
  media_type: "photo" | "video";
  storage_path: string | null;
  youtube_url: string | null;
  category: MediaCategory;
  caption: string | null;
  download_enabled: boolean;
  display_order: number;
  file_name: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  thumbnail_path: string | null;
  created_at: string;
};

interface GalleryViewProps {
  initialMedia?: PublishedMediaItem[];
}

type GalleryTab = "photos" | "films";

// Human-readable labels for database categories
const CATEGORY_LABELS: Record<string, string> = {
  wedding: "The Sacred Wedding",
  haldi: "Haldi Ceremony",
  mehndi: "Mehndi Ceremony",
  reception: "Reception",
  portraits: "Couple Portraits",
};

// 6 Category Definitions matching the Target Design Reference
interface CategoryDefinition {
  id: string;
  label: string;
  matcher: (cat: string) => boolean;
  icon: (className?: string) => React.ReactNode;
}

const CATEGORIES: CategoryDefinition[] = [
  {
    id: "all",
    label: "All Memories",
    matcher: () => true,
    icon: (className = "w-3.5 h-3.5") => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "portraits",
    label: "Couple Portraits",
    matcher: (cat: string) => cat === "portraits" || cat === "couple",
    icon: (className = "w-3.5 h-3.5") => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    id: "ceremonies",
    label: "Ceremonies",
    matcher: (cat: string) =>
      ["wedding", "haldi", "mehndi", "ceremonies"].includes(cat),
    icon: (className = "w-3.5 h-3.5") => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2C9 7 4 9 4 14a8 8 0 0 0 16 0c0-5-5-7-8-12z" />
        <path d="M12 12c-1.5 2-1.5 4 0 6 1.5-2 1.5-4 0-6z" />
      </svg>
    ),
  },
  {
    id: "family",
    label: "Family & Guests",
    matcher: (cat: string) =>
      ["reception", "family", "guests"].includes(cat),
    icon: (className = "w-3.5 h-3.5") => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "decor",
    label: "Decor & Venues",
    matcher: (cat: string) =>
      ["decor", "venues", "mandap"].includes(cat),
    icon: (className = "w-3.5 h-3.5") => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 21h18" />
        <path d="M5 21V9l7-6 7 6v12" />
        <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
      </svg>
    ),
  },
  {
    id: "candid",
    label: "Candid Moments",
    matcher: (cat: string) =>
      ["candid", "moments"].includes(cat),
    icon: (className = "w-3.5 h-3.5") => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
];

const ITEMS_PER_PAGE = 9; // 3x3 desktop grid matching visual reference

export function GalleryView({ initialMedia = [] }: GalleryViewProps) {
  const [activeTab, setActiveTab] = useState<GalleryTab>("photos");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [videoModalFilm, setVideoModalFilm] = useState<PublishedMediaItem | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Segregate photos and films from hydrated published database items
  const allPhotos = useMemo(
    () => initialMedia.filter((m) => m.media_type === "photo"),
    [initialMedia]
  );
  const allFilms = useMemo(
    () => initialMedia.filter((m) => m.media_type === "video"),
    [initialMedia]
  );

  // Filtered photos based on active category
  const filteredPhotos = useMemo(() => {
    const activeCategoryDef = CATEGORIES.find((c) => c.id === selectedCategory);
    if (!activeCategoryDef || activeCategoryDef.id === "all") {
      return allPhotos;
    }
    return allPhotos.filter((p) => activeCategoryDef.matcher(p.category));
  }, [allPhotos, selectedCategory]);

  // Filtered films based on active category
  const filteredFilms = useMemo(() => {
    const activeCategoryDef = CATEGORIES.find((c) => c.id === selectedCategory);
    if (!activeCategoryDef || activeCategoryDef.id === "all") {
      return allFilms;
    }
    return allFilms.filter((f) => activeCategoryDef.matcher(f.category));
  }, [allFilms, selectedCategory]);

  // Category counts based on actual database media items (Strictly dynamic)
  const categoryCounts = useMemo(() => {
    const targetMedia = activeTab === "photos" ? allPhotos : allFilms;
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      if (cat.id === "all") {
        counts.all = targetMedia.length;
      } else {
        counts[cat.id] = targetMedia.filter((m) => cat.matcher(m.category)).length;
      }
    }
    return counts;
  }, [activeTab, allPhotos, allFilms]);

  // Pagination calculation
  const totalPages = useMemo(() => {
    const totalItems = activeTab === "photos" ? filteredPhotos.length : filteredFilms.length;
    return Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  }, [activeTab, filteredPhotos.length, filteredFilms.length]);

  // Current page items
  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPhotos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPhotos, currentPage]);

  const paginatedFilms = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFilms.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFilms, currentPage]);

  // Reset page when category or tab changes
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setLightboxIndex(null);
  };

  const handleTabSelect = (tab: GalleryTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setLightboxIndex(null);
  };

  // Lightbox keyboard navigation
  const activeLightboxPhoto =
    lightboxIndex !== null && filteredPhotos[lightboxIndex]
      ? filteredPhotos[lightboxIndex]
      : null;

  const handleNextPhoto = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex < filteredPhotos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  }, [lightboxIndex, filteredPhotos.length]);

  const handlePrevPhoto = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  }, [lightboxIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeLightboxPhoto && !videoModalFilm) return;

      if (e.key === "Escape") {
        setLightboxIndex(null);
        setVideoModalFilm(null);
      } else if (e.key === "ArrowRight") {
        handleNextPhoto();
      } else if (e.key === "ArrowLeft") {
        handlePrevPhoto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxPhoto, videoModalFilm, handleNextPhoto, handlePrevPhoto]);

  return (
    <div ref={containerRef} className="w-full">
      {/* 1. MEDIA TYPE TABS (Wide Segmented Control matching Visual Reference) */}
      <div className="flex justify-center mb-7 sm:mb-8">
        <div
          role="tablist"
          aria-label="Media Type"
          className="inline-flex p-1 sm:p-1.5 rounded-full bg-[#FAF5EC] border border-[#E7D7C3] shadow-[0_2px_12px_rgba(184,151,94,0.12)] max-w-md w-full sm:w-auto"
        >
          {/* Photographs Tab Button */}
          <motion.button
            type="button"
            role="tab"
            id="tab-photographs"
            aria-selected={activeTab === "photos"}
            aria-controls="panel-photographs"
            onClick={() => handleTabSelect("photos")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative z-10 flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 sm:px-9 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 min-h-[44px] cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]
              ${
                activeTab === "photos"
                  ? "bg-gradient-to-r from-[#7D1525] via-[#8B1A2C] to-[#6A1220] text-white shadow-md shadow-[#7D1525]/25 font-semibold"
                  : "text-[#5C5452] hover:text-[#292322] bg-transparent"
              }
            `}
          >
            {/* Camera / Frame SVG Icon */}
            <svg
              width="18"
              height="18"
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
            <span>Photographs</span>
          </motion.button>

          {/* Wedding Films Tab Button */}
          <motion.button
            type="button"
            role="tab"
            id="tab-films"
            aria-selected={activeTab === "films"}
            aria-controls="panel-films"
            onClick={() => handleTabSelect("films")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative z-10 flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 sm:px-9 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 min-h-[44px] cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]
              ${
                activeTab === "films"
                  ? "bg-gradient-to-r from-[#7D1525] via-[#8B1A2C] to-[#6A1220] text-white shadow-md shadow-[#7D1525]/25 font-semibold"
                  : "text-[#5C5452] hover:text-[#292322] bg-transparent"
              }
            `}
          >
            {/* Film Strip SVG Icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="2.5" ry="2.5" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="17" x2="22" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
            </svg>
            <span>Wedding Films</span>
          </motion.button>
        </div>
      </div>

      {/* 2. CATEGORY FILTER CHIPS (Centered responsive wrapping layout) */}
      <div className="w-full flex justify-center mb-8 sm:mb-10 px-2 sm:px-4">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2 lg:gap-2.5 w-full max-w-6xl">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                whileHover={{ scale: 1.025, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-[13px] font-sans font-medium transition-all duration-200 cursor-pointer
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]
                  ${
                    isSelected
                      ? "bg-[#24181B] text-white border border-[#24181B] shadow-sm font-semibold"
                      : "bg-[#FFFDF9] text-[#4A3E3D] border border-[#E2D2BF] hover:bg-[#FAF4EB] hover:border-[#B8975E]/60 shadow-xs"
                  }
                `}
              >
                {cat.icon(isSelected ? "w-3.5 h-3.5 text-white" : "w-3.5 h-3.5 text-[#B8975E]")}
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] font-sans ${
                    isSelected ? "text-white/80" : "text-[#7A6F6D]"
                  }`}
                >
                  &nbsp;({count})
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN GALLERY CONTENT (Animated tab transitions) */}
      <AnimatePresence mode="wait">
        {activeTab === "photos" ? (
          <motion.div
            key="tabpanel-photos"
            role="tabpanel"
            id="panel-photographs"
            aria-labelledby="tab-photographs"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-10"
          >
            {filteredPhotos.length > 0 ? (
              <>
                {/* 3-Column Desktop / 2-Column Tablet / 1-Column Mobile Photograph Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedPhotos.map((photo, pageIdx) => {
                    const globalIdx = (currentPage - 1) * ITEMS_PER_PAGE + pageIdx;

                    return (
                      <motion.div
                        key={photo.id}
                        role="button"
                        tabIndex={0}
                        aria-label={photo.caption || photo.file_name || `Wedding photograph ${globalIdx + 1}`}
                        onClick={() => setLightboxIndex(globalIdx)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setLightboxIndex(globalIdx);
                          }
                        }}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.45,
                          delay: shouldReduceMotion ? 0 : pageIdx * 0.04,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.008 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                        className="group relative rounded-2xl overflow-hidden bg-white border border-[#E4D5C3] shadow-[0_4px_16px_rgba(41,35,34,0.06)] hover:shadow-[0_12px_28px_rgba(184,151,94,0.22)] hover:border-[#B8975E]/60 transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                      >
                        {/* Aspect Ratio 4:3 Image Container */}
                        <div className="relative aspect-4/3 w-full overflow-hidden bg-[#24181B]/5">
                          <Image
                            src={`/api/media/${photo.id}`}
                            alt={photo.caption || photo.file_name || "Wedding memory photograph"}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            unoptimized
                            draggable={photo.download_enabled}
                            onContextMenu={(e) => {
                              if (!photo.download_enabled) e.preventDefault();
                            }}
                          />

                          {/* Subtle hover gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                          {/* Frosted Glass Media Type Indicator Pill (Bottom-Right) matching Reference */}
                          <div
                            className="absolute bottom-3.5 right-3.5 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/25 flex items-center justify-center text-white/95 shadow-sm pointer-events-none group-hover:bg-black/60 group-hover:scale-105 transition-all"
                            aria-hidden="true"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>

                          {/* Category Tag pill on hover */}
                          <div className="absolute top-3 left-3 opacity-90 group-hover:opacity-100 transition-opacity">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-white/95 text-[#8E6D38] border border-[#B8975E]/30 backdrop-blur-xs shadow-xs">
                              {CATEGORY_LABELS[photo.category] || photo.category}
                            </span>
                          </div>

                          {/* Caption bar on hover if exists */}
                          {photo.caption && (
                            <div className="absolute bottom-3 left-3 right-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                              <p className="font-serif italic text-xs text-white truncate drop-shadow-sm">
                                {photo.caption}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* 4. PAGINATION CONTROLS (Matching Visual Reference `‹ 1 2 3 4 5 ›`) */}
                {totalPages > 1 && (
                  <nav
                    aria-label="Gallery Pagination"
                    className="flex items-center justify-center gap-2 pt-6 sm:pt-8"
                  >
                    {/* Previous Page Button */}
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        containerRef.current?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-9 h-9 rounded-full border border-[#DFCBB5] bg-white text-[#5C5452] flex items-center justify-center hover:border-[#B8975E] hover:text-[#292322] disabled:opacity-35 disabled:cursor-not-allowed transition-colors text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                      aria-label="Previous page"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>

                    {/* Circular Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            containerRef.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className={`
                            w-9 h-9 rounded-full text-xs sm:text-sm font-medium flex items-center justify-center transition-all duration-200 shadow-xs
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]
                            ${
                              isActive
                                ? "bg-[#7D1525] text-white font-semibold shadow-md shadow-[#7D1525]/25 border border-[#7D1525]"
                                : "border border-[#DFCBB5] bg-white text-[#5C5452] hover:border-[#B8975E] hover:text-[#292322]"
                            }
                          `}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Next Page Button */}
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        containerRef.current?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-9 h-9 rounded-full border border-[#DFCBB5] bg-white text-[#5C5452] flex items-center justify-center hover:border-[#B8975E] hover:text-[#292322] disabled:opacity-35 disabled:cursor-not-allowed transition-colors text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                      aria-label="Next page"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </nav>
                )}
              </>
            ) : (
              /* Minimal Romantic Empty State (Strictly NO fake/Pexels photos) */
              <div className="max-w-2xl mx-auto my-8 sm:my-14 p-8 sm:p-12 text-center rounded-3xl bg-[#FFFDF9] border border-[#E7D7C3] shadow-[0_4px_24px_rgba(184,151,94,0.08)]">
                {/* Gold Ornamental Lotus SVG */}
                <div
                  className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#FAF4EB] border border-[#DFCBB5] flex items-center justify-center text-[#B8975E] shadow-xs"
                  aria-hidden="true"
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3c-2 4-5 6-9 7 2 4 6 7 9 11 3-4 7-7 9-11-4-1-7-3-9-7z" />
                    <path d="M12 7c-1 3-3 5-5 6 1 3 3 5 5 8 2-3 4-5 5-8-2-1-4-3-5-6z" />
                  </svg>
                </div>

                <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-sans font-semibold uppercase tracking-[0.16em] bg-[#FAF4EB] text-[#8E6D38] border border-[#B8975E]/30 mb-3.5">
                  Sacred Union Chronicles
                </span>

                <h3 className="font-serif text-2xl sm:text-3xl text-[#292322] font-normal sm:font-medium mb-3">
                  {selectedCategory === "all"
                    ? "Ceremony Memories in the Making"
                    : "No Photographs in this Ceremony Category"}
                </h3>

                <p className="font-serif italic text-base sm:text-lg text-[#5C5452] max-w-lg mx-auto leading-relaxed mb-6">
                  {selectedCategory === "all"
                    ? "Official high-resolution photography and cinematic wedding films will be illuminated here following Mithun & Sakhi's sacred wedding celebrations in Purulia, West Bengal."
                    : "No published photographs have been tagged for this ceremony yet. Select 'All Memories' to view the complete wedding gallery."}
                </p>

                {selectedCategory !== "all" ? (
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("all")}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#7D1525] text-white hover:bg-[#68111E] transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                  >
                    <span>View All Memories</span>
                    <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  <Link
                    href="/#events"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#7D1525] text-white hover:bg-[#68111E] transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                  >
                    <span>Explore Ceremonial Journey</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* WEDDING FILMS TAB */
          <motion.div
            key="tabpanel-films"
            role="tabpanel"
            id="panel-films"
            aria-labelledby="tab-films"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-10"
          >
            {filteredFilms.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedFilms.map((film, pageIdx) => {
                    const videoId = film.youtube_url ? extractYouTubeVideoId(film.youtube_url) : null;
                    const thumbnailUrl = videoId
                      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                      : film.thumbnail_path || "/images/the-sacred-wedding-card.webp";

                    return (
                      <motion.div
                        key={film.id}
                        role="button"
                        tabIndex={0}
                        aria-label={film.caption || "Play Wedding Film"}
                        onClick={() => setVideoModalFilm(film)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setVideoModalFilm(film);
                          }
                        }}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.45,
                          delay: shouldReduceMotion ? 0 : pageIdx * 0.04,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.008 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                        className="group relative rounded-2xl overflow-hidden bg-white border border-[#E4D5C3] shadow-[0_4px_16px_rgba(41,35,34,0.06)] hover:shadow-[0_12px_28px_rgba(184,151,94,0.22)] hover:border-[#B8975E]/60 transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                      >
                        {/* 16:9 Video Aspect Container */}
                        <div className="relative aspect-video w-full overflow-hidden bg-[#24181B]">
                          <Image
                            src={thumbnailUrl}
                            alt={film.caption || "Wedding Film"}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                            unoptimized
                          />

                          {/* Dark overlay for contrast */}
                          <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors pointer-events-none" />

                          {/* Center Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#7D1525]/90 text-white flex items-center justify-center shadow-lg backdrop-blur-xs group-hover:scale-110 group-hover:bg-[#7D1525] transition-all">
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            </div>
                          </div>

                          {/* Frosted Glass Video Indicator Pill (Bottom-Right) */}
                          <div
                            className="absolute bottom-3.5 right-3.5 w-8 h-8 rounded-lg bg-black/45 backdrop-blur-md border border-white/25 flex items-center justify-center text-white/95 shadow-sm pointer-events-none group-hover:scale-105 transition-all"
                            aria-hidden="true"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="2" y="2" width="20" height="20" rx="2.5" ry="2.5" />
                              <line x1="7" y1="2" x2="7" y2="22" />
                              <line x1="17" y1="2" x2="17" y2="22" />
                            </svg>
                          </div>

                          {/* Category Tag (Top-Left) */}
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-white/95 text-[#8E6D38] border border-[#B8975E]/30 backdrop-blur-xs shadow-xs">
                              {CATEGORY_LABELS[film.category] || film.category}
                            </span>
                          </div>
                        </div>

                        {/* Card Info Footer */}
                        <div className="p-4 bg-[#FFFCF6] border-t border-[#E4D5C3]/60 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-serif font-medium text-sm text-[#292322] truncate">
                              {film.caption || "Sacred Wedding Documentary"}
                            </p>
                            <p className="font-sans text-[11px] text-[#7A6F6D] mt-0.5">
                              Official Cinematic Premiere
                            </p>
                          </div>
                          <span className="text-[11px] font-sans font-semibold text-[#7D1525] group-hover:underline shrink-0">
                            Watch Film →
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Films Pagination */}
                {totalPages > 1 && (
                  <nav
                    aria-label="Films Pagination"
                    className="flex items-center justify-center gap-2 pt-6 sm:pt-8"
                  >
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="w-9 h-9 rounded-full border border-[#DFCBB5] bg-white text-[#5C5452] flex items-center justify-center hover:border-[#B8975E] hover:text-[#292322] disabled:opacity-35 disabled:cursor-not-allowed transition-colors text-sm shadow-xs"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-full text-xs sm:text-sm font-medium flex items-center justify-center transition-all duration-200 shadow-xs ${
                          pageNum === currentPage
                            ? "bg-[#7D1525] text-white font-semibold shadow-md shadow-[#7D1525]/25 border border-[#7D1525]"
                            : "border border-[#DFCBB5] bg-white text-[#5C5452] hover:border-[#B8975E] hover:text-[#292322]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="w-9 h-9 rounded-full border border-[#DFCBB5] bg-white text-[#5C5452] flex items-center justify-center hover:border-[#B8975E] hover:text-[#292322] disabled:opacity-35 disabled:cursor-not-allowed transition-colors text-sm shadow-xs"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </nav>
                )}
              </>
            ) : (
              /* Minimal Romantic Empty State for Films */
              <div className="max-w-2xl mx-auto my-8 sm:my-14 p-8 sm:p-12 text-center rounded-3xl bg-[#FFFDF9] border border-[#E7D7C3] shadow-[0_4px_24px_rgba(184,151,94,0.08)]">
                <div
                  className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#FAF4EB] border border-[#DFCBB5] flex items-center justify-center text-[#B8975E] shadow-xs"
                  aria-hidden="true"
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="2.5" ry="2.5" />
                    <line x1="7" y1="2" x2="7" y2="22" />
                    <line x1="17" y1="2" x2="17" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <polygon points="11 9 15 12 11 15 11 9" />
                  </svg>
                </div>

                <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-sans font-semibold uppercase tracking-[0.16em] bg-[#FAF4EB] text-[#8E6D38] border border-[#B8975E]/30 mb-3.5">
                  Cinematic Chronicle
                </span>

                <h3 className="font-serif text-2xl sm:text-3xl text-[#292322] font-normal sm:font-medium mb-3">
                  Wedding Films Premiere Soon
                </h3>

                <p className="font-serif italic text-base sm:text-lg text-[#5C5452] max-w-lg mx-auto leading-relaxed mb-6">
                  The official documentary wedding film, drone cinematography, and ceremony highlight reels will premiere here following the Vedic wedding ceremonies in Purulia.
                </p>

                <Link
                  href="/#events"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#7D1525] text-white hover:bg-[#68111E] transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                >
                  <span>Explore Ceremonial Journey</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. LIGHTBOX MODAL (Aspect-Ratio Preserving, Full Navigation, Download Permissions) */}
      <AnimatePresence>
        {activeLightboxPhoto && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="High Resolution Photograph Viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Lightbox Container */}
            <motion.div
              initial={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 0, scale: 0.96, y: 12 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 0, scale: 0.96, y: 12 }
              }
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar: Counter & Close Button */}
              <div className="w-full flex items-center justify-between pb-3 text-white/90">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider bg-white/15 text-[#DFCEB5] border border-white/20">
                    {CATEGORY_LABELS[activeLightboxPhoto.category] || activeLightboxPhoto.category}
                  </span>
                  <span className="text-xs font-sans text-white/60">
                    {lightboxIndex! + 1} of {filteredPhotos.length}
                  </span>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setLightboxIndex(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                  aria-label="Close viewer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.button>
              </div>

              {/* Image Viewer with Left/Right Arrows */}
              <div className="relative w-full max-h-[70vh] sm:max-h-[76vh] aspect-4/3 sm:aspect-16/10 flex items-center justify-center rounded-xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
                <Image
                  src={`/api/media/${activeLightboxPhoto.id}`}
                  alt={activeLightboxPhoto.caption || activeLightboxPhoto.file_name || "Wedding memory photograph"}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  unoptimized
                  draggable={activeLightboxPhoto.download_enabled}
                  onContextMenu={(e) => {
                    if (!activeLightboxPhoto.download_enabled) e.preventDefault();
                  }}
                />

                {/* Prev Button */}
                {lightboxIndex! > 0 && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                    aria-label="Previous photograph"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </motion.button>
                )}

                {/* Next Button */}
                {lightboxIndex! < filteredPhotos.length - 1 && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                    aria-label="Next photograph"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </motion.button>
                )}
              </div>

              {/* Bottom Bar: Caption & Download Button */}
              <div className="w-full mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
                <div className="text-center sm:text-left">
                  {activeLightboxPhoto.caption ? (
                    <p className="font-serif text-base sm:text-lg italic text-[#FFFCF6]">
                      &ldquo;{activeLightboxPhoto.caption}&rdquo;
                    </p>
                  ) : (
                    <p className="font-sans text-xs text-white/60">
                      Mithun &amp; Sakhi Sacred Wedding — Purulia, West Bengal
                    </p>
                  )}
                </div>

                {activeLightboxPhoto.download_enabled && (
                  <motion.a
                    href={`/api/media/${activeLightboxPhoto.id}?download=1`}
                    download={activeLightboxPhoto.file_name || `mithun-sakhi-${activeLightboxPhoto.id}.jpg`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2 rounded-full text-xs font-sans font-semibold bg-[#B8975E] text-[#24181B] hover:bg-white active:scale-95 transition-all shadow-md inline-flex items-center gap-2 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download High-Resolution</span>
                  </motion.a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. VIDEO MODAL (Wedding Film Playback) */}
      <AnimatePresence>
        {videoModalFilm && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Wedding Film Player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md"
            onClick={() => setVideoModalFilm(null)}
          >
            <motion.div
              initial={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 0, scale: 0.96, y: 12 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 0, scale: 0.96, y: 12 }
              }
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-4xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Close Bar */}
              <div className="w-full flex items-center justify-between pb-3 text-white">
                <span className="font-serif text-base sm:text-lg truncate">
                  {videoModalFilm.caption || "Sacred Wedding Film"}
                </span>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setVideoModalFilm(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
                  aria-label="Close film"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.button>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
                {videoModalFilm.youtube_url ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${extractYouTubeVideoId(videoModalFilm.youtube_url)}?autoplay=1&rel=0&modestbranding=1`}
                    title={videoModalFilm.caption || "Mithun & Sakhi Wedding Film"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                ) : (
                  <video
                    src={`/api/media/${videoModalFilm.id}`}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
