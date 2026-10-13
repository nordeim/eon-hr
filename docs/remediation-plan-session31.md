# Remediation Plan — Session 31 / Parity Round 30

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app),
viewports pinned from the start (1440×900 desktop sweeps, 390×844 mobile
sweeps — the round-27/28 lesson). Standing audits first: **redeploy check
PASSED 12/12** (h1 text/font/x/y byte-identical — REF unchanged since round
29); **mobile navigation audit PASSED** (tabs x=10/79/139/204/313, kicker
y=101 h=28 fs=18px fw=700, drawer overlay 390×844 rgba(0,0,0,0.8) z-50 —
byte-identical, no Tailwind v4 bug); **with-data re-check**: REF still
renders zero data (0 rows on employees/payroll/leavemanagement/taskmanager —
frontier stays blocked, documented).

Baseline gates at HEAD `a491303`: lint 0/0 · tsc ✓ · 457/457 unit ·
build ✓ · 93/93 E2E — the exact pushed state. DB pristine (users=1,
employees=1, leaveBalances=2, payroll=0, expenseClaims=0, tasks=0,
candidates=0, jobs=0).

## The round's census — FOUR new probes (the round's finds)

1. **The sidebar collapse-boundary census** (desktop, /dashboard): the
   collapsed-state nav y-map (groups 141→621, footer 796/798/848), the
   expand boundary (Analytics leaves 577→829, next roots 865/905), and the
   re-collapse boundary — **byte-identical on both apps in all three
   states** (the round-29 fix is clean in both directions; no residual
   margin after re-collapse). Verified non-gap.
2. **The drawer expanded-state census** (mobile, 390×844): the open
   drawer's panel (288px, bg #fafafa) + its internal nav y-map in both
   collapsed and group-expanded states — groups 141→621, leaves 577→829,
   footer 740/742/792 — **byte-identical**. But the panel's BORDER
   contract is NOT: REF ships `border-right: 1px solid #e5e5e5` on the
   drawer panel; the clone ships none. A REAL at-rest visual gap (a 1px
   vertical line at the drawer's right edge, present on REF, absent on the
   clone — invisible to every prior audit because the standing mobile
   audit pins the OVERLAY, not the panel).
3. **The bottom-tab active-state route sweep** (mobile, 18 routes): the
   tab highlighting (Home/Staff/Tasks/Attendance/Profile) and the kicker
   text — **identical on all 18 routes** (verified non-gap; first full
   route→tab mapping sweep). Two kicker DIFFs found by the sweep were
   route-guess artifacts that LED to the real finds below.
4. **The orphan-route census** (desktop + mobile): REF serves a LEGACY
   page at `/assets` (kicker "Asset Management", h1 "Assets" 36px,
   subtitle "Track and manage company assets", an always-row header with
   the Add Asset button riding the badge row y=32, a green→blue canvas,
   and a card with a `bg-slate-50` header + "No assets yet" empty state +
   an Add Asset dialog) — the clone renders a **404** there. The sidebar
   links "Assets" → `/assetmanagement` on BOTH apps (the modern page —
   byte-identical). Also surfaced: the clone's `/hrassistantchat` empty
   states diverge from REF's measured contract (see R30-B).

## Gap groups

### R30-A — the drawer panel's right-border parity fix (REAL parity bug)

Add `border-r` to the drawer `DialogPrimitive.Content` className in
`src/components/layout/app-shell.tsx` (line 63). The width-1 border picks
up the default border color `#e5e5e5` (the `* { border-color }` base
layer — REF's measured `rgb(229,229,229)`, the clone's `--color-border:
#e5e5e5` — identical). The desktop sidebar keeps its own
`border-sidebar-border` (slate-200, both apps — verified this round);
REF's drawer and desktop sidebars use DIFFERENT border colors and so does
the clone after this fix. Panel width stays 288px (border-box).

### R30-B — the /hrassistantchat empty-state structure restoration (REAL parity bug, 4 sub-fixes)

REF's measured contract (1440×900, both panes byte-mapped this round):

