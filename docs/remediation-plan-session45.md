# Remediation Plan — Session 45 / Parity Round 44

**Window**: session-45 audit (this document) · parity round 44
**Predecessor**: `docs/remediation-plan-session44.md` (round 43, delivered at `3180467` + the session-log commit `1d1be39`)
**Baseline verified before census**: lint 0/0 · tsc ✓ · 670/670 unit · build ✓ · 198/198 E2E (the workspace PERSISTED this window — no reset; env + db intact)

## Census summary

- **Redeploy watch: login-scoped REDEPLOY — TWICE mid-session** (the 8th +
  9th login deploys): first read `DRs9_-5K`/`0a_RfWl5` (vs the round-43
  records), then a SECOND deploy to `CTDe-raE`/`NS4V-1t3` while the census
  ran — stable at the latter across 3.5 minutes (JS + CSS both changed each
  time; the app fingerprints `C-IrDy5f`/`BGNH4KkS` quiet throughout). The
  re-audit re-ran against the final live build; every measurement below
  held identically across BOTH new builds.
- **The rendered surface at rest**: card geometry, inputs (class strings +
  geometry), Sign in, social buttons, action buttons, labels, form
  structure, or-divider, logo geometry, theme-inert, the failed-login
  Alert (re-fired, byte-identical) — all MATCH on both bands. The route
  sweep 12/12 + standing audits 5/5.
