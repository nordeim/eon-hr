#!/usr/bin/env python3
"""r87-docs-patch.py — session-87 docs layer: the AGENTS session-87 layer,
the SKILL version bump + §97, and the count lockstep (941+447=1388, 1466
tracked screenshots) across AGENTS/CLAUDE/README."""
import re

AGENTS = "/home/z/my-project/eon-hr/AGENTS.md"
CLAUDE = "/home/z/my-project/eon-hr/CLAUDE.md"
README = "/home/z/my-project/eon-hr/README.md"
SKILL = "/home/z/my-project/eon-hr/eon-hr_SKILL.md"

SESSION87 = """
## Session 87 (parity round 86) — the full-registry cross-side pixel-diff round: the standing cross-side at-rest pixel-diff protocol extended to the REMAINING 52 registry routes (the program's first COMPLETE 61-route cross-side coverage) finding FOURTEEN clone-authored defects, ALL TDD-FIXED (the icon-identity family — assets Inbox→Laptop + organogram Network→Users + chat MessageSquarePlus→Plus + offboarding CircleCheckBig→Users + the employeeportal bg-blue-100 circle wrapper; the payrollmodule empty sentence; the interviewassistant at-rest card set — the AI Analysis card now analysis-conditional, the word counter dropped, the h16 title divs, the rows-12 textarea + the label-groups' +8 trailing-slot spacing; the payrollai h16 title; the reports border-slate-200+shadow family at BOTH card levels; the tenantsetup h68 fields via pb-2 + the payrollengine h64 fields; the loans container offset — the space-y-8 member of the r86-A2 margin-collapse class; the dynamicdashboard nav-active alias mapping; the attendancedashboard LineChart→grouped BarChart + recharts 3.x's Legend itemSorter={null}) + the 58th deploy holding QUIET through the round (the full ladder green at the opening) + the theme-variance re-compare CONFIRMING the non-deterministic REF-side dark theming (3/7 dark routes flipped, no deploy, the LOC stable)

**The round's fresh-eyes instrument:** `r87-crossdiff-capture/diff/triage/deep/deep2/deep3/deep4/verify` — all 52 remaining authed routes captured cross-side @1440×900 LIGHT LTR, PIL grid-diffed (13 MINOR/AA + 39 STRUCTURAL), every cluster triaged (8 data-driven classified + 14 clone-authored fixed). The data-driven set: the REF's progressively-emptied tenant (advancedanalytics/analytics/analyticsdashboard stats, careers' live public job board, employeeselfservice's REF-side profile-loading loop, profile's role badge, shiftcalendar's employee count).

**THE CONTRACT PINS:** `tests/e2e/session87-crossdiff.spec.ts` (14 tests) RED 14/14 as designed → GREEN; FIVE standing pins amended in the same commit (the count-lockstep rule: the R30-C1 assets Inbox→Laptop, the R48-C1 interviewassistant titles→div + the conditional card, the R61-K payrollai CardTitle→div, the R66-J tenantsetup footer justify-between, the R50-A7 employeeportal bare-glyph→circle-wrapper — the stale-measurement retirement).

**THE POST-FIX PIXEL RE-VERIFY:** closed to the AA/MINOR floor — employeeportal 61→2, payrollai 51→2, dynamicdashboard 12→2, assets 7→4, organogram 8→3, loans 113→4, chat/offboarding at the version-AA class; improved with classified residuals (carried forward with the probe data): interviewassistant 188→67 (the placeholder-wrap member), reports 167→77 (the wrap/shift class), payrollengine 99→20 (the month-input micro-offset), payrollmodule 16→11 (the Actions-th column member), tenantsetup 124→123 (a title-area font-level delta + a -6 card member), attendancedashboard 191 (the header-row layout member — the REF's filters sit inline at y60 — + the chart2 gridlines + the data-driven bottom table).

**THE THEME-VARIANCE RE-COMPARE (the r86 watch's decisive read):** 3/7 REF dark routes DRIFTED (dashboard/payroll/attendance) + 4 stable — the NON-DETERMINISTIC REF-SIDE THEMING CONFIRMED (the r86 prediction: "flips again = the non-deterministic theming confirmed"); the LOC dark side all STABLE. The dark drawer pair drifted identically on both sides (the capture-condition class; the r88 chain re-baselines at 1283).

**THE BYTE CHAIN (r87-screenshots, numbers 1225-1283, 60 PNGs → 1466 tracked):** the login pair + the seven standing pairs BOTH SIDES STABLE + the fourteen remediated-route re-baselines (1241-1267) + the mobile-menu cycle GREEN (the Training LMS click → /training → the auto-close; the chain script's initial RED was a one-character case bug in the snapshot matcher — fixed).

**The carried-forward queue (r88 candidates):** the surveyanalytics 3-chart reconfiguration (the biggest remaining structural divergence — the REF's chart set: an empty-at-zero chart + two -100..100 reference-scale charts vs the LOC's category bar + time series + bare chart), the attendancedashboard header member, the tenantsetup title member, the reports wrap class, the lucide-composition drift (the shared icons' path-coordinate-level version differences — Users/Clock/SquareCheckBig/Laptop; a version pin is RISKY while five r86-verified icons match the pinned 0.525), the shiftswap stat-badge offset, the unresolved AA-class smalls (compliancedashboard/evaluations/surveys/templates/workflowautomation/workflowconfigpage/performancemanagement/staffrequests/requestsettings/requestreports/allleaverequests).

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 447/447 (the 433 standing + the 14 new, 7.4m, zero flakes)** · byte-stability: the primary surfaces both sides STABLE + the REF dark variance CONFIRMED · **1466 tracked screenshots (+60)** · DB pristine (users = [sepnetflix2023@outlook.com], employees 1, balances 2, jobPostings 0). The plan: `docs/remediation-plan-session87.md`; the narrative: `docs/session_197.md`; the SKILL §97 (v3.70.0).

The round's instrument traps (all retired): the background-process reaper (foreground + resume), the daemon overload, the mid-round chromium cache wipe (the standing r1248 lesson re-fired), the JSX comment placement trap (the {/* */} form is INVALID in the attribute/ternary-expression positions), the stale standalone serving the old build after a rebuild (kill-by-PID + re-verify), the read-layer cache corruption (ACTIVE — the Read tool + compilers over bash reads), the MultiEdit phantom-partial-apply (verify the file state after every failed batch).
"""

