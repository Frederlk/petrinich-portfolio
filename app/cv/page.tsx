import localFont from "next/font/local";

import { JsonLd } from "~/components/json-ld";
import { KeyStats } from "~/components/key-stats";
import { Portrait } from "~/components/layout/portrait";
import { RichText, TechLinks } from "~/components/rich-text";

import { cn } from "~/lib/cn";
import { CV_PDF_NAME, CV_PDF_PATH } from "~/lib/contact";
import {
  cvSkillGroups,
  education,
  experience,
  profile,
  siteNumbers,
} from "~/lib/content";
import { coreTechs } from "~/lib/core-stack";
import { parseDateRange } from "~/lib/dates";
import { selectedProjects } from "~/lib/featured";
import { ROLE_LABELS } from "~/lib/labels";
import { publicUrl } from "~/lib/project-url";
import { siteUrl } from "~/lib/site-url";
import { profilePageJsonLd } from "~/lib/structured-data";
import { bare } from "~/lib/url";

import "~/styles/cv-print.css";

import type { Project } from "~/schemas/projects";

import { BUILD_LABELS } from "~/features/work/work-types";

import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

export const metadata: Metadata = {
  description: `${profile.name}: ${profile.title}. ${siteNumbers.years} years of experience.`,
  title: "CV",
};

// Static 400 and 700 instances of Archivo Narrow, cut from the variable font the site loads. Chrome writes a variable font into a PDF as Type3 glyphs, which viewers draw unhinted ("Full" rendered with uneven letters at screen zoom) and some parsers extract worse; static instances embed as TrueType. styles/cv-print.css sets the sheet in this family only.
const CV_FONT = localFont({
  src: [
    { path: "./fonts/archivo-narrow-400.woff2", weight: "400" },
    { path: "./fonts/archivo-narrow-700.woff2", weight: "700" },
  ],
  variable: "--font-cv",
});

// Projects printed on the CV; the site lists all of them.
const CV_PROJECTS = 4;

// "February 2024 – Present" as machine-readable <time> elements around the same visible text; an open end ("Present") has no date to tag.
function DateRange({ dates }: { dates: string }) {
  const { end, start } = parseDateRange(dates);
  return (
    <>
      <time dateTime={start.iso ?? undefined}>{start.text}</time>
      {end === null ? null : (
        <>
          {" – "}
          <time dateTime={end.iso ?? undefined}>{end.text}</time>
        </>
      )}
    </>
  );
}

// The id makes every section a hash target (/cv#experience). Titles are the plain names résumé parsers expect: Summary, Skills, Experience, Projects, Education, Languages, Interests.
function CvSection({
  children,
  className,
  title,
}: PropsWithChildren<{ className?: string; title: string }>) {
  const id = title.toLowerCase().replaceAll(" ", "-");
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="cv-section flex flex-col gap-space-md border-b border-surface-container-high py-space-lg last:border-b-0"
      id={id}
    >
      <h2 className="cv-h2 type-label text-secondary" id={`${id}-title`}>
        {title}
      </h2>
      <div className={className}>{children}</div>
    </section>
  );
}

// A link that shows its own address, so the printed sheet carries the full URL as text.
function BareLink({ className, url }: { className?: string; url: string }) {
  return (
    <a className={cn("cv-url", className)} href={url} rel="noopener">
      {bare(url)}
    </a>
  );
}

// The first sentence of a project summary: the CV gives one line per project, the project page the rest.
const firstSentence = (text: string) =>
  /^.+?\.(?=\s|$)/.exec(text)?.[0] ?? text;

// One project: name, year, role and address on the first line, the first sentence of the summary, its highlights as bullets, then its core technologies (`coreTechs`, the same list a /work row shows) as plain text.
function CvProject({ project }: { project: Project }) {
  const url = publicUrl(project);
  const meta = [
    project.year,
    ROLE_LABELS[project.role],
    project.aiOrchestrated ? BUILD_LABELS.ai : null,
  ].filter((part) => part !== null && part !== undefined);
  return (
    <div className="cv-project flex flex-col gap-1">
      <div className="cv-entry-head flex flex-wrap items-baseline justify-between gap-x-space-md">
        <h3 className="cv-entry-title type-h3 text-on-surface">
          <a href={`${siteUrl}/work/${project.id}`}>{project.name}</a>
          <span className="cv-meta"> · {meta.join(" · ")}</span>
        </h3>
        {url === null ? null : <BareLink className="cv-meta" url={url} />}
      </div>
      <p className="type-body text-secondary">
        {firstSentence(project.summary)}
      </p>
      {project.highlights === undefined ? null : (
        <ul className="cv-bullets list-square flex flex-col gap-1 type-body-sm text-secondary">
          {project.highlights.map((h) => (
            <li key={h}>
              <RichText origin={siteUrl}>{h}</RichText>
            </li>
          ))}
        </ul>
      )}
      <p className="type-body-sm text-secondary">
        <span className="cv-meta">Stack: </span>
        {coreTechs(project.stack)
          .map((t) => t.name)
          .join(", ")}
      </p>
    </div>
  );
}

