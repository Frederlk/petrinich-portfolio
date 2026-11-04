import { textResponse } from "~/lib/response";
import { siteUrl } from "~/lib/site-url";

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

// Content-Signal, a route handler and not robots.ts, because MetadataRoute.Robots has no field for it. A draft (Cloudflare's Content Signals Policy) with no confirmed reader; it says what the Allow lines say. Repeated in every group, because a bot with a group of its own never reads the `*` group (RFC 9309).
const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=yes";

const group = (userAgent: string) =>
  `User-Agent: ${userAgent}\nAllow: /\nContent-Signal: ${CONTENT_SIGNAL}\n`;

export function GET() {
  return textResponse(
    [...["*", ...AI_BOTS].map(group), `Sitemap: ${siteUrl}/sitemap.xml\n`].join(
      "\n"
    )
  );
}
