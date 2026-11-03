// The reading order of technology groups wherever a page lists them by group (/stack, a project's stack): the languages, the app from front end to data, the services around it, AI, then how it is run, tested, built and designed. A group missing here goes last.
export const GROUP_ORDER: readonly string[] = [
  "Core stack",
  "Languages & markup",
  "Front end",
  "State, forms & data fetching",
  "APIs & back end",
  "Data",
  "Auth, payments, email",
  "CMS & commerce",
  "AI engineering",
  "Media & real time",
  "Platform & web APIs",
  "Web3",
  "Infrastructure & observability",
  "Quality & tooling",
  "Build tools",
  "Design & collaboration",
];

export const groupRank = (group: string): number => {
  const i = GROUP_ORDER.indexOf(group);
  return i === -1 ? GROUP_ORDER.length : i;
};

// Inside a group: the most used first, so the familiar names lead, then by name.
export const byUse = (
  a: { facts: { projects: number }; name: string },
  b: { facts: { projects: number }; name: string }
): number =>
  b.facts.projects - a.facts.projects || a.name.localeCompare(b.name);
