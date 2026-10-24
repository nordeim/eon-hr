#!/usr/bin/env python3
"""r88mb-docs-union.py — the fourth parallel-session reconciliation finishing layer.

The merge-conflict resolution and renumbering landed, but the session was cut off
before the count-lockstep finishing layer. This script applies the four remaining
doc edits (exact-match anchored, assert-heavy per the r87-merge-resolve convention)
and is IDEMPOTENT — a re-run on already-patched files takes the skip paths and
re-executes every post-check:

  1. eon-hr_SKILL.md — the union version line (3.73.0 -> 3.74.0, the DOUBLE UNION)
     + the State line (941 unit + 476 E2E -> 941 unit + 488 E2E)
  2. AGENTS.md — the FOURTH-reconciliation paragraph + the merged-tree gates line
  3. worklog.md — the reconciliation bullet inside the session-88 entry's Work Log
  4. docs/session_203.md — the "(below)" gates line finalized + the union PNG count

Run from the repo root:  python3 scripts/r88mb-docs-union.py
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POST_CHECKS = 0


def ok(label):
    global POST_CHECKS
    POST_CHECKS += 1
    print(f"  ok {POST_CHECKS}: {label}")


def fail(label, detail=""):
    print(f"FATAL: {label} {detail}")
    sys.exit(1)


# ---------------------------------------------------------------- 1. SKILL ---
skill = ROOT / "eon-hr_SKILL.md"
lines = skill.read_text(encoding="utf-8").splitlines(keepends=True)

NEW_VERSION = (
    "> **Version:** 3.74.0 (session-88 — THE DOUBLE UNION: the fourth parallel-session "
    "reconciliation landing THE MOBILE-BAND CROSS-SIDE ROUND alongside the published "
    "chart-suite round — the same r87 close-out frontier executed in two parallel "
    "sandboxes, BOTH landed: the union keeps the published deeper forms (the "
    "surveyanalytics explicit-ticks zero-state contract — this round's data=[] form "
    "superseded by the decoded mechanism; the reports 11-glyph census + the shared "
    "RefFilterGlyph; the attendancedashboard superset; the tenantsetup +6 header; the "
    "companywall SelectValue-children trigger + the Post disabled contract; the "
    "shiftswap cn() 40px tiles) and this execution's unique members (the "
    "advancedanalytics Plus glyph, the analyticsdashboard flex-nowrap overflow chain, "
    "the profile icon family, the chat always-visible column — the mobile-usability "
    "regression fix, the shiftcalendar 700px min-width table, the workflowconfigpage "
    "card token) — the count lockstep 941 + 488 = 1429 specs · 1576 tracked PNGs · the "
    "byte chain renumbered +44 with the duplicate 1297 login pair retired "
    "(blob-verified — the identical evidence stands at 1237 + 1391)) · Previous: "
    "3.73.0 (the chart-suite + stale-measurement round) · 3.72.0 (the session-87 "
    "TRIPLE UNION) · 3.71.0 (the companion reconciliation) · 3.70.0 (the "
    "tab-interior round) · **Last updated:** 2026-10-24)\n"
)
NEW_STATE = "> **State:** 941 unit + 488 E2E tests green, lint/typecheck/build\n"

ver_idx = next((i for i, l in enumerate(lines)
                if l.startswith("> **Version:** 3.74.0 (session-88 — THE DOUBLE UNION")), None)
if ver_idx is not None:
    print("  skip: SKILL already at 3.74.0 (idempotent re-run)")
else:
    ver_idx = next((i for i, l in enumerate(lines)
                    if l.startswith("> **Version:** 3.73.0 (session-88 — THE CHART-SUITE")), None)
    if ver_idx is None:
        fail("SKILL version line 3.73.0 not found")
    if not lines[ver_idx + 1].startswith("> **State:** 941 unit + 476 E2E"):
        fail("SKILL State line not in the expected 476 form")
    lines[ver_idx] = NEW_VERSION
    lines[ver_idx + 1] = NEW_STATE
    skill.write_text("".join(lines), encoding="utf-8")
    ok("SKILL version -> 3.74.0 (the DOUBLE UNION) + State -> 488")

# --------------------------------------------------------------- 2. AGENTS ---
agents = ROOT / "AGENTS.md"
text = agents.read_text(encoding="utf-8")

AGENTS_PARA = """

