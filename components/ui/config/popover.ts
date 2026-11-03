import { cn } from "~/lib/cn";

// No transition on the position: an animated top/left trails a moving anchor (a trigger in the sticky /work toolbar) and then jumps to it on scroll.
export const popoverPositioner = "";

export const popoverAnimationStates =
  "data-starting-style:scale-98 data-starting-style:opacity-0 data-ending-style:scale-98 data-ending-style:opacity-0 data-instant:duration-0";

export const popoverAnimation = `transition-[scale,opacity] ${popoverAnimationStates}`;

export const popoverPopup = cn(
  "surface-glow",
  "relative flex origin-(--transform-origin) rounded-lg border bg-popover shadow-lg outline-hidden not-[class*='w-']:min-w-32",
  "not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-inset-lg"
);
