"use client";

import React from "react";
import Link, { type LinkProps } from "next/link";
import { motion, type HTMLMotionProps } from "motion/react";
import {
  MOTION_DURATIONS,
  MOTION_EASINGS,
} from "@/lib/motion";
import { useMotionReduced } from "@/lib/motion/hooks";

export interface MotionButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  children?: React.ReactNode;
  hoverLift?: number;
  tapScale?: number;
}

export const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  (
    {
      children,
      className = "",
      hoverLift = 2,
      tapScale = 0.98,
      disabled,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useMotionReduced();

    if (shouldReduceMotion || disabled) {
      return (
        <button
          ref={ref}
          disabled={disabled}
          className={className}
          {...(props as React.ComponentPropsWithoutRef<"button">)}
        >
          {children}
        </button>
      );
    }

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        whileHover={{ y: -hoverLift }}
        whileTap={{ scale: tapScale }}
        transition={{
          duration: MOTION_DURATIONS.control,
          ease: MOTION_EASINGS.snappy,
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

MotionButton.displayName = "MotionButton";

export interface MotionLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  hoverLift?: number;
  tapScale?: number;
}

export const MotionLink = React.forwardRef<HTMLAnchorElement, MotionLinkProps>(
  (
    {
      children,
      className = "",
      wrapperClassName = "inline-flex",
      hoverLift = 1.5,
      tapScale = 0.98,
      ...linkProps
    },
    ref
  ) => {
    const shouldReduceMotion = useMotionReduced();

    if (shouldReduceMotion) {
      return (
        <Link ref={ref} className={className} {...linkProps}>
          {children}
        </Link>
      );
    }

    return (
      <motion.span
        className={wrapperClassName}
        whileHover={{ y: -hoverLift }}
        whileTap={{ scale: tapScale }}
        transition={{
          duration: MOTION_DURATIONS.control,
          ease: MOTION_EASINGS.snappy,
        }}
      >
        <Link ref={ref} className={className} {...linkProps}>
          {children}
        </Link>
      </motion.span>
    );
  }
);

MotionLink.displayName = "MotionLink";
