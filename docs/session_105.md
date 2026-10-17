# Session 105 (2026-10-18) — parity round 51: the nav-registry drift check + the drawer-group census

> The round-50 frontier said the parity surface is fully verified; this
> round's census re-armed the live edges and extended them with two NEW
> measurements: the REF route-registry drift check (the clone's registry
> was fixed at session-32 — 19 login deploys ago) and the mobile
> drawer's EXPANDED-GROUP interior (the user-called-out surface's last
> unpaired zone). No real gaps surfaced; both census records are pinned.

## What the round delivered

- **The 19TH login deploy** (JS `ChN8O3_i` → `CimHfPLG`, CSS
  `CpjiugAb` quiet, app fingerprints `C-IrDy5f`/`BGNH4KkS` unchanged)
  — verify-r45 re-audited standalone: **13/13 MATCH**. App side quiet
  through the deploy: standing audits **5/5** + route sweep **12/12** +
  **verify-r49 13/13** (the newest deep-interior instrument re-run as
  the confirmation ladder through the new deploy).
- **THE NAV-REGISTRY DRIFT CHECK** (new census): all 8 REF groups
  expanded live, the complete nav tree read, diffed against the clone's
  `NAV_ITEMS` — **44/44 links match** (same hrefs, labels, order; the
  5 bottom tabs + the dashboard's in-page links — My Portal / Submit
  Request / Claim Expense / Request Leave — all present in the clone's
  61-route registry). No new REF modules through the login churn.
  **Pinned**: R52-A1 (the ordered 44-href registry tripwire) + R52-A2
  (the BOTTOM_NAV 5-tab set) — any future drift on EITHER side surfaces
  as an immediate RED pin.
- **The mobile drawer's EXPANDED-GROUP interior** (the last unpaired
  mobile-nav zone): the Employees + Analytics groups paired live at
  390×844 — the group trigger heads member-set MATCH; the sub-item
  family **computed-truth MATCH** (gap `12px 12px`, display flex,
  px-3/py-2 padding, 32px rows, 16px icons, rgb(71,85,105) labels).
  The one cls delta — REF's `gap-2 gap-3` + duplicated `flex` (runtime
  concatenation) vs the clone's merged `gap-3` — resolves to identical
  computed styles (the documented cn()-merge allowance family).
  **Pinned**: R52-B (the E2E computed-contract on the expanded group's
  sub-items — gap/display/row-height — so a Tailwind v4 engine change
  or a nav-config refactor cannot silently drift the drawer interior).
- **The doc-count refresh** (the census's codebase validation): CLAUDE
  (51→54 API endpoints, 60→61 routes, the stale "47 routes render"
  claim → the 61-route registry, 793/256 + the session-52 tails),
  README (45→47 models ×3, 49→54 handlers, 46→61 (app) routes,
  255→256), PAD (45→47 models ×3 + the 748-line schema count).
  Historical session layers untouched (the r51 precedent).
- **The Tailwind v4 sweeps** (the standing call-out): bare `border`
  safe (the base layer pins `border-border` on all elements);
  template-string classNames all interpolate pre-authored static
  constants; the `!important` uses are the documented blocks. No v4
  findings.

## Gates

lint 0/0 · tsc ✓ · **793/793 unit** (+2 — R52-A1/A2) · build ✓ ·
**256/256 E2E** (+1 — R52-B) · verify-r45 13/13 (the 19th deploy) ·
standing audits 5/5 · route sweep 12/12 · verify-r49 13/13 · the
nav-registry + drawer-group census records pinned · DB pristine (the
loading-probe user swept) · `.env.example` verified.

## The round's tooling lessons

- **The long-eval flake re-hit** (a ~1.2k-char one-shot failed under
  rapid sequencing on BOTH apps while the identical eval ran clean
  standalone): keep one-shots small, split composite reads, retry once
  on command failure. The r52 evalOn pattern: parse agent-browser's
  pretty-printed object output directly (objects are NOT quote-wrapped;
  scalar strings ARE — unwrap), and never let a scalar's parse failure
  masquerade as an eval failure.
- **The computed-truth census method** (the round's transferable
  lesson, SKILL §62): when the platforms differ in class-list
  CONSTRUCTION (concatenation vs merge), the class bytes can never
  match — pin the COMPUTED cascade result (gap/display/padding) +
  geometry instead. This settles false-diff families the byte
  comparison cannot.
- **The workspace-reap pattern**: the sandbox reaps detached processes
  between tool calls — every orchestrator call boots its own :3200
  server (kill-by-port first, per the surviving-server lesson); the
  agent-browser daemon survives because it self-daemonizes.

## Frontier after this round

The parity surface holds through the 19th login deploy (the registry
verified drift-free, the mobile nav fully censused — at-rest chrome +
panel/footer + expanded-group interiors). The watch items: the login
build stays under ACTIVE development (19 deploys — the watch stays
armed, now with the registry tripwire pin between censuses); the
with-data superset surfaces (payrollmodule's existing records,
staffrequests' table, the payrollreports tax/history/custom panels)
stay REF-unmeasurable at the shared demo's zero state; the byte-parity
backlog remains documented-allowance territory (no rendered delta).
