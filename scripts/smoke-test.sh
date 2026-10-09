#!/usr/bin/env bash
# smoke-test.sh — post-deploy smoke for the Eon HR standalone build
# (session-4 rewrite of the scaffold-era script: tests THIS app's surface —
# health, auth, rate limiting, the employees API and module pages).
#
# Usage: ./scripts/smoke-test.sh        (repo root; needs `bun run build`)
set -euo pipefail
cd "$(dirname "$0")/.."

CJ="/tmp/eon-smoke-cookies.txt"
BASE="http://localhost:3000"
EMAIL="sepnetflix2023@outlook.com"
PASSWORD='$Abcd1234'

PASS=0; FAIL=0
say() { printf '%s\n' "$*"; }
ok()  { PASS=$((PASS+1)); say "PASS: $*"; }
bad() { FAIL=$((FAIL+1)); say "FAIL: $*"; }

# ---- 0. clean slate ----
pkill -f "standalone/server.js" 2>/dev/null || true
sleep 1
rm -f "$CJ" /tmp/smoke-*.json

# ---- 1. boot server ----
# Pin the DB URL explicitly: a relative `file:` URL resolves against
# prisma/schema.prisma (via src/lib/db-path.ts) exactly like the CLI, while
# an inherited absolute DATABASE_URL (e.g. a parent-workspace path exported
# by the operator's shell) passes through untouched and the server boots
# against a database that does not exist (Error code 14). The Playwright
# webServer pins its own value the same way (playwright.config.ts).
DATABASE_URL="file:../db/custom.db" \
bun .next/standalone/server.js > /tmp/smoke-server.log 2>&1 < /dev/null &
SRV=$!
disown $SRV 2>/dev/null || true
trap 'kill $SRV 2>/dev/null || true' EXIT

ready=0
for i in $(seq 1 40); do
  if curl -s --max-time 2 "$BASE/api/health" | grep -q '"ok"'; then ready=1; break; fi
  sleep 1
done
if [ "$ready" != "1" ]; then
  echo "ERROR: server did not become ready"; tail -5 /tmp/smoke-server.log; exit 1
fi
ok "server ready + /api/health ok"

# ---- 2. auth surface ----
code=$(curl -s -o /tmp/smoke-login.json -w '%{http_code}' -c "$CJ" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" "$BASE/api/auth/login")
[ "$code" = "200" ] && grep -q '"ok":true' /tmp/smoke-login.json \
  && ok "login (200, ok)" || bad "login -> $code $(cat /tmp/smoke-login.json | head -c 120)"

code=$(curl -s -o /tmp/smoke-bad.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d '{"email":"nobody@eon-hr.test","password":"wrong-password"}' "$BASE/api/auth/login")
[ "$code" = "401" ] && ok "invalid credentials rejected (401)" || bad "invalid login -> $code"

# ---- 3. authenticated API surface ----
code=$(curl -s -o /tmp/smoke-emp.json -w '%{http_code}' -b "$CJ" "$BASE/api/employees")
[ "$code" = "200" ] && grep -q '"ok":true' /tmp/smoke-emp.json \
  && ok "GET /api/employees (200, ok)" || bad "employees -> $code"

code=$(curl -s -o /tmp/smoke-post.json -w '%{http_code}' -b "$CJ" \
  -H 'Content-Type: application/json' -d '{}' "$BASE/api/employees")
[ "$code" = "400" ] || [ "$code" = "422" ] \
  && ok "unauthenticated-shaped POST rejected ($code)" || bad "bad POST -> $code"

code=$(curl -s -o /tmp/smoke-emp.json -w '%{http_code}' "$BASE/api/employees")
[ "$code" = "401" ] && ok "unauthenticated API rejected (401)" || bad "unauth employees -> $code"

# ---- 4. page surface (redirects for logged-out visitors) ----
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/dashboard")
[ "$code" = "307" ] && ok "logged-out /dashboard redirects (307)" || bad "dashboard -> $code"

code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/login")
[ "$code" = "200" ] && ok "/login renders (200)" || bad "login page -> $code"

# ---- 5. logout ----
code=$(curl -s -o /tmp/smoke-logout.json -w '%{http_code}' -b "$CJ" -c "$CJ" \
  -X POST "$BASE/api/auth/logout")
[ "$code" = "200" ] && ok "logout (200)" || bad "logout -> $code"

say ""
say "RESULT: $PASS passed, $FAIL failed"
[ "$FAIL" = "0" ] || exit 1