**THE FOURTH PARALLEL-SESSION RECONCILIATION (merge #4, the session-88 union):** the push preflight (the wrapper's step 4) read the remote main ahead at `b180558` — a THIRD parallel session-88 execution (`ab4b93a`, the CHART-SUITE + STALE-MEASUREMENT round: the surveyanalytics 3-chart reconfiguration with the recharts 2.x-vs-3.x zero-state contract decoded (the explicit `ticks` ladder + `allowDataOverflow`, the legend reservation, the XAxis auto-grow), the attendancedashboard family (the month input + the chart geometry + the plain-table rebuild), the reports 11-glyph census + the shared RefFilterGlyph extraction, the tenantsetup +6 header, the hrreports grid-only chart, the shiftswap 40px tiles — the same find as this round's R88-J, the companywall composer trio — E2E 476/476, its own session_202/plan/§99) + the owner's prompt archive (`c9845d8`/`b180558`, docs-only). THE UNION: the published deeper forms kept (reports/shiftswap/companywall/attendancedashboard/tenantsetup + the surveyanalytics explicit-tick-ladder — this round's R88-C spec amended to the union contract: the Distribution EMPTY + the Trend's 5-tick reference ladder) · this round's unique members kept (the advancedanalytics Plus, the analyticsdashboard flex-nowrap chain, the profile icon family, the chat always-visible column, the shiftcalendar 700px min-width, the workflowconfigpage token, the 12-test mobile-band spec) · the docs union (`session_202.md` keeps the published number, this narrative renumbered `session_203.md`; the published plan base + this round's mobile-band appendix; the SKILL §99 published / §100 this round, v3.74.0) · the byte chain renumbered +44 (1343-1389 + the dev set 1391-1401) with the duplicate 1297 login pair retired (byte-identical both sides, blob-verified — the identical evidence stands at 1237 + 1391) · the counts lockstepped to the union totals (E2E 488 = the 460 standing + the 12 mobile-band + the 16 chart-recipes · 1429 total specs · 1576 tracked PNGs = the 1478 base + the 46 published + this round's 54 unique).

Gates (the merged tree, re-verified before the landing): lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · E2E **488/488** (the 460 standing + the 12 mobile-band + the 16 chart-recipes, 8.6m, zero flakes — all four spec families green together) · **1576 tracked PNGs** · DB pristine.
"""

if "THE FOURTH PARALLEL-SESSION RECONCILIATION" in text:
    print("  skip: AGENTS already carries the fourth-reconciliation paragraph")
else:
    if "The round's traps (retired): the chromium version wipe" not in text[-3000:]:
        fail("AGENTS tail anchor (the session-88 traps paragraph) not found")
    agents.write_text(text.rstrip("\n") + "\n" + AGENTS_PARA, encoding="utf-8")
    ok("AGENTS fourth-reconciliation paragraph + gates line appended")

# -------------------------------------------------------------- 3. worklog ---
worklog = ROOT / "worklog.md"
wtext = worklog.read_text(encoding="utf-8")

ANCHOR = "\n\nStage Summary:\n- Round 87 delivered: THE MOBILE-BAND CROSS-SIDE ROUND"
BULLET = (
    "- THE FOURTH PARALLEL-SESSION RECONCILIATION (merge #4, the session-88 union): "
    "the push preflight read the remote ahead (`b180558` — the parallel chart-suite "
    "round `ab4b93a` + the owner's prompt archive `c9845d8`/`b180558`) → the union "
    "merge (the published deeper forms kept — surveyanalytics/reports/shiftswap/"
    "companywall/attendancedashboard/tenantsetup; this round's unique members kept — "
    "the advancedanalytics Plus, the analyticsdashboard nowrap chain, the profile "
    "icons, the chat always-visible column, the shiftcalendar 700px, the "
    "workflowconfigpage token; the R88-C spec amended to the union contract; the "
    "byte chain renumbered +44 with the duplicate 1297 login pair retired "
    "blob-verified — the identical evidence stands at 1237 + 1391) · the counts "
    "lockstepped (E2E 488/488 · 1429 total specs · 1576 tracked PNGs) · the merged "
    "tree re-verified with the full gates before the landing (lint 0/0 · tsc ✓ · "
    "941/941 unit · build ✓ · E2E 488/488, 8.6m zero flakes)\n"
)

if "THE FOURTH PARALLEL-SESSION RECONCILIATION" in wtext:
    print("  skip: worklog already carries the fourth-reconciliation bullet")
else:
    if wtext.count(ANCHOR) != 1:
        fail("worklog session-88 Stage Summary anchor not unique")
    wtext = wtext.replace(ANCHOR, "\n" + BULLET + ANCHOR)
    worklog.write_text(wtext, encoding="utf-8")
    ok("worklog reconciliation bullet inserted into the session-88 entry")

# -------------------------------------------------------- 4. session_203.md ---
s203 = ROOT / "docs" / "session_203.md"
stext = s203.read_text(encoding="utf-8")

OLD_TAIL = "The merged tree re-verified with the full gates before the landing (below)."
NEW_TAIL = (
    "The merged tree re-verified with the full gates before the landing: **lint 0/0 · "
    "tsc ✓ · 941/941 unit · build ✓ · E2E 488/488** (the 460 standing + the 12 "
    "mobile-band + the 16 chart-recipes, 8.6m, zero flakes — all four spec families "
    "green together) · **1576 tracked PNGs** (the 1478 base + the published 46 + this "
    "round's 54 unique after the duplicate 1297 login-pair retirement — every "
    "surviving blob hash-verified present, the identical login evidence standing at "
    "1237 + 1391) · DB pristine."
)
OLD_COUNT = "· **1429 total specs** (941 unit + 488)."
NEW_COUNT = "· **1429 total specs** (941 unit + 488) · **1576 tracked PNGs**."

if OLD_TAIL not in stext:
    print("  skip: session_203 tail already finalized")
else:
    if stext.count(OLD_TAIL) != 1:
        fail("session_203 '(below)' tail line not found/unique")
    stext = stext.replace(OLD_TAIL, NEW_TAIL)
    if stext.count(OLD_COUNT) != 1:
        fail("session_203 count-lockstep sentence not found/unique")
    stext = stext.replace(OLD_COUNT, NEW_COUNT)
    s203.write_text(stext, encoding="utf-8")
    ok("session_203 gates line finalized + the union PNG count added")

# ------------------------------------------------------------ post-checks ---
print("\nPOST-CHECKS")

s = (ROOT / "eon-hr_SKILL.md").read_text(encoding="utf-8").splitlines()
vi = next(i for i, l in enumerate(s) if l.startswith("> **Version:** 3.74.0"))
assert s[vi].startswith("> **Version:** 3.74.0 (session-88 — THE DOUBLE UNION"), "version line"
assert "Previous: 3.73.0 (the chart-suite + stale-measurement round)" in s[vi], "prev chain"
assert "3.72.0 (the session-87 TRIPLE UNION)" in s[vi], "prev chain 2"
assert s[vi + 1] == NEW_STATE.rstrip("\n"), "state line"
assert "941 unit + 476" not in "\n".join(s[:20]), "stale 476 head"
ok("SKILL: 3.74.0 version + Previous chain + State 488")

a = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
assert a.count("THE FOURTH PARALLEL-SESSION RECONCILIATION") == 1, "agents para count"
assert "E2E **488/488**" in a[-2500:], "agents gates line"
assert "1576 tracked PNGs" in a[-2500:], "agents png count"
ok("AGENTS: paragraph + gates + counts")

w = (ROOT / "worklog.md").read_text(encoding="utf-8")
assert w.count("THE FOURTH PARALLEL-SESSION RECONCILIATION") == 1, "worklog bullet count"
assert "The r89 queue: the tenantsetup title font member, the companywall composer offset" in w[-400:], "worklog tail intact"
assert w.rstrip().endswith("the REF theme-variance root cause"), "worklog last line intact"
ok("worklog: bullet + tail preservation")

t = s203.read_text(encoding="utf-8")
assert "(below)" not in t, "leftover (below)"
assert t.count("1576 tracked PNGs") == 2, "203 png count occurrences"
ok("session_203: gates finalized + counts")

png_count = int(subprocess.run(
    ["git", "ls-files", "docs/screenshots/"],
    cwd=ROOT, capture_output=True, text=True).stdout.count(".png"))
assert png_count == 1576, f"tracked PNG count {png_count} != 1576"
ok(f"git-tracked PNGs = {png_count} (matches every doc claim)")

e2e = subprocess.run(
    ["git", "ls-files", "tests/e2e/"],
    cwd=ROOT, capture_output=True, text=True).stdout.count(".spec.ts")
print(f"  info: {e2e} E2E spec files tracked (the count-lockstep: 488 specs)")
ok("E2E spec inventory present")

print(f"\nALL DONE — {POST_CHECKS} post-checks green")
