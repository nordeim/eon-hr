# Remediation Plan — Session 41 / Parity Round 40

**Window**: session-41 audit (this document) · parity round 40
**Predecessor**: `docs/remediation-plan-session40.md` (round 39, delivered at `30e04e9`)
**Baseline verified before census**: lint 0/0 · tsc ✓ · 619/619 unit · build ✓ · 174/174 E2E

## Census summary

- **Redeploy watch**: REF's login redeployed a FOURTH consecutive time —
  and for the first time since round 35 the CSS changed too (login JS
  `index-BIuE7r17.js` → `index-C-ulo5ek.js`; login CSS
  `index-D0Q6-tUz.css` → `index-BIWjBcok.css`). Both app chunks unchanged
  (`index-C-IrDy5f.js` + `index-BGNH4KkS.css`). The CSS delta =
  platform-wide @font-face additions (Wix Madefor Display/Text, Dazzed,
  Azeret Mono — the `.font-base44` utility's family) UNUSED by the Eon HR
  login (0 elements on the page; the login keeps rendering the system
  font stack). No login recipe moved: desktop + mobile re-measured
  byte-identical (card x=16 y=16 w=358, docH 862, email h=44/16px,
  icons 85/85/98, links y=718/746); theme-inert re-verified (htmlDark
  false with stored=true, dir ltr).
- **Standing audits 5/5 MATCH** — mobile tabs byte-identical; the drawer
  pair 288px @ x=0, #FAFAFA, 1px #e5e5e5 (post-restructure toggle
  selector: `[data-sidebar="trigger"]`, which both sides carry); navmap,
  bell, Quick Actions identical. No Tailwind v4 mobile-menu regression.
- **Route sweep 12/12 MATCH** (h1 text/font/x/y on the canonical routes).
- **The toaster frontier RESOLVED**: REF's one fireable notification —
  the failed-login error — renders a shadcn **Alert** (role=alert,
  `bg-red-50/70 border-red-200 rounded-xl` + the red-700 description
  "Invalid email or password") INSIDE the form, and the clone's is
  **byte-identical** (class string + rect x=536 y=738 w=368 h=54 +
  parent). The app-side toast interior stays unfireable on zero-data REF
  (documented).
- **The round's core: the careers mobile pixel-diff** (round-39's
  deferred frontier). The hero geometry is byte-identical (input h=50
  y=337 18px, h1 y=16, sub y=40) but the pair diffed 25.41% — the
  forensics opened the careers family end to end (the with-data card,
  never before probed, included).

## Findings (all live-measured this round)

### A. The login — the Sign in button's base members (the only login delta)

- **R40-A**: REF's Sign in button carries the login build's Button base
  members the clone's hand-rolled string lacks: `ring-offset-background`
  and the svg guards `[&_svg]:pointer-events-none [&_svg]:size-4
  [&_svg]:shrink-0` (inert — no svgs inside; the offset color renders
  white on both sides; the ring color is the literal `#09090b` vs REF's
  `ring-ring` token, which resolves to the same zinc-950 rgb(9,9,11) —
  the documented two-build split). Add the members for DOM class parity.

### B. Careers — the content wrapper (a round-39 miss)

