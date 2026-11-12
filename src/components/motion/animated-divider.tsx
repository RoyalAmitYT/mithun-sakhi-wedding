"use client";

import React from "react";
import { motion } from "motion/react";
import {
  MOTION_DURATIONS,
  MOTION_EASINGS,
  MOTION_VIEWPORT,
} from "@/lib/motion";
import { useMotionReduced } from "@/lib/motion/hooks";

export interface AnimatedDividerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "gold" | "maroon" | "sindoor" | "subtle";
  size?: "sm" | "md" | "lg" | "full";
  delay?: number;
  once?: boolean;
}

const colorMap = {
  gold: "#B8975E",
  maroon: "#481923",
  sindoor: "#A52232",
  subtle: "rgba(184, 151, 94, 0.35)",
};

const widthMap = {
  sm: "max-w-[200px]",
  md: "max-w-[320px]",
  lg: "max-w-[480px]",
  full: "w-full",
};

export function AnimatedDivider({
  variant = "gold",
  size = "md",
  delay = 0.05,
  once = true,
  className = "",
  ...props
}: AnimatedDividerProps) {
  const shouldReduceMotion = useMotionReduced();
  const color = colorMap[variant];

  if (shouldReduceMotion) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={`flex items-center justify-center my-6 mx-auto ${widthMap[size]} ${className}`}
        {...props}
      >
        <div
          className="flex-1 h-[1px]"
          style={{
            background: `linear-gradient(to right, transparent, ${color})`,
          }}
        />
        <div className="flex items-center gap-1.5 px-3">
          <span
            className="w-1.5 h-1.5 rotate-45 transform"
            style={{ backgroundColor: color, opacity: 0.7 }}
          />
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 2L22 12L12 22L2 12L12 2Z"
              stroke={color}
              strokeWidth="1.2"
            />
            <circle cx="12" cy="12" r="3" fill={color} />
            <path
              d="M12 6V9M12 15V18M6 12H9M15 12H18"
              stroke={color}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span
            className="w-1.5 h-1.5 rotate-45 transform"
            style={{ backgroundColor: color, opacity: 0.7 }}
          />
        </div>
        <div
          className="flex-1 h-[1px]"
          style={{
            background: `linear-gradient(to left, transparent, ${color})`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`flex items-center justify-center my-6 mx-auto ${widthMap[size]} ${className}`}
      {...props}
    >
      {/* Left Expanding Line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once, amount: MOTION_VIEWPORT.standard.amount }}
        transition={{
          duration: MOTION_DURATIONS.editorial,
          delay,
          ease: MOTION_EASINGS.luxury,
        }}
        className="flex-1 h-[1px] origin-right"
        style={{
          background: `linear-gradient(to right, transparent, ${color})`,
        }}
      />

      {/* Center Royal Indian Diamond & Mandala Motif */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once, amount: MOTION_VIEWPORT.standard.amount }}
        transition={{
          duration: MOTION_DURATIONS.card,
          delay: delay + 0.15,
          ease: MOTION_EASINGS.luxury,
        }}
        className="flex items-center gap-1.5 px-3"
      >
        <span
          className="w-1.5 h-1.5 rotate-45 transform"
          style={{ backgroundColor: color, opacity: 0.7 }}
        />
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Animated Diamond Path */}
          <motion.path
            d="M12 2L22 12L12 22L2 12L12 2Z"
            stroke={color}
            strokeWidth="1.2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once, amount: MOTION_VIEWPORT.standard.amount }}
            transition={{
              duration: MOTION_DURATIONS.reveal,
              delay: delay + 0.1,
              ease: MOTION_EASINGS.luxury,
            }}
          />
          {/* Center Floret */}
          <circle cx="12" cy="12" r="3" fill={color} />
          <path
            d="M12 6V9M12 15V18M6 12H9M15 12H18"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <span
          className="w-1.5 h-1.5 rotate-45 transform"
          style={{ backgroundColor: color, opacity: 0.7 }}
        />
      </motion.div>

      {/* Right Expanding Line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once, amount: MOTION_VIEWPORT.standard.amount }}
        transition={{
          duration: MOTION_DURATIONS.editorial,
          delay,
          ease: MOTION_EASINGS.luxury,
        }}
        className="flex-1 h-[1px] origin-left"
        style={{
          background: `linear-gradient(to left, transparent, ${color})`,
        }}
      />
    </div>
  );
}
