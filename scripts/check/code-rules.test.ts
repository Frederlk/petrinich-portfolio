/**
 * Every rule in `code-rules.ts` gets a pair: a snippet that must be caught, and a snippet that must pass.
 *
 * The pass half is the load-bearing one. A guard that only proves it fires says nothing about how much it fires on — so each pass case is the specific legitimate shape that would otherwise be a false positive, named at the point where a future edit to a regex would break it.
 *
 * This is the mutation proof made permanent (`.claude/rules/tests.md`): a regex that stops catching turns a case red here instead of going quietly unenforced.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  checkOne,
  commonGitDir,
  RULE_IDS,
  repoRelative,
} from "./code-rules.ts";

// Assembled so this file does not trip the rule it tests.
const WRONG = ["n", "pm"].join("");
const RUNNER = ["n", "px"].join("");

const ids = (file: string, source: string) =>
  checkOne(file, source).map((finding) => finding.id);

/** Each entry: rule id, a file path and source that must be caught, and one that must pass. */
const CASES: {
  id: string;
  caught: [file: string, source: string];
  passes: [file: string, source: string];
  why: string;
}[] = [
  {
    id: "asChild",
    why: "`render` is the Base UI equivalent and must not trip the same check",
    caught: [
      "components/thing.tsx",
      '<Button asChild><a href="/x">go</a></Button>',
    ],
    passes: [
      "components/thing.tsx",
      '<Button render={<a href="/x" />}>go</Button>',
    ],
  },
  {
    id: "forwardRef",
    why: "a ref taken as an ordinary prop is the React 19 shape",
    caught: [
      "components/thing.tsx",
      "const Thing = forwardRef((props, ref) => null);",
    ],
    passes: ["components/thing.tsx", "const Thing = ({ ref }: Props) => null;"],
  },
  {
    id: "memo",
    why: 'the "use no memo" directive is the sanctioned carve-out',
    caught: ["components/list.tsx", "const rows = useMemo(() => [], []);"],
    passes: [
      "components/list.tsx",
      '"use no memo";\nconst rows = useMemo(() => [], []);',
    ],
  },
  {
    id: "ad-hoc-type",
    why: "a colour in brackets is not typography, and the kit page is where arbitrary sizes may live",
    caught: [
      "components/thing.tsx",
      'const x = <p className="text-[14px] lg:text-[9.5rem]">a</p>;',
    ],
    passes: [
      "components/thing.tsx",
      'const x = <p className="type-body text-[#fff] max-w-[65ch]">a</p>;',
    ],
  },
  {
    id: "outline-none-focus",
    why: "`outline-none` alone on an element that draws no custom ring, and a variant-scoped `focus:outline-none`, are not the pair",
    caught: [
      "components/thing.tsx",
      'const x = <button className={cn("flex outline-none", "focus-visible:outline-2 focus-visible:outline-ring")} />;',
    ],
    passes: [
      "components/thing.tsx",
      'const x = <><input className="outline-none" /><button className="focus-visible:outline-2 focus-visible:outline-ring" /><a className="focus:outline-none" /></>;',
    ],
  },
  {
    id: "ts-ignore",
    why: "`@ts-expect-error` is the sanctioned form and fails once the error is gone",
    caught: ["lib/thing.ts", "// @ts-ignore\nconst x = wrong();"],
    passes: [
      "lib/thing.ts",
      "// @ts-expect-error probing the overload\nconst x = wrong();",
    ],
  },
  {
    id: "barrel",
    why: "the vendored `components/ui` tree keeps its compound-component barrels",
    caught: ["lib/thing/index.ts", 'export { x } from "./x";'],
    passes: ["components/ui/index.ts", 'export { x } from "./x";'],
  },
  {
    id: "package-manager",
    why: "a sentence explaining that the tool is not used here is the rule, not a breach",
    caught: ["docs/thing.md", "Run npm install to set up."],
    passes: ["docs/thing.md", "Never npm install here; use pnpm."],
  },
  {
    id: "root-tmp",
    why: "the sanctioned home for a throwaway is inside `.scratch/tmp/`",
    caught: ["tmp-probe.mjs", "console.log(1);"],
    passes: [".scratch/tmp/probe.mjs", "console.log(1);"],
  },
  {
    id: "file-line",
    why: "naming the symbol is the fix the rule asks for",
    caught: [
      "docs/thing.md",
      "See `lib/thing/index.ts:42` for the setup order.",
    ],
    passes: ["docs/thing.md", "See the `setup()` call for the setup order."],
  },
  {
    id: "no-browser-tests",
    why: "jsdom as a library — e.g. server-side HTML sanitising — is not a test environment",
    caught: ["components/button.test.tsx", "it('renders', () => {});"],
    passes: ["package.json", '{ "dependencies": { "jsdom": "^27.0.0" } }'],
  },
  {
    id: "test-writes-repo",
    why: "a scratch directory under the OS temp dir is where a test writes",
    caught: [
      "scripts/thing.test.ts",
      'const dir = path.join(REPO_ROOT, ".claude");\nconst sub = path.join(dir, "x");\nfs.mkdirSync(sub, { recursive: true });',
    ],
    passes: [
      "scripts/thing.test.ts",
      'const REPO_ROOT = "/r";\nconst dir = fs.mkdtempSync(path.join(os.tmpdir(), "x-"));\nfs.writeFileSync(path.join(dir, "a"), REPO_ROOT);\nfs.rmSync(dir, { recursive: true });',
    ],
  },
  {
    id: "workflow-checkout-permissions",
    why: "an empty top level with `contents: read` granted in the job is the least-privilege shape",
    caught: [
      ".github/workflows/x.yml",
      "permissions: {}\njobs:\n  a:\n    steps:\n      - uses: actions/checkout@abc # v7\n",
    ],
    passes: [
      ".github/workflows/x.yml",
      "permissions: {}\njobs:\n  a:\n    permissions:\n      contents: read\n    steps:\n      - uses: actions/checkout@abc # v7\n",
    ],
  },
  {
    id: "commit-count",
    why: "the word commit without a count in front of it is ordinary prose",
    caught: [
      "content/experience.json",
      '"Built the site with structured data for SEO (62 commits)."',
    ],
    passes: [
      "content/case-studies/x.mdx",
      "A migration drift gate runs on every commit.",
    ],
  },
];

