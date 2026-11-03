import { z } from "zod";

// A project owned by someone else that the owner contributed to. `url` is the project's own site.
export const openSourceSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    stack: z.array(z.string()),
    summary: z.string(),
    year: z.number().int(),
    url: z.url(),
  })
);

export type OpenSource = z.infer<typeof openSourceSchema>[number];
