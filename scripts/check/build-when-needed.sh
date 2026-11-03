#!/bin/sh
# Runs `next build` only when a staged file could break it, because a build costs ~26s against typecheck's ~2s  and most commits cannot break one. When a staged file feeds the CV, it runs `bun cv:pdf` instead — that builds too, then reprints public/Sergey-Petrinich-CV.pdf and stages it, so the committed PDF never lags the content.
# This script lives in scripts/check/, so the repo root is ../..
cd "$(dirname "$0")/../.." || exit 1

# What only a build can catch, and the reason each entry is here rather than trusted to typecheck:
#
#   app/**/{page,layout,route,template,default,error,not-found,loading,global-error}.tsx|ts
#     Route-segment config (`dynamic`, `revalidate`, `runtime`, `instant`) is validated by the BUILD, never by tsc — it is a plain exported const, so a value the framework rejects typechecks perfectly. A `force-dynamic` under `cacheComponents: true` passes typecheck and lint; `bun run build` refuses it outright. Prerender failures live here too: reading `headers()` or `params` outside a <Suspense> boundary is a build-time error about a file that compiles.
#
#   next.config.ts
#     Changes what the rules ARE. `cacheComponents: true` is what made the line above illegal; flipping a flag here can invalidate route config repo-wide without touching a route.
#
#   instrumentation.ts / proxy.ts
#     Executed by the framework at boundaries tsc does not model.
#
# Not in the routing list: `components/**`, `lib/**`, `utils/**`, `hooks/**`, because typecheck and lint cover a component that only renders. Most of `components/**` and `lib/**` builds anyway through the CV list above, whose reason is the stale PDF, not the build; what neither list reaches (`utils/**`, `hooks/**`, components /cv does not import) is left to CI. That is the cost of not taxing every commit, and it is deliberate.
staged=$(git diff --cached --name-only --diff-filter=ACMR)

# What /cv renders from: its route, the root layout, the content and schemas, and the components, libs and styles its import graph reaches (traced 2026-11-03 from app/cv/page.tsx). Broad on purpose: a missed reprint ships a stale PDF silently, an extra one costs a build.
cv_matched=$(printf '%s\n' "$staged" | grep -E '^(app/cv/|app/layout\.tsx|content/|schemas/|components/|lib/|features/work/|styles/|env\.ts$)')

if [ -n "$cv_matched" ]; then
  echo "CV sources changed — rebuilding the site and reprinting the CV PDF:"
  printf '  %s\n' "$cv_matched"
  if bun cv:pdf && git add public/Sergey-Petrinich-CV.pdf; then
    exit 0
  fi
  echo ""
  echo "bun cv:pdf failed (build, Chrome or uv). Fix it, or bypass once: git commit --no-verify, then run bun cv:pdf by hand."
  exit 1
fi

matched=$(printf '%s\n' "$staged" | grep -E '^(app/.*/(page|layout|route|template|default|error|not-found|loading|global-error)\.(tsx|ts)|app/(page|layout|error|not-found|global-error)\.(tsx|ts)|next\.config\.ts|instrumentation\.ts|proxy\.ts)$')

if [ -z "$matched" ]; then
  exit 0
fi

echo "Routing or build config changed — running next build:"
printf '  %s\n' "$matched"

if bun run build; then
  exit 0
fi

echo ""
echo "next build failed on a staged routing change — typecheck and tests do not catch this class."
echo "Bypass once: git commit --no-verify"
exit 1
