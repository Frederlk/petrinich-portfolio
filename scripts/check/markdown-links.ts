#!/usr/bin/env node
/**
 * markdown-links.ts
 *
 * Fails when a relative Markdown link points at a file that does not exist.
 *
 * Only relative links are checked. External URLs, bare anchors (`#section`) and absolute paths are out of scope — an anchor checker would parse every heading, and this guard stays cheap enough to run on every commit.
 *
 * It also fails a file carrying more than one top-level `# ` heading. A second `# ` reads as a second document rather than a section, so every link written to the file becomes ambiguous — a link resolves to a document, and two top-level headings give it two places to land. A file with no `# ` at all is fine and is not flagged.
 *
 * Usage:
 *   bun scripts/check/markdown-links.ts            # whole repo
 *   bun scripts/check/markdown-links.ts a.md b.md  # only these files (pre-commit passes staged files)
 */

import fs from "node:fs";
import path from "node:path";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
]);

// Matched against the repo-relative path, not the bare name: `.claude/` itself must stay scanned, only `.claude/worktrees` is skipped. Gitignored git worktrees: each is a second checkout of the repo, so its half-edited Markdown is another session's work, not this tree's.
const SKIP_PATHS = new Set([".claude/worktrees"]);

// `[text](./path)` or `text, `scripts/path``, with an optional `#anchor` we ignore. Angle-bracket and title forms are not checked.
const LINK_RE = /\]\((\.\.?\/[^)#\s]+)(#[^)\s]*)?\)/g;

// A fenced block can open with `# ` as shell prompt or comment; counting it as a heading would fail files that contain a code sample. Fences are stripped before counting, not matched around.
export function countTopLevelHeadings(body: string): number {
  return body
    .replaceAll(/^```[\s\S]*?^```/gm, "")
    .split("\n")
    .filter((line) => line.startsWith("# ")).length;
}

function collectMarkdown(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (SKIP_PATHS.has(full.replaceAll("\\", "/"))) continue;
    if (entry.isDirectory()) collectMarkdown(full, out);
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

// Only scan when run as a command. `countTopLevelHeadings` is imported by the test, and a bare import must not walk the repo or call `process.exit` — which it did, failing the suite before a single case ran.
if (
  process.argv[1] !== undefined &&
  import.meta.filename === path.resolve(process.argv[1])
) {
  main();
}

function main(): void {
  const files =
    process.argv.length > 2 ? process.argv.slice(2) : collectMarkdown(".");

  const broken: { file: string; line: number; link: string }[] = [];
  const multiHeading: { file: string; count: number }[] = [];
  for (const file of files) {
    if (!(fs.existsSync(file) && file.endsWith(".md"))) continue;
    const body = fs.readFileSync(file, "utf8");
    const posix = file.replaceAll("\\", "/");
    const count = countTopLevelHeadings(body);
    if (count > 1) multiHeading.push({ file: posix, count });
    const lines = body.split("\n");
    for (const [i, line] of lines.entries()) {
      for (const [, link] of line.matchAll(LINK_RE)) {
        if (link === undefined) continue;
        const target = path.resolve(
          path.dirname(file),
          decodeURIComponent(link)
        );
        if (!fs.existsSync(target)) {
          broken.push({
            file: file.replaceAll("\\", "/"),
            line: i + 1,
            link,
          });
        }
      }
    }
  }

  if (broken.length === 0 && multiHeading.length === 0) {
    console.log(`markdown links OK (${files.length} files checked)`);
    process.exit(0);
  }

  if (broken.length > 0) {
    console.error(`Broken relative markdown links: ${broken.length}\n`);
    for (const b of broken) {
      console.error(`  ${b.file}:${b.line}  ->  ${b.link}`);
    }
    console.error(
      "\nRelative links resolve from the directory of the file containing them."
    );
  }

  if (multiHeading.length > 0) {
    if (broken.length > 0) console.error("");
    console.error(
      `Files with more than one top-level heading: ${multiHeading.length}\n`
    );
    for (const m of multiHeading) {
      console.error(`  ${m.file}  ->  ${m.count} \`# \` headings`);
    }
    console.error(
      "\nA document has one `# `. A second one reads as a second document, so every link to the file becomes ambiguous — demote the later heading to `## `."
    );
  }

  process.exit(1);
}
