# Remediation Plan — Session 21 / Parity Round 20

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
**:active (pressed-state) parity audit** — the final interaction dimension
per session_32's suggested next steps ("the :active (pressed) states — needs
mousedown-hold tooling"). The tooling gap was solved this round: agent-browser
exposes `mouse move <x> <y>` / `mouse down` / `mouse up`, so the probe holds
the real button down (CDP Input events set the true `:active` pseudo-class).
Protocol: rest read → mouse-over settle (>= 2s) → hover read → mouse-down
hold settle (1.6s) → active read → **mouse move away BEFORE mouse-up** (the
click-safe rule — mouse-up over the element fires a real click: the first
draft toggled REF's عربي to "EN" and expanded groups mid-probe).

Redeploy check PASSED (12 canonical routes byte-identical on h1
text/font/x/y — REF unchanged since round 19). Mobile navigation audited
end-to-end per the standing user priority (top bar 390×73, tabs
10/79/139/204/313, drawer 288×844 #FAFAFA z-50, kickers 53/69, md boundary
767/800) — byte-identical, no Tailwind v4 bug. With-data story re-checked:
REF still renders zero data (employees 0 rows; payrollmodule's single row is
its empty-state message) — the with-data frontier remains blocked on REF.

## Probe-tooling discoveries (pinned for future rounds)

1. **Tailwind v4 does NOT media-wrap `active:` variants** — only `hover:*`
   rides inside `@media (hover: hover)` (90 rules; verified again in the
   built CSS). `:active` rules are bare on both sides, so the probe browser
   applies them directly — no polyfill needed for the active dimension. The
   r19 hover polyfill was still injected on LOC for the pressed-state reads
   (a real desktop press = `:hover` + `:active` simultaneously).
2. **agent-browser `mouse down` + `mouse up` are real CDP Input events** —
   the missing "mousedown-hold tooling" from the session-32 frontier note
   does exist (`mouse move/down/up`). Always move the pointer away before
   `mouse up` or the release fires a real click on the probed element.
3. **v4 registry noise**: the built CSS contains six unused `active:*`
   utility rules (translate-y-0, scale-95, scale-[0.98], cursor-grabbing,
   bg-blue-800, shadow-none) generated from scanned library content — only
   `active:cursor-grabbing` is actually authored (taskmanager). Not gaps.
4. REF's sidebar group buttons carry TWO hover recipes: collapsed =
   blue-50/blue-700, EXPANDED (`data-[state=open]:hover:`) =
   sidebar-accent zinc-100/#18181B. The r19 audit probed the group only in
   its collapsed state — the expanded-state recipe was found this round by
   cascade (the drawer probe expanded a group mid-measurement).

## Verified non-gaps (documented, no action)

- **All plain buttons press flat on both sides** (no `active:` classes on
  either app): bell, moon, عربي, user trigger, quick chips, View all,
  Import CSV, Generate All, New Project, Kanban toggle, settings Edit,
  My Requests trigger, menu items (My Profile + Logout — the pressed state
  rides the focus:bg-accent recipe; the red Logout text turns #171717 under
  press on BOTH apps), login Sign in/socials/forgot/signup, mobile
  hamburger (rides hover; REF authors no active: classes), inactive bottom
  tabs.
- **Add Employee CTA press**: gradient endpoints identical on both sides;
  only the `to right` vs `90deg` serialization + REF's invisible
  rgba(23,23,23,0.9) bg-color under its opaque gradient differ (the
  documented R19 families).
- **Kanban toggle press**: rgba vs lab() serialization of the same
  #171717@0.9 (documented color-space family).
- **Button-level inherited colors** (REF bell/user-trigger buttons compute
  zinc-700 at the button level; the clone #0A0A0A): invisible — the icons
  and name spans own their colors (R19-C/D verified).
- **Touch sticky-hover** (REF's v3 hover styles stay applied after a tap;
  the clone's v4 media-wrapped ones don't): the documented engine
  difference — NOT cloned. Where REF AUTHORS active: classes the clone now
  mirrors them (the authored recipe restores the tap-press moment).
- REF's `[data-vaul-handle]:active` (drawer library internals) and the
  unused v4 registry rules: dormant CSS, no parity surface.

## Gap groups (5)

- **R20-A (group button PRESSED state — visible)**: REF's collapsed group
  button pressed = **zinc-100 #F4F4F5 + #18181B** (its
  `active:bg-sidebar-accent active:text-sidebar-accent-foreground` beat its
  `hover:bg-blue-50` in v3 rule order — measured settled under hold). The
  clone's pressed state stays blue-50/blue-700. Fix
  `src/components/layout/sidebar-nav.tsx` (Collapsible.Trigger className):
  add `active:bg-[#f4f4f5] active:text-[#18181b]`. v4 orders active: after
  hover: in the utilities output, so the pressed state turns gray — the
  live probe verifies the cascade empirically.
- **R20-B (active bottom tab blue-50 pill — visible, user-priority
  surface)**: REF's active mobile bottom tab carries `bg-blue-50`
  (classList + computed rgb(239,246,255) + PIXEL-verified in screenshots:
  a light-blue chip behind Home vs the clone's white bar — missed by every
  prior round because the mobile audits compared label color and geometry
  but never the tab's own background). Fix
  `src/components/layout/app-shell.tsx` bottom-tab active branch:
  `active ? "bg-blue-50 text-blue-600" : "text-slate-600"`. Update the
  R19-K unit pin; extend the session-5 E2E active-tab test with the bg pin.
- **R20-C (inactive leaf + sub-item active: recipe — authored-recipe
  parity + touch-press)**: REF authors
  `active:bg-sidebar-accent active:text-sidebar-accent-foreground` on ALL
  sidebar links (classList-verified on leaf, sub-item, active leaf, group).
  Desktop-pressed already matches visually (the hover pins carry identical
  values); the classes restore the authored taxonomy and the tap-press
  moment on touch (tap = :active without :hover; REF's unwrapped v3 hover
  styles still fire on tap, the clone's media-wrapped ones don't — the
  active: classes close the press-instant gap; the post-tap sticky state
  remains the documented engine difference). Fix both inactive branches in
  `sidebar-nav.tsx` (NavLink + sub-item): add
  `active:bg-[#f4f4f5] active:text-[#18181b]`.
- **R20-D (active leaf active:text — with a documented deviation)**: REF's
  active leaf carries the full active: pair, but its bg STAYS blue under
  press because REF's custom-primary-bg is an unlayered custom class that
  beats both hover: and active: utilities. The clone's `bg-primary` is a
  v4 UTILITY — an `active:bg-[#f4f4f5]` variant would win the specificity
  fight ((0,2,0) vs (0,1,0)) and wrongly turn the pressed tile gray. The
  clone therefore adds ONLY `active:text-[#18181b]` (REF's measured
  pressed text = #18181B while the bg stays #1877F2). Deviation documented
  in the code comment. Fix both active branches in `sidebar-nav.tsx`.
- **R20-E (expanded group hover recipe — visible)**: REF's group button
  carries `data-[state=open]:hover:bg-sidebar-accent
  data-[state=open]:hover:text-sidebar-accent-foreground` — the EXPANDED
  group hovers GRAY (zinc-100 + #18181B, measured with the group open),
  not blue. The clone's expanded group still hovers blue-50/blue-700. Fix
  the Collapsible.Trigger className: add
  `data-[state=open]:hover:bg-[#f4f4f5] data-[state=open]:hover:text-[#18181b]`
  (the stacked variant's (0,3,0) specificity beats the collapsed hover's
  (0,2,0) — v4 supports the stack natively).

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-21 block):
   - group trigger asserts `active:bg-[#f4f4f5] active:text-[#18181b]` AND
     `data-[state=open]:hover:bg-[#f4f4f5] data-[state=open]:hover:text-[#18181b]`
   - inactive leaf + sub-item assert `active:bg-[#f4f4f5] active:text-[#18181b]`
   - active branches assert `hover:text-[#18181b] active:text-[#18181b]` and
     NOT `active:bg-`
   - app-shell bottom tab asserts `active ? "bg-blue-50 text-blue-600"`
   - UPDATE the stale R19-K pin (`active ? "text-blue-600"` → the new form)
   - E2E: extend the session-5 active-tab test with
     `background-color: rgb(239, 246, 255)`
2. GREEN: the 5 code edits (sidebar-nav.tsx × 4 sites, app-shell.tsx × 1).
3. Gates: lint → typecheck → unit → build → E2E (86).
4. Live dual-browser verification (hover polyfill on LOC): re-press every
   fixed surface — expect group pressed zinc-100/#18181B, expanded-group
   hover zinc-100/#18181B, leaf/sub-item pressed zinc-100/#18181B/0.8,
   active leaf pressed blue bg + #18181B text, active bottom tab bg
   rgb(239,246,255) at rest. Post-fix regression: canonical 12-route sweep
   + mobile chrome regression + the pressed-state re-audit of the
   previously-matching surfaces (spot-check bell/chips/CTAs).
5. Screenshots: pressed-state evidence (group button held, expanded-group
   hover, active bottom tab pill) + standards refresh → docs/screenshots/.
6. Docs: AGENTS session-21 layer, SKILL §33, PAD [S21], CLAUDE/README
   counts, session log, worklog, this plan's completion record.

## Documented non-goals / supersets kept

- The touch sticky-hover engine difference (post-tap state) is NOT cloned.
- The active-leaf active:bg omission (v4 layer semantics) is a documented
  deviation from REF's authored pair — visual parity preserved.
- Gradient/rgba-lab serializations and REF's invisible CTA hover bg-color
  stay un-cloned (byte-invisible, R19 families).
- The unused v4 registry active: rules stay (generated CSS, not authored).

## Completion record (session 21)

All five gap groups executed TDD-first (5 new pins in
tests/unit/recipes.test.ts, all RED before implementation → GREEN; the
R19-B/R19-K pins updated for the new forms; the E2E session-5 active-tab
test extended with the pill assertions):

- **R20-A**: the group trigger carries `active:bg-[#f4f4f5]
  active:text-[#18181b]` — pressed verified zinc-100 rgb(244,244,245) +
  rgb(24,24,27) byte-exact under hold (polyfill v2; on real desktops the
  v4 utilities order — active: after hover: — decides it).
- **R20-E**: the same trigger carries `data-[state=open]:hover:bg-[#f4f4f5]
  data-[state=open]:hover:text-[#18181b]` — the expanded group hovers
  gray, verified at hover AND press.
- **R20-C**: both inactive branches (leaf + sub-item) add the authored
  `active:bg-[#f4f4f5] active:text-[#18181b]` pair — pressed verified
  zinc-100/#18181B/0.8 (hover rides the same values on desktop; the
  classes restore the tap-press moment on touch).
- **R20-D**: both active branches add `active:text-[#18181b]` ONLY —
  pressed verified blue #1877F2 bg + rgb(24,24,27) text. The active:bg
  omission is the documented v4 deviation (REF's unlayered
  custom-primary-bg keeps blue; the clone's bg-primary utility would
  lose to an active:bg variant).
- **R20-B**: the active bottom tab renders `bg-blue-50` — verified
  rgb(239,246,255) + rgb(37,99,235) at rest on both apps (pixel-verified
  in the captures; VLM-confirmed). E2E-pinned.

Gates: lint 0/0 · tsc · 391/391 unit (+5) · build · 86/86 E2E. Live
verification 7/7 MATCH (incl. the bell regression check). Post-fix
regression sweeps: canonical 12-route 12/12 MATCH + mobile chrome clean —
zero layout impact. 5 screenshots (3 evidence + 2 standards) → 83 total.
DB pristine (users=1, employees=1, leaveBalances=2, payroll=0,
expenses=0).
