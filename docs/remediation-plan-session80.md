# Remediation Plan — Session 80 / Parity Round 79: the quadruple-generation cadence round (the 49th + 50th + 51st login deploys each fully laddered non-visual + the 52nd step-1-proven + the seventh CSS movement classified as staging and the eighth as a dead-code sweep) + the FIRST MOBILE VIEWPORT MATRIX (the 390x844 surface parity-locked across the sweep set — zero clone-authored mobile-width defects) + the SIXTEEN-round byte chain

**The round's motivation.** The session-79 completion record (the
triple-generation round) left the backlog EMPTY of open visual/functional
items; the standing watches were the deploy watch (armed at the
post-48th finals — login JS `index-DhIwzCCd` + CSS `index-DbFNLHjM`;
the app side `C-IrDy5f`/`BGNH4KkS`), the ESCALATED deploy-cadence watch,
the design-system-growth watch (the staged utility families), the
Next.js patch watch, the Turnstile rollout watch, and the upstream
dependency watch. The cadence prediction held AGAIN — and COMPRESSED:
this round's window read the login side at FOUR more generations (the
49th/50th/51st/52nd lines), the first three each fully laddered
NON-VISUAL and the fourth step-1-proven at the close (the deploy landed
during the closing pair-capture — the cadence is now faster than a full
ladder cycle). The round also ships the program's first MOBILE-WIDTH
parity evidence — the 390x844 viewport matrix — and extends the byte
chain to sixteen rounds.

**The session's reconstruction note.** The pre-round sandbox was reset
AGAIN (the third consecutive reset); this session rebuilt the
environment from a fresh clone (`be5a05c` — including the owner-pushed
session_177/session_178 transcripts) and re-derived every result from
scratch: .env from .env.example (DATABASE_URL="file:../db/custom.db",
AUTH_SECRET generated), `bun install` (525 packages), db:generate +
db:push + db:seed (Annual 21/21, Sick 30/30), DB pristine verified, the
exported-DATABASE_URL trap checked ACTIVE (`env -u` per invocation), and
chromium r1248 installed FOREGROUND before the E2E gate.

1. **THE 49TH-LINE LOGIN DEPLOY: DETECTED AT THE OPENING WATCH READ.**
   The r80 watch (`scripts/r80-deploy-watch.mjs`, armed at the post-48th
   finals) read login JS `index-DhIwzCCd`→`index-BSFaMTna` AND login CSS
   `index-DbFNLHjM`→`index-8FhcPnw7` (the SEVENTH login-CSS movement of
   the cadence era; the app side QUIET `C-IrDy5f`/`BGNH4KkS`). The login
   DOM census UNCHANGED (the standing six-button set, one form, zero
   Turnstile widgets, zero iframes), the post-login URL clean on the
   first auth attempt. A CSS movement makes the ladder critical.

2. **THE FULL CONFIRMATION LADDER (generation 1 — `BSFaMTna` /
   `8FhcPnw7`):** the fresh logged-out login pair BYTE-IDENTICAL to the
   standing `69aa4241…` baseline (`scripts/r80-login-probe.mjs`) +
   standing **5/5** + sweep **12/12** (the r52 orchestrator, first-try
   clean) + verify-r49 **13/13** + verify-r45 **13/13** → **NON-VISUAL.**

3. **THE CSS-DELTA CLASSIFICATION (the seventh movement): DESIGN-SYSTEM
   STAGING.** Both generations fetched live from the REF origin under
   `/static/`: `DbFNLHjM` 903211 → `8FhcPnw7` 904194 bytes (+983 B net).
   The rule-level diff (`scripts/r79-css-delta.mjs`, CLI-parameterized):
   **1 removed / 9 added** — the `.sm:right-3` swept; the
   `.me-1`, `.max-w-[1312px]`, `.align-[-0.125em]`, `.mix-blend-color`,
   `.transition-[left,top,transform]`, `.transition-[opacity,box-shadow]`,
   `.supports-[align-items:safe_flex-end]`, `.dark:bg-red-600` and
   `.motion-reduce:[*]:!translate-x-0` utilities staged. The PRECISE
   full-name usage sweep (`scripts/r80-css-usage-sweep.mjs`, the round's
   new persisted instrument — raw + escaped + substring probes against
   the live entry JS and the served login HTML): **ZERO usages** of any
   moved utility. The entry JS: `DhIwzCCd` 97382 → `BSFaMTna` 97447
   bytes (md5 `a570d19b…`, triple-fetch-stable; the +65 B
   chunk-graph-rebuild signature; the sweep's 97443 read is the UTF-16
   code-unit count — 4 multi-byte chars — the byte truth is 97447).

