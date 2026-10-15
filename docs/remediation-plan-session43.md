# Remediation Plan — Session 43 / Parity Round 42

**Window**: session-43 audit (this document) · parity round 42
**Predecessor**: `docs/remediation-plan-session42.md` (round 41, delivered at `459937c` + the session-log commit `a574cad`)
**Baseline verified before census**: lint 0/0 · tsc ✓ · 648/648 unit · build ✓ · 185/185 E2E (fresh clone; env rebuilt — bun install, `.env` with a generated AUTH_SECRET, db:push + db:seed to `<repo>/db/custom.db` with the shell-level `DATABASE_URL` override unset, Playwright chromium reinstalled)

## Census summary

- **REDEPLOY DETECTED — login-scoped, JS + CSS BOTH**: login JS
  `index-C-ulo5ek.js` → `index-DRs9_-5K.js`, login CSS
  `index-BIWjBcok.css` → `index-DPOrvWRk.css`; both app fingerprints QUIET
  (`index-C-IrDy5f.js` / `index-BGNH4KkS.css` unchanged). The fifth
  login-scoped deploy in seven rounds — the first since round 38 to touch
  the CSS. The CSS delta is the SAME platform font-face batch round 40
  documented (Wix Madefor Display/Text, Dazzed, Azeret Mono +
  `.font-base44`/`.font-body` utilities) — **0 consumers on the login DOM**
  (body still computes the `ui-sans-serif` default stack). Non-gap.
- **Standing audits 5/5 MATCH** (mobile tabs, drawer, navmap, bell popover,
  Quick Actions) · **route sweep 12/12 MATCH** · REF still zero-data on the
  app tenant.
- **The login re-audit** (the round-38 precedent — full re-measure on both
  bands): desktop 1440×900 + mobile 390×844, both apps. The rendered
  surface is byte-stable — card (x=16 y=16 w=358 both bands), docH 900/862,
  inputs 48px/14px desktop + 44px/16px mobile, social buttons (classes
  byte-identical, icons 85/85/98), or-chip, links row (stacked mobile),
  title block (y=205, 30px/700), theme-inert (both), and the failed-login
  Alert **byte-identical** (368×54 @(536,738), same class string, same
  text — the lab()/rgba() serialization split the only diff, the r34 pin).
- **The keyboard/focus remainder CLOSED**: the Shift+Tab reverse walks
  (the session-38 named remainder) read on both surfaces both apps — the
  login walk (Sign in → password → email → Apple → Microsoft) and the
  dashboard footer walk (عربي → moon → bell → Settings → AI HR Assistant →
  Analytics → Communications) are structurally IDENTICAL; the only text
  diff is the clone's aria-label supersets (the documented r41 non-gap).
  Every read on both sides renders the focus ring.
- **The frontier was the redeploy's recipe changes** — four finding
  families, all class/DOM-contract (three render-neutral, one with a
  focused-render equivalence to verify):

## Findings (all live-measured this round)

### A. The login inputs' authored-string migration (the login build adopts the ring-2/offset-2 base)

REF's new login JS carries a NEW input component base — the round-39
"two-build split" members are gone. REF's full authored string (email and
password, byte-identical to each other):

```
flex w-full border px-3 py-2 text-base ring-offset-background
file:border-0 file:bg-transparent file:text-sm file:font-medium
file:text-foreground focus-visible:outline-none focus-visible:ring-2
focus-visible:ring-ring focus-visible:ring-offset-2
disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-11
sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400
focus:ring-slate-400 rounded-xl placeholder:text-slate-600
```

vs the clone's current DOM string (the shared v4 Input base + the page
tail through tailwind-merge). Four content diffs:

- **R42-A1 — `focus-visible:ring-ring` is in the base now** (REF keeps it
  AND the page tail's slate-400 — the tail switched to the plain
  `focus:` variant so tailwind-merge no longer dedups the ring color). The
  clone's current tail (`focus-visible:ring-slate-400`) KILLS the base's
  ring-ring in the merge — the clone's DOM has no ring-ring member.
- **R42-A2 — `focus:ring-slate-400` (plain focus, not focus-visible)** —
  REF's tail variant. The clone carries `focus-visible:ring-slate-400`.
  Render-equivalent on text inputs (they match :focus-visible whenever
  focused) — but the authored member differs.
- **R42-A3 — `shadow-none` + `transition-none` are GONE from REF's
  string** — the login build's new base has no shadow-sm/transition-colors
  to counter (the round-39 split retired). The clone still carries both
  counters.
- **R42-A4 — the base positions**: `py-2 text-base` +
  `ring-offset-background` + the `focus-visible:ring-2 …ring-offset-2`
  triple now sit in the BASE (before the file: members), `md:text-sm` at
  base-end, and the tail is exactly `pl-10 h-11 sm:h-12 bg-slate-50/50
  border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl
  placeholder:text-slate-600`.

