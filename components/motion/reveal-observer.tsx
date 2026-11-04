"use client";

import { useEffect } from "react";

import { ease, prefersReducedMotion } from "~/lib/motion";

const SELECTOR = ".reveal, .reveal-words";
const STEP_MS = 70;
const MAX_STEP = 6;
const ENTER = `cubic-bezier(${ease.enter.join(", ")})`;

// The parts of an element that move: a block itself and the square markers of an experience entry, each word of a heading.
const words = (el: Element) =>
  el.querySelectorAll<HTMLElement>(":scope > span > span");
const markers = (el: Element) =>
  el.querySelectorAll<HTMLElement>(".rail-marker");
const isWords = (el: Element) => el.classList.contains("reveal-words");

// Holds an element at its start state until it reveals.
function hold(el: Element): Animation[] {
  if (isWords(el)) {
    return [...words(el)].map((w) =>
      w.animate([{ translate: "0 110%" }], { fill: "forwards" })
    );
  }
  return [
    el.animate([{ opacity: 0 }], { fill: "forwards" }),
    ...[...markers(el)].map((m) =>
      m.animate([{ scale: 0 }], { fill: "forwards" })
    ),
  ];
}

// Plays the reveal; each animation holds its first frame through its delay (`backwards`), so the holds can go in the same task without a flash.
function play(el: Element, delay: number) {
  if (isWords(el)) {
    for (const [i, w] of [...words(el)].entries()) {
      w.animate([{ translate: "0 110%" }, { translate: "0 0" }], {
        delay: delay + i * STEP_MS,
        duration: 700,
        easing: ENTER,
        fill: "backwards",
      });
    }
    return;
  }
  el.animate(
    [
      { opacity: 0, translate: "0 28px" },
      { opacity: 1, translate: "0 0" },
    ],
    { delay, duration: 800, easing: ENTER, fill: "backwards" }
  );
  for (const m of markers(el)) {
    m.animate([{ scale: 0 }, { scale: 1 }], {
      delay: delay + 300,
      duration: 500,
      easing: ENTER,
      fill: "backwards",
    });
  }
}

// The section reveals (`.reveal`, `.reveal-words`; layout in styles/motion.css). Every element is armed once: on mount, and whenever a navigation or a filter adds one (a MutationObserver), so no page wires anything. Only an element that starts below the viewport is held at its start state, so nothing on screen blinks out; it plays once when it scrolls into view, and the ones that arrive in the same callback are staggered. Everything runs through the Web Animations API and never writes an attribute: Next hydrates a page after the layout, and an attribute written before that is a hydration mismatch. The server HTML is the final page for crawlers and no-JS readers; reduced motion arms nothing, and printing drops every hold. Rects are all read before any animation starts, so arming a long ledger forces one layout, not one per row.
export function RevealObserver() {
  useEffect(() => {
    if (prefersReducedMotion()) {
      return () => {};
    }
    const armed = new WeakSet<Element>();
    // ponytail: holds of elements a navigation removed before they revealed stay here until unmount (a few hundred at most per visit); prune on the MutationObserver's removedNodes if that ever matters.
    const holds = new Map<Element, Animation[]>();

    const io = new IntersectionObserver(
      (entries) => {
        let step = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          const el = entry.target;
          io.unobserve(el);
          play(el, Math.min(step, MAX_STEP) * STEP_MS);
          for (const a of holds.get(el) ?? []) {
            a.cancel();
          }
          holds.delete(el);
          step += 1;
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );

    const arm = (roots: Iterable<Element>) => {
      const fresh = new Set<Element>();
      for (const root of roots) {
        if (root.matches(SELECTOR)) {
          fresh.add(root);
        }
        for (const el of root.querySelectorAll(SELECTOR)) {
          fresh.add(el);
        }
      }
      const unarmed = [...fresh].filter((el) => !armed.has(el));
      const below = unarmed.map(
        (el) => el.getBoundingClientRect().top >= window.innerHeight
      );
      for (const [i, el] of unarmed.entries()) {
        armed.add(el);
        if (below[i] === true) {
          holds.set(el, hold(el));
          io.observe(el);
        }
      }
    };

    const reveal = () => {
      for (const a of [...holds.values()].flat()) {
        a.cancel();
      }
      holds.clear();
      io.disconnect();
    };

    arm([document.body]);
    const mo = new MutationObserver((records) => {
      arm(
        records.flatMap((r) =>
          [...r.addedNodes].filter((n) => n instanceof Element)
        )
      );
    });
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("beforeprint", reveal);

    return () => {
      window.removeEventListener("beforeprint", reveal);
      mo.disconnect();
      reveal();
    };
  }, []);

  return null;
}
