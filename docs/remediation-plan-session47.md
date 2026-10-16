# Remediation plan — session 47 (parity round 46)

## The round's context

- Workspace reset again — fresh clone at `36ae4c8` (round 45 + the
  session-94 journal); env rebuilt (bun install, `.env` with
  `DATABASE_URL="file:../db/custom.db"` + a generated AUTH_SECRET, db:push +
  db:seed with the shell-level DATABASE_URL trap unset inline, Playwright
  chromium reinstalled). Baseline gates ALL GREEN: lint 0/0 · tsc ✓ ·
  697/697 unit · build ✓ · 209/209 E2E — aligned with the documented
  round-45 state.
- **Redeploy watch: the 12th login deploy** — login JS `CcAnCcTT` →
  `D3V2Rni1`, login CSS `BWytzgpi` → `bfirUl4Z` (JS + CSS both; the app
  fingerprints `C-IrDy5f`/`BGNH4KkS` quiet). Per the round-42 precedent the
  full login re-audit ran: **verify-r45 13/13 MATCH** on the new build, the
  failed-login Alert re-fired byte-identical (modulo the documented lab()
  serialization), theme-inert holds, the runtime style-block census
  unchanged (17,080-byte Tailwind block + googleidentity + _goober + the
  14,859-byte platform block). The 12th deploy is visually quiet.
