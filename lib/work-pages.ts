import { EARLY_ROLE, earlyWork, openSource, projectById } from "~/lib/content";

import type { EarlyWork } from "~/schemas/early-work";
import type { OpenSource } from "~/schemas/open-source";
import type { Project } from "~/schemas/projects";

const earlyById = new Map(earlyWork.map((w) => [w.id, w]));
const openSourceById = new Map(openSource.map((o) => [o.id, o]));

// An early entry in the shape of a project, so /work/<id> renders both with one page. The kind line of the page says "Early work" (see `isEarly`).
function earlyAsProject(w: EarlyWork): Project {
  return {
    aiOrchestrated: false,
    aliases: [],
    anonymous: false,
    caseStudy: w.caseStudy,
    domain: [],
    employer: null,
    featured: false,
    features: [],
    id: w.id,
    kind: "personal",
    links: w.links.map((l) => ({ type: "live", url: l.url })),
    media: w.media,
    name: w.title,
    role: EARLY_ROLE,
    roleNote: "",
    scope: [],
    stack: w.stack,
    status: null,
    summary: w.summary,
    year: w.year,
  };
}

export const earlyPages = earlyWork.map(earlyAsProject);

// A contribution to someone else's open-source project in the shape of a project, so /work/<id> renders it with the same page. Its one link is the project's own site; its role is not a project role, so `pageSubject` carries it apart (`contributor`) and `role` here only fills the shape.
function openSourceAsProject(o: OpenSource): Project {
  return {
    aiOrchestrated: false,
    aliases: [],
    anonymous: false,
    caseStudy: null,
    domain: [],
    employer: null,
    featured: false,
    features: [],
    id: o.id,
    kind: "personal",
    links: [{ type: "live", url: o.url }],
    media: [],
    name: o.name,
    role: "team",
    roleNote: "",
    scope: [],
    stack: o.stack,
    status: null,
    summary: o.summary,
    year: o.year,
  };
}

export const openSourcePages = openSource.map(openSourceAsProject);

// Which list a /work/<slug> page belongs to; previous and next walk only that list.
export type PageOrigin = "early" | "open-source" | "project";

// The page subject for a /work/<slug>: a project, an early entry or an open-source contribution, with the role the page shows.
export function pageSubject(slug: string):
  | {
      origin: PageOrigin;
      project: Project;
      role: Project["role"] | "contributor";
    }
  | undefined {
  const project = projectById.get(slug);
  if (project !== undefined) {
    return { origin: "project", project, role: project.role };
  }
  const early = earlyById.get(slug);
  if (early !== undefined) {
    return {
      origin: "early",
      project: earlyAsProject(early),
      role: EARLY_ROLE,
    };
  }
  const contribution = openSourceById.get(slug);
  return contribution === undefined
    ? undefined
    : {
        origin: "open-source",
        project: openSourceAsProject(contribution),
        role: "contributor",
      };
}
