"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useMotionReduced, useSmoothScroll } from "@/components/motion";

export function ScrollIndicator() {
  const shouldReduceMotion = useMotionReduced();
  const { scrollTo } = useSmoothScroll();

  return (
    <div className="flex flex-col items-center justify-center pt-2 select-none">
      <Link
        href="#our-story"
        onClick={(e) => {
          e.preventDefault();
          scrollTo("#our-story", { offset: -72 });
        }}
        aria-label="Scroll down to discover wedding celebrations"
        className="group inline-flex flex-col items-center gap-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#150409] rounded-full p-1 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="w-8 sm:w-14 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/60" aria-hidden="true" />
          <span className="text-[9px] sm:text-[10px] font-sans font-semibold tracking-[0.25em] uppercase text-[#D4AF37]/90 group-hover:text-[#FFE8A3] transition-colors">
            Scroll to Discover
          </span>
          <span className="w-8 sm:w-14 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/60" aria-hidden="true" />
        </div>

        {/* Circular Downward Arrow Indicator with Restrained Floating Motion */}
        <motion.div
          animate={
            shouldReduceMotion
              ? { y: 0, opacity: 1 }
              : { y: [0, 4, 0], opacity: [0.85, 1, 0.85] }
          }
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-7 h-7 rounded-full border border-[#D4AF37]/60 bg-[#240A12]/60 backdrop-blur-xs flex items-center justify-center text-[#D4AF37] group-hover:border-[#FFE8A3] group-hover:text-[#FFE8A3] transition-colors shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </Link>
    </div>
  );
}
