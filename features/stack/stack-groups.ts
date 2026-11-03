// Server only: builds the groups from the content files. The client receives them as props and never imports this module.
import { technologies } from "~/lib/content";
import type { Technology } from "~/lib/content";
import { isOnStack } from "~/lib/derive-stats";
import { byName, groupRank, homeGroup } from "~/lib/tech-groups";

import type { StackGroup, StackItem } from "~/features/stack/stack-types";

const CORE_GROUP = "Core stack";

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

// Groups in `GROUP_ORDER` (Core stack first, then alphabetical), each alphabetical inside (`byName`). A core technology is listed twice: in the Core stack block and in its usual group (`homeGroup`).
const onStack = technologies.filter((t) => isOnStack(t));

const toGroup = ([name, items]: [string, Technology[]]): StackGroup => ({
  id: slug(name),
  items: items.toSorted(byName).map(toItem),
  name,
});

// Each technology once, under the group technologies.json gives it: the machine-readable catalogue (`lib/catalogue.ts`) lists these.
export const stackGroups: StackGroup[] = [
  ...Map.groupBy(onStack, (t) => t.group),
]
  .toSorted(([a], [b]) => groupRank(a) - groupRank(b))
  .map(toGroup);

export const coreStack = stackGroups.find((g) => g.name === CORE_GROUP);

// Every group except the core stack, which the page shows on its own.
export const otherGroups: StackGroup[] = Map.groupBy(onStack, homeGroup)
  .entries()
  .toArray()
  .toSorted(([a], [b]) => groupRank(a) - groupRank(b))
  .map(toGroup);