**The shared-component trap**: the clone CANNOT reach this string by
overriding the shared v4 `Input` — tailwind-merge overrides but never
deletes (`shadow-sm`/`transition-colors` from the shared base would
survive as `shadow-none`/`transition-none` counters REF no longer
carries). REF's login build has its OWN input component (the two-build
architecture). **Fix**: the login page renders hand-authored `<input>`
elements with REF's verbatim string — the same approach the page already
uses for the Sign in button (and round 41 used for the footer ghosts).

### B. The Sign in ring switched to the token + the login --ring override

REF's Sign in now carries `focus-visible:ring-ring` (was rendering under
the r38 hex-pin era) and the login build's `:root` sets
`--ring: 240 10% 3.9%` (zinc-950 = #09090b — the two-build palette split:
the APP build's --ring is `0 0% 3.9%` neutral-950 = #0a0a0a, re-verified
this round). The clone's button pins `focus-visible:ring-[#09090b]`.

- **R42-B1**: the button swaps `focus-visible:ring-[#09090b]` →
  `focus-visible:ring-ring` (REF's authored member).
- **R42-B2**: the login root `<main>` gains `[--ring:#09090b]` — a
  login-scoped token override (REF sets it at :root of its login build;
  the clone scopes it to the login subtree so the app pages keep the
  shared neutral token). Full-value form per trap 1 (v4 needs complete
  color values — bare triplets resolve transparent). The rendered ring
  stays #09090b under keyboard focus, byte-identical to REF.

### C. The w-full column restructure (three direct children)

REF's `w-full` column (live-counted): **three direct children** — the
social `space-y-3` group (ONLY the three buttons), the `relative my-6`
or-divider, and the `space-y-4 sm:space-y-5` form. The clone nests all
three inside ONE `space-y-3` wrapper. Render-neutral today (the column
measures 522px on both apps — v4's `:where()` space-y yields to the
divider's `my-6`, so the gaps collapse identically), but the DOM nesting
contract differs by one wrapper level.

- **R42-C1**: flatten — the `space-y-3` group wraps ONLY the three social
  buttons; the divider and the form become direct children of `w-full`.

### D. The field wrapper adopts REF's space-y-1.5 (the trap-6 pattern)

REF's field structure: `<div className="space-y-1.5">` > label + a BARE
`relative` wrapper. The clone: a bare field DIV > label + `relative
mt-1.5` (the documented v4 adaptation — v4's space-y puts the margin on
the INLINE label where vertical margins are ignored, so the clone pinned
the gap with an explicit mt). The measured render is identical (input
y=589 both apps).

- **R42-D1**: the field DIV adopts REF's `space-y-1.5` (class parity) and
  KEEPS the explicit `mt-1.5` on the relative wrapper — the same
  space-y-plus-explicit-mt pattern the dashboard welcome row uses (trap 6
  in `AGENTS.md`). Render-neutral: v4's `:where()` space-y margin lands on
  the inline label (ignored vertically), the mt-1.5 provides the 6px gap.

### Documented non-gaps (no action)

- The title wrapper's computed-margin split: BOTH apps author
  `space-y-2 sm:space-y-3` around h1+p; REF (v3) computes p.mt=12px, the
  clone (v4) computes h1.mb=12px — the documented space-y engine flip,
  identical render (gap 12px both).
- The shadow/outline serializations (v3 `none`/`solid` vs v4
  transparent-zeros/`none`) — the standing two-build splits.
- The Alert's lab()/rgba() color serialization (the r34 acceptance).
- The app-build `--ring` serialization (`0 0% 3.9%` vs `#0a0a0a` — same
  color, both builds' forms).
- The logo src (`eon-logo.png` self-hosted vs REF's CDN asset — the
  documented self-hosted superset; classes + 96px geometry identical).
- The login CSS's platform font-faces (0 consumers — the r40 finding
  re-verified on the new CSS hash).
- The clone's a11y supersets (named icon buttons, autocomplete attrs) and
  the content-link default outlines (both sides author nothing).
- tailwind-merge class reordering (order differs, content is the
  contract — the standing r41 note).

## TDD execution plan

1. **RED**: append the session-43 pin block to `tests/unit/recipes.test.ts`
   (6 pins: A1 the verbatim email input string, A2 the verbatim password
   input string [same string, both fields], A3/A4 the retired split members
   + the focus: variant, B1 the Sign in ring-ring token, B2 the root
   --ring override, C1 the w-full column structure, D1 the field wrapper
   space-y-1.5 + the mt-1.5 trap-6 note) + amend the three predecessors:
   - R18-E's input focus pair: `focus:border-slate-400
     focus-visible:ring-slate-400` ×2 → the new `focus:border-slate-400
     focus:ring-slate-400` members (the variant switch is the change).
   - R18-E's Sign in zinc pin: `focus-visible:ring-[#09090b]` →
     `focus-visible:ring-ring` + the root override assertion moves to B2.
   - R38-I1's shadow-none/transition-none counters: RETIRED (REF's new
     build carries neither; the pin flips to a negative assertion).
2. **GREEN** (order): the inputs (A — hand-authored verbatim strings), the
   Sign in token + root override (B), the column flatten (C), the field
   wrapper (D). All four in `src/app/login/page.tsx` — one file.
3. **E2E**: add `tests/e2e/session43-login-redeploy.spec.ts` — the DOM
   class-content contract (the inputs' string contains ring-ring + the
   focus: variant + NO shadow-none/transition-none), the column structure
   (w-full's children = [space-y-3 group, my-6 divider, form]), the field
   wrapper (space-y-1.5 field > relative.mt-1.5), the Sign in ring-ring
   under real keyboard focus renders #09090b, and the mobile responsive
   pair still holds (44px/16px inputs). Re-verify the standing login specs
   (login-error, session40 login, mobile-navigation) stay green.
4. **Gates**: lint → tsc → unit → build → E2E, all green.
5. **Live verification**: verify-r42.mjs (the login pair re-run — the
   input DOM strings, the Sign in focused ring, the column structure, the
   field wrapper, both bands' geometry) + the standing audits + the
   screenshots (docs/screenshots/ 164-167) + the DB pristine check.
6. **Docs**: AGENTS session-43 layer, SKILL 3.26.0 + §55, PAD [S43],
   CLAUDE/README counts, docs/session_87.md, this plan's completion
   record, the worklog entry. Commit + SSH-wrapper push (main only).

## Risks & mitigations

- **The hand-authored inputs drop the shared component seam**: the login
  page loses the `Input` import — acceptable, REF's own login build ships
  its own input component (the two-build split honored); the shared
  component stays for the app pages. The E2E + pins guard the string.
- **The --ring override scope**: `[--ring:#09090b]` on `<main>` covers the
  inputs' `focus-visible:ring-ring` AND the Sign in's — the whole login
  subtree. The app pages are untouched (their --ring stays #0a0a0a).
- **The column flatten changes the divider/form's parent**: the E2E
  or-divider + form selectors that walk parents re-verified; the rendered
  geometry (522px column) re-measured in verify-r42.
- **The focus: (plain) variant on the inputs' slate-400**: render-
  equivalent for text inputs (they match :focus-visible whenever focused)
  — pinned as a DOM-string assertion, not a computed-style one, so a
  future engine change gets caught by the class pin.
- **The space-y-1.5 field + mt-1.5 pair**: if the Label component ever
  gains a display class, the label's space-y margin would apply and double
  the gap to 12px — the recipe pin asserts the pair, so the regression
  surfaces in the unit gate.

## Completion record (session-43, executed this window)

Executed end to end this window against the live census above.

**TDD**: 8 RED (the session-43 pin block: A1-A4, B1-B2, C1, D1) →
**656/656 unit GREEN** (+8). Five predecessors amended (R18-E's input
focus pair — the plain-focus variant, R18-E's Sign in pin — the token,
R38-G1 — the --ring override member, R38-A2 — the split responsive-font
members, R38-I1 — the retired counters flipped to negatives, R39-C1 —
the base-position family, R40-A1 — the token member). The
comments-in-source trap fired TWICE in GREEN (a fresh comment quoting
the retired md-responsive pair inflated a count; the icon-comment
pushed a fixed-window pin out of range) — reworded to prose +
lastIndexOf anchoring per the standing rule. One JSX closing-tag
imbalance from the column flatten caught by tsc at the gate.

**Gates**: lint 0/0 · tsc ✓ · 656/656 unit (+8) · build ✓ · **190/190
E2E** (+5: the session43-login-redeploy spec — the input DOM-string
content contract, the transition-settled Sign in ring render, the
w-full column structure, the field-wrapper pair, the mobile responsive
pair). One session40 input-family tolerance flake in the first full
run — stable on the single-spec re-run AND the full re-run. The
session41 Sign in member assertion amended to the token.

**The round's E2E lesson**: the Sign in's `transition-all duration-200`
(the R38-E1 motion pin) TRANSITIONS the ring box-shadow in — a shadow
read immediately after the Tab press lands mid-transition and shows the
at-rest slots while the custom properties already read focused (the
symptom masquerades as a CSS-var resolution failure; a 350ms settle
wait fixes the read). Both apps behave identically.

**Live verification** (verify-r42.mjs): 5/8 raw MATCH — the email
input DOM string (sorted content — tw-merge reorders, content is the
contract), the Sign in DOM string (sorted), the w-full column
structure (w-full > [space-y-3, relative my-6, FORM]), and both bands'
geometry MATCH. The focused Sign in ring renders IDENTICAL on both
sides (white 2px + rgb(9,9,11) 4px + shadow-sm — the clone's v4
transparent-zeros prefix slots the documented serialization non-gap);
the field wrapper's `mt-1.5` is the documented trap-6 superset
(REF renders the 6px gap through its v3 space-y; the clone's v4 needs
the explicit member); `--ring` resolves `240 10% 3.9%` (REF) ≡
`#09090b` (clone) — the trap-1 two-build form split, same color. The
standing audits 5/5 post-change. 8 screenshots (164-167) → **236 PNG
captures**. DB pristine (users=1, employees=1, leaveBalances=2).

**Docs**: AGENTS session-43 layer + the Commands-table counts, SKILL
3.26.0 + §55, PAD [S43], CLAUDE/README counts (the 846-spec pyramid),
docs/session_87.md, this completion record, the worklog entry.
