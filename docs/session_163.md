I'll execute Session 74 / Parity Round 73 following the established house rhythm. The workspace was reset, so let me clone the repo first:

The repo is cloned @ f806e1b (the session-73 docs head, main only). Let me set up the task list, then read the four-doc state:

The docs review (via the parallel agents) internalized the state: Session 73 / round 72 complete, the frontier = the r74 deploy watch + the candor-ordered candidates (the PWA installability pass, the offline-page polish deferral, whatever the next deploy carries). Now the environment:

The exported-DATABASE_URL trap is ACTIVE (the sandbox exports its own `DATABASE_URL=file:/home/z/my-project/db/custom.db` which overrides the repo's .env). The seed created the DB at the wrong path — let me sweep it and re-run with `env -u DATABASE_URL`:

DB seeded at the repo-root `db/custom.db`. Now the baseline gates on the unmodified HEAD:

Lint 0/0, tsc clean, 937/937 unit — matching the documented state. Now the build:

Build OK. Now the audit sweep — the r73 fix family re-read, the secret/sink census, bun audit:

The audit reads clean: the r73 trio + the manifest hoist in place; zero secrets; zero raw DOM-XSS sinks; bun audit reads the same 2 known dev-chain advisories. Let me check the upstream state — and the deepmerge-ts fix HAS shipped upstream in @prisma/config 7.10.1, but prisma 6.19.3 pins it exactly and the 6.x line ends there. No action; the watch re-records. Now the deploy watch:

**THE 36TH LOGIN DEPLOY DETECTED** — login JS `BANnI-PC`→`index-CiBFwtqW` AND CSS `COgwiEvt`→`index-B9rzNd1e` (the second CSS movement in two rounds). The app side reads CHANGED too — but that first read raced the login navigation. Let me verify on a warm session before classifying:

The warm session reads the authed app QUIET (`C-IrDy5f`/`BGNH4KkS`) — the first watch read was a timeout artifact. Now the login probe:

**The fresh login pair is BYTE-IDENTICAL to the r73 510 baseline** (`69aa4241…` both). Now the rest of the ladder — the ref session re-auth, then the standing orchestrator:

**Standing 5/5 + sweep 12/12 — all MATCH.** Now verify-r49 and the login reaudit:

**verify-r49 13/13 + verify-r45 13/13 — THE 36TH DEPLOY IS CONFIRMED NON-VISUAL.** Now the standing checks: the TW-v4 scan (15 `!important`, oklch comments-only — clean) and the DB pristine sweep (the probe user swept; users = the demo account only).

Now the candor-ordered candidate — the installability pass. The r73 lesson says: measure the documented-but-unmeasured claim FIRST. Chrome's own checker is the strongest instrument (CDP `Page.getInstallabilityErrors`):

The chromium-cache trap first — the environment holds 1200-series browsers while 1.63 needs 1248. `bunx playwright install chromium` restores it. Now the probe:

**Chrome reports ZERO installability errors on BOTH surfaces** — the logged-out login AND the authed dashboard. The r73 claim measures TRUE. Now the remediation plan, validated against the codebase (all six SHELL assets exist; the r72 pins located):

Plan saved. Now TDD — the RED specs first: the installability E2E pair (expected green on HEAD — the standing-contract pin) and the unit tripwire quadruple (expected RED — the mechanism absent):

The unit RED state is exact: R74-C0..C3 failing (the GEN mechanism absent in sw.js) while the 10 standing pins stay green. The installability spec reads GREEN on HEAD (3 passed) — the measured verdict locked. Now the GREEN step — the sw.js generation amendment:

The sw.js amendment lands: GEN r74 + the generation-stamped SHELL_CACHE + the stable CHUNKS_CACHE + the CHUNKS_CAP oldest-first trim + the pair-keeping activate sweep. The spec-family amendments next (the r72 unit pin + the r72 E2E served contract, both to the generation-stamped name):

14/14 unit green. Rebuild + the full PWA family on the patched build:

**11 passed** — the r72 offline family (the fallback, the control, the un-authed fetch) + the r73 linkage family + the r74 installability pins, all riding the amended worker. Curl parity on the served /sw.js: the generation mechanism present, the r73 header trio still riding it. Full unit suite: **941/941** (+4). Lint 0/0, tsc clean.

Now the screenshot set — the r74 script (527-543, the byte-stability proofs + the inline mobile-menu cycle):

**The round's proof is complete** — the TEN-round byte chain extended (543≡526 both sides), the login pair stable (527≡510), all seven route pairs stable, and the mobile-menu cycle green (toggle → drawer → Training LMS navigates → auto-close). Now the final proof: the full sequential E2E suite:

**FULL E2E: 396/396 passed** (394 pre-existing + 2 new pins, zero flakes, 6.5m sequential). The closing checks: the DB pristine sweep (no probe user present; users = the demo account only) + the .env.example contract (the process.env sweep reads only DATABASE_URL + AUTH_SECRET).

Now the documentation layer — AGENTS.md (the session-74 layer + the Commands counts 941/396), CLAUDE.md (the 1337-spec pyramid + the test table), README.md (the counts + the spec tail), eon-hr_SKILL.md (3.57.0 + §84 + the State line + the carry-forward lessons), the plan's completion record, docs/session_162.md (the narrative), and the worklog entry:

Documentation complete. Now the commit with the house-style message:

Commit landed. Now the SSH push per the runbook — the key materialized outside the repo, the paramiko shim deployed, the dry-run first, then the real push with `--remote git@github.com:nordeim/eon-hr.git` (the r71 correction):

**Push successful — remote verified.** Now shred the operator key per the runbook and do the final remote verification:

All done — **Session 74 / Parity Round 73 is complete and pushed to main** (remote verified via both the SSH wrapper and an independent HTTPS read; operator key shredded).

## What this session delivered

**Onboarding & audit** — Fresh clone, all core docs + session histories internalized (the parallel doc agents), baseline gates confirmed (lint 0/0 · tsc ✓ · 937/937 unit · build ✓). The **36TH REF login deploy detected** (both login fingerprints moved again) and audited **NON-VISUAL** via the full confirmation ladder (the login pair byte-identical + standing 5/5 + sweep 12/12 + verify-r49/r45 13/13); the watch re-armed at the post-36th finals reads both sides quiet. The upstream dependency watch amended (the deepmerge-ts fix shipped upstream but is unreachable under the repo's exact-pinned stable-6 CLI).

**TDD fixes** —
1. **The PWA installability end-to-end pass**: Chrome's OWN verdict (CDP `Page.getInstallabilityErrors`) measured ZERO errors on both surfaces BEFORE the pin — then locked executable (the standing-contract pin)
2. **The SW cache-lifecycle hardening (found-and-fixed)**: the un-bumped generation freezing the precached shell at r72 bytes for every existing client + the unbounded chunk accumulation — fixed by the generation mechanism with the shell-drift tripwire making the bump protocol a failing test, not a comment

**Proofs** — Mobile-menu cycle green (toggle → drawer → Training LMS → auto-close); **TEN-round byte chain extended** (543≡526 both sides + 527≡510); TW-v4 scan clean; DB pristine; **E2E 396/396, zero flakes**; 18 new screenshots (527-543); all docs + worklog updated.

**Suggested next**: run the r75 deploy watch (armed at the post-36th finals); the remaining candor-ordered candidates are a real-Chrome install smoke on a deployed HTTPS origin (the headless verdict is the strongest in-scope proof) and the offline-page styling polish (still deferred — no REF counterpart).
