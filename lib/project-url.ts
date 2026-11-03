import type { Project } from "~/schemas/projects";

// The project's public link, or null for an anonymous project or one without a link. Pure, so server and client code can share it.
export const publicUrl = (project: Project) =>
  project.anonymous ? null : (project.links[0]?.url ?? null);
