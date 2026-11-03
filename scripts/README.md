# scripts/

Repo tooling. Nothing here is part of the application.

## Conventions

- **A script is TypeScript or shell, with no build step.** A TypeScript script is a `.ts` file run by `bun`, which executes TypeScript directly and resolves the `~/` alias from `tsconfig.json`, so relative imports and `~/` imports both work. `erasableSyntaxOnly` in `tsconfig.json` still bars enums, namespaces with values and parameter properties. `tsc` resolves more than a runtime does, so a green typecheck does not prove a script loads; what proves it is running it, by a test that spawns it or a gate that invokes it.
- **A script that resolves paths does so relative to itself**, not to the caller's cwd: `cd "$(dirname "$0")/../.."` from a file in `check/`. Pre-commit hooks do not guarantee a working directory.
- **Guards live in `check/` and are named for what they check**, not `check-*` — the folder already says that.
- **A script with non-trivial logic has a test beside it**, run by `bun run test`.
- **The docblock says why the script exists**, including the incident that prompted it where there was one. That context is the part nobody can reconstruct later.

## Inventory

| Path | What it does | Run by |
|---|---|---|
| `check/code-rules.ts` | Mechanical code rules a regex can decide, one message per rule | `bun check:rules`, pre-commit, CI, the guard hook |
| `check/case-studies.ts` | Project-article rules a regex can decide: word limit, no backticks or em dashes, list shape, 12 feature lines, forbidden words per project | `bun check:articles`, pre-commit, CI |
| `check/markdown-links.ts` | Dead relative Markdown links, and more than one `# ` heading per file | pre-commit, CI |
| `check/dead-paths.ts` | Backticked repository paths that do not exist | `bun check:paths`, pre-commit, CI |
| `check/sibling-identical.sh` | Changed files now byte-identical to a sibling repo's copy, the ones to review after a port | by hand |
| `check/build-when-needed.sh` | `bun cv:pdf` (build + reprint, PDF re-staged) when a staged file feeds `/cv`; otherwise `bun run build` only when a staged file is a route or build config | pre-commit |
| `check/gates.sh` | Every check, one report; `--ci` runs them one at a time in CI's order, so a leftover one gate writes for the next shows up locally; `--fast` skips the build | `bun gates` |
| `check/ci-summary.ts` | The step table on a CI run's summary page | CI |
| `merge-patch.ts` | Merges writer patches into `content/projects.json` (or `--early` batches into `content/early-work.json`), checks stack ids and formats the file | by hand, per wave |
| `cv-pdf.ts` | Builds the site, serves it on port 4312 and prints `/cv` to the committed `public/Sergey-Petrinich-Lead-Full-Stack-Developer-CV.pdf` through headless Chrome (tagged, with an outline), then stamps its metadata with `cv-pdf-meta.py` | `bun cv:pdf`, pre-commit via `check/build-when-needed.sh` |
| `sync-github.ts` | Renders the GitHub profile README and account fields (name, bio, blog, location, company, hireable) from `content/` and writes them through `gh`; dry run unless `--apply` | `bun sync:github`, `.github/workflows/profile-sync.yml` |
| `linkedin.ts` | Walks through every LinkedIn field rendered from `content/` as plain text: copies it, opens the edit page, waits; remembers what was pasted in `linkedin-state.json` (gitignored private folder) so the next run shows only changes | `bun linkedin` in your own terminal |
| `cv-pdf-meta.py` | Fails when the printed CV runs past two pages or carries a Type3 font, then sets title, author, subject, keywords, creator, language, dates and XMP with PyMuPDF; needs `uv` | run by `cv-pdf.ts` |
| `lib/is-record.ts` | Shared by the guard hook and `check/ci-summary.ts` | imported, never run |
| `verify/` | Pixel-check harness, see its own README | `bun verify` |

The guard hook, `.claude/hooks/guard.ts`, imports `check/code-rules.ts`, so the rules in it run before an edit lands as well as at commit time.

## Updating the CV

This repo is the one place the CV lives; every channel is rendered from `content/`.

1. Edit `content/*.json` (or `content/case-studies/`). The reasons behind the numbers and wording are in `private/notes/decisions.md`.
2. Commit. `.husky/pre-commit` reprints `public/Sergey-Petrinich-Lead-Full-Stack-Developer-CV.pdf` and stages it. It runs because `bun run prepare` (husky) sets the repo-local `core.hooksPath=.husky/_`; husky then sources `~/.config/husky/init.sh`, which chains the Shai-Hulud guard, so the guard still runs. On the owner's machine `bun install` runs no lifecycle scripts, so a fresh clone has no hooks until `bun run prepare`; `bun gates` fails its `hooks` gate until then. An edit made on GitHub directly runs no hook: pull, run `bun cv:pdf` and commit the PDF.
3. Push. Vercel deploys the site, and the Profile sync workflow updates the GitHub profile (`bun sync:github` shows the same change locally).
4. Run `bun linkedin` in your own terminal and paste what it copies.
