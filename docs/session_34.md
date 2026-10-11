# Session 34 — Parity Round 20: The pressed dimension (:active states)

Continuing the parity cycle after round 19 (`8ab438c` + session log
`a5fd089`). The owner's brief pointed at session_32/33 +
remediation-plan-session20; session_32's suggested next steps were: re-run
the redeploy check, the `:active` (pressed) states ("needs mousedown-hold
tooling agent-browser doesn't expose" — it does), the with-data story
(still blocked on REF's zero-data state), and reduced-motion. All executed
except where noted.

Workspace RESET (fresh clone at `a5fd089`): `.env` recreated
(`DATABASE_URL="file:../db/custom.db"` + fresh AUTH_SECRET), `bun install`,
`db:push` + `db:seed` (pristine users=1, employees=1, balances=2,
payroll=0, expenses=0); the shell `DATABASE_URL` trap guarded with
`env -u DATABASE_URL` on every DB/build command.

**Baseline gates: lint 0/0 · tsc ✓ · 386/386 unit · build ✓ · 86/86 E2E**
— the `a5fd089` push state exactly. Static audit of the R19 diff clean
(all 33 files consistent with the session-20 record).

Skills consulted (repo `skills/`): tdd (red→green vertical slices),
agent-browser (dual-session probing — and its `mouse move/down/up`
commands ARE the mousedown-hold tooling), clone-app-pat-pro (computed
styles as ground truth), tailwind-patterns (v4 CSS-first rules).

**Redeploy check PASSED** — 12 probe routes byte-identical (h1
text/font/x/y; the four h1 width deltas are the documented REF-overflow
family). REF unchanged since round 19.

**Mobile navigation audit (user priority, every round)**: top bar 390×73
white sticky + 1px slate-200; bottom tabs x 10/79/139/204/313, 14px
labels, 20px icons, active rgb(37,99,235); drawer 288×844 #FAFAFA z-50
(links 141/301/421/461/581, footer 121@723, no close button); kickers —
standard 53px h1@32 AND the profile 69px variant; md boundary 767/800 —
**all byte-identical, no Tailwind v4 bug**.

**The round's core — the FIRST :active (pressed-state) audit** (real
mouse-down holds via `agent-browser mouse move/down/up`, full computed
dumps at rest + settled-hover + settled-held, ~24 surfaces on both apps):

- **Tooling discovery**: the "mousedown-hold tooling agent-browser doesn't
  expose" from the session-32 frontier note DOES exist — `mouse move` /
  `mouse down` / `mouse up` are real CDP Input events. **The click-safe
  protocol: move the pointer away BEFORE `mouse up`** — the first draft
  released over the probed element, firing real clicks (toggled REF's عربي
  to "EN", expanded groups mid-probe).
- **Engine discovery**: Tailwind v4 does NOT media-wrap `active:` variants
  — only `hover:*` rides in `@media (hover: hover)` (90 wrapped hover
  rules, zero wrapped active rules in the built CSS). Active rules are
  bare on both sides → they apply in the probe browser and on touch.
- **Polyfill v2**: the r19 hover polyfill appended a second
  `@layer utilities` block at the END — moving hover rules AFTER active:
  rules and breaking the pressed cascade UNDER THE PROBE (on real desktops
  the original order stands). v2 fetches each same-origin sheet,
  brace-matches the `@media (hover: hover)` blocks, splices out the
  wrappers, and REPLACES the `<link>` with a `<style>` at the same DOM
  position — rule order preserved. (Also: `//` comments break flattened
  one-line evals — the r16 lesson; use `/* */` in injected browser JS.)
- **5 gap groups (R20-A..E)**: the group button PRESSED state (REF presses
  GRAY zinc-100/#18181B — its active: pair beats its hover:bg-blue-50 in
  v3 rule order; the clone stayed blue), the EXPANDED-group hover recipe
  (`data-[state=open]:hover:bg-sidebar-accent` — a SECOND hover recipe the
  r19 audit missed by probing the group only collapsed; found this round
  because a drawer probe expanded a group mid-measurement), the authored
  active: pair on inactive leaves/sub-items (desktop-pressed already
  matched via hover — the classes restore REF's authored recipe and the
  TAP-press moment, where :active fires without :hover), the active-leaf
  text-only pressed flip (REF's unlayered custom-primary-bg keeps the blue
  under press; the clone's bg-primary UTILITY would LOSE to an active:bg
  variant — only `active:text-[#18181b]` is mirrored, deviation
  documented), and the **active bottom tab bg-blue-50 pill**
  (rgb(239,246,255), pixel-verified — a VISIBLE mobile gap every prior
  round missed because the mobile audits compared label color/geometry
  but never the tab's own background).
- **Verified flat/parity everywhere else**: bell/moon/عربي/user trigger,
  quick chips, View all, Import CSV, Add Employee CTA (gradient endpoints
  identical; `to right` vs `90deg` + the invisible bg-color = documented
  R19 families), Generate All, New Project, Kanban toggle (rgba vs lab),
  settings Edit, My Requests trigger, BOTH dropdown menu items (the red
  Logout turns #171717 under press via its focus recipe on both apps),
  login Sign in/socials/forgot/signup, mobile hamburger (rides hover; REF
  authors no active: classes), inactive bottom tabs. With-data re-checked:
  REF still renders zero data — the frontier stays blocked.
- **v4 registry noise**: six UNUSED `active:*` rules in the built CSS
  (translate-y-0, scale-95, scale-[0.98], cursor-grabbing, bg-blue-800,
  shadow-none) — generated from scanned library content; only
  `active:cursor-grabbing` is authored (taskmanager). Not gaps.

`docs/remediation-plan-session21.md` written (5 groups + tooling
discoveries + non-goals) and codebase-validated before execution.

**TDD**: 5 new pins (recipes.test.ts session-21 block) + the R19-B/R19-K
pins updated for the new forms; mid-flight pin corrections (the r19
lesson twice more): my own comments containing the forbidden literals
(`active:bg-sidebar-accent` in two code comments) tripped the negative
assertions — reworded; the bottom-tab slice window needed 700→900 chars
for the longer comment.

**Gates: lint 0/0 · tsc ✓ · 391/391 unit (+5) · build ✓ · 86/86 E2E** (the
session-5 active-tab test extended with the bg-blue-50 + transparent-Staff
assertions).

**Live dual-browser verification (polyfill v2 on LOC)**: **7/7 MATCH** —
group pressed zinc-100/#18181B (byte-exact, full JSON), expanded-group
hover + press zinc-100/#18181B, inactive leaf + sub-item pressed
zinc-100/#18181B/0.8, active leaf pressed blue bg + #18181B text, the
bell regression check #F5F5F5/#171717, and the active bottom tab pill
rgb(239,246,255) + blue-600 at rest. Post-fix regression sweeps: canonical
12-route 12/12 MATCH + mobile chrome regression clean — zero layout
impact (color-only changes). Two probe-session flakes re-hit and
documented: the Secure-cookie-over-HTTP logout family on :3200 (the
auto-reauth guard added to the probes) and the mid-measure logout (the
guard now runs inside the measure loop where needed).

**5 screenshots** (3 new pressed/pill evidence —
68-group-button-pressed-zinc100 [held via real mouse-down],
69-expanded-group-hover-zinc100, 70-bottom-tab-active-pill; 2 standards
refreshed: 02-dashboard, 11-mobile-dashboard) → **83 total**. VLM
spot-checks confirmed the gray pressed group button, the expanded
sub-items under the gray hover, and the light-blue pill behind the Home
tab.

Documentation updated: AGENTS session-21 layer + 391 specs; SKILL v3.4.0
+ §33 + counts; PAD [S21] row + test table (recipes 254) + Last Updated +
checklist 391; CLAUDE 477-spec pyramid + session-21 pins; README 391
specs + 83 captures + the pressed-parity feature row; this session log;
worklog; remediation-plan completion record.

## Session complete — parity round 20 pushed to `nordeim/eon-hr@main`

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical (no Tailwind v4 bug), and the FIRST pressed-state audit —
~24 surfaces under real mouse-down holds, 5 gap groups, plus two probe
discoveries (the click-safe mouse protocol; v4 leaves active: variants
unwrapped) and the polyfill v2 order-preservation fix.

**Fixes**: the group button active: gray recipe, the expanded-group
hover-gray second recipe, the authored leaf/sub-item active: pair, the
active-leaf text-only pressed flip (documented deviation), and the active
bottom tab blue-50 pill — the round's one previously-missed VISIBLE
mobile gap.

**Gates**: lint 0/0 · tsc ✓ · **391/391 unit** · build ✓ · **86/86 E2E**
· 5 screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
interaction map now covers focus + hover + pressed; remaining frontier —
the with-data story (still blocked on REF's zero-data state — re-check
whether the reference gains data), the checkbox focus recipe (still no
measurable REF surface), reduced-motion (the open a11y item on both
apps), and a possible scroll/animation dimension (sticky behaviors,
scroll-away kickers are pinned but transitions/animations were never
swept systematically).
