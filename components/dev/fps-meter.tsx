"use client";

import { useEffect, useRef } from "react";

// Dev-only frame meter, bottom-left. Writes into the DOM from the animation frame loop so reading it never re-renders React.
export function FpsMeter() {
  const out = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frames = 0;
    let worst = 0;
    let last = performance.now();
    let windowStart = last;
    let id = 0;
    const tick = (now: number) => {
      frames += 1;
      worst = Math.max(worst, now - last);
      last = now;
      if (now - windowStart >= 1000) {
        const fps = Math.round((frames * 1000) / (now - windowStart));
        if (out.current !== null) {
          out.current.textContent = `${fps} fps · ${Math.round(worst)} ms`;
        }
        frames = 0;
        worst = 0;
        windowStart = now;
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-1 left-1 z-9999 bg-surface-container-lowest px-1.5 py-0.5 type-meta text-primary-container"
      data-chrome
      ref={out}
    >
      -- fps
    </div>
  );
}
