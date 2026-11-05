import { buildDate } from "~/lib/build-date";
import { deriveStats, fillNumbers, numberTokens } from "~/lib/derive-stats";

import { certificatesSchema } from "~/schemas/certificates";
import { cvSkillsSchema } from "~/schemas/cv-skills";
import { earlyWorkSchema } from "~/schemas/early-work";
import { educationSchema } from "~/schemas/education";
import { experienceSchema } from "~/schemas/experience";
import { openSourceSchema } from "~/schemas/open-source";
import { profileSchema } from "~/schemas/profile";
import { projectsSchema } from "~/schemas/projects";
import type { Project } from "~/schemas/projects";
import { technologiesSchema } from "~/schemas/technologies";

import certificatesJson from "~/content/certificates.json";
import cvSkillsJson from "~/content/cv-skills.json";
import earlyWorkJson from "~/content/early-work.json";
import educationJson from "~/content/education.json";
import experienceJson from "~/content/experience.json";
import openSourceJson from "~/content/open-source.json";
import profileJson from "~/content/profile.json";
import projectsJson from "~/content/projects.json";
import technologiesJson from "~/content/technologies.json";

// Every file is parsed at module load, so a bad edit fails the build instead of shipping. The first parse feeds the counts; the exported content is parsed again after its `{token}` placeholders are filled with them (deriveStats, fillNumbers), so prose never types a number the data can count.
const counted = {
  earlyWork: earlyWorkSchema.parse(earlyWorkJson),
  experience: experienceSchema.parse(experienceJson),
  openSource: openSourceSchema.parse(openSourceJson),
  projects: projectsSchema.parse(projectsJson),
};

// A role that did not build the product; "built" counts the other projects.
const NOT_BUILT = new Set<string>(["estimate-only"]);

// The early work was built alone.
export const EARLY_ROLE = "sole" satisfies Project["role"];

// What counts as use of a technology: the projects, the early work and the open-source contributions, the same rows /work lists, so every count on /stack equals what /work?tech=<id> shows.
const workStacks = [
  ...counted.projects.map((p) => ({
    role: p.role,
    stack: p.stack,
    year: p.year,
  })),
  ...counted.earlyWork.map((w) => ({
    role: EARLY_ROLE,
    stack: w.stack,
    year: w.year,
  })),
  ...counted.openSource.map((o) => ({
    role: "contributor",
    stack: o.stack,
    year: o.year,
  })),
];

export const technologies = technologiesSchema
  .parse(technologiesJson)
  .map((tech) => {
    const used = workStacks.filter((w) => w.stack.includes(tech.id));
    const years = used.flatMap((w) => (w.year === null ? [] : [w.year]));
    return {
      ...tech,
      facts: {
        built: used.filter((w) => !NOT_BUILT.has(w.role)).length,
        firstYear: years.length === 0 ? null : Math.min(...years),
        lastYear: years.length === 0 ? null : Math.max(...years),
        projectIds: counted.projects
          .filter((p) => p.stack.includes(tech.id))
          .map((p) => p.id),
        projects: used.length,
      },
    };
  });

export type Technology = (typeof technologies)[number];

// The numbers on the home, CV and Work pages and in every `{token}` of the content.
export const siteNumbers = deriveStats({ ...counted, technologies }, buildDate);
const tokens = numberTokens(siteNumbers);

export const profile = profileSchema.parse(fillNumbers(profileJson, tokens));
export const experience = experienceSchema.parse(
  fillNumbers(experienceJson, tokens)
);
export const education = educationSchema.parse(
  fillNumbers(educationJson, tokens)
);
export const openSource = openSourceSchema.parse(
  fillNumbers(openSourceJson, tokens)
);
export const projects = projectsSchema.parse(fillNumbers(projectsJson, tokens));
export const earlyWork = earlyWorkSchema.parse(
  fillNumbers(earlyWorkJson, tokens)
);

// A project's employer must name a job, or the per-job counts would silently miss it.
const jobIds = new Set(experience.map((job) => job.id));
for (const p of projects) {
  if (p.employer !== null && !jobIds.has(p.employer)) {
    throw new Error(
      `projects.json "${p.id}": unknown employer ${p.employer}, expected an experience.json id`
    );
  }
}

// Course certificates reach only LinkedIn and the files written for machines (llms.txt, JSON-LD, resume.json), never a page or the CV PDF (owner, 2026-11-05).
export const certificates =
  certificatesSchema.parse(certificatesJson).certificates;

const cvSkills = cvSkillsSchema.parse(cvSkillsJson).groups;

export const techById = new Map(technologies.map((t) => [t.id, t]));
export const projectById = new Map(projects.map((p) => [p.id, p]));

// A stack entry that names no technology would render as a dead filter, so it fails the build like a schema error.
function assertKnownTechnologies(owner: string, ids: readonly string[]) {
  const unknown = ids.filter((id) => !techById.has(id));
  if (unknown.length > 0) {
    throw new Error(`${owner}: unknown technology id ${unknown.join(", ")}`);
  }
}
for (const p of projects) {
  assertKnownTechnologies(`projects.json "${p.id}"`, p.stack);
}
for (const w of earlyWork) {
  assertKnownTechnologies(`early-work.json "${w.id}"`, w.stack);
}
for (const o of openSource) {
  assertKnownTechnologies(`open-source.json "${o.id}"`, o.stack);
}
assertKnownTechnologies(
  "cv-skills.json",
  cvSkills.flatMap((g) => g.items)
);

// The technologies of the "Core stack" group, in file order: what the person data names as the main stack.
export const coreStackNames = technologies
  .filter((t) => t.group === "Core stack" && t.facts.projects > 0)
  .map((t) => t.name);

export const featuredProjects = projects.filter((p) => p.featured);

// The /cv skills list: the groups of cv-skills.json with their technology ids resolved to names (every id is checked above).
export const cvSkillGroups = cvSkills.map((g) => ({
  items: g.items.flatMap((id) => techById.get(id)?.name ?? []),
  name: g.name,
}));
