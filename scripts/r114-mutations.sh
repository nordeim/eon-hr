#!/usr/bin/env bash
# r114-mutations.sh — the mutation matrix for the session-114 fixes.
# Each mutation is applied in ISOLATION to src/lib/cv-text.ts, the unit
# suite runs, the RED count is recorded, the mutation is reverted, and the
# file is re-verified green after each.
set -u
cd /home/z/my-project/eon-hr
SRC=src/lib/cv-text.ts
cp "$SRC" /home/z/r114-src-backup.ts

run_suite() {
  env -u DATABASE_URL bunx vitest run tests/unit/cv-text.test.ts 2>&1 | grep -E "^.*Tests  " | head -1
}

echo "=== baseline (unmutated) ==="
run_suite

echo ""
echo "=== M1: R114-A removed (the census mask reverted to whole-stream) ==="
python3 - <<'EOF'
src = open('src/lib/cv-text.ts').read()
old = '''      for (let i = 0; i < text.length; i += stride) {
        if (inSpan(i)) continue; // literal payload — the syntax census skips it
        taken++;'''
new = '''      for (let i = 0; i < text.length; i += stride) {
        taken++;'''
assert old in src
open('src/lib/cv-text.ts','w').write(src.replace(old, new))
EOF
run_suite
cp /home/z/r114-src-backup.ts "$SRC"

echo ""
echo "=== M2: R114-B removed (the condKern marker never set) ==="
python3 - <<'EOF'
src = open('src/lib/cv-text.ts').read()
old = '''          const kernGap = kern !== 0 && !displayTracked && kern <= -100;'''
new = '''          const kernGap = false; // M2 MUTATION'''
assert old in src
open('src/lib/cv-text.ts','w').write(src.replace(old, new))
EOF
run_suite
cp /home/z/r114-src-backup.ts "$SRC"

echo ""
echo "=== M3: the genuine check removed (the collapse fires on any leading space) ==="
python3 - <<'EOF'
src = open('src/lib/cv-text.ts').read()
old = '''    return decoded
      .map(({ p, text, genuine }) => (p.condGap && hasSpaceGlyphs ? "" : p.condKern && genuine ? "" : p.sep) + text)
      .join("");'''
new = '''    return decoded
      .map(({ p, text }) => (p.condGap && hasSpaceGlyphs ? "" : p.condKern && text.startsWith(" ") ? "" : p.sep) + text)
      .join("");'''
assert old in src
open('src/lib/cv-text.ts','w').write(src.replace(old, new))
EOF
run_suite
cp /home/z/r114-src-backup.ts "$SRC"

echo ""
echo "=== M4: the hex genuine check removed (hex atoms never collapse) ==="
python3 - <<'EOF'
src = open('src/lib/cv-text.ts').read()
old = '''      if (p.kind === "hex")
        return { p, text: decodeHexString(p.hex, localFor(p.font)), genuine: hexLeadingIsSpace(p.hex, localFor(p.font)) };'''
new = '''      if (p.kind === "hex")
        return { p, text: decodeHexString(p.hex, localFor(p.font)), genuine: false }; // M4 MUTATION'''
assert old in src
open('src/lib/cv-text.ts','w').write(src.replace(old, new))
EOF
run_suite
cp /home/z/r114-src-backup.ts "$SRC"

echo ""
echo "=== restored — the final green verification ==="
run_suite
md5sum "$SRC" /home/z/r114-src-backup.ts
