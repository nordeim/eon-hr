#!/usr/bin/env bash
# Header map per route using the shared probe file.
# Usage: collect-header-map.sh <base-url> <session|-> route...
BASE="$1"; shift
SESSION="$1"; shift
JS="$(cat /home/z/eon-hr/scripts/probe-r4-hmap.js)"
SESS=()
if [ "$SESSION" != "-" ]; then SESS=(--session "$SESSION"); fi
for route in "$@"; do
  agent-browser open "$BASE$route" "${SESS[@]}" >/dev/null 2>&1
  sleep 2.2
  result=$(agent-browser eval "$JS" "${SESS[@]}" 2>/dev/null | tail -1)
  echo "$route => $result"
done
