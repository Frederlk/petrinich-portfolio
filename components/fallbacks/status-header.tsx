import type { ReactNode } from "react";

// The head of the 404 and 500 pages: the code in the project page's title style (display type, vermilion dot), then the statement, a note and the buttons as one block, then the page's fact band. From lg the code takes two thirds and the block the last third, its left hairline running down into the band's last divider so head and band read as one grid; below lg they stack.
export function StatusHeader({
  actions,
  children,
  code,
  note,
  statement,
}: {
  actions: ReactNode;
  children: ReactNode;
  code: string;
  note: string;
  statement: string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3">
      <div className="w-full overflow-hidden pt-space-xl pb-space-lg lg:col-span-2 lg:pb-space-2xl">
        <h1
          className="type-display text-on-surface select-none"
          data-fit="code"
        >
          {code}
          <span className="text-primary-container">.</span>
        </h1>
      </div>
      <div className="flex flex-col justify-end pb-space-2xl lg:border-l lg:border-surface-container-high lg:pt-space-xl lg:pl-space-lg">
        <p className="type-h2 text-on-surface">{statement}</p>
        <p className="mt-space-sm max-w-prose type-body text-secondary">
          {note}
        </p>
        <div className="mt-space-lg flex flex-wrap items-center gap-space-sm">
          {actions}
        </div>
      </div>
      <div className="lg:col-span-3">{children}</div>
    </div>
  );
}
