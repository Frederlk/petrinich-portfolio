// Prints /cv?print=1 (a plain /cv redirects to the home page) to public/Sergey-Petrinich-Lead-Full-Stack-Developer-CV.pdf through headless Chrome, using the page's own print stylesheet (styles/cv-print.css: A4 and its @page margins, no browser header or footer), then stamps the document info and XMP with scripts/cv-pdf-meta.py (needs `uv`), which also fails on a third page or a Type3 font. The file is committed and served as /Sergey-Petrinich-Lead-Full-Stack-Developer-CV.pdf (/cv.pdf redirects to it), so run `bun cv:pdf` and commit the result whenever the CV content or print styles change.
// Builds the site (skip with --reuse-build), serves it on a spare port, prints, and stops the server. Ported from the old portfolio's cv-pdf.ts, minus the pdf-lib author stamp.
import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { z } from "zod";

const PORT = 4312;
const ROOT = join(import.meta.dirname, "..");
// Same name as CV_PDF_NAME in lib/contact.ts (duplicated here, not imported).
const OUT = join(
  ROOT,
  "public",
  "Sergey-Petrinich-Lead-Full-Stack-Developer-CV.pdf"
);
const META_SCRIPT = join(import.meta.dirname, "cv-pdf-meta.py");

// The part of /resume.json the PDF metadata is built from.
const Resume = z.object({
  basics: z.object({
    label: z.string(),
    name: z.string(),
    summary: z.string(),
  }),
  skills: z.array(z.object({ keywords: z.array(z.string()) })),
  work: z.array(z.object({ position: z.string() })),
});
const NEXT_BIN = join(ROOT, "node_modules", "next", "dist", "bin", "next");
// Next runs on node, as `bun run build` and Vercel run it, not on the bun that runs this script: under bun's runtime `next build` reports the root layout's URL hooks as blocking prerender on /work/[slug] (measured 2026-11-03: 3 errors under bun, none under node).
const NODE = "node";
const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const chrome = CHROME_CANDIDATES.find((path) => existsSync(path));
if (chrome === undefined) {
  console.error(
    "Chrome not found. Install Google Chrome or add its path to CHROME_CANDIDATES in scripts/cv-pdf.ts."
  );
  process.exit(1);
}

if (!process.argv.includes("--reuse-build")) {
  execFileSync(NODE, [NEXT_BIN, "build"], {
    cwd: ROOT,
    stdio: "inherit",
  });
} else if (!existsSync(join(ROOT, ".next", "BUILD_ID"))) {
  console.error(
    "--reuse-build given but .next has no build; run `bun run build`."
  );
  process.exit(1);
}

const server = spawn(NODE, [NEXT_BIN, "start", "-p", `${PORT}`], {
  cwd: ROOT,
  stdio: "inherit",
});
const profileDir = await mkdtemp(join(tmpdir(), "cv-pdf-"));

try {
  const url = `http://localhost:${PORT}/cv?print=1`;
  let ready = false;
  for (let i = 0; i < 60 && !ready; i += 1) {
    ready = await fetch(url).then(
      (r) => r.ok,
      () => false
    );
    if (!ready) {
      await sleep(500);
    }
  }
  if (!ready) {
    throw new Error(`${url} did not come up`);
  }

  // A throwaway profile keeps headless Chrome from handing the job to an open browser. The tagged-PDF and outline flags give the file a structure tree (screen readers, text extraction in reading order) and bookmarks from the headings.
  execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      `--user-data-dir=${profileDir}`,
      "--no-pdf-header-footer",
      "--export-tagged-pdf",
      "--generate-pdf-document-outline",
      "--virtual-time-budget=10000",
      `--print-to-pdf=${OUT}`,
      url,
    ],
    // Headless Chrome occasionally keeps running after the PDF is written; the cap turns that into an error instead of a hang.
    { stdio: "inherit", timeout: 90_000 }
  );

  // Document info and XMP come from the site's own resume.json, so the title, keywords and subject follow the content.
  const response = await fetch(`http://localhost:${PORT}/resume.json`);
  const resume = Resume.parse(await response.json());
  const { name, label, summary } = resume.basics;
  const roles = [...new Set(resume.work.map((job) => job.position))];
  const skills = resume.skills.flatMap((group) => group.keywords);
  const metaFile = join(profileDir, "cv-meta.json");
  await writeFile(
    metaFile,
    JSON.stringify({
      author: name,
      creator:
        "petrinich-portfolio /cv printed by Google Chrome (scripts/cv-pdf.ts)",
      keywords: [...new Set([label, ...roles, ...skills])].join(", "),
      language: "en",
      subject: `Curriculum vitae of ${name}, ${label}. ${summary.split(". ")[0]}.`,
      title: `${name}, ${label}, CV`,
    })
  );
  execFileSync("uv", ["run", META_SCRIPT, OUT, metaFile], { stdio: "inherit" });
  console.log(`wrote ${OUT}`);
} finally {
  server.kill();
  await rm(profileDir, { force: true, recursive: true });
}
