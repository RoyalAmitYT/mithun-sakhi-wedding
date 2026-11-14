"use client";

import React from "react";
import { motion, type Variants } from "motion/react";
import {
  MOTION_DURATIONS,
  MOTION_EASINGS,
  MOTION_STAGGER,
  MOTION_VIEWPORT,
  type MotionEasingKey,
  type RevealDirection,
} from "@/lib/motion";
import { useMotionReduced } from "@/lib/motion/hooks";

export type RevealPreset = "luxury" | "editorial" | "cinematic" | "card" | "snappy" | "gentle";

const PRESET_DURATIONS: Record<RevealPreset, number> = {
  luxury: MOTION_DURATIONS.reveal,
  editorial: MOTION_DURATIONS.editorial,
  cinematic: MOTION_DURATIONS.cinematic,
  card: MOTION_DURATIONS.card,
  snappy: MOTION_DURATIONS.control,
  gentle: MOTION_DURATIONS.reveal,
};

const PRESET_EASINGS: Record<RevealPreset, [number, number, number, number]> = {
  luxury: [...MOTION_EASINGS.luxury],
  editorial: [...MOTION_EASINGS.luxury],
  cinematic: [...MOTION_EASINGS.cinematic],
  card: [...MOTION_EASINGS.luxury],
  snappy: [...MOTION_EASINGS.snappy],
  gentle: [...MOTION_EASINGS.gentle],
};

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Legacy prop for backward compatibility */
  yOffset?: number;
  /** Distance in pixels for directional movement */
  distance?: number;
  /** Direction of entrance */
  direction?: RevealDirection;
  /** Duration in seconds */
  duration?: number;
  /** Viewport intersection ratio (0.0 to 1.0) */
  threshold?: number;
  /** Viewport margin e.g. "0px 0px -10% 0px" */
  viewportMargin?: string;
  /** Whether animation triggers only once */
  once?: boolean;
  /** Animation preset style */
  preset?: RevealPreset;
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  yOffset,
  distance,
  direction = "up",
  duration,
  threshold,
  viewportMargin,
  once = true,
  preset = "luxury",
}: RevealProps) {
  const shouldReduceMotion = useMotionReduced();

  const resolvedDuration = duration ?? PRESET_DURATIONS[preset];
  const resolvedEase = PRESET_EASINGS[preset];
  const resolvedDistance = distance ?? yOffset ?? 20;
  const resolvedThreshold = threshold ?? MOTION_VIEWPORT.standard.amount;

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  // Calculate initial transform offsets based on direction
  let initialX = 0;
  let initialY = 0;

  if (direction === "up") {
    initialY = resolvedDistance;
  } else if (direction === "down") {
    initialY = -resolvedDistance;
  } else if (direction === "left") {
    initialX = resolvedDistance;
  } else if (direction === "right") {
    initialX = -resolvedDistance;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: initialX, y: initialY }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{
        once,
        amount: resolvedThreshold,
        margin: viewportMargin,
      }}
      transition={{
        duration: resolvedDuration,
        delay,
        ease: resolvedEase,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerGroupProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  threshold?: number;
  viewportMargin?: string;
  once?: boolean;
}

export function StaggerGroup({
  children,
  className = "",
  staggerDelay = MOTION_STAGGER.standard,
  delayChildren = 0.04,
  threshold = MOTION_VIEWPORT.standard.amount,
  viewportMargin,
  once = true,
}: StaggerGroupProps) {
  const shouldReduceMotion = useMotionReduced();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once,
        amount: threshold,
        margin: viewportMargin,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** StaggerContainer is an alias for StaggerGroup */
export const StaggerContainer = StaggerGroup;
export type StaggerContainerProps = StaggerGroupProps;

export interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  yOffset?: number;
  distance?: number;
  direction?: RevealDirection;
  duration?: number;
  ease?: MotionEasingKey;
}

export function StaggerItem({
  children,
  className = "",
  yOffset,
  distance,
  direction = "up",
  duration = MOTION_DURATIONS.reveal,
  ease = "luxury",
}: StaggerItemProps) {
  const shouldReduceMotion = useMotionReduced();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const resolvedDistance = distance ?? yOffset ?? 18;
  const resolvedEase = MOTION_EASINGS[ease];

  let initialX = 0;
  let initialY = 0;

  if (direction === "up") {
    initialY = resolvedDistance;
  } else if (direction === "down") {
    initialY = -resolvedDistance;
  } else if (direction === "left") {
    initialX = resolvedDistance;
  } else if (direction === "right") {
    initialX = -resolvedDistance;
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: initialX, y: initialY },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: resolvedEase,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
