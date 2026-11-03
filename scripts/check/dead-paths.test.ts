/**
 * The local-versus-CI split in `dead-paths.ts`: a citation into a gitignored path must be skipped in every checkout, while one into a tracked path that does not exist must still be reported. Both targets are missing here, so only the ignore check tells them apart.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isDeadCitation } from "./dead-paths.ts";

void describe("isDeadCitation", () => {
  void it("skips a missing path under a gitignored directory", () => {
    assert.equal(
      isDeadCitation(".scratch/dead-paths-test/missing.ts", "docs/a.md"),
      false
    );
  });

  void it("reports a missing path in a tracked directory", () => {
    assert.equal(
      isDeadCitation("scripts/check/dead-paths-test-missing.ts", "docs/a.md"),
      true
    );
  });
});
