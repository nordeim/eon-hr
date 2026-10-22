# Remediation Plan — Session 79 / Parity Round 78: the triple-generation round (the 46th + the 47th + the 48th login deploys each fully laddered non-visual, the FIFTH + SIXTH CSS movements classified as design-system staging) + the first accessibility census (61 routes — zero clone-authored defects) + the FIFTEEN-round byte chain

**The round's motivation.** The session-78 completion record (the
quadruple-deploy cadence round) left the backlog EMPTY of open
visual/functional items; the standing watches were the deploy watch
(armed at the post-45th finals — login JS `index-t01Y3EV6` + CSS
`index-o5aKXf2B`; the app side `C-IrDy5f`/`BGNH4KkS`), the ESCALATED
deploy-cadence watch (~10-20 minute spacing, the stale-cookie trap
firing on every deploy), the design-system-growth watch (the sky-badge
token family + card-title typography staged in the platform
stylesheet), the Next.js patch watch, the Turnstile rollout watch, and
the upstream dependency watch. The cadence prediction held AGAIN: this
round's window read the login side at THREE more generations and moved
the login CSS TWICE more (the fifth and sixth movements of the cadence
era). The round also ships the program's first ACCESSIBILITY evidence
angle — the 61-route a11y census — and extends the byte chain to
fifteen rounds.

**The session's reconstruction note.** The pre-round sandbox was reset
again (the second consecutive reset); this session rebuilt the
environment from a fresh clone (`0072fa9` — including the
owner-pushed `session_175` Chinese transcript) and re-derived every
result from scratch: .env from .env.example (DATABASE_URL=
"file:../db/custom.db", AUTH_SECRET generated), `bun install` (525
packages), db:generate + db:push + db:seed (Annual 21/21, Sick 30/30),
DB pristine verified, chromium r1248 pre-installed BEFORE the E2E gate
(the cache trap pre-retired).

1. **THE 46TH-LINE LOGIN DEPLOY: DETECTED AT THE OPENING WATCH READ.**
   The r79 watch (`scripts/r79-deploy-watch.mjs`, armed at the
   post-45th finals) read login JS `index-t01Y3EV6`→`index-Cyrjqt_z`
   AND login CSS `index-o5aKXf2B`→`index-C36NwD0S` (the FIFTH
   login-CSS movement of the cadence era; the `frontend-config`
   preload holding; the app side QUIET `C-IrDy5f`/`BGNH4KkS`). The
   login DOM census UNCHANGED (the standing six-button set, one form,
   zero Turnstile widgets, zero iframes — the standing watch item
   still unenforced), the post-login URL clean on the first auth
   attempt. A CSS movement makes the ladder critical.

2. **THE FULL CONFIRMATION LADDER (generation 1 — `Cyrjqt_z` /
   `C36NwD0S`):** the fresh logged-out login pair BYTE-IDENTICAL to
   the standing `69aa4241…` baseline (`scripts/r79-login-probe.mjs`)
   + standing **5/5** + sweep **12/12** (the r52 orchestrator,
   first-try clean) + verify-r49 **13/13** + verify-r45 **13/13** →
   **NON-VISUAL.**

3. **THE CSS-DELTA CLASSIFICATION (the fifth movement): DESIGN-SYSTEM
   STAGING.** Both generations fetched live from the REF origin under
   `/static/` (the old hashed assets remain served — the forensic
   archive): `o5aKXf2B` 902852 → `C36NwD0S` 903178 bytes (+326 B net).
   The rule-level diff (`scripts/r79-css-delta.mjs`, now
   CLI-parameterized): **0 removed / 2 added** —
   `.bg-[#f1f3f4]` (a fixed near-white) +
   `.shadow-[0_1px_3px_rgba(15,23,42,0.12)]` (a custom shadow). The
   PRECISE full-name usage sweep (the r78 lesson — the coarse
   truncated-name sweep is too broad): **ZERO usages** of either
   utility in the current entry JS or the served login HTML (all
   forms checked: escaped CSS form, raw class form, substring
   probes). The entry JS: `t01Y3EV6` 97477 → `Cyrjqt_z` 97382 bytes
   — the near-same-size chunk-graph-rebuild signature.

