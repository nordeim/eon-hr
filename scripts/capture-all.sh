#!/usr/bin/env bash
# capture-all.sh — regenerate the complete docs/screenshots set in ONE
# invocation (session-4 rewrite). The capture targets localhost:3000 and
# expects an externally-started server, but this sandbox reaps background
# processes between shell invocations — the server and the captures must
# share one process tree. The wrapper also applies the P-2 discipline
# (reseed BEFORE capturing, verify pristine AFTER) and pins DATABASE_URL
# explicitly for every leg (the shell exports an absolute DATABASE_URL into
# a parent-workspace path that does not exist in this sandbox).
#
# Usage: ./scripts/capture-all.sh        (from the repo root; needs a build)
set -euo pipefail
cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"

BASE="http://localhost:3000"
OUT="${1:-docs/screenshots}"
DB_URL="file:${PROJECT_DIR}/db/custom.db"

# ---- 0. clean slate: no stale server, pristine DB -------------------------
pkill -f "standalone/server.js" 2>/dev/null || true
sleep 1

# Reseed to pristine 3/31/36 (the smoke suite may have left round-trip
# rows; P-2 in the session docs). Explicit env: the sandbox shell exports
# an absolute DATABASE_URL into a parent-workspace path that does not exist.
# The schema push first makes the leg idempotent on a fresh checkout (a
# bare db/custom.db has no tables and the seed would P2021).
DATABASE_URL="file:../db/custom.db" bun run db:push > /dev/null 2>&1
DATABASE_URL="file:../db/custom.db" bun run db:seed | tail -1

# ---- 1. boot the production standalone server ------------------------------
DATABASE_URL="file:../db/custom.db" \
bun .next/standalone/server.js > /tmp/capture-server.log 2>&1 < /dev/null &
SRV=$!
disown $SRV 2>/dev/null || true

cleanup() { kill $SRV 2>/dev/null || true; }
trap cleanup EXIT

ready=0
for i in $(seq 1 40); do
  if curl -s --max-time 2 "$BASE/api/health" | grep -q '"ok"'; then ready=1; break; fi
  sleep 1
done
if [ "$ready" != "1" ]; then
  echo "ERROR: server did not become ready"; tail -5 /tmp/capture-server.log; exit 1
fi
echo "server ready: $BASE"

# ---- 2. the full catalog (Playwright; logs in via the page; the wizard
# shots 04–07 are filled but never submitted, so no data is created) -----
DATABASE_URL="file:../db/custom.db" bun scripts/capture-screenshots.mjs

# ---- 3. verify pristine + shutdown ------------------------------------------
DATABASE_URL="$DB_URL" bun scripts/pristine-check.mjs
kill $SRV 2>/dev/null || true
trap - EXIT

echo "capture pass complete: $OUT (24 shots expected)"
