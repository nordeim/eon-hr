# Session 42 — Parity Round 24: The a11y-attribute dimension

Continuing the parity cycle after round 23 (`368a6a1` + session log
`19df86b`). The owner's brief pointed at session_40/41 +
remediation-plan-session24; session_40's suggested next steps were: re-run
the redeploy check, the with-data story (still blocked on REF's zero-data
state), the checkbox focus recipe (still no measurable REF surface),
reduced-motion (open on both apps), a dialog-surface sweep, and the NEW
dimensions — "the `aria-*`/a11y attribute dimension (labels, describedby,
roles were never swept as a family)", the form-validation error-surface
dimension, and the print/reading dimension. The a11y-attribute dimension
became this round's core (it is measurable on zero-data REF — attributes
live in the DOM regardless of data; form-error surfaces stay hidden).

Workspace RESET (fresh sandbox): fresh clone at `19df86b`; `.env` recreated
(`DATABASE_URL="file:../db/custom.db"` + fresh AUTH_SECRET); bun install;
db:push + db:seed (pristine users=1/employees=1/leaveBalances=2/payroll=0/
expenses=0); the shell `DATABASE_URL` trap guarded with `env -u` on every
DB/build command.

**Baseline gates: lint 0/0 · tsc ✓ · 416/416 unit · build ✓ · 86/86 E2E**
— the `19df86b` state exactly.

Skills consulted (repo `skills/`): tdd (red→green vertical slices),
agent-browser (dual-session probing), clone-app-pat-pro (DOM census as
ground truth), tailwind-patterns (v4 layer/cascade rules).

**Redeploy check PASSED** — 12 probe routes byte-identical (h1
text/font/x/y; width deltas remain the documented REF-overflow family).
REF unchanged since round 23. (One mid-audit re-auth needed: the LOC
session was authed on `localhost:3200` while the probes use
`127.0.0.1:3200` — different cookie origins; the origin-mismatch lesson
documented.) **Mobile navigation audit PASSED** — top strip 390×73 white,
hamburger 24/22 28×28, bottom tabs x=10/79/139/204/313 byte-identical,
drawer 288×844 #FAFAFA z-50, kicker "Dashboard" y=101 h=28 fs=18px, md
boundary: tabs vanish at 800 both, sidebar brand x=76 y=25 both — no
Tailwind v4 bug (the `nav`-element "sidebar=false" reading on REF at 800
was a probe artifact — REF's sidebar is div-based). **With-data
re-check**: REF still renders zero data (0 rows on 4 surfaces) — the
frontier stays blocked (documented).

**The round's core — the FIRST a11y-attribute dimension audit**:

- **The census (4 canonical surfaces, visible elements, summed)**:
  roles — tab 7/7, tablist 1/1, tabpanel 1/1 identical; progressbar
  ref=0 loc=2 (the dashboard leave-balance Radix Progress bars; REF
  renders plain divs — clone superset kept). aria — aria-controls 44/10,
  aria-expanded 41/37, aria-haspopup 9/5, aria-current 0/4,
  aria-hidden 0/175, aria-label 4/18, aria-selected 7/7,
  aria-labelledby 1/1, aria-orientation 1/1. Label wiring: htmlFor 0/0,
  imgAlt 8/0, btnNoName 10/0.
- **The aria-controls gap family (R24-A)**: REF's 9 sidebar group
  toggles ALL carry aria-controls even while collapsed (radix-:rh: etc.
  — the referenced id need not be mounted); the clone's Radix
  Collapsible authors `aria-controls={context.open ? contentId :
  undefined}` — the attribute vanishes when the content unmounts. Root
  cause: REF's base44 build runs an older Radix that sets it
  unconditionally.
- **The bell gap family (R24-B)**: REF's bell (sidebar footer, x=16
  y=796) is a Radix Popover trigger — aria-haspopup="dialog" +
  aria-expanded (flips true live) + aria-controls (persisting closed) —
  and clicking it OPENS a notifications popover. The clone's bell was a
  DEAD button (aria-label only). This was the only measured surface
  where REF DOES something the clone does not — a functional gap, not
  just an attribute gap.
