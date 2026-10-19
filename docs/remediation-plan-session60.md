# Remediation plan — session 60 (parity round 59): the dark-mode fill family

> The round-58 frontier said the badge/chip fill family is censused and
> closed (light mode). This round's census took the SAME union read
> (button fills + non-button leaf fills — the r57 + r58 families) into
> **DARK MODE** (`html.dark`, the `localStorage darkMode="true"` contract
> both apps share — session 33's live measurement), all 49 routes paired
> live (`scripts/r60-darkfill-census.mjs`). Pre-fix: **39/49 MATCH**.
> Seven real findings + three documented allowances. Two of the seven
> (R60-C, R60-B) turned out to be light-mode gaps too — the earlier
> censuses never read TEXT colors or the settings edit state.

## The round's context

- Workspace re-cloned from `cfce320` (the round-58 landing + the
  session-120 narrative). Environment rebuilt (.env with
  `DATABASE_URL="file:../db/custom.db"` + a generated AUTH_SECRET; db
  pushed + seeded; playwright chromium installed).
- Baseline gates ALL GREEN: lint 0/0 · tsc ✓ · **828/828 unit** ·
  build ✓ · **290/291 E2E** (1 session-58 switch/checkbox spec flake
  under full-suite load, 11/11 green in isolation — the documented
  flake-check pattern, re-met this window).
- The skills audit (Phase 2): the session-59 delta re-audited fresh-eyed
  (the four chip/badge/palette files — clean; the CircleCheckBig import
  verified; the template-string interpolations ride the static `col.chip`
  constants; `!important` confined to the 15 documented globals.css
  blocks). Structural counts verified (62 page files = 61 routes + login /
  57 API files / 48 models / 37 E2E spec files). scandihaven unchanged
  (`d4789c3`).
- The deploy watch: **BOTH SIDES QUIET** (login JS `CpCk8Zmk` / CSS
  `A8a43VEI` — the 23rd deploy's fingerprints still live; app
  `C-IrDy5f`/`BGNH4KkS` unchanged). No re-audit required.
- The confirmation ladder: standing **5/5** + route sweep **12/12** +
  **verify-r49 13/13** + **verify-r45 13/13** (the r52-login-reaudit).
  The loading-probe user swept after (the known verify-r45 trap).

## THE INSTRUMENT LESSONS (this round — carry forward)

1. **The `"$Abcd1234"` shell-expansion trap**: a password fill passed in
   DOUBLE quotes inside an execSync template literal expands `$Abcd1234`
   (an unset shell variable) to the EMPTY STRING — every "re-auth"
   silently fails and the browser keeps its stale cookie. All r60 probe
   scripts were fixed to single quotes mid-round; the symptom (sessions
   that "refuse" to re-auth) is the fingerprint of this trap.
2. **REF's session TTL is short (~5 min idle/sequential-load)** — the
   census re-auths every 15 routes and detects login-page reads (the
   LOGINISH retry). A combined orchestrator run can outlive the cookie;
   run ladder components individually when the combined run shows
   session-death DIFFs.
3. **A bg+bgImage census beats a backgroundColor-only census**: the
   payrollengine's Generate Payroll computed `rgb(5,150,105)` (matching
   REF) while the blue gradient backgroundImage painted over it — the
   r58 light census read color-only and missed it in BOTH themes.
4. **The client-rendered 404 needs content waits**: the census read LOC
   at 500ms and saw no buttons (the session-aware 404 renders the Go
   Home button after the client boot); REF renders it server-side. With
   equal waits the two 404 recipes are byte-identical — a false-DIFF.
5. **Set-comparison hides mapping inversions**: the r58-24 "the pair
   reads byte-identical" claim compared the fill SET — REF's
   [list-outline, grid-primary] vs the clone's [list-primary,
   grid-outline] carry the same two fills on opposite buttons. The
   r60 census reads buttons in DOM order and exposes the inversion.

## THE DARK-MODE FILL CENSUS (the record)

`scripts/r60-darkfill-census.mjs` — the union read (button fills incl.
backgroundImage + non-button leaf fills), computed, gradients normalized
to their rgb() triple list (the `to right`/`90deg` Chromium serialization
equivalence), all 49 routes paired live at 1440×900, dark armed via the
shared localStorage contract. **Pre-fix 39/49 MATCH / 10 DIFF.**

The ten DIFFs, triaged:

### R60-A — the checkbox dark-mode fill family (REAL; both themes' glyph)

