import { cn } from "~/lib/cn";

import type { ReactElement } from "react";

// A loading placeholder block in the Stitch look: a hairline frame, the low surface and a slow highlight sweep (the `skeleton` utility). Size it with `className`; it is decorative and hidden from screen readers.
export function Skeleton({ className }: { className?: string }): ReactElement {
  return (
    <div
      aria-hidden
      className={cn("skeleton border border-surface-container-high", className)}
    />
  );
}
