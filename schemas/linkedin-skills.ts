import { z } from "zod";

// LinkedIn's Skills section in display order (owner's ranking, 2026-11-06). `name` is LinkedIn's own skill name ("Prisma ORM", "sanity.io"); `tech` ties it to the projects that use it, `jobs` to roles where no technology stands behind it (Team Management).
export const linkedinSkillsSchema = z.object({
  skills: z
    .array(
      z
        .object({
          jobs: z.array(z.string()).min(1).optional(),
          name: z.string().min(1),
          tech: z.string().optional(),
        })
        .refine((s) => s.tech !== undefined || s.jobs !== undefined, {
          message:
            "a skill needs a tech or jobs, or nothing on LinkedIn shows where it was used",
        })
    )
    // LinkedIn holds at most 100 skills on a profile.
    .max(100)
    .refine((list) => new Set(list.map((s) => s.name)).size === list.length, {
      message: "skill names must be unique",
    }),
});
