"use client";

import React from "react";
import { motion } from "motion/react";
import { useMotionReduced } from "@/lib/motion";

export interface InteractivePhotoWrapperProps {
  children: React.ReactNode;
  className?: string;
  zoomScale?: number; // default 1.03
  overlayContent?: React.ReactNode;
}

/**
 * InteractivePhotoWrapper Component
 * Provides smooth, high-fidelity hover zoom (1.03x), soft overlay transitions,
 * and tactile tap feedback without distorting faces or altering photographic aspect ratios.
 */
export function InteractivePhotoWrapper({
  children,
  className = "",
  zoomScale = 1.03,
  overlayContent,
}: InteractivePhotoWrapperProps) {
  const shouldReduceMotion = useMotionReduced();

  return (
    <div
      className={`group relative overflow-hidden rounded-[inherit] ${className}`}
    >
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { scale: zoomScale }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full relative"
      >
        {children}
      </motion.div>

      {/* Optional Overlay Content */}
      {overlayContent && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 z-10"
        >
          {overlayContent}
        </div>
      )}
    </div>
  );
}
