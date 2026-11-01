#!/usr/bin/env bash
# r112-mutations.sh — the R112-A mutation matrix. Each leg reverted in
# isolation must produce its EXACT designed RED count; the restored file
# re-verifies green after each.
set -u
cd /home/z/my-project/eon-hr
SRC=src/lib/cv-text.ts
cp "$SRC" /tmp/r112-src-backup.ts

count_red() {
  bunx vitest run tests/unit/cv-text.test.ts 2>&1 | grep -cE "^\s*(FAIL|✗|×)" || true
}

run_mutation() {
  local name="$1" expected="$2" old="$3" new="$4"
  python3 - "$old" "$new" <<'PYEOF'
import sys
old, new = sys.argv[1], sys.argv[2]
p = "/home/z/my-project/eon-hr/src/lib/cv-text.ts"
s = open(p).read()
assert s.count(old) == 1, f"mutation anchor count {s.count(old)}: {old[:70]!r}"
open(p, "w").write(s.replace(old, new))
PYEOF
  local red
  red=$(bunx vitest run tests/unit/cv-text.test.ts 2>&1 | grep -cE "^ FAIL" || true)
  echo "M[$name]: $red RED (expected $expected)"
  cp /tmp/r112-src-backup.ts "$SRC"
  local green
  green=$(bunx vitest run tests/unit/cv-text.test.ts 2>&1 | grep -cE "^ FAIL" || true)
  echo "  restored: $green RED (expect 0)"
}

# M1 — the repair REMOVED (the wiring): specs 1+2 RED
run_mutation "M1 repair removed" 2 \
  "  const parts = pending.map(({ objNum, pieces: rawPieces }) => {
    const pieces = repairHoistedPrefix(rawPieces); // R112-A: the hoisted-float merge (a no-op unless the seven-guard signature fires)" \
  "  const parts = pending.map(({ objNum, pieces: rawPieces }) => {
    const pieces = rawPieces;"

# M2 — the suffix-substance guard reverted: the TOC-tail spec RED
run_mutation "M2 suffix-substance guard" 1 \
  "  if (k > (2 / 3) * n) return pieces; // (c) the suffix-substance guard" \
  "  if (false) return pieces; // M2"
run_mutation "M2b column suffix-above" 1 \
  "  if (suffixTop <= prefixTop + HOIST_ASCENT) return pieces; // (d) the flow starts above every float" \
  "  if (false) return pieces; // M2b"

# M3 — the step2 guard reverted: spec 4 RED
run_mutation "M3 step2 guard" 1 \
  "  if (k + 1 >= n || pieces[k + 1].py! - pieces[k].py! < -3 * HOIST_ASCENT) return pieces;" \
  "  if (false) return pieces; // M3"

# M4 — the suffix-max guard reverted: spec 5 RED
run_mutation "M4 suffix-max guard" 1 \
  "  for (let i = k + 1; i < n; i++) if (pieces[i].py! > pieces[k].py!) return pieces;" \
  "  if (false) return pieces; // M4"

# M5 — the reading-band guard reverted: spec 6 RED
run_mutation "M5 reading-band guard" 1 \
  "  if (prefixTop < 0.25 * suffixTop) return pieces;" \
  "  if (false) return pieces; // M5"

# M6 — the explicit-positioning guard reverted: spec 7 RED
run_mutation "M6 explicit-positioning guard" 1 \
  "    if (!tlmExplicit) return null; // the BT-default origin — not a layout position" \
  "    // M6: the guard removed"

echo "=== matrix complete — final green check ==="
bunx vitest run tests/unit/cv-text.test.ts 2>&1 | grep -E "Tests "
