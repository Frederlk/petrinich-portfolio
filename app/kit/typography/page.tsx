import { notFound } from "next/navigation";

import { SectionHeader } from "~/components/layout/section-header";
import { RichText } from "~/components/rich-text";
import { CtaLink } from "~/components/ui/cta-link";

import { siteNumbers } from "~/lib/content";

import { env } from "~/env";

import { ComputedSpec } from "./computed-spec";

// One row per role. The class names are literals so Tailwind sees them.
const ROLES = [
  {
    cls: "type-display",
    name: "display",
    sample: "Sergey Petrinich",
    use: "The hero name and the page title of /work. One per page, never inside a card.",
  },
  {
    cls: "type-h1",
    name: "h1",
    sample: "Open to full-time, contract and freelance work",
    use: "A page title or the closing statement of a page.",
  },
  {
    cls: "type-h2 uppercase",
    name: "h2",
    sample: "Selected work",
    use: "Section headings (add uppercase) and the statement under a page title (leave it off).",
  },
  {
    cls: "type-h3 uppercase",
    name: "h3",
    sample: "Lead Full-Stack Developer",
    use: "Item, card, row and column titles. Add uppercase for a catalog title; names that keep their case (a technology, a company) leave it off.",
  },
  {
    cls: "type-lead",
    name: "lead",
    sample:
      "Lead full-stack developer building production web apps, from design handoff to launch and everything behind it.",
    use: "The intro paragraph of a page or section. Pair with max-w-prose.",
  },
  {
    cls: "type-body",
    name: "body",
    sample:
      "Self-employed client work next to UX MIND: marketing sites and a streaming platform built end to end, plus fixes and hosting for existing sites.",
    use: "Default running text. Paragraphs take max-w-prose.",
  },
  {
    cls: "type-body-sm",
    name: "body-sm",
    sample: "Service for discovering places in a city, with an iOS app.",
    use: "Secondary prose: table summaries, captions, field values.",
  },
  {
    cls: "type-label",
    name: "label",
    sample: "Education",
    use: "Field names, column headers and eyebrows. Mono caps.",
  },
  {
    cls: "type-meta",
    name: "meta",
    sample: "2026 · Sole · Next.js, React, TypeScript",
    use: "Years, dates, counts, roles and tags. Tabular figures.",
  },
  {
    cls: "type-code",
    name: "code",
    sample: "ux-mind-helpers",
    use: "Inline code and mono text inside prose.",
  },
  {
    cls: "type-button",
    name: "button",
    sample: "View work",
    use: "Buttons, calls to action, navigation, tabs and form controls.",
  },
  {
    cls: "type-stat",
    name: "stat",
    sample: "107",
    use: "A key figure set large, with its caption in body-sm.",
  },
] as const;

const PAIRS = [
  { cls: "text-on-surface", label: "on-surface" },
  { cls: "text-on-surface-variant", label: "on-surface-variant" },
  { cls: "text-secondary", label: "secondary" },
  { cls: "text-tertiary", label: "tertiary" },
  { cls: "text-tertiary-container", label: "tertiary-container" },
  { cls: "text-primary", label: "primary" },
  { cls: "text-primary-container", label: "primary-container" },
] as const;

function Block({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="border-t border-surface-container-high py-space-xl">
      <h2 className="mb-space-lg type-label text-primary-container">{title}</h2>
      {children}
    </section>
  );
}

