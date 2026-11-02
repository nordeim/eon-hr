#!/usr/bin/env python3
# r121-mutations.py — the mutation matrix for the R121-A range-triple cure.
# Each mutation reverts ONE arm of the cure in isolation, runs the named
# spec set, and asserts the exact RED count. The sync arm (the
# proto-desync pin) rides every source mutation by design (+1 each).
import subprocess, re, shutil, sys

REPO = "/home/z/my-project/eon-hr"
SRC = f"{REPO}/src/lib/cv-text.ts"
BACKUP = "/tmp/r121-cv-text-backup.ts"
shutil.copy(SRC, BACKUP)
src = open(SRC).read()

import json as J, os
def run_specs(label, expect_red):
    out = f"{REPO}/.vitest/json/output.json"
    if os.path.exists(out):
        os.remove(out)  # the stale-json trap: assert freshness, never trust a leftover
    r = subprocess.run(
        ["bunx", "vitest", "run", "tests/unit/cv-text.test.ts", "tests/unit/script-portability.test.ts", "--reporter=json"],
        cwd=REPO, capture_output=True, text=True, timeout=300)
    if r.returncode == 0 and expect_red > 0:
        print(f"{label}: rc 0 but expected {expect_red} RED — *** MISMATCH ***")
        return False
    if not os.path.exists(out):
        print(f"{label}: NO REPORT (rc={r.returncode}) — *** MISMATCH ***")
        return False
    data = J.load(open(out))
    failed = data.get("numFailedTests", -1)
    print(f"{label}: failed {failed} (expected {expect_red}) {'OK' if failed == expect_red else '*** MISMATCH ***'}")
    return failed == expect_red

# M1 — the range-reading block removed entirely (the pre-cure state for the
# range class): the hunt spec goes RED (the blind class returns)
m1 = src.replace("""      if (ranges) {
        let pairsValid = true;
        for (let i = 0; i + 2 < nums.length; i += 2) {
          if (!(nums[i + 2] > nums[i]) || !(nums[i + 1] > 0)) { pairsValid = false; break; }
        }
        if (!pairsValid) {
          for (let i = 0; i < nums.length; i += 3) {
            for (let c = nums[i]; c <= nums[i + 1]; c++) out.set(c, nums[i + 2]);
          }
          return out;
        }
      }""", "      void ranges; // M1: the range reading removed")
assert m1 != src, "M1 anchor not found"

# M2 — the expansion collapses to the single-CID form (no range fill):
# code 62 ('d') goes missing -> blind -> the hunt spec RED
m2 = src.replace("""          for (let i = 0; i < nums.length; i += 3) {
            for (let c = nums[i]; c <= nums[i + 1]; c++) out.set(c, nums[i + 2]);
          }""", """          for (let i = 0; i < nums.length; i += 3) out.set(nums[i], nums[i + 2]); // M2: no expansion""")
assert m2 != src, "M2 anchor not found"

# M3 — the pair-validity guard dropped (ranges always win when range-valid):
# the pairs sequence mis-reads -> the pair-preservation guard RED
m3 = src.replace("""        if (!pairsValid) {
          for (let i = 0; i < nums.length; i += 3) {
            for (let c = nums[i]; c <= nums[i + 1]; c++) out.set(c, nums[i + 2]);
          }
          return out;
        }""", """        { // M3: the pair-validity guard dropped
          for (let i = 0; i < nums.length; i += 3) {
            for (let c = nums[i]; c <= nums[i + 1]; c++) out.set(c, nums[i + 2]);
          }
          return out;
        }""")
assert m3 != src, "M3 anchor not found"

results = []
# M3 expects 1: the pair-validity guard protects the both-valid ambiguity
# class, whose behavioral surface is EMPTY (the in-round design finding —
# both readings yield near-identical maps; documented in the spec file).
# Only the sync arm (the proto-desync pin) trips.
for label, mutated, expect in (("M1 [the range reading removed]", m1, 2),
                               ("M2 [the expansion collapsed]", m2, 2),
                               ("M3 [the pair-validity guard dropped]", m3, 1)):
    open(SRC, "w").write(mutated)
    results.append(run_specs(label, expect))

shutil.copy(BACKUP, SRC)
print("source restored:", open(SRC).read() == src)
sys.exit(0 if all(results) else 1)
