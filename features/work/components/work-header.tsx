import { PageHeader } from "~/components/layout/page-header";

import { siteNumbers } from "~/lib/content";

export function WorkHeader() {
  return (
    <PageHeader title="Work">
      Every project I have worked on since {siteNumbers.since}, with year, role,
      stack and a public link. Early work and open source included.
    </PageHeader>
  );
}
