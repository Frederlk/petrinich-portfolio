import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";

import {
  BUILDS,
  type Build,
  SORT_DIRS,
  SORT_KEYS,
  type SortDir,
  type SortKey,
  TYPE_TABS,
  WORK_ROLES,
  type WorkRow,
} from "~/features/work/work-types";

// The archive filters live in the URL: /work?tech=prisma,stripe&domain=healthcare&year=2025&type=client&build=ai&q=stripe&sort=name&dir=desc. No `sort` is the default order, newest first under year headings.
export const workFilterParsers = {
  build: parseAsStringLiteral(BUILDS),
  dir: parseAsStringLiteral(SORT_DIRS),
  domain: parseAsString,
  q: parseAsString.withDefault(""),
  role: parseAsStringLiteral(WORK_ROLES),
  sort: parseAsStringLiteral(SORT_KEYS),
  tech: parseAsArrayOf(parseAsString).withDefault([]),
  type: parseAsStringLiteral(TYPE_TABS).withDefault("all"),
  year: parseAsInteger,
};

export type WorkFilters = {
  build: Build | null;
  dir: SortDir | null;
  domain: string | null;
  q: string;
  sort: SortKey | null;
  role: WorkRow["role"] | null;
  tech: string[];
  type: (typeof TYPE_TABS)[number];
  year: number | null;
};

export function matchesFilters(row: WorkRow, f: WorkFilters): boolean {
  const q = f.q.trim().toLowerCase();
  return (
    (f.type === "all" || row.tab === f.type) &&
    // Every picked technology, so the filter answers "built with X and Y"; each pick narrows the list.
    f.tech.every((id) => row.techIds.includes(id)) &&
    (f.domain === null || row.domains.some((d) => d.id === f.domain)) &&
    (f.year === null || row.year === f.year) &&
    (f.role === null || row.role === f.role) &&
    (f.build === null || row.build === f.build) &&
    (q === "" || row.search.includes(q))
  );
}

// A stable sort over rows that arrive newest first, so equal keys keep that order. Rows without a year go last whichever way the years run; roles sort in the order of WORK_ROLES, not alphabetically.
export function sortRows(
  rows: readonly WorkRow[],
  key: SortKey,
  dir: SortDir
): WorkRow[] {
  const sign = dir === "asc" ? 1 : -1;
  const compare = (a: WorkRow, b: WorkRow): number => {
    if (key === "year") {
      if (a.year === b.year) {
        return 0;
      }
      if (a.year === null) {
        return 1;
      }
      if (b.year === null) {
        return -1;
      }
      return sign * (a.year - b.year);
    }
    if (key === "name") {
      return sign * a.name.localeCompare(b.name);
    }
    return sign * (WORK_ROLES.indexOf(a.role) - WORK_ROLES.indexOf(b.role));
  };
  return rows.toSorted(compare);
}

// A change to the URL state: a key set to null returns to its default.
export type FilterPatch = { [K in keyof WorkFilters]?: WorkFilters[K] | null };
