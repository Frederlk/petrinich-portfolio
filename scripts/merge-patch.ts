#!/usr/bin/env node
/**
 * merge-patch.ts
 *
 * Merges writer patches (`private/projects/<id>.patch.json`) into `content/projects.json`, or the keyed early-work patches into `content/early-work.json`. Every wave used to write a throwaway Node script for this and then fail `bun gates` on an unformatted JSON file; this one validates stack ids against the registry, points `caseStudy` at the article and formats the result.
 *
 * A patch key replaces the record's key. `notes` is for the reviewer and never reaches the record. `stackAdd` and `stackRemove` edit the stack list; `stack` replaces it. An id that is not in the record is added as a new personal project (the patch must then carry `name`, `roleNote`, `summary`, `features`, `year`, `status`, `stack`).
 *
 * Usage:
 *   bun scripts/merge-patch.ts <id> [<id> ...]           # projects
 *   bun scripts/merge-patch.ts --early 1 2 3 4 5 6       # early-work batches (private/projects/early-<n>.patch.json)
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const ROOT = path.resolve(import.meta.dirname, "..");
const PATCHES = path.join(ROOT, "private/projects");

const jsonObject = z.record(z.string(), z.unknown());
type Json = z.infer<typeof jsonObject>;
const idList = z.array(z.string()).default([]);

/** The record after the patch: patch keys win, `notes` and the stack edit keys are consumed. */
export function mergePatch(record: Json, patch: Json): Json {
  const { notes: _notes, stackAdd, stackRemove, ...keys } = patch;
  const merged = { ...record, ...keys };
  const stack = new Set(idList.parse(merged.stack));
  for (const id of idList.parse(stackAdd)) {
    stack.add(id);
  }
  for (const id of idList.parse(stackRemove)) {
    stack.delete(id);
  }
  return { ...merged, stack: [...stack] };
}

const NEW_PROJECT_DEFAULTS: Json = {
  anonymous: false,
  domain: [],
  employer: null,
  featured: false,
  kind: "personal",
  links: [],
  media: [],
  role: "sole",
  scope: [],
};

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readRecords(file: string): Json[] {
  return z.array(jsonObject).parse(readJson(path.join(ROOT, file)));
}

function patchesFor(early: boolean, ids: string[]): [string, Json][] {
  if (early) {
    return ids.flatMap((n) =>
      Object.entries(
        z
          .record(z.string(), jsonObject)
          .parse(readJson(path.join(PATCHES, `early-${n}.patch.json`)))
      )
    );
  }
  return ids.map((id) => [
    id,
    jsonObject.parse(readJson(path.join(PATCHES, `${id}.patch.json`))),
  ]);
}

function main(): void {
  const args = process.argv.slice(2);
  const early = args[0] === "--early";
  const ids = early ? args.slice(1) : args;
  if (ids.length === 0) {
    throw new Error("usage: merge-patch.ts [--early] <id|batch> ...");
  }
  const known = new Set(
    readRecords("content/technologies.json").map((t) => String(t.id))
  );
  const file = early ? "content/early-work.json" : "content/projects.json";
  const records = readRecords(file);
  const patches = patchesFor(early, ids);

  for (const [id, patch] of patches) {
    const at = records.findIndex((r) => r.id === id);
    const existing = records[at];
    const base = existing ?? { ...NEW_PROJECT_DEFAULTS, id };
    const merged: Json = { ...mergePatch(base, patch), caseStudy: id };
    const bad = idList.parse(merged.stack).filter((s) => !known.has(s));
    if (bad.length > 0) {
      throw new Error(`${id}: unknown technology id ${bad.join(", ")}`);
    }
    if (existing === undefined) {
      records.push(merged);
    } else {
      records[at] = merged;
    }
  }

  fs.writeFileSync(
    path.join(ROOT, file),
    `${JSON.stringify(records, null, 2)}\n`
  );
  // The format gate fails on a hand-written JSON file, so format it here rather than at the first red run.
  execFileSync("bun", ["oxfmt", file], {
    cwd: ROOT,
    shell: true,
    stdio: "inherit",
  });
  console.log(`merged ${patches.length} patch(es) into ${file}`);
}

if (
  process.argv[1] !== undefined &&
  import.meta.filename === path.resolve(process.argv[1])
) {
  main();
}
