import { parseDateRange } from "~/lib/dates";

import type { Experience } from "~/schemas/experience";
import type { Project } from "~/schemas/projects";

type StatsContent = {
  earlyWork: readonly unknown[];
  experience: readonly Pick<Experience, "dates" | "id" | "team">[];
  openSource: readonly unknown[];
  projects: readonly Pick<Project, "employer" | "kind" | "role">[];
  technologies: readonly Parameters<typeof isOnStack>[0][];
};

// A technology is on /stack when a project used it or the owner lists it.
export const isOnStack = (t: {
  facts: { projects: number };
  listedByOwner?: boolean | undefined;
}) => t.facts.projects > 0 || t.listedByOwner === true;

// The roles that count as "led or built" a project; estimate-only and team roles do not. Only work for someone else counts: the internal and personal kinds are left out.
const LED_OR_BUILT = new Set<Project["role"]>(["lead", "project-lead", "sole"]);
const CLIENT_KINDS = new Set<Project["kind"]>(["client", "freelance"]);

// Whole years from an ISO "YYYY-MM" or "YYYY" start to an ISO "YYYY-MM-DD" day.
function fullYearsSince(start: string, today: string): number {
  const [startYear = 0, startMonth = 1] = start.split("-").map(Number);
  const [year = 0, month = 1] = today.split("-").map(Number);
  return year - startYear - (month < startMonth ? 1 : 0);
}

// Every number the site shows about the owner, counted from the content: nothing here is typed in. The project, technology and year counts carry a "+", because the lists grow and the years run on. `since` is the year of the earliest job; the team figures are sums and the maximum of the per-job `team` values.
export function deriveStats(content: StatsContent, today: string) {
  const starts = content.experience.flatMap((job) => {
    const { iso } = parseDateRange(job.dates).start;
    return iso === null ? [] : [iso];
  });
  const first = starts.toSorted()[0];
  const teams = content.experience.flatMap((job) =>
    job.team === undefined ? [] : [{ id: job.id, ...job.team }]
  );
  return {
    // Every row the /work table lists, early work and open source included.
    allProjects: `${content.projects.length + content.earlyWork.length + content.openSource.length}+`,
    developersLed: teams.reduce((sum, t) => sum + t.led, 0),
    earlyWork: content.earlyWork.length,
    hired: teams.reduce((sum, t) => sum + (t.hired ?? 0), 0),
    // Developers led, hired and led at one time, per job, by experience id.
    hiredAt: Object.fromEntries(teams.map((t) => [t.id, t.hired ?? 0])),
    ledAt: Object.fromEntries(teams.map((t) => [t.id, t.led])),
    peakAt: Object.fromEntries(teams.map((t) => [t.id, t.peak ?? t.led])),
    // Projects led or built per job, by experience id.
    ledOrBuiltAt: Object.fromEntries(
      content.experience.map((job) => [
        job.id,
        content.projects.filter(
          (p) =>
            p.employer === job.id &&
            CLIENT_KINDS.has(p.kind) &&
            LED_OR_BUILT.has(p.role)
        ).length,
      ])
    ),
    peakTeam: Math.max(0, ...teams.map((t) => t.peak ?? 0)),
    since: first === undefined ? 0 : Number.parseInt(first, 10),
    technologies: `${content.technologies.filter((t) => isOnStack(t)).length}+`,
    years: `${first === undefined ? 0 : fullYearsSince(first, today)}+`,
  };
}

export type SiteNumbers = ReturnType<typeof deriveStats>;

const perJob = (prefix: string, values: Record<string, number>) =>
  Object.fromEntries(
    Object.entries(values).map(([id, v]) => [`${prefix}.${id}`, v])
  );

// The `{token}` names content prose may use, each bound to one derived number: the dotted ones (`{led.<jobId>}`, `{hired.<jobId>}`, `{peak.<jobId>}`, `{ledOrBuilt.<jobId>}`) take an experience id.
export function numberTokens(n: SiteNumbers): Record<string, number | string> {
  return {
    developersLed: n.developersLed,
    earlyWork: n.earlyWork,
    hired: n.hired,
    peakTeam: n.peakTeam,
    projects: n.allProjects,
    since: n.since,
    technologies: n.technologies,
    years: n.years,
    ...perJob("hired", n.hiredAt),
    ...perJob("led", n.ledAt),
    ...perJob("ledOrBuilt", n.ledOrBuiltAt),
    ...perJob("peak", n.peakAt),
  };
}

const TOKEN = /\{([\w.-]+)\}/g;

// Fills every `{token}` in every string of a raw content value, before it is parsed. An unknown token throws, so a typo fails the build instead of shipping braces.
export function fillNumbers(
  value: unknown,
  tokens: Readonly<Record<string, number | string>>
): unknown {
  if (typeof value === "string") {
    return value.replaceAll(TOKEN, (_, name: string) => {
      // Own keys only: an inherited name such as {toString} must throw like any typo.
      const filled = Object.hasOwn(tokens, name) ? tokens[name] : undefined;
      if (filled === undefined) {
        throw new Error(`unknown number token {${name}} in "${value}"`);
      }
      return String(filled);
    });
  }
  if (Array.isArray(value)) {
    return value.map((item) => fillNumbers(item, tokens));
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        fillNumbers(item, tokens),
      ])
    );
  }
  return value;
}
