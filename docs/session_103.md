# Session 103 (2026-10-17) — parity round 50: the route-casing alias + the mobile-nav census

> The round-49 frontier's live edges re-verified: the login redeploy
> watch (an 18TH deploy), the mobile navigation menu (the called-out
> surface, paired live at 390×844), and the byte-parity backlog
> (assessed: documented render-equal allowances). One REAL functional
> gap surfaced — the route-casing alias. All contracts live-measured
> this window (REF @1440×900 + @390×844 vs the seeded LOC :3200).

## What the round delivered

- **The 18TH login deploy** (JS `DJGK9Qoy` → `ChN8O3_i`, CSS
  `CpjiugAb` quiet) — verify-r45 re-audited standalone: **13/13 MATCH**;
  the app side quiet through it (standing audits 5/5 + route sweep
  12/12). The standing-run orchestrator's embedded verify-r45 ETIMEDOUT
  under load — the documented cap-trap; the standalone run is the
  authoritative one.
- **THE FINDING — the /Dashboard route-casing gap**: REF's platform
  serves routes case-insensitively (its canonical capital `/Dashboard`
  — the target of its own /organizationsetup + /dynamicdashboard
  redirects — AND its lowercase internal-link form both render; the
  lowercase URL stays lowercase). The clone 404'd on the capital form.
  **The fix**: the `next.config.ts` rewrite `/Dashboard → /dashboard` —
  the URL bar keeps `/Dashboard` exactly like REF (a rewrite, not a
  redirect); the content/metadata/auth-guard ride the real lowercase
  route. Chosen over an R31-B1-style re-export directory because
  `Dashboard/` beside `dashboard/` collides on case-insensitive
  checkouts (macOS). Scope: the canonical form only. Verified three
  ways: the E2E spec (the URL-unchanged serve + the plain title, the
  lowercase regression guard, the auth-guard ride-through — a rewrite
  maps into the (app) route stack), the live paired read (path/h1/
  title/widgets MATCH on both sides), and the desktop+mobile
  screenshot pairs (234/235).
- **The mobile navigation census** (paired live at 390×844):
  - The kicker: EXACT — `md:hidden sticky top-0 z-20 bg-white
    dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800
    px-4 py-3 safe-area-top`, h=53, y=89, "Dashboard", and the
    scroll-away truth (the sticky never engages inside the scroller
    stack — scrollY 178 both sides, the bar scrolls 1:1).
  - The header: EXACT (the 73px sticky bar, class-identical).
  - The bottom bar + tabs: render-equal — the bar identical except the
    clone's `pb-[env(safe-area-inset-bottom)]` safe-area superset
    member (0px unnotched); the five tabs' classes member-order-only
    (cn() merge order); the active tab computes identically (text
    rgb(37,99,235) on bg rgb(239,246,255)).
  - The drawer: render-equal — w=288, borderR 1px #e5e5e5, bg #fafafa,
    the 500ms/300ms slide timings (REF's `data-[state=*]:duration-*`
    vs the clone's explicit `[animation-duration:*]` utilities — the
    session-22 motion pair); the footer census: REF 13 buttons = the
    clone's 12 + REF's own sheet-Close (hidden via `[&>button]:hidden`);
    REF's 2 unlabeled = the clone's aria-label supersets; the overlay
    computes rgba(0,0,0,0.8) both sides.
- **The byte-parity backlog assessed** (no action — all documented
  render-equal allowances): the CardTitle text-base/leading-none
  per-page pair, the badge-span leading-5 no-op, the #fafafa/#fff
  CTA-text pair (REF per-button inconsistent), the chart
  line-count/recharts-mount-order pairs.
- **The doc-count refresh**: CLAUDE.md (line 7 + the pyramid table —
  both had drifted), README (the test commands + the E2E row), AGENTS
  (the Commands table), the SKILL State line — all aligned to
  791/255.

## Gates

lint 0/0 · tsc ✓ · **791/791 unit** (+2 — R51-A1/A2) · build ✓ ·
**255/255 E2E** (+3 — the session-51 casing spec) · verify-r45 13/13
(the 18th deploy) · standing audits 5/5 · route sweep 12/12 · the
/Dashboard live pair MATCH · DB pristine (the loading-probe user swept
— `scripts/sweep-loading-probe.ts` persisted for the per-window trap) ·
`.env.example` verified.

## The round's tooling lessons

- **The agent-browser long-eval flake**: the zone-probe's combined
  drawer panel+footer eval failed on BOTH sides with a bare "Command
  failed"; splitting it into two smaller evals worked first try. Keep
  the one-shot reads small.
- **The 404-masquerade**: a `div.md\:hidden`-sticky interior filter
  finds nothing on a 404 page — the casing gap masqueraded as a
  missing LOC kicker for one probe iteration. Always verify the page
  actually rendered (the h1/title read) before reading interiors.
- **The surviving server**: the :3200 standalone server sometimes
  SURVIVES its orchestrator's process exit — always kill-by-port
  before rebooting on a new build (the prior round's lesson, re-hit).
- **Next copies `.env` into the standalone output** (`.next/standalone/
  .env`) — the boot pattern `env -u DATABASE_URL AUTH_SECRET=…` works
  because the server loads its own directory's .env; an exported shell
  DATABASE_URL would override it (hence the `env -u`).

## Frontier after this round

The parity surface is fully verified through the 18th login deploy
(every route deep-measured, the mobile chrome paired-live, the casing
gap closed). The watch items: the login build stays under ACTIVE
development (18 deploys — the watch stays armed); the with-data
superset surfaces (payrollmodule's existing records, staffrequests'
table, the payrollreports tax/history/custom panels) stay
REF-unmeasurable at the shared demo's zero state; the byte-parity
backlog remains documented-allowance territory (no rendered delta).
