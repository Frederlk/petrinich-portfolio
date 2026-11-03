#!/usr/bin/env node
/**
 * code-rules.ts
 *
 * The mechanical half of this repo's instruction corpus. Every rule below used to be a paragraph in `CLAUDE.md` or `.claude/rules/**` that only the agent's memory enforced. Prose is read once at session start and forgotten; a violation then lands silently, with typecheck, lint and the suite all green.
 *
 * A rule a regex can decide belongs here rather than in prose, because here it is taught at the moment it is broken instead of read at session start and forgotten. Each message therefore carries the rule sentence itself: this is the only place the agent meets it.
 *
 * Regex over comment-stripped source — TypeScript 7 exposes no JS parser (`ts.createSourceFile` is `undefined` since the Go port). Comments strip first so prose quoting a banned token cannot fire.
 *
 * Usage:
 *   bun scripts/check/code-rules.ts                      # every tracked file
 *   bun scripts/check/code-rules.ts a.ts b.tsx           # only these (pre-commit passes staged paths)
 *   bun scripts/check/code-rules.ts --stdin --path x.ts  # content on stdin, before it is written (the PreToolUse hook)
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { tryCatchSync } from "../../utils/try-catch.ts";

// Paths resolve relative to this file, never to the caller's cwd — pre-commit does not guarantee a working directory (scripts/README.md).
const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

/** The gitdir a linked worktree's `.git` file names, resolved; undefined when `gitFile` is not such a file. The hook fails open on a throw (a non-zero exit is a non-blocking error), so an unreadable file reads as "none" instead. */
function gitdirOf(gitFile: string): string | undefined {
  const { data: contents } = tryCatchSync(() =>
    fs.readFileSync(gitFile, "utf8")
  );
  const gitdir =
    contents === null ? undefined : /^gitdir:\s*(.+?)\s*$/m.exec(contents)?.[1];
  return gitdir === undefined
    ? undefined
    : path.resolve(path.dirname(gitFile), gitdir);
}

/**
 * The shared git directory of the checkout at `root`, by git's own rule and without spawning git. A `.git` directory is it. A `.git` file names a gitdir (relative to the file, or absolute); when that gitdir holds a `commondir` file — a linked worktree's `<common>/worktrees/<name>` does — the shared directory is where `commondir` leads, and otherwise it is the gitdir itself (a submodule). So every worktree of the repository, and the main tree, is recognised from any of them.
 */
export function commonGitDir(root: string): string {
  const dotGit = path.join(root, ".git");
  const gitdir = gitdirOf(dotGit);
  if (gitdir === undefined) {
    return dotGit;
  }
  const common = tryCatchSync(() =>
    fs.readFileSync(path.join(gitdir, "commondir"), "utf8")
  ).data;
  return common === null ? gitdir : path.resolve(gitdir, common.trim());
}

const COMMON_GIT_DIR = commonGitDir(REPO_ROOT);

const LINKED_WORKTREES = path.join(COMMON_GIT_DIR, "worktrees");

/** Whether `dir`, which holds a `.git` entry, is a checkout of this repository: the main tree, whose `.git` is the shared git directory, or a linked worktree, whose `.git` is a file naming a gitdir under its `worktrees/`. */
function isOwnCheckout(dir: string): boolean {
  if (path.relative(REPO_ROOT, dir) === "") {
    return true;
  }
  const dotGit = path.join(dir, ".git");
  const stat = fs.statSync(dotGit, { throwIfNoEntry: false });
  if (stat?.isDirectory() === true) {
    return path.relative(COMMON_GIT_DIR, dotGit) === "";
  }
  const gitdir = stat?.isFile() === true ? gitdirOf(dotGit) : undefined;
  if (gitdir === undefined) {
    return false;
  }
  const inside = path.relative(LINKED_WORKTREES, gitdir);
  return (
    inside !== "" &&
    inside.split(path.sep)[0] !== ".." &&
    !path.isAbsolute(inside)
  );
}

const checkoutRoots = new Map<string, string>();

