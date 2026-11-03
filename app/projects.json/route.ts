import { projectsJson } from "~/lib/catalogue";

export function GET() {
  return Response.json(projectsJson());
}
