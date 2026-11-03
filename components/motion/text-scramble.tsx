"use client";

import { useEffect, useEffectEvent, useRef } from "react";

const DURATION_MS = 360;
const STEP_MS = 40;
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const randomGlyph = (char: string) => {
  const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? char;
  return char === char.toLowerCase() ? glyph.toLowerCase() : glyph;
};

// Letters cycle through random glyphs and settle left to right, once after load and again on each hover. The server renders the real text, so crawlers, no-script readers and the first paint have it; only the text node React owns is edited, the way CountUp does, and every stop puts the real text back. Spaces and punctuation never change, and the label is mono, so its width holds. For those 360ms the DOM holds the glyphs, which only a reader inside that window meets.
export function TextScramble({
  className,
  text,
}: {
  className?: string;
  text: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const stop = useRef(() => {});

  const play = () => {
    const node = ref.current?.firstChild;
    if (
      !node ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    stop.current();
    const start = performance.now();
    let last = 0;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      if (progress === 1) {
        node.nodeValue = text;
        return;
      }
      if (now - last >= STEP_MS) {
        last = now;
        const settled = Math.floor(progress * text.length);
        node.nodeValue = text
          .split("")
          .map((char, i) =>
            i < settled || !/[a-z0-9]/i.test(char) ? char : randomGlyph(char)
          )
          .join("");
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    stop.current = () => {
      cancelAnimationFrame(frame);
      node.nodeValue = text;
    };
  };

  const playOnMount = useEffectEvent(play);
  useEffect(() => {
    playOnMount();
    return () => {
      stop.current();
    };
  }, []);

  return (
    <span className={className} onPointerEnter={play} ref={ref}>
      {text}
    </span>
  );
}
