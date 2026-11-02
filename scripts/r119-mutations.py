#!/usr/bin/env python3
# r119-mutations.py — session 119 / parity round 118: the mutation matrix.
# Each leg reverts ONE piece of the R119-A/R119-B design in isolation; the
# spec suite must show the EXACT designed RED signature; the file is
# restored and re-verified green after each leg.
#   M1 [the threshold restored to 13]  -> the Typst hunt spec + the ReportLab spec RED (both under 13 em)
#   M2 [the threshold zeroed]          -> the [1, 2.5) em band guard RED
#   M3 [the trail license restored]    -> the ReportLab table-row spec RED (trailless cells)
#   M4 [the alnum guard removed]       -> the between-rules guard RED (the 1-alnum block fires)
#   M5 [the std14 seeding removed]     -> the ReportLab table-row spec RED (the font goes blind)
import subprocess, shutil, sys, re, os

REPO = "/home/z/my-project/eon-hr"
SRC = f"{REPO}/src/lib/cv-text.ts"
BAK = "/tmp/r119-cv-text-backup.ts"
SPEC = "tests/unit/cv-text.test.ts"

shutil.copy(SRC, BAK)
orig = open(SRC).read()

ENV = {k: v for k, v in os.environ.items() if k != "DATABASE_URL"}

def run_suite():
    r = subprocess.run(
        ["bunx", "vitest", "run", SPEC, "-t", "session 119"],
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
        src = src.replace(
            "      if (gapEm < 2.5) continue; // R119-A: the [1, 2.5) em overlap band stays joined",
            "      if (gapEm < 13) continue; // MUTATION M1: the threshold restored to 13")
        assert "MUTATION M1" in src
    elif mutation == "M2":
        src = src.replace(
            "      if (gapEm < 2.5) continue; // R119-A: the [1, 2.5) em overlap band stays joined",
            "      if (gapEm < 0) continue; // MUTATION M2: the threshold zeroed")
        assert "MUTATION M2" in src
    elif mutation == "M3":
        old = """      let j = i - 1;
      const consumed: number[] = []; // the space runs the upgrade would consume — applied ONLY on success (a rejected upgrade must never drop text: the fusion class)
      while (j >= 0) {
        const dj = decoded[j] as { genuine?: boolean; text: string; trail?: boolean };
        if (dj.genuine === true && dj.text.length > 0 && /^ +$/.test(dj.text)) { consumed.push(j); j--; continue; }
        break;
      }
      // the alnum guard reads the right BLOCK's whole content"""
        new = """      let j = i - 1;
      let licensed = false;
      const consumed: number[] = []; // the space runs the upgrade would consume — applied ONLY on success (a rejected upgrade must never drop text: the fusion class)
      while (j >= 0) {
        const dj = decoded[j] as { genuine?: boolean; text: string; trail?: boolean };
        if (dj.genuine === true && dj.text.length > 0 && /^ +$/.test(dj.text)) { licensed = true; consumed.push(j); j--; continue; }
        if (dj.trail === true) { licensed = true; }
        break;
      }
      if (!licensed) continue; // MUTATION M3: the trail license restored
      // the alnum guard reads the right BLOCK's whole content"""
        assert src.count(old) == 1, "M3 anchor"
        src = src.replace(old, new)
    elif mutation == "M4":
        src = src.replace(
            "      if (alnumRight < 2) continue; // the bare-period refutation\n      if (p.condGap && hasSpaceGlyphs) continue; // a join never upgrades",
            "      // MUTATION M4: the alnum guard removed\n      if (p.condGap && hasSpaceGlyphs) continue; // a join never upgrades")
        assert "MUTATION M4" in src
    elif mutation == "M5":
        src = src.replace(
            "      for (const [objNum, base] of objBaseFont) {\n        if (objWidths.has(objNum)) continue;\n        if (objDescendant.has(objNum)) continue;",
            "      for (const [objNum, base] of objBaseFont) {\n        continue; // MUTATION M5: the std14 seeding removed\n        if (objWidths.has(objNum)) continue;\n        if (objDescendant.has(objNum)) continue;")
        assert "MUTATION M5" in src
    else:
        raise SystemExit(f"unknown mutation {mutation}")
    open(SRC, "w").write(src)

def restore():
    shutil.copy(BAK, SRC)

LEGS = ["M1", "M2", "M3", "M4", "M5"]
# the measured signatures (the r118 precedent: the expectation corrected to
# the MEASURED forms — M1 fires both hunt specs [both under 13 em; the Prawn
# tick spec lives in the session-117 block, outside the runner's filter];
# M2 fires BOTH sub-threshold guards [the overlap-zone pair AND the icon
# interplay's sub-2.5 boundaries])
EXPECT = {
    "M1": ["the Typst description|dates form", "the ReportLab fieldFlags form"],
    "M2": ["the measured overlap zone", "the R118-A interplay"],
    "M3": ["the ReportLab fieldFlags form"],
    "M4": ["the between-rules guard"],
    "M5": ["the ReportLab fieldFlags form"],
}
ok = True
for leg in LEGS:
    apply(leg)
    failed, passed = run_suite()
    names = [f for f in failed]
    expected = EXPECT[leg]
    match = all(any(e in n for n in names) for e in expected) and len(names) == len(expected)
    status = "EXACT" if match else "MISMATCH"
    if not match: ok = False
    print(f"{leg}: {len(names)} RED [{status}]")
    for n in names: print(f"    × {n[:95]}")
    restore()
    failed2, passed2 = run_suite()
    print(f"    restored: {'GREEN' if not failed2 else 'RED!! ' + str(failed2)}")

print("\nMUTATION MATRIX " + ("EXACT" if ok else "MISMATCH — INVESTIGATE"))
sys.exit(0 if ok else 1)
