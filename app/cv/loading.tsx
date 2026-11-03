import { Skeleton } from "~/ui/skeleton";

const STAT_KEYS = ["a", "b", "c", "d"] as const;
const LINE_KEYS = ["a", "b", "c"] as const;
const JOB_KEYS = ["a", "b", "c"] as const;

// The CV sheet as blocks inside the same 1100px column: the action bar, the name and facts, the summary with its four figures, then the experience entries.
export default function CvLoading() {
  return (
    <main
      aria-busy
      className="min-h-screen w-full bg-surface"
      data-loading="cv"
    >
      <article className="mx-auto w-full max-w-275 px-margin-mobile py-space-lg text-on-surface md:px-margin">
        <div className="flex w-full flex-col items-start justify-between gap-space-sm border-b border-surface-container-high pb-space-md md:flex-row md:items-center">
          <Skeleton className="h-5 w-64 max-w-full" />
          <Skeleton className="h-9 w-full md:w-52" />
        </div>
        <div className="grid grid-cols-1 items-start gap-gutter border-b border-surface-container-high pt-space-xl pb-space-lg lg:grid-cols-12">
          <div className="flex flex-col gap-space-sm lg:col-span-8">
            <Skeleton className="h-20 w-3/4" />
            <Skeleton className="h-7 w-80 max-w-full" />
          </div>
          <Skeleton className="h-16 lg:col-span-4" />
        </div>
        <section className="space-y-space-md py-space-lg">
          <Skeleton className="h-6 w-40" />
          {LINE_KEYS.map((key) => (
            <Skeleton className="h-6 w-full" key={key} />
          ))}
          <div className="grid grid-cols-2 gap-space-md pt-space-sm sm:grid-cols-4">
            {STAT_KEYS.map((key) => (
              <Skeleton className="h-14" key={key} />
            ))}
          </div>
        </section>
        <section className="space-y-space-md py-space-lg">
          <Skeleton className="h-6 w-40" />
          {JOB_KEYS.map((key) => (
            <Skeleton className="h-36" key={key} />
          ))}
        </section>
        <output className="sr-only">Loading CV</output>
      </article>
    </main>
  );
}
