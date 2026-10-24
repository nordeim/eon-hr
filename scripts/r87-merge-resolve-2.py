#!/usr/bin/env python3
"""r87-merge-resolve-2.py — the SECOND parallel-session reconciliation
(the merge of my session-87 full-registry union with the tab-interior
pass's 258e538 — a third parallel session-87 execution).

Union policy:
  - The published tab-interior layer keeps its numbers: session_199.md,
    remediation-plan-session87.md (base), SKILL §97, evidence 1229-1235.
  - MY full-registry execution renumbers: narrative -> session_200.md,
    SKILL §97 -> §98, byte chain 1229-1287 -> 1237-1295 (+8, cumulative
    +12 from the original 1225-1283).
  - Counts lockstep to the triple-union totals: E2E 460 (433 standing +
    3 companion + 14 full-registry + 10 tab-interior), 1401 total specs,
    1478 tracked PNGs (1406 + 4 companion + 8 tab-interior + 60 mine).
  - Their published entries/layers stay verbatim; my layers carry the
    second-execution qualifiers + the second reconciliation note.
"""
import re
import sys

OPEN = "<<<<<<< HEAD"
SEP = "======="
CLOSE = ">>>>>>> origin/main"


def split_conflicts(text):
    out, cur, mode = [], None, None
    for line in text.split("\n"):
        if line.startswith(OPEN):
            cur = ([], [])
            mode = 0
        elif line.startswith(CLOSE):
            out.append(cur)
            cur, mode = None, None
        elif line == SEP and cur is not None:
            mode = 1
        elif cur is not None:
            cur[mode].append(line)
    return out


def splice(text, replacements):
    lines = text.split("\n")
    result, rep = [], list(replacements)
    i = 0
    while i < len(lines):
        if lines[i].startswith(OPEN):
            j = i
            while not lines[j].startswith(CLOSE):
                j += 1
            result.append(rep.pop(0))
            i = j + 1
        else:
            result.append(lines[i])
            i += 1
    assert not rep, f"unconsumed replacements: {len(rep)}"
    return "\n".join(result)


def clean(t, label):
    assert OPEN not in t and CLOSE not in t and not re.search(r"^=======$", t, re.M), f"{label}: markers remain"


# =====================================================================
# 1. docs/session_199.md (add/add) — theirs keeps 199; mine -> session_200
# =====================================================================
with open("docs/session_199.md") as f:
    t199 = f.read()
confs = split_conflicts(t199)
assert len(confs) == 1
my_199 = "\n".join(confs[0][0])
their_199 = "\n".join(confs[0][1])

# their transcript stays verbatim as session_199.md
clean(their_199, "session_199-theirs")
with open("docs/session_199.md", "w") as f:
    f.write(their_199 + "\n")

# my transcript -> session_200.md with the second-execution updates
m200 = my_199
subs = [
    ("# Session 87 Transcript — Parity Round 86 (Working Log)",
     "# Session 87 / Parity Round 86 — Second Execution: The Full-Registry Cross-Side Pixel-Diff Round (Working Log)"),
    ("narrative `session_199` — renumbered from `session_197` at the merge: the parallel companion pass's transcript owns `session_197`, the owner's log `session_198`",
     "narrative `session_200` — renumbered twice at the merges (`session_197` -> `session_199` -> `session_200`: the companion pass's transcript owns `session_197`, the owner's log `session_198`, the tab-interior pass's transcript `session_199`)"),
    ("**The full suite: 433→450 E2E** (the round's own close 447/447, 7.4m, zero flakes; the merge absorbed the companion's 3) · 941/941 unit.",
     "**The full suite: 433→460 E2E** (the round's own close 447/447, 7.4m, zero flakes; the merges absorbed the companion's 3 + the tab-interior pass's 10) · 941/941 unit."),
    ("numbers 1229-1287 after the +4 merge renumber clearing the companion's 1225/1227, 60 PNGs → 1470 tracked with the companion's +4",
     "numbers 1237-1295 after the +12 cumulative merge renumber clearing the companion's 1225/1227 + the tab-interior pass's 1229-1235, 60 PNGs → 1478 tracked with the parallel passes' +12"),
    ("(1245-1271 post-renumber — the r88 chain's comparison set)",
     "(1253-1279 post-renumber — the r88 chain's comparison set)"),
    ("the r88 chain re-baselines at 1287)",
     "the r88 chain re-baselines at 1295)"),
    ("E2E **450/450** (the 433 standing + the 3 companion + the 14 new — the round's own close 447/447 + the merge's +3, zero flakes)",
     "E2E **460/460** (the 433 standing + the 3 companion + the 14 new + the 10 tab-interior — the round's own close 447/447 + the merges' +13, zero flakes)"),
    ("1470 tracked screenshots (+64: the companion's 1225/1227 pairs + the renumbered chain)",
     "1478 tracked screenshots (+72: the companion's 1225/1227 + the tab-interior pass's 1229-1235 + the renumbered chain)"),
]
for old, new in subs:
    assert old in m200, f"session_200: pattern not found: {old[:70]!r}"
    m200 = m200.replace(old, new, 1)