4. **THE FRESH-EYES INSTRUMENT: THE FIRST MOBILE VIEWPORT MATRIX —
   every raw FIND classified, ZERO clone-authored mobile-width defects**
   (`scripts/r80-viewport-recon.mjs` + `r80-viewport-classify.mjs` +
   `r80-viewport-matrix.mjs` + `r80-viewport-detail.mjs` +
   `r80-careers-detail.mjs`). The motivation: the program's byte-parity
   proof at mobile width (390x844) had only ever covered the nav
   surfaces (the standing mobile-tabs + mobile-drawer audits); the
   CONTENT routes' mobile rendering was never measured — the exact
   surface where a Tailwind v4 responsive bug would bite. The matrix
   walks the 12-route sweep set on BOTH sides at 390x844 (LIGHT, authed
   sessions) reading shell+geometry signals per route — the header
   class + height, the main rect, sidebar visibility, **HORIZONTAL
   OVERFLOW** (scrollWidth vs innerWidth, the classic TW-v4
   responsive-bug detector), the base44-edit-badge, and the
   sidebar-toggle naming mechanism — comparing member-wise under the two
   DOCUMENTED translations (the badge = REF-only chrome, the session-2
   deliberate deviation; the toggle name = aria-label on LOC vs the
   sr-only span on REF, the session-46 superset). RAW: 6/12 MATCH, 6
   FINDs. THE DETAIL READS classify every FIND: (a) FIVE routes
   (attendance/recruitment/training/profile/settings) overflow on BOTH
   sides with the SAME shell authors (the mobile HEADER +
   `div.flex-1.overflow-auto` pair) — REF-authored overflow, the width
   deltas data-authored (REF production data vs the LOC seed); two of
   them IDENTICAL to the byte (recruitment 550/550, training 600/600,
   settings 1003/1003); (b) **/careers DIVERGES (ref main 602 > 390,
   loc 390 = fits) — DATA-AUTHORED, PROVEN LIVE**: the REF's overflow
   author is its company-chips row (`whitespace-nowrap` buttons — the
   Button base class — rendering production company names up to 570px
   unbreakable: "TALENT SEEKER HUMAN RESOURCES AND MANAGEMENT CONSULTANCY
   LLC"); the LOC's seeded board is EMPTY (the zero-state card, fits).
   The proof: seeding ONE job carrying the REF's widest company name
   into the LOC DB reproduced the REF's EXACT overflow signature on the
   LOC (chip 570 / board 602 / scrollWidth 602 / overflow true — the
   mechanism identical on both sides, the divergence 100% data); the
   probe job swept immediately after (jobs back to 0). The census also
   documents the LOC's dual-shell superset (the desktop shell collapsed
   at mobile + the mobile shell — the structure that renders both
   breakpoints identically to the REF's single shell). **VERDICT: the
   390x844 surface is parity-locked across the sweep set — ZERO
   horizontal overflow on any route where the REF fits, no TW-v4
   responsive defect.**

5. **THE 50TH-LINE DEPLOY: DETECTED AT THE ROUND-END WATCH READ.** login
   JS `BSFaMTna`→`DcJH718L`, login CSS QUIET at `8FhcPnw7` (a JS-only
   chunk-graph rebuild); the app side QUIET. The ladder's first
   standing read hit the daemon's dead-session degradation (the loc
   session on about:blank, 0/5 with evals failing — the r79
   eval-degradation signature in a new form: a silently-DEAD session
   rather than stuck evals); the standing protocol (close --all +
   pkill -9 + respawn + re-auth) restored it and the FULL LADDER ran
   GREEN on this generation: the fresh login pair BYTE-IDENTICAL to
   `69aa4241…` + standing **5/5** + sweep **12/12** + verify-r49
   **13/13** + verify-r45 **13/13** → **NON-VISUAL.**

