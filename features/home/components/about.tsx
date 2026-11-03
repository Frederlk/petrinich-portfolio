import { SectionHeader } from "~/components/layout/section-header";
import { RichText } from "~/components/rich-text";

import { education, profile } from "~/lib/content";

const row =
  "reveal grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-space-md border-b border-surface-container-high py-space-sm first:pt-0 last:border-b-0";

// The summary as a lead paragraph with technology links, and the background (education, languages, interests) as a ruled label and value list that fills the rest of the row to the container edge.
export function About() {
  return (
    <section className="container pb-space-3xl" id="about">
      <SectionHeader title="About" />
      <div className="grid grid-cols-1 gap-y-space-lg lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] lg:gap-x-space-2xl">
        <p className="reveal max-w-prose type-lead text-secondary">
          <RichText>{profile.summary}</RichText>
        </p>
        <dl>
          {education.education.map((e) => (
            <div className={row} key={e.school}>
              <dt className="type-label text-secondary">Education</dt>
              <dd className="type-body-sm text-on-surface">
                {e.school}
                <span className="block text-secondary">
                  {e.degree} · {e.dates}
                </span>
              </dd>
            </div>
          ))}
          <div className={row}>
            <dt className="type-label text-secondary">Languages</dt>
            <dd className="type-body-sm text-on-surface">
              {education.languages
                .map((l) => `${l.name} (${l.level})`)
                .join(", ")}
            </dd>
          </div>
          <div className={row}>
            <dt className="type-label text-secondary">Interests</dt>
            <dd className="type-body-sm text-secondary">
              <RichText>{education.interests}</RichText>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
