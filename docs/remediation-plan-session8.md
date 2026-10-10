# Remediation Plan — Session 8 (Parity Round 7: wizard interior precision + audit closure)

Every gap below was measured live against `https://eon.base44.app` in a dual
agent-browser setup (default session = reference, `--session loc` = clone;
DOM ground truth — computed styles + bounding boxes, both sides measured).
Reference measurements at 1440×900 (desktop) and 390×844 (mobile).

Baseline at session start (fresh clone of remote `57139ee`): lint 0 errors +
0 warnings · tsc ✓ · **142/142 unit** · build ✓ · **86/86 E2E** (after
`bunx playwright install chromium` — the sandbox cache held v1243, the
repo's Playwright 1.63 wants v1248; first E2E run failed on the missing
binary, documented here so the next session doesn't misread it as a code
regression).

Environment: `.env` recreated (`DATABASE_URL="file:../db/custom.db"` + fresh
`AUTH_SECRET`), `bun install`, `db:generate`/`db:push`/`db:seed` — the
database lands at `<repo>/db/custom.db` (db-path contract respected; the
shell's exported absolute `DATABASE_URL` was unset per the AGENTS.md rule).

Audit scope (per the user's brief): repo skills consulted
(`skills/skills-catalog.md` → `code-review-and-audit` methodology,
`nextjs16-tailwind4` §9 mobile-nav failure taxonomy + §10 visual-debugging
playbook, `tdd-workflow` for the fix cycle). Secret scan on the session-7
diff: clean. The audit targeted **the mobile navigation end-to-end** (the
user's stated priority) and the surfaces prior sessions left open: the
session-7 wizard residual, dialog interiors, and category-B mobile headers.

---

## Mobile navigation audit — VERIFIED WORKING (no gaps)

The full mobile navigation stack was exercised on BOTH apps at 390×844 and
compared DOM-for-DOM. Everything matches; no Tailwind v4 bug is present in
the current mobile nav (the six documented traps are all pinned in
`globals.css` + spec-locked):

| Surface | Reference | Clone | Verdict |
|---|---|---|---|
| Top bar | 73px sticky, y=0 | 73px sticky, y=0 | byte-identical |
| Bottom tabs | 5 links visible | 5 links visible | byte-identical |
| Drawer sheet | 288×844 @ (0,0), bg rgb(250,250,250) | same | byte-identical |
| Drawer overlay | rgba(0,0,0,0.8) | rgba(0,0,0,0.8) | byte-identical (R6-D fix live) |
| Close button | present but INVISIBLE (0×0, opacity .7) | not rendered | same rendered result |
| Drawer links | 247×32 first links | 248×32 (sub-pixel rounding) | identical |
| Submenu expand | Employees → "All Employees" appears | same | functional |
| Drawer navigate | closes + lands on target | same | functional |
| Kicker (category-A /employees) | y=89 x=16 w=358 h=53, 18px/700 | same | byte-identical |
| Kicker (category-B /training) | full 36px header at y=141 | same | byte-identical |
| 800px boundary | sidebar 256 visible, chrome hidden | same | byte-identical (R6-A live) |
| Dashboard mobile | kicker + cards y=174/h=222, y=420/h=162 | same | byte-identical |
| Desktop sidebar | 256px, links 215×32 | same | byte-identical |

Sticky-kicker scroll behavior can't be observed on the short empty-state
pages (both apps' content is shorter than the viewport); it remains pinned
by `tests/e2e/mobile-navigation.spec.ts › dashboard kicker is sticky below
the 73px top bar`.

## Gaps found (the fixes)

### R7-A (Medium) — Wizard card header gradient interpolates in oklab

The wizard card header uses `bg-gradient-to-r from-blue-50 to-indigo-50`.
Tailwind v4 compiles `bg-gradient-to-*` with **oklab** interpolation
(Tailwind-V4-Validation-Report trap 3); the reference computes
`linear-gradient(to right, rgb(239,246,255), rgb(238,242,255))` (sRGB).
Same endpoints, different midpoint blend — and it is the ONLY remaining
unpinned gradient in `src/` (repo-wide sweep: every other gradient already
uses the arbitrary `bg-[linear-gradient(...)]` form).

**Fix** — `src/app/(app)/employees/employee-wizard.tsx:291`:
`bg-gradient-to-r from-blue-50 to-indigo-50` →
`bg-[linear-gradient(to_right,#eff6ff,#eef2ff)]` (blue-50 → indigo-50,
sRGB-pinned like every other parity gradient).

### R7-B (Medium) — Next/Create CTA is missing the trailing arrow icon

Reference footer: `Next` renders 97×36 with a lucide `arrow-right` SVG
(`w-4 h-4 ml-2`) after the label; the flex `gap-2` (8px) + icon (16px) +
`ml-2` (8px) account for exactly the 32px width delta vs our 65×36
button. Cancel (81×36, white, 6px radius), gradient endpoints
(#2563EB→#4F46E5), text color (#FAFAFA) all already match.

**Fix** — the advancing footer button (Next on steps 1–3, Create Employee
on step 4) gains `<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />`
after the label. (The loading spinner stays leading.)

### R7-C (Medium) — Wizard field rows are 6px/row short (label-box slack)

Decomposed on both sides (step 1, `Full Name` field):

| Measurement | Reference | Clone |
|---|---|---|
| Field wrapper height | 68px | 62px |
| Label top offset inside wrapper | +4px | +0px |
| Label rendered box | 16px (inline display; lh=14px) | 14px (block display; lh=14px) |
| Label-bottom → input-top gap | 12px | 12px |
| Input | 407×36 | 407×36 |
| Row pitch (grid gap-4) | 84px | 78px |
| Step-1 card height | 872px | 842px (5 rows × 6px) |

Root cause: the reference's shadcn `Label` renders `display: inline`
(native label default), so its bounding box is the font's natural
ascent+descent (16px) rather than the 14px line box, and the line strut
adds a 4px top offset inside the `space-y-2` wrapper. Our Radix Label
measures `display: block` → a 14px box at +0.

**Fix** (deterministic, component-scoped — do NOT touch the global Label,
which other byte-verified surfaces share): in the wizard's `Field`
component, `flex flex-col gap-3` → `flex flex-col gap-3 pt-1` and the
Label gains `leading-4` (16px line box). Result: wrapper 4+16+12+36 = 68px,
pitch 84px, card 872px — the reference geometry reproduced exactly with
explicit utilities instead of font-metric luck. Text baseline shifts ≤1px
(sub-pixel, invisible).

## Verified non-gaps (deliberate deviations, no action)

- The reference's mobile `/training` page **overflows horizontally**
  (`scrollWidth` 600 > viewport 390; its 36px h1 box runs 568px wide). The
  clone wraps within the viewport. Reproducing the overflow would be
  replicating a reference layout bug — the clone's wrapping is correct.
- The reference's **Customize** button is a dead control (no dialog opens,
  DOM-verified this session). Our working customize dialog is the
  documented superset.
- The reference's **New Leave Request** is dead (session-6 finding);
  our working dialog is the superset.
- The reference's wizard date fields are custom spinbutton date-pickers
  (Month/Day/Year + "Show date picker" button); ours are native
  `<input type="date">` rendering the same 407×36 box. Functional superset;
  the reference's React state refused synthetic input events under
  automation (known Base44 flake — session 7 hit the same wall), so step 2+
  of the reference wizard could not be re-measured; its labels are already
  mirrored from the session-7 capture.
- Drawer first-link width 247 vs 248px: sub-pixel rounding of 247.5px
  (x=16 + w=247.5 in a 288−24−8 container). Not a real delta.

## Execution order (TDD)

1. **RED unit pins** (`tests/unit/shell-recipes.test.ts` — extend the
   session-7 wizard contract): R7-A sRGB gradient class, R7-B arrow icon
   + ml-2 on the advancing CTA, R7-C `pt-1` + `leading-4` field recipe.
2. **GREEN** — the three wizard edits (one file: `employee-wizard.tsx`).
3. **E2E**: the existing wizard CRUD spec must stay green (the icon/pitch
   changes must not disturb the round-trip); extend the wizard spec pins
   with the arrow-icon presence.
4. **Full gates**: lint → tsc → unit → build → E2E.
5. **Live dual-browser re-verify**: wizard card height 872, pitch 84,
   Next 97×36, header gradient `to right` sRGB serialization; mobile nav
   re-spot-check (drawer + kicker + boundary) to prove no regression.
6. Screenshots refresh (wizard steps) + docs updates (AGENTS.md wizard
   recipe note, session log, worklog, README counts if specs change).
7. `.env.example` re-verified against the codebase (no change expected —
   it already documents exactly the two read variables).

All changes on `main`; no new branches.

---

## Completion record (executed 2026-10-10)

All three remediation items landed, TDD (RED 3 first, then GREEN):

- **R7-A** — wizard card header now
  `bg-[linear-gradient(to_right,#eff6ff,#eef2ff)]`; repo-wide sweep
  confirms zero remaining `bg-gradient-to-*` utilities in `src/` (every
  parity gradient is sRGB-pinned). The stale session-7 pin that asserted
  the oklab gradient was inverted in the same commit.
- **R7-B** — the advancing CTA (Next / Save Changes / Create Employee)
  carries `<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />`;
  live-verified 97×36 (was 65×36; reference 97×36).
- **R7-C** — Field wrapper `flex flex-col gap-3 pt-1` +
  `<Label className="leading-4">`; live-verified field 68px / pitch 84 /
  step-1 card 872×896 @ (400,128) — the reference geometry reproduced
  exactly (was 62/78/842). Global Label component untouched.

Gates after remediation: lint 0 errors + 0 warnings · tsc clean ·
**144/144 unit** (2 new pins) · build · **86/86 E2E** (1 new arrow-icon
pin) · 24 screenshots refreshed (capture-all) + the wizard step-1 shot
re-captured from the dev server; DB pristine after capture (users=1,
employees=1, leaveBalances=2). Mobile navigation re-verified after the
fixes: kicker/drawer/boundary unchanged and matching the reference.
