import { buildDate } from "~/lib/build-date";
import {
  earlyWork,
  openSource,
  profile,
  projects,
  siteNumbers,
  techById,
  technologies,
} from "~/lib/content";
import { isOnStack } from "~/lib/derive-stats";
import { featureLines } from "~/lib/feature-groups";
import { KIND_LABELS, ROLE_LABELS, STATUS_LABELS } from "~/lib/labels";
import { publicUrl } from "~/lib/project-url";
import { screenshotOf } from "~/lib/screenshot";
import { SITE_FILES, SITE_PAGES, absolute } from "~/lib/site-pages";
import { projectMarkdownPath } from "~/lib/site-routes";

import type { Project } from "~/schemas/projects";

import {
  coreStack,
  otherGroups,
  stackGroups,
} from "~/features/stack/stack-groups";

const techNames = (ids: readonly string[]) =>
  ids.map((id) => techById.get(id)?.name ?? id).join(", ");

// ---------------------------------------------------------------- JSON

const projectRecord = (p: Project) => {
  const shot = screenshotOf(p);
  return {
    detailUrl: absolute(`/work/${p.id}`),
    domain: p.domain,
    featured: p.featured,
    features: featureLines(p),
    id: p.id,
    kind: p.kind,
    markdownUrl: absolute(projectMarkdownPath(p.id)),
    name: p.name,
    // Null for an anonymous project or one without a public link.
    publicUrl: publicUrl(p),
    role: p.role,
    roleNote: p.roleNote,
    scope: p.scope,
    screenshotUrl: shot === null ? null : absolute(shot),
    stack: p.stack,
    status: p.status,
    summary: p.summary,
    year: p.year,
  };
};

// Every project page, every early-work row and every open-source contribution, the same entries the /work table lists.
export const projectsJson = () => ({
  counts: {
    earlyWork: earlyWork.length,
    openSource: openSource.length,
    projects: projects.length,
  },
  earlyWork: earlyWork.map((w) => ({
    id: w.id,
    links: w.links,
    stack: w.stack,
    summary: w.summary,
    title: w.title,
    year: w.year,
  })),
  lastModified: buildDate,
  openSource: openSource.map((o) => ({
    id: o.id,
    name: o.name,
    stack: o.stack,
    summary: o.summary,
    url: o.url,
    year: o.year,
  })),
  owner: profile.name,
  projects: projects.map(projectRecord),
  url: absolute("/projects.json"),
});

const earlyIdsUsing = (techId: string) =>
  earlyWork.filter((w) => w.stack.includes(techId)).map((w) => w.id);

// The registry behind /stack. `counts.onStack` is the one technology count of the site, as a plain number: the technologies /stack lists, which the home teaser, the CV and the /stack header show as "N+". The registry holds more entries than that, for technologies no project used.
export const technologiesJson = () => ({
  counts: {
    onStack: technologies.filter((t) => isOnStack(t)).length,
    ownerListed: technologies.filter(
      (t) => t.listedByOwner === true && t.facts.projects === 0
    ).length,
    registry: technologies.length,
    usedByWork: technologies.filter((t) => t.facts.projects > 0).length,
  },
  groups: stackGroups.map((g) => ({
    count: g.items.length,
    id: g.id,
    name: g.name,
    technologyIds: g.items.map((item) => item.id),
  })),
  lastModified: buildDate,
  owner: profile.name,
  technologies: technologies.map((t) => ({
    aliases: t.aliases,
    built: t.facts.built,
    earlyWorkIds: earlyIdsUsing(t.id),
    firstYear: t.facts.firstYear,
    group: t.group,
    id: t.id,
    lastYear: t.facts.lastYear,
    listedByOwner: t.listedByOwner === true,
    name: t.name,
    onStack: t.facts.projects > 0 || t.listedByOwner === true,
    projectIds: t.facts.projectIds,
    projects: t.facts.projects,
  })),
  url: absolute("/technologies.json"),
});

// The route map: every page with its twins, every project page, every file.
export const siteJson = () => ({
  files: SITE_FILES.map((f) => ({
    description: f.description,
    title: f.title,
    type: f.type,
    url: absolute(f.path),
  })),
  lastModified: buildDate,
  name: profile.name,
  pages: SITE_PAGES.map((p) => ({
    description: p.description,
    json: absolute(p.json),
    markdown: absolute(p.markdown),
    path: p.path,
    title: p.title,
    url: absolute(p.path),
  })),
  projects: projects.map((p) => ({
    id: p.id,
    markdown: absolute(projectMarkdownPath(p.id)),
    name: p.name,
    url: absolute(`/work/${p.id}`),
  })),
  url: absolute("/site.json"),
});

// ------------------------------------------------------------ Markdown

const projectFacts = (p: Project) =>
  [
    p.year === null ? null : String(p.year),
    KIND_LABELS[p.kind],
    p.status === null ? null : STATUS_LABELS[p.status],
    `role: ${ROLE_LABELS[p.role]}`,
  ]
    .filter((part) => part !== null)
    .join(", ");

// One project as a Markdown block at the given heading level; the single-project twin and the lists share it.
function projectBlock(p: Project, level: 1 | 3) {
  const url = publicUrl(p);
  const shot = screenshotOf(p);
  return [
    `${"#".repeat(level)} ${p.name}`,
    "",
    p.summary,
    "",
    `- **Facts:** ${projectFacts(p)}`,
    ...(p.roleNote === "" ? [] : [`- **What I did:** ${p.roleNote}`]),
    ...(p.scope.length > 0 ? [`- **Scope:** ${p.scope.join(", ")}`] : []),
    ...(p.domain.length > 0 ? [`- **Domain:** ${p.domain.join(", ")}`] : []),
    ...(p.stack.length > 0 ? [`- **Stack:** ${techNames(p.stack)}`] : []),
    ...(url === null ? [] : [`- **Live:** ${url}`]),
    `- **Page:** ${absolute(`/work/${p.id}`)}`,
    ...(shot === null ? [] : [`- **Screenshot:** ${absolute(shot)}`]),
    ...(p.features.length > 0
      ? ["", "Capabilities:", "", ...featureLines(p).map((f) => `- ${f}`)]
      : []),
    "",
  ].join("\n");
}

