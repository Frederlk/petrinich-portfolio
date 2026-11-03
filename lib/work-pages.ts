import { EARLY_ROLE, earlyWork, projectById } from "~/lib/content";

import type { EarlyWork } from "~/schemas/early-work";
import type { Project } from "~/schemas/projects";

const earlyById = new Map(earlyWork.map((w) => [w.id, w]));

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

// The page subject for a /work/<slug>: a project, or an early entry.
export function pageSubject(slug: string) {
  const project = projectById.get(slug);
  if (project !== undefined) {
    return { early: false, project };
  }
  const early = earlyById.get(slug);
  return early === undefined
    ? undefined
    : { early: true, project: earlyAsProject(early) };
}
