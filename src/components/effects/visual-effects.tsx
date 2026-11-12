"use client";

import React from "react";

/* ========================================================================= */
/* 1. AMBIENT GLOW (Cinematic Radial Lighting & Warmth)                     */
/* ========================================================================= */

export type AmbientGlowVariant =
  | "gold"
  | "champagne"
  | "burgundy"
  | "maroon"
  | "haldi"
  | "mehndi"
  | "wedding"
  | "reception"
  | "subtle-white";

export type AmbientGlowPosition =
  | "center"
  | "top-center"
  | "top-left"
  | "top-right"
  | "bottom-center"
  | "bottom-left"
  | "bottom-right";

export type AmbientGlowSize = "sm" | "md" | "lg" | "xl" | "full";

export interface AmbientGlowProps {
  variant?: AmbientGlowVariant;
  position?: AmbientGlowPosition;
  size?: AmbientGlowSize;
  opacity?: number;
  pulse?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const GLOW_GRADIENTS: Record<AmbientGlowVariant, string> = {
  gold: "radial-gradient(circle, rgba(212, 175, 55, 0.28) 0%, rgba(184, 151, 94, 0.12) 42%, rgba(184, 151, 94, 0) 72%)",
  champagne: "radial-gradient(circle, rgba(247, 241, 230, 0.7) 0%, rgba(216, 190, 141, 0.2) 48%, rgba(216, 190, 141, 0) 75%)",
  burgundy: "radial-gradient(circle, rgba(142, 27, 41, 0.32) 0%, rgba(72, 25, 35, 0.12) 50%, rgba(72, 25, 35, 0) 75%)",
  maroon: "radial-gradient(circle, rgba(72, 25, 35, 0.45) 0%, rgba(26, 5, 11, 0.18) 55%, transparent 75%)",
  haldi: "radial-gradient(circle, rgba(230, 138, 0, 0.28) 0%, rgba(242, 183, 5, 0.12) 45%, transparent 72%)",
  mehndi: "radial-gradient(circle, rgba(46, 111, 64, 0.24) 0%, rgba(105, 118, 93, 0.10) 48%, transparent 72%)",
  wedding: "radial-gradient(circle, rgba(165, 34, 50, 0.35) 0%, rgba(142, 27, 41, 0.15) 50%, transparent 75%)",
  reception: "radial-gradient(circle, rgba(184, 151, 94, 0.32) 0%, rgba(212, 175, 55, 0.14) 48%, transparent 75%)",
  "subtle-white": "radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 50%, transparent 75%)",
};

const POSITION_CLASSES: Record<AmbientGlowPosition, string> = {
  center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
  "top-center": "left-1/2 top-0 -translate-x-1/2 -translate-y-1/3",
  "top-left": "-left-1/4 -top-1/4",
  "top-right": "-right-1/4 -top-1/4",
  "bottom-center": "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/3",
  "bottom-left": "-left-1/4 -bottom-1/4",
  "bottom-right": "-right-1/4 -bottom-1/4",
};

const SIZE_CLASSES: Record<AmbientGlowSize, string> = {
  sm: "w-64 h-64 sm:w-80 sm:h-80",
  md: "w-96 h-96 sm:w-[480px] sm:h-[480px]",
  lg: "w-[480px] h-[480px] sm:w-[640px] sm:h-[640px]",
  xl: "w-[640px] h-[640px] sm:w-[840px] sm:h-[840px]",
  full: "w-full h-full",
};

/**
 * AmbientGlow Component
 * Renders atmospheric radial light washes that evoke editorial film lighting.
 * Lightweight, hardware accelerated, non-interactive (pointer-events-none).
 */
export function AmbientGlow({
  variant = "gold",
  position = "center",
  size = "md",
  opacity = 0.5,
  pulse = false,
  className = "",
  style,
}: AmbientGlowProps) {
  const bgGradient = GLOW_GRADIENTS[variant];
  const posClass = POSITION_CLASSES[position];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none select-none rounded-full blur-2xl sm:blur-3xl transition-opacity duration-700 will-change-transform ${posClass} ${sizeClass} ${
        pulse ? "motion-safe:animate-[ambientPulseGlow_7s_ease-in-out_infinite]" : ""
      } ${className}`}
      style={{
        background: bgGradient,
        opacity,
        transform: "translate3d(0, 0, 0)",
        contain: "paint",
        backfaceVisibility: "hidden",
        ...style,
      }}
    />
  );
}

/* ========================================================================= */
/* 2. GOLD LIGHT SWEEP (Foiled Stationery Shimmer & Micro-Highlights)        */
/* ========================================================================= */

export interface GoldLightSweepProps {
  trigger?: "hover" | "continuous" | "pulse";
  intensity?: "subtle" | "medium" | "radiant";
  durationSeconds?: number;
  className?: string;
}

/**
 * GoldLightSweep Component
 * Adds an ultra-refined gold illumination beam across cards or ornamental bars.
 * Evokes hot-stamped gold foil reflecting under gallery spotlights.
 */
export function GoldLightSweep({
  trigger = "hover",
  intensity = "subtle",
  durationSeconds = 6,
  className = "",
}: GoldLightSweepProps) {
  const intensityMap = {
    subtle: "via-[rgba(255,235,185,0.22)]",
    medium: "via-[rgba(255,235,185,0.40)]",
    radiant: "via-[rgba(255,235,185,0.65)]",
  };

  const gradientBeam = `bg-gradient-to-r from-transparent ${intensityMap[intensity]} to-transparent`;

  if (trigger === "hover") {
    return (
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-20 ${className}`}
      >
        <div
          className={`absolute -inset-y-full -left-full w-full h-[300%] -skew-x-12 ${gradientBeam} opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-transform duration-1000 ease-out`}
        />
      </div>
    );
  }

  if (trigger === "continuous") {
    return (
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-20 ${className}`}
      >
        <div
          style={{ animationDuration: `${durationSeconds}s` }}
          className={`absolute -inset-y-full -left-full w-full h-[300%] -skew-x-12 ${gradientBeam} motion-safe:animate-[goldLightSweep_6s_ease-in-out_infinite]`}
        />
      </div>
    );
  }

  // pulse
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-20 ${className}`}
    >
      <div
        className={`absolute inset-0 ${gradientBeam} opacity-20 motion-safe:animate-[ambientPulseGlow_5s_ease-in-out_infinite]`}
      />
    </div>
  );
}

