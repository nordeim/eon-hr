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
> **Version:** 2.0.0 (session-2 remediation complete) · **Last updated:**
> 2026-10-09 · **State:** 52 unit + 78 E2E tests green, lint/typecheck/build
> clean, visual parity with the live reference verified by dual-browser audit.

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
bun run test          # vitest — 52/52 (db-path 15, auth 14, utils 13, tokens 10)
bun run build         # next build + static/public copy into standalone
bun run test:e2e      # playwright — 78/78 against the fresh standalone build
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

**W-1 — Wizard footer (AP-5-proof):**

```tsx
<DialogFooter>
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
  </Button>
</DialogFooter>
// <form onSubmit={submit}> stays wired for Enter-key, guarded by
// `if (saving || step < STEPS.length - 1) return;` inside submit.
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
| `lg` (≥1024px) | **sidebar appears, mobile header + bottom tabs hide** (`lg:hidden`); drawer unmounts |
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

**Semantic:** primary **#1877F2** (ref-measured), primary-foreground
**#FAFAFA** (session-4: slate-50, the reference button text — NOT white),
link **#2563EB**, background #F8FAFC (canvas gradient
slate-50→blue-50 sRGB), foreground hsl(221 39% 11%), card/popover white,
secondary hsl(210 40% 96%), muted hsl(210 40% 96%), muted-foreground
**#64748B**, accent hsl(214 95% 93%), accent-foreground **#1877F2**,
destructive hsl(0 84% 60%), border/input **#E5E5E5** (session-4: neutral-200),
ring **#1877F2**, sidebar **#FAFAFA** (session-3), sidebar-foreground
hsl(221 39% 11%), sidebar-accent hsl(214 95% 93%), sidebar-border
**#E2E8F0**.

**Pinned v3 families (byte-identical to reference rendering):**
slate 50–950 = #F8FAFC #F1F5F9 #E2E8F0 #CBD5E1 #94A3B8 #64748B #475569
#334155 #1E293B #0F172A #020617; neutral 200/950 = #E5E5E5 #0A0A0A (session 4);
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
tests           52 unit (4 files) + 78 e2e (5 specs, workers:1)
globals.css     @theme inline — 6 v4 traps, pinned v3 palette, token test
wizard footer   ALL type="button"; submit via onClick (AP-5)
ids             max-suffix EMP-XXXX + conflict retry
envelope        { ok, data | error:{code,message} }  (src/lib/api.ts)
icons           nav-config.ts — parity-pinned names
drawer          288px / bg-black/80 / z-50 / no X / close-on-nav
screenshots     docs/screenshots/ (22 captures, dev server, devIndicators off)
reference       https://eon.base44.app  (docs/reference-page-map.md)
session log     worklog.md + docs/session_1.md, docs/remediation-plan-session1.md
ssh push        docs/ssh_git_wrapper_v3.py  (+ docs/how-to-git-push-using-ssh-wrapper_SKILL.md)
```
