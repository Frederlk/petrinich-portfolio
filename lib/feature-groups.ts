import type { Project } from "~/schemas/projects";

type FeatureGroup = { items: string[]; title: string | null };

// The capabilities as groups: a titled entry is its own group, and plain lines in a row form one untitled group.
export function featureGroups(project: Project): FeatureGroup[] {
  const groups: FeatureGroup[] = [];
  for (const entry of project.features) {
    if (typeof entry !== "string") {
      groups.push({ items: entry.items, title: entry.title });
      continue;
    }
    const last = groups.at(-1);
    if (last?.title === null) {
      last.items.push(entry);
    } else {
      groups.push({ items: [entry], title: null });
    }
  }
  return groups;
}

// Every capability line, groups flattened, for the text and JSON outputs.
export const featureLines = (project: Project): string[] =>
  featureGroups(project).flatMap((g) => g.items);
