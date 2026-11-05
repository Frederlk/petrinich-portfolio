import { z } from "zod";

export const certificatesSchema = z.object({
  certificates: z.array(
    z.object({
      credentialId: z.string(),
      issued: z.iso.date(),
      issuer: z.string(),
      name: z.string(),
      url: z.url(),
    })
  ),
});
