import {
  SectionHeader,
  SectionMoreLink,
} from "~/components/layout/section-header";

import { siteNumbers } from "~/lib/content";
import { selectedProjects } from "~/lib/featured";

import {
  WorkLedger,
  WorkLedgerHeader,
} from "~/features/work/components/work-ledger";
import { toWorkRow } from "~/features/work/work-rows";

const all = { href: "/work", label: `All ${siteNumbers.allProjects} projects` };

const rows = selectedProjects.map(toWorkRow);

// The same rows and column header as /work, so a project looks and links the same in both places; without the year groups, the sort buttons and the filters.
export function SelectedWork() {
  return (
    <section className="container pb-space-2xl sm:pb-space-3xl">
      <SectionHeader action={all} title="Selected work" />
      <WorkLedgerHeader />
      <WorkLedger grouped={false} rows={rows} />
      <SectionMoreLink {...all} />
    </section>
  );
}
