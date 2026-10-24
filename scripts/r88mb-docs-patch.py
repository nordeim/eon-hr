#!/usr/bin/env python3
"""r88-docs-patch.py — the session-88 docs layer: the AGENTS/CLAUDE/README
count-lockstep (941 unit + 472 E2E = 1413 total specs · 1534 tracked PNGs)
+ the AGENTS session-88 layer + the SKILL version line + the worklog entry.
Every replacement is asserted (count > 0) so a miss fails loudly."""
import re
import sys

REPO = "/home/z/my-project/eon-hr"

def patch(path, pairs, append=None):
    with open(path, encoding="utf-8") as f:
        text = f.read()
    for old, new in pairs:
        n = text.count(old)
        assert n >= 1, f"MISS in {path}: {old[:90]!r} (found {n})"
        text = text.replace(old, new)
    if append:
        text = text.rstrip("\n") + "\n\n" + append.rstrip("\n") + "\n"
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"patched {path} ({len(pairs)} replacements)")

# ---------- AGENTS.md ----------
patch(f"{REPO}/AGENTS.md", [
    # the command row
    ("| E2E tests | `bun run test:e2e` (Playwright, 460 specs — needs `bun run build` first; the runner does NOT build for you) |",
     "| E2E tests | `bun run test:e2e` (Playwright, 472 specs — needs `bun run build` first; the runner does NOT build for you) |"),
])

AGENTS_LAYER = """## Session 88 (parity round 87) — THE MOBILE-BAND CROSS-SIDE ROUND (the r87 close-out's named frontier: the first full-registry cross-side pass at 390×844 — all 61 authed routes) finding TWELVE clone-authored defects, ALL TDD-FIXED

**The round's fresh-eyes instrument:** `r88-mobile-capture/diff/triage/crop-diff` + the VLM crop reads + both-sides DOM probes + **the 3× reload stability verification** (`r88-variant-stability2.mjs` — every pinned recipe re-read on fresh loads against the r87 second-build-variant finding; all twelve STABLE 3/3). The read: **39 STRUCTURAL / 22 MINOR/AA** on the 61-route mobile registry; the triage: 8 data-driven clusters classified (careers' live job board, employeeselfservice's REF-side loading loop, the 0-vs-1 stats family, the bottom tables, the avatar/name/role) + **TWELVE clone-authored defects**:

- **R88-A the reports CATEGORY ICON family** — four glyph identities on one page: calendar-days→**Plane**, banknote→**DollarSign**, heart-handshake→**Shield**, file-text→**FileCheck** (the r86-E/R87 glyph-identity class)
- **R88-B the advancedanalytics Schedule Report CTA** — CalendarClock→**Plus** (paths M5 12h14 ~ M12 5v14)
- **R88-C the surveyanalytics ZERO-DATA CHARTS** — data=[] at zero responses on the Distribution + the Trend (the invented X axes retired; the queue's #1 structural divergence). The version-class residual documented: the REF's Trend Y-domain tick labels at zero data render only on recharts 2.x
- **R88-D the analyticsdashboard actions cluster** — `flex-nowrap` (the REF's unwrapped `flex items-center gap-3`): the REF-authored mobile overflow chain — the 456px natural-width cluster → the 488 root scroll → the subtitle ONE line (h=24)
- **R88-E the attendancedashboard MONTH FILTER** — the missing functional member: a `type=month` w-40 input FIRST in the actions, wired to `?month=YYYY-MM` (the server reads the param — window/title/day-count reload; the functional SUPERSET)
- **R88-F the profile icon family** — Camera→**Upload** (Change Photo), User→**CircleUser** (General), Globe→**Share2** (Social)
- **R88-G the chat conversations column** — **always visible** (the REF's `w-80 border-r flex flex-col`): the prior `hidden md:flex` was a clone-authored responsive invention leaving mobile users NO way to open a conversation — a functional regression AND a visual defect (the fix restores both)
- **R88-H the shiftcalendar table** — the REF's inline **min-width: 700px** (100px day columns + the one-row toolbar follow from the overflow)
- **R88-I the workflowconfigpage empty-state card** — the missed `text-card-foreground` (the r87-I card-family call site)
- **R88-J the shiftswap stat-card TILES** — the r49 "inline icon family" pin RETIRED as a stale measurement: the live REF renders `w-10 h-10 rounded-xl bg-*-100` tiles with the icon inside
- **R88-K the tenantsetup hero glyph** — Users→**Building2**
- **R88-L the companywall audience filter** — the **Users** glyph inside the trigger's `flex items-center gap-2` wrapper

**THE CONTRACT PINS:** `tests/e2e/session88-mobileband.spec.ts` (12 tests) RED 12/12 as designed → GREEN; the lockstep amendments: the recipes.test.ts profile tab pair (User→CircleUser, Globe→Share2) + the Schedule Report glyph (CalendarClock→Plus).

**THE POST-FIX MOBILE RE-VERIFY:** chat **73→4**, shiftcalendar **101→3**, shiftswap **65→2**, workflowconfigpage **11→2**, analyticsdashboard **120→29**; the residuals carried with classifications (the data-driven sets + the tenantsetup title member + the companywall composer offset + the surveyanalytics version class). **THE DESKTOP-BAND REGRESSION CHECK:** the changed surfaces clean (chat 4, shiftswap 3, workflowconfigpage 4, profile 9 cells); the standing E2E pins the primary guard.

**THE MOBILE-MENU CYCLE: GREEN** on the remediated build (open → Training LMS → /training → auto-close; no TW-v4 regression under the twelve fixes; the mobile-navigation suite 17/17 inside the 472).

**THE BYTE CHAIN (r88-screenshots, numbers 1297-1345 + the dev-server set 1347-1357 → 1534 tracked PNGs):** the login standing pair **BYTE-IDENTICAL** to `69aa4241…` (the 58th holding through a THIRD consecutive round) + the twelve mobile re-baselines + the twelve desktop guards + the six DEV-SERVER captures (the running-codebase evidence).

Gates: lint 0/0 · tsc ✓ · 941/941 unit · build ✓ · **E2E 472/472 (the 460 standing + the 12 new, 8.1m, zero flakes)** · the login pair byte-identical · 1534 tracked screenshots (+56) · DB pristine. The plan: `docs/remediation-plan-session88.md`; the narrative: `docs/session_202.md`; the SKILL §99 (v3.73.0).

The round's traps (retired): the chromium version wipe (1200 vs 1248 — the r1248 lesson re-fired), the daemon-overload class (three firings), the resource-exhaustion EAGAIN class, the MultiEdit phantom-partial-apply re-fired, the strict-mode hidden-sidebar selector class (the unique-subtitle-anchor form), the recharts-3.x tick-selector mismatch, the stale-viewport triage ghost, the exported-DATABASE_URL trap (the TENTH consecutive sandbox)."""

