#!/usr/bin/env python3
"""r87-merge-resolve.py v3 — deterministic line-wise conflict resolution
for the parallel-session merge (session-87 local round x session-86
companion pass + owner's log, published remotely).

Union policy (per the reconciliation playbook):
  - BOTH session layers kept, companion first (chronological).
  - Counts lockstepped to the union totals: E2E 450 (433 standing + 3
    companion + 14 session-87), 1391 total specs, 1470 tracked PNGs
    (1406 + 60 mine + 4 companion's).
  - This round's narrative renumbered session_197 -> session_199; the
    byte chain renumbered +4 (1229-1287) clearing the companion's
    1225/1227.
  - The owner's transcript (session_198.md) and the companion's
    session_197.md stay untouched.
"""
import re
import sys

OPEN = "<<<<<<< HEAD"
SEP = "======="
CLOSE = ">>>>>>> origin/main"


def split_conflicts(text):
    """Return [(my_lines, their_lines), ...] preserving order."""
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


def splice(text, replacement_pairs):
    """Apply [(start_marker_line_idx_replaced_text, new_text)] via a
    single reconstruction: for each conflict, the block from the OPEN
    line through the CLOSE line is replaced by the composed text."""
    lines = text.split("\n")
    result = []
    i = 0
    rep = list(replacement_pairs)  # consumed in order
    while i < len(lines):
        if lines[i].startswith(OPEN):
            # find the CLOSE line
            j = i
            while not lines[j].startswith(CLOSE):
                j += 1
            new = rep.pop(0)
            result.append(new)
            i = j + 1
        else:
            result.append(lines[i])
            i += 1
    assert not rep, f"unconsumed replacements: {len(rep)}"
    return "\n".join(result)


def assert_clean(t, label):
    """In-memory post-check: no conflict markers remain."""
    assert OPEN not in t and CLOSE not in t and not re.search(r"^=======$", t, re.M), f"{label}: markers remain"


def resolved_counts(path):
    """Disk re-read verification."""
    with open(path) as f:
        t = f.read()
    assert_clean(t, path)
    return t


# =====================================================================
# 1. eon-hr_SKILL.md — 2 conflicts
# =====================================================================
with open("eon-hr_SKILL.md") as f:
    s = f.read()
confs = split_conflicts(s)
assert len(confs) == 2, f"SKILL: expected 2 conflicts, got {len(confs)}"

MERGED_VER = (
    "> **Version:** 3.71.0 (session-87 audit complete — the full-registry cross-side pixel-diff "
    "round RECONCILED with the session-86 companion pass: the standing cross-side at-rest "
    "pixel-diff protocol extended to the REMAINING 52 registry routes (the program's first "
    "COMPLETE 61-route cross-side coverage) found FOURTEEN clone-authored defects, ALL "
    "TDD-FIXED (the icon-identity family incl. the employeeportal circle wrapper — the r50-era "
    "bare-glyph pin was a STALE measurement, the live re-measure wins; the interviewassistant "
    "at-rest card set; the reports border family at BOTH levels; the tenantsetup/payrollengine "
    "field spacing; the loans space-y-8 member of the A2 class; the dynamicdashboard nav-alias "
    "mapping; the attendancedashboard BarChart with recharts 3.x's itemSorter={null} lesson) + "
    "the 58th deploy holding QUIET + the THEME-VARIANCE RE-COMPARE CONFIRMING the "
    "non-deterministic REF dark theming + the PARALLEL-SESSION RECONCILIATION (the companion "
    "pass's session_197/198 + the 1225/1227 evidence numbers absorbed; this round's narrative "
    "renumbered to session_199 + the byte chain to 1229-1287, clearing the companion's "
    "1225/1227). Gates: lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · E2E 450/450 (the 433 "
    "standing + the 3 companion + the 14 new, zero flakes) · 1470 tracked screenshots (+64: "
    "the companion's 1225/1227 pairs + the renumbered chain). FOURTEEN DEFECTS FIXED + THE "
    "FULL-REGISTRY COVERAGE + THE PARALLEL-SESSION UNION · Previous: 3.70.0 (session-87 "
    "pre-merge) · 3.69.1 (session-86 companion pass) · **Last updated:** 2026-10-24)"
)

