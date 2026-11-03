import { z } from "zod";

export const linkSchema = z.object({ label: z.string(), url: z.string() });
