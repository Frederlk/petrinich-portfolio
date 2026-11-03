import { Skeleton } from "~/ui/skeleton";

// The toolbar as blocks until the explorer hydrates (it reads the filters from the URL, so it is not in the static HTML): tabs, search and the Filters button at the real 40px height and the same rows, paddings and breakpoints as the explorer, so the ledger under it sits where it will stay. The tab strip is 695px wide on lg (measured 2026-11-03 with the six tabs and their counts).
export function WorkToolbarSkeleton() {
  return (
    <section className="w-full border-b border-surface-container-high bg-surface-container-lowest lg:border-b-0">
      <div className="flex flex-col gap-space-sm p-space-md lg:flex-row lg:items-stretch lg:gap-space-md">
        <div className="h-control lg:w-174">
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
