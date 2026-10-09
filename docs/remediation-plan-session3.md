# Remediation Plan — Session 3 (audit + parity round 2)

Date: 2026-10-09 · Scope: production-readiness audit + live re-comparison against
`https://eon.base44.app/` · Status: **executed and verified** (this document was
written after the fixes landed — each item records the measured gap, the fix and
the verification evidence, so it doubles as the audit record).

Baseline at session start: session-2 tree (0822033), all gates green
(lint/tsc/44 unit/build/75 E2E), visual parity verified for dashboard, login and
the mobile drawer. Session 3 re-audited with fresh eyes and found the gaps below.

## A. Visual gaps (live-measured against the reference, DOM-verified)

### A1. Sidebar surface color — FIXED
- Reference: `rgb(250,250,250)` = `#FAFAFA` on BOTH the desktop aside and the
  mobile drawer sheet (measured live; pixel-sampled on screenshots).
- Clone: white (`hsl(0 0% 100%)`).
- Fix: `--color-sidebar: #fafafa` in `globals.css` — one token fixes the aside,
  the drawer sheet and every `bg-sidebar` usage.
- Pinned by `tests/unit/tokens.test.ts` ("pins the sidebar surface to reference
  #FAFAFA"). TDD: test written first (RED), token changed (GREEN).

### A2. Brand squircle — FIXED
- Session 2 measured the logo as 40×24 / `#3856E9→#444DE6` / `bg-gradient-to-b`
  — wrong element. Session 3's live re-measurement of the actual tile next to
  the EonHR heading:
  - 40×40, `border-radius: 12px`
  - `linear-gradient(to right bottom, rgb(37,99,235), rgb(79,70,229))` — i.e.
    `#2563EB → #4F46E5` in sRGB (note the 229: the reference renders its
    indigo-600 in oklch, which rounds to #4F46E5, NOT the v3 #4F46E1)
  - white briefcase 24×24, `stroke-width: 2`
  - box-shadow = v3 `shadow-lg` geometry
  - header row `gap: 12px`
- Clone had: 40×24, radius 6, `bg-gradient-to-b` (oklab interpolation — trap 3
  violation), 14px icon, `shadow-sm`, gap 10px.
- Fix: `sidebar-nav.tsx` SidebarHeader — `h-10 w-10 rounded-xl
  bg-[linear-gradient(to_right_bottom,#2563EB,#4F46E5)] shadow-lg` +
  `h-6 w-6 strokeWidth={2}`. Verified: computed style now byte-identical
  (`linear-gradient(to right bottom, rgb(37, 99, 235), rgb(79, 70, 229))`).

### A3. Dashboard header geometry — FIXED
- Reference structure (live): content wrapper `space-y-8` with a
  `md:hidden` mobile page-title kicker as FIRST child. Desktop lands the
  welcome row at y=64 (p-8 32 + v3 space-y sibling margin 32 — see trap 6),
  the cards grid at y=160. The Customize button: h-9 (36px), `px-4 py-2`,
  text-sm, border `#E5E5E5`.
- Clone had: `gap-6`, welcome row at y=32, no kicker, Customize at h-8/px-3/
  text-xs/slate border.
- Fixes in `dashboard/page.tsx` + `customize-button.tsx`:
  - kicker: `md:hidden` white bar (`py-3`, border-b slate-200) with an 18px
    bold "Dashboard" h1 — gives the mobile title bar the clone lacked entirely
  - welcome row: `hidden md:flex` (the reference hides it at mobile!),
    `mt-8` restoring the v3 hidden-sibling offset (trap 6)
  - wrapper: `space-y-8` (32px rhythm)
  - Customize: default button size + `border-[#e5e5e5]`
- Verified: h1 y=64, grid y=160 (exact); mobile kicker y=89 h=53 (exact),
  grid y=174 (exact math: 73 header + 16 p-4 + 53 kicker + 32 margin).

### A4. Reference's "sticky" kicker is not actually sticky — REPLICATED
- The reference marks its mobile kicker `sticky top-0 z-20`, but renders the
  whole stack inside a `overflow-hidden` wrapper, which breaks sticky — the
  bar scrolls away with the content. The clone renders it as a static bar for
  identical effective behavior (documented in code + trap log).

### A5. Module page spacing rhythm — FIXED (46 pages)
- Reference module pages: `max-w-7xl mx-auto space-y-8` (32px between
  sections; employees page header row additionally `mb-8`). Profile page:
  `max-w-5xl mx-auto space-y-8`.
- Clone had: `flex-col gap-6` (24px) — every section boundary 8px tighter.
- Fix: `gap-6` → `gap-8` on the page wrappers of all 46 module pages (uniform
  string replace; flex-gap achieves the reference's 32px rhythm without
  space-y's margin semantics, avoiding trap-4 interactions).
- Verified: employees page children now at y=32 / y=128 / y=222 — the
  reference's exact geometry (was 32/120/206).

### A6. Card border color — FIXED
- Reference cards: `1px solid rgb(229,229,229)` = `#E5E5E5` (neutral-200);
  measured on the dashboard grid cards AND the Customize button. The reference
  reserves slate-200 (#E2E8F0) for shell chrome (sidebar/header borders).
- Clone used the theme border token `#E1E7EF` (slate-tinted).
- Fix: `Card` component pins `border-[#e5e5e5]` — one component fixes every
  card on every page. (Delta is subtle: 4/4/6 units per channel.)

### A7. Dashboard grid gap + breakpoint — FIXED
- Reference grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` → cards
  357px wide at 1440.
- Clone had `gap-5` (360px cards) and `xl:grid-cols-3` (3-column layout starts
  at 1280 instead of 1024).
- Fix: `gap-6` + `lg:grid-cols-3` + Quick-Actions `CardHeader pb-2`.
- Verified: cards 357×218 at x=288/669/1051 (ref: 357×222 — residual 4px from
  internal line-height minutiae, accepted).

### A8. Mobile app-bar height — FIXED
- Reference mobile header: 73px (toggle button 40px: p-8 + 24px icon).
- Clone had 68px (28px button, 20px icon).
- Fix: `h-10 w-10` button + `h-6 w-6` icon in `app-shell.tsx`. Verified 73px.

### A9. Employees search card padding — FIXED
- Reference: `p-4` (card h=70). Clone had `p-3` (h=62). Fixed to `p-4`.

## B. Production-hardening gaps (code audit, `code-review-and-audit` skill)

### B1. `assertProductionSecret` was dead code — FIXED (TDD)
- Exported but never called; docs claimed next.config enforced it (it didn't).
- Contract tests first (`tests/unit/auth.test.ts` — 4 new specs: unset/short/
  valid/development), then the guard strengthened (production requires a
  ≥16-char AUTH_SECRET), then wired through `src/instrumentation.ts`
  (`register()` → `assertProductionSecret()`).
- Live negative test: standalone server with NO AUTH_SECRET anywhere fails
  instrumentation with "AUTH_SECRET is required in production" and serves
  HTTP 500 (no session can be signed with the insecure fallback). E2E still
  green (Playwright's webServer sets a proper secret).

### B2. `typescript.ignoreBuildErrors: true` — REMOVED
- Inherited from the original scaffold — a disabled gate contradicting the
  repo constitution ("never silence a failing gate"). tsc is clean, so the
  build now runs with full type checking (verified: build passes).

### B3. Employees PATCH relation validation — FIXED
- POST pre-validates `departmentId`/`managerId` existence; PATCH didn't (a bad
  id would surface as INTERNAL via a Prisma FK error). PATCH now returns
  VALIDATION for unknown relations, mirroring POST.

## C. Verified NON-gaps (VLM claims refuted by DOM measurement)

- Sidebar width: 256px in BOTH apps (VLM claimed a difference).
- Active nav color: `rgb(24,119,242)` in the clone = reference's measured
  active color. The reference shows NO highlight on its /Dashboard item only
  because of its own case-sensitivity bug (`/Dashboard` vs `/dashboard`) —
  the clone highlights correctly (documented superset deviation).
- Footer email: identical text + `truncate` class in both.
- Leave-balance progress fill: `rgb(59,130,246)` in both.
- Card shadow: both render v3's default `shadow` geometry; radius 12px both.
- Mobile bottom tabs, drawer geometry (288px, overlay 80%, no X button):
  re-verified unchanged.

## D. Deliberately NOT changed (documented standardizations)

- PageHeader title sizes: the reference is inconsistent page-by-page
  (30/36/48px); the clone standardizes on the two dominant patterns
  (documented in the component).
- Dashboard `max-w-7xl`: the reference's dashboard is full-width while its
  module pages use `max-w-7xl`; the clone uses `max-w-7xl` everywhere —
  visually identical up to 1536px viewports.
- "Edit with Base44" badge: intentionally excluded (builder chrome, not app UI).

## E. Gates after remediation

lint clean · tsc clean · **49/49 unit** (44 + 4 secret-guard + 1 sidebar token)
· build ✓ (with full type checking) · **75/75 E2E** · screenshots refreshed
(22 files, session-3 state) · secret scan clean.
