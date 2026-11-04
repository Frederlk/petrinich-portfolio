import { KeyStats } from "~/components/key-stats";

import type { PropsWithChildren } from "react";

// The head of the /work and /stack pages: the title and a short intro on the left, the first three key figures on the right, one hairline under both.
export function PageHeader({
  children,
  title,
}: PropsWithChildren<{ title: string }>) {
  return (
    <header className="flex flex-col justify-between gap-space-lg border-b border-surface-container-high pb-space-lg lg:flex-row lg:items-end">
      <div className="max-w-prose space-y-space-sm">
        <h1 className="m-0 type-h1 text-on-surface">{title}</h1>
        <p className="type-body text-secondary">{children}</p>
      </div>
      <KeyStats className="gap-x-space-md" count={3} />
    </header>
  );
}
