/**
 * Case pairs for `mergePatch` in `merge-patch.ts`.
 *
 * The pass half matters most: a merge that drops a key the patch never mentioned would erase a record silently, with every gate green.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mergePatch } from "./merge-patch.ts";

void describe("mergePatch", () => {
  void it("keeps every record key the patch does not name", () => {
    const merged = mergePatch(
      { id: "a", links: ["x"], stack: ["react"], summary: "old" },
      { summary: "new" }
    );
    assert.deepEqual(merged, {
      id: "a",
      links: ["x"],
      stack: ["react"],
      summary: "new",
    });
  });

  void it("never copies notes into the record", () => {
    const merged = mergePatch(
      { id: "a", stack: [] },
      { notes: ["for the reviewer"] }
    );
    assert.equal("notes" in merged, false);
  });

  void it("adds and removes stack ids without touching the others", () => {
    const merged = mergePatch(
      { id: "a", stack: ["react", "bootstrap"] },
      { stackAdd: ["zod"], stackRemove: ["bootstrap"] }
    );
    assert.deepEqual(merged.stack, ["react", "zod"]);
  });

  void it("lets a full stack in the patch replace the old list", () => {
    const merged = mergePatch(
      { id: "a", stack: ["react"] },
      { stack: ["vue"] }
    );
    assert.deepEqual(merged.stack, ["vue"]);
  });
});
