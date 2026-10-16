# Remediation Plan — Session 44 / Parity Round 43

**Window**: session-44 audit (this document) · parity round 43
**Predecessor**: `docs/remediation-plan-session43.md` (round 42, delivered at `747ac5c` + the session-log commit `11b786f`)
**Baseline verified before census**: lint 0/0 · tsc ✓ · 656/656 unit · build pending-round (fresh clone after a THIRD workspace reset; env rebuilt — bun install, `.env` with a generated AUTH_SECRET, db:push + db:seed to `<repo>/db/custom.db` with the shell-level `DATABASE_URL` override unset, Playwright chromium reinstalled)

## Census summary

- **Standing shell state**: round-42 fingerprints quiet at the login/app
  chunk level (the round-43 window found no login re-deploy). The frontier
  came from the standing list — the s40 shell restructure (round 39) moved
  all scrolling into an inner container, and the sidebar's INNER authored
  architecture was never census'd beyond the r41 attribute family. This
  round census'd it end to end (DOM tree + exact class strings + both
  collapse states + rendered geometry + hover renders), on both apps.
- **THE HEADLINE FINDING — REF's sidebar is the full shadcn Sidebar
  component architecture** (SidebarContent/SidebarGroup/SidebarMenu), and
  the clone's s40/r41 migration only adopted the OUTER shell (the peer
  wrapper + the data-sidebar attribute names). The inner class strings
  never migrated: REF's content wrapper is a `div` (not a `nav`) carrying
  `flex min-h-0 flex-1 flex-col gap-2 overflow-auto
  group-data-[collapsible=icon]:overflow-hidden p-3`; the group carries
  `relative flex w-full min-w-0 flex-col p-2`; the menu ul carries
  `flex w-full min-w-0 flex-col gap-1`; every nav button carries the full
  shadcn `peer/menu-button` base with the `!size-8 !p-2` icon-rail members;
  the group-label carries the `transition-[margin,opacity]` + rail
  `-mt-8 opacity-0` members. The clone's inner wrappers are the old
  session-5 rhythm (`flex h-full flex-col` extra wrapper, `nav` element,
  `px-5 pb-4 pt-5` content, bare `flex flex-col` group, `gap-1` ul).
- **THE FUNCTIONAL GAP — REF's desktop trigger COLLAPSES the sidebar to a
  47px icon rail** (the shadcn `collapsible=icon` mode). The peer wrapper
  flips `data-collapsible=""` ↔ `"icon"` (and `data-state` expanded ↔
  collapsed); the spacer/wrap/inner (all present in the clone since s40)
  respond via their `group-data-[collapsible=icon]:*` members. The clone's
  desktop trigger does NOTHING (it only opens the mobile drawer — the
  matchMedia branch is missing). REF's trigger lives in the same
  `md:hidden` mobile header — invisible-but-programmatically-clickable at
  desktop (0×0 rect measured); the collapse is dormant UI on REF, reached
  only programmatically, and the clone reproduces the authored branch
  (desktop ≥768px → toggle collapse; below → open the drawer).
- **Rail geometry (live-measured)**: peer/wrap 48×577, inner 47×577,
  content `overflow: hidden`, group-label opacity-0 + -mt-8, leaf buttons
  32×32 with `!p-2` (8px all sides — the `!` members beat the tail
  geometry), brand h2 width 0, label spans width 0 (clipped by the
  button's overflow-hidden), footer 47×121 with `overflow: visible` and
  scrollWidth 128 (the عربي button spills past the rail — REF's own
  dormant-UI behavior; identical by construction when the classes mirror).
- **The toggle interior restructure**: REF wraps the toggle's interior in
  `div.flex.items-center.justify-between.w-full.px-3.py-2.5` >
  `div.flex.items-center.gap-3` (icon + label) + the chevron. The chevron
  is a GLYPT SWAP — `chevron-right` collapsed ↔ `chevron-down` open, NO
  rotation (the clone currently rotates a chevron-right 90°). The interior
  wrapper is why the toggle's 20px icons survive the base's
  `[&>svg]:size-4` guard: the guard's selector is `.class > svg` (direct
  child only) and the toggle's icon is two levels deep — rendered 20px,
  live-measured. The leaf icons ARE direct children — authored `w-5 h-5`
  but rendered 16px (the guard wins).
- **Typography**: REF authors `font-medium` (500) on every top-level leaf
  and toggle label span (live-measured fw=500; the clone renders 400 — a
  real visual diff that survived 42 rounds) and `text-sm` on subleaf
  spans (inactive 400; the active subleaf's LINK carries font-medium so
  the span inherits 500).
- **The no-ul submenu**: REF's Collapsible.Content is
  `div.pl-4.space-y-1` with DIRECT `li` children (no inner ul — the clone
  has `ul.mt-1.flex.flex-col.gap-1.pl-4`). space-y-1 = the same 4px pitch.
