# Eon HR — Engineering SKILL

> **What this is:** a single-source-of-truth engineering reference for the Eon HR
> codebase — a production-grade, self-hosted clone (functional superset) of the
> Base44 app `https://eon.base44.app/`. Any coding agent can use this to extend,
> debug, onboard, or replicate the architecture without re-discovering the
> hard-won knowledge below.
>
> **How to use:** read §1–§5 before making changes; consult §9–§13 when
> debugging; run §11 before every push. Every claim is verifiable against a
> specific file or command — the file paths are authoritative.
>
> **Version:** 3.6.0 (session-23 remediation complete) · **Last updated:**
> 2026-10-12 · **State:** 411 unit + 86 E2E tests green, lint/typecheck/build
> clean, visual + interaction parity with the live reference verified by dual-browser audit
> (desktop 1440 + mobile 390 + the tablet bands 768/900/1024 + the 640–767 band +
> the sub-390 band + a print-stylesheet audit + the keyboard/focus-ring taxonomy +
> the hover/active-state taxonomy + the pressed-state taxonomy).

---

## Table of Contents

1. [Project Identity & Design Philosophy](#1-project-identity--design-philosophy)
2. [Tech Stack & Environment](#2-tech-stack--environment)
3. [Bootstrapping & Configuration](#3-bootstrapping--configuration)
4. [The Design System (Code-First)](#4-the-design-system-code-first)
5. [Component Architecture & Patterns](#5-component-architecture--patterns)
6. [Client Data-Fetching & State Patterns](#6-client-data-fetching--state-patterns)
7. [Route & Feature Inventory (Parity Map)](#7-route--feature-inventory-parity-map)
8. [Accessibility Implementation](#8-accessibility-implementation)
9. [Anti-Patterns & Common Bugs](#9-anti-patterns--common-bugs)
10. [Debugging Guide](#10-debugging-guide)
11. [Pre-Ship Checklist](#11-pre-ship-checklist)
12. [Lessons Learnt & How to Avoid Them](#12-lessons-learnt--how-to-avoid-them)
13. [Pitfalls to Avoid](#13-pitfalls-to-avoid)
14. [Best Practices](#14-best-practices)
15. [Coding Patterns](#15-coding-patterns)
16. [Coding Anti-Patterns](#16-coding-anti-patterns)
17. [Responsive Breakpoint Reference](#17-responsive-breakpoint-reference)
18. [Z-Index Layer Map](#18-z-index-layer-map)
19. [Color Reference (Complete)](#19-color-reference-complete)
20. [TypeScript Interface & Validation Reference](#20-typescript-interface--validation-reference)
21. [Appendix A: The Meticulous Approach (Workflow)](#appendix-a-the-meticulous-approach-workflow)
22. [Appendix B: Quick Reference Card](#appendix-b-quick-reference-card)

---

## 1. Project Identity & Design Philosophy

**One sentence:** Eon HR is a Saudi-context employee-portal / HRMS web app
(dashboard, 13 nav modules, 46 app routes, 45 data models) cloned from a live
Base44 reference with pixel-level visual parity while being a *functional
superset* — real SQLite persistence, real CRUD APIs, real auth, real tests
where the original is a builder-platform demo.

**Design thesis:** *reference parity first, superset second.* Every visual
decision defers to measured values from the live reference (colors extracted
via computed-style/DOM audit, geometry via bounding boxes), and every
functional decision upgrades the reference's demo behavior to production
quality (real DB, validation, role gates, test coverage).

**Non-negotiable rules:**

- Never approximate a reference color "by eye" — measure it (§19 has the full
  measured map). A single wrong hex is a parity bug.
- The reference's *builder artifacts* ("Edit with Base44" badge) are
  intentionally NOT cloned; the reference's *bugs* (case-sensitive `/Dashboard`
  nav highlight) are intentionally fixed (documented superset deviations, §7).
- Money is stored in minor units (halalas) and rendered via
  `formatSar` (`src/lib/utils.ts`) — never floats.
- The `skills/` folder is documentation/tooling only — excluded from code
  checking, testing, and compilation gates.

**CTA hierarchy:** primary `#1877F2` buttons for the page's main action
("Add Employee", "Sign in" is the exception — slate-900 per reference),
bordered chips for quick actions, ghost icon buttons for row actions.

**Anti-generic mandate:** no default shadcn indigo, no oklch-drifted palette,
no gradient buttons except the reference-measured brand squircle and the
employees gradient button, no toast-library chrome that differs from the
reference's toasts.

---

## 2. Tech Stack & Environment

| Layer | Technology | Version (locked) | Critical Note |
|---|---|---|---|
| Framework | `next` | ^16.1.1 | App Router only; `output: "standalone"`; Turbopack dev |
| UI runtime | `react` / `react-dom` | ^19.0.0 | Server Components by default; `"use client"` only where needed |
| Styling | `tailwindcss` | ^4 (via `@tailwindcss/postcss` ^4) | **v4 — five pinned traps, see §9/§4**; no `tailwind.config.*` file, all tokens in `globals.css` `@theme inline` |
| DB / ORM | `prisma` + `@prisma/client` | ^6.11.1 | SQLite (`DATABASE_URL="file:../db/custom.db"`); 45 models; `outputFileTracingRoot` pinned (§3) |
| Validation | `zod` | ^4.6.5 | Every API POST/PATCH body; wizard step-gating |
| UI primitives | Radix UI (dialog, select, dropdown, tabs, …) | latest 1.x/2.x | 15 wrapped primitives in `src/components/ui/` |
| Icons | `lucide-react` | ^0.525.0 | Icon *names* are parity-pinned (§5) |
| Charts | `recharts` | ^3.10.1 | Analytics pages |
| State | `zustand` | ^5.0.6 | Toast store only |
| Unit tests | `vitest` | ^5.0.1 | Node env; `*.test.ts` only |
| E2E | `@playwright/test` | ^1.63.0 | Production standalone server + isolated e2e.db |
| Auth | custom (this repo) | — | scrypt password hash + HMAC-signed cookie sessions (`src/lib/auth.ts`) — no Auth.js |
| AI SDK | `z-ai-web-dev-sdk` | ^0.0.18 | HR Assistant chat route (server-only) |

**Runtime:** bun (dev + scripts + standalone server); Node 24 works for
Playwright tooling. `next.config.ts` allowlists dev origins
(localhost / 127.0.0.1 / `*.space-z.ai`) — Next 16's dev-origin protection
otherwise blocks dev chunks (trap documented in
`docs/Tailwind-V4-Validation-Report.md`).

---

## 3. Bootstrapping & Configuration

```bash
git clone https://github.com/nordeim/eon-hr.git && cd eon-hr
bun install                      # bun.lock is the lockfile of record
cp .env.example .env             # then set AUTH_SECRET (openssl rand -hex 32)
bun run db:push                  # prisma db push -> <repo>/db/custom.db
bun run db:seed                  # demo user + quotas (prisma/seed.ts)
bun run dev                      # http://localhost:3000 (Turbopack, tee dev.log)
```

**Gate commands** (§11 has the full checklist): `bun run lint`,
`bun run typecheck`, `bun run test`, `bun run build`, `bun run test:e2e`.

**Config files and their one job:**

| File | Job |
|---|---|
| `next.config.ts` | `output:"standalone"`; `outputFileTracingRoot` pinned to repo root (standalone server always lands at `.next/standalone/server.js` even inside a parent workspace with its own lockfile); `allowedDevOrigins`; `devIndicators:false` (dev-tools floating button would pollute screenshots); `typescript.ignoreBuildErrors` (tsc gate is run separately) |
| `prisma/schema.prisma` | 45 models; relative `file:` URL resolves against this file for BOTH CLI and runtime |
| `vitest.config.ts` | matches `src/**/*.test.ts` + `tests/**/*.test.ts`, node env, `@` alias — `*.spec.ts` never picked up |
| `playwright.config.ts` | boots `bun .next/standalone/server.js` on :3100 with `db/e2e.db`, `workers:1` (single shared SQLite), storageState session reuse (login rate-limiter safety), `reuseExistingServer` off-CI only |
| `eslint.config.mjs` | Next core rules; `react-hooks/exhaustive-deps` + `purity` + `set-state-in-effect` disabled (fire on the mandatory golden fetch pattern) |
| `postcss.config.mjs` | `@tailwindcss/postcss` |

**Env vars (2 total, see `.env.example`):** `DATABASE_URL` (required),
`AUTH_SECRET` (required in prod; dev fallback constant). No other env vars are
read by the codebase — do not add config surface without updating
`.env.example`, `db-path` tests, and this file.

**Build pipeline:** `bun run build` = `next build` + `cp -r .next/static
.next/standalone/.next/` + `cp -r public .next/standalone/` — the standalone
server needs those copies (a classic Next standalone footgun; the script
already handles it).

**Database contract (do not break):** `.env` sets
`DATABASE_URL="file:../db/custom.db"`; the `db/` folder sits at the repo root
(git-ignored). `src/lib/db-path.ts` resolves the relative URL against
`prisma/schema.prisma` so CLI, `next build`, and the running server all
converge on the same file regardless of process cwd — pinned by
`tests/db-path.test.ts` (15 assertions).

---

## 4. The Design System (Code-First)

All tokens live in the single `@theme inline` block in
`src/app/globals.css` (Tailwind v4 — there is NO tailwind.config file). The
comment above the block documents the **six v4 traps**; traps 2, 3 and 5 are
materialized as token pins:

1. **Full `hsl()` values** — bare triplets (`hsl(221 39% 11%)` as a token
   value without the `hsl()` wrapper) resolve transparent under
   `@theme inline`.
2. **v3-era hex palette pinned** — v4's default palette is oklch-based and
   drifts 1–3 sRGB units/channel vs the v3 hexes the reference renders. Every
   family the UI uses is pinned: full slate (50–950), blue (50–900), green
   (50/500/600), indigo (500/600) — see §19.
3. **Gradients: sRGB-linear arbitrary forms** where byte-identical output
   matters — `linear-gradient(in srgb, ...)`; oklab interpolation differs.
4. **space-y selector rewrite** — no explicit `mt-*`/`mb-*` on children inside
   `space-y-*` containers (mobile nav CTA rule).
5. **`--shadow-sm` pinned to v3 geometry** — v4 shifted the shadow scale one
   notch; cards use the reference's default `shadow`.

**Core semantic tokens (measured from the live reference):**

```css
--color-primary: #1877f2;            /* reference custom-primary-bg (rgb(24,119,242)) */
--color-link: #2563eb;               /* reference text-blue-600 links */
--color-muted-foreground: #64748b;   /* slate-500 */
--color-sidebar-border: #e2e8f0;     /* slate-200 */
--color-background: #f8fafc;         /* canvas is a slate-50→blue-50 sRGB gradient in the base layer */
--color-ring: #1877f2;
--color-accent-foreground: #1877f2;
```

**Typography:** Tailwind's default ui-sans-serif stack pinned verbatim in @theme (session-4: the reference self-hosts NO webfont; Inter drifted text metrics); module page
titles `text-4xl md:text-5xl font-bold text-slate-900`, dashboard/employees
titles `text-3xl`, subtitles `text-lg text-slate-600`, kickers
`text-sm font-medium text-slate-700`, sidebar group label 12px slate-500.

**Radius scale:** cards `rounded-xl`, buttons/inputs `rounded-lg`, small
chips `rounded-md`, brand squircle `rounded-xl` at 40×40.

**Shadows:** cards default `shadow` (v3 geometry — `--shadow-*` pinned);
brand squircle + login logo `shadow-sm/shadow-lg` per reference.

**Keyframes/animations:** tw-animate-css (`data-[state=open]:animate-in` etc.
on Radix parts); no bespoke keyframes.

**Brand mark:** 40×40 gradient squircle (session-3 re-measure)
`bg-gradient-to-b from-[#3856E9] to-[#444DE6]` (pixel-measured endpoints) with
white 24px stroke-2 `Briefcase` lucide icon, v3 shadow-lg — rendered in CSS in
`SidebarHeader` (`src/components/layout/sidebar-nav.tsx`), no image asset. The
login page uses the circular self-hosted `public/eon-logo.png`. Sidebar brand
row is px-6 with h2 text-lg/700/slate-900 + text-xs "Demo" (session 5).

**Sidebar nav geometry (session 5):** LEAF links = h-8 px-3 py-2.5 gap-3 with
16px icons and mb-1 (40px list pitch, hover #e4e6eb = the reference
:root --accent-color, plus opacity-80); GROUP triggers = h-8 p-2 gap-2 with
20px icons, hover bg-blue-50/text-blue-700, mb-1; sub-list mt-1 (4px gap
below the trigger); sub-items h-8 px-3 py-2 gap-3 with 16px icons. Active
leaf = bg-primary #1877F2 + text-white + font-medium + shadow-sm.

**Mobile chrome (session 5):** top bar = 73px (px-6 py-4) with a 28×28
toggle (16px PanelLeft) + h1 "EonHR" text-base/700/slate-900 over a
text-xs text-slate-500 "Demo" (40px brand block, items-center). Bottom
tabs = text-sm font-medium leading-normal labels (61px items) with the
ACTIVE tab text-blue-600; drawer unchanged (288px, no X, auto-close).

**Primary CTA recipe (session 4):** Button default variant =
bg-[linear-gradient(to_right,#2563EB,#4F46E5)] (hover #1D4ED8 -> #4338CA),
rounded-md, text-primary-foreground (#FAFAFA), v3 shadow; icons at CTA call
sites carry mr-2 on top of the button gap-2 (reference quirk: 16px effective
icon-to-text gap).

**Section badges (session 4, re-measured session 5):** module pages render
the section as a white pill badge above the h1 — rounded-full bg-white px-4
py-2 shadow-sm with a 16px module icon (PER-MODULE color, not always blue)
+ text-sm font-medium text-slate-700 (14px/500 — the session-4 "16px/400
#0A0A0A" read the wrapper div, not the text span). Badge margin and h1 size
vary by page: see the six PageHeader `layout` recipes (session 5,
`docs/remediation-plan-session5.md` §3) — raised-48 (mt-8, y=64/116/48px),
raised-36, flat36 (y=32/84/36px), flat36-sm, flat48, flat-tight (y=32/80/36
+ 16px sub). Icon map: blue taskmanager/loans/leavemanagement/settings/etc,
green payroll, purple expenses/training/communications, indigo
recruitment/hrletters/evaluations, red compliancedashboard, teal
surveys/organogram, violet shiftcalendar.

**Token regression pin:** `tests/unit/tokens.test.ts` reads `globals.css` and
asserts `--primary: #1877F2`, the slate-500 muted value, the pinned v3
palette, and `--shadow-sm` geometry — change a token, a test fails.

---

## 5. Component Architecture & Patterns

**Layers (import direction strictly downward):**

```
src/app/**            pages (route shells; ~38 client pages + 10 server pages)
src/components/layout  app shell: sidebar, mobile drawer, bottom tabs, header
src/components/shared  PageHeader / StatCard / EmptyState / StatusBadge
src/components/ui      15 Radix-wrapped primitives (button, dialog, select, …)
src/lib                auth, db, api (envelope), validation, utils, nav-config
prisma/                schema + seed
```

**Component counts (verify: `find src -name '*.tsx' | wc -l` → 84):** 62 files
carry `"use client"`; 10 of the 48 `page.tsx` are pure server components (the
golden fetch pattern, below). UI primitives: 15. Shared: 4. Layout: 3.

**The golden module-page pattern (copy `src/app/(app)/employees/page.tsx`):**

- Server pages fetch via Prisma directly, pass props down, redirect on
  missing session; client pages fetch `/api/...` in an effect with
  `let cancelled` cleanup, render `Loader2` spinners, toast on error.
- `PageHeader` (kicker + title + subtitle + actions) on every module page —
  reference-measured sizes; `size="lg"` variant for dashboard/employees.
- `StatCard` / `EmptyState` / `StatusBadge` for the furniture.
- Dialogs: `max-w-lg`, footer right-aligned, `flex gap` spacing (never
  `mt/mb` inside `space-y` — trap 4).

**API envelope (every route, `src/lib/api.ts`):**

```ts
type ActionResult<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };
```

Handlers: `guard()` (catch-all → 500 envelope), `requireUser()` (401),
`requireRole("admin")` (403), `parseBody(schema)` (400). Zod at every write
boundary. Success paths return the envelope; client code checks `json.ok`.

**Icon parity map (do not "improve" — names are pinned):** Training LMS
`Video`, Assets `Laptop`, Staff Requests `FileText`, Communications
`MessageCircle`, AI HR Assistant `Target`; sub-items carry `w-4 h-4` lucide
icons (Users, SquareCheckBig, Plane, Calendar, FileText …) in
`src/lib/nav-config.ts`. Bottom tabs: LayoutDashboard / Users / SquareCheckBig
/ Calendar / CircleUser — **no active state** (reference genuinely lacks it).

**Sidebar behavior:** 256px; groups expand (Radix Collapsible); active
top-level and sub-item = solid `#1877F2` bg + white text; footer = gradient
avatar (`CircleUser`), `Bell`, `Moon/Sun`, `Languages` + **"عربي"** label;
user trigger `w-full justify-start gap-3 hover:bg-slate-100`, no chevron.

**Auth pattern:** `getSessionUser()` in server code; pages redirect to
`/login?from_url=…`; login page is Suspense-wrapped (useSearchParams — §9
bug 3). Sessions: HMAC-signed cookie (`eon_session`), scrypt hashes, login
rate-limited 10/IP/15min.

---

## 6. Client Data-Fetching & State Patterns

No custom hooks library — the app standardizes three patterns instead:

**Pattern A — client CRUD page (the 38 client pages):** `useState` rows +
`load()` fetch on mount with `cancelled` guard; mutations POST/PATCH/DELETE →
envelope check → toast (`zustand` store, `src/components/ui/toast.tsx`) →
`load()` re-fetch. Loader2 spinner while fetching; EmptyState when zero rows.

**Pattern B — server golden page:** async component, `await getSessionUser()`
+ Prisma selects, pass plain props; client widgets (e.g.
`CustomizeButton`) hydrate on top. Dashboard and 9 module pages use this.

**Pattern C — wizard dialogs (`employee-wizard.tsx`):** local form state
object + `set(key, value)` helper; per-step `stepValid` gating; reference
data (departments, managers, templates) fetched once per dialog session;
submit builds the API payload (full-name split: first space → first/last,
single-word name keeps whole string + "." lastName placeholder — mirrors the
reference's single "Full Name" field over a first/last data model).

**Money:** stored as integer minor units; `formatSar` renders "SAR" prefix
forms; `parseSar` on input. Expense totals aggregate with `_sum.amount`.

**IDs:** human-readable `EMP-XXXX` generated by max-suffix scan + retry-on-
conflict (§9 bug 5 — never count-based).

---

## 7. Route & Feature Inventory (Parity Map)

48 app routes + 49 API route files. Sidebar: 13 items (Dashboard + 6 groups +
Training LMS, Assets, Staff Requests, Communications, Analytics, AI HR
Assistant, Settings — see `src/lib/nav-config.ts`).

| Module | Route | Key features (superset in bold) |
|---|---|---|
| Dashboard | `/dashboard` | Welcome header, quick-action chips, leave balances w/ progress bars, recent requests, expense total; **Customize dialog w/ localStorage persistence** |
| Employees | `/employees` | 4-step add wizard (personal → job → contract → documents, Saudi fields: nationality default, iqama, GOSI, IBAN), reference 5-column table, search, grid/list toggle, **import CSV, full CRUD + onboarding template kickoff** |
| Leave | `/leavemanagement`, `/allleaverequests` | request dialog, my/all views, balances card on dashboard only (reference parity) |
| Payroll | `/payroll`, `/payrollprocessing` | runs, payslips, **cycle processing with GOSI/bank fields** |
| Recruitment | `/recruitment`, `/recruitmentcareers` | jobs, candidates pipeline, **public careers page** |
| Training | `/training` | 7 category tabs, platform grid, **admin platform CRUD** |
| Compliance | `/compliancedashboard` | expiry monitor d7/d15/d30/expired, **scan engine recomputing Document.status + alerts, notify→CommunicationLog** |
| Performance | `/performancemanagement`, `/evaluations`, `/reviews`, `/reviewcycles` | goals w/ auto-complete, review cycles, 360° |
| Analytics | `/analyticsdashboard`, `/surveyanalytics`, … | recharts dashboards, **CSV export** |
| Self-service | `/employeeselfservice`, `/staffrequests`, `/expenses`, `/hrletters`, `/surveys`, … | requests, claims, letters, survey builder |
| Ops | `/taskmanager`, `/attendance`, `/shiftcalendar`, `/documenttracker`, `/assetmanagement`, `/workflowautomation`, `/communications`, `/hrassistantchat`, `/companywall`, `/profile`, `/settings` | see `docs/reference-page-map.md` for the full per-page spec |

**Documented intentional deviations (superset):** (1) `/Dashboard` URL
highlights the nav item — the reference has a case-sensitivity bug; (2) no
"Edit with Base44" badge; (3) standardized module title sizes (48px dominant
pattern) instead of replicating the reference's per-page 24/30/36/48
inconsistency; (4) real persistence/validation/role-gates everywhere.

---

## 8. Accessibility Implementation

- Radix primitives carry the ARIA weight: dialogs (`role="dialog"` + focus
  trap + Esc), selects (`role="combobox"`), tabs, switches — never bypass the
  wrapper.
- Icon-only buttons get `aria-label` (Toggle Sidebar, drawer links via link
  text); decorative icons `aria-hidden`.
- Progress bars: `role="progressbar"` + `aria-valuenow/min/max` +
  `aria-label` (leave balances).
- Wizard step rail: `aria-current="step"`, `<ol>` structure.
- Focus rings: `focus-visible:ring-2 ring-ring ring-offset-1` on interactive
  primitives (Button base style).
- Bottom tabs and drawer links are real `<Link>`s — keyboard reachable,
  44px+ touch targets on mobile.
- Login error: `role="alert"`; toasts: Radix region with live announcements.

---

## 9. Anti-Patterns & Common Bugs

Numbered anti-pattern log — each one was a real defect in this repo's
history. The fix is in the tree; the number is cited from lessons (§12).

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| AP-1 | Whole theme corrupts (all tokens transparent/black) after editing globals.css | CSS comment containing class-like text (`mt-*/mb-*` in prose) terminates the comment early inside `@theme` | Keep comments inside `@theme` free of `*-` patterns; token pin test catches drift (`tests/unit/tokens.test.ts`) |
| AP-2 | E2E `toHaveCSS` color assertions fail although the hex "looks right" | Tailwind v4 serializes default palette colors in **oklab**; computed strings don't match v3 `rgb()` expectations | Pin the v3 hexes for every used family in `@theme` (§4 trap 2); assertions then see `rgb(24,119,242)` |
| AP-3 | Login page build error: `useSearchParams() should be wrapped in a suspense boundary` | Client hook needing Suspense during prerender | `<React.Suspense>` wrapper around `LoginForm` |
| AP-4 | Employee create returns 409 after deletes | Count-based `EMP-XXXX` id generation collides when earlier rows were deleted | Max-suffix scan + on-conflict regenerate loop (`src/app/api/employees/route.ts`) |
| AP-5 | **Form submits one wizard step early** (dialog closes, row created, step never shown) | Footer swaps a `type="button"` Next for a `type="submit"` Create at the same DOM position; React re-renders synchronously during the click dispatch and Chromium resolves the form's *current* default button for the click's default action | ALL wizard footer buttons are `type="button"`; submission driven by `onClick` (§15 pattern W-1) |
| AP-6 | Drawer "leaks" overlays after navigation | Radix leaves 0×0 hidden artifacts in body | Assert *visible* geometry (width 288) instead of counting `[data-state]` nodes |
| AP-7 | Vitest picks up Playwright specs (double-run) | Include pattern too broad | `vitest.config.ts` matches `*.test.ts` only; E2E lives in `*.spec.ts` |
| AP-8 | E2E fails with 409/unique-constraint on re-run | CRUD specs persist rows in the shared e2e.db | `tests/e2e/purge-test-data.ts` in global-setup deletes `@eon-hr.test` employees before re-seed |
| AP-9 | Strict-mode locator violations when a toast mentions the same text as the row | Success toasts duplicate visible text | `{ exact: true }` on row-text assertions (dashboard.spec) |
| AP-10 | Dev page unhydrated / native form GET fallbacks in browser tooling | Next 16 dev-origin protection blocks chunks for non-allowlisted origins | `allowedDevOrigins` in next.config.ts (localhost, 127.0.0.1, preview hosts) |

---

## 10. Debugging Guide

**Build/startup:**

| Error | Cause | Fix |
|---|---|---|
| `Cannot find module './prisma/client'` / Prisma client stale after schema edit | generated client out of date | `bun run db:generate` (or `db:push`) then **restart dev server** |
| Standalone server serves old code after source edits | E2E reuses the running :3100 server (`reuseExistingServer`) | Kill the stale `bun .next/standalone/server.js` process, `bun run build`, re-run |
| `ERR_CONNECTION_REFUSED` from agent-browser while curl works | dev server died with the shell (child-process reaping) | `(setsid bun run dev < /dev/null > /dev/null 2>&1 &)` — detached subshell |

**Runtime:**

| Symptom | Cause | Fix |
|---|---|---|
| Blank styled page, no errors | @theme corrupted (AP-1) | Inspect comment above `@theme`; run token test |
| Every color subtly off vs reference | oklch drift (AP-2) | Verify pinned families in globals.css §19 |
| API returns `{ok:false}` with code `AUTH` | session cookie missing/expired | Re-login; check `AUTH_SECRET` consistency across restarts |
| Login suddenly 429 | rate limiter (10/IP/15min) | Wait or clear; specs share one login via storageState |

**E2E:**

| Symptom | Fix |
|---|---|
| Wizard test stuck before step 4 | Confirm AP-5 fix is in the build — the footer must have no `type="submit"` button; then rebuild |
| 409 on employee create in specs | Run `DATABASE_URL="file:../db/e2e.db" bun tests/e2e/purge-test-data.ts` |
| Playwright trace needed | `npx playwright show-trace test-results/<test>/trace.zip` — network bodies live in `resources/*.json` |

**Live parity verification (dev server):** login → `agent-browser` at
1440×900 and 390×844; measure via
`agent-browser eval 'getComputedStyle(...)'`; screenshots to
`docs/screenshots/`; compare against `docs/eon-hr-dashboard.png` and the
reference captures. VLM comparison prompts must demand *verdict + specific
differences* and small regions zoomed — whole-page VLM diffs hallucinate
(verify every VLM claim in the DOM before acting on it).

---

## 11. Pre-Ship Checklist

Run in order; all must pass:

```bash
bun run lint          # eslint . — zero warnings
bun run typecheck     # tsc --noEmit — zero errors
bun run test          # vitest — 373/373 (db-path 15, auth 14, utils 13, tokens 19, recipes 236, shell-recipes 76)
bun run build         # next build + static/public copy into standalone
bun run test:e2e      # playwright — 86/86 against the fresh standalone build
```

**Before pushing (per `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`):**

- [ ] `git status` — no stray tmp files (`*.tmp.mjs`, `check-emp*`)
- [ ] `.env.example` matches the env vars actually read (`DATABASE_URL`, `AUTH_SECRET`)
- [ ] `docs/screenshots/` reflects the current build (no stale timestamps)
- [ ] worklog + session doc appended (§Appendix A workflow step 6)
- [ ] commit to **main only** — never create branches
- [ ] push via `docs/ssh_git_wrapper_v3.py` with the operator key; verify remote HEAD == local; shred the key after

**Post-push smoke:** `/api/health` → `{"status":"ok","db":"up"}`; login →
dashboard renders; mobile drawer opens → navigates → closes (288px, dark
overlay, no X button).

---

## 12. Lessons Learnt & How to Avoid Them

1. **L1 — Measure, don't eyeball (session 1).** "The reference's blue" was
   assumed `#2563EB`; DOM audit showed active-nav `#1877F2` and link-blue
   `#2563EB` are two different tokens. Fix: every color in §19 carries its
   measurement provenance.
2. **L2 — VLMs misread small UI (session 2).** Whole-page screenshot diffs
   produced phantom gaps (avatar "black with N" — actually the Next dev-tools
   button; "flatter blue" — measured identical). Fix: verify every VLM claim
   via `getComputedStyle`/bounding boxes before changing code; zoom crops for
   small regions.
3. **L3 — Button-type swaps submit forms (AP-5).** The nastiest bug of the
   project: trace showed POST firing *during* the click dispatch. Fix: pattern
   W-1 (§15) + E2E pin of the full 4-step flow.
4. **L4 — Tailwind v4 is a different rendering engine (traps 1–5).** hsl
   token transparency, oklch drift, gradient interpolation space, space-y
   child margins, shadow scale shift. Fix: the pinned `@theme` + token test;
   read `docs/Tailwind-V4-Validation-Report.md` before touching globals.css.
5. **L5 — Shared-SQLite E2E needs hygiene (AP-4/AP-8).** Count-based ids and
   leftover rows both produce 409s that look like code bugs. Fix: max-suffix
   id generation + global-setup purge.
6. **L6 — Stale standalone servers lie.** `reuseExistingServer` re-served a
   pre-fix build; tests "failed" against code that was actually correct.
   Fix: kill :3100 before suites that follow source changes; rebuild.
7. **L7 — Screenshot artifacts.** The Next dev-tools floating button
   contaminated docs screenshots. Fix: `devIndicators: false`; screenshots
   captured from logged-out as well as logged-in states deliberately.
8. **L8 — Reference bugs are clone decisions.** `/Dashboard` case-sensitivity
   and bottom-tab active-state: replicate the *good*, fix the *broken*,
   document every deviation (§7). An undocumented deviation is a future
   "regression".

---

## 13. Pitfalls to Avoid

- **Don't** add a `tailwind.config.js` — v4 tokens live in `@theme inline`
  (globals.css). A config file silently half-activates.
- **Don't** use unpinned palette classes for parity surfaces — `bg-slate-600`
  renders from the pinned hex; new families (amber, rose…) must be pinned
  before use in parity contexts.
- **Don't** put `mt-*`/`mb-*` on children of `space-y-*` containers (trap 4).
- **Don't** render a `type="submit"` button into a slot a `type="button"`
  just vacated (AP-5). Wizards: all footer buttons `type="button"`.
- **Don't** generate ids from `count()` (AP-4).
- **Don't** read `process.env` in client components — the two env vars are
  server-only.
- **Don't** bypass `src/lib/api.ts` envelope helpers in route handlers.
- **Don't** assert colors without knowing v3-vs-oklab serialization (AP-2).
- **Don't** run E2E against a stale :3100 server after source changes.
- **Don't** use `getByRole("dialog")` count as drawer-closed proof (AP-6) —
  assert visible width/geometry.
- **Don't** create git branches — main only, per repo policy.
- **Don't** include `skills/` in lint/test/compile gates.

---

## 14. Best Practices

- **Server-first:** write module pages as server components (pattern B)
  unless the page needs heavy client interaction; client pages fetch through
  the API envelope, never import Prisma.
- **Zod at every boundary:** API bodies (`src/lib/validation.ts` schemas) and
  wizard step-gating share the same schema definitions.
- **TDD for regressions:** every bug fix in §9 arrived with its failing test
  first (token contract, wizard E2E round-trip, purge script).
- **Parity workflow:** measure → pin (token or E2E CSS assertion) → implement
  → re-measure. The E2E suite carries CSS pins for primary blue, chip
  borders, drawer width — treat spec assertions as the parity contract.
- **Naming:** routes lowercase (`/leavemanagement`, not `/leaveManagement`) —
  matching the reference's URLs exactly, including its casing quirks.
- **Money:** integer minor units + `formatSar`, never floats, never string
  math.
- **Docs as code:** every session appends `worklog.md` (repo-level) and
  `docs/session_N.md`; remediation plans live under `docs/` with the ToDo
  list they executed.

---

## 15. Coding Patterns

**W-1 — Wizard footer (AP-5-proof; session 7: the wizard is an INLINE view, not a Dialog — back button + h1 + max-w-4xl card; session 8: the advancing CTA carries a trailing `<ArrowRight className="ml-2 h-4 w-4">` like the reference's 97px Next):**

```tsx
<div className="mt-8 flex justify-between border-t border-slate-200 pt-6">
  <Button type="button" variant="outline" onClick={backOrCancel}>…</Button>
  <Button
    type="button"
    disabled={saving || !stepValid(step)}
    onClick={() => {
      if (step < STEPS.length - 1) { setStep((s) => s + 1); return; }
      void submit();           // submission ONLY via explicit onClick
    }}
  >
    {step < STEPS.length - 1 ? "Next" : "Create Employee"}
    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
  </Button>
</div>
// <form onSubmit={submit}> stays wired for Enter-key, guarded by
// `if (saving || step < STEPS.length - 1) return;` inside submit.
// Field rows (session 8 R7-C): wrapper `flex flex-col gap-3 pt-1` +
// `<Label className="leading-4">` → 68px field, 84px pitch, 872px card —
// reproduces the reference's inline-label box + strut slack deterministically.
```

**A-1 — API route skeleton:**

```ts
export async function POST(req: Request) {
  return guard(async () => {
    await requireUser();
    const body = await parseBody(req, employeeInputSchema);   // 400 envelope on invalid
    // ... Prisma write ...
    return ok({ employee });                                   // { ok:true, data }
  });
}
```

**P-1 — PageHeader usage:**

```tsx
<PageHeader
  kicker="Leave Management"
  title="Leave Requests"
  subtitle="Request time off and manage approvals"
  actions={<Button>Add Employee…</Button>}
/>
```

**F-1 — Client page load effect:**

```tsx
React.useEffect(() => {
  let cancelled = false;
  (async () => {
    const res = await fetch("/api/x");
    const json = await res.json();
    if (!cancelled && json.ok) setRows(json.data.rows);
    if (!cancelled && !json.ok) toast.toast({ variant: "error", title: "Load failed" });
  })();
  return () => { cancelled = true; };
}, [params]);
```

**D-1 — Drawer geometry (E2E-pinned):** `w-[288px]`, overlay `bg-black/80`
z-50, no X button, closes on route change; bottom tabs `min-h-[44px]`, no
active state.

---

## 16. Coding Anti-Patterns

```tsx
// ❌ AP-5 pattern — never swap a submit button into a clicked slot
{step < last ? <Button type="button">Next</Button>
             : <Button type="submit">Create</Button>}

// ❌ count-based ids
const id = `EMP-${String((await db.employee.count()) + 1).padStart(4, "0")}`;

// ❌ raw hex literals scattered in components (bypasses the token contract)
<div className="bg-[#2563EB]" />

// ❌ money as float
const total = rows.reduce((s, r) => s + r.amount / 100, 0);

// ❌ unguarded client env read
const url = process.env.DATABASE_URL;

// ❌ form GET fallback (dev-origin trap, AP-10)
<form action="/search">   // use client-side submit; keep allowedDevOrigins in sync
```

---

## 17. Responsive Breakpoint Reference

Tailwind default scale; the parity-critical usages:

| Breakpoint | What changes |
|---|---|
| `<sm` (<640px) | wizard step-rail labels hidden (numbers only); dialog footer stacks (`flex-col-reverse`); quick-action chips 1-col |
| `sm` (≥640px) | 2-col form grids; footer row |
| `md` (≥768px) | dashboard grid 2-col; content padding `p-8` (from `p-4`) |
| `md` (≥768px) | **sidebar appears, mobile header + bottom tabs hide** (`md:hidden` — session-7 viewport sweep: the reference switches at md, not lg); drawer unmounts |
| `xl` (≥1280px) | dashboard grid 3-col (Quick Actions / Leave Balances / Recent Requests; Expense Claims 1-col in row 2) |

Mobile shell (390×844 reference): header `px-6 py-4` + EonHR/Demo; drawer
288px; bottom 5 tabs; content `p-4 pb-20`.

---

## 18. Z-Index Layer Map

| z | Element |
|---|---|
| 10 | mobile sticky header (`app-shell.tsx`) |
| 40 | drawer overlay (below content per reference stack order) |
| 50 | drawer content, dialog overlay + content, toast viewport |
| auto | sidebar (static, desktop); dropdown/popover/select (Radix portal manages its own) |

Rule: anything Radix-ported inherits portal stacking; never hand-set z on
ported components.

---

## 19. Color Reference (Complete)

All values verified against `src/app/globals.css` `@theme inline` (and the
live reference where noted). Token test pins the bolded ones.

**Semantic (session-6 re-measured — reference :root extracted verbatim;
its shadcn layer is PURE-NEUTRAL):** primary **#1877F2** (ref-measured
custom-primary-bg), primary-foreground **#FAFAFA** (session-4: slate-50),
link **#2563EB**, background **#FFFFFF** (the AppShell root paints the
canvas gradient slate-50→blue-50, sRGB, stretching with content),
foreground **#0A0A0A** (reference 0 0% 3.9% — supersedes the session-2
slate-tinted hsl(221 39% 11%)), card/popover white, card-foreground
**#0A0A0A**, secondary **#F5F5F5** / secondary-foreground **#171717**
(reference 0 0% 96.1% / 0 0% 9%), muted hsl(210 40% 96%), muted-foreground
**#64748B** (rendered-truth pin — the reference token is #737373 but never
visibly renders; every probed surface uses explicit slate classes),
accent **#F5F5F5** / accent-foreground **#171717**, destructive
**hsl(0 84.2% 60.2%)** (= #EF4444 exact), border/input **#E5E5E5**
(neutral-200), ring **#0A0A0A** (reference 0 0% 3.9%), neutral-900
**#171717** (the reference's shadcn default button), sidebar **#FAFAFA**
(session-3), sidebar-border **#E2E8F0**.

**Pinned v3 families (byte-identical to reference rendering):**
slate 50–950 = #F8FAFC #F1F5F9 #E2E8F0 #CBD5E1 #94A3B8 #64748B #475569
#334155 #1E293B #0F172A #020617; neutral 200/900/950 = #E5E5E5 #171717 #0A0A0A
(sessions 4+6); green 100 = #DCFCE7 (session 6: stat tiles);
blue 50–900 = #EFF6FF #DBEAFE #BFDBFE #93C5FD #60A5FA #3B82F6 #2563EB
#1D4ED8 #1E40AF #1E3A8A; green 50/500/600/700 = #F0FDF4 #22C55E #16A34A
#15803D; indigo 500/600/700 = #6366F1 #4F46E5 #4338CA; purple 100/600 =
#F3E8FF #9333EA; orange 100/600 = #FFEDD5 #EA580C; red 50/500/600/700;
amber 50/500; emerald 50/500/600; teal 50/500.

**Special surfaces:** brand squircle gradient #2563EB→#4F46E5
(to-right-bottom, sRGB); primary CTA gradient #2563EB→#4F46E5 (sRGB);
login sign-in button slate-900 #0F172A; employees primary action
`bg-gradient-to-r from-blue-600 to-indigo-600`; avatar
`bg-gradient-to-br from-blue-500 to-indigo-500`; empty-state text slate-400.

---

## 20. TypeScript Interface & Validation Reference

**The envelope (`src/lib/api.ts`):**

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
```

**Validation schemas (`src/lib/validation.ts`, zod v4):** per-module input
schemas (EmployeeInput with the full Saudi field set, LeaveRequestInput,
StaffRequestInput, …) — shared by API routes and wizard gating.

**Nav model (`src/lib/nav-config.ts`):**

```ts
interface NavChild { title: string; href: string; icon?: LucideIcon }
interface NavItem { title: string; href?: string; icon: LucideIcon; children?: NavChild[] }
```

**Session/user (`src/lib/auth.ts`):** scrypt hash strings; HMAC-signed
cookie payload `{ uid, exp }`; `getSessionUser()` returns
`{ id, email, name, role, employeeId } | null`.

**Prisma model families (45):** User, Employee (Saudi fields: nationality,
nationalId, iqamaNumber/Expiry, contractType/Start, bankName, iban,
gosiNumber …), Department, LeaveType/LeaveBalance/LeaveRequest,
ExpenseClaim, PayrollRun/Payslip, Job/Candidate/JobApplication,
Document/DocumentTracker, ComplianceAlert, CommunicationLog, Survey/SurveyResponse,
Goal/Review/ReviewCycle/ReviewRating/Evaluation, TrainingPlatform,
Workflow/WorkflowExecution, Asset, StaffRequest, Task, Shift, … — full list:
`grep '^model ' prisma/schema.prisma`.

---

## Appendix A: The Meticulous Approach (Workflow)

The repo's standard session protocol (see `worklog.md` + `docs/session_*.md`):

1. **Refresh** — `git pull`; re-read `AGENTS.md`, `CLAUDE.md`, `README.md`,
   `Project_Architecture_Document.md`, latest session doc, worklog.
2. **Validate** — run all gates (§11) before changing anything; confirm the
   dev server and DB contract are healthy.
3. **Audit** — dual-browser comparison (reference vs clone) at desktop +
   mobile; extract computed styles; VLM-diff screenshots; **verify every VLM
   claim in the DOM** (L2).
4. **Plan** — write the remediation plan with a numbered gap inventory and
   ToDo list under `docs/` (`docs/remediation-plan-session1.md` is the
   template); validate the plan against the codebase before executing.
5. **Execute (TDD)** — failing spec first, then the fix, then the full gate;
   capture refreshed screenshots.
6. **Record** — append worklog + session doc; update README/AGENTS/CLAUDE/PAD
   + this SKILL when architecture changes.
7. **Ship** — commit to main; push via the SSH wrapper
   (`docs/ssh_git_wrapper_v3.py` per its SKILL doc); verify remote HEAD;
   shred the key.

## Appendix B: Quick Reference Card

```
repo            /home/z/my-project/eon-hr (github: nordeim/eon-hr, main only)
dev             bun run dev            → :3000  (dev.log)
db              db/custom.db           (file:../db/custom.db — db-path.ts)
e2e db          db/e2e.db              (purge-test-data.ts cleans @eon-hr.test)
gates           lint → typecheck → test → build → test:e2e
tests           373 unit (6 files) + 86 e2e (5 specs, workers:1)
globals.css     @theme inline — 6 v4 traps, pinned v3 palette, token test
wizard footer   ALL type="button"; submit via onClick (AP-5)
ids             max-suffix EMP-XXXX + conflict retry
envelope        { ok, data | error:{code,message} }  (src/lib/api.ts)
icons           nav-config.ts — parity-pinned names
drawer          288px / bg-black/80 / z-50 / no X / close-on-nav
screenshots     docs/screenshots/ (65 captures, standalone server, devIndicators off)
reference       https://eon.base44.app  (docs/reference-page-map.md)
session log     worklog.md + docs/session_1.md, docs/remediation-plan-session1.md
ssh push        docs/ssh_git_wrapper_v3.py  (+ docs/how-to-git-push-using-ssh-wrapper_SKILL.md)
```

## 21. Session-6 Recipe Layer — content areas (parity round 5)

Everything below was live-measured against the reference (dual
agent-browser; `docs/remediation-plan-session6.md`) and is regression-pinned
by `tests/unit/recipes.test.ts` + `tests/e2e/dashboard.spec.ts` /
`mobile-navigation.spec.ts`.

**Card recipe:** root `rounded-xl border bg-card text-card-foreground shadow`
(border color via the base layer, #E5E5E5). CardTitle =
`text-base font-semibold tracking-tight` — 16px/600 with **24px line-height**
(color #0A0A0A inherited; the scaffold's zero line-height shrank every
title row 8px). Title+link cards nest a `flex items-center justify-between`
row INSIDE the standard column CardHeader (`flex flex-col space-y-1.5 p-6
pb-2`).

**StatCard recipe:** Card `border-slate-200`; p-6 interior; 48px icon tile
`p-3 rounded-xl bg-{color}-100` with 24px `text-{color}-600` icon; value
`text-3xl font-bold text-slate-900 mb-1` (30px); label `text-sm
text-slate-600`. Tile colors are per-stat (payroll: green/blue/purple/orange;
analytics: blue/purple/green/orange); grids are `grid gap-6 md:grid-cols-4`.

**EmptyState recipe:** `p-12 text-center`; icon 64px slate-300; h3
`text-lg font-semibold text-slate-900 mb-2`; description `text-slate-500
mb-4` (16px); action = the dark shadcn default button (#171717) — NOT the
gradient CTA.

**Button variants:** `dark` (#171717, the reference's shadcn default) +
per-page gradient CTAs (green/cyan/red/purple/indigo/pink, sRGB endpoints —
see §5.5 of the architecture doc). Outline = `border border-input
bg-background shadow-sm hover:bg-accent hover:text-accent-foreground`.

**Task manager board:** toggle = `div.flex gap-2` of h-9 buttons
(active=dark, inactive=outline — no segmented pill); board
`grid grid-cols-1 md:grid-cols-5 gap-4`; columns = bare `space-y-3
rounded-lg p-3` (no bg/border); column h3 `font-semibold text-slate-900`
(16px); count chip `inline-flex items-center rounded-md border px-2.5
py-0.5 text-xs font-semibold bg-slate-100 text-slate-700`; empty columns
render nothing below the header.

**Page canvases:** shell root paints slate-50→blue-50 (sRGB, stretches with
content — never `background-attachment: fixed` on body); each module page
adds its measured gradient root (`min-h-screen bg-[linear-gradient(to
right_bottom,X,Y)] p-4 md:p-8`) with the content wrapper nested inside;
`main` is bare. See the route→gradient map in the remediation plan §S2.

**Session-7 recipe layer — responsive boundary, kickers, inline wizard:**

- **Responsive boundary is md (768px)**, not lg: the reference's bottom
  nav is `md:hidden` and its sidebar mounts from md (viewport-swept at
  700/767/768/800/900/1024 on both apps). Shell classes: sidebar
  `hidden md:flex`, all mobile chrome `md:hidden` — never `lg:`.
- **Category-A mobile kickers** (employees, payroll, taskmanager,
  leavemanagement, expenses, loans + profile-kicker-only): `md:hidden
  bg-white border-b border-slate-200 px-4 py-3` (session 9: STATIC —
  the redeployed reference's sticky became inert; the bar scrolls away)
  with h1 `text-lg font-bold text-slate-900 truncate` (y=89 h=53 at
  390×844); the desktop PageHeader block gets `hidden md:flex` via the
  `mobileHeader="hidden"` prop (page actions are desktop-only there —
  the reference hides its Add Employee button below md).
- **Add-Employee wizard = INLINE page view**: back button (outline
  ArrowLeft, 36×36) + h1 30px/700 + 16px slate-500 subtitle, then a
  `max-w-4xl mx-auto` rounded-xl card — gradient header
  (`bg-gradient-to-r from-blue-50 to-indigo-50`, border-b, UserPlus
  w-6 text-blue-600 + 24px/600 title), p-8 interior with a 48px
  icon-circle step rail (active bg-blue-600, inactive bg-slate-200,
  white 24px icons [User/Briefcase/FileText/Paperclip], 14px/500
  labels, `h-0.5 mx-4 flex-1` connectors — green-600 once passed), a
  96px photo-upload circle on step 1 (slate-100 bg, 48px User icon,
  32px absolute camera button + hidden file input), `gap-3` fields on
  `grid md:grid-cols-2 gap-4`, and a `mt-8 pt-6 border-t` footer
  (Cancel/Back outline + Next/Create gradient).
- **Drawer overlay** uses `bg-[rgba(0,0,0,0.8)]` (not `bg-black/80`) —
  v4 serializes the utility form as oklab(); the arbitrary rgba form
  matches the reference's computed string byte-for-byte.

**Mobile page kicker (dashboard only):** `md:hidden bg-white border-b
border-slate-200 px-4 py-3` inside the p-4 page wrapper
(x=16, y=89; title x=32/y=101, 18px/700 slate-900, truncate) — session 9
re-pin: the bar is STATIC (the redeployed reference's sticky became inert
inside a non-scrolling wrapper stack; it scrolls away with the content,
measured y=-89 at scrollY=178). Module pages have NO kicker.

**Session-9 recipe layer — header recipes, actions alignment, employees
filter row (parity round 8):**

- **PageHeader actions center in the header block** (`sm:items-center`,
  actions cluster `flex gap-3`). The raised recipes carry their 32px offset
  on the ROW (`recipe.row: "mt-8"`, badge pages only) — so the centered
  block is the reference's 140px header and the buttons land on the h1 row
  (taskmanager/payroll y=116; employees' bare 64px block centers at y=46).
  Never `items-start`, never badge-level `mt-8`.
- **Centered headers**: training, evaluations, companywall, organogram
  pass `centered` → the title block gets `text-center` (badge + h1 +
  subtitle all center, matching the reference's `div.text-center` wrap).
- **Small pages render a 24px h1** (`size="md"`): recruitmentkanban,
  hrreports, staffrequests, notificationpreferences, workflowconfigpage
  (+ announcements, which already matched).
- **Recipe corrections (reference redeploy)**: payrollengine = flat-tight
  with an emerald-600 Calculator badge; advancedanalytics and
  securitysettings = flat36 (Shield, not ShieldCheck); reports carries the
  "HR Reports & Analytics" FileText badge on flat36.
- **/analyticsdashboard paints the slate→blue page root**
  (`min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)]
  p-4 md:p-8`) — the route the session-6 S2 codemod missed (h1 sat at
  y=0 with no canvas).
- **/employees filter row** (reference structure): card
  `rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-6`;
  interior `flex flex-col gap-4 items-center justify-between md:flex-row`;
  search `relative flex-1 md:flex-none` with the input
  `bg-transparent pl-10 w-full md:w-64`; the status filter is a NATIVE
  `<select>` (`h-9 px-3 py-2 border-slate-300 rounded-lg text-sm`, 125×36,
  OS-gray bg — a Radix trigger cannot reproduce that geometry); toggles
  are `h-8 px-3` with List + Grid3x3 icons. Page wrapper drops `gap-8`;
  the header takes `mb-8`, the card `mb-6` (32/24 rhythm).
- **/templates subtitle is a live count**: "{n} template(s) available".
- **The mobile kicker is STATIC** (see the re-pin above).
- **Documented deviations (reference regressions, kept as superset)**: the
  drawer auto-closes on navigation (the redeployed reference's stays
  open); the clone's employees EmptyState card (the reference renders
  nothing at 0 rows); the reference's /employeeselfservice is stuck
  loading and its /hrreports renders blank at mobile.

## 22. Session-10 Recipe Layer — parity round 9

**Centered headers fill the row (R9-A):** `centered` adds `flex-1` to the
PageHeader title block — the reference's centered pages wrap the header in
a FULL-WIDTH text-center block (badge/h1 center at 848 at 1440); a
shrink-to-fit flex child centers at its own content width (off by
152–327px on training/evaluations/companywall/organogram).

**Companywall is a narrow feed (R9-B):** wrapper `max-w-3xl space-y-6`
(768px); composer = 40px initials avatar + label-less textarea (placeholder
"Share an update with your team…", 78px) + "Who can see this post?" label
over a FULL-WIDTH select + Photo/Video (h-8 12px) + Post (h-9, Send icon);
rows 2-3 indent to the textarea column (pl-14).

**Training restructure (R9-C):** no header actions; category tabs are bare
dark/outline buttons (`flex gap-2 overflow-x-auto pb-2`, active
`#171717`/white 12px, h-8 px-3 — the taskmanager family, NOT the shadcn
segmented TabsList); section furniture = bare `h2.text-2xl font-bold` in a
`flex items-center justify-between mb-6` row (the New Platform dialog
rides the empty right slot — superset) over a BARE card (p-0 interior);
the empty state is the SIMPLE variant (p-12 + 64px icon + ONE 16px
slate-500 line — no h3/description/CTA; the payroll-style full variant is
a different page's recipe).

**StatCard variant map (R9-D):** eight variants (standard / compact /
compact-s / mini / mini-centered / horizontal / no-tile / tile-right) —
see the AGENTS.md table. /templates and /evaluations render no stat row.
Button icons in parity contexts carry `mr-2` (16px effective icon-text
gap). hrreports' builder is a compact 106px filter card (p-5, five 169px
label+control columns; our Status Filter rides as the sixth).

**Attendance (R9-E):** seven buttons (Print/PDF/Excel sm outline;
Devices teal-700 / Settings / Dashboard blue-700 at h-9; Import
Attendance cyan gradient — every icon mr-2); the reference squeezes its
title to a 312px two-line wrap and overflows the page (docW 1558 at 1440
— its own bug) — the clone keeps the title on one line and wraps the
cluster (`sm:flex-wrap`); Report Type toolbar card between header and
stats drives the stat row's scope (All Staff / Individual Employee /
Department Report). The session-5 `leading-[2]` title quirk is GONE.

**Session-aware 404 (R9-F):** `src/app/not-found.tsx` renders h1 "404"
text-7xl font-light + h2 "Page Not Found" text-2xl font-medium, centered
in the content area — inside the AppShell when authenticated, on the
canvas gradient when not.

## 23. Session-11 Recipe Layer — parity round 10

**Two header-action patterns (R10-E):** the reference centers actions on
the h1 row for taskmanager/payroll/expenses/leavemanagement/employees
(items-center) but rides them on the BADGE row for offboarding,
compliancedashboard, allleaverequests, workflowautomation (y=32), loans
(y=64 raised) and advancedanalytics (y=32) — measured
`flex justify-between items-start`. PageHeader's `actionsStart` prop
switches the row to `sm:items-start`.

**Action-free reference headers (R10-F..I):** hrletters, surveys,
announcements and payrollengine render no header button; their working
affordances live in content furniture (empty-state CTAs, the grid cell,
the toolbar card). Never add header actions to those four.

**Toast viewport (R10-D):** `fixed top-0 z-[100] flex max-h-screen w-full
flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto` + max-w 420 —
rendered even when empty on the reference; the card interior is the
clone's design (the reference never fires a toast).

**Composer precision (R10-C):** p-6 interior, one `flex items-start gap-4`
row (avatar + `flex-1 space-y-4` column), sRGB-pinned avatar gradient
(`bg-[linear-gradient(to_bottom_right,#3b82f6,#6366f1)]`, 16px initials),
textarea rows=3, `space-y-3` label group with `block leading-5` label,
GHOST Photo/Video (borderless 90px), Post = flat primary h-9 with Send
mr-2. Every icon mr-2 (16px effective gap — now on ALL parity buttons).

**Shiftcalendar (R10-J):** standalone month toolbar (chevrons 36px +
min-w-36 month label + All Departments select) between header and stats;
mini stats are border-0 + shadow-sm with per-card colored values
(blue/violet/emerald/amber-600) and text-xs slate-500 labels; the
calendar is a border-collapse text-xs TABLE; the summary card header is
border-slate-100.

**Kanban board (R10-K):** full-width page, filter row (search + All Jobs),
five w-64 border-2 bg-slate-100 columns with count badges and min-h-32
drop zones. The reference's page overflows (docW 1664) — the clone keeps
the fitting internal scroll.

**Reports chips (R10-L):** white bordered wrapping pill (bg-white border
border-slate-200 flex-wrap h-auto), centered rows, no row gap, 16px icons
with gap-2 per category.

**Profile identity card (R10-M):** 96px gradient circle + 64px
circle-user ICON (not initials), h2 text-2xl, email mb-3, Change Photo
below the email, role badge pinned right (vertically centered).

**EmptyState mb-4 (systemic):** the icon wrapper carries mb-4 — every
empty state had been 16px short (re-measured on payroll AND loans).

**CardTitle recipes:** border-b CardHeader titles are `leading-none`
(16px); regular in-card titles keep text-base (24px — the dashboard
pattern). Pass `className="leading-none"` at border-b call sites.

**Palette addendum:** `--color-cyan-700: #0e7490` pinned (the attendance
Devices button is cyan-700, not teal-700 — wrong family AND unpinned
oklch drift).

## 24. Session-12 Recipe Layer — parity round 11

**Sidebar footer (R11-A):** `p-4 gap-2 border-t border-slate-200
dark:border-slate-800` container (255×121) — a left-aligned cluster, never
justify-between. Row 1 (`gap-2 mb-2`): Bell + Moon ghost h-9 w-9 (36×36,
16px svg) + عربي outline h-8 px-3 text-xs font-semibold min-w-[64px]
(80×32). Row 2: ghost h-9 px-4 py-2 w-full justify-start gap-3 user
button — 36px sRGB-gradient circle avatar (16px CircleUser icon) +
`flex-1 min-w-0 text-left` name (text-sm font-medium) / email (text-xs
slate-500) column. The mobile drawer footer is the SAME recipe
(255×36@792, 1px documented rounding).

**EmptyState two refinements (R11-B/C):** the description P carries mb-4
ONLY when an action follows (call sites pass `descriptionClassName`);
the new `iconChip` variant renders a 64px bg-slate-100 rounded-full circle
with a 32px slate-400 icon (templates) instead of the bare 64px icon.
Companywall's feed stack is space-y-6.

**Systemic table recipe (R11-V):** th `text-left py-3 px-4 font-medium
text-slate-500` (45px @ 20px text — the old h-10 px-3 was 40px); empty-row
td `py-12 text-center text-slate-400` colSpan (117px). Both live in
`ui/table.tsx` — every data table inherited them.

**documenttracker (R11-D):** 80px horizontal stat tiles (`p-4 flex
items-center gap-3`, 44px colored chip, text-2xl value + text-xs label,
`border-0 shadow-sm`); filter row = search input + 5 lowercase
`capitalize` chips (Tabs removed); bare empty = p-6 py-16 + 48px icon
mb-3 + single P (no h3).

**DIV-title border-b headers (R11-E/F/G/H/I):** expenses, leavemanagement,
allleaverequests, payroll and payrollmodule render `p-6 border-b` card
headers with a plain DIV title (not CardTitle); payroll/payrollmodule get
standalone `border-0 shadow-sm` search-toolbar cards. Leavemanagement /
allleaverequests empties: `p-6` content + `py-12` inner + 64px icon
mx-auto mb-4 + single P. Payroll's empty KEEPS its CTA (re-measured).

**evaluations (R11-N):** tablist `w-full max-w-lg mx-auto grid
grid-cols-3` (167px equal triggers — grid-cols, not flex); the stat row
renders INSIDE the active tab below the tablist; tiles are value-in-tile
(74px, text-2xl over text-xs); empty `py-10 text-center text-slate-400`.

**employees zero-render (R11-O):** at 0 employees the reference renders
NOTHING below the filter row — no table, no empty state (the Add Employee
affordance stays in the page header + the wizard).

**communications (R11-P):** channel cards centered p-8, 64px icon + h3 +
P, NO button; grid `gap-6 md:grid-cols-3`.

**analyticsdashboard (R11-R):** content sits DIRECTLY in the canvas (no
max-w-7xl wrapper); full-width vertical stack: 166px stat row → full-width
area chart (260px) → 2-col bar/line (240px) → 3-col pies (220px) →
full-width line; chart-card titles are text-base (24px); all 5 status
chips render at zero counts; charts render UNCONDITIONALLY.

**Chart-page heights (R11-U):** hrreports 320px chart + a data-table
card; attendancedashboard 260px; advancedanalytics 300px; surveyanalytics
rows separated by a 24px gap. R11-page cards carry `border-slate-200` +
`shadow`. No EmptyState gating on any chart page.

**securitysettings (R11-S):** plain `p-4 bg-slate-50 rounded-lg` rows
(switch + label + description inline, no Card furniture) + compact
recommendation rows; the danger-zone alert keeps its p-6 wrapper.

## 25. Session-13 Recipe Layer — parity round 12

**notificationpreferences (R12-A):** stat tiles 86px — `mini-centered`
with `labelClassName="text-xs text-slate-500"` (16px line) + per-tile
value colors (Unread red-500, Total blue-600). Card headers title-only.
Preference rows `flex items-center justify-between py-3 border-b
last:border-0` (61px) with a `flex items-center gap-3` cluster: 32×32
icon chip (`p-2 bg-slate-100 rounded-lg`, 16px icon) + text column (p
text-sm font-medium text-slate-800 + p text-xs text-slate-500). Save row
`pt-2 flex justify-end` (44px) with an iconed button (Save mr-2, 185×36).
The recent-notifications empty is the SIMPLE recipe: `text-center py-8
text-slate-400` + 32px icon mb-2 + one text-sm P — no EmptyState, no h3.

**hrreports (R12-B/C/D/G):** the toolbar is `grid grid-cols-2
md:grid-cols-4 lg:grid-cols-6 gap-4` of BARE field divs — an inline
`<label class="text-xs text-slate-500 font-medium">` + newline
whitespace + mt-1 control replicate the reference's 64px line-box
stacking (a flex wrapper changes the height — do not use one). The
header subtitle is FLUSH under the h1 (`subtitleClassName="mt-0
text-slate-500"`, 52px title block) — hrreports is the exception; the
other md-size pages keep mt-1. Actions cluster `flex gap-2` with mr-2
iconed Export buttons (145/144px). Stat values blue-600/orange-500/
purple-600 with text-slate-500 labels. The data table keeps the card's
horizontal padding (`p-6 pt-0` — no full-bleed px-0).

**analytics (R12-E)** — distinct from analyticsdashboard: stacked stat
tiles (the `tile-right` variant: label text-sm slate-500 on top, value
text-3xl bold mt-2, hint text-xs slate-500 mt-2, 48×48 tile top-right;
138px cards) in `grid md:grid-cols-4 gap-6`; chart cards with border-b
headers (DIV `font-semibold leading-none tracking-tight`, no
description) + p-6 content with 300px charts in `grid lg:grid-cols-2
gap-6` (548px tiles); Onboarding Summary = `grid md:grid-cols-3 gap-8`
plain text stacks (label text-sm slate-500 mb-2 + value text-2xl bold,
slate-900/green-600/indigo-600); charts render UNCONDITIONALLY.

**staffrequests (R12-F):** the My Requests trigger is `px-3 py-1`
(137px in the 145px pill) — not h-7 px-4; no self-start on the pill.

**Component prop additions:** PageHeader `subtitleClassName` +
`actionsClassName` (defaults unchanged); StatCard `labelClassName`
(tile-right renders its own hint — the generic one is skipped for it).

## 26. Session-14 Recipe Layer — parity round 13

**Iconed-button margins (R13-A, the round's core find):** the reference's
iconed buttons carry `mr-2` on the svg on top of the button's `gap-2`
(16px effective icon-text gap; `mr-1` = 4px on some in-card buttons).
Ten call sites were missing it (employees Import CSV, payroll Reports &
Export, payrollmodule Generate All, taskmanager New Project/Kanban/
Projects, documenttracker Run Alert Check, surveyanalytics Run AI
Analysis, analyticsdashboard Export CSV/PDF, attendancedashboard Export
Report + in-card Export, advancedanalytics Schedule Report — which is
the DEFAULT gradient variant, not outline).

**Tab pills:** two recipes — `bg-muted` (staffrequests) vs `bg-white
border border-slate-200` (settings 971px / profile 507px / attendance
471px / compliance 331px — the default SHRINK-WRAPPED TabsList). Tab
roots are `space-y-6` with every TabsContent `mt-0`: the default `mt-2`
STACKS with the pill's 24px margin-block-end (inline-flex margins don't
collapse — the trap behind several 8px tab-content offsets).

**Tab trigger icons:** settings/profile = `h-4 w-4 mr-2` (no gap);
attendance = trigger `gap-2`, 16px svg, no margin; compliance = trigger
`gap-1`, 12px svg. Lucide icons default to 24px — always size them.

**Field line-box stacking (generalized R12-B lesson):** bare
`div.space-y-2` (payrollengine adds `leading-5`) > INLINE label
(text-sm leading-none) + control with `mt-2`. The inline label's line
box provides the 4px top offset; margins on the inline label are
ignored. Profile fields 68px, payrollengine 64px, reports filters 68px.

**settings:** 7 iconed tabs; Company card = border-b title-only header +
iconed h-9 Edit + `grid md:grid-cols-2 gap-6` of p-4 read-only tiles
(label `text-sm text-slate-500 mb-1` + value `font-medium`); 631px.

**profile:** exactly 4 iconed tabs (no User tab, default general);
General tab = border-b DIV-title + p-6 form (`grid md:grid-cols-2 gap-6`
68px fields + `flex justify-end` iconed Save INSIDE the form — no
CardFooter).

**attendance stat tabs:** Mark Attendance / Employee Summary / Records;
non-admins get the access-restricted recipe (64px `bg-red-100
rounded-full` chip, `py-16` centering, `max-w-sm` copy).

**compliancedashboard:** text-only header CTA; tab content = 90px
mini-centered stat row + `flex flex-wrap gap-2` notify row (mr-1) +
`flex flex-wrap gap-3 p-4` toolbar (bare search svg, w-48 input, two
w-36 selects, ml-auto counter) + title-only p-3-header table card with
the 180px systemic empty.

**reports:** one card per category (border-b header with a 20px-iconed
leading-none title) wrapping `grid md:grid-cols-2 lg:grid-cols-3 gap-4`
of 346x126 p-4 tiles (two-line H3 mb-3 + two flex-1 iconed 152x32
buttons); Report Filters card = `grid md:grid-cols-4`.

**offboarding:** `grid md:grid-cols-2 lg:grid-cols-3` with the empty
state as ONE `col-span-full` 238px card (no CTA — the affordance is the
header button). **surveys:** zero-render — nothing below the stat row at
0 surveys.

**StatCard no-tile variant:** `flex items-center justify-between` —
text stack (value `text-3xl font-bold mb-1`) left + bare 40x40 icon
right (per-page blue/green/orange/purple-500); 108px.

**taskmanager:** columns always render their empty `space-y-2` list
container (60px empty columns); count badge is a DIV.

**shiftcalendar:** chevrons + month label in their own `gap-2` cluster
inside the gap-4 toolbar; Shift Swaps is an ANCHOR (asChild,
href="/ShiftSwap") opening the superset dialog.

**hrreports:** Group By select defaults EMPTY (useState("") +
placeholder=""); Status Filter shows All.

## 27. Session-15 Recipe Layer — parity round 14

**recruitment:** the tab pill is the WHITE shrink-wrap recipe
(`bg-white border border-slate-200`, 439px) — not `bg-secondary`; the
first two triggers carry 12px lucide icons with `gap-1` (Users 190,
Sparkles 131 — the compliance trigger recipe); Job Postings icon-less
(108).

**training:** the category chip row is `role="group"` — a tablist whose
children are aria-pressed toggle buttons is INVALID ARIA (REF renders a
plain div). The Training Platforms h2 row renders EMPTY (32px — REF has
no create affordance anywhere on the page); the superset CTA lives below
the empty-state line (loans-recipe) and the with-data grid carries a
trailing dashed Add Platform tile.

**performancemanagement:** white pill (296px).

**staffrequests:** the My Requests pill sits in a PLAIN BLOCK wrapper —
NEVER a `flex flex-col` child. Cross-axis `align-items: stretch` blows
the inline-flex pill to 1120px and `justify-center` centers the trigger
at x=779; REF renders pill 145px@288 with the trigger at x=292 inside
the Radix Tabs root (an unclassed BLOCK div). **Lesson: prior rounds
compared w×h only — always pin X positions too.**

**profile:** the Language/Timezone card belongs to
`TabsContent value="preferences"` — a copy-paste value="general" stacked
it under the General form (6 fields) and left the preferences tab empty.
General keeps exactly the 4 reference fields (Full Name/Email/Phone/Job
Title, 68px line-box); Change Photo carries `type="button"`.

**compliancedashboard:** the three Notify All buttons render at
`size="sm"` (h-8, 32px, px-3, text-xs) with mr-1 icons — 166/173/173.

## 28. Session-16 Recipe Layer — parity round 15

**Tab-pill inactive color (R15-A, systemic):** the reference's inactive
tab triggers render its `--muted-foreground` TOKEN **#737373**
(rgb(115,115,115) — pinned as `--color-neutral-500` in the palette).
`ui/tabs.tsx` TabsList, the reports selector pill and the staffrequests
pill all carry `text-neutral-500`. The muted-foreground TOKEN itself
stays #64748b — the session-6 "token never visibly renders" claim was
wrong for TAB surfaces only (300+ other usages render REF's explicit
slate classes). **Lesson: a token claim is per-surface, not global —
re-probe after component rebuilds introduce new token consumers.**

**Sidebar footer colors (R15-B):** Bell ghost = slate-600
(rgb(71,85,105)), Moon ghost = zinc-700 (#3F3F46 — pinned
`--color-zinc-700`), user name = zinc-700 (NOT the session-6 slate-900 —
that reading is stale; the reference redeployed). Same component renders
the desktop sidebar AND the mobile drawer footer.

**Actions-cluster fitting (R15-C):** NO `shrink-0` on the PageHeader
default actions cluster. A shrink-0 flex child keeps its natural width
(911px on attendance) inside the wrapping header row and overflows the
page at mid viewports (docW 1199 at 1100) instead of letting the
cluster's own flex-wrap wrap its buttons. Shrinking only engages under
constraint — fitting pages render identically.

**organogram (R15-D):** a BARE centered card (NO CardHeader) inside
`overflow-x-auto pb-8` > `min-w-max flex justify-center p-8` (wide org
trees scroll horizontally); the empty state is the SIMPLE recipe — 64px
slate-300 icon mb-4 + ONE 16px slate-500 line (card 783×202@228, icon
y=277, line y=357).

**staffrequests (R15-E):** the pill renders `bg-secondary` (#F5F5F5 —
REF's rgb(245,245,245) surface), NOT bg-muted (slate-100); the default
scope is `"mine"` — the trigger renders the reference's SELECTED look
(white bg + #0A0A0A + shadow) at load. The toggle-to-all remains the
superset.

## 29. Session-17 Recipe Layer — parity round 16

**StatCard tile: flex-centered, never padded (R16-D, systemic):** REF's
48×48 tile computes `padding: 0` — `flex h-12 w-12 items-center
justify-center rounded-xl` with the 24px svg centered by flexbox. A `p-3`
tile's min-content is 48 (padding + svg) so it can NEVER flex-shrink; the
flex-centered tile's min-content is the bare 24px svg and it shrinks
48→24 (and to odd widths like 26px @1024) under constraint, exactly like
REF. Measured byte-exact on /analytics @768: tile 24px@749, pad 0, svg
24@749 both sides (LOC docW 797→773; REF's 768 is its overflow-auto
wrapper clamping the body scroll). compact (h-10 w-10) and horizontal
(h-11 w-11) tiles were already flex-centered — only standard/tile-right
carried p-3. **Lesson: read the reference's COMPUTED padding, not just
the box size — identical 48×48 geometry can hide a different
shrink story.**

**workflowautomation zero-render (R16-B):** at 0 workflows REF renders
NOTHING below the stat row (content wrapper 306px = header + stat row
only — the employees/surveys zero-render pattern). The create affordance
is the header CTA (actionsStart — the offboarding R13-G pattern). The
loading spinner stays (transient functional superset).

**chat zero states (R16-C):** the sidebar renders `div.p-8.text-center`
(319×144) with a 48px `MessageCircle` (`mx-auto mb-3 text-slate-300`)
+ ONE `p.text-sm.text-slate-500` line "No conversations yet" — never the
h3 EmptyState. The right pane renders a BARE `flex flex-1 items-center
justify-center` (NO p-8) wrapping `div.text-center` with an 80px
`MessageCircle` (`mx-auto mb-4 text-slate-300`) + h3 + p (156px content
@340, h3 @436). The conversation-list container is a bare `flex-1
overflow-y-auto` — the with-data rows carry their own px-2 pb-4.

**surveys Avg Sentiment (R16-A):** the 4th stat value renders "0%" at
zero surveys — the number stays (never a bare "%").

**employees filter-row fitting (R16-E):** the search shrinks under
constraint — wrapper `relative flex-1 md:flex-initial` (no grow, natural
basis, shrink allowed) + input `w-full md:max-w-64`. At 1440 the input
renders the pinned 256px; in the 768–815 band it shrinks so the row
(search + native select + view toggles) fits the 448px content area
(docW 796 → 768). REF overflows the same row (849 — its own bug); the
clone fits (the documented fitting-superset family).

**Tablet-band audit (768/900/1024 — session_25's frontier):** REF's own
overflow family lives in its `flex-1 overflow-auto` wrapper (attendance
1558, settings 1291, employees 849, payroll 861, taskmanager 847,
hrreports 893, recruitment 838, leavemanagement 789, profile 827, chat
773 at 768) — its inner scroll keeps the BODY at viewport width. Pills
never wrap (settings 971px / profile 507px overflow identically on REF).
The hrreports 900–1024 band is REF's 1px knife-edge (title + cluster
fill the row exactly, no gap) where the clone's wrapped cluster +
gap-4 row shifts the h1 4px — documented fitting-superset, 1440
byte-identical.

---

## 30. Session-18 Recipe Layer — parity round 17

Everything below was live-measured against the reference (settled dual
agent-browser probes; `docs/remediation-plan-session18.md`) and is
regression-pinned by `tests/unit/shell-recipes.test.ts`.

**Header row breakpoint (R17-A — the per-page taxonomy):** REF's
default-family header rows switch `flex-col → flex-row` at **md (768)**
(`flex flex-col md:flex-row justify-between items-start md:items-center
gap-4`); the clone's PageHeader row switched at sm (640) — a never-audited
640–767 band diff (the band fell between the 390 mobile audits and the 768+
tablet sweeps). Nine pages render REF=column (title full-width, actions
BELOW) vs LOC=row in that band — payrollmodule, documenttracker,
recruitmentkanban, assetmanagement, attendance, recruitment, shiftcalendar,
staffrequests, attendancedashboard — they pass `rowBreakpoint="md"` (the
prop; default `"sm"` renders the previous byte-identical classes). REF is
per-page inconsistent: templates + workflowconfigpage are UNPREFIXED
always-rows (`flex items-center justify-between mb-8|mb-6`) and the
actionsStart family is always-row (`flex justify-between items-start`) —
those KEEP the sm default (row at 640–767; column below = the fitting
superset where REF overflows: docW 422–456 at 390). attendance's R9-E
fitting wrap follows the row: `md:flex-wrap`.

**Profile kicker back button (R17-B — the always-pin-X lesson):** REF's
/profile kicker is a distinct variant: a leading **36×36 ghost ArrowLeft**
(`h-9 w-9`; the svg carries `w-5 h-5` classes but renders 16px — the
button base's `[&_svg]:size-4` descendant selector wins on BOTH apps) at
(32,105) navigating to /Dashboard, + a `text-xs text-slate-500 truncate`
subtitle "Manage your account" — row 44px, kicker **69px** (vs the
standard 53px h1-only recipe). The other seven kickers carry neither the
button nor the subtitle (byte-identical sweep). The clone renders
`mobileKickerBack` (a ghost Button asChild wrapping a Link to the
casing-fixed `/dashboard` — documented deviation) + `mobileKickerSubtitle`.
The h1's Y had been pinned since session 5; its X (32 vs 80) never was —
a missing ELEMENT hid behind an unmeasured axis.

**640–767 band audit lessons:**

- Settle ≥2.2s before reading REF mobile geometry — the 61px top-bar
  mid-hydration artifact also produces 12px h1 y-deltas and phantom h=80
  "wraps" (settled re-probes match byte-for-byte).
- REF's hrreports renders **BLANK below ~768** (only the Base44 badge at
  390 and 700; works at 900+) — its own dead-mobile bug; the clone's
  working page is the superset (the /employeeselfservice family).
- **Print stylesheets:** ZERO `@media print` rules on either side — the
  new parity dimension (session_26's suggestion) audited clean.
- The documenttracker @390 cluster is a **0.23px knife-edge**: buttons
  byte-identical (Run Alert Check 178.14 + gap 12 + Add Document 168.09);
  REF's row is 358.23 (invisible overflow — its own bug) so both buttons
  fit one line; the clone's exact 358.00 wraps Add Document. Same family
  as the r16 hrreports 1px knife-edge.
- REF's tablet overflow family extends: analyticsdashboard 975@768,
  assetmanagement 879, attendancedashboard 832, documenttracker 901,
  organogram 1135–1167, payrollmodule 744@390 / 1032@768+,
  recruitmentkanban 1376@700 / 1664@768, shiftcalendar 988–1020,
  attendance 943–1199, chat 741, compliancedashboard 707 — the clone fits
  (fitting superset).

## 31. Session-19 Recipe Layer — parity round 18 (the interaction dimension)

The first keyboard/focus-ring audit: real Tab presses through both apps,
full computed outline + box-shadow dumps at every stop. **Tab traversal
ORDER is byte-identical** on every swept surface (/dashboard desktop 12
stops + mobile 10, /login 8, /employees 10 — same elements, same
sequence, same x/y). The ring RECIPES were not — seven gap groups:

- **The button recipe (R18-A, systemic)**: REF's buttons (all variants —
  hamburger, عربي, user, Import CSV, Add Employee, Edit) render
  `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`
  — a **1px #0A0A0A ring with NO offset**. The older shadcn
  ring-2 + ring-offset-1 base rendered 3px total. The Button base and the
  Radix select trigger both carry the recipe now (R18-F).
- **The sidebar ring is BLUE (R18-C)**: leaf links, group buttons AND
  sub-items focus with `focus-visible:ring-2 focus-visible:ring-sidebar-ring`
  — REF's `--sidebar-ring` token (217.2 91.2% 59.8% = **blue-500
  #3B82F6**, rendered rgb(59,130,246)), NOT the dark global ring. The
  token lives in globals.css next to the sidebar family.
- **Inputs/Textareas (R18-B)**: `ring-2 ring-ring ring-offset-2` — the
  offset is 2 (white 2px + ring 2px), never 1.
- **Tab triggers + switches**: `ring-2 ring-ring ring-offset-2` (4px
  total) — TabsTrigger gained the offset (R18-G); the switch already had
  it (measured byte-identical).
- **The login page scope (R18-E)**: REF redefines `--ring: 240 10% 3.9%`
  (zinc-950 #09090B) on the login page — the Sign in ring is
  `focus-visible:ring-[#09090b]` (arbitrary value, the gradient-pin
  pattern), and the email/password inputs carry the page pair
  `focus:border-slate-400 focus-visible:ring-slate-400`.
- **The same-variant tailwind-merge lesson (v4)**: a page-level
  ring-COLOR override must use the SAME variant as the base
  (`focus-visible:ring-slate-400`, not `focus:ring-slate-400`).
  tailwind-merge only dedups conflicting utilities within one variant;
  across variants both survive and the base's `focus-visible:ring-ring`
  wins the v4 cascade (focus: is emitted before focus-visible:). The bare
  focus: variant silently renders the wrong color.
- **The mobile hamburger (R18-D)**: a bare button needs the recipe added
  manually (it is not a Button component).
- **Browser-default outlines are parity**: bottom tabs, quick-action
  links, "View all" links and login socials carry NO custom focus classes
  on either app — both render the browser's `auto 1px` outline. REF
  serializes its color `rgba(10,10,10,0.5)`, the clone `lab(2.74 …/0.5)`
  — the SAME dark-50% color in different color spaces; visually
  identical, not fixable (Chrome derives it). The
  browser-auto-serialization family.

**Sub-390 band (320–389) — swept clean (the final unswept viewport band)**:
settled probes byte-identical on the fitting pages (kicker h1 = vw−64
exactly); every residual diff is REF's own overflow family extended below
390 (attendance 943–1199, settings pill 1003–1259, shiftcalendar 732–988,
recruitmentkanban 1376–1632, documenttracker 390–646, payroll 344@320,
profile 539) where the clone fits or overflows less (attendance 487,
settings 987, profile 523, documenttracker 348). **Settle lesson: REF
needs ≥5s at odd sub-390 widths** — 2.4s captured the 61px mid-hydration
state at 344/389 (the artifact family extends below 390; settled re-probes
match byte-for-byte).

## 32. Session-20 Recipe Layer — parity round 19 (the hover dimension)

The first systematic hover/active-state audit: real agent-browser hovers
(CDP mouse moves trigger the true `:hover` pseudo-class) with full computed
style dumps at rest AND settled-under-hover on both apps, across 24
surfaces (sidebar chrome, footer ghosts, quick chips, CTAs, tabs, inputs,
login page, mobile chrome, dropdown items).

**The probe trap (pin this):** Tailwind v4 wraps every `hover:*` utility in
`@media (hover: hover)` — the headless probe browser reports hover:none, so
v4 hover styles NEVER apply in agent-browser while REF's v3-era (unwrapped)
rules do. `Emulation.setEmulatedMedia` cannot override the `hover` feature.
**Fix: a probe-side polyfill** — extract every rule inside
`@media (hover: hover)` and re-inject verbatim into a second
`@layer utilities` style block (scripts/probe-r19-hover2.mjs). On touch
devices REF keeps sticky hover and the clone does not — v4's intended a11y
behavior; engine difference, do not clone.

**The settled-read lesson:** REF's `transition-all duration-200` means a
~750ms post-hover read catches mid-flight values (bg alpha 0.086, opacity
0.983). Settle **>= 2s** before reading hover states.

**The styled-element lesson (L2 again):** REF's dashboard quick chips style
an INNER `<div>` of a class-less `<a>` — measuring the anchor showed "no
hover change". Verify which element carries the classes before concluding.

**The recipe taxonomy (all measured):**

| Surface | REF recipe | Rendered |
|---|---|---|
| Sidebar leaf + sub-item (inactive) | `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:opacity-80` | zinc-100 #F4F4F5 + #18181B + 0.8 |
| Sidebar ACTIVE leaf | same + text flips #18181B (custom-primary-bg beats the hover bg — stays blue) | blue tile, dark text, 0.8 |
| Sidebar group button | `hover:bg-blue-50 hover:text-blue-700` | blue-50 + blue-700 (no opacity) |
| Footer ghost (bell/moon) | `hover:bg-accent hover:text-accent-foreground` | #F5F5F5 + #171717; bell SVG owns text-slate-600 (survives hover) |
| عربi outline | `hover:bg-slate-100 hover:text-accent-foreground` | slate-100 + #171717 |
| User trigger | `hover:bg-slate-100` + name span `text-slate-900` | slate-100; name rgb(15,23,42) |
| Import CSV (blue outline) | outline + `border-blue-300 text-blue-700 hover:bg-blue-50` | blue-300 border, blue-50 hover |
| Default outline (Edit/New Project/Generate All) | `hover:bg-accent hover:text-accent-foreground` | #F5F5F5 + #171717 |
| Dark toggle (Kanban) | `hover:bg-[#171717]/90` | rgba(23,23,23,.9) — clone serializes lab(), same color |
| Gradient CTA (Add Employee) | darker gradient on hover | #1D4ED8→#4338CA (clone: 90deg vs REF to-right serialization, same direction) |
| Login socials | `hover:border-slate-300 hover:bg-slate-50` | slate-50 + slate-300 |
| Login Sign in | `bg-slate-900 hover:bg-slate-800` + `shadow-sm` | slate-800 + 0 1px 2px rgba(0,0,0,.05) |
| Login forgot/signup | `hover:text-slate-700` ONLY (no underline) | slate-700, no underline |
| Menu items (BOTH incl. Logout) | `focus:bg-accent focus:text-accent-foreground` | #F5F5F5 + #171717 (red Logout turns dark) |
| Mobile hamburger | inherit fg + `hover:bg-slate-100 hover:text-accent-foreground` | #0A0A0A rest, slate-100 + #171717 |
| Mobile bottom tabs | NO hover classes | no change |
| Tab triggers / search inputs / staffrequests trigger / quick chips | no hover change (chips: `hover:border-blue-300 hover:bg-blue-50` on the inner div) | — |

**Spec count:** 386 unit (recipes 249, tokens 19, auth 14, utils 13,
shell-recipes 76, db-path 15) + 86 E2E at the time of §32; §33 raised it
to 391 unit (recipes 254). Placeholder detail: REF uses three
ASCII dots ("Search requests..."), never U+2026.

## 33. Session-21 Recipe Layer — parity round 20 (the pressed dimension)

The first `:active` (pressed-state) audit — the "missing mousedown-hold
tooling" from the session-32 frontier note turned out to exist:
agent-browser's `mouse move <x> <y>` / `mouse down` / `mouse up` are real
CDP Input events, so the probe holds the true pressed state. **The
click-safe protocol: move the pointer away BEFORE `mouse up`** — releasing
over the element fires a real click (the first draft toggled REF's عربي to
"EN" and expanded sidebar groups mid-probe).

**Engine discovery:** Tailwind v4 does NOT media-wrap `active:` variants —
only `hover:*` rides inside `@media (hover: hover)` (verified again in the
built CSS: 90 wrapped hover rules, zero wrapped active rules). Active
rules are bare on both sides, so they apply in the probe browser and on
touch devices directly.

**The pressed taxonomy (all measured settled under hold):**

| Surface | REF pressed | Clone recipe |
|---|---|---|
| Sidebar group button (collapsed) | zinc-100 #F4F4F5 + #18181B (active: beats the blue hover in v3 rule order) | `active:bg-[#f4f4f5] active:text-[#18181b]` (v4 emits active: after hover:) |
| Sidebar group button (EXPANDED) | hover = zinc-100 + #18181B via `data-[state=open]:hover:` — a SECOND hover recipe (r19 probed collapsed only) | `data-[state=open]:hover:bg-[#f4f4f5] data-[state=open]:hover:text-[#18181b]` |
| Inactive leaf + sub-item | zinc-100 + #18181B + 0.8 (rides hover; the authored active: pair also present) | `active:bg-[#f4f4f5] active:text-[#18181b]` added (recipe parity + the tap-press moment) |
| ACTIVE leaf | bg STAYS blue #1877F2 (unlayered custom-primary-bg beats utilities) + text #18181B | `active:text-[#18181b]` ONLY — a documented deviation: the clone's bg-primary is a v4 UTILITY that would LOSE to an active:bg variant ((0,2,0) vs (0,1,0)), so the bg-keeping behavior is preserved by omission |
| Active mobile bottom tab | `bg-blue-50` pill (rgb(239,246,255), pixel-verified — a visible gap every prior round missed: the mobile audits compared label color/geometry but never the tab's own background) | `active ? "bg-blue-50 text-blue-600" : ...` |
| Everything else (CTAs, outlines, ghosts, menu items, login, hamburger, inactive tabs) | FLAT (no active: classes on either app) | unchanged |

**Polyfill v2 (probe tooling):** the r19 hover polyfill appended a second
`@layer utilities` block at the END of `<head>` — which moved the hover
rules AFTER the active: rules and broke the pressed-state cascade UNDER
THE PROBE (on real desktops the original order stands and active: wins).
v2 fetches each same-origin stylesheet, brace-matches every
`@media (hover: hover)` block, splices out the wrappers, and REPLACES the
`<link>` with a `<style>` at the same DOM position — rule order preserved
exactly. Also: `//` comments inside a flattened one-line eval break it
(the r16 lesson) — use `/* */` inside injected browser JS.

**v4 registry noise:** the built CSS carries six UNUSED `active:*` utility
rules (translate-y-0, scale-95, scale-[0.98], cursor-grabbing,
bg-blue-800, shadow-none) generated from scanned library content — only
`active:cursor-grabbing` is authored (taskmanager). Not gaps.

**Spec count:** 391 unit (recipes 254, tokens 19, auth 14, utils 13,
shell-recipes 76, db-path 15) + 86 E2E.

## 34. Session-22 Recipe Layer — parity round 21 (the motion dimension)

The first transitions/animations audit. Method: static CSSOM enumeration
(every `transition-*`/`animation`/`@keyframes` rule on both apps), DOM
classList audit (which elements carry the classes), and empirical
requestAnimationFrame frame-sampling of live transitions (hover fades,
drawer slides, dropdown/dialog enter).

**Engine discovery — the dead plugin-utility trap:** Tailwind v4 generates
NO CSS for tailwindcss-animate plugin utilities (`animate-in`, `fade-in-0`,
`zoom-in-95`...). The shadcn components carried the exact classes REF uses,
but the built output had ZERO animation rules — every dialog, dropdown and
select snapped open while REF computed `animation: enter 0.15s ease`. The
v4-native fix is a hand-authored subset in globals.css: `@keyframes
enter/exit` reading `--tw-enter-*`/`--tw-exit-*` custom properties with
unit fallbacks, plus `@utility` blocks for each class. NO `initial`
custom-property resets (the v3 plugin's cascade-order trick): every
animated surface in this app is portal-mounted, so custom-property
inheritance cannot leak between overlay/panel/content.

**The mount-fresh Radix trap:** a Radix Portal Content that renders only
when open mounts with `data-state="open"` already applied — `transition-*`
classes can never fire (a transition needs a state change on a live
element). Animations run from mount, so `animate-in` + `slide-in-from-left`
works where `transition-transform data-[state=open]:translate-x-0` was
silently dead. On close, Radix waits for `animationend` before unmounting —
the exit animation plays too (frame-verified: ~305ms slide + ~170ms fade).

**The motion taxonomy (measured):**

| Surface | REF | Clone recipe |
|---|---|---|
| Dropdown/dialog/select content | `enter 0.15s ease` (fade-in-0 + zoom-in-95) | `data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95` + the @utility block |
| Mobile drawer panel | slide 500ms open / ~300ms close, cubic-bezier(0.32,0.72,0,1) (vaul) | animate-in/out + slide-in-from-left/out-to-left + `data-[state=open]:[animation-duration:500ms] data-[state=closed]:[animation-duration:300ms] [animation-timing-function:cubic-bezier(0.32,0.72,0,1)]` |
| Mobile drawer overlay | fade ~150ms both ways | animate-in/out + fade-in/fade-out (the 0.15s @utility default) |
| Sidebar nav (leaves, sub-items, GROUP buttons) | `transition-all duration-200` (settles ~269ms) | the group trigger's old `transition-colors` (150ms, ~229ms) corrected to the full recipe |
| Group chevron | NO motion classes — instant snap | the clone's 200ms swing removed (an extra REF never renders) |
| Quick chips / footer buttons / bottom tabs / Input / TabsTrigger | `transition-colors`/`transition-all` 150ms | already byte-identical |

**Dormant REF CSS (documented non-gaps):** the sidebar collapse family
(`transition-[width]` / `[left,right,width]` / `[margin,opacity]` +
duration-200 ease-linear — shadcn sidebar internals with NO trigger at
desktop), accordion-down/up + data-motion animate rules (REF's group expand
is INSTANT — height 728→516 in one frame), base44-fade-in/scale-in
keyframes (no navigation animations fire), badge-spin, and
prefers-reduced-motion (REF's only rule is sonner-library internal — no
app-level recipe exists to mirror; the a11y item stays open on both apps).

**Probe lessons:** agent-browser eval does NOT await Promise-based
expressions — park results on `window.__x` and read them in a follow-up
eval. Snapshot refs need attribute-tolerant regexes
(`\\[[^\\]]*ref=(\\w+)` — `[expanded=false, ref=e44]`). `$`-prefixed
passwords expand to empty in double-quoted shell fills — single-quote them.
Drawer-close needs Escape or a real pointerdown (the Radix overlay ignores
synthetic `.click()` — no pointerdown event). Animations are NOT
media-wrapped (unlike v4 `hover:`), so the probe browser applies them
natively — no polyfill needed for the motion dimension.

**Spec count:** 398 unit (recipes 261, tokens 19, auth 14, utils 13,
shell-recipes 76, db-path 15) + 86 E2E.

## 35. Session-23 Recipe Layer — parity round 22 (the scroll dimension + the dialog surface)

The first scroll audit. Method: static CSSOM enumeration of every
scroll-relevant rule on both apps (the walker must recurse `@layer` blocks —
v4 wraps everything; constructor-agnostic `.cssRules` walking, not type
numbers) + live DOM census of elements whose computed scroll styles differ
from defaults + empirical scrolling (real `scrollTo` + settled reads) + a
full 46-route docH sweep.

**The scrollbar contract (R22-A):** the reference authors ZERO scrollbar
rules — every scroll container computes `scrollbar-width: auto`. The clone's
session-1 `.scrollbar-thin` (6px slate-300 rounded thumb, both the standard
property pair and the `::-webkit` pair) was deleted from globals.css, the
sidebar nav, and the dialog content. Never re-introduce scrollbar styling.
A dead `.scrollbar-thin` rule may appear in BUILT css — v4 generates core
utilities from scanner hits on comments/test literals (registry noise, same
family as `.scroll-mt-24`); no element carries the class.

**The v4 trailing space-y margin (R22-B — trap 6's sibling):** v4's
`space-y-*` emits `margin-block-end` on `:not(:last-child)`; the ACTIVE
TabsContent followed only by `display:none` Radix siblings kept mb-24,
leaving 24px dead space below tab cards (measured /settings docH 943 vs REF
919 — the v3 `margin-top on * + *` model never trails). Fix: `mb-0!` on the
TabsContent base (`ui/tabs.tsx`) — the important flag beats the space-y rule
unconditionally; the pill's own mb-24 keeps the pill→card gap. Alternative
pattern: `flex flex-col gap-6` (gap ignores display:none children —
`reports-browser.tsx` is the in-codebase precedent).

**The loans dialog recipe (R22-C):** 672px `max-w-2xl`, H2-only header (REF
renders NO description), `space-y-2` field rows, the ALWAYS-rendered
Requesting-for card (`p-4 bg-blue-50 rounded-lg` > `flex items-center gap-3
mb-3` > 20px user icon + the 2-line stack: `text-sm text-slate-600` label +
`font-semibold text-slate-900` name with the "Select employee" placeholder),
`grid grid-cols-2 gap-4` of Loan Type / Amount (SAR) / Duration (Months) /
the read-only Monthly Installment (`p-2.5 bg-slate-100 border
border-slate-200 rounded-md text-center` rendering "SAR 0.00" — prefix + 2
decimals, NOT `formatSar`'s suffix form), Reason `min-h-[60px]`, Paid From,
`flex justify-end gap-3` actions (Cancel + Submit Request). Schema: Loan
gained `loanType` + `paidFrom`; the API validates a 4-value enum; the table
gained the Type column.

**Two per-page table recipes (R22-E/F):** hrreports th = `px-3 py-2
text-left text-xs font-semibold text-slate-600 uppercase` (33px) with
LOWERCASE DOM texts uppercased by CSS; at 0 records the table renders the
HEADER ROW ONLY (no empty state — 139px card). attendancedashboard th =
`text-left py-2 px-3 text-slate-500 font-medium` (37px, ALL columns
left-aligned); at 0 rows the header-only table + a bare
`text-center text-slate-400 py-8` P "No employees found for selected
filter." as the table's SIBLING (not a td, not the EmptyState component).
The systemic 45px `py-3 px-4` recipe still governs the other tables —
tables are NOT one-recipe-fits-all; measure each surface.

**Compliance (R22-D):** the stat tile order is Expired, ≤7, ≤15, ≤30 and
the monitor table card title is "At-Risk Employees".

**Probe lessons:** ALWAYS restart the :3200 standalone server after a
rebuild — the running process serves 404s (the not-found page's h1 gives it
away) once `.next/standalone` is replaced under it. Full-sweep docH reads
can catch mid-hydration states (REF /employees transiently read 1010,
settled 900 — re-probe with a visible-h1 check before flagging).
`agent-browser fill` drives React state where the native-setter +
input-event trick does not. The sidebar brand is an `<h1>` — h1 probes must
filter `offsetParent !== null`. VLM checks need `createVision` + a vision
model (the plain chat endpoint rejects image content).

**Spec count:** 416 unit (recipes 279, tokens 19, auth 14, utils 13,
shell-recipes 76, db-path 15) + 86 E2E.

## 36. Session-24 Recipe Layer — parity round 23 (the cursor + selection dimension)

The cursor map: REF (v3 preflight) computes `cursor: pointer` on 100% of
measured buttons; v4 removed the preflight rule — restore it with
`@layer base { button { cursor: pointer } }` (utilities still win for
`disabled:cursor-not-allowed`). The selection map: REF wraps its 8
core-module pages (dashboard, employees, payroll, attendance,
leavemanagement, expenses, loans, taskmanager) in a `touch-pan-y`
container computing `user-select: none` — Chrome INHERITS user-select, so
page content (including inputs) computes none while Radix portals
(dialogs/dropdowns/drawer) escape to auto. The other 37 content routes
stay selectable (per-page REF inconsistency). Mirror: `select-none` on
exactly those 8 page roots; pin the scope NEGATIVELY (the settings root
must NOT carry it). caret-color and ::selection need nothing (identical
computed values + zero authored rules). Probe lessons: REF's stylesheet is
CSSOM-unreadable (cross-origin family) — computed DOM census is the only
ground truth on that side; bare-string agent-browser evals must be
JSON.stringify'd or the harness parses them into error objects.
