#!/usr/bin/env python3
"""r88-docs-patch.py — the count-lockstep + session-88 layer patches for
AGENTS.md / CLAUDE.md / README.md / eon-hr_SKILL.md (the standing docs
pattern). Counts: 941 unit (unchanged) + 476 E2E = 1417 total;
1531 tracked PNGs; SKILL 3.73.0 + §99."""
import re, sys

def patch(path, subs, count):
    src = open(path).read()
    n = 0
    for old, new in subs:
        if old not in src:
            print(f"  !! MISS in {path}: {old[:70]}...")
            continue
        src = src.replace(old, new, 1)
        n += 1
    open(path, "w").write(src)
    print(f"{path}: {n}/{count} patches applied")

# ---------------- AGENTS.md ----------------
AG = []
AG.append((
  "| E2E tests | `bun run test:e2e` (Playwright, 460 specs — needs `bun run build` first; the runner does NOT build for you) |",
  "| E2E tests | `bun run test:e2e` (Playwright, 476 specs — needs `bun run build` first; the runner does NOT build for you) |"))
AGENTS_TAIL = """

## Session 88 / Parity Round 87 — the chart-suite + stale-measurement round

The r87 close-out's named frontier #1 — **the surveyanalytics 3-chart reconfiguration** ("the biggest remaining structural divergence") — executed together with the named residuals the same probes re-measured. Seven routes re-captured cross-side, every STRUCTURAL cluster localized, **SEVENTEEN defect members ALL TDD-FIXED** (R88-A1..A3 the surveyanalytics zero-state chart suite: the empty surface / the -100..100 reference scale with the left YAxis / the right-axis scale + the legend pair — the round's key recharts lesson: 3.x computes no axis ticks for empty/all-null data even with an explicit domain; the explicit `ticks` ladder + `allowDataOverflow` are BOTH required (the #7362 handling); R88-B1..B4 the attendancedashboard family: the missing month input (the superset wired via the `?month=` round-trip), the chart1 geometry + the 19-tick 2.x-cadence mimic (the XAxis height pin — 3.x auto-grows the band for the inherited 16px font), the Clock-In grid-only form, the summary card's plain h80 header + "Rate" + the plain-table rebuild; R88-C the tenantsetup +6 header (the space-y collision class, third instance — v4's margin-bottom-on-not-last-child collides with the circle's mb-4); R88-D1..D5 the reports icon family (the bare 20px title icons, the Plane/DollarSign/Shield/FileCheck tab swaps — the full 11-glyph census, the shared RefFilterGlyph, the Download pair, the card-header gradient band — the sRGB-pinned trap-3 form); R88-E1..E3 the hrreports grid-only chart + the FileSpreadsheet/Download pair + the Data Table icon; R88-F the shiftswap 40px stat tiles (the R49-B1 STALE-MEASUREMENT RETIREMENT — the R50-A7 precedent); R88-G/G3/G4 the companywall composer (the inline-label space-y trap at 8px scale, the trigger's leading users icon, the Post button's disabled-at-empty state — pixel-proven via the 50%-opacity capture against the computed-style probe's misleading enabled read). The residual pass harvested four more members (the recharts 3.x LEGEND RESERVATION — 24px inside the svg vs 2.x's sibling; the tenantsetup fields' interior gap; the circle's Building2 icon; the reports gradient) + retired the instrument finds (the hrreports loading-state capture artifact — the client-fetching pages need ≥6s settles; the querySelector DOM-order trap — the 3.x legend-icon svgs precede the chart svgs).

Gates: lint 0/0 · tsc ✓ · **941/941 unit** · build ✓ · **E2E 476/476 (the 460 standing + the 16 new session88-chartrecipes pins, 8.5m, zero flakes)** · the post-fix pixel re-verify: tenantsetup/shiftswap/companywall CLOSED to the sidebar AA band, reports max11, hrreports max59, surveyanalytics max26 (the hairline AA), attendancedashboard carrying the classified residuals (the data-driven table row + the recharts-version grid class — 15 even-day verticals vs 19 axis ticks, NOT decouplable via the 3.x API; every visible member live-verified matching) · the byte chain (1297-1341, 46 PNGs → 1531 tracked): the login + standing pairs BOTH SIDES STABLE (the REF light-sidebar variant flip on employees/attendance + 2/7 REF dark flips — the standing theming watch; the LOC recruitment drift = the companion's post-merge R86-E baseline shift) · the mobile-menu cycle GREEN by the manual proof (the script's timing race documented + patched) · DB pristine (the probe user swept at the close). The plan: `docs/remediation-plan-session88.md`; the narrative: `docs/session_202.md`; the SKILL §99 (v3.73.0).
"""
AG.append(("TAIL_MARKER_THAT_DOES_NOT_EXIST", "x"))  # placeholder replaced below
patch("AGENTS.md", [AG[0]], 1)
# append the session-88 layer at the end
src = open("AGENTS.md").read()
if "## Session 88 / Parity Round 87" not in src:
    open("AGENTS.md", "w").write(src.rstrip() + "\n" + AGENTS_TAIL)
    print("AGENTS.md: session-88 layer appended")

