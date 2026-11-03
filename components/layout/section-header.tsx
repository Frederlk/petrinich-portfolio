import Link from "next/link";

import { ArrowSlide } from "~/components/motion/arrow-slide";
import { SplitWords } from "~/components/motion/split-words";
import { CtaLink } from "~/components/ui/cta-link";

type Action = { href: string; label: string };

// A section heading over one hairline. An action sits at the right of the heading from md up; below md the same link is the full-width `SectionMoreLink` under the list.
export function SectionHeader({
  action,
  title,
}: {
  action?: Action;
  title: string;
}) {
  return (
    <div className="mb-space-lg flex items-baseline justify-between gap-gutter border-b border-surface-container-high pb-space-sm">
      <h2 className="reveal-words type-h2 text-on-surface uppercase">
        <SplitWords text={title} />
      </h2>
      {action ? (
        <Link
          className="group hidden type-button text-on-surface hover:text-primary-container md:inline"
          href={action.href}
        >
          <span className="link-draw">{action.label}</span>
          <ArrowSlide />
        </Link>
      ) : null}
    </div>
  );
}

export function SectionMoreLink({ href, label }: Action) {
  return (
    <div className="mt-space-md md:hidden">
      <CtaLink className="w-full" href={href} variant="outline">
        {label}
      </CtaLink>
    </div>
  );
}
