import Link from "next/link";

import { CountUp } from "~/components/motion/count-up";

import { cn } from "~/lib/cn";
import { keyStats } from "~/lib/stats";

// The headline figures as a row of big numerals: the same order everywhere (lib/stats.ts keyStats), a short vermilion rule above each numeral, the label under it, a hairline between the cells. `count` shows the first N; `links={false}` leaves the labels plain (the PDF is printed from a local server, so a relative link would carry a localhost address). The count-up plays once per figure, the first time it scrolls into view (components/motion/count-up.tsx).
export function KeyStats({
  className,
  count = keyStats.length,
  links = true,
}: {
  className?: string;
  count?: number;
  links?: boolean;
}) {
  return (
    <dl
      className={cn(
        "key-stats grid grid-cols-2 gap-y-space-lg sm:auto-cols-fr sm:grid-flow-col",
        className
      )}
    >
      {keyStats.slice(0, count).map((stat) => (
        <div
          className="key-stat flex flex-col-reverse justify-end border-l border-surface-container-high pl-space-md first:border-l-0 first:pl-0 max-sm:odd:border-l-0 max-sm:odd:pl-0"
          key={stat.label}
        >
          <dt className="key-stat-label type-label text-secondary">
            {stat.href === null || !links ? (
              stat.label
            ) : (
              <Link
                className="link-draw hover:text-primary-container"
                href={stat.href}
              >
                {stat.label}
              </Link>
            )}
          </dt>
          <dd className="key-stat-value m-0 type-stat text-on-surface before:mb-space-sm before:block before:h-0.5 before:w-6 before:bg-primary-container">
            <CountUp value={stat.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
