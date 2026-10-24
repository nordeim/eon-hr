#!/usr/bin/env python3
"""r89-docs-patch.py — the session-89 docs layer: the count-lockstep updates
across AGENTS/CLAUDE/README/SKILL + the AGENTS session-89 layer + the SKILL
§101 + the worklog round-88 entry. Idempotent (skip paths on re-run),
assert-heavy per the standing convention.
Run from the repo root: python3 scripts/r89-docs-patch.py"""
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


# ---------------------------------------------------------------- 1. AGENTS ---
agents = ROOT / "AGENTS.md"
t = agents.read_text(encoding="utf-8")

if "## Session 89 / Parity Round 88" in t:
    print("  skip: AGENTS already carries the session-89 layer")
else:
    # the count-lockstep rows first
    old_row = "| E2E tests | `bun run test:e2e` (Playwright, 488 specs — needs `bun run build` first; the runner does NOT build for you) |"
    new_row = "| E2E tests | `bun run test:e2e` (Playwright, 494 specs — needs `bun run build` first; the runner does NOT build for you) |"
    if t.count(old_row) != 1:
        fail("AGENTS E2E row not found/unique")
    t = t.replace(old_row, new_row, 1)

    AGENTS_LAYER = """

## Session 89 / Parity Round 88 — the DARK/RTL MOBILE-BAND round (the r88 close-out's named frontier: the first cross-side pass over the theme-direction states at 390×844 — the full 61-route registry in DARK and in RTL) + the standing user emphasis (the mobile-menu cycle) + the carried queue (both items verified already closed by the parallel round's published fixes)

**THE OPENING READ — the 59TH LOGIN DEPLOY (NON-VISUAL):** the login JS moved `index-DzlN4LV0 → index-BWZiPLrS` with the `frontend-config` script now on the LOGIN page too — carrying `TURNSTILE_SITE_KEY` + `TURNSTILE_LOGIN_ENABLED: "true"` (the standing Turnstile escalation: the login arming now CONFIGURED, but 0 widgets render — verified). The full standing ladder GREEN: the fresh login pair **BYTE-IDENTICAL** to the `69aa4241…` baseline + standing 5/5 + sweep 12/12 (after the documented cookie re-auth) + verify-r49 13/13 + verify-r45 13/13.

**THE THEME-VARIANCE ROOT CAUSE DECODED (the queue's named item):** the documented non-deterministic REF theme/build variants are the platform's **per-visitor A/B experiment system** — `window.__APP_CONFIG__.PRE_AUTH_EXPERIMENTS` assigns a `visitor_id` per session and serves variant builds (two fresh sessions read `auth-signup-free-tagline: "tagline"` vs `"control"` — direct evidence, no deploy). The capture protocol gains the standing experiment-assignment probe.

**THE DARK MOBILE-BAND READ: 26 IDENTICAL / 13 MINOR-AA / 22 STRUCTURAL** — the base dark palettes, headers, bottom navs, and cards render pixel-identical on 26 of 61 routes (the session-83 dark architecture holds). The triage (the digest + cluster-locate + VLM-with-DOM-verification discipline — five VLM misreads caught): **4 REF-BROKEN routes** (below), **10 data-driven/role classes**, **5 clone-authored defects — ALL TDD-FIXED (RED 6/6 → GREEN)**:

- **R89-A the attendancedashboard tick-font inversion + the mobile Export-button off-canvas chain** — the REF's XAxis ticks render at **11px** (3× stable, both themes; the YAxis at the inherited 16px — the MIXED form; the r88-B2 round's 16px XAxis claim was a measurement error in that parallel round). THE FIX: the 11px XAxis pin restored + the YAxis 16px pin + the REF's authored `overflow-x-auto > w-full text-sm` card-body wrapper + the Export button in a `w-full md:w-auto` wrapper (the verified simulation renders the REF's exact form: x=16/y=217/w=163 — the button was OFF-CANVAS at x=376 on the 390 viewport, unreachable at scroll-x=0).
- **R89-B the analyticsdashboard tick inversion (the mirror)** — the REF renders ALL ticks there at the inherited 16px; the LOC's three stale `tick={{ fontSize: 11 }}` pins removed.
- **R89-C the requestsettings approver-email input** — `type="email"` → the REF's `type="text"`.
- **R89-D the hrassistantchat grid height** — the REF's `h-[calc(100vh-250px)]` applies at ALL widths (594px at mobile); the LOC's `lg:`-gated form rendered 329px. THE FIX: the unconditional height. **POST-FIX: the route CLOSED to IDENTICAL (max2).**
- **R89-E the profile kicker placement (the 32px mobile offset)** — the REF hoists the mobile kicker OUT of the content column (`p-4 > [kicker, max-w-5xl]` — profile-specific; every other kicker page matches the root placement). THE FIX: the exported `PageHeaderMobileKicker` + the profile page renders it at the root. **POST-FIX: 86 → 5 cells.**

**THE REF-BROKEN MOBILE SET (4 routes — the functional-superset proof):** the REF renders `hrreports` + `interviewassistant` as an **EMPTY `#root`** (the full React crash) and `employeeselfservice` + `employeedetail` as an empty shell — below ~640px, theme-independent, live-verified. The clone renders all four fully. **The r88 classification of employeeselfservice ("the data-driven loading-loop class") is RETRACTED** — it was the empty shell.

**THE RTL MOBILE-BAND READ: 0 IDENTICAL / 34 MINOR-AA / 27 STRUCTURAL** — the second half of the frontier (`app_lang="ar"`, LIGHT). The capture-validity trap retired (the VLM direction misjudgment disproven by the decisive byte-compare: a fresh verified-`dir=rtl` capture md5-identical to the band file). The read: the systematic bidi AA floor (34 routes ≤5) + the same residual classes as the dark band + two RTL-specific members flagged for r90 (the assetmanagement chevron, the allleaverequests icon spacing).

**THE MOBILE-MENU CYCLE GREEN** on the baseline AND the fixed build (open → Training LMS → `/training` → the auto-close; no TW-v4 regression under the five fixes). **THE LOCKSTEP AMENDMENTS:** the R88-B2 e2e pin (the wrong-axis claim — the Y-tick contract clarified) + the R61-O/R63-C/R17-B unit pins (the kicker props moved to the standalone component — five amended, the count 941 unchanged).

Gates: lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · **E2E 494/494** (the 488 standing + the 6 new, 8.9m, zero flakes) · the login pair byte-identical · **1596 tracked PNGs** (the chain 1403-1427: the dev-server set + the dark/RTL band pairs) · DB pristine · `.env.example` re-verified. The plan: `docs/remediation-plan-session89.md`; the narrative: `docs/session_205.md`; the SKILL §101 (v3.75.0)."""
    t = t.rstrip("\n") + "\n" + AGENTS_LAYER + "\n"
    agents.write_text(t, encoding="utf-8")
    ok("AGENTS: the session-89 layer + the 494 row")

