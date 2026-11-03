import { StackHeader } from "~/features/stack/components/stack-header";
import { StackSkeleton } from "~/features/stack/components/stack-skeleton";

// Shown at once on a click through to /stack: the real header, then the search, core cells and groups as blocks.
export default function StackLoading() {
  return (
    <main
      aria-busy
      className="min-h-screen w-full bg-surface"
      data-loading="stack"
    >
      <div className="container pt-space-xl pb-space-2xl">
        <StackHeader animated={false} />
        <StackSkeleton />
        <output className="sr-only">Loading technologies</output>
      </div>
    </main>
  );
}
