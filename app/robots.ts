import { siteUrl } from "~/lib/site-url";

import type { MetadataRoute } from "next";

// AI crawlers are named so the permission is explicit, not implied by the wildcard. Allowing the training bots (Google-Extended, CCBot) is a choice, not a visibility need.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "CCBot",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { allow: "/", userAgent: "*" },
      ...AI_BOTS.map((userAgent) => ({ allow: "/", userAgent })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
