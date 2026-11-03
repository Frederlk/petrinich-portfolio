import type { StackGroup, StackItem } from "~/features/stack/stack-types";

// A technology matches when the query is part of its name or of one of its aliases, ignoring case and surrounding spaces.
export function matchesQuery(item: StackItem, query: string): boolean {
  const needle = query.trim().toLowerCase();
  return (
    needle === "" ||
    [item.name, ...item.aliases].some((text) =>
      text.toLowerCase().includes(needle)
    )
  );
}

export const filterItems = (items: readonly StackItem[], query: string) =>
  items.filter((item) => matchesQuery(item, query));

// The groups with only the matching chips; a group left without any is dropped.
export const filterGroups = (groups: readonly StackGroup[], query: string) =>
  groups
    .map((group) => ({ ...group, items: filterItems(group.items, query) }))
    .filter((group) => group.items.length > 0);
