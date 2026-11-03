#!/usr/bin/env bun
/**
 * typecheck-staged.ts
 *
 * The pre-commit typecheck step. Skips `bun typecheck` when every staged path is documentation (nothing a type error can live in), and names the failing file when it is not in the commit.
 *
 * The typecheck runs on a snapshot of the index (`git write-tree` + `git archive` into a temp dir, `node_modules` junctioned in), never on the working copy: another session's unfinished file cannot fail this commit, and a file the commit needs but does not contain (a message key left unstaged) fails it. `write-tree` honours `GIT_INDEX_FILE`, writes only objects, and leaves the index and the working tree alone. If the index cannot be written (unmerged entries) the check falls back to the working copy and the message names a failing file outside the commit.
 *
 * Usage: bun scripts/check/typecheck-staged.ts   (reads the staged paths from git)
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, rmdirSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

const CODE_EXT = /\.(?:[cm]?[jt]sx?|json)$/;
const DOCS_DIR = /^(?:docs|\.claude\/rules)\//;

/** A path no type error can come from: Markdown anywhere, or a non-code file under `docs/` or `.claude/rules/`. */
export const isDocsLike = (file: string): boolean =>
  /\.mdx?$/.test(file) || (DOCS_DIR.test(file) && !CODE_EXT.test(file));

/** Files `tsc` reported an error in, as written in its output: `path(line,col): error TS…`. */
export const failingFiles = (output: string): string[] => [
  ...new Set(
    [...output.matchAll(/^(.+?)\(\d+,\d+\): error TS\d+/gm)].map(
      (match) => match[1] ?? ""
    )
  ),
];

/** The failing files that this commit does not contain. */
export const outsideCommit = (output: string, staged: string[]): string[] =>
  failingFiles(output).filter(
    (file) => !staged.includes(file.replaceAll("\\", "/"))
  );

/** Deletions count: removing a `.ts` file can break its importers. */
export const STAGED_DIFF_ARGS = [
  "diff",
  "--cached",
  "--name-only",
  "--diff-filter=ACMRD",
  "-z",
];

/** Skip only when something is staged and all of it is documentation; an empty list stays checked. */
export const skipsTypecheck = (staged: string[]): boolean =>
  staged.length > 0 && staged.every(isDocsLike);

/** Runs `fn` in a throwaway checkout of the index tree; null when the index has no tree to write. */
const inSnapshot = <T>(fn: (dir: string) => T): T | null => {
  const tree = spawnSync("git", ["write-tree"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  if (tree.status !== 0) {
    return null;
  }
  const dir = mkdtempSync(path.join(tmpdir(), "portfolio-typecheck-"));
  const nodeModules = path.join(dir, "node_modules");
  try {
    const tar = path.join(dir, "snapshot.tar");
    const archive = spawnSync(
      "git",
      ["archive", "--format=tar", "-o", tar, tree.stdout.trim()],
      { cwd: REPO_ROOT }
    );
    // Relative names with `cwd`: GNU tar reads `C:` in an absolute path as a remote host.
    const extract = spawnSync("tar", ["-xf", "snapshot.tar"], { cwd: dir });
    if (archive.status !== 0 || extract.status !== 0) {
      return null;
    }
    symlinkSync(path.join(REPO_ROOT, "node_modules"), nodeModules, "junction");
    return fn(dir);
  } finally {
    // The junction goes first: a recursive remove must never walk into the real node_modules.
    try {
      rmdirSync(nodeModules);
    } catch {
      // not created
    }
    rmSync(dir, { recursive: true, force: true });
  }
};

// `bun typecheck` is plain `tsc --noEmit` here: it loads no `.env*`, so the snapshot (which carries none) needs no placeholders.
const runTypecheck = (cwd: string) =>
  spawnSync("bun", ["typecheck"], {
    cwd,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    shell: process.platform === "win32",
  });

const main = (): number => {
  const staged = spawnSync("git", STAGED_DIFF_ARGS, {
    cwd: REPO_ROOT,
    encoding: "utf8",
  })
    .stdout.split("\0")
    .filter(Boolean);

  if (skipsTypecheck(staged)) {
    console.log("Only documentation staged: typecheck skipped.");
    return 0;
  }

  const result =
    inSnapshot((dir) => runTypecheck(dir)) ?? runTypecheck(REPO_ROOT);
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  if (result.status === 0) {
    return 0;
  }

  const outside = outsideCommit(`${result.stdout}\n${result.stderr}`, staged);
  for (const file of outside) {
    console.error(`error in a file outside this commit: ${file}`);
  }
  return result.status ?? 1;
};

if (import.meta.main) {
  process.exit(main());
}
