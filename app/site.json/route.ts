import { siteJson } from "~/lib/catalogue";

export function GET() {
  return Response.json(siteJson());
}
