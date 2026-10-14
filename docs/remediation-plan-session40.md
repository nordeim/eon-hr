# Remediation Plan — Session 40 / Parity Round 39

**Window**: session-40 audit (this document) · parity round 39
**Predecessor**: `docs/remediation-plan-session39.md` (round 38, delivered at `af5bf3d`)
**Baseline verified before census**: lint 0/0 · tsc ✓ · 598/598 unit · build ✓ · 167/167 E2E

> Session-40 was interrupted mid-execution in a previous window (all GREEN
> changes lost with the workspace reset — they were never committed). This
> plan re-anchors on live re-measured census data (all recipes below were
> re-probed this window against the live REF) and re-executes the round.

## Census summary

- **Redeploy watch**: REF's login JS chunk redeployed TWICE since round 38
  (`index-BYE5Ojxh.js` → `index-Cqb_n9sO.js` → `index-BIuE7r17.js`); the
  login CSS (`index-D0Q6-tUz.css`, round-35) and both app chunks
  (`index-C-IrDy5f.js` + `index-BGNH4KkS.css`) are UNCHANGED.
- **Standing audits 5/5 MATCH** (mobile tabs byte-identical; the drawer pair
  288px @ x=0, #FAFAFA, 1px #e5e5e5 after the Escape-reset pattern; navmap,
  bell, Quick Actions identical). No Tailwind v4 mobile-menu regression.
- **REF still zero-data** on the app tenant — but REF's PUBLIC careers board
  carries cross-tenant demo data (517 company chips), giving the first
  measurable with-data careers surface.
- **REF-side bug documented, not cloned**: REF's /loans dialog crashes to a
  blank page at mobile 390 (works at desktop) — the /Dashboard case
  precedent applies.

## Findings (all live-measured this round)

### A. The login redeploy re-audit (login-JS-only, again)

- **R39-A — the social buttons dropped `type="submit"`**: REF now renders
  all three social buttons with NO type attribute (`type: null` — the
  redeploy's visible change). The clone still pins `type="submit"` ×3
  (R38-F1). Since the buttons sit OUTSIDE the form the attribute was inert
  anyway; drop it to match REF's DOM.
- **R39-B — REF's login is theme-inert** (the round-38 frontier, now
  probed): with `darkMode="true"` armed in localStorage, REF's login
  preserves the key but NEVER applies `html.dark` (or `dir=rtl`) — the
  login build ships no theme boot. The clone's THEME_BOOT applies dark+rtl
  on every route including /login. Fix: the boot script returns early on
  `/login`. After sign-in the app side still applies dark (verified live:
  both apps hand off to `html.dark` + bodyBg rgb(10,10,10) on /dashboard).
- **R39-C — the login inputs keep the pre-migration recipe**: REF's login
  inputs render `flex w-full border px-3 py-2 text-base ring-offset-background
  … focus-visible:ring-2 focus-visible:ring-ring` (h=48 via the round-38
  `h-11 sm:h-12` family) — the login build did NOT pick up the app's Input
  base migration. Once the clone's base migrates (finding B), the login
  page must counter with explicit overrides: `shadow-none` +
  `focus-visible:ring-2 focus-visible:ring-offset-2` +
  `ring-offset-background` (its current `h-11 sm:h-12 text-base md:text-sm
  rounded-xl border-slate-200 bg-slate-50/50 py-2 pl-10 …` overrides stay).

### B. The global Input/Textarea/Select base migration (app-side silent redeploy, post-round-19)

REF's app inputs (live-measured on the loans "New Loan Request" dialog)
now render the v4-style shadcn recipes:

- **R39-D — Input base**:
  `flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`
  — at-rest `shadow-sm` (rgba(0,0,0,0.05) 0 1px 2px), `bg-transparent`
  (rgba(0,0,0,0)), focus `ring-1` (offset-0, rgb(10,10,10) 0 0 0 1px),
  `text-base md:text-sm` (16px mobile / 14px desktop — the mobile-font
  dimension), `file:text-foreground` added.
  The clone's round-19 recipe (`bg-card text-sm ring-2 ring-offset-2`, no
  shadow) is stale everywhere.
- **R39-E — Textarea base**:
  `flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`
  (the clone: `min-h-[80px] bg-card text-sm ring-2 ring-offset-2`).
- **R39-F — SelectTrigger**: gains `shadow-sm` + `ring-offset-background`,
  and the focus prefix flips `focus-visible:` → `focus:`
  (`focus:outline-none focus:ring-1 focus:ring-ring`). The R37-E
  neutral-500 placeholder override stays (rendered rgb(115,115,115)
  verified identical on both sides).
