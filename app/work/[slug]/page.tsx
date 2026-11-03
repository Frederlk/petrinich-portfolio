import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { JsonLd } from "~/components/json-ld";
import { LinkPending } from "~/components/layout/link-pending";
import { SectionHeader } from "~/components/layout/section-header";
import { ArrowSlide } from "~/components/motion/arrow-slide";
import {
  NAV_BACK,
  NAV_FORWARD,
  PageTransition,
  ProjectName,
} from "~/components/motion/page-transition";
import { ReadProgress } from "~/components/motion/read-progress";
import { ScreenshotZoom } from "~/components/motion/screenshot-zoom";
import { RichText } from "~/components/rich-text";
import { TechChip } from "~/components/tech-chip";

import { Tip } from "~/ui/tooltip";

import { cn } from "~/lib/cn";
import { projects, techById } from "~/lib/content";
import { coreTechs } from "~/lib/core-stack";
import { featureGroups } from "~/lib/feature-groups";
import {
  DOMAIN_LABELS,
  KIND_LABELS,
  ROLE_LABELS,
  SCOPE_LABELS,
  WORK_ROLE_HINTS,
  WORK_KIND_LABELS,
  WORK_ROLE_LABELS,
} from "~/lib/labels";
import { publicUrl } from "~/lib/project-url";
import { projectPageJsonLd } from "~/lib/structured-data";
import { byName, groupRank, homeGroup } from "~/lib/tech-groups";
import { bare } from "~/lib/url";
import { earlyPages, openSourcePages, pageSubject } from "~/lib/work-pages";

import { workRows } from "~/features/work/work-rows";

import type { Metadata } from "next";
import type { ComponentType } from "react";

type Props = { params: Promise<{ slug: string }> };

// Every real slug is prerendered by generateStaticParams; only an unknown slug renders at request time, and it ends in notFound(). That render may block, so the root layout's URL hooks (the nav links, nuqs) need no Suspense boundary or skeleton here.
export const instant = false;

