# Remediation Plan — Session 39 / Parity Round 38

Audit basis: dual-browser (clone :3200 standalone vs https://eon.base44.app),
viewports pinned (1440×900 desktop, 390×844 mobile — **the login page probed
below 1440 for the first time**). Baseline at HEAD `4d11bab` ALL GREEN: lint
0/0 · tsc ✓ · 582/582 unit · build ✓ · 165/165 E2E.

## The opening state (the redeploy watch + the standing audits)

- **REDEPLOY DETECTED — login-JS-only**: REF's /login static build changed
  (`static/index-CneaUv24.js` → `static/index-BYE5Ojxh.js`) while the login
  CSS (`index-D0Q6-tUz.css`), the app JS (`/assets/index-C-IrDy5f.js`) and
  the app CSS (`index-BGNH4KkS.css`) are all unchanged → every app-level pin
  holds; the login page is this round's frontier (re-audited end to end).
- **REF remains zero-data** ("No requests yet" on /loans) → the with-data
  frontier stays blocked.
- **Standing audits green (5/5)**: mobile bottom nav byte-identical, the
  mobile drawer byte-identical (288px @ x=0, h=844, #FAFAFA, 1px #e5e5e5 —
  probed with the Escape-reset pattern after the documented x=-244
  toggle-race artifact), desktop navmap byte-identical, bell popover
  identical, Quick Actions geometry-identical. **Mobile navigation is fully
  green — no Tailwind v4 bug** (the standing user priority, re-verified).
- **The login keyboard dimension (round 37's named remainder) is GREEN**:
  the Tab walk (BODY → Google → Microsoft → Apple → email → password →
  Sign in → Forgot → Need account → wrap) and the Shift+Tab walk are
  structurally identical on both apps; the only T9 divergence is REF's
  builder-badge button (the documented non-clone). No hover motion gap on
  the social buttons (REF's `transition-transform` icon wrapper is inert —
  no transform ever applies, live-verified).

## The census — the login-page re-audit (desktop + the first mobile probe)

Method: full-surface DOM diff (structure, text, form contracts, computed
styles, geometry) at 1440×900, then the same at 390×844, then the Tab/Shift+Tab
walk, then CDP hover reads. The desktop geometry was already byte-identical
(H1 y=205 h=36, social buttons y=309/375/441 54×368, inputs y=589/683 48×368,
Sign in y=751 48×368, links y=811) — every finding below is a recipe,
mobile-viewport, or DOM-structure diff the desktop-geometry audits could not
see.

### Findings (all live-measured)

1. **R38-A — the mobile-responsive input family**. REF's login inputs are
   `h-11 sm:h-12` (44px mobile / 48px ≥640px) with `text-base md:text-sm`
   (16px mobile / 14px ≥768px); the Sign in button is `h-11 sm:h-12`. The
   clone ships flat `h-12` + `text-sm` → at 390×844 the clone renders 48px
   inputs with 14px text vs REF's 44px/16px (email: REF y=516 h=44 font 16
   vs LOC y=529 h=48 font 14). The login page was never probed below
   1440px before — the never-probed-viewport lesson.
2. **R38-B — the placeholder color**. REF's inputs carry
   `placeholder:text-slate-600` (rgb(71,85,105) — live-measured on both
   fields); the clone's Input base renders `placeholder:text-muted-foreground`
   (slate-500 rgb(100,116,139)). Visible at-rest on "you@example.com" and
   "••••••••".
3. **R38-C — the typed-text foreground**. REF's login inputs inherit the
   login build's foreground token — zinc-950 `#09090B` (computed
   rgb(9,9,11)); the clone inherits the app token neutral-950 `#0A0A0A`
   (rgb(10,10,10)). REF ships two separate CSS builds (login static vs
   app) with different palettes; the clone's login must scope the zinc
   value locally (the app pages keep the pinned neutral token).
4. **R38-D — the sm:hidden spacer footnote**. REF renders
   `<div class="mt-8 text-center text-xs text-slate-400 sm:hidden">
   <p>&nbsp;</p></div>` below the card, inside the max-w-md wrapper —
   invisible content but layout-affecting at mobile: the card pins to
   y=16 and the page scrolls 18px (body scrollHeight 862 vs the viewport's
   844). The clone has nothing → the card centers at y=29 and the page
   does not scroll.
5. **R38-E — the Sign in micro-recipes**. REF:
   `inline-flex items-center justify-center gap-1 whitespace-nowrap … px-3
   py-2 w-full h-11 sm:h-12 … shadow-sm rounded-xl transition-all
   duration-200`. The clone: `flex … gap-2 … px-4 py-2 h-12 …
   transition-colors`. Visible members: the mobile height (44 vs 48), the
   hover transition timing (200ms all-properties vs 150ms colors-only —
   the motion dimension), the loading-spinner gap (gap-1 vs gap-2).
   Invisible members: px-3 vs px-4 (w-full centers), inline-flex vs flex.
