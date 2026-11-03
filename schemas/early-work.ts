import { z } from "zod";

import { linkSchema } from "~/schemas/link";

export const earlyWorkSchema = z.array(
  z.object({
    // Id of `content/case-studies/<id>.mdx`, or null; same rule as `caseStudy` on a project.
    caseStudy: z
      .string()
      .nullish()
      .transform((id) => (id === undefined || id === "" ? null : id)),
    id: z.string(),
    links: z.array(linkSchema),
    // Public paths under `public/work/early/`, same meaning as `media` on a project.
    media: z.array(z.string()).default([]),
    stack: z.array(z.string()),
    summary: z.string(),
    title: z.string(),
    year: z.number().int(),
  })
);

export type EarlyWork = z.infer<typeof earlyWorkSchema>[number];
