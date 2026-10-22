# Session 170 — the triple-deploy round (parity round 76): the 39th + the 40th login deploys both laddered non-visual (the CSS movement classified as a dead-code sweep) + the transfer-weight audit (the first page-weight measurement) + the THIRTEEN-round byte chain

Session 77 opened at the recorded resume point: the standing watches
(the deploy watch armed at the post-38th finals, the NEW
deploy-cadence watch, the patch watch, the Turnstile rollout, the
upstream dependency watch) and an empty backlog — the previous three
rounds had been audit-only. The round followed the standing protocol:
environment + baseline gates on the unmodified HEAD, the deploy
watch, the standing checks, the fresh-eyes candidate, the screenshot
set + byte-stability proofs + the mobile-menu cycle, the closing
gates, the docs layer, the commit + push.

## What the round delivered

1. **THE 39TH LOGIN DEPLOY: DETECTED — JS AND CSS BOTH MOVED.** The
   r76 watch read login JS `index-CXV35yah`→`index-BOwtYlPm` AND
   login CSS `index-B9rzNd1e`→`index-DS1aCkan` — the FIRST
   login-CSS movement since the 35th deploy, which made the ladder
   critical (a stylesheet change can render). The app side QUIET
   (`C-IrDy5f`/`BGNH4KkS`). The fresh re-auth clean (Turnstile
   unenforced); the login DOM census unchanged (the six-button set,
   one form, zero Turnstile widgets).

2. **THE 40TH LOGIN DEPLOY: DETECTED MID-ROUND.** The r77 login
   probe's census read login JS `index-HY4zt1AJ` — a THIRD
   generation inside one round (the 39th's `BOwtYlPm` superseded
   ~20 minutes in; CSS quiet at `DS1aCkan`). The deploy-cadence
   watch's prediction ("expect more of the same class") confirmed
   immediately.

3. **THE CONFIRMATION LADDER GREEN ON THE CURRENT GENERATION:** the
   fresh login pair BYTE-IDENTICAL to the standing `69aa4241…`
   baseline (the pair captured ON the 40th generation, which carries
   the 39th's CSS — the CSS movement is transitively PNG-proven
   non-visual) + standing **5/5** + sweep **12/12** + verify-r49
   **13/13** + verify-r45 **13/13** → **BOTH DEPLOYS NON-VISUAL.**

4. **THE CSS-DELTA CLASSIFICATION: THE 39TH'S CSS MOVEMENT IS A
   DEAD-CODE SWEEP.** Both CSS generations fetched live (902707 →
   902076 bytes, a 631-byte shrink); the rule-level diff reads 8
   arbitrary-value utility rules REMOVED (`bg-[#e2e5ee]`,
   `bg-[#e9eef6]`, `bg-[#fbfcfd]`, `border-[#d6e6fe]/70`, the
   `.dark:` variants, `dark:text-[#868aa5]`) + 1 ADDED
   (`sm:grid-cols-[11rem_minmax(0,1fr)]`). A usage sweep of the
   current entry bundle and the served login HTML found ZERO
   references to any of the removed names — dead utilities from an
   older login-app iteration, swept by the platform build. The JS
   entry: 97529 → 97481 bytes, the near-same-size chunk-graph
   signature (the r75 mechanism).

5. **THE TRANSFER-WEIGHT AUDIT (the round's fresh-eyes instrument —
   the FIRST page-weight measurement in the 76-round program):** both
   apps measured per standing surface via the browser's own
   PerformanceResourceTiming. ALL ROUTES HEALTHY on the LOC side —
   no route over 2 MiB total transfer, no single asset over 1.5 MiB;
   the authed routes decode 834-900 KiB each, LEANER than the REF
   SPA's ~2.3 MiB decoded bundle (the architecture trade: REF ships
   3.9 KiB HTML shells + one big SPA; LOC server-renders 59-74 KiB
   HTML + smaller per-route payloads). The REF record: login 76
   requests / 1809 KiB decoded. Zero anomalies.

6. **THE STANDING CHECKS at HEAD `2ec8d57`:** the patch watch QUIET
   (next 16.4.2 the latest stable; the 16.5 line at
   `16.5.0-canary.21`) · `bun audit` unchanged (the two
   upstream-blocked dev-chain advisories) · the TW-v4 scan clean (15
   `!important` all globals.css; oklch 6/6 comments-only) · secrets
   zero · the XSS sink census zero-unsafe (the 9 pattern matches all
   classified: comments, JSON-LD `JSON.stringify`, constant nonced
   boot scripts, one constant style block) · DB pristine after the
   probe-user sweep.

7. **THE BYTE-STABILITY PROOFS (numbers 581-597):** the 597 drawer
   pair ≡ the r76 579 pair on BOTH sides (the THIRTEEN-round chain
   597≡579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366); the 581
   login pair ≡ the r76 563 pair on BOTH sides (`bd718ed0…` /
   `69aa4241…`) — past BOTH deploys AND the CSS movement; all seven
   route pairs stable vs the r76 set on both sides.

8. **THE MOBILE-MENU FUNCTIONAL CYCLE: GREEN** — the standing user
   emphasis: toggle → the drawer (Dashboard / Training LMS / Assets /
   Staff Requests) → the Training LMS link CLICKED:/training → the
   URL lands on /training → the drawer auto-closes (open: false). No
   Tailwind-v4 regression.

9. **THE CLOSING GATES** — lint 0/0 · tsc clean · 941/941 unit ·
   build OK · E2E 396/396 (6.3m, zero flakes, sequential; the
   chromium-cache pre-checked green — both r1200 and r1248 present).

10. **ZERO DEFECTS FOUND — ZERO SOURCE CHANGES** (the fourth
    consecutive audit-only round). The round's diff: the three
    instruments (r77-login-probe + r77-asset-audit +
    r77-screenshots), the evidence (18 screenshots → 784 tracked),
    and the docs layer.

## The instrument traps retired (all infrastructure, classified before touching source)

- **The agent-browser daemon overload — AGAIN.** The first
  standing-run read 0/5: the `loc` session never navigated (stuck on
  `about:blank`) and the diagnostic hit `CDP command timed out:
  Runtime.evaluate`. The r75 protocol restored it: `close --all` +
  pkill + restart + re-auth — including the documented side effect
  that `close --all` wipes the warm `ref` session auth.
- **The exported-`DATABASE_URL` trap** — ACTIVE (the sandbox exports
  its own path); `env -u DATABASE_URL` per invocation.
- **The verify-r45 signup-flow probe user** — swept per the r61
  protocol AFTER the last ladder run (it re-created itself between
  runs once already this round; the sweep must follow the final
  ladder execution). DB pristine at close.
- **The /tmp non-persistence** — forensic bundles fetched to a
  repo-local scratch dir (`.tmp-r77/`, swept before the commit).

## Next

The standing watches: the deploy watch (armed at the post-40th
finals — login JS `index-HY4zt1AJ` + CSS `index-DS1aCkan`; the app
side `C-IrDy5f`/`BGNH4KkS`), the deploy-cadence watch (CONFIRMED —
three login JS generations in one round, ~10-20 minute spacing), the
Next.js patch watch (16.4.2 latest stable; 16.5 at canary), the
Turnstile rollout, and the upstream dependency watch (braces 3.0.4+;
the Prisma deepmerge-ts path). The candor-ordered frontier: the
real-Chrome install smoke on a deployed HTTPS origin
(blocked-in-scope here); the offline-page styling polish (still
deliberately deferred — no REF counterpart).
