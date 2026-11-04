import { ExperienceEntry } from "~/components/layout/experience-entry";
import { SectionHeader } from "~/components/layout/section-header";

import { experience } from "~/lib/content";

export function Experience() {
  return (
    <section className="container pb-space-2xl sm:pb-space-3xl" id="experience">
      <SectionHeader title="Recent experience" />
      <div className="flex flex-col border-b border-surface-container-high">
        {experience.map((job) => (
          <ExperienceEntry job={job} key={job.id} />
        ))}
      </div>
    </section>
  );
}
