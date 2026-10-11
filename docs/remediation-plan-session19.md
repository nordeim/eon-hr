# Remediation Plan — Session 19 / Parity Round 18

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app)
interaction-parity audit — the NEW dimension suggested by session_28 as the
geometry map saturates: **keyboard traversal order + focus-visible ring
styles** (real Tab presses via agent-browser, full computed outline +
box-shadow dumps) — plus the **first sub-390 band sweep** (320/344/360/389 ×
10 representative routes). Redeploy check PASSED (12 probe routes
byte-identical — REF unchanged since round 17). Mobile navigation audited
end-to-end per the standing user priority (top bar 390×73, tabs
10/79/139/204/313 + active rgb(37,99,235), drawer 288×844 #FAFAFA z-50 with
links 141/301/421/461/581 + footer 121@723 — both drawers opened via a
geometry-located hamburger click, the r17 aria-label lesson), kickers
(standard 53px + the profile 69px variant with back button + subtitle), md
boundary 767/800 — **all byte-identical, no Tailwind v4 bug**.

**Tab traversal ORDER is byte-identical** on every swept surface
(/dashboard desktop 12 stops, mobile 10, /login 8, /employees 10 — same
elements, same sequence, same x/y). The gaps are all in the focus-ring
STYLES — seven recipe groups, measured with full-string computed dumps.

## The reference's focus-ring taxonomy (measured this round)

| Surface | REF recipe | Rendered |
|---|---|---|
| Button (all variants — hamburger, عربي, user, Import CSV, Add Employee, Edit) + Select triggers | `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring` | **1px #0A0A0A ring, no offset** |
| Sidebar leaf links + group buttons + sub-items | `ring-sidebar-ring focus-visible:ring-2` | **2px #3B82F6 (blue-500)** — `--sidebar-ring: 217.2 91.2% 59.8%` |
| Radix tab triggers (/settings Company) | `ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` | white 2px + **2px #0A0A0A** (4px total) |
| Inputs (login email/password) | base ring-2 ring-ring **offset-2** + page `focus:border-slate-400 focus:ring-slate-400` | white 2px + **2px slate-400** |
| Login page scope | `--ring: 240 10% 3.9%` = **zinc-950 #09090B** (page-local; global = `0 0% 3.9%` #0A0A0A) | Sign in ring = **#09090B** |
| Switches (/notificationpreferences) | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` | white 2px + 2px #0A0A0A — **clone already matches** |
| Bottom tabs, quick-action links, "View all" links, login socials | NO custom focus classes | browser-default `auto 1px` outline — **clone matches** |

## Verified non-gaps (documented, no action)

- **Tab order**: byte-identical everywhere swept (the strongest result of
  the dimension — DOM order and focusability match).
- **Switch recipe**: clone renders `ring-2 ring-ring ring-offset-2`
  (white 2 + #0A0A0A 2 + shadow) — byte-identical visible layers.
- **Browser-default outlines**: bottom tabs, quick actions, links, socials
  render `auto 1px` on BOTH apps. REF serializes the auto color
  `rgba(10,10,10,0.5)`, the clone `lab(2.74175 0 …/0.5)` — the SAME dark
  50% color in different color spaces (Chrome derives it differently per
  app's color serialization); visually identical. Browser-auto-serialization
  family.
- **REF's settings Company card is a focusable div** (an extra tab stop
  carrying the tab-trigger ring). The clone's card is not focusable —
  keyboard users reach the Edit button directly (one fewer stop).
  Documented deviation (internal-DOM family); cloning tabindex on cards is
  not needed for visual parity.
- **Checkbox recipe**: no REF checkbox surface reachable in the swept
  zero-data pages — the clone keeps `ring-2` (unaudited subset, noted).
- **staffrequests:293** (local tab-trigger copy) already carries the full
  REF tab recipe (ring-2 offset-2); **employees:207** (native select
  superset) already carries ring-1.
- **Sub-390 band (320/344/360/389 × 10 routes)**: settled probes are
  byte-identical on dashboard/employees/staffrequests (kicker h1 = vw−64
  exactly both sides); every other diff is REF's own overflow family
  extended below 390 (attendance 943–1199, settings 1003–1259 pill,
  shiftcalendar 732–988, recruitmentkanban 1376–1632, documenttracker
  390–646, payroll 344@320, profile 539) where the clone fits or overflows
  less (attendance 487, settings 987 pill, profile 523, documenttracker
  348). Settle lesson: REF needs ≥5s at 344/389 (the 61px mid-hydration
  artifact family extends to odd sub-390 widths; 2.4s was not enough).

## Gap groups

- **R18-A (Button base focus recipe — systemic)**: clone
  `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1`
  (3px total) vs REF `focus-visible:ring-1 focus-visible:ring-ring` (1px,
  no offset). Fix `src/components/ui/button.tsx` base.
- **R18-B (Input/Textarea focus offset — systemic)**: clone
  `focus-visible:ring-offset-1` vs REF `focus-visible:ring-offset-2`
  (white 2px + ring 2px). Fix `src/components/ui/input.tsx` (Input +
  Textarea).
- **R18-C (Sidebar focus ring color)**: clone `focus-visible:ring-ring`
  (#0A0A0A) vs REF `focus-visible:ring-sidebar-ring` (**#3B82F6**) on
  leaf links, group buttons and sub-items (all three call sites in
  `src/components/layout/sidebar-nav.tsx`). Requires the new token
  `--color-sidebar-ring: #3b82f6` in `globals.css` (REF
  `--sidebar-ring: 217.2 91.2% 59.8%`, rendered rgb(59,130,246) —
  measured on leaf AND group buttons).