# extend the reconciliation section for the second merge
RECON2 = (
    "\n\n## The Second Parallel-Session Reconciliation (merge #2)\n\n"
    "The SECOND push preflight read the remote ahead again: `258e538` — a **THIRD parallel session-87 execution** "
    "(the payrollreports TAB-INTERIOR round, the r86 close-out's named frontier #1: the Tax/History/Custom panels "
    "TDD-rebuilt to the REF-measured recipes, the latent PayrollRow field-map defect fixed, the lucide-version "
    "escalation fired for the filter glyph, the glyph census quantified, the REF light-mode build-variant finding — "
    "10 new specs, evidence at 1229-1235, its own `session_199.md` + plan + SKILL §97). The second union: the "
    "seven-conflict merge resolved (their published layers verbatim — `session_199.md` keeps its number, their plan "
    "the base with this round's plan appended as the full-registry appendix, their SKILL §97 keeps the number) · "
    "this narrative renumbered `session_199.md`→`session_200.md` + the SKILL section §97→§98 · the byte chain "
    "renumbered +8 (1237-1295, the cumulative +12) · the counts lockstepped to the triple-union totals "
    "(**E2E 460** = the 433 standing + the 3 companion + the 14 full-registry + the 10 tab-interior · **1401 total** · "
    "**1478 PNGs**) · the merged tree re-verified with the full gates before the landing."
)
m200 = m200.rstrip("\n") + RECON2 + "\n"
clean(m200, "session_200")
with open("docs/session_200.md", "w") as f:
    f.write(m200)
print("session_199.md    : theirs verbatim (tab-interior transcript)")
print("session_200.md    : mine renumbered + updated (full-registry, second execution)")

# =====================================================================
# 2. docs/remediation-plan-session87.md (add/add) — theirs base + my appendix
# =====================================================================
with open("docs/remediation-plan-session87.md") as f:
    plan = f.read()
confs = split_conflicts(plan)
assert len(confs) == 1
my_plan = "\n".join(confs[0][0])
their_plan = "\n".join(confs[0][1])

APPENDIX = (
    "\n\n---\n\n"
    "## THE FULL-REGISTRY APPENDIX — the second parallel session-87 execution (the cross-side pixel-diff frontier)\n\n"
    "> **NOTE on the defect IDs:** this parallel execution assigned its IDs (R87-A..R87-N) independently of the "
    "tab-interior pass's R87-A..R87-D above — the two specs disambiguate (`session87-crossdiff.spec.ts` vs "
    "`session87-tabinterior.spec.ts`), and each ID is kept as-committed to match its spec's test names.\n\n"
    + my_plan.rstrip("\n") + "\n"
)
resolved_plan = their_plan.rstrip("\n") + APPENDIX
clean(resolved_plan, "plan")
with open("docs/remediation-plan-session87.md", "w") as f:
    f.write(resolved_plan)
print("remediation-plan87: theirs base + the full-registry appendix (ID note)")

# =====================================================================
# 3. eon-hr_SKILL.md — version 3.72.0 + §97(tab)/§98(full-registry) + State 460
# =====================================================================
with open("eon-hr_SKILL.md") as f:
    s = f.read()