- **R40-B**: REF's board content wrapper is `max-w-6xl mx-auto px-4
  py-12` on BOTH the main board and the org view (the org view's back
  button's ancestor chain confirms it). The clone's is `p-4 md:p-8` —
  the content starts y=467 at mobile instead of REF's y=499 (the py-12
  vs p-4 rhythm).

### C. Careers — the zero-card family (shared with externaljobapplication)

Live-measured in two states (search-filtered zero + org-view zero):

- **R40-C**: REF's card is the icon-over-line family:
  - Card: `rounded-xl border bg-card text-card-foreground shadow
    text-center py-12` — `shadow` ON, NO `border-slate-200` (the default
    border renders rgb(229,229,229), not slate-200), `text-center py-12`
    on the CARD.
  - CardContent: `p-6 pt-0`.
  - Icon: `lucide-briefcase w-16 h-16 text-slate-300 mx-auto mb-4`
    (w-first class order; 64px, slate-300).
  - h3: `text-xl font-semibold text-slate-900 mb-2` "No Open Positions".
  - p: `text-slate-600` — the message is STATE-DEPENDENT: "Check back
    later for new opportunities!" (the empty board AND the org-zero,
    both measured) vs "No jobs match your search. Try different
    keywords." (the search-filtered zero).
  The clone's current card (`border-slate-200`, no shadow, inner
  `p-12 text-center`, icon-less, `mt-2 text-slate-500` line) diverges on
  every axis.

### D. Careers — the count heading row

- **R40-D**: REF wraps the count h3 in `div.mb-4.flex.items-center.
  justify-between` (a flex row ready for a right-side element; currently
  the h3 alone) — on BOTH the board and the org view. The clone's is a
  plain `div.mb-6`.

### E. Careers — the job card (REF's first measurable with-data card)

- **R40-E1 — the card shell**: `rounded-xl border bg-card
  text-card-foreground shadow hover:shadow-lg transition-shadow` — again
  NO `border-slate-200` (the clone pins it).
- **R40-E2 — the header**: CardHeader `flex flex-col space-y-1.5 p-6
  border-b` > title row `flex items-start justify-between mb-3` >
  [left `flex items-center gap-3` > div > (title div `font-semibold
  tracking-tight text-xl` + company `p.text-sm.text-slate-600`); right =
  the status badge].
- **R40-E3 — the badge**: hand-rolled (the taskmanager precedent —
  badge.tsx serves other pages): `inline-flex items-center rounded-md
  border px-2.5 py-0.5 text-xs font-semibold transition-colors
  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
  border-transparent shadow hover:bg-primary/80 bg-green-100
  text-green-700` — "Open".
- **R40-E4 — the meta stack**: `div.space-y-2.text-sm.text-slate-600`
  with FOUR rows, each `flex items-center gap-2` + a 16px lucide icon:
  building2 = department, map-pin = location, clock = type (LOWERCASE
  "full time" — the clone capitalizes), dollar-sign = the salary range.
- **R40-E5 — the content + CTA**: CardContent `p-6 pt-4` > description
  `p.text-slate-700 line-clamp-3 mb-4` (the clone renders it unclamped)
  + the full-width "View Details & Apply" button (w-498; the clone's
  default gradient variant renders REF's blue→indigo visual).

### F. Careers — the apply flow (a functional gap)

- **R40-F**: REF's "View Details & Apply" NAVIGATES to
  `/ExternalJobApplication?org=<company-slug>&job=<title-slug>` (the
  capitalized path is REF's client-side artifact — the clone uses its
  lowercase route). The clone's card has NO apply button. NOTE: REF's
  own target renders its zero-state for these params (the fetch doesn't
  resolve them to visible data — a REF-side artifact); the clone
  implements the working superset (the params filter the page's list).

### G. Careers — the org view structure

- **R40-G**: REF's org view: `div.mb-8` wraps [the back button (ghost +
  `h-9 px-4 py-2 mb-4`), the org h2 `text-3xl font-bold text-slate-900`]
  → then the count row (R40-D) → then the grid. The clone's back button
  + h2 sit bare in a plain div with a `mt-4 mb-6` count wrapper.

### H. Careers — the data model (the chips are companies, not departments)

- **R40-H**: REF's chips are COMPANIES (the org view shows the company
  name; the card's second line is the company). The clone builds its
  chips from `j.department` — semantically wrong. Add `company String?`
  and `salaryRange String?` to `JobPosting` (nullable, additive; the
  jobs API's `JobInput` gains both; `db:push` + the E2E global-setup
  pick the schema up automatically). The chips/org-view/card read
  `company`; the card's 4th meta row reads `salaryRange`.

### I. Externaljobapplication — the wrapper/header/card alignment

- **R40-I1**: the content wrapper is `max-w-6xl mx-auto` (the clone's
  adds `space-y-12`); the header block is `text-center mb-12` with the
  h1 `text-4xl font-bold text-slate-900 mb-3` (the clone has no mb-3,
  puts mt-3 on the p instead).
- **R40-I2**: the card joins the R40-C family (shadow + `text-center
  py-12` on the Card, default border, `p-6 pt-0` inner, the
  `w-16 h-16 … mx-auto mb-4` briefcase, h3 mb-2, `text-slate-600` line)
  — replacing the clone's `pt-12 pb-6 > mb-4 flex justify-center` icon
  arrangement and `border-slate-200`.
- **R40-I3 (superset)**: read `?org=`/`?job=` and filter the listed
  jobs (slug-matched); no match → the zero-state (REF parity).

### Documented non-gaps (no action)

- REF's horizontal overflow on /careers at mobile (a long whitespace-
  nowrap company chip forces the canvas to 569px — DATA-driven; the
  clone with equivalent data behaves identically via the same flex
  semantics).
- The hero/banner gradient class-string (the sRGB arbitrary form —
  trap 3; REF's utility form interpolates sRGB only in its v3-era CSS).
- The capitalized /Careers path.
- The login CSS redeploy's font-faces (platform infra, unused).
- The route sweep's h1 box-width variance (left-aligned text — the
  boxes stretch differently, the pixels don't move).
- REF's apply-flow params not resolving to visible data (REF-side).
- The clone's a11y/documented supersets (aria-label on the toggle,
  autocomplete on the login inputs, cursor-pointer on buttons).

## TDD execution plan

1. **RED**: append the session-41 pin block to `tests/unit/recipes.test.ts`
   (~16 pins: A1, B1, C1-C3, D1, E1-E5, F1, G1, H1-H2, I1-I3) + amend
   the affected predecessors (R31-C3's icon order `h-16 w-16` →
   `w-16 h-16`; the session-40 E2E seed's department→company).
2. **GREEN** (order):
   a. The schema + API (R40-H) — prisma schema + JobInput + db:push.
   b. The careers page rewrite (R40-B/C/D/E/F/G): wrapper → zero-card →
      count row → the job card (badge/meta/clamp/CTA) → the org view →
      chips-from-company.
   c. The external page (R40-I): wrapper/header/card + the params.
   d. The login Sign in members (R40-A).
3. **E2E**: amend the session40 spec's careers seed (company +
   salaryRange) + its card assertions; add the session-41 spec block
   (the card contract with the badge/meta/line-clamp/CTA, the apply
   navigation, the external params flow, the filtered-zero message,
   the empty-board message).
4. **Gates**: lint → tsc → unit → build → E2E, all green.
5. **Live verification**: the standing audits + a verify-r40 script
   (the careers pair: wrapper y, the zero-card family, the with-data
   card via an API-seeded job incl. company/salary, the org view, the
   external pair, the login signin class members) + screenshots
   (docs/screenshots/ 156-159) + DB pristine check.
6. **Docs**: AGENTS session-41 layer, SKILL 3.24.0 + §53, PAD [S41],
   CLAUDE/README counts, docs/session_83.md, this plan's completion
   record, worklog entry. Commit + SSH-wrapper push (main only).

## Risks & mitigations

- **The chips' data source changes** — the E2E seed and any consumer
  building chips from department must move to company (the session40
  spec is the only consumer; amended in step 3).
- **The zero-card text becomes state-dependent** — the empty-board
  message keeps the round-31 pin's string; the filtered message is new;
  the E2E covers both states (empty board on the fresh e2e db; filtered
  via a seeded job + a nonsense query).
- **The card CTA navigates** — a router.push in the card keeps the
  board client-side (no full reload; REF's own navigation is
  client-side too — path artifact aside).
- **Comments-in-source regex inflation** (the standing lesson): reword
  any comment quoting class strings.

## Completion record (session-41, executed this window)

Executed end to end this window against the live census above.

**TDD**: 18 RED (17 new session-41 pins + the R31-C3 icon-order
amendment) → **636/636 unit GREEN** (+17). One pin regex tightened
during GREEN (R40-A1's button match needed the slate-block anchor —
the inputs carry the same height members).

**Gates**: lint 0/0 · tsc ✓ · 636/636 unit (+17) · build ✓ · 180/180
E2E (+6: the session41-careers-family spec — the zero-card family
contract, the wrapper/count row, the with-data card (badge/company/
meta/clamp/CTA), the apply flow + the params superset + the no-match
zero-state, the filtered-zero message, the login button members). The
workflow Add-Level width hit its documented 110-115px tolerance flake
once in the full run, stable on the single-spec re-run AND the full
re-run (the round-39 precedent).

**The schema**: JobPosting + `company` + `salaryRange` (nullable,
additive — db:push on the dev db; the E2E global-setup picked it up).
The jobs API's JobInput gains both; the careers chips/org-view/card/
apply all read `company`.

**The verify artifact caught one code gap**: the first live pass
rendered REF's Open badge as a DIV where the clone's was a span —
fixed (the E2E selector + the R40-E3 pin tightened to the div form),
all gates re-run green.

**Live verification** (verify-r40.mjs + the standing audits): 3/6 raw
MATCH — the careers board (wrapper/rhythm/row/grid/card) byte-identical;
the zero-card family byte-identical in the filtered state on both sides
(class + border rgb(229,229,229) + shadow + padTop 48 + the w-first
briefcase + the h3 mb-2 + the state-dependent message); the login
Sign in members MATCH (h=48, the offset + guards present both sides).
The 3 documented diffs: (1) the job card's CTA class string (REF's
v3-era `bg-gradient-to-r from-blue-600 to-indigo-600` vs the clone's
trap-3 arbitrary form — the identical sRGB endpoints; every other
card member byte-identical incl. the badge, the company line, the
meta rows, the clamp, the CTA width 498); (2) the org view's
back-button member order + the clone's cursor-pointer superset + the
different company names (data); (3) the external page's interior —
REF renders its zero-card for the apply params while the clone's
superset resolves the seeded job (ALL the family classes
byte-identical: canvas/wrapper/header/h1/card/border). The standing
audits 5/5 post-change; the hero pixel-diff closure — the count-row
rhythm rows collapsed to zero after the wrapper fix, the residual
fully attributed to REF's data-driven 569px canvas overflow
(live-confirmed: REF's banner w=569 vs the clone's 390, the same sRGB
gradient endpoints). 8 screenshots (156-159) → 220 captures. DB
pristine (users=1, employees=1, leaveBalances=2).

**Docs**: AGENTS session-41 layer, SKILL 3.24.0 + §53, PAD [S41],
CLAUDE/README counts (816-spec pyramid), docs/session_83.md, this
completion record, the worklog entry.