void describe("code-rules", () => {
  void it("covers every rule the checker defines", () => {
    // A rule added without a case here would ship unproven; this is the only assertion that notices.
    const byName = (a: string, b: string) => a.localeCompare(b);
    assert.deepEqual(
      CASES.map((testCase) => testCase.id).toSorted(byName),
      RULE_IDS.toSorted(byName)
    );
  });

  for (const testCase of CASES) {
    void describe(testCase.id, () => {
      void it("catches the violation", () => {
        assert.ok(ids(...testCase.caught).includes(testCase.id));
      });

      void it(`passes the legitimate shape — ${testCase.why}`, () => {
        assert.ok(!ids(...testCase.passes).includes(testCase.id));
      });
    });
  }

  // Every case below is a false negative or false positive an adversarial review found in the first draft. Each was reproduced before it was fixed.
  for (const [file, source, rule, shouldCatch] of [
    [
      "docs/a.md",
      `This is not related. Now run ${WRONG} install foo`,
      "package-manager",
      true,
    ],
    [
      "docs/b.md",
      `The registry is slow, so ${RUNNER} tsx x.ts`,
      "package-manager",
      true,
    ],
    ["docs/c.md", `${WRONG}@10 install foo`, "package-manager", true],
    ["docs/d.md", `Never run ${WRONG} install here.`, "package-manager", false],
    ["docs/e.md", "See http://a.com/x.ts:80 for details", "file-line", false],
    ["features/x/index.ts", "export const a = 1;", "barrel", false],
    [
      "scripts/a.test.ts",
      'const dir = path.join(REPO_ROOT, "a");\nit("x", () => { const dir = fs.mkdtempSync(path.join(os.tmpdir(), "x-")); fs.rmSync(dir); });',
      "test-writes-repo",
      false,
    ],
    [
      "scripts/b.test.ts",
      'const dir = path.join(REPO_ROOT, "a");\nconst t = os.tmpdir();\nfs.writeFileSync(path.join(t, "dir"), "x");',
      "test-writes-repo",
      false,
    ],
    [
      "scripts/c.test.ts",
      'fs.cpSync(path.join(a, "x)"), path.join(REPO_ROOT, "y"));',
      "test-writes-repo",
      true,
    ],
    [
      "scripts/d.test.ts",
      'fs.mkdirSync(path.join(process.cwd(), ".claude"));',
      "test-writes-repo",
      true,
    ],
    [
      ".github/workflows/two.yml",
      "permissions: {}\njobs:\n  a:\n    permissions:\n      contents: read\n    steps:\n      - uses: actions/checkout@abc\n  b:\n    steps:\n      - uses: actions/checkout@abc\n",
      "workflow-checkout-permissions",
      true,
    ],
    [
      ".github/workflows/commented.yml",
      "permissions: {}\njobs:\n  a:\n    steps:\n      # - uses: actions/checkout@abc\n      - run: echo hi\n",
      "workflow-checkout-permissions",
      false,
    ],
  ] as const) {
    void it(`${file}: ${rule} ${shouldCatch ? "caught" : "passes"}`, () => {
      assert.equal(ids(file, source).includes(rule), shouldCatch);
    });
  }

  void it("reports the line the violation is on", () => {
    const findings = checkOne(
      "components/thing.tsx",
      "const a = 1;\nconst b = 2;\n<Button asChild />"
    );
    assert.equal(findings[0]?.id, "asChild");
    assert.equal(findings[0]?.line, 3);
  });

  void it("does not fire on a banned token quoted inside a comment", () => {
    // Comments strip before matching, which is what lets a rules doc or a docblock name the thing it forbids.
    assert.ok(
      !ids(
        "components/thing.tsx",
        "// never write asChild here\nconst a = 1;"
      ).includes("asChild")
    );
  });
});

