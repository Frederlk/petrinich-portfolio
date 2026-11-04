import { Suspense } from "react";

import { JsonLd } from "~/components/json-ld";
import { PageTransition } from "~/components/motion/page-transition";

import { pageMetadata } from "~/lib/site-pages";
import { workJsonLd } from "~/lib/structured-data";

import { WorkExplorer } from "~/features/work/components/work-explorer";
import { WorkHeader } from "~/features/work/components/work-header";
import {
  WorkLedger,
  WorkLedgerHeader,
} from "~/features/work/components/work-ledger";
import { WorkToolbarSkeleton } from "~/features/work/components/work-skeleton";
import {
  workRoleOptions,
  workRows,
  workDomainOptions,
  workTechOptions,
  workYearOptions,
} from "~/features/work/work-rows";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("/work");

export default function WorkPage() {
  return (
    <>
      <PageTransition />
      <main className="min-h-screen w-full bg-surface">
        <JsonLd data={workJsonLd()} />
        <div className="container flex flex-col pt-space-xl pb-space-2xl sm:pb-space-3xl">
          <WorkHeader />
          {/* The fallback is the full ledger, so the first HTML carries every row; the client explorer takes over and narrows it from the URL. The toolbar skeleton holds the height of the toolbar, so the rows do not jump when it arrives. */}
          <Suspense
            fallback={
              <div>
                <WorkToolbarSkeleton />
                <WorkLedgerHeader />
                <WorkLedger rows={workRows} />
              </div>
            }
          >
            <WorkExplorer
              roles={workRoleOptions}
              rows={workRows}
              domains={workDomainOptions}
              techs={workTechOptions}
              years={workYearOptions}
            />
          </Suspense>
        </div>
      </main>
    </>
  );
}
