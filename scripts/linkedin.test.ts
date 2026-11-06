/**
 * Checks on the fields `linkedin.ts` copies into LinkedIn, rendered from the real content.
 *
 * LinkedIn truncates silently at its limits and prints `**` literally, and the "only what changed" run is the whole point of the wizard: if the hash comparison broke, every run would either repeat every field or skip a real change.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  certificates,
  experience,
  linkedinSkills,
  profile,
  projects,
} from "../lib/content.ts";
import { projectSchema } from "../schemas/projects.ts";
import {
  changedFields,
  hashOf,
  linkedinFields,
  plain,
  skillLinks,
  topProjects,
} from "./linkedin.ts";

const fields = linkedinFields();

void describe("linkedinFields", () => {
  void it("offers one project field per built project with an article, and none for estimate-only work", () => {
    const keys = fields
      .filter((f) => f.key.startsWith("project."))
      .map((f) => f.key)
      .toSorted();
    const expected = projects
      .filter((p) => p.caseStudy !== null && p.role !== "estimate-only")
      .map((p) => `project.${p.id}`)
      .toSorted();
    assert.ok(expected.length > 0);
    assert.deepEqual(keys, expected);
    const estimateOnly = projects.filter((p) => p.role === "estimate-only");
    assert.ok(estimateOnly.length > 0);
    for (const p of estimateOnly) {
      assert.ok(!keys.includes(`project.${p.id}`), p.id);
    }
  });

  void it("ends About with the profile's mailto address, never the agency mailbox", () => {
    const mail = profile.contacts.find((c) => c.url.startsWith("mailto:"));
    assert.ok(mail !== undefined);
    const about = fields.find((f) => f.key === "about");
    assert.ok(about !== undefined);
    assert.ok(
      about.text.trimEnd().endsWith(`${mail.url.slice("mailto:".length)}.`)
    );
    assert.doesNotMatch(about.text, /ux-mind\.pro/);
  });

  void it("shows every LinkedIn skill on at least one project or job", () => {
    const links = skillLinks();
    assert.equal(links.length, linkedinSkills.length);
    const bare = links
      .filter((s) => s.projects.length + s.jobs.length === 0)
      .map((s) => s.name);
    assert.deepEqual(bare, []);
  });

  void it("lists at most 3 key projects per job, all its own", () => {
    for (const job of experience) {
      const top = topProjects(job.id);
      assert.ok(top.length <= 3, job.id);
      for (const p of top) {
        assert.equal(p.employer, job.id, p.id);
      }
      const field = fields.find((f) => f.key === `experience.${job.id}`);
      assert.ok(field !== undefined);
      if (top.length > 0) {
        assert.ok(
          field.text.endsWith(
            `Key projects: ${top.map((p) => p.name).join(", ")}`
          ),
          job.id
        );
      }
    }
    assert.ok(experience.some((job) => topProjects(job.id).length === 3));
  });

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

void describe("projectSchema dates", () => {
  const [base] = projects;
  assert.ok(base !== undefined);
  const dated = (started?: string, ended?: string) =>
    projectSchema.safeParse({ ...base, ended, started, year: 2026 }).success;

  void it("takes a start month in the project's year and an end month not before it", () => {
    assert.ok(dated("2026-04", "2026-10"));
    assert.ok(dated("2026-04"));
    assert.ok(dated());
  });

  void it("rejects a start outside the year, an end before the start and an end without a start", () => {
    assert.ok(!dated("2025-12", "2026-02"));
    assert.ok(!dated("2026-10", "2026-04"));
    assert.ok(!dated(undefined, "2026-10"));
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
