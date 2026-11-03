#!/bin/sh
# One batch of staged files for oxlint; `.husky/pre-commit` feeds it through `xargs -n`. One command line over every staged file overflows the 32767-character command-line limit of Windows ("The command line is too long"), so the hook cuts the list into batches and this script judges each one.
#
# oxlint has no parser for a file type it doesn't own (`.md`, `.json`, ...), so a batch of only those reports "No files found to lint" — success, not a finding. The exit status cannot say which happened: oxlint exits 1 for both, and `xargs` turns any status from 1 to 125 into 123, which an earlier version of the hook read as "no files" and so let every lint error through. The output can say, so it decides, and it decides per batch: a clean markdown batch cannot excuse a failing code batch, because `xargs` reports 123 as soon as one batch exits 1.
#
# Usage: oxlint-batch.sh <oxlint flags> <files>
if out=$(bun oxlint "$@" 2>&1); then
  printf '%s\n' "$out"
  exit 0
fi
printf '%s\n' "$out"
printf '%s\n' "$out" | grep -q "No files found to lint"
