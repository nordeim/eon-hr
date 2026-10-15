# Session 87 — eon-hr parity round 42 (the login redeploy re-audit: the input base migration)

*The redeploy watch went hot again — and this time it brought CSS. Both
login chunks changed fingerprints (the first CSS-touching login deploy
since round 38), which under the standing protocol means a full login
re-audit on both viewport bands. The rendered surface came back
byte-identical everywhere; the redeploy had rewritten the AUTHORED
recipes — the login build's input component finally adopted the
ring-2/offset-2 base, and the round-39 "two-build split" counters
became obsolete on REF's side overnight.*

## The opening state

**REDEPLOY DETECTED — login-scoped, JS + CSS both**: login JS
`index-C-ulo5ek.js` → `index-DRs9_-5K.js`, login CSS `index-BIWjBcok.css`
→ `index-DPOrvWRk.css`; both app fingerprints quiet (`index-C-IrDy5f.js`
/ `index-BGNH4KkS.css`). The CSS delta decomposed to the same platform
font-face batch round 40 documented (Wix Madefor Display/Text, Dazzed,
Azeret Mono + `.font-base44`/`.font-body` utilities) — **0 consumers on
the login DOM**; the body still computes the `ui-sans-serif` default
stack. The standing audits opened 5/5, the route sweep 12/12, and the
baseline gates were all green on the fresh workspace (lint · tsc ·
648/648 unit · build · 185/185 E2E — a clean clone rebuilt from the
documented round-41 state, with the shell `DATABASE_URL` override trap
present and bypassed as always).

## The census — a rendered-identical redeploy with new authored recipes

The full re-audit (desktop 1440×900 + mobile 390×844, both apps)
re-measured every login recipe: card geometry, doc heights, the
responsive input pair, the social family (classes byte-identical, icons
85/85/98), the or-chip, the links rows, the title block — **all MATCH**.
The failed-login Alert was re-fired on both apps and came back
byte-identical (368×54 @(536,738), the same class string, the same
"Invalid email or password" — the lab()/rgba() serialization split the
only diff, the r34 acceptance). The login proved still theme-inert.

The diffs were all in the DOM class contract, four families
(`docs/remediation-plan-session43.md`):

- **The inputs' base migration**: REF's new login input string carries
  `py-2 text-base ring-offset-background` + the
  `focus-visible:ring-2 focus-visible:ring-ring
  focus-visible:ring-offset-2` triple IN BASE (the ring TOKEN — which
  the clone's current tail was silently KILLING: its
  `focus-visible:ring-slate-400` conflicted with the base's ring-ring in
  the tailwind-merge; REF's new tail uses the PLAIN `focus:` variant so
  both survive), `md:text-sm` at base-end — and NO shadow/transition
  members anywhere (the round-39 split counters `shadow-none
  transition-none` were counters for a base REF no longer ships).
- **The shared-component trap**: the clone could not reach REF's string
  through the shared v4 `Input` — tailwind-merge overrides conflicting
  members but never deletes non-conflicting ones (the shared base's
  `shadow-sm` would survive as a counter REF doesn't carry). The login
  inputs became hand-authored elements with REF's verbatim string —
  mirroring REF's own architecture (its login build ships its own input
  component).
- **The ring token + the scoped --ring override**: REF's Sign in now
  carries `focus-visible:ring-ring` over the login build's
  `:root { --ring: 240 10% 3.9% }` (zinc-950 #09090b — while the APP
  build's --ring is `0 0% 3.9%` neutral-950 #0a0a0a: the two-build
  palette split, re-verified). The r38 hex pin (`ring-[#09090b]`)
  retired for the token + a login-scoped `[--ring:#09090b]` on the root
  main — the app pages keep the shared neutral token.
- **The structural family**: REF's `w-full` column holds THREE direct
  children (the social `space-y-3` group — buttons ONLY — the
  `relative my-6` divider, the form); the clone's nested single wrapper
  flattened to match (render-neutral: 522px both sides). And the field
  DIVs adopted REF's `space-y-1.5` with the explicit `mt-1.5` KEPT on
  the relative block — the trap-6 v4 restoration (v4's `:where()`
  space-y lands on the INLINE label where vertical margins are ignored;
  the dashboard welcome-row pattern).

**The session-38 named remainder CLOSED in the same census**: the
Shift+Tab reverse walks — read on both surfaces, both apps, with
`agent-browser press Shift+Tab` after arming focus by script. The login
walk (Sign in → password → email → Apple → Microsoft) and the dashboard
footer walk (عربي → moon → bell → Settings → AI HR Assistant →
Analytics → Communications) are structurally IDENTICAL; the only text
diff is the clone's aria-label supersets (the documented r41 non-gap —
REF's footer ghosts carry no names).

## The delivery

TDD: 8 RED pins → **656/656 unit GREEN** (+8), with 5 predecessor pins
amended (R18-E's input pair + Sign in pin, R38-G1/A2/I1, R39-C1,
R40-A1). The comments-in-source trap fired twice in GREEN — a fresh
comment quoting the retired `md:text-sm` pair inflated a count pin, and
the icon-comment pushed a fixed-window pin out of range (reworded to
prose + `lastIndexOf` anchoring, per the standing rule). One JSX
closing-tag imbalance from the column flatten caught by tsc and fixed.

The E2E: the session43-login-redeploy spec (5 tests — the input
DOM-string content contract, the transition-settled Sign in ring render,
the w-full column structure, the field-wrapper pair, the mobile
responsive pair) + the session41 Sign in member assertion amended to
the token. **The round's E2E lesson**: the Sign in's
`transition-all duration-200` (the R38-E1 motion pin) TRANSITIONS the
ring box-shadow in — a shadow read immediately after the Tab press
lands mid-transition and shows the at-rest slots while the custom
properties already read focused (the symptom masquerades as a CSS-var
resolution failure). The spec waits past the 200ms window; both apps
behave identically.

**Gates**: lint 0/0 · tsc ✓ · **656/656 unit** (+8) · build ✓ ·
**190/190 E2E** (+5; one session40 input-family tolerance flake in the
first full run — stable on the single-spec re-run AND the full re-run).
Live: verify-r42 5/8 raw MATCH — the input DOM strings (compared as
sorted content: tailwind-merge reorders, content is the contract), the
Sign in DOM string, the w-full column structure, and both bands'
geometry MATCH; the focused Sign in ring renders IDENTICAL (white 2px +
rgb(9,9,11) 4px — the v4 transparent-zeros prefix slots the documented
serialization non-gap); the field wrapper's `mt-1.5` is the documented
trap-6 superset; `--ring` resolves `240 10% 3.9%` ≡ `#09090b` (the
trap-1 two-build form split, same color). The standing audits 5/5
post-change. 8 screenshots (164-167) → **236 PNG captures**. DB
pristine (users=1, employees=1, leaveBalances=2).

**Frontier after this round**: the redeploy watch stays armed (the
login-scoped pattern is now 6-of-8 rounds — the login build is under
active development on REF's side); the with-data surfaces beyond
careers stay blocked on REF's zero-data app tenant; the app-side toast
interior stays unfireable; the keyboard/focus dimension is now fully
walked (Tab + Shift+Tab, dialogs + menus + the login) — the next
unexplored interaction dimensions are the typeahead behavior inside
Select popovers (none left on the measurable pages — the employees
select is native) and whatever REF's next deploy ships.
