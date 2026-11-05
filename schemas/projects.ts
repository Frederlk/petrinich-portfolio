import { z } from "zod";

import {
  PROJECT_KINDS,
  PROJECT_ROLES,
  PROJECT_STATUSES,
} from "~/schemas/project-enums";

// "2026-04": LinkedIn and JSON Resume date a project by month.
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export const projectSchema = z
  .object({
    // Built by orchestrating AI agents: the owner planned, directed and reviewed, the agents wrote the code. Drives the /work "Build" filter; the owner sets it per project.
    aiOrchestrated: z.boolean().default(false),
    // Other texts that name this project inside a sentence ("live-video streaming platform"); RichText links them to its page.
    aliases: z.array(z.string()).default([]),
    anonymous: z.boolean(),
    // Id of `content/case-studies/<id>.mdx`, or null when the project has only the short record. Never "", so the page never imports `case-studies/.mdx`.
    caseStudy: z.string().min(1).nullable(),
    domain: z.array(z.string()),
    // Last month of work; absent while `started` is set means the work is still going.
    ended: month.optional(),
    // Id of the experience.json job the project was done in, or null for the owner's own projects; per-job counts are derived from it.
    employer: z.string().min(1).nullable(),
    featured: z.boolean(),
    // What the owner built and its sourced numbers, 2 or 3 lines; printed under the project on the CV and in /cv.md, not on the project page.
    highlights: z.array(z.string()).optional(),
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
    // First month of work, set only where a source dates it (git history, the owner); absent means the month is unknown, never a guess.
    started: month.optional(),
    stack: z.array(z.string()),
    status: z.enum(PROJECT_STATUSES).nullable(),
    summary: z.string(),
    year: z.number().int().nullable(),
  })
  .refine(
    (p) => p.started === undefined || p.started.startsWith(`${p.year}-`),
    {
      message: "started must fall in the project's year",
    }
  )
  .refine(
    (p) =>
      p.ended === undefined ||
      (p.started !== undefined && p.ended >= p.started),
    { message: "ended needs a started month no later than it" }
  );
export const projectsSchema = z.array(projectSchema);

export type Project = z.infer<typeof projectSchema>;