/**
 * Which checkout a path is scoped against. Every lookup here runs in one process, so the per-directory cache is exercised the way a full `check:rules` run exercises it: a lookup under a nested worktree follows one under the main tree, and one under the main tree follows it.
 */
void describe("repoRelative", () => {
  const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
  // Asked of git rather than assumed: from a linked worktree `REPO_ROOT/.git` is a file, and the shared directory is elsewhere.
  const COMMON_GIT_DIR = path.resolve(
    REPO_ROOT,
    execFileSync("git", ["rev-parse", "--git-common-dir"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    }).trim()
  );
  const inside = (root: string, relative: string) =>
    path.join(root, relative).replaceAll("\\", "/");

  void it("scopes a nested linked worktree against its own root, the main tree against the repository", () => {
    const claudeDir = path.join(REPO_ROOT, ".claude");
    const worktrees = path.join(claudeDir, "worktrees");
    // `.claude/` is gitignored, so a clean clone (CI) has none; one left behind here changes what the checks see, as it once failed `dead-paths.ts` in CI only.
    const createdClaudeDir = !fs.existsSync(claudeDir);
    const createdWorktrees = !fs.existsSync(worktrees);
    fs.mkdirSync(worktrees, { recursive: true });
    const worktree = fs.mkdtempSync(
      path.join(REPO_ROOT, ".claude", "worktrees", "code-rules-")
    );
    fs.writeFileSync(
      path.join(worktree, ".git"),
      `gitdir: ${path.join(COMMON_GIT_DIR, "worktrees", path.basename(worktree))}\n`
    );
    try {
      assert.deepEqual(
        [
          repoRelative(inside(REPO_ROOT, "components/ui/button.tsx")),
          repoRelative(inside(worktree, "components/ui/button.tsx")),
          repoRelative(inside(worktree, "components/ui/deep/new-file.tsx")),
          repoRelative(inside(REPO_ROOT, "components/ui/input.tsx")),
        ],
        [
          "components/ui/button.tsx",
          "components/ui/button.tsx",
          "components/ui/deep/new-file.tsx",
          "components/ui/input.tsx",
        ]
      );
    } finally {
      fs.rmSync(worktree, { recursive: true, force: true });
      if (createdWorktrees) {
        fs.rmdirSync(worktrees);
      }
      if (createdClaudeDir) {
        fs.rmdirSync(claudeDir);
      }
    }
  });

  // Run from the main tree this is the REPO_ROOT case above; run from a linked worktree, the main tree is a sibling checkout that only the shared git directory identifies.
  void it("scopes the main tree against itself from whichever checkout this runs in", () => {
    assert.equal(
      repoRelative(
        inside(path.dirname(COMMON_GIT_DIR), "components/ui/button.tsx")
      ),
      "components/ui/button.tsx"
    );
  });

  void it("keeps the repository root for another repository and for a path in no checkout", () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "code-rules-"));
    const otherRepo = path.join(outside, "other");
    fs.mkdirSync(path.join(otherRepo, ".git"), { recursive: true });
    try {
      for (const file of [
        inside(otherRepo, "package.json"),
        inside(outside, "loose/package.json"),
      ]) {
        assert.equal(
          repoRelative(file),
          path.relative(REPO_ROOT, file).replaceAll("\\", "/")
        );
      }
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

/** Each case builds its checkout in the temp directory, so the answer does not depend on whether the suite runs from the main tree or a linked worktree. */
void describe("commonGitDir", () => {
  /** Builds a checkout with `build`, which returns the directory it expects, and pairs that with what `commonGitDir` answers. */
  const inTemp = (build: (root: string) => string) => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), "common-git-dir-"));
    try {
      const root = path.join(base, "checkout");
      fs.mkdirSync(root);
      const expected = build(root);
      return { actual: commonGitDir(root), expected };
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  };

  void it("is `.git` itself in a main tree", () => {
    const { actual, expected } = inTemp((root) => {
      fs.mkdirSync(path.join(root, ".git"));
      return path.join(root, ".git");
    });
    assert.equal(actual, expected);
  });

  void it("follows a linked worktree's `commondir` back to the shared directory", () => {
    const { actual, expected } = inTemp((root) => {
      const common = path.join(root, "..", "main", ".git");
      const gitdir = path.join(common, "worktrees", "checkout");
      fs.mkdirSync(gitdir, { recursive: true });
      fs.writeFileSync(path.join(gitdir, "commondir"), "../..\n");
      fs.writeFileSync(path.join(root, ".git"), `gitdir: ${gitdir}\n`);
      return common;
    });
    assert.equal(actual, expected);
  });

  void it("is the gitdir itself when it holds no `commondir`, as a submodule's does", () => {
    const { actual, expected } = inTemp((root) => {
      const gitdir = path.join(root, "..", "modules", "checkout");
      fs.mkdirSync(gitdir, { recursive: true });
      fs.writeFileSync(path.join(root, ".git"), `gitdir: ${gitdir}\n`);
      return gitdir;
    });
    assert.equal(actual, expected);
  });

  void it("resolves a relative `gitdir:` against the `.git` file's directory", () => {
    const { actual, expected } = inTemp((root) => {
      const gitdir = path.join(root, "..", "modules", "checkout");
      fs.mkdirSync(gitdir, { recursive: true });
      fs.writeFileSync(
        path.join(root, ".git"),
        "gitdir: ../modules/checkout\n"
      );
      return gitdir;
    });
    assert.equal(actual, expected);
  });
});