# --------------------------------------------------------------- 2. CLAUDE ---
claude = ROOT / "CLAUDE.md"
c = claude.read_text(encoding="utf-8")
if "1429-spec test pyramid (941 unit + 488 E2E" in c:
    c = c.replace(
        "1429-spec test pyramid (941 unit + 488 E2E",
        "1435-spec test pyramid (941 unit + 494 E2E",
        1,
    )
    claude.write_text(c, encoding="utf-8")
    ok("CLAUDE: 1429 → 1435 (941 + 494)")
else:
    print("  skip: CLAUDE pyramid row already at 494 or moved")

# --------------------------------------------------------------- 3. README ---
readme = ROOT / "README.md"
r = readme.read_text(encoding="utf-8")
changed_r = False
for old, new in [
    ("488 specs across auth", "494 specs across auth"),
    ("bun run test:e2e      # Playwright E2E (488 specs)", "bun run test:e2e      # Playwright E2E (494 specs)"),
]:
    if old in r:
        r = r.replace(old, new, 1)
        changed_r = True
if changed_r:
    readme.write_text(r, encoding="utf-8")
    ok("README: 488 → 494")
else:
    print("  skip: README rows already at 494 or moved")

# ---------------------------------------------------------------- 4. SKILL ---
skill = ROOT / "eon-hr_SKILL.md"
s = skill.read_text(encoding="utf-8").splitlines(keepends=True)
if any(l.startswith("> **Version:** 3.75.0") for l in s):
    print("  skip: SKILL already at 3.75.0")
