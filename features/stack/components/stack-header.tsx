import { PageHeader } from "~/components/layout/page-header";

export function StackHeader({ animated = true }: { animated?: boolean }) {
  return (
    <PageHeader animated={animated} title="Stack">
      What I build with, grouped by area. The number next to a name is how many
      projects used it; select one to see them.
    </PageHeader>
  );
}
