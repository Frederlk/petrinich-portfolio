import { TechChip } from "~/components/tech-chip";

import type { StackGroup, StackItem } from "~/features/stack/stack-types";

function Chip({ item }: { item: StackItem }) {
  return (
    <li>
      <TechChip
        count={item.projects}
        href={item.projects === 0 ? undefined : `/work?tech=${item.id}`}
        name={item.name}
      />
    </li>
  );
}

// Every group as a heading and a wrapped list of all its chips. A chip is one bordered box: the name, then the project count as a muted number. Owner-listed technologies have a dashed box and no count.
export function StackGroupsList({ groups }: { groups: readonly StackGroup[] }) {
  return (
    <div className="space-y-space-lg">
      {groups.map((group) => (
        <section
          className="reveal scroll-mt-[calc(4.5rem+var(--search-band))] lg:scroll-mt-space-lg"
          id={group.id}
          key={group.id}
        >
          <h2 className="mb-space-sm flex items-center gap-space-sm border-b border-surface-container-high pb-space-xs type-h3 text-on-surface capitalize">
            {group.name}
            <span className="type-meta text-secondary">
              {group.items.length}
            </span>
          </h2>
          <ul className="flex flex-wrap gap-space-sm">
            {group.items.map((item) => (
              <Chip item={item} key={item.id} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