else:
    vi = next(i for i, l in enumerate(s) if l.startswith("> **Version:** 3.74.0"))
    NEW_V = (
        "> **Version:** 3.75.0 (session-89 — THE DARK/RTL MOBILE-BAND ROUND: the first "
        "cross-side pass over the theme-direction states at 390×844, finding FIVE "
        "clone-authored defects ALL TDD-FIXED (the attendancedashboard tick-font "
        "inversion — the r88 parallel round's wrong-axis measurement corrected: the "
        "REF renders the MIXED form, X ticks 11px / Y ticks 16px — plus the mobile "
        "Export-button off-canvas chain it drove; the analyticsdashboard mirror "
        "inversion; the requestsettings email-input authored form; the "
        "hrassistantchat unconditional grid height; the profile kicker hoist) + the "
        "REF-BROKEN MOBILE SET standing finding (4 routes crash on the reference at "
        "mobile — the clone's render is the superset) + the THEME-VARIANCE ROOT "
        "CAUSE DECODED (the platform's per-visitor PRE_AUTH_EXPERIMENTS variant "
        "system — the capture protocol gains the experiment-assignment probe) + the "
        "59th login deploy classified NON-VISUAL with the frontend-config decoded "
        "(TURNSTILE_LOGIN_ENABLED configured, 0 widgets rendered) · Previous: 3.74.0 "
        "(the session-88 DOUBLE UNION) · 3.73.0 (the chart-suite round) · 3.72.0 (the "
        "session-87 TRIPLE UNION) · **Last updated:** 2026-10-24)\n"
    )
    s[vi] = NEW_V
    # the State line
    si = next(i for i, l in enumerate(s[:vi + 4]) if l.startswith("> **State:**"))
    s[si] = "> **State:** 941 unit + 494 E2E tests green, lint/typecheck/build\n"
    skill.write_text("".join(s), encoding="utf-8")
    ok("SKILL: 3.75.0 + State 494")

# the §101 section (after §100)
if "## §101 Session 89" in skill.read_text(encoding="utf-8"):
    print("  skip: SKILL §101 already present")
else:
    sk = skill.read_text(encoding="utf-8")
    S101 = """

## §101 Session 89 (parity round 88) — THE DARK/RTL MOBILE-BAND ROUND: the first cross-side pass over the theme-direction states at 390×844 finding FIVE clone-authored defects (the mixed tick-font family — the wrong-axis measurement lesson) + the REF-broken mobile set + the theme-variance root cause decoded

**The lesson (the wrong-axis measurement):** the r88-B2 round's comment claimed "the REF's computed tick style = 16px inherited" and retired the 11px pin — but its own e2e pin read the **Y axis first** (16px, correct) while the **X axis** renders 11px. A tick-font claim must name its AXIS: the REF renders the MIXED form on attendancedashboard (X 11px / Y 16px), the ALL-inherited 16px form on analyticsdashboard, and the mixed/inherited forms vary per page. The family probe (`r89-tickfont-probe.mjs`) walks every chart route and reads each axis separately — the per-axis census, not a blanket claim.

**The lesson (the off-canvas wrap chain):** a 31px chart-min-content delta (the recharts 3.x mount size vs 2.x) flipped the actions row's wrap decision — the Export button landed off-canvas at x=376 on the 390 viewport, unreachable at scroll-x=0. The page-min-content → row-available-width → wrap-decision chain is a standing diagnostic: when a CTA renders off-canvas, probe `documentElement.scrollWidth` against the viewport and walk the min-content drivers (the chart's svg width attr is the usual suspect in a recharts app).

**The lesson (the REF-broken set):** four reference routes (hrreports, interviewassistant, employeeselfservice, employeedetail) FAIL to render on the reference at mobile widths (< ~640px) — the empty `#root` or the empty shell. A cross-side diff on a broken-REF route reads as massive structural divergence that is NOT a clone defect: probe the REF's `#root` child count before classifying. The clone's full render is the correct superset form — do NOT "fix" the clone toward a broken reference.

**The lesson (the experiment-assignment probe):** the REF's theme/build variance is the per-visitor `PRE_AUTH_EXPERIMENTS` system. Before classifying any REF variant read (a palette flip, a "second build"), read `window.__APP_CONFIG__.PRE_AUTH_EXPERIMENTS.assignments` and re-read on a second session — variant differences are REF-authored, not deploys and not clone defects.

**The lesson (the capture-validity byte-compare):** the first VLM direction-check misjudged both RTL captures as LTR. The decisive proof: re-capture one route in the verified state (reading `document.documentElement.getAttribute('dir')` in the same session) and byte-compare (md5) against the band file — identical proves the band captured the intended state. Never trust a VLM direction/layout judgment without a DOM-level or byte-level confirmation.
"""
    sk = sk.rstrip("\n") + "\n" + S101
    skill.write_text(sk, encoding="utf-8")
    ok("SKILL: §101 appended")

