/**
 * Case pairs for the article rules in `case-studies.ts`.
 *
 * The pass half is the load-bearing one: a guard proved only to fire says nothing about what else it fires on. Each pass case is a legitimate shape a careless tightening would turn into a false positive — a hyphenated word, a bold phrase inside a sentence, a list that starts a line with a dash.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkArticle, featureLines, MAX_WORDS } from "./case-studies.ts";

const FAIL: { why: string; id: string; body: string; expected: RegExp }[] = [
  {
    why: "an article over the word limit",
    id: "any",
    body: "word ".repeat(MAX_WORDS + 1),
    expected: /words, limit/,
  },
  {
    why: "a backtick names code in a private repo",
    id: "any",
    body: "It calls `lock()` first.",
    expected: /backtick/,
  },
  {
    why: "an em dash",
    id: "any",
    body: "One thing — another.",
    expected: /em dash/,
  },
  {
    why: "two bullets glued onto one line, as reinv shipped",
    id: "any",
    body: "- First point ends here.- Second point starts here.",
    expected: /glued/,
  },
  {
    why: "a case lead-in with no blank line above it, which Markdown merges into the paragraph before",
    id: "any",
    body: "## Cases\n\n**One.** Text.\n**Two.** Text.",
    expected: /blank line/,
  },
  {
    why: "a platform name in the article that must never name one",
    id: "music-downloader",
    body: "It saves tracks from Spotify.",
    expected: /forbidden word/,
  },
];

const PASS: { why: string; id: string; body: string }[] = [
  {
    why: "a hyphenated word and a bullet that starts the line with a dash",
    id: "any",
    body: "- A well-known case.\n- Another case.",
  },
  {
    why: "bold lead-ins separated by blank lines",
    id: "any",
    body: "## Cases\n\n**One.** Text.\n\n**Two.** Text.",
  },
  {
    why: "the forbidden words apply only to the article they are listed for",
    id: "other-project",
    body: "It reads a Spotify playlist.",
  },
];

void describe("checkArticle", () => {
  for (const c of FAIL) {
    void it(`rejects ${c.why}`, () => {
      const problems = checkArticle(c.id, c.body);
      assert.ok(
        problems.some((p) => c.expected.test(p)),
        `expected ${c.expected}, got ${JSON.stringify(problems)}`
      );
    });
  }
  for (const c of PASS) {
    void it(`accepts ${c.why}`, () => {
      assert.deepEqual(checkArticle(c.id, c.body), []);
    });
  }
});

void describe("featureLines", () => {
  void it("counts plain lines and the items of titled groups together", () => {
    assert.equal(
      featureLines(["a", { items: ["b", "c"], title: "G" }, "d"]),
      4
    );
  });
});
