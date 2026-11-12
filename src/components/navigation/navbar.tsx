"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll } from "motion/react";
import { MOTION_SPRINGS, useSmoothScroll } from "@/components/motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { MobileDrawer, NavLinkItem } from "./mobile-drawer";
import { isMemoriesModeActive } from "@/lib/lifecycle";

const emptySubscribe = () => () => {};

export interface NavItemConfig {
  id: string;
  label: string;
  homeHref: string;
  externalHref: string;
  description: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: "home",
    label: "Home",
    homeHref: "#top",
    externalHref: "/",
    description: "Welcome",
  },
  {
    id: "our-story",
    label: "Our Story",
    homeHref: "#our-story",
    externalHref: "/#our-story",
    description: "Bond & Journey",
  },
  {
    id: "celebrations",
    label: "Celebrations",
    homeHref: "#celebrations",
    externalHref: "/#celebrations",
    description: "19–22 Nov",
  },
  {
    id: "events",
    label: "Events",
    homeHref: "#events",
    externalHref: "/#events",
    description: "Sacred Schedule",
  },
  {
    id: "venues",
    label: "Venues",
    homeHref: "#venues",
    externalHref: "/#venues",
    description: "Purulia, WB",
  },
  {
    id: "invitation",
    label: "Invitation",
    homeHref: "#invitation",
    externalHref: "/#invitation",
    description: "Royal Studio",
  },
  {
    id: "gallery",
    label: "Gallery",
    homeHref: "/gallery",
    externalHref: "/gallery",
    description: "Memories",
  },
  {
    id: "wishes",
    label: "Wishes",
    homeHref: "#wishes",
    externalHref: "/#wishes",
    description: "Guest Wall",
  },
  {
    id: "hospitality",
    label: "Contact",
    homeHref: "#hospitality",
    externalHref: "/#hospitality",
    description: "Contact & Assistance",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { scrollTo } = useSmoothScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverCeremonies, setIsOverCeremonies] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [homeActiveSection, setHomeActiveSection] = useState<string>("home");

  // Purely derived active section for non-home routes (prevents cascading-render setState)
  const activeSection = isHome
    ? homeActiveSection
    : pathname === "/gallery"
    ? "gallery"
    : pathname === "/rsvp"
    ? "rsvp"
    : pathname.startsWith("/account")
    ? "account"
    : "";

  const isMemories = useSyncExternalStore(
    emptySubscribe,
    () => isMemoriesModeActive(),
    () => false
  );

  // Motion document scroll progress for the signature deep maroon-red progress bar
  const { scrollYProgress } = useScroll();

  // Over full-bleed hero on homepage before scrolling, or over cinematic dark ceremony panels
  const isTransparentOverHero = isHome && !isScrolled;
  const isDarkSurface = isTransparentOverHero || (isHome && isOverCeremonies);

  const navLinks: NavLinkItem[] = NAV_ITEMS.map((item) => ({
    id: item.id,
    label: item.label,
    href: isHome ? item.homeHref : item.externalHref,
    description: item.description,
  }));

  // Intelligent scroll-aware section detection with zero layout thrashing
  useEffect(() => {
    let ticking = false;
    let sectionTops: Array<{ id: string; top: number }> = [];
    let ceremoniesTop = 0;
    let venuesTop = 0;
    let navbarHeight = 75;

    // Cache section top offsets once on load and on resize (zero getBoundingClientRect in scroll RAF loop)
    const measureSectionOffsets = () => {
      if (!isHome) return;
      const ids = [
        "our-story",
        "celebrations",
        "events",
        "venues",
        "invitation",
        "gallery",
        "wishes",
        "rsvp",
        "hospitality",
      ];
      sectionTops = ids
        .map((id) => {
          const el = document.getElementById(id);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY - 140;
          return { id, top };
        })
        .filter(Boolean) as Array<{ id: string; top: number }>;

      const navbarEl = document.querySelector<HTMLElement>('header[role="banner"]');
      if (navbarEl) {
        navbarHeight = navbarEl.offsetHeight || 75;
      }

      const ceremoniesEl = document.getElementById("ceremonies-stack");
      if (ceremoniesEl) {
        const cRect = ceremoniesEl.getBoundingClientRect();
        ceremoniesTop = cRect.top + window.scrollY;
      }

      const venuesEl = document.getElementById("venues");
      if (venuesEl) {
        const vRect = venuesEl.getBoundingClientRect();
        venuesTop = vRect.top + window.scrollY;
      }
    };

    let measured = false;
    const ensureMeasured = () => {
      if (!measured) {
        measureSectionOffsets();
        measured = true;
      }
    };

    const updateScrollState = () => {
      const scrollY = window.scrollY;
      const scrolled = scrollY > 30;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));

      if (!isHome) {
        setIsOverCeremonies(false);
        ticking = false;
        return;
      }

      // Fast-path at page top: zero layout calculations needed
      if (scrollY <= 10) {
        setIsOverCeremonies(false);
        setHomeActiveSection("home");
        ticking = false;
        return;
      }

      ensureMeasured();

      // Safety check: ensure coordinates are measured
      if (venuesTop === 0) {
        const vEl = document.getElementById("venues");
        if (vEl) {
          venuesTop = vEl.getBoundingClientRect().top + window.scrollY;
        }
      }
      if (ceremoniesTop === 0) {
        const cEl = document.getElementById("ceremonies-stack");
        if (cEl) {
          ceremoniesTop = cEl.getBoundingClientRect().top + window.scrollY;
        }
      }

      // Ceremonies dark-glass coverage:
      // Active through all four ceremony chapters (Haldi, Mehndi, Sacred Wedding, Reception).
      // Transitions to warm-white liquid glass precisely when the top boundary of Venues touches the navbar bottom edge.
      const ceremoniesStart = ceremoniesTop > 0 ? ceremoniesTop - navbarHeight : 0;
      const venuesTouch = venuesTop > 0 ? venuesTop - navbarHeight : Infinity;
      const overCeremonies = scrollY >= ceremoniesStart && scrollY < venuesTouch;
      setIsOverCeremonies((prev) => (prev !== overCeremonies ? overCeremonies : prev));

      // Check bottom of page
      const isAtBottom =
        window.innerHeight + scrollY >=
        document.documentElement.scrollHeight - 60;

      if (isAtBottom) {
        setHomeActiveSection((prev) => (prev !== "hospitality" ? "hospitality" : prev));
      } else {
        // Pure numerical comparison (zero DOM layout access, zero layout thrash!)
        let current = "home";
        for (let i = 0; i < sectionTops.length; i++) {
          if (scrollY >= sectionTops[i].top) {
            current = sectionTops[i].id;
          }
        }
        setHomeActiveSection((prev) => (prev !== current ? current : prev));
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScrollState);
      }
    };

    const onResizeOrChange = () => {
      measured = false;
      if (window.scrollY > 10) {
        ensureMeasured();
        onScroll();
      }
    };

    // Only measure immediately if already scrolled on load (e.g. reload or anchor link)
    let rafId: number | null = null;
    if (window.scrollY > 10) {
      ensureMeasured();
      rafId = window.requestAnimationFrame(updateScrollState);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResizeOrChange, { passive: true });
    window.addEventListener("hashchange", onResizeOrChange, { passive: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResizeOrChange);
      window.removeEventListener("hashchange", onResizeOrChange);
    };
  }, [isHome]);

  // Handle direct hash URL landing and cross-route hash navigation on homepage
  useEffect(() => {
    if (!isHome) return;
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const id = hash.slice(1);
      const timer = window.setTimeout(() => {
        const targetEl = document.getElementById(id);
        if (targetEl) {
          scrollTo(targetEl, { offset: -72 });
          setHomeActiveSection(id);
        }
      }, 150);
      return () => window.clearTimeout(timer);
    }
  }, [isHome, scrollTo]);

  const isLinkActive = (item: NavItemConfig) => {
    return activeSection === item.id;
  };

  const isRsvpActive = isMemories
    ? pathname === "/gallery"
    : pathname === "/rsvp" || (isHome && activeSection === "rsvp");

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: NavItemConfig
  ) => {
    // If clicking Gallery, let standard Next.js navigation open /gallery
    if (item.id === "gallery") {
      return;
    }

    if (isHome) {
      e.preventDefault();
      if (item.id === "home") {
        scrollTo(0);
        window.history.pushState(null, "", window.location.pathname);
        setHomeActiveSection("home");
        return;
      }

      const targetEl = document.getElementById(item.id);
      if (targetEl) {
        setHomeActiveSection(item.id);
        scrollTo(targetEl, { offset: -72 });
        window.history.pushState(null, "", `#${item.id}`);
      }
    }
  };

  return (
    <>
      {/* 1. Signature Deep Maroon / Burgundy Red Scroll Progress Bar */}
      <motion.div
        role="progressbar"
        aria-label="Document scroll progress"
        aria-valuemin={0}
        aria-valuemax={100}
        className="fixed top-0 left-0 right-0 h-[2.5px] z-50 origin-left pointer-events-none bg-gradient-to-r from-[#7D1525] via-[#A52232] to-[#C93B4D] shadow-[0_1px_10px_rgba(165,34,50,0.55)]"
        style={{ scaleX: scrollYProgress }}
      />

      <header
        role="banner"
        className={`
          fixed top-0 left-0 right-0 z-40 transition-all duration-300
          ${
            !isScrolled
              ? "bg-transparent py-4 sm:py-5 border-b border-transparent"
              : isOverCeremonies
              ? "bg-black/40 backdrop-blur-md py-2.5 sm:py-3 border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
              : "bg-[#FFFCF6]/94 backdrop-blur-md py-2.5 sm:py-3 border-b border-[rgba(184,151,94,0.25)] shadow-[0_4px_20px_-2px_rgba(41,35,34,0.04)]"
          }
        `}
      >
        {/* Subtle liquid sheen top highlight on scrolled navbar */}
        {isScrolled && (
          <div
            className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
            aria-hidden="true"
          />
        )}
        <Container size="wide">
          <nav
            aria-label="Primary Navigation"
            className="flex items-center justify-between"
          >
            {/* Brand Logo / Monogram */}
            <Link
              href={isHome ? "#top" : "/"}
              onClick={(e) => {
                if (isHome) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  window.history.pushState(null, "", window.location.pathname);
                  setHomeActiveSection("home");
                }
              }}
              aria-label="Mithun & Sakhi Wedding Home"
              className="group flex items-center gap-2 sm:gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E] focus-visible:ring-offset-2 rounded-[2px] shrink-0"
            >
              {/* Crest Monogram Seal */}
              <span
                className={`
                  flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[3px] border transition-colors shadow-xs
                  ${
                    isDarkSurface
                      ? "border-white/35 bg-black/35 text-[#D4AF37] backdrop-blur-xs group-hover:border-[#D4AF37]"
                      : "border-[rgba(184,151,94,0.4)] bg-white/80 text-[#B8975E] group-hover:border-[#B8975E] group-hover:bg-[#F7F1E6]"
                  }
                `}
              >
                <span className="font-serif text-xs sm:text-sm font-semibold tracking-tighter">
                  M·S
                </span>
              </span>

              <div className="flex flex-col">
                <span
                  className={`
                    font-serif text-base sm:text-lg lg:text-xl font-medium tracking-wide transition-colors leading-tight
                    ${
                      isDarkSurface
                        ? "text-white group-hover:text-[#E8DCC4] drop-shadow-sm"
                        : "text-[#292322] group-hover:text-[#B8975E]"
                    }
                  `}
                >
                  Mithun &amp; Sakhi
                </span>
                <span
                  className={`
                    text-[9px] sm:text-[10px] font-sans uppercase tracking-[0.16em] sm:tracking-[0.18em] hidden sm:block transition-colors
                    ${isDarkSurface ? "text-white/70" : "text-[#8A8280]"}
                  `}
                >
                  Purulia &bull; Nov 2026
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1 xl:gap-1.5">
              {navLinks.map((link) => {
                const itemConfig = NAV_ITEMS.find((it) => it.id === link.id)!;
                const isActive = isLinkActive(itemConfig);

                const linkColor = isDarkSurface
                  ? isActive
                    ? "text-[#D4AF37] font-bold drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                    : "text-white/85 hover:text-[#F3E5AB] drop-shadow-xs"
                  : isActive
                  ? "text-[#A52232] font-bold"
                  : "text-[#292322]/85 hover:text-[#B8975E]";

                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, itemConfig)}
                    className={`
                      group relative px-1.5 md:px-1.5 lg:px-2 xl:px-2.5 py-1.5 md:py-2 text-[10px] md:text-[10.5px] lg:text-[11px] xl:text-xs font-semibold tracking-[0.05em] lg:tracking-[0.06em] xl:tracking-[0.08em] uppercase rounded-[3px]
                      transition-all duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E] focus-visible:ring-offset-2
                      hover:-translate-y-[1px] active:translate-y-[0.5px] active:scale-[0.98]
                      ${linkColor}
                    `}
                  >
                    {/* Subtle Hover Radial Aura */}
                    <span
                      className="pointer-events-none absolute inset-0 rounded-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-radial from-[rgba(212,175,55,0.12)] via-transparent to-transparent"
                      aria-hidden="true"
                    />

                    <span className="relative z-10">{link.label}</span>

                    {/* Shared Motion Active Indicator Underline */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-indicator"
                        className={`absolute bottom-0 left-1.5 right-1.5 lg:left-2 lg:right-2 xl:left-2.5 xl:right-2.5 h-[2px] rounded-full ${
                          isDarkSurface
                            ? "bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)]"
                            : "bg-gradient-to-r from-[#A52232] via-[#C93B4D] to-[#A52232] shadow-[0_0_6px_rgba(165,34,50,0.5)]"
                        }`}
                        transition={MOTION_SPRINGS.responsive}
                      />
                    )}

                    {/* Subtle Inactive Hover Underline Whisper */}
                    {!isActive && (
                      <span
                        className={`absolute bottom-0 left-2 right-2 h-[1px] opacity-0 group-hover:opacity-60 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-center ${
                          isDarkSurface ? "bg-[#D4AF37]" : "bg-[#B8975E]"
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Action & Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden sm:block">
                <Link href={isMemories ? "/gallery" : "/rsvp"}>
                  <Button
                    variant={isMemories ? "outline-maroon" : "primary"}
                    size="sm"
                    className={`
                      transition-all duration-200 hover:-translate-y-[1px] active:translate-y-[0.5px] active:scale-[0.98]
                      ${
                        isRsvpActive
                          ? isDarkSurface
                            ? "ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-black/40 shadow-[0_0_18px_rgba(212,175,55,0.7)] font-bold scale-[1.02]"
                            : "ring-2 ring-[#A52232] ring-offset-2 ring-offset-[#FFFCF6] shadow-[0_0_16px_rgba(165,34,50,0.55)] font-bold scale-[1.02]"
                          : isDarkSurface && !isMemories
                          ? "bg-[#A52232] hover:bg-[#8E1B29] text-white border-0 shadow-md"
                          : "hover:shadow-[0_4px_16px_rgba(165,34,50,0.35)]"
                      }
                    `}
                  >
                    {isMemories ? "Memories" : "RSVP"}
                  </Button>
                </Link>
              </div>

              {/* Mobile Hamburger Toggle (minimum 44x44px touch target) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                aria-label="Open navigation menu"
                className={`
                  md:hidden p-2 rounded-[2px] transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8975E]
                  min-h-[44px] min-w-[44px] flex items-center justify-center
                  ${
                    isDarkSurface
                      ? "text-white hover:bg-white/10"
                      : "text-[#292322] hover:bg-[rgba(184,151,94,0.1)]"
                  }
                `}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </nav>
        </Container>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        links={navLinks}
        activeSection={activeSection}
        isRsvpActive={isRsvpActive}
        isHome={isHome}
      />
    </>
  );
}
