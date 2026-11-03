"use client";

import { MotionConfig } from "motion/react";

import type { PropsWithChildren } from "react";

// "user" follows prefers-reduced-motion: transform and layout animations switch off for every Motion component below.
export function MotionProvider({ children }: PropsWithChildren) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
