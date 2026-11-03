#!/bin/sh
# Lists the files changed since HEAD (or since the ref in $2) that are now byte-identical to the same path in a sibling checkout. After a port from the sibling, each of these was copied whole, so each can carry the sibling's behaviour as well as its lint fixes: review these first.
#
# Usage: sibling-identical.sh <sibling-root> [base-ref]
sibling=${1:?usage: sibling-identical.sh <sibling-root> [base-ref]}
base=${2:-HEAD}
git diff --name-only "$base" | while IFS= read -r file; do
  if [ -f "$file" ] && [ -f "$sibling/$file" ] && cmp -s "$file" "$sibling/$file"; then
    printf '%s\n' "$file"
  fi
done
