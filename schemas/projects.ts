import { z } from "zod";

import {
  PROJECT_KINDS,
  PROJECT_ROLES,
  PROJECT_STATUSES,
} from "~/schemas/project-enums";

export const projectSchema = z.object({
  // Built by orchestrating AI agents: the owner planned, directed and reviewed, the agents wrote the code. Drives the /work "Build" filter; the owner sets it per project.
  aiOrchestrated: z.boolean().default(false),
  // Other texts that name this project inside a sentence ("live-video streaming platform"); RichText links them to its page.
  aliases: z.array(z.string()).default([]),
  anonymous: z.boolean(),
  // Id of `content/case-studies/<id>.mdx`, or null when the project has only the short record. The CMS saves an emptied field as "" or leaves it out; both read as null, so the page never imports `case-studies/.mdx`.
  caseStudy: z
    .string()
    .nullish()
    .transform((id) => (id === undefined || id === "" ? null : id)),
  domain: z.array(z.string()),
  // Id of the experience.json job the project was done in, or null for the owner's own projects; per-job counts are derived from it. The CMS saves an emptied field as "" or leaves it out; both read as null.
  employer: z
    .string()
    .nullish()
    .transform((id) => (id === undefined || id === "" ? null : id)),
  featured: z.boolean(),
  // Plain capability lines, or titled groups of them (one per part of the product); `featureGroups` reads both.
  features: z.array(
    z.union([
      z.string(),
      z.object({ items: z.array(z.string()), title: z.string() }),
    ])
  ),
  id: z.string(),
  kind: z.enum(PROJECT_KINDS),
  links: z.array(z.object({ type: z.string(), url: z.string() })),
  // Paths under `public/` of the project screenshots.
  media: z.array(z.string()),
  name: z.string(),
  role: z.enum(PROJECT_ROLES),
  roleNote: z.string(),
  scope: z.array(z.string()),
  stack: z.array(z.string()),
  status: z.enum(PROJECT_STATUSES).nullable(),
  summary: z.string(),
  year: z.number().int().nullable(),
});
export const projectsSchema = z.array(projectSchema);

export type Project = z.infer<typeof projectSchema>;
