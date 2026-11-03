# petrinich-portfolio

Portfolio and CV of Sergey Petrinich, live at [sergey-petrinich.vercel.app](https://sergey-petrinich.vercel.app): Next.js 16, React 19, TypeScript 7, Tailwind v4, Base UI. Every route is static. `CLAUDE.md` is the entry point for agents; `package.json` owns every version. Started from the UX MIND Next template.

The code is public for review. No license is granted: all rights reserved, including the content, the photo and the CV.

## Setup

```bash
bun install
cp .env.example .env.local
bun dev
```

The dev server runs on [http://localhost:4224](http://localhost:4224). Env vars are validated in `env.ts`; `SITE_URL` is the optional canonical origin.

## Content

- `content/*.json` is the source of the site, parsed with the Zod schemas in `schemas/` when the app builds (`lib/content.ts`). A bad value fails the build.
- `content/case-studies/<project id>.mdx` is a project's case study, linked through the project's `caseStudy` field.

## Routes

`/`, `/work` (archive with URL filters), `/work/<id>`, `/stack`, `/cv`, plus the machine-readable `/cv.md`, `/llms.txt`, `/llms-full.txt`, `/resume.json`, `/robots.txt` and `/sitemap.xml`. `/projects` redirects to `/work`, `/about` to `/`.

## Checks

| Command | What it runs |
|---|---|
| `bun lint` | Oxlint (type-aware) plus the `ux-mind-helpers` checks |
| `bun format:check` | Oxfmt check |
| `bun typecheck` | `tsc --noEmit`, scripts and hooks included |
| `bun run test` | `bun test` over `scripts/` and `.claude/hooks/` |
| `bun check:rules` | Mechanical code rules (`scripts/check/code-rules.ts`) |
| `bun knip` | Unused files and dependencies |
| `bun gates` | All of the above plus the build, one report |
| `bun resume:validate <url-or-file>` | Validates `/resume.json` against the JSON Resume schema |

Husky runs the staged-file subset on commit; `.github/workflows/ci.yml` runs everything on a pull request.

## Layout

- `app/` routes, `features/work/` the archive table and its URL filters, `components/ui/` the Base UI component kit, `DESIGN.md` the visual system.
- `scripts/` repo tooling, see `scripts/README.md`.
- `.claude/` agent config: the guard hook, path-scoped rules, skills.