export default function TypographyKit() {
  // Development only: the route answers 404 in a production build and is in no sitemap, nav or llms file.
  if (env.NODE_ENV !== "development") {
    notFound();
  }
  return (
    <main className="min-h-screen w-full bg-surface">
      <div className="container pt-space-xl pb-space-3xl">
        <h1 className="mb-space-sm type-h1 text-on-surface">Typography kit</h1>
        <p className="mb-space-xl max-w-prose type-lead text-secondary">
          Twelve roles from two families. Each role is one utility in
          styles/typography.css; the lines under each sample are what the
          browser computed.
        </p>

        <Block title="Font stacks">
          <div className="grid gap-space-lg md:grid-cols-2">
            <div>
              <p className="type-label text-secondary">
                Archivo Narrow · text and display
              </p>
              <p className="mt-space-sm type-h2 text-on-surface">
                Aa Bb Cc 0123456789
              </p>
            </div>
            <div>
              <p className="type-label text-secondary">
                JetBrains Mono · labels and data
              </p>
              <p className="mt-space-sm type-code text-on-surface">
                Aa Bb Cc 0123456789
              </p>
            </div>
          </div>
        </Block>

        <Block title="Roles">
          <ul className="divide-y divide-surface-container-high">
            {ROLES.map((role) => (
              <li
                className="grid gap-space-md py-space-lg lg:grid-cols-[12rem_minmax(0,1fr)]"
                key={role.name}
              >
                <div>
                  <p className="type-label text-on-surface">{role.name}</p>
                  <p className="mt-space-xs type-code text-secondary">
                    {role.cls}
                  </p>
                </div>
                <div>
                  <ComputedSpec>
                    <p className={`${role.cls} max-w-prose text-on-surface`}>
                      {role.sample}
                    </p>
                  </ComputedSpec>
                  <p className="mt-space-xs max-w-prose type-body-sm text-secondary">
                    {role.use}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Colour pairs on the surface (AA is 4.5:1)">
          <ul className="grid gap-space-md md:grid-cols-2 lg:grid-cols-3">
            {PAIRS.map((pair) => (
              <li key={pair.cls}>
                <ComputedSpec withContrast>
                  <p className={`type-body ${pair.cls}`}>{pair.label}</p>
                </ComputedSpec>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Pattern: page header">
          <header className="flex flex-col justify-between gap-space-lg border-b border-surface-container-high pb-space-lg md:flex-row md:items-end">
            <div className="space-y-space-sm">
              <h2 className="type-h1 text-on-surface">Stack</h2>
              <p className="max-w-prose type-body text-secondary">
                What I build with, grouped by area. The number next to a name is
                how many projects used it.
              </p>
            </div>
            <dl className="flex gap-space-xl">
              {[
                ["27", "Technologies"],
                ["14", "Projects"],
              ].map(([value, label]) => (
                <div className="flex flex-col" key={label}>
                  <dt className="order-2 type-label text-secondary">{label}</dt>
                  <dd className="type-h2 text-on-surface tabular-nums">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </header>
        </Block>

        <Block title="Pattern: section heading with action">
          <SectionHeader
            action={{ href: "/work", label: "All projects" }}
            title="Selected work"
          />
        </Block>

        <Block title="Pattern: ledger row">
          <div className="grid grid-cols-1 items-baseline gap-gutter border-t border-surface-container-high px-space-md py-space-lg md:grid-cols-12">
            <div className="col-span-1 type-meta text-secondary">2026</div>
            <div className="col-span-3 type-h3 text-on-surface uppercase">
              Noaspot
            </div>
            <div className="col-span-4 type-body text-secondary">
              Service for discovering places in a city, with an iOS app and
              semantic search.
            </div>
            <div className="col-span-1 type-meta text-secondary">Sole</div>
            <div className="col-span-3 type-meta text-secondary">
              Hono, Next.js, TypeScript
            </div>
          </div>
        </Block>

        <Block title="Pattern: label and value list">
          <dl className="max-w-xl">
            {[
              ["Education", "School of Business and Management Technology"],
              ["Languages", "English (C1), Russian (Native)"],
              ["Interests", "Tabletop role-playing games, guitar and piano"],
            ].map(([label, value]) => (
              <div
                className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-space-md border-b border-surface-container-high py-space-sm last:border-b-0"
                key={label}
              >
                <dt className="type-label text-secondary">{label}</dt>
                <dd className="type-body-sm text-on-surface">{value}</dd>
              </div>
            ))}
          </dl>
        </Block>

        <Block title="Pattern: stat strip">
          <div className="grid grid-cols-2 divide-x divide-surface-container-high border-y border-surface-container-high lg:grid-cols-4">
            {[
              ["6", "years building production web apps"],
              ["107", "projects, from landing pages to SaaS"],
              ["Remote", "worldwide, Central European Time"],
              ["E2E", "ownership of API, admin and interface"],
            ].map(([value, label]) => (
              <div className="p-space-lg" key={value}>
                <div className="type-stat text-primary-container">{value}</div>
                <div className="mt-space-xs type-body-sm text-secondary">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Pattern: rich-text paragraph with link and emphasis">
          <p className="max-w-prose type-lead text-secondary">
            <RichText>
              {`I run the technical side of client projects: **stack and quality gates** on every new project, built with Next.js and TypeScript, ${siteNumbers.allProjects} projects since ${siteNumbers.since}.`}
            </RichText>
          </p>
        </Block>

        <Block title="Pattern: call to action">
          <div className="flex flex-wrap gap-space-md">
            <CtaLink href="/work" size="lg" variant="primary">
              Contact
            </CtaLink>
            <CtaLink href="/work" size="lg" variant="outline">
              View work
            </CtaLink>
          </div>
        </Block>
      </div>
    </main>
  );
}
