import { notFound } from "next/navigation";

import { workPageMarkdown } from "~/lib/catalogue";
import { markdownResponse } from "~/lib/response";
import { WORK_PAGES } from "~/lib/work-pages";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return WORK_PAGES.map((p) => ({ slug: p.id }));
}

// Reached as /work/<slug>.md through the rewrite in next.config.ts.
export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const markdown = workPageMarkdown(slug);
  if (markdown === null) {
    notFound();
  }
  return markdownResponse(markdown);
}