- Standing audits 5/5 + route sweep 12/12.
- **The round's vein — the zero-state app-page interiors** (never censused:
  the route sweep pins h1s only). The method's unlock: a ZERO-TENANT
  scratch server (a second standalone on :3201 against db/zero.db — schema
  + the demo user ONLY, mirroring REF's actual tenant state of 0 employees)
  so REF's zero-data pages compare like-for-like with the clone's. The
  seeded :3200 server stays the with-data superset reference.
- Census instruments: probe-r46-census-a..h.mjs (8 probes; the census-a
  one-liner trap re-fired — the session-46 lesson re-applied: no `//`
  comments inside template literals joined by split-join).

## The findings (all live-measured, REF @1440×900 vs the zero-tenant clone)

### A. The page-root families (the 12-route map)

REF renders THREE page-root families; the clone diverges on 11 of 12:

| route | REF scroller-first child | clone today |
|---|---|---|
| dashboard | `relative overflow-hidden` > `touch-pan-y` > content `p-4 md:p-8 space-y-8` | `p-4 md:p-8 space-y-8 select-none` (no wrappers) |
| employees | trio > content `p-4 md:p-8` | `p-4 md:p-8 select-none` |
| payroll | trio > `min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8` | the gradient alone (`bg-[linear-gradient(to_right_bottom,#f0fdf4,#eff6ff)]`), no trio |
| taskmanager | trio > `min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8` | gradient alone, no trio, no dark pair |
| attendance | `min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8` > NESTED trio > `max-w-7xl mx-auto space-y-8` | gradient alone (`#eff6ff,#ecfeff`), no nested trio, content `mx-auto flex w-full max-w-7xl flex-col gap-8` |
| recruitment | `min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-8` | `bg-[linear-gradient(...#eef2ff,#eff6ff)]` |
| training | `min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8` | `#faf5ff,#eff6ff` |
| documenttracker | `min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8` | `#eff6ff,#eef2ff` |
| profile | `min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8` | `#f8fafc,#eff6ff`, no dark pair |
| settings | `min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8` | `#f8fafc,#eff6ff` |
| staffrequests | `p-4 md:p-8 max-w-7xl mx-auto space-y-6` | `mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8` |
| careers | ✓ already verbatim | ✓ |

- The **deco** (`absolute top-0 left-0 right-0 flex justify-center items-center
  h-20 -mt-20`, style opacity:0, containing the refresh-cw icon + a 4-path
  svg) is the platform's invisible scroll widget — **documented non-clone**
  (it unmounts/transforms on scroll; opacity 0 at rest; zero visual
  footprint). The wrappers (`relative overflow-hidden`, `touch-pan-y`) are
  structural and mirrored; the deco slot is not.
- The arbitrary `bg-[linear-gradient(to_right_bottom,…)]` forms render the
  SAME colors (the hex pairs are the from/to tokens) — the fix is
  class-string parity + the missing `dark:` pairs (a REAL dark-mode diff on
  taskmanager/attendance/profile).
- `select-none` renders on 10 clone pages and NO REF page — remove.

### B. The stat-row conditionals (payroll + recruitment)

- **payroll**: the clone renders its 4 StatCards at zero records ("0 SAR" /
  "0" / "0" / "2026-10") — REF renders NO stats row at zero (straight from
  the actions to the "No payroll records" zero-card).
- **recruitment**: same — the clone's compact stat row ("0"/"0"/"0"/"—")
  has no counterpart on REF's zero-state page.
- Both stay as the with-data superset (REF's with-data stat rows are
  unmeasurable on its zero-data tenant).

### C. The StatCard element tags (per-variant, REF-measured)

- **standard** (attendance, the measurable zero-state stat row): REF renders
  the value as a **DIV** (`div.text-3xl font-bold text-slate-900 mb-1`) and
  the label as a DIV (`div.text-sm text-slate-600`); the clone renders the
  value as a P.
- **horizontal** (documenttracker): REF renders value AND label as **Ps**
  (`p` value + `p` label "Total Documents"/"Valid"/"Expiring ≤30
  days"/"Expired"); the clone renders the label as a DIV.
- The per-page tag map lives in the StatCard variant table (value tag:
  standard → div, horizontal → p; label tag: horizontal → p, others → div).

### D. The dashboard interior (all zero-state measured)

1. **CardTitle is a DIV on REF** — census: 4 `div.font-semibold
   tracking-tight text-base`, 0 tracking-tight h3s on the dashboard; no
   tracking-tight h3 on any sampled page. The clone's ui/card.tsx renders
   CardTitle as an H3 (the session-6 comment already documents "the Base44
   title div" — the tag was never mirrored). Fix the component + adopt
   REF's class order (`font-semibold tracking-tight text-base`).
2. **The leave-balances card at zero**: REF renders the DEFAULT UI — "Annual
   Leave / 21 / 21 days" (full `bg-blue-500` bar) + "Sick Leave / 30 / 30
   days" (full `bg-green-500` bar) — the clone renders an empty state ("No
   leave balances yet"). The zero-tenant renders the same defaults the seed
   writes (21/21 + 30/30): at zero balances, render the documented default
   rows.
3. **The quick-action items**: REF = a BARE `<a>` wrapping
   `div.flex items-center gap-2 p-3 rounded-lg border border-slate-200
   hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer`
   + `span.text-sm text-slate-700`; the clone puts the classes on the Link
   itself (no inner div).
4. **The CustomizeButton wrapper**: REF wraps the button in
   `div.flex items-center gap-3`; the clone renders it bare.
5. **The mobile header** (the PageHeader kicker family): REF's current
   verbatim is `md:hidden sticky top-0 z-20 bg-white dark:bg-slate-900
   border-b border-slate-200 dark:border-slate-800 px-4 py-3
   safe-area-top`; the clone ships the session-9 static form (`md:hidden
   border-b border-slate-200 bg-white px-4 py-3`). Adopt the verbatim
   (sticky/z-20/dark:/safe-area members; the session-9 rendered-truth note
   stays documented — the sticky is inert inside the r39 scroller stack).
6. The `mt-8` on the welcome row is the documented trap-6 restoration —
   KEEP (REF's v3 space-y lands mt-8 on this row; same rendered gap).

### E. The profile page

1. **The hidden avatar input**: REF renders `<input type="file" id="avatar"
   accept="image/*" class="hidden">` between the email P and the Change
   Photo button; the clone has none.
2. **The input ids**: REF `full_name` / `email` / `phone` / `job_title`;
   the clone `pf-name` / `pf-email` / `pf-phone` / `pf-title` (+ the
   matching Label htmlFor pairs).
3. **The audit-note P** ("Changes to your profile are audited for
   security.") renders on the clone only — REF has no such line. Remove
   (the audit-logging superset itself stays backend-side).
4. The REF scroller holds 7 buttons vs the clone's 6 (census-b) — one more
   empty-text button than the sidebar toggle accounts for; enumerate +
   mirror during the TDD phase (probe-r46-pin-a).

### F. The icon family (employees + taskmanager — RENDERED diffs only)

1. **employees Upload glyph**: REF ships the OLD lucide upload (first path
   `M21 15v4a2 2 0 0 1-2 2H5a2…` — tray-first); the installed lucide-react
   0.525 ships the NEW arrow-first revision (`M12 3v12` first). Hand-author
   REF's glyph (the r44 pattern) for the Import CSV button.
2. **employees Search icon**: REF `lucide lucide-search absolute left-3
   top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400`
   (circle-first glyph); the clone renders `text-muted-foreground`
   (= #64748b slate-500 — a RENDERED color diff vs slate-400 #94a3b8) +
   pointer-events-none + the reordered set. Adopt REF's verbatim class +
   glyph.
3. **taskmanager Kanban toggle**: REF `lucide lucide-kanban` (glyph
   `M6 5v11…`); the clone renders SquareKanban (rect-first, a different
   icon). Swap to Kanban.
4. Class-order/guard and `[&_svg]`-wrapper differences (grid3x3's double
   name, the list icon's w-4 h-4, the PageHeader badge icon span) are
   render-neutral documented translations — NOT in scope.

### The documented non-gaps (checked, not fixed)

- The attendance hero row / actions cluster wrap (session-10 R9-E +
  session-16 R15-C: the fitting superset vs REF's own 1558px horizontal
  overflow) — stays.
- The PageHeader badge/hero class-order splits (tw-merge render-neutral).
- The StatCard tile geometry (h-12 w-12 flex-centered vs REF's p-3 — same
  48×48 render; the session-17 R16-D decision).
- The deco widget (invisible platform runtime).
- The dashboard welcome-row `mt-8` (trap-6 restoration).
- REF's /settings company DATA (the seeded clone matches; the zero-tenant
  scratch db intentionally lacks the company row).

## The fixes

1. **`src/app/(app)/*/page.tsx` (10 pages)** — the page-root family
   alignment: the trio wrappers (dashboard/employees/payroll/taskmanager
   + attendance's nested form), the v3 gradient class swaps + the dark:
   pairs, the select-none removal, the staffrequests verbatim root, the
   attendance content `max-w-7xl mx-auto space-y-8`.
2. **`src/components/shared/page-header.tsx`** — the kicker verbatim
   (`md:hidden sticky top-0 z-20 bg-white dark:bg-slate-900 border-b
   border-slate-200 dark:border-slate-800 px-4 py-3 safe-area-top`).
3. **`src/components/ui/card.tsx`** — CardTitle h3 → div + REF's class
   order. Pin amendments for every h3-CardTitle pin.
4. **`src/components/shared/stat-card.tsx`** — the per-variant element
   tags (standard: value div; horizontal: label p).
5. **`src/app/(app)/payroll/page.tsx` + `recruitment/page.tsx`** — the
   stat-row conditionals (zero data → hidden; with-data stays the
   superset).
6. **`src/app/(app)/dashboard/page.tsx`** — the leave-balances default UI
   at zero (21/21 blue + 30/30 green), the quick-action item restructure
   (bare Link + inner div), the CustomizeButton wrapper.
7. **`src/app/(app)/profile/page.tsx`** — the avatar file input, the
   input-id family, the audit-note removal, the 7th-button mirror.
8. **`src/app/(app)/employees/page.tsx`** — the hand-authored Upload
   (REF's old glyph) + the Search icon verbatim.
9. **`src/app/(app)/taskmanager/page.tsx`** — the Kanban toggle icon.
10. **Unit pins** (tests/unit/recipes.test.ts, the session-47 block): the
    page-root strings (A1-A12), the stat conditionals (B1-B2), the StatCard
    tags (C1-C2), the CardTitle div (D1), the dashboard interior (E1-E3),
    the profile family (F1-F3), the icons (G1-G2) — plus the predecessor
    amendments (every pin anchored on the h3 CardTitle, the page roots, the
    profile ids, the stat grids, the payroll/recruitment stat rows).
11. **E2E** (tests/e2e/session47-zerostate-interiors.spec.ts): the
    zero-tenant stat conditionals (payroll + recruitment show no stat row
    on an empty tenant), the CardTitle div, the dashboard leave-balances
    default UI, the page-root trio + gradient classes, the profile avatar
    input + ids, the training zero-state (no New Platform button at zero —
    wait: REF renders NO New Platform button on its zero state; the clone's
    zero-state button is IN scope to conditionalize — add to fix 6-adjacent:
    training's New Platform renders only when platforms exist).
12. **`scripts/verify-r46.mjs`** — the round pairs, live on BOTH servers:
    the 12-route page-root map (REF vs :3201), the payroll/recruitment
    stat-row absence at zero (+ presence at :3200 with data), the
    attendance/documenttracker stat tags, the CardTitle div census, the
    dashboard default leave UI + quick-action structure, the profile
    avatar/ids, the icon glyphs, the dark-pair tokens. Normalizations: the
    documented render-neutral splits (class order via sorted-set, the
    [&_svg] guard strip, the PageHeader translations).
13. Screenshots 180-183 (the zero-tenant app interiors: dashboard, payroll,
    documenttracker, profile — REF + LOC pairs) → the PNG record. DB
    pristine check + `.env.example` re-verify.

## The verification gates

lint 0/0 · tsc ✓ · unit (697 + ~20 new, amended predecessors green) ·
build ✓ · E2E (209 + ~6) · verify-r46 (the round pairs) · standing audits
5/5 · route sweep 12/12.

---

## Completion record (session 47, delivered)

- **Gates**: lint 0/0 · tsc ✓ · **718/718 unit** (+21: A1-A5, B1-B2
  corrected, C1-C4, D1, E1-E3, F1-F3, G1-G2, H1) · build ✓ · **217/217
  E2E** (+8 — the session47-zerostate-interiors spec: the payroll +
  recruitment stat families at zero with the DIV tags, the trio roots, the
  attendance nested form, the CardTitle div census, the zero-tenant
  dashboard defaults via the signup superset's employee-less user, the
  profile avatar input + id family, the training zero-state).
- **Predecessor amendments**: 11 — the CardTitle pin (the div + REF's
  class order), the PageHeader kicker (the sticky/z-20/dark:/safe-area
  verbatim), the employees Import-CSV + taskmanager icon pins (the
  hand-authored Upload + the Kanban swap), the training create-affordance
  pin (the zero-state CTA retired; the dashed add-tile is the entry),
  R23-B1/B2/B3..B8/B-scope (the select-none family LEFT REF — only the
  shell chrome keeps it), R37-A3 (the PageCanvas between the loans Dialog
  and its root).
- **THE ROUND'S CENSUS CORRECTION (the transferable lesson)**: the first
  census read (probe-r46-census-a/b) missed REF's payroll + recruitment
  stat rows — BOTH the outline reader (h1-h4/p/button) and the stat
  detector (P.text-3xl) were P-based, and REF renders its standard/compact
  stat values + labels as DIVs. The "stats absent at zero" B1/B2 findings
  were census artifacts: REF renders the stats at ZERO with the DIV family
  — caught during the live verify (the stat-zone pair read the raw
  textContent), the conditionals REVERTED, and the corrected contracts
  pinned (the zone orders + the icon families: payroll
  dollar-sign/users/trending-up/calendar with per-color tiles;
  recruitment briefcase/users/circle-check-big/trending-up with
  indigo/blue/green/purple tiles + the compact slate-500 label).
  **Instrument lesson: never scope a structural census to a tag subset
  when the target family's tag is itself unknown — dump all elements or
  verify the negative with a text-level read.**
- **Live verification**: verify-r46 **25/25 MATCH** — the 12-route
  page-root map (the trio + gradient families + the bare wrappers, REF vs
  the zero-tenant scratch server), the payroll/recruitment stat zones at
  zero (tags + rendered tile/icon geometry), the attendance standard-stat
  tags, the documenttracker horizontal p/p family (the file-text /
  circle-check-big / triangle-alert / circle-x glyph swap), the CardTitle
  div census, the dashboard leave-balances defaults (Annual 21/21 blue +
  Sick 30/30 green) + the quick-action bare-anchor structure + the
  Customize wrapper, the profile input family, the employees icon glyphs,
  the training zero-state, the dark gradient pairs.
  Normalizations: the documented lab()/rgb() serialization split, the
  tw-merge class-order sorted-sets, the [&_svg]-guard svg-class forms
  (the rendered geometry is the contract).
- **The 13th login deploy** (mid-round: D3V2Rni1 → Dwv9uuCD JS,
  bfirUl4Z → CpjiugAb CSS; app quiet) — the full login re-audit per the
  round-42 precedent: **verify-r45 13/13 MATCH** on the new build.
- **Standing audits 5/5 · route sweep 12/12** post-change.
- **The DB pristine check** caught the verify-r45 loading-probe's live
  signup AGAIN (the known trap — the notificationPref dependent swept
  this time); the tenant restored (users=1, employees=1, balances=2);
  `.env.example` verified.
- **Screenshots**: 180-183 (8 PNG: the payroll trio + stat family, the
  doctracker stat row, the dashboard defaults, the profile identity
  header — REF + zero-tenant LOC pairs) → **270 PNG captures**.
