import { PROJECT_ROLES } from "~/schemas/project-enums";
import type { Project } from "~/schemas/projects";

// Client-safe: constants and types only, so the browser bundle never pulls in the content files.
// The project roles plus "contributor" for the open-source rows, which have no project record.
export const WORK_ROLES = [...PROJECT_ROLES, "contributor"] as const;
export type WorkRole = (typeof WORK_ROLES)[number];
export const TYPE_TABS = [
  "all",
  "client",
  "freelance",
  "personal",
  "open-source",
  "early",
] as const;
export type TypeTab = (typeof TYPE_TABS)[number];

export const TYPE_TAB_LABELS = {
  all: "All",
  client: "Client",
  early: "Early",
  freelance: "Freelance",
  "open-source": "Open source",
  personal: "Personal",
} as const satisfies Record<TypeTab, string>;

// The ledger columns a visitor can sort by. Summary and stack are free text, so they stay unsorted.
export const SORT_KEYS = ["year", "name", "role"] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export const SORT_DIRS = ["asc", "desc"] as const;
export type SortDir = (typeof SORT_DIRS)[number];

// How a row was built: by orchestrating AI agents, or written by hand. Early work and open-source contributions are all hand-written.
export const BUILDS = ["ai", "hand"] as const;
export type Build = (typeof BUILDS)[number];
export const BUILD_LABELS = {
  ai: "AI-orchestrated",
  hand: "Hand-written",
} as const satisfies Record<Build, string>;

// A technology in the /work filter, with its /stack group for the grouped list.
export type TechOption = { group: string; id: string; name: string };

// A domain in a row and in the /work filter.
export type DomainOption = { id: string; label: string };

// Everything a row needs, serializable, so the server table and the client filter render the same data.
export type WorkRow = {
  anonymous: boolean;
  build: Build;
  // The industries the product serves (`project.domain`), labelled on the server; early work and open source have none.
  domains: DomainOption[];
  // Where the row links: the project page (internal), the live URL of an early project (external), or nowhere.
  href: string | null;
  id: string;
  kind: Project["kind"] | "early" | "open-source";
  name: string;
  role: WorkRole;
  search: string;
  // The core technologies the row shows as tags (`coreTechs`).
  stack: string[];
  summary: string;
  tab: Exclude<TypeTab, "all">;
  techIds: string[];
  year: number | null;
};
