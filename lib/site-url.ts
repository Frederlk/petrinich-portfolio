import { env } from "~/env";

// Canonical origin for metadata, sitemap, robots and structured data. SITE_URL wins, otherwise the current public address.
export const siteUrl = env.SITE_URL ?? "https://sergey-petrinich.vercel.app";