- **R39-G — page-level override cleanup**: the careers hero input
  (`h-12 pl-11 rounded-lg …`) and the tenantsetup `h-11` overrides were
  calibrated against the OLD base and are now stale (see K/L).

### C. The app-shell restructure (REF's shadcn Sidebar architecture)

Live-mapped REF DOM (desktop 1440×900):

```
div (unclassed)
└─ div.group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar
   style="--sidebar-width: 16rem; --sidebar-width-icon: 3rem;"
   └─ div.min-h-screen flex w-full <canvas gradient> safe-area-inset
      ├─ div.group peer hidden text-sidebar-foreground md:block     ← sidebar wrapper (NOT <aside>)
      │  ├─ div.relative h-svh w-[--sidebar-width] bg-transparent …  ← RTL peer spacer
      │  └─ div.fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width]
      │     transition-[left,right,width] duration-200 ease-linear
      │     md:flex left-0 … border-r border-slate-200 dark:border-slate-800
      │     bg-white dark:bg-slate-900                                ← fixed panel
      │     └─ div.flex h-full w-full flex-col bg-sidebar
      │        group-data-[variant=floating]:rounded-lg … data-sidebar="sidebar"
      ├─ main.flex-1 flex flex-col pb-20 md:pb-0
      │  ├─ header.bg-white dark:bg-slate-900 border-b border-slate-200
      │  │  dark:border-slate-800 px-6 py-4 md:hidden sticky top-0
      │  │  z-10 safe-area-top                                        ← INSIDE main
      │  └─ div.flex-1 overflow-auto                                  ← the scroll container
      │     └─ page canvases
      └─ nav.md:hidden fixed bottom-0 left-0 right-0 bg-white
         dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800
         safe-area-bottom z-50                                        ← main's SIBLING
         └─ div.flex items-center justify-around px-2 py-2
```

- **R39-H — the wrapper layers**: the clone's canvas is the root flex; REF
  nests unclassed div → `group/sidebar-wrapper` (with the
  `--sidebar-width: 16rem; --sidebar-width-icon: 3rem` inline vars) →
  canvas. The canvas keeps the sRGB-pinned arbitrary gradient (trap 3) and
  gains REF's inert `safe-area-inset` class.
- **R39-I — the sidebar becomes the peer architecture**: `div.group.peer.
  hidden.text-sidebar-foreground.md:block` wrapping the RTL peer spacer
  (`relative h-svh w-[--sidebar-width] bg-transparent transition-[width]
  duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0
  group-data-[side=right]:rotate-180 group-data-[collapsible=icon]:
  w-[--sidebar-width-icon]`) + the fixed panel (full recipe above) whose
  INNER `div.flex h-full w-full flex-col bg-sidebar …` carries
  `data-sidebar="sidebar"` and wraps the SidebarNav. The clone's current
  `<aside className="fixed left-0 top-0 z-10 hidden h-screen w-64 …">`
  renders the same pixels but the wrong DOM. The R34-D RTL contract
  (spacer mirrors, panel stays physically left) is preserved.
- **R39-J — the brand text container**: REF's is `flex-1 min-w-0`
  (display: BLOCK — stretches to 155px) containing `h2.font-bold
  text-slate-900 dark:text-white text-lg leading-tight` + `p.text-xs
  text-slate-500 dark:text-slate-400 truncate` ("Demo"). The clone's is a
  shrink-wrapped `flex min-w-0 flex-col` + `<span>` with the muted token.
- **R39-K — the header moves INSIDE main** (before the scroll container)
  and adopts REF's exact string (`bg-white dark:bg-slate-900 border-b
  border-slate-200 dark:border-slate-800 px-6 py-4 md:hidden sticky top-0
  z-10 safe-area-top` — explicit slate-200, not the sidebar-border token).
- **R39-L — the toggle**: REF's is a `data-sidebar="trigger"` button with
  NO type/aria-label/aria-expanded — its name comes from an
  `<span class="sr-only">Toggle Sidebar</span>`. Class family: the v4
  Button base + `hover:text-accent-foreground h-7 w-7 hover:bg-slate-100
  p-2 rounded-lg transition-colors duration-200`. The clone KEEPS
  aria-label + type="button" + aria-expanded (the documented a11y
  superset, invisible to rendering) but adopts REF's class recipe.
- **R39-M — the bottom nav**: `md:hidden fixed bottom-0 left-0 right-0
  bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800
  safe-area-bottom z-50` (explicit left-0 right-0 + slate-200; REF's
  `safe-area-bottom` is a DEAD class — no rules in its CSS). The clone's
  `pb-[env(safe-area-inset-bottom)]` is a functional superset (0px on all
  test surfaces) — kept.
- **R39-N — the scroll container**: `div.flex-1 overflow-auto` inside main
  wraps ALL page content; the document itself no longer scrolls the page
  (REF: docScrollH == viewport; the inner div scrolls). This is the
  restructure's behavioral core.
- **R39-O — print CSS**: the `@media print` block targets `aside` — the
  sidebar is now a div; target the wrapper via the escaped class
  `.group\/sidebar-wrapper` (hides spacer + panel together).

### D. Careers — the with-data surface + the org view (the round-33 gap closed)

REF's public board carries cross-tenant demo data (517 company chips,
docH 4789):

- **R39-P — the chips**: REF's are the v4 Button outline family:
  `inline-flex items-center justify-center gap-2 whitespace-nowrap
  rounded-md text-sm font-medium transition-colors … border border-input
  bg-background shadow-sm hover:bg-accent hover:text-accent-foreground
  h-auto py-3 px-4` (h=46), parent `flex gap-3 flex-wrap`. The clone's
  hand-rolled `h-[46px] rounded-md border … hover:bg-slate-50` diverges.
- **R39-Q — the count heading**: REF renders `<h3 class="text-xl
  font-semibold text-slate-900">1 Open Position</h3>` between the chips and
  the grid (pluralizes with the count). The clone has none.