export function generateStaticParams() {
  return [...projects, ...earlyPages, ...openSourcePages].map((p) => ({
    slug: p.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = pageSubject(slug)?.project;
  if (!project) {
    return {};
  }
  return { description: project.summary, title: project.name };
}

const caseStudyModule = z.object({
  default: z.custom<ComponentType>((v) => typeof v === "function"),
});

// `caseStudy` names `content/case-studies/<id>.mdx`; the import is bundled per file, so a project without one never loads MDX.
async function CaseStudy({ id }: { id: string }) {
  const { default: Content } = caseStudyModule.parse(
    await import(`~/content/case-studies/${id}.mdx`)
  );
  return <Content />;
}

// The Stitch title is 152px at lg for a one-word name; a long name steps down so it wraps into two or three lines, not five. `type-display` carries the three sizes.
function titleFit(name: string) {
  if (name.length <= 10) {
    return "short";
  }
  return name.length <= 18 ? "medium" : "long";
}

const labelOf = (labels: Record<string, string>, key: string) =>
  labels[key] ?? key;

// The first project has no previous and the last no next, so that cell links back to /work in the same shape, muted so it reads as the end of the list and not as a missing project.
function EndCard({ back = false, count }: { back?: boolean; count: number }) {
  return (
    <Link
      className={cn(
        "group row-accent p-space-xl hover:bg-surface-container-low",
        back ? "text-left" : "text-left md:text-right"
      )}
      href="/work"
      transitionTypes={NAV_BACK}
    >
      <div className="type-label text-secondary group-hover:text-primary-container">
        {back ? <ArrowSlide back /> : null}
        All work
        {back ? null : <ArrowSlide />}
      </div>
      <div className="my-space-xs type-h2 text-tertiary uppercase">
        Back to the full list
      </div>
      <div className="type-meta text-secondary">{count} projects</div>
    </Link>
  );
}

const factLabel = "type-label text-secondary";
const factValue = "mt-space-xs type-h3 text-on-surface";
const factNote = "mt-1 type-body-sm text-secondary";

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const subject = pageSubject(slug);
  if (!subject) {
    notFound();
  }
  const { origin, project, role } = subject;
  const url = publicUrl(project);
  // The archive order (newest first): previous is the row above, next the row below. A project walks the projects, an early entry the early work and a contribution the open source, so the lists do not mix.
  const pages = workRows.filter((row) =>
    origin === "project"
      ? row.kind !== "early" && row.kind !== "open-source"
      : row.kind === origin
  );
  const index = pages.findIndex((row) => row.id === project.id);
  const previous = pages[index - 1];
  const next = pages[index + 1];

  // The technologies that define this app, for the Stack tile.
  const core = coreTechs(project.stack);
  // Groups in `GROUP_ORDER` (Core stack first, then alphabetical, as on /stack), alphabetical inside each.
  const stackGroups = [
    ...Map.groupBy(
      project.stack.flatMap((id) => {
        const tech = techById.get(id);
        return tech === undefined ? [] : [tech];
      }),
      homeGroup
    ),
  ]
    .toSorted(([a], [b]) => groupRank(a) - groupRank(b))
    .map(([group, techs]) => [group, techs.toSorted(byName)] as const);

  // What I did sits with the role; what the product is sits under the summary.
  // "estimate" and "advisor" scopes only repeat the role, so no tag for them.
  const tags = project.scope
    .filter((v) => v !== "estimate" && v !== "advisor")
    .map((v) => labelOf(SCOPE_LABELS, v));
  const domains = project.domain.map((v) => labelOf(DOMAIN_LABELS, v));
  const hasRole = project.roleNote !== "" || tags.length > 0;

  return (
    <>
      <PageTransition />
      <main className="min-h-screen w-full bg-surface text-on-surface">
        <ReadProgress />
        <JsonLd data={projectPageJsonLd(project)} />
        <section className="container pt-space-xl pb-space-2xl">
          <div className="mb-space-lg w-full overflow-hidden">
            <ProjectName id={project.id}>
              <h1
                className="type-display break-words text-on-surface select-none"
                data-fit={titleFit(project.name)}
              >
                {project.name}
                {/* A name that already ends in punctuation ("OhBirdie!") takes no accent dot. */}
                {/[!?]$/.test(project.name) ? null : (
                  <span className="text-primary-container">.</span>
                )}
              </h1>
            </ProjectName>
          </div>
          <p
            className={cn(
              "max-w-prose type-lead text-on-surface",
              domains.length > 0 ? "mb-space-sm" : "mb-space-2xl"
            )}
          >
            <RichText>{project.summary}</RichText>
          </p>
          {domains.length === 0 ? null : (
            <p className="mb-space-2xl type-meta text-secondary">
              {domains.join(" · ")}
            </p>
          )}
          <dl className="grid grid-cols-1 border-t border-b border-surface-container-high sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-b border-surface-container-high p-space-lg sm:border-r lg:border-b-0">
              <dt className={factLabel}>Year</dt>
              <dd className={factValue}>{project.year ?? "–"}</dd>
              <dd className={factNote}>
                {origin === "project"
                  ? KIND_LABELS[project.kind]
                  : WORK_KIND_LABELS[origin]}
              </dd>
            </div>
            <div className="border-b border-surface-container-high p-space-lg lg:border-r lg:border-b-0">
              <dt className={factLabel}>My part</dt>
              <dd className={factValue}>
                <Tip label={WORK_ROLE_HINTS[role]}>
                  <span>
                    {role === "contributor"
                      ? WORK_ROLE_LABELS.contributor
                      : ROLE_LABELS[role]}
                  </span>
                </Tip>
              </dd>
            </div>
            <div className="group relative border-b border-surface-container-high p-space-lg hover:bg-surface-container-low sm:border-r sm:border-b-0">
              <dt className={factLabel}>Core stack</dt>
              <dd
                className={cn(factValue, "group-hover:text-primary-container")}
              >
                <a className="after:absolute after:inset-0" href="#stack">
                  {project.stack.length} technologies
                </a>
              </dd>
              <dd className={factNote}>
                {core
                  .slice(0, 4)
                  .map((t) => t.name)
                  .join(", ")}
              </dd>
            </div>
            <div className="min-w-0 p-space-lg">
              <dt className={factLabel}>Website</dt>
              {url === null ? (
                <>
                  <dd className={factValue}>Not public</dd>
                  <dd className={factNote}>
                    {project.anonymous ? "Confidential" : "No public link"}
                  </dd>
                </>
              ) : (
                <dd className={factValue}>
                  <a
                    className="group flex min-w-0 items-center hover:text-primary-container"
                    href={url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="truncate link-draw">
                      {bare(url).replace(/^www\./, "")}
                    </span>
                    <ArrowSlide className="shrink-0 align-middle" />
                  </a>
                </dd>
              )}
            </div>
          </dl>
        </section>

        {hasRole ? (
          <section className="container pb-space-2xl">
            <SectionHeader title="My role" />
            <div className="reveal max-w-4xl space-y-space-md">
              {project.roleNote === "" ? null : (
                <p className="type-lead text-secondary">
                  <RichText>{project.roleNote}</RichText>
                </p>
              )}
              {tags.length === 0 ? null : (
                <p className="type-meta text-secondary">{tags.join(" · ")}</p>
              )}
            </div>
          </section>
        ) : null}

        {project.features.length > 0 ? (
          <section className="container pb-space-2xl">
            <SectionHeader title="Capabilities" />
            <div className="grid gap-x-space-xl gap-y-space-lg lg:grid-cols-2">
              {featureGroups(project).map((group) => (
                <div className="reveal" key={group.title ?? group.items[0]}>
                  {group.title === null ? null : (
                    <h3 className="mb-space-sm border-b border-surface-container-high pb-space-xs type-label text-secondary">
                      {group.title}
                    </h3>
                  )}
                  <ul className="list-square space-y-space-sm type-body text-secondary">
                    {group.items.map((f) => (
                      <li key={f}>
                        <RichText>{f}</RichText>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {project.caseStudy === null ? null : (
          <div className="container pb-space-2xl">
            <div className="max-w-4xl">
              <CaseStudy id={project.caseStudy} />
            </div>
          </div>
        )}

        <section
          className="container scroll-mt-space-lg pb-space-2xl"
          id="stack"
        >
          <SectionHeader title="Core stack" />
          <div className="space-y-space-lg">
            {stackGroups.map(([group, techs]) => (
              <div className="reveal" key={group}>
                <h3 className="mb-space-sm border-b border-surface-container-high pb-space-xs type-label text-secondary">
                  {group}
                </h3>
                <ul className="flex flex-wrap gap-space-sm">
                  {techs.map((t) => (
                    <li key={t.id}>
                      <TechChip href={`/work?tech=${t.id}`} name={t.name} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {project.media.length === 0 ? null : (
          <section className="container pb-space-2xl">
            <SectionHeader title="Screenshots" />
            <div className="space-y-space-lg">
              {project.media.map((src) => (
                <div
                  className="reveal border border-surface-container-high bg-surface-container-lowest"
                  key={src}
                >
                  <ScreenshotZoom
                    alt={`Screenshot of ${project.name}`}
                    src={src}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <nav aria-label="Projects" className="container pb-space-3xl">
          <div className="reveal grid grid-cols-1 divide-y divide-surface-container-high border border-surface-container-high bg-surface-container-lowest md:grid-cols-2 md:divide-x md:divide-y-0">
            {previous === undefined ? (
              <EndCard back count={pages.length} />
            ) : (
              <Link
                className="group row-accent p-space-xl hover:bg-surface-container-low"
                href={`/work/${previous.id}`}
                transitionTypes={NAV_BACK}
              >
                <div className="type-label text-secondary group-hover:text-primary-container">
                  <ArrowSlide back />
                  Previous
                </div>
                <ProjectName id={previous.id}>
                  <div className="my-space-xs type-h2 text-on-surface uppercase">
                    {previous.name}
                  </div>
                </ProjectName>
                <div className="type-meta text-secondary">
                  {previous.year ?? "–"} · {WORK_ROLE_LABELS[previous.role]}
                </div>
                <LinkPending />
              </Link>
            )}
            {next === undefined ? (
              <EndCard count={pages.length} />
            ) : (
              <Link
                className="group row-accent p-space-xl text-left hover:bg-surface-container-low md:text-right"
                href={`/work/${next.id}`}
                transitionTypes={NAV_FORWARD}
              >
                <div className="type-label text-secondary group-hover:text-primary-container">
                  Next
                  <ArrowSlide />
                </div>
                <ProjectName id={next.id}>
                  <div className="my-space-xs type-h2 text-on-surface uppercase">
                    {next.name}
                  </div>
                </ProjectName>
                <div className="type-meta text-secondary">
                  {next.year ?? "–"} · {WORK_ROLE_LABELS[next.role]}
                </div>
                <LinkPending />
              </Link>
            )}
          </div>
        </nav>
      </main>
    </>
  );
}
