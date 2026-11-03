import { RequestedPath } from "~/components/fallbacks/requested-path";
import { StatusTitle } from "~/components/fallbacks/status-title";

import { CtaLink } from "~/ui/cta-link";

import { featuredProjects } from "~/lib/content";

import { ROUTES } from "~/constants/routes";

import { WorkLedger } from "~/features/work/components/work-ledger";
import { toWorkRow } from "~/features/work/work-rows";

export const metadata = { title: "Page not found" };

const closest = featuredProjects.slice(0, 3).map(toWorkRow);

export default function NotFound() {
  return (
    <main className="container pt-space-xl pb-space-2xl">
      <StatusTitle code="404" />
      <p className="mb-space-2xl max-w-3xl type-h2 text-on-surface">
        This page is not in the index.
      </p>
      {/* The requested address as a ledger row that found nothing. */}
      <div className="grid grid-cols-1 items-start gap-y-1.5 border-t border-b border-surface-container-high py-space-md lg:grid-cols-12 lg:items-center lg:gap-gutter lg:px-space-md">
        <div className="type-meta text-tertiary max-lg:hidden lg:col-span-1">
          –
        </div>
        <div className="type-h3 break-all text-tertiary-container line-through lg:col-span-8">
          <RequestedPath />
        </div>
        <div className="type-label text-primary-container lg:col-span-3 lg:text-right">
          [Not in index]
        </div>
      </div>
      <h2 className="mt-space-2xl mb-space-sm type-label text-secondary">
        Closest entries
      </h2>
      <div className="border-t border-surface-container-high">
        <WorkLedger grouped={false} rows={closest} />
      </div>
      <div className="mt-space-2xl flex flex-wrap items-center gap-space-md">
        <CtaLink href={ROUTES.WORK} size="xl">
          See all work
        </CtaLink>
        <CtaLink href={ROUTES.HOME} size="xl" variant="outline">
          Go home
        </CtaLink>
      </div>
    </main>
  );
}
