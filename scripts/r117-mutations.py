#!/usr/bin/env python3
# r117-mutations.py — session 117 / parity round 116: the mutation matrix.
# Each leg reverts ONE piece of the R117-A design in isolation; the spec
# suite must show the EXACT designed RED signature; the file is restored
# and re-verified green after each leg.
#   M1 [the assembly pre-pass removed]      -> the 2 hunt specs RED
#   M2 [the threshold zeroed]               -> the tick guard RED (a sub-band pair fires)
#   M3 [the advance post-pass removed]      -> the 2 hunt specs RED (blind)
#   M4 [the trail license removed]          -> the trail guard RED (a trailless pair fires)
import subprocess, shutil, sys, re, os

REPO = "/home/z/my-project/eon-hr"
SRC = f"{REPO}/src/lib/cv-text.ts"
BAK = "/tmp/r117-cv-text-backup.ts"
SPEC = "tests/unit/cv-text.test.ts"

shutil.copy(SRC, BAK)
orig = open(SRC).read()

ENV = {k: v for k, v in os.environ.items() if k != "DATABASE_URL"}

def run_suite():
    r = subprocess.run(
        ["bunx", "vitest", "run", SPEC, "-t", "session 117"],
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
        # remove the pre-pass body (keep the declarations so the forEach references stay)
        anchor = "    const upgrade = new Array<boolean>(decoded.length).fill(false);"
        end_anchor = "    decoded.forEach(({ p, text, genuine }, i) => {"
        i = src.find(anchor)
        j = src.find(end_anchor, i)
        assert i >= 0 and j >= 0, "M1 anchors"
        src = src[:i] + anchor + "\n    // MUTATION M1: the pre-pass removed\n    const dropText = new Set<number>();\n    const stripTrail = new Set<number>();\n" + src[j:]
    elif mutation == "M2":
        src = src.replace("      if (gapEm < 13) continue; // the Prawn tick band stays joined",
                          "      if (gapEm < 0) continue; // MUTATION M2: the threshold zeroed")
        assert "MUTATION M2" in src
    elif mutation == "M3":
        src = src.replace("        (piece as { bx?: number }).bx = origin + adv;",
                          "        // MUTATION M3: the bx stamp removed")
        assert "MUTATION M3" in src
    elif mutation == "M4":
        src = src.replace("      if (!licensed) continue;", "      // MUTATION M4: the trail license removed")
        assert "MUTATION M4" in src
    open(SRC, "w").write(src)

try:
    for mut, expect in [
        ("M1", ["breaks the line between same-baseline blocks", "breaks the line at a direct trail-carrying"]),
        ("M2", ["keeps the space between trail-carrying blocks under the threshold"]),
        ("M3", ["breaks the line between same-baseline blocks", "breaks the line at a direct trail-carrying"]),
        ("M4", ["keeps the space between blocks with no writer trailing space"]),
    ]:
        apply(mut)
        failed, passed = run_suite()
        ok = all(any(e in f for f in failed) for e in expect) and len(failed) == len(expect)
        print(f"{mut}: {len(failed)} RED ({'; '.join(f[:60] for f in failed)})")
        print(f"   expected {len(expect)}: {'EXACT' if ok else '*** MISMATCH ***'}")
        # restore + verify green
        open(SRC, "w").write(orig)
        failed2, passed2 = run_suite()
        print(f"   restored: {'GREEN 7/7' if not failed2 and len(passed2) == 7 else f'*** {len(failed2)} STILL RED ***'}")
finally:
    shutil.copy(BAK, SRC)
print("DONE — source restored")
