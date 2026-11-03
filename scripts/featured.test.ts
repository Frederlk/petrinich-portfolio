import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { orderFeatured } from "../lib/featured.ts";

const p = (id: string, year: number | null, domain: string[] = []) => ({
  domain,
  id,
  year,
});

void describe("orderFeatured", () => {
  void it("puts AI work first, then the rest by year descending", () => {
    const out = orderFeatured([
      p("old-web", 2024),
      p("new-web", 2026),
      p("old-ai", 2025, ["ai", "saas"]),
      p("new-ai", 2026, ["ai"]),
    ]);
    assert.deepEqual(
      out.map((x) => x.id),
      ["new-ai", "old-ai", "new-web", "old-web"]
    );
  });

  void it("keeps file order on equal years and sends a missing year last", () => {
    const out = orderFeatured([p("none", null), p("a", 2025), p("b", 2025)]);
    assert.deepEqual(
      out.map((x) => x.id),
      ["a", "b", "none"]
    );
  });

  void it("does not mutate its input", () => {
    const input = [p("a", 2024), p("b", 2026, ["ai"])];
    orderFeatured(input);
    assert.deepEqual(
      input.map((x) => x.id),
      ["a", "b"]
    );
  });
});
