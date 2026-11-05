import { ImageResponse } from "next/og";

import { profile } from "~/lib/content";
import { coreTechs } from "~/lib/core-stack";
import {
  KIND_LABELS,
  ROLE_LABELS,
  WORK_KIND_LABELS,
  WORK_ROLE_LABELS,
} from "~/lib/labels";
import { MARKER, OG, OG_SIZE, ogAssets, ogLabel as label } from "~/lib/og";
import { siteUrl } from "~/lib/site-url";
import { bare } from "~/lib/url";
import { WORK_PAGES, pageSubject } from "~/lib/work-pages";

// Each /work page's social card: the project's name, year, kind, my part and core stack in the site's frame, so a shared project link no longer previews as the generic site card.
// oxlint-disable shadcn/no-inline-styles

export const alt = "Project card";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return WORK_PAGES.map((p) => ({ slug: p.id }));
}

// The page title steps down the same way (`titleFit` on the page): a one-word name fills the card, a long one wraps onto two lines.
const nameSize = (name: string) => {
  if (name.length <= 10) {
    return 132;
  }
  return name.length <= 18 ? 104 : 76;
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const subject = pageSubject(slug);
  const { fonts, logo } = await ogAssets();
  const name = subject?.project.name ?? profile.name;
  // Keyed by the name up to the word, which stays unique when a word repeats.
  const words = name.split(" ").map((text, i, all) => ({
    key: all.slice(0, i + 1).join(" "),
    last: i === all.length - 1,
    text,
  }));
  const facts =
    subject === undefined
      ? []
      : [
          subject.project.year === null ? null : String(subject.project.year),
          subject.origin === "project"
            ? KIND_LABELS[subject.project.kind]
            : WORK_KIND_LABELS[subject.origin],
          subject.role === "contributor"
            ? WORK_ROLE_LABELS.contributor
            : ROLE_LABELS[subject.role],
        ].filter((f) => f !== null);
  const stack = coreTechs(subject?.project.stack ?? [])
    .slice(0, 5)
    .map((t) => t.name);

  return new ImageResponse(
    <div
      style={{
        background: OG.surface,
        display: "flex",
        height: "100%",
        padding: 48,
        width: "100%",
      }}
    >
      <div
        style={{
          border: `1px solid ${OG.hairline}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 48,
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div style={{ ...label, display: "flex", gap: 16 }}>
            <span style={{ color: OG.vermilion }}>{MARKER}</span>
            <span>{`${bare(siteUrl)}/work`}</span>
          </div>
          {/* oxlint-disable-next-line nextjs/no-img-element */}
          <img alt="" height={64} src={logo} width={64} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              color: OG.onSurface,
              display: "flex",
              columnGap: "0.25em",
              flexWrap: "wrap",
              fontFamily: "Display",
              fontSize: nameSize(name),
              letterSpacing: "-0.01em",
              lineHeight: 0.92,
              textTransform: "uppercase",
            }}
          >
            {/* One flex item per word, the accent dot inside the last one, so a wrapped name never leaves the dot alone on a line. */}
            {words.map((word) => (
              <span key={word.key} style={{ display: "flex" }}>
                {word.text}
                {word.last && !/[!?]$/.test(name) ? (
                  <span style={{ color: OG.vermilion }}>.</span>
                ) : null}
              </span>
            ))}
          </div>
          {facts.length === 0 ? null : (
            <div style={{ ...label, display: "flex", gap: 16 }}>
              {facts.map((f, i) => (
                <span key={f} style={{ display: "flex", gap: 16 }}>
                  {i === 0 ? null : (
                    <span style={{ color: OG.vermilion }}>·</span>
                  )}
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            alignItems: "center",
            borderTop: `1px solid ${OG.hairline}`,
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {stack.map((t) => (
              <span
                key={t}
                style={{
                  ...label,
                  border: `1px solid ${OG.hairline}`,
                  color: OG.vermilion,
                  fontSize: 18,
                  padding: "6px 12px",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <span style={{ ...label, fontSize: 18 }}>{profile.name}</span>
        </div>
      </div>
    </div>,
    { ...size, fonts: [...fonts] }
  );
}
