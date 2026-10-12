# Remediation Plan — Session 25 / Parity Round 24

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
**the a11y-attribute dimension audit** — the never-swept family per
session_40's suggested next steps ("the `aria-*`/a11y attribute dimension
(labels, describedby, roles were never swept as a family)"). Method: full
role + aria-* + label-wiring census on 4 canonical surfaces (summed), then
element-level dumps of every divergent family, plus targeted probes of the
loans dialog, the login page (throwaway sessions), and the mobile drawer.

Standing audits this round: **redeploy check PASSED** (12 canonical routes,
h1 text/font/x/y byte-identical — REF unchanged since round 23). **Mobile
navigation audit PASSED** (top strip 390×73 white, hamburger 24/22 28×28,
bottom tabs x=10/79/139/204/313 byte-identical, drawer 288×844 #FAFAFA
z-50, kicker "Dashboard" y=101 h=28 fs=18px, md boundary 767→800: tabs
disappear at 800 on both, sidebar brand lands x=76 y=25 on both — no
Tailwind v4 bug; the earlier `nav`-element reading was a probe artifact —
REF's sidebar is div-based). **With-data re-check**: REF still renders zero
data (0 rows on employees/payroll/leavemanagement/taskmanager) — the
frontier stays blocked (documented).

## The a11y-attribute map (measured)

**The census (4 routes summed, visible elements)** — role family:
progressbar ref=0 loc=2 (the dashboard leave-balance Radix Progress bars —
REF renders plain divs). tab 7/7, tablist 1/1, tabpanel 1/1 — identical.
aria family: aria-controls ref=44 loc=10, aria-current ref=0 loc=4,
aria-expanded ref=41 loc=37, aria-haspopup ref=9 loc=5, aria-hidden ref=0
loc=175, aria-label ref=4 loc=18, aria-selected 7/7, aria-labelledby 1/1,
aria-orientation 1/1. Label wiring: htmlFor 0/0 (both use Radix Label's
nested pattern), imgAlt ref=8 loc=0, btnNoName ref=10 loc=0.

**The two real gap families**:

1. **aria-controls on the collapsed group toggles** — REF's 9 sidebar
   group toggles (Employees, Payroll, Recruitment, Compliance,
   Performance, Communications, Analytics, Settings + the footer user
   trigger family) ALL carry `aria-controls` pointing at their content id
   even while collapsed (`radix-:rh:` etc. — the id need not be mounted).
   The clone carries aria-controls ONLY on the open group: Radix's
   Collapsible authors `aria-controls={context.open ? contentId :
   undefined}` — the attribute is removed when the content unmounts.
   Root cause: REF's base44 build runs an older Radix whose trigger sets
   aria-controls unconditionally. Fix: author a stable `React.useId()`
   per group, pass `id` to the Collapsible Content and `aria-controls`
   to the Trigger — user props spread AFTER Radix's own in the v1.1.x
   source, so the override wins in both states (verified in
   node_modules/@radix-ui/react-collapsible/dist/index.js).

2. **the notifications bell** — REF's bell (sidebar footer, x=16 y=796)
   is a Radix Popover trigger: `aria-haspopup="dialog"` +
   `aria-expanded` (flips true on open) + `aria-controls`, and clicking
   it OPENS a notifications popover (384×175 at x=0 y=617, bg-popover
   white, rounded-md border shadow-md z-50). Interior recipe
   (DOM-dumped): header `div.flex.items-center.justify-between.px-4.py-3
   .border-b` with `h3.font-semibold.text-slate-900` "Notifications"
   (16px/600, x=17) + an empty `div.flex.items-center.gap-2`; body
   `div.max-h-[480px].overflow-y-auto` → `div.py-8.text-center.
   text-slate-500` (382×124) with `svg.lucide-bell.h-8.w-8.mx-auto.mb-2
   .opacity-30` (32×32 centered) + `p.text-sm` "No notifications yet"
   (slate-500 rgb(100,116,139)). The clone's bell is a DEAD button
   (aria-label only, no popover) — the only measured surface where REF
   DOES something the clone does not (a functional gap, not just an
   attribute gap — violates the superset goal).

**Verified matches (no action)**: login page a11y byte-identical (label
for= email/password + placeholders you@example.com / •••••••• +
unnamed=0 + h1 both); the tabs family (7/7 tab, tablist, tabpanel,
aria-selected — both Radix Tabs); the loans dialog core (role=dialog +
aria-labelledby both); the mobile drawer contract (role=dialog,
data-state=open, NO aria-modal, NO aria-label on both — the vaul/Sheet
family trait).

**The clone's supersets (kept, documented)**: aria-label on 18 elements
(REF names almost nothing — its bell/moon/list/grid are unnamed
svg-only buttons; REF's only labels are 4 "Close badge" instances);
aria-current="page" on active nav links (REF: none); role=progressbar +
aria-valuenow/min/max on the leave-balance bars (REF: plain divs); every
button named (REF: 10 unnamed); aria-hidden on the decorative lucide
svgs (REF: 0 — its icons are exposed to screen readers).

**Documented non-goals / REF bugs not replicated**: REF's loans dialog
`aria-describedby="radix-:rf:"` is a DANGLING reference (no element with
that id exists in the DOM — a broken Radix Description mount on REF's
side); the clone's conditional describedby is correct and stays. REF's 2
base44-branded `<img>` per route (media.base44.com logo + data:png
favicon — 8 imgAlt total) are PLATFORM BRANDING and are not replicated
(the clone keeps its EonHR CSS-rendered brand — the deliberate
divergence documented since session 1).

## Gap groups

- **R24-A (the aria-controls contract)**: in
  `src/components/layout/sidebar-nav.tsx` `CollapsibleNavItem`, generate
  `const contentId = React.useId()` and pass `aria-controls={contentId}`
  to the Collapsible.Trigger + `id={contentId}` to the Collapsible.Content.
  The 8 group toggles then carry aria-controls in BOTH states like REF;
  the open state still points at the (now identically-id'd) mounted
  content. No visual change (attribute-only).
- **R24-B (the notifications bell popover)**: add
  `src/components/ui/popover.tsx` (the shadcn pattern over
  @radix-ui/react-popover — already a dependency), then wrap the
  SidebarFooter bell in `Popover`/`PopoverTrigger asChild` +
  `PopoverContent` carrying the REF recipe: `className="w-96"` +
  `align="start"`, header row (`flex items-center justify-between px-4
  py-3 border-b` + `h3.font-semibold.text-slate-900` "Notifications" +
  the empty gap-2 div), body (`max-h-[480px] overflow-y-auto` +
  `py-8.text-center.text-slate-500` + `Bell className="h-8 w-8 mx-auto
  mb-2 opacity-30"` + `p.text-sm` "No notifications yet"). The trigger
  keeps `aria-label="Notifications"` (the superset); Radix supplies
  haspopup/expanded/controls.

## Verified non-gaps (documented, no action)

- Login page (byte-identical), tabs family, drawer role contract, loans
  dialog role+labelledby.
- The clone's aria-label/aria-current/progressbar/named-button/
  aria-hidden supersets (a11y improvements with zero visual impact).
- REF's dangling aria-describedby + base44 branding imgs (not replicated).

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-25 block):
   - sidebar-nav: the CollapsibleNavItem authors the stable content id —
     Trigger carries `aria-controls={contentId}` and Content carries
     `id={contentId}` (source pins).
   - the bell: sidebar-nav imports/uses the Popover + renders the exact
     "No notifications yet" empty-state recipe with the w-96 popover.
   - the scope lock: the moon/language/user-trigger surfaces gain NO
     popover (only the bell).
2. GREEN: create popover.tsx + edit sidebar-nav.tsx (R24-A + R24-B).
3. Gates: lint → typecheck → unit → build → E2E (86) — restart :3200
   after the build (the stale-server lesson).
4. Live dual-browser verification: the group-toggle census re-run (9/9
   controls on LOC), the bell attribute census (haspopup/expanded/
   controls present), the popover open live-measure (width 384, header
   h3 recipe, empty state geometry), the canonical 12-route redeploy
   sweep (attribute changes must not move geometry), mobile chrome
   regression.
5. Screenshots: the open notifications popover (the round's core
   evidence), the group-toggle aria-controls inspector evidence + 2
   standards refreshed → docs/screenshots/.
6. Docs: AGENTS session-25 layer + counts, SKILL §37 + counts, PAD
   [S25], CLAUDE/README counts, session log (docs/session_41.md is the
   prior round's transcript — this round writes docs/session_42.md),
   worklog, this plan's completion record.

## Completion record (session 25)

Both gap groups executed TDD-first (4 new pins in tests/unit/recipes.test.ts,
all RED before implementation → GREEN; one mid-flight strengthening — the
first B2 draft missed the closed-state aria-controls + alignOffset contract,
rewritten after the live verification exposed them):

- **R24-A**: `const contentId = React.useId()` in CollapsibleNavItem;
  Trigger `aria-controls={contentId}` + Content `id={contentId}`. The
  v1.1.x Radix source spreads user props AFTER its own aria-controls, so
  the override holds in both states. Live-verified: 8/8 toggles carry
  aria-controls, all resolving.
- **R24-B**: `src/components/ui/popover.tsx` created (shadcn pattern,
  @radix-ui/react-popover — already a dependency) + the bell rebuilt as a
  Popover trigger. Live-verified byte-exact: popover 384×175 @ x=0 y=617
  (alignOffset −16 reproduces REF's translate(0px, 617px); sideOffset 4
  default keeps y), bg white, radius 6px, h3 "Notifications" 16px/600, p
  "No notifications yet" slate-500 rgb(100,116,139), icon
  h-8 w-8 mx-auto mb-2 opacity-30; the trigger carries the full contract
  closed (label + haspopup=dialog + expanded=false + controls); the
  popover opens from the mobile drawer's bell too.

Gates: lint 0/0 · tsc ✓ · 420/420 unit (+4) · build ✓ · 86/86 E2E.
2 evidence screenshots (81/82) + 2 standards refreshed → 95 total.
DB pristine (users=1, employees=1, leaveBalances=2, payroll=0,
expenses=0).