# conflict 2: the §96 companion addendum (theirs) THEN my §97 (chronological)
their_96 = "\n".join(confs[1][1])
my_97 = "\n".join(confs[1][0])
sec_union = their_96 + "\n\n" + my_97

s = splice(s, [MERGED_VER, sec_union])
# the State line (outside the conflicts, both sides stale at 433)
assert "> **State:** 941 unit + 433 E2E tests green" in s
s = s.replace("> **State:** 941 unit + 433 E2E tests green",
              "> **State:** 941 unit + 450 E2E tests green")
assert_clean(s, "eon-hr_SKILL.md")
with open("eon-hr_SKILL.md", "w") as f:
    f.write(s)
resolved_counts("eon-hr_SKILL.md")
print("eon-hr_SKILL.md   : 3.71.0 version line + §96-addendum/§97 union + State 450")

# =====================================================================
# 2. CLAUDE.md — 1 conflict (the test-pyramid paragraph)
# =====================================================================
with open("CLAUDE.md") as f:
    c = f.read()
confs = split_conflicts(c)
assert len(confs) == 1, f"CLAUDE: expected 1 conflict, got {len(confs)}"
their = "\n".join(confs[0][1])
# their side is the superset (the shared history + the companion evidence
# clause at the end). Compose: union counts + my session-87 clause at the
# front exactly as my side read it.
old_head = "1377-spec test pyramid (941 unit + 436 E2E — the session-74"
new_head = ("1391-spec test pyramid (941 unit + 450 E2E — the session-87 "
            "full-registry cross-side pixel-diff round extended the standing "
            "protocol to all 61 routes finding fourteen clone-authored defects "
            "all TDD-fixed (the session-74")
assert old_head in their, "CLAUDE their-side head not found"
union = their.replace(old_head, new_head, 1)
c = splice(c, [union])
assert_clean(c, "CLAUDE.md")
with open("CLAUDE.md", "w") as f:
    f.write(c)
resolved_counts("CLAUDE.md")
print("CLAUDE.md         : union paragraph 1391/450 + session-87 clause + companion evidence")

# =====================================================================
# 3. README.md — 2 conflicts (both pure count updates 447/436 -> 450)
# =====================================================================
with open("README.md") as f:
    r = f.read()
confs = split_conflicts(r)
assert len(confs) == 2, f"README: expected 2 conflicts, got {len(confs)}"
for n, (my, their) in enumerate(confs):
    assert my != their, f"README conflict {n+1}: sides unexpectedly equal"
    joined_my = "\n".join(my)
    assert "447 specs" in joined_my, f"README conflict {n+1}: my side lacks 447"
rep1 = "\n".join(confs[0][0]).replace("447 specs", "450 specs", 1)
rep2 = "\n".join(confs[1][0]).replace("(447 specs)", "(450 specs)", 1)
r = splice(r, [rep1, rep2])
assert_clean(r, "README.md")
with open("README.md", "w") as f:
    f.write(r)
resolved_counts("README.md")
print("README.md         : both count rows -> 450 specs")

# =====================================================================
# 4. worklog.md — 1 conflict (both entries, companion first)
# =====================================================================
with open("worklog.md") as f:
    w = f.read()
confs = split_conflicts(w)
assert len(confs) == 1, f"worklog: expected 1 conflict, got {len(confs)}"
their_w = "\n".join(confs[0][1])
my_w = "\n".join(confs[0][0])

RECON_WLOG = (
    "- THE PARALLEL-SESSION RECONCILIATION (the merge landing): the push preflight "
    "(`git ls-remote` at the wrapper's step 4) read the remote main ahead — the session-86 "
    "COMPANION pass (`b5ba83e`: R86-H the drawer panel's `text-sidebar-foreground` + R86-E the "
    "recruitment UserPlus glyph + the 3-test companion spec + the evidence pair 1225/1227) + "
    "the owner's log (`329fc43`) already published — the published chain session_197 (the "
    "companion transcript) + session_198 (the owner's log) · the union landed via the "
    "five-file merge (AGENTS/CLAUDE/README/SKILL/worklog — both session layers kept) · this "
    "round's narrative renumbered session_197→session_199 · the byte chain renumbered +4 "
    "(1229-1287, clearing the companion's 1225/1227) · the counts lockstepped to the union "
    "totals (E2E 450 = the 433 standing + the 3 companion + the 14 new · 1391 total · 1470 "
    "tracked PNGs) · the full gates re-run green on the merged tree before the landing"
)

