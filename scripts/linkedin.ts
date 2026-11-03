/**
 * linkedin.ts
 *
 * LinkedIn has no write API for a personal profile, so this walks the owner through pasting it by hand, fast: every field rendered from `content/` as plain text, checked against LinkedIn's limits, copied to the clipboard, with the matching edit page opened. Before this the profile drifted from the CV (Warsaw instead of remote, "4+ years" in Featured) because copying it out was a chore nobody repeated.
 *
 * Usage (in your own terminal, it waits for Enter between fields):
 *   bun linkedin           # only the fields that changed since the last run
 *   bun linkedin --all     # every field
 *   bun linkedin --print   # print every field and exit, no clipboard, no prompts
 *
 * What was pasted is remembered per field as a hash in `linkedin-state.json` under the gitignored private folder, so the next run after a content change shows just the difference.
 */

import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { z } from "zod";

import {
  cvSkillGroups,
  education,
  experience,
  profile,
} from "../lib/content.ts";
import { siteUrl } from "../lib/site-url.ts";

export type Field = {
  key: string;
  label: string;
  // What to do on the page before pasting.
  how: string;
  limit?: number;
  text: string;
  url: string;
};

// LinkedIn renders none of the site's Markdown: bold and inline code would show their markers.
export const plain = (text: string) =>
  text.replaceAll(/\*\*(.+?)\*\*/g, "$1").replaceAll(/`([^`]+)`/g, "$1");

const linkedinUrl = (() => {
  const url = profile.contacts.find((c) => c.label === "LinkedIn")?.url;
  if (url === undefined) {
    throw new Error('profile.json: contacts has no "LinkedIn" entry');
  }
  return url.replace(/\/$/, "");
})();

export function linkedinFields(): Field[] {
  const intro = `${linkedinUrl}/`;
  return [
    {
      how: "Profile → pencil next to your name → Headline. Location there needs a real city: private/notes/decisions.md, Location.",
      key: "headline",
      label: "Headline",
      limit: 220,
      text: profile.linkedinHeadline,
      url: intro,
    },
    {
      how: 'Same intro form → Website / Custom link, link text "Portfolio".',
      key: "website",
      label: "Website",
      text: siteUrl,
      url: intro,
    },
    {
      how: "Profile → About → pencil. Replace the whole text.",
      key: "about",
      label: "About",
      limit: 2600,
      text: plain(profile.summary),
      url: intro,
    },
    ...experience.map((job) => ({
      how: `Experience → ${job.company} → pencil. Title "${job.role}", dates ${job.dates}. Paste into Description.`,
      key: `experience.${job.id}`,
      label: `Experience: ${job.role}, ${job.company}`,
      limit: 2000,
      text: [
        plain(job.description),
        ...job.bullets.map((b) => `• ${plain(b)}`),
      ].join("\n"),
      url: `${linkedinUrl}/details/experience/`,
    })),
    ...education.education.map((e, index) => ({
      how: `Education → pencil. Degree "${e.degree}", ${e.dates}, ${e.location}. Paste is the school.`,
      key: `education.${index}`,
      label: `Education: ${e.degree}`,
      text: e.school,
      url: `${linkedinUrl}/details/education/`,
    })),
    {
      how: "Skills → add any of these that are missing, one at a time; pin the first three as top skills.",
      key: "skills",
      label: "Skills",
      text: cvSkillGroups.flatMap((g) => g.items).join(", "),
      url: `${linkedinUrl}/details/skills/`,
    },
  ];
}

export const hashOf = (text: string) =>
  createHash("sha256").update(text).digest("hex").slice(0, 16);

const StateSchema = z.record(z.string(), z.string());
type State = z.infer<typeof StateSchema>;

export const changedFields = (fields: readonly Field[], state: State) =>
  fields.filter((f) => state[f.key] !== hashOf(f.text));

// PowerShell's stdin decodes with the OEM code page unless told otherwise, which turns "·" and "—" into mojibake.
const copy = (text: string) =>
  execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      "[Console]::InputEncoding = [Text.Encoding]::UTF8; Set-Clipboard -Value ([Console]::In.ReadToEnd())",
    ],
    { input: text }
  );

const open = (url: string) => {
  spawn("explorer.exe", [url], { detached: true, stdio: "ignore" }).unref();
};

const STATE_FILE = path.join(
  import.meta.dirname,
  "..",
  "private",
  "linkedin-state.json"
);

function readState(): State {
  return existsSync(STATE_FILE)
    ? StateSchema.parse(JSON.parse(readFileSync(STATE_FILE, "utf8")))
    : {};
}

function writeState(state: State) {
  mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

const header = (f: Field) => {
  const size =
    f.limit === undefined
      ? `${f.text.length} chars`
      : `${f.text.length}/${f.limit} chars`;
  const over =
    f.limit !== undefined && f.text.length > f.limit
      ? "  OVER THE LIMIT: shorten it in content/ first"
      : "";
  return `\n=== ${f.label} (${size})${over}\n${f.how}\n`;
};

async function main() {
  const fields = linkedinFields();

  if (process.argv.includes("--print")) {
    for (const f of fields) {
      console.log(`${header(f)}\n${f.text}`);
    }
    return;
  }

  const state = readState();
  const todo = process.argv.includes("--all")
    ? fields
    : changedFields(fields, state);
  if (todo.length === 0) {
    console.log(
      "LinkedIn already has everything the site says. --all walks every field anyway."
    );
    return;
  }
  console.log(
    `${todo.length} of ${fields.length} fields to update. Enter = pasted, s = skip, q = quit.`
  );

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let lastUrl = "";
  for (const f of todo) {
    console.log(`${header(f)}\n${f.text}\n`);
    copy(f.text);
    if (f.url !== lastUrl) {
      open(f.url);
      lastUrl = f.url;
    }
    const answer = (await rl.question("Copied. Paste it, save, then Enter: "))
      .trim()
      .toLowerCase();
    if (answer === "q") {
      break;
    }
    if (answer !== "s") {
      state[f.key] = hashOf(f.text);
      writeState(state);
    }
  }
  rl.close();
}

if (
  process.argv[1] !== undefined &&
  import.meta.filename === path.resolve(process.argv[1])
) {
  await main();
}