6. **R38-F — the social button DOM family**. REF's three buttons are
   `type="submit"` (inert — they sit outside the form), carry explicit
   `text-[16px]` + `group`, wrap the icon in
   `<div class="transition-transform duration-200 -ml-4">` and the label
   in a `<span>`. The `-ml-4` wrapper shifts the icon+label cluster 8px
   LEFT of dead-center (live-measured: icon x=85/text x=117 on REF vs the
   clone's centered x=93/125 at mobile; identical 8px offset at desktop).
   The clone renders bare svg + text, dead-centered. The
   group/transition-transform members are inert (no hover trigger —
   verified), cloned for DOM parity.
7. **R38-G — the MAIN semantic root**. REF's canvas is `<main class=
   "min-h-screen flex items-center justify-center bg-gradient-to-br
   from-slate-50 to-slate-100 p-4">`; the clone's is a `<div>` with the
   pinned sRGB gradient (trap 3 — keep the pinned form). Tag-level parity:
   div → main (also the better a11y: one main per document).
8. **R38-H — the title-block width**. REF's title block is
   `space-y-2 sm:space-y-3` (shrink-to-fit — blockW 317 at desktop); the
   clone's `w-full space-y-2 sm:space-y-3` (368). Invisible (text-center
   both) but class parity.
9. **R38-I — the shadow-none remnant**. The clone's login inputs carry
   `shadow-none` — a remnant (the Input base sets no at-rest shadow) that
   computes the 5-layer transparent-zeros box-shadow string; REF computes
   literal `none`. Dropping the class yields `none` (byte-parity of the
   computed style + a cleaner class list).
10. **R38-J — the links row (the round's most visible mobile find)**. REF:
    `flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0`
    — the two links STACK at mobile (y=718/746, h=20 each) and go
    side-by-side ≥640px. The clone ships a flat row → at 390px the two
    buttons' intrinsic widths (118+176=294) exactly fill the row and each
    wraps to TWO lines (h=40 both, live-measured) — cramped two-line
    buttons side-by-side. Plus the text recipes: REF's Forgot carries
    `font-medium transition-colors`, the Need button carries
    `transition-colors`, and the inner Sign up span is
    `font-medium text-slate-700` (the clone's span inherits slate-500 — a
    visible color diff on the "Sign up" text).
11. **R38-K — the or-divider structure**. REF: a continuous 1px slate-200
    line (absolute inset-0, vertically centered) with the centered "or"
    chip on top — `relative flex justify-center text-xs uppercase` >
    `span.bg-white.px-3.text-slate-500.font-medium.tracking-wider`. The
    clone ships the two-segment pattern (two `h-px flex-1` spans + gap-3)
    with the "or" in **slate-400** (REF: slate-500 — visible). The rebuilt
    structure also matches REF's line-through-chip rendering exactly.
12. **R38-L — the logo family**. REF: a `relative group` wrapper + a glow
    layer (`absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300
    rounded-full blur-xl opacity-30 group-hover:opacity-40
    transition-opacity duration-300`) + the circle as a `span` (`flex
    shrink-0 overflow-hidden rounded-full relative h-20 w-20 sm:h-24
    sm:w-24 shadow-lg ring-4 ring-white/50 group-hover:shadow-xl
    transition-all duration-300`) + `alt="Eon HR logo"`. The clone ships
    the bare div circle (no glow, no hover shadow-xl, alt="Eon HR"). The
    glow is visible (a soft 30%-opacity slate halo bleeding ~12px past
    the circle); the hover members are motion-dimension parity.

### Verified non-gaps (recorded)

- Desktop geometry byte-identical across the whole card (see above).
- The Tab/Shift+Tab walks structurally identical; T9 = REF's builder
  badge (documented non-clone).
- No social-button hover motion (the transition-transform wrapper never
  transforms; the hover bg/border/shadow recipes already match).
- The clone's `autoComplete="email"/"current-password"` attrs (REF has
  none) — KEPT as the documented a11y superset (password-manager UX,
  invisible).
- The clone's `focus-visible:ring-slate-400` vs REF's `focus:ring-slate-400`
  (same computed focus on text inputs — the R18-E tailwind-merge lesson).
- REF's unclassed wrapper DIV around `<main>` — non-semantic markup, not
  cloned (the documented lesson family).
