import type { ReactNode } from "react";

// The head of the 404 and 500 pages: the code in the project page's title style (display type, vermilion dot), the statement, the page's facts and its buttons. Below lg they stack in that order; from lg the statement and buttons move into the empty column beside the code, so the way out sits on the first screen.
export function StatusHeader({
  actions,
  children,
  code,
  statement,
}: {
  actions: ReactNode;
  children: ReactNode;
  code: string;
  statement: string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] lg:gap-x-space-2xl">
      <div className="mb-space-lg w-full overflow-hidden lg:row-span-2 lg:mb-space-2xl">
        <h1
          className="type-display text-on-surface select-none"
          data-fit="code"
        >
          {code}
          <span className="text-primary-container">.</span>
        </h1>
      </div>
      <p className="mb-space-2xl max-w-3xl type-h2 text-on-surface lg:col-start-2 lg:row-start-1 lg:mb-space-lg lg:self-end">
        {statement}
      </p>
      <div className="lg:col-span-2 lg:row-start-3">{children}</div>
      <div className="mt-space-xl flex flex-wrap items-center gap-space-md lg:col-start-2 lg:row-start-2 lg:mt-0 lg:mb-space-2xl lg:self-end">
        {actions}
      </div>
    </div>
  );
}