- **R39-R — the hero input**: REF's is the migrated base + `md:text-sm
  pl-12 py-6 text-lg bg-white` (h=50; 18px mobile font), wrap `relative`
  (icon inside), grandparent `max-w-2xl mx-auto`. The clone's `h-12 pl-11
  rounded-lg border-slate-200 …` is calibrated to the old base.
- **R39-S — the org view**: clicking a chip NAVIGATES to
  `/Careers?org=<slug>` (client-side; note REF's capitalized path artifact)
  rendering a dedicated view: the org-name `h2.text-3xl font-bold
  text-slate-900` + a `← Back to all companies` button (v4 Button base) +
  the filtered list. The clone's chips are a client-state filter with no
  URL state. Implement `?org=` via `useSearchParams` (the (app) layout is
  dynamic — cookies — so no Suspense boundary issue; existing precedent).
- **R39-T — the zero-data states stay**: the clone's empty board keeps the
  round-31 "No Open Positions" card (REF's own tenant renders the same
  zero-state shape when filtered to 0).

### E. Tenantsetup (mobile, first probe below 1440)

- **R39-U — the canvas gains `p-4`**: REF's
  `min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex
  items-center justify-center p-4` — the card sits at x=16 w=358 (390
  viewport). The clone's canvas has no padding (card flush to edges).
- **R39-V — drop the `h-11` input overrides**: REF's tenantsetup inputs
  now render the migrated base (h-9 = 36px). The clone's `h-11` (44px)
  overrides are stale.

### F. Externaljobapplication

- **R39-W — the content wrapper**: REF's is `max-w-6xl mx-auto`; the
  clone's `mx-auto max-w-7xl space-y-12` — identical at 1440 (both cap at
  1120 inside the shell) but divergent ≥1536. Align to `max-w-6xl`.

### G. Documented non-gaps (no action)

- REF's builder badge ("Edit with Base 44"), the lab()/rgba serialization,
  the autocomplete superset, the 0px-border token — all established.
- REF's toggle a11y deficit (no aria-label) — the clone's superset stays.
- REF's /loans mobile dialog crash — the /Dashboard case precedent.

## TDD execution plan

1. **RED**: append the session-40 pin block to `tests/unit/recipes.test.ts`
   (~24 pins covering R39-A…W) + amend the stale predecessors
   (R38-F1 type drop; R18-B Input/Textarea recipe; R18-F Select members;
   R34-D2 aside→div; R32-A4 surfaces; R6-A `md:flex md:flex-col`;
   R28-B1 print selectors; the R18-E/R19-H "first type=submit" anchors
   revert to the Sign in button; R33-E2 chip recipe; R31-C1 hero input;
   R31-C10 tenantsetup canvas/inputs).
2. **GREEN**: migrate `src/components/ui/input.tsx` + `textarea.tsx` +
   `select.tsx` (R39-D/E/F) → rewrite the login page's overrides + drop
   the social `type="submit"` (R39-A/C) → THEME_BOOT login skip (R39-B) →
   the app-shell restructure (R39-H…O) + the brand container (R39-J) →
   the careers rewrite (R39-P…T) → tenantsetup (R39-U/V) →
   externaljobapplication (R39-W).
3. **E2E**: amend the aside selectors (`dark-mode`, `dashboard`,
   `mobile-navigation`, `navigation`, `print-media`) to the new
   `[data-sidebar="sidebar"]` / `.group\/sidebar-wrapper` targets;
   re-scope the orphan-routes main assertions to the scroll container
   (the header's toggle button now lives inside main); add the session-40
   spec block (login type/theme-inert, the input family, the shell
   scroller, careers org-view, tenantsetup mobile).
4. **Gates**: lint → tsc → unit → build → E2E, all green.
5. **Live verification**: dual-browser standing audits + the round's
   targeted verify script (login pair, input family pair, shell tree,
   careers org-view pair, tenantsetup mobile pair) + screenshots
   (docs/screenshots/ 148-155) + DB pristine check.
6. **Docs**: AGENTS session-40 layer, SKILL 3.23.0 + §52, PAD [S40],
   CLAUDE/README counts, docs/session_81.md, this plan's completion
   record, worklog entry. Commit + SSH-wrapper push (main only).

## Risks & mitigations

- **The scroll container changes scrolling behavior** — every E2E spec
  that scrolls (`mouse.wheel`, `scrollY` assertions) or reaches into
  `main`'s direct children is affected; the amendment list above covers
  the known five specs + orphan-routes, and the full E2E run surfaces any
  remainder (the interrupted window's 14 failures were all
  selector-level).
- **The Input migration is global** — dialogs measured in rounds 19-38
  pinned ring-2/offset-2 geometry; the live re-measure confirms REF moved
  to ring-1/offset-0/shadow-sm, so the pins are amended, not the pixels
  (both sides now render the same v4 family).
- **Comments-in-source regex inflation** (round-37 lesson): reword
  comments that quote class strings; never count occurrences that appear
  in comments.

---

## Completion record (session-40, executed this window)

The interrupted first attempt (previous window, uncommitted) was
re-executed from scratch this window against fresh live measurements —
every recipe re-probed on both apps before implementation (REF had
redeployed the login JS again: `Cqb_n9sO` → `BIuE7r17`).

**TDD**: 30 RED (21 new session-40 pins + 9 amended predecessors + the
tightened Q1) → **619/619 unit GREEN** (+21). The RED phase surfaced two
of the round's own lessons live: the comments-in-source regex inflation
(the author's own comments quoting class strings — reworded, not
recalibrated) and the pin regexes needing the runtime-merged-string
split (the Button outline family checked as variant + className, not
the concatenated runtime string).

**Gates**: lint 0/0 · tsc ✓ · 619/619 unit (+21) · build ✓ · 174/174
E2E (+7: the session40-restructure spec — the shell scroller, the peer
sidebar, the input family, the careers org view with API-seeded data,
tenantsetup mobile, the social type drop, the theme-inert login).

**The build-time catch**: the first build compiled `w-[--sidebar-width]`
to the invalid raw `width:--sidebar-width` (no var() wrapper — v4 dropped
the v3 auto-wrap). REF's own CSS ships `width:var(--sidebar-width)`; the
v4 parenthesis form `w-(--sidebar-width)` generates the identical output.
Fixed in source + pins; a second catch — v4's content detection scanning
docs/*.md generated dead bracket-form rules — fixed with
`@source not "../../docs"` (clean rebuild verified: only the three valid
var() rules remain).

**E2E amendments**: five specs' aside selectors →
`[data-sidebar="sidebar"]` (+ its parentElement for the fixed-panel RTL
geometry); the orphan-routes emptiness check re-scoped to the scroll
container; the dashboard shell-canvas chain (main's parent is now the
canvas) and the payroll page-canvas chain (one level deeper); the
auth.spec social type pin → null.

**Live verification** (verify-r39.mjs + the standing audits): the shell
tree pair byte-identical (peer wrapper / fixed panel / scroller /
header-inside-main / bg-sidebar surface / docScrollH); the login pairs
MATCH (social types null ×3, theme-inert htmlDark=false with
stored=true); the loans input family renders identically (the v4/v3
shadow-slot serialization aside); the careers recipes identical (input
h=50, `md:text-sm pl-12 py-6 text-lg bg-white`; the data diff is
REF's cross-tenant board vs the clone's empty tenant — the count
heading + zero-card contract verified per-side); tenantsetup mobile
byte-identical (card x=16 w=358, input h=36). Standing audits 5/5
(the drawer pair 288px @ x=0, #FAFAFA, 1px #e5e5e5). 16 screenshots
(148-155, including the org-view pair via an API-seeded job deleted
after capture) → 212 captures. DB pristine (users=1, employees=1,
leaveBalances=2).

**Frontier after this round**: REF's next redeploy watch (the login
chunk proved they ship login-only changes — three in a row now), the
remaining with-data surfaces on the app tenant (still blocked on
REF's zero-data state), the toaster interior (unfireable on zero-data
REF), the mobile-font dimension's remaining surfaces (the careers
board re-probed at 390 — docH 4789 vs the clone's 900 is data, but
the hero's mobile rendering deserves a pixel-diff pass).