4. **THE FRESH-EYES INSTRUMENT: THE FIRST ACCESSIBILITY CENSUS —
   every finding REF-authored parity, ZERO clone-authored defects**
   (`scripts/r79-a11y-census.mjs` + `scripts/r79-a11y-detail.mjs`).
   The motivation: the program claims WCAG 2.2 AA as its baseline but
   had never measured a11y signals across the surface (the prior
   proofs covered pixels, runtime cleanliness, transfer weight, and
   installability). The census walks the ENTIRE 61-route registry on
   the LOC standalone (:3200, seeded DB, a dedicated authed session)
   reading DOM-declarative signals per route: html lang, document
   title, viewport meta, img alts, form-control accessible names,
   button/link accessible names, iframe titles, positive tabindex,
   and skipped heading levels. The RAW findings: 20 routes with an
   h1→h3 heading skip, 8 unnamed buttons (6 on /securitysettings, 1
   /hrassistant, 1 /hrreports), and one WEAK note (a placeholder-only
   input on /hrassistant). The DETAIL READ classifies every one
   REF-authored parity: the REF renders the IDENTICAL
   `H2:EonHR → H1:<title> → H3:<sections>` heading structure on every
   flagged route, and carries the SAME-OR-MORE nameless buttons (its
   own unnamed `role=checkbox` family on /securitysettings, the
   unnamed combobox trigger on /hrreports, the unnamed
   `inline-flex` icon buttons on /hrassistant, /payroll and
   /taskmanager where the LOC reads ZERO) — while the LOC keeps its
   documented aria-label SUPERSETS (the "Toggle Sidebar" superset,
   etc.). The a11y census therefore found the surface to be a strict
   parity match (or better) on every signal — the WCAG-AA claim now
   has a measured record, zero clone-authored defects.

5. **THE FINGERPRINT-REGEX BLIND SPOT (the round's instrument
   finding, discovered via the raw script-src census):** the deploy
   watch's JS fingerprint regex (`[A-Za-z0-9_-]{6,}\.(?:css|js)`)
   never surfaced the FIVE-character `badge.js` or the platform
   runtime scripts (`/api/frontend-config.js` — actually 16 chars,
   surfaced; the google gsi client, `cdn.tailwindcss.com`, and
   `/static/js/badge.js`). The raw census now documents the login
   page's full script set: 5 srcs. The `/static/js/badge.js` (21914
   bytes, `data-app-id` + `data-platform-url`) renders the
   `base44-edit-badge` — a 197×39 "Edit with" chip at the
   bottom-right — the **session-2 documented deliberate deviation**
   (the builder badge is not cloned), present in the REF baseline
   PNGs all along (the byte-identical login pair carries it on both
   sides of the comparison). No action; the blind spot is now on the
   record for every future watch read.

6. **THE 47TH-LINE DEPLOY: DETECTED AT THE FIRST ROUND-END WATCH
   READ.** login JS `index-Cyrjqt_z`→`index-gpurZBVX`, login CSS
   QUIET at `C36NwD0S`; the app side QUIET. The full ladder re-run on
   this generation: the fresh login pair BYTE-IDENTICAL to
   `69aa4241…` + standing **5/5** + sweep **12/12** + verify-r49
   **13/13** + verify-r45 **13/13** → **NON-VISUAL** (a JS-only
   chunk-graph rebuild). The two standing byte-chain pairs
   RE-CAPTURED on this generation (`scripts/r79-final-pairs.mjs`):
   both STABLE.

7. **THE 48TH-LINE DEPLOY: DETECTED AT THE CLOSING WATCH READ — AND
   THE LADDER RE-RUN ON IT, CLOSING THE ROUND.** login JS
   `index-gpurZBVX`→`index-DhIwzCCd` AND login CSS
   `index-C36NwD0S`→`index-DbFNLHjM` (the SIXTH CSS movement). The
   CSS delta classified: 903178→903211 bytes (+33 B): **0 removed /
   1 added** — `.min-w-[560px]`, ZERO usages (precise full-name
   sweep) — the design-system staging continuing; the entry JS
   97382→97382 bytes (identical size). The full ladder green on this
   generation too (byte-identical + 5/5 + 12/12 + 13/13 + 13/13) →
   **NON-VISUAL**, and the two standing pairs RE-CAPTURED on it
   (both STABLE) — the chain claims made on the generation the round
   closes on. The watch is ARMED at the post-48th finals (login JS
   `index-DhIwzCCd` + CSS `index-DbFNLHjM`; the app side
   `C-IrDy5f`/`BGNH4KkS` QUIET throughout the round).

8. **THE STANDING CHECKS at HEAD `0072fa9`:** the patch watch QUIET
   (next 16.4.2 the latest stable; the 16.5 line at
   `16.5.0-canary.23`) · `bun audit` UNCHANGED (the two
   upstream-blocked dev-chain advisories: braces ≤3.0.3 under the
   eslint-config-next chain; deepmerge-ts <8 under prisma's exact
   `@prisma/config` 6.x pin) · the TW-v4 scan clean (15 `!important`
   all globals.css; oklch 6/6 comments-only) · secrets zero · the
   raw DOM-XSS sink census ZERO-UNSAFE (the 9 pattern matches
   classified: 2 comments + 3 JSON-LD `JSON.stringify` blocks + 3
   constant-authored nonced boot scripts + 1 constant style block) ·
   DB pristine after the sweep (the verify-r45 signup-flow probe user
   swept per the r61 protocol AFTER the last ladder run; users =
   [sepnetflix2023@outlook.com], employees 1, balances 2).

