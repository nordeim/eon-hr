#!/usr/bin/env python3
# r120-mutations.py — the mutation matrix: each cure reverted in isolation,
# the exact RED counts in the session-120 spec set, green restored after.
import subprocess, sys

SRC = "/home/z/my-project/eon-hr/src/lib/cv-text.ts"
PROTO = "/home/z/my-project/eon-hr/scripts/protos/cv-text-proto.ts"
SPECS = ["tests/unit/cv-text.test.ts", "tests/unit/script-portability.test.ts"]

import os as _os
def run_tests():
    env = {k: v for k, v in _os.environ.items() if k != "DATABASE_URL"}
    r = subprocess.run(
        ["bunx", "vitest", "run", *SPECS, "--reporter=json"],
        capture_output=True, text=True, cwd="/home/z/my-project/eon-hr",
        env=env, timeout=420,
    )
    if r.returncode != 0 and not _os.path.exists("/home/z/my-project/eon-hr/.vitest/json/output.json"):
        return ["<runner-error: " + r.stderr[:200] + ">"]
    import json
    with open("/home/z/my-project/eon-hr/.vitest/json/output.json") as f:
        data = json.load(f)
    failed = [t["fullName"] for t in data["testResults"] for t in t.get("assertionResults", []) if t["status"] == "failed"]
    return failed

src = open(SRC).read()
proto = open(PROTO).read()

def mutate(name, old, new, expect):
    s = open(SRC).read()
    assert old in s, f"[{name}] anchor missing"
    open(SRC, "w").write(s.replace(old, new))
    failed = run_tests()
    hits = [f for f in failed if "session 120" in f or "portability" in f]
    status = "EXACT" if len(hits) == expect else f"*** MISMATCH (want {expect}) ***"
    print(f"{name}: {len(hits)} RED {status}")
    for h in hits[:3]:
        print(f"    - {h.split(' > ')[-1]}")
    open(SRC, "w").write(s)  # restore

# M1: the deferred pass removed
mutate("M1 [the deferred pass removed]",
       "  if (widthsRef.size) {\n    const rawArray = new Map<number, string>();",
       "  if (false && widthsRef.size) {\n    const rawArray = new Map<number, string>();",
       2)

# M2: the fontPairsOf feeds neutralized (the helper returns nothing)
mutate("M2 [the general-name pairs neutralized]",
       "    return out;\n  };\n  const inlineFontRef = (body: string): number | null => {",
       "    return new Map<string, number>();\n  };\n  const inlineFontRef = (body: string): number | null => {",
       1)

# M3: the widthFor fallback removed
mutate("M3 [the pageMap-less fallback removed]",
       "        if (pageMap) return undefined;\n        const cands = fCandidates.get(font);",
       "        return undefined;\n        const cands = fCandidates.get(font);",
       1)

# M4: the kern sign restored
mutate("M4 [the kern sign restored]",
       "        if (piece.kv) adv -= (piece.kv / 1000) * piece.ps; // R120-D: a TJ number displaces by -K/1000 x ps (ISO 32000-1 9.4.3) — the word-gap kerns (-321) move RIGHT",
       "        if (piece.kv) adv += (piece.kv / 1000) * piece.ps;",
       1)

# M5: the leader guard removed
mutate("M5 [the leader guard removed]",
       "        if (leader) continue;\n      }\n      if (p.condGap && hasSpaceGlyphs) continue; // a join never upgrades (the R117-A guard form)",
       "        if (false && leader) continue;\n      }\n      if (p.condGap && hasSpaceGlyphs) continue; // a join never upgrades (the R117-A guard form)",
       1)

# M6: the Tw/Tz application removed
mutate("M6 [the Tw/Tz advance removed]",
       "          adv += ((w / 1000) + (we.codeLen === 1 && c === 32 ? twv : 0)) * piece.ps * (tz / 100);",
       "          adv += (w / 1000) * piece.ps;",
       1)

# DM1: a /tmp import re-planted in a script
scr = "/home/z/my-project/eon-hr/scripts/r119-bx-coverage.ts"
orig = open(scr).read()
open(scr, "w").write(orig.replace('await import("./protos/cv-text-proto")', 'await import("/tmp/r119-proto/cv-text")'))
failed = run_tests()
hits = [f for f in failed if "ban arm" in f]
print(f"DM1 [the /tmp import re-planted]: {len(hits)} RED {'EXACT' if len(hits) == 1 else '*** MISMATCH ***'}")
open(scr, "w").write(orig)

# DM2: the proto desynced
open(PROTO, "w").write(proto + "\n// desync\n")
failed = run_tests()
hits = [f for f in failed if "sync arm" in f]
print(f"DM2 [the proto desynced]: {len(hits)} RED {'EXACT' if len(hits) == 1 else '*** MISMATCH ***'}")
open(PROTO, "w").write(proto)

# final green check
failed = run_tests()
print(f"RESTORED: {len(failed)} failed (expect 0)")
