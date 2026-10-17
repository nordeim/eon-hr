# Remediation plan — session 51 (parity round 50)

> The round-49 frontier said every app route now has a deep-measured
> interior; this round's census re-verified the frontier's live edges —
> the login redeploy watch (an 18TH deploy shipped), the mobile
> navigation menu (the user-called-out surface, paired live at 390×844),
> and the byte-parity backlog (assessed: all render-equal documented
> allowances). One REAL functional gap surfaced: the route-casing
> alias. All contracts live-measured this window (REF @1440×900 +
> @390×844 vs the seeded LOC :3200 standalone).

## The round's context

- Pulled to `f228a08` (the owner's session_102 journal — docs-only on
  the landed round-49 `c1c44e7`). Baseline gates ALL GREEN:
  lint 0/0 · tsc ✓ · 789/789 unit · build ✓ · 252/252 E2E.
- **The 18TH login deploy** (login JS `DJGK9Qoy` → `ChN8O3_i`, CSS
  `CpjiugAb` quiet) — verify-r45 re-audited standalone: **13/13 MATCH**.
- App side quiet through the deploy: standing audits **5/5** + route
  sweep **12/12** (the `r50-standing-run` orchestrator; its embedded
  verify-r45 ETIMEDOUT under load — the documented cap-trap, covered by
  the standalone run above).
- scandihaven (the tech-stack model) unchanged since the last review
  (latest `d4789c3`, Oct 4) — no new patterns to adopt.
- The `.env` / db / test-config audit: `DATABASE_URL="file:../db/
  custom.db"` ✓, `db/` at the repo root ✓, vitest + playwright configs
  intact (the green suites prove them).

## The findings (all live-measured)

### A. The /Dashboard route-casing gap (functional parity — REAL)

REF's platform serves routes **case-insensitively**: both `/Dashboard`
(its canonical form — the one its own redirects target) and `/dashboard`
(the form its internal links use) render the dashboard, and the
lowercase URL stays lowercase (no redirect). The clone (Next.js on a
case-sensitive FS) serves only `/dashboard` — **`/Dashboard` 404s**.
Anyone following a REF-emitted URL or bookmark (REF's
`/organizationsetup` and `/dynamicdashboard` redirects land on
`/Dashboard`) hits the clone's 404.

**The fix**: a `next.config.ts` rewrite `{ source: "/Dashboard",
destination: "/dashboard" }` — the URL bar keeps `/Dashboard` (exactly
like REF), the content/metadata/auth-guard ride the real dashboard
route. Chosen over the R31-B1 re-export-directory form because a
capital `Dashboard/` directory beside `dashboard/` collides on
case-insensitive checkouts (macOS) — the rewrite carries none of that
risk. Scope: the canonical `/Dashboard` only (REF's other internal
links are all lowercase; wildcard-case aliasing is not a real surface).

### B. The mobile navigation census (verified-matching — pinned)

The user-called-out surface, paired live at 390×844 on /dashboard:

- **The kicker**: EXACT — `md:hidden sticky top-0 z-20 bg-white
  dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800
  px-4 py-3 safe-area-top`, h=53, y=89, "Dashboard", and the scroll-away
  truth (sticky inert inside the scroller stack; scrolls 1:1 —
  scrollY 178 both sides).
- **The header**: EXACT (the 73px sticky bar, class-identical).
- **The bottom bar + tabs**: render-equal — the bar identical except
  the clone's `pb-[env(safe-area-inset-bottom)]` safe-area superset
  member (0px in unnotched viewports); the five tabs' classes are
  member-order-only variances (cn() merge order); the active tab
  computes identically (color rgb(37,99,235), bg rgb(239,246,255)).
- **The drawer**: render-equal — w=288, borderR 1px #e5e5e5, bg
  #fafafa, the 500ms/300ms slide timings (REF authors them as
  `data-[state=*]:duration-*`, the clone as explicit
  `[animation-duration:*]` utilities — the session-22 motion pair);
  the footer census: REF 13 buttons = the clone's 12 + REF's
  sheet-Close button which REF itself hides (`[&>button]:hidden` — the
  E2E's no-X pin); REF's 2 unlabeled buttons = the clone's
  aria-label supersets (Notifications / Switch to dark mode);
  the overlay computes rgba(0,0,0,0.8) both sides.
- **Instrument artifacts this round** (documented for the next census):
  the agent-browser eval flakes on long one-shot reads (split the
  panel/footer reads); a `div.md\:hidden` + sticky filter on a 404 page
  finds nothing — always confirm the page actually rendered (the
  casing gap masqueraded as a missing kicker).

### C. The byte-parity backlog (assessed — documented allowances)

- **CardTitle text-base/leading-none**: the clone's DIV base
  (`font-semibold tracking-tight text-base`) matches REF's default
  form; REF's per-page leading-none forms drop the redundant text-base
  (a DIV inherits 16px — text-base is inert there). Both render 16px;
  the per-page `leading-none` passes already mirror REF's per-page
  forms. No action.
- **badge-span leading-5**: text-sm's default line-height IS leading-5
  (the r49 pair) — render-identical. No action.
- **#fafafa/#fff CTA text**: REF is per-button inconsistent; the
  computed pair is equal (r49). No action.
- **Chart line-count / recharts mount order**: layout-fixed,
  render-neutral (r49). No action.

### D. The doc-count drift (documentation alignment)

- `eon-hr_SKILL.md` State line: "718 unit + 217 E2E" → 789/252 (the
  version line is current at 3.33.0 — the State line was missed).
- `README.md` `test:e2e` comment: "217 specs" → 252.

## The fixes (file map)

1. `next.config.ts` — the `/Dashboard` rewrite (A) with the intent
   comment.
2. `tests/unit/recipes.test.ts` — the round-51 pin block: the rewrite
   contract + the casing-scope comment (RED first).
3. `tests/e2e/` — the round's spec: `/Dashboard` renders the dashboard
   content + the plain title; `/dashboard` keeps working (the
   regression guard); the rewrite is not a redirect (URL stays).
4. `eon-hr_SKILL.md` — the State-line fix + the session-51 layer +
   version 3.34.0.
5. `README.md` — the E2E count fix.
6. `AGENTS.md` — the session-51 layer + the Commands counts stay
   (789/252 unchanged — the round adds pins; the counts update to the
   new totals).
7. `docs/session_103.md` — the round journal (the owner's session_102
   took the 102 slot).
8. Screenshots → `docs/screenshots/` (the dev-server captures).
9. `worklog.md` + this plan's completion record.

## The verification gates

lint 0/0 · tsc ✓ · unit (789 + the round-51 pins) · build ✓ · E2E
(252 + the round's spec) · verify-r45 13/13 on the 18th deploy (done)
· standing audits 5/5 + route sweep 12/12 (done) · the live /Dashboard
pair (REF vs LOC after the rewrite) · DB pristine (the loading-probe
user swept — it re-fired this window) · `.env.example` verified.
