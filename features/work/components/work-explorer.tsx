"use client";

import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { useQueryStates } from "nuqs";

import { DigitSwap } from "~/components/motion/digit-swap";

import { Input } from "~/ui/input";
import { ScrollArea } from "~/ui/scroll-area";
import { Tabs, TabsList, TabsTab } from "~/ui/tabs";
import { Tip } from "~/ui/tooltip";

import {
  ActiveChips,
  activeFilterCount,
  FiltersControl,
} from "~/features/work/components/work-filters";
import {
  WorkLedger,
  WorkLedgerHeader,
} from "~/features/work/components/work-ledger";
import {
  type FilterPatch,
  matchesFilters,
  sortRows,
  workFilterParsers,
} from "~/features/work/filters";
import {
  SORT_KEYS,
  TYPE_TAB_LABELS,
  TYPE_TABS,
  type DomainOption,
  type TechOption,
  type WorkRow,
} from "~/features/work/work-types";

// A ref callback for the chosen tab: brings it into view inside the strip when it is cut off. It moves only the strip's own viewport; `scrollIntoView` would scroll the window too.
function scrollIntoStrip(tab: HTMLElement | null) {
  const strip = tab?.closest<HTMLElement>('[data-slot="scroll-area-viewport"]');
  if (!tab || !strip) {
    return;
  }
  const edge = strip.getBoundingClientRect();
  const box = tab.getBoundingClientRect();
  if (box.left < edge.left) {
    strip.scrollLeft -= edge.left - box.left;
  } else if (box.right > edge.right) {
    strip.scrollLeft += box.right - edge.right;
  }
}

type Props = {
  rows: readonly WorkRow[];
  roles: readonly WorkRow["role"][];
  domains: readonly DomainOption[];
  techs: readonly TechOption[];
  years: readonly number[];
};

// Narrows the rows already in the server HTML; every filter lives in the URL. Row one is the type control, the search field and the Filters button; a second row holds the chips of the filters that are set, and the result count sits inside the search field. The type tabs, the search field, the Filters popover and its selects are Base UI parts, so keyboard and screen readers get proper roles.
export function WorkExplorer({ domains, rows, roles, techs, years }: Props) {
  const [filters, setFilters] = useQueryStates(workFilterParsers);
  const dir = filters.sort === null ? null : (filters.dir ?? "asc");
  const visible = sortRows(
    rows.filter((row) => matchesFilters(row, filters)),
    filters.sort ?? "year",
    dir ?? "desc"
  );
  const update = (patch: FilterPatch) => {
    void setFilters(patch);
  };
  // One column cycles default, ascending, descending, default; the default is no `sort` in the URL.
  const onSort = (key: string) => {
    const next = SORT_KEYS.find((k) => k === key);
    if (next === undefined) {
      return;
    }
    if (next !== filters.sort) {
      update({ dir: "asc", sort: next });
    } else if (dir === "asc") {
      update({ dir: "desc" });
    } else {
      update({ dir: null, sort: null });
    }
  };
  const countOf = (tab: (typeof TYPE_TABS)[number]) =>
    tab === "all" ? rows.length : rows.filter((r) => r.tab === tab).length;

  return (
    <div>
      <section className="z-30 w-full border-b border-surface-container-high bg-surface-container-lowest lg:sticky lg:top-16 lg:border-b-0">
        <div className="flex flex-col gap-space-sm p-space-md lg:flex-row lg:items-stretch lg:gap-space-md">
          <Tabs
            className="min-w-0"
            onValueChange={(next: string) => {
              update({
                type: TYPE_TABS.find((t) => t === next && t !== "all") ?? null,
              });
            }}
            value={filters.type}
          >
            {/* Below lg the six tabs overflow: the strip scrolls sideways inside the toolbar box and fades at an edge only while there is more that way. The viewport scrolls sideways only (`!` beats Base UI's inline `overflow: scroll`), and `overscroll-y-auto` lets a vertical swipe on it reach the page. */}
            <ScrollArea
              className="w-auto"
              fadeX
              viewportClassName="overflow-y-hidden! overscroll-y-auto"
            >
              <div className="w-max min-w-full">
                <div className="h-control border border-surface-container-high">
                  <TabsList className="h-full w-max min-w-full">
                    {TYPE_TABS.map((tab) => (
                      <TabsTab
                        className="shrink-0"
                        key={tab}
                        ref={tab === filters.type ? scrollIntoStrip : undefined}
                        value={tab}
                      >
                        {TYPE_TAB_LABELS[tab]}
                        <span className="tabular-nums">
                          <DigitSwap value={countOf(tab)} />
                        </span>
                      </TabsTab>
                    ))}
                  </TabsList>
                </div>
              </div>
            </ScrollArea>
          </Tabs>
          <div className="flex min-w-0 flex-1 items-stretch gap-space-sm">
            <search className="min-w-0 flex-1">
              <label
                className="flex h-control cursor-text items-center gap-space-sm border border-surface-container-high bg-surface-container-low px-space-md transition-colors duration-200 ease-(--ease-enter) focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-ring hover:bg-surface-container"
                htmlFor="work-search"
              >
                <MagnifyingGlassIcon
                  aria-hidden
                  className="size-4 shrink-0 text-tertiary"
                />
                <Input
                  aria-label="Search projects"
                  autoComplete="off"
                  enterKeyHint="search"
                  id="work-search"
                  onChange={(e) => {
                    update({
                      q: e.target.value === "" ? null : e.target.value,
                    });
                  }}
                  placeholder="Search work"
                  type="text"
                  value={filters.q}
                />
                <span
                  aria-live="polite"
                  className="hidden shrink-0 type-label text-secondary tabular-nums sm:block"
                >
                  <DigitSwap value={visible.length} /> of {rows.length}
                </span>
                {filters.q === "" ? null : (
                  <Tip label="Clear search">
                    <button
                      aria-label="Clear search"
                      className="-mr-space-sm flex size-9 shrink-0 cursor-pointer items-center justify-center text-secondary hover:text-on-surface focus-visible:outline-2 focus-visible:outline-ring"
                      onClick={() => {
                        update({ q: null });
                      }}
                      type="button"
                    >
                      <XIcon aria-hidden className="size-4" />
                    </button>
                  </Tip>
                )}
              </label>
            </search>
            <FiltersControl
              filters={filters}
              onChange={update}
              resultCount={visible.length}
              roles={roles}
              domains={domains}
              techs={techs}
              years={years}
            />
          </div>
        </div>
        {activeFilterCount(filters) === 0 ? null : (
          <div className="px-space-md pb-space-md">
            <ActiveChips
              domains={domains}
              filters={filters}
              onChange={update}
              techs={techs}
            />
          </div>
        )}
        <WorkLedgerHeader sort={{ dir, key: filters.sort, onSort }} />
      </section>
      {visible.length === 0 ? (
        <p className="border-b border-surface-container-high px-space-md py-space-lg type-label text-secondary">
          No project matches these filters.
        </p>
      ) : (
        <WorkLedger
          grouped={filters.sort === null || filters.sort === "year"}
          rows={visible}
        />
      )}
    </div>
  );
}
