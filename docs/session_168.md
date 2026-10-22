# Session 168 — the double-deploy round (parity round 75): the 37th + the 38th login deploys both laddered non-visual + the bundle forensics (the chunk-graph rebuild mechanism) + the TWELVE-round byte chain, with six instrument traps retired on the way

Session 77/76 opened at the recorded resume point: the standing
watches (the deploy watch armed at the post-36th finals, the patch
watch, the Turnstile rollout, the upstream dependency watch) and an
empty backlog — the previous two rounds had been audit-only. The
round followed the standing protocol: environment + baseline gates
on the unmodified HEAD, the deploy watch, the standing checks, the
fresh-eyes candidate, the screenshot set + byte-stability proofs +
the mobile-menu cycle, the closing gates, the docs layer, the
commit + push.

## What the round delivered

1. **THE 37TH LOGIN DEPLOY: DETECTED + LADDERED NON-VISUAL.** The
   r76 watch read login JS `index-CiBFwtqW`→`index-BVGv30vf` (the
   frontend-config preload holding) with the CSS + the app side
   quiet. The fresh re-auth clean (Turnstile unenforced); the login
   DOM census unchanged (the social-button set, one form, zero
   Turnstile widgets). The full ladder: the fresh login pair
   BYTE-IDENTICAL to the standing `69aa4241…` baseline + standing
   5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13.

2. **THE 38TH LOGIN DEPLOY: DETECTED MID-ROUND + LADDERED NON-VISUAL.**
   While fetching the 37th's bundle for the forensic diff, the raw
   HTML served `index-CXV35yah` — a second deploy ~10 minutes after
   the first. The watch re-read confirmed the movement; the full
   ladder re-ran green on the new deploy (the fresh login pair again
   byte-identical; the ladder again 5/5 + 12/12 + 13/13 + 13/13).

3. **THE BUNDLE FORENSICS: BOTH DEPLOYS ARE CHUNK-GRAPH REBUILDS.**
   Three entry generations fetched live (97530/97529/97529 bytes,
   three distinct md5s); the generation-over-generation diff is
   ~840 regenerated chunk-hash references in the `__vite__mapDeps`
   dependency map (`mixpanelUtils`, `i18n`, `UserAppMain`,
   `axiosClient`, …) with the entry's own code the same size and the
   rendered login byte-identical — a platform-side rebuild, zero
   rendered change. The watch re-armed at the post-38th finals reads
   BOTH SIDES QUIET.

4. **THE STANDING CHECKS at HEAD `61ac313`:** the patch watch QUIET
   (next 16.4.2 the latest stable) · `bun audit` unchanged (the two
   upstream-blocked dev-chain advisories) · the TW-v4 scan clean (15
   `!important` all globals.css; oklch 6/6 comments-only) · secrets
   zero · the XSS sink census zero-unsafe (the 9 pattern matches all
   classified: comments, JSON.stringify JSON-LD, constant nonced
   boot scripts) · DB pristine after the probe-user sweep.

5. **THE BYTE-STABILITY PROOFS (numbers 563-579):** the 579 drawer
   pair ≡ the r75 561 pair on BOTH sides (the TWELVE-round chain
   579≡561≡543≡526≡509≡492≡474≡456≡438≡418≡402≡366); the 563 login
   pair ≡ the r75 545 pair on BOTH sides (`bd718ed0…` /
   `69aa4241…`) — past BOTH deploys; all seven route pairs stable vs
   the r75 set on both sides.

6. **THE MOBILE-MENU FUNCTIONAL CYCLE: GREEN** — the standing user
   emphasis: toggle → the drawer (Dashboard / Training LMS / Assets /
   Staff Requests) → the Training LMS link CLICKED:/training → the
   URL lands on /training → the drawer auto-closes (open: false). No
   Tailwind-v4 regression.

7. **THE CLOSING GATES** — lint 0/0 · tsc clean · 941/941 unit ·
   build OK · E2E 396/396 (6.3m, zero flakes, sequential; the
   chromium-cache trap retired en route: r1200 held vs r1248 needed —
   `bunx playwright install chromium`, environment-only).

8. **ZERO DEFECTS FOUND — ZERO SOURCE CHANGES** (the third
   consecutive audit-only round). The round's diff: the three
   instruments (r76-deploy-watch + r76-login-probe +
   r76-screenshots), the evidence (18 screenshots → 765 tracked),
   and the docs layer.

## The instrument traps retired (all infrastructure, classified before touching source)

- **The stale REF session cookie after a deploy** — the first ladder
  read 0/5 standing + 0/12 sweep because the 37th deploy invalidated
  the `ref` session's auth and every authed route read the login
  page's h1. Re-auth + re-run → green. The documented "verify the
  authed surface on a warm session" lesson re-proven.
- **The fresh-session viewport default** — after a daemon reset, the
  re-authed `ref` session defaulted to 1280px while the ladder's
  loc0 read 1440px; every responsive recharts container read narrow
  (the surveyanalytics "diff" was pure viewport). Always
  `set viewport 1440 900` before reads.
- **The agent-browser daemon overload** — `spawnSync /bin/sh EAGAIN`
  under many live sessions; `close --all` + pkill + restart restores
  it. Side effect: `close --all` wipes the warm `ref` session auth —
  re-auth after every reset.
- **The chromium-cache trap** — r1200 held vs r1248 needed;
  `bunx playwright install chromium`.
- **The exported-`DATABASE_URL` trap** — ACTIVE again (the sandbox
  exports its own path); `env -u DATABASE_URL` per invocation; the
  wrong-path DB swept.
- **The verify-r45 signup-flow probe user** — `loading-probe@example.com`
  swept per the r61 protocol; DB pristine at close.

## Next

The standing watches: the deploy watch (armed at the post-38th
finals — login JS `index-CXV35yah` + CSS `index-B9rzNd1e`; the app
side `C-IrDy5f`/`BGNH4KkS`), the NEW deploy-cadence watch (two
non-visual rebuilds in ~10 minutes — expect more of the same class),
the Next.js patch watch (16.4.2 latest stable; 16.5 at canary), the
Turnstile rollout, and the upstream dependency watch (braces 3.0.4+;
the Prisma deepmerge-ts path). The candor-ordered frontier: the
real-Chrome install smoke on a deployed HTTPS origin
(blocked-in-scope here); the offline-page styling polish (still
deliberately deferred — no REF counterpart).
