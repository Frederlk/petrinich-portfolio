import { buildDate } from "~/lib/build-date";
import { email, webContacts } from "~/lib/contact";
import {
  certificates,
  coreStackNames,
  cvSkillGroups,
  earlyWork,
  education,
  experience,
  profile,
  projects,
} from "~/lib/content";
import { parseDateRange } from "~/lib/dates";
import { selectedProjects } from "~/lib/featured";
import { ROLE_LABELS } from "~/lib/labels";
import { publicUrl } from "~/lib/project-url";
import { siteUrl } from "~/lib/site-url";

import type { Project } from "~/schemas/projects";

// Strips the two inline marks the content files use (**bold** and `code`) for places that take plain text.
export const plain = (text: string) =>
  text.replaceAll(/\*\*([^*]+)\*\*/g, "$1").replaceAll(/`([^`]+)`/g, "$1");

// JSON inside a <script> tag must not be able to close it, so every "<" is escaped.
export const serializeJsonLd = (data: unknown) =>
  JSON.stringify(data).replaceAll("<", "\\u003c");

// BCP 47 tags for schema.org `knowsLanguage`; a language missing here falls back to its name.
const LANGUAGE_TAGS: Record<string, string> = { English: "en", Russian: "ru" };

// The core stack first, so a parser that keeps only the first few skills keeps the main ones.
const skillNames = [
  ...new Set([...coreStackNames, ...cvSkillGroups.flatMap((g) => g.items)]),
];
// A job is current when its range has no end or the end reads "Present"; an end that fails to parse as a date is not enough, it would turn a typo into a current job.
const isCurrent = (dates: string) => {
  const { end } = parseDateRange(dates);
  return end === null || end.text.toLowerCase() === "present";
};
const currentJobs = experience.filter((j) => isCurrent(j.dates));

// Each job is an OrganizationRole (the schema.org Role pattern: the inner property repeats the outer one and holds the organisation); current jobs go under `worksFor` (more than one can run in parallel), past ones under `alumniOf`.
const toRole = (
  job: (typeof experience)[number],
  key: "alumniOf" | "worksFor"
) => {
  const range = parseDateRange(job.dates);
  return {
    "@type": "OrganizationRole",
    [key]: {
      "@type": "Organization",
      name: job.company,
      url: job.links[0]?.url,
    },
    endDate: range.end?.iso ?? undefined,
    roleName: job.role,
    startDate: range.start.iso ?? undefined,
  };
};
const pastRoles = experience
  .filter((j) => !currentJobs.includes(j))
  .map((job) => toRole(job, "alumniOf"));

// The Person node every page inlines (never an @id-only reference, which crawlers that skip other pages cannot resolve).
export const person = {
  "@id": `${siteUrl}/#person`,
  "@type": "Person",
  alumniOf: [
    ...education.education.map((e) => ({
      "@type": "CollegeOrUniversity",
      name: e.school,
    })),
    ...pastRoles,
  ],
  description: plain(profile.summary),
  email,
  hasCredential: certificates.map((c) => ({
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "certificate",
    dateCreated: c.issued,
    name: c.name,
    recognizedBy: { "@type": "Organization", name: c.issuer },
    url: c.url,
  })),
  hasOccupation: {
    "@type": "Occupation",
    description: profile.intro,
    name: profile.title,
    skills: skillNames.join(", "),
  },
  image: `${siteUrl}${profile.photo}`,
  jobTitle: profile.title,
  knowsAbout: skillNames,
  knowsLanguage: education.languages.map(
    (l) => LANGUAGE_TAGS[l.name] ?? l.name
  ),
  name: profile.name,
  sameAs: webContacts.map((c) => c.url),
  url: siteUrl,
  worksFor: currentJobs.map((job) => toRole(job, "worksFor")),
};

const ctx = "https://schema.org";

