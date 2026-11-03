import Link from "next/link";

import { cn } from "~/lib/cn";

const box =
  "flex min-h-8 items-center gap-space-sm border px-space-sm py-1 type-body-sm";

// The one technology tag: a bordered box with the name. With an `href` it links and may show a muted `count`; without one it is a dashed box, for a technology the owner lists that no project used.
export function TechChip({
  count,
  href,
  name,
}: {
  count?: number;
  href?: string | undefined;
  name: string;
}) {
  if (href === undefined) {
    return (
      <span
        className={cn(
          box,
          "border-dashed border-surface-container-high text-secondary"
        )}
      >
        {name}
      </span>
    );
  }
  return (
    <Link
      className={cn(
        box,
        "group border-surface-container-high text-on-surface transition-[background-color,color,border-color] duration-200 ease-(--ease-enter) hover:border-primary-container hover:bg-surface-container-low hover:text-primary-container"
      )}
      href={href}
    >
      {name}
      {count === undefined ? null : (
        <span className="type-meta text-secondary">{count}</span>
      )}
    </Link>
  );
}
