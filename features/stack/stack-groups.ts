// Server only: builds the groups from the content files. The client receives them as props and never imports this module.
import { technologies } from "~/lib/content";
import type { Technology } from "~/lib/content";
import { isOnStack } from "~/lib/derive-stats";
import { byUse, groupRank } from "~/lib/tech-groups";

import type { StackGroup, StackItem } from "~/features/stack/stack-types";

const CORE_GROUP = "Core stack";
const AI_GROUP = "AI engineering";

function toItem({ aliases, facts, id, name }: Technology): StackItem {
  const span =
    facts.firstYear === null
      ? "–"
      : facts.firstYear === facts.lastYear
        ? String(facts.firstYear)
        : `${facts.firstYear}–${facts.lastYear}`;
  return {
    aliases,
    built: facts.built,
    id,
    name,
    projects: facts.projects,
    span,
  };
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");

// Groups in the site's reading order (`GROUP_ORDER`). The core stack and AI tools keep the order technologies.json gives them, which is curated; in every other group the most used come first.
const CURATED = new Set([CORE_GROUP, AI_GROUP]);

export const stackGroups: StackGroup[] = Map.groupBy(
  technologies.filter((t) => isOnStack(t)),
  (t) => t.group
)
  .entries()
  .toArray()
  .toSorted(([a], [b]) => groupRank(a) - groupRank(b))
  .map(([name, items]) => ({
    id: slug(name),
    items: (CURATED.has(name) ? items : items.toSorted(byUse)).map(toItem),
    name,
  }));

export const coreStack = stackGroups.find((g) => g.name === CORE_GROUP);

// Every group except the core stack, which the page shows on its own.
export const otherGroups = stackGroups.filter((g) => g.name !== CORE_GROUP);
