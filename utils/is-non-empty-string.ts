/** A string that is known to have at least one character. The brand keeps the guard one-sided: a plain `string` that fails the check stays a `string` in the false branch (it may be `""`), where a bare `value is string` would narrow it to `never`. */
export type NonEmptyString = string & { readonly __nonEmpty: true };

/** A string with at least one character, narrowed so a `string | null | undefined` can be used as a string afterwards. `""`, `null`, `undefined` and every non-string are rejected, which is the truthiness test `strict-boolean-expressions` forbids, written out. */
export const isNonEmptyString = (value: unknown): value is NonEmptyString =>
  typeof value === "string" && value !== "";