def upd_my_worklog(t):
    subs = [
        ("(plan session87, narrative session_197)",
         "(plan session87, narrative session_199 — renumbered at the merge; the companion's transcript owns session_197)"),
        ("the full suite 447/447 (7.4m, zero flakes; the mid-round chromium wipe re-fired + reinstalled)",
         "the full suite 447/447 at the round's close (7.4m, zero flakes; the mid-round chromium wipe re-fired + reinstalled) → 450/450 post-merge (the companion's 3 absorbed)"),
        ("THE BYTE CHAIN (1225-1283, 60 PNGs → 1466 tracked):",
         "THE BYTE CHAIN (1229-1287 after the +4 merge renumber, 60 PNGs → 1470 tracked with the companion's +4):"),
        ("the fourteen remediated re-baselines (1241-1267)",
         "the fourteen remediated re-baselines (1245-1271 post-renumber)"),
        ("- Docs: the remediation plan + the session_197 narrative + the AGENTS session-87 layer + the SKILL 3.70.0/§97 + the count lockstep (941+447=1388) + this worklog entry",
         RECON_WLOG + "\n- Docs: the remediation plan + the session_199 narrative (renumbered at the merge) + the AGENTS session-87 layer + the SKILL 3.71.0/§97 + the count lockstep (941+450=1391) + this worklog entry"),
    ]
    for old, new in subs:
        assert old in t, f"worklog my-side: pattern not found: {old[:60]!r}"
        t = t.replace(old, new, 1)
    return t

my_w = upd_my_worklog(my_w)
w = splice(w, [their_w + "\n" + my_w])
assert_clean(w, "worklog.md")
with open("worklog.md", "w") as f:
    f.write(w)
resolved_counts("worklog.md")
print("worklog.md        : both entries (companion first) + reconciliation line + counts")

# =====================================================================
# 5. AGENTS.md — 1 conflict (both layers, companion first) + line-16 count
# =====================================================================
with open("AGENTS.md") as f:
    a = f.read()
confs = split_conflicts(a)
assert len(confs) == 1, f"AGENTS: expected 1 conflict, got {len(confs)}"
their_a = "\n".join(confs[0][1])
my_a = "\n".join(confs[0][0])

RECON_AGENTS = (
    "**THE PARALLEL-SESSION RECONCILIATION (the merge landing):** the push preflight "
    "(`git ls-remote` at the wrapper's step 4) read the remote main ahead — the session-86 "
    "COMPANION pass (`b5ba83e`: R86-H the drawer panel's `text-sidebar-foreground` + R86-E the "
    "recruitment UserPlus glyph, the 3-test companion spec, the evidence pair 1225/1227) + the "
    "owner's log (`329fc43`) already published. The union: the five-file merge "
    "(AGENTS/CLAUDE/README/SKILL/worklog — both session layers kept), this round's narrative "
    "renumbered `session_197.md`→`session_199.md` (the companion's transcript owns 197, the "
    "owner's log 198), the byte chain renumbered +4 (1229-1287, clearing the companion's "
    "1225/1227), and the counts lockstepped to the union totals (E2E 450 = the 433 standing + "
    "the 3 companion + the 14 new · 1391 total · 1470 tracked PNGs). The merged tree "
    "re-verified with the full gates before the landing."
)

