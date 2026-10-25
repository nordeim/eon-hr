# Session 216 — Session 94 / Parity Round 93: the with-data applicant-pipeline round

**Session file numbering:** this file continues the owner-facing chain (session_214.md = the session-93 narrative, session_215.md = the recovered second execution's transcript). The remediation plan for this round lives at `docs/remediation-plan-session94.md`.

## The round in one paragraph

The r93 seed (the REF's three-job tenant) made every **with-data** surface readable for the first time — this round walked the applicant pipeline cross-side with identical tenants live on both sides: the public board, the org view, the apply flow's URL contract, the applicant dialog's Job Posting select, the recruitment filters with data. The opening read classified the **63rd login deploy NON-VISUAL** (the login assets moved — JS `index-DlxedS3b` → `index-BBWvc7Mt`, CSS `index-CrV5b32v` → `index-ByKl99Mk` — but the fresh login pair rendered **BYTE-IDENTICAL** to the standing `69aa4241…` baseline; the app side quiet at the recorded `C-IrDy5f`/`BGNH4KkS`; the full standing ladder GREEN). The sweep found **two clone-authored divergences, both TDD-fixed** (RED 3/3 unit + 4/4 E2E as designed → GREEN), **one probe member reclassified** (the REF-inert external application page), and confirmed the whole remaining pipeline at parity against the live REF.

## The findings

| # | Surface | The verdict |
|---|---|---|
| R94-A | careers org view — the heading block | **TDD-FIXED** — the REF wraps the org h2 in a `flex items-center gap-4` wrapper and carries the `text-slate-600` "Explore career opportunities" subtitle (live-captured at REF's `/Careers?org=demo`); the clone rendered the bare h2. The wrapper + subtitle now match. |
| R94-B | the capitalized route pushes | **TDD-FIXED** — the REF's careers chip pushes `/Careers?org={slug}`, the back button `/Careers`, and the card's "View Details & Apply" `/ExternalJobApplication?org={slug}&job={slug}` — all CAPITALIZED in the address bar (the platform serves both casings; the bar carries the capital form). The clone now pushes the same forms, with two `next.config.ts` rewrites serving the lowercase filesystem routes URL-unchanged (the R51-A `/Dashboard` precedent, extended). |
| R94-C | the verify-r49 `zero-externaljobapplication` member | **RECLASSIFIED** — the REF's `/externaljobapplication` makes **NO JobPosting fetch at all** (resource timing: 14 entries, zero job queries) — the "No Open Positions" zero state is a static render. The page joins the REF-inert class (payrollengine/payrollmodule); the clone's working superset renders the seeded active job by design. The probe's member keeps the container/heading pins, drops the data-dependent keys. |
| — | Add Applicant — the Job Posting select | **REF-BROKEN (documented)** — the REF's select renders ZERO options with its own 3-job tenant (clean session, no rate-limit interference; the console carries the `Error creating audit log: 403` signature — the same class as the REF's staffrequests New Request dialog). The clone lists all three jobs — the working superset. |
| — | recruitment with-data | **AT PARITY** — stats `1/0/0/—`, the tabs, the "0 candidates" table, the All Jobs filter options (`All Jobs, HR Manager, HR Director, System Admin`) — identical live, line for line. |
| — | the careers board + Job Postings cards | **AT PARITY** — the R93-H contracts re-verified live with data on both sides (the REF's chip grid is the platform-wide ORGANIZATION list — the documented data-volume class; the chip→org-view→back flow, the count/zero messages, and the card recipe all match). |
| — | the standing watches | **HELD** — the recharts grid class (REF 15 verticals + 7 horizontals vs the clone's 19 + 7 — the classified 2.x-vs-3.x residual, unchanged) · the dark-band theming (the experiment system active, same `tagline` experiment, visitor `2a4fcbf8…` — read via the `/api/frontend-config.js` endpoint; the `window.__APP_CONFIG__` global is gone from the page in the current generation) · the REF-inert spot-census (organogram display-only, companywall's composer trio standing, dynamicdashboard's Customize at x=1269 y=64 w=140 h=36 — cross-side identical). |

## The verification

- **Gates: lint 0/0 · tsc ✓ · 984/984 unit** (981 + 3 R94 pins; the R40-F1 + R51-A2 legacy pins amended to the new push/rewrite contracts) · **build ✓ 116/116** · **E2E 542/542** (the 538 standing + the 4 new session94 members; the session40/41 URL regexes amended to the capitalized forms).
- **The live post-fix re-read**: the org view + the capitalized flows re-verified on the remediated standalone; the mobile-menu cycle + the R90-B bottom sheet re-checked (below).
- **DB pristine** at close (the loading-probe user — the verify-r49 probe's documented artifact — swept).

## The round's traps

**The exported-DATABASE_URL guard re-fired on a fresh sandbox** — the environment exports `DATABASE_URL=file:/home/z/my-project/db/custom.db` (an absolute path into the PARENT of the repo), which silently overrides `.env` for the Prisma CLI and any process that reads the environment: the first `db:push`/`db:seed` wrote a seeded database to the parent directory while the repo's `db/custom.db` stayed empty, and the standalone server (booted with the canonical absolute URL) read the empty file — the login route failed with P2021 (the `User` table missing). The recovery: purge the poisoned artifact, re-push + re-seed with `env -u DATABASE_URL`, and boot the :3200 standalone via the guard form. Every DB-touching command in this environment needs the guard.

**The experiment-probe URL form** — the `window.__APP_CONFIG__` global no longer exists on the page in the current REF generation; the standing experiment-assignment probe now reads `/api/frontend-config.js` (the same payload, fetched directly).

**The headless hover dead-end** — Tailwind v4's `hover:` variants sit behind `@media (hover: hover)`, which headless Chromium does not match: no hover state is measurable in this environment (neither the synthetic `mouseenter` nor the native CDP hover flips the computed style). The REF's own careers-apply hover (`hover:bg-primary/90`) is a background-COLOR under a background-IMAGE (the gradient) — visually inert regardless. Documented, not chased.

**The address-bar contract** — a router push's casing is a user-visible parity member (the REF's SPA pushes `/Careers`, `/ExternalJobApplication`); Next.js on a case-sensitive filesystem needs the rewrite pair to serve them URL-unchanged (the R51-A pattern — not a redirect, which would flip the bar back).

## The r95 queue

1. The REF-inert classification list is now closed (no unscanned routes remain) — the next frontier is the **with-data DIALOG interiors** the seeded tenant enables (the recruitmentkanban pipeline with applicants, the job detail surfaces).
2. The standing watches: the 63rd-or-newer login ladder (re-armed), the recharts grid class (standing), the dark-band theming (standing).
3. The careers org-view chips remain job-company-driven on the clone (the single-tenant equivalent of the REF's org-entity grid) — revisit if the REF's platform board grows tenant-scoping.
