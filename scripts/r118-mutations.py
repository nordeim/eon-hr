#!/usr/bin/env python3
# r118-mutations.py — session 118 / parity round 117: the mutation matrix.
# Each leg reverts ONE piece of the R118-A design in isolation; the spec
# suite must show the EXACT designed RED signature; the file is restored
# and re-verified green after each leg.
#   M1 [the icon pre-pass removed]          -> exactly 3 RED (the split-asserting trio)
#   M2 [the threshold zeroed]               -> exactly 2 RED (BOTH sub-threshold guards fire: the Skia em-dash 0.89 em + the no-separator 0.5 em forms)
#   M3 [the zero-alnum anchor removed]      -> exactly 1 RED (the anchor guard — the alnum pair at 2 em fires)
#   M4 [the walk-back removed]              -> exactly 3 RED (the hunt trio — the adjacent-space gap reads 0)
import subprocess, shutil, sys, re, os

REPO = "/home/z/my-project/eon-hr"
SRC = f"{REPO}/src/lib/cv-text.ts"
BAK = "/tmp/r118-cv-text-backup.ts"
SPEC = "tests/unit/cv-text.test.ts"

shutil.copy(SRC, BAK)
orig = open(SRC).read()

ENV = {k: v for k, v in os.environ.items() if k != "DATABASE_URL"}

def run_suite():
    r = subprocess.run(
        ["bunx", "vitest", "run", SPEC, "-t", "session 118"],
        cwd=REPO, capture_output=True, text=True, timeout=300, env=ENV
    )
    out = r.stdout + r.stderr
    passed = re.findall(r"✓ ([^\n]+?) \d+ms", out)
    failed = re.findall(r"× ([^\n]+?) \d+ms", out)
    if not passed and not failed:
        print("   [runner output]", out[:400])
    return failed, passed

def apply(mutation):
    src = orig
    if mutation == "M1":
        anchor = "    const iconSplit = new Array<boolean>(decoded.length).fill(false);"
        end_anchor = "    decoded.forEach(({ p, text, genuine }, i) => {"
        i = src.find(anchor)
        j = src.find(end_anchor, i)
        assert i >= 0 and j >= 0, "M1 anchors"
        src = (src[:i] + anchor + "\n    // MUTATION M1: the icon pre-pass removed\n"
               + "    const iconDrop = new Set<number>();\n" + src[j:])
    elif mutation == "M2":
        src = src.replace("      if (gapEm < 0.95) continue; // the Skia em-dash band stays joined (0.89 em measured)",
                          "      if (gapEm < 0) continue; // MUTATION M2: the threshold zeroed")
        assert "MUTATION M2" in src
    elif mutation == "M3":
        src = src.replace("      if (/[A-Za-z0-9]/.test(bTxt)) continue;",
                          "      // MUTATION M3: the zero-alnum anchor removed")
        assert "MUTATION M3" in src
    elif mutation == "M4":
        src = src.replace("      let j = i - 1;\n      while (j >= 0) {\n        const dj = decoded[j] as { genuine?: boolean; text: string };\n        if (dj.genuine === true && dj.text.length > 0 && /^ +$/.test(dj.text)) { j--; continue; }\n        break;\n      }\n      if (j < 0) continue;\n      const a = decoded[j] as { p: { px?: number; py?: number; ps?: number; bx?: number }; text: string; trail?: boolean };\n      const ap = a.p;",
                          "      let j = i - 1;\n      if (j < 0) continue;\n      const a = decoded[j] as { p: { px?: number; py?: number; ps?: number; bx?: number }; text: string; trail?: boolean };\n      const ap = a.p; // MUTATION M4: the walk-back removed — the adjacent piece is the left block")
        assert "MUTATION M4" in src
    else:
        raise ValueError(mutation)
    open(SRC, "w").write(src)

HUNT = [
    "breaks the line at the icon-anchored contacts boundary",
    "breaks the line at the wider icon-anchored gap",
    "reads a single newline at an icon 13+ em away",
]
GUARDS = {
    "M2": ["keeps the space before a sub-threshold symbol block", "keeps the space at the no-separator icon form"],
    "M3": ["keeps the space before an alnum block at a sub-13 em gap"],
}

expected = {
    "M1": HUNT,
    "M2": GUARDS["M2"],
    "M3": GUARDS["M3"],
    "M4": HUNT,
}

ok = True
for m in ["M1", "M2", "M3", "M4"]:
    apply(m)
    failed, passed = run_suite()
    fail_names = [f.split(" (")[0] if " (" in f else f for f in failed]
    print(f"{m}: {len(failed)} RED — {fail_names}")
    want = set(expected[m])  # the names captured pre-parenthetical (the × line form)
    got = set(fail_names)
    if got != want:
        ok = False
        print(f"   MATRIX MISMATCH: want {sorted(want)}")
        print(f"                     got  {sorted(got)}")
    shutil.copy(BAK, SRC)

# final restore + green verify
shutil.copy(BAK, SRC)
failed, passed = run_suite()
print(f"\nrestored: {len(passed)} passed, {len(failed)} failed")
if failed:
    ok = False
    print("RESTORE FAILED:", failed)
sys.exit(0 if ok else 1)
