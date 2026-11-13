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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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
      document.body.style.overflow = previousOverflow;
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
        <motion.div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={transitionConfig}
          className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#F7F1E6] px-5 sm:px-6 md:px-8 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] overflow-y-auto lg:hidden"
        >
          {/* Top Bar inside Drawer */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(184,151,94,0.25)]">
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

            {/* Close Button with min 44x44px touch target */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="flex items-center justify-center w-11 h-11 rounded-[4px] text-[#292322] hover:text-[#A52232] hover:bg-[#F7F1E6] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
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
          <div className="py-4 text-center">
            <span className="inline-block text-[10px] font-semibold tracking-[0.25em] uppercase text-[#B8975E]">
              The Wedding Celebration
            </span>
            <div className="font-serif text-2xl font-medium text-[#292322] mt-0.5 tracking-tight">
              M <span className="text-[#B8975E] text-xl font-light">&amp;</span> S
            </div>
            <p className="text-[11px] text-[#5C5452] mt-0.5">
              19–22 November 2026 &bull; Purulia, West Bengal
            </p>
            <OrnamentalDivider variant="gold" size="sm" className="my-2.5" />
          </div>

          {/* Navigation Links */}
          <nav aria-label="Mobile Menu Links" className="flex-1 space-y-1">
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
                      flex items-center justify-between px-3.5 py-2.5 rounded-[4px] min-h-[44px]
                      transition-all duration-200 active:scale-[0.98]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]
                      ${
                        isActive
                          ? "bg-[#F7F1E6] text-[#A52232] font-semibold border-l-3 border-[#A52232] shadow-xs"
                          : "text-[#292322] hover:bg-[#F7F1E6]/70 hover:text-[#B8975E]"
                      }
                    `}
                  >
                    <span className="font-serif text-lg tracking-wide">
                      {link.label}
                    </span>
                    {link.description && (
                      <span className="text-[11px] text-[#8A8280] font-sans">
                        {link.description}
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Bottom Action Area */}
          <div className="pt-4 mt-4 border-t border-[rgba(184,151,94,0.25)] space-y-2.5">
            <Link href="/rsvp" onClick={onClose} className="block w-full">
              <Button
                variant="primary"
                size="md"
                className={`w-full justify-center transition-all ${
                  isRsvpActive
                    ? "ring-2 ring-[#A52232] shadow-[0_0_16px_rgba(165,34,50,0.4)] font-bold scale-[1.01]"
                    : ""
                }`}
              >
                Confirm Attendance (RSVP)
              </Button>
            </Link>

            <div className="flex items-center justify-center gap-4 text-xs text-[#8A8280] pt-1">
              <Link href="/privacy" onClick={onClose} className="hover:text-[#B8975E]">
                Privacy Policy
              </Link>
              <span>&bull;</span>
              <Link href="/terms" onClick={onClose} className="hover:text-[#B8975E]">
                Terms of Use
              </Link>
            </div>

            <p className="text-center text-[10px] text-[#8A8280]">
              Mithun &amp; Sakhi &bull; Sacred Vedic Wedding
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
