"use client";

import React, { useRef } from "react";
import { motion, useSpring, useMotionValue } from "motion/react";
import { useMotionReduced, useIsFinePointer } from "@/lib/motion";

export interface MagneticButtonProps {
  children: React.ReactNode;
  maxDistanceX?: number; // Maximum magnetic displacement in pixels (default 8px)
  maxDistanceY?: number; // Maximum magnetic displacement in pixels (default 6px)
  className?: string;
  disabled?: boolean;
}

/**
 * MagneticButton Component
 * Gently pulls prominent desktop CTA buttons toward the cursor within a restrained, tactile range (6-10px).
 * Automatically disabled on touch screens, keyboard focus, and when prefers-reduced-motion is active.
 * Uses spring physics for a luxurious, physical return to resting position.
 */
export function MagneticButton({
  children,
  maxDistanceX = 8,
  maxDistanceY = 6,
  className = "",
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useMotionReduced();
  const isFinePointer = useIsFinePointer();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 280, damping: 20, mass: 0.1 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const isEnabled = !disabled && !shouldReduceMotion && isFinePointer;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Strictly ignore touch interactions to preserve native mobile feel
    if (!isEnabled || !ref.current || e.pointerType === "touch") return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * 0.22;
    const deltaY = (e.clientY - centerY) * 0.22;

    const clampedX = Math.max(-maxDistanceX, Math.min(maxDistanceX, deltaX));
    const clampedY = Math.max(-maxDistanceY, Math.min(maxDistanceY, deltaY));

    mouseX.set(clampedX);
    mouseY.set(clampedY);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const baseDisplay =
    className.includes("flex") || className.includes("block") || className.includes("w-full")
      ? ""
      : "inline-block";

  if (!isEnabled) {
    return <div className={`${baseDisplay} ${className}`.trim()}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      onBlur={handlePointerLeave}
      style={{ x, y }}
      className={`${baseDisplay} will-change-transform ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
}
