"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "~/lib/cn";
import { indicatorSpring } from "~/lib/motion";

type Entry = { count: number; id: string; name: string };

// Table of contents with scroll-spy. From lg up it is a sticky column beside the groups; below, a sticky row of pills that scrolls the active pill into view. The active mark is one shared-layout element that slides between entries.
export function StackToc({ entries }: { entries: readonly Entry[] }) {
  const [picked, setPicked] = useState(entries[0]?.id ?? "");
  // A group the search hid cannot stay active.
  const active = entries.some((e) => e.id === picked)
    ? picked
    : (entries[0]?.id ?? "");
  const list = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const sections = entries.flatMap(({ id }) => {
      const el = document.querySelector(`#${id}`);
      return el === null ? [] : [el];
    });
    // The band between 25% and 40% of the viewport height decides: the section crossing it is the current one.
    const observer = new IntersectionObserver(
      (hits) => {
        const hit = hits.find((h) => h.isIntersecting);
        if (hit !== undefined) {
          setPicked(hit.target.id);
        }
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );
    for (const section of sections) {
      observer.observe(section);
    }
    // The last group is too short to reach the band, so the page end selects it.
    const last = entries.at(-1)?.id;
    const onScroll = () => {
      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atEnd && last !== undefined) {
        setPicked(last);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [entries]);

  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>(
      `[data-id="${active}"]`
    );
    const row = list.current;
    if (!el || !row || row.scrollWidth <= row.clientWidth) {
      return;
    }
    row.scrollTo({
      behavior: reduced === true ? "auto" : "smooth",
      left: el.offsetLeft - (row.clientWidth - el.clientWidth) / 2,
    });
  }, [active, reduced]);

  return (
    <nav
      aria-label="Technology groups"
      className="sticky top-[calc(4rem+var(--search-band))] z-30 -mx-margin-mobile border-b border-surface-container-high bg-surface md:-mx-margin lg:top-[calc(6rem+var(--search-band))] lg:mx-0 lg:self-start lg:border-b-0"
    >
      <ul
        className="flex snap-x gap-space-sm overflow-x-auto px-margin-mobile py-space-sm md:px-margin lg:flex-col lg:gap-0 lg:overflow-visible lg:border-l lg:border-surface-container-high lg:p-0"
        ref={list}
      >
        {entries.map((entry) => {
          const current = entry.id === active;
          return (
            <li
              className="shrink-0 snap-center"
              data-id={entry.id}
              key={entry.id}
            >
              <a
                aria-current={current ? "true" : undefined}
                className={cn(
                  "relative flex items-center justify-between gap-space-md px-space-md py-1.5 type-body-sm whitespace-nowrap capitalize transition-[background-color,color,border-color] duration-200 ease-(--ease-enter) max-lg:border max-lg:border-surface-container-high lg:h-9 lg:py-0",
                  current
                    ? "text-on-surface max-lg:border-primary-container lg:bg-surface-container-low"
                    : "text-secondary hover:text-on-surface"
                )}
                href={`#${entry.id}`}
              >
                {current ? (
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-container lg:inset-y-0 lg:right-auto lg:-left-px lg:h-auto lg:w-0.5"
                    layoutId="toc-active"
                    transition={indicatorSpring}
                  />
                ) : null}
                {entry.name}
                <span className="hidden w-6 text-right type-meta text-on-surface-variant lg:inline">
                  {entry.count}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