# -------------------------------------------------------------- 5. worklog ---
worklog = ROOT / "worklog.md"
w = worklog.read_text(encoding="utf-8")
if "Agent: session-89 (parity round 88" in w:
    print("  skip: worklog already carries the session-89 entry")
else:
    ENTRY = """

---

Agent: session-89 (parity round 88 — the dark/rtl mobile-band round)
Task: Session 89 / Parity Round 88 — the first cross-side DARK/RTL mobile-band pass at 390×844 (the r88 close-out's named frontier) + the standing mobile-menu emphasis + the carried queue

Work Log:
- Workspace RESET (the eleventh): fresh clone @ 94694f7 (the round-87 union + the owner's session_204 transcript) · the environment rebuilt (.env + install + db push/seed, the exported-DATABASE_URL trap ACTIVE for the eleventh sandbox)
- Baseline gates GREEN on the unmodified HEAD: lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · E2E 488/488 (8.8m, zero flakes — the chromium version-wipe trap re-fired: 1200 vs 1248, re-installed)
- The standing audit: patch watch HOLD (16.4.3 = bug-fix backports only) · TW-v4 scan clean · secrets zero · the r88 union forms verified in-source
- THE OPENING READ: the 59TH LOGIN DEPLOY detected (login JS index-DzlN4LV0 → index-BWZiPLrS + the frontend-config script now on login) — classified NON-VISUAL: the fresh login pair BYTE-IDENTICAL to 69aa4241 + standing 5/5 + sweep 12/12 (after the cookie re-auth) + verify-r49 13/13 + verify-r45 13/13 + the Turnstile census 0 widgets
- THE FRONTEND-CONFIG DECODED: TURNSTILE_LOGIN_ENABLED "true" (configured, 0 widgets rendered) + the PRE_AUTH_EXPERIMENTS system — THE THEME-VARIANCE ROOT CAUSE (two fresh sessions read different variant assignments: "tagline" vs "control" — the per-visitor A/B experiment mechanism behind the documented non-deterministic REF theme variance)
- THE DARK MOBILE-BAND PASS: all 61 routes captured cross-side @390×844 DARK → 26 IDENTICAL / 13 MINOR-AA / 22 STRUCTURAL
- The triage: the digest + cluster + VLM-with-DOM-verification (five VLM misreads caught) → 4 REF-BROKEN routes (hrreports + interviewassistant render an EMPTY #root; employeeselfservice + employeedetail an empty shell — below ~640px, theme-independent; the r88 "loading-loop" classification of employeeselfservice RETRACTED) · 10 data/role classes · 5 clone-authored defects
- THE FIVE DEFECTS TDD-FIXED (RED 6/6 → GREEN): R89-A the attendancedashboard tick-font inversion (the REF's MIXED form — X 11px / Y 16px — the r88-B2 round's wrong-axis measurement corrected; the 11px XAxis pin restored + the YAxis pinned + the REF's overflow-x-auto > w-full text-sm card-body wrapper + the Export button's w-full md:w-auto wrap — the button was OFF-CANVAS at x=376, now the REF's exact x=16/y=217/w=163) · R89-B the analyticsdashboard mirror inversion (the three stale 11px pins removed) · R89-C the requestsettings email input → the REF's type=text · R89-D the hrassistantchat grid height (lg:-gated → unconditional; the route CLOSED to IDENTICAL) · R89-E the profile kicker hoist (the exported PageHeaderMobileKicker at the page root — the 32px offset retired; 86 → 5 cells)
- THE LOCKSTEP AMENDMENTS: the R88-B2 e2e pin (the wrong-axis 16px claim → the Y-tick contract) + the R61-O/R63-C/R17-B unit pins (the kicker props on the standalone component) — five amended, 941 unchanged
- THE RTL MOBILE-BAND PASS: all 61 routes captured cross-side @390×844 RTL (app_lang=ar) → 0 IDENTICAL / 34 MINOR-AA / 27 STRUCTURAL — the capture-validity trap retired (the VLM LTR misjudgment disproven by the md5 byte-compare dbe7e9dc8f); the systematic bidi AA floor + the same residual classes as the dark band + two RTL-specific members flagged for r90
- THE MOBILE-MENU CYCLE GREEN on the baseline AND the fixed build (open → Training LMS → /training → auto-close; no TW-v4 regression under the five fixes)
- THE POST-FIX DARK RE-CAPTURE: hrassistantchat 56 → IDENTICAL · profile 86 → 5 · attendancedashboard 88 → 35 (the residual = the documented recharts-version grid class + the data table row)
- THE EVIDENCE CHAIN 1403-1427 (the dev-server set 1403-1413 + the dark/RTL band pairs) → 1596 tracked PNGs
- Gates: lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · E2E 494/494 (the 488 standing + the 6 new, 8.9m, zero flakes) · DB pristine · .env.example re-verified

Stage Summary:
- Round 88 delivered: THE DARK/RTL MOBILE-BAND ROUND — the first cross-side pass over both theme-direction states at mobile, finding FIVE clone-authored defects ALL TDD-FIXED (the mixed tick-font family with the wrong-axis measurement lesson, the off-canvas Export button, the email input, the grid height, the kicker hoist) + the REF-BROKEN mobile set standing finding (the functional-superset proof) + the theme-variance root cause DECODED (the per-visitor experiment system)
- The r90 queue: the two RTL-specific members (the assetmanagement chevron, the allleaverequests icon spacing), the dark-band data residuals' re-reads, the recharts-version grid class (the standing watch), the experiment-assignment protocol's standing adoption, the 59th-or-newer login ladder (the re-armed watch)
"""
    worklog.write_text(w.rstrip("\n") + "\n" + ENTRY, encoding="utf-8")
    ok("worklog: the session-89 entry")

