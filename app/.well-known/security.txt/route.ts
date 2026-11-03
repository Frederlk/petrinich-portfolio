import { textResponse } from "~/lib/response";
import { securityTxt } from "~/lib/well-known";

export function GET() {
  return textResponse(securityTxt());
}
