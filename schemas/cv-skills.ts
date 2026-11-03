import { z } from "zod";

// Technology ids that appear in the short skills list on /cv. An object with one list, not a bare array: Pages CMS edits a list of strings as a field.
export const cvSkillsSchema = z.object({ skills: z.array(z.string()) });
