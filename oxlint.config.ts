import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

// `Icon*` (`IconProps`, `IconContext`) are the library's own types, which carry no suffix.
const phosphorIconSuffix = {
  group: ["@phosphor-icons/react", "@phosphor-icons/react/*"],
  allowImportNamePattern: "(Icon|^Icon.*)$",
  message: "Import Phosphor icons with the Icon suffix (CheckIcon, not Check).",
};

export default defineConfig({
  extends: [core, react, next],

  // Type-aware rules and unused-directive reporting are switched on by `bun lint` (`--type-aware --report-unused-disable-directives-severity=error`), which `bun gates` and CI run, and by pre-commit's check-only pass — not by `options` here. Pre-commit's `oxlint --fix` runs ahead of severity and after `oxfmt`, so config-level type-awareness would let parked type-aware `warn` rules rewrite every staged file unreviewed (measured in dnd-web: `promise-function-async` inserting `async` into callbacks). A directive suppressing a type-aware rule would also read as unused to that non-type-aware run.

  // Design-system rules: what a component owns versus what a page may set on it. They read `cn()`/`cva()` call sites in JS/TSX and never open a stylesheet. Oxlint's JS plugin API is alpha (oxc.rs), which is why this is scoped to the design-system rules rather than used for anything load-bearing.
  jsPlugins: ["@shadcn/lint", "oxlint-tailwindcss"],

  settings: {
    // The file the plugin compiles to learn this theme's own tokens.
    tailwindcss: { entryPoint: "styles/globals.css" },
  },

  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    // Captured evidence — value is being byte-identical to what was measured. The trailing `/**` matters: without it oxlint walked into `artifacts/` and rewrote files there (measured in dnd-web).
    ".scratch/**",
    "docs/research/**/artifacts/**",
    // Local reference notes kept out of git; nothing here is this repo's code.
    ".claude/_projects/**",
    // Agent tooling — skills, rules, hooks, worktrees — was never linted under Biome either.
    ".claude/**",
  ],

  rules: {
    // ── Design system (@shadcn/lint) ─────────────────────────────────
    // `no-restyle` is the reason this plugin is here: a page may place a component (margin, width, grid position) but not restyle it. Its messages read the component's own CVA axes, so a violation on `<Badge>` lists the variants that exist instead of pointing at a doc. `allow: ["layout"]` is what makes it usable — without it even `flex` on a `<Label>` is a violation.
    //
    // Each option excludes only non-defects: a `Skeleton` takes the shape of the content it stands in for; `DrawerTrigger`, `PopoverTrigger` and `DropdownMenuTrigger` are headless and own no style, and since 0.2.3 the rule follows their `render` button, so the button's own classes are the page's to set. They are named one by one, not matched as `*Trigger`, so a styled trigger such as `SelectTrigger` stays checked.
    "shadcn/no-restyle": [
      "error",
      {
        allow: ["layout"],
        contracts: [
          { pattern: "^Skeleton$", allow: ["layout", "rounded-*"] },
          {
            pattern: "^(DrawerTrigger|PopoverTrigger|DropdownMenuTrigger)$",
            allow: [
              "layout",
              "spacing",
              "typography",
              "color",
              "motion",
              "shape",
              "border",
              "effects",
            ],
          },
        ],
      },
    ],
    "shadcn/no-raw-colors": "error",
    // `allow` exempts only shapes with no token or non-bracket form — property lists, grid templates, and values (custom-property assignments included) computed from `var()` or `--spacing()`. A literal custom-property assignment stays flagged, or `[--w:500px] w-(--w)` would launder the very value this rule exists to catch; so does a bare `u-[var(--x)]`, since `u-(--x)` always exists. An allowed class skips the color check here and in `no-raw-colors`, so `deny` keeps raw colors out.
    "shadcn/no-arbitrary-values": [
      "error",
      {
        allow: [
          "transition-[*]",
          "grid-rows-[*]",
          "grid-cols-[*]",
          "[--*var(--*]",
          "*:[--*var(--*]",
          "[--*--spacing(*]",
          "*:[--*--spacing(*]",
          "*-[*var(--*]",
          "*-[var(--*)*]",
          "*-[*--spacing(*]",
        ],
        deny: ["*#*", "*rgb(*", "*hsl(*", "*hwb(*", "*lab(*", "*lch(*"],
      },
    ],
    "shadcn/no-inline-styles": "error",
    "shadcn/require-static-classes": "error",

    // ── Tailwind theme awareness (oxlint-tailwindcss) ────────────────
    // Reads `@theme` out of `styles/globals.css` at lint time, so it knows this repo's own tokens rather than stock Tailwind. `no-conflicting-classes` finds two classes fighting for one property, where which one wins depends on generated stylesheet order rather than attribute order. `no-unknown-classes` is off on purpose: it is the most false-positive-prone of the set, and an unknown class is the one failure a screen shows immediately.
    "tailwindcss/no-conflicting-classes": "error",
    // Oxfmt's `sortTailwindcss` sorts the same strings on every write, so the two have to agree: `oxfmt.config.ts` points it at `styles/globals.css`. This rule is the check, `oxfmt` is the writer: a finding means a file was written without the formatter.
    "tailwindcss/enforce-sort-order": "error",

    "typescript/no-floating-promises": "error",

    // ── Carried over from the Biome config this replaced ─────────────
    // Every entry below was argued off before the migration. Without them oxlint reports thousands of findings, almost all style preference rather than defect.

    // a11y — all are on as regression guards. A site that cannot take the rule's form carries a directive that names why, not a rule-wide exception.
    "jsx-a11y/interactive-supports-focus": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/no-noninteractive-element-interactions": "error",
    "jsx-a11y/no-static-element-interactions": "error",
    "jsx-a11y/anchor-has-content": "error",
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/media-has-caption": "error",

    // Imports — the repo uses `~/` aliases with `moduleResolution: "bundler"`, and direct (non-barrel) imports by convention. `react-dom` and `react-resizable-panels` are namespace-imported by vendored `components/ui` code.
    "import/no-namespace": ["error", { ignore: ["react-dom", "./**"] }],
    // A `../` import breaks when a file moves; the alias does not. `scripts/**` runs under Node without the alias, so the override below turns the rule off there.
    "import/no-relative-parent-imports": "error",
    "no-restricted-imports": ["error", { patterns: [phosphorIconSuffix] }],
    "import/consistent-type-specifier-style": "off",
    "import/extensions": "error",
    "import/first": "error",
    "eslint/no-inner-declarations": "error",

    // Declarations or arrows both stay legal; the rule only bans assigning a `function` expression to a variable. The default `expression` style would flag every top-level declaration.
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    // `"multi-line"` flags only a body that spans lines without braces — the shape where a second statement added later silently falls outside the `if`. A one-line `if (x) return;` stays legal.
    curly: ["error", "multi-line"],
    // Components are `function` declarations; the ultracite preset says `arrow-function`, so the option states the convention instead of leaving the preset to contradict the code.
    "react/function-component-definition": [
      "error",
      { namedComponents: "function-declaration" },
    ],
    "no-nested-ternary": "off",
    "no-magic-numbers": "off",
    // A `!` is an unchecked claim the compiler cannot re-verify when the code around it changes.
    "typescript/no-non-null-assertion": "error",
    "typescript/consistent-type-definitions": "off",
    "no-param-reassign": "error",
    "unicorn/prefer-string-slice": "error",
    "prefer-destructuring": "off",
    "no-plusplus": "off",
    "unicorn/switch-case-braces": "off",
    // Vendored Base UI wrappers import the primitive as `_SelectPrimitive` and re-export it as `SelectPrimitive`; the leading underscore is that convention, not a naming slip.
    "react/jsx-pascal-case": ["error", { allowLeadingUnderscore: true }],
    "require-unicode-regexp": "off",
    "prefer-named-capture-group": "off",
    // `functions: false` because a function declaration is hoisted. The rule stays on because a declaration below its first use hides a real temporal-dead-zone use in the same file, and reading a file top-down should never need the reader to jump ahead.
    "no-use-before-define": ["error", { functions: false }],

    // Correctness rules.
    // A real key where the content has one; a one-line directive with a reason only on a positional list with no identity (a skeleton, a marquee copy). A synthetic id built from the index is the index in disguise and is not a fix.
    "react/no-array-index-key": "error",
    "no-bitwise": "off",
    "no-cond-assign": "error",
    "no-empty-function": "off",
    // A shadowed name is one missed rename from silently rebinding to the outer variable, which `tsc` cannot see when the two have the same type.
    "no-shadow": "error",
    "no-await-in-loop": "off",
    // Left off: a threshold would be raised or suppressed rather than held as features land.
    complexity: "off",
    "react/refs": "off",

    // Alphabetizing object keys reorders TanStack Query mutation callbacks (`onError` before `onMutate`), which breaks the contextual inference flowing `onMutate`'s return into `onError`'s `context` param — turning it `unknown`.
    "sort-keys": "off",

    "unicorn/no-array-for-each": "error",

    // ── Unicorn style, with no counterpart that was ever on here ──────
    // Not enabled before the migration, so turning on more than dnd-web's measured set would be a new standard smuggled in by a toolchain swap rather than a decision.
    "unicorn/prefer-string-replace-all": "error",
    "unicorn/text-encoding-identifier-case": "error",
    // `.sort()` mutates its receiver; `.toSorted()` returns a copy with the same comparator.
    "unicorn/no-array-sort": "error",
    "unicorn/consistent-function-scoping": "off",
    "unicorn/prefer-number-coercion": "off",
    "unicorn/prefer-export-from": "off",
    "unicorn/prefer-spread": "error",
    "unicorn/no-await-expression-member": "off",
    "unicorn/catch-error-name": "error",
    "unicorn/import-style": "off",
    "unicorn/prefer-import-meta-properties": "error",
    // `checkArguments: false` is what makes this rule usable: bare, it reports required positional parameters whose `undefined` the rule cannot see is mandatory, which is the TS2554 its autofix produces.
    "unicorn/no-useless-undefined": ["error", { checkArguments: false }],
    eqeqeq: "error",
    "no-eq-null": "error",
    "no-inline-comments": "off",
    "promise/prefer-await-to-callbacks": "off",
    "node/callback-return": "off",
    "typescript/consistent-type-imports": "error",
    "react/jsx-handler-names": "off",
    "unicorn/no-lonely-if": "off",
    "unicorn/prefer-dom-node-append": "error",
    "unicorn/prefer-dom-node-remove": "error",
    "unicorn/prefer-set-has": "error",
    "unicorn/no-array-reduce": "off",
    "unicorn/prefer-ternary": "off",
    // An `Error` subclass whose `name` is the inherited `"Error"` is indistinguishable in a log from any other error; the rule wants a `…Error` class name and a matching `this.name`.
    "unicorn/custom-error-definition": "error",
    "unicorn/prefer-logical-operator-over-ternary": "error",
    "promise/prefer-await-to-then": "off",
    "promise/avoid-new": "off",
    "typescript/array-type": "error",
    "typescript/no-dynamic-delete": "error",
    // An empty interface is `{}`, which accepts almost anything; use `type X = ComponentProps<...>` under the same name.
    "typescript/no-empty-object-type": "error",
    "typescript/no-empty-interface": "error",
    "typescript/no-inferrable-types": "error",
    "typescript/no-explicit-any": "error",
    // Flags every `// TODO`; a TODO comment is not a defect.
    "react/todo": "off",

    // ── Rules whose fix contradicts React Compiler ───────────────────
    // `reactCompiler: true` (next.config.ts) memoizes these automatically, and CLAUDE.md forbids the manual `useMemo`/`useCallback` each of these rules asks for. Not disabled, deliberately: `react/preserve-manual-memoization`, which reports genuine Compiler bailouts.
    "react/jsx-no-constructed-context-values": "off",
    "react/memo-dependencies": "off",

    // ── Rules whose autofix produces broken code (measured in dnd-web) ──
    // Both are on with their sites rewritten by hand: pre-commit's `oxlint --fix` would apply the broken rewrite to new code and the same hook's `tsc` then fails the commit.
    // `prefer-dom-node-dataset` rewrites `closest(...)?.getAttribute("data-slug")` to `?.dataset.slug`, but `closest()` returns `Element`, which has no `dataset` (TS2339).
    "unicorn/prefer-dom-node-dataset": "error",
    // The autofix strips zero-width spaces, which are load-bearing inside a block comment (`*<ZWSP>/` would otherwise close it). `skipComments` keeps the rule on code, where a stray character is a defect.
    "no-irregular-whitespace": ["error", { skipComments: true }],
  },

  overrides: [
    {
      // Node resolves these files' imports by path, with the `.ts` extension; they do not know the `~/` alias.
      files: ["scripts/**"],
      rules: {
        "import/no-relative-parent-imports": "off",
      },
    },
    {
      // The surfaces where these two rules retire a memory-only convention. Scripts, tests, `env.ts`, `next.config.ts` and vendored `components/ui/**` are outside it: a bare console and a direct env read are legitimate there.
      files: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "hooks/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "utils/**/*.{ts,tsx}",
      ],
      excludeFiles: ["**/*.test.ts", "**/*.test.tsx", "components/ui/**"],
      plugins: ["node"],
      rules: {
        // `env.ts` validates every variable through `@t3-oss/env-nextjs`, so a direct read elsewhere bypasses the schema and fails at runtime rather than at startup.
        "node/no-process-env": "error",
        // `~/utils/logger` is the logging surface (CLAUDE.md §Utilities).
        "no-console": "error",
      },
    },
  ],
});
