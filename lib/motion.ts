import type { Transition } from "motion/react";

// The Motion counterparts of --ease-enter and --ease-move in globals.css: one curve per kind of movement.
export const ease = {
  enter: [0.23, 1, 0.32, 1],
  move: [0.77, 0, 0.175, 1],
} as const satisfies Record<string, readonly number[]>;

// Seconds. The duration cap is `motion.duration-cap` in DESIGN.md.
export const duration = {
  base: 0.25,
  count: 1.2,
  fast: 0.15,
} as const;

// The sliding indicator of tabs and the table of contents.
export const indicatorSpring = {
  damping: 38,
  mass: 0.8,
  stiffness: 520,
  type: "spring",
} as const satisfies Transition;
