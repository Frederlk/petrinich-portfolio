import type { Project } from "~/schemas/projects";

// Who the work was for, written so a visitor can read it without knowing the owner's vocabulary.
export const KIND_LABELS = {
  client: "Built for a client",
  freelance: "Freelance work",
  internal: "In-house tool",
  personal: "Personal project",
} as const satisfies Record<Project["kind"], string>;

// The kind line of a /work row, which also lists the early work: one or two words, since the domain tags share the line; the project page keeps the longer KIND_LABELS.
export const WORK_KIND_LABELS = {
  client: "Client",
  early: "Early work",
  freelance: "Freelance",
  internal: "In-house",
  personal: "Personal",
  "open-source": "Open source",
} as const satisfies Record<Project["kind"] | "early" | "open-source", string>;

export const ROLE_LABELS = {
  "estimate-only": "Analysis and estimate",
  lead: "Lead developer",
  "project-lead": "Project lead",
  sole: "Sole developer",
  team: "Team member",
} as const satisfies Record<Project["role"], string>;

// The role line of a /work row, which also lists the open-source contributions.
export const WORK_ROLE_LABELS = {
  ...ROLE_LABELS,
  contributor: "Open source contributor",
} as const satisfies Record<Project["role"] | "contributor", string>;

export const STATUS_LABELS = {
  completed: "Completed",
  "in-progress": "In progress",
  live: "Live",
  unfinished: "Unfinished",
} as const satisfies Record<NonNullable<Project["status"]>, string>;

// Short forms for the bracketed role tags, where the full label would not fit a one-column cell.
export const ROLE_SHORT = {
  "estimate-only": "Estimate",
  lead: "Lead dev",
  "project-lead": "Project lead",
  sole: "Sole",
  team: "Team",
} as const satisfies Record<Project["role"], string>;

export const WORK_ROLE_SHORT = {
  ...ROLE_SHORT,
  contributor: "Contributor",
} as const satisfies Record<Project["role"] | "contributor", string>;

// The tooltip on a role tag: what the role means, so a visitor can tell a lead developer from a project lead.
export const WORK_ROLE_HINTS = {
  contributor: "I contributed code to someone else's open-source project.",
  "estimate-only":
    "I analysed the project and wrote the estimate and the plan for it.",
  lead: "I led the team and wrote a large share of the code myself.",
  "project-lead":
    "I led the project: the estimate, the architecture, the plan and the team.",
  sole: "I was the only developer and built the whole product.",
  team: "I was one of the developers in the team and built my part of the product.",
} as const satisfies Record<Project["role"] | "contributor", string>;

// The `scope` values in projects.json: what part of the product the owner built.
export const SCOPE_LABELS = {
  advisor: "Advisor",
  backend: "Backend",
  design: "Design",
  devops: "DevOps",
  estimate: "Estimate",
  frontend: "Frontend",
  fullstack: "Full stack",
} as const satisfies Record<string, string>;

// The `domain` values in projects.json: the industry or product type.
export const DOMAIN_LABELS = {
  ai: "AI",
  business: "Business services",
  construction: "Construction & real estate",
  crypto: "Crypto",
  "developer-tools": "Developer tools",
  "e-commerce": "E-commerce",
  education: "Education & publishing",
  finance: "Finance",
  gaming: "Games & gambling",
  healthcare: "Healthcare",
  hr: "HR & recruiting",
  legal: "Legal & compliance",
  lifestyle: "Lifestyle & fashion",
  "pet-care": "Pet care",
  media: "Media & entertainment",
  security: "Security",
  travel: "Travel & transport",
} as const satisfies Record<string, string>;