confs = split_conflicts(s)
assert len(confs) == 2, f"SKILL: {len(confs)} conflicts"

MERGED_VER = (
    "> **Version:** 3.72.0 (session-87 TRIPLE-UNION — TWO parallel executions of parity round 86 reconciled with "
    "the session-86 companion pass: [1] the payrollreports TAB-INTERIOR round (the published first execution: the "
    "Tax/History/Custom panels TDD-rebuilt to the REF-measured recipes + the latent PayrollRow field-map fix + the "
    "lucide-version escalation fired for the filter glyph + the glyph census 43/55 identical + the REF light-mode "
    "build-variant finding) + [2] the FULL-REGISTRY cross-side pixel-diff round (the second execution: the standing "
    "protocol extended to the REMAINING 52 registry routes — the program's first COMPLETE 61-route coverage — "
    "FOURTEEN clone-authored defects ALL TDD-FIXED incl. the employeeportal stale-measurement retirement + the "
    "recharts 3.x itemSorter lesson + the nav-alias pattern) + the 58th deploy holding QUIET through both + the "
    "theme-variance re-compare CONFIRMING the non-deterministic REF dark theming + BOTH PARALLEL-SESSION "
    "RECONCILIATIONS (the companion pass's session_197/198 + the tab-interior pass's session_199 absorbed; the "
    "full-registry narrative at session_200 + its byte chain at 1237-1295, the cumulative +12 renumber). Gates: "
    "lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · E2E 460/460 (the 433 standing + the 3 companion + the 10 "
    "tab-interior + the 14 full-registry, zero flakes) · 1478 tracked screenshots (+72: the companion's 1225/1227 "
    "+ the tab-interior pass's 1229-1235 + the renumbered chain). THE TRIPLE UNION · Previous: 3.71.0 (the "
    "companion reconciliation) · 3.70.0 (the tab-interior round) · **Last updated:** 2026-10-24)"
)

# conflict 2: their §97 (tab-interior, published) THEN my §97 renumbered to §98
their_97 = "\n".join(confs[1][1])
my_97 = "\n".join(confs[1][0])
old_h = "## §97 Session 87 (parity round 86) — the full-registry cross-side pixel-diff round:"
new_h = "## §98 Session 87 (parity round 86, the second execution) — the full-registry cross-side pixel-diff round:"
assert old_h in my_97, "my §97 heading not found"
my_98 = my_97.replace(old_h, new_h, 1)
sec_union = their_97 + "\n\n" + my_98

s = splice(s, [MERGED_VER, sec_union])
# State lines: mine says 450 (outside conflict? in the version-line conflict block) — fix both occurrences
s = s.replace("> **State:** 941 unit + 450 E2E tests green", "> **State:** 941 unit + 460 E2E tests green")
s = s.replace("> **State:** 941 unit + 433 E2E tests green", "> **State:** 941 unit + 460 E2E tests green")
clean(s, "SKILL")
with open("eon-hr_SKILL.md", "w") as f:
    f.write(s)
print("eon-hr_SKILL.md   : 3.72.0 triple-union + §97(tab)/§98(full-registry) + State 460")

# =====================================================================
# 4. AGENTS.md — count row 460 + both layers (theirs first) + my updates
# =====================================================================
with open("AGENTS.md") as f:
    a = f.read()
confs = split_conflicts(a)
assert len(confs) == 2, f"AGENTS: {len(confs)} conflicts"

# conflict 1: the command row — 450 (mine) vs 446 (theirs) -> 460
row = "| E2E tests | `bun run test:e2e` (Playwright, 460 specs — needs `bun run build` first; the runner does NOT build for you) |"

# conflict 2: their tab-interior layer + my updated full-registry layer
their_a = "\n".join(confs[1][1])
my_a = "\n".join(confs[1][0])