- **R18-D (Mobile hamburger focus styles)**: the clone's bare toggle
  button carries NO focus classes (renders the browser-default outline)
  vs REF's button recipe (1px #0A0A0A ring). Add
  `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`
  to the `app-shell.tsx` hamburger.
- **R18-E (Login page focus overrides)**: REF's login inputs carry
  `focus:border-slate-400 focus:ring-slate-400` (page-level, over the
  base) — the clone's lack them; and REF's Sign in renders a
  **zinc-950 #09090B** ring (the login page's local `--ring:
  240 10% 3.9%`) while the clone's renders slate-400. Fix: add the
  slate-400 focus pair to both login Inputs; swap the Sign in button's
  `focus-visible:ring-slate-400` → `focus-visible:ring-[#09090b]`
  (arbitrary value, the gradient-pin pattern).
- **R18-F (Select trigger focus recipe)**: clone
  `focus:outline-none focus:ring-2 focus:ring-ring` vs REF
  `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`
  (the button recipe; measured on /hrreports Department/Status triggers).
  Fix `src/components/ui/select.tsx`.
- **R18-G (TabsTrigger focus offset)**: clone
  `focus-visible:ring-2 focus-visible:ring-ring` (no offset) vs REF +
  `focus-visible:ring-offset-2` (4px total; measured /settings Company).
  Fix `src/components/ui/tabs.tsx`.

## Execution order (TDD)

1. RED pins: `tests/unit/recipes.test.ts` session-19 block — button base
   asserts `focus-visible:ring-1 focus-visible:ring-ring` and NOT
   ring-offset-1/ring-2; Input + Textarea assert `focus-visible:ring-offset-2`
   (not offset-1); the three sidebar-nav sites assert
   `focus-visible:ring-sidebar-ring`; `app-shell.tsx` hamburger asserts the
   ring-1 recipe; login inputs assert `focus:ring-slate-400
   focus:border-slate-400`; login Sign in asserts `ring-[#09090b]` (not
   ring-slate-400); select trigger asserts `focus-visible:ring-1`;
   TabsTrigger asserts `focus-visible:ring-offset-2`.
   `tests/unit/tokens.test.ts` — pin `--color-sidebar-ring: #3b82f6`.
2. GREEN: the seven code edits above (all shadow/border-color changes —
   zero layout impact; no geometry pins can regress).
3. Gates: lint → typecheck → unit → build → E2E (86).
4. Live dual-browser re-verification: re-run the keyboard audit (expect
   MATCH on every stop: buttons 1px dark, sidebar 2px blue, login inputs
   slate-400 4px, Sign in zinc-950, tabs 4px, hamburger 1px) + canonical
   1440 sweep re-run on the probe routes (layout must be unchanged) +
   mobile chrome regression.
5. Screenshots: focus-ring evidence captures (focused sidebar link with
   the blue ring, focused CTA with the 1px ring) + standards refresh →
   docs/screenshots/.
6. Docs: AGENTS session-19 layer, SKILL version + §, PAD [S19], CLAUDE/README
   counts, session log, worklog, this plan's completion record.

## Documented non-goals / supersets kept

- REF's focusable settings card (extra tab stop) is NOT cloned — the
  clone's keyboard path reaches Edit directly.
- The browser-auto outline serialization difference (rgba vs lab) is not
  "fixable" (Chrome derives it) and is visually identical.
- The clone's switch textContent carries the row label (REF's is empty) —
  accessible naming works on both; internal-DOM family.