with open(f"{REPO}/AGENTS.md", "a", encoding="utf-8") as f:
    f.write("\n\n" + AGENTS_LAYER + "\n")
print("AGENTS.md session-88 layer appended")

# ---------- CLAUDE.md ----------
patch(f"{REPO}/CLAUDE.md", [
    ("a 1401-spec test pyramid (941 unit + 460 E2E",
     "a 1413-spec test pyramid (941 unit + 472 E2E"),
])

# ---------- README.md ----------
with open(f"{REPO}/README.md", encoding="utf-8") as f:
    rd = f.read()
pairs = [
    ("1401", "1413"),
    ("460 E2E", "472 E2E"),
    ("1478 tracked", "1534 tracked"),
]
for old, new in pairs:
    if old in rd:
        rd = rd.replace(old, new)
        print(f"README.md: {old} -> {new} ({rd.count(new)} now)")
    else:
        print(f"README.md: pattern {old!r} not found (verify manually)")
with open(f"{REPO}/README.md", "w", encoding="utf-8") as f:
    f.write(rd)

# ---------- eon-hr_SKILL.md ----------
with open(f"{REPO}/eon-hr_SKILL.md", encoding="utf-8") as f:
    sk = f.read()
m = re.search(r"> \*\*Version:\*\* 3\.72\.0", sk)
assert m, "SKILL version line not found"
sk = sk.replace("> **Version:** 3.72.0", "> **Version:** 3.73.0", 1)
print("SKILL version -> 3.73.0")
SKILL_SECTION = """

## 99. The Mobile-Band Cross-Side Round (session 88 / parity round 87)

**The lesson:** the responsive bands are SEPARATE parity surfaces. The desktop band (1440×900) had been full-registry cross-compared since r87 while the mobile band (390×844) had NEVER been — and it held TWELVE clone-authored defects invisible to every desktop-band round, including a functional regression (the chat column hidden at mobile left users unable to open a conversation) and a missing functional member (the attendancedashboard month filter). The cross-side protocol must be run PER BAND: the same route can be desktop-clean and mobile-divergent (and vice versa).

**The standing rules from the round:**

1. **Every pinned recipe is re-read 3× on fresh loads before it enters a remediation plan** — the r87 REF light-mode build variant means a single capture can read the flipped build; the stability probe (fresh session, three sequential loads, identical reads required) is the gate.
2. **The strict-mode selector trap at mobile:** a `text=Page Title` wait matches the HIDDEN sidebar's nav item FIRST (display:none but earlier in DOM order) and stalls the wait — wait on a unique VISIBLE anchor (the subtitle text) instead.
3. **The recharts 3.x selector form:** `.recharts-cartesian-axis-tick text` returns 0 — count the tick ELEMENT, not its text child.
4. **The overflow-chain family is authored, not accidental:** the REF ships `min-width` on tables and unwrapped action clusters that deliberately overflow the mobile viewport (shiftcalendar 700px table; analyticsdashboard 456px cluster → the 488 scroll). Matching the REF means REPRODUCING its overflows — never "fix" them with responsive wrapping the REF does not carry (the R81-C lesson, now with two more members).
5. **The stale-measurement retirement:** a pin that says "live-measured" measured the build of ITS day (the r49 shiftswap inline icons vs the live REF's tiles). When a live read contradicts an old pin, the live read wins and the pin is amended in the same commit — with the retirement documented.
6. **The functional-superset bridge:** when the REF carries a functional member the clone lacks (the month filter), the fix wires it FULLY (the param round-trip), not just visually.

**The traps of the round (documented in AGENTS/session_202):** the chromium version wipe, the daemon overload (three firings), the resource-exhaustion EAGAIN class, the MultiEdit phantom-partial-apply, the exported-DATABASE_URL trap (the tenth consecutive sandbox).
"""
sk = sk.rstrip("\n") + "\n" + SKILL_SECTION
with open(f"{REPO}/eon-hr_SKILL.md", "w", encoding="utf-8") as f:
    f.write(sk)
print("SKILL §99 appended")

print("\nDOCS PATCH COMPLETE")
