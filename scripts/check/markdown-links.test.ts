/**
 * Case pairs for the one-`# `-per-document rule in `markdown-links.ts`.
 *
 * The pass half is the load-bearing one, for the reason `code-rules.test.ts` argues: a guard proved only to fire says nothing about what else it fires on. Each pass case here is a legitimate shape that a careless tightening of the regex would turn into a false positive — a `#` inside a fence, a `#` that is a hashtag rather than a heading, and a file with no heading at all.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { countTopLevelHeadings } from "./markdown-links.ts";

const CASES: { why: string; body: string; expected: number }[] = [
  {
    why: "a follow-up section written at `#` instead of `##`",
    body: "# Task: a thing\n\nbody\n\n# Follow-up: another thing\n",
    expected: 2,
  },
  {
    why: "a blockquoted `# ` is still a heading to the parser, which is how an owner ruling banner became a second document",
    body: "# Playbook\n\n> # THE AUTHORITY\n>\n> body\n",
    expected: 1,
  },
  {
    why: "a shell comment inside a fence is not a heading; counting it would fail every file carrying a code sample",
    body: "# One\n\n```sh\n# install\npnpm i\n```\n",
    expected: 1,
  },
  {
    why: "`##` and deeper are sections, never documents",
    body: "# One\n\n## Two\n\n### Three\n",
    expected: 1,
  },
  {
    why: "a headingless file is legitimate and must not fail",
    body: "just prose, no heading\n",
    expected: 0,
  },
  {
    why: "`#` without the space is a hashtag or an anchor, not a heading",
    body: "# One\n\nsee #123 and #tag\n",
    expected: 1,
  },
];

void describe("countTopLevelHeadings", () => {
  for (const { why, body, expected } of CASES) {
    void it(`counts ${expected} — ${why}`, () => {
      assert.equal(countTopLevelHeadings(body), expected);
    });
  }
});
