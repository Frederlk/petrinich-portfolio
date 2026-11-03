import Ajv from "ajv";
// Validates resume.json against the official JSON Resume schema, fetched fresh each run (not committed).
// Usage: `bun resume:validate <url-or-file>`, for example a running server's http://localhost:4224/resume.json or the built `.next/server/app/resume.json.body`.
import { readFile } from "node:fs/promises";
import { z } from "zod";

const SCHEMA_URL =
  "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json";
const source = process.argv[2];
if (source === undefined) {
  console.error("Usage: bun resume:validate <url-or-file>");
  process.exit(2);
}

const json = z.record(z.string(), z.unknown());
const [schema, resume] = await Promise.all([
  fetch(SCHEMA_URL).then(async (r) => json.parse(await r.json())),
  (source.startsWith("http")
    ? fetch(source).then(async (r) => await r.text())
    : readFile(source, "utf8")
  ).then((text) => json.parse(JSON.parse(text))),
]);

// The schema declares draft-04, which Ajv 8 does not ship; it validates fine as the default draft.
schema.$schema = undefined;
const ajv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
const validate = ajv.compile(schema);
if (validate(resume)) {
  console.log("resume.json is valid against the JSON Resume schema");
} else {
  console.error(validate.errors);
  process.exit(1);
}