REF's securitysettings checkboxes (5 in dark): the checked form renders
**bg `rgb(250,250,250)` (#FAFAFA — REF's dark `--primary`)** + the check
glyph in **`rgb(23,23,23)`** (#171717 — the dark `--primary-foreground`)
+ the glyph authored at **`h-4 w-4`** (16px). Light mode: bg #171717 +
white check — the r58 pin, still correct. The clone renders `bg-[#171717]`
in BOTH themes (the r58 literal, correct only in light) + a
`dark:data-[state=checked]:text-white` member (wrong in dark) + the
glyph at `h-3 w-3` (12px — **a both-themes divergence**: REF authors
`h-4 w-4`, never measured until now). The r58 comment's assumption ("REF's
zero-data surfaces never render a checkbox in dark") is disproven — the
securitysettings rows render five.

**Fix** (`src/components/ui/checkbox.tsx`):
- `data-[state=checked]:bg-[#171717] dark:data-[state=checked]:bg-[#fafafa]`
  (the r58 switch pattern — REF's `bg-primary` resolution both themes)
- `data-[state=checked]:text-primary-foreground` (the dark
  `--primary-foreground` = #171717 = REF's dark check); drop
  `dark:data-[state=checked]:text-white`
- `<Check className="h-4 w-4" />` (REF's authored size)

### R60-B — the employees default view is GRID (REAL; a light-mode gap)

REF's fresh-loaded `/employees` renders the **GRID toggle as the
active-styled button** (bg-primary #171717 light / #FAFAFA dark + w=40)
and the LIST toggle as the outline (w=42) — measured three independent
loads + a reload test (the state does NOT persist: click list → reload →
grid-active again; no localStorage key changes). The clone defaults to
`view="list"` — the pair's fills are on opposite buttons (the r58-24
"byte-identical" was a set-comparison blind spot). REF's zero-employee
page renders neither view's content, so the toggle pair is the only
visible signal; the clone's seeded employee will render as a grid card
(the with-data superset surface).

**Fix** (`src/app/(app)/employees/page.tsx`):
`useState<"list" | "grid">("grid")` + the finding comment.
**E2E impact** (3 specs): session58 R58-7 (the pair assertions flip),
session59 R59-D2 (click "List view" before the tbody badge read),
dashboard.spec's CRUD flow (click "List view" after the wizard returns,
before the search/delete steps). The filter-row/footer-focus/print/
navigation/sidebar reads are view-independent (verified).

### R60-C — the settings Company edit is an INLINE form flip, not a dialog (REAL; light-mode gap)

REF's CompanyTab **Edit button** (outline h-9, w:93, x:1290 y:281) —
byte-identical on the clone at rest (the earlier "missing Edit" was the
loading-probe cookie artifact). But the **press behavior** diverges: REF
flips the card content into an **inline 12-field edit form** (measured
live: `grid gap-6 md:grid-cols-2` — 523px×2 tracks, 24px gap at 1440;
the labels Company Name, Logo URL, Industry, Company Size (a SELECT —
"Select size"), Address, City, Country, Phone, Email, Website, Tax ID,
Registration Number; the placeholders "Company name" /
"https://example.com/logo.png" / "Technology, Healthcare, etc." /
"Street address" / "City" / "Country" / "Company phone" /
"contact@company.com" / "https://www.company.com" / "Tax identification
number" / "Company registration number"; **Save Changes** (outline h-9,
w:166) replaces the Edit button in the header row; **Cancel** (outline
h-9, w:81) sits at the form's bottom-right). REF's own form renders
EMPTY values and its Save is a **silent no-op live** (no toast, no
persist, the form stays open — the documented REF broken-write-paths
family). The clone currently opens a max-w-lg **dialog** with 9 fields.

**Fix** (`src/app/(app)/settings/page.tsx` + `prisma/schema.prisma` +
`src/app/api/company/route.ts`):
- Schema: `Company` gains `logoUrl`, `city`, `country` (String?, null) —
  the additive superset pattern (db push; the existing columns stay).
- API: `CompanyInput` + `COMPANY_FIELDS` + the PATCH values gain the
  three fields (same Zod shape: optional, trimmed, capped).
- The CompanyTab: `editOpen` flips the **CardContent** into the inline
  form (12 fields, the measured placeholders, the grid, Select for
  size); the CardHeader's Edit button becomes **Save Changes** while
  editing; **Cancel** at the form's bottom-right; the dialog retired.
  The superset: prefilled values (REF's own form is empty — its broken
  write path), the PATCH round-trip, the success toast, the flip back
  to the read-only tiles.

### R60-D — the compliance notify buttons are severity-tinted (REAL; both themes)

REF's three `Notify All ≤ N days` buttons carry per-severity members ON
the outline base — measured live both themes: ≤7
`text-red-600 border-red-200 hover:bg-red-50` (c rgb(220,38,38)), ≤15
`text-orange-600 border-orange-200 hover:bg-orange-50` (c
rgb(234,88,12)), ≤30 `text-yellow-600 border-yellow-200
hover:bg-yellow-50` (c rgb(202,138,4)). The text tints do NOT flip in
dark (the outline bg does). The clone renders the plain outline (text
10/250, border-input). The r14-F pin covered geometry only — the tint
members were never measured.

**Fix** (`src/app/(app)/compliancedashboard/page.tsx`): the per-window
tint members on the three buttons.
**Palette pins** (`src/app/globals.css`): `--color-orange-200: #fed7aa;
--color-orange-50: #fff7ed; --color-yellow-200: #fef9c2 → #fef08a;
--color-yellow-50: #fefce8` (the trap-2 discipline — every shade in
active use; yellow-200 = #FEF08A, corrected).

### R60-E — the blue-600 text-color split (REAL; both themes)

REF's blue-600 buttons split into TWO text treatments (measured live,
light + dark): **`text-white`** (literal — light rgb(255,255,255), dark
rgb(255,255,255)): workflowconfigpage's New Workflow + Create First
Workflow, notificationpreferences' Save Preferences; and
**`text-primary-foreground`** (the flipping token — light
rgb(250,250,250), dark rgb(23,23,23)): recruitmentkanban's Add
Applicant, the chat page's hand-authored new-chat button
(`bg-blue-600 hover:bg-blue-700` + the token). The clone's `blue` Button
variant uses `text-primary-foreground` everywhere (250/23) and the
chat's new-chat uses `text-white` (255/255) — **both sides of the split
are inverted vs REF**. The prior censuses never read button text colors.

**Fix**: workflowconfigpage (2 sites) + notificationpreferences (1
site) get `className="text-white"` on the blue variant (the
tailwind-merge override; 3 sites — smaller than a new variant); the
chat new-chat's `text-white` → `text-primary-foreground`.

### R60-F — the payrollengine Generate Payroll is the FLAT emerald solid (REAL; both themes — a P1-family bug)

REF (light + dark, re-verified with a live session): `bg-emerald-600
hover:bg-emerald-700 text-primary-foreground shadow` — bg
rgb(5,150,105), **backgroundImage: none**. The clone's button passes
`className="bg-emerald-600 text-primary-foreground shadow
hover:bg-[#047857]"` with NO variant → the **default gradient stays in
the class list** (tailwind-merge does not conflict `bg-emerald-600`
with the arbitrary `bg-[linear-gradient(...)]` image class) → the blue
gradient PAINTS OVER the emerald color. The r10-I pin said "flat
emerald-600" — the authoring never delivered it; the r58 light census
read backgroundColor-only and passed it. Visible in BOTH themes.

**Fix** (`src/components/ui/button.tsx` +
`src/app/(app)/payrollengine/page.tsx`): a new `emerald` variant —
`text-primary-foreground shadow bg-emerald-600 hover:bg-emerald-700`
(REF's exact class string; emerald-600/700 are pinned) — and the
payrollengine button takes `variant="emerald"` (the className hack
retired).

### R60-G — the 404 Go Home button (FALSE-DIFF, documented)

`/onboardingtemplates` (a 404 route on both apps): REF's Go Home button
(bg white, c slate-700, h:38, w:123, the focus classes) is
**byte-identical on the clone in BOTH themes** — the census's LOC read
happened before the client-rendered 404 booted (the session-aware page
needs content waits). No code change; the lesson recorded above.

### The documented allowances (no code change)

- **`/profile`**: the role badge text "Admin" vs REF's "User" — the
  R59-C record (the seed's admin role is load-bearing for the superset
  gates). The recipe matches byte-for-byte.
- **`/employees` with-data**: the seeded row's avatar (bg-primary) +
  Active badge — REF's demo has zero employees (REF-unmeasurable; the
  r59 record). The toggle pair itself is fixed by R60-B.
- **`/careers`**: REF's live multi-tenant job postings (46 named
  employer buttons) vs the clone's unseeded public board — a data-level
  divergence (inventing REF's live data would be the R14-E
  anti-pattern).

## The fix plan (TDD)

**Unit pins first (RED)** — a new `describe` block in
`tests/unit/recipes.test.ts` (the session-60 family):
- the checkbox contract (the dark fill member, no `dark:…text-white`,
  the `h-4 w-4` glyph, the light pair unchanged)
- the employees default-view pin (`"grid"` initial state — the source
  contract)
- the compliance per-window tint map
- the blue-600 text split map (the 3 `text-white` sites + the chat's
  token flip)
- the `emerald` variant string (the Button cva map)
- the settings inline-form recipe (the 12-label order, the placeholder
  map, the Save-in-header/Cancel-at-bottom structure, the dialog
  retired)
- the palette pins (orange-200/50, yellow-200/50)

**GREEN** (source order):
1. `src/app/globals.css` — the four palette pins
2. `src/components/ui/checkbox.tsx` — R60-A
3. `src/app/(app)/employees/page.tsx` — R60-B
4. `src/components/ui/button.tsx` + `src/app/(app)/payrollengine/page.tsx`
   — R60-F
5. `src/app/(app)/compliancedashboard/page.tsx` — R60-D
6. `src/app/(app)/workflowconfigpage/page.tsx` +
   `src/app/(app)/notificationpreferences/page.tsx` +
   `src/app/(app)/chat/page.tsx` — R60-E
7. `prisma/schema.prisma` + `src/app/api/company/route.ts` +
   `src/app/(app)/settings/page.tsx` — R60-C (schema push + the inline
   form)

**E2E** (`tests/e2e/session60-dark-fills.spec.ts`, computed truth):
the checkbox dark pair (bg #FAFAFA / check #171717 / 16px glyph) + the
light pair regression; the toggle pair in dark ([outline #0A0A0A +
white text, #FAFAFA + dark text]) and light; the compliance notify text
tints (light + dark); the payrollengine flat emerald (bg + NO
backgroundImage); the blue-600 text split (workflowconfig +
notificationpreferences white in both themes; the chat token flip);
the settings inline edit (press Edit → the 12-field form with REF's
placeholders + Save Changes/Cancel + the working PATCH round-trip +
Cancel restores the tiles).

**Legacy E2E updates** (the R60-B flip): session58 R58-7's two
assertions, session59 R59-D2's List-view click, dashboard.spec's CRUD
List-view click.

**Census re-run** post-fix (the same instrument) → expect **45/49 MATCH**
(the four documented DIFFs: /profile role text, /employees with-data,
/careers live data, and the 404 Go Home tag superset — the fills
byte-identical, the census's button-only read sees REF's <button> but
not the clone's <a>).

**Gates**: lint → typecheck → unit (+~8) → build → db push (R60-C's
schema) → E2E (+~7, the 3 legacy updates) → the census re-run → DB
pristine check → screenshots → docs.

## Completion record (filled at landing)

- [x] The census re-run: **45/49 MATCH** post-fix (was 39/49) — the
      four remaining DIFFs are documented: the profile role text
      (R59-C), the employees with-data leaves (the seeded avatar +
      Active badge), REF's live careers postings (data-level), and the
      404 Go Home (byte-identical computed fills both themes — probe8's
      paired read — but REF renders a <button> where the clone keeps
      the r36-documented <a>-link navigation superset; the census's
      button-only read sees one side).
- [x] R60-A: the checkbox renders REF's both-theme pair (light
      #171717+white, dark #FAFAFA+#171717 check) with the 16px glyph —
      the E2E pins both forms.
- [x] R60-B: the employees page boots GRID-active like REF (the toggle
      pair byte-identical both themes; the 3 legacy E2E flows updated).
- [x] R60-C: the Company edit is REF's inline 12-field form flip with
      the working superset (prefill → PATCH → toast → tiles) — the
      dialog retired; the schema/API gain logoUrl/city/country.
- [x] R60-D: the three compliance notify buttons carry the severity
      tints (computed truth pinned light + dark).
- [x] R60-E: the blue-600 split matches REF (3 text-white sites + the
      chat token flip; computed truth pinned both themes).
- [x] R60-F: the Generate Payroll renders the FLAT emerald solid (no
      backgroundImage — the E2E pins bg + bgi:none in both themes).
- [x] Gates: lint 0/0 · tsc ✓ · **836/836 unit** (+8, RED-first) ·
      build ✓ · **298/298 E2E** (+7 new, 3 legacy updated, no flakes) ·
      the census 46/49 · DB pristine (1/1/2 after the sweep).
