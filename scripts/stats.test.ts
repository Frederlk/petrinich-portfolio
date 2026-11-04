import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  earlyWork,
  openSource,
  projects,
  siteNumbers,
  technologies,
} from "../lib/content.ts";
import { parseDateRange } from "../lib/dates.ts";
import { deriveStats, fillNumbers, numberTokens } from "../lib/derive-stats.ts";

import type { Project } from "../schemas/projects.ts";

const tech = (projectCount: number) => ({ facts: { projects: projectCount } });
const project = (
  role: Project["role"],
  employer: string | null = null,
  kind: Project["kind"] = "client"
): Pick<Project, "employer" | "kind" | "role"> => ({ employer, kind, role });

const fixture = {
  earlyWork: [{}, {}],
  openSource: [],
  experience: [
    {
      dates: "February 2024 – Present",
      id: "agency",
      team: { hired: 2, led: 5, peak: 3 },
    },
    { dates: "2023", id: "outstaff", team: { led: 2 } },
    { dates: "September 2020 – November 2022", id: "self" },
  ],
  projects: [
    project("lead", "agency"),
    project("estimate-only", "agency"),
    project("sole", "agency", "internal"),
    project("sole"),
  ],
  technologies: [tech(2), tech(0), tech(5)],
};

void describe("deriveStats", () => {
  void it("counts every project, early work included, and the technologies", () => {
    const stats = deriveStats(fixture, "2026-10-26");
    assert.equal(stats.allProjects, "6+");
    assert.equal(stats.technologies, "2+");
  });

  void it("sums the developers led and hired, and takes the largest peak", () => {
    const stats = deriveStats(fixture, "2026-10-26");
    assert.equal(stats.developersLed, 7);
    assert.equal(stats.hired, 2);
    assert.equal(stats.peakTeam, 3);
    assert.deepEqual(stats.ledAt, { agency: 5, outstaff: 2 });
  });

  void it("counts the client projects led or built per job, not estimates or internal tools", () => {
    const stats = deriveStats(fixture, "2026-10-26");
    assert.deepEqual(stats.ledOrBuiltAt, { agency: 1, outstaff: 0, self: 0 });
  });

  void it("counts the estimate-only client projects per job", () => {
    const stats = deriveStats(
      {
        ...fixture,
        projects: [
          ...fixture.projects,
          project("estimate-only", "agency", "internal"),
        ],
      },
      "2026-10-26"
    );
    assert.deepEqual(stats.estimatesAt, { agency: 1, outstaff: 0, self: 0 });
  });

  void it("counts a technology the owner lists even with no project", () => {
    const stats = deriveStats(
      {
        ...fixture,
        technologies: [
          ...fixture.technologies,
          { ...tech(0), listedByOwner: true },
        ],
      },
      "2026-10-26"
    );
    assert.equal(stats.technologies, "3+");
  });

  void it("changes the numbers when the content changes", () => {
    const more = deriveStats(
      {
        ...fixture,
        projects: [...fixture.projects, project("team")],
        technologies: [...fixture.technologies, tech(1)],
      },
      "2026-10-26"
    );
    assert.equal(more.allProjects, "7+");
    assert.equal(more.technologies, "3+");
  });

  void it("names the year of the earliest job", () => {
    assert.equal(deriveStats(fixture, "2026-10-26").since, 2020);
  });

  void it("counts whole years from the earliest job start", () => {
    assert.equal(deriveStats(fixture, "2026-10-26").years, "6+");
    assert.equal(deriveStats(fixture, "2026-08-01").years, "5+");
    const earlier = deriveStats(
      { ...fixture, experience: [{ dates: "2018-2022", id: "school" }] },
      "2026-10-26"
    );
    assert.equal(earlier.years, "8+");
  });
});

void describe("fillNumbers", () => {
  const tokens = numberTokens(deriveStats(fixture, "2026-10-26"));

  void it("fills every token in every string of a nested value", () => {
    assert.deepEqual(
      fillNumbers(
        {
          bullets: ["Led {led.agency} developers, up to {peakTeam} at a time"],
          summary: "{years} years, {developersLed} led, {hired} hired",
          year: 2024,
        },
        tokens
      ),
      {
        bullets: ["Led 5 developers, up to 3 at a time"],
        summary: "6+ years, 7 led, 2 hired",
        year: 2024,
      }
    );
  });

  void it("throws on an unknown token, so a typo fails the build", () => {
    assert.throws(
      () => fillNumbers(["Led {led.nowhere} developers"], tokens),
      /unknown number token \{led\.nowhere\}/
    );
  });

  void it("throws on an inherited name such as {toString}", () => {
    assert.throws(
      () => fillNumbers("{toString}", tokens),
      /unknown number token \{toString\}/
    );
  });
});

void describe("parseDateRange", () => {
  void it("reads a season with no month as its first month", () => {
    assert.equal(
      parseDateRange("Autumn 2022 – December 2023").start.iso,
      "2022-09"
    );
    assert.equal(
      parseDateRange("February 2024 – Present").start.iso,
      "2024-02"
    );
  });
});

void describe("content prose", () => {
  // The figures the site derives; prose that types them drifts from the data, so it uses the {token} instead.
  const DERIVED_FIGURE =
    /\b\d+\+? years\b|\bsince 20\d\d\b|\bled \d+\b|\bup to \d+ at a time\b|\bhired \d+\b|\b\d+ developers\b/i;

  void it("never types a figure the data derives", () => {
    const hits: string[] = [];
    const walk = (value: unknown, file: string) => {
      if (typeof value === "string") {
        if (DERIVED_FIGURE.test(value)) {
          hits.push(`${file}: ${value}`);
        }
      } else if (Array.isArray(value)) {
        for (const item of value) {
          walk(item, file);
        }
      } else if (typeof value === "object" && value !== null) {
        for (const item of Object.values(value)) {
          walk(item, file);
        }
      }
    };
    for (const file of ["content/profile.json", "content/experience.json"]) {
      walk(JSON.parse(readFileSync(file, "utf8")), file);
    }
    assert.deepEqual(hits, []);
  });
});

void describe("siteNumbers", () => {
  void it("are derived from the real content files", () => {
    assert.equal(
      siteNumbers.allProjects,
      `${projects.length + earlyWork.length + openSource.length}+`
    );
    assert.equal(
      siteNumbers.technologies,
      `${
        technologies.filter(
          (t) => t.facts.projects > 0 || t.listedByOwner === true
        ).length
      }+`
    );
  });
});

const SOURCE_DIRS = ["app", "components", "features", "lib"];

function* sourceFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      yield* sourceFiles(path);
    } else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".test.ts")) {
      yield path;
    }
  }
}

void describe("source copy", () => {
  void it("never types a count such as '64+' or 'three developers'", () => {
    const hits: string[] = [];
    for (const dir of SOURCE_DIRS) {
      for (const file of sourceFiles(dir)) {
        const code = readFileSync(file, "utf8")
          .replaceAll(/\/\*[\s\S]*?\*\//g, "")
          .replaceAll(/^\s*\/\/.*$/gm, "");
        if (
          /[\s"'`>(]\d{1,3}\+(?![\w+])|\b(?:three|3) developers\b/i.test(code)
        ) {
          hits.push(file);
        }
      }
    }
    assert.deepEqual(hits, []);
  });
});
