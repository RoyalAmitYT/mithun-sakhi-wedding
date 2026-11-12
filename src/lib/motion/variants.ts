/**
 * Mithun & Sakhi Wedding Website — Global Motion Variants
 * Centralized, reusable Motion variants designed for luxury, editorial pacing, and cinematic feel.
 */

import type { Variants, Transition } from "motion/react";
import { MOTION_DURATIONS, MOTION_EASINGS, MOTION_STAGGER } from "./tokens";

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

export interface VariantTransitionOptions {
  duration?: number;
  delay?: number;
  ease?: readonly number[] | [number, number, number, number];
}

/**
 * Standard luxury transition helper
 */
export function createLuxuryTransition(
  options: VariantTransitionOptions = {}
): Transition {
  const {
    duration = MOTION_DURATIONS.reveal,
    delay = 0,
    ease = MOTION_EASINGS.luxury,
  } = options;

  return {
    duration,
    delay,
    ease: ease as [number, number, number, number],
  };
}

/**
 * Simple Fade In
 */
export function fadeIn(options: VariantTransitionOptions = {}): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: createLuxuryTransition(options),
    },
  };
}

/**
 * Fade Up — Content ascends gently into view
 */
export function fadeUp(
  distance = 20,
  options: VariantTransitionOptions = {}
): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: createLuxuryTransition(options),
    },
  };
}

/**
 * Fade Down — Subtle descent from top
 */
export function fadeDown(
  distance = 16,
  options: VariantTransitionOptions = {}
): Variants {
  return {
    hidden: { opacity: 0, y: -distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: createLuxuryTransition(options),
    },
  };
}

/**
 * Fade Left — Enters from the right towards left
 */
export function fadeLeft(
  distance = 24,
  options: VariantTransitionOptions = {}
): Variants {
  return {
    hidden: { opacity: 0, x: distance },
    visible: {
      opacity: 1,
      x: 0,
      transition: createLuxuryTransition(options),
    },
  };
}

/**
 * Fade Right — Enters from the left towards right
 */
export function fadeRight(
  distance = 24,
  options: VariantTransitionOptions = {}
): Variants {
  return {
    hidden: { opacity: 0, x: -distance },
    visible: {
      opacity: 1,
      x: 0,
      transition: createLuxuryTransition(options),
    },
  };
}

/**
 * Soft Scale Reveal — Subtle bloom from 0.96 to 1.0
 */
export function softScale(
  initialScale = 0.96,
  options: VariantTransitionOptions = {}
): Variants {
  return {
    hidden: { opacity: 0, scale: initialScale },
    visible: {
      opacity: 1,
      scale: 1,
      transition: createLuxuryTransition(options),
    },
  };
}

/**
 * Directional Reveal Generator
 */
export function directionalReveal(
  direction: RevealDirection = "up",
  distance = 20,
  options: VariantTransitionOptions = {}
): Variants {
  if (direction === "none") {
    return fadeIn(options);
  }
  if (direction === "up") {
    return fadeUp(distance, options);
  }
  if (direction === "down") {
    return fadeDown(distance, options);
  }
  if (direction === "left") {
    return fadeLeft(distance, options);
  }
  if (direction === "right") {
    return fadeRight(distance, options);
  }
  return fadeUp(distance, options);
}

/**
 * Stagger Container — Coordinates children reveals
 */
export function staggerContainer(
  staggerChildren = MOTION_STAGGER.standard,
  delayChildren = 0.04
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}

/**
 * Stagger Item — Individual item inside a Stagger Container
 */
export function staggerItem(
  distance = 18,
  options: VariantTransitionOptions = {}
): Variants {
  const {
    duration = MOTION_DURATIONS.reveal,
    ease = MOTION_EASINGS.luxury,
  } = options;

  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: ease as [number, number, number, number],
      },
    },
  };
}

/**
 * Line Draw — For SVG paths, dividers, and ornamental borders
 */
export function lineDraw(
  duration = MOTION_DURATIONS.editorial,
  delay = 0.1,
  ease = MOTION_EASINGS.luxury
): Variants {
  return {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration,
          delay,
          ease: ease as [number, number, number, number],
        },
        opacity: {
          duration: MOTION_DURATIONS.micro,
          delay,
        },
      },
    },
  };
}

/**
 * Hover Lift Preset
 */
export const hoverLiftVariants: Variants = {
  initial: { y: 0 },
  hover: {
    y: -2,
    transition: {
      duration: MOTION_DURATIONS.control,
      ease: MOTION_EASINGS.snappy as [number, number, number, number],
    },
  },
};

/**
 * Press Scale Preset
 */
export const pressScaleVariants: Variants = {
  initial: { scale: 1 },
  tap: {
    scale: 0.98,
    transition: {
      duration: MOTION_DURATIONS.micro,
      ease: MOTION_EASINGS.snappy as [number, number, number, number],
    },
  },
};