- The LEFT card: `Card border-slate-200` natural height (NOT stretched —
  the clone's `flex min-h-0 flex-1` card fills the 650px column; REF's
  card hugs content, bottom at y≈362). Structure: `CardHeader`
  (`flex flex-col space-y-1.5 border-b border-slate-200 p-4`) holding the
  title "Active Chats" — 14px/600 #0a0a0a (`CardTitle` overridden
  `text-sm leading-[1.5]`, y=257 h=21) — then the body
  `p-2 space-y-1 max-h-96 overflow-y-auto` holding a plain
  `p.text-sm.text-muted-foreground` "No chats" (y=302, x=297). NO icon,
  NO centered EmptyState block (the clone's current H3 18px/600 +
  description at y=389 is wrong).
- The RIGHT pane: a bare `div.lg:col-span-3` wrapper containing
  `Card h-full border-slate-200` with `CardContent`
  (`p-6 pt-0 flex items-center justify-center h-full`) holding a
  `div.text-center` with a 64×64 `MessageSquare` `text-slate-300`
  (mb-4 wrapper, y=449) + a single `p.text-slate-500` "Select a chat or
  start a new one" (16px/400, y=529). NO h3 title, NO description — the
  clone's current EmptyState (H3 "Select a chat or start a new one" +
  description "Your HR assistant answers questions about leave, payroll,
  HR letters and company policy.") carries two extra text blocks REF
  does not render.