// Technology and project links are absolute because the PDF is printed from a local server and a relative href would become a localhost address. /cv redirects to the home page, so this page exists to be printed: public/Sergey-Petrinich-Lead-Full-Stack-Developer-CV.pdf is /cv?print=1 printed with styles/cv-print.css; regenerate it with `bun cv:pdf` when the content changes.
export default function CvPage() {
  const [place = profile.location, zone = ""] = profile.location.split(" · ");
  return (
    <main
      className={cn("cv-page min-h-screen w-full bg-surface", CV_FONT.variable)}
    >
      <JsonLd data={profilePageJsonLd("/cv")} />
      <article className="mx-auto w-full max-w-275 px-margin-mobile pb-space-lg text-on-surface md:px-margin">
        <div
          className="no-print flex w-full items-center justify-between gap-space-sm border-b border-surface-container-high py-space-md print:hidden"
          data-cv-bar
        >
          <p className="type-meta text-secondary">Also available as a PDF.</p>
          <a
            className="border border-primary-container px-space-md py-space-xs type-button text-primary-container"
            download={CV_PDF_NAME}
            href={CV_PDF_PATH}
          >
            Download CV (PDF)
          </a>
        </div>

        <header className="cv-header grid grid-cols-[minmax(0,1fr)_auto] items-start gap-gutter pt-space-xl pb-space-lg">
          <div className="cv-id flex min-w-0 flex-col gap-space-xs">
            <h1 className="cv-name m-0 type-display text-on-surface">
              {profile.name}
            </h1>
            <p className="cv-title type-h3 text-on-surface">{profile.title}</p>
            <p className="cv-meta type-body-sm">
              {place}
              {zone === "" ? null : ` · ${zone}`}
            </p>
            <ul className="cv-contacts mt-space-sm grid grid-cols-2 gap-x-space-lg gap-y-1 type-body-sm">
              {profile.contacts.map((c) => (
                <li key={c.label}>
                  <span className="cv-meta">{c.label}: </span>
                  <BareLink url={c.url} />
                </li>
              ))}
            </ul>
          </div>
          <Portrait className="cv-photo size-32" priority sizes="128px" />
        </header>

        <KeyStats className="py-space-md" links={false} />

        <CvSection title="Summary">
          <p className="cv-summary type-lead text-on-surface">
            <RichText origin={siteUrl}>{profile.summary}</RichText>
          </p>
        </CvSection>

        <CvSection title="Skills">
          <dl className="cv-skills grid grid-cols-[auto_minmax(0,1fr)] gap-x-gutter gap-y-1">
            {cvSkillGroups.map((g) => (
              <div className="cv-skill contents" key={g.name}>
                <dt className="cv-skill-name type-body-sm text-on-surface">
                  {g.name}
                </dt>
                <dd className="type-body-sm text-on-surface-variant">
                  <TechLinks names={g.items} origin={siteUrl} />
                </dd>
              </div>
            ))}
          </dl>
          <p className="cv-skills-all mt-space-sm type-body-sm">
            <span className="cv-meta">
              All {siteNumbers.technologies} technologies:{" "}
            </span>
            <BareLink url={`${siteUrl}/stack`} />
          </p>
        </CvSection>

        <CvSection title="Experience">
          <ol className="cv-jobs flex flex-col gap-space-lg">
            {experience.map((job) => {
              const site = job.links[0]?.url;
              return (
                <li className="cv-job flex flex-col gap-space-xs" key={job.id}>
                  <div className="cv-entry-head flex flex-wrap items-baseline justify-between gap-x-space-md">
                    <h3 className="cv-entry-title type-h3 text-on-surface">
                      {job.role}
                      <span className="cv-company"> · {job.company}</span>
                      {site === undefined ? null : (
                        <span className="cv-meta">
                          {" · "}
                          <BareLink url={site} />
                        </span>
                      )}
                    </h3>
                    <p className="cv-meta type-body-sm">
                      <DateRange dates={job.dates} />
                    </p>
                  </div>
                  <p className="cv-desc type-body text-secondary">
                    <RichText origin={siteUrl}>{job.description}</RichText>
                  </p>
                  <ul className="cv-bullets list-square flex flex-col gap-1 type-body-sm text-secondary">
                    {job.bullets.map((b) => (
                      <li key={b}>
                        <RichText origin={siteUrl}>{b}</RichText>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </CvSection>

        <CvSection title="Projects">
          <ul className="cv-projects flex flex-col gap-space-md">
            {selectedProjects.slice(0, CV_PROJECTS).map((p) => (
              <li key={p.id}>
                <CvProject project={p} />
              </li>
            ))}
          </ul>
        </CvSection>

        <CvSection title="Education">
          <ol className="flex flex-col gap-space-sm">
            {education.education.map((e) => (
              <li
                className="cv-edu cv-entry-head flex flex-wrap items-baseline justify-between gap-x-space-md"
                key={e.school}
              >
                <div>
                  <h3 className="cv-entry-title type-h3 text-on-surface">
                    {e.school}
                  </h3>
                  <p className="type-body-sm text-secondary">{e.degree}</p>
                </div>
                <p className="cv-meta type-body-sm">
                  <DateRange dates={e.dates} /> · {e.location}
                </p>
              </li>
            ))}
          </ol>
        </CvSection>

        <CvSection title="Languages">
          <p className="type-body-sm text-secondary">
            {education.languages.map((l, i) => (
              <span key={l.name}>
                {i > 0 ? " · " : null}
                <strong className="text-on-surface">{l.name}</strong> ({l.level}
                )
              </span>
            ))}
          </p>
        </CvSection>

        <CvSection title="Interests">
          <p className="type-body-sm text-secondary">
            <RichText origin={siteUrl}>{education.interests}</RichText>
          </p>
        </CvSection>
      </article>
    </main>
  );
}
