import { techById } from "~/lib/content";
import type { Technology } from "~/lib/content";
import { withoutImplied } from "~/lib/stack-display";

// One technology per layer of the app, the first listed that the project uses: framework, API, data, services, AI, infrastructure. React counts only as the app layer of a plain React app (`withoutImplied` drops it under Next.js).
const LAYERS: readonly (readonly string[])[] = [
  [
    "next-js",
    "nuxt",
    "expo",
    "react-native",
    "electron",
    "tanstack-start",
    "react",
    "vue",
    "vite",
  ],
  ["orpc", "trpc", "nestjs", "express", "fastapi", "hono", "graphql", "koa"],
  [
    "prisma",
    "drizzle",
    "knex",
    "mongoose",
    "mongodb",
    "supabase",
    "firebase",
    "convex",
    "postgresql",
  ],
  [
    "sanity",
    "payload",
    "strapi",
    "shopify",
    "stripe",
    "better-auth",
    "clerk",
    "nextauth",
    "aws-cognito",
  ],
  ["claude-api", "openai-api", "gemini-api", "vercel-ai-sdk", "mcp"],
  ["cloudflare-workers", "aws", "vercel", "docker", "aws-amplify"],
];

// After the layers, the rest of the stack in this order of groups, each group in stack order (the main ones are listed first).
const GROUP_ORDER = [
  "Core stack",
  "APIs & back end",
  "Data",
  "Auth, payments, email",
  "CMS & commerce",
  "AI engineering",
  "Front end",
  "Media & real time",
  "Infrastructure & observability",
  "Web3",
  "State, forms & data fetching",
  "Platform & web APIs",
  "Languages & markup",
];

// How the code was made, not what the product is built on: shown only to bring a thin stack up to the minimum.
const TOOLING = new Set([
  "claude-code",
  "github-actions",
  "date-fns",
  "axios",
  "git",
]);
const TOOLING_GROUPS = new Set([
  "Quality & tooling",
  "Build tools",
  "Design & collaboration",
]);

const MIN_CORE = 5;
// The most tags a stack list shows, a lead tag such as "AI-orchestrated" included (`StackBadges`).
export const MAX_CORE = 8;

// The technologies that define the app, 5 to 8 of them: one per layer, then the rest by group, then tooling only when the stack is thinner than that. Every short stack list on the site uses this, so the /work rows, Selected work and the project page name the same technologies.
export function coreTechs(stack: readonly string[]): Technology[] {
  const techs = withoutImplied(stack).flatMap((id) => {
    const tech = techById.get(id);
    return tech === undefined ? [] : [tech];
  });
  const isTooling = (t: Technology) =>
    TOOLING.has(t.id) || TOOLING_GROUPS.has(t.group);
  const layered = LAYERS.flatMap((layer) => {
    const hit = techs.find((t) => layer.includes(t.id));
    return hit === undefined ? [] : [hit];
  });
  const rank = (t: Technology) => {
    const i = GROUP_ORDER.indexOf(t.group);
    return i === -1 ? GROUP_ORDER.length : i;
  };
  const rest = techs
    .filter((t) => !layered.includes(t) && !isTooling(t))
    .toSorted((a, b) => rank(a) - rank(b));
  const picked = [...layered, ...rest].slice(0, MAX_CORE);
  const filler = techs.filter((t) => !picked.includes(t) && t.id !== "git");
  return [...picked, ...filler.slice(0, Math.max(0, MIN_CORE - picked.length))];
}
