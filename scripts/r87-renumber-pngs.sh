#!/usr/bin/env bash
# r87-renumber-pngs.sh — renumber the session-87 byte-chain PNGs +4
# (odd numbers 1225..1283 -> 1229..1287), clearing the numbering collision
# with the companion pass's staged evidence (1225-recruitment-userplus-*
# and 1227-mobile-drawer-moon-* keep their numbers).
#
# Order: DESCENDING source number so each target (src+4) is either free
# or already freed by an earlier move in this sequence.
set -euo pipefail
cd "$(dirname "$0")/.."
cd docs/screenshots

moved=0
for n in $(seq 1283 -2 1225); do
  t=$((n + 4))
  for side in loc ref; do
    # find the file numbered n with this side (name pattern: NNNN-<route>-<side>.png)
    src=$(ls "${n}-"*"-${side}.png" 2>/dev/null || true)
    # exclude the companion's staged evidence (never in this range's route names,
    # but guard anyway: companion numbers are 1225/1227 with recruitment-userplus
    # and mobile-drawer-moon route names)
    case "$src" in
      *recruitment-userplus*|*mobile-drawer-moon*) echo "SKIP companion evidence: $src"; continue ;;
    esac
    if [[ -z "$src" ]]; then echo "WARN: no ${side} file at number $n"; continue; fi
    # derive the target name: same route slug, new number
    base="${src#${n}-}";          # strip leading number
    dst="${t}-${base}"
    if [[ -e "$dst" ]]; then echo "FATAL: target exists: $dst"; exit 1; fi
    git mv "$src" "$dst"
    moved=$((moved + 1))
  done
done
echo "moved $moved files"
echo "--- post-state: files in the 1225-1287 window:"
ls | grep -oE '^12(2[5-9]|[3-8][0-9])-' | sort | uniq -c
