import { notFound } from "next/navigation";

import { projectMarkdown } from "~/lib/catalogue";
import { projectById, projects } from "~/lib/content";
import { markdownResponse } from "~/lib/response";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}

// Reached as /work/<slug>.md through the rewrite in next.config.ts.
export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const project = projectById.get(slug);
  if (project === undefined) {
    notFound();
  }
  return markdownResponse(projectMarkdown(project));
}