- **THE CENSUS VEIN — the login's COLOR + INTERIOR dimensions 43 rounds
  never reached** (geometry/positions were pinned every time; the rendered
  COLORS and the loading interior were not):

  1. **THE RUNTIME-INJECTED TAILWIND BLOCK (the headline mechanism)**:
     REF's login page ships a SECOND Tailwind stylesheet as an inline
     `<style>` (19,9 rules, 17,813 bytes — a complete v3.4.17 build:
     preflight + the auth widget's JIT subset) injected by the platform
     runtime into the HEAD **after the linked stylesheet**. Its two
     plain-`:focus` selectors (`.focus\:border-slate-400:focus` +
     `.focus\:ring-slate-400:focus`) sit at equal specificity with but
     LATER-in-document-order than the linked CSS's
     `.focus-visible\:ring-ring:focus-visible` — **so they win the
     cascade**: REF's keyboard-focused email/password inputs render a
     SLATE-400 ring (`rgb(148,163,184)` 4px, live-read under a real Tab
     both bands). The clone (v4 orders focus-visible after focus, and the
     login-scoped `[--ring:#09090b]` resolves the token) renders the
     zinc-950 ring — **a real keyboard-interaction visual diff**. The
     block's other 197 rules are same-value re-declarations with no
     later-conflicting rules on the login elements (the flip analysis:
     only the focus:ring-slate-400 vs focus-visible:ring-ring pair
     conflicts) — the app pages carry NO inline block (login-only) and
     `focus:ring-slate-400`/`focus:border-slate-400` appear nowhere else
     in the clone's source.
  2. **The field icon pair** (`lucide-mail` / `lucide-lock` inside the
     inputs): REF's verbatim string is
     `lucide lucide-mail absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500`
     — THREE member diffs vs the clone: **text-slate-500 (the clone
     authors slate-400 — the icons render LIGHTER, a real color diff:
     rgb(100,116,139) vs rgb(148,163,184))**, the v3 `transform` member
     (present on REF, absent on the clone), and `pointer-events-none`
     (the clone's superset, absent on REF). Plus the Mail GLYPH version:
     REF ships the OLDER lucide mail (rect FIRST +
     `m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7` flap); the clone's
     lucide-react ships the newer revision (path first + the
     `8.991 5.727 a2` arc). The Lock glyph matches.
  3. **The social icon family's fills** (three real color diffs):
     (a) the **Apple logo** — REF authors `fill="#000000"` ON THE PATH
     with NO svg-level fill → renders BLACK; the clone uses
     `fill="currentColor"` at the svg level → renders the button's
     slate-700 (`rgb(51,65,85)`); (b) the **Microsoft squares** — REF's
     path order is red(TL) → **BLUE(TR)** → **GREEN(BL)** → yellow(BR)
     (its own variant, NOT the real logo's green/blue); the clone ships
     the real-logo order (red/green/blue/yellow); (c) the Google icon's
     path attribute order (REF renders `d` before `fill` — a DOM
     serialization parity item).
  4. **The loading state** (never census'd — the E2E specs assert the
     Alert, not the submit interior): REF's Sign in swaps its text to
     **"Signing in..."** + disables + renders the spinner
     `lucide lucide-loader-circle mr-2 h-4 w-4 animate-spin` (the
     microtask snapshot caught the <40ms state; the glyph
     `M21 12a9 9 0 1 1-6.219-8.56` matches the clone's Loader2). The
     clone: text stays "Sign in", spinner lacks `mr-2`.
  5. **The title/subtitle member order** (render-neutral authored-recipe
     migration): REF authors
     `text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight` +
     `text-slate-500 text-sm sm:text-base font-medium`; the clone authors
     the same sets in a different order.

- **Documented non-gaps re-verified this round**: the card's
  `text-[#09090b]` resolved-hex pin + the two trap-3 sRGB gradient pins
  (the tree pair at 61 nodes, sorted-set + geometry, isolated exactly
  these); the `mt-1.5` trap-6 superset on the relative wrappers
  (geometry matches); the autoComplete attrs (the kept a11y superset);
  the Lock glyph; the `lab()`/`rgba()` serialization split on
  `bg-slate-50/50` (**pixel-identical** — canvas rasterization read
  [247,249,251,128] both sides); the v4 transparent-zeros shadow prefix;
  the outline serialization (invisible both); the body-first-child
  NOSCRIPT (the platform Vite index.html artifact — the edit-badge
  convention, non-clone); the 6th svg (the platform edit badge's icon);
  REF's extra tabbable (the platform Close badge).

## Findings (all live-measured this round)

- **R44-A — the focused-input ring**: mirror the runtime block's cascade —
  an injected `<style>` on the login page (rendered in place in the body →
  after the head links → the same winning position REF's runtime achieves)
  carrying REF's two verbatim rules. The class strings on the inputs stay
  REF-verbatim (untouched); the fix is pure cascade.
- **R44-B — the field icon pair**: hand-author both svgs with REF's
  verbatim glyphs (the older-lucide Mail: rect first + the 1.94 flap; the
  Lock: rect+path) + the verbatim class strings (the `transform` member,
  `text-slate-500`, no `pointer-events-none`; the lucide prefix classes,
  stroke attrs, and the standard svg attr set). The lucide-react Mail/Lock
  imports retire.
- **R44-C — the social icon family**: C1 the Apple path-level
  `fill="#000000"` (the svg-level currentColor retires); C2 the Microsoft
  square order red/blue/green/yellow (REF's variant); C3 the Google path
  attrs authored d-then-fill.
- **R44-D — the loading state**: the text swap ("Signing in..." while
  loading) + the spinner's `mr-2` member.
- **R44-E — the title/subtitle order**: adopt REF's verbatim member order.

## The TDD contract

- **Unit pins** (session-45 block, `tests/unit/recipes.test.ts`): A1 the
  injected style block (the two verbatim rules + the body-position
  mechanism), B1 the Mail svg (glyph + verbatim class), B2 the Lock svg,
  C1 the Apple fill, C2 the Microsoft order, C3 the Google attr order,
  D1 the loading text, D2 the spinner class, E1 the title order, E2 the
  subtitle order — **10 new pins**.
- **Predecessor amendments**: R19-H (the slice anchor — the button text
  becomes conditional), R38-M1 (the glyph contract widened: the fills +
  the square order + the attr order), plus any the RED phase surfaces.
- **New E2E spec** `tests/e2e/session45-login-interior.spec.ts`: the
  rendered icon colors (mail/lock stroke slate-500, apple black, the ms
  square order), the keyboard-focused ring slate-400 (the real-Tab read,
  transition-settled), the loading-state interior (the text swap + the
  spinner class), the injected style's presence + position. **Amendments**:
  none expected (the existing specs assert at-rest surfaces or the Alert).
- **The comments-in-source trap**: the new comments describe the recipes
  in PROSE (no verbatim class strings in comments).

## Verification plan

1. Gates: `lint → typecheck → test (670 + 10) → build → E2E (198 + the
   new spec)`.
2. Production server on :3200, re-auth both sessions.
3. `scripts/verify-r44.mjs` — the round pairs: the Tab-focused ring
   (slate-400 both apps), the icon rendered colors (stroke + fills), the
   loading-state snapshot (the microtask capture), the title classes, the
   at-rest regression set (card/inputs/Sign in/social/alert), the style
   block's document position. Expected residual diffs: the documented
   serializations only.
4. Screenshots: 172-175 (the login card at rest, the focused inputs with
   the slate-400 ring, the loading state, the icon color detail — REF +
   LOC pairs) → the 252-PNG record.
5. DB pristine check (users=1, employees=1, leaveBalances=2) +
   `.env.example` re-verified.

---

## Completion record (session 45, delivered)

- **Gates**: lint 0/0 · tsc ✓ · **681/681 unit** (+11: A1-A2, B1-B3,
  C1-C3, D1-D2, E1 — the plan's 10 + B3, the import-retirement pin the
  RED phase surfaced) · build ✓ · **203/203 E2E** (+5 — the
  session45-login-interior spec: the field icon colors + glyphs, the
  social fills (the BLACK Apple + REF's Microsoft square variant), the
  keyboard-focused slate-400 ring (the real-Tab read, transition-settled),
  the loading-state interior (the login API held open via route
  interception — the copy swap + the mr-2 spinner), the title/subtitle
  member order; a single-spec run shows 6/6 — the 6th is the setup
  project's auth test).
- **Predecessor amendments**: R19-H (the slice anchor — the Sign in text
  became conditional with the D1 swap) + R38-M1 (the glyph contract
  widened: the fill semantics + the square order + the attr order moved
  to the R44-C pins). Two pin-spec fixes surfaced in GREEN (substring
  collisions — A2's ring-ring count includes the Sign in's base, the
  B-pin class anchors tightened); three E2E-spec fixes (the d-slice
  length, the document-position flag, the Tab order — Sign in is 2 Tabs
  from email, not 3).
- **Live verification**: standing audits **5/5**, route sweep **12/12**,
  **verify-r44 7/8 raw / 8/8 semantic MATCH** — the one raw DIFF is the
  documented trap-1 serialization split (the clone's `hsl(240 10% 3.9%)`
  ≡ REF's `#09090b`); the matched pairs: the Tab-focused ring (slate-400
  both apps — the injected-cascade fix proven live under a real Tab),
  the icon rendered colors (the slate-500 strokes, the black Apple, the
  Microsoft square order), the loading-state snapshot, the title classes,
  the at-rest regression set, the style block's document position.
- **Round-specific gotchas resolved en route**: the redeploy watch fired
  TWICE mid-session (the 8th + 9th login deploys — the census re-ran
  against the final live build, every finding held across both); the
  cascade analysis required the FULL document (the linked stylesheet's
  byte order said focus-visible should win — the SECOND, runtime-injected
  inline `<style>` after it is what flips the ring color; head-vs-body
  position matters, not byte order within one file); the microtask
  loading-state capture (the state lasts <40ms on REF — the E2E used
  route interception to hold the API open, the live probe used a
  same-tick snapshot); the `lab()`/`rgba()` split on `bg-slate-50/50`
  re-proven PIXEL-identical via canvas rasterization before being
  dismissed.
- **Screenshots**: 172-175 (8 PNG: the login card at rest with the icon
  detail, the email keyboard-focused with the slate-400 ring, the social
  row detail, the mobile band — REF + LOC pairs; the focused-ring pair
  visually proves the cascade fix — both apps render the slate-400 ring
  pixel) → **252 PNG captures**. DB pristine (users=1, employees=1,
  leaveBalances=2). `.env.example` re-verified.
