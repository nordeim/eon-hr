# Remediation Plan — Session 33 / Parity Round 32

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app),
viewports pinned (1440×900 desktop, 390×844 mobile). This round's census
targeted a never-audited dimension: the **sidebar footer controls** (Moon /
عربي) — which opened the dark-theme and RTL dimensions both apps actually
ship. Baseline at HEAD `c4287e7` carried ONE stale pin (R31-C6 still
expected the PageHeader prop pattern after round-31's live-verification
rebuilt the payrollreports header by hand — the final unit re-run was
skipped): 479/480 before the fix, 480/480 after; lint 0/0 · tsc ✓ ·
build ✓ · 121/121 E2E. DB pristine (users=1, employees=1,
leaveBalances=2, payroll=0, expenseClaims=0, tasks=0, candidates=0, jobs=0).

## The census — REF's footer controls are REAL, and the clone's were stubs

1. **REF's Moon toggles a full dark theme.** Live-measured on REF:
   `html.dark` + `localStorage.darkMode="true"`, body `rgb(10,10,10)` /
   `rgb(250,250,250)`, cards `#0a0a0a` + border `#262626`. The authoritative
   `.dark` block was extracted verbatim from REF's live stylesheet — the
   stock shadcn **neutral** palette (`--background: 0 0% 3.9%` …
   `--border: 0 0% 14.9%`), persisted across reloads. The clone's Moon
   toggled `.dark` with ZERO dark styles authored — a display-only stub
   (the no-op defect this round eliminates).
2. **REF's عربي toggles RTL mode.** `dir=rtl` + `localStorage.app_lang=ar`
   — the whole layout mirrors (desktop sidebar x=1184, mobile hamburger
   x=338, bottom tabs mirrored [315,255,189,81,10]); the strings stay
   English (i18n not wired), the drawer stays physically left-anchored,
   and the button flips to "EN" with an Arabic title
   ("التبديل إلى الإنجليزية"). The clone's عربي flipped its label only.
