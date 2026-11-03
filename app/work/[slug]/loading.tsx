import { ArrowSlide } from "~/components/motion/arrow-slide";

import { Skeleton } from "~/ui/skeleton";

const FACT_KEYS = ["a", "b", "c", "d"] as const;
const LINE_KEYS = ["a", "b", "c"] as const;

// The project page as blocks: the real "Work" back link, the title, the summary lines, the four facts and the screenshot frame at its 1440 by 900 ratio.
export default function ProjectLoading() {
  return (
    <main
      aria-busy
      className="min-h-screen w-full bg-surface text-on-surface"
      data-loading="project"
    >
      <div className="container pt-space-lg">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-space-sm">
          <span className="inline-flex items-center type-button text-secondary">
            <ArrowSlide back />
            Work
          </span>
        </div>
      </div>
      <section className="container pt-space-xl pb-space-2xl">
        <div className="mb-space-lg">
          <Skeleton className="h-16 w-2/3 sm:h-28 lg:h-40" />
        </div>
        <div className="mb-space-2xl max-w-prose space-y-space-xs">
          {LINE_KEYS.map((key) => (
            <Skeleton className="h-6 w-full" key={key} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
          {FACT_KEYS.map((key) => (
            <Skeleton className="h-28" key={key} />
          ))}
        </div>
      </section>
      <section className="container pb-space-3xl">
        <Skeleton className="aspect-8/5 w-full" />
      </section>
      <output className="sr-only">Loading project</output>
    </main>
  );
}
