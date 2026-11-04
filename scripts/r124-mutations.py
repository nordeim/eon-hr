#!/usr/bin/env python3
# r124-mutations.py — the mutation matrix for the R124-A/B cures (the
# indirect-/Font dictionary resolution + the odd-length /W
# pair-invalidity). Each mutation reverts or inverts ONE arm in isolation,
# runs the named spec set, and asserts the exact RED count. The runner
# resyncs the proto after every mutation (the D-120a discipline), so the
# sync arm stays green by construction — the behavioral specs are the
# measured surface.
import subprocess, re, shutil, sys

REPO = "/home/z/my-project/eon-hr"
SRC = f"{REPO}/src/lib/cv-text.ts"
BACKUP = "/tmp/r124-cv-text-backup.ts"
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

# M1 — the raw-site fontRef queue re-gated by the false pair (the HEAD's
# else-if chain): the indirect-/Font spec goes RED — the FormXob false
# pair suppresses the queue and the page stays blind (+ the sync arm)
m1 = src.replace("""        if (fonts.size) refs.forEach((r) => pageFonts.set(r, fonts));
        if (!fonts.size && res) pendingRes.push({ contents: refs, res: parseInt(res[1], 10) });
        // R124-A: the indirect-/Font queue fires WHENEVER the page carries
        // the form — the HEAD's else-if chain let a false F-prefixed pair
        // (the ReportLab FormXob.<hex> XObject entry) suppress it; the
        // post-walk resolution REPLACES the false-pair map (the fontRef
        // target's pairs are the page's REAL bindings).
        if (fontRef !== null) pendingFontRef.push({ contents: refs, fontRef }); // R124-A: always queue""", """        if (fonts.size) refs.forEach((r) => pageFonts.set(r, fonts));
        else if (res) pendingRes.push({ contents: refs, res: parseInt(res[1], 10) });
        else if (fontRef !== null) pendingFontRef.push({ contents: refs, fontRef }); // M1: the queue re-gated by the false pair""")
assert m1 != src, "M1 anchor not found"
open(SRC, "w").write(m1)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M1 [the raw-site fontRef queue re-gated]", 1)  # the indirect-/Font spec
restore()

# M2 — the replace semantics weakened (the resolution skips a present
# entry): the false-pair map SURVIVES the resolution and the page stays
# bound to the XObject name — the indirect-/Font spec goes RED (+ the
# sync arm)
m2 = src.replace("""  for (const p of pendingFontRef) {
    const fonts = objFonts.get(p.fontRef);
    if (fonts) p.contents.forEach((c) => pageFonts.set(c, fonts));
  }""", """  for (const p of pendingFontRef) {
    const fonts = objFonts.get(p.fontRef);
    if (fonts) p.contents.forEach((c) => { if (!pageFonts.has(c)) pageFonts.set(c, fonts); }); // M2: no replace — the false pair survives
  }""")
assert m2 != src, "M2 anchor not found"
open(SRC, "w").write(m2)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M2 [the fontRef replace semantics weakened]", 1)  # the indirect-/Font spec (the false pair survives)
restore()

# M3 — the odd-length invalidity dropped (the R121-A standing form): the
# 3-token pair reading returns with its dangling discard — the odd-length
# /W spec goes RED (+ the sync arm)
m3 = src.replace("""        let pairsValid = nums.length % 2 === 0;""", """        let pairsValid = true; // M3: the odd-length invalidity dropped""")
assert m3 != src, "M3 anchor not found"
open(SRC, "w").write(m3)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M3 [the odd-length invalidity dropped]", 1)  # the odd-length /W spec
restore()

# M4 — the range expansion dropped (the R121-A arm itself): BOTH the
# odd-length /W spec AND the r121 range-triple spec go RED — the expansion
# is the shared load-bearing arm of both rounds (+ the sync arm)
m4 = src.replace("""        if (!pairsValid) {
          for (let i = 0; i < nums.length; i += 3) {
            for (let c = nums[i]; c <= nums[i + 1]; c++) out.set(c, nums[i + 2]);
          }
          return out;
        }""", """        if (!pairsValid) {
          // M4: the range expansion dropped
        }""")
assert m4 != src, "M4 anchor not found"
open(SRC, "w").write(m4)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M4 [the range expansion dropped]", 2)  # the odd-length /W spec + the r121 range-triple spec
restore()

# M5 — the oddness INVERTED (even lengths invalid): the 3-token form's
# pair reading returns (odd -> pairsValid true) — the odd-length /W spec
# goes RED; the r121 even-length fixtures keep their standing readings
# (their pairsValid loop failures predate the parity init) (+ the sync arm)
m5 = src.replace("""        let pairsValid = nums.length % 2 === 0;""", """        let pairsValid = nums.length % 2 !== 0; // M5: the oddness inverted""")
assert m5 != src, "M5 anchor not found"
open(SRC, "w").write(m5)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M5 [the oddness inverted]", 1)  # the odd-length /W spec
restore()

print("MUTATION MATRIX " + ("EXACT" if ok else "MISMATCH"))
sys.exit(0 if ok else 1)