- The lab()/rgba() serialization difference on the input fill — the
  round-34 acceptance (same visual color, different engine serialization).

### The probe lessons (recorded for the next round)

- **The stale-:3200-server trap (the round's environment lesson)**: after
  `bun run build`, a still-running :3200 standalone server keeps serving
  the OLD build manifest's chunk hashes — the rebuilt CSS file no longer
  exists under the old name, so the stylesheet URL returns "Internal
  Server Error" (a 21-byte body) and the page renders UNSTYLED. The
  ensure-server.sh liveness check (HTML 200) cannot catch it. Procedure:
  kill the :3200 process after every rebuild before probing.
- The multi-line eval trap re-confirmed: agent-browser evals must be
  flattened to one line (the raw `\n` survives execSync and produces a
  SyntaxError — every field reads `undefined`); the round-37 `evalOn`
  helper (split+join, quote-strip parse) is the reliable form.

## The plan (TDD)

1. **RED**: the session-39 pin block in `tests/unit/recipes.test.ts` —
   A1/A2 (the responsive input heights + fonts, 2 sites), B1 (the
   placeholder slate-600, 2 sites), C1 (the zinc-950 foreground on the
   root), D1 (the sm:hidden spacer), E1–E3 (the Sign in px-3/gap-1 +
   h-11 sm:h-12 + transition-all duration-200 + whitespace-nowrap +
   inline-flex), F1–F3 (the social type=submit ×3 + text-[16px]/group +
   the -ml-4 icon wrapper + the span labels), G1 (the `<main` root), H1
   (the title block without w-full), I1 (no shadow-none), J1–J3 (the
   links-row flex-col sm:flex-row + gap-2 sm:gap-0, the Forgot
   font-medium + transition-colors, the Sign up span text-slate-700),
   K1 (the divider structure + the slate-500 chip), L1–L2 (the glow
   layer + the span circle with group-hover:shadow-xl + the alt).
2. **GREEN**: rewrite `src/app/login/page.tsx` to REF's measured DOM —
   the main root, the logo glow family, the title block, the social
   family (wrapper + span + type + text-[16px] + group), the divider,
   the responsive inputs (page-level classes; the shared Input base
   untouched — the app pages keep their pinned recipes), the Sign in
   recipes, the links row, the spacer footnote.
3. **E2E**: a session-39 block in `tests/e2e/auth.spec.ts` — the mobile
   viewport (390×844): input h=44 + font 16px, Sign in h=44, the stacked
   links row (flex-direction column), the spacer (body scrollHeight >
   viewport, card top y=16); the desktop pins: font 14px (the existing
   h=48 pins stay), the placeholder color rgb(71,85,105), the main
   element, the -ml-4 icon wrapper + span label + type=submit on the
   social buttons, the "or" chip slate-500, the Sign up span
   slate-700. The alt-text pin amendment ("Eon HR" → "Eon HR logo").
4. Gates: lint → typecheck → unit → build → E2E (restart :3200 after the
   build — the stale-server lesson).
5. Live dual-browser verification: re-run the login probes at both
   viewports (expect byte-parity on every measured value incl. the mobile
   stack: email y=516 h=44, card y=16, scrollHeight 862, the links
   y=718/746 h=20, the icon cluster x=85/117), the standing audits, and
   a screenshot pixel-diff pair.
6. Screenshots: the login desktop pair, the login mobile pair (the
   stacked links + the 44px inputs), the placeholder/close-up pair, the
   logo glow pair → continue the numbering at 144.
7. Docs: AGENTS session-39 layer + counts, SKILL 3.22.0 + §51 (the
   stale-server trap + the two-build palette lesson), PAD [S39],
   CLAUDE/README counts, docs/session_78.md, the worklog, this plan's
   completion record.

## The addendum — the pixel-diff forensics (R38-M / the per-button wrapper)

The round's screenshot pairs pixel-diffed above baseline on mobile (4.33%
vs the ~1.1–1.6% band) — the forensic trace found two more families the
probes had missed:

13. **R38-M — the social icon glyphs**: the clone's Microsoft icon shipped
    `viewBox="0 0 23 23"` (REF: `0 0 24 24` — a ~4% scale drift on the
    four squares) and the Apple icon was a different glyph entirely (the
    clone's alternate single-path logo vs REF's classic two-path glyph —
    the body path + the leaf `M13 3.5…`). Both replaced with REF's exact
    paths. The Google icon already matched.
