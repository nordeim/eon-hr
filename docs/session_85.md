# Session 85 — eon-hr parity round 41 (the footer focus family + the native select)

*The redeploy watch went quiet for the first time in five rounds —
every fingerprint unchanged — so the frontier came from the standing
list: the session-38 named remainder, the keyboard/focus flows in the
popovers and menus. The walks came back structurally identical almost
everywhere; the gaps were hiding on the surfaces BEYOND the sidebar,
where hand-rolled buttons had never carried the v4 base — and in one
native select whose background v4's preflight silently resets.*

## The opening state

**REDEPLOY WATCH: QUIET** — login JS `index-C-ulo5ek.js`, login CSS
`index-BIWjBcok.css`, app JS `index-C-IrDy5f.js`, app CSS
`index-BGNH4KkS.css`: all four identical to the round-40 records. The
first silent watch since the streak began at round 37. The standing
audits opened 5/5 (one transient toggle-race on the REF drawer,
clean on the re-run); the route sweep 12/12; the baseline gates all
green on the persisted workspace (636/636 unit, no reset needed —
`git diff ccb8a46..HEAD` over src/prisma/tests empty).

## The census — the focus dimension on the menu family

The instrument (built on round 37's dialog pattern): open the surface
on both apps, record the activeElement, walk Tab or Arrow ×N reading
focus each press, then Escape and read the restore target.

- **The bell Popover**: MATCH end to end — the content renders
  `div role=dialog` at 384×175 (0,617) on both sides; focus lands ON
  the content div and stays trapped through Tab ×8 (the zero-state
  interior has no tabbable children); Escape restores the trigger
  with aria-expanded=false. The clone's failed-login Alert sibling
  (round 40) had already closed this family's dialog semantics.
- **The user DropdownMenu**: the walk MATCHES — focus0 = the
  `div role=menu`; ArrowDown walks My Profile → Logout; a third press
  stays on the last item; ArrowUp reverses; Home/End jump to the
  ends; Escape restores the trigger. But the item DIVs told a
  different story (finding C below).
- **The whole-shell Tab sweep** (36 focuses on /dashboard): every
  sidebar element — leaves, group toggles, the standalone links —
  renders the IDENTICAL visible ring `rgb(59,130,246) 0 0 0 2px`
  (blue-500 sidebar-ring) on both sides; the Dashboard link's
  shadow-sm rides identically; the content links render
  browser-default outlines on BOTH apps (REF authors nothing there
  either); REF's platform "Close badge" (the base44 builder widget,
  18px at the bottom-right) is the one extra tabbable element — the
  documented non-clone.
- **The footer cluster**: REF rings every control
  (`rgb(10,10,10) 0 0 0 1px` — ring-1 ring-ring, the outline
  suppressed through the v3 transparent form); the clone's bell,
  moon, and عربي rendered the BROWSER-DEFAULT auto outline — no
  authored focus styles at all. The round's core had surfaced.

## The findings (docs/remediation-plan-session42.md)

1. **R41-A — the footer ghost family's v4 Button base.** REF's bell,
   moon, عربي, and user-trigger all carry the full base string
   (`inline-flex gap-2 whitespace-nowrap text-sm font-medium
   transition-colors` + the focus-visible ring-1 pair + the disabled
   pair + the `[&_svg]` guards) with their variant tails. The clone's
   hand-rolled twins matched the hover pairs and the geometry (36×36,
   the audits had pinned those) but dropped every focus member. All
   four strings adopted verbatim — the bell gaining `relative` (the
   unread-badge positioning context), the moon `select-none`, عربي
   the outline-variant order, the trigger the disabled/svg guards
   (its ring already rendered — a stray `outline-none` retired).
   REF's svgs author `w-5 h-5` — the base's `[&_svg]:size-4` guard
   overrides them to 16px, so the authored sizes only match after the
   base lands (the avatar glyph aligned the same way).
2. **R41-B — the moon's conditional glyph.** REF renders ONE
   state-driven svg per theme — the moon in light, the sun in dark,
   verified live in both directions — with NO color class anywhere:
   the color inherits the peer wrapper's `text-sidebar-foreground`.
   The clone's r32 two-svg dark-hidden pair rendered identically but
   carried a hidden extra node; it switched to the conditional
   render. The dark-mode spec's swap test amended with it.
3. **R41-T — the sidebar-foreground token.** The inheritance switch
   forced the token question: the clone's light value was the
   app-foreground slate-800 (`hsl(221 39% 11%)`); REF's
   documentElement reads `240 5.3% 26.1%` — the shadcn zinc-700. The
   moon renders #3F3F46/#F4F4F5 through the fixed token (measured
   both themes both apps); the token's only other consumer is the
   peer wrapper itself (every child authors colors — inert-safe).
