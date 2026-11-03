import {
  BriefcaseIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  CodeIcon,
  DownloadSimpleIcon,
  FolderSimpleIcon,
  GlobeIcon,
  GraduationCapIcon,
  HeartIcon,
  TranslateIcon,
  EnvelopeSimpleIcon,
  TelegramLogoIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";

import { JsonLd } from "~/components/json-ld";
import { KeyStats } from "~/components/key-stats";
import {
  LEDGER_COLUMNS,
  LedgerHeader,
} from "~/components/layout/ledger-header";
import { Portrait } from "~/components/layout/portrait";
import { RichText, TechLinks } from "~/components/rich-text";
import { SelectedProject } from "~/components/selected-project";

import { CV_PDF_NAME, CV_PDF_PATH, email } from "~/lib/contact";
import {
  cvSkillGroups,
  education,
  experience,
  profile,
  siteNumbers,
} from "~/lib/content";
import { parseDateRange } from "~/lib/dates";
import { selectedProjects } from "~/lib/featured";
import { siteUrl } from "~/lib/site-url";
import { profilePageJsonLd } from "~/lib/structured-data";
import { bare } from "~/lib/url";

import "~/styles/cv-print.css";

import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

type Icon = typeof UserIcon;

export const metadata: Metadata = {
  description: `${profile.name}: ${profile.title}. ${siteNumbers.years} years of experience.`,
  title: "CV",
};

const [place = profile.location, zone = ""] = profile.location.split(" · ");
const contactIcons = new Map<string, Icon>([
  ["E-Mail", EnvelopeSimpleIcon],
  ["GitHub", GithubLogoIcon],
  ["LinkedIn", LinkedinLogoIcon],
  ["Portfolio", GlobeIcon],
  ["Telegram", TelegramLogoIcon],
]);

// The running footer of every printed page, so a loose sheet leads back to its owner. @page margin boxes take their text from CSS only, so the owner, address and site come from the content files into a style element; the page number is a CSS counter. JSON.stringify makes a valid CSS string and "<" is escaped so the text cannot close the tag.
const footerRule =
  `@media print{@page{@bottom-left{content:${JSON.stringify(`${profile.name} · ${email} · ${bare(siteUrl)}`)}}@bottom-right{content:"Page " counter(page) " of " counter(pages)}}}`.replaceAll(
    "<",
    "\\3c "
  );

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

// The id makes every section a hash target (/cv#experience); the global scroll offset keeps its title under the sticky bar. The icon is a decorative marker beside the title; the title text carries the meaning.
function CvSection({
  children,
  className,
  icon: Icon,
  title,
}: PropsWithChildren<{
  className?: string;
  icon: Icon;
  title: string;
}>) {
  const id = title.toLowerCase().replaceAll(" ", "-");
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="cv-section flex scroll-mt-14 flex-col gap-space-md border-b border-surface-container-high py-space-lg last:border-b-0"
      id={id}
    >
      <h2
        className="cv-h2 flex items-center gap-space-sm type-label text-secondary"
        id={`${id}-title`}
      >
        <Icon aria-hidden className="cv-h2-icon size-4 shrink-0" />
        {title}
      </h2>
      <div className={className}>{children}</div>
    </section>
  );
}

