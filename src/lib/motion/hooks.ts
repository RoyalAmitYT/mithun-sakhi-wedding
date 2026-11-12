/**
 * Mithun & Sakhi Wedding Website — Global Motion Hooks
 * Reusable React hooks for scroll detection, reduced motion awareness, and entrance orchestration.
 */

"use client";

import { useRef, useSyncExternalStore } from "react";
import { useReducedMotion, useInView, type UseInViewOptions } from "motion/react";
import { MOTION_VIEWPORT, type MotionViewportKey } from "./tokens";

const emptySubscribe = () => () => {};

/**
 * useMotionReduced
 * Safely inspects whether the user or system requests prefers-reduced-motion.
 * Uses useSyncExternalStore to avoid hydration mismatches and cascading setState calls.
 */
export function useMotionReduced(): boolean {
  const shouldReduce = useReducedMotion();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) return false;
  return Boolean(shouldReduce);
}

/**
 * useIsFinePointer
 * Safely inspects whether the user is on a fine-pointer device (mouse/trackpad).
 * Returns false on touch screens or during SSR.
 */
export function useIsFinePointer(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(any-pointer: fine)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => {
      if (typeof window === "undefined") return false;
      return (
        window.matchMedia("(any-pointer: fine)").matches ||
        window.matchMedia("(pointer: fine)").matches
      );
    },
    () => false
  );
}

export interface UseScrollRevealOptions {
  threshold?: number;
  once?: boolean;
  margin?: UseInViewOptions["margin"];
  preset?: MotionViewportKey;
}

/**
 * useScrollReveal
 * Attaches to an element ref to monitor when it enters the viewport.
 * Honors reduced motion preference (always true if reduced motion is requested).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const shouldReduce = useMotionReduced();

  const presetConfig = options.preset ? MOTION_VIEWPORT[options.preset] : null;

  const once = options.once ?? presetConfig?.once ?? true;
  const amount = options.threshold ?? (presetConfig && "amount" in presetConfig ? presetConfig.amount : 0.15);
  const margin: UseInViewOptions["margin"] = options.margin ?? (presetConfig && "margin" in presetConfig ? presetConfig.margin : undefined);

  const isInView = useInView(ref, {
    once,
    amount,
    margin,
  });

  return {
    ref,
    isInView: shouldReduce ? true : isInView,
    shouldReduceMotion: shouldReduce,
  };
}