6. **THE 51ST-LINE DEPLOY: DETECTED AT THE CLOSING READ.** login JS
   `DcJH718L`→`171Edxk3`, CSS QUIET; the app side QUIET. The full ladder
   GREEN on this generation too (byte-identical + 5/5 + 12/12 + 13/13 +
   13/13 → **NON-VISUAL**), after one more daemon reset (the second
   dead-loc-session degradation of the closing phase — the daemon's
   session load under the round's instrument traffic; the reset protocol
   executed each time at the first degradation read).

7. **THE 52ND-LINE DEPLOY: DETECTED DURING THE CLOSING PAIR-CAPTURE —
   STEP-1-PROVEN AT THE CLOSE.** login JS `171Edxk3`→`By5t4Bdg` AND
   login CSS `8FhcPnw7`→`dbXqk6oa` (the EIGHTH movement). The cadence
   has COMPRESSED below a full ladder cycle (~10 minutes between
   deploys): the round closes on the three fully-laddered generations
   with the 52nd carrying its critical first-rung evidence — the fresh
   login pair BYTE-IDENTICAL to the `69aa4241…` baseline (the
   CSS-movement-critical PNG proof) + the CSS delta classified:
   `8FhcPnw7` 904194 → `dbXqk6oa` 903630 bytes (**−564 B: 16 removed /
   0 added** — a pure DEAD-CODE SWEEP of the platform's own accumulated
   staged utilities: the `bottom-[141px]/[163px]/[52px]` +
   `left-[158px]` coordinates, the `w-[221px]/[263px]` + `h-[164px]`
   dims, the peer-has textarea rule, and the `md:/lg:` padding family);
   the precise full-name usage sweep: **ZERO usages** of any removed
   utility; the entry JS `171Edxk3` 97447 → `By5t4Bdg` 97450 bytes (+3 B
   — the chunk-graph signature). The full standing ladder on the
   52nd-or-newer generation is r81's OPENING READ (the app side has been
   QUIET `C-IrDy5f`/`BGNH4KkS` through every generation this round — the
   standing results carry across login-side-only deploys).

8. **THE STANDING CHECKS at HEAD `be5a05c`:** the patch watch QUIET
   (next 16.4.2 the latest stable; the 16.5 line at
   `16.5.0-canary.23`) · `bun audit` UNCHANGED (the two upstream-blocked
   dev-chain advisories: braces ≤3.0.3 under the eslint-config-next
   chain; deepmerge-ts <8 under prisma's exact `@prisma/config` 6.x
   pin) · the TW-v4 scan clean (15 `!important` all globals.css; oklch
   6/6 comments-only, zero in tsx/ts) · secrets zero · the raw DOM-XSS
   sink census ZERO-UNSAFE (the 9 pattern matches classified exactly
   per the standing census: 2 comments + 3 JSON-LD `JSON.stringify`
   blocks + 3 constant-authored nonced boot scripts + 1 constant style
   block) · DB pristine at close (users =
   [sepnetflix2023@outlook.com], employees 1, balances 2, jobs 0).

9. **THE r72 DB-SWEEP INSTRUMENT FIX (the round's only repo-file change
   besides the instruments):** the verify-r45 signup flow now seeds a
   `NotificationPreference` row for the loading-probe user — an FK the
   sweep's fallback missed (P2003 on the bare re-delete). The fallback
   now clears every known dependent (employee, notificationPreference,
   notification, auditLog) before the retry; the sweep ran clean three
   times this round.

