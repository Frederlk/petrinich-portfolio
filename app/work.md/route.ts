import { workMarkdown } from "~/lib/catalogue";
import { markdownResponse } from "~/lib/response";

export function GET() {
  return markdownResponse(workMarkdown());
}
