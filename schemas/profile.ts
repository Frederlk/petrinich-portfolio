import { z } from "zod";

import { linkSchema } from "~/schemas/link";

export const profileSchema = z.object({
  contacts: z.array(linkSchema),
  // Also the GitHub profile bio (scripts/sync-github.ts), which GitHub caps at 160 characters.
  headline: z.string().max(160),
  intro: z.string(),
  // LinkedIn caps the headline at 220 characters; scripts/linkedin.ts pastes it from here.
  linkedinHeadline: z.string().max(220),
  location: z.string(),
  name: z.string(),
  photo: z.string().startsWith("/"),
  summary: z.string(),
  title: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;
