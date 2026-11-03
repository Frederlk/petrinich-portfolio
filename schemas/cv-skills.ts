import { z } from "zod";

// Technology ids that appear in the short skills list on /cv, as `{ skills: [...] }`.
export const cvSkillsSchema = z.object({ skills: z.array(z.string()) });