/**
 * The checkout of this repository a file belongs to: its nearest ancestor holding a `.git` entry, when that entry is the main tree's or one of its linked worktrees'. The PreToolUse hook always runs this copy from the main tree, so a path taken relative to REPO_ROOT misreads every edit inside a worktree: `.claude/worktrees/<name>/components/ui/…` matches no scope, and on another drive `path.relative` returns the absolute path. A file in no checkout, or in another repository, keeps REPO_ROOT, so its path starts with `..` and no scope of this repository's rules claims it.
 */
function checkoutRoot(file: string): string {
  const visited: string[] = [];
  let dir = path.dirname(path.resolve(file));
  let root = REPO_ROOT;
  for (;;) {
    const cached = checkoutRoots.get(dir);
    if (cached !== undefined) {
      root = cached;
      break;
    }
    visited.push(dir);
    if (fs.existsSync(path.join(dir, ".git"))) {
      if (isOwnCheckout(dir)) {
        root = dir;
      }
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  for (const seen of visited) {
    checkoutRoots.set(seen, root);
  }
  return root;
}

const rel = (file: string): string =>
  path.relative(checkoutRoot(file), file).replaceAll("\\", "/");

export { rel as repoRelative };

/**
 * Removes line and block comments while keeping string and template literals. Newlines inside a stripped block comment are preserved, so a hit's reported line number is the real one.
 */
function stripComments(source: string): string {
  let out = "";
  let index = 0;

  while (index < source.length) {
    const char = source.charAt(index);
    const next = source.charAt(index + 1);

    if (char === "/" && next === "/") {
      while (index < source.length && source[index] !== "\n") {
        index++;
      }
      continue;
    }

    if (char === "/" && next === "*") {
      index += 2;
      while (
        index < source.length &&
        !(source[index] === "*" && source[index + 1] === "/")
      ) {
        if (source[index] === "\n") {
          out += "\n";
        }
        index++;
      }
      index += 2;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      const quote = char;
      out += char;
      index++;
      while (index < source.length) {
        const inner = source.charAt(index);
        if (inner === "\\") {
          out += source.slice(index, index + 2);
          index += 2;
          continue;
        }
        out += inner;
        index++;
        if (inner === quote) {
          break;
        }
      }
      continue;
    }

    out += char;
    index++;
  }

  return out;
}

const isUnder = (file: string, ...dirs: string[]): boolean =>
  dirs.some((dir) => rel(file) === dir || rel(file).startsWith(`${dir}/`));

const hasExt = (file: string, ...exts: string[]): boolean =>
  exts.some((ext) => file.endsWith(ext));

/**
 * Ported third-party component families whose memoization is upstream's decision, not ours. re-vendoring has to stay a clean copy, so rewriting their hooks would be paid for twice.
 *
 * `hooks/**` is here because the hand-rolled helpers there predate the React Compiler rule and stay as they are, `useDebouncedCallback` being a hook with unmount cleanup rather than a plain debounce.
 */
const VENDORED_MEMO_DIRS = ["components/ui", "hooks"];

/**
 * Barrels sanctioned by name, as repo-relative paths — compound component families consumed as a unit, where direct-import boilerplate would dominate every consumer. Each carries its own justifying comment; this list is the mechanical half of that carve-out.
 */
const SANCTIONED_BARRELS = new Set<string>();

const lineOf = (source: string, offset: number): number =>
  source.slice(0, offset).split("\n").length;

// Assembled rather than written, so this repo's own package-manager rule does not fire on the file that enforces it.
const WRONG_MANAGERS = ["n", "pm", "n", "px"] as const;
const WRONG_INSTALL = WRONG_MANAGERS[0] + WRONG_MANAGERS[1];
const WRONG_RUNNER = WRONG_MANAGERS[2] + WRONG_MANAGERS[3];

type Rule = {
  id: string;
  message: string;
  test: (file: string, source: string, raw: string) => { line: number }[];
};

export type Finding = {
  file: string;
  line: number;
  id: string;
  message: string;
};

/**
 * One entry per rule. `test(file, source, raw)` returns an array of `{ line }`.
 *
 * `source` is comment-stripped and `raw` is the file as written — a rule about prose reads `raw`, a rule about code reads `source`.
 */
const RULES: readonly Rule[] = [
  {
    id: "asChild",
    message: "Base UI, not Radix: compose with the render prop, never asChild.",
    test(file, source) {
      if (!hasExt(file, ".tsx")) {
        return [];
      }
      return [...source.matchAll(/\basChild\b/g)].map((match) => ({
        line: lineOf(source, match.index),
      }));
    },
  },
  {
    id: "forwardRef",
    message:
      "React 19 passes refs as ordinary props; forwardRef is not used here.",
    test(file, source) {
      if (!hasExt(file, ".ts", ".tsx")) {
        return [];
      }
      return [...source.matchAll(/\bforwardRef\b/g)].map((match) => ({
        line: lineOf(source, match.index),
      }));
    },
  },
  {
    id: "memo",
    message:
      'The React Compiler handles memoization: no useMemo, useCallback or React.memo. Use useEffectEvent for a stable effect handler. A library with interior mutability (TanStack Table/Virtual, react-hook-form, MobX, zustand) needs the "use no memo" directive instead — load the react-compiler-carveout skill.',
    test(file, source) {
      if (!hasExt(file, ".ts", ".tsx")) {
        return [];
      }
      if (isUnder(file, ...VENDORED_MEMO_DIRS)) {
        return [];
      }
      // The sanctioned opt-out. A file carrying it has been through the carve-out skill already.
      if (/["']use no memo["']/.test(source)) {
        return [];
      }
      return [
        ...source.matchAll(/\b(?:useMemo|useCallback|React\.memo)\s*\(/g),
      ].map((match) => ({ line: lineOf(source, match.index) }));
    },
  },
  {
    id: "ts-ignore",
    message:
      "@ts-ignore keeps silencing an error after the error is gone. Use @ts-expect-error, which fails once the code typechecks, and say why the compiler is wrong.",
    test(file, _source, raw) {
      if (!hasExt(file, ".ts", ".tsx", ".mjs", ".mts")) {
        return [];
      }
      return [...raw.matchAll(/@ts-ignore\b/g)].map((match) => ({
        line: lineOf(raw, match.index),
      }));
    },
  },
  {
    id: "barrel",
    message:
      "Imports are direct through the ~/ alias. A barrel index file that re-exports its neighbours is not used here.",
    test(file, source) {
      if (!/(^|\/)index\.tsx?$/.test(rel(file))) {
        return [];
      }
      if (!isUnder(file, "features", "components", "lib", "utils", "hooks")) {
        return [];
      }
      if (isUnder(file, "components/ui") || SANCTIONED_BARRELS.has(rel(file))) {
        return [];
      }
      // The name alone is not the offence — an `index.ts` holding real code is a module whose import path happens to end in a directory name. What the rule forbids is the RE-EXPORT, which is what makes a barrel a barrel.
      const reexport =
        /\bexport\s+(?:\*|\{[^}]*\}|type\s+(?:\*|\{[^}]*\}))\s*from\s*["']/;
      if (!reexport.test(source)) {
        return [];
      }
      return [{ line: 1 }];
    },
  },
  {
    id: "ad-hoc-type",
    message:
      "Type comes from the roles in styles/typography.css (`type-display`, `type-h2`, `type-body`, `type-label`, …), never from an arbitrary size, leading, tracking or font: no `text-[14px]`, `leading-[1.2]`, `tracking-[0.1em]` or `font-[…]`. A size the scale lacks is a decision for DESIGN.md Typography, not for one component. The specimen page under app/kit/ is exempt.",
    test(file, source) {
      if (
        !hasExt(file, ".tsx") ||
        !isUnder(file, "app", "components", "features")
      ) {
        return [];
      }
      if (isUnder(file, "app/kit")) {
        return [];
      }
      return [
        ...source.matchAll(
          /(?<![\w-])(?:[a-z0-9-]+:)*(?:text-\[\d|leading-\[|tracking-\[|font-\[)/g
        ),
      ].map((match) => ({ line: lineOf(source, match.index) }));
    },
  },
  {
    id: "package-manager",
    message: `This repo and this machine use bun — "bunx" where another project would reach for ${WRONG_RUNNER}.`,
    test(file, _source, raw) {
      if (!hasExt(file, ".md", ".json", ".sh", ".mjs", ".ts")) {
        return [];
      }
      if (
        isUnder(
          file,
          "node_modules",
          ".scratch",
          "docs/research",
          ".claude/skills"
        )
      ) {
        return [];
      }
      const pattern = new RegExp(
        `(?<![\\w/@.-])(?:${WRONG_INSTALL}|${WRONG_RUNNER})(?:@[\\w.^~-]+)?\\s+[a-z-]`,
        "g"
      );
      // A sentence saying the tool is not used here is the rule, not a breach of it — and a `Bash(…)` deny rule in settings has to name the command it denies.
      //
      // Scoped to the SAME SENTENCE, not to a fixed character window: a 70-character lookback matched any preceding sentence that happened to contain "not" or "registry", so `"This is not related. Now run <the other manager> install foo"` slipped through — measured, three ways. The negation has to govern this clause to count.
      const exempt =
        /\b(?:never|not|no longer|unsupported|instead of|rather than|avoid|forbidden)\b|Bash\(/i;
      return [...raw.matchAll(pattern)]
        .filter((match) => {
          const before = raw.slice(0, match.index);
          const sentence = before.slice(
            Math.max(
              before.lastIndexOf("."),
              before.lastIndexOf("\n"),
              before.lastIndexOf(";")
            ) + 1
          );
          return !exempt.test(sentence);
        })
        .map((match) => ({ line: lineOf(raw, match.index) }));
    },
  },
  {
    id: "root-tmp",
    message:
      "A probe script, a dump, a sample or a .bak goes in .scratch/tmp/ and is deleted once its question is answered. bun lint walks the working tree, so a throwaway at the root fails the repo-wide gate for a reason unrelated to any change in it.",
    test(file) {
      const relative = rel(file);
      if (relative.includes("/")) {
        return [];
      }
      if (/^\.?tmp|\.bak$|^scratch/.test(relative)) {
        return [{ line: 1 }];
      }
      return [];
    },
  },
  {
    id: "file-line",
    message:
      "Cite a symbol, never a file name and a line number. The number drifts silently when anything above it moves, then sends the reader to the wrong code with full confidence. A line number in a review finding about a diff is fine; this governs durable prose.",
    test(file, _source, raw) {
      if (!hasExt(file, ".md")) {
        return [];
      }
      // `docs/research/**` is captured evidence that must stay byte-identical (the linter config excludes it the same way), `.claude/skills/**` is vendored, and a plan is read once and discarded.
      if (
        isUnder(
          file,
          "node_modules",
          ".scratch",
          "docs/plans",
          "docs/research",
          ".claude/skills"
        )
      ) {
        return [];
      }
      // The path may carry slashes (`lib/auth/index.ts:42`), so only a preceding word character disqualifies a match. A trailing `:` followed by a digit is the whole tell.
      //
      // A URL is excluded — `http://a.com/x.ts:80` is a port or a fragment, not a citation into this repo, and it does not drift when code moves.
      return [
        ...raw.matchAll(/(?<!\w)[\w./-]+\.(?:ts|tsx|mjs|mts|sh|json|md):\d+/g),
      ]
        .filter((match) => {
          // The match itself starts at `//a.com/…` in a URL, so what precedes it is the bare scheme `http:` — testing for `https?://` would never fire.
          const before = raw.slice(Math.max(0, match.index - 80), match.index);
          return !/\b(?:https?|ftp):\S*$/.test(before);
        })
        .map((match) => ({ line: lineOf(raw, match.index) }));
    },
  },
  {
    id: "no-browser-tests",
    message:
      "This repo commits no browser or DOM-render tests: no *.test.tsx or *.spec.* file, no `@vitest-environment jsdom` pragma, no @playwright/test, @testing-library/*, @vitest/browser or @vitejs/plugin-react, and no jsdom/happy-dom Vitest environment. Verify UI in the running app with playwright-cli and measure it — that check ends with the session. A bare jsdom dependency used as a library (server-side HTML sanitising) is allowed.",
    test(file, source, raw) {
      const relative = rel(file);
      if (/\.(?:test\.tsx|spec\.[cm]?[jt]sx?)$/.test(relative)) {
        return [{ line: 1 }];
      }
      // A per-file environment lives in a docblock, which `source` has already lost — so `raw`. With a bare `jsdom` dependency allowed, this pragma is the one way left to turn a `.test.ts` into a DOM test.
      if (/\.test\.[cm]?[jt]s$/.test(relative)) {
        return [
          ...raw.matchAll(/@vitest-environment\s+(?:jsdom|happy-dom)\b/g),
        ].map((match) => ({ line: lineOf(raw, match.index) }));
      }
      if (relative === "package.json") {
        return [
          ...raw.matchAll(
            /"(?:@playwright\/test|@testing-library\/[\w-]+|@vitest\/browser[\w-]*|@vitejs\/plugin-react)"\s*:/g
          ),
        ].map((match) => ({ line: lineOf(raw, match.index) }));
      }
      // `source`, not `raw`: the config's own comment names jsdom to say it is not used. Both spellings count — the `environment:` key and the shared `const environment = …` this repo's config actually uses.
      if (/^vitest(?:\.[\w-]+)?\.config\.ts$/.test(relative)) {
        return [
          ...source.matchAll(
            /\benvironment\s*[:=]\s*["'](?:jsdom|happy-dom)["']/g
          ),
        ].map((match) => ({ line: lineOf(source, match.index) }));
      }
      return [];
    },
  },
];

export function checkOne(file: string, raw: string): Finding[] {
  // This file names every banned token in order to catch it; so does its test. Exempting them here rather than per rule keeps each rule's own scope honest.
  if (/^scripts\/check\/code-rules\.(ts|test\.ts)$/.test(rel(file))) {
    return [];
  }

  // Comment syntax is a JS/TS notion, and every rule that reads `source` is scoped to those files — stripping anything else is wasted work, and a character-by-character rebuild of a large non-code file can run CI's heap out of memory.
  const source = /\.[cm]?[jt]sx?$/.test(file) ? stripComments(raw) : raw;
  const findings: Finding[] = [];
  for (const rule of RULES) {
    for (const hit of rule.test(file, source, raw)) {
      findings.push({
        file,
        line: hit.line,
        id: rule.id,
        message: rule.message,
      });
    }
  }
  return findings;
}

export const RULE_IDS = RULES.map((rule) => rule.id);

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
  return out
    .split("\0")
    .filter((relative) => relative !== "")
    .map((relative) => path.join(REPO_ROOT, relative));
}

function main(): void {
  const argv = process.argv.slice(2);
  let findings: Finding[] = [];

  if (argv.includes("--stdin")) {
    const pathIndex = argv.indexOf("--path");
    const pathArg = pathIndex === -1 ? undefined : argv[pathIndex + 1];
    if (pathArg === undefined || pathArg === "") {
      console.error("code-rules: --stdin requires --path <file>");
      process.exit(2);
    }
    const target = path.resolve(REPO_ROOT, pathArg);
    findings = checkOne(target, fs.readFileSync(0, "utf8"));
  } else {
    const explicit = argv.filter((arg) => !arg.startsWith("--"));
    const files = (
      explicit.length > 0
        ? explicit.map((arg) => path.resolve(REPO_ROOT, arg))
        : trackedFiles()
    ).filter((file) => fs.existsSync(file) && fs.statSync(file).isFile());

    for (const file of files) {
      const { data: raw } = tryCatchSync(() => fs.readFileSync(file, "utf8"));
      if (raw === null) {
        continue;
      }
      findings.push(...checkOne(file, raw));
    }
  }

  if (findings.length === 0) {
    if (!argv.includes("--stdin")) {
      console.log("code rules OK");
    }
    process.exit(0);
  }

  for (const finding of findings) {
    console.error(`${rel(finding.file)}:${finding.line}  ${finding.id}`);
    console.error(`  ${finding.message}\n`);
  }
  process.exit(1);
}

// Importable by the test suite; only the CLI entry point exits the process.
if (
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === import.meta.filename
) {
  main();
}