- REF's sub-390 overflows are not cloned (fitting-superset doctrine); the
  clone's smaller overflows (attendance 487 / profile 523 / settings pill
  987 / documenttracker 348) stay — matching REF would mean cloning its
  bugs.
- Checkbox focus recipe stays ring-2 (no REF surface to measure).

## Completion record (session 19)

All seven gap groups executed TDD-first (10 new pins, all RED before
implementation: 9 recipe pins in tests/unit/recipes.test.ts + 1 token pin
in tests/unit/tokens.test.ts):

- **R18-A**: Button base now `focus-visible:outline-none
  focus-visible:ring-1 focus-visible:ring-ring` — verified byte-exact on
  Import CSV, Add Employee, hamburger, chevrons and the Shift Swaps
  anchor (rgb(10,10,10)@1px, no offset).
- **R18-B**: Input + Textarea `focus-visible:ring-offset-2` (2
  occurrences each file); login inputs render white 2px + ring 4px total.
- **R18-C**: `--color-sidebar-ring: #3b82f6` pinned in globals.css
  (token-pinned in tokens.test.ts); all three sidebar-nav call sites
  (leaf/group/sub-item) carry `focus-visible:ring-sidebar-ring`; verified
  rgb(59,130,246)@2px on the leaf AND the group button.
- **R18-D**: the mobile hamburger carries the button focus recipe.
- **R18-E**: login inputs carry `focus:border-slate-400
  focus-visible:ring-slate-400` (rendered white 2px + slate-400 2px,
  byte-exact); the Sign in ring is `focus-visible:ring-[#09090b]`
  (rendered white 2px + rgb(9,9,11) 2px, byte-exact). Mid-flight
  correction: the input override needed the SAME variant as the base —
  the bare `focus:ring-slate-400` lost the v4 cascade battle (rendered
  #0A0A0A); tailwind-merge dedups only within a variant. The
  same-variant lesson is pinned in the test comment.
- **R18-F**: the select trigger carries the button recipe; verified on
  the shiftcalendar All Departments trigger (rgb(10,10,10)@1px).
- **R18-G**: TabsTrigger + `focus-visible:ring-offset-2`; verified on the
  settings Company tab (white 2px + rgb(10,10,10) 4px).

Gates: lint 0/0 · tsc · 373/373 unit (+10) · build · 86/86 E2E. Live
dual-browser verification: every fixed surface byte-exact (full-string
computed dumps, visible layers identical; the clone's leading transparent
0-width layers are v4 ring-var serialization — invisible). Post-fix
regression sweeps: canonical 12-route 12/12 MATCH + mobile chrome
regression clean — zero layout impact (box-shadow-only changes). 8
screenshots (4 new focus-ring evidence + 4 standards) → 75 total. DB
pristine (users=1, employees=1, leaveBalances=2, payroll=0, expenses=0).