- The icon fingerprint: lucide `MessageSquare` (path
  `M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z`,
  stroke currentColor sw=2 — extracted from REF's live SVG).
- The header row / grid / New Chat button are already byte-identical
  (kicker y=40, h1 y=84, P y=136, button y=188) — untouched.

### R30-C — the /assets legacy orphan route (route-coverage parity)

REF serves a full page at `/assets` that the clone 404s. Replicate it
exactly (all geometry measured this round at 1440×900 + 390×844):

- `src/app/(app)/assets/page.tsx` — NEW client page:
  root `min-h-screen bg-[linear-gradient(to_right_bottom,#f0fdf4,#eff6ff)]
  p-4 md:p-8` (REF's `from-green-50 to-blue-50`, sRGB-pinned per trap 3);
  wrapper `mx-auto max-w-7xl space-y-8`.
- `PageHeader layout="flat36" actionsStart rowBreakpoint="sm"
  className="flex-row justify-between items-start"` — the always-row
  header REF renders even at 390px (measured: title block + button
  side-by-side at y=89 mobile / y=32 desktop button). section="Asset
  Management" (kicker y=40/pill y=32), title="Assets" (h1 y=84, 36px/700),
  subtitle="Track and manage company assets" (y=136, 18px). NO mobile
  kicker bar (REF renders the responsive header on mobile — h1 y=141 at
  390×844).
- Actions: the "Add Asset" primary button (y=32 x=1274 w=134 h=36,
  14px/500 white — the standard Button).
- The list card: `Card border-slate-200` (x=288 y=196 w=1120 desktop;
  x=16 y=281 mobile) with `CardHeader`
  (`flex flex-col space-y-1.5 p-6 border-b bg-slate-50` — the gray band,
  h=65) holding `CardTitle className="leading-none"` "Assets" (16px/600,
  h=16, y=221) + `CardContent p-0` holding the empty state
  `p-12 text-center` with `p.text-slate-500` "No assets yet" (16px/400,
  y=390 desktop).
- With data (unverifiable on REF — the with-data frontier): the card
  renders a `divide-y` asset list (name + type + serial + assignee +
  StatusBadge) — the functional superset on a REF-stub surface, same
  category as the organogram DnD.
- The Add Asset dialog (REF's field set, extracted from the live dialog):
  "Asset Name" input; "Type" select defaulting to Laptop with options
  Laptop/Desktop/Phone/Tablet/Monitor/Other; "Serial Number" input;
  "Assign To (Optional)" select (placeholder "Not assigned", a
  "Not Assigned" none-item + employee options); Cancel + Add Asset
  buttons. POSTs `/api/assets` (the existing route) and reloads the list.
- `src/app/api/assets/route.ts` — extend the `AssetInput` type enum with
  `desktop` + `tablet` (REF's legacy dialog offers them; the DB column is
  a free String; the modern page's filter list stays REF's contract).
- SEO: the route's metadata title "Assets" (the mechanical per-route head
  contract — round 25's pattern).

### R30-D — the drawer swipe-to-close (the mobile superset)

The instruction's mobile-menu focus + REF's vaul-flavored drawer
animation: add a horizontal swipe-to-close gesture to the mobile drawer
(`src/components/layout/app-shell.tsx`). Touch handlers on the Content:
`touchstart` records the start point; `touchmove` (horizontal-dominant
guard: |dx| > |dy|, dx < 0 only — leftward) live-translates the panel
(`style.transform = translateX(dx)`, transition suppressed during the
drag); `touchend` closes when past the threshold (96px — a third of the
288px panel) with the standard close animation, springs back below it.
Zero at-rest impact (no classes, no geometry change — the panel is
untouched until a gesture starts). Keyboard/overlay/X paths unchanged.

## Verified non-gaps (documented, no action)

- The sidebar collapsed/expand/re-collapse boundary census — byte-identical
  both directions (the round-29 fix holds: 865/905).
- The drawer's internal nav y-map (collapsed + expanded) — byte-identical.
- The bottom-tab active-state route mapping — 18/18 routes identical.
- /assetmanagement, /staffrequests, /training — byte-identical (full-text
  parity re-verified this round).
- /hrassistantchat header row (kicker/h1/subtitle/New Chat) —
  byte-identical.
- REF's "Toggle Sidebar" + 18×18 "Close badge" buttons — base44 builder
  artifacts (documented round 3, re-verified on /assets this round).
- LOC's footer buttons carry aria-labels REF's lack — the documented a11y
  superset (invisible at rest).
- REF's /employeeselfservice renders a permanently-stuck "Loading your
  profile..." (zero-data, no linked employee); the clone's full My Portal
  page (linked employee) + graceful no-profile state — the with-data
  frontier, blocked on REF, documented (NOT a parity target).

## Documented divergences (clone supersets / REF junk not replicated)

- The swipe-to-close gesture — an interaction-state superset on the mobile
  drawer (at-rest geometry unchanged).
- The /assets with-data list rendering — a superset on a REF-stub surface
  (REF is zero-data; the empty state is the byte-parity contract).
- The legacy dialog's type options include the modern page's full set +
  desktop/tablet (the API accepts both; the modern page's filter stays
  REF's contract).

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-31 block): R30-A1 (the
   drawer Content border-r), R30-B1 (the left card recipe: CardHeader p-4
   border-b border-slate-200 + text-sm title + p-2 max-h-96 body + the
   plain "No chats" P), R30-B2 (the right-pane empty recipe: h-full card +
   centered MessageSquare + the single P), R30-C1 (the /assets page
   recipe: flat36 + actionsStart + always-row + the green→blue canvas +
   bg-slate-50 card header + p-12 empty), R30-C2 (the legacy dialog
   fields incl. Desktop/Tablet + the /api/assets POST), R30-C3 (the API
   enum extension), R30-D1 (the swipe contract: touchstart/touchmove/
   touchend + threshold + horizontal-dominant guard).
2. GREEN: the app-shell border + swipe handlers; the chat page
   restructure; the new /assets page; the API enum.
3. E2E: `tests/e2e/legacy-assets.spec.ts` (the empty-state contract + the
   add-asset round-trip with cleanup), `tests/e2e/hr-assistant-chat.spec.ts`
   (the empty-state contract — the extra copy ABSENT),
   `tests/e2e/drawer-swipe.spec.ts` (CDP touch swipe closes the drawer;
   sub-threshold swipe springs back).
4. Gates: lint → typecheck → unit → build → E2E (restart :3200 after the
   build — the stale-server lesson).
5. Live dual-browser verification: (a) the drawer border probe (computed
   borderRightWidth 1px rgb(229,229,229) both apps); (b) the chat page
   y-map (title 257/No chats 302/center block 449-529 both apps); (c) the
   /assets y-map (kicker 40/h1 84/sub 136/button 32/card 196/header 221/
   empty 390 both apps) + the mobile 390 pass (h1 141/card 281); (d) the
   swipe probe (drag the panel, assert the transform follows + closes);
   (e) regression sweeps: the 12-route redeploy + the mobile chrome audit
   + the sidebar nav y-map.
6. Screenshots: the round's evidence page + the drawer border pair (REF
   vs LOC) + the chat page pair + the /assets pair + the swipe mid-drag
   → `docs/screenshots/` (+ the 02/11 standards refresh).
7. Docs: AGENTS session-31 layer + counts, SKILL v3.14.0 + §43, PAD
   [S31], CLAUDE/README counts, the session log docs/session_55.md +
   the working log docs/session_56.md (the previous round's pair was
   53/54), worklog, this plan's completion record.

## Completion record (session 31)

All 4 gap groups executed TDD-first (7 new pins in
tests/unit/recipes.test.ts, all RED before implementation → GREEN; the
R25-A4 route-coverage pin's count updated 46→47 — the legacy route
joined; one E2E assertion iterated after the 1px live-verification
find):

- **R30-A**: the drawer panel's right border — `border-r` on the
  DialogPrimitive.Content picks up the base layer's #e5e5e5; post-fix
  the computed contract reads 1px rgb(229,229,229) byte-identical on
  both apps; the desktop sidebar keeps border-sidebar-border (slate-200
  — REF's two surfaces use different tokens, and so does the clone).
- **R30-B**: the /hrassistantchat empty-state restoration — the left
  card is REF's natural-height recipe (CardHeader p-4 border-b
  border-slate-200 + the text-sm CardTitle + the p-2 max-h-96 list
  body + the plain "No chats" line, y=302 after the 1px line-box
  fix — text-sm's DEFAULT 20px, not leading-[1.5]'s 21px); the right
  pane wraps in a bare lg:col-span-3 div whose h-full card centers the
  path-fingerprinted 64px slate-300 MessageSquare (y=449) over the
  single 16px line (y=529); the two invented copy blocks are gone
  (NEGATIVE-pinned in both the unit pin and the E2E spec).
- **R30-C**: the legacy /assets route — the full page (flat36
  always-row header with the badge-row button, the sRGB-pinned
  green→blue canvas, the border-slate-200 card with the bg-slate-50
  band + leading-none title, the Inbox-over-line empty state — the
  icon found via the 80px-gap/kids:2 clue + the SVG path
  fingerprint), the Add Asset dialog (Desktop/Tablet in the type
  select), the /api/assets zod enum extension, and the mechanical
  pageMetadata("/assets") layout. Byte-identical live: desktop (kicker
  40, h1 84, sub 136, button 32/1274, card 196, band 197/65, Inbox
  310, line 390) + mobile (h1 141, button 89/240, card 281/16). The
  navigation sweep gained the /assets row.
- **R30-D**: the drawer swipe-to-close superset — touch handlers with
  the horizontal-dominant leftward guard, live inline translation, the
  96px threshold, the exit animation continuing from the current
  transform (tailwindcss-animate's exit keyframes define only the `to`
  state), and the 300ms spring-back below threshold. E2E via CDP
  Input.dispatchTouchEvent with the two settling lessons baked into
  the spec (700ms for the enter animation + 100ms inter-phase frames;
  the sub-threshold test polls the live transform mid-gesture —
  non-vacuous).

E2E +7: hr-assistant-chat.spec.ts (1), legacy-assets.spec.ts (2, with
the describe-scoped beforeEach pre-clean after a full-suite cascade
left a probe asset in the persistent e2e DB), drawer-swipe.spec.ts (3),
and the /assets row in navigation.spec.ts.

Gates: lint 0/0 · tsc ✓ · 464/464 unit (+7) · build ✓ · 100/100 E2E
(+7). Live-verified: the drawer border, the chat y-map, and the
/assets y-map (desktop AND mobile) all byte-identical; 12/12 redeploy
MATCH; mobile chrome byte-identical; sidebar navmap 865/905; DB
pristine (users=1, employees=1, leaveBalances=2, payroll=0,
expenseClaims=0, tasks=0, candidates=0, jobs=0). 6 evidence
screenshots (98 the evidence page, 99/99b the drawer border pair, 100
the chat page, 101/101b the legacy /assets desktop + mobile — VLM-
confirmed: the border visible, no extra copy, the band + icon +
button) + 02/11 standards refreshed → 118 PNG captures.