# ------------------------------------------------------------ post-checks ---
print("\nPOST-CHECKS")

a2 = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
assert a2.count("## Session 89 / Parity Round 88") == 1, "agents layer count"
assert "| E2E tests | `bun run test:e2e` (Playwright, 494 specs" in a2, "agents 494 row"
assert "1596 tracked PNGs" in a2, "agents png count"
ok("AGENTS verified")

c2 = (ROOT / "CLAUDE.md").read_text(encoding="utf-8")
assert "1435-spec test pyramid (941 unit + 494 E2E" in c2, "claude pyramid"
ok("CLAUDE verified")

r2 = (ROOT / "README.md").read_text(encoding="utf-8")
assert "494 specs" in r2, "readme 494"
ok("README verified")

s2 = (ROOT / "eon-hr_SKILL.md").read_text(encoding="utf-8")
assert "> **Version:** 3.75.0 (session-89" in s2, "skill version"
assert "> **State:** 941 unit + 494 E2E tests green" in s2, "skill state"
assert "## §101 Session 89" in s2, "skill 101"
ok("SKILL verified")

w2 = (ROOT / "worklog.md").read_text(encoding="utf-8")
assert w2.count("Agent: session-89 (parity round 88") == 1, "worklog entry count"
assert w2.rstrip().endswith("the re-armed watch)"), "worklog tail"
ok("worklog verified")

png = int(subprocess.run(["git", "ls-files", "docs/screenshots/"],
                         cwd=ROOT, capture_output=True, text=True).stdout.count(".png"))
# + the untracked new ones
untracked = subprocess.run(["git", "status", "--porcelain", "docs/screenshots/"],
                           cwd=ROOT, capture_output=True, text=True).stdout.count("??")
total_pngs = png + sum(1 for line in subprocess.run(
    ["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True
).stdout.splitlines() if line.startswith("??") and "docs/screenshots/" in line)
print(f"  info: tracked PNGs (committed so far) = {png}; the 1596 claim lands with this commit")
ok("PNG inventory read")

plan = (ROOT / "docs" / "remediation-plan-session89.md").read_text(encoding="utf-8")
assert "494/494" in plan, "plan gates line"
ok("plan verified")

print(f"\nALL DONE — {POST_CHECKS} post-checks green")