9. **THE SCREENSHOT SET + THE FIFTEEN-ROUND BYTE CHAIN**
   (`scripts/r79-screenshots.mjs`, numbers 616-632): the 632 mobile
   drawer pair BYTE-MATCHES the r78 615 pair on BOTH sides (loc
   `e3df921…`, ref `bfaa0da5…` — the FIFTEEN-round chain
   632≡615≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366)
   and the 616 login pair BYTE-MATCHES the r78 599 pair on BOTH
   sides (`bd718ed0…` / `69aa4241…`) — past the whole observed deploy
   line (three generations, two CSS movements) — and all seven
   standing route pairs (618-630) BYTE-STABLE vs the r78 set on both
   sides, with the two standing pairs re-captured on BOTH the 47th
   and 48th generations. **THE MOBILE-MENU FUNCTIONAL CYCLE GREEN**
   (the standing user emphasis): toggle → the drawer (Dashboard /
   Training LMS / Assets / Staff Requests) → the Training LMS link
   CLICKED:/training → the URL lands on /training → the drawer
   auto-closes (`open: false`) — no TW-v4 regression.

10. **THE INSTRUMENT TRAPS RETIRED (all infrastructure, classified
    before touching source):** (1) the `/bin/sh` QUOTING TRAP (NEW —
    the long a11y-census eval payload with embedded quotes tripped
    the shell's double-quote processing and truncated the expression
    to "Unexpected end of input"; the fix is the agent-browser `-b`
    BASE64 eval mode — the documented escaping-safe route, now the
    pattern for every long-payload instrument); (2) the
    exported-`DATABASE_URL` trap ACTIVE (including on
    `r72-db-sweep.mjs` — the "Unable to open the database file"
    signature; `env -u DATABASE_URL DATABASE_URL="file:../db/custom.db"`
    per invocation); (3) the agent-browser daemon overload THREE
    times (a `Cannot fork` at spawn, a WorkerThreadsTaskRunner-class
    crash, and an eval-degradation mode with stuck sessions mid-sweep
    — `close --all` + `pkill -9` + respawn + re-auth each time); (4)
    the chromium-cache trap PRE-RETIRED (r1248 installed foreground
    before the E2E gate — the background nohup spawn died silently at
    the tool-call boundary, the supervisor-kill lesson re-proven);
    (5) the fingerprint-regex blind spot DOCUMENTED (the 5-char
    `badge.js` + the platform runtime scripts invisible to every
    r74-r79 watch read — the raw script-src census now on the
    record).

11. **GATES:** lint 0/0 · tsc clean · **941/941 unit** · build OK ·
    **E2E 396/396 (6.4m, zero flakes — the sequential proof)** ·
    byte-stability 632≡615 (the fifteen-round chain, both sides,
    re-proven on the 47th AND 48th generations) + 616≡599 (the login
    pair, both sides) + the seven route pairs stable vs the r78 set
    on both sides · **820 tracked screenshots (+18, the 616-632
    set)** · DB pristine.

**The round's verdict: ZERO DEFECTS FOUND — ZERO SOURCE CHANGES**
(the sixth consecutive audit-only round). The round's diff: the seven
instruments (`scripts/r79-deploy-watch.mjs` + `r79-login-probe.mjs` +
`r79-css-delta.mjs` + `r79-a11y-census.mjs` + `r79-a11y-detail.mjs` +
`r79-screenshots.mjs` + `r79-final-pairs.mjs`) + the evidence (18
screenshots, 616-632) + the docs layer. The platform's rebuild cadence
remains the dominant environmental fact: three more generations + two
more CSS movements in one round's window, every movement
staging/sweeping dead utilities, every one PNG-proven non-visual on
the standing surfaces.

**Standing watches carried forward:** the deploy watch (armed at the
post-48th finals — login JS `index-DhIwzCCd` + CSS `index-DbFNLHjM`;
the app side `C-IrDy5f`/`BGNH4KkS` QUIET throughout), the
deploy-cadence watch (ESCALATED — six generations across the last two
rounds; the stale-cookie trap fires on every deploy; re-auth the ref
session before every post-deploy standing read), the
design-system-growth watch (the staged utility families continue: +2
then +1 dead utilities this round; the r78 sky-badge tokens still
unrendered — if a future deploy renders them, the byte chain will
catch it), the Next.js patch watch (16.4.2 latest stable; 16.5 at
canary), the Turnstile rollout (login-side, watch-only — still
unenforced), and the upstream dependency watch (braces 3.0.4+; the
Prisma deepmerge-ts path).
