"use client";

import { animate } from "motion/react";
import { useEffect } from "react";
import { useIntersectionObserver } from "usehooks-ts";

import { duration, ease, prefersReducedMotion } from "~/lib/motion";

// Figures that have counted up once in this tab.
const counted = new Set<string>();

// The server renders the final text (a figure such as "N+" or a plain integer), so the first HTML and no-script readers have it. When the element is half in view the leading integer counts up from 0, one time per figure for as long as the tab lives (a figure that has counted once is shown as plain text when it appears again, on another page or after a back navigation); a suffix like "+" stays. The text node React owns is edited in place, so a later render with new text still reaches it; an element that never scrolls into view (the print sheet) keeps the final text.
export function CountUp({ value }: { value: number | string }) {
  const text = String(value);
  const { entry, isIntersecting, ref } = useIntersectionObserver({
    freezeOnceVisible: true,
    threshold: 0.5,
  });

  useEffect(() => {
    const node = entry?.target.firstChild;
    const target = Number.parseInt(text, 10);
    if (
      !isIntersecting ||
      !node ||
      Number.isNaN(target) ||
      counted.has(text) ||
      prefersReducedMotion()
    ) {
      return () => {};
    }
    counted.add(text);
    const suffix = text.slice(String(target).length);
    const controls = animate(0, target, {
      duration: duration.count,
      ease: ease.enter,
      onUpdate: (latest) => {
        node.nodeValue = `${Math.round(latest)}${suffix}`;
      },
    });
    return () => {
      controls.stop();
      node.nodeValue = text;
    };
  }, [entry, isIntersecting, text]);

  return <span ref={ref}>{text}</span>;
}
