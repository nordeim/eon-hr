# Remediation Plan — Session 22 / Parity Round 21

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
**transitions/animations dimension audit** — the never-swept interaction layer
per session_34's suggested next steps ("transitions/animations were never
swept systematically"). Method: static CSSOM enumeration of every
`transition-*` / `animation` / `@keyframes` rule on both apps + DOM
classList audit of elements carrying the classes + empirical frame-sampling
(requestAnimationFrame) of live transitions on both sides.

Standing audits this round: **redeploy check PASSED** (12 canonical routes,
h1 text/font/x/y byte-identical — REF unchanged since round 20; the four
width deltas remain the documented REF-overflow family). **Mobile navigation
audit PASSED byte-identical** (top bar 390×73 white sticky + 1px slate-200;
tabs x 10/79/139/204/313, 14px labels, 20px icons, active rgb(37,99,235);
drawer 288×844 #FAFAFA z-50, links 141/301/421/461/581, footer 121@723, no
close button; kickers 53/69; md boundary 767/800 — no Tailwind v4 bug).
**With-data re-check**: REF still renders zero data (employees 0 rows) — the
with-data frontier stays blocked on REF (documented).

## The transitions/animations map (measured)

**REF stylesheet**: 26 keyframes (pulse, spin, enter, exit, accordion-up/down,
fadeIn/Out, slideFrom/To*, swipe-out-*, sonner-*, badge-spin, base44-fade-in,
base44-scale-in), 25 animation rules, 27 transition rules. **LOC stylesheet**:
4 keyframes (spin, ping, pulse, bounce — the v4 defaults), **0 animation
rules**, 17 transition rules (v4 var-based forms that resolve to the same
150ms cubic-bezier(0.4,0,0.2,1) defaults as v3).

**REF live DOM** (dashboard + employees + recruitment): sidebar leaves +
sub-items `transition-all duration-200` (0.2s cubic-bezier(0.4,0,0.2,1));
group buttons `transition-all duration-200`; footer bell/moon/عربي/user
`transition-colors` (150ms); quick chips `transition-colors`; bottom tabs
`transition-colors`; search input `transition-colors`; TabsTrigger
`transition-all` (150ms); user dropdown + loans dialog + attendance select
content `data-[state=open]:animate-in fade-in-0 zoom-in-95` → computed
`animation: enter 0.15s ease`.

**LOC live DOM**: leaves/sub-items match byte-for-byte; chips/footer/tabs/
input/tabs match; **group triggers carry `transition-colors` (150ms) not
`transition-all duration-200` (200ms)**; chevrons carry an extra
`transition-transform duration-200`; NO element animates (dialog/dropdown
classes exist in source but are dead — v4 generates no CSS for
tailwindcss-animate plugin utilities).

## Empirical timing measurements (frame-sampled)

- **Group hover fade** (Recruitment button, settled reads): REF interpolates
  transparent→blue-50 settling ~269ms; LOC (hover polyfill v2) settles
  ~229ms — the 200ms vs 150ms transition duration difference, visible on
  every group hover.
- **REF drawer open** (390×844): panel slides -288→0 over ~500ms
  (vaul `transform 0.5s cubic-bezier(0.32,0.72,0,1)`); overlay fades
  0→1 over ~160ms. **REF drawer close**: slides 0→-288 over ~280ms
  (vaul slideToLeft animation), overlay fades ~130ms, unmount ~330ms.
  **LOC drawer**: opens/closes with NO animation at all — Radix Portal
  mounts the Content fresh with `data-[state=open]` already set, so the
  `transition-transform duration-300` classes never see a state change
  (transitions need a live element; animations do not).
- **REF group expand/collapse**: INSTANT (content height 728→516 in one
  frame; chevron `transition: all 0s`, no transition classes). The
  accordion-down/up keyframes in REF's CSS are dormant library CSS.

## Verified non-gaps (documented, no action)

- Leaf links, sub-items, quick chips, footer buttons, bottom tabs, Input,
  TabsTrigger: transition recipes byte-identical (classList + computed).
- **Sidebar collapse family** (3 divs: `transition-[width]`,
  `transition-[left,right,width]`, `transition-[margin,opacity]` all
  `duration-200 ease-linear`): dormant shadcn sidebar internals — REF has
  NO collapse trigger at desktop (no hamburger ≥768px; "Toggle Sidebar"
  renders 0×0). Nothing fires them.
- **accordion-down/up + data-motion animate rules, base44-fade-in,
  base44-scale-in, badge-spin, fadeIn/fadeOut/slide*/swipe-out keyframes**:
  dormant on every audited page (sidebar groups expand instantly measured;
  no navigation animations fire; no badge-spinner elements).
