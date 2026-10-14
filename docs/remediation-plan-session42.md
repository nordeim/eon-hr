# Remediation Plan — Session 42 / Parity Round 41

**Window**: session-42 audit (this document) · parity round 41
**Predecessor**: `docs/remediation-plan-session41.md` (round 40, delivered at `ccb8a46`)
**Baseline verified before census**: lint 0/0 · tsc ✓ · 636/636 unit · build ✓ (the workspace persisted this window — no reset; the standalone build at `22:25` postdates every round-40 code change, `git diff ccb8a46..HEAD -- src/ prisma/ tests/` empty)

## Census summary

- **Redeploy watch: QUIET** — the first quiet watch in five rounds. All four
  fingerprints unchanged from the round-40 state (login JS `index-C-ulo5ek.js`,
  login CSS `index-BIWjBcok.css`, app JS `index-C-IrDy5f.js`, app CSS
  `index-BGNH4KkS.css`). The frontier therefore came from the standing list:
  the session-38 named remainder — **the keyboard/focus flows in the
  popovers/menus** (round 37 walked the DIALOGS; the menu family never).
- **Standing audits 5/5 MATCH** (mobile tabs, drawer, navmap, bell popover,
  Quick Actions — the post-restructure toggle selector). **Route sweep 12/12
  MATCH**. REF still zero-data on the app tenant. The bottom tabs + the
  hamburger toggle re-verified byte-identical (a truncation artifact in the
  first tab-class read was ruled out by the full-string re-read).
- **The focus-walk results** (the round's instrument: open → initial focus →
  Tab/Arrow sequence → Escape → restore, both apps):
  - **The bell Popover**: structurally IDENTICAL — the content renders
    `div role=dialog` 384×175 @ (0,617) both sides; focus lands on the content
    div and stays trapped through Tab ×8; Escape restores the trigger with
    `aria-expanded=false`. The only diffs: the transient hover-bg probe
    artifact and the clone's aria-label superset.
  - **The user DropdownMenu**: the walk IDENTICAL (menu 192×74 @ (47,770);
    focus0 = the `div role=menu`; ArrowDown → My Profile → Logout; ArrowUp
    reverses; Home/End jump; Escape restores the trigger) — but a DOM gap
    below (finding C).
  - **The employees status select** (a NATIVE `<select>` on REF — the only
    one in the app): the focus recipe + defaults + bg diverge (finding D).
  - **The whole-shell Tab sweep** (36 focuses on /dashboard): the sidebar
    family renders the IDENTICAL visible ring `rgb(59,130,246) 0 0 0 2px`
    (blue-500 sidebar-ring) on every leaf/group/link both sides; the content
    links render browser-default outlines on BOTH; REF's platform "Close
    badge" (the base44 builder widget, 18px bottom-right) is the one extra
    tabbable element — documented non-clone.
- **The mobile drawer focus**: both sides focus the Employees group toggle on
  open — REF's carries `data-sidebar="menu-button"`, the clone's carries no
  data-sidebar attribute → the structural finding (E).

## Findings (all live-measured this round)

### A. The footer ghost family's v4 Button base + focus rendering

The four footer controls are hand-rolled on the clone; REF's carry the full
v4 Button base. The keyboard-focus rendering is a REAL gap: REF rings every
footer control (`rgb(10,10,10) 0 0 0 1px` — ring-1 ring-ring #0A0A0A, the
outline suppressed via the v3 transparent form); the clone's bell/moon/عربي
render the browser-default auto outline with NO authored focus styles.

