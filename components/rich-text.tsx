import Link from "next/link";
import { Fragment } from "react";

import { experience, projects, technologies } from "~/lib/content";
import { isOnStack } from "~/lib/derive-stats";

// Project name, its short form before a parenthesis ("Farmify (livestock marketplace)" -> "Farmify") or an alias -> id. Early work has no page, so only the projects are here. The first owner of a shared text wins.
const projectIdByText = new Map<string, string>();
for (const project of projects) {
  for (const text of [
    project.name,
    project.name.split(" (")[0] ?? project.name,
    ...project.aliases,
  ]) {
    if (text.length >= 3 && !projectIdByText.has(text)) {
      projectIdByText.set(text, project.id);
    }
  }
}

// Company name -> its site, from the links of the job. A company that is also a project or a technology keeps that link.
const companyUrlByText = new Map<string, string>();
for (const job of experience) {
  const url = job.links[0]?.url;
  if (url !== undefined && !projectIdByText.has(job.company)) {
    companyUrlByText.set(job.company, url);
  }
}

// Technology name or alias -> id, for the technologies on /stack: those a project used and those the owner lists. The first owner of a shared alias wins.
const techIdByText = new Map<string, string>();
// The page a technology link opens: the projects that used it, or /stack for one no project used (an empty /work filter would be a dead end).
const techPathById = new Map<string, string>();
for (const tech of technologies) {
  if (!isOnStack(tech)) {
    continue;
  }
  techPathById.set(
    tech.id,
    tech.facts.projects > 0 ? `/work?tech=${tech.id}` : "/stack"
  );
  for (const text of [tech.name, ...tech.aliases]) {
    if (!techIdByText.has(text)) {
      techIdByText.set(text, tech.id);
    }
  }
}

// A looser key for the explicit technology lists, where a name is known to be one: "SASS" is Sass and "Styled-Components" is Styled Components. Prose keeps the exact match above, because "Go" must not match "go".
const looseKey = (text: string) =>
  text.toLowerCase().replaceAll(/[\s._-]/g, "");
const techIdByLooseKey = new Map<string, string>();
for (const [text, id] of techIdByText) {
  const key = looseKey(text);
  if (!techIdByLooseKey.has(key)) {
    techIdByLooseKey.set(key, id);
  }
}

const escape = (text: string) => text.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Longest first, so "Tailwind CSS 4" wins over "Tailwind CSS". Case-sensitive: "Go" must not match "go".
const TECH = [...techIdByText.keys()]
  .toSorted((a, b) => b.length - a.length)
  .map(escape)
  .join("|");

const COMPANY = [...companyUrlByText.keys()]
  .toSorted((a, b) => b.length - a.length)
  .map(escape)
  .join("|");

const PROJECT = [...projectIdByText.keys()]
  .toSorted((a, b) => b.length - a.length)
  .map(escape)
  .join("|");

// "25+", "08.2025", "90-minute", "3 developers".
const NUMBER = String.raw`\d+(?:\.\d+)*\+?(?:-[A-Za-z]+| (?:developers?|projects?|commits|sections|years?|repos))?`;

// Groups: 1 `code`, 2 **bold**, 3 project, 4 company, 5 technology, 6 number. A project, company, technology or number touching a letter, digit, dot or hyphen is part of a longer token. The project branch comes first, so a project wins where its name and a technology start at the same place.
const TOKEN = new RegExp(
  String.raw`\x60([^\x60]+)\x60|\*\*([^*]+)\*\*|(?<![\w.-])(${PROJECT})(?!\w)|(?<![\w.-])(${COMPANY})(?!\w)|(?<![\w.-])(${TECH})(?!\w)|(?<![\w.])(${NUMBER})(?!\w)`,
  "g"
);

const linkClass = "rich-link text-on-surface";
const numberClass = "rich-num text-on-surface";

// A name as a link to a site path. With an `origin` the link is an absolute <a> (a PDF printed from a local server would otherwise carry localhost addresses) marked data-bare, so the print sheet does not spell the address out after it.
function EntityLink({
  children,
  origin,
  path,
}: {
  children: React.ReactNode;
  origin: string | undefined;
  path: string;
}) {
  return origin === undefined ? (
    <Link className={linkClass} href={path}>
      {children}
    </Link>
  ) : (
    <a className={linkClass} data-bare href={`${origin}${path}`}>
      {children}
    </a>
  );
}

// A technology name as a link to its projects.
function TechLink({
  children,
  id,
  origin,
}: {
  children: string;
  id: string | undefined;
  origin: string | undefined;
}) {
  return (
    <EntityLink origin={origin} path={techPathById.get(id ?? "") ?? "/stack"}>
      {children}
    </EntityLink>
  );
}

function parse(text: string, origin?: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const [whole, code, bold, project, company, tech, number] = match;
    nodes.push(text.slice(last, match.index));
    last = match.index + whole.length;
    if (code !== undefined) {
      const projectId = projectIdByText.get(code);
      const node = (
        <code className="type-code text-on-surface" key={last}>
          {code}
        </code>
      );
      nodes.push(
        projectId === undefined ? (
          node
        ) : (
          <EntityLink key={last} origin={origin} path={`/work/${projectId}`}>
            {node}
          </EntityLink>
        )
      );
    } else if (bold !== undefined) {
      nodes.push(
        <strong className="font-semibold text-on-surface" key={last}>
          {parse(bold, origin)}
        </strong>
      );
    } else if (project !== undefined) {
      nodes.push(
        <EntityLink
          key={last}
          origin={origin}
          path={`/work/${projectIdByText.get(project)}`}
        >
          {project}
        </EntityLink>
      );
    } else if (company !== undefined) {
      nodes.push(
        <a
          className={linkClass}
          href={companyUrlByText.get(company)}
          key={last}
          rel="noopener noreferrer"
          target="_blank"
        >
          {company}
        </a>
      );
    } else if (tech !== undefined) {
      nodes.push(
        <TechLink id={techIdByText.get(tech)} key={last} origin={origin}>
          {tech}
        </TechLink>
      );
    } else if (number !== undefined) {
      nodes.push(
        <span className={numberClass} key={last}>
          {number}
        </span>
      );
    }
  }
  nodes.push(text.slice(last));
  return nodes;
}

// Inline renderer for the content strings: **bold** and `code` from the content files, project names as links to /work/<id>, technology names as links to /work?tech=<id>, and numbers with a quiet emphasis. The text content is the source string without its marks, so nothing is lost. Server component. `origin` makes the technology links absolute (see TechLink).
export function RichText({
  children,
  origin,
}: {
  children: string;
  origin?: string;
}) {
  return <>{parse(children, origin)}</>;
}

// A comma-separated list of technology names, each a link to /work?tech=<id> when a project used it and plain text when none did.
export function TechLinks({
  names,
  origin,
}: {
  names: readonly string[];
  origin?: string;
}) {
  return names.map((name, i) => {
    const id = techIdByText.get(name) ?? techIdByLooseKey.get(looseKey(name));
    return (
      <Fragment key={name}>
        {i > 0 ? ", " : null}
        {id === undefined ? (
          name
        ) : (
          <TechLink id={id} origin={origin}>
            {name}
          </TechLink>
        )}
      </Fragment>
    );
  });
}
