import { z } from "zod";

import { linkSchema } from "~/schemas/link";

const count = z.number().int().nonnegative();

export const experienceSchema = z.array(
  z.object({
    bullets: z.array(z.string()),
    company: z.string(),
    dates: z.string(),
    description: z.string(),
    id: z.string(),
    links: z.array(linkSchema),
    role: z.string(),
    stack: z.array(z.string()),
    // The developers this job had the owner lead: `led` over the whole job, `peak` at one time, `hired` the ones he recruited. The site's "developers led", "up to N at a time" and "hired" figures are sums and maxima of these, never typed elsewhere.
    team: z
      .object({
        hired: count.optional(),
        led: count,
        peak: count.optional(),
      })
      .optional(),
  })
);

export type Experience = z.infer<typeof experienceSchema>[number];
