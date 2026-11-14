"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAudio } from "./audio-provider";
import { MagneticButton } from "@/components/interactive";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function FloatingMusicPlayer() {
  const {
    playlist,
    currentTrackIndex,
    currentTrack,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    progress,
    isLoading,
    hasError,
    errorMessage,
    togglePlay,
    playTrack,
    nextTrack,
    previousTrack,
    seek,
    toggleMute,
    dismissNotice,
  } = useAudio();

  // Desktop states (>= 1024px)
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isTucked, setIsTucked] = useState<boolean>(false);

  // Mobile states (< 1024px)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState<boolean>(false);
  const isMobileSheetOpenRef = useRef<boolean>(false);

  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync ref and lock body scroll on mobile bottom sheet open
  useEffect(() => {
    isMobileSheetOpenRef.current = isMobileSheetOpen;
    if (isMobileSheetOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileSheetOpen]);

  // Defer scroll activity and external modal lock observers until after idle
  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let idleTimer: any = null;

    const setupObservers = () => {
      let scrollingActive = false;
      const handleScroll = () => {
        if (!scrollingActive) {
          scrollingActive = true;
          setIsScrolling(true);
        }
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
        scrollTimerRef.current = setTimeout(() => {
          scrollingActive = false;
          setIsScrolling(false);
        }, 700);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });

      const checkModalState = () => {
        if (typeof document !== "undefined") {
          // Suppress only when an EXTERNAL modal (e.g. mobile drawer or lightbox) is open,
          // not when our own mobile bottom sheet is controlling body overflow.
          if (!isMobileSheetOpenRef.current) {
            setIsModalOpen(document.body.style.overflow === "hidden");
          }
        }
      };

      checkModalState();
      const observer = new MutationObserver(checkModalState);
      if (typeof document !== "undefined" && document.body) {
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ["style"],
        });
      }

      cleanup = () => {
        window.removeEventListener("scroll", handleScroll);
        observer.disconnect();
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      };
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleTimer = (window as any).requestIdleCallback(setupObservers, { timeout: 2000 });
    } else {
      idleTimer = setTimeout(setupObservers, 1200);
    }

    return () => {
      if (idleTimer) {
        if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
          (window as any).cancelIdleCallback(idleTimer);
        } else {
          clearTimeout(idleTimer);
        }
      }
      if (cleanup) cleanup();
    };
  }, []);

  // Keyboard accessibility for Escape key to dismiss expanded card or mobile sheet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isMobileSheetOpen) {
          setIsMobileSheetOpen(false);
        }
        if (isExpanded) {
          setIsExpanded(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, isMobileSheetOpen]);

  // Suppress completely when full-screen drawers or external modal dialogs are open
  if (isModalOpen) {
    return null;
  }

  return (
    <>
      {/* ============================================================= */}
      {/* 1. DESKTOP FLOATING CONTROLS (>= 1024px) — 100% LOCKED        */}
      {/* ============================================================= */}
      <aside
        aria-label="Wedding audio player"
        className={`hidden lg:flex fixed bottom-6 right-6 z-30 print:hidden flex-col items-end pointer-events-none pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] transition-opacity duration-300 ${
          isScrolling && !isExpanded
            ? "opacity-50 hover:opacity-100 focus-within:opacity-100"
            : "opacity-100"
        }`}
      >
        {/* Error notification banner if audio load fails */}
        {hasError && errorMessage && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto mb-2 max-w-xs bg-[#292322] text-[#FFFDF9] border border-[#B8975E]/40 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#A52232] shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-serif italic text-xs">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={dismissNotice}
              className="text-[#B8975E] hover:text-white text-base font-bold px-1.5 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[#B8975E]"
              aria-label="Dismiss notice"
            >
              &times;
            </button>
          </div>
        )}

        {isTucked ? (
          /* Tucked Edge Dock: Discreetly docked against screen margin */
          <MagneticButton maxDistanceX={5} maxDistanceY={4} className="pointer-events-auto">
            <div className="pointer-events-auto -mr-6 bg-[#240A12]/95 hover:bg-[#240A12] backdrop-blur-md border-t border-b border-l border-[#D4AF37]/70 py-1.5 pl-3 pr-2 rounded-l-full shadow-lg hover:shadow-[0_0_16px_rgba(212,175,55,0.3)] transition-all duration-300 flex items-center">
              <button
                type="button"
                onClick={() => setIsTucked(false)}
                aria-label="Expand wedding music player"
                title="Expand wedding music player"
                className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#FFE8A3] min-h-[44px] min-w-[44px] justify-center px-1 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] rounded-l-full cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                {isPlaying ? (
                  <span
                    className="flex items-end gap-[2px] h-3.5"
                    aria-hidden="true"
                  >
                    <span className="w-[2px] bg-current rounded-full animate-[musicBar_0.8s_ease-in-out_infinite] h-3.5" />
                    <span className="w-[2px] bg-current rounded-full animate-[musicBar_0.6s_ease-in-out_infinite_0.2s] h-2" />
                    <span className="w-[2px] bg-current rounded-full animate-[musicBar_0.9s_ease-in-out_infinite_0.4s] h-3" />
                  </span>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                )}
                <svg
                  className="w-3.5 h-3.5 text-[#D4AF37]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>
          </MagneticButton>
        ) : (
          /* Standard Desktop Luxury Pill Container */
          <MagneticButton maxDistanceX={6} maxDistanceY={5} className="pointer-events-auto">
            <div className="relative pointer-events-auto flex items-center gap-2.5 bg-[#240A12]/90 hover:bg-[#240A12]/95 backdrop-blur-md border border-[#D4AF37]/50 p-1.5 pl-2 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.65),0_0_18px_rgba(212,175,55,0.22)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.75),0_0_24px_rgba(212,175,55,0.35)] transition-all duration-300 overflow-hidden">
              {/* Top Liquid Glass Highlight Sheen */}
              <div
                className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-[#FFE8A3]/40 to-transparent pointer-events-none"
                aria-hidden="true"
              />
              {/* Left Circular Album Artwork Thumbnail */}
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                aria-label={`Open wedding playlist. Current song: ${currentTrack.title}`}
                title="Click to view playlist"
                className="flex items-center gap-2.5 pr-1 text-left focus:outline-none focus:ring-1 focus:ring-[#D4AF37] rounded-full min-h-[40px] cursor-pointer group hover:scale-[1.02] transition-transform"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D4AF37]/70 shrink-0 relative bg-[#1A050B] shadow-inner flex items-center justify-center">
                  {/* Visual Album Crest */}
                  <div className="w-full h-full bg-gradient-to-tr from-[#3D0C1A] via-[#6B1527] to-[#8A1A30] flex items-center justify-center text-[#D4AF37]">
                    {isPlaying ? (
                      <span className="flex items-end gap-[2px] h-3.5" aria-hidden="true">
                        <span className="w-[2px] bg-current rounded-full animate-[musicBar_0.8s_ease-in-out_infinite] h-3.5" />
                        <span className="w-[2px] bg-current rounded-full animate-[musicBar_0.6s_ease-in-out_infinite_0.2s] h-1.5" />
                        <span className="w-[2px] bg-current rounded-full animate-[musicBar_0.9s_ease-in-out_infinite_0.4s] h-2.5" />
                      </span>
                    ) : (
                      <svg className="w-4 h-4 text-[#D4AF37]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="flex flex-col">
                  <span className="font-serif text-sm font-medium text-[#FFFDF8] group-hover:text-[#FFE8A3] transition-colors leading-tight max-w-[150px] truncate">
                    {currentTrack.title}
                  </span>
                  <span className="text-[8.5px] font-sans uppercase tracking-[0.2em] text-[#D4AF37] leading-none mt-0.5">
                    Wedding Melodies
                  </span>
                </div>
              </button>

              {/* Previous Track Button */}
              <button
                type="button"
                onClick={previousTrack}
                aria-label="Previous song"
                title="Previous song"
                className="flex items-center justify-center w-8 h-8 rounded-full text-[#D4AF37]/90 hover:text-[#FFE8A3] hover:scale-110 hover:bg-white/10 active:scale-90 transition-all focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              {/* Play / Pause Main Button (Solid Gold Circle) */}
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause wedding music" : "Play wedding music"}
                title={isPlaying ? "Pause music" : "Play music"}
                className="w-8.5 h-8.5 rounded-full bg-[#D4AF37] hover:bg-[#E5C158] hover:scale-105 hover:shadow-[0_0_12px_rgba(212,175,55,0.6)] active:scale-95 text-[#240A12] flex items-center justify-center transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin w-3.5 h-3.5 text-[#240A12]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
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
                ) : isPlaying ? (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Next Track Button */}
              <button
                type="button"
                onClick={nextTrack}
                aria-label="Next song"
                title="Next song"
                className="flex items-center justify-center w-8 h-8 rounded-full text-[#D4AF37]/90 hover:text-[#FFE8A3] hover:scale-110 hover:bg-white/10 active:scale-90 transition-all focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>

              {/* Playlist Drawer Button */}
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                aria-label="Open wedding playlist"
                title="Open playlist"
                className="flex items-center justify-center w-8 h-8 rounded-full text-[#D4AF37]/90 hover:text-[#FFE8A3] hover:scale-110 hover:bg-white/10 active:scale-90 transition-all focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Minimize / Tuck to Edge button */}
              <button
                type="button"
                onClick={() => setIsTucked(true)}
                aria-label="Minimize player to edge"
                title="Minimize player to screen edge"
                className="text-[#D4AF37]/60 hover:text-[#FFE8A3] hover:scale-110 active:scale-90 text-xs px-1 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer transition-all"
              >
                &rsaquo;
              </button>
            </div>
          </MagneticButton>
        )}
      </aside>

      {/* ============================================================= */}
      {/* 2. DESKTOP EXPANDED WEDDING MUSIC CARD (>= 1024px) — LOCKED   */}
      {/* ============================================================= */}
      {isExpanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Wedding Music Player & Playlist"
          className="hidden lg:flex fixed inset-0 z-50 items-center justify-center p-4 bg-[#0D1B2A]/40 backdrop-blur-xs animate-in fade-in duration-200 print:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsExpanded(false);
            }
          }}
        >
          <div className="relative w-full max-w-md bg-[#FFFCF6] border-2 border-[#B8975E]/60 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header with Title and Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-[#B8975E]/20">
              <div>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#B8975E] block">
                  Wedding Celebration Melodies
                </span>
                <span className="font-serif italic text-xs text-[#5C5452]">
                  Mithun &amp; Sakhi Sacred Vows
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label="Close music player card"
                className="w-11 h-11 rounded-full border border-[#B8975E]/30 text-[#292322] hover:text-[#A52232] hover:bg-[#F7F1E6] flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8975E] cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Currently Playing Card Showcase */}
            <div className="my-4 p-4 rounded-xl bg-gradient-to-b from-[#FFFDF8] to-[#F7F1E6]/70 border border-[#B8975E]/35 text-center flex flex-col items-center">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider text-[#A52232] bg-[#A52232]/10 border border-[#A52232]/25 mb-1.5">
                Track {currentTrackIndex + 1} of {playlist.length}
              </span>

              <h3 className="font-serif text-3xl font-normal text-[#292322] tracking-wide mt-0.5">
                {currentTrack.title}
              </h3>

              {/* Animated Waveform Equalizer */}
              <div
                className="my-3 flex items-end justify-center gap-1.5 h-8 w-24"
                aria-hidden="true"
              >
                <span
                  className={`w-1 rounded-full ${
                    isPlaying
                      ? "bg-[#A52232] animate-[musicBar_0.8s_ease-in-out_infinite]"
                      : "bg-[#B8975E]/40 h-2"
                  }`}
                />
                <span
                  className={`w-1 rounded-full ${
                    isPlaying
                      ? "bg-[#B8975E] animate-[musicBar_0.6s_ease-in-out_infinite_0.15s]"
                      : "bg-[#B8975E]/40 h-4"
                  }`}
                />
                <span
                  className={`w-1 rounded-full ${
                    isPlaying
                      ? "bg-[#A52232] animate-[musicBar_1.1s_ease-in-out_infinite_0.3s]"
                      : "bg-[#B8975E]/40 h-6"
                  }`}
                />
                <span
                  className={`w-1 rounded-full ${
                    isPlaying
                      ? "bg-[#B8975E] animate-[musicBar_0.7s_ease-in-out_infinite_0.1s]"
                      : "bg-[#B8975E]/40 h-3"
                  }`}
                />
                <span
                  className={`w-1 rounded-full ${
                    isPlaying
                      ? "bg-[#A52232] animate-[musicBar_0.9s_ease-in-out_infinite_0.25s]"
                      : "bg-[#B8975E]/40 h-5"
                  }`}
                />
              </div>

              {/* Playing Status Label */}
              <span className="text-[11px] font-sans font-medium text-[#5C5452]">
                {isPlaying ? (
                  <span className="text-[#A52232] font-semibold">
                    &bull; Playing Now
                  </span>
                ) : (
                  <span>Paused</span>
                )}
              </span>

              {/* Progress Slider Bar */}
              <div className="w-full mt-3 space-y-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.5}
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  aria-label={`Playback progress: ${formatTime(currentTime)} of ${formatTime(duration)}`}
                  className="w-full h-1.5 bg-[#B8975E]/20 rounded-full appearance-none cursor-pointer accent-[#A52232] focus:outline-none focus:ring-1 focus:ring-[#B8975E]"
                  style={{
                    background: `linear-gradient(to right, #A52232 0%, #A52232 ${progress}%, rgba(184,151,94,0.2) ${progress}%, rgba(184,151,94,0.2) 100%)`,
                  }}
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8A8280]">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Primary Playback Controls Row */}
              <div className="flex items-center justify-center gap-4 mt-3">
                {/* Previous Track */}
                <button
                  type="button"
                  onClick={previousTrack}
                  aria-label="Previous song"
                  title="Previous song"
                  className="w-11 h-11 rounded-full border border-[#B8975E]/40 bg-white hover:bg-[#F7F1E6] active:scale-95 text-[#292322] flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#B8975E] cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Play / Pause Main CTA */}
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={
                    isPlaying ? "Pause wedding music" : "Play wedding music"
                  }
                  title={isPlaying ? "Pause" : "Play"}
                  className="w-14 h-14 rounded-full bg-[#A52232] hover:bg-[#8E1B29] text-white shadow-md flex items-center justify-center transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#B8975E] cursor-pointer"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin w-6 h-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
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
                  ) : isPlaying ? (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 translate-x-[1px]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Next Track */}
                <button
                  type="button"
                  onClick={nextTrack}
                  aria-label="Next song"
                  title="Next song"
                  className="w-11 h-11 rounded-full border border-[#B8975E]/40 bg-white hover:bg-[#F7F1E6] active:scale-95 text-[#292322] flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#B8975E] cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Mute Toggle */}
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                  title={isMuted ? "Unmute" : "Mute"}
                  className="w-11 h-11 rounded-full border border-[#B8975E]/40 bg-white hover:bg-[#F7F1E6] active:scale-95 text-[#5C5452] flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#B8975E] cursor-pointer"
                >
                  {isMuted ? (
                    <svg
                      className="w-4 h-4 text-[#A52232]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-[#8E6D38]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Interactive 6-Song Playlist */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#8A8280] block mb-2 px-1">
                Celebration Playlist (6 Tracks)
              </span>

              {playlist.map((track, idx) => {
                const isCurrent = idx === currentTrackIndex;

                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => playTrack(idx)}
                    aria-label={`Play track ${idx + 1}: ${track.title}`}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all duration-150 active:scale-[0.985] min-h-[44px] cursor-pointer ${
                      isCurrent
                        ? "bg-[#FFFDF8] border-[#A52232]/60 text-[#A52232] shadow-xs"
                        : "bg-white/80 border-[#B8975E]/20 hover:border-[#B8975E]/50 text-[#292322]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-mono font-medium ${
                          isCurrent ? "text-[#A52232]" : "text-[#8A8280]"
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <span
                        className={`font-serif text-base tracking-wide ${
                          isCurrent
                            ? "font-semibold text-[#A52232]"
                            : "font-normal text-[#292322]"
                        }`}
                      >
                        {track.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent && isPlaying ? (
                        <span
                          className="flex items-end gap-[2px] h-3.5"
                          aria-hidden="true"
                        >
                          <span className="w-[2px] bg-[#A52232] rounded-full animate-[musicBar_0.8s_ease-in-out_infinite] h-3.5" />
                          <span className="w-[2px] bg-[#B8975E] rounded-full animate-[musicBar_0.6s_ease-in-out_infinite_0.2s] h-2" />
                          <span className="w-[2px] bg-[#A52232] rounded-full animate-[musicBar_0.9s_ease-in-out_infinite_0.4s] h-3" />
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#A52232] px-2 py-0.5 rounded-full bg-[#A52232]/10">
                          Selected
                        </span>
                      ) : (
                        <svg
                          className="w-4 h-4 text-[#8A8280]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 3. MOBILE & TABLET FLOATING CONTROLS (< 1024px)               */}
      {/* ============================================================= */}
      <div className="lg:hidden">
        {/* Error notification banner if audio load fails */}
        {hasError && errorMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed z-40 left-4 right-4 max-w-sm mx-auto bg-[#292322] text-[#FFFDF9] border border-[#B8975E]/40 px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{ bottom: "max(5.5rem, calc(4.75rem + env(safe-area-inset-bottom, 0px)))" }}
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#A52232] shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-serif italic text-xs">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={dismissNotice}
              className="text-[#B8975E] hover:text-white text-base font-bold px-1.5 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[#B8975E]"
              aria-label="Dismiss notice"
            >
              &times;
            </button>
          </div>
        )}

        {/* Minimal Circular Floating Music Control (Target 48-52px: exact 50px) */}
        {!isMobileSheetOpen && (
          <aside
            aria-label="Wedding audio quick control"
            className="fixed z-40 print:hidden pointer-events-auto lg:hidden"
            style={{
              bottom: "max(1.25rem, calc(0.75rem + env(safe-area-inset-bottom, 0px)))",
              right: "max(1rem, calc(0.75rem + env(safe-area-inset-right, 0px)))",
            }}
          >
            <button
              type="button"
              onClick={() => setIsMobileSheetOpen(true)}
              aria-label={
                isPlaying
                  ? `Now playing: ${currentTrack.title}. Tap to open wedding music player`
                  : `Music paused. Tap to open wedding music player`
              }
              title={isPlaying ? `Playing: ${currentTrack.title}` : "Wedding Music Player"}
              aria-haspopup="dialog"
              aria-expanded={isMobileSheetOpen}
              className={`w-[50px] h-[50px] rounded-full bg-[#240A12]/92 hover:bg-[#240A12] backdrop-blur-md border border-[#D4AF37]/50 shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_12px_rgba(212,175,55,0.22)] active:scale-95 transition-all duration-300 flex items-center justify-center relative cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                isScrolling ? "opacity-60" : "opacity-100"
              }`}
            >
              {/* Top Gold Specular Highlight */}
              <div
                className="absolute top-1 inset-x-2.5 h-[1px] bg-gradient-to-r from-transparent via-[#FFE8A3]/45 to-transparent pointer-events-none rounded-full"
                aria-hidden="true"
              />

              {/* Ambient Breathing Glow Ring when playing */}
              {isPlaying && (
                <span
                  className="absolute -inset-1 rounded-full border border-[#D4AF37]/30 animate-pulse pointer-events-none"
                  aria-hidden="true"
                />
              )}

              {/* Center Playback State Indicator */}
              {isLoading ? (
                <svg
                  className="animate-spin w-4 h-4 text-[#D4AF37]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
              ) : isPlaying ? (
                <span className="flex items-end gap-[3px] h-4" aria-hidden="true">
                  <span className="w-[2.5px] bg-[#FFE8A3] rounded-full animate-[musicBar_0.8s_ease-in-out_infinite] h-3.5" />
                  <span className="w-[2.5px] bg-[#D4AF37] rounded-full animate-[musicBar_0.6s_ease-in-out_infinite_0.2s] h-2" />
                  <span className="w-[2.5px] bg-[#FFE8A3] rounded-full animate-[musicBar_0.9s_ease-in-out_infinite_0.4s] h-3" />
                </span>
              ) : (
                <svg
                  className="w-5 h-5 text-[#D4AF37] transition-transform group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              )}

              {/* Active Golden Dot Badge when playing */}
              {isPlaying && (
                <span
                  className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#D4AF37] ring-2 ring-[#240A12] shadow-xs"
                  aria-hidden="true"
                />
              )}
            </button>
          </aside>
        )}

        {/* Mobile Expanded Player Bottom Sheet */}
        {isMobileSheetOpen && (
          <>
            {/* Backdrop: intercepts background interactions and dismisses sheet */}
            <div
              className="fixed inset-0 z-50 bg-[#0D1B2A]/50 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => setIsMobileSheetOpen(false)}
              aria-hidden="true"
            />

            {/* Bottom Sheet Panel */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Wedding Music Player & Playlist"
              className="fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[85vh] sm:max-h-[80vh] bg-[#FFFCF6] border-t-2 border-x border-[#B8975E]/50 rounded-t-[28px] sm:rounded-t-[32px] shadow-[0_-16px_48px_rgba(0,0,0,0.35)] animate-in slide-in-from-bottom duration-300 overflow-hidden mx-auto max-w-lg w-full"
            >
              {/* Top Pull Notch Handle */}
              <div
                className="w-12 h-1 bg-[#B8975E]/30 rounded-full mx-auto mt-2.5 mb-1 shrink-0"
                aria-hidden="true"
              />

              {/* Sheet Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#B8975E]/20 shrink-0">
                <div>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#B8975E] block">
                    Wedding Celebration Melodies
                  </span>
                  <span className="font-serif italic text-xs text-[#5C5452]">
                    Mithun &amp; Sakhi Sacred Vows
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileSheetOpen(false)}
                  aria-label="Collapse music player"
                  className="w-9 h-9 rounded-full border border-[#B8975E]/30 bg-white/80 hover:bg-[#F7F1E6] active:scale-95 text-[#292322] flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#B8975E] cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 text-[#292322]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
                {/* Currently Playing Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#FFFDF8] to-[#F7F1E6]/70 border border-[#B8975E]/35 text-center flex flex-col items-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider text-[#A52232] bg-[#A52232]/10 border border-[#A52232]/25 mb-1.5">
                    Track {currentTrackIndex + 1} of {playlist.length}
                  </span>

                  <h3 className="font-serif text-2xl font-normal text-[#292322] tracking-wide mt-0.5">
                    {currentTrack.title}
                  </h3>

                  {/* Equalizer Waveform */}
                  <div
                    className="my-3 flex items-end justify-center gap-1.5 h-7 w-20"
                    aria-hidden="true"
                  >
                    <span
                      className={`w-1 rounded-full ${
                        isPlaying
                          ? "bg-[#A52232] animate-[musicBar_0.8s_ease-in-out_infinite]"
                          : "bg-[#B8975E]/40 h-2"
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full ${
                        isPlaying
                          ? "bg-[#B8975E] animate-[musicBar_0.6s_ease-in-out_infinite_0.15s]"
                          : "bg-[#B8975E]/40 h-4"
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full ${
                        isPlaying
                          ? "bg-[#A52232] animate-[musicBar_1.1s_ease-in-out_infinite_0.3s]"
                          : "bg-[#B8975E]/40 h-6"
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full ${
                        isPlaying
                          ? "bg-[#B8975E] animate-[musicBar_0.7s_ease-in-out_infinite_0.1s]"
                          : "bg-[#B8975E]/40 h-3"
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full ${
                        isPlaying
                          ? "bg-[#A52232] animate-[musicBar_0.9s_ease-in-out_infinite_0.25s]"
                          : "bg-[#B8975E]/40 h-5"
                      }`}
                    />
                  </div>

                  {/* Status */}
                  <span className="text-[11px] font-sans font-medium text-[#5C5452]">
                    {isPlaying ? (
                      <span className="text-[#A52232] font-semibold">
                        &bull; Playing Now
                      </span>
                    ) : (
                      <span>Paused</span>
                    )}
                  </span>

                  {/* Progress Bar */}
                  <div className="w-full mt-3 space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.5}
                      value={currentTime}
                      onChange={(e) => seek(parseFloat(e.target.value))}
                      aria-label={`Playback progress: ${formatTime(currentTime)} of ${formatTime(duration)}`}
                      className="w-full h-1.5 bg-[#B8975E]/20 rounded-full appearance-none cursor-pointer accent-[#A52232] focus:outline-none focus:ring-1 focus:ring-[#B8975E]"
                      style={{
                        background: `linear-gradient(to right, #A52232 0%, #A52232 ${progress}%, rgba(184,151,94,0.2) ${progress}%, rgba(184,151,94,0.2) 100%)`,
                      }}
                    />
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8A8280]">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Transport Controls */}
                  <div className="flex items-center justify-center gap-3 mt-3">
                    {/* Previous Track */}
                    <button
                      type="button"
                      onClick={previousTrack}
                      aria-label="Previous song"
                      title="Previous song"
                      className="w-11 h-11 rounded-full border border-[#B8975E]/40 bg-white hover:bg-[#F7F1E6] active:scale-95 text-[#292322] flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#B8975E] cursor-pointer"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Main Play/Pause */}
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={
                        isPlaying ? "Pause wedding music" : "Play wedding music"
                      }
                      title={isPlaying ? "Pause" : "Play"}
                      className="w-14 h-14 rounded-full bg-[#A52232] hover:bg-[#8E1B29] text-white shadow-md flex items-center justify-center transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#B8975E] cursor-pointer"
                    >
                      {isLoading ? (
                        <svg
                          className="animate-spin w-6 h-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
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
                      ) : isPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6 translate-x-[1px]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    {/* Next Track */}
                    <button
                      type="button"
                      onClick={nextTrack}
                      aria-label="Next song"
                      title="Next song"
                      className="w-11 h-11 rounded-full border border-[#B8975E]/40 bg-white hover:bg-[#F7F1E6] active:scale-95 text-[#292322] flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#B8975E] cursor-pointer"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    {/* Mute Toggle */}
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                      title={isMuted ? "Unmute" : "Mute"}
                      className="w-11 h-11 rounded-full border border-[#B8975E]/40 bg-white hover:bg-[#F7F1E6] active:scale-95 text-[#5C5452] flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#B8975E] cursor-pointer"
                    >
                      {isMuted ? (
                        <svg
                          className="w-4 h-4 text-[#A52232]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-[#8E6D38]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Playlist Selection Roster */}
                <div className="space-y-1.5 pb-2">
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#8A8280] block mb-2 px-1">
                    Celebration Playlist (6 Tracks)
                  </span>

                  {playlist.map((track, idx) => {
                    const isCurrent = idx === currentTrackIndex;

                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => playTrack(idx)}
                        aria-label={`Play track ${idx + 1}: ${track.title}`}
                        className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all duration-150 active:scale-[0.985] min-h-[44px] cursor-pointer ${
                          isCurrent
                            ? "bg-[#FFFDF8] border-[#A52232]/60 text-[#A52232] shadow-xs"
                            : "bg-white/80 border-[#B8975E]/20 hover:border-[#B8975E]/50 text-[#292322]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-mono font-medium ${
                              isCurrent ? "text-[#A52232]" : "text-[#8A8280]"
                            }`}
                          >
                            0{idx + 1}
                          </span>
                          <span
                            className={`font-serif text-base tracking-wide ${
                              isCurrent
                                ? "font-semibold text-[#A52232]"
                                : "font-normal text-[#292322]"
                            }`}
                          >
                            {track.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCurrent && isPlaying ? (
                            <span
                              className="flex items-end gap-[2px] h-3.5"
                              aria-hidden="true"
                            >
                              <span className="w-[2px] bg-[#A52232] rounded-full animate-[musicBar_0.8s_ease-in-out_infinite] h-3.5" />
                              <span className="w-[2px] bg-[#B8975E] rounded-full animate-[musicBar_0.6s_ease-in-out_infinite_0.2s] h-2" />
                              <span className="w-[2px] bg-[#A52232] rounded-full animate-[musicBar_0.9s_ease-in-out_infinite_0.4s] h-3" />
                            </span>
                          ) : isCurrent ? (
                            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#A52232] px-2 py-0.5 rounded-full bg-[#A52232]/10">
                              Selected
                            </span>
                          ) : (
                            <svg
                              className="w-4 h-4 text-[#8A8280]"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Safe-Area Inset Space */}
              <div
                className="shrink-0"
                style={{ height: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}
                aria-hidden="true"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