3. **A 31-round-invisible LIGHT find**: REF's desktop aside is authored
   `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800` —
   it renders **white** in light (rgb 255,255,255), while the clone's
   `bg-sidebar` renders #fafafa (rgb 250,250,250). Every prior audit
   compared sidebar GEOMETRY (navmap) or the MOBILE drawer (which is the
   `--sidebar-background` token = #fafafa on both apps) — never the
   desktop aside's computed background. 5 sRGB units, 31 rounds.

## REF dark-mode ground truth (all live-measured this round)

| Surface | Light | Dark (REF) |
|---|---|---|
| html / storage | — | `.dark` + `darkMode="true"` (persists reload) |
| body | #ffffff / #0a0a0a | #0a0a0a / #fafafa (token flip) |
| shell canvas | slate-50→blue-50 (sRGB) | **slate-900→slate-800** `#0f172a→#1e293b` (dark: classes) |
| desktop aside | **bg-white** + border-slate-200 | **slate-900 bg + slate-800 border** (dark: classes) |
| mobile drawer | bg-sidebar #fafafa + border-r default token | **bg-sidebar flips rgb(24,24,27)** (= hsl 240 5.9% 10%) + border token #262626 |
| brand h2 (sidebar, both variants) | text-slate-900 | **dark:text-white** |
| active nav | #1877F2 | **stays #1877F2** (custom blue does not flip) |
| inactive nav / bell / عربي text | slate-600 / slate-600 / slate-700 | all stay (hardcoded) |
| footer border | border-slate-200 | **dark:border-slate-800** |
| Moon icon | zinc-700 (inherits sidebar-foreground) | **zinc-100** rgb(244,244,245); swaps to Sun |
| cards | bg-card + border token | #0a0a0a + #262626; /settings card keeps hardcoded **border-slate-200** |
| page tab list (all tabbed pages) | bg-white + border-slate-200 (page overrides) | stays (hardcoded) |
| tab inactive | #737373 (neutral-500) | **#a3a3a3** (neutral-400) |
| tab active | bg-background + text-foreground | flips via tokens |
| mobile header | bg-white + border | **slate-900 + slate-800** (dark: classes) |
| mobile brand h1 / kicker h1s | text-slate-900 | **stay slate-900** (no dark:) |
| bottom nav | bg-white | **slate-900 + slate-800** |
| bottom tabs inactive | text-slate-600 | **slate-400** |
| bottom tabs active | text-blue-600 + bg-blue-50 | **blue-400 + blue-900/20** |
| gradient CTAs | blue→indigo + text #fafafa | gradient stays, **text #171717** (measured /employees + /templates) |
| bg-primary CTAs (send buttons, empty-state) | #171717 + #fafafa text | **#fafafa bg + #171717 text** (measured /hrassistant send) |

The extracted `.dark` token block (verbatim from REF's live CSS):
background/card/popover `0 0% 3.9%`; foregrounds `0 0% 98%`;
primary-foreground `0 0% 9%`; secondary/accent/muted/border/input
`0 0% 14.9%`; muted-foreground `0 0% 63.9%`; destructive
`0 62.8% 30.6%` (= #7f1d1d red-900); ring `0 0% 83.1%`;
sidebar-background `240 5.9% 10%` (= rgb(24,24,27)).

## Gap groups

### R32-A — the dark theme (the headline)

1. **globals.css restructure** to the shadcn runtime-var pattern: a
   `:root` block carrying today's light pins verbatim, a `.dark` block
   with REF's extracted palette (hex forms pinned per trap 1/2), and
   `@theme inline` mapping `--color-*: var(--*)` indirection. Tokens that
   must NOT flip: `--primary` (#1877f2 — the active-nav/CTA blue REF
   authors via custom classes), `--link`, the v3 palette families,
   shadows, radii, font. New palette pin: `--color-neutral-400: #a3a3a3`
   (the dark inactive-tab color). Body base keeps the white light base;
   dark body comes from the token flip (background-color: var? — body
   uses `background-color: #ffffff` literally today; switch to the
   `--background` var so it flips).
2. **The toggle + persistence + pre-paint** (sidebar-nav.tsx + layout):
   Moon initializes from `localStorage.darkMode === "true"`, writes it on
   toggle, swaps Moon↔Sun (existing). A tiny pre-paint script in the root
   layout reads `darkMode`/`app_lang` and sets `.dark`/`dir` before first
   paint (no FOUC; REF persists across reload — verified).
3. **app-shell.tsx**: canvas `dark:bg-[linear-gradient(to_right_bottom,#0f172a,#1e293b)]`
   (trap-3 sRGB pin); aside → `border-slate-200 dark:border-slate-800
   bg-white dark:bg-slate-900` (also the R32-E light fix); mobile header
   + bottom nav gain `dark:bg-slate-900 dark:border-slate-800`; bottom
   tabs gain `dark:text-slate-400` (inactive) and
   `dark:bg-blue-900/20 dark:text-blue-400` (active).
4. **sidebar-nav.tsx**: brand h2 `dark:text-white`; moon button
   `dark:text-zinc-100`; brand-row border `dark:border-slate-800`. The
   nav/bell/عربي/user colors stay hardcoded (REF's own behavior).
5. **button.tsx**: the `dark` variant tracks REF's bg-primary flip —
   `dark:bg-[#fafafa] dark:hover:bg-[#fafafa]/90` (text flips via the
   primary-foreground token to #171717 — the measured /hrassistant send
   contract).
6. **tabs.tsx**: TabsList gains `dark:text-neutral-400` (the inactive
   trigger flip; list bg/border stay hardcoded by the pages).
7. **checkbox.tsx / avatar.tsx / chat + hrassistantchat pages**: the
   `text-primary-foreground` surfaces gain `dark:text-white` (own-chat
   bubbles + timestamps gain `dark:text-white/70`) — REF's zero-data
   surfaces hide these controls in dark (unmeasurable), so readable-blue
   is the documented superset decision; light rendering is untouched.
8. **Drawer (no code)**: `bg-sidebar` + `border-r` flip via the tokens —
   measured REF parity (rgb(24,24,27) + #262626).

### R32-B — the RTL superset (عربي)

The toggle flips `document.documentElement.dir` rtl↔ltr and persists
`localStorage.app_lang` ("ar"/"en"); the boot script applies it pre-paint.
The label flips عربي↔EN (existing) and the title flips to the Arabic
string while in Arabic mode (REF-measured). Everything else mirrors via
dir=rtl for free (flex layouts; the drawer is `left-0` fixed — REF keeps
it left-anchored in RTL too, verified x=0 wrapper). The swipe-to-close
direction is unchanged (drawer stays left-anchored).

### R32-C — swipe-to-open (the mobile-menu superset, round-30's frontier)

A horizontal-dominant RIGHTWARD touch starting within 32px of the left
viewport edge (mobile, drawer closed) opens the drawer (fires at ≥24px
drag; the panel then plays its own 500ms slide-in). Handlers live on the
main column wrapper — the bottom nav and the drawer panel are siblings,
untouched; vertical scrolls are ignored via the dominant-axis guard; the
at-rest DOM is unchanged (interaction-state only, the R30-D pattern).

### R32-D — the stale baseline pin (done first)

R31-C6 pinned to the raw `<h1>` (the hand-rolled header round-31 actually
shipped): 479/480 → 480/480.

### R32-E — the desktop aside light find

Covered by R32-A.3: `bg-sidebar` → `bg-white` (+ the dark: variants).
The `--color-sidebar` token itself stays pinned #fafafa — the MOBILE
DRAWER still renders it (REF's drawer is the `--sidebar-background` token
in light = #fafafa, byte-verified round-31); only the desktop aside moves
to REF's authored `bg-white`.

## Verified non-gaps (documented, no action)

- The standing audits from round 31 hold at c4287e7 (redeploy 12/12,
  mobile chrome, sidebar navmap — re-run clean this round after the
  baseline fix).
- REF's mobile brand h1 + page kicker h1s stay slate-900 in dark
  (hardcoded) — the clone's identical classes stay too (no action).
- REF's own broken dark bits (user name text-slate-900 on slate-900,
  gradient-CTA #171717 text on blue) are replicated where measured —
  parity over polish on measured surfaces; the clone's superset fixes
  are confined to UNMEASURABLE surfaces (checkbox/avatar/chat bubbles).
- The /settings card `border-slate-200` (hardcoded, stays in dark):
  the clone's settings Card renders the token border (#e5e5e5 light).
  REF's renders #e2e8f0 — a 3-unit light diff on ONE page's cards.
  Deferred: below the visibility threshold this project has historically
  enforced for non-census surfaces; noted for a future micro-round.

## Execution order (TDD)

1. RED pins (`tests/unit/recipes.test.ts` session-33 block + the
   `tests/unit/tokens.test.ts` evolution): the runtime-var structure
   (`:root`/`.dark`/`@theme inline` indirection via lastIndexOf slices),
   the dark palette pins, the non-flipping pins (primary/link), the
   component dark-class pins (canvas, aside, header, nav, tabs, brand,
   moon, button dark variant), the Moon/عربي persistence contracts, the
   dir toggle contract, the swipe-to-open contract.
2. GREEN: globals.css restructure → app-shell → sidebar-nav → button →
   tabs → checkbox/avatar/chat pages → layout boot script.
3. E2E: `tests/e2e/dark-mode.spec.ts` (toggle, persistence across
   reload, pre-paint boot, moon↔sun, عربي↔EN + dir + app_lang) + the
   swipe-to-open block in `drawer-swipe.spec.ts` (CDP touch, the R30-D
   lessons: settle + inter-phase frames) + `expect.poll` for every
   color assertion (the transition-all race the previous session hit).
4. Gates: lint → typecheck → unit → build → E2E.
5. Live dual-browser verification: the dark sweep (localStorage-driven
   on BOTH apps — the moon-click race desyncs sessions; REF set via
   `localStorage.setItem('darkMode','true')` + reload, clone the same),
   the RTL spot-check, then the light regression sweeps (redeploy 12,
   mobile chrome, sidebar navmap — with the aside now bg-white).
6. Screenshots: dark dashboard/desktop + dark mobile + RTL pair + the
   swipe-to-open sequence → `docs/screenshots/`.
7. Docs: AGENTS session-33 layer + counts, SKILL version + section, PAD
   [S33], CLAUDE/README counts, `docs/session_61.md` + `docs/session_62.md`,
   worklog, this plan's completion record.

## Completion record (session 33)

Rebuilt in full after the workspace reset (the prior attempt's
unpushed work was lost; the ground truth was re-measured from REF).

- **R32-A**: the globals.css runtime-var restructure landed with REF's
  extracted `.dark` palette; the app-shell/sidebar-nav/button/tabs
  dark classes per the live measurements; the pre-paint THEME_BOOT;
  Moon persistence; the class-driven Moon↔Sun swap. The round's NEW
  engine lesson: **v4's `dark:` variant defaults to a
  prefers-color-scheme media query** — `@custom-variant dark
  (&:where(.dark, .dark *))` is required (found via E2E: dark:hidden
  stayed visible under html.dark). Dark readability supersets:
  checkbox/avatar/chat-bubble text stays white (light untouched).
- **R32-B**: the عربي dir flip + app_lang persistence + the Arabic
  title; the layout mirrors via dir=rtl; E2E-pinned (8 dark-mode
  specs incl. the RTL triple).
- **R32-C**: the swipe-to-open superset (EDGE=32, OPEN_THRESHOLD=24,
  rightward + dominant-axis, main-column handlers) — E2E-pinned (the
  quartet: open / sub-threshold / outside-window / vertical-guard).
- **R32-D**: the stale R31-C6 pin fixed first (479/480 → 480/480 at
  baseline).
- **R32-E**: the desktop aside → REF's authored `bg-white
  dark:bg-slate-900 border-slate-200 dark:border-slate-800`; the
  drawer keeps the token (flips #18181b, live-verified MATCH).

Gates: lint 0/0 · tsc ✓ · 493/493 unit (+13 net) · build ✓ ·
133/133 E2E (+12). Live-verified: the dark sweep byte-identical
(/dashboard, /employees, /settings — body/canvas/card/sidebar/tabs/
CTA endpoints), the dark drawer byte-identical, the RTL mirror
matches, the light regressions 12/12 + mobile chrome + navmap
byte-identical. Five probe DIFFs resolved as documented artifacts.
6 new screenshots (109/109b/110/111/112/113) → 133 PNG captures.
DB pristine.
