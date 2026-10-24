#!/usr/bin/env bash
# r87-renumber-pngs-2.sh — the SECOND merge renumber (+8): the session-87
# full-registry chain 1229-1287 -> 1237-1295 (odd numbers), clearing the
# tab-interior pass's published evidence at 1229/1231/1233/1235
# (payrollreports-monthly-control / -tax-interior / -history-interior /
# -custom-interior — those keep their numbers, published at 258e538).
#
# Cumulative: the original chain 1225-1283 -> (+4 companion merge) 1229-1287
# -> (+8 tab-interior merge) 1237-1295.
#
# Order: DESCENDING so each target (src+8) is free or already freed.
set -euo pipefail
cd "$(dirname "$0")/.."
cd docs/screenshots

moved=0
for n in $(seq 1287 -2 1229); do
  t=$((n + 8))
  for side in loc ref; do
    # exactly one file per (number, side) in my chain; the tab-interior
    # pass's files at 1229/1231/1233/1235 are all payrollreports-named
    src=$(ls "${n}-"*"-${side}.png" 2>/dev/null || true)
    case "$src" in
      *payrollreports*) echo "SKIP tab-interior evidence: $src"; continue ;;
    esac
    if [[ -z "$src" ]]; then echo "WARN: no ${side} file at number $n"; continue; fi
    if [[ "$src" == *$'\n'* ]]; then echo "FATAL: multi-match at $n: $src"; exit 1; fi
    base="${src#${n}-}"
    dst="${t}-${base}"
    if [[ -e "$dst" ]]; then echo "FATAL: target exists: $dst"; exit 1; fi
    git mv "$src" "$dst"
    moved=$((moved + 1))
  done
done
echo "moved $moved files"
echo "--- post-state: the 1225-1295 window (count per number):"
ls | grep -oE '^12(2[5-9]|[3-8][0-9]|9[0-5])-' | sort | uniq -c
