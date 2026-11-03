import { Skeleton } from "~/ui/skeleton";

const ROW_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

// The toolbar as blocks: tabs, search and the Filters button at the real 40px height and the same rows, paddings and breakpoints as the explorer, so the ledger under it sits where it will stay.
export function WorkToolbarSkeleton() {
  return (
    <section className="w-full border-b border-surface-container-high bg-surface-container-lowest lg:border-b-0">
      <div className="flex flex-col gap-space-sm p-space-md lg:flex-row lg:items-stretch lg:gap-space-md">
        <div className="h-control lg:w-136">
          <Skeleton className="size-full" />
        </div>
        <div className="flex min-w-0 flex-1 items-stretch gap-space-sm">
          <div className="h-control flex-1">
            <Skeleton className="size-full" />
          </div>
          <div className="h-control w-29">
            <Skeleton className="size-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Ledger rows as blocks on the grid of the real rows (stacked below lg, 12 columns above).
export function WorkRowsSkeleton() {
  return (
    <div className="flex w-full flex-col">
      {ROW_KEYS.map((key) => (
        <div
          className="grid grid-cols-1 items-center gap-y-2 border-b border-surface-container-high px-space-md py-space-md lg:grid-cols-12 lg:gap-gutter"
          key={key}
        >
          <Skeleton className="h-4 w-10 lg:col-span-1" />
          <div className="flex flex-col gap-1.5 lg:col-span-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex flex-col gap-1.5 lg:col-span-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-4 w-10 lg:col-span-1" />
          <Skeleton className="h-4 w-2/3 lg:col-span-3" />
        </div>
      ))}
    </div>
  );
}
