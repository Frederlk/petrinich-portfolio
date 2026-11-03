// Client-safe: plain serializable shapes, so the browser bundle never pulls in the content files.
export type StackItem = {
  // Other names the search matches, e.g. "React 19".
  aliases: string[];
  built: number;
  id: string;
  name: string;
  projects: number;
  // "2024–2026", or one year.
  span: string;
};

export type StackGroup = {
  id: string;
  items: StackItem[];
  name: string;
};
