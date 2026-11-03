"use client";

import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef } from "react";

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

// The search field, the core stack and the groups with their contents column, narrowed by `query`. Hook-free, so the server renders it in full (empty query) as the Suspense fallback.
export function StackView({
  core,
  groups,
  onQueryChange,
  query,
}: Props & { onQueryChange?: (query: string) => void; query: string }) {
  const field = useRef<HTMLInputElement>(null);
  const change = (next: string) => onQueryChange?.(next);

  useEffect(() => {
    // "/" jumps to the field unless the user is already typing somewhere.
    const onKey = (e: KeyboardEvent) => {
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
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, []);

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
    // The search stays under the site header while the page scrolls. `--search-band` is its height (2.75rem field plus py-space-sm), which the sticky table of contents and the group anchors add to their offsets so nothing hides behind it.
    <div className="[--search-band:--spacing(15)]">
      <search className="sticky top-16 z-40 mt-space-md bg-surface py-space-sm">
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
            placeholder="Search technologies"
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
                  className="-mr-space-sm flex size-9 shrink-0 cursor-pointer items-center justify-center text-secondary transition-colors duration-200 ease-(--ease-enter) outline-none hover:text-on-surface focus-visible:outline-2 focus-visible:outline-ring"
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
      {found === 0 ? (
        <output className="block border-b border-surface-container-high py-space-2xl text-center type-body text-secondary">
          No technology matches
        </output>
      ) : (
        <>
          {hasCore ? (
            <section className="pt-space-lg">
              <h2 className="mb-space-sm type-h3 text-on-surface">
                Core stack
              </h2>
              <StackCore core={shownCore} />
            </section>
          ) : null}
          {shownGroups.length === 0 ? null : (
            <div className="grid grid-cols-1 gap-x-space-xl pt-space-lg lg:grid-cols-[15rem_1fr]">
              <StackToc entries={tocEntries} />
              <div className="pt-space-lg lg:pt-0">
                <StackGroupsList groups={shownGroups} />
              </div>
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
