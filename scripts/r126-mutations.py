#!/usr/bin/env python3
# r126-mutations.py — the mutation matrix for the R126-A/B/C cures (the
# general-name form binding, the raw-page region merge, and the empty-show
# zero-content + the clean-emission sep reset). Each mutation reverts or
# inverts ONE arm in isolation, runs the named spec set, and asserts the
# exact RED count. The runner resyncs the proto after every mutation (the
# D-120a discipline), so the sync arm stays green by construction.
import subprocess, shutil, sys

REPO = "/home/z/my-project/eon-hr"
SRC = f"{REPO}/src/lib/cv-text.ts"
BACKUP = "/tmp/r126-cv-text-backup.ts"
shutil.copy(SRC, BACKUP)
src = open(SRC).read()

import json as J, os
def run_specs(label, expect_red):
    out = f"{REPO}/.vitest/json/output.json"
    if os.path.exists(out):
        os.remove(out)  # the stale-json trap
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

# M1 — the R126-A form binding reverted to the F-scan gate: the hyphen-name
# form's own pairs never bind, the candidate chain misbinds, the block
# blinds, the split never fires — the hyphen spec goes RED
m1 = src.replace("""        const formGpairs = fontPairsOf(body);
        if (formGpairs.size) {
          for (const [k, v] of formGpairs) fonts.set(k, v);
        }
        if (fonts.size && /\\/Subtype\\s*\\/Form\\b/.test(body)) {
          pageFonts.set(parseInt(rm[1], 10), fonts);
        }""", """        if (fonts.size && /\\/Subtype\\s*\\/Form\\b/.test(body)) { // M1: the F-scan gate restored
          pageFonts.set(parseInt(rm[1], 10), fonts);
        }""")
assert m1 != src, "M1 anchor not found"
open(SRC, "w").write(m1)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M1 [the form binding reverted to the F-scan gate]", 1)
restore()

# M2 — the R126-B raw-page merge dropped: the raw page's T1_N pairs never
# bind, the candidate chain resolves the FIRST declaration — the page spec
# goes RED
m2 = src.replace("""        // R126-B: the raw-site region-pairs merge — the ObjStm page site's
        // own form (its r120 comment names "the IRS T1_0 class" but the IRS
        // pages are RAW-carried; the raw site never received the merge).
        // A page with inline /Resources /Font << /T1_0 … >> pairs — names
        // the F-scan rejects — bound nothing and its content streams
        // resolved through the candidate chain (the FIRST same-named
        // declaration in file order, possibly ANOTHER page's font).
        for (const [k, v] of fontPairsOf(body)) fonts.set(k, v);
        const res = body.match(/\\/Resources\\s+(\\d+)\\s+0\\s+R/);""", """        const res = body.match(/\\/Resources\\s+(\\d+)\\s+0\\s+R/); // M2: the raw-page merge dropped""")
assert m2 != src, "M2 anchor not found"
open(SRC, "w").write(m2)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M2 [the raw-page region merge dropped]", 1)
restore()

# M3 — the R126-C literal empty-show reverted to the standing blind: the
# empty piece loses bx, the trailing pair's upgrade never fires — the
# empty-literal spec goes RED
m3 = src.replace("""            // R126-C: the EMPTY show — a known zero-content event, never a
            // blind: the piece takes the block's current tracked position
            // (a zero-width occupant) and the block KEEPS tracking (the
            // R125-B known-zero doctrine's mirror). A genuinely-odd raw
            // (a dangling byte) keeps the standing conservative blind.
            if (raw.length === 0) { (piece as { bx?: number }).bx = origin + adv; continue; }
            if (raw.length % 2 !== 0) { blind = true; continue; }""", """            if (raw.length === 0 || raw.length % 2 !== 0) { blind = true; continue; } // M3: the standing blind restored""")
assert m3 != src, "M3 anchor not found"
open(SRC, "w").write(m3)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M3 [the literal empty-show blind restored]", 1)
restore()

# M4 — the R126-C hex empty-show reverted: the whitespace-only atom blinds
# the block — the empty-hex spec goes RED
m4 = src.replace("""          // R126-C: the EMPTY hex show — the same zero-content class as the
          // empty literal (advances nothing, blinds nothing)
          if (hx.length === 0) { (piece as { bx?: number }).bx = origin + adv; continue; }
          if (hx.length % per !== 0 || !/^[0-9A-Fa-f]+$/.test(hx)) { blind = true; continue; }""", """          if (hx.length === 0 || hx.length % per !== 0 || !/^[0-9A-Fa-f]+$/.test(hx)) { blind = true; continue; } // M4: the standing blind restored""")
assert m4 != src, "M4 anchor not found"
open(SRC, "w").write(m4)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M4 [the hex empty-show blind restored]", 1)
restore()

# M5 — the R126-C clean-emission sep reset dropped: the upgrade lands on
# the empty piece's standing space ("SeniorHRManager \\nTechCorp") — BOTH
# empty-show specs (the literal + the hex) go RED: the sep reset serves the
# clean form for the whole zero-content class
m5 = src.replace("""      // R126-C: the zero-text pieces immediately before the boundary (the
      // empty shows) — their walk-time separators are boundary artifacts
      // riding the writer's join, and the upgrade must land CLEAN (the
      // never-" \\n" doctrine): reset their separators so the newline
      // replaces the whole separation, exactly as pdftotext reads the row.
      for (let k = i - 1; k >= 0; k--) {
        const dk = decoded[k] as { text?: string; p?: { sep?: string } };
        if ((dk.text ?? "").length > 0) break;
        if (dk.p) dk.p.sep = "";
      }
      if (decoded[j] !== undefined""", """      if (decoded[j] !== undefined""")
assert m5 != src, "M5 anchor not found"
open(SRC, "w").write(m5)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M5 [the clean-emission sep reset dropped]", 2)
restore()

# M6 — the odd-raw fire-separation inverted (the odd raw treated as
# zero-content): the dangling byte pairs into a NaN code that may ADVANCE a
# positive default — the odd-guard spec PLUS the 7 historical specs whose
# fixtures carry odd raws whose BLIND is load-bearing (the R118-A Skia
# em-dash + 0.5-em guards, the R121-A over-reach, the R122-B dots re-order,
# the R123-A squeezed + disjointness, the R125-B uncovered-code guard) —
# 8 RED: the conservative blind is deeply pinned across the fixture family
m6 = src.replace("""            if (raw.length % 2 !== 0) { blind = true; continue; }""", """            { (piece as { bx?: number }).bx = origin + adv; continue; } // M6: the odd raw treated as zero-content""")
assert m6 != src, "M6 anchor not found"
open(SRC, "w").write(m6)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M6 [the odd-raw conservative blind inverted]", 8)
restore()

print("MUTATION MATRIX " + ("EXACT" if ok else "*** MISMATCH ***"))
sys.exit(0 if ok else 1)
