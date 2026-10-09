#!/usr/bin/env bash
# Dual-session DOM probe: given a route + JS expression file, evaluate on both
# the reference (default session) and the local clone (--session loc) and
# print both results side by side for diffing.
# Usage: ./scripts/probe-dual.sh <url-path> <js-file>
set -u
ROUTE="${1:?route}"
JS="${2:?js-file}"
echo "=== REF $ROUTE ==="
agent-browser open "https://eon.base44.app$ROUTE" >/dev/null 2>&1
sleep 2
agent-browser eval "$(cat "$JS")" 2>&1
echo ""
echo "=== LOC $ROUTE ==="
agent-browser --session loc open "http://localhost:3000$ROUTE" >/dev/null 2>&1
sleep 2
agent-browser --session loc eval "$(cat "$JS")" 2>&1