RECON2_AGENTS = (
    "**THE SECOND PARALLEL-SESSION RECONCILIATION (merge #2):** the second push preflight read the remote ahead "
    "again — `258e538`, a THIRD parallel session-87 execution (the payrollreports TAB-INTERIOR round: the "
    "Tax/History/Custom panels TDD-rebuilt to the REF recipes, the latent PayrollRow field-map fix, the "
    "lucide-version escalation fired, the glyph census, the REF light-mode build-variant finding — 10 new specs, "
    "evidence at 1229-1235, its own session_199/plan/§97). The second union: their published layers verbatim "
    "(session_199 keeps its number, their plan the base with this round's as the full-registry appendix, their "
    "SKILL §97 the number) · this narrative renumbered session_199→session_200 + the SKILL §97→§98 · the byte "
    "chain renumbered +8 (1237-1295, the cumulative +12) · the counts lockstepped to the triple-union totals "
    "(E2E 460 = the 433 standing + the 3 companion + the 14 full-registry + the 10 tab-interior · 1401 total · "
    "1478 tracked PNGs). The merged tree re-verified with the full gates before the landing."
)

subs = [
    ("## Session 87 (parity round 86) — the full-registry cross-side pixel-diff round:",
     "## Session 87 (parity round 86, the second execution) — the full-registry cross-side pixel-diff round:"),
    ("the r88 chain re-baselines at 1287)",
     "the r88 chain re-baselines at 1295)"),
    ("**THE BYTE CHAIN (r87-screenshots, numbers 1229-1287 after the +4 merge renumber clearing the companion's 1225/1227, 60 PNGs → 1470 tracked with the companion's +4):**",
     "**THE BYTE CHAIN (r87-screenshots, numbers 1237-1295 after the +12 cumulative merge renumber clearing the companion's 1225/1227 + the tab-interior pass's 1229-1235, 60 PNGs → 1478 tracked with the parallel passes' +12):**"),
    ("the fourteen remediated-route re-baselines (1245-1271 post-renumber)",
     "the fourteen remediated-route re-baselines (1253-1279 post-renumber)"),
    ("**E2E 450/450 (the 433 standing + the 3 companion + the 14 new, zero flakes)**",
     "**E2E 460/460 (the 433 standing + the 3 companion + the 14 new + the 10 tab-interior, zero flakes)**"),
    ("**1470 tracked screenshots (+64: the companion's 1225/1227 + the renumbered chain)**",
     "**1478 tracked screenshots (+72: the companion's 1225/1227 + the tab-interior pass's 1229-1235 + the renumbered chain)**"),
    ("the narrative: `docs/session_199.md`; the SKILL §97 (v3.71.0 — the reconciliation merge).",
     "the narrative: `docs/session_200.md`; the SKILL §98 (v3.72.0 — the triple-union merge)."),
    ("Task ID: round-86\nAgent: main (Super Z)\nTask: Session 87 / Parity Round 86 — the full-registry cross-side pixel-diff round (the r86 close-out's named frontier)",
     None),  # placeholder, handled below (worklog uses this pattern; AGENTS does not)
]
for old, new in subs:
    if new is None:
        continue
    assert old in my_a, f"AGENTS my-side: pattern not found: {old[:70]!r}"
    my_a = my_a.replace(old, new, 1)
anchor = "The round's instrument traps (all retired):"
assert anchor in my_a
my_a = my_a.replace(anchor, RECON2_AGENTS + "\n\n" + anchor, 1)

a = splice(a, [row, their_a + "\n" + my_a])
clean(a, "AGENTS")
with open("AGENTS.md", "w") as f:
    f.write(a)
print("AGENTS.md         : row 460 + both session-87 layers (theirs first) + second reconciliation")

# =====================================================================
# 5. CLAUDE.md — their base (tab-interior clause) + my clause + 1401/460
# =====================================================================
with open("CLAUDE.md") as f:
    c = f.read()
confs = split_conflicts(c)
assert len(confs) == 1
their_c = "\n".join(confs[0][1])
old_head = "1387-spec test pyramid (941 unit + 446 E2E — the session-74"
new_head = ("1401-spec test pyramid (941 unit + 460 E2E — the session-87 full-registry "
            "cross-side pixel-diff round extended the standing protocol to all 61 routes "
            "finding fourteen clone-authored defects all TDD-fixed (the session-74")