export const profilePageJsonLd = (path: "" | "/cv") => ({
  "@context": ctx,
  "@type": "ProfilePage",
  dateModified: buildDate,
  mainEntity: person,
  name: path === "/cv" ? `${profile.name}: CV` : profile.name,
  url: `${siteUrl}${path}`,
});

const projectJsonLd = (p: Project) => ({
  "@type": "CreativeWork",
  dateCreated: p.year === null ? undefined : String(p.year),
  description: p.summary,
  keywords: p.stack.join(", ") || undefined,
  name: p.name,
  url: publicUrl(p) ?? `${siteUrl}/work/${p.id}`,
});

export const projectPageJsonLd = (p: Project) => ({
  "@context": ctx,
  ...projectJsonLd(p),
  creator: person,
  dateModified: buildDate,
});

// Early work has no page of its own, so it carries its live URL when it has one.
const earlyJsonLd = (w: (typeof earlyWork)[number]) => ({
  "@type": "CreativeWork",
  dateCreated: String(w.year),
  description: w.summary,
  keywords: w.stack.join(", ") || undefined,
  name: w.title,
  url: w.links[0]?.url,
});

// An ItemList of CreativeWork entries for /work, the early work last; the creator Person is inlined once on the list.
export const workJsonLd = () => ({
  "@context": ctx,
  "@type": "ItemList",
  creator: person,
  itemListElement: [
    ...projects.map(projectJsonLd),
    ...earlyWork.map(earlyJsonLd),
  ].map((item, i) => ({
    "@type": "ListItem",
    item,
    position: i + 1,
  })),
  name: `Projects by ${profile.name}`,
  url: `${siteUrl}/work`,
});

export const stackJsonLd = () => ({
  "@context": ctx,
  "@type": "CollectionPage",
  author: person,
  dateModified: buildDate,
  name: `Stack of ${profile.name}`,
  url: `${siteUrl}/stack`,
});

// JSON Resume (https://jsonresume.org/schema), built from the same content files as the pages.
export function jsonResume() {
  return {
    $schema:
      "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      email,
      image: `${siteUrl}${profile.photo}`,
      label: profile.title,
      location: { address: profile.location },
      name: profile.name,
      profiles: webContacts.map((c) => ({ network: c.label, url: c.url })),
      summary: plain(profile.summary),
      url: siteUrl,
    },
    certificates: certificates.map((c) => ({
      date: c.issued,
      issuer: c.issuer,
      name: c.name,
      url: c.url,
    })),
    education: education.education.map((e) => {
      const range = parseDateRange(e.dates);
      const [, studyType, area] = /^(\w+) of (.+)$/.exec(e.degree) ?? [];
      return {
        area: area ?? e.degree,
        endDate: range.end?.iso ?? undefined,
        institution: e.school,
        startDate: range.start.iso ?? undefined,
        studyType: studyType ?? e.degree,
      };
    }),
    interests: [{ name: plain(education.interests) }],
    languages: education.languages.map((l) => ({
      fluency: l.level,
      language: l.name,
    })),
    meta: {
      canonical: `${siteUrl}/resume.json`,
      lastModified: buildDate,
      version: "v1.0.0",
    },
    projects: selectedProjects.map((p) => ({
      description: p.summary,
      highlights: p.roleNote === "" ? undefined : [p.roleNote],
      keywords: p.stack,
      name: p.name,
      roles: [ROLE_LABELS[p.role]],
      startDate: p.year === null ? undefined : String(p.year),
      type: p.kind,
      url: publicUrl(p) ?? undefined,
    })),
    skills: cvSkillGroups.map((g) => ({ keywords: g.items, name: g.name })),
    work: experience.map((job) => {
      const range = parseDateRange(job.dates);
      return {
        endDate: range.end?.iso ?? undefined,
        highlights: job.bullets.map(plain),
        keywords: job.stack,
        name: job.company,
        position: job.role,
        startDate: range.start.iso ?? undefined,
        summary: job.description,
        url: job.links[0]?.url,
      };
    }),
  };
}
