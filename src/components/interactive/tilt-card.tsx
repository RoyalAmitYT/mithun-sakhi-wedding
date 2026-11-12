"use client";

import React, { useRef } from "react";
import { motion, useSpring, useMotionValue } from "motion/react";
import { useMotionReduced, useIsFinePointer } from "@/lib/motion";

export interface InteractiveTiltCardProps {
  children: React.ReactNode;
  maxRotateDeg?: number; // Maximum 3D tilt in degrees (default 1.8 deg, restrained luxury range)
  className?: string;
  glow?: boolean;
}

/**
 * InteractiveTiltCard Component
 * Implements subtle, high-end 3D tilt interactions on editorial cards.
 * Constrained strictly to 1.5–2.5 degrees so typography remains perfectly readable.
 * Automatically disabled on touch screens and reduced-motion environments.
 */
export function InteractiveTiltCard({
  children,
  maxRotateDeg = 1.8,
  className = "",
}: InteractiveTiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useMotionReduced();
  const isFinePointer = useIsFinePointer();

  const mouseRotateX = useMotionValue(0);
  const mouseRotateY = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 20, mass: 0.1 };
  const rotateX = useSpring(mouseRotateX, springConfig);
  const rotateY = useSpring(mouseRotateY, springConfig);

  const isEnabled = !shouldReduceMotion && isFinePointer;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEnabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedX = (x / rect.width - 0.5) * 2; // -1 to 1
    const normalizedY = (y / rect.height - 0.5) * 2; // -1 to 1

    mouseRotateX.set(-normalizedY * maxRotateDeg);
    mouseRotateY.set(normalizedX * maxRotateDeg);
  };

  const handlePointerLeave = () => {
    mouseRotateX.set(0);
    mouseRotateY.set(0);
  };

  if (!isEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
        rotateX,
        rotateY,
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}