# ---------------- CLAUDE.md ----------------
CLAUDE = [(
  "and a 1401-spec test pyramid (941 unit + 460 E2E — the session-87 full-registry cross-side pixel-diff round extended the standing protocol to all 61 routes finding fourteen clone-authored defects all TDD-fixed",
  "and a 1417-spec test pyramid (941 unit + 476 E2E — the session-88 chart-suite + stale-measurement round reconfigured the surveyanalytics zero-state chart trio to the REF's recharts-2.x contract (the reference-scale `ticks` + `allowDataOverflow` mechanism — 3.x computes no ticks for empty data), restored the attendancedashboard month input + chart geometry + the plain summary table, retired the R49-B1 shiftswap stale measurement (the 40px stat tiles), and closed the companywall/tenantsetup/reports/hrreports icon-and-spacing families (the prior session-87 full-registry cross-side pixel-diff round had extended the standing protocol to all 61 routes finding fourteen clone-authored defects all TDD-fixed")]
patch("CLAUDE.md", CLAUDE, 1)

# ---------------- README.md ----------------
RM = []
RM.append((
  "| E2E tests | Playwright | 1.63 | 460 specs across auth,",
  "| E2E tests | Playwright | 1.63 | 476 specs across auth,"))
RM.append((
  "bun run test:e2e      # Playwright E2E (460 specs) — boots the production standalone server",
  "bun run test:e2e      # Playwright E2E (476 specs) — boots the production standalone server"))
patch("README.md", RM, 2)

# ---------------- eon-hr_SKILL.md ----------------
SKILL = []
SKILL.append((
  "> **State:** 941 unit + 460 E2E tests green, lint/typecheck/build",
  "> **State:** 941 unit + 476 E2E tests green, lint/typecheck/build"))
patch("eon-hr_SKILL.md", SKILL, 1)
# version line: 3.72.0 -> 3.73.0 with the session-88 summary + Previous chain
src = open("eon-hr_SKILL.md").read()
m = re.search(r"> \*\*Version:\*\* 3\.72\.0 (.*?)\· Previous: 3\.71\.0", src, re.S)
if m:
    body = m.group(1)
    new_body = " (session-88 — THE CHART-SUITE + STALE-MEASUREMENT ROUND: the r87 close-out's named frontier #1, the surveyanalytics 3-chart reconfiguration, executed with the named residuals — SEVENTEEN defect members ALL TDD-FIXED incl. the round's key recharts lesson (3.x computes no axis ticks for empty/all-null data even with an explicit domain; the explicit `ticks` ladder + `allowDataOverflow` are BOTH required — the #7362 handling), the recharts 3.x LEGEND-RESERVATION lesson (24px inside the svg vs 2.x's sibling — the margin arithmetic), the XAxis auto-grow lesson (3.x grows the band for the inherited 16px tick font — the height={30} pin), the R49-B1 stale-measurement retirement (the shiftswap 40px stat tiles), and the pixel-probe-over-computed-style lesson (the Post button's disabled-at-empty state: the capture's 50%-opacity read against the live probe's enabled read) · Previous: 3.72.0"
    src = src.replace(m.group(0), "> **Version:** 3.73.0" + new_body, 1)
    open("eon-hr_SKILL.md", "w").write(src)
    print("SKILL.md: version 3.73.0 line written")
