import { z } from "zod";

// The short skills list on /cv: named groups of technology ids, printed in file order. The groups are the CV's own, not the technology groups of technologies.json, so each row can be sized to one printed line.
export const cvSkillsSchema = z.object({
  groups: z.array(
    z.object({ items: z.array(z.string()).min(1), name: z.string().min(1) })
  ),
});
