/**
 * Mithun & Sakhi Wedding Website — Global Motion Tokens
 * Centralized motion design tokens for durations, easings, springs, and viewport thresholds.
 */

// 1. Duration Tokens (in seconds, for Motion / Framer Motion APIs)
export const MOTION_DURATIONS = {
  /** Micro interactions: toggles, icons, checkmarks (150–220ms) */
  micro: 0.18,
  /** Controls: buttons, tabs, input focus states (200–300ms) */
  control: 0.24,
  /** Card interactions: card hover, modal panels, badges (300–450ms) */
  card: 0.38,
  /** Content reveals: standard text blocks, ceremony details (450–650ms) */
  reveal: 0.55,
  /** Editorial heading reveals: section titles, grand quotes (600–850ms) */
  editorial: 0.72,
  /** Major visual transitions: hero elements, page transitions, backdrop fades (650–900ms) */
  transition: 0.80,
  /** Cinematic reveals: signature hero elements, full ceremony stages (850–1050ms) */
  cinematic: 0.95,
} as const;

export type MotionDurationKey = keyof typeof MOTION_DURATIONS;

// 2. Easing Tokens (Cubic-Bézier curves formatted as [number, number, number, number])
export const MOTION_EASINGS = {
  /** Luxury ease-out: editorial elegance, gentle deceleration, signature royal feel */
  luxury: [0.22, 1, 0.36, 1] as const,
  /** Cinematic ease-out: hyper-refined luxury deceleration curve for signature story reveals */
  cinematic: [0.19, 1.0, 0.22, 1.0] as const,
  /** Gentle ease-in-out: continuous, natural, organic flow */
  gentle: [0.25, 0.1, 0.25, 1] as const,
  /** Snappy ease-out: responsive UI controls, interactive feedback, crisp navigation */
  snappy: [0.16, 1, 0.3, 1] as const,
  /** Subtle ease-in-out: ambient, decorative lines, background glows */
  subtle: [0.4, 0, 0.2, 1] as const,
} as const;

export type MotionEasingKey = keyof typeof MOTION_EASINGS;

// 3. Spring Configurations
export const MOTION_SPRINGS = {
  /** Gentle spring: luxurious floating elements, soft overlays */
  gentle: {
    type: "spring" as const,
    stiffness: 260,
    damping: 25,
    mass: 0.9,
  },
  /** Responsive spring: active navigation indicator, buttons, tabs */
  responsive: {
    type: "spring" as const,
    stiffness: 340,
    damping: 28,
    mass: 0.8,
  },
  /** Smooth spring: heavy modals, drawer slides, sheet transitions */
  smooth: {
    type: "spring" as const,
    stiffness: 180,
    damping: 22,
    mass: 1.0,
  },
} as const;

export type MotionSpringKey = keyof typeof MOTION_SPRINGS;

// 4. Viewport Intersection Thresholds
export const MOTION_VIEWPORT = {
  /** Standard viewport reveal: triggers once when 15% visible */
  standard: {
    once: true,
    amount: 0.15,
  },
  /** Conservative reveal: triggers once when 30% visible (for dense cards) */
  conservative: {
    once: true,
    amount: 0.30,
  },
  /** Early reveal: triggers with bottom margin before entering screen */
  early: {
    once: true,
    margin: "0px 0px -10% 0px",
  },
  /** Repeatable reveal: re-triggers on scroll in/out */
  repeatable: {
    once: false,
    amount: 0.15,
  },
} as const;

export type MotionViewportKey = keyof typeof MOTION_VIEWPORT;

// 5. Stagger Intervals
export const MOTION_STAGGER = {
  fast: 0.05,
  standard: 0.08,
  relaxed: 0.12,
  ceremonies: 0.15,
} as const;

export type MotionStaggerKey = keyof typeof MOTION_STAGGER;
