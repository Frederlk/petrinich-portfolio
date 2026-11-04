// The Markdown and JSON twin of each page. Pure data with no imports, so next.config.ts can read it for the Link headers while the pages, the site index and the tests read the same table.
export const PAGE_TWINS = {
  "/": { json: "/resume.json", markdown: "/cv.md" },
  "/cv": { json: "/resume.json", markdown: "/cv.md" },
  "/stack": { json: "/technologies.json", markdown: "/stack.md" },
  "/work": { json: "/projects.json", markdown: "/work.md" },
} as const;

export type PagePath = keyof typeof PAGE_TWINS;

export const LLMS_PATH = "/llms.txt";

// Every /work/<slug> page (project, early work or open source) has a Markdown twin at the page address plus ".md"; next.config.ts rewrites it to the route handler.
export const projectMarkdownPath = (id: string) => `/work/${id}.md`;

type Twins = { json?: string; markdown?: string };

// The value of a Link response header (RFC 8288) for one page: its twins as rel="alternate" and the llms.txt as rel="describedby". The same links sit in the page head.
export const linkHeader = (twins: Twins, origin = "") =>
  [
    twins.markdown === undefined
      ? null
      : `<${origin}${twins.markdown}>; rel="alternate"; type="text/markdown"`,
    twins.json === undefined
      ? null
      : `<${origin}${twins.json}>; rel="alternate"; type="application/json"`,
    `<${origin}${LLMS_PATH}>; rel="describedby"; type="text/plain"`,
  ]
    .filter((part) => part !== null)
    .join(", ");
