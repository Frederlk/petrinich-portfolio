import { technologiesJson } from "~/lib/catalogue";

export function GET() {
  return Response.json(technologiesJson());
}