- **The active-state recipe**: the active leaf/subleaf carries the
  hand-authored `custom-primary-bg` class + `text-white font-medium
  shadow-sm` + an INLINE `style="background-color: rgb(24, 119, 242)"`
  (render-redundant with the class's !important — an authored attribute we
  mirror) — NOT `bg-primary`. The rules live unlayered in REF's CSS:
  `.custom-primary-bg { background-color: var(--primary-color)
  !important; }` / `.custom-accent-bg { background-color:
  var(--accent-color) !important; }` with `--primary-color: #1877f2` +
  `--accent-color: #e4e6eb` at `:root`. The inactive hover pair rides the
  SIDEBAR TOKENS (`hover:bg-sidebar-accent
  hover:text-sidebar-accent-foreground` — zinc-100/zinc-900), and the
  leaf tail carries the dead authored member `hover:custom-accent-bg`
  (a hand-authored class — Tailwind generates nothing for its hover:
  variant; mirrored for DOM parity, inert).
- **Token corrections required first** (REF live-read, light + dark):
  light `--sidebar-accent: 240 4.8% 95.9%` (zinc-100) +
  `--sidebar-accent-foreground: 240 5.9% 10%` (zinc-900 — the token is
  MISSING in the clone entirely); dark `--sidebar-accent: 240 3.7%
  15.9%` (zinc-800) + `--sidebar-accent-foreground: 240 4.8% 95.9%`
  (zinc-100). The clone's light `--sidebar-accent` is a WRONG blue tint
  (`214 95% 93%`) that the r19 hex-pin workaround masked.
