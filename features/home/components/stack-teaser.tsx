import {
  SectionHeader,
  SectionMoreLink,
} from "~/components/layout/section-header";

import { siteNumbers } from "~/lib/content";

import { StackCore } from "~/features/stack/components/stack-core";
import { coreStack } from "~/features/stack/stack-groups";

const all = {
  href: "/stack",
  label: `All ${siteNumbers.technologies} technologies`,
};

// The core stack as on /stack, with the way on to the full list.
export function StackTeaser() {
  return (
    <section className="container pb-space-3xl">
      <SectionHeader action={all} title="Core stack" />
      <StackCore core={coreStack?.items ?? []} />
      <SectionMoreLink {...all} />
    </section>
  );
}
