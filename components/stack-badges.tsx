import { cn } from "~/lib/cn";
import { MAX_CORE } from "~/lib/core-stack";

// The bordered technology tags of a project row: the /work ledger, Selected work on the home page and the CV. `lead` puts a label first in the same tag style ("AI-orchestrated"). The cv-p-* classes are the print sheet's hooks (styles/cv-print.css).
export function StackBadges({
  className,
  lead,
  names,
}: {
  className?: string;
  lead?: string | undefined;
  names: readonly string[];
}) {
  return (
    <ul className={cn("cv-p-stack flex flex-wrap gap-space-xs", className)}>
      {[...(lead === undefined ? [] : [lead]), ...names]
        .slice(0, MAX_CORE)
        .map((name) => (
          <li
            className="cv-p-tech border border-surface-container-high px-space-xs py-0.5 type-meta text-on-surface-variant group-hover:text-on-surface"
            key={name}
          >
            {name}
          </li>
        ))}
    </ul>
  );
}
