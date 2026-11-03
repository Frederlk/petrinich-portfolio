"use client";

import { useLinkStatus } from "next/link";

// Put it inside a `Link` whose box is `relative` (the ledger rows and cards are, through `row-accent`): from the click until the next page is there, a vermilion bar sweeps along the bottom edge of that box. The frame is always rendered at a fixed size, so nothing shifts; the moving bar mounts only while pending, so a page of rows runs no idle animations.
export function LinkPending() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden"
    >
      {pending ? (
        <span className="block h-full w-1/3 animate-progress-sweep bg-primary-container motion-reduce:w-full motion-reduce:animate-none" />
      ) : null}
    </span>
  );
}
