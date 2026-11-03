"use client";

import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { useQueryStates } from "nuqs";

import { Input } from "~/ui/input";
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
            {/* Below lg the six tabs overflow: the strip scrolls sideways, and a fade on its right edge (with room after the last tab) says there is more. */}
            <div className="hide-scrollbar h-control overflow-x-auto border border-surface-container-high max-lg:mask-r-from-85% max-lg:pe-10">
              <TabsList className="h-full w-max min-w-full">
                {TYPE_TABS.map((tab) => (
                  <TabsTab className="shrink-0" key={tab} value={tab}>
                    {TYPE_TAB_LABELS[tab]}
                    <span className="text-on-surface-variant tabular-nums group-data-active:text-on-primary-container">
                      {countOf(tab)}
                    </span>
                  </TabsTab>
                ))}
              </TabsList>
            </div>
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
                  {visible.length} of {rows.length}
                </span>
                {filters.q === "" ? null : (
                  <Tip label="Clear search">
                    <button
                      aria-label="Clear search"
                      className="-mr-space-sm flex size-9 shrink-0 cursor-pointer items-center justify-center text-secondary outline-none hover:text-on-surface focus-visible:outline-2 focus-visible:outline-ring"
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
