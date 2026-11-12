"use client";

import React from "react";
import { motion } from "motion/react";
import { MOTION_EASINGS } from "@/lib/motion";
import { useMotionReduced } from "@/lib/motion/hooks";

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export function PageTransition({
  children,
  className = "",
  duration = 0.35,
}: PageTransitionProps) {
  const shouldReduceMotion = useMotionReduced();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration,
        ease: MOTION_EASINGS.luxury as [number, number, number, number],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