4. **R41-C — the user-menu items are plain Radix divs.** REF's items
   stretch the full 182px row; the clone's `asChild`-wrapped Link and
   Button surfaced their own tags, and the Logout BUTTON rendered
   96px — the keyboard/hover highlight pill covered barely half the
   row. Plain `DropdownMenu.Item` divs now: My Profile navigates via
   onSelect + router.push (REF's own item is a div-click navigation),
   Logout keeps the anti-prefetch contract via onSelect +
   `window.location.href` — the R35-A6 lesson restated: the HANDLER
   is the contract, not the tag.
5. **R41-D — the employees filter row**, four independent gaps: the
   search is FIXED at `md:w-64` with a `md:flex-none` wrapper (REF
   re-measured 256px at 1440 AND 768 — the r17 flex-initial/max-w-64
   arrangement had silently rendered 228 since the round-39 input
   migration changed the intrinsic basis, leaving the select at x=541
   vs REF's 569); the select DEFAULTS to "active" (three fresh
   loads); its background is the UA `buttonface` — **the round's
   Tailwind v4 engine trap**: v4's preflight resets native select
   backgrounds to transparent while v3's (REF's build) does not, so
   REF keeps the OS gray rgb(239,239,239) — restored via
   `bg-[buttonface]`, the system keyword tracking the browser theme
   exactly like the UA default; and the focus recipe is
   `focus:ring-2 focus:ring-blue-500` (a 2px blue-500 ring on any
   focus — page-specific, not the global token) in REF's authored
   py-2 order with no h-9.
6. **R41-E — the shadcn Sidebar data-sidebar family.** The
   drawer-focus probe surfaced it: REF's group toggles carry
   `data-sidebar="menu-button"`. The full live-counted map — header,
   content, group, group-label, group-content, menu, menu-button ×13
   (the 5 standalone links + the 8 group toggles), menu-item ×5 (the
   standalone links ONLY, wrapped in `li.group/menu-item.relative` —
   the toggles sit BARE in the ul), footer — against the clone's two
   (sidebar + trigger, the r39 adoptions). All added to the
   rendered-identical tree with layout-neutral wrappers (the clone's
   px-5 nav rhythm keeps); the toggle lis dropped. The nav buttons'
   class recipes stay as-authored: attributes are the DOM contract;
   classes change only when the RENDER diverges (the rings
   re-verified byte-identical).

## The delivery

TDD: 12 RED (the session-42 block: A1-A4, B1, C1, D1-D4/D5, E1, T1)
→ **648/648 unit GREEN** (+12). Six predecessor pins amended (R15-B's
bell/moon regexes, R19-C/C2's footer strings, R32-A5's moon line,
R35-A5's w-first icon order, R35-A6's tag claim, and the R8-E shell
pin's filter row). The comments-in-source trap fired TWICE in GREEN —
a stale comment quoting the retired dark-hidden pair, and the new
menu comment quoting the forbidden logout href — both reworded
(the standing lesson: comments quoting class strings inflate).

The E2E: the session42-footer-focus spec (5 tests — the Tab-walked
focus rings on all three ghosts, the single-glyph moon, the 182px
div items, the employees row geometry + defaults + the buttonface
fill + the blue-500 focus pair, the data-sidebar counts) + the
dark-mode swap spec amended to the conditional render. One
input-family tolerance flake in the first full run — stable on the
single-spec re-run AND the full re-run.

**Gates**: lint 0/0 · tsc ✓ · **648/648 unit** (+12) · build ✓ ·
**185/185 E2E** (+5). Live: verify-r41 5/6 raw MATCH — the footer
family byte-identical (svg classes + rendered sizes + colors incl.
the authored w-5 h-5 glyphs at 16px), the menu items (div + 182×32),
the employees row (256/569/36/"active"/rgb(239,239,239)), the
data-sidebar map, and the dark-mode moon (the single sun glyph + the
inherited color). The one documented diff is the focus-walk probe's
own break condition — REF's bell carries no aria-label (the clone's
a11y superset), so the two sequences start at different elements;
every read on BOTH sides rings, and the outline solid/none split is
the documented two-build non-gap. The standing audits 5/5
post-change. 8 screenshots (160-163) → **228 PNG captures**. DB
pristine (users=1, employees=1, leaveBalances=2).

**Frontier after this round**: the redeploy watch stays armed (the
quiet round proves nothing more than no ship this week); the
with-data surfaces beyond careers stay blocked on REF's zero-data
app tenant; the app-side toast interior stays unfireable; the
keyboard/focus dimension's remaining surface is the SHIFT+Tab
reverse walk through the menus (never read) and the typeahead
behavior inside Select popovers (the employees select is native —
REF has no Radix Select left to walk on the measurable pages).