- **Attribute contract** (live-counted on /employees): `sidebar 1,
  header 1, content 1, group 1, group-label 1, group-content 1, menu 1,
  menu-item 11, menu-button 19, footer 1, trigger 1` — menu-item = 5
  standalone + 6 open-group subleaves (closed groups' Content is mounted
  but EMPTY — Radix renders children only when present); menu-button = 5
  standalone + 8 toggles + 6 open-group subleaves. EVERY nav button
  carries `data-sidebar="menu-button" data-size="default"
  data-active="false"` — REF authors `data-active="false"` even on the
  active link (the active styling rides the tail classes + inline style;
  the base's `data-[active=true]:*` members are dead code on REF). The
  subleaf li carries `data-sidebar="menu-item"` +
  `class="group/menu-item relative"` (the r41 "toggles bare" note was a
  pre-redeploy reading — REF now authors the full contract on toggles
  AND subleaves).
- **The toggle hover-pair split** (verify-phase discovery): REF's toggle
  tail does NOT carry `hover:bg-sidebar-accent
  hover:text-sidebar-accent-foreground` — only leaf/subleaf tails do.
  That is how the toggle's blue hover (`hover:bg-blue-50
  hover:text-blue-700`) survives: on a closed toggle the base's
  `data-[state=open]:hover:*` members don't match, and without the
  sidebar-accent pair in the tail, the blue pair is the only hover rule.
  (A unified base+tail carrying the pair rendered the toggle hover GRAY —
  the first verify pass caught it live.)

## Findings (all live-measured this round)

- **R43-A — the desktop collapse (AppShell)**: the peer wrapper gains
  `data-state="expanded|collapsed"` + `data-collapsible=""|"icon"` +
  `data-variant="sidebar"` + `data-side="left"`; a `collapsed` state;
  the trigger's click handler branches on
  `window.matchMedia("(min-width: 768px)").matches` — desktop toggles the
  collapse, mobile opens the drawer. The spacer/wrap/inner/sidebar divs
  already respond (s40 members). The `main` element does NOT change
  width (REF's main stays 1392px — the fixed panel overlays; the wrap's
  icon width change is what reserves the column).
- **R43-C — the SidebarNav restructure** (the shadcn inner architecture,
  verbatim strings in the pin block below).
- **R43-D — the globals.css token corrections + custom rules** (the
  sidebar-accent family corrected to REF's zinc values, the missing
  accent-foreground token added, the --primary-color/--accent-color vars
  + the two unlayered custom rules).

## The TDD contract

- **Unit pins** (session-44 block, `tests/unit/recipes.test.ts`): the
  token corrections (light + dark), the custom rules + vars, the content
  div architecture (the nav element retires — the last `nav` in the tree
  is the bottom tab bar), the group family strings, the shared
  menu-button base const, the three tails (leaf/toggle/subleaf) + active
  branches + inline style, the toggle interior + glyph swap, the no-ul
  submenu, the peer's four data attrs + collapse state, the trigger's
  matchMedia branch.
- **Predecessor amendments** (~15): the session-5 leaf/icon/hover/submenu
  pins (the hex hovers retire to the token forms; the leaf icons author
  `w-5 h-5` — the base guard renders 16px), R18-C (the focus pair rides
  the base const + group-label), R19-A/B (token + custom-primary-bg
  forms), R20-A/C/D/E (the base's active/open-hover members), R21-A (the
  toggle tail anchor), R21-D (the glyph swap replaces rotate-90), R29-A1
  (the no-ul submenu), R34-D1 (the peer's data attrs), R41-E1 (the
  contract now covers toggles + subleaves).
- **E2E amendments (4 specs)**: `navigation.spec.ts` (nav →
  `[data-sidebar="content"]` + the active-link selector), `dashboard.spec.ts`
  (the active-link selector), `print-media.spec.ts` (the content div hides
  via the wrapper subtree — `toBeHidden()`, the display-none-descendant
  lesson), `mobile-navigation.spec.ts` (the toggle span weight 400 → 500).
- **New E2E spec** `tests/e2e/session44-sidebar-collapse.spec.ts`: the
  peer attrs, the programmatic trigger click → rail state (geometry +
  group-label opacity + brand 0-width), the expand-back, the mobile
  matchMedia branch (the drawer opens, no collapse), the menu-button
  counts (19 on /employees — the auto-open group), the footer/aria
  supersets. No `.hover()` E2E (the documented headless
  `@media (hover:hover)` trap — the hover dimension stays unit-pin +
  live-probe).

## Verification plan

1. Gates: `lint → typecheck → test (656 + new pins) → build → E2E
   (190 + the new spec)`.
2. Production server on :3200 (`PORT=3200 .next/standalone/server.js`
   with the static + public wiring), the standing audits
   (`scripts/probe-r40-standing.mjs` — 5/5) + the 12-route sweep.
3. `scripts/verify-r43.mjs` — the round-specific pairs: the authored DOM
   trees (sidebar family, both states), the rail geometry, the hover
   renders (the v2 hover polyfill — unwrap `@media (hover:hover)` in
   place, recursive through `@layer` — + real pointer moves; REF is a v3
   build, hovers apply directly), the short-viewport scroll behavior,
   the tokens (both themes), the label weights. Expected residual diffs:
   the `rgb(24, 119, 242);` CSSOM serialization (render-identical), the
   `!` form + aria superset (documented), the toggle-icon 20px nested
   escape (measured identical).
4. Screenshots: 8 captures (168-171 numbering continues the 236-PNG
   record — desktop rail expanded/collapsed pairs + the drawer + the
   group open states, REF + LOC).
5. DB pristine check (users=1, employees=1, leaveBalances=2) +
   `.env.example` re-verified.

---

## Completion record (session 44, delivered)

- **Gates**: lint 0/0 · tsc ✓ · **670/670 unit** (+14: D1-D3, C1-C9,
  A1-A2) · build ✓ · **198/198 E2E** (+8 — the
  session44-sidebar-collapse spec: the peer attrs, the programmatic
  rail collapse + geometry, the label/brand collapse, the expand-back,
  the mobile matchMedia branch, the 19/11 counts + the attribute
  contract, the active recipe + inline style, the chevron glyph pair;
  one session40 input-family tolerance flake in the first full run —
  stable on the single-spec re-run AND the full re-run, the documented
  pattern).
- **Predecessor amendments**: 17 (session-5 ×4, R18-C, R19-A/B,
  R20-A/C/D/E, R21-A/D, R22-A1, R29-A1, R34-D1, R41-E1) + the E2E
  quartet (navigation ×2, dashboard, print-media, mobile-navigation
  weight) — the hex hover/pressed forms retired to the token members,
  the chevron pin flipped to the glyph swap, the nav-anchor pins moved
  to the content div.
- **Live verification**: standing audits **5/5**, route sweep
  **12/12**, **verify-r43 9/9 MATCH** (the peer attrs, the family
  strings, the authored sets, the submenu + counts, the rail geometry
  both apps collapsed LIVE, the tokens both themes, the hover renders —
  leaf zinc-100 + closed toggle blue-50, the short-viewport scroll).
- **Round-specific gotchas resolved en route**: the v3 leading-`!`
  important forms compile under the installed Tailwind 4.3.3 (verified
  empirically before adoption); Chrome's newer engines resolve
  color-function-valued custom properties in computed style (the
  clone's hsl() tokens read back as hex — the verify normalizes both
  sides to rgb triples); the recursive hover polyfill (v4 nests the
  @media blocks inside @layer — 5 blocks unwrapped); the desktop-ready
  E2E signal (the sidebar itself, not the mobile-only kicker).
- **Screenshots**: 168-171 (8 PNG: the expanded active+open-group
  sidebar, the collapsed 47px rail both apps, the restructured drawer
  on the mobile band, the short-viewport scroll) → **244 PNG
  captures**. DB pristine (users=1, employees=1, leaveBalances=2).
