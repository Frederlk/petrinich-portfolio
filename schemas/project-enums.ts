// Plain constants, no Zod, so the client-side archive filters can use them without shipping the schema library.
export const PROJECT_KINDS = [
  "client",
  "freelance",
  "internal",
  "personal",
] as const;
export const PROJECT_STATUSES = [
  "live",
  "in-progress",
  "completed",
  "unfinished",
] as const;
export const PROJECT_ROLES = [
  "sole",
  "lead",
  "project-lead",
  "team",
  "estimate-only",
] as const;
