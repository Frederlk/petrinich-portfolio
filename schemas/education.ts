import { z } from "zod";

export const educationSchema = z.object({
  education: z.array(
    z.object({
      dates: z.string(),
      degree: z.string(),
      location: z.string(),
      school: z.string(),
    })
  ),
  interests: z.string(),
  languages: z.array(z.object({ level: z.string(), name: z.string() })),
});

export type Education = z.infer<typeof educationSchema>;
