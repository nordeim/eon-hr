# Remediation plan — session 52 (parity round 51)

> The round-50 frontier said the parity surface is fully verified (every
> route deep-measured, the mobile chrome paired-live, the casing gap
> closed). This round's census re-armed the live edges and extended them:
> the login redeploy watch (a 19TH deploy shipped), the REF route-registry
> drift check (a NEW census — REF's login build is under active
> development; its nav tree could have grown new modules the clone lacks),
> and the mobile drawer's EXPANDED-GROUP interior (the one mobile-nav zone
> never paired-live — round 50 pinned the at-rest chrome + panel/footer).
> All contracts live-measured this window (REF @1440×900 + @390×844 vs
> the seeded LOC :3200 standalone).

## The round's context

- Fresh clone to `6a39a75` (the owner's session_104 journal — docs-only
  on the landed round-50 `01c4c2d`). Baseline gates ALL GREEN:
  lint 0/0 · tsc ✓ · 791/791 unit · build ✓ · 255/255 E2E (the one
  session-40 input-family flake re-verified green in isolation — the
  documented dialog-animation read under load, not suppressed).
- scandihaven (the tech-stack model) last reviewed at `d4789c3` (Oct 4);
  its patterns are stable — no new review this round beyond the
  spot-check the standing audits already encode.
- The `.env` / db / test-config audit: `DATABASE_URL="file:../db/
  custom.db"` ✓, `db/` at the repo root ✓, vitest + playwright configs
  intact (the green suites prove them).

## The findings (all live-measured)

### A. The 19TH login deploy (re-audited — no action)

Login JS `ChN8O3_i` → `CimHfPLG` (CSS `CpjiugAb` quiet, app fingerprints
`index-C-IrDy5f.js` / `index-BGNH4KkS.css` unchanged) — verify-r45
re-audited standalone: **13/13 MATCH** (reset/signup views both bands,
the sibling inputs, the hidden views' icons, the success/duplicate
Alerts, the loading interiors, the --foreground token, the at-rest
regression, the view swap). App side quiet through the deploy: standing
audits **5/5** + route sweep **12/12** + **verify-r49 13/13** (the
newest deep-interior instrument re-run as the confirmation ladder).

### B. The REF route-registry drift check (verified-matching — pinned)

The session-32 orphan-route hunt fixed the clone's registry at REF's
61-page census — 19 login deploys ago. REF's platform evolves; this
round re-read its COMPLETE nav tree (all 8 groups expanded live) and
compared it against the clone's `NAV_ITEMS`: **44/44 links match —
same hrefs, same labels, same order** (plus the 5 bottom tabs and the
dashboard's in-page links — My Portal / Submit Request / Claim Expense /
Request Leave — all present in the clone's 61-route registry). No new
REF modules; no drift. **The pin (R52-A)**: the ordered 44-href registry
tripwire — any future REF-side module addition OR clone-side nav
refactor surfaces as a RED pin immediately.

### C. The mobile drawer's expanded-group interior (verified-matching — pinned)

The user-called-out surface's last unpaired zone: the GROUP-EXPANDED
sub-item family inside the 390×844 drawer (round 50 pinned the at-rest
chrome, the panel geometry, and the footer census; the expanded groups'
interiors were E2E-covered but never paired-live). This round paired
the Employees + Analytics groups on both apps:

- **The group trigger heads**: member-set MATCH (sorted classes,
  geometry, font — h=32, fs 14px).
- **The sub-item family**: computed-truth MATCH — gap `12px 12px`,
  display flex, padding, h=32, x=36, 16px icons, rgb(71,85,105) —
  identical both sides.
- **The one cls delta (documented allowance)**: REF's sub-item class
  list carries `gap-2 gap-3` + a duplicated `flex` (its runtime
  CONCATENATES the shadcn base list with the per-item extensions), while
  the clone's `cn()`/tailwind-merge dedupes to `gap-3` + single `flex`.
  The computed styles are identical (the cascade resolves the duplicate
  pair the same way) — the same family as the round-50 tab member-order
  allowance. **The pin (R52-B)**: the E2E computed-contract — the
  expanded group's sub-items compute gap 12px, display flex, the 32px
  row height — so a v4 engine change or a nav-config refactor cannot
  silently drift the mobile drawer's interior.

### D. The doc-count drift (REAL fix — documentation alignment)

The census's codebase validation surfaced stale counts (the round-49/50
doc refreshes fixed the test counts but left the structural counts):

- `CLAUDE.md` line 7: "51 API endpoints" → **54** (the actual route.ts
  handler count; 44 resource dirs).
- `CLAUDE.md` architecture section: "60 authenticated routes" → **61**
  (the (app) route-dir count, each with page.tsx).
- `README.md` ×3: "45-model Prisma schema" → **47** (session-32 added
  ShiftSwap + ApprovalConfig to the 45).
- `README.md` file hierarchy: "49 route handlers" → **54**.
- `Project_Architecture_Document.md` ×3: "45 models" → **47** (the
  key-files table, the data-layer section, the ER intro).
- Historical session layers (PAD's [S32] journal rows, the [SYN] v1.0.0
  snapshot) stay untouched — the r51 precedent: historical layers keep
  their era's counts.

### E. The standing sweeps (clean — no action)

- **Tailwind v4**: bare `border` utilities safe (the base layer pins
  `border-border` on all elements); template-string classNames all
  interpolate pre-authored static constants (the safe pattern); the
  `!important` uses are the documented reduced-motion block + the pinned
  active-nav rules. No v4 findings.
- **The session-51 delta audit** (fresh eyes): the rewrite, the casing
  spec, the R51 pins — clean, conventions hold.

## The fixes (file map)

1. `tests/unit/recipes.test.ts` — the round-52 pin block: R52-A1 (the
   NAV_ITEMS ordered 44-href registry — the drift tripwire) + R52-A2
   (the BOTTOM_NAV 5-tab set) (RED first).
2. `tests/e2e/mobile-navigation.spec.ts` — R52-B: the expanded drawer
   group's sub-item computed family (gap/display/row-height) at 390×844.
3. `CLAUDE.md` — the API-endpoint + route counts (D).
4. `README.md` — the model counts ×3 + the handler count (D).
5. `Project_Architecture_Document.md` — the model counts ×3 (D).
6. `AGENTS.md` — the session-52 layer + the Commands counts (793/256).
7. `eon-hr_SKILL.md` — version 3.35.0 + the State line + §62 (the
   round's transferable lesson: the computed-truth census method — pin
   the computed cascade result, not the class-list bytes, when the
   platforms differ in class-list construction).
8. `docs/session_105.md` — the round journal (the owner's session_104
   took the 104 slot).
9. `docs/remediation-plan-session52.md` — this plan + its completion
   record.
10. Screenshots → `docs/screenshots/` (the drawer group-expanded
    pairs + the registry census evidence).
11. `worklog.md` — the round's record.

## The verification gates

lint 0/0 · tsc ✓ · unit (791 + the round-52 pins = 793) · build ✓ · E2E
(255 + the round's spec = 256) · verify-r45 13/13 on the 19th deploy
(done) · standing audits 5/5 + route sweep 12/12 (done) · verify-r49
13/13 (done) · the nav-registry + drawer-group census records (done,
pinned) · DB pristine (the loading-probe user swept) · `.env.example`
verified.
