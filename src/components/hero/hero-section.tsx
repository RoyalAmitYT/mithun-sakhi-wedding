"use client";

import React, { useSyncExternalStore } from "react";
import { HeroLandscape } from "./hero-landscape";
import { HeroPortrait } from "./hero-portrait";

function getOrientationSnapshot(): "landscape" | "portrait" {
  if (typeof window === "undefined") return "landscape";
  return window.matchMedia("(orientation: landscape)").matches ? "landscape" : "portrait";
}

function getServerOrientationSnapshot(): "landscape" | "portrait" {
  return "landscape";
}

function subscribeOrientation(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(orientation: landscape)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * HeroSection — Responsive Dual-Layout Coordinator
 *
 * Implements two distinct, locked presentation variants based on screen orientation:
 * 1. Landscape / Horizontal: Original Approved Desktop Hero
 *    - Desktop monitors, laptops, landscape tablets, landscape mobile phones
 * 2. Portrait / Vertical: New Cinematic Portrait Hero
 *    - Portrait mobile phones (390x844, 430x932), portrait tablets (768x1024)
 *
 * Switching is handled through instantaneous CSS media queries (@media (orientation: landscape/portrait))
 * paired with client-side accessibility isolation (inert & aria-hidden) to ensure zero FOUC,
 * instant physical rotation responsiveness, and clean accessibility tree separation.
 */
export function HeroSection() {
  const orientation = useSyncExternalStore(
    subscribeOrientation,
    getOrientationSnapshot,
    getServerOrientationSnapshot
  );

  const isPortrait = orientation === "portrait";

  return (
    <section
      id="hero"
      aria-label="Mithun and Sakhi Wedding Celebration"
      className="relative w-full overflow-hidden bg-[#150409]"
    >
      {/* =========================================================================
          VARIANT 1: ORIGINAL APPROVED HORIZONTAL / LANDSCAPE HERO
          Active on: Desktop, Laptop, Landscape Tablet, Landscape Mobile
          ========================================================================= */}
      <div
        className="hero-landscape-variant w-full"
        aria-hidden={isPortrait}
        inert={isPortrait}
      >
        <HeroLandscape />
      </div>

      {/* =========================================================================
          VARIANT 2: NEW CINEMATIC VERTICAL / PORTRAIT HERO
          Active on: Portrait Mobile (390, 430), Portrait Tablet (768)
          ========================================================================= */}
      <div
        className="hero-portrait-variant w-full"
        aria-hidden={!isPortrait}
        inert={!isPortrait}
      >
        <HeroPortrait />
      </div>
    </section>
  );
}
