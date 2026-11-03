import Link from "next/link";

import { RichText, TechLinks } from "~/components/rich-text";

import { cn } from "~/lib/cn";
import type { experience } from "~/lib/content";
import { parseDateRange } from "~/lib/dates";

type Job = (typeof experience)[number];

// Only the freelance entry maps to a filter of its own: the other jobs have no project field that names them.
const jobHref = (job: Job) =>
  job.id === "freelance" ? "/work?type=freelance" : null;

function MaybeLink({
  children,
  href,
}: {
  children: string;
  href: string | null;
}) {
  return href === null ? (
    children
  ) : (
    <Link className="rich-link" href={href}>
      {children}
    </Link>
  );
}

// One job on the timeline rail as two columns: company, role, dates and the stack on the left, the description and bullets on the right. The square marker sits on the rail inside the left column, level with the company name. Below md the columns stack. The current job has a vermilion marker and dates.
export function ExperienceEntry({ job }: { job: Job }) {
  const current = parseDateRange(job.dates).end?.text === "Present";
  const href = jobHref(job);
  return (
    <article className="grid grid-cols-1 gap-x-space-xl gap-y-space-sm border-t border-l border-surface-container-high py-space-lg pl-space-md first:border-t-0 md:grid-cols-[16rem_minmax(0,1fr)] md:pl-space-lg lg:grid-cols-[20rem_minmax(0,1fr)]">
      <header className="relative self-start">
        <h3 className="relative type-h3 text-on-surface">
          <span
            aria-hidden
            className={cn(
              "rail-marker size-2.5",
              current
                ? "bg-primary-container"
                : "border border-secondary bg-surface"
            )}
          />
          <MaybeLink href={href}>{job.company}</MaybeLink>
        </h3>
        <p className="mt-1 type-body text-on-surface-variant">
          <MaybeLink href={href}>{job.role}</MaybeLink>
        </p>
        <p
          className={cn(
            "mt-1 type-meta",
            current ? "text-primary-container" : "text-secondary"
          )}
        >
          {job.dates}
        </p>
        <p className="mt-space-sm type-meta text-pretty text-on-surface-variant">
          <TechLinks names={job.stack} />
        </p>
      </header>
      <div className="space-y-space-sm type-body text-secondary">
        <p>
          <RichText>{job.description}</RichText>
        </p>
        <ul className="list-square space-y-space-xs">
          {job.bullets.map((b) => (
            <li key={b}>
              <RichText>{b}</RichText>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