else:
    print("  !! SKILL version line pattern not found — manual patch needed")
# §99 section (after §98)
SEC99 = """

### §99 · Session 88 — the chart-suite + stale-measurement round (the surveyanalytics reconfiguration + the residuals)

The r87 queue's #1 frontier. **The recharts 2.x-vs-3.x zero-state contract** (the round's standing lesson, all three surveyanalytics charts): the REF renders (1) an EMPTY surface for the distribution chart (no grid/axes — the conditional `{!empty && <CartesianGrid/>}` form), (2) the -100..100 REFERENCE SCALE for the trend chart (a left YAxis + the 7-line grid, NO months at the zero state), (3) the same scale RIGHT-orientation for the wide chart (+ the legend pair, NO XAxis, no left axis — the hidden `yAxisId="count"` axis reserves the left band as the REF's implicit default does). **The mechanism**: 3.x computes NO axis ticks for empty/all-null data even with an explicit `domain` — the explicit `ticks={[-100,-50,0,50,100]}` bypasses the computation AND `allowDataOverflow` is required for the literal domain to resolve at data=[] (`parseNumericalUserDomain` returns undefined otherwise — recharts #7362). **The legend reservation**: 3.x reserves the legend's 24px INSIDE the svg (2.x renders it as a sibling below) — the margin bottoms subtract it (the att chart1 bottom 5, the survey chart3 bottom 35). **The XAxis auto-grow**: 3.x grows the axis band to ~54px for the inherited 16px tick font — `height={30}` pins the REF's fixed band; `interval={0}` + the explicit ladder defeats 3.x's fit-pruning (which dropped the odd days 1-7 from the 19-tick cadence). **The measurement-order lesson**: the at-rest CAPTURE is the truth over the live computed-style probe (the companywall Post button's disabled-at-empty state reads enabled on the live DOM but renders the 50%-opacity disabled fill in the capture — rgb(138,138,138) = #171717 over white). **The capture-settle lesson**: the client-fetching pages (hrreports) need ≥6s settles — the pre-fetch loading state renders a whole different card body. **The DOM-order trap**: the 3.x wrapper renders the legend-icon svgs BEFORE the chart svgs — a bare `querySelector('svg.recharts-surface')` hits a 14×14 legend icon; always filter by geometry.

The icon-and-spacing families: the reports full 11-glyph tab census (users/clock/plane/dollar-sign/trending-up/graduation-cap/shield/file-check/log-out/building2/chart-column), the bare 20px title icons (currentColor, no wrapper), the shared `RefFilterGlyph` (extracted to `src/components/shared/ref-filter-glyph.tsx`), the sRGB-pinned card-header gradient (`bg-[linear-gradient(to_right,#eff6ff,#eef2ff)]` — the trap-3 form the employee-wizard already ships), the shiftswap 40px stat tiles (the R49-B1 retirement), the tenantsetup Building2 circle icon + the +6 header (the third space-y-collision instance — the explicit `mt-1.5` stacks where v4's margin-bottom collides), and the companywall audience trigger (the leading users icon inside SelectValue + the `mt-2` inline-label gap).

**The carried-forward watch (the recharts-version grid class):** the REF's 2.x renders 15 grid verticals at the EVEN-day positions (its own grid tick-set) where 3.x renders 19 at the explicit axis ticks, plus ~0.7px band-center offsets and the subpixel text raster — NOT decouplable via the 3.x public API; every visible member (the chart type, the legend, the cadence, the geometry, the reference scales) live-verified matching. The r89 frontier: the mobile-band cross-side pass, the REF theme-variance root cause, or the next named residuals.
"""
if "### §99" not in src:
    src = open("eon-hr_SKILL.md").read()
    if "### §98" in src:
        i = src.index("### §98")
        # append at the end of the file instead (the sections are chronological)
        open("eon-hr_SKILL.md", "w").write(src.rstrip() + "\n" + SEC99)
        print("SKILL.md: §99 appended")
    else:
        print("  !! §98 not found")
print("DONE")
