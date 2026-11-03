// A base library that a framework in the same stack already implies: Next.js is React, Nuxt is Vue. Short stack lists (a /work row, the Selected-work tags) drop the base so a slot is not spent on it; the project page and the search keep every id.
const IMPLIED_BY = new Map<string, readonly string[]>([
  ["react", ["next-js", "tanstack-start", "react-native", "expo"]],
  ["vue", ["nuxt"]],
]);

export function withoutImplied(stack: readonly string[]): string[] {
  return stack.filter(
    (id) =>
      !(
        IMPLIED_BY.get(id)?.some((framework) => stack.includes(framework)) ??
        false
      )
  );
}