// Technology links and project links are absolute because the PDF is printed from a local server and a relative href would become a localhost address; data-bare keeps the print sheet from spelling the address out after the name. /cv redirects to the home page; public/Sergey-Petrinich-CV.pdf is this page printed from /cv?print=1 with styles/cv-print.css; regenerate it with `bun cv:pdf` when the content changes.
export default function CvPage() {
  return (
    <main className="cv-page min-h-screen w-full bg-surface">
      <JsonLd data={profilePageJsonLd("/cv")} />
      {/* oxlint-disable-next-line shadcn/no-inline-styles -- @page margin-box text can only come from CSS, here built from the content files */}
      <style
        // oxlint-disable-next-line react/no-danger -- "<" is escaped and the text is a JSON string
        dangerouslySetInnerHTML={{ __html: footerRule }}
      />
      <article className="mx-auto w-full max-w-275 px-margin-mobile pb-space-lg text-on-surface md:px-margin">
        <div
          className="no-print sticky top-16 z-30 flex w-full flex-col items-start justify-between gap-space-sm border-b border-surface-container-high bg-surface py-space-md md:flex-row md:items-center print:hidden"
          data-cv-bar
        >
          <p className="type-meta text-secondary">Also available as a PDF.</p>
          <a
            className="flex w-full items-center justify-center gap-2 border border-primary-container px-space-md py-space-xs type-button text-primary-container transition-colors duration-200 ease-(--ease-enter) hover:bg-primary-container hover:text-on-primary-container md:w-auto"
            download={CV_PDF_NAME}
            href={CV_PDF_PATH}
          >
            <DownloadSimpleIcon aria-hidden className="size-4" />
            Download CV (PDF)
          </a>
        </div>

        <header className="cv-header border-b border-surface-container-high pt-space-xl pb-space-lg">
          <div className="cv-header-top grid grid-cols-1 items-start gap-space-lg sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-gutter">
            <div className="cv-id flex min-w-0 flex-col">
              <h1 className="cv-name m-0 type-display text-on-surface">
                {profile.name}
              </h1>
              <p className="cv-title mt-space-sm type-h3 text-on-surface-variant uppercase">
                {profile.title}
              </p>
              <dl className="cv-facts mt-space-lg flex max-w-md flex-col gap-space-xs type-body-sm text-on-surface">
                <div className="flex items-baseline gap-space-md border-b border-surface-container pb-1">
                  <dt className="w-24 shrink-0 type-label text-secondary">
                    Location
                  </dt>
                  <dd>{place}</dd>
                </div>
                <div className="flex items-baseline gap-space-md border-b border-surface-container pb-1">
                  <dt className="w-24 shrink-0 type-label text-secondary">
                    Time zone
                  </dt>
                  <dd>{zone}</dd>
                </div>
                <div className="flex items-baseline gap-space-md">
                  <dt className="w-24 shrink-0 type-label text-secondary">
                    Experience
                  </dt>
                  <dd>{siteNumbers.years} years</dd>
                </div>
              </dl>
            </div>
            <Portrait
              className="cv-photo order-first size-28 sm:order-last sm:size-40"
              priority
              sizes="160px"
            />
          </div>
          <ul className="cv-contacts mt-space-lg grid grid-cols-1 gap-x-space-lg gap-y-space-sm border-t border-surface-container pt-space-md type-body-sm sm:grid-cols-2">
            {profile.contacts.map((c) => {
              const Icon = contactIcons.get(c.label) ?? GlobeIcon;
              return (
                <li key={c.label}>
                  <a
                    className="flex items-baseline gap-space-sm text-on-surface transition-colors duration-200 ease-(--ease-enter) hover:text-primary-container"
                    data-bare
                    href={c.url}
                    rel="noopener"
                  >
                    <Icon
                      aria-hidden
                      className="cv-contact-icon size-4 shrink-0 self-center text-secondary"
                    />
                    <span className="cv-contact-label type-label text-secondary">
                      {c.label}:
                    </span>
                    <span className="min-w-0 break-all sm:break-normal">
                      {bare(c.url)}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </header>

        <KeyStats
          className="border-b border-surface-container-high py-space-lg"
          links={false}
        />

        <CvSection className="space-y-space-md" icon={UserIcon} title="Summary">
          <p className="cv-summary max-w-4xl type-lead text-on-surface">
            <RichText origin={siteUrl}>{profile.summary}</RichText>
          </p>
        </CvSection>

        <CvSection icon={CodeIcon} title="Core skills">
          <dl className="cv-skills grid grid-cols-1 gap-x-gutter gap-y-space-md md:grid-cols-2 lg:grid-cols-3">
            {cvSkillGroups.map((g) => (
              <div
                className="cv-skill flex flex-col space-y-space-xs"
                key={g.name}
              >
                <dt className="cv-skill-name border-b border-surface-container pb-1 type-label text-on-surface">
                  {g.name}
                </dt>
                <dd className="cv-skill-items pt-1 type-body-sm text-on-surface-variant">
                  <TechLinks names={g.items} origin={siteUrl} />
                </dd>
              </div>
            ))}
          </dl>
          <p className="cv-skills-all mt-space-md type-body-sm text-secondary">
            All {siteNumbers.technologies} technologies:{" "}
            <a
              className="cv-p-url text-on-surface underline decoration-surface-container-highest underline-offset-2 hover:text-primary-container"
              data-bare
              href={`${siteUrl}/stack`}
            >
              {bare(`${siteUrl}/stack`)}
            </a>
          </p>
        </CvSection>

        <CvSection icon={BriefcaseIcon} title="Recent experience">
          <ol className="cv-jobs flex flex-col space-y-space-xl">
            {experience.map((job) => {
              const active = parseDateRange(job.dates).end?.text === "Present";
              return (
                <li
                  className="cv-job flex flex-col border-b border-surface-container pb-space-lg last:border-b-0"
                  key={job.id}
                >
                  <div className="cv-job-head flex flex-col gap-1">
                    <h3 className="cv-job-title type-h3 text-on-surface uppercase">
                      {job.role}
                      <span className="text-secondary"> · {job.company}</span>
                    </h3>
                    <p
                      className={`cv-dates type-label ${active ? "cv-dates-now text-primary-container" : "text-secondary"}`}
                    >
                      <DateRange dates={job.dates} />
                    </p>
                  </div>
                  <p className="cv-desc cv-measure mt-space-sm mb-space-sm type-body text-secondary">
                    <RichText origin={siteUrl}>{job.description}</RichText>
                  </p>
                  <ul className="cv-bullets cv-measure list-square mb-space-md space-y-space-xs type-body-sm text-secondary">
                    {job.bullets.map((b) => (
                      <li key={b}>
                        <RichText origin={siteUrl}>{b}</RichText>
                      </li>
                    ))}
                  </ul>
                  <p className="cv-stack flex flex-wrap items-baseline gap-x-space-sm pt-space-xs type-body-sm text-on-surface-variant">
                    <span className="cv-stack-label type-label text-secondary">
                      Stack:
                    </span>
                    <span>
                      <TechLinks names={job.stack} origin={siteUrl} />
                    </span>
                  </p>
                </li>
              );
            })}
          </ol>
        </CvSection>

        <CvSection
          className="flex flex-col"
          icon={FolderSimpleIcon}
          title="Selected projects"
        >
          <LedgerHeader
            className="no-print hidden md:grid"
            columns={LEDGER_COLUMNS}
          />
          <ul className="cv-projects w-full border-b border-surface-container-high">
            {selectedProjects.map((p) => (
              <li className="border-t border-surface-container-high" key={p.id}>
                <SelectedProject origin={siteUrl} project={p} />
              </li>
            ))}
          </ul>
        </CvSection>

        <CvSection
          className="flex flex-col space-y-space-md"
          icon={GraduationCapIcon}
          title="Education"
        >
          <ol className="flex flex-col space-y-space-md">
            {education.education.map((e) => (
              <li
                className="cv-edu flex flex-col justify-between md:flex-row md:items-baseline"
                key={e.school}
              >
                <div>
                  <h3 className="type-h3 text-on-surface uppercase">
                    {e.school}
                  </h3>
                  <p className="mt-0.5 type-body-sm text-on-surface-variant">
                    {e.degree}
                  </p>
                </div>
                <p className="cv-dates mt-1 type-label text-secondary md:mt-0">
                  <DateRange dates={e.dates} /> · {e.location}
                </p>
              </li>
            ))}
          </ol>
        </CvSection>

        <CvSection icon={TranslateIcon} title="Languages">
          <ul className="cv-langs flex flex-wrap gap-x-space-xl gap-y-space-sm">
            {education.languages.map((l) => (
              <li
                className="border-l border-surface-container-high pl-space-md type-body"
                key={l.name}
              >
                <span className="font-semibold text-on-surface">{l.name}</span>{" "}
                <span className="text-secondary">({l.level})</span>
              </li>
            ))}
          </ul>
        </CvSection>

        <CvSection
          className="space-y-space-md"
          icon={HeartIcon}
          title="Interests"
        >
          <p className="cv-interests max-w-4xl type-body text-secondary">
            <RichText origin={siteUrl}>{education.interests}</RichText>
          </p>
        </CvSection>
      </article>
    </main>
  );
}
