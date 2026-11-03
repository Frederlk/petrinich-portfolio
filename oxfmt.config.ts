import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,

  ignorePatterns: [
    // `ultracite.ignorePatterns` is typed optional (`string[] | undefined`) even though the shipped config always sets it — `?? []` satisfies the spread without changing behaviour.
    ...(ultracite.ignorePatterns ?? []),
    ".scratch/**",
    // Google Stitch exports, kept byte-for-byte as the design reference DESIGN.md is copied from.
    "docs/design/stitch/**",
    // Local reference notes kept out of git; nothing here is this repo's code.
    ".claude/_projects/**",
    // Agent tooling was never formatted under Biome either.
    ".claude/**",
    // Markdown was never formatted here, and prose is written one-paragraph-per-line on purpose. Oxfmt rewrites tables and turns `*emphasis*` into `_emphasis_`.
    "**/*.md",
  ],

  // Explicit because the width is part of the repo's style, not an inherited default.
  printWidth: 80,

  sortTailwindcss: {
    // Without `stylesheet` Oxfmt sorts against stock Tailwind and puts this repo's own tokens first, which disagrees with `tailwindcss/enforce-sort-order` on every file that uses one. The path resolves relative to this file.
    stylesheet: "./styles/globals.css",
    // Setting `stylesheet` replaces the whole object it inherited, and without `functions` nothing inside `cn()` or `cva()` would be sorted.
    functions: ["clsx", "cva", "tw", "twMerge", "cn", "twJoin", "tv"],
  },

  sortImports: {
    // `ignoreCase` and `order` restate Ultracite's own values rather than spreading them: its `sortImports` is optional in the type, so a spread does not typecheck.
    ignoreCase: true,
    order: "asc",
    // The order reads outward from the page (`~/app`) to the generic (`~/utils`), so a reader scanning imports sees the feature's own surface before its plumbing.
    customGroups: [
      { groupName: "app", elementNamePattern: ["~/app/**"] },
      { groupName: "components", elementNamePattern: ["~/components/**"] },
      { groupName: "ui", elementNamePattern: ["~/ui/**"] },
      { groupName: "hooks", elementNamePattern: ["~/hooks/**"] },
      { groupName: "lib", elementNamePattern: ["~/lib/**"] },
      { groupName: "schemas", elementNamePattern: ["~/schemas/**"] },
      { groupName: "scripts", elementNamePattern: ["~/scripts/**"] },
      { groupName: "styles", elementNamePattern: ["~/styles/**"] },
      { groupName: "types", elementNamePattern: ["~/types/**"] },
      { groupName: "constants", elementNamePattern: ["~/constants/**"] },
      { groupName: "utils", elementNamePattern: ["~/utils/**"] },
      { groupName: "alias-rest", elementNamePattern: ["~/**"] },
    ],
    groups: [
      ["value-builtin", "value-external"],
      "app",
      "components",
      "ui",
      "hooks",
      "lib",
      "schemas",
      "scripts",
      "styles",
      "types",
      "constants",
      "utils",
      "alias-rest",
      ["value-parent", "value-sibling", "value-index"],
      "unknown",
    ],
    newlinesBetween: true,
  },
});
