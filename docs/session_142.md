# Session 68 — the narrative (parity round 67: the Next.js security-patch upgrade + the history-bug closure + the 31st-deploy ladder + the drift re-census)

The round's question, asked at the completed-matrix frontier: what
remains? The r66 completion record left exactly three recorded items —
the optional muted-foreground/--primary token re-map, the deploy watch
armed at the post-30th finals, and the Next.js 16.4.0 history bug
"whose fix lives upstream". This round converted all three.

## The upgrade watch was actionable

`npm view next` answered the upstream question before any browser
opened: **16.4.1 and 16.4.2 had shipped** (2026-10-14/15). The release
notes made the upgrade mandatory rather than optional — 16.4.1 contains
TWO CRITICAL unauthenticated-RCE fixes (use-cache functions returning
typed arrays, and the Image Optimization API when SVG files are used)
plus a High Server-Actions DoS fix. The user's standing goal is a
PRODUCTION-READY superset; staying on 16.4.0 against two critical
unauthenticated RCEs is not production-ready. Neither release notes
the Navigation API history fix — so the round would prove or disprove
the corruption's survival itself.

The discipline: reproduce the baseline first (lint 0/0 · tsc ✓ ·
910/910 unit · build ✓ · E2E 366/366 in 5.5m on 16.4.0), then the
patch-level jump (`bun add next@16.4.2 eslint-config-next@16.4.2`),
then the same gates on the upgrade: **all green, E2E 366/366 (5.6m,
zero flakes)**. A patch upgrade guarded by the full pyramid is the
safest framework bump available — and the byte-stability pair (below)
made even the rendered surface provable.

## The 31st deploy — the ladder on the upgraded build

The round's watch (`scripts/r68-deploy-watch.mjs`, the post-30th
finals armed) detected the **31st login deploy**: login JS
`DwY57mhH`→`8hcVVGz2`, CSS quiet, the app side quiet. Per protocol:
fresh re-auth, then the full ladder — standing 5/5 + sweep 12/12 +
verify-r49 13/13 + verify-r45 13/13 → **NON-VISUAL**. The ladder's
:3200 server was the UPGRADED standalone, so the standing audits
double-validated on 16.4.2 for free.

## The history bug — closed, not patched

The revived detector re-ran the session-56 entries-dump repro on the
upgraded build: after a full load of /profile, click 1 pushes
`["/profile","/staffrequests"]`, click 2 pushes
`["/profile","/staffrequests","/training"]` — **push-only growth,
prefix preserved, zero adjacent duplicates** — and back-back lands on
/profile, the page the user loaded. The 16.4.0 signature (the loaded
entry replaced by the entry-below duplicate, back-back skipping the
loaded page, 5/5 deterministic in the session-56 isolation) is gone.
The upstream fix shipped silently inside the security patches.

The lock: `tests/e2e/session68-history-closure.spec.ts` — R68-A pins
the two-deep back contract (the exact corruption shape, now asserted
CLEAN), R68-B pins the push-only entries contract in computed truth
(+1 entry per click, prefix preserved, no adjacent duplicates, the
pushed tail in order). Both green on the first run. On 16.4.0 these
would fail (the session-56 repro is the red side of the pair); on
16.4.2 they pass — the upstream fix, locked as a regression gate. The
R56-E record closes: the one recorded functional divergence between
the clone and its reference no longer exists.

## The drift re-census — no drift, and the count improved

The r63 light-text instrument re-read the full 49-route population
against the CURRENT reference (three deploys newer than the original
census): **42/49 MATCH** — better than the r63 post-fix 41/49, because
the r63-era taskmanager mid-load transient now MATCHES at steady state.
Every DIFF decomposes to the documented allowance set exactly
(employees the seeded grid, profile the asChild back-arrow tag
artifact, attendance the admin superset, interviewassistant the
r48-C1 card, advancedanalytics the hidden recharts-tooltip mount,
onboardingtemplates the r36 anchor superset, careers the live data).
No new divergence. The matrix holds against the live reference.

The census doubled as the token-closure evidence: every placeholder
surface reads `rgb(115,115,115)` on both sides, every muted text pair
matches, every neutral literal override held. The
muted-foreground/--primary token re-map therefore has ZERO
user-visible surface — it closes as an ARCHITECTURAL note, with the
census as the proof, ending its multi-round residence on the frontier
list.

## The standing checks

The mobile-menu cycle (the user's standing emphasis): toggle → the
drawer opens with the nav links → the Training LMS link navigates to
/training → auto-close verified (`open:false` at the training URL).
The TW-v4 scan: `!important` 15 (baseline), oklch in comments only.
The byte-stability pair: **the 438 mobile drawer pair BYTE-MATCHES the
r67 418 pair on both sides** — a four-round chain (438 ≡ 418 ≡ 402 ≡
366) and, new this round, a CROSS-VERSION byte-proof: 418 was captured
on 16.4.0, 438 on 16.4.2 — the framework upgrade changed zero rendered
bytes of the standing surface, and the identical REF side re-confirms
the 31st deploy left the app surface untouched.

## The round's lessons (the carry-forward)

1. The re-run detector inherited the live session's Navigation
   entries — the determinism pre-step is `about:blank` before the app
   URL (a same-URL open is a reload, not a new entry).
2. agent-browser eval returns pretty-printed JSON for arrays — the
   parse chain needs the plain parse first.
3. The working background-launch pattern for long runs: `(setsid nohup
   … < /dev/null &)`; the plain `nohup … & disown` died silently.
4. The sleep-units trap struck again (`sleep 2500` = 41 minutes) —
   shell sleeps are SECONDS.
5. A login-side-only deploy still gets the full ladder; the
   byte-stability pair is the independent app-surface re-confirmation.

## Where the project stands

The recorded backlog is now empty of open visual/functional items: the
matrix complete (r66), the security patches current (16.4.2), the one
functional divergence closed and pinned, the 31st deploy audited, the
text axis drift-verified against the live reference, the token question
closed, the mobile surface byte-stable across four rounds AND across
the framework upgrade. Gates: lint 0/0 · tsc ✓ · 910/910 unit · build
✓ · E2E 368/368 · DB pristine. The next deploy watch arms at the
post-31st finals; the only standing maintenance items are the watch
itself and the ordinary next-patch cycle.
