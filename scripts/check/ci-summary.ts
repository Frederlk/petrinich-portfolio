#!/usr/bin/env node
/**
 * Writes one job's checks as a table to the run's summary page: `bun scripts/check/ci-summary.ts <job>`, with `STEPS` set to `${{ toJSON(steps) }}`.
 *
 * Every step with an `id` in `.github/workflows/ci.yml` is a row, in the order the job ran them. Without `GITHUB_STEP_SUMMARY` (a local run) the table goes to stdout.
 *
 * It also runs after a failed install, so it imports nothing from `node_modules`.
 */

import fs from "node:fs";

import { isRecord } from "../lib/is-record.ts";

const ICON = { success: "✅", failure: "❌", cancelled: "⛔", skipped: "⏭️" };

const hasIcon = (outcome: string): outcome is keyof typeof ICON =>
  Object.hasOwn(ICON, outcome);

const job = process.argv[2] ?? "job";
const steps: unknown = JSON.parse(process.env.STEPS ?? "{}");
if (!isRecord(steps)) {
  throw new Error(
    "STEPS is not a JSON object; set it to the workflow's `toJSON(steps)`"
  );
}

const rows = Object.entries(steps).map(([id, step]) => {
  if (!isRecord(step) || typeof step.outcome !== "string") {
    throw new Error(`STEPS.${id} carries no \`outcome\` string`);
  }
  const { outcome } = step;
  return `| \`${id}\` | ${hasIcon(outcome) ? ICON[outcome] : ""} ${outcome} |`;
});

const table = [
  `### ${job}`,
  "",
  "| Check | Result |",
  "|---|---|",
  ...rows,
  "",
].join("\n");

const stepSummary = process.env.GITHUB_STEP_SUMMARY ?? "";
if (stepSummary === "") {
  process.stdout.write(`${table}\n`);
} else {
  fs.appendFileSync(stepSummary, `${table}\n`);
}
