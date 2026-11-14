"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  MOTION_DURATIONS,
  MOTION_EASINGS,
  MOTION_STAGGER,
} from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { OrnamentalDivider } from "@/components/ui/ornamental-divider";
import { useSmoothScroll } from "@/components/motion";

export interface NavLinkItem {
  id: string;
  label: string;
  href: string;
  description?: string;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLinkItem[];
  activeSection?: string;
  isRsvpActive?: boolean;
  isHome?: boolean;
}

export function MobileDrawer({
  isOpen,
  onClose,
  links,
  activeSection,
  isRsvpActive = false,
  isHome,
}: MobileDrawerProps) {
  const shouldReduceMotion = useReducedMotion();
  const { scrollTo } = useSmoothScroll();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Lock body scroll and manage keyboard events when open
  useEffect(() => {
    if (!isOpen) return;

    triggerRef.current = document.activeElement as HTMLElement;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Focus the close button when opened for accessibility
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (triggerRef.current && typeof triggerRef.current.focus === "function") {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  const transitionConfig = shouldReduceMotion
    ? { duration: 0 }
    : {
        duration: MOTION_DURATIONS.card,
        ease: MOTION_EASINGS.luxury as [number, number, number, number],
      };

  const handleMobileNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: NavLinkItem
  ) => {
    onClose();

    // If clicking Gallery, let browser navigate to /gallery
    if (link.id === "gallery") {
      return;
    }

    if (isHome) {
      if (link.id === "home") {
        e.preventDefault();
        scrollTo(0);
        window.history.pushState(null, "", window.location.pathname);
        return;
      }

      if (link.href.startsWith("#")) {
        e.preventDefault();
        const targetEl = document.getElementById(link.id);
        if (targetEl) {
          scrollTo(targetEl, { offset: -64 });
          window.history.pushState(null, "", `#${link.id}`);
        }
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Scrim (Prevents accidental background interaction and dismisses drawer on tap) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs lg:hidden"
            aria-hidden="true"
          />

          <motion.div
            ref={drawerRef}
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            initial={{ opacity: 0, y: -16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.99 }}
            transition={transitionConfig}
            className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#F7F1E6] px-4 xs:px-5 sm:px-6 md:px-8 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] overflow-y-auto lg:hidden"
          >
            {/* Top Bar inside Drawer */}
            <div className="flex items-center justify-between pb-3 sm:pb-3.5 border-b border-[rgba(184,151,94,0.25)]">
              <Link
                href={isHome ? "#top" : "/"}
                onClick={(e) => {
                  onClose();
                  if (isHome) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    window.history.pushState(null, "", window.location.pathname);
                  }
                }}
                className="group flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E] rounded-[2px]"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-[3px] border border-[rgba(184,151,94,0.4)] bg-white/90 shadow-xs">
                  <span className="font-serif text-sm font-semibold text-[#B8975E] tracking-tight">
                    M&bull;S
                  </span>
                </span>
                <span className="font-serif text-xl tracking-wider font-medium text-[#292322] group-hover:text-[#B8975E] transition-colors">
                  Mithun &amp; Sakhi
                </span>
              </Link>

              {/* Close Button with min 44x44px touch target (48x48px on standard mobile) */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-lg text-[#292322] hover:text-[#A52232] hover:bg-[#F7F1E6] border border-[rgba(184,151,94,0.3)] bg-white/90 active:scale-95 transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
              >
                <svg
                  width="20"
                  height="20"
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
            </div>

            {/* Center Monogram Crest */}
            <div className="py-3 sm:py-4 text-center select-none">
              <span className="inline-block text-[10px] xs:text-[11px] font-sans font-bold tracking-[0.25em] uppercase text-[#B8975E]">
                The Sacred Wedding Celebration
              </span>
              <div className="font-serif text-2xl sm:text-3xl font-medium text-[#292322] mt-0.5 tracking-tight">
                Mithun <span className="text-[#B8975E] text-xl font-light italic">&amp;</span> Sakhi
              </div>
              <p className="text-xs text-[#5C5452] mt-0.5">
                19–22 November 2026 &bull; Purulia, West Bengal
              </p>
              <OrnamentalDivider variant="gold" size="sm" className="my-2 sm:my-2.5" />
            </div>

            {/* Navigation Links with Thumb-Friendly Touch Targets (min 48px height) */}
            <nav aria-label="Mobile Menu Links" className="flex-1 space-y-1.5 my-1">
              {links.map((link, i) => {
                const isActive = activeSection === link.id;
                return (
                  <motion.div
                    key={link.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            duration: MOTION_DURATIONS.control,
                            delay: 0.02 + i * MOTION_STAGGER.fast,
                            ease: MOTION_EASINGS.luxury as [number, number, number, number],
                          }
                    }
                  >
                    <Link
                      href={link.href}
                      onClick={(e) => handleMobileNavClick(e, link)}
                      className={`
                        flex items-center justify-between px-4 py-3 rounded-lg min-h-[48px]
                        transition-all duration-200 active:scale-[0.985]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]
                        ${
                          isActive
                            ? "bg-gradient-to-r from-[#7D1525]/12 via-[#8E1B29]/6 to-transparent text-[#7D1525] font-semibold border-l-4 border-[#7D1525] shadow-xs"
                            : "text-[#292322] hover:bg-[#F7F1E6]/80 hover:text-[#B8975E] border-l-4 border-transparent active:bg-[#EDE3D0]/60"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#7D1525]" : "bg-[#D4AF37]/50"}`} aria-hidden="true" />
                        <span className="font-serif text-[1.12rem] tracking-wide leading-tight">
                          {link.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {link.description && (
                          <span className="text-[11px] text-[#8A8280] font-sans uppercase tracking-[0.12em]">
                            {link.description}
                          </span>
                        )}
                        <span className={`text-xs transition-transform ${isActive ? "text-[#7D1525] translate-x-0.5" : "text-[#B8975E]/60"}`} aria-hidden="true">
                          &rarr;
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Bottom Action Area */}
            <div className="pt-3.5 mt-3 border-t border-[rgba(184,151,94,0.25)] space-y-2.5">
              <Link href="/rsvp" onClick={onClose} className="block w-full">
                <Button
                  variant="primary"
                  size="md"
                  className={`w-full justify-center h-12 min-h-[48px] rounded-full text-xs font-bold uppercase tracking-[0.16em] bg-gradient-to-r from-[#7D1525] via-[#8E1B29] to-[#6A1220] text-white border border-[#E8929E]/40 shadow-md transition-all active:scale-[0.98] ${
                    isRsvpActive
                      ? "ring-2 ring-[#D4AF37] shadow-[0_0_18px_rgba(212,175,55,0.4)]"
                      : ""
                  }`}
                >
                  Confirm Attendance (RSVP) &rarr;
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-4 text-xs text-[#8A8280] pt-1">
                <Link href="/privacy" onClick={onClose} className="min-h-[44px] inline-flex items-center hover:text-[#B8975E] py-2 px-1">
                  Privacy Policy
                </Link>
                <span aria-hidden="true">&bull;</span>
                <Link href="/terms" onClick={onClose} className="min-h-[44px] inline-flex items-center hover:text-[#B8975E] py-2 px-1">
                  Terms of Use
                </Link>
              </div>

              <p className="text-center text-[10.5px] text-[#8A8280]">
                Mithun &amp; Sakhi &bull; Sacred Vedic Wedding &bull; Purulia
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