- **R41-A1 — the bell**: REF's full string `inline-flex items-center
  justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium
  transition-colors focus-visible:outline-none focus-visible:ring-1
  focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50
  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent
  hover:text-accent-foreground h-9 w-9 relative` (the `relative` positions a
  future unread badge — no absolute child on zero data). The svg: `w-5 h-5
  text-slate-600` (the base's `[&_svg]:size-4` overrides the authored w-5 —
  renders 16px). The clone's: hand-rolled minimal, no focus members.
- **R41-A2 — the moon**: REF's = the same base + `hover:bg-accent
  hover:text-accent-foreground h-9 w-9 select-none`; the color is INHERITED
  (no class on button or svg — the sidebar-foreground token: zinc-700
  #3F3F46 light / zinc-100 #F4F4F5 dark, live-measured on the ancestor
  chain). The clone's authors `text-zinc-700 dark:text-zinc-100` on the
  button. NOTE: the clone's light `--sidebar-foreground` is
  `hsl(221 39% 11%)` (#1E293B slate-800) — WRONG vs REF's
  `240 5.3% 26.1%` (#3F3F46); fix the token (its only consumer is the
  r39 peer wrapper; every child authors its own color — inert-safe).
- **R41-A3 — عربي**: REF's `justify-center whitespace-nowrap
  transition-colors focus-visible:outline-none focus-visible:ring-1
  focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50
  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border
  bg-background shadow-sm hover:text-accent-foreground h-8 rounded-md px-3
  text-xs flex items-center gap-1.5 font-semibold text-slate-700
  border-slate-300 hover:bg-slate-100 min-w-[64px]` (svg `w-4 h-4`). The
  clone's is the semantic equivalent missing whitespace-nowrap + the
  focus/disabled/svg members.
- **R41-A4 — the user trigger**: REF's `inline-flex items-center
  whitespace-nowrap rounded-md text-sm font-medium transition-colors
  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
  disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none
  [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-9 px-4 py-2
  w-full justify-start gap-3 hover:bg-slate-100`. The clone's carries a
  stray `outline-none` + lacks the disabled/svg members. (This one already
  renders the correct ring — the string adoption completes the parity.)

### B. The moon's conditional icon render

REF renders ONE state-driven svg — the moon in light, the sun in dark
(`lucide-moon w-5 h-5` / `lucide-sun w-5 h-5`, no color class, live-measured
in both themes). The clone renders BOTH svgs with the r32 class-driven pair
(`dark:hidden` / `hidden dark:block`). Rendered parity holds in both themes;
the DOM carries an extra hidden svg. Switch to the conditional single-icon
render keyed on the same `dark` state that already drives the aria-label.

### C. The user-menu items are plain Radix divs on REF

REF's items: `div role=menuitem`, 182×32 each (full-row stretch), the pinned
R35-A4 recipe (cursor-default + rounded-sm). The clone's `asChild` wrapping
surfaces the underlying tags — My Profile an `<a>` (182 ✓ stretches) but
Logout a `<button>` that SHRINKS to 96px: the keyboard/hover highlight pill
covers only 96px of the 182px row. Fix: drop `asChild`, render plain
`DropdownMenu.Item` divs; My Profile navigates via `onSelect` +
`router.push("/profile")` (REF's own item is a div-click navigation to its
capitalized /Profile); Logout keeps the anti-prefetch contract via `onSelect`
+ `window.location.href = "/logout"` (the R35-A6 pin's intent — no Link, no
prefetch — survives; the pin's tag claim amends to the plain item).

### D. The employees filter row (four independent gaps)

- **R41-D1 — the search input**: REF's input tail is `pl-10 w-full md:w-64`
  (FIXED 256px at md+; re-measured 256 at both 1440 and 768) with the
  wrapper `relative flex-1 md:flex-none`. The clone's `md:max-w-64` +
  `md:flex-initial` renders 228px at 1440 (the intrinsic basis fell short
  after the round-39 v4 input migration) — the select starts x=541 vs REF's
  569. Amend the r17 arrangement (its "keeps the 256px render" premise
  silently broke); drop the redundant page-level `bg-transparent` (the v4
  base carries it).
- **R41-D2 — the select's default value**: REF defaults to "active"
  (live-measured on three independent fresh loads); the clone defaults to
  "all". Both filter an empty list to nothing on zero data, but the
  displayed value differs.
- **R41-D3 — the select's background — a Tailwind v4 engine trap**: v4's
  preflight resets `select { background-color: transparent }`; v3's (REF's
  build) does not — REF's select keeps the UA `buttonface` fill
  rgb(239,239,239) (#EFEFEF), the clone's renders transparent (the page
  gradient shows through). Fix: author `bg-[buttonface]` — the system-color
  keyword tracks the browser theme exactly like the UA default (robust, not
  a hex pin).
- **R41-D4 — the select's focus recipe**: REF `focus:outline-none
  focus:ring-2 focus:ring-blue-500` (a 2px blue-500 ring under focus); the
  clone `focus:ring-1 focus:ring-ring`.
- **R41-D5 — the select's authored string**: REF `px-3 py-2 border
  border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2
  focus:ring-blue-500` (no h-9 — py-2 intrinsic 36px). Adopt REF's order.

### E. The shadcn Sidebar data-sidebar family (additive DOM parity)

REF's shell carries the component's full attribute map (live-counted):
`trigger` 1 · `sidebar` 1 · `header` 1 · `content` 1 · `group` 1 ·
`group-label` 1 · `group-content` 1 · `menu` 1 · `menu-button` 13 (the 5
standalone links + the 8 group toggles) · `menu-item` 5 (li
`group/menu-item relative` wrapping ONLY the standalone links — the group
toggles sit bare in the ul) · `footer` 1. The clone carries only `sidebar` +
`trigger` (the two the r39 restructure adopted for its own selectors).
Mapping onto the clone's rendered-identical tree: header → the brand block;
content → the nav scroller; a NEW layout-neutral group wrapper (no padding —
the clone's px-5 nav padding stays) around [group-label (the "Main Menu"
div), group-content (NEW wrapper) > menu (the ul)]; menu-item on the 5
standalone-link lis ONLY (the toggle lis drop — bare Collapsible.Trigger
buttons like REF; the ul's flex gap-1 spacing is unchanged); menu-button on
all 13 top-level buttons; footer → the footer block. The nav buttons' class
recipes stay as-authored (their rendered contract is pinned by 20+ rounds of
audits — the rings re-verified byte-identical this round).

### Documented non-gaps (no action)

- The v3/v4 outline-none serialization (REF `solid 2px` transparent vs the
  clone `none` — the two-build split; the visible ring renders identically).
- The ring box-shadow serialization (REF's 3-shadow v3 form vs the clone's
  5-shadow v4 form with leading transparent zeros — renders identical).
- REF's platform "Close badge" (the base44 builder widget — non-cloneable
  platform chrome; the round-38 mobile pixel-diff precedent).
- The clone's a11y supersets (the bell's aria-label, the moon's aria-label,
  the select's aria-label, the search's aria-label, the toggle's sr-only
  span).
- The content links' browser-default focus outlines (both sides render the
  default — REF authors nothing there either).
- The bottom tabs' class order (tw-merge reordering — renders identical).
- REF's capitalized /Profile path artifact.
- The عربي svg `w-4 h-4` (16px — same render both sides).

## TDD execution plan

1. **RED**: append the session-42 pin block to `tests/unit/recipes.test.ts`
   (~14 pins: A1–A4 the four footer strings, B1 the conditional moon,
   C1 the plain menu items, D1–D5 the employees row, E1 the data-sidebar
   family, T1 the sidebar-foreground token) + amend the three predecessors
   (R15-B's bell/moon regexes, R19-C/C2's footer strings, R35-A6's tag
   claim).
2. **GREEN** (order):
   a. The footer family (A1–A4, B) — sidebar-nav.tsx + the
      `--sidebar-foreground` token fix in globals.css.
   b. The user-menu items (C) — plain DropdownMenu.Item + onSelect
      navigation.
   c. The employees row (D) — the page's filter bar.
   d. The data-sidebar family (E) — sidebar-nav.tsx structure.
3. **E2E**: add the session-42 spec (the footer focus rendering — the
   keyboard-focused bell computes a ring box-shadow; the user-menu item
   stretch — the Logout row ≈182px; the employees row — search 256, select
   x=569, default "Active", bg rgb(239,239,239); the data-sidebar counts).
4. **Gates**: lint → tsc → unit → build → E2E, all green.
5. **Live verification**: verify-r41 script (the four footer strings + focus
   renders, the moon single-svg both themes, the menu item widths, the
   employees row geometry, the attribute counts) + the standing audits +
   screenshots (docs/screenshots/ 160-163) + DB pristine check.
6. **Docs**: AGENTS session-42 layer, SKILL 3.25.0 + §54, PAD [S42],
   CLAUDE/README counts, docs/session_85.md, this plan's completion record,
   worklog entry. Commit + SSH-wrapper push (main only).

## Risks & mitigations

- **The footer rewrites touch the hover pins** (R19-C/C2, R15-B): the hover
  pairs + the icon colors survive verbatim inside the new strings — the
  amended pins assert them on the new strings.
- **The moon's inheritance switch**: gated on the sidebar-foreground token
  fix (light 240 5.3% 26.1%); the token's only consumer is the peer wrapper
  (every child authors colors) — verified inert-safe before the switch.
- **The menu-item restructure (dropping the toggle lis)**: the ul's flex
  gap-1 spacing is between the same visual items either way; the navmap
  audit + the E2E sidebar specs re-verify post-change.
- **The select's bg-[buttonface]**: an unusual authored value — pinned as a
  computed-color E2E assertion (rgb(239,239,239)) rather than a class-string
  match, so a future Tailwind change to arbitrary-value handling gets
  caught.
- **The search width change (228→256)**: the r17 mid-viewport fitting
  premise retires (REF renders 256 fixed at 768 too — re-measured); the
  md-boundary E2E re-verifies.

## Completion record (session-42, executed this window)

Executed end to end this window against the live census above.

**TDD**: 12 RED (the session-42 pin block) → **648/648 unit GREEN**
(+12). Six predecessors amended (R15-B, R19-C/C2, R32-A5, R35-A5,
R35-A6 + the R8-E shell pin). The comments-in-source trap fired twice
in GREEN (a stale comment quoting the retired dark-hidden pair; the
new menu comment quoting the forbidden logout href) — both reworded
per the standing lesson.

**Gates**: lint 0/0 · tsc ✓ · 648/648 unit (+12) · build ✓ · 185/185
E2E (+5: the session42-footer-focus spec — the Tab-walked focus
rings on the three ghosts, the single-glyph moon, the 182px div
items, the employees row + the buttonface + the blue-500 focus pair,
the data-sidebar counts). One input-family tolerance flake in the
first full run — stable on the single-spec re-run AND the full
re-run. The dark-mode swap spec amended to the conditional render.

**Live verification** (verify-r41.mjs): 5/6 raw MATCH — the footer
family (svg classes + rendered sizes/colors, incl. the authored
w-5 h-5 glyphs overridden to 16px by the base guard — the avatar
glyph aligned mid-verify after the first pass caught it); the
user-menu items (div role=menuitem, 182×32 both); the employees row
(searchW 256, selectX 569, h 36, value "active", bg
rgb(239,239,239)); the data-sidebar attribute map (13 menu-buttons,
5 menu-items, the full container family); the dark-mode moon (the
single sun glyph + the inherited #F4F4F5 through the fixed token).
The 1 documented diff: the focus-walk probe's break condition keys
on the bell's aria-label — REF's bell has none (the clone's a11y
superset), so the sequences start at different elements; every read
on BOTH sides renders the ring, and the outline solid/none split is
the documented two-build non-gap. The standing audits 5/5
post-change (one transient REF-drawer toggle-race, clean on the
re-run). 8 screenshots (160-163) → 228 captures. DB pristine
(users=1, employees=1, leaveBalances=2).

**Docs**: AGENTS session-42 layer + the Commands-table counts, SKILL
3.25.0 + §54, PAD [S42], CLAUDE/README counts (the 833-spec
pyramid), docs/session_85.md, this completion record, the worklog
entry.
