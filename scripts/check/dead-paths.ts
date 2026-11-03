#!/usr/bin/env node
/**
 * dead-paths.ts
 *
 * Fails when a comment or a document cites a repository path that does not exist.
 *
 * `markdown-links.ts` already guards `[text](./relative)` links, but the convention here is a path absolute from the repository root, in backticks, everywhere — code comments included. That form is checked by nothing else, which is the gap this closes.
 *
 * **The failure is silent.** A dead relative link renders as ordinary text in most viewers; a dead backtick path renders as ordinary code.
 *
 * Usage:
 *   bun scripts/check/dead-paths.ts            # every tracked file
 *   bun scripts/check/dead-paths.ts a.ts b.md  # only these (pre-commit passes staged paths)
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { tryCatchSync } from "../../utils/try-catch.ts";

// Paths resolve relative to this file, never to the caller's cwd — pre-commit does not guarantee a working directory (scripts/README.md).
const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

const rel = (file: string): string =>
  path.relative(REPO_ROOT, file).replaceAll("\\", "/");

/**
 * Files whose citations are a historical record rather than a live pointer: none today.
 *
 * `.claude/skills/**` is vendored: its prose cites paths inside its own upstream package.
 */
const UNCHECKED_DIRS = [
  ".scratch",
  ".claude/skills",
  "node_modules",
  ".git",
  ".next",
];

/**
 * A citation only counts when it *claims* to be a path from the repository root — its first segment must be a real top-level directory here.
 *
 * That is the whole design, and it is what keeps the guard usable. A short reference like `api/contract.ts` is not an address and cannot be resolved; demanding a full path for each would bury a real finding under false ones. A citation starting `components/` or `lib/`, by contrast, is making a checkable claim.
 */
const ROOT_SEGMENTS = new Set([
  ...fs
    .readdirSync(REPO_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name),
  // Dot directories count only where they exist: `.claude/` and `.scratch/` are gitignored, so a public clone and CI have neither, and a citation into them cannot be checked there.
  ...[".claude", ".scratch", ".github", ".husky", ".vscode"].filter((dir) =>
    fs.existsSync(path.join(REPO_ROOT, dir))
  ),
]);

const EXTENSIONS = "ts|tsx|mts|mjs|cjs|js|jsx|md|json|jsonc|sh|sql|css|ya?ml";

// A backtick-quoted path with an extension, optionally followed by an `#anchor` or a `:line` this guard ignores. The path must contain a slash: a bare `env.ts` names a file without addressing one.
const CITATION_RE = new RegExp(
  `\`([a-zA-Z_.][a-zA-Z0-9_./@-]*/[a-zA-Z0-9_.@-]+\\.(?:${
    EXTENSIONS
  }))(?:#[^\`]*)?\``,
  "g"
);

const SCANNED_EXTENSIONS = [".ts", ".tsx", ".mts", ".mjs", ".md"];

/**
 * Files carrying a citation that must NOT resolve, listed by path with the reason.
 *
 * **Naming a path that does not exist is sometimes legitimate** — a warning against a path that must not exist, or a record of a deleted file. Demanding those be "fixed" would delete the warning and invite the mistake back.
 *
 * **An explicit list, not a keyword heuristic.** A heuristic that exempts any line containing `not` or `never` also matches inside a filename like `does-not-exist.ts`, so a deliberately injected dead citation passes. Every entry is a decision someone made and can be read; a new one costs a line and a reason.
 */
const INTENTIONALLY_ABSENT = new Map([
  [
    "scripts/check/dead-paths.ts",
    "this file quotes example paths in its own docblock",
  ],
  [
    "docs/research/motion-portfolio-2026.md",
    "research done before this repo existed; it cites files in the reference repos it studied (alba-swiss-web)",
  ],
  [
    "docs/research/design-tooling-2026.md",
    "research done before this repo existed; it cites paths inside the third-party skill packages it reviewed",
  ],
]);

function trackedFiles(): string[] {
  const out = execFileSync(
    "git",
    [
      "-C",
      REPO_ROOT,
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
  return out.split("\0").filter((file) => file !== "");
}

const isUnchecked = (relative: string): boolean =>
  UNCHECKED_DIRS.some(
    (dir) => relative === dir || relative.startsWith(`${dir}/`)
  );

const argv = process.argv.slice(2);
const candidates = (argv.length > 0 ? argv.map(rel) : trackedFiles()).filter(
  (relative) =>
    SCANNED_EXTENSIONS.some((ext) => relative.endsWith(ext)) &&
    !isUnchecked(relative)
);

const findings: { file: string; line: number; cited: string }[] = [];

for (const relative of candidates) {
  const full = path.join(REPO_ROOT, relative);
  const { data: body } = tryCatchSync(() => fs.readFileSync(full, "utf8"));
  if (body === null) {
    continue;
  }

  for (const [index, line] of body.split("\n").entries()) {
    for (const [, cited] of line.matchAll(CITATION_RE)) {
      if (cited === undefined) {
        continue;
      }
      const [first = ""] = cited.split("/");

      // Not addressed from the root — a short reference, not a claim about where a file lives.
      if (!ROOT_SEGMENTS.has(first)) {
        continue;
      }
      if (fs.existsSync(path.join(REPO_ROOT, cited))) {
        continue;
      }
      // A README addresses its own subtree: `scripts/README.md` can write `check/gates.sh` for `scripts/check/gates.sh`. The first segment still had to look like a root directory to get here, so this only rescues a citation that resolves — it does not open the gate to arbitrary short references.
      if (fs.existsSync(path.join(REPO_ROOT, path.dirname(relative), cited))) {
        continue;
      }
      // This file is listed as deliberately naming something absent. See INTENTIONALLY_ABSENT.
      if (INTENTIONALLY_ABSENT.has(relative)) {
        continue;
      }

      findings.push({ file: relative, line: index + 1, cited });
    }
  }
}

if (findings.length === 0) {
  console.log(`dead paths OK (${candidates.length} files checked)`);
  process.exit(0);
}

console.error(
  `Citations pointing at files that do not exist: ${findings.length}\n`
);
for (const finding of findings) {
  console.error(`  ${finding.file}:${finding.line}`);
  console.error(`    \`${finding.cited}\`\n`);
}
console.error(
  "A path written from the repository root is a claim that can be checked, and these do not hold. Fix the path, or — if the target is in node_modules or gone for good — name the symbol in words instead, per `.claude/rules/comments.md`."
);
process.exit(1);
