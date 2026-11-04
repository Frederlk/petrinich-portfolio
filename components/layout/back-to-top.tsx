"use client";

import { ArrowUpIcon } from "@phosphor-icons/react/dist/ssr";
import { useSyncExternalStore } from "react";

import { ctaLinkVariants } from "~/ui/cta-link";
import { Tip } from "~/ui/tooltip";

import { cn } from "~/lib/cn";

const subscribe = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => {
    window.removeEventListener("scroll", onChange);
  };
};

// Past two screens, so only a page at least three screens long gets the button. A boolean snapshot, so React re-renders only when the threshold is crossed; it is read on mount too, so a reload restored deep in the page shows the button at once.
const pastTwoScreens = () => window.scrollY > 2 * window.innerHeight;

// The scroll is smooth through `html`'s `scroll-behavior`, and instant under reduced motion.
export function BackToTop() {
  const shown = useSyncExternalStore(subscribe, pastTwoScreens, () => false);

  // The wrapper fades: the button's own `transition` belongs to its press and fill sweep.
  return shown ? (
    <div className="fixed right-5 bottom-safe-5 z-40 transition-opacity duration-150 starting:opacity-0 print:hidden">
      <Tip label="Back to top" side="left">
        <button
          aria-label="Back to top"
          className={cn(
            ctaLinkVariants({ size: "icon", variant: "outline" }),
            "bg-surface"
          )}
          onClick={() => {
            window.scrollTo({ top: 0 });
          }}
          type="button"
        >
          <ArrowUpIcon aria-hidden className="size-4.5" />
        </button>
      </Tip>
    </div>
  ) : null;
}
