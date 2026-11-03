import { CV_PDF_PATH } from "~/lib/contact";
import { coreStackNames, profile, siteNumbers } from "~/lib/content";
import { PAGE_TWINS } from "~/lib/site-routes";
import type { PagePath } from "~/lib/site-routes";
import { siteUrl } from "~/lib/site-url";

import type { Metadata } from "next";

const page = <P extends PagePath>(
  path: P,
  title: string,
  description: string
) => ({ description, path, title, ...PAGE_TWINS[path] });

// The HTML pages: the one list the page metadata, site.json, the sitemap and the llms.txt files read.
export const SITE_PAGES = [
  page(
    "/",
    `${profile.name}, ${profile.title}`,
    `${profile.title}, ${siteNumbers.years} years: ${coreStackNames.slice(0, 5).join(", ")}. Led ${siteNumbers.developersLed} developers; ${siteNumbers.allProjects} projects.`
  ),
  page(
    "/work",
    "Work",
    `Every project, early work and open source included: ${siteNumbers.allProjects} entries with year, role, stack and link. Filter by technology, year, role, type or AI work.`
  ),
  page(
    "/stack",
    "Stack",
    `The ${siteNumbers.technologies} technologies grouped by area, with how many projects used each and how many I built.`
  ),
] as const;

// A page's head metadata from its SITE_PAGES entry, so the head, site.json and llms.txt share one description and each page announces its own Markdown and JSON twins. Next.js replaces the layout's openGraph object instead of merging it, so the shared fields are repeated here.
export function pageMetadata(path: (typeof SITE_PAGES)[number]["path"]) {
  const entry = SITE_PAGES.find((p) => p.path === path) ?? SITE_PAGES[0];
  return {
    alternates: {
      canonical: "./",
      types: {
        "application/json": entry.json,
        "text/markdown": entry.markdown,
      },
    },
    description: entry.description,
    openGraph: {
      description: entry.description,
      locale: "en_US",
      siteName: profile.name,
      title: `${entry.title} | ${profile.name}`,
      type: "website",
      url: "./",
    },
    title: entry.title,
  } satisfies Metadata;
}

// The non-HTML files. `sitemap` marks the ones sitemap.xml lists; the housekeeping files (robots, sitemap, humans, security.txt, manifest) are not content.
export const SITE_FILES = [
  {
    description: "The CV as Markdown, in the same order as the CV page.",
    path: "/cv.md",
    sitemap: true,
    title: "CV (Markdown)",
    type: "text/markdown",
  },
  {
    description: "The CV in the JSON Resume format.",
    path: "/resume.json",
    sitemap: true,
    title: "CV (JSON Resume)",
    type: "application/json",
  },
  {
    description: "The printable CV as a text-layer PDF.",
    path: CV_PDF_PATH,
    sitemap: true,
    title: "CV (PDF)",
    type: "application/pdf",
  },
  {
    description:
      "Every project, the early work and the open-source contributions as Markdown: role, year, stack, summary and public link.",
    path: "/work.md",
    sitemap: true,
    title: "Work (Markdown)",
    type: "text/markdown",
  },
  {
    description:
      "Every project, the early work and the open-source contributions as JSON: ids, years, roles, summaries, stack ids and page addresses.",
    path: "/projects.json",
    sitemap: true,
    title: "Projects (JSON)",
    type: "application/json",
  },
  {
    description:
      "Every technology as Markdown, grouped by area, with project counts and the projects that used it.",
    path: "/stack.md",
    sitemap: true,
    title: "Stack (Markdown)",
    type: "text/markdown",
  },
  {
    description:
      "The technology registry as JSON: groups, counts and the ids of the projects that used each one.",
    path: "/technologies.json",
    sitemap: true,
    title: "Technologies (JSON)",
    type: "application/json",
  },
  {
    description:
      "The map of this site: every page, its Markdown and JSON twin, and the files.",
    path: "/site.json",
    sitemap: true,
    title: "Site index (JSON)",
    type: "application/json",
  },
  {
    description:
      "This site in plain text, in the llms.txt format: what is here and where.",
    path: "/llms.txt",
    sitemap: true,
    title: "llms.txt",
    type: "text/plain",
  },
  {
    description:
      "The CV plus every project and technology in one Markdown file.",
    path: "/llms-full.txt",
    sitemap: true,
    title: "llms-full.txt",
    type: "text/plain",
  },
  {
    description: "Who made this site.",
    path: "/humans.txt",
    sitemap: false,
    title: "humans.txt",
    type: "text/plain",
  },
  {
    description: "Security contact, RFC 9116.",
    path: "/.well-known/security.txt",
    sitemap: false,
    title: "security.txt",
    type: "text/plain",
  },
  {
    description: "Crawler rules.",
    path: "/robots.txt",
    sitemap: false,
    title: "robots.txt",
    type: "text/plain",
  },
  {
    description: "All pages and files for crawlers.",
    path: "/sitemap.xml",
    sitemap: false,
    title: "sitemap.xml",
    type: "application/xml",
  },
  {
    description: "Web app manifest.",
    path: "/manifest.webmanifest",
    sitemap: false,
    title: "manifest.webmanifest",
    type: "application/manifest+json",
  },
] as const;

export const absolute = (path: string) => `${siteUrl}${path}`;

// A file's Markdown link as llms.txt lists it: its title and what it holds.
export function fileEntry(path: string) {
  const file = SITE_FILES.find((f) => f.path === path);
  if (file === undefined) {
    throw new Error(`site-pages: no file ${path}`);
  }
  return `- [${file.title}](${absolute(file.path)}): ${file.description}`;
}