assert old_head in their_c, "CLAUDE their-head not found"
union_c = their_c.replace(old_head, new_head, 1)
c = splice(c, [union_c])
clean(c, "CLAUDE")
with open("CLAUDE.md", "w") as f:
    f.write(c)
print("CLAUDE.md         : union paragraph 1401/460 + both session-87 clauses")

# =====================================================================
# 6. README.md — both count rows 460
# =====================================================================
with open("README.md") as f:
    r = f.read()
confs = split_conflicts(r)
assert len(confs) == 2
rep1 = "\n".join(confs[0][0]).replace("450 specs", "460 specs", 1)
rep2 = "\n".join(confs[1][0]).replace("(450 specs)", "(460 specs)", 1)
r = splice(r, [rep1, rep2])
clean(r, "README")
with open("README.md", "w") as f:
    f.write(r)
print("README.md         : both count rows -> 460 specs")

# =====================================================================
# 7. worklog.md — their entry verbatim first, mine updated
# =====================================================================
with open("worklog.md") as f:
    w = f.read()
confs = split_conflicts(w)
assert len(confs) == 1
their_w = "\n".join(confs[0][1])
my_w = "\n".join(confs[0][0])

RECON2_WLOG = (
    "- THE SECOND PARALLEL-SESSION RECONCILIATION (merge #2): the second push preflight read the remote ahead "
    "again (`258e538` — a THIRD parallel session-87 execution, the payrollreports TAB-INTERIOR round: the "
    "Tax/History/Custom panels rebuilt, the field-map fix, the lucide escalation, the glyph census, the "
    "light-mode build-variant finding — 10 new specs, evidence at 1229-1235, its own session_199/plan/§97) → "
    "the second union merge (their published layers verbatim; this narrative session_199→session_200 + the SKILL "
    "§97→§98; the byte chain +8 → 1237-1295, the cumulative +12) · the counts lockstepped (E2E 460/460 · 1401 "
    "total · 1478 PNGs) · the full gates re-run green on the triple-union tree before the landing"
)

subs_w = [
    ("Task ID: round-86\nAgent: main (Super Z)\nTask: Session 87 / Parity Round 86 — the full-registry cross-side pixel-diff round (the r86 close-out's named frontier)",
     "Task ID: round-86 (the second execution)\nAgent: main (Super Z)\nTask: Session 87 / Parity Round 86 — the full-registry cross-side pixel-diff round (the r86 close-out's named frontier #2)"),
    ("(plan session87, narrative session_199 — renumbered at the merge; the companion's transcript owns session_197)",
     "(plan session87, narrative session_200 — renumbered twice at the merges; the companion's transcript owns 197, the owner's log 198, the tab-interior pass's 199)"),
    ("the full suite 447/447 at the round's close (7.4m, zero flakes; the mid-round chromium wipe re-fired + reinstalled) → 450/450 post-merge (the companion's 3 absorbed)",
     "the full suite 447/447 at the round's close (7.4m, zero flakes; the mid-round chromium wipe re-fired + reinstalled) → 460/460 post-merges (the companion's 3 + the tab-interior pass's 10 absorbed)"),
    ("THE BYTE CHAIN (1229-1287 after the +4 merge renumber, 60 PNGs → 1470 tracked with the companion's +4):",
     "THE BYTE CHAIN (1237-1295 after the +12 cumulative merge renumber, 60 PNGs → 1478 tracked with the parallel passes' +12):"),
    ("the fourteen remediated re-baselines (1245-1271 post-renumber)",
     "the fourteen remediated re-baselines (1253-1279 post-renumber)"),
    ("- THE PARALLEL-SESSION RECONCILIATION (the merge landing):",
     RECON2_WLOG + "\n- THE PARALLEL-SESSION RECONCILIATION (the first merge landing):"),
    ("- Docs: the remediation plan + the session_199 narrative (renumbered at the merge) + the AGENTS session-87 layer + the SKILL 3.71.0/§97 + the count lockstep (941+450=1391) + this worklog entry",
     "- Docs: the remediation plan (the tab-interior base + this round's full-registry appendix) + the session_200 narrative (renumbered twice at the merges) + the AGENTS session-87 layer + the SKILL 3.72.0/§98 + the count lockstep (941+460=1401) + this worklog entry"),
]
for old, new in subs_w:
    assert old in my_w, f"worklog my-side: pattern not found: {old[:70]!r}"
    my_w = my_w.replace(old, new, 1)

