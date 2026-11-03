#!/usr/bin/env python3
# r123-mutations.py — the mutation matrix for the R123-A/B bare-number
# line re-order cures. Each mutation reverts ONE arm in isolation, runs the
# named spec set, and asserts the exact RED count. The runner resyncs the
# proto after every mutation (the D-120a discipline), so the sync arm stays
# green by construction — the behavioral specs are the measured surface.
import subprocess, re, shutil, sys

REPO = "/home/z/my-project/eon-hr"
SRC = f"{REPO}/src/lib/cv-text.ts"
BACKUP = "/tmp/r123-cv-text-backup.ts"
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

def restore():
    shutil.copy(BACKUP, SRC)
    subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)

ok = True

# M1 — the R123-A (squeezed) pass disabled: its swap spec goes RED (+ the
# sync arm rides every source mutation)
m1 = src.replace("""        if (squeezed) {
          // R123-A: the contiguity band + the TINY-ps guard (the IRS
          // fire-separation — a LARGER-ps number never fires)
          const gapEm = (np.px - ep.bx) / Math.max(np.ps, ep.ps);
          if (gapEm < -1 || gapEm > 3.5) continue;
          if (np.ps >= ep.ps) continue;
        } else {""", """        if (squeezed) {
          continue; // M1: the squeezed pass disabled
        } else {""")
assert m1 != src, "M1 anchor not found"
open(SRC, "w").write(m1)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M1 [the R123-A squeezed pass disabled]", 1)  # the squeezed swap spec
restore()

# M2 — the R123-A ps guard dropped: the IRS boxed-pair fixture fires the
# SQUEEZED pass (its contiguity band admits the 1.58-em pair; the
# boxed-pair guard lives only in the chapter pass) — the IRS guard spec
# goes RED (+ the sync arm)
m2 = src.replace("""          const gapEm = (np.px - ep.bx) / Math.max(np.ps, ep.ps);
          if (gapEm < -1 || gapEm > 3.5) continue;
          if (np.ps >= ep.ps) continue;""", """          const gapEm = (np.px - ep.bx) / Math.max(np.ps, ep.ps);
          if (gapEm < -1 || gapEm > 3.5) continue;
          // M2: the tiny-ps guard dropped""")
assert m2 != src, "M2 anchor not found"
open(SRC, "w").write(m2)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M2 [the R123-A tiny-ps guard dropped]", 1)  # the IRS boxed-pair guard spec (the squeezed pass fires the pair)
restore()

# M3 — the R123-B (chapter) pass disabled: its two swap specs go RED (+ the
# sync arm)
m3 = src.replace("""        } else {
          // R123-B: the ps axis (the chapter numbers render at the title's
          // OWN ps — the tiny squeezed numbers never fire here) ...
          if (np.ps < ep.ps) continue;""", """        } else {
          continue; // M3: the chapter pass disabled
          if (np.ps < ep.ps) continue;""")
assert m3 != src, "M3 anchor not found"
open(SRC, "w").write(m3)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M3 [the R123-B chapter pass disabled]", 2)  # the 2 chapter swap specs (far-right + mid-gap)
restore()

# M4 — the boxed-pair guard dropped: the IRS pair fires the chapter pass
# (ps 20 >= 12, no same-origin predecessor check) — the IRS guard spec
# goes RED (+ the sync arm)
m4 = src.replace("""          if (i >= 2) {
            const prev = decoded[i - 2] as { text?: string; p?: { px?: number; py?: number; ps?: number } };
            const pt = (prev.text ?? "").trim();
            const pp = prev.p;
            if (pp && pp.px !== undefined && pp.py !== undefined && pp.ps !== undefined) {
              if (/^\\d{1,3}$/.test(pt) && Math.abs(pp.px - np.px) < 0.1 * Math.max(pp.ps, np.ps) && Math.abs(pp.py - np.py) < 0.1 * Math.max(pp.ps, np.ps)) continue;
            }
          }""", """          // M4: the boxed-pair guard dropped""")
assert m4 != src, "M4 anchor not found"
open(SRC, "w").write(m4)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M4 [the boxed-pair guard dropped]", 1)  # the IRS boxed-pair guard spec (the chapter pass fires the pair)
restore()

# M5 — the sep resets dropped (the number keeps its walk-time sep): the
# glued form and the own-line form both lost — the two swap specs' form
# assertions go RED (+ the sync arm)
m5 = src.replace("""        const tp2 = (decoded[i] as { p?: { sep?: string } }).p;
        if (tp2) tp2.sep = squeezed ? "" : "\\n";""", """        const tp2 = (decoded[i] as { p?: { sep?: string } }).p;
        void tp2; // M5: the sep reset dropped""")
assert m5 != src, "M5 anchor not found"
open(SRC, "w").write(m5)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M5 [the sep resets dropped]", 3)  # the 3 form assertions (the glued form + the 2 own-line forms)
restore()

print("MUTATION MATRIX " + ("EXACT" if ok else "MISMATCH"))
sys.exit(0 if ok else 1)