- **The popover recipe (DOM-dumped)**: 384×175 at x=0 y=617 (bg-popover
  white, rounded-md border shadow-md z-50, sideOffset 4, x=0 is 16px
  LEFT of the bell's left edge); header `flex items-center
  justify-between px-4 py-3 border-b` with `h3.font-semibold
  .text-slate-900` "Notifications" (16px/600, x=17) + an empty
  `div.flex.items-center.gap-2` (the mark-all-read slot); body
  `max-h-[480px] overflow-y-auto` → `div.py-8.text-center
  .text-slate-500` (382×124) with `svg.lucide-bell h-8 w-8 mx-auto mb-2
  opacity-30` (32×32 centered) + `p.text-sm` "No notifications yet"
  (slate-500 rgb(100,116,139)).
- **Verified matches (no action)**: the login page a11y byte-identical
  (label for= email/password, placeholders you@example.com/••••••••,
  unnamed=0, h1 both — via throwaway sessions); the tabs family (Radix
  Tabs both); the loans dialog core (role=dialog + aria-labelledby
  both); the mobile drawer contract (role=dialog, data-state=open, NO
  aria-modal, NO aria-label on both — the vaul/Sheet family trait).
- **The clone's supersets (kept)**: aria-label on 18 elements (REF
  names almost nothing — its bell/moon/list/grid are unnamed svg-only
  buttons; its only labels are 4 "Close badge" instances);
  aria-current="page" on active nav links; role=progressbar +
  aria-valuenow/min/max; every button named; aria-hidden on decorative
  lucide svgs (REF: 0 — its icons are exposed to screen readers).
- **REF bugs NOT replicated (documented)**: the loans dialog's
  `aria-describedby="radix-:rf:"` is a DANGLING reference (no such id
  in the DOM — a broken Radix Description mount); the clone's
  conditional describedby is correct and stays. REF's 2 base44-branded
  `<img>` per route (media.base44.com logo + data:png) are platform
  branding — not replicated (the clone keeps its EonHR CSS-rendered
  brand).

`docs/remediation-plan-session25.md` written (2 gap groups + the census
map + non-goals) and codebase-validated before execution.

**TDD**: 4 new pins (recipes.test.ts session-25 block — all RED before
implementation). GREEN: `src/components/ui/popover.tsx` created (the
shadcn pattern over @radix-ui/react-popover) +
`src/components/layout/sidebar-nav.tsx` edited:
- **R24-A**: `const contentId = React.useId()` per CollapsibleNavItem —
  Trigger `aria-controls={contentId}` + Content `id={contentId}` (user
  props spread after Radix's own in the v1.1.x source — verified in
  node_modules — so the override holds in both states).
- **R24-B**: the bell wrapped in `Popover`/`PopoverTrigger asChild` +
  `PopoverContent align="start" side="top" alignOffset={-16}
  id={bellContentId} className="w-96"` with the measured recipe
  (header row + h3 + empty gap-2 cluster; body + faded-bell empty
  state); the trigger carries `aria-controls={bellContentId}` (the same
  stable-id trick — Radix's PopoverTrigger has the identical
  open-conditional pattern).

**Gates: lint 0/0 · tsc ✓ · 420/420 unit (+4) · build ✓ · 86/86 E2E.**

**Live dual-browser verification** (all green): 8/8 group toggles carry
aria-controls (all resolving); the bell's full contract (label +
haspopup=dialog + expanded=false + controls present closed); the popover
open-measured **byte-exact: 384×175 @ x=0 y=617** (REF: 384×175 @ x=0
y=617), bg white, radius 6px, h3 "Notifications" 16px/600, p slate-500,
icon class exact; the popover also opens from the mobile drawer's bell
(384×175, Radix portals out); the canonical 12-route geometry sweep
12/12 MATCH; the mobile chrome regression clean (tabs + drawer
byte-identical).

**2 new evidence screenshots** (81-notifications-popover-open,
82-group-toggle-aria-controls-expanded) + 2 standards refreshed
(02-dashboard, 11-mobile-dashboard) → **95 total**.

Documentation updated: AGENTS session-25 layer + 420 specs; SKILL v3.8.0
+ §37 + counts (recipes 283); PAD [S25] row + Last Updated; CLAUDE
506-spec pyramid; README 420 specs + the a11y parity row; this session
log; worklog; remediation-plan completion record.

## Session complete — parity round 24 pushed to `nordeim/eon-hr@main`

**Audit**: redeploy check (REF unchanged), mobile navigation verified
byte-identical (no Tailwind v4 bug), with-data re-check (still blocked),
and the FIRST a11y-attribute dimension audit — the full role/aria/
label-wiring census with element-level dumps, plus the loans-dialog,
login-page (throwaway sessions), and mobile-drawer contract probes.

**Fixes (2 gap groups, TDD)**: the aria-controls contract (stable
React.useId on the Collapsible Trigger+Content — the attribute now
persists collapsed like REF's older Radix) and the notifications bell
popover (the shadcn ui/popover.tsx primitive + the DOM-measured 384×175
recipe with the full haspopup/expanded/controls contract — replacing a
dead button, the only measured surface where REF did more than the
clone).

**Gates**: lint 0/0 · tsc ✓ · **420/420 unit** · build ✓ · **86/86 E2E**
· 2 new screenshots · DB pristine.

**Suggested next steps**: re-run the redeploy check next round; the
interaction + attribute maps now cover focus + hover + pressed + motion
+ scroll + cursor/selection + a11y attributes; remaining frontier — the
with-data story (re-check whether the reference gains data), the
checkbox focus recipe (still no measurable REF surface), reduced-motion
(open on both apps), the form-validation error-surface dimension (still
hidden by REF's zero-data state), the print/reading dimension beyond
the session-18 print stylesheet audit, and possible NEW dimensions: the
drag-and-drop/keyboard-shortcut dimension and the SEO/meta dimension
(title/description/og tags were never swept).
