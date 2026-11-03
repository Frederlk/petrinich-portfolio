import { RequestedPath } from "~/components/fallbacks/requested-path";
import { StatusTitle } from "~/components/fallbacks/status-title";

import { CtaLink } from "~/ui/cta-link";

import { featuredProjects } from "~/lib/content";

import { ROUTES } from "~/constants/routes";

import { WorkLedger } from "~/features/work/components/work-ledger";
import { toWorkRow, workRows } from "~/features/work/work-rows";

export const metadata = { title: "Page not found" };

const closest = featuredProjects.slice(0, 3).map(toWorkRow);

export default function NotFound() {
  return (
    <main className="container pt-space-xl pb-space-2xl">
      <StatusTitle code="404" />
      <p className="mb-space-2xl max-w-3xl type-h2 text-on-surface">
        This page is not in the index.
      </p>
      {/* The requested address as a lookup against the work index, in the fact band of the project page and the 500 page. */}
      <dl className="grid grid-cols-1 border-t border-b border-surface-container-high sm:grid-cols-3">
        <div className="border-b border-surface-container-high p-space-md sm:col-span-2 sm:border-r sm:border-b-0 sm:p-space-lg">
          <dt className="type-label text-secondary">Query</dt>
          <dd className="mt-space-xs type-h3 break-all text-tertiary-container line-through">
            <RequestedPath />
          </dd>
          <dd className="mt-space-sm type-label text-primary-container">
            [Not in index]
          </dd>
        </div>
        <div className="p-space-md sm:p-space-lg">
          <dt className="type-label text-secondary">Matches</dt>
          <dd className="mt-space-xs type-h3 text-primary-container">0</dd>
          <dd className="mt-1 type-body-sm text-secondary">
            of {workRows.length} entries
          </dd>
        </div>
      </dl>
      <div className="mt-space-xl flex flex-wrap items-center gap-space-md">
        <CtaLink href={ROUTES.WORK} size="xl">
          See all work
        </CtaLink>
        <CtaLink href={ROUTES.HOME} size="xl" variant="outline">
          Go home
        </CtaLink>
      </div>
      <h2 className="mt-space-2xl mb-space-sm type-label text-secondary">
        Closest entries
      </h2>
      <div className="border-t border-surface-container-high">
        <WorkLedger grouped={false} rows={closest} />
      </div>
    </main>
  );
}
