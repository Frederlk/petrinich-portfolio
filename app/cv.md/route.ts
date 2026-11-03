import { cvMarkdown } from "~/lib/markdown";

export function GET() {
  return new Response(cvMarkdown(), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
