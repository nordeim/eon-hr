#!/usr/bin/env python3
# r122-mutations.py — the mutation matrix for the R122-B leader-dot
# line re-order cure. Each mutation reverts ONE arm in isolation, runs the
# named spec set, and asserts the exact RED count. The sync arm (the
# proto-desync pin) rides every source mutation by design (+1 each).
import subprocess, re, shutil, sys

REPO = "/home/z/my-project/eon-hr"
SRC = f"{REPO}/src/lib/cv-text.ts"
BACKUP = "/tmp/r122-cv-text-backup.ts"
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

ok = True

# M1 — the swap removed (the pre-cure state): the hunt spec goes RED
m1 = src.replace("""      const tmp = decoded[i - 1];
      decoded[i - 1] = decoded[i];
      decoded[i] = tmp;""", "      void lead; void entry; void lt; // M1: the swap removed")
assert m1 != src, "M1 anchor not found"
open(SRC, "w").write(m1)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M1 [the swap removed]", 1)
shutil.copy(BACKUP, SRC)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)

# M2 — the leader-shape regex dropped (any piece is a leader candidate):
# the MEASURED finding: 0 RED — the contiguity guard subsumes the IRS
# class on the fixture surface (the "leaderend" pair sits 9.5 em apart,
# beyond the window) — the shape guard is belt-and-suspenders here, its
# exclusive surface EMPTY on this corpus (the r121-M3 doctrine: an
# untestable spec gets replaced by the documented finding)
m2 = src.replace("""      if (!/^[ .]*\\d*$/.test(lt)) continue;
      if ((lt.match(/\\./g) ?? []).length < 2) continue;""", "      // M2: the leader-shape guard dropped")
assert m2 != src, "M2 anchor not found"
open(SRC, "w").write(m2)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M2 [the leader-shape guard dropped]", 0)
shutil.copy(BACKUP, SRC)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)

# M3 — the contiguity guard dropped: the non-contiguous guard spec goes RED
m3 = src.replace("""      if (ep.bx === undefined) continue;
      const gapEm = (lp.px - ep.bx) / Math.max(lp.ps, ep.ps);
      if (gapEm < -1 || gapEm > 3.5) continue;""", "      // M3: the contiguity guard dropped")
assert m3 != src, "M3 anchor not found"
open(SRC, "w").write(m3)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M3 [the contiguity guard dropped]", 1)
shutil.copy(BACKUP, SRC)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)

# M4 — the sep reset dropped (the leader keeps its walk-time "\n"): the
# MEASURED finding: 0 RED on the unit surface — the fixture's leader sep
# comes from the EMISSION-TIME R116-A upgrade (the q/cm block form's Tm
# resets per block, so the walk sep reads " "); the reset is load-bearing
# only on the real-member Td form (the 9.2-XPreformatted 2-dot row, whose
# walk-sep carried the row boundary) — proven by the live member
# verification, not by a spec (documented, the r121-M3 doctrine)
m4 = src.replace("""      const tp = (decoded[i] as { p?: { sep?: string } }).p;
      if (tp) tp.sep = " ";""", "      // M4: the sep reset dropped")
assert m4 != src, "M4 anchor not found"
open(SRC, "w").write(m4)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M4 [the sep reset dropped]", 0)
shutil.copy(BACKUP, SRC)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)

# the restore check — the cured tree is green again
ok &= run_specs("RESTORED", 0)
print("MUTATION MATRIX " + ("EXACT" if ok else "*** MISMATCH ***"))
sys.exit(0 if ok else 1)