with open(AGENTS) as f:
    agents = f.read()
agents = agents.replace(
    "| E2E tests | `bun run test:e2e` (Playwright, 433 specs — needs `bun run build` first; the runner does NOT build for you) |",
    "| E2E tests | `bun run test:e2e` (Playwright, 447 specs — needs `bun run build` first; the runner does NOT build for you) |",
)
agents = agents.rstrip() + "\n" + SESSION87 + "\n"
with open(AGENTS, "w") as f:
    f.write(agents)
print("AGENTS.md: session-87 layer added + the 447 count")

with open(CLAUDE) as f:
    claude = f.read()
claude = claude.replace(
    "a 1374-spec test pyramid (941 unit + 433 E2E — the session-74 PWA",
    "a 1388-spec test pyramid (941 unit + 447 E2E — the session-87 full-registry cross-side pixel-diff round extended the standing protocol to all 61 routes finding fourteen clone-authored defects all TDD-fixed (the session-74 PWA",
)
with open(CLAUDE, "w") as f:
    f.write(claude)
print("CLAUDE.md: the 1388 count + the session-87 clause")

with open(README) as f:
    readme = f.read()
readme = readme.replace("| E2E tests | Playwright | 1.63 | 433 specs", "| E2E tests | Playwright | 1.63 | 447 specs")
readme = readme.replace("bun run test:e2e      # Playwright E2E (433 specs)", "bun run test:e2e      # Playwright E2E (447 specs)")
with open(README, "w") as f:
    f.write(readme)
print("README.md: the 447 counts")

with open(SKILL) as f:
    skill = f.read()
skill = re.sub(
    r"> \*\*Version:\*\* 3\.69\.0 \(session-86 audit complete",
    "> **Version:** 3.70.0 (session-87 audit complete",
    skill,
    count=1,
)
skill = re.sub(r"\*\*Last updated:\*\* 2026-10-24\)", "**Last updated:** 2026-10-24)", skill, count=1)
with open(SKILL, "w") as f:
    f.write(skill)
print("SKILL.md: the 3.70.0 version bump")
print("docs patch complete")
