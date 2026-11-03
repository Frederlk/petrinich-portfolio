import { z } from "zod";

import { linkSchema } from "~/schemas/link";

// The CMS can save an emptied number as "" or null and an emptied object as {}; all of them mean "not set".
const isBlank = (value: unknown) =>
  value === "" || value === null || value === undefined;
const optionalCount = z.preprocess(
  (value) => (isBlank(value) ? undefined : value),
  z.number().int().nonnegative().optional()
);
const isBlankTeam = (team: unknown) =>
  isBlank(team) ||
  (typeof team === "object" &&
    team !== null &&
    (!("led" in team) || isBlank(team.led)));

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
    team: z.preprocess(
      (team) => (isBlankTeam(team) ? undefined : team),
      z
        .object({
          hired: optionalCount,
          led: z.number().int().nonnegative(),
          peak: optionalCount,
        })
        .optional()
    ),
  })
);

export type Experience = z.infer<typeof experienceSchema>[number];
