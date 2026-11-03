"use client";

import { animate } from "motion/react";
import { useEffect, useRef } from "react";

import { duration, ease } from "~/lib/motion";

// Figures that have counted up once in this tab.
const counted = new Set<string>();

// The server renders the final text (a figure such as "N+" or a plain integer), so the first HTML and no-script readers have it. When the element is half in view the leading integer counts up from 0, one time per figure for as long as the tab lives (a figure that has counted once is shown as plain text when it appears again, on another page or after a back navigation); a suffix like "+" stays. The media query is read inside the effect, once, instead of through a hook that starts as `null` and re-runs the animation when it settles. The text node React owns is edited in place, so a later render with new text still reaches it; an element that never scrolls into view (the print sheet) keeps the final text.
export function CountUp({ value }: { value: number | string }) {
  const text = String(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const node = el?.firstChild;
    const target = Number.parseInt(text, 10);
    if (
      el === null ||
      !node ||
      Number.isNaN(target) ||
      counted.has(text) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return () => {};
    }
    const suffix = text.slice(String(target).length);
    let stop = () => {};
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting !== true) {
          return;
        }
        observer.disconnect();
        counted.add(text);
        const controls = animate(0, target, {
          duration: duration.count,
          ease: ease.enter,
          onUpdate: (latest) => {
            node.nodeValue = `${Math.round(latest)}${suffix}`;
          },
        });
        stop = () => {
          controls.stop();
        };
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      stop();
      node.nodeValue = text;
    };
  }, [text]);

  return <span ref={ref}>{text}</span>;
}
