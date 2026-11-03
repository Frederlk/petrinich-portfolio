import { textResponse } from "~/lib/response";
import { humansTxt } from "~/lib/well-known";

export function GET() {
  return textResponse(humansTxt());
}
