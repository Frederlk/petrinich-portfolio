/** A non-null, non-array object — the shape `JSON.parse` returns for a JSON object, narrowed so its keys can be read as `unknown`. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
