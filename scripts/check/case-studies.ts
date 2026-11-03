#!/usr/bin/env node
/**
 * case-studies.ts
 *
 * The mechanical half of the project-article rules (`private/projects/_brief.md`). Reviewers caught the same slips in every wave — an article over its word limit, a backtick or em dash, a bullet glued to the line before it, a case with no blank line above its lead-in, a record with more than 12 feature lines — and each one cost a review round and a rewrite.
 *
 * What a regex cannot decide (role overreach, claims the dossier does not support, defects phrased as scope) stays with the reviewer; `.claude/rules/case-studies.md` carries it.
 *
 * Usage:
 *   bun scripts/check/case-studies.ts                   # every article and record
 *   bun scripts/check/case-studies.ts a.mdx b.mdx       # only these articles (pre-commit passes staged paths)
 */

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
const ARTICLES = path.join(REPO_ROOT, "content/case-studies");

export const MAX_WORDS = 700;
export const MAX_FEATURE_LINES = 12;

// Words that must not appear in an article or its record: the owner has not agreed to publish them. A new entry here is one line.
export const FORBIDDEN: Record<string, RegExp> = {
  "music-downloader": /\b(spotify|spotdl|yt-dlp|youtube|deezer)\b/i,
  "restaurant-ordering-app": /\b(tapston|tserve|tap\s*(&|and)\s*serve?)\b/i,
  "vpn-proxy": /\b(latvia|latvian|belarus|russia|russian|minsk|riga|ripe)\b/i,
};

/** Every rule a single article body breaks, as short messages. */
export function checkArticle(id: string, body: string): string[] {
  const problems: string[] = [];
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words > MAX_WORDS) {
    problems.push(`${words} words, limit ${MAX_WORDS}`);
  }
  if (body.includes("`")) {
    problems.push("backtick: the repos are private, so name no code");
  }
  if (body.includes("—")) {
    problems.push("em dash");
  }
  if (/[.!?]- [A-Z]/.test(body)) {
    problems.push("two list items glued onto one line");
  }
  const lines = body.split("\n");
  for (const [i, line] of lines.entries()) {
    const above = lines[i - 1];
    if (line.startsWith("**") && above !== undefined && above.trim() !== "") {
      problems.push(`line ${i + 1}: a bold lead-in needs a blank line above`);
    }
  }
  const banned = FORBIDDEN[id]?.exec(body);
  if (banned) {
    problems.push(`forbidden word "${banned[0]}"`);
  }
  return problems;
}

const entrySchema = z.object({
  caseStudy: z.string().nullish(),
  features: z
    .array(
      z.union([
        z.string(),
        z.object({ items: z.array(z.string()), title: z.string() }),
      ])
    )
    .optional(),
  id: z.string(),
});
type Entry = z.infer<typeof entrySchema>;

/** The number of lines a record shows under Capabilities. */
export function featureLines(
  features: (string | { items: string[]; title: string })[]
): number {
  return features.reduce(
    (sum, f) => sum + (typeof f === "string" ? 1 : f.items.length),
    0
  );
}

function readJson(file: string): Entry[] {
  const raw: unknown = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, file), "utf8")
  );
  return z.array(entrySchema).parse(raw);
}

// Only scan when run as a command: the test imports the functions above, and a bare import must not walk the repo.
if (
  process.argv[1] !== undefined &&
  import.meta.filename === path.resolve(process.argv[1])
) {
  main();
}

function main(): void {
  const staged = process.argv.slice(2).filter((f) => f.endsWith(".mdx"));
  const ids =
    staged.length > 0
      ? staged.map((f) => path.basename(f, ".mdx"))
      : fs
          .readdirSync(ARTICLES)
          .filter((f) => f.endsWith(".mdx") && f !== "README.mdx")
          .map((f) => path.basename(f, ".mdx"));
  const records = [
    ...readJson("content/projects.json"),
    ...readJson("content/early-work.json"),
  ];
  const failures: string[] = [];

  for (const id of ids) {
    const file = path.join(ARTICLES, `${id}.mdx`);
    if (!fs.existsSync(file)) continue;
    for (const p of checkArticle(id, fs.readFileSync(file, "utf8"))) {
      failures.push(`content/case-studies/${id}.mdx  ${p}`);
    }
    if (!records.some((r) => r.caseStudy === id)) {
      failures.push(
        `content/case-studies/${id}.mdx  no record points at this article`
      );
    }
  }
  for (const r of records) {
    const lines = featureLines(r.features ?? []);
    if (lines > MAX_FEATURE_LINES) {
      failures.push(
        `${r.id}  ${lines} feature lines, limit ${MAX_FEATURE_LINES}`
      );
    }
    const forbidden = FORBIDDEN[r.id]?.exec(JSON.stringify(r));
    if (forbidden) {
      failures.push(`${r.id}  record has forbidden word "${forbidden[0]}"`);
    }
    if (
      (r.caseStudy ?? "") !== "" &&
      !fs.existsSync(path.join(ARTICLES, `${r.caseStudy}.mdx`))
    ) {
      failures.push(`${r.id}  caseStudy "${r.caseStudy}" has no article`);
    }
  }

  if (failures.length === 0) {
    console.log(`case studies OK (${ids.length} articles checked)`);
    process.exit(0);
  }
  console.error(`Case study rules broken: ${failures.length}\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error("\nThe rules live in private/projects/_brief.md.");
  process.exit(1);
}
