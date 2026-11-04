## Stack
Next.js 16 (App Router, Turbopack, React Compiler) + React 19 + TypeScript 7 (strict) + Tailwind v4 + Zod v4 + Lucide + Oxlint + Oxfmt (Ultracite presets)
UI: Base UI (`@base-ui/react`) + shadcn/ui (Base Nova) + diceui + coss.ui
Package manager and script runner: bun. `package.json` is the source of truth for every version.
No backend: every route is static and the content is JSON and MDX under `content/`, parsed with Zod in `lib/content.ts`.
This repo is the single source for the site, the CV PDF, the GitHub profile and LinkedIn (flow in `scripts/README.md`, "Updating the CV"). Internal material — the reasons behind every public number, job-search notes, the client CSV — lives in gitignored `private/` (index `private/README.md`); read `private/notes/decisions.md` before changing wording in `content/`.

## How the rules work here
Most rules are **gated**, not remembered: a `PreToolUse` hook (`.claude/hooks/guard.ts`) denies an edit or command that breaks one and hands you the rule as the reason. The same check runs in pre-commit and CI (`bun check:rules`). When a gate fires, the message *is* the rule — read it there.

The rest are **path-scoped**: `.claude/rules/*.md` load when you touch the surface they govern.

| Surface | File |
|---|---|
| `components/**`, `app/**` | `.claude/rules/ui.md` |
| `schemas/**` | `.claude/rules/schemas.md` |
| `env.ts`, `.env*` | `.claude/rules/env.md` |
| tests, `scripts/**` | `.claude/rules/tests.md` |
| `content/case-studies/**`, `content/projects.json`, `content/early-work.json`, `private/projects/**` | `.claude/rules/case-studies.md` |
| comments (always loaded) | `.claude/rules/comments.md` |

**If a rule is worth enforcing and a regex can decide it, add it to `scripts/check/code-rules.ts`** with a case pair in its test, rather than writing another paragraph here.

## CRITICAL
- **Base UI, NOT Radix.** Load skills before writing components: `coss-ui`, `base-ui`, `cn-class-organization`. Use `render` instead of `asChild`.
- **UI style contract** — read a neighbouring file in `components/ui/` before creating or editing one: utility names, `cn()` layout, CVA usage and shell composition follow the existing wrappers.
- **Visual system** — read `DESIGN.md` before building any new page, screen, or feature surface. Defines look/feel, hierarchy, color/spacing/type tokens (values resolve in `styles/globals.css`).
- **Next.js 16 differs from training data.** Read `node_modules/next/dist/docs/` first.
- **React Compiler handles memoization** — NO useMemo/useCallback/React.memo. Use useEffectEvent for stable effect handlers. Refs as props (no forwardRef).
- **Interior-mutability carve-out** — adopting TanStack Table/Virtual, react-hook-form, MobX, zustand, or @tanstack/react-query? Load the `react-compiler-carveout` skill. Lint guard: `check-no-memo-carveout` from `ux-mind-helpers`, run by `bun lint`.

## Never
- Run `bun dev`/`bun run start`, or start a second dev server — the owner runs one on port 4224; verify against it in the browser. The guard blocks every `next start`, so a check of the production build (after `bun run build`) reads its output: prerendered pages and route bodies in `.next/server/app/`, rewrites and headers in `.next/routes-manifest.json`.
- Stage everything at once (`git add -A`, `git add .`). The tree can hold more than one session's work: name the paths.
- Read a non-local env file — which ones are local is listed in `.claude/rules/env.md`. Channel commands through `bun dotenvx run --strict -f .env.local -- <command>`.
- Write a throwaway (probe script, dump, sample, `.bak`) anywhere but `.scratch/tmp/`, and delete it once its question is answered.

## Commands
`bun format` (oxfmt + typecheck) | `bun format:check` | `bun lint` (Oxlint type-aware + `ux-mind-helpers`) | `bun typecheck` | `bun run test` | `bun check:rules` | `bun knip` | `bun gates` (all of them, one report) | `bun run build` | `bun shadcn`

A green suite does not mean the app compiles: route-segment config is a plain exported const to `tsc`. Pre-commit runs the build on exactly those paths; `.claude/rules/ui.md` has the list.

## Conventions
- Imports: `~/` alias, direct only — NO barrel/index reexports
- Oxfmt: double quotes, 2 spaces, 80 chars
- kebab-case files, PascalCase components, camelCase vars
- Derive types (Pick/Omit/Awaited) — never recreate. NO enums — use `as const`
- `satisfies` for config and constants (`as const satisfies T` keeps literals narrow)
- No `as` outside one commented helper; no `!`, `any`, `as unknown as` or `@ts-ignore`
- Parse boundaries with zod (JSON files, search params, requests, third-party responses)
- Env: `.env.local` validated via `@t3-oss/env-nextjs` in `env.ts`; read through `~/env`, never `process.env`
- Tailwind v4 scale > arbitrary brackets — `max-h-65` not `max-h-[260px]` (px ÷ 4 = scale unit). Use `[…]` only for off-scale or non-spacing values (specific colors, calc, etc.).

## Utilities (use instead of raw alternatives)
`~/lib/cn` (class merging) | `~/utils/logger` (not console.log) | `~/utils/try-catch` (not try/catch) | `~/utils/errors` (getErrorMessage) | `~/utils/format-price` (formatPrice)

## How to work
- **Surgical edits** — every changed line traces to the request. No drive-by refactors or reformatting; match existing style. Remove imports/vars/functions YOUR changes orphaned; leave pre-existing dead code alone and mention it. If you cannot explain why a line or comment exists, leave it.
- **Self-review before "done"** — re-read the diff as a PR: unrelated changes? orphaned code? speculative abstractions? State what was NOT verified. A green gate says nothing about whether a screen rendered right: verify UI in the browser and measure (`getBoundingClientRect()` for geometry). No browser test runner is added; the check ends with the session.
- **The agent that wrote the code does not get to pass it.** A non-trivial change goes to a fresh-context reviewer — a subagent briefed adversarially. Fresh context is the whole mechanism: a reviewer that watched you write the code inherits your reasoning.

## Git
Conventional Commits. The branch model is per project: `main` ← `dev` ← feature branches when a `dev` branch exists, otherwise commit straight to `main`. Nothing here enforces either.
