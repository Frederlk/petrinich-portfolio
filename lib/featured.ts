import { featuredProjects } from "~/lib/content";

import type { Project } from "~/schemas/projects";

type Orderable = Pick<Project, "domain" | "year">;

// Featured AI work first, then the rest of the featured set; each group newest first, projects without a year last. Array sort is stable, so file order breaks ties.
export function orderFeatured<T extends Orderable>(items: readonly T[]): T[] {
  const newestFirst = items.toSorted((a, b) => (b.year ?? 0) - (a.year ?? 0));
  const isAi = (p: Orderable) => p.domain.includes("ai");
  return [...newestFirst.filter(isAi), ...newestFirst.filter((p) => !isAi(p))];
}

// The projects shown as Selected work on the home page and on the CV.
export const selectedProjects = orderFeatured(featuredProjects);
