import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  failingFiles,
  isDocsLike,
  outsideCommit,
  skipsTypecheck,
  STAGED_DIFF_ARGS,
} from "./typecheck-staged.ts";

void describe("skipsTypecheck", () => {
  void it("skips a non-empty list of documentation only", () => {
    assert.equal(skipsTypecheck(["docs/a.md", "x.md"]), true);
  });

  void it("does not skip an empty list or one holding code", () => {
    assert.equal(skipsTypecheck([]), false);
    assert.equal(skipsTypecheck(["docs/a.md", "lib/a.ts"]), false);
  });

  void it("lists deleted files too, so a delete-only commit is typechecked", () => {
    const filter = STAGED_DIFF_ARGS.find((arg) =>
      arg.startsWith("--diff-filter=")
    );
    assert.match(filter ?? "", /D/);
  });
});

void describe("isDocsLike", () => {
  void it("accepts Markdown and non-code files under docs", () => {
    assert.equal(isDocsLike("content/news/a.md"), true);
    assert.equal(isDocsLike(".claude/rules/i18n.md"), true);
    assert.equal(isDocsLike("docs/research/artifacts/page.html"), true);
  });

  void it("rejects code, even under docs", () => {
    assert.equal(isDocsLike("lib/a.ts"), false);
    assert.equal(isDocsLike("docs/example.ts"), false);
    assert.equal(isDocsLike("i18n/messages/en.json"), false);
    assert.equal(isDocsLike(".claude/rules/x.json"), false);
  });
});

void describe("outsideCommit", () => {
  const output = [
    "lib/a.ts(3,5): error TS2322: Type 'x' is not assignable.",
    "lib/a.ts(9,1): error TS2304: Cannot find name 'y'.",
    "features/b/c.tsx(1,1): error TS1005: ';' expected.",
  ].join("\n");

  void it("lists each failing file once", () => {
    assert.deepEqual(failingFiles(output), ["lib/a.ts", "features/b/c.tsx"]);
  });

  void it("keeps only files missing from the commit", () => {
    assert.deepEqual(outsideCommit(output, ["lib/a.ts"]), ["features/b/c.tsx"]);
    assert.deepEqual(
      outsideCommit(output, ["lib/a.ts", "features/b/c.tsx"]),
      []
    );
  });
});
