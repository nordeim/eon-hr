# Session 121 (2026-10-19) — parity round 59: the dark-mode fill family

> The round-58 frontier closed the badge/chip fill family in light mode.
> This round's census took the SAME union read (button fills INCLUDING
> backgroundImage + the non-button leaf fills — the r57 + r58 families)
> into **DARK MODE** (`html.dark`, the `localStorage darkMode="true"`
> contract both apps share), all 49 routes paired live. Pre-fix:
> **39/49 MATCH**. Post-fix: **45/49** — the four remaining DIFFs are
> documented (the profile role text, the employees with-data leaves,
> REF's live careers postings, and the 404 Go Home tag superset whose
> computed fills are byte-identical). Two of the seven real findings
> turned out to be light-mode gaps too — the earlier censuses never
> read button TEXT colors or the settings edit state.

## What the round delivered

- **The census instrument**: `scripts/r60-darkfill-census.mjs` (+
  the recon + 8 probe scripts) — the union read, gradients normalized
  to their rgb() triple list (the `to right`/`90deg` Chromium
  serialization equivalence), mid-run re-auths, and login-page
  detection.
- **R60-A — the checkbox dark pair + the both-themes glyph**: REF's
  securitysettings checkboxes render in dark at **bg #fafafa** (its
  dark `--primary`) with the **#171717 check** (the dark
  `--primary-foreground`) — the r58 pin (`bg-[#171717]` + the invented
  `dark:text-white`, authored on the assumption "REF's zero-data
  surfaces never render a checkbox in dark") was wrong on both counts;
  the r60 census disproved the assumption (five rows render). The
  **glyph**: REF authors `h-4 w-4` (14×16 rendered — the flex shrink in
  the 14px content box, REF-measured) where the clone authored `h-3
  w-3` since r48 — a both-themes divergence never re-measured. Fixed:
  `dark:data-[state=checked]:bg-[#fafafa]` + the primary-foreground
  token (the r58 switch pattern) + the h-4 w-4 glyph.
- **R60-B — the employees default view is GRID**: REF's fresh-loaded
  /employees renders the GRID toggle as the active-styled button
  (bg-primary, w=40) and LIST as the outline (w=42) — measured on
  three fresh loads + a reload test (click list → reload → grid-active
  again; nothing persists). The clone booted `view="list"` — the
  r58-24 "byte-identical" claim was a **set-comparison blind spot**
  (the same two fills sat on opposite buttons). Flipped to grid; three
  legacy E2E flows updated (the r58 pair pin, the r59 badge test, the
  dashboard CRUD round-trip — each gains the List-view click).
- **R60-C — the settings Company edit is an INLINE form flip**: REF's
  Edit button (byte-identical on the clone at rest) flips the card
  content into a **12-field inline form** (live-measured: the
  `grid md:grid-cols-2 gap-6` field grid — 523px tracks, 24px gap; the
  labels Company Name, Logo URL, Industry, Company Size (select),
  Address, City, Country, Phone, Email, Website, Tax ID, Registration
  Number; REF's placeholder strings verbatim; **Save Changes** (outline
  + the lucide-save w-4 h-4 mr-2 glyph) replaces the Edit button in
  the header; **Cancel** (outline) at the form's bottom-right). REF's
  own form renders EMPTY values and its Save is a silent no-op live
  (the broken-write-paths family). The clone's max-w-lg dialog is
  retired; the schema/API gain `logoUrl`/`city`/`country`; the
  superset keeps the working PATCH round-trip.
- **R60-D — the compliance notify buttons are severity-tinted**: REF
  carries per-severity members on the outline base (≤7
  `text-red-600 border-red-200 hover:bg-red-50`, ≤15 orange, ≤30
  yellow — the tints do NOT flip in dark, live-measured both themes).
  The r14-F pin covered geometry only. Four palette pins land
  (orange-200/50, yellow-200/50).
- **R60-E — the blue-600 text split**: REF's blue-600 buttons split
  into literal `text-white` (workflowconfigpage ×2 +
  notificationpreferences — 255,255,255 both themes) and the flipping
  `text-primary-foreground` (recruitmentkanban, staffrequests,
  documenttracker, the chat's hand-authored new-chat). The clone had
  BOTH sides inverted (the variant used the token everywhere; the chat
  used text-white). The prior censuses never read button text colors.
- **R60-F — the payrollengine Generate Payroll is the FLAT emerald
  solid**: REF (both themes, re-verified live): `bg-emerald-600
  hover:bg-emerald-700 text-primary-foreground shadow`, backgroundImage
  **none**. The clone's className authoring (`bg-emerald-600 …` with no
  variant) left the **default gradient in the class list** —
  tailwind-merge does not conflict `bg-emerald-600` with the arbitrary
  gradient image class, so the blue gradient PAINTED OVER the emerald
  color in BOTH themes. A P1-family bug the r58 color-only census
  could not see; fixed via the new `emerald` variant.
- **R60-G (documented)** — the 404 Go Home: byte-identical computed
  fills in both themes (probe8's paired read); REF renders a
  `<button>` where the clone keeps the r36-documented `<a>`-link
  navigation superset. The census's button-only read sees one side.

## The instrument lessons (transferable)

1. **The `"$Abcd1234"` shell-expansion trap** — a password fill passed
   in double quotes inside an execSync template literal expands the
   unset shell variable `$Abcd1234` to the EMPTY string; every
   "re-auth" silently fails and the browser keeps its stale cookie.
   The symptom (sessions that "refuse" to re-auth + intermittent
   login-page reads) is this trap's fingerprint. Always single-quote.
2. **REF's session TTL is short (~5 min idle/sequential-load)** — the
   census re-auths every 15 routes and detects login-page reads; a
   combined orchestrator can outlive the cookie — run ladder
   components individually when the combined run shows session-death
   DIFFs.
3. **A bg+backgroundImage census beats a backgroundColor-only census**
   — the payrollengine bug computed the "right" color while the
   gradient image painted over it.
4. **The client-rendered 404 needs content waits** — the census read
   the clone at 500ms and saw no buttons (the Go Home renders after
   the client boot); REF renders it server-side.
5. **Set-comparison hides mapping inversions** — the r58-24 "byte
   identical" claim compared fill sets, not per-button mappings.
6. **The sweep's bare user delete P2003s when the stray carries a
   NotificationPreference** — the sweep now walks the non-cascade FKs
   (notifprefs/auditlogs/aichats) before the delete.
7. **Color reads must settle the transition** — `transition-colors`
   (150ms) means a color read immediately after a theme toggle catches
   the mid-flight blend (rgb(60,60,60) between #fafafa and #171717);
   the E2E waits 350ms after the toggle.

## Gates

lint 0/0 · tsc ✓ · **834/834 unit** (+6, RED-first; the R32-A9 /
R48-C2b / R58-8..12 legacy pins amended to the re-measured truths) ·
build ✓ · **297/297 E2E** (+6, no flakes) · post-fix census **45/49
MATCH** (the four documented DIFFs: the profile role text, the
employees with-data leaves, REF's live careers postings, the 404 tag
superset) · confirmation ladder green (standing 5/5 + sweep 12/12 +
verify-r49 13/13 + verify-r45 13/13) · deploy watch BOTH SIDES QUIET
(login `CpCk8Zmk`/`A8a43VEI`, app `C-IrDy5f`/`BGNH4KkS`) · DB pristine
(1/1/2 after the loading-probe sweep with the FK walk) · **458
screenshot files** (+10: the 270-273 pairs + the 274/275 settings
inline-edit evidence, all hash-verified distinct).

## The frontier after this round

The dark-mode fill family is censused and closed: the checkbox, the
toggle pair, the compliance tints, the blue split, and the flat
emerald all match REF's computed truth in BOTH themes, and the
settings Company edit renders REF's inline 12-field recipe with the
working superset. Open items: the Next.js 16.4.0 history bug (the
upgrade watch — the one recorded functional divergence whose fix lives
upstream), the login build stays under ACTIVE development (the watch
stays armed at `CpCk8Zmk`/`A8a43VEI`), the with-data superset surfaces
stay REF-unmeasurable at the shared demo's zero state (REF's own write
paths are broken live — re-verified this round on the settings Save),
and the byte-parity backlog remains documented-allowance territory
(the 404 tag superset joins the profile role text, the employees
with-data leaves, and the careers live data).