14. **The per-button wrapper correction (an R38-F amendment)**: REF's
    `-ml-4` icon-wrapper pull is NOT uniform — live-measured, ONLY the
    Google button's div carries `-ml-4` (x=84.8 with ml=-16); the
    Microsoft/Apple divs carry bare `transition-transform duration-200`
    (no pull — they sit at x=84.6/98.2 on their own text widths). The
    uniform -ml-4 the plan first specified put the clone's Microsoft icon
    at x=77 vs REF's 85 (the cluster-centering math with a negative
    margin: the margin shrinks the flex sum, the free space grows, the
    border box lands 16px left of the margin box). The clone now matches
    REF's per-button classes exactly.

After both fixes the mobile icon bands dropped from 12.2%/9.5% to 0.8%
strong-diff, and the pairs measured: desktop **0.84%** (below baseline),
mobile **3.27%** — fully accounted for by REF's fixed "Edit with Base 44"
builder badge in the bottom-right corner (the documented non-clone — the
VLM-verified crop shows it as the ONLY remaining difference) plus sub-1%
font-AA bands around the self-hosted logo copy.

## Completion record (session 39)

Delivered in one window (see docs/session_78.md):

- **R38-A** (the responsive input family): DONE — `h-11 sm:h-12` on both
  inputs + Sign in, `text-base md:text-sm` on both inputs. Mobile pair
  byte-identical: email y=516 h=44 font 16px, pass y=602 h=44, Sign in
  y=662 h=44.
- **R38-B** (the placeholder slate-600): DONE — live pair rgb(71,85,105)
  both sides.
- **R38-C** (the zinc-950 typed-text): DONE — the card pins
  `text-[#09090b]` (REF's login build resolves --card-foreground to
  zinc-950; the app pages keep the neutral token). Live pair rgb(9,9,11).
  The first implementation put it on the `<main>` root only — the card's
  own `text-card-foreground` still overrode it (the E2E caught it).
- **R38-D** (the sm:hidden spacer): DONE — the mobile pair now scrolls
  862 (both) with the card pinned to y=16 (both).
- **R38-E** (the Sign in recipes): DONE — inline-flex, gap-1,
  whitespace-nowrap, px-3 py-2, transition-all duration-200.
- **R38-F** (the social family + the addendum correction): DONE —
  type=submit ×3, text-[16px], group, the span labels, and the per-button
  wrapper (-ml-4 on Google only). Icon x: 85/85/98 on both sides.
- **R38-G** (the MAIN root): DONE — `<main>` + the pinned gradient + p-4
  (+ the zinc foreground).
- **R38-H** (the title block): DONE — shrink-to-fit, blockW 317 both.
- **R38-I** (the shadow-none remnant): DONE — computed box-shadow "none"
  on both sides.
- **R38-J** (the links row): DONE — flex-col sm:flex-row, gap-2 sm:gap-0,
  the Forgot font-medium/transition-colors, the Sign up span slate-700.
  Live pair: Forgot y=718 h=20, Need y=746 h=20 (the old flat row's
  two-line h=40 wrap eliminated).
- **R38-K** (the or-divider): DONE — the continuous-line + white-chip
  structure, the "or" in slate-500.
- **R38-L** (the logo family): DONE — the relative group wrapper, the
  blur-xl gradient glow (opacity-30→40 hover), the span circle with
  group-hover:shadow-xl, alt="Eon HR logo".
- **R38-M** (the icon glyphs): DONE — REF's exact Microsoft viewBox and
  Apple two-path glyph.
- Gates at delivery: lint 0/0 · tsc ✓ · **598/598 unit (+16)** · build ✓ ·
  **167/167 E2E (+2: the desktop recipe spec, the mobile responsive
  spec)**. Three earlier pins amended for the new markup (R18-E and R19-H
  — the type=submit anchor move to disabled={loading}; the E2E img-role
  name → "Eon HR logo").
- Live: the desktop pair MATCH on every measured value (the remaining
  diffs are the four documented non-gaps: the autocomplete superset, the
  lab()/rgba() serialization, the 0px-border token color, the builder
  badge); the mobile pair byte-identical (all geometry, the spacer
  scroll, the icon cluster, the stacked links); the standing audits 5/5
  (the drawer re-verified with the Escape-reset pattern after the
  documented x=-261 toggle-race artifact). Pixel-diffs: desktop 0.84%,
  mobile 3.27% (the builder badge + font AA).
- 8 screenshots (144-147, ref+loc pairs) → **196 PNG captures**. DB
  pristine. `.env.example` re-verified.
- The environment lessons recorded: the stale-:3200-server trap (kill the
  server after every rebuild — the old manifest keeps serving dead chunk
  URLs and the CSS body comes back "Internal Server Error"), the
  multi-line eval flattening, and the comments-in-source regex inflation
  (the round-37 lesson re-applied: reword, don't count).
