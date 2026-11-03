import { StackBadges } from "~/components/stack-badges";

import { Tip } from "~/ui/tooltip";

import { cn } from "~/lib/cn";
import { coreTechs } from "~/lib/core-stack";
import { ROLE_SHORT, WORK_ROLE_HINTS } from "~/lib/labels";
import { publicUrl } from "~/lib/project-url";
import { bare } from "~/lib/url";

import type { Project } from "~/schemas/projects";

import { BUILD_LABELS } from "~/features/work/work-types";

// One Selected-work row, shared by the home page and the CV: year, name, summary, role and its core technologies as tags (`coreTechs`, the same list a /work row shows), on the ledger grid of components/layout/ledger-header.tsx. The home page wraps it in a link to the project, so the row holds no link of its own; the CV passes the site `origin`, which links the name to the project page (absolute, because the PDF is printed from a local server) and adds the project's public address after the summary. `clamp` cuts the summary at two lines. The cv-p-* classes are the print sheet's hooks (styles/cv-print.css).
export function SelectedProject({
  clamp = false,
  origin,
  project,
}: {
  clamp?: boolean;
  origin?: string;
  project: Project;
}) {
  const url = origin === undefined ? null : publicUrl(project);
  return (
    <div className="cv-project row-shift grid grid-cols-1 items-baseline gap-gutter px-space-md py-space-lg md:grid-cols-12">
      <div className="cv-p-year col-span-1 type-meta text-secondary group-hover:text-primary-container">
        {project.year ?? "–"}
      </div>
      <h3 className="cv-p-name col-span-3 type-h3 text-on-surface uppercase group-hover:text-primary-container">
        {origin === undefined ? (
          project.name
        ) : (
          <a
            className="hover:text-primary-container"
            data-bare
            href={`${origin}/work/${project.id}`}
          >
            {project.name}
          </a>
        )}
      </h3>
      <p
        className={cn(
          "cv-p-sum col-span-4 type-body text-secondary group-hover:text-on-surface",
          clamp && "line-clamp-2"
        )}
      >
        <span className="cv-p-sum-text">{project.summary}</span>
        {url === null ? null : (
          <>
            {" "}
            <a
              className="cv-p-url text-on-surface underline decoration-surface-container-highest underline-offset-2 hover:text-primary-container"
              data-bare
              href={url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {bare(url)}
            </a>
          </>
        )}
      </p>
      <div className="cv-p-role col-span-1 type-meta text-secondary group-hover:text-on-surface">
        <Tip label={WORK_ROLE_HINTS[project.role]}>
          <span>{ROLE_SHORT[project.role]}</span>
        </Tip>
      </div>
      <StackBadges
        className="col-span-3"
        lead={project.aiOrchestrated ? BUILD_LABELS.ai : undefined}
        names={coreTechs(project.stack).map((t) => t.name)}
      />
    </div>
  );
}
