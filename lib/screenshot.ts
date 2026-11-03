import type { Project } from "~/schemas/projects";

// Every file in `public/work` is exported at this size, so `next/image` gets real dimensions without reading the file; a screenshot at another size needs its own entry here.
export const SCREENSHOT_SIZE = { height: 900, width: 1440 } as const;

// The first screenshot of a project, or null when it has none.
export const screenshotOf = (project: Project): string | null =>
  project.media[0] ?? null;
