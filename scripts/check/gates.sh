#!/bin/sh
# `bun gates` — every check a change must pass, in one run, with a report at the end.
#
# **Every gate runs even after one fails.** A stop-on-first-failure script tells you the cheapest thing that broke and hides the rest, which means the next run finds the next one: the slow way to learn you have three problems. The exit code is what matters for automation; the report is what matters for a human.
#
# Every gate except `build` runs at once; `build` runs after them, alone, because it rewrites `.next/` while `typecheck` and `knip` may be reading generated types. The report is printed in a fixed order once everything has finished.
#
# `--fast` (`bun gates --fast`) skips `build`, for the main checkout, where a build would rewrite the `.next/` the owner's dev server reads.

set -u

FAST=0
case "${1:-}" in
  "") ;;
  --fast) FAST=1 ;;
  *)
    echo "usage: gates.sh [--fast]" >&2
    exit 2
    ;;
esac

cd "$(dirname "$0")/../.."

FAILED=""
PASSED=""
ORDER=""

# One log and one exit-code file per gate, so a failing gate prints the tail of its own output and the report says why without a second run of the command.
DIR=$(mktemp -d)
trap 'rm -rf "$DIR"' EXIT

start() {
  name="$1"
  shift
  ORDER="$ORDER $name"
  (
    "$@" >"$DIR/$name.log" 2>&1
    echo $? >"$DIR/$name.rc"
  ) &
}

echo "Gates:"

start typecheck      bun typecheck
start lint           bun lint
start format         bun format:check
start markdown-links bun scripts/check/markdown-links.ts
start dead-paths     bun scripts/check/dead-paths.ts
start code-rules     bun scripts/check/code-rules.ts
start case-studies   bun scripts/check/case-studies.ts
start knip           bun knip
start test           bun run test
# The Claude guard hook lives in the gitignored `.claude/`, so its tests run only where the folder exists (the owner's checkout), never in CI or a public clone.
if [ -d .claude/hooks ]; then
  start guard-test   bun test ./.claude/hooks
fi
wait

if [ "$FAST" = 0 ]; then
  start build bun run build
  wait
fi

for name in $ORDER; do
  if [ "$(cat "$DIR/$name.rc")" = 0 ]; then
    PASSED="$PASSED $name"
    echo "  ok    $name"
  else
    FAILED="$FAILED $name"
    echo "  FAIL  $name"
    tail -n 25 "$DIR/$name.log" | sed 's/^/        /'
  fi
done

if [ "$FAST" = 1 ]; then
  echo "  skip  build (writes .next/)"
fi

echo

if [ -n "$FAILED" ]; then
  echo "FAILED:$FAILED"
  echo "Passed:$PASSED"
  exit 1
fi

if [ "$FAST" = 1 ]; then
  echo "Fast gates green; build not run."
else
  echo "All gates green."
fi
