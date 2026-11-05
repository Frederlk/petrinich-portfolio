/**
 * Checks on the fields `linkedin.ts` copies into LinkedIn, rendered from the real content.
 *
 * LinkedIn truncates silently at its limits and prints `**` literally, and the "only what changed" run is the whole point of the wizard: if the hash comparison broke, every run would either repeat every field or skip a real change.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { certificates } from "../lib/content.ts";
import { changedFields, hashOf, linkedinFields, plain } from "./linkedin.ts";

const fields = linkedinFields();

void describe("linkedinFields", () => {
  void it("stays within every LinkedIn limit", () => {
    for (const f of fields) {
      if (f.limit !== undefined) {
        assert.ok(
          f.text.length <= f.limit,
          `${f.key}: ${f.text.length} > ${f.limit}`
        );
      }
    }
  });

  void it("carries no Markdown emphasis, no {placeholder} and no empty text", () => {
    for (const f of fields) {
      assert.ok(f.text.trim().length > 0, `${f.key} is empty`);
      assert.doesNotMatch(f.text, /\*\*|`/, f.key);
      assert.doesNotMatch(f.text, /\{[a-zA-Z.-]+\}/, f.key);
    }
  });

  void it("gives every field a unique key and a LinkedIn or site URL", () => {
    assert.equal(new Set(fields.map((f) => f.key)).size, fields.length);
    for (const f of fields) {
      assert.match(f.url, /^https:\/\/www\.linkedin\.com\/in\//);
    }
  });

  void it("offers each certificate once, with its credential URL and issue month", () => {
    assert.ok(certificates.length > 0);
    assert.equal(
      fields.filter((f) => f.key.startsWith("certificate.")).length,
      certificates.length
    );
    for (const c of certificates) {
      const field = fields.find(
        (f) => f.key === `certificate.${c.credentialId}`
      );
      assert.ok(field !== undefined, c.credentialId);
      assert.ok(field.how.includes(c.url), c.credentialId);
      assert.match(
        field.how,
        /Issue date [A-Z][a-z]{2} \d{4}\./,
        c.credentialId
      );
    }
  });
});

void describe("plain", () => {
  void it("drops the bold and inline-code markers and keeps the words", () => {
    assert.equal(
      plain("with **6+ years** of **work**"),
      "with 6+ years of work"
    );
    assert.equal(
      plain("wrote `ux-mind-helpers` and `.env` sync"),
      "wrote ux-mind-helpers and .env sync"
    );
  });
});

void describe("changedFields", () => {
  void it("returns only fields whose text differs from the stored hash", () => {
    const state = Object.fromEntries(
      fields.map((f) => [f.key, hashOf(f.text)])
    );
    assert.deepEqual(changedFields(fields, state), []);

    const [first] = fields;
    assert.ok(first !== undefined);
    const edited = fields.map((f) =>
      f === first ? { ...f, text: `${f.text} edited` } : f
    );
    assert.deepEqual(
      changedFields(edited, state).map((f) => f.key),
      [first.key]
    );
    assert.equal(changedFields(fields, {}).length, fields.length);
  });
});
