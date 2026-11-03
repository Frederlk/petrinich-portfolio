import { z } from "zod";

// `stack` entries in projects, early work, open source and cv-skills are technology ids from this file. The usage facts (project counts, years) are not stored: lib/content.ts counts them from the work at build time.
export const technologiesSchema = z.array(
  z.object({
    aliases: z.array(z.string()),
    group: z.string(),
    id: z.string(),
    // True for a technology the owner lists without a project behind it: /stack shows it as a plain chip with no count.
    listedByOwner: z.boolean().optional(),
    name: z.string(),
  })
);
