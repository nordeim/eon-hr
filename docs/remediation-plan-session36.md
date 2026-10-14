# Remediation Plan — Session 36 / Parity Round 35

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app),
viewports pinned (1440×900 desktop, 390×844 mobile). Baseline at HEAD
`a754971` ALL GREEN: lint 0/0 · tsc ✓ · 521/521 unit · build ✓ · 142/142
E2E.

## The redeploy watch (the round's opening event)

REF's **/login page now links a NEW static build** — `/static/index-D0Q6-tUz.css`
+ `/static/index-CneaUv24.js` (was the app-chunk-served page). The new CSS
chunk carries a zinc-flavored shadcn `:root`/`.dark` layer (`--foreground:
240 10% 3.9%`), but the login page's rendering is **byte-identical to the
clone** (full layout map re-measured: card 448×842, h1 30px slate-900, social
btns 368×54 ×3, inputs 368×48, the error Alert 368×54 with red-50/70 +
red-200 + red-700 text-sm, "Invalid email or password", noValidate=false).
The **app's own chunks are UNCHANGED** (`index-C-IrDy5f.js` +
`index-BGNH4KkS.css` — verified live post-login) → every app-level pin
holds; every diff below is clone-side. REF remains zero-data ("Manage your
0 employees").

## The census — the footer-menu family + the settings tab interiors

Round 34 took the dialog interiors and the deep-RTL shell. This round's
census took the next never-audited surfaces: the **user-dropdown menu**
(the footer user button — round 22 pinned only its MOTION, never its
interior), the **menu-family recipes** (the shared dropdown/select
components), the **compliance filter selects' option sets**, the **404
page** (round 10 pinned only the two headings), and the **settings tab
interiors** (round 13 pinned only the tab strip + the Company card — the
six non-Company tab bodies were never inventoried).

Probe lessons this round: (1) **synthetic `el.click()` does not open Radix
portals** — the CDP-level `agent-browser click @ref` is required (the first
"REF's user button is inert" reading was this artifact, caught before it
became a false non-gap); (2) the exported `DATABASE_URL` in the sandbox
shell silently overrides `.env` for the standalone server (the AGENTS.md
trap — the LOC server opened the wrong DB until `env -u DATABASE_URL`).

### Findings

1. **The user-dropdown menu carries six gaps** (all live-measured at
   1440×900): the clone renders an invented `DropdownMenu.Label` ("Admin")
   + Separator REF does not render (clone 200×111 vs REF **192×74**);
   `align="start"` vs REF's **`align="end"`** (menu right-edge 239 = the
   trigger's right-edge; x=47); `sideOffset={8}` vs REF's **4** (menu
   bottom 844, trigger top 848); `min-w-[200px]` vs REF's content-sized
   192 (min-width 128 — the shadcn default); container `rounded-lg` vs
   REF's **6px (rounded-md)**; items `cursor-pointer rounded-md` vs REF's
   **`cursor-default rounded-sm`** (the newer shadcn item recipe —
   measured on both REF items).
2. **The same recipe drift is systemic** in the shared components:
   `ui/dropdown-menu.tsx` (container rounded-lg; items cursor-pointer
   rounded-md) and `ui/select.tsx` (container rounded-lg vs REF's
   **rounded-md 6px** live-measured on the compliance All Types select;
   items cursor-pointer rounded-md vs REF's **cursor-default
   rounded-sm**). REF's measured contracts: menu container `z-50 min-w-8rem
   rounded-md border bg-popover p-1 shadow-md`; items `relative flex
   w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2
   pr-8 text-sm outline-none transition-colors focus:bg-secondary` (select)
   / `... gap-2 px-2 py-1.5 ... focus:bg-accent` (dropdown).
3. **The compliance filter selects carry wrong option sets** (never
   audited): the document-type list is the clone's invented
   `contract/id/passport/visa/certificate/medical/other` (8) vs REF's
   **`Iqama, Visa, Passport, Contract, Probation`** (6 incl. All Types —
   the Saudi-specific taxonomy); the window filter's labels are "All
   Alerts / Expiring ≤ 7 days…" vs REF's **"All / Expired / Within 7 days
   / Within 15 days / Within 30 days"** (the at-rest trigger reads "All").
   The stat tiles keep the "Expiring ≤ N days" labels (re-verified) — the
   two surfaces use different taxonomies on REF.
4. **The 404 page carries five gaps**: the "404" H1 is slate-900 vs REF's
   **slate-300** (rgb 203,213,225); "Page Not Found" is slate-900 vs REF's
   **slate-800**; the sentence **'The page "{route}" could not be found in
   this application.' is missing** (16px slate-600, the route in a quoted
   500-weight slate-700 span); the **Go Home button is missing** (123×38
   outline, white bg, slate-200 border, 8px radius, centered, pt-6
   wrapper); the **per-route title is missing** (REF: `"{LastSegment}" |
   Eon HR` — the LAST path segment, first-letter capitalized, measured on
   /nonexistentroute123 → "Nonexistentroute123 | Eon HR" and /foo/bar →
   "Bar | Eon HR"; the sentence carries the FULL path "foo/bar").
   Plus the logged-out contract: REF **redirects to /login** (the clone
   renders a canvas-gradient 404 block — round 10's "unmeasurable"
   assumption, now measurable).
5. **The settings tab interiors (the headline)**: all six non-Company
   tabs diverge. Common drift: the clone renders H3 titles (24px box) +
   invented CardDescriptions; REF renders **border-b DIV titles, 16px
   leading-none, no description** (the R11 recipe). Per tab (REF ground
   truth, all live-measured):
   - **Departments**: Add Department **180×36** (h-9, header-aligned) —
     clone 158×32; empty = **48px icon** (clone 64) + P "No departments
     yet" (**16px slate-500**, clone: H3 18px slate-900) + P **'Click
     "Add Department" to create your first department.' (14px
     slate-400)**; card 339h.
   - **Approval Workflows**: empty = 48px icon + **single P "No workflows
     configured"** (16px slate-500 — no second line; clone: two lines with
     invented copy); card 283h.
   - **Shifts**: title **"Work Shifts"** (clone: "Shifts"); empty = 48px
     icon + single P **"No shifts configured"**; card 283h.
   - **Integrations**: REF renders **FOUR real integration tiles in a 2×2
     grid** (`p-6 border border-slate-200 rounded-lg flex items-center
     justify-between`, 527×98): WhatsApp (chip `w-12 h-12 bg-green-100
     rounded-lg` + span "WA" `text-green-700 font-bold text-lg` + H3 +
     text-sm slate-500 desc + outline Connect 92×36) · SMS Gateway (chip
     "SMS" blue-700/blue-100 + Configure 102×36) · Email Service (chip "@"
     slate-700/slate-100 + an **"Active" badge**, no button) · **ZKT BioTime
     Cloud** (chip "ZKT" indigo-700/indigo-100 + Connect). The clone
     renders ONE invented "Slack" tile (icon chip + a dark Connect).
   - **Theme & Layout**: REF renders a **real theme form**: border-b header
     ("Theme & Layout Settings" + a dark **Save Theme** button 36h) ·
     "Colors" H3 (18px) + three color fields (Primary/Secondary/Accent —
     `space-y-2` fields with `text-sm font-medium leading-none` labels + a
     64×40 color input + a 269×36 hex text input; values **#1877f2 /
     #42b72a / #e4e6eb** = the html-token triple) · a Preview box
     (`mt-4 p-4 bg-slate-50 rounded-lg`, 144h, "Preview:" text-sm
     slate-600 mb-3) · a `pt-6 border-t` Layout Settings section (H3 +
     "Menu Position" label + a combobox 1070×36 reading "Left Sidebar" +
     two 16×16 checkboxes: "Allow sidebar to collapse" [checked] + "Start
     with sidebar collapsed"). The clone renders invented content
     (Compact Mode / Density / Reset to defaults).
   - **System Logs**: REF renders a **log-viewer shell**: border-b header
     ("System Audit Logs" + "0 total logs" 14px slate-600 right) + a
     filter grid (Search input + User select "All Users" + Action select
     "All Actions" + From/To date inputs, labels 14px, inputs 36h, a
     **Clear Filters 97×32 size-sm** button) + the empty line **"No logs
     found matching your filters"** (16px slate-500, no icon); card 439h.
     The clone renders an invented empty state.

## Verified non-gaps (documented, no action)

- The mobile chrome + drawer **byte-identical** (header 73h; bottom tabs
  x=10/79/139/204/313 at y=775, active blue-600; drawer panel 288@x0
  #FAFAFA + 1px #e5e5e5 border-right; overlay 390×844 rgba(0,0,0,0.8)) —
  the standing user-priority check; **no Tailwind v4 bug**.
- The bell popover **byte-identical** — element-for-element interiors
  (384×175, header 49h, the 32px bell + "No notifications yet").
- The login page post-redeploy: layout + error Alert + noValidate=false —
  byte-identical (above).
- The documenttracker status chips (All/valid/expiring soon/expired/
  pending upload) — byte-identical positions and colors.
- The toast card interior stays unmeasurable (no toaster renders outside
  the dashboard; no non-persisting REF action fires one — Notify All is a
  silent no-op at zero data).
- requestsettings empty-submit: REF is a silent no-op (no toast, no HTML5
  blocking — inputs not required); the clone's error toast is the
  documented superset (at-rest surfaces match).
- REF's dashboard "Customize" button is inert; the clone's dialog is the
  documented superset.
- The with-data surfaces remain blocked on REF's zero-data account.

## Gap groups

### R35-A — the user-dropdown menu (sidebar-nav.tsx UserMenu)

Rebuild to REF's measured contract: drop the Label + Separator; Content
`side="top" align="end" sideOffset={4}`; drop `min-w-[200px]` (the
content sizes itself, min-w stays the shadcn 8rem); container
`rounded-md` (6px); items keep the Link a11y superset but adopt REF's
recipe: `relative flex cursor-default select-none items-center gap-2
rounded-sm px-2 py-1.5 text-sm outline-none transition-colors
focus:bg-accent focus:text-accent-foreground data-[disabled]:...`.
My Profile stays neutral-950; Logout stays red-600. The mobile drawer's
user menu shares the component — both surfaces fixed at once.

### R35-B — the systemic menu-family recipes (ui/dropdown-menu.tsx + ui/select.tsx)

- `dropdown-menu.tsx` Content: `rounded-lg` → `rounded-md`; Item:
  `cursor-pointer rounded-md` → `cursor-default rounded-sm` (+
  CheckboxItem the same).
- `select.tsx` Content: `rounded-lg` → `rounded-md`; Item: `cursor-pointer
  rounded-md` → `cursor-default rounded-sm`.
- These are the shadcn-default recipes REF actually ships (measured on the
  compliance selects live); the with-data action menus (loans, taskmanager,
  recruitment) inherit the correction.

### R35-C — the compliance filter selects

- `TYPE_OPTIONS` → `["all", "iqama", "visa", "passport", "contract",
  "probation"]` (REF's exact six).
- `FILTERS` labels → `All / Expired / Within 7 days / Within 15 days /
  Within 30 days` (the select taxonomy; the stat tiles keep their own
  "Expiring ≤ N days" labels — re-verified REF renders both taxonomies).
- `/api/documents` `DOC_TYPES` → `["iqama", "visa", "passport",
  "contract", "probation", "other"]` (the five REF types + the model's
  default fallback; the schema comment updated). No E2E or seed data uses
  the old types (verified by grep).

### R35-D — the 404 page (not-found.tsx)

Rebuild to REF's measured contract:
- Logged-out: `redirect("/login")` (REF's guard behavior — the round-10
  "unmeasurable" assumption corrected).
- Logged-in (inside the shell): the centered stack — H1 "404"
  `text-7xl font-light text-slate-300`; H2 "Page Not Found" `text-2xl
  font-medium text-slate-800` (mt measured 34px ≈ the current mt-8);
  the sentence P `text-base text-slate-600` — 'The page '
  + span `font-medium text-slate-700` '"{pathname}"' + ' could not be
  found in this application.'; a `pt-6` wrapper with the centered **Go
  Home** button (outline, `border-slate-200 rounded-lg px-4 py-2 text-sm
  font-medium text-slate-700`, href "/dashboard").
- The pathname + title come from a client island (`usePathname()`) — the
  sentence renders the full path as-is; the title is set to
  `"{LastSegment capitalized} | Eon HR"` via document.title (the metadata
  API cannot see the unmatched path server-side).

### R35-E — the settings tab interiors (the headline)

All six non-Company tabs rebuilt to the measured contracts:
- Common: border-b CardHeader with the title-only 16px leading-none DIV
  (the R11 recipe); the invented CardDescriptions removed.
- Departments: Add Department → h-9 (180×36 measured); the empty state →
  48px icon + P "No departments yet" (16px slate-500) + P 'Click "Add
  Department" to create your first department.' (14px slate-400).
- Approval Workflows: empty → 48px icon + single P "No workflows
  configured".
- Shifts: title "Work Shifts"; empty → 48px icon + single P "No shifts
  configured".
- Integrations: the four REF tiles (WhatsApp/SMS/Email/ZKT) with the
  text-chip recipe (`w-12 h-12 {color}-100 rounded-lg` + `{color}-700
  font-bold text-lg` initials) + outline Connect/Configure buttons (92-102
  ×36) + the Email "Active" badge; the Connect/Configure buttons fire the
  documented not-configured toast (the social-button superset pattern).
- Theme & Layout: the real form — three color fields (64×40 color input +
  hex text 269×36, values from the html-token triple #1877f2/#42b72a/
  #e4e6eb) + the Preview box + the Layout Settings section (Menu Position
  select "Left Sidebar" + the two checkboxes) + the dark Save Theme
  header button. Superset wiring: Save Theme applies the three custom
  properties to document.documentElement.style (persisted to
  localStorage, restored by the existing THEME_BOOT script's sibling).
- System Logs: the log-viewer shell — "System Audit Logs" +
  "{N} total logs" header, the five-field filter grid (Search/User/
  Action/From/To + Clear Filters 97×32 size-sm), the "No logs found
  matching your filters" empty line; wired to the existing
  /api/audit-logs endpoint (the data superset; zero-data renders the
  empty line exactly).

## Execution order (TDD)

1. RED pins: the session-36 block in `tests/unit/recipes.test.ts`
   (R35-A/B/C/D/E source contracts — the recipe strings above) +
   the shell-recipe pin for the UserMenu contract.
2. GREEN: sidebar-nav UserMenu (R35-A) → ui/dropdown-menu.tsx +
   ui/select.tsx (R35-B) → compliance page + documents API (R35-C) →
   not-found.tsx (R35-D) → settings tabs (R35-E, smallest-first:
   Workflows/Shifts/Departments → Integrations → System Logs → Theme).
3. E2E: a new user-menu spec (real-click open; the geometry + items +
   no-label contracts) + the 404 spec (the sentence + Go Home + title +
   the logged-out redirect) + the settings-tabs contracts (Integrations
   tiles + System Logs shell + the empty recipes) + the compliance
   select options.
4. Gates: lint → typecheck → unit → build → E2E.
5. Live dual-browser verification: the user menu pair (desktop + the
   drawer's), the select pair, the 404 pair, the six settings tab pairs,
   the compliance select pair; the standing audits (mobile chrome, login,
   bell popover, navmap).
6. Screenshots: the user-menu pair, the 404 pair, the settings pairs
   (Integrations + Theme + System Logs), the compliance select pair →
   `docs/screenshots/`.
7. Docs: AGENTS session-36 layer + counts, SKILL version + §48, PAD
   [S36], CLAUDE/README counts, `docs/session_70.md` +
   `docs/session_71.md`, worklog, this plan's completion record.

## Completion record (session 36)

Delivered in two windows (session 70 + session 71; see
docs/session_70.md + docs/session_71.md):

- **R35-A** (user menu): DONE + AMENDED — the w-48 re-measure (192px
  fixed, CircleUser/LogOut, 16px icon-to-text) and the Logout
  Link-prefetch bug fix (a real button; pin A6 + the regression spec).
- **R35-B** (shared dropdown/select recipes): DONE (rounded-md
  containers, cursor-default rounded-sm items).
- **R35-C** (compliance taxonomy + documents API): DONE (Iqama, Visa,
  Passport, Contract, Probation).
- **R35-D** (the 404): DONE + AMENDED (F11: the min-h-screen wrapper +
  bg-slate-50, content at y=306; F12: the Go Home icon).
- **R35-E** (settings tabs): DONE + AMENDED (the R35-F family — the
  dark-solid header actions, the Create Approval Workflow + Add Shift
  dialogs with real persistence, the Quick Presets, the Save Theme
  icon, the Logs slate-50 island + the 48px FileText empty).
- Gates at delivery: lint 0/0 · tsc ✓ · 556/556 unit · build ✓ ·
  157/157 E2E. Live: 11/12 pair MATCH (the 404's Go Home = the
  clone's real link, REF a JS button — the documented superset).
  16 screenshots (128-135) → 172 PNG. DB pristine.
