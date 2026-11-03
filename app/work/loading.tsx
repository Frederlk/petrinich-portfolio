import { WorkHeader } from "~/features/work/components/work-header";
import { WorkLedgerHeader } from "~/features/work/components/work-ledger";
import {
  WorkRowsSkeleton,
  WorkToolbarSkeleton,
} from "~/features/work/components/work-skeleton";

// Shown at once on a click through to /work: the real title and intro, then the toolbar and rows as blocks in the places they will land.
export default function WorkLoading() {
  return (
    <main
      aria-busy
      className="min-h-screen w-full bg-surface"
      data-loading="work"
    >
      <div className="container flex flex-col pt-space-xl pb-space-3xl">
        <WorkHeader animated={false} />
        <WorkToolbarSkeleton />
        <WorkLedgerHeader />
        <WorkRowsSkeleton />
        <output className="sr-only">Loading projects</output>
      </div>
    </main>
  );
}
