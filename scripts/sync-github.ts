/**
 * sync-github.ts
 *
 * Makes the GitHub profile say what the site says: the profile README (the `<login>/<login>` repository) and the account fields (name, bio, blog, location, company, hireable), all rendered from `content/` through `lib/content.ts`. Before this the profile still read "Front-end Developer with 5+ years", linked the retired Firebase site and a Google Drive CV, because nothing tied it to the content.
 *
 * Usage:
 *   bun sync:github           # dry run: prints what would change
 *   bun sync:github --apply   # writes it
 *
 * Talks to GitHub only through the `gh` CLI, so locally it uses the owner's `gh` login and in CI the `GH_TOKEN` of `.github/workflows/profile-sync.yml`.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { z } from "zod";

import {
  AVAILABILITY,
  CV_PDF_PATH,
  email,
  telegramUrl,
} from "../lib/contact.ts";
import {
  experience,
  openSource,
  profile,
  siteNumbers,
  technologies,
} from "../lib/content.ts";
import { selectedProjects } from "../lib/featured.ts";
import { ROLE_LABELS } from "../lib/labels.ts";
import { publicUrl } from "../lib/project-url.ts";
import { siteUrl } from "../lib/site-url.ts";

const contactUrl = (label: string) => {
  const url = profile.contacts.find((c) => c.label === label)?.url;
  if (url === undefined) {
    throw new Error(`profile.json: contacts has no "${label}" entry`);
  }
  return url;
};

// The GitHub login is the path of the GitHub contact URL: https://github.com/Frederlk → Frederlk.
export const githubLogin = new URL(contactUrl("GitHub")).pathname.slice(1);

// The job whose dates run to the present; GitHub's "company" field names it.
const currentJob = experience.find((job) => job.dates.endsWith("Present"));

// The account fields PATCH /user accepts, as the site has them. `headline` is capped at 160 characters by its schema, GitHub's bio limit.
export const accountFields = {
  bio: profile.headline,
  blog: siteUrl,
  company: currentJob?.company ?? "",
  hireable: true,
  location: profile.location,
  name: profile.name,
} as const;

const md = (text: string, url: string) => `[${text}](${url})`;
const page = (route: string) => `${siteUrl}${route}`;

// The "Core stack" technologies the site's /stack shows, each linked to /work filtered by it, with its project count.
const coreStack = technologies.filter(
  (t) => t.group === "Core stack" && t.facts.projects > 0
);

export function renderReadme(): string {
  const telegram =
    telegramUrl === undefined ? [] : [md("Telegram", telegramUrl)];
  const lines = [
    `# ${md(profile.name, siteUrl)}`,
    "",
    `**${profile.title}** · _${profile.location}_ · <ins>${AVAILABILITY}</ins>`,
    "",
    `> **${profile.headline}**`,
    "",
    profile.summary,
    "",
    `**${md("Portfolio", siteUrl)}** · **${md("Download CV (PDF)", page(CV_PDF_PATH))}** · ${md("All projects", page("/work"))} · ${md("Stack", page("/stack"))} · ${md("Experience", page("/#experience"))}`,
    "",
    "## Core stack",
    "",
    coreStack
      .map(
        (t) =>
          `**${md(t.name, page(`/work?tech=${t.id}`))}** _(${t.facts.projects})_`
      )
      .join(" · "),
    "",
    `_The number is how many projects use it. Every technology, grouped and counted: ${md("the stack page", page("/stack"))}._`,
    "",
    "## Experience",
    "",
    ...experience.map(
      (job) => `- **${job.role}**, ${job.company} · _${job.dates}_`
    ),
    "",
    `_Details, team sizes and projects per job: ${md("experience on the portfolio", page("/#experience"))}._`,
    "",
    "## Selected work",
    "",
    ...selectedProjects.map((p) => {
      const live = publicUrl(p);
      const meta = [ROLE_LABELS[p.role], p.year].filter(
        (part) => part !== null
      );
      return `- **${md(p.name, page(`/work/${p.id}`))}** · _${meta.join(", ")}_${live === null ? "" : ` · ${md("live site", live)}`}  \n  ${p.summary}`;
    }),
    "",
    `**${md(`Browse all ${siteNumbers.allProjects} projects`, page("/work"))}**, filterable by technology, role and year.`,
    "",
    "## Open source",
    "",
    ...openSource.map(
      (o) => `- **${md(o.name, o.url)}** _(${o.year})_: ${o.summary}`
    ),
    "",
    "## Contact",
    "",
    [
      `**${md(email, `mailto:${email}`)}**`,
      md("LinkedIn", contactUrl("LinkedIn")),
      ...telegram,
      md("CV (PDF)", page(CV_PDF_PATH)),
    ].join(" · "),
    "",
    `_For AI agents and recruiting tools: ${md("llms.txt", page("/llms.txt"))} · ${md("CV in Markdown", page("/cv.md"))} · ${md("resume.json", page("/resume.json"))}._`,
    "",
  ];
  return lines.join("\n");
}

// gh's stderr carries the fix (a 404 on PATCH user means the token lacks the `user` scope, and gh names the refresh command), so it goes into the error rather than being lost.
const gh = (args: string[], input?: string): string => {
  const result = spawnSync("gh", args, { encoding: "utf8", input });
  // `error` is set when gh could not start at all (not installed); `stderr` when it ran and refused.
  if (result.error !== undefined) {
    throw new Error(`gh could not run: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`gh ${args.join(" ")} failed:\n${result.stderr}`);
  }
  return result.stdout;
};

const User = z.object({
  bio: z.string().nullable(),
  blog: z.string().nullable(),
  company: z.string().nullable(),
  hireable: z.boolean().nullable(),
  location: z.string().nullable(),
  name: z.string().nullable(),
});

const Contents = z.object({ content: z.string(), sha: z.string() });

function main() {
  const apply = process.argv.includes("--apply");
  const repo = `${githubLogin}/${githubLogin}`;

  const user = new Map(
    Object.entries(User.parse(JSON.parse(gh(["api", "user"]))))
  );
  const changed = Object.entries(accountFields).filter(
    ([key, value]) => user.get(key) !== value
  );
  for (const [key, value] of changed) {
    console.log(
      `${key}: ${JSON.stringify(user.get(key))} → ${JSON.stringify(value)}`
    );
  }

  const current = Contents.parse(
    JSON.parse(gh(["api", `repos/${repo}/contents/README.md`]))
  );
  const currentReadme = Buffer.from(current.content, "base64").toString("utf8");
  const readme = renderReadme();
  const readmeChanged = currentReadme !== readme;
  if (readmeChanged) {
    console.log(`\n${repo}/README.md changes to:\n\n${readme}`);
  }

  if (changed.length === 0 && !readmeChanged) {
    console.log("GitHub profile already matches the site.");
    return;
  }
  if (!apply) {
    console.log("\nDry run. Run with --apply to write.");
    return;
  }

  // README first: it needs only repository access, so it lands even when the token cannot edit the account.
  if (readmeChanged) {
    gh(
      ["api", "-X", "PUT", `repos/${repo}/contents/README.md`, "--input", "-"],
      JSON.stringify({
        content: Buffer.from(readme, "utf8").toString("base64"),
        message: `docs: sync the profile README from ${siteUrl}`,
        sha: current.sha,
      })
    );
    console.log(`Updated ${repo}/README.md`);
  }
  if (changed.length > 0) {
    gh(
      ["api", "-X", "PATCH", "user", "--input", "-"],
      JSON.stringify(Object.fromEntries(changed))
    );
    console.log(
      `Updated the account fields: ${changed.map(([key]) => key).join(", ")}`
    );
  }
}

if (
  process.argv[1] !== undefined &&
  import.meta.filename === path.resolve(process.argv[1])
) {
  main();
}