/* ========================================================================= */
/* 3. GLASS REFLECTION (Tactile Liquid Sheen for Navbars & Floats)           */
/* ========================================================================= */

export interface GlassReflectionProps {
  className?: string;
  intensity?: "subtle" | "crisp";
}

/**
 * GlassReflection Component
 * Produces an angled refractive sheen on glassmorphic elements (such as
 * the sticky navbar or floating music player) to convey authentic depth.
 */
export function GlassReflection({
  className = "",
  intensity = "subtle",
}: GlassReflectionProps) {
  const opacityClass = intensity === "crisp" ? "opacity-35" : "opacity-20";

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none rounded-[inherit] overflow-hidden ${className}`}
    >
      {/* Top 1px highlight edge */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      {/* Subtle diagonal specular sheen */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent ${opacityClass}`}
      />
    </div>
  );
}

/* ========================================================================= */
/* 4. PHOTO AMBIENT HALO (Warm Editorial Rim Lighting behind Portraits)      */
/* ========================================================================= */

export interface PhotoAmbientHaloProps {
  color?: string;
  size?: "sm" | "md" | "lg";
  opacity?: number;
  className?: string;
}

/**
 * PhotoAmbientHalo Component
 * Placed immediately behind arched portrait viewports to cast a delicate,
 * high-end studio backlight halo.
 */
export function PhotoAmbientHalo({
  color = "#B8975E",
  size = "md",
  opacity = 0.25,
  className = "",
}: PhotoAmbientHaloProps) {
  const blurMap = {
    sm: "blur-xl -inset-2",
    md: "blur-2xl -inset-4 sm:-inset-6",
    lg: "blur-3xl -inset-6 sm:-inset-10",
  };

  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-[inherit] pointer-events-none select-none -z-10 ${blurMap[size]} ${className}`}
      style={{
        backgroundColor: color,
        opacity,
      }}
    />
  );
}

/* ========================================================================= */
/* 5. ATMOSPHERIC DEPTH (Layered Background Backdrop Wrapper)                */
/* ========================================================================= */

export interface AtmosphericDepthProps {
  children?: React.ReactNode;
  variant?: "champagne-light" | "burgundy-dark" | "warm-editorial";
  topScrim?: boolean;
  bottomScrim?: boolean;
  glow?: "gold" | "champagne" | "burgundy" | "none";
  className?: string;
}

/**
 * AtmosphericDepth Component
 * Encapsulates layered depth lighting, corner ambient washes, and optional
 * scrim transitions without horizontal scrollbars or layout shifts.
 */
export function AtmosphericDepth({
  children,
  variant = "champagne-light",
  topScrim = false,
  bottomScrim = false,
  glow = "gold",
  className = "",
}: AtmosphericDepthProps) {
  const variantStyles = {
    "champagne-light": "bg-gradient-to-b from-[#FFFDF9] via-[#FFFCF6] to-[#FAF5EB]",
    "burgundy-dark": "bg-[#150409]",
    "warm-editorial": "bg-[#FAF5E6]",
  }[variant];

  return (
    <div className={`relative overflow-hidden ${variantStyles} ${className}`}>
      {/* Top Scrim if requested */}
      {topScrim && (
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10"
        />
      )}

      {/* Ambient Radial Lights */}
      {glow !== "none" && (
        <>
          <AmbientGlow
            variant={glow === "burgundy" ? "burgundy" : glow === "champagne" ? "champagne" : "gold"}
            position="top-left"
            size="lg"
            opacity={0.3}
          />
          <AmbientGlow
            variant={glow === "burgundy" ? "maroon" : "gold"}
            position="bottom-right"
            size="lg"
            opacity={0.25}
          />
        </>
      )}

      {/* Content */}
      {children}

      {/* Bottom Scrim if requested */}
      {bottomScrim && (
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10"
        />
      )}
    </div>
  );
}
