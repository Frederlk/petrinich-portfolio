import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

const SCRIPT = path.resolve(import.meta.dirname, "ci-summary.ts");

/** Runs the script under the Node running this suite, as CI does. Without `summaryFile`, `GITHUB_STEP_SUMMARY` is removed so the table goes to stdout. */
function summarise(steps: string, summaryFile?: string): string {
  const { GITHUB_STEP_SUMMARY: _summary, ...env } = process.env;
  return execFileSync(process.execPath, [SCRIPT, "check"], {
    encoding: "utf8",
    env: {
      ...env,
      STEPS: steps,
      ...(summaryFile === undefined
        ? {}
        : { GITHUB_STEP_SUMMARY: summaryFile }),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

void describe("ci-summary.ts", () => {
  void it("writes one row per step in run order", () => {
    const steps = JSON.stringify({
      lint: { outcome: "success" },
      test: { outcome: "failure" },
      build: { outcome: "neutral" },
    });
    assert.equal(
      summarise(steps),
      [
        "### check",
        "",
        "| Check | Result |",
        "|---|---|",
        "| `lint` | ✅ success |",
        "| `test` | ❌ failure |",
        "| `build` |  neutral |",
        "",
        "",
      ].join("\n")
    );
  });

  // Every job of the run writes to the same summary page, so a job that overwrote it would erase the jobs before it.
  void it("appends to the run's summary file rather than replacing it", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ci-summary-"));
    const file = path.join(dir, "summary.md");
    fs.writeFileSync(file, "earlier job\n");
    try {
      const stdout = summarise(
        JSON.stringify({ lint: { outcome: "success" } }),
        file
      );
      assert.equal(stdout, "");
      assert.equal(
        fs.readFileSync(file, "utf8"),
        "earlier job\n### check\n\n| Check | Result |\n|---|---|\n| `lint` | ✅ success |\n\n"
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  void it("fails on a STEPS value that is not the workflow's steps object", () => {
    assert.throws(() => summarise("[]"), /STEPS is not a JSON object/);
    assert.throws(
      () => summarise(JSON.stringify({ lint: {} })),
      /STEPS.lint carries no `outcome` string/
    );
  });
});