export const projectMarkdown = (p: Project) =>
  [
    projectBlock(p, 1),
    `Back to the [work archive](${absolute("/work.md")}) · [CV](${absolute("/cv.md")}) · [all of it in one file](${absolute("/llms-full.txt")})`,
    "",
  ].join("\n");

const earlyBlock = (w: (typeof earlyWork)[number]) =>
  [
    `### ${w.title}`,
    "",
    w.summary,
    "",
    `- **Facts:** ${w.year}, Early work, role: ${ROLE_LABELS.sole}`,
    ...(w.stack.length > 0 ? [`- **Stack:** ${techNames(w.stack)}`] : []),
    ...w.links.map((l) => `- **Live:** ${l.url}`),
    "",
  ].join("\n");

const openSourceBlock = (o: (typeof openSource)[number]) =>
  [
    `### ${o.name}`,
    "",
    o.summary,
    "",
    `- **Facts:** ${o.year}, Open source, role: contributor`,
    ...(o.stack.length > 0 ? [`- **Stack:** ${techNames(o.stack)}`] : []),
    `- **Project:** ${o.url}`,
    "",
  ].join("\n");

// The body shared by /work.md and llms-full.txt: every project, the early work, then the open-source contributions, at heading levels 2 and 3.
export const workBody = () =>
  [
    "## Projects",
    "",
    `${projects.length} projects with a page of their own, newest first. Each one has a Markdown page at the page address plus .md.`,
    "",
    ...projects
      .toSorted((a, b) => (b.year ?? 0) - (a.year ?? 0))
      .map((p) => projectBlock(p, 3)),
    "## Early work",
    "",
    `${earlyWork.length} earlier exercises, built alone, without a page of their own.`,
    "",
    ...earlyWork.map(earlyBlock),
    "## Open source",
    "",
    `${openSource.length} contributions to projects owned by others, linked to each project's own site.`,
    "",
    ...openSource.map(openSourceBlock),
  ].join("\n");

export const workMarkdown = () =>
  [
    `# Work of ${profile.name}`,
    "",
    `> ${siteNumbers.allProjects} projects, early work and open source included. The same entries as ${absolute("/work")}. As JSON: ${absolute("/projects.json")}.`,
    "",
    workBody(),
  ].join("\n");

// The body shared by /stack.md and llms-full.txt. Project ids are the page slugs under /work/.
export const stackBody = () =>
  [
    "## Technologies",
    "",
    `${siteNumbers.technologies} technologies: the ones a project used, plus the ones listed by the owner. Counts are projects including early work and open source; "built" excludes estimate-only roles. Project ids are page slugs under ${absolute("/work/")}.`,
    "",
    ...stackGroups.flatMap((g) => [
      `### ${g.name} (${g.items.length})`,
      "",
      ...g.items.map((item) => {
        const ids = techById.get(item.id)?.facts.projectIds ?? [];
        if (item.projects === 0) {
          return `- **${item.name}** (listed by the owner)`;
        }
        const count = `${item.projects} ${item.projects === 1 ? "project" : "projects"}`;
        const used = ids.length > 0 ? `. Projects: ${ids.join(", ")}` : "";
        return `- **${item.name}**: ${count}, ${item.built} built, ${item.span}${used}`;
      }),
      "",
    ]),
  ].join("\n");

const evidence = (id: string) => absolute(`/work?tech=${id}`);
const projectCount = (n: number) => `${n} ${n === 1 ? "project" : "projects"}`;

// The stack part of llms.txt: the core stack one technology a line with its other names, every other area as one line of its technologies, alphabetical. Each count links to the matching /work filter, the evidence behind it.
export const stackDigest = () => [
  "## Core stack",
  "",
  `The technologies I build with every day. Counts are projects on this site; the years are the first and last year a project used it.`,
  "",
  ...(coreStack?.items ?? []).map((item) => {
    const also =
      item.aliases.length > 0
        ? ` (also written ${item.aliases.join(", ")})`
        : "";
    return `- **${item.name}**${also}: [${projectCount(item.projects)}](${evidence(item.id)}), ${item.span}`;
  }),
  "",
  "## Skills by area",
  "",
  `Every technology I have worked with, ${siteNumbers.technologies} in all, alphabetical in each area. Each entry gives the project count and years and links to those projects; a name without a count is one I know without a project on this site. The same list with project ids: [stack.md](${absolute("/stack.md")}).`,
  "",
  ...otherGroups.flatMap((g) => [
    `### ${g.name} (${g.items.length})`,
    "",
    g.items
      .map((item) => {
        const also =
          item.aliases.length > 0 ? `; also ${item.aliases.join(", ")}` : "";
        return item.projects === 0
          ? `${item.name}${also === "" ? "" : ` (${also.slice(2)})`}`
          : `[${item.name}](${evidence(item.id)}) (${item.projects}, ${item.span}${also})`;
      })
      .join(", "),
    "",
  ]),
];

export const stackMarkdown = () =>
  [
    `# Stack of ${profile.name}`,
    "",
    `> ${siteNumbers.technologies} technologies grouped by area. The same data as ${absolute("/stack")}. As JSON: ${absolute("/technologies.json")}.`,
    "",
    stackBody(),
  ].join("\n");
