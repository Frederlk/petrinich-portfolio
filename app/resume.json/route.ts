import { jsonResume } from "~/lib/structured-data";

export function GET() {
  return Response.json(jsonResume());
}
