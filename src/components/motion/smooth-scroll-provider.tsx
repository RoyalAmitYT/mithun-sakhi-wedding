"use client";

import React, { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { useMotionReduced } from "@/lib/motion";

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: {
      offset?: number;
      duration?: number;
      immediate?: boolean;
      lock?: boolean;
    }
  ) => void;
}

let globalLenis: Lenis | null = null;
let lenisSubscribers: Array<() => void> = [];

function notifySubscribers() {
  lenisSubscribers.forEach((cb) => cb());
}

function subscribeToLenis(callback: () => void) {
  lenisSubscribers.push(callback);
  return () => {
    lenisSubscribers = lenisSubscribers.filter((cb) => cb !== callback);
  };
}

function getLenisSnapshot(): Lenis | null {
  return globalLenis;
}

function getLenisServerSnapshot(): null {
  return null;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

/**
 * SmoothScrollProvider
 * Single centralized smooth scroll controller for the Mithun & Sakhi Wedding Website.
 * 
 * Features:
 * - Natural exponential deceleration curve (luxury editorial momentum).
 * - 100% native touch scrolling preserved on mobile/tablet (syncTouch: false).
 * - Automatic deactivation under `prefers-reduced-motion: reduce`.
 * - Automatic suspension (lenis.stop()) when full-screen drawers or modals lock body scroll.
 * - Seamless anchor link support with header offset compensation.
 * - Route transition reset to top (immediate).
 * - Fully compliant with React 19 concurrent rendering via useSyncExternalStore.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldReduceMotion = useMotionReduced();
  const activeLenis = useSyncExternalStore(
    subscribeToLenis,
    getLenisSnapshot,
    getLenisServerSnapshot
  );

  useEffect(() => {
    // Mobile devices use 100% native momentum scrolling; skip Lenis allocation and listeners on mobile
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      if (globalLenis) {
        globalLenis.destroy();
        globalLenis = null;
        notifySubscribers();
      }
      return;
    }

    // If user prefers reduced motion, do not enable smooth wheel interpolation
    if (shouldReduceMotion) {
      if (globalLenis) {
        globalLenis.destroy();
        globalLenis = null;
        notifySubscribers();
      }
      return;
    }

    // Initialize one global Lenis controller
    const lenis = new Lenis({
      duration: 1.0, // Natural luxury editorial momentum
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential decay curve
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      syncTouch: false, // Strictly preserve 100% native mobile touch momentum
      touchMultiplier: 1,
      wheelMultiplier: 1.0, // Natural 1:1 responsive wheel input
      autoRaf: typeof window !== "undefined" ? window.innerWidth >= 768 : true, // Optimized: avoid idle mobile RAF loop while preserving desktop smooth wheel
      anchors: true,
      prevent: (node: HTMLElement) => {
        // Prevent Lenis from intercepting scroll inside modals or drawers
        return (
          node.hasAttribute("data-lenis-prevent") ||
          node.closest("[data-lenis-prevent]") !== null ||
          node.closest("[role='dialog']") !== null
        );
      },
    });

    globalLenis = lenis;
    notifySubscribers();

    // Monitor modal lock (body overflow: hidden) to cleanly suspend Lenis
    const checkBodyLock = () => {
      if (typeof document !== "undefined" && document.body) {
        if (document.body.style.overflow === "hidden") {
          lenis.stop();
        } else {
          lenis.start();
        }
      }
    };

    const observer = new MutationObserver(checkBodyLock);
    if (typeof document !== "undefined" && document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["style"],
      });
    }

    return () => {
      observer.disconnect();
      lenis.destroy();
      globalLenis = null;
      notifySubscribers();
    };
  }, [shouldReduceMotion]);

  // Route transition scroll reset
  useEffect(() => {
    if (activeLenis) {
      // If navigating to a new route without a hash, immediately jump to top
      if (!window.location.hash) {
        activeLenis.scrollTo(0, { immediate: true });
      }
    }
  }, [pathname, activeLenis]);

  const scrollTo = useCallback(
    (
      target: string | number | HTMLElement,
      options?: {
        offset?: number;
        duration?: number;
        immediate?: boolean;
        lock?: boolean;
      }
    ) => {
      if (activeLenis) {
        activeLenis.scrollTo(target, options);
      } else if (typeof window !== "undefined") {
        if (typeof target === "number") {
          window.scrollTo({ top: target, behavior: options?.immediate ? "auto" : "smooth" });
        } else if (typeof target === "string") {
          const el = document.querySelector(target);
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY + (options?.offset || 0);
            window.scrollTo({ top, behavior: options?.immediate ? "auto" : "smooth" });
          }
        }
      }
    },
    [activeLenis]
  );

  return (
    <SmoothScrollContext.Provider value={{ lenis: activeLenis, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
