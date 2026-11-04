import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react/dist/ssr";

import { cn } from "~/lib/cn";

export type LedgerColumn = {
  label: string;
  span: string;
  // Set on the columns a visitor can sort by; the key is the one the sort state uses.
  sortKey?: string;
};

// Year, project, summary, role, stack: the spans every ledger row uses, so the home table and /work line up the same way.
export const LEDGER_COLUMNS = [
  { label: "Year", sortKey: "year", span: "col-span-1" },
  { label: "Project", sortKey: "name", span: "col-span-3" },
  { label: "Summary", span: "col-span-4" },
  { label: "Role", sortKey: "role", span: "col-span-1" },
  { label: "Core stack", span: "col-span-3" },
] as const satisfies readonly LedgerColumn[];

// `key` is null in the default order; `dir` is null whenever `key` is.
export type LedgerSort = {
  dir: "asc" | "desc" | null;
  key: string | null;
  onSort: (key: string) => void;
};

// One fixed 12x16 box of two stacked chevrons for every state, so nothing shifts: both are faint in the default order and appear on hover, and a sorted column lights the chevron of its direction and leaves the other dim.
function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-4 w-3 shrink-0 flex-col items-center justify-center transition-opacity",
        dir === null &&
          "opacity-0 group-hover/sort:opacity-60 group-focus-visible/sort:opacity-60"
      )}
    >
      <CaretUpIcon
        className={cn(
          "-mb-1 size-3 transition-colors",
          dir === "asc" ? "text-primary-container" : "text-current opacity-35"
        )}
      />
      <CaretDownIcon
        className={cn(
          "size-3 transition-colors",
          dir === "desc" ? "text-primary-container" : "text-current opacity-35"
        )}
      />
    </span>
  );
}

// The column labels of a ledger table. It sits on the same 12-column grid, padding and gap as the rows under it, so every label starts where its cells start; `className` sets the breakpoint that shows it (the rows stack below it). With `sort` the sortable labels become buttons; without it the header is decoration only.
export function LedgerHeader({
  className,
  columns,
  sort,
}: {
  className: string;
  columns: readonly LedgerColumn[];
  sort?: LedgerSort | undefined;
}) {
  return (
    <div
      aria-hidden={sort ? undefined : true}
      className={cn(
        "w-full grid-cols-12 gap-gutter border-b border-surface-container-high px-space-md py-space-sm type-label text-tertiary-container",
        className
      )}
    >
      {columns.map((column) => {
        const { sortKey } = column;
        if (sort === undefined || sortKey === undefined) {
          return (
            <div className={column.span} key={column.label}>
              {column.label}
            </div>
          );
        }
        const dir = sort.key === sortKey ? sort.dir : null;
        const active = dir !== null;
        return (
          <div className={column.span} key={column.label}>
            <button
              aria-label={`Sort by ${column.label}${active ? `, ${dir === "asc" ? "ascending" : "descending"}` : ""}`}
              className={cn(
                "group/sort -mx-1 flex cursor-pointer items-center gap-1 px-1 uppercase transition-colors hover:text-on-surface focus-visible:outline-2 focus-visible:outline-ring",
                active && "text-on-surface"
              )}
              onClick={() => {
                sort.onSort(sortKey);
              }}
              type="button"
            >
              {column.label}
              <SortIcon dir={dir} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
