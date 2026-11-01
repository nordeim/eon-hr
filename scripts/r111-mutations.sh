#!/bin/bash
# r111-mutations.sh — the R111 mutation matrix (v2): each leg reverted in
# isolation must turn exactly its designed specs RED. M3 reverts the two
# regex lines to their git-HEAD form (line splicing — no string surgery).
set -u
cd /home/z/my-project/eon-hr
SRC=src/lib/cv-text.ts
cp "$SRC" /tmp/r111-src-green.ts

run_red() { bunx vitest run tests/unit/cv-text.test.ts 2>&1 | rg -c "×" || echo 0; }

echo "=== M1: the lit-CID decode removed (expect 2 RED) ==="
python3 - << 'EOF'
s = open('src/lib/cv-text.ts').read()
start = s.index('      // R111-A: the LITERAL-form CID decode')
end = s.index('      if (p.font && localFor(p.font).includes(MAC_ROMAN_CMAP)')
s = s[:start] + s[end:]
open('src/lib/cv-text.ts','w').write(s)
EOF
echo "RED count: $(run_red)"
cp /tmp/r111-src-green.ts "$SRC"

echo "=== M2: the lowercase class reverted at ALL five sites (expect 1 RED) ==="
python3 - << 'EOF'
s = open('src/lib/cv-text.ts').read()
n = s.count("([Ff]\\w+(?:\\.\\w+)*)\\s+(\\d+)\\s+0\\s+R")
s = s.replace("([Ff]\\w+(?:\\.\\w+)*)\\s+(\\d+)\\s+0\\s+R", "(F\\w+(?:\\.\\w+)*)\\s+(\\d+)\\s+0\\s+R")
print(f"  reverted {n} sites")
open('src/lib/cv-text.ts','w').write(s)
EOF
echo "RED count: $(run_red)"
cp /tmp/r111-src-green.ts "$SRC"

echo "=== M3: the nested-paren extension reverted (git-HEAD regex lines; expect 1 RED) ==="
python3 - << 'EOF'
import subprocess
cur = open('src/lib/cv-text.ts').read()
head = subprocess.run(['git','show','HEAD:src/lib/cv-text.ts'], capture_output=True, text=True, cwd='/home/z/my-project/eon-hr').stdout
# extract the ops regex line and the atomRe line from HEAD
def extract(text, marker):
    lines = text.split('\n')
    for i, l in enumerate(lines):
        if marker in l:
            # the ops line: "  const ops =" then the regex on the NEXT line
            return lines[i], lines[i+1] if marker == 'const ops =' else l
    raise SystemExit('marker not found: ' + marker)
h_ops_pre, h_ops = extract(head, 'const ops =')
h_atom = extract(head, 'const atomRe =')
cl = cur.split('\n')
for i, l in enumerate(cl):
    if 'const ops =' in l:
        # find the regex line (the next line containing '/\\S+')
        j = i + 1
        while '/\\S+' not in cl[j]: j += 1
        cl[j] = h_ops
    if 'const atomRe =' in l:
        cl[i] = h_atom
open('src/lib/cv-text.ts','w').write('\n'.join(cl))
print('  regex lines reverted to git-HEAD form')
EOF
echo "RED count: $(run_red)"
cp /tmp/r111-src-green.ts "$SRC"

echo "=== M4: the own-chain narrowed to the FULL localFor chain (expect 1 RED) ==="
python3 - << 'EOF'
s = open('src/lib/cv-text.ts').read()
n = s.count('const chain = ownChainFor(p.font);')
s = s.replace('const chain = ownChainFor(p.font);', 'const chain = localFor(p.font);')
print(f'  replaced {n} site(s)')
open('src/lib/cv-text.ts','w').write(s)
EOF
echo "RED count: $(run_red)"
cp /tmp/r111-src-green.ts "$SRC"

echo "=== restored: re-verify green ==="
echo "cv-text RED count after restore: $(run_red)"
