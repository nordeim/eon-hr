# Session 119 (2026-10-19) — parity round 58: the badge/chip fill family

> The round-57 frontier said the CTA-fill family is censused and closed
> — every primary action's computed fill now carries REF's five-recipe
> taxonomy. This round's census took the same fill dimension to the
> layer the button census SEES but never reads — **the badge/chip fill
> family** (every leaf element with a non-plain background: status
> pills, count chips, table badges; all 49 routes, paired live). The
> clone had uniform-slate count chips on both kanban boards (a
> session-6 single-column measurement generalized to five) and REF's
> securitysettings Enabled badge carried a glyph the clone lacked.
> Pre-fix: **44/49 MATCH**. Post-fix: **47/49** — the two remaining
> DIFFs are the documented allowances (the profile role text and the
> with-data employees surface). The census's `lab()` serializations
> also exposed the **trap-2 palette drift on every unpinned shade in
> active use** — the round pins sixteen.

## What the round delivered

- **The deploy watch: the login side deployed again (the 23rd)** —
  login JS `DclSb8Zmk`... `DclSb8FG` → `CpCk8Zmk` AND login CSS
  `V5v1Fmok` → `A8a43VEI` (both rolled; the app side
  `C-IrDy5f`/`BGNH4KkS` unchanged). Per protocol the login re-audit
  ran: **verify-r45 13/13 MATCH — a non-visual rebuild**. The
  confirmation ladder green after the REF session re-auth (the
  stale-session DIFF pattern, met once more): standing **5/5** + route
  sweep **12/12** + **verify-r49 13/13**.
- **The census instrument**: `scripts/r59-badge-census.mjs` (+ the
  `r59-badge-recon.mjs` reconnaissance probe) — every non-button
  leaf's computed fill, deduped by (text, fill, height), paired across
  all 49 routes.
- **The taskmanager count chips (R59-A)** — REF tints each kanban
  column's chip by status: Backlog slate-100/700, To Do blue-100/700,
  In Progress **yellow**-100/700, Review purple-100/700, Done
  green-100/700 (all live-measured; the chip also carries REF's
  transition/focus class members the session-6 authoring lacked). The
  clone rendered the uniform slate — the session-6 pin had measured
  only Backlog and generalized. The classic census blind spot, closed.
- **The recruitmentkanban stage chips (R59-B)** — the same family:
  Applied slate-200/700, Interviewing blue-100/700, Offer
  **amber**-100/700 (REF keeps two different warning shades across its
  own pages — amber here, yellow on the taskmanager), Hired
  green-100/700, Rejected red-100/700. The class prefix was already
  byte-identical to REF's; only the tint members drifted. The dead
  `dot` config members retired.
- **The securitysettings Enabled badge (R59-E)** — the census's
  "timing artifact" DIFF turned out to be TWO things: the wait lesson
  (real — the read needs content waits, not fixed milliseconds) AND a
  real structural gap: REF's Enabled form carries the **CircleCheckBig
  glyph** (`w-3 h-3 mr-1`, 92px vs the clone's 76px) plus the
  `shadow hover:bg-primary/80 border-green-200` members; the Disabled
  form stays the plain slate. The r48 round had measured only the
  zero-state Disabled form. The clone now renders both forms
  byte-faithfully.
- **The trap-2 palette sweep (R59-D)** — the census's `lab()`
  serializations exposed the oklch drift on every unpinned shade in
  active use. A used-vs-pinned sweep of `src/` against the `@theme`
  pins found: emerald-100/700 (the Badge success variant + the
  communications/payrollmodule chips), amber-100/400/600/700 (the
  Badge warning variant + compliance alerts), yellow-100/600/700 (ten
  analytics icon sites), red-100 (the Badge destructive variant),
  purple-100/700, violet-100/700 (the Badge purple variant), and
  pink-600 (the expenses CTA gradient endpoint — matching REF today,
  pinned for stability). The round pins **sixteen shades** to the v3
  hexes (byte-identical to the REF-measured rgb() truths).
- **The profile role badge (R59-C, documented)** — the recipe matches
  byte-for-byte (`bg-blue-50 text-blue-700 border-blue-200`); the TEXT
  reads "Admin" on the clone vs "User" on REF — the seed's admin role
  is load-bearing for the functional superset (the requireRole gates +
  the admin-gated E2E round-trips). Recorded as the documented
  data-level divergence; changing the seed would break 30+ flows to
  flip one badge's text.
- **The with-data frontier re-verified** — REF's own Create Employee
  wizard is a **silent no-op live** (walked the 4 steps → Create
  Employee → no row, no toast, no error — consistent with the r57
  findings on REF's broken write paths). The employees-table surfaces
  (the avatar fill, the table-badge recipes) stay REF-unmeasurable;
  the clone's working wizard remains the documented superset, and the
  emerald oklch drift on the seeded Active badge was still fixed by
  the palette pins.

## The instrument lessons (transferable)

1. **`agent-browser close --all` resets the viewport** — re-opened
   sessions default to 1280×577; the verify scripts set the LOC
   viewport but ride the REF session's existing viewport. A
   fresh-opened `ref` session produced a 12/13 verify-r49 with chart
   widths 418/910 vs 498/1070 — a pure viewport artifact. Always
   re-set 1440×900 on the ref session after any session reset.
2. **Data-gated badge reads need content waits, not fixed
   milliseconds** — the census read REF at 400ms past the network
   settle and missed the four Enabled badges (the Loader2 gate). The
   E2E pins wait for row text; the census waits got equalized (both
   sides 2200ms).
3. **The census leaf filter hides icon-bearing badges** — the
   `children.length > 0` skip excludes any badge with an inner glyph
   (REF's Enabled form, post-fix the clone's too). The census is the
   survey; the E2E pin (icon class + 92px geometry) is the contract.
4. **A "false DIFF" deserves one more look** — the securitysettings
   artifact decomposed into a timing lesson AND a real 16px structural
   gap. Triage, don't dismiss.
5. **The tool-session process kill** — the sandbox kills spawned
   servers between tool invocations; the census/ladder scripts boot
   their own `:3200`/`:3201` servers inside their process trees (the
   established r49/r52 pattern, re-confirmed).

## Gates

lint 0/0 · tsc ✓ · **828/828 unit** (+5, RED-first) · build ✓ ·
**291/291 E2E** (+6, no flakes — the session-58 full-suite flake did
not recur this window) · post-fix census **47/49 MATCH** (the two
documented allowances: the profile role text, the with-data employees
surface) · confirmation ladder green (standing 5/5 + sweep 12/12 +
verify-r49 13/13 + verify-r45 13/13) · DB pristine (1/1/2 — the
loading-probe user swept) · **448 screenshot files** (+8: the 265-267
pairs + the 268/269 LOC evidence, all hash-verified distinct).

## The frontier after this round

The badge/chip fill family is censused and closed: both kanban boards
carry REF's status-tint recipes, the securitysettings Enabled form is
byte-faithful (glyph + members), and the trap-2 palette is pinned
across every shade in active use. Open items: the Next.js 16.4.0
history bug (the upgrade watch — the one recorded functional
divergence whose fix lives upstream), the login build stays under
ACTIVE development (the 23rd deploy rolled both JS and CSS this
window — the watch stays armed), the with-data superset surfaces stay
REF-unmeasurable at the shared demo's zero state (REF's own write
paths are broken live), and the byte-parity backlog remains
documented-allowance territory (the profile role text joins the list).
