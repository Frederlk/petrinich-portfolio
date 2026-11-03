/**
 * Checks on what `sync-github.ts` would publish, rendered from the real content.
 *
 * The README lives on GitHub, away from every gate of this repo: a relative link there points into the `Frederlk/Frederlk` repository and 404s, and a `{token}` left unfilled is printed as-is on the profile.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { accountFields, renderReadme } from "./sync-github.ts";

const readme = renderReadme();

void describe("renderReadme", () => {
  void it("leaves no {placeholder} unfilled", () => {
    assert.doesNotMatch(readme, /\{[a-zA-Z.-]+\}/);
  });

  void it("links only to absolute http(s) or mailto addresses", () => {
    const targets = [...readme.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
    assert.ok(targets.length > 5);
    for (const target of targets) {
      assert.match(target ?? "", /^(https:\/\/|mailto:)/);
    }
  });

  void it("has a non-empty list under every section", () => {
    const sections = readme.split(/^## /m).slice(1);
    assert.deepEqual(
      sections.map((s) => s.split("\n")[0]),
      ["Core stack", "Experience", "Selected work", "Open source", "Contact"]
    );
    for (const section of sections) {
      const body = section.split("\n").slice(1).join("\n").trim();
      assert.ok(body.length > 0, `empty section: ${section.split("\n")[0]}`);
    }
  });
});

void describe("accountFields", () => {
  void it("fits GitHub's 160-character bio and names a current company", () => {
    assert.ok(accountFields.bio.length <= 160);
    assert.notEqual(accountFields.company, "");
    assert.match(accountFields.blog, /^https:\/\//);
  });
});
