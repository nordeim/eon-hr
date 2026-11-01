#!/usr/bin/env python3
# r116-mutations.py — the four-leg mutation matrix for R116-A. Each leg
# reverted in isolation on the source, the cv-text spec file run, the RED
# count reported; the green source restored + re-verified after.
import subprocess, shutil, sys

SRC = "src/lib/cv-text.ts"
GREEN = "/tmp/r116-source-green.ts"

RULE = '''      if (sep === " " && i > 0 && p.py !== undefined && p.ps !== undefined) {
        const q = decoded[i - 1].p;
        if (q.py !== undefined && q.ps !== undefined) {
          if (Math.abs(p.py - q.py) >= 0.5 * Math.max(q.ps, p.ps)) sep = "\\n";
        }
      }'''

MUTATIONS = {
    "M1 (the rule removed)": ("", None),
    "M2 (the sep guard removed — fires on any separator)": (
        '''      if (i > 0 && p.py !== undefined && p.ps !== undefined) {
        const q = decoded[i - 1].p;
        if (q.py !== undefined && q.ps !== undefined) {
          if (Math.abs(p.py - q.py) >= 0.5 * Math.max(q.ps, p.ps)) sep = "\\n";
        }
      }''', None),
    "M3 (the threshold zeroed — fires on any nonzero delta)": (
        RULE.replace(">= 0.5 * Math.max(q.ps, p.ps)", ">= 0"), None),
    "M4 (the stamp guard removed — unpositioned pieces treated as stamped)": (
        '''      if (sep === " " && i > 0) {
        const q = decoded[i - 1].p;
        if (Math.abs((p.py ?? 0) - (q.py ?? 0)) >= 0.5 * Math.max(q.ps ?? 12, p.ps ?? 12)) sep = "\\n";
      }''', None),
}

def run_specs():
    out = subprocess.run(["bunx", "vitest", "run", "tests/unit/cv-text.test.ts"],
                         capture_output=True, text=True)
    for line in out.stdout.splitlines():
        if "Tests " in line:
            return line.strip()
    return "PARSE-FAIL: " + (out.stdout + out.stderr)[-300:]

src = open(SRC).read()
assert RULE in src, "the green rule not found in the source"
for name, (replacement, _) in MUTATIONS.items():
    shutil.copy(GREEN, SRC)
    mutated = open(SRC).read()
    assert RULE in mutated, f"{name}: anchor missing"
    open(SRC, "w").write(mutated.replace(RULE, replacement, 1))
    print(f"{name} → {run_specs()}")
shutil.copy(GREEN, SRC)
print(f"restored green → {run_specs()}")
