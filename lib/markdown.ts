import { stackBody, stackDigest, workBody } from "~/lib/catalogue";
import { AVAILABILITY, CV_PDF_PATH, email } from "~/lib/contact";
import {
  certificates,
  cvSkillGroups,
  education,
  experience,
  profile,
  projects,
  siteNumbers,
} from "~/lib/content";
import { selectedProjects } from "~/lib/featured";
import { ROLE_LABELS } from "~/lib/labels";
import { publicUrl } from "~/lib/project-url";
import { absolute, fileEntry } from "~/lib/site-pages";
import { projectMarkdownPath } from "~/lib/site-routes";

import type { Project } from "~/schemas/projects";

import { coreStack } from "~/features/stack/stack-groups";

const link = (text: string, url: string) => `[${text}](${url})`;

const projectLine = (p: Project) => {
  const url = publicUrl(p);
  const head =
    url === null ? `**${p.name}**` : `**${p.name}** (${link(url, url)})`;
  const highlights = (p.highlights ?? []).map((h) => `\n  - ${h}`).join("");
  return `- ${head}: ${p.summary} Role: ${ROLE_LABELS[p.role]}.${highlights}`;
};

const contactLines = () =>
  profile.contacts.map((c) =>
    c.url.startsWith("mailto:")
      ? `- **${c.label}:** ${link(c.url.slice(7), c.url)}`
      : `- **${c.label}:** ${link(c.url, c.url)}`
  );

// The CV as Markdown, in the same order as /cv.
export function cvMarkdown() {
  const lines = [
    `# ${profile.name}`,
    "",
    profile.title,
    "",
    `${siteNumbers.years} years of experience · ${profile.location}`,
    "",
    ...contactLines(),
    "",
    `**Projects:** ${siteNumbers.allProjects} · **Technologies:** ${siteNumbers.technologies} · **Years:** ${siteNumbers.years} · **Developers led:** ${siteNumbers.developersLed}`,
    "",
    "## Summary",
    "",
    profile.summary,
    "",
    "## Skills",
    "",
    ...cvSkillGroups.map((g) => `- **${g.name}:** ${g.items.join(", ")}`),
    "",
    `All ${siteNumbers.technologies} technologies: ${link(absolute("/stack"), absolute("/stack"))}`,
    "",
    "## Experience",
  ];
  for (const job of experience) {
    lines.push(
      "",
      `### ${job.role}, ${job.company}`,
      "",
      job.dates,
      "",
      job.description,
      "",
      `**Stack:** ${job.stack.join(", ")}`,
      "",
      "**Achievements:**",
      "",
      ...job.bullets.map((b) => `- ${b}`)
    );
    if (job.links.length > 0) {
      lines.push(
        "",
        `**Links:** ${job.links.map((l) => link(l.url, l.url)).join(" · ")}`
      );
    }
  }
  lines.push(
    "",
    "## Projects",
    "",
    ...selectedProjects.map(projectLine),
    "",
    "## Education"
  );
  for (const e of education.education) {
    lines.push(
      "",
      `### ${e.school}`,
      "",
      `${e.degree}, ${e.dates} · ${e.location}`
    );
  }
  lines.push(
    "",
    "## Languages",
    "",
    ...education.languages.map((l) => `- **${l.name}** (${l.level})`),
    "",
    "## Interests",
    "",
    education.interests,
    ""
  );
  return lines.join("\n");
}

const CERTIFICATES_INTRO =
  "Course-completion certificates from Anthropic Academy, each with its verification page.";

const certificateLines = () =>
  certificates.map((c) => `- ${link(c.name, c.url)}: ${c.issuer}, ${c.issued}`);

const webContactLines = () =>
  profile.contacts
    .filter((c) => c.url.startsWith("http"))
    .map((c) => `- ${link(c.label, c.url)}: ${c.label} profile`);

// llms.txt (https://llmstxt.org): H1, blockquote summary, free text, then H2 sections of described links. The blockquote alone should let a screening agent judge fit; the stack carries counts and years with links to the projects behind them. Every address is absolute on the canonical origin.
export function llmsTxt() {
  const coreNames = (coreStack?.items ?? []).map((t) => t.name).join(", ");
  const languages = education.languages
    .map((l) => `${l.name} (${l.level})`)
    .join(", ");
  return [
    `# ${profile.name}`,
    "",
    `> ${profile.title} with ${siteNumbers.years} years of experience, building production web apps since ${siteNumbers.since}. Core stack: ${coreNames}. Led ${siteNumbers.developersLed} developers, up to ${siteNumbers.peakTeam} at a time, and hired ${siteNumbers.hired}. ${profile.location}. ${AVAILABILITY}. Languages: ${languages}.`,
    "",
    `${profile.intro} ${siteNumbers.allProjects} projects and ${siteNumbers.technologies} technologies are listed on this site, each project with its own page.`,
    "",
    "## Contact and availability",
    "",
    `- ${link("Email", `mailto:${email}`)}: ${email}, the quickest way to reach me`,
    `- Availability: ${AVAILABILITY}`,
    `- Location: ${profile.location}`,
    `- Languages: ${languages}`,
    ...webContactLines(),
    "",
    ...stackDigest(),
    "## Experience",
    "",
    ...experience.map(
      (job) =>
        `- ${link(`${job.role}, ${job.company}`, job.links[0]?.url ?? absolute("/cv.md"))}: ${job.dates}. ${job.description}`
    ),
    "",
    "## Profile",
    "",
    fileEntry("/cv.md"),
    fileEntry("/resume.json"),
    fileEntry(CV_PDF_PATH),
    `- ${link("Home", absolute("/"))}: profile, numbers, selected work and experience`,
    `- ${link("Stack (HTML)", absolute("/stack"))}: the technologies by area, with project counts`,
    fileEntry("/stack.md"),
    fileEntry("/technologies.json"),
    "",
    "## Work",
    "",
    `- ${link("Work (HTML)", absolute("/work"))}: the archive, filterable by technology, year, role and type`,
    fileEntry("/work.md"),
    fileEntry("/projects.json"),
    ...projects.map(
      (p) =>
        `- ${link(p.name, absolute(projectMarkdownPath(p.id)))}: ${p.summary}`
    ),
    "",
    "## Certifications",
    "",
    CERTIFICATES_INTRO,
    "",
    ...certificateLines(),
    "",
    "## Optional",
    "",
    "Every page is server-rendered HTML with all of its content in the first response, so no JavaScript is needed to read it. Each page names its Markdown and JSON twins in its head and in the Link response header, and answers a request that accepts text/markdown with the Markdown twin. Pages carry schema.org JSON-LD (Person, ProfilePage).",
    "",
    fileEntry("/llms-full.txt"),
    fileEntry("/site.json"),
    fileEntry("/humans.txt"),
    fileEntry("/.well-known/security.txt"),
    fileEntry("/sitemap.xml"),
    "",
  ].join("\n");
}

// llms-full.txt: the CV, then every project, every technology and the certificates.
export function llmsFullTxt() {
  return [
    cvMarkdown().trimEnd(),
    "",
    "# Work",
    "",
    workBody(),
    "# Stack",
    "",
    stackBody(),
    "# Certifications",
    "",
    CERTIFICATES_INTRO,
    "",
    ...certificateLines(),
    "",
  ].join("\n");
}
