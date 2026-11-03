import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { coreStack, otherGroups } from "~/features/stack/stack-groups";

void describe("/stack groups", () => {
  // A group of one or two technologies reads as a stray heading; such a group folds into a neighbour in content/technologies.json.
  void it("lists at least three technologies in every group", () => {
    const thin = otherGroups
      .filter((g) => g.items.length < 3)
      .map((g) => `${g.name} (${g.items.length})`);
    assert.deepEqual(thin, []);
  });

  // The Core stack block repeats its technologies; each also sits in its usual group.
  void it("puts every core technology in an ordinary group too", () => {
    const listed = new Set(
      otherGroups.flatMap((g) => g.items.map((i) => i.id))
    );
    const missing = (coreStack?.items ?? [])
      .map((i) => i.id)
      .filter((id) => !listed.has(id));
    assert.ok((coreStack?.items.length ?? 0) > 0);
    assert.ok(otherGroups.every((g) => g.name !== coreStack?.name));
    assert.deepEqual(missing, []);
  });
});
