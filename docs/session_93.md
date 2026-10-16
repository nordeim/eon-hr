# Session 93 — parity round 45 (session-46): the hidden view-swapped login flows

The continuation window for the interrupted round-45 session. The
previous window completed the round's code work but died before the
full-E2E confirmation + commit — and the workspace reset lost every
uncommitted byte, so this window re-derived the whole round from fresh
live measurements.

The workspace was reset (the third-plus reset of the parity program) —
fresh clone at `3c767d7`, env rebuilt (bun install, `.env` with
`DATABASE_URL="file:../db/custom.db"` + a generated AUTH_SECRET,
db:push + db:seed with the shell-level DATABASE_URL trap unset inline,
Playwright chromium reinstalled). Baseline gates ALL GREEN: lint 0/0 ·
tsc ✓ · 681/681 unit · build ✓ · 203/203 E2E — aligned with the
documented round-44 state. This window = **session-46 / parity
round 45**.

The redeploy watch fired immediately: **the 11th login deploy** —
login JS `BerEzxez` → `CcAnCcTT`, login CSS `NS4V-1t3` → `BWytzgpi`
(JS + CSS both; the app fingerprints `C-IrDy5f`/`BGNH4KkS` quiet).
Per the round-42 precedent, a full login re-audit ran FIRST: the
r44-fixed surfaces re-verified MATCH on the new build (the icon
family, the title/action row, the at-rest geometry, the failed-login
Alert). The runtime style-block census: the react-hot-toast block is
GONE from the login (the sonner block remains — platform runtime, no
login flow fires a toast).

Then the round's core — the census that finally CLICKED the dead
ends. The phase-A/B census scripts (probe-r45-census-a..b10.mjs)
fired every action button on REF's login and mapped two complete
view-swapped flows that 44 rounds never saw: the password-reset flow
(the back button + title group + one-field form → "Sending..." → the
"Check your email" success view with the icon circle + green Alert +
email span, anti-enumeration verified live with a throwaway address)
and the sign-up flow (the bare space-y-4 wrapper + direct H2 +
three-field form → "Creating account..." → the duplicate-email error
with REF's verbatim "A user with this email already exists"). The
sibling input family (h-10 sm:h-11 + placeholder:text-slate-400, the
slate-400 icons, no autocomplete) + the per-view rhythm contracts
(the reset's sm:space-y-6 vs the signup's bare space-y-4; the -mb-2
back buttons) captured verbatim.

The TDD cycle: **16 new pins RED** (exactly, no stragglers) → the
GREEN implementation — the Alert `success` variant, the two API
routes (/api/auth/forgot-password always-ok + /api/auth/signup with
the verbatim duplicate copy + the auto-login superset), the login
page's view-swap refactor (four hand-authored icon components, the
dedicated per-view field state, the trap-6 rhythm restorations, the
`[--foreground:#09090b]` sibling pin), and 5 predecessor amendments
(R38-G1 + the four count pins re-anchored to the sign-in form
region). The comments-in-source trap fired once (a fresh comment
quoting the retired input members inflated two count pins — reworded
to prose). **Unit GREEN: 697/697** (+16).

The E2E spec (session46-login-flows, 6 tests) took three spec-fix
iterations (the AlertDescription class-order split → the sorted-set
assertion; getByLabel("Password") substring-matching "Confirm
Password" → exact; a bitmask-vs-boolean assertion + a missing
wait-before-read on the duplicate flow). **Full gates: lint 0/0 ·
tsc ✓ · 697/697 unit · build ✓ · 209/209 E2E** (+6, first full run).

The live verification surfaced two REF-side surprises: (1) REF
SILENTLY DROPPED the sidebar trigger's aria-label — the accessible
name now rides the sr-only span alone; the drawer opens identically
(the 288px panel both apps), the clone's aria-label/type/
aria-expanded stay kept supersets, and the standing probe's finder
now matches either mechanism (plus a settle wait — the marginal
CLI-overhead timing was catching the drawer mid-slide); (2) the
one-liner trap: a `//` comment inside a probe's template literal gets
joined onto one line and comments out the whole expression body —
the fix is the `/* */` form. **verify-r45: 13/13 MATCH** — both
views' rhythm both bands (the y/h geometry contract; the v3-mt/v4-mb
margin-side split documented — the same rendered gaps via the other
margin side), the sibling input classes + the slate-400 icons, the
success view, the duplicate Alert (canvas-rasterized bg
254,242,242,179 on BOTH apps — the lab() split pixel-proven), both
loading interiors, the `--foreground` resolution, the at-rest r44
regression, the view-swap behavior. Standing audits 5/5 + route
sweep 12/12 post-change.

The DB pristine check earned its keep: the loading-state live probe
had fired a REAL signup (users=2) — the throwaway probe user was
caught + cleaned (users=1, employees=1, leaveBalances=2).
`.env.example` verified (keys match `.env`). 10 screenshots
(176-179: the reset view, the success view, the duplicate error, the
mobile band — REF + LOC pairs) → **262 PNG captures**.

The documentation phase: the remediation plan's completion record,
the AGENTS session-46 layer + the Commands-table counts, SKILL
3.29.0 + §58 (+ the State line), PAD [S46], CLAUDE/README counts
(the 906-spec pyramid), this journal, and the worklog.
