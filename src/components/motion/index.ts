export { MotionProvider } from "./motion-provider";
export {
  SmoothScrollProvider,
  useSmoothScroll,
} from "./smooth-scroll-provider";
export {
  Reveal,
  StaggerGroup,
  StaggerContainer,
  StaggerItem,
  type RevealProps,
  type RevealPreset,
  type StaggerGroupProps,
  type StaggerContainerProps,
  type StaggerItemProps,
} from "./reveal";
export {
  AnimatedDivider,
  type AnimatedDividerProps,
} from "./animated-divider";
export {
  PageTransition,
  type PageTransitionProps,
} from "./page-transition";
export {
  MotionButton,
  MotionLink,
  type MotionButtonProps,
  type MotionLinkProps,
} from "./motion-interactive";

// Also re-export lib/motion primitives for convenience
export * from "@/lib/motion";