- **prefers-reduced-motion**: REF's only rule is the sonner library's
  (`[data-sonner-toast] { transition: none !important; animation: auto
  ease 0s }`). No app-level recipe exists to clone — the open a11y item on
  BOTH apps stays open (documented; introducing motion-reduce variants the
  reference never authored would deviate from authored-class parity).
- **Sonner toast animations**: unmeasurable on REF (every toast-triggering
  control is dead there) — the clone's toast card remains the documented
  deviation; only its enter animation gets superset polish (R21-E).
- **REF's `.transition`, `duration-300`, `ease-in-out`, vaul/sonner
  internals**: library CSS, no live parity surface beyond the drawer
  timings already measured.
- v4's `motion-reduce:transition-none` in LOC's CSS: registry noise
  (generated, not authored anywhere).

## Gap groups

- **R21-A (group trigger transition timing — visible on every group hover)**:
  REF's group buttons carry `transition-all duration-200` (measured computed
  0.2s cubic-bezier(0.4,0,0.2,1)); the clone's Collapsible.Trigger carries
  `transition-colors` (v4 default 150ms). Fix
  `src/components/layout/sidebar-nav.tsx` (trigger className):
  `transition-colors` → `transition-all duration-200`.
- **R21-B (the enter/exit animation family — systemic, dormant-class fix)**:
  REF animates dropdown menus, dialogs, and select content with
  `data-[state=open]:animate-in data-[state=closed]:animate-out
  data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
  data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95` → computed
  `animation: enter 0.15s ease`. The clone's ui/dialog.tsx and
  ui/dropdown-menu.tsx already carry the exact classes — but Tailwind v4
  generates NO CSS for them (they are tailwindcss-animate plugin utilities;
  v4 has no plugin system). ui/select.tsx and the sidebar user dropdown
  omit the classes entirely. Fix:
  1. `src/app/globals.css`: hand-author the tailwindcss-animate v4 subset
     (`@keyframes enter/exit` + `@utility animate-in/animate-out/fade-in/
     fade-out/fade-in-0/fade-out-0/zoom-in-95/zoom-out-95/slide-in-from-left/
     slide-out-to-left/slide-in-from-bottom-2`). No `initial` custom-property
     resets (the v3 plugin's cascade trick): every animated surface here is
     portal-mounted (dialog/dropdown/select content are portals; drawer
     overlay+panel are siblings), so no inheritance leak is possible; the
     keyframe fallbacks (opacity 1, scale 1, translate 0) cover the unset
     vars.
  2. `src/components/ui/select.tsx` SelectContent: add the fade+zoom recipe.
  3. `src/components/layout/sidebar-nav.tsx` user-dropdown Content: add the
     fade+zoom recipe.
- **R21-C (mobile drawer slide — user-priority surface, visible)**: REF's
  drawer slides in over 500ms with cubic-bezier(0.32,0.72,0,1) (vaul),
  closes over ~300ms; the overlay fades ~150ms. The clone's drawer pops
  instantly (mounts fresh — transitions can't fire; see measurement). Fix
  `src/components/layout/app-shell.tsx`: overlay → `data-[state=open]:
  animate-in data-[state=open]:fade-in data-[state=closed]:animate-out
  data-[state=closed]:fade-out`; panel → `data-[state=open]:animate-in
  data-[state=open]:slide-in-from-left data-[state=closed]:animate-out
  data-[state=closed]:slide-out-to-left data-[state=open]:
  [animation-duration:500ms] data-[state=closed]:[animation-duration:300ms]
  [animation-timing-function:cubic-bezier(0.32,0.72,0,1)]`. Animations
  (unlike transitions) run on fresh mounts, and Radix waits for
  `animationend` before unmounting on close — both directions work.
- **R21-D (chevron extra animation — the clone animates what REF snaps)**:
  REF's group chevron carries NO transition classes (computed `all 0s`) —
  the rotate-90 toggles instantly. The clone's ChevronRight carries
  `transition-transform duration-200` (a 200ms swing REF never renders).
  Fix `src/components/layout/sidebar-nav.tsx`: remove the transition
  utilities from the chevron className (keep `rotate-90` conditional).
- **R21-E (superset polish — toast enter animation)**: the clone's toast
  cards pop instantly; the dead `data-[state=open]:animate-in` class on
  them never fires (the divs carry no data-state). REF's sonner toasts
  animate (library CSS: fade + slide) but are unmeasurable live (dead
  controls). Replace the dead class with `animate-in fade-in
  slide-in-from-bottom-2` (ungated — fires on mount) as documented
  superset polish, matching the sonner enter feel.

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-22 block):
   - trigger asserts `transition-all duration-200` (and NOT the bare
     `transition-colors` recipe in the trigger block)
   - chevron negative assertion: no `transition-transform` (mind the r19/r20
     lesson — comments must not contain the forbidden literals)
   - select content + user dropdown assert the fade+zoom recipe
   - app-shell overlay/panel assert the new animation classes + timings
   - globals.css asserts the enter/exit keyframes + the @utility set
   - toast asserts `animate-in fade-in slide-in-from-bottom-2`
   - E2E: extend the mobile-navigation spec with a drawer-panel classList
     pin (slide utilities present) — geometry assertions are already
     animation-safe (height/width only, auto-retrying counts).
2. GREEN: the 6 file edits (globals.css, select.tsx, sidebar-nav.tsx ×3
   sites, app-shell.tsx ×2, toast.tsx).
3. Gates: lint → typecheck → unit → build → E2E (86).
4. Live dual-browser verification: dropdown/dialog/select animation-name
   during open (expect `enter 0.15s`); drawer open/close frame-sampling on
   both apps (expect ~500ms/~300ms + overlay ~150ms); group hover fade with
   polyfill v2 (expect ~200ms settle); chevron instant; post-fix regression:
   canonical 12-route sweep + mobile chrome regression + the standing
   pressed/hover spot-checks (group pressed zinc-100, active tab pill).
5. Screenshots: drawer open (settled) + desktop dialog open + user dropdown
   open (3 evidence) + 2 standards refreshed → docs/screenshots/.
6. Docs: AGENTS session-22 layer, SKILL §34, PAD [S22], CLAUDE/README
   counts, session log (docs/session_36.md), worklog, this plan's
   completion record.

## Documented non-goals / supersets kept

- The sidebar collapse family, accordion keyframes, base44-*, badge-spin,
  sonner/vaul internals: dormant REF CSS — not cloned beyond the measured
  drawer timings.
- prefers-reduced-motion: no app-level recipe exists on REF to mirror; the
  a11y item stays documented open on both apps.
- The toast enter animation (R21-E) is superset polish on a surface REF
  cannot demonstrate — clearly labeled as such.
- The dialog `duration-200` class (present in REF's dialog classList) does
  not change its measured 150ms animation (duration maps to
  transition-duration in REF's build) — the clone pins 150ms via the
  @utility default, matching the measurement.

## Completion record (session 22)

All five gap groups executed TDD-first (7 new pins in
tests/unit/recipes.test.ts, all RED before implementation → GREEN; two
mid-flight pin corrections — slice windows and the interleaved dropdown
class order — the documented r19/r20 lesson):

- **R21-A**: the group trigger carries `transition-all duration-200` —
  frame-sampled hover settle moved ~229ms → ~272ms (REF ~269ms).
- **R21-B**: globals.css carries `@keyframes enter/exit` + the @utility
  subset (animate-in/out, fade-in/out(-0), zoom-in/out-95,
  slide-in-from-left/out-to-left/from-bottom-2); ui/select.tsx + the
  sidebar user dropdown carry the fade+zoom recipe; the pre-existing
  dialog/dropdown classes now generate real CSS (built-CSS verified).
  Live-verified: dropdown `enter 0.15s` with opacity 0.58→1 + scale
  0.979→1; select content `enter 0.15s`.
- **R21-C**: the drawer overlay fades via animate-in/out + fade-in/out
  (~150ms); the panel slides via slide-in-from-left/out-to-left with
  `data-[state=open]:[animation-duration:500ms]
  data-[state=closed]:[animation-duration:300ms]
  [animation-timing-function:cubic-bezier(0.32,0.72,0,1)]`. Live-verified:
  open -283→0 over ~500ms + overlay 0→1; close (Escape) 0→-288 over
  ~305ms + fade ~170ms, unmount ~340ms (Radix waits for animationend).
- **R21-D**: the chevron carries no motion classes — computed `all 0s`
  (instant snap, matching REF).
- **R21-E**: the toast cards enter with `animate-in fade-in
  slide-in-from-bottom-2` (ungated — fires on mount; superset polish on
  the REF-unmeasurable surface).

Gates: lint 0/0 · tsc ✓ · 398/398 unit (+7) · build ✓ · 86/86 E2E.
Post-fix regressions: canonical 12-route sweep 12/12 MATCH + mobile chrome
byte-identical + the standing pressed/hover verification 7/7 MATCH. 5
screenshots (3 motion evidence + 2 standards) → 88 total. DB pristine
(users=1, employees=1, leaveBalances=2, payroll=0, expenses=0).
