import { llmsFullTxt } from "~/lib/markdown";

export function GET() {
  return new Response(llmsFullTxt(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
