// The order of technology groups wherever a page lists them by group (/stack and its contents, a project's stack): the Core stack first, then alphabetical, so a reader finds a group by its name. A group missing here goes last.
export const GROUP_ORDER: readonly string[] = [
  "Core stack",
  "AI engineering",
  "Animation & 3D",
  "APIs & back end",
  "Auth",
  "Build tools",
  "Carousels & galleries",
  "CMS & commerce",
  "Data",
  "Data display & editors",
  "Design & collaboration",
  "Email & SMS",
  "Frameworks, routing & apps",
  "Infrastructure & observability",
  "Languages & markup",
  "Media & real time",
  "Payments",
  "Platform & web APIs",
  "Quality & tooling",
  "State, forms & data fetching",
  "UI kits & styling",
  "Web3",
];

export const groupRank = (group: string): number => {
  const i = GROUP_ORDER.indexOf(group);
  return i === -1 ? GROUP_ORDER.length : i;
};

// Inside a group: alphabetical, so a name is found where a reader looks for it; a project count is shown beside each name and is not an order.
export const byName = (a: { name: string }, b: { name: string }): number =>
  a.name.localeCompare(b.name, "en", { sensitivity: "base" });

// The registry's own "Core stack" group (React, Next.js and so on) is on almost every project. Each of those technologies also belongs to an ordinary group, next to the others of its kind: a project page shows it only there, /stack shows it in both.
const CORE_HOME: Record<string, string> = {
  "claude-code": "AI engineering",
  docker: "Infrastructure & observability",
  "next-js": "Frameworks, routing & apps",
  "node-js": "APIs & back end",
  postgresql: "Data",
  react: "Frameworks, routing & apps",
  "tailwind-css": "UI kits & styling",
  typescript: "Languages & markup",
};

// The group a technology is listed under outside the Core stack block.
export const homeGroup = (t: { group: string; id: string }): string =>
  CORE_HOME[t.id] ?? t.group;
