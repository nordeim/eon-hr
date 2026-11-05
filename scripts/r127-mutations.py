#!/usr/bin/env python3
# r127-mutations.py — the mutation matrix for the R127-A cure (the
# pen-continues join) + the D-127a guard (the boundary-blind slice). Each
# mutation reverts or drops ONE arm in isolation, runs the named spec set,
# and asserts the exact RED count. The runner resyncs the proto after every
# source mutation (the D-120a discipline), so the sync arm stays green by
# construction.
import subprocess, shutil, sys, json as J, os

REPO = "/home/z/my-project/eon-hr"
SRC = f"{REPO}/src/lib/cv-text.ts"
CSS = f"{REPO}/src/app/globals.css"
TOK = f"{REPO}/tests/unit/tokens.test.ts"
BACKUP = "/tmp/r127-mut-backup.ts"
CSS_BACKUP = "/tmp/r127-mut-globals-backup.css"
TOK_BACKUP = "/tmp/r127-mut-tokens-backup.ts"
shutil.copy(SRC, BACKUP)
shutil.copy(CSS, CSS_BACKUP)
shutil.copy(TOK, TOK_BACKUP)
src = open(SRC).read()

def run_specs(label, expect_red, files=("tests/unit/cv-text.test.ts", "tests/unit/script-portability.test.ts")):
    out = f"{REPO}/.vitest/json/output.json"
    if os.path.exists(out):
        os.remove(out)  # the stale-json trap
    r = subprocess.run(["bunx", "vitest", "run", *files, "--reporter=json"],
                       cwd=REPO, capture_output=True, text=True, timeout=300)
    if not os.path.exists(out):
        print(f"{label}: NO REPORT (rc={r.returncode}) — *** MISMATCH ***")
        return False
    data = J.load(open(out))
    # numFailedTests only — the JSON reporter also counts a failing test's
    # describe block as a "failed suite", which would double-count. A
    # module-level throw (the D-127a guard) reports 0 failed tests but a
    # non-zero rc: the rc is the load-failure signal.
    failed = data.get("numFailedTests", -1)
    if failed < 0:
        failed = 0 if r.returncode == 0 else 1
    print(f"{label}: failed {failed} (expected {expect_red}) {'OK' if failed == expect_red else '*** MISMATCH ***'}")
    return failed == expect_red

def restore():
    shutil.copy(BACKUP, SRC)
    subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)

ok = True

# M1 — the pen-continues cure line dropped: the standing " " returns for the
# whole Class A — the three R127-A specs go RED
m1 = src.replace("""    if (!moved && pieces.length > 0 && showOpSeq !== lastPushSeq && !nonTextTouched) sep = "";
""", "")
assert m1 != src, "M1 anchor not found"
open(SRC, "w").write(m1)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M1 [the pen-continues cure line dropped]", 4)
restore()

# M2 — the Tm sticky setter dropped: the per-word-Tm title class joins
# ("Form1040") — the Tm-title guard goes RED
m2 = src.replace("""      nonTextTouched = true; // R127-A: a positioning op — sticky (the origin-to-origin delta rule may leave moved=false, the memory must not)
""", "")
assert m2 != src, "M2 anchor not found"
open(SRC, "w").write(m2)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M2 [the Tm sticky setter dropped]", 1)
restore()

# M3 — the BT sticky setter dropped: the unpositioned-BT class joins — the
# R116-A unpositioned guard ("First Second") goes RED
m3 = src.replace("""      nonTextTouched = true; // R127-A: a new text object — sticky
""", "")
assert m3 != src, "M3 anchor not found"
open(SRC, "w").write(m3)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M3 [the BT sticky setter dropped]", 1)
restore()

# M4 — the Td sticky setter dropped: ZERO kills expected — the structural
# redundancy documented (the only not-moved Td path is the FRESH branch,
# which requires a BT — the BT setter independently holds the flag; the Td
# setter is retained as defense-in-depth for future fresh-branch changes)
m4 = src.replace("""      nonTextTouched = true; // R127-A: a positioning op — sticky
""", "")
assert m4 != src, "M4 anchor not found"
open(SRC, "w").write(m4)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M4 [the Td sticky setter dropped — the documented redundancy]", 0)
restore()

