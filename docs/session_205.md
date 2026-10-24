# Session 205 (Session 89 / Parity Round 88) — the mobile-band close-out round: the dark/RTL bands' first cross-side pass, the mobile-menu deep verification, and the RTL lang member

**Session file numbering:** this file continues the owner-facing chain (session_203.md = session 88's mobile-band narrative, session_204.md = the fourth reconciliation's landing). The remediation plan for this round lives at `docs/remediation-plan-session89.md` (the session-numbered chain).

## The round in one paragraph

The r89 queue named three frontier items left open by the session-88 double-union: the tenantsetup title font member, the companywall composer offset, and the dark/RTL mobile bands — never cross-compared in 88 prior sessions. This round re-probed the two named residuals (both **no longer reproduce** — computed-style-verified identical, 1-hot-pixel at-rest diffs, CLOSED), executed the **first cross-side pass over the dark and RTL mobile bands** (all four bands — dark page, dark drawer, RTL page, RTL drawer — at **parity**, 1-3 hot pixels of icon-column AA-noise), deep-verified the **mobile navigation menu** end-to-end at 390×844 (the open → expand → navigate → auto-close cycle, computed-style extraction at every step, the at-rest drawer diff **0 hot cells / max delta 0**), and fixed the round's one live-measured defect: **R89-B, the RTL lang member** — REF's عربي sets `lang=ar` alongside `dir=rtl` (live-measured both directions), the clone flipped only `dir`. TDD-fixed in both the عربي handler and the pre-paint boot script, pinned by 3 new unit specs and 3 amended E2E assertions.

## The mobile-menu verification (the owner-directed focus)

The full cycle on both sides, 390×844, light LTR:

1. **The drawer open** — identical dialog structure (the census: image, EonHR h2, "Demo", MAIN MENU, the 8 collapsed groups, the 5 leaf links, the footer cluster). At-rest diff: **0 hot cells, max delta 0** — byte-level parity.
2. **The Employees expansion** — the identical six sub-items; the full link census identical (11 links); the active-route styling computed-style-identical (`rgb(24,119,242)` bg + white text on Training LMS, transparent/slate-600 elsewhere).
3. **The Training LMS navigation** — both sides land `/training`; the REF dialog **stays open** (data-state=open at +2s, live-verified), the clone **auto-closes** (the documented superset — the pathname effect; REF keeps the menu covering the page until manually dismissed).
4. **The state-matched at-rest diff** — 5 hot pixels, max delta 27, all in the 16px submenu icon column (x 55-62) — the AA-noise class. **PARITY.**
5. **The bottom tab bar + Escape** — the five tabs and the active-tab pill identical; Escape closes the drawer on both sides.

### The three artifact classes (this round's instrument lessons)

Each produced a false STRUCTURAL reading until isolated — they are now named members of the capture protocol:

- **(a) The route mismatch** — the drawer overlay shows the page behind it; captures must be taken on the same route both sides. (First diff: 111 hot cells, "STRUCTURAL" — an artifact.)
- **(b) The programmatic-click focus ring** — `element.click()` via eval leaves `:focus` (focus-visible → the ring renders into the capture). 9,994 blue pixels of ghost. Retire with `document.activeElement.blur()` before the capture.
- **(c) The native-click hover residue** — agent-browser's native click leaves the cursor on the element; `:hover` fires (`data-[state=open]:hover:bg-sidebar-accent` painted the REF's trigger zinc-100 — a "gray background" ghost; the clone carries the identical class string, verified verbatim). Retire by moving the mouse to a neutral element.

## The dark/RTL bands (the frontier, closed)

| Band | Hot pixels (>8) | Max delta | Class |
|------|----------------|-----------|-------|
| Dark /training page | 2 | 19 | AA-noise (bottom-tab label) |
| Dark drawer (Employees expanded) | 3 | 12 | AA-noise (icon column) |
| RTL /training page | 1 | 19 | AA-noise |
| RTL drawer (state-matched) | 1 | 9 | AA-noise |

**R89-B — the RTL lang member.** Live-measured cross-side: REF عربي → `dir=rtl | lang=ar`; REF EN → `dir=ltr | lang=en`; clone (before the fix) → `dir` flips, `lang` stuck at `"en"`. The member is invisible to rendering but load-bearing for screen readers and font selection. The fix: `document.documentElement.lang = next === "EN" ? "ar" : "en"` in `onLangClick` + the THEME_BOOT extension (`setAttribute("lang","ar")` alongside the dir set). Pins: `recipes.test.ts` R89-B1/B2/B3 + the three dark-mode.spec.ts assertion amendments (click, reload, toggle-back).

## The r89 residuals re-probe

- **tenantsetup title font**: computed-style-verified identical (24px/600, the label/button families) — 1-hot-pixel at-rest diff. **CLOSED** (no longer reproduces on the current deploy).
- **companywall composer offset**: 1-hot-pixel at-rest diff (the standing sidebar AA band). **CLOSED.**

## Gates at close

lint 0/0 · tsc ✓ · **944/944 unit** (941 + 3) · build ✓ 116/116 · **E2E 488/488** (unchanged count — amendments extend existing specs) · **1432 total specs** · DB pristine · the byte chain **1403-1419** (9 PNGs, 1585 tracked total).

## Carried forward (the r90 queue)

1. The deploy watch stays ARMED (the 58th-or-newer holding through this round).
2. The REF theme-variance root cause (the frontend-config theme flags — the standing watch, not actionable from the outside).
3. The recharts-version grid class (attendancedashboard's 15-vs-19 verticals — undecouplable via the 3.x API; the standing classification).
4. The patch watch (Next 16.4.3 available — HOLD at 16.4.2 pending the ecosystem).
5. The dark/RTL bands now have their FIRST cross-side baselines — future rounds re-verify against this round's protocol (the state-matching discipline + the three artifact classes).