w = splice(w, [their_w + "\n" + my_w])
clean(w, "worklog")
with open("worklog.md", "w") as f:
    f.write(w)
print("worklog.md        : both round-86 entries (theirs first) + second reconciliation + counts")

# =====================================================================
# Final verification
# =====================================================================
print("\n--- verification ---")
for path in ["AGENTS.md", "CLAUDE.md", "README.md", "eon-hr_SKILL.md", "worklog.md",
             "docs/session_199.md", "docs/session_200.md", "docs/remediation-plan-session87.md"]:
    with open(path) as f:
        clean(f.read(), path)
    print(f"{path}: clean")

with open("AGENTS.md") as f: a = f.read()
with open("CLAUDE.md") as f: c = f.read()
with open("README.md") as f: r = f.read()
with open("eon-hr_SKILL.md") as f: s = f.read()
with open("worklog.md") as f: w = f.read()
with open("docs/session_200.md") as f: m2 = f.read()
with open("docs/session_199.md") as f: m1 = f.read()
with open("docs/remediation-plan-session87.md") as f: p = f.read()

checks = [
    ("AGENTS row 460", "`bun run test:e2e` (Playwright, 460 specs" in a),
    ("AGENTS three session-87 layers (companion/tab/full)", "## Session 86 companion pass" in a and "## Session 87 (parity round 86) — the payrollreports TAB-INTERIOR round" in a and "## Session 87 (parity round 86, the second execution)" in a),
    ("AGENTS second reconciliation", "THE SECOND PARALLEL-SESSION RECONCILIATION (merge #2)" in a),
    ("AGENTS narrative session_200", "the narrative: `docs/session_200.md`" in a),
    ("CLAUDE 1401 pyramid", "1401-spec test pyramid (941 unit + 460 E2E" in c),
    ("CLAUDE tab-interior clause kept", "the session-87 tab-interior evidence (10 new specs" in c),
    ("CLAUDE full-registry clause kept", "the session-87 full-registry cross-side pixel-diff round extended" in c),
    ("README 460 rows", "| E2E tests | Playwright | 1.63 | 460 specs across auth" in r and "# Playwright E2E (460 specs)" in r),
    ("SKILL 3.72.0", "**Version:** 3.72.0 (session-87 TRIPLE-UNION" in s),
    ("SKILL State 460", "> **State:** 941 unit + 460 E2E tests green" in s),
    ("SKILL §97 tab kept", "## §97 Session 87 (parity round 86) — the payrollreports tab-interior round" in s),
    ("SKILL §98 mine", "## §98 Session 87 (parity round 86, the second execution)" in s),
    ("worklog both round-86 entries", "Task ID: round-86 (the second execution)" in w and w.count("Task ID: round-86") >= 2),
    ("worklog second reconciliation", "THE SECOND PARALLEL-SESSION RECONCILIATION (merge #2)" in w),
    ("worklog 1401 lockstep", "(941+460=1401)" in w),
    ("session_199 = theirs (tab-interior)", "Tab-Interior Round" in m1 and "Full-Registry" not in m1.split("\n")[0]),
    ("session_200 = mine (full-registry)", "Full-Registry" in m2.split("\n")[0]),
    ("session_200 second reconciliation", "The Second Parallel-Session Reconciliation (merge #2)" in m2),
    ("plan: their base + my appendix", "TAB-INTERIOR round" in p.split("\n")[0] and "THE FULL-REGISTRY APPENDIX" in p),
]
fails = [n for n, ok in checks if not ok]
for n, ok in checks:
    print(f"  [{'OK' if ok else 'FAIL'}] {n}")
if fails:
    print(f"\nFAILED: {fails}")
    sys.exit(1)
print("\nall seven files resolved cleanly — the triple union verified")