# M5a — the lastPushSeq update dropped: the TJ-internal no-number atoms join
# (showOpSeq never matches lastPushSeq) — the W3C dummy.pdf pin goes RED
m5a = src.replace("""    lastPushSeq = showOpSeq;
""", "")
assert m5a != src, "M5a anchor not found"
open(SRC, "w").write(m5a)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M5a [the lastPushSeq update dropped]", 2)
restore()

# M5b — the nonTextTouched clear dropped: the flag stays true forever — the
# cure never fires — the three R127-A specs go RED
m5b = src.replace("""    nonTextTouched = false;
""", "")
assert m5b != src, "M5b anchor not found"
open(SRC, "w").write(m5b)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M5b [the nonTextTouched clear dropped]", 4)
restore()

# M6 — the showOpSeq increment dropped: every piece reads same-op — the cure
# never fires — the three R127-A specs go RED
m6 = src.replace("""    if (m[4] !== undefined || m[6] !== undefined || m[7] !== undefined) showOpSeq++; // R127-A: a new show op begins
""", "")
assert m6 != src, "M6 anchor not found"
open(SRC, "w").write(m6)
subprocess.run(["bun", "scripts/protos/sync-proto.mjs"], cwd=REPO, capture_output=True)
ok &= run_specs("M6 [the showOpSeq increment dropped]", 4)
restore()

# M7 — the D-127a guard leg: mutate globals.css's "@layer base" marker (the
# theme slice's END marker — an END-marker miss is the vacuous-pass class:
# the slice swallows to EOF and the assertions match anywhere) and run the
# tokens suite. WITH the guard: the suite fails LOUDLY (the marker-miss
# throw — 0 failed tests, rc != 0, the module-level throw). WITHOUT the
# guard (the original slice code restored): the mutation passes VACUOUSLY
# — the guard's value proven by the difference.
css = open(CSS).read()
assert "@layer base" in css, "M7: the @layer base marker not found in globals.css"
mutated = css.replace("@layer base", "@layerbase", 1)
open(CSS, "w").write(mutated)
r7a = subprocess.run(["bunx", "vitest", "run", "tests/unit/tokens.test.ts"], cwd=REPO, capture_output=True, text=True, timeout=300)
print(f"M7a [globals.css END marker mutated, WITH the D-127a guard]: rc {r7a.returncode} " + ("OK (the loud throw)" if r7a.returncode != 0 else "*** MISMATCH — the guard did not fire ***"))
ok &= r7a.returncode != 0
shutil.copy(CSS_BACKUP, CSS)

tok = open(TOK).read()
tok_orig = tok.replace("""const root = noComments(sliceBetween(css, ":root", ".dark {", "root"));
const dark = noComments(sliceBetween(css, ".dark {", "@theme inline", "dark"));
const theme = noComments(sliceBetween(css, "@theme inline", "@layer base", "theme"));""",
"""const root = css.slice(css.indexOf(":root"), css.indexOf(".dark {")); // M7b: the guard reverted
const dark = css.slice(css.indexOf(".dark {"), css.lastIndexOf("@theme inline"));
const theme = css.slice(css.lastIndexOf("@theme inline"), css.indexOf("@layer base"));""")
assert tok_orig != tok, "M7b anchor not found"
open(TOK, "w").write(tok_orig)
open(CSS, "w").write(mutated)
r7b = subprocess.run(["bunx", "vitest", "run", "tests/unit/tokens.test.ts"], cwd=REPO, capture_output=True, text=True, timeout=300)
print(f"M7b [globals.css END marker mutated, guard REVERTED]: rc {r7b.returncode} " + ("OK — THE VACUOUS PASS (the trap demonstrated)" if r7b.returncode == 0 else "*** MISMATCH — not vacuous ***"))
ok &= r7b.returncode == 0
shutil.copy(CSS_BACKUP, CSS)
shutil.copy(TOK_BACKUP, TOK)

print("\n" + ("MUTATION MATRIX EXACT" if ok else "*** MATRIX MISMATCH ***"))
sys.exit(0 if ok else 1)