10. **THE SCREENSHOT SET + THE SIXTEEN-ROUND BYTE CHAIN**
    (`scripts/r80-screenshots.mjs`, numbers 633-663): the 649 mobile
    drawer pair BYTE-MATCHES the r79 632 pair on BOTH sides (loc
    `e3df921…`, ref `bfaa0da5…` — the SIXTEEN-round chain
    649≡632≡615≡597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366)
    and the 633 login pair BYTE-MATCHES the r79 616 pair on BOTH sides
    (`bd718ed0…` / `69aa4241…`) — with BOTH standing pairs RE-CAPTURED
    on the 50th AND the 51st generations (`scripts/r80-final-pairs.mjs`)
    so the chain claims are made on the generation the round closes on —
    and all seven standing route pairs (635-647) BYTE-STABLE vs the r79
    set on both sides. **THE NEW MOBILE-WIDTH BASELINES (651-663): the
    first per-side 390x844 captures of the seven standing routes** —
    the fresh-eyes angle's chained evidence, to be byte-compared from
    r81 onward. **THE MOBILE-MENU FUNCTIONAL CYCLE GREEN** (the standing
    user emphasis): toggle → the drawer (Dashboard / Training LMS /
    Assets / Staff Requests) → the Training LMS link CLICKED:/training
    → the URL lands on /training → the drawer auto-closes (`open:
    false`) — no TW-v4 regression. 32 PNGs. **The tracked-screenshot
    count CORRECTED this round: the git truth is 814 pre-round (the
    r79 record's "820" was a 6-file arithmetic drift) → 846 after this
    round's 32.**

11. **THE INSTRUMENT TRAPS RETIRED (all infrastructure, classified
    before touching source):** (1) the agent-browser daemon's
    dead-session degradation mode (a NEW overload signature: the loc
    session silently dies to about:blank — evals fail with "Command
    failed" rather than the r79 stuck-evals mode; TWICE this round; the
    reset protocol — close --all + pkill -9 + respawn + re-auth —
    restored it each time at the FIRST degradation read); (2) the
    exported-`DATABASE_URL` trap ACTIVE (third consecutive sandbox; the
    `env -u` guard on every invocation including the db-sweep and the
    prisma one-liners); (3) the chromium-cache trap PRE-RETIRED (r1248
    installed FOREGROUND before the E2E gate — the sandbox carried only
    the stale r1200 cache); (4) the /bin/sh quoting trap applied
    pre-emptively (every long-payload instrument built on the base64
    eval mode from the start — the r79 lesson internalized; the one
    shell-quoted classifier attempt failed with the exact predicted
    "Invalid or unexpected token" signature and was patched to base64);
    (5) the js.length≠bytes subtlety documented (a UTF-16 code-unit
    count reads 4 under the byte truth on the current entry — size
    claims pin via stat, not string length).

12. **GATES:** lint 0/0 · tsc clean · **941/941 unit** · build OK ·
    **E2E 396/396 (6.6m, zero flakes — the sequential proof)** ·
    byte-stability 649≡632 (the sixteen-round chain, both sides,
    re-proven on the 50th AND 51st generations) + 633≡616 (the login
    pair, both sides) + the seven route pairs stable vs the r79 set on
    both sides · **846 tracked screenshots (+32, the 633-663 set
    including the first mobile-width baselines)** · DB pristine.

**The round's verdict: ZERO DEFECTS FOUND — ZERO SOURCE CHANGES** (the
seventh consecutive audit-only round). The round's diff: the ten
instruments (`r80-deploy-watch` + `r80-login-probe` +
`r80-css-usage-sweep` + `r80-viewport-recon` + `r80-viewport-classify` +
`r80-viewport-matrix` + `r80-viewport-detail` + `r80-careers-detail` +
`r80-screenshots` + `r80-final-pairs`) + the r72-db-sweep FK fallback
fix + the evidence (32 screenshots, 633-663) + the docs layer. The
platform's rebuild cadence has COMPRESSED past the ladder-cycle time
(four generations in one round's window; the 52nd landing during the
closing capture) — every movement still staging/sweeping dead
utilities, every one PNG-proven non-visual on the standing surfaces.

**Standing watches carried forward:** the deploy watch (armed at the
post-52nd finals — login JS `index-By5t4Bdg` + CSS `index-dbXqk6oa`;
the app side `C-IrDy5f`/`BGNH4KkS` QUIET throughout; **r81's opening
read = the full ladder on the 52nd-or-newer**), the deploy-cadence watch
(ESCALATED-FURTHER — ten generations across the last three rounds; the
stale-cookie + dead-session traps fire together now; re-auth the ref
session AND reset the daemon at the first degradation read before every
post-deploy standing read), the design-system-growth watch (the seventh
movement staged 9 more utilities, the eighth swept 16 — the net cycle
continues; the mobile viewport matrix is now the rendered-use detector
for this class), the mobile-width byte chain (NEW — the 651-663
baselines, byte-compared from r81), the Next.js patch watch (16.4.2
latest stable; 16.5 at canary), the Turnstile rollout (login-side,
watch-only — still unenforced), and the upstream dependency watch
(braces 3.0.4+; the Prisma deepmerge-ts path).