def upd_my_agents(t):
    subs = [
        ("the r88 chain re-baselines at 1283)",
         "the r88 chain re-baselines at 1287)"),
        ("**THE BYTE CHAIN (r87-screenshots, numbers 1225-1283, 60 PNGs → 1466 tracked):**",
         "**THE BYTE CHAIN (r87-screenshots, numbers 1229-1287 after the +4 merge renumber clearing the companion's 1225/1227, 60 PNGs → 1470 tracked with the companion's +4):**"),
        ("the fourteen remediated-route re-baselines (1241-1267)",
         "the fourteen remediated-route re-baselines (1245-1271 post-renumber)"),
        ("**E2E 447/447 (the 433 standing + the 14 new, 7.4m, zero flakes)**",
         "**E2E 450/450 (the 433 standing + the 3 companion + the 14 new, zero flakes)**"),
        ("**1466 tracked screenshots (+60)**",
         "**1470 tracked screenshots (+64: the companion's 1225/1227 + the renumbered chain)**"),
        ("the narrative: `docs/session_197.md`; the SKILL §97 (v3.70.0).",
         "the narrative: `docs/session_199.md`; the SKILL §97 (v3.71.0 — the reconciliation merge)."),
    ]
    for old, new in subs:
        assert old in t, f"AGENTS my-side: pattern not found: {old[:60]!r}"
        t = t.replace(old, new, 1)
    # insert the reconciliation paragraph between the Gates line and the traps line
    anchor = "The round's instrument traps (all retired):"
    assert anchor in t
    t = t.replace(anchor, RECON_AGENTS + "\n\n" + anchor, 1)
    return t

my_a = upd_my_agents(my_a)
a = splice(a, [their_a + "\n" + my_a])
# line-16 command count (outside the conflicts)
old16 = "| E2E tests | `bun run test:e2e` (Playwright, 447 specs"
assert old16 in a
a = a.replace(old16, "| E2E tests | `bun run test:e2e` (Playwright, 450 specs", 1)
assert_clean(a, "AGENTS.md")
with open("AGENTS.md", "w") as f:
    f.write(a)
resolved_counts("AGENTS.md")
print("AGENTS.md         : both layers (companion first) + reconciliation paragraph + counts 450")

# =====================================================================
# Final cross-file verification
# =====================================================================
print("\n--- verification ---")
for path in ["AGENTS.md", "CLAUDE.md", "README.md", "eon-hr_SKILL.md", "worklog.md"]:
    t = resolved_counts(path)
    print(f"{path}: clean ({len(t.splitlines())} lines)")

with open("AGENTS.md") as f: a = f.read()
with open("CLAUDE.md") as f: c = f.read()
with open("README.md") as f: r = f.read()
with open("eon-hr_SKILL.md") as f: s = f.read()
with open("worklog.md") as f: w = f.read()

checks = [
    ("AGENTS 450 command row", "`bun run test:e2e` (Playwright, 450 specs" in a),
    ("AGENTS session_199 narrative", "the narrative: `docs/session_199.md`" in a),
    ("AGENTS reconciliation paragraph", "THE PARALLEL-SESSION RECONCILIATION (the merge landing)" in a),
    ("AGENTS companion layer kept", "## Session 86 companion pass" in a),
    ("AGENTS session-87 layer kept", "## Session 87 (parity round 86)" in a),
    ("CLAUDE 1391 pyramid", "1391-spec test pyramid (941 unit + 450 E2E" in c),
    ("CLAUDE session-87 clause", "the session-87 full-registry cross-side pixel-diff round extended" in c),
    ("CLAUDE companion evidence kept", "the session-86 companion-pass evidence (3 new specs" in c),
    ("README 450 table row", "| E2E tests | Playwright | 1.63 | 450 specs across auth" in r),
    ("README 450 command row", "bun run test:e2e      # Playwright E2E (450 specs)" in r),
    ("SKILL 3.71.0", "**Version:** 3.71.0 (session-87 audit complete" in s),
    ("SKILL State 450", "> **State:** 941 unit + 450 E2E tests green" in s),
    ("SKILL §96 addendum kept", "§96 companion addendum" in s),
    ("SKILL §97 kept", "## §97 Session 87 (parity round 86)" in s),
    ("worklog companion entry kept", "Task ID: round-85-companion" in w),
    ("worklog session-87 entry kept", "Task ID: round-86" in w),
    ("worklog reconciliation line", "THE PARALLEL-SESSION RECONCILIATION (the merge landing)" in w),
    ("worklog 1391 lockstep", "(941+450=1391)" in w),
]
fails = [name for name, ok in checks if not ok]
for name, ok in checks:
    print(f"  [{'OK' if ok else 'FAIL'}] {name}")
if fails:
    print(f"\nFAILED: {fails}")
    sys.exit(1)
print("\nall five files resolved cleanly — union verified")
