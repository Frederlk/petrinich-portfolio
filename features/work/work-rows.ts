// Server only: builds the rows from the content files. The client receives them as props and never imports this module.
import {
  EARLY_ROLE,
  earlyWork,
  openSource,
  projects,
  techById,
} from "~/lib/content";
import { coreTechs } from "~/lib/core-stack";
import { DOMAIN_LABELS } from "~/lib/labels";

import type { EarlyWork } from "~/schemas/early-work";
import type { OpenSource } from "~/schemas/open-source";
import type { Project } from "~/schemas/projects";

import type {
  DomainOption,
  TechOption,
  TypeTab,
  WorkRow,
} from "~/features/work/work-types";

// The three internal tools sit under the personal tab.
const tabOf = (kind: Project["kind"]): Exclude<TypeTab, "all"> =>
  kind === "internal" ? "personal" : kind;

// A row shows its core technologies as tags; the project page lists them all and the search still matches every one.
const shownNames = (stack: readonly string[]) =>
  coreTechs(stack).map((t) => t.name);

const DOMAIN_NAMES: Record<string, string> = DOMAIN_LABELS;

export function toWorkRow(p: Project): WorkRow {
  const techNames = p.stack.map((id) => techById.get(id)?.name ?? id);
  const domains = p.domain.map((id) => ({
    id,
    label: DOMAIN_NAMES[id] ?? id,
  }));
  return {
    anonymous: p.anonymous,
    build: p.aiOrchestrated ? "ai" : "hand",
    domains,
    href: `/work/${p.id}`,
    id: p.id,
    kind: p.kind,
    name: p.name,
    role: p.role,
    search: [p.name, p.summary, ...domains.map((d) => d.label), ...techNames]
      .join(" ")
      .toLowerCase(),
    stack: shownNames(p.stack),
    summary: p.summary,
    tab: tabOf(p.kind),
    techIds: p.stack,
    year: p.year,
  };
}

// An early entry has its own page, like a project.
export function earlyToWorkRow(w: EarlyWork): WorkRow {
  const techNames = w.stack.map((id) => techById.get(id)?.name ?? id);
  return {
    build: "hand",
    domains: [],
    anonymous: false,
    href: `/work/${w.id}`,
    id: w.id,
    kind: "early",
    name: w.title,
    role: EARLY_ROLE,
    search: [w.title, w.summary, ...techNames].join(" ").toLowerCase(),
    stack: shownNames(w.stack),
    summary: w.summary,
    tab: "early",
    techIds: w.stack,
    year: w.year,
  };
}

// A project of someone else the owner contributed to: its page here (`openSourceAsProject`) links on to the project's own site.
export function openSourceToWorkRow(o: OpenSource): WorkRow {
  const techNames = o.stack.map((id) => techById.get(id)?.name ?? id);
  return {
    build: "hand",
    domains: [],
    anonymous: false,
    href: `/work/${o.id}`,
    id: o.id,
    kind: "open-source",
    name: o.name,
    role: "contributor",
    search: [o.name, o.summary, ...techNames].join(" ").toLowerCase(),
    stack: shownNames(o.stack),
    summary: o.summary,
    tab: "open-source",
    techIds: o.stack,
    year: o.year,
  };
}

// Newest first; rows without a year go last. Array sort is stable, so the projects come before the early work of the same year, and file order breaks the other ties.
export const workRows = [
  ...projects.map(toWorkRow),
  ...earlyWork.map(earlyToWorkRow),
  ...openSource.map(openSourceToWorkRow),
].toSorted((a, b) => (b.year ?? 0) - (a.year ?? 0));

// Sorted by group, then by name, so the filter can list them under group headings.
export const workTechOptions: TechOption[] = [
  ...new Set(workRows.flatMap((r) => r.techIds)),
]
  .map((id) => {
    const tech = techById.get(id);
    return { group: tech?.group ?? "Other", id, name: tech?.name ?? id };
  })
  .toSorted(
    (a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name)
  );

export const workYearOptions = [
  ...new Set(workRows.flatMap((r) => (r.year === null ? [] : [r.year]))),
];

export const workRoleOptions = [...new Set(workRows.map((r) => r.role))];

export const workDomainOptions: DomainOption[] = [
  ...new Map(workRows.flatMap((r) => r.domains).map((d) => [d.id, d])).values(),
].toSorted((a, b) => a.label.localeCompare(b.label));
