"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "~/lib/cn";

import type { ReactNode } from "react";

// Shows as many badges as fit in `lineCount` rows and a "+N" badge for the rest. Every badge renders once; one that does not fit is taken out of the flow (`invisible absolute`), so it keeps its width for the next measure and a stateful badge (a Base UI combobox chip) is never rendered twice. A ResizeObserver re-measures when the box changes width. Adapted from the ux-mind next-template `BadgeOverflow`, which measures a hidden copy instead.
export function BadgeOverflow<T>({
  className,
  getKey,
  items,
  lineCount = 1,
  renderBadge,
  renderOverflow,
}: {
  className?: string;
  getKey: (item: T) => string;
  items: readonly T[];
  lineCount?: number;
  renderBadge: (item: T) => ReactNode;
  renderOverflow: (count: number) => ReactNode;
}): ReactNode {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(items.length);

  useLayoutEffect(() => {
    const fit = () => {
      const root = rootRef.current;
      if (!root) {
        return;
      }
      const style = getComputedStyle(root);
      const gap = Number.parseFloat(style.columnGap) || 0;
      const width = root.clientWidth;
      const cells = [...root.children].filter(
        (c): c is HTMLElement => c instanceof HTMLElement
      );
      const widths = cells.slice(0, -1).map((c) => c.offsetWidth);
      const overflowWidth = cells.at(-1)?.offsetWidth ?? 0;
      let line = 1;
      let used = 0;
      let count = 0;
      // On the last line a badge only fits if the "+N" badge still fits after it, unless it is the last badge.
      const room = (i: number) =>
        line === lineCount && i < widths.length - 1
          ? width - overflowWidth - gap
          : width;
      for (const [i, raw] of widths.entries()) {
        const step = raw + gap;
        if (used + step > room(i)) {
          if (line === lineCount) {
            break;
          }
          line += 1;
          used = 0;
          if (step > room(i)) {
            break;
          }
        }
        used += step;
        count += 1;
      }
      setVisible(count);
    };
    fit();
    const observer = new ResizeObserver(fit);
    if (rootRef.current) {
      observer.observe(rootRef.current);
    }
    return () => {
      observer.disconnect();
    };
    // Every render: the badges can change without the box changing width, and an unchanged count bails out of the re-render.
  });

  const hidden = items.length - visible;
  const out = "pointer-events-none invisible absolute";
  return (
    <div
      className={cn("relative flex flex-wrap gap-1", className)}
      ref={rootRef}
    >
      {items.map((item, i) => (
        <span
          aria-hidden={i >= visible ? true : undefined}
          className={cn("flex", i >= visible && out)}
          key={getKey(item)}
        >
          {renderBadge(item)}
        </span>
      ))}
      <span
        aria-hidden={hidden === 0 ? true : undefined}
        className={cn("flex", hidden === 0 && out)}
      >
        {renderOverflow(hidden === 0 ? items.length : hidden)}
      </span>
    </div>
  );
}
