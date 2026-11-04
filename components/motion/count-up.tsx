"use client";

import { animate } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useIntersectionObserver } from "usehooks-ts";

import { duration, ease, prefersReducedMotion } from "~/lib/motion";

// Figures that have counted up once in this tab.
const counted = new Set<string>();

// The server renders the starting state, so the first paint shows "0+" and counts up from there, never the final figure followed by a drop to 0. Two spans: an animated one (aria-hidden) whose leading integer counts from 0 when the element is half in view, and a final one holding the real text. Screen readers always read the final one; reduced motion and print show it from first paint through CSS alone, which covers the CV PDF printed under reduced motion. A figure counts once per tab: one that has counted before (another page, a back navigation) mounts at its final value. A reader without JavaScript sees "0+"; the markdown twins and JSON-LD carry the real figures.
export function CountUp({ value }: { value: number | string }) {
  const text = String(value);
  const target = Number.parseInt(text, 10);
  const suffix = text.slice(String(target).length);
  // oxlint-disable-next-line react/hook-use-state -- decided once at mount and never set: empty on the server and at hydration, so the HTML matches
  const [done] = useState(() => counted.has(text));
  // This copy has drawn a frame of its count: a page Next re-shows from a hidden Activity re-runs the effect and must not count again. Per copy, not per text, so a second figure with the same text that mounted at "0+" still counts.
  const played = useRef(false);
  const { entry, isIntersecting, ref } = useIntersectionObserver({
    freezeOnceVisible: true,
    threshold: 0.5,
  });

  useEffect(() => {
    const node = entry?.target.firstChild?.firstChild;
    if (
      !isIntersecting ||
      !node ||
      Number.isNaN(target) ||
      done ||
      played.current ||
      prefersReducedMotion()
    ) {
      return () => {};
    }
    const controls = animate(0, target, {
      duration: duration.count,
      ease: ease.enter,
      // Marked on the first frame, not at start or on complete: Strict Mode's cleanup runs before any frame, so its second run still counts, and a page hidden mid-count (cleanup writes the figure) does not count again.
      onUpdate: (latest) => {
        played.current = true;
        counted.add(text);
        node.nodeValue = `${Math.round(latest)}${suffix}`;
      },
    });
    return () => {
      controls.stop();
      node.nodeValue = text;
    };
  }, [done, entry, isIntersecting, suffix, target, text]);

  if (Number.isNaN(target)) {
    return <span>{text}</span>;
  }
  return (
    <span ref={ref}>
      <span aria-hidden className="motion-reduce:hidden print:hidden">
        {done ? text : `0${suffix}`}
      </span>
      <span className="sr-only motion-reduce:not-sr-only print:not-sr-only">
        {text}
      </span>
    </span>
  );
}
