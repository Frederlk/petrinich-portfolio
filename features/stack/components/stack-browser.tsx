"use client";

import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { parseAsString, useQueryState } from "nuqs";
import { useRef } from "react";
import { useEventListener } from "usehooks-ts";

import { Input } from "~/ui/input";
import { Tip } from "~/ui/tooltip";

import { StackCore } from "~/features/stack/components/stack-core";
import { StackGroupsList } from "~/features/stack/components/stack-groups-list";
import { StackToc } from "~/features/stack/components/stack-toc";
import { filterGroups, filterItems } from "~/features/stack/filter-stack";
import type { StackGroup, StackItem } from "~/features/stack/stack-types";

type Props = {
  core: readonly StackItem[];
  groups: readonly StackGroup[];
};

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));

// The search field, the core stack and the groups with their contents column, narrowed by `query`. The server renders it in full (empty query) as the Suspense fallback; its hooks only add the "/" shortcut and the scroll on search.
export function StackView({
  core,
  groups,
  onQueryChange,
  query,
}: Props & { onQueryChange?: (query: string) => void; query: string }) {
  const field = useRef<HTMLInputElement>(null);
  const view = useRef<HTMLDivElement>(null);
  // A search typed further down the page would leave the shorter results above the screen, under the sticky field. So the page first jumps back to where the field sticks (its 16px top margin under the 64px header), and the results start right below it; above that point nothing moves. `instant` overrides the page's smooth `scroll-behavior`, so typing never animates.
  const change = (next: string) => {
    const el = view.current;
    if (el !== null) {
      const top = el.getBoundingClientRect().top + window.scrollY + 16 - 64;
      if (window.scrollY > top) {
        window.scrollTo({ behavior: "instant", top });
      }
    }
    onQueryChange?.(next);
  };

  // "/" jumps to the field unless the user is already typing somewhere.
  useEventListener("keydown", (e) => {
    if (
      e.key === "/" &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !isTyping(e.target)
    ) {
      e.preventDefault();
      field.current?.focus();
    }
  });

  const shownCore = filterItems(core, query);
  const shownGroups = filterGroups(groups, query);
  const total = core.length + groups.reduce((n, g) => n + g.items.length, 0);
  const found =
    shownCore.length + shownGroups.reduce((n, g) => n + g.items.length, 0);
  const tocEntries = shownGroups.map(({ id, items, name }) => ({
    count: items.length,
    id,
    name,
  }));
  const hasCore = shownCore.length > 0;

  return (
    // Below lg the search sticks under the site header across the page, then the core cells and the groups follow (CSS `order`, because the sidebar wrapper is `display: contents` there); there is no contents list. From lg up the search heads the sidebar, which sticks as one column with the contents list beside the cells and the groups; the column is capped at the screen under its sticky top plus a 16px bottom gap, and the list takes what the search leaves, so its height is never computed by hand. `--search-band` is the search's height (2.75rem field plus its padding), which the group anchors add to their offsets so nothing hides behind it.
    <div
      className="flex flex-col [--search-band:--spacing(15)] lg:grid lg:grid-cols-[15rem_1fr] lg:gap-x-space-xl lg:pt-space-md"
      ref={view}
    >
      <div className="contents lg:sticky lg:top-19 lg:row-span-2 lg:flex lg:max-h-[calc(100svh-var(--spacing)*23)] lg:flex-col lg:self-start">
        <search className="sticky top-16 z-40 order-1 mt-space-md bg-surface py-space-sm lg:static lg:order-none lg:mt-0 lg:pt-0">
          <label
            className="flex min-h-11 cursor-text items-center gap-space-sm border border-surface-container-high bg-surface-container-low px-space-md transition-colors duration-200 ease-(--ease-enter) focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-ring hover:bg-surface-container"
            htmlFor="stack-search"
          >
            <MagnifyingGlassIcon
              aria-hidden
              className="size-4 shrink-0 text-tertiary"
            />
            <Input
              aria-label="Search technologies"
              autoComplete="off"
              enterKeyHint="search"
              id="stack-search"
              onChange={(e) => {
                change(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape" && query !== "") {
                  e.preventDefault();
                  change("");
                }
              }}
              placeholder="Search"
              ref={field}
              type="text"
              value={query}
            />
            {query === "" ? (
              <kbd
                aria-hidden
                className="hidden shrink-0 border border-surface-container-high px-space-xs type-meta text-tertiary sm:block"
              >
                /
              </kbd>
            ) : (
              <>
                <span
                  aria-live="polite"
                  className="hidden shrink-0 type-label text-tertiary tabular-nums sm:block"
                >
                  {found} of {total}
                </span>
                <Tip label="Clear search">
                  <button
                    aria-label="Clear search"
                    className="-mr-space-sm flex size-9 shrink-0 cursor-pointer items-center justify-center text-secondary transition-colors duration-200 ease-(--ease-enter) hover:text-on-surface focus-visible:outline-2 focus-visible:outline-ring"
                    onClick={() => {
                      change("");
                      field.current?.focus();
                    }}
                    type="button"
                  >
                    <XIcon aria-hidden className="size-4" />
                  </button>
                </Tip>
              </>
            )}
          </label>
        </search>
        {found === 0 || shownGroups.length === 0 ? null : (
          <StackToc entries={tocEntries} />
        )}
      </div>
      {found === 0 ? (
        <output className="order-2 block border-b border-surface-container-high py-space-2xl text-center type-body text-secondary lg:col-start-2">
          No technology matches
        </output>
      ) : (
        <>
          {hasCore ? (
            <div className="order-2 pt-space-sm pb-space-lg lg:col-start-2 lg:pt-0">
              <StackCore core={shownCore} />
            </div>
          ) : null}
          {shownGroups.length === 0 ? null : (
            <div className="order-4 pt-space-lg lg:col-start-2 lg:pt-0">
              <StackGroupsList groups={shownGroups} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// The URL carries the query as `q`, so a search can be linked.
export function StackBrowser(props: Props) {
  const [query, setQuery] = useQueryState("q", parseAsString.withDefault(""));
  return (
    <StackView
      {...props}
      onQueryChange={(next) => {
        void setQuery(next === "" ? null : next);
      }}
      query={query}
    />
  );
}
