import Link from "next/link";

import type { StackItem } from "~/features/stack/stack-types";

// A hairline row of cells that wrap and grow to fill the last row: name and project count, each a link to the projects that used it.
function CellRow({
  compact = false,
  items,
  label,
}: {
  compact?: boolean;
  items: readonly StackItem[];
  label: string;
}) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-px p-px">
      {items.map((item) => (
        // Each cell draws its own hairline (an outline into the gap, shared with its neighbour's), so the line fades in with the cell; a container background showed as a grey band through cells still mid-reveal.
        <li
          className="reveal grow basis-32 bg-surface outline outline-surface-container-high sm:basis-36"
          key={item.id}
        >
          <Link
            className="group row-accent flex h-full flex-col justify-between gap-space-xs p-space-md transition-[background-color,color,border-color] duration-200 ease-(--ease-enter) hover:bg-surface-container-low"
            href={`/work?tech=${item.id}`}
          >
            <span
              className={
                compact
                  ? "type-body text-on-surface transition-colors duration-200 ease-(--ease-enter) group-hover:text-primary-container"
                  : "type-h3 text-on-surface transition-colors duration-200 ease-(--ease-enter) group-hover:text-primary-container"
              }
            >
              {item.name}
            </span>
            <span className="type-meta text-secondary">
              {item.projects} {item.projects === 1 ? "project" : "projects"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// The main technologies as one row of cells.
export function StackCore({ core }: { core: readonly StackItem[] }) {
  return core.length === 0 ? null : <CellRow items={core} label="Core stack" />;
}
