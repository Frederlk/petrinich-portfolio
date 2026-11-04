"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useEventListener } from "usehooks-ts";

import { ScrollArea } from "~/ui/scroll-area";

import { cn } from "~/lib/cn";
import { indicatorSpring } from "~/lib/motion";

type Entry = { count: number; id: string; name: string };

// Module-level, because usehooks-ts re-binds the listener whenever the options object changes identity.
const PASSIVE = { passive: true } as const;

// Table of contents with scroll-spy, from lg up only: a sticky column beside the groups, the active mark one shared-layout element that slides between entries.
export function StackToc({ entries }: { entries: readonly Entry[] }) {
  const [picked, setPicked] = useState(entries[0]?.id ?? "");
  // A group the search hid cannot stay active.
  const active = (entries.find((e) => e.id === picked) ?? entries[0])?.id ?? "";
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
    return () => {
      observer.disconnect();
    };
  }, [entries]);

  // The last group is too short to reach the band, so the page end selects it.
  useEventListener(
    "scroll",
    () => {
      const last = entries.at(-1)?.id;
      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atEnd && last !== undefined) {
        setPicked(last);
      }
    },
    undefined,
    PASSIVE
  );

  // The column scrolls on its own when it is taller than the screen; the active entry is brought to its middle. Only a change of `active` re-runs it; the motion preference is read at that moment.
  const centerActive = useEffectEvent((id: string) => {
    const el = list.current?.querySelector<HTMLElement>(`[data-id="${id}"]`);
    const column = list.current?.closest<HTMLElement>(
      "[data-slot=scroll-area-viewport]"
    );
    if (el && column && column.scrollHeight > column.clientHeight) {
      column.scrollTo({
        behavior: reduced === true ? "auto" : "smooth",
        top: el.offsetTop - (column.clientHeight - el.clientHeight) / 2,
      });
    }
  });
  useEffect(() => {
    centerActive(active);
  }, [active]);

  return (
    <nav
      aria-label="Technology groups"
      className="flex min-h-0 flex-col max-lg:hidden"
    >
      {/* A long list scrolls on its own; the scrollbar shows only while the pointer is over it or it scrolls. The list's `ml-px` keeps the active bar, which sits on the left rule, inside the clip. */}
      <ScrollArea className="flex flex-col" fade viewportClassName="min-h-0">
        <ul
          className="ml-px flex flex-col border-l border-surface-container-high"
          ref={list}
        >
          {entries.map((entry) => {
            const isActive = entry.id === active;
            return (
              <li data-id={entry.id} key={entry.id}>
                <a
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative flex h-9 items-center justify-between gap-space-md px-space-md type-body-sm whitespace-nowrap capitalize transition-[background-color,color] duration-200 ease-(--ease-enter)",
                    isActive
                      ? "bg-surface-container-low text-on-surface"
                      : "text-secondary hover:text-on-surface"
                  )}
                  href={`#${entry.id}`}
                >
                  {isActive ? (
                    <motion.span
                      aria-hidden
                      className="absolute inset-y-0 -left-px w-0.5 bg-primary-container"
                      layoutId="toc-active"
                      transition={indicatorSpring}
                    />
                  ) : null}
                  {entry.name}
                  <span className="w-6 text-right type-meta text-on-surface-variant">
                    {entry.count}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </nav>
  );
}
