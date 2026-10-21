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
> **Version:** 3.55.0 (session-72 remediation complete — the Trusted-Types rung + the PWA/offline story: the r72 deploy watch DETECTED THE 34TH LOGIN DEPLOY (login JS BCr9BMlh→DOgRuj38, CSS quiet, the app side quiet) and the full confirmation ladder audited it NON-VISUAL (standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45 13/13 — byte-confirmed by the 493 login pair ≡ the r71 476 pair on both sides). R72-A THE TRUSTED-TYPES RUNG: the CSP strictness ladder's next step — `trusted-types default` (the policy-NAME allowlist: only the 'default' policy may exist) + `require-trusted-types-for 'script'` (every DOM XSS sink requires a Trusted* value) + the nonced pass-through default-policy bootstrap FIRST in the root layout's <head> (production-only; dev's Turbopack pipeline would trip it); the r72 sink census green-lit the rung: ZERO raw innerHTML/insertAdjacentHTML/document.write sinks in the whole source + exactly five constant-authored nonced dSHI members; the LIVE enforcement pin proves creating a rogue policy name THROWS. R72-B THE PWA/OFFLINE STORY: REF measured with ZERO service workers (its manifest links on the login surface only, a stale platform-template description, EXTERNAL supabase icons), so the clone ships the OFFLINE SHELL: public/sw.js (the versioned static-shell precache + cache-first /_next/static chunks + network-only navigations with the cached /offline.html fallback — page HTML is NEVER cached: the authed-HTML leak-free design) + public/offline.html (CSP-clean by construction: zero scripts, zero <style> elements) + the nonced production-only registration bootstrap; proven by the un-authed /sw.js fetch, the live registration + control, and the setOffline(true) navigation landing on the offline page. THE EIGHT-ROUND BYTE CHAIN: the 509 drawer pair BYTE-MATCHES the r71 492 pair on BOTH sides (loc e3df921…, ref bfaa0da… — 509≡492≡474≡456≡438≡418≡402≡366: both r72 fix families changed zero rendered bytes, the corrected open-drawer baseline reproduces). The standing checks: the mobile-menu cycle green (toggle → nav links → Training LMS CLICKED:/training → auto-close open:false) · **Last updated:** 2026-10-21
> **State:** 937 unit + 387 E2E tests green, lint/typecheck/build
> clean, visual + interaction parity with the live reference verified by dual-browser audit
> (desktop 1440 + mobile 390 + the tablet bands 768/900/1024 + the 640–767 band +
> the sub-390 band + a print-stylesheet audit + the keyboard/focus-ring taxonomy +
> the hover/active-state taxonomy + the pressed-state taxonomy + the head/SEO
> contract + the reduced-motion/keyboard-order/drag-drop supersets + the DnD-depth
> supersets: within-column reorder + the recruitment pipeline drag-drop + the
> shadcn peer-sidebar shell architecture with the overflow-auto scroll container +
> the desktop icon-rail collapse + the with-data careers family: the job card + the
> apply flow + the state-dependent zero-card + the login interior: the
> runtime-injected ring cascade + the icon color family + the loading state + the
> hidden view-swapped login flows: the password-reset + sign-up views +
> the auth-boundary navigation family: the post-login root landing, the
> deep-link from_url round-trip, the logout carry, and the
> open-redirect-guarded resolver + the history journey walk: the
> back/forward/scroll-restore/drawer/tab walks + the read-only surface
> family: the settings Company tiles (bg-slate-50 + the Address
> col-span-2 implicit grid), the profile identity email's disabled
> state, and the hrreports slate thead) + the dark-mode fill family: the checkbox both-theme pair, the employees GRID default, the inline 12-field settings Company edit, the compliance severity tints, the blue-600 text split, and the flat payrollengine emerald.

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

**Spec count:** 432 unit (recipes 295, tokens 19, auth 14, utils 13,
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

## 37. Session-25 Recipe Layer — parity round 24 (the a11y-attribute dimension)

The aria map: REF's sidebar group toggles carry `aria-controls` in BOTH
states (older Radix authors it unconditionally); the clone's Radix only
sets it while the content is mounted. Mirror with a stable
`React.useId()` on BOTH the Collapsible Trigger (`aria-controls=
{contentId}`) and Content (`id={contentId}`) — user props spread AFTER
Radix's own, so the override holds in both states. The bell: REF's is a
Radix Popover trigger (haspopup=dialog + expanded + controls, persisting
closed) opening the 384×175 notifications panel — author
`ui/popover.tsx` (shadcn over @radix-ui/react-popover) + the measured
recipe (w-96, alignOffset −16 for x=0, header px-4 py-3 border-b with
the h3, body py-8 text-center with the faded h-8 bell + "No
notifications yet"). Keep the clone's a11y supersets (aria-label on the
icon buttons, aria-current=page, role=progressbar, named buttons,
aria-hidden decorative svgs) and do NOT replicate REF's bugs (the
dangling aria-describedby on its loans dialog, the unnamed svg-only
buttons) or its base44 branding imgs. Census method: role + aria-* +
label-wiring summed over 4 surfaces, then element-level dumps per
divergent family; fixed-position elements report offsetParent null (do
not visibility-filter them).

## 38. Session-26 Recipe Layer — parity round 25 (the SEO/meta dimension)

The head map: REF generates page SEO mechanically from the route slug —
title `<slug-capitalized> | Eon HR` (taskmanager renders "Taskmanager",
NOT "Tasks & Projects"; dashboard + login render the plain "Eon HR"),
description "<Slug> on Eon HR. <base>", og 6 + twitter 5 + canonical per
app route, JSON-LD WebSite + Organization everywhere, and login adds
apple-touch-icon + manifest + theme-color #000000 + og:image
width/height/alt. Mirror with `src/lib/meta.ts` (`pageMetadata(route)`)
exported from a 5-line server `layout.tsx` in every (app) route dir
(client pages cannot export metadata; codemod
`scripts/r25-codemod-layouts.mjs`). The root layout's
`generateMetadata` derives `metadataBase` from `headers()`
(x-forwarded-proto + host) so canonical/og:image/og:url resolve absolute
against the ACTUAL serving origin. TRAP: Next REPLACES the parent
openGraph object with the child's — og:type + og:site_name must repeat
PER-ROUTE or they vanish (verified live). The asset family generates
from public/eon-logo.png (`scripts/r25-gen-assets.py`): og-image.png
1200×630 white canvas with the logo content ~1107×429 centered (REF's
supabase render composition), icon-192/512 + apple-touch-icon 180
square, and public/manifest.json (REF's field set). Do NOT replicate
REF's OnboardFlow junk description copy (own base with the same prefix
rule), its supabase-hosted assets (self-host instead), or its
twitter:url (not a standard Card tag — og:url is the fallback).
Probe-tooling lessons: agent-browser `--full` (not `--full-page`) is the
full-page flag; `link.href` absolutizes (use getAttribute for the raw
attribute); Next resolves alternates.canonical against metadataBase
(dump-verify before assuming relative).

## 39. Session-27 Recipe Layer — parity round 26 (the reduced-motion + drag-drop supersets)

The motion-a11y map: BOTH apps ignore `prefers-reduced-motion` (emulated-media
census — the group/leaf transitions still compute 0.2s, the drawer `enter
0.5s`, the dropdown `enter 0.15s` under reduce on both; sonner's toast
internals are the only aware rules anywhere). The clone SUPSERSCES REF on the
WCAG 2.3.3 axis with a top-level UNLAYERED `@media (prefers-reduced-motion:
reduce)` block in globals.css: `*, ::before, ::after { animation-duration:
0.01ms !important; animation-iteration-count: 1 !important;
transition-duration: 0.01ms !important; scroll-behavior: auto !important; }`.
TWO HARD RULES: (1) never `animation: none` — Radix waits for `animationend`
before unmounting portal content; at 0.01ms every animation completes
instantly and the event still fires (the drawer close stays clean,
live-verified); (2) the block must stay UNLAYERED + `!important` so it beats
the v4 utilities layer (layered rules lose to unlayered utilities — the
session-21 lesson). Under DEFAULT media the block is inert — parity is
byte-identical (regression-swept). Emulate with `agent-browser set media
reduced-motion` (reset with bare `set media`); computed durations serialize
`0.01ms` as `1e-05s` — compare accordingly.

The drag-drop superset: REF's kanban ships zero draggables while its cards
LOOK grabbable (cursor-grab). The clone wires real HTML5 DnD onto the
existing `moveTask` PATCH path in the taskmanager page: cards `draggable` +
`onDragStart` (dataTransfer payload + a `dragTaskId` state driving the
mid-drag `opacity-50` affordance), columns `onDragOver` with preventDefault
(the HTML5 contract — without it the browser refuses the drop) + a
`ring-blue-500/40` highlight on non-source columns while dragging + `onDrop`
→ moveTask. The "Move to" dropdown stays as the keyboard/a11y path. E2E
TRAP: HTML5 DnD cannot be driven by plain mouse events — dispatch synthetic
`DragEvent`s (dragstart → dragover → drop) with `new DataTransfer()`, and
give React a tick after dragstart so the drop handler's state read is fresh
(`tests/e2e/taskmanager-dnd.spec.ts` is the working recipe).

The keyboard-order sweep (first of the dimension): Tab-order is
byte-identical on /login (8/8 — REF's extra tab-9 stop is its base44 "Close
badge" platform artifact) and /dashboard (14/16 — the 2 diffs are the
clone's kept aria-label supersets on the bell/moon buttons; REF's are
unnamed). No action needed; the sweep is the evidence.

Probe-tooling lessons: `//` comments inside flattened one-line evals swallow
the rest of the line (use `/* */` — re-hit after 5 rounds); REF's sidebar
group chevron is `lucide-chevron-right` when COLLAPSED (chevron-down only
when expanded — locate group buttons via `[aria-expanded]` instead); REF's
CDN-JIT Tailwind layout can go stale after viewport/media churn within a
session (a fresh session + fresh auth recovers it); REF's Tailwind runs via
cdn.tailwindcss.com (the production warning is expected noise).

## 40. Session-28 Recipe Layer — parity round 27 (the DnD depth supersets)

The round took session-46's suggested next step: superset depth on the DnD
surface. Two gap groups, both pure supersets (REF ships zero draggables on
either board — the taskmanager documented since session-21, the recruitment
pipeline re-verified this round: 0 draggables, 0 cursor-grab cards).

**The recruitment pipeline DnD (R27-A)**: the recruitmentkanban candidate
cards are HTML5-draggable — `draggable` + `onDragStart` (dataTransfer
payload + a `dragCandId` state driving the mid-drag `opacity-50`) +
`onDragEnd`; the w-64 columns are drop zones (`onDragOver`/`onDragEnter`
preventDefault + the `ring-blue-500/40` highlight on non-source columns +
`onDrop` → the existing `onMove` stage PATCH). The "Move to" dropdown stays
as the keyboard/a11y path. The card carries `cursor-grab
active:cursor-grabbing` — the hover-state-only affordance superset (REF's
card shows the default cursor while being un-draggable; a draggable card
that does not look draggable is a usability defect — same category as the
round-24 aria-label supersets).

**The within-column reorder (R27-B)**: `Task.position Int @default(0)` +
GET orders `[{ position: "asc" }, { createdAt: "desc" }]` (untouched
columns keep the newest-first render — every row ties at position 0, the
tiebreak decides) + PATCH accepts `order: string[]` (the full ordered id
list for ONE column; reassigns position 0..n-1 in a transaction,
existence-validated so a stale board cannot half-reorder). The kanban cards
are insertion drop targets: `onDragOver` on the card (preventDefault + a
`dragOverId` state driving a `ring-2 ring-inset ring-blue-500/40` insertion
ring on the hovered card) and `onDrop` inserts the dragged card BEFORE the
hovered one (`stopPropagation` — the column handler must not double-fire);
dropping on the column body appends to the end. Optimistic state: array
order IS render order (splice the dragged card in before its insertion
point; per-column render follows the array subsequence). The toast stays
"Task moved" for cross-column drops (the round-26 E2E contract) and reads
"Order updated" for same-column reorders.

**Probe-tooling lessons (this round's three)**: (1) ALWAYS pin both
viewports before sweeping — the ref session defaulted to 800×900 and
produced two phantom DIFFs (/payroll y=136 vs 116: at 800px the payroll
title column shrinks to min-content 186px, the badge wraps to 56px, the
subtitle to 3 lines; /profile x=288 vs 336: the centered header
re-centers). (2) React state does NOT flush inside a single eval —
dispatching dragstart and reading opacity/boxShadow in the SAME eval reads
the pre-state (the round-26 lesson, re-hit on the screenshot capture);
split the dispatch and the read into separate evals with settle delays.
(3) Chrome serializes modern colors as lab() — `ring-blue-500/40`
computes to `lab(54.6 8.76 -65.79 / 0.4) 0px 0px 0px 2px inset`, NOT
`rgba(96,165,250,.4)`; match on geometry or parse tolerantly. And the
pixel-truth corollary: the 2px 40%-alpha insertion ring is real in the
screenshot (pixel-verified rgb(177,205,251) = blue-500@40% over white)
while the VLM cannot perceive it — computed DOM + pixel sampling beat
visual-language confirmation at low alphas.

## 41. Session-29 Recipe Layer — parity round 28 (the within-stage ordering + print supersets)

The round took session-48's two suggested next steps: further DnD depth
(the within-stage candidate ordering) and the print superset.

**The within-stage candidate ordering (R28-A)**: the round-27 Task pattern
applied to Candidate — `position Int @default(0)` (db pushed; rows backfill
0), GET `/api/candidates` orders `[{ position: "asc" }, { appliedAt:
"desc" }]` (untouched stages keep the newest-first render — every row ties
at position 0, the tiebreak decides), PATCH accepts `order: string[]`
(one stage's full ordered id list; position = index in a `$transaction`,
existence-validated, NOT_FOUND on mismatch). The pipeline cards are
insertion drop targets: `onDragOver` on the card (preventDefault + a
`dragOverId` state driving the `ring-2 ring-inset ring-blue-500/40`
insertion ring) and `onDrop` inserts the dragged card BEFORE the hovered
one (`stopPropagation` — the column handler must not double-fire); the
column-body drop appends to the end through the same `reorderCandidate`.
**The order computes over the FULL `candidates` array, NOT the filtered
`visible` view** — an active job filter or search query cannot corrupt the
persisted positions (the filtered render follows the array subsequence).
Optimistic state: array order IS render order. The cross-stage toast stays
`${name} → ${Label}` (the round-27 E2E contract); same-stage reorders toast
"Order updated".

**The print superset (R28-B)**: an UNLAYERED `@media print` block in
globals.css — the reduced-motion placement rule (an unlayered !important
rule beats every v4 cascade layer; zero screen-media impact, re-proven by
the 12-route + mobile regression sweeps): `aside, header, nav,
[data-radix-portal] { display: none !important }` (the app shell's
sidebar/topbar/bottom-tabs are the ONLY such tags in the tree — the
sidebar-nav's inner nav lives inside the hidden aside; census), `main
{ padding-bottom: 0 !important }` (drop the pb-20 tab-bar reserve), `body
> div { min-height: 0 !important }` (drop min-h-screen so short pages do
not force a blank trailing page), `.rounded-xl, table tr { break-inside:
avoid }` (cards and rows never split across page boundaries). REF ships
zero print rules (the session-18 census, re-confirmed rounds 22 and 27) —
the clone's print output becomes clean while REF's stays chrome-laden.

**Probe-tooling lessons (this round's three)**: (1) agent-browser's
`set media` supports only `dark|light|reduced-motion` — print emulation is
NOT available at the CLI layer (`matchMedia("print").matches` stays false);
it lives in the Playwright layer via `page.emulateMedia({ media: "print"
})`, which is why the print verification is the permanent
tests/e2e/print-media.spec.ts (also the cascade proof: under print the
sidebar computes display:none vs `flex` from `md:flex`). (2) The FIRST
`body > div` is Next.js's hidden bootstrap div — the app root (min-h-screen
flex) is a LATER sibling; locate it as `body > div.min-h-screen` or a probe
reads the hidden div's min-height 0px as a false-positive proof. (3) The
loc session cookie flakes after server restarts — the 12-route sweep
suddenly reads a 0/12 "login page" signature; re-running
scripts/auth-r22.mjs restores it. Corollary: one mobile-audit DRAWER DIFF
was a transient (the drawer click did not register that run) — re-run
before diagnosing.

## 42. Session-30 Recipe Layer — parity round 29 (the sidebar leaf-gap fix + the organogram DnD + the print color fidelity)

**The round's find (R29-A — a REAL at-rest parity bug, 28 rounds
undetected)**: the standing audits pin h1 geometry only, so
sidebar-internal drift was invisible. The census that found it: a FULL nav
y-map on both apps reading buttons AND links together (REF's "Training
LMS"/"Assets"/"Staff Requests"/"AI HR Assistant" entries are single-route
ANCHORS, not collapsible buttons — a button-only census under-counts REF's
nav and mismeasures the group pitch). The finding: after an expanded
group's last leaf (ends y=861), the next root item sits at +4px on REF
(AI HR Assistant y=865, Settings group y=905) but +8px on the clone (869 /
909) — the nested leaf-ul's `mb-1` PLUS the root wrapper's gap-1. The
LEADING side always matched (first leaf y=577 both — REF via the root gap,
the clone via mt-1), which is how the session-5 pin got the top right and
over-generalized the bottom. The fix: the leaf-list ul drops `mb-1` →
`mt-1 flex flex-col gap-1 pl-4` (the session-5 pin corrected in
tests/unit/recipes.test.ts). Post-fix: 865=865 / 905=905 byte-identical;
the same SidebarNav renders the mobile drawer, and the mobile chrome audit
re-ran clean.

**The organogram drag-drop superset (R29-B)**: REF ships zero draggables
on /organogram (re-verified; the zero-data empty state is byte-identical).
The architecture: the server page KEEPS the tree build (roots, render
cycle guard, directReports counts) and delegates the render to the client
island `src/app/(app)/organogram/organogram-tree.tsx` (the page-folder
convention: employee-wizard, customize-button) receiving the serializable
`OrgNodeData[]` as props. The DnD recipe (the rounds-26–28 pattern): node
cards `draggable` + onDragStart (dataTransfer setData + draggedId state +
`opacity-50` mid-drag) + the round-27 `cursor-grab` affordance; drop
targets via dragOverId state → `ring-2 ring-inset ring-blue-500/40` on the
hovered card. The unified `reparent(draggedId, targetId)`: (1) the CLIENT
cycle guard first — `isDescendant(trees, draggedId, targetId)` walks the
local tree and toasts "Cannot create a reporting cycle" BEFORE any
request; (2) the optimistic surgery — removeNode detaches the subtree,
insertChild appends under the target, recount recomputes directReports
(the local forest IS render order); (3) `PATCH /api/employees?id=
{draggedId}` with body `{ managerId: targetId }`; (4) the toast
`${name} now reports to ${targetName}`; (5) `router.refresh()` — server is
truth, the island re-syncs from refreshed props via the useEffect keyed on
the prop reference; failures revert to the previous forest + error toast.
The API's PATCH gains the ANCESTOR-WALK cycle guard (walk the proposed
manager's managerId chain up to 1000 deep; if it reaches the employee
being moved → VALIDATION "This manager assignment would create a reporting
cycle") — the page's render cycle guard tolerates corrupt data, the API
must not create it. POST needs no guard (a new employee cannot be anyone's
manager yet). The keyboard path is the employee edit form (unchanged).
E2E: tests/e2e/organogram-dnd.spec.ts — the re-parent round-trip (create
the A→B→C chain via the API, depths 0/1/2, drag C onto A, depth 2→1,
persisted after reload, cleanup leaves-first) + the cycle rejection.

**The print color fidelity (R29-C)**: the round-28 print block gains `* {
print-color-adjust: exact !important; -webkit-print-color-adjust: exact
!important }` — the browser "economy" default strips backgrounds from
print output, which would blank every status badge, severity bucket, chart
fill and table header tint; exact restores "print what you see". Plus
`@page { margin: 10mm }` — consistent print margins across browsers (REF
ships zero print rules; browser defaults vary 10–12mm). Media-scoped like
the rest of the block: zero screen-media impact (re-proven by the 12-route
geometry + mobile chrome regression sweeps). The E2E print-media spec pins
the computed `print-color-adjust: exact` on cards under emulation. The
print-button-on-report-pages idea from the frontier list is CONSIDERED AND
DEFERRED: a visible at-rest button would break visual parity on report
surfaces — a future decision, not shipped.

**Probe-tooling lessons (this round's three)**: (1) the standing audits
pin h1 geometry only — sidebar internals drifted undetected since session
5; a sidebar-internal census (buttons AND links together) is now part of
the round's standing probes. (2) Chrome serializes ring box-shadows with
the inset geometry LAST — `lab(54.6 8.76 -65.79 / 0.4) 0px 0px 0px 2px
inset` — so the ring assertion must match `/0px 0px 0px 2px inset/`, not
`/2px 0px 0px 0px/` (one E2E regex fix; the ring itself rendered
correctly on the first run). (3) In-page fetch evals break on JSON bodies
(double quotes inside double-quoted shell words) — drive the API from
Node with the session cookie (the verify-r29 pattern) instead; also
md5-compare screenshot pairs before trusting a capture (an identical-hash
pair means the dispatch sequence never registered — re-run with
per-dispatch logging).


## 43. Session-31 Recipe Layer — parity round 30 (the drawer border + the chat structure + the legacy /assets route + the swipe superset)

**The round's standing audits**: redeploy 12/12 MATCH (viewports pinned
1440×900 from the start); mobile chrome byte-identical (tabs, kicker,
drawer overlay — no Tailwind v4 bug); with-data re-check — REF still
zero-data (blocked, documented); the round-29 sidebar-internal census
re-run clean (collapsed 141→621, expanded leaves 577→829, roots
865/905 — the fix holds in both collapse directions).

**The round's census — four new probes**: (1) the sidebar
collapse-boundary sweep (collapsed → expand → re-collapse — all three
states byte-identical); (2) the drawer EXPANDED-state census at
390×844 — the internal nav y-map matches, but the panel's BORDER did
not (the standing audit pins the overlay, never the panel): REF ships
`border-right: 1px #e5e5e5` — the DEFAULT border color, not the
desktop sidebar's slate-200 token. REF uses different border colors on
its two nav surfaces; the clone now mirrors both. (3) The bottom-tab
active-state route sweep — 18 routes, the Home/Staff/Tasks/Attendance/
Profile highlighting + kickers identical everywhere (verified non-gap).
(4) The orphan-route census — REF serves a LEGACY page at /assets that
the clone 404'd on (the sidebar links "Assets" → /assetmanagement on
BOTH apps; the modern page is byte-identical — this is a second,
simpler assets page REF also serves).

**R30-A — the drawer border recipe**: `border-r` alone on the drawer
`DialogPrimitive.Content` — the width-1 border inherits the base
layer's `* { border-color: #e5e5e5 }` (the `--color-border` token;
REF's measured rgb(229,229,229)). Never add a color class here: the
slate-200 `border-sidebar-border` belongs to the DESKTOP sidebar only.

**R30-B — the /hrassistantchat empty-state recipes**: the left card is
a NATURAL-HEIGHT `Card border-slate-200` (never `flex min-h-0 flex-1`
— REF's card hugs content, bottom y≈362, while the grid row is 650px)
with `CardHeader className="border-b border-slate-200 p-4"` holding
`CardTitle className="text-sm"` (14px/600 #0a0a0a via card-foreground;
the DEFAULT 20px line box — an explicit leading-[1.5] overshoots by
1px and pushes the body line to 303) over the
`max-h-96 space-y-1 overflow-y-auto p-2` list body whose empty state
is a single `<p className="text-sm text-muted-foreground">No chats</p>`
in the list flow. The right pane wraps in a bare `lg:col-span-3` div;
its empty state is the `flex h-full flex-col border-slate-200` card's
`CardContent` (default `p-6 pt-0` + `flex h-full items-center
justify-center`) around a `text-center` div: the 64px slate-300
**MessageSquare** in an `mb-4 flex justify-center` wrapper over ONE
16px slate-500 line — no h3, no description, no iconed EmptyState.
Icon identity comes from the SVG path fingerprint
(`M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z` =
MessageSquare), not from guessing.

**R30-C — the legacy /assets route**: `PageHeader layout="flat36"
actionsStart rowBreakpoint="sm" className="flex-row justify-between
items-start"` — the ALWAYS-ROW header (measured side-by-side at 390px;
the class trio forces row at every width, twMerge keeps the sm:
variants harmless) with the Add Asset button riding the badge row
(y=32). The page canvas is REF's green→blue
(`bg-[linear-gradient(to_right_bottom,#f0fdf4,#eff6ff)]` — trap 3's
sRGB pin). The card: `border-slate-200` + `CardHeader
className="border-b bg-slate-50"` (the gray band, h=65) with
`CardTitle className="leading-none"` (16px/600, h=16) + `CardContent
className="p-0"` holding the systemic `p-12 text-center` empty state:
the 64px slate-300 **Inbox** (path-fingerprinted) in the mb-4 wrapper
over `<p className="text-slate-500">No assets yet</p>`. The dialog:
Asset Name / Type (Laptop, Desktop, Phone, Tablet, Monitor, Other) /
Serial Number / Assign To (Optional, "Not Assigned" none-item) —
POSTs the shared /api/assets. The API's zod enum gains desktop +
tablet (the DB column is a free String; the modern page's filter
stays REF's contract). Route metadata: the mechanical
`pageMetadata("/assets")` layout — the R25-A4 coverage pin's route
count goes 46→47.

**R30-D — the drawer swipe-to-close superset**: touch handlers on the
drawer panel (touchstart records; touchmove with the
horizontal-dominant leftward guard live-translates via inline
`translateX(dx)` with `transition: none`; touchend past 96px closes,
below springs back along `transform 300ms cubic-bezier(0.32,0.72,0,1)`).
The close path KEEPS the inline transform — tailwindcss-animate's exit
keyframes define only the `to` state, so the animation runs from the
current inline value (the panel continues from the finger; clearing
the transform first would snap it to 0). Zero at-rest impact.

**Probe-tooling lessons (this round's three)**: (1) text-only DOM
censuses miss icons — REF's /assets "No assets yet" had an 80px gap
above it that was a 64px Inbox + mb-4, invisible to a text-node census
(the subtree's kids:2 was the tell; read child counts + geometry, not
just text). (2) CDP touch dispatches need the enter animation settled
(a touch landing mid-flight targets the OVERLAY — the panel hasn't
slid under the finger yet, and the overlay is the Content's SIBLING,
so the React handlers never see it) plus ~100ms inter-phase frames
(back-to-back `Input.dispatchTouchEvent` calls drop the touchMove —
the round-26 separate-evals lesson, touch edition). (3) Radix's portal
renders the overlay and the panel as SIBLINGS — "the overlay's
children" is always empty; locate the panel by its own geometry
(fixed, w 200–340, h≥800, non-overlay background).

**Gates**: lint 0/0 · tsc ✓ · 464/464 unit (+7 session-31 pins, the
R25-A4 count updated) · build ✓ · 100/100 E2E (+7). Live-verified:
drawer border + chat y-map + /assets y-map (desktop AND mobile)
byte-identical; 12/12 redeploy; mobile chrome byte-identical; sidebar
navmap 865/905; DB pristine. 118 PNG captures (6 new, VLM-confirmed).

## 44. Session-32 Recipe Layer — parity round 31 (the orphan-route hunt: 14 recovered routes)

**The method — mine the SPA bundle for the route registry.** REF's main
bundle (`/assets/index-C-IrDy5f.js`, 2.2MB, plain curl — no auth needed)
contains the page registry `VKe={AdvancedAnalytics:…, 61 keys}` and the
mechanical path builder `We(e){return "/"+e.toLowerCase().replace( /
/g,"-")}`. Cross-referencing those 61 names against the routes the clone
served found 14 orphans in one shot — a census technique that beats
route-guessing forever. Lesson: when hunting coverage gaps in a compiled
SPA, extract the router's own registry from the bundle before probing.

**The recovered routes (all inside the app shell — main x=256)**:

1. **The 10 real pages** — measured at 1440×900 + 390×844 and
   replicated: careers (public jobs; REF's data FLUCTUATES per load —
   the zero-data card is the contract, the clone renders its own
   JobPosting rows), employeeportal (centered max-w-md card: the 64px
   bg-blue-100 circle + H2 20px/700 + the 16px line at y=448/484),
   externaljobapplication (icon-FIRST empty: Briefcase y=209 → h3
   y=289 → line y=325; wrapper space-y-12 + content pt-12), hrassistant
   (single-pane chat under the flat36 centered header, reusing
   /api/ai-chat), payrollai (the /assets green canvas twin + 3 stat
   tiles + green CheckCircle empty), payrollreports (a PAGE-SPECIFIC
   header: badge+CTA row y=56, h1 y=108, 16px sub y=156 — hand-rolled,
   NOT the standard raised-36), requestreports + requestsettings
   (centered 24px headers with the FLUSH mt-0 sub + Back ghost buttons;
   960px config cards), shiftswap (violet canvas, 4 horizontal tiles,
   violet/ghost tab pills), tenantsetup (max-w-2xl wizard card).
2. **The 2 aliases** — organizationsetup + dynamicdashboard re-export
   the dashboard page + its plain "Eon HR" title.
3. **The 2 blank stubs** — home + employeedetail render `null` (REF
   renders nothing in main; the mechanical titles still apply).

**The v4 space-y flip INSIDE cards (trap 6, card edition)**: REF's
tenantsetup card header stacks `mb-4` + `space-y-1.5` to a 22px gap
(v3's margin-top-on-next-sibling stacks with the utility margin). In
v4, `space-y` writes margin-BOTTOM on `:not(:last-child)` via a
zero-specificity `:where()` — the `mb-4` utility WINS and the 6px is
lost. Fix: explicit `mb-[22px]` on the circle wrapper (plus `pt-4` on
the button row and h-11 inputs to land the 483px card at y=209).

**Probe-tooling lessons (this round's four)**: (1) the standing
navmap's `aside` selector reads REF empty — REF's sidebar is div-based;
locate items via `div.min-h-screen button/a` + x<260 (the dedicated
probe is the truth, the combined audit script flakes). (2) A standalone
server restart that logs EADDRINUSE leaves the STALE build serving —
new routes then read as error pages; kill by PID (`ss -tlnp`) and
re-verify the health endpoint. (3) Probe evals joined to one line die
on `//` comments — the comment eats the rest of the expression; strip
comments from probe evals. (4) The first mobile kicker read after a
viewport switch can be an un-settled transient (y=89 vs 101) — re-read
after a fresh load before calling a DIFF.

**Gates**: lint 0/0 · tsc ✓ · 480/480 unit (+16 session-32 pins; the
R25-A4 route count 47→61) · build ✓ · 121/121 E2E (+21: the nav sweep's
12 + the orphan-routes spec's 10 — blank/alias/empty-state contracts +
the shiftswap, requestsettings and tenantsetup round-trips).
Live-verified: 13/14 byte-identical (careers' line diff = REF's live
backend data — the h1+hero match, the zero-data contract verified on
the empty load); 12/12 redeploy; mobile chrome byte-identical; sidebar
navmap 865/905; DB pristine. 127 PNG captures (9 new + 02/11
refreshed).


## 45. Session-33 Recipe Layer — parity round 32 (the dark theme + the RTL mode + the swipe-to-open)

**The round's census**: the sidebar footer controls (Moon / عربي) — a
never-audited dimension. REF's Moon is a REAL theme controller
(`html.dark` + `localStorage darkMode="true"`, persisted across
reloads) and REF's عربي flips the app to **RTL** (`dir=rtl` +
`app_lang="ar"`, strings stay English, the layout mirrors, the drawer
stays left-anchored). The clone's controls were display-only stubs.

**The v4 dark-variant trap (the round's engine lesson)**: v4's `dark:`
variant defaults to the prefers-color-scheme MEDIA query. The
class-based strategy every shadcn app uses must be declared explicitly:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Without it, `dark:bg-slate-900` / `dark:hidden` compile to media queries
that never fire under `html.dark` — found via E2E (the moon icon's
dark:hidden stayed visible with the class applied).

**The runtime-var restructure (globals.css)**: `:root` carries the
light pins verbatim; `.dark` carries REF's extracted neutral palette
(background #0a0a0a, foreground #fafafa, border/input/secondary/accent/
muted #262626, primary-foreground #171717, muted-foreground #a3a3a3,
destructive #7f1d1d, ring #d4d4d4, sidebar #18181b); `@theme inline`
maps `--color-*: var(--*)`. The token contract test slices with
`:root {` / `.dark {` / `lastIndexOf("@theme inline")` markers (the
header comments mention the bare strings — indexOf grabs the comment).

**Tokens that must NOT flip**: `--color-primary` #1877F2 (REF's
active-nav blue survives dark — its own --primary flip to 0 0% 98%
renders only on its bg-primary surfaces, which the clone tracks with
explicit `dark:bg-[#fafafa]` on the button dark variant, measured on
the /hrassistant send button), `--color-link`, and the v3 palette
families (hardcoded slate-*/zinc-* classes stay put on both apps —
even REF's "broken" bits: user-name text-slate-900 on slate-900,
gradient-CTA #171717 text on blue).

**The SSR theme boot (layout.tsx)**: a pre-paint inline script reads
`darkMode` / `app_lang` and applies `.dark` / `dir` before first paint
(no FOUC — REF re-applies on every load, verified by reload). The
Moon's icon swap is CLASS-DRIVEN (`dark:hidden` / `hidden dark:block`)
so it can never desync from the applied theme; the state syncs
post-hydration for the aria-label only. The عربي label/title flip
syncs the same way (title → "التبديل إلى الإنجليزية" in Arabic mode).

**The swipe-to-open superset (R32-C)**: a horizontal-dominant RIGHTWARD
touch starting within 32px of the left viewport edge (≥24px travel)
opens the drawer; the handlers live on the main column wrapper (the
bottom nav and drawer panel are siblings); the edge window keeps
horizontal content scrolls inert; zero at-rest DOM impact (the R30-D
pattern).

**Readability supersets (dark-only, light untouched)**: the
checkbox/avatar/chat-bubble text stays white in dark — REF's zero-data
surfaces never render these controls in dark (unmeasurable), and the
token flip would put #171717 text on the unchanged blue.

**The 31-round-invisible LIGHT find (R32-E)**: REF's desktop aside is
authored `bg-white dark:bg-slate-900 border-slate-200
dark:border-slate-800` — it renders rgb(255,255,255) in light while
the clone's `bg-sidebar` rendered #fafafa. Every prior audit compared
sidebar GEOMETRY (navmap) or the MOBILE drawer (the --sidebar token =
#fafafa on BOTH apps) — never the desktop aside's computed background.
The aside now mirrors REF's authored classes; the drawer keeps the
token (flips to #18181b in dark — REF's --sidebar-background 240 5.9%
10%, byte-verified live on both apps).

**Probe-tooling lessons (this round's five)**: (1) the dark sweep must
drive BOTH apps via localStorage + reload — moon-CLICKS race and
desync the sessions (alternating light/dark reads); (2) drawer-open
probes must filter `getBoundingClientRect().width > 0` — display:none
sidebar buttons return zero rects that satisfy y<100/x<60 and steal
the click (audit scripts that "passed" this way compared two failed
opens — {found:false} === {found:false}); (3) v4 opacity modifiers
serialize as `lab(... / 0.2)` via color-mix while v3 refs serialize
`rgba(30,58,138,0.2)` — the SAME color; match endpoints, not notation;
(4) gradient serialization differs (`to right` vs the computed
`90deg`) — identical renders; (5) the RTL sidebar probe needs the
same selector logic on both apps (REF has no `<aside>` — an
aside-fallback grabs the drawer wrapper at x=0 and muddies the
comparison).

## 46. Session-34 Recipe Layer — parity round 33 (the wired-page at-rest audit + the login Alert)

**The census**: round 31 wired data supersets into nine recovered pages
and audited only h1+hero — the bodies below the headers were never
inventoried. The button/input/text census (plus the never-audited
form-error dimension) found six pages with genuine at-rest gaps; REF's
CSS chunk was unchanged (`index-BGNH4KkS.css`) — clone-side drift.

**The recipes** (all live-measured):
- /payrollreports — the white-pill kicker + the SOLID green-600 CTA on
  the pill row (y=56); the filter card (Label fs12 above a w-full
  select); the 4-col grid tab list (with Custom); the summary card
  (inline-icon title + the w-40 month input + FileSpreadsheet/FileText
  mr-1 outline buttons; the stats INSIDE with colored font-bold text-lg
  values; the 8-col uppercase thead + the "No records for {month}" TD).
- /requestreports — the 2×2 section cards ("No data" py-8 empties) +
  the Request Log 7-col table; the stock Card recipe on the tiles.
- /requestsettings — the 4-col approval row (name+email+level+Add
  dark) + space-y-2 None-set rows + the iconed card heads (Shield
  blue-600 / Users purple-600); the 3-row limits grid; the
  LEFT-aligned Back+title header in max-w-5xl.
- /shiftswap — the tab pills in the `bg-white border p-1 rounded-xl`
  container; NO header action (the superset's entry is the "n"
  keyboard shortcut — invisible at rest); "No swap requests in this
  category" on both tabs.
- /careers — the page canvas + the max-w-6xl hero with the job-search
  input (h=302); the "Browse by Company" H2 + h-46 rounded-md chips.
- /payrollai — the green-gradient CTA riding the badge row
  (actionsStart) + the CircleCheckBig "All Clear!" empty.
- /login — the shadcn Alert error (bg-red-50/70 border-red-200
  rounded-xl + the text-red-700 description, 368×54) + the full stack
  rebuild (p-4 outer; ONE wrapper > space-y-6 sm:space-y-8; field DIVs
  with label leading-5 + input mt-1.5; noValidate removed).

**THE v4 TRAP (session 34)**: `space-y-*` in v4 margins the
`:not(:last-child)` child — an INLINE label's margin-bottom is ignored
vertically, so v3's label→input gap collapses (the login fields and
the payrollreports filter both hit it). Fix: explicit `mt-*` on the
following block. **The button lesson**: the default variant's CTA
gradient is a bg-IMAGE that paints over any bg-color className adds —
solid buttons need `bg-none` or a real variant. **The component
lesson**: shadcn sub-components must `cn()`-merge their className
props (the AlertDescription initially dropped `text-red-700` — the
E2E color pin caught it).

Gates: lint 0/0 · tsc ✓ · 507/507 unit (+14) · build ✓ · 135/135 E2E
(+2). Live: verify-r33 19/19 MATCH, 0 DIFFs (the payrollai to-right/
90deg serialization aside). 11 screenshots → 145 PNG captures.

## 47. Session-35 Recipe Layer — parity round 34 (the dialog interiors + the deep-RTL find)

The census took the frontier's next dimensions: the dialog interiors
(loans + assets — the only two REF-exposed dialogs, measured
geometrically for the first time), the deep-RTL polish, and the
payrollreports tab contents. REF's CSS chunk unchanged; its account
still zero-data.

- **The systemic dialog recipes** (R34-C): `DialogTitle` = `text-lg
  font-semibold leading-none` (REF-measured 18px/18px/600 on both
  dialogs — v4's default text-lg line-height is 28px, 10px too tall on
  every dialog title). The backdrop = `bg-black/80` (REF's overlay is
  rgba(0,0,0,0.8); the shadcn-default /50 renders rgb(125) vs REF's
  rgb(51) over a white page — a 30-point never-audited gap the
  verification screenshots caught).
- **The asset dialog** (R34-A): H2-only header (no description — the
  loans pattern); Type + Serial on one `grid grid-cols-2 gap-4` row
  (223+223 over the 462 inner); the footer Add button TEXT-ONLY
  (102×36 — icons widen it to 126). Byte-identical box: 512×372.
- **The loans installment** (R34-B): the value is a P — `text-base
  font-semibold text-blue-700` (16px/600/rgb(29,78,216)) inside the
  matched `p-2.5 bg-slate-100 border border-slate-200 rounded-md
  text-center` box; the Paid From input is BARE (no placeholder).
- **THE v4 TRAP #7 — the inline-label gap collapse at dialog scale**:
  REF's v3 `space-y-2` lands as margin-top on the FOLLOWING block → a
  12px label→control gap (measured); v4's `:not(:last-child)` mb on
  the INLINE label is ignored → 4px. Both dialogs were silently
  affected (the session-34 login/payrollreports sightings generalized).
  Fix: explicit `mt-2` on EVERY control inside a space-y-2 field
  wrapper.
- **THE v4 TRAP #8 — the Radix native-select last-child trap**: Radix
  renders a hidden native `<select>` AFTER the SelectTrigger inside
  the wrapper — so the trigger is NOT `:last-child`, and v4's space-y
  puts the margin-bottom on the TRIGGER (a phantom 8px inside every
  Select-ending wrapper; REF's v3 `* + *` selector never did this).
  Fix: Select-ending wrappers DROP space-y entirely; the explicit
  mt-2 carries the 12px gap alone. (Trap 7 + 8 stack: the wrapper
  class list must be audited per-field, not per-form.)
- **The deep-RTL find** (R34-D): REF's desktop sidebar does NOT mirror
  in عربي mode. Architecture = an in-flow TRANSPARENT peer spacer
  (mirrors with dir; left LTR / right RTL; paints nothing — its inner
  box is `bg-transparent`) + a FIXED painting panel (`left:0
  right:1184` at 1440 — identical computed offsets in BOTH directions;
  internals mirror via the cascading dir: link svg at x=207, text
  rtl). REF's RTL rendering: panel at x=0..256 OVER the main area's
  start edge, main 0..1184 (h1 right-aligned at x=823), transparent
  256px gap at the right showing the canvas. The clone now ships the
  same fixed-panel + peer split; LTR is visually unchanged. **The
  round-32 "RTL mirror matches" verification had measured the PEER**
  (which mirrors at x=1184) — the aside-selector artifact's desktop
  twin. Lesson: pin the PAINTED panel, not the layout wrapper.
- **The sidebar surface correction** (R34-D): REF's visible sidebar =
  the inner `bg-sidebar` div — #FAFAFA in light (pixel-verified on
  LTR AND RTL) and #18181b in dark (computed — the .dark --sidebar
  override; NOT slate-900 #0f172a). The round-32 "authored bg-white"
  find had measured the COVERED fixed container. The desktop aside and
  the mobile drawer are the SAME token surface. Lesson: measure the
  element that PAINTS, not the element that AUTHORS.
- **The payrollreports tabs** (R34-E, the superset): REF's triggers
  are inert (re-verified) — the clone wires them via controlled state
  (sibling cards swap by tab; the Tabs component renders only the
  list; the at-rest Monthly DOM is byte-identical). Tax & Deductions =
  per-employee gross/deductions/effective-rate/net; History = the
  periods table descending; Custom = from/to + employee + Generate.
  All on REF's card grammar with zero-data empty states.
- **Pins**: 14 new (A1-3, B1-2, C1-3, D1-2, E1-4) + the R32-A4/R30
  aside pins evolved to the token surface. Gates: lint 0/0 · tsc ✓ ·
  521/521 unit (+14) · build ✓ · 142/142 E2E (+7). Live: both dialogs
  byte-identical element-by-element; the RTL pair surfaces identical;
  the dark sidebar #18181b both apps; mobile chrome + navmap
  byte-identical. 11 screenshots → 156 PNG captures.

## 48. Session-36 Recipe Layer — parity round 35 (the re-measure: the census's blind spots + the prefetch-logout bug)

The round's live verification did what the census could not: it compared
the BUILT clone against REF surface-by-surface and found six gap groups
the census had recorded incompletely or not at all. Three engine
lessons came out of it:

- **THE LINK-PREFETCH ROUTE-HANDLER TRAP (the round's critical find)**:
  never point a `<Link>` at a route handler with side effects. Next
  prefetches Link targets when they mount (viewport), and the prefetch
  is a GET — for `/logout` (a route.ts whose GET clears the session
  cookie) the menu item LOGGED THE USER OUT the moment the menu opened.
  The full test pyramid stayed green because no spec navigated after
  opening the menu — the bug only manifests on the NEXT navigation.
  Fix: side-effecting actions are `<button>`s with real navigation
  handlers (`window.location.href`), never Links. Guard: a spec that
  navigates after the interaction.
- **The census-vs-re-measure lesson**: a census taken with
  snapshot-ref clicking can click the WRONG element when lines carry
  attributes (`[selected, ref=e12]` breaks naive `\[ref=` regexes —
  the pattern then matches the NEXT line). Always re-verify census
  findings against the LIVE pair before closing a round; geometry
  pinned from a mis-clicked panel is worse than no pin. Corollary:
  slice(0, N) on class strings silently truncates `w-full` off the end
  — the LOC select triggers "lacked" w-full only because the probe cut
  the string at 110 chars.
- **The zoom-in-95 read race (the third sighting)**: Radix popover
  geometry must be polled to settle (≥190 of 192) before measuring —
  getBoundingClientRect mid-transform returns the SCALED box (the
  191/190 "width failures" were the enter animation's tail).

Recipe pins added: the settings header actions are the dark solid
(bg-[#171717], icon mr-2 — NOT the gradient CTA); the two dialogs
(max-w-3xl workflow with the five Type options + level cards; max-w-lg
shift with the seven fields); the Quick Presets cards; the Logs
slate-50 island; the 404 min-h-screen wrapper + the Go Home icon; the
user menu's FIXED w-48 + the 16px icon-to-text (mr-2 rides ON TOP of
gap-2). Gates: 556/556 unit · 157/157 E2E. Live: 11/12 pair MATCH.

## 49. Session-37 Recipe Layer — parity round 36 (the form-contract family: the empty-submit probe)

**The method lesson — probe the ERROR STATE, not just the geometry**: a
geometry-only census (round 35) ships dialogs that look right and behave
wrong. The empty-submit probe (click the primary action with empty
fields, read the DOM) reveals the true contract: REF's dialogs are real
`<form class="space-y-4">` documents wrapping fields AND footer, with
`required` on the primary inputs (the browser's NATIVE tooltip is the
error surface — no custom error text ever renders), Cancel/secondary
actions explicitly `type="button"`, and Create `type="submit"`. An
untyped `<button>` reports `type:"submit"` in the DOM and submits any
form it sits in. Radix renders its hidden native `<select>` only when
the Select participates in a form — its absence is a missing-form
symptom, not a Select recipe drift.

**The v4 inline-label re-fire**: the rebuilt dialogs initially rendered
the label→input gap at 4px vs REF's 12 (the departments dialog 348 vs
372 — exactly 3×8px). The verified recipes (grounded on the round-34
asset dialog, re-measured on both apps): Input cells = space-y-2
wrapper + `mt-2` on the Input; Select cells = BARE div (no space-y —
the Radix native-select last-child trap) + `mt-2` on the trigger. Both
measure 12px on REF.

**The E2E flake cascade**: a toast whose description repeats an entity
name breaks substring `getByText` in strict mode (it resolves to the
row AND the toast — racing the toast's auto-dismiss); on failure the
cleanup never runs and the leftover breaks the NEXT run's empty-state
spec. The stable pattern: `{ exact: true }` on the row text + a
describe-level pre-clean + an ASSERTED cleanup (never fire-and-forget
a delete). Two more races: the zoom-in-95 sub-pixel (511 vs 512 — ±1
tolerance, the standing precedent) and the mid-load list read (the
counter renders before the rows — expect.poll to the settled state,
then one read).

**The verify-script traps (both produced FALSE confidence)**: (1)
multi-line evals through execSync + JSON.stringify leave literal `\n`
that breaks the CLI's JS parser — every multi-line record was a
VACUOUS MATCH (both sides ERR → undefined === undefined). Flatten
newlines before stringify. (2) `\[ref=` never matches
`[expanded=false, ref=e…]` — REF's dialog triggers carry aria-expanded;
`ref=(\w+)\]` without the bracket requirement (re-learned from round
35's own fix).

Recipe pins added: the three settings dialogs' form contracts
(required on Name; the shift 60/0 defaults; the Status-in-grid cell),
the Add Department rebuild (max-w-lg, "Department Name \*",
Description, Manager Email, Create submit), the asset text layer
("e.g., Macbook Air 2024", the bare serial, "Not assigned"). Gates:
569/569 unit · 158/158 E2E. Live: 22/22 pair MATCH.

## §50 Session 38 (parity round 37) — the keyboard/focus dimension

**The probe**: open each dialog on both apps, record activeElement
after open, Tab ×10 reading focus each press, then Escape and read the
restore target. The Tab orders came back structurally identical on all
five parity dialogs — the dimension's find was the CLOSE, not the walk.

**The DialogTrigger contract (R37-A)**: REF's dialog triggers are
Radix DialogTriggers — `aria-haspopup="dialog"` + `aria-expanded` +
type=button, focus RETURNS to the trigger on close. A plain
`<Button onClick={setOpen}>` trigger breaks all three: no aria
contract, and on close focus dies on BODY — read from
@radix-ui/react-dialog 1.2.0, `DialogContentModal`'s `onCloseAutoFocus`
focuses `context.triggerRef.current` (null without a trigger) AND its
`preventDefault()` kills the FocusScope's
`focus(previouslyFocusedElement)` fallback. The fix REQUIRES the
root-lift: DialogTrigger only works inside its Dialog root's context,
so the `<Dialog open onOpenChange>` wrapper moves up to enclose the
trigger region (renders no DOM); the dialog components drop their own
roots and render bare `<DialogContent>`.

**The asset submit's at-rest disabled (R37-B)**: a `disabled` button
leaves the Tab order and deadens the empty-submit — REF keeps the
submit enabled so the native validation tooltip fires. `saving`-only.

**The Add Level mr-1 (R37-C)**: the icon-margin recipe — REF's
interior dialog buttons ride `w-4 h-4 mr-1` (113×32), the header
triggers `mr-2` (160/127/180 wide). Two different margins in one
family; pin the button, not the class.

**The loans text layer (R37-D)**: geometry audits miss text — the
round-36 lesson, re-fired: the Reason placeholder ("Hi, I'm buying an
apartment and I need a loan for the down payment."), required on the
textarea, the Amount "0" default, the Paid From "New Era LLC" prefill
(a hardcoded literal in REF's code — its company is "Demo"), NO
min/max/step on the number inputs (required only; the API's Zod +
toast is the superset), and the silent-return guard → the toast.

**The addendum (R37-E/F)**: the screenshot pixel-diff is a census
instrument — a 3.73% pair (vs the ~1.1% baseline) traced to (E) the
SelectTrigger placeholder-state color (Radix's `data-placeholder`
renders neutral-500 light / neutral-400 dark on REF — NOT the
muted-foreground token) and (F) the Requesting-for card's
`border border-blue-200` (2px of dialog height — the 698-vs-696 drift
that shifted the interior 1px). After both: byte-identical, 1.41%.

**The probe traps (three new)**: (1) 220ms inter-press settles produce
phantom Tab-sequence skips — 300ms+ is the floor (a "skipped Cancel"
artifact disproved by manual trace: only DISABLED buttons are skipped).
(2) the drawer probe needs an explicit closed-state reset before
opening — a second run through an open drawer CLOSES it and reads the
mid-exit frame. (3) NO `//` comments inside flattened evals (a
flattened `//` swallows the closing `})()` — the round-36 newline
lesson's inverse), and property-based reads (`i.type`) over CSS
attribute selectors (`[type=text]` misses REF's attribute-less input).

Recipe pins added: the five DialogTrigger wrappings + the lifted
roots, the asset saving-only disabled, the Add Level mr-1, the loans
reason/placeholder/defaults/no-min-max/no-guard, the SelectTrigger
data-placeholder colors, the card's border-blue-200. Gates: 582/582
unit · 165/165 E2E. Live: 13/13 pair MATCH.

## §51 Session 39 (parity round 38) — the login redeploy re-audit

**The trigger**: REF's /login static JS chunk changed
(index-CneaUv24.js → index-BYE5Ojxh.js) while the login CSS and both
app chunks held — a login-scoped redeploy. The re-audit (desktop
1440×900 +, for the first time, mobile 390×844) found 13 finding
families; the desktop geometry was already byte-identical, so every
find was a recipe/mobile/DOM-structure diff.

**The two-build palette lesson (R38-C)**: REF ships TWO CSS builds —
the login static build (zinc palette: --card-foreground = zinc-950
#09090B, computed rgb(9,9,11) on the typed input text) and the app
build (neutral-950 #0A0A0A). A single shared token cannot match both;
the clone's login card pins `text-[#09090b]` literally. THE TRAP:
putting the override on the page root is NOT enough — the card's own
`text-card-foreground` beats inheritance (ANY rule beats inheritance);
override on the card or the element itself.

**The never-probed-viewport lesson (R38-A/J)**: 37 rounds of
desktop-only login auditing missed an entire responsive dimension —
`h-11 sm:h-12` inputs (44px mobile) + `text-base md:text-sm` (16px
mobile), and the links row `flex flex-col sm:flex-row` (STACKED at
mobile). The flat-row clone wrapped BOTH link labels to two lines at
390px (the two buttons' intrinsic widths 118+176 exactly filled the
294px row → flex-shrink → wrap → h=40 buttons). Always probe the
login/auth surfaces at mobile too — they live outside the app shell
and escape the mobile-nav standing audits.

**The per-button wrapper (R38-F)**: REF's `-ml-4` icon-wrapper pull
applies ONLY to the Google button (its div x=84.8, ml=-16); the
Microsoft/Apple divs carry no pull (x=84.6/98.2 on their own text
widths). A uniform -ml-4 mis-places Microsoft by 8px — the flexbox
centering math with a negative margin: the margin shrinks the child's
outer width (20→4), the free space grows, and the border box lands
16px LEFT of the margin box. Measure each button; do not generalize
from one.

**The negative-space recipes (R38-D/K/L)**: the sm:hidden `&nbsp;`
spacer below the card (pins the card to y=16 + the 18px mobile
scroll), the continuous-line or-divider (an absolute full-width 1px
line + the centered bg-white chip — NOT two segments), and the
blur-xl logo glow (opacity-30 → 40 on group-hover) — all invisible in
a class-list diff, all measurable in geometry/DOM reads.

**The stale-:3200-server trap (the round's environment lesson)**:
after `bun run build`, a still-running standalone server keeps serving
the OLD build manifest's chunk hashes — the rebuilt CSS file no longer
exists under its old name, the stylesheet URL returns a 21-byte
"Internal Server Error" body, and the page renders FULLY UNSTYLED
while `ensure-server.sh`'s HTML liveness check still passes (the HTML
serves fine from the stale RSC cache). Procedure: kill the :3200
process after EVERY rebuild before any browser probe — a page that
suddenly renders unstyled is a stale server, not a code regression.

**The icon-glyph addendum (R38-M)**: the pixel-diff (4.33% vs the
1.1-1.6% baseline on mobile) traced to the Microsoft viewBox (23 vs
24) and a completely different Apple glyph. SVG icons need path-level
diffing, not just size checks. After the fixes: desktop 0.84%, mobile
3.27% — the remainder is REF's fixed "Edit with Base 44" builder badge
(the documented non-clone).

Recipe pins added: 16 (the responsive family, the placeholder, the
spacer, the Sign in recipes, the per-button wrappers, the links row,
the divider, the logo glow family, the icon glyphs). Gates: 598/598
unit · 167/167 E2E. Live: the mobile login pair byte-identical; the
desktop pair MATCH (four documented non-gaps).

## §52 Session 40 (parity round 39) — the shell restructure + the input migration + the careers org view

Three fronts landed together: the login redeploy re-audit (the social
type drop + the theme-inert login), the global Input/Textarea/Select
migration to the v4 shadcn family (bg-transparent + text-base
md:text-sm + at-rest shadow-sm + ring-1 offset-0 — a silent
post-round-19 REF redeploy caught by re-measuring the loans dialog),
and the app-shell restructure to REF's shadcn Sidebar architecture
(the peer wrapper + fixed panel + the `flex-1 overflow-auto` scroll
container, header inside main, bottom nav as the canvas's child).

**The `w-(--sidebar-width)` lesson (the round's core v4 trap)**: REF's
DOM carries the v3-era bracket form `w-[--sidebar-width]`, and REF's
CSS generates `width:var(--sidebar-width)`. The clone's v4 build
compiles the SAME bracket form to the invalid raw
`width:--sidebar-width` (no var() wrapper) — the sidebar column
collapses. The v4 parenthesis form `w-(--sidebar-width)` generates the
identical `width:var(--sidebar-width)` output. Rule: when a class
string and its compiled CSS diverge across major versions, pin the
COMPILED OUTPUT, not the authored string (the
gradient-arbitrary-value precedent, now with a second witness).

**The docs-scanning lesson**: v4's automatic content detection scans
every non-gitignored file — including `docs/*.md`. The remediation
plans' recipe quotes (bracket class strings) generated dead CSS rules
in the production stylesheet. `@source not "../../docs"` in
globals.css excludes them; the emitted CSS stays clean.

**The two-build split (login vs app)**: REF's login build did NOT pick
up the app-side input migration — its login inputs keep the
pre-migration family (ring-2/offset-2, no shadow, no transition,
ring-offset-background). A shared base + page-level counters is the
clone's equivalent: the login overrides carry `shadow-none
transition-none ring-offset-background focus-visible:ring-2
focus-visible:ring-offset-2`. The counters' cost: shadow-none computes
the transparent-zeros string vs REF's literal `none` — invisible, the
accepted serialization non-gap.

**The scroll-container semantics**: with `flex-1 overflow-auto` inside
main, the DOCUMENT no longer scrolls the page — the inner div does.
Consequences: E2E specs that walk `main`'s children or rely on body
scroll need re-scoping; the print block needs `main > div { overflow:
visible !important }` or print output clips to the first screenful; the
sticky header sits OUTSIDE the scroller (it never scrolls away — same
visual behavior as the old body-scroll stickiness).

**The theme-inert login**: REF's login build ships no theme boot —
`darkMode="true"` survives in storage but `html.dark` never applies on
/login (and dir stays ltr). The clone's THEME_BOOT returns early on
/login; the app pages boot from the same keys after sign-in. This is a
BUILD-scoped behavior, not a route-scoped one — the clone mirrors it
with a pathname guard in the shared root layout.

**The with-data careers surface**: REF's public board carries
cross-tenant demo data (517 company chips) — the first measurable
with-data board. The chips are the v4 Button outline family (h-auto
py-3 px-4, h=46) in `flex gap-3 flex-wrap`; the count h3 pluralizes;
the chips navigate to `/careers?org=<slug>` (REF's own client-side
artifact: the capitalized /Careers path) rendering the org view. The
clone's org state is URL-driven (useSearchParams — safe without a
Suspense boundary because the (app) layout is dynamic via cookies).

**The v4/v3 shadow-slot serialization non-gap**: v4 composes five
box-shadow slots (all transparent at rest) vs REF's v3-era three — the
rendered result is identical; only the serialized string differs. Same
category as lab()/rgba(): compare rendered pixels, not serialization.

Recipe pins added: 21; predecessors amended: 12. Gates: 619/619 unit ·
174/174 E2E. Live: the shell tree pair byte-identical; verify-r39.mjs
4/7 raw MATCH with the 3 diffs all documented non-gaps; the standing
audits 5/5; 16 screenshots (148-155) → 212 captures.

## §53 Session 41 (parity round 40) — the careers family + the login button members

The round opened with a pixel-diff and closed with a data model: the
deferred careers mobile pixel-diff (25.41% pair delta) decomposed into
the content wrapper's rhythm, the shared zero-card family, the first
measurable with-data job card, the apply flow, and the company/salary
model — while the fourth consecutive login redeploy proved
rendering-neutral (the CSS delta was platform font-faces, unused).

**The pixel-diff decomposition method** (the round's transferable
lesson): a whole-region diff percentage is a SUM of independent causes —
decompose it by row-bands against the element map before touching any
code. The 25.41% split into (a) the count-row rhythm rows (480-520, the
wrapper's py-12 vs p-4 — the real fix), (b) the banner gradient rows
(80-320, REF's data-driven 569px canvas overflow — a non-gap, proven by
sampling the computed gradient + width on both sides), and (c) the
chips/zero region (data states). After the fix, band (a) collapsed to
zero and the diff residual is fully attributed to (b) + (c).

**The state-dependent zero-card**: REF's careers zero-card message
differs by STATE — "Check back later for new opportunities!" for the
empty board AND the org view (both live-measured) vs "No jobs match
your search. Try different keywords." for the search-filtered zero.
The card itself is ONE family shared with externaljobapplication: the
Card carries `text-center py-12` itself, the DEFAULT border
(rgb(229,229,229) — NOT slate-200; the base layer's `border-border`
already supplies REF's neutral), the bare `p-6 pt-0` CardContent, the
briefcase `w-16 h-16 text-slate-300 mx-auto mb-4` (self-centering, no
wrapper row), and the h3's `mb-2`. Icon-over-line empty cards ride
FIRST in the content — no heading-before-icon arrangement.

**The with-data job card** (REF's first measurable card, via its
cross-tenant demo board): the title row (`flex items-start
justify-between mb-3`) holds the left block (`flex items-center gap-3`
> the unclassed div > the title `font-semibold tracking-tight text-xl`
+ the company `p.text-sm.text-slate-600`) and the **Open badge — a
DIV**, hand-rolled to REF's full string (rounded-md border px-2.5
py-0.5 text-xs font-semibold + the focus rings + border-transparent +
shadow + hover:bg-primary/80 + bg-green-100 text-green-700 — the
taskmanager count-chip precedent; badge.tsx serves other pages). The
meta stack is `space-y-2 text-sm text-slate-600` with four
`flex items-center gap-2` icon rows (building2 / map-pin / clock — the
type LOWERCASE, no capitalize — / dollar-sign over the salary range);
the description clamps (`line-clamp-3 mb-4`); the full-width gradient
CTA ("View Details & Apply") navigates to
`/externaljobapplication?org=<company-slug>&job=<title-slug>`.

**The company/salary model**: REF's chips are COMPANIES — the org
dimension is the job's company, not its department. JobPosting gained
nullable `company` + `salaryRange`; the chips, the org view, the card's
second line, and the apply slug all read `company`. The apply-flow
params are REF's own dead end (its page renders the zero-state for
them) — the clone's superset slug-filters the external page's list,
keeping the no-match shape at REF parity.

**The login re-audit (the fourth consecutive login-scoped deploy)**:
when the redeploy's CSS delta is platform infrastructure (font-faces
for OTHER apps in the shared bundle), verify USAGE before re-auditing
recipes — a computed-font sweep (`getComputedStyle(e).fontFamily` over
leaf elements) proves the page never uses them, and the recipe re-read
can be scoped to the class-string layer only (this round: the Sign in
button's `ring-offset-background` + `[&_svg]` guards — inert members
for DOM parity). **The toaster frontier closed by finding the fireable
path**: REF's failed login renders the one measurable notification —
a shadcn Alert inside the form, byte-identical on the clone.

Recipe pins added: 17; predecessors amended: 1 (R31-C3's icon order).
Gates: 636/636 unit · 180/180 E2E. Live: verify-r40 3/6 raw MATCH with
the 3 diffs documented (the trap-3 gradient class-string, the org-view
data + cursor-pointer superset, the external superset resolution); the
standing audits 5/5; 8 screenshots (156-159) → 220 captures.


## §54 Session 42 (parity round 41) — the footer focus family + the native select

**The round's census**: the session-38 named remainder — the
keyboard/focus flows in the popovers/menus (round 37 walked the
dialogs; this family never). The walk instrument: open → initial focus
→ Tab/Arrow ×N reading focus → Escape → restore, both apps.

**The green half (the walks already matched)**: the bell Popover —
`div role=dialog` 384×175 at (0,617), focus lands ON the content div
and stays trapped through Tab ×8 (no tabbable children in the zero
state), Escape restores the trigger with aria-expanded=false. The user
DropdownMenu — focus0 = the `div role=menu`, ArrowDown walks the items
in order, ArrowUp reverses, Home/End jump, Escape restores. The
whole-shell Tab sweep: every sidebar element renders the IDENTICAL
blue-500 ring (`rgb(59,130,246) 0 0 0 2px`) both sides; the content
links render browser-default outlines on BOTH (REF authors nothing
there).

**R41-A — the footer ghost family's v4 Button base (the real gap)**:
the bell/moon/عربي/user-trigger carried hand-rolled strings on the
clone; under keyboard focus they rendered the BROWSER-DEFAULT outline
(auto, no ring) while REF rendered `rgb(10,10,10) 0 0 0 1px` (the
base's `focus-visible:ring-1 focus-visible:ring-ring` pair). Adopted
verbatim — including the bell's `relative` (the unread-badge context)
and REF's authored `w-5 h-5` svg glyphs (the base's
`[&_svg]:size-4` guard overrides them to 16px — pin the base BEFORE
matching authored glyph sizes, or the icons render 20px).

**R41-B/T — the moon's conditional glyph + the token fix**: REF's
moon button carries NO color class anywhere — the icon color
INHERITS `text-sidebar-foreground` from the peer wrapper (zinc-700
#3F3F46 light / zinc-100 #F4F4F5 dark). The icon itself is ONE
state-driven svg (moon in light / sun in dark — REF's DOM carries a
single glyph per theme; a class-driven pair keeps a hidden extra
node). The clone's light `--sidebar-foreground` had been set to the
APP-foreground slate-800 — the inheritance only renders REF's colors
after the token fix (240 5.3% 26.1%). Check the token BEFORE removing
an authored color in favor of inheritance.

**R41-C — the plain Radix menu items**: REF's user-menu items are
plain `div role=menuitem` (182px full-row stretch — the shadcn p-1
container's block children stretch). The clone's `asChild`-wrapped
Link/Button surfaced their own tags; the Logout BUTTON rendered 96px
(the highlight pill covered half the row). Plain
`DropdownMenu.Item` divs now — My Profile navigates via onSelect +
router.push, Logout via onSelect + `window.location.href` (the
anti-prefetch contract survives: the HANDLER is the contract, not the
tag — a Next Link to the logout route gets prefetched on menu open
and kills the session).

**R41-D — the employees native select (the v4 engine trap)**: v4's
preflight resets `select { background-color: transparent }`; v3's
(REF's build) does not — REF's native select keeps the UA `buttonface`
fill rgb(239,239,239). Restore with `bg-[buttonface]` (the SYSTEM
keyword tracks the browser theme like the UA default — robust, not a
hex pin). The same row: the search is FIXED `md:w-64` + wrapper
`md:flex-none` (an intrinsic-basis arrangement can silently shrink
after a base migration — re-measure after component-base changes);
the select defaults to "active" (three fresh loads, not "all"); the
focus recipe is `focus:ring-2 focus:ring-blue-500` (page-specific —
NOT the global ring token).

**R41-E — the shadcn Sidebar attribute family**: REF's shell carries
the component's full data-sidebar map — header / content / group /
group-label / group-content / menu / menu-button ×13 (the 5
standalone links + the 8 group toggles) / menu-item ×5 (the
standalone links ONLY — wrapped in `li.group/menu-item.relative`; the
group toggles sit BARE in the ul) / footer. Additive attributes on
the clone's rendered-identical tree + the toggle lis dropped; the
nav-button class recipes stay as-authored (their rendered contract is
pinned by 20+ rounds of audits — attributes are the DOM contract,
classes only change when the RENDER diverges).

**Probe lessons (this round's)**: (1) the a11y snapshot truncates
accessible names — read full class strings from the DOM, never from
snapshot slices (the bottom-tab "missing" bg-blue-50 was a 130-char
read cut); (2) `agent-browser press` dispatches REAL keys — synthetic
KeyboardEvent dispatches never move focus (r37's lesson, re-used);
(3) eval-clicks on Radix triggers close the menu (untrusted events +
focus loss) — use `agent-browser click @ref` from the snapshot; (4)
the Tab-walk break condition must not key on aria-labels the REF
lacks (the superset asymmetry shifts the walk's start element); (5)
the focus-walk probe reads the transient hover state — move the
mouse away (`agent-browser mouse move x y`) before reading rest-state
backgrounds.

## §55 Session 43 (parity round 42) — the login redeploy re-audit: the input base migration

**The trigger**: REF redeployed BOTH login chunks — JS
`index-C-ulo5ek.js` → `index-DRs9_-5K.js` AND CSS `index-BIWjBcok.css`
→ `index-DPOrvWRk.css` (the app chunks quiet; the CSS delta = the same
platform font-face batch round 40 documented, 0 consumers). The
rendered surface stayed byte-identical on both bands — the redeploy
changed the AUTHORED recipes. Four finding families
(`docs/remediation-plan-session43.md`):

1. **R42-A — the login inputs' verbatim base migration.** REF's new
   login-build input component carries the ring-2/offset-2 family IN
   BASE (`py-2 text-base ring-offset-background … focus-visible:ring-2
   focus-visible:ring-ring focus-visible:ring-offset-2 … md:text-sm`)
   and the page tail switched its ring member to the PLAIN `focus:`
   variant (`focus:ring-slate-400`) — so tailwind-merge keeps BOTH the
   base's ring-ring and the tail's slate-400 (the old
   `focus-visible:ring-slate-400` variant CONFLICTED with the base's
   ring-ring and the merge killed it). The round-39 split counters
   (`shadow-none transition-none`) are gone — REF's new base ships no
   shadow/transition members to counter.
2. **The shared-component trap (the round's architectural lesson)**:
   the clone could NOT reach REF's string by overriding the shared v4
   `Input` — tailwind-merge OVERRIDES conflicting members but never
   DELETES non-conflicting ones (the base's `shadow-sm` would survive
   as a `shadow-none` counter REF no longer carries). Fix: hand-authored
   `<input>` elements on the login page carrying REF's verbatim string —
   mirroring REF's own architecture (its login build ships its own input
   component; the two-build split honored). The shared Input stays for
   app pages.
3. **R42-B — the ring token + the scoped --ring override.** REF's Sign
   in now carries `focus-visible:ring-ring` over the login build's
   `:root { --ring: 240 10% 3.9% }` (zinc-950 — the app build's is
   `0 0% 3.9%` neutral-950: the two-build palette split). The clone
   swaps the r38 hex pin (`ring-[#09090b]`) for the token + a
   login-scoped `[--ring:#09090b]` on the root main (full-value form —
   trap 1; scoped so app pages keep the shared neutral token).
4. **R42-C/D — the structural family**: the w-full column flattened to
   THREE direct children (social `space-y-3` group / `relative my-6`
   divider / the form — the clone's nested single wrapper retired,
   render-neutral at 522px both sides); the field DIV adopted REF's
   `space-y-1.5` with the explicit `mt-1.5` KEPT on the relative
   wrapper (the trap-6 v4 restoration — v4's `:where()` space-y lands
   on the INLINE label where vertical margins are ignored; the
   dashboard welcome-row pattern).

**The round's E2E lesson — the transition-settled ring read**: the
Sign in's `transition-all duration-200` (the R38-E1 motion pin)
TRANSITIONS the ring box-shadow in. A shadow read immediately after
the Tab press lands mid-transition and shows the AT-REST slots — while
`getComputedStyle(el).getPropertyValue('--tw-ring-shadow')` already
reads the focused value (the custom properties set instantly; the
box-shadow lags 200ms). The symptom looks like a CSS-var resolution
failure (transparent ring) but is purely the transition window. Wait
past it (~350ms) before asserting the rendered ring. Both apps behave
identically.

**Verification lenses added**: (1) sorted-content DOM-string
comparison — `className.split(' ').sort().join(' ')` neutralizes the
documented tailwind-merge reordering (content is the contract, order
is the two-build artifact); (2) the scoped-token probe — read
`getPropertyValue('--ring')` on the root + a consumer to verify the
override resolves (REF `240 10% 3.9%` ≡ clone `#09090b` — the trap-1
form split, same color); (3) the reverse-walk closure — the Shift+Tab
walks (login + dashboard footer) read with `agent-browser press
Shift+Tab` after arming focus via script: both surfaces structurally
IDENTICAL both apps (the session-38 named remainder closed; the only
text diff is the clone's aria-label supersets).

**Standing notes re-verified**: the failed-login Alert re-fired on the
new build — byte-identical (368×54 @(536,738), same class string; the
lab()/rgba() serialization split the only diff). The login is still
theme-inert. The app-build `--ring` serialization differs (`0 0% 3.9%`
vs `#0a0a0a` — same color). The `comments-in-source` trap fired again
(twice this round — a comment quoting the retired `md:text-sm` pair
inflated a count pin; reworded to prose, per the standing rule).

## §56 Session 44 (parity round 43) — the sidebar shadcn architecture + the desktop collapse

**The frontier**: the s40 shell restructure adopted REF's OUTER peer
architecture but the sidebar's INNER authored surface was never
census'd beyond the r41 attribute names. The round census'd it end to
end and found REF's sidebar is the full shadcn Sidebar component
architecture — plus a genuine functional gap that survived 42 rounds:
**the desktop collapse** (REF's trigger collapses the sidebar to a
47px icon rail — the shadcn `collapsible=icon` mode; the peer flips
`data-collapsible=""` ↔ `"icon"` + `data-state`; every s40 member
already answered, only the state + the matchMedia branch were missing;
REF's own trigger lives in the md:hidden mobile header — 0×0 at
desktop, dormant UI reachable only programmatically).

**The restructure (verbatim REF strings — all pinned in the session-44
block)**: the content is a `data-sidebar=content` DIV (`flex min-h-0
flex-1 flex-col gap-2 overflow-auto
group-data-[collapsible=icon]:overflow-hidden p-3` — the nav ELEMENT
retires); the group p-2 wrapper + the group-label with its
`transition-[margin,opacity]` rail members (authors slate-500) +
group-content w-full + menu ul `flex w-full min-w-0 flex-col gap-1`;
every nav button carries the shared `MENU_BUTTON_BASE` const (the full
`peer/menu-button` string with `!size-8 !p-2` rail members) + the
attribute contract `data-size="default" data-active="false"` (the
literal false on EVERY link — even the active one; the base's
`data-[active=true]:*` members are dead code on REF); the toggle
interior `div.flex.items-center.justify-between.w-full.px-3.py-2.5` >
`div.flex.items-center.gap-3` + the chevron GLYPH SWAP (chevron-down
open / chevron-right collapsed — no rotation); the no-ul submenu
(`div.pl-4.space-y-1` with direct `li.group/menu-item.relative`
children); the HOVER-PAIR SPLIT (only leaves/subleaves carry
`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground` — that
is how the toggle's blue hover survives) + the dead
`hover:custom-accent-bg` member; the active recipe
`custom-primary-bg text-white font-medium shadow-sm` + the inline
`background-color: rgb(24, 119, 242)` style (NOT bg-primary); the
token corrections (light sidebar-accent was a wrong blue tint,
accent-foreground was missing → zinc-100/zinc-900 light +
zinc-800/zinc-100 dark; the `--primary-color`/`--accent-color` vars +
the two UNLAYERED `.custom-*` !important rules).

**The tailwind-merge contract**: REF's raw concatenation keeps
duplicate `flex`/`items-center` and both `gap-2`+`gap-3` in the leaf
strings; the clone's `cn()` dedupes/resolves them — the RENDERED result
is identical (the stylesheet's numeric order makes gap-3 win on REF
too, and the subset-axis rule keeps p-2 alongside px-3 py-2.5 on both).
Verification compares sorted, deduped sets with the gap-2→gap-3
resolution applied to both sides.

**Verification lenses added**: (1) the v3 leading-`!` compile probe —
Tailwind 4.3.3 still parses the legacy leading-`!` important forms
(verified empirically with the repo's own @tailwindcss/postcss:
`group-data-[collapsible=icon]:!size-8` compiles to the important rule
— don't assume the upgrade guide's "moved to the end" broke the legacy
parse); (2) the direct-child svg guard read — `[&>svg]:size-4` is a
`.class > svg` selector, so a leaf's top-level icon renders 16px
(authored w-5 h-5) while the toggle's interior-nested icon keeps its
authored 20px (the guard misses it — live-measured on both apps); (3)
the custom-property resolver — Chrome's newer engines RESOLVE
color-function-valued custom properties in getComputedStyle (the
clone's `hsl(240 4.8% 95.9%)` reads back as `#f4f4f5`; REF's raw
triples stay as-is) — normalize both to rgb triples before comparing;
(4) the recursive hover polyfill — v4 nests the `@media (hover:hover)`
blocks inside `@layer` group rules, so the unwrap must recurse through
grouping rules (5 media blocks on the current build); REF (v3) needs
no polyfill (its hovers apply directly).

## §57 Session 45 (parity round 44) — the login interior: the runtime-injected ring cascade + the icon color family

**The frontier**: two login redeploys mid-session (the 8th + 9th —
JS + CSS both, each time) triggered the full login re-audit per the
round-42 precedent. The rendered geometry matched everywhere; the
vein was the dimensions 43 rounds never reached — the rendered
COLORS (the icon strokes/fills, the focused ring) and the loading
interior.

**THE RUNTIME-INJECTED TAILWIND BLOCK (the round's headline
mechanism)**: REF's login ships a SECOND Tailwind stylesheet as an
inline `<style>` (199 rules, 17,813 bytes — a complete v3.4.17 build)
injected by the platform runtime into the HEAD AFTER the linked
stylesheet. Its two plain-`:focus` rules sit at equal specificity
with but LATER IN DOCUMENT ORDER than the linked CSS's
focus-visible ring rule — so they WIN: REF's keyboard-focused inputs
render a SLATE-400 ring, not the token ring. The clone (v4 orders
focus-visible after focus; the login-scoped `[--ring:#09090b]`
resolves the token) rendered zinc-950. **The fix is pure cascade**: a
plain `<style>` rendered IN PLACE inside the login's root main (no
`precedence` prop — React 19 keeps it in the body, AFTER the head
links, the same winning position REF's runtime achieves) carrying
REF's two verbatim rules; the inputs' class strings stay untouched.
Scope: the block is login-only on REF (the app pages carry no inline
block) and `focus:ring-slate-400` appears nowhere else in the clone's
source — the mirror is naturally scoped.

**The icon color family**: (a) the field icons — REF's verbatim
class carries `text-slate-500` (the clone authored slate-400 — the
icons rendered LIGHTER) + the v3 `transform` member; the Mail GLYPH
is the OLDER lucide revision (rect first + the `8.97 5.7 a1.94` arc —
the current lucide-react ships path-first + the `8.991 5.727 a2`
arc), so the lucide-react Mail/Lock imports retired in favor of
hand-authored svgs with REF's verbatim glyphs + attrs + class (the
Lock glyph already matched); `pointer-events-none` is the clone's
superset — dropped for REF parity; (b) the Apple logo — REF authors
`fill="#000000"` ON THE PATH (no svg-level fill → renders BLACK);
the clone's svg-level `currentColor` rendered the button's slate-700;
(c) the Microsoft squares — REF's own variant order red/blue/green/
yellow (blue TR, green BL — NOT the real logo's green/blue); (d) the
Google icon's paths serialize `d` before `fill`.

**The loading state** (never census'd before — the specs assert the
Alert, not the submit interior): REF's Sign in swaps to
"Signing in..." + disables + renders the spinner
`lucide-loader-circle mr-2 h-4 w-4 animate-spin` (the glyph matches
the clone's Loader2; only the text swap + `mr-2` were missing). The
state lasts <40ms on REF — the capture needs the state HELD: the E2E
holds the login API open via route interception; the live probe took
a same-tick snapshot.

**Verification lenses added**: (1) the FULL-document cascade read —
the linked stylesheet's byte order said focus-visible should win; a
SECOND runtime-injected inline `<style>` after it is what flips the
ring (enumerate every style-bearing node in the document, head AND
body, before concluding anything from one file's byte order); (2) the
held-state capture — transient UI states (<40ms) need route
interception (E2E) or same-tick snapshots (live probes); (3) pixel
proof before dismissing serialization splits — the `lab()`/`rgba()`
split on `bg-slate-50/50` converts one red unit off the pinned hex
via lab math but rasterizes PIXEL-identical on canvas ([247,249,251,
128] both sides).

## §58 Session 46 (parity round 45) — the hidden view-swapped login flows

**The round's headline**: the census finally CLICKED the dead ends. Two
complete flows hid behind the login's action buttons for 44 rounds —
their failure mode (an error Alert on the pre-superset clone) looked
terminal, so no probe ever fired them. On REF they are full
view-swapped flows: the card's `w-full` column unmounts EVERYTHING
(logo, welcome title, social row, or-divider) and renders:

1. **The password-reset view** — the `-mb-2` back button (the
   hand-authored arrow-left), the `text-center space-y-2` title group
   ("Reset your password" + the instruction P), the one-field form
   (`space-y-4 sm:space-y-5`), the "Send reset link" CTA swapping to
   "Sending..." + the r44 mr-2 spinner, then the **success view**: the
   slate-100 icon circle (the older-lucide mail at slate-700), the
   "Check your email" H2, the two-line P with the
   `font-medium text-slate-900` email span, the GREEN Alert
   (`bg-green-50/70 border-green-200` + `text-green-700`), and the
   full-width back button. **Anti-enumeration verified live** — a
   non-existent email renders the identical view.
2. **The sign-up view** — the BARE `space-y-4` wrapper (16px both
   bands), the H2 DIRECT (no subtitle), the three-field form
   (`space-y-3 sm:space-y-4` around a bare `space-y-3` fields group;
   ids email/password/confirmPassword), the duplicate-email error with
   REF's verbatim "A user with this email already exists" INSIDE the
   form, and the "Creating account..." loading swap.

**The sibling input family** (a per-view authored difference the
sign-in pins would have masked): `h-10 sm:h-11` (44px) +
`placeholder:text-slate-400` (the sign-in pair ships `h-11 sm:h-12` +
`placeholder:text-slate-600`); the reset input carries `text-base`
mid-string, the signup trio the `text-sm sm:text-base` tail pair; the
field icons are the same older-lucide glyphs at **slate-400**; NO
autocomplete attrs.

**The trap-6 restorations** (the round's rhythm subtlety): REF's
authored `-mb-2` on the back buttons beats v4's zero-specificity
`:where` space-y margin-bottom, and v4's label margin is ignored on
the inline label — so the clone authors the members REF's v3 runtime
supplies invisibly: `mt-4 sm:mt-6` on the reset title group, `mt-4` on
the signup H2, `mt-1.5` on the field units' relative wrappers (the r42
pattern). The verify's rhythm comparison therefore drops the raw
mt/mb values (v3 lands mt on FOLLOWING siblings, v4 mb on PRECEDING —
the same rendered gaps via the other margin side) and contracts on the
y/h geometry.

**The `--foreground` fix**: REF's login build sets zinc-950
(`240 10% 3.9%`) at `:root` — the r42 `--ring` precedent's sibling.
The login main pins `[--foreground:#09090b]` so the Alert family's
`text-foreground` resolves rgb(9,9,11) (the app pages keep the shared
neutral token).

**The API seams** (the functional superset): `POST
/api/auth/forgot-password` — zod + the login-family rate limiter +
ALWAYS ok (the anti-enumeration contract; no email transport wired);
`POST /api/auth/signup` — the verbatim duplicate copy on 409, the
new-email path creates the user + sets the session cookie (the
auto-login redirect to the null-safe dashboard), the client guards
the confirm-mismatch path.

**Pins**: 16 new (A1-A6 the reset view, B1-B4 the signup view, C1-C3
the success view, D1-D2 the API routes, E1 the foreground) + 5 amended
(R38-G1 the foreground member; R18-E/R38-A2/R39-C1/R44-A2 — the four
count pins re-anchored to the sign-in form region, the sibling input
family now carries the same token members page-wide). Gates: lint 0/0
· tsc ✓ · 697/697 unit (+16) · build ✓ · 209/209 E2E (+6). Live:
verify-r45 **13/13 MATCH** (the duplicate Alert's bg canvas-rasterized
**254,242,242,179 on both apps** — the lab() split pixel-proven);
standing audits 5/5 + route sweep 12/12; 10 screenshots (176-179) →
262 PNG; DB pristine.

**The round's transferable lessons**: (1) census the dead ends — fire
every button whose failure mode looks terminal; two full flows with
complete contracts hid behind the login's action row; (2) probe
finders must match accessible names by EITHER mechanism — REF silently
dropped the sidebar trigger's aria-label (the name now rides the
sr-only span; the drawer opens identically, the clone's extra attrs
are kept supersets); (3) the v3/v4 space-y margin-side split makes
raw mt/mb un-comparable across apps — the y/h geometry is the
contract, and the authored restoration members must strip from class
comparisons as documented supersets; (4) the DB pristine check earns
its keep — the loading-state live probe fired a REAL signup (users=2);
the throwaway user was caught + cleaned before the commit.

## §59 Session 47 (parity round 46) — the zero-state app-page interiors

**The round's unlock**: a ZERO-TENANT scratch server (a second standalone
on :3201 against a user-only db — mirroring REF's 0-employee tenant) so
the zero-data app pages compare like-for-like. 45 rounds censused the
h1s (the route sweep); the INTERIORS at zero data were a blind spot.

**The findings**: (1) the page-root families — a `relative overflow-hidden
> touch-pan-y` pair on seven pages (attendance nests it inside its
gradient root; the invisible absolute-top deco widget is non-clone), the
v3 `bg-gradient-to-br` gradient forms (the clone rendered the same colors
via arbitrary-value strings but MISSED the `dark:` pairs — a real
dark-mode diff), the bare staffrequests wrapper; the page-root
`select-none` family LEFT REF. (2) The CardTitle TAG is the div (the
session-6 comment already said so; the scaffold kept the h3). (3) The
dashboard's zero-state renders the DEFAULT leave-balances UI (Annual
21/21 blue + Sick 30/30 green — not an empty state), the bare-anchor
quick-action structure, the Customize wrapper. (4) The profile's hidden
avatar input + the full_name/email/phone/job_title id family. (5) The
icon glyphs: the old-lucide upload, the circle-first slate-400 search,
the Kanban (not SquareKanban) toggle, the doctrtracker
file-text/circle-check-big/triangle-alert/circle-x family.

**THE CENSUS CORRECTION — the round's transferable lesson**: the first
read claimed "REF hides the payroll/recruitment stats at zero" — an
INSTRUMENT ARTIFACT. Both the outline reader (h1-h4/p/button) and the
stat detector (P.text-3xl) were P-based; REF renders its standard/compact
stat values + labels as DIVs. The verify's text-level read caught it
live; the conditionals were reverted and the REAL diffs fixed (the icon
families + the per-variant element tags: standard + compact values →
DIV, the horizontal label → P, the compact label slate-500). **Never
scope a structural census to a tag subset when the family's tag is
itself unknown — dump all elements, or verify the negative with a
text-level read.**

**Probe-tooling lessons (the round's additions)**: the `//`-comment
one-liner trap re-fired (split-join collapses template-literal comments —
the session-46 lesson, now double-earned); the template-literal `\S`
escape (`` `text-\S+` `` arrives at the browser as `text-S+` — the file
needs `\\S`); the agent-browser screenshot CLI resolves RELATIVE paths
against its own cwd — pass absolute paths.

Gates: lint 0/0 · tsc ✓ · 718/718 unit (+21) · build ✓ · 217/217 E2E
(+8). Live: verify-r46 25/25 + verify-r45 13/13 (the 13th login deploy,
mid-round) + standing audits 5/5 + route sweep 12/12 · 270 PNG · DB
pristine.

## §60 Session 48 (parity round 47) — the unmapped-route interiors

The 46-route interior census (r46 covered 12 canonical routes; the
remaining ~46 censused with three batch instruments + the rows/stats/
rootmap/zone readers + the svg-class probe — svg.className is an
SVGAnimatedString, invisible to class-string readers). THE INSTRUMENT
CORRECTION (the round's transferable lesson): the census/zone readers
JOIN adjacent child text nodes with ' ' — JSX interpolation produces
phantom spaces; raw-textContent verification DISSOLVED the entire
suspected "space-in-template" family (only advancedanalytics' two
label texts were real: "Avg Tenure (months)" / "At Risk (AI
Prediction)"). A text-outline instrument may never be trusted for
spacing claims.

(1) THE KICKER FAMILY: every clone kicker h1 missed REF's
dark:text-white (a real dark-mode diff) + the dashboard's hand-rolled
kicker was the pre-r46 form (the r46 A5 fix updated the component but
missed the copy). (2) THE ROOTMAP: 27 arbitrary bg-[linear-gradient]
swaps → the v3 forms; the flex-col gap wrappers → REF's max-w-Nxl
mx-auto space-y-N verbatim (organogram max-w-FULL; chat/
hrassistantchat/employees no space member; the p-6 family on
hrreports/workflowconfigpage/notificationpreferences); the merged-root
five (p-4 md:p-8 space-y-8 + gradient ON the root, NO inner wrapper);
the bare roots (announcements/recruitmentkanban/requestreports/
requestsettings); payrollreports' PageCanvas trio; employeeportal's
p-4; the stubs (/home = an empty div; /employeedetail = the centered
CSS spinner; /employeeselfservice mirrors REF's centered loader for
the suspense phase — the resolved no-profile state stays the
informative superset, the documented divergence). (3) THE HEADER-ROW
FAMILY: REF's md rows carry the UNPREFIXED justify-between +
items-start members; six rowBreakpoint="md" passes;
performancemanagement actionsStart. (4) THE STAT FAMILY (the
biggest): valueTag/labelTag call-site overrides; the no-tile rewrite
(label-TOP p + value-BELOW p mt-1 + the BARE per-color svg —
correcting the session-14 R13-I mis-attribution); THE TILE
ARCHITECTURE: REF's tiles carry geometry + bg only, the icon size +
color ride the svg's own classes (compact w-10 h-10 … mb-3 rendered
DIRECTLY, no flex wrapper; standard/tile-right w-12 h-12); 13 pages'
call sites updated with the icon-name corrections (compliance
circle-x/triangle-alert/circle-check-big/shield; assetmanagement
package/laptop/circle-check-big/wrench; attendance users/
circle-check-big/circle-x/clock/trending-up; payrollmodule
dollar-sign ×4; surveyanalytics minus; expenses circle-check-big/
dollar-sign; surveys message-square/eye/users/trending-up); the four
analytics compacts p/p + slate-600; advancedanalytics/payrollai/
allleaverequests p/p + mt-4. (5) THE ZERO-STATE AFFORDANCES (the r46
training precedent extended): announcements/hrletters/templates/
performancemanagement/hrassistant — the zero-state CTAs retire; the
create flows ride with-data header actions. (6) THE QUICK HITS:
compliance's At-Risk card header (bg-slate-50 py-3 px-4 + the flex
gap-2 title + the classless empty P); requestreports' integer stat;
recruitmentkanban's chips = REF's badge-form DIVs (bg-slate-200
text-slate-700 + the focus ring family).

Pins: 27 new + 20 amended (+2 E2E contracts). Gates: lint 0/0 · tsc ✓
· 745/745 unit (+27) · build ✓ · 228/228 E2E (+11). Live: verify-r47
24/24 (the 48-route rootmap + the stat/tile zones + the kicker + the
affordances + the stubs — normalized for the render-neutral splits:
sorted class members, the mb-0 strip, the suspense comment markers) +
verify-r46 25/25 + verify-r45 13/13 (the 15th login deploy) + standing
audits 5/5 + route sweep 12/12. 18 screenshots (184-192) → 294 PNG.
DB pristine. Tooling: the Next standalone server does NOT load .env —
pass DATABASE_URL inline; the agent-browser evals flake under
sustained load (verify-r47's evalOn retries once).

## §61 Session 51 (parity round 50) — the route-casing alias + the mobile-nav census

The frontier after §60: every app route's interior was deep-measured
(rounds 45-49); the remaining veins were the login redeploy watch, the
byte-parity backlog, and the live edges. This round's census re-verified
them and found one real functional gap.

**THE ROUTE-CASING GAP (the round's fix)**: REF's Base44 platform serves
routes case-INSENSITIVELY — its canonical dashboard URL is the capital
`/Dashboard` (the target of its own /organizationsetup +
/dynamicdashboard redirects) while its internal links use the lowercase
form (which stays lowercase in the URL bar — no redirect). The clone's
Next.js on a case-sensitive FS served only `/dashboard` — the capital
form 404'd (a user following any REF-emitted /Dashboard URL or bookmark
hit the clone's 404). **The instrument decision (transferable)**: the
fix is a `next.config.ts` rewrite (`{ source: "/Dashboard", destination:
"/dashboard" }`) — the URL bar keeps /Dashboard exactly like REF (a
rewrite, not a redirect), and the content/metadata/auth-guard ride the
REAL lowercase route (no duplication). The alternative — an R31-B1-style
re-export DIRECTORY (`Dashboard/page.tsx` beside `dashboard/page.tsx`)
— collides on case-insensitive checkouts (macOS) and duplicates the
metadata wiring; the rewrite carries none of that risk. Scope: the one
canonical capital form only (REF's other internal links are all
lowercase; wildcard-case aliasing is not a real surface). Pinned by
R51-A1/A2 + the session-51 casing spec (the URL-unchanged serve, the
lowercase regression guard, the auth-guard ride-through — a rewrite maps
into the (app) route stack, so the layout guard applies).

**THE MOBILE-NAV CENSUS (the round's called-out surface, paired live at
390×844)**: the kicker EXACT byte-for-byte (`md:hidden sticky top-0
z-20 bg-white dark:bg-slate-900 border-b border-slate-200
dark:border-slate-800 px-4 py-3 safe-area-top`, h=53, y=89 — and the
scroll-away truth: the sticky never engages inside the scroller stack,
the bar scrolls 1:1 with content, scrollY 178 both sides); the 73px
header EXACT; the bottom bar + five tabs render-equal (member-order-only
class variances — cn() merge order; the clone's
`pb-[env(safe-area-inset-bottom)]` safe-area superset member renders
0px unnotched; the active tab computes identically — text rgb(37,99,235)
on bg rgb(239,246,255)); the drawer render-equal (w=288, borderR 1px
#e5e5e5 — the default border token, distinct from the desktop sidebar's
slate-200 — bg #fafafa, the 500ms/300ms slide timings: REF authors
`data-[state=*]:duration-*`, the clone the explicit
`[animation-duration:*]` utilities; the footer census: REF's 13 buttons
= the clone's 12 + REF's own sheet-Close which REF HIDES via
`[&>button]:hidden`; REF's 2 unlabeled buttons = the clone's aria-label
supersets; the overlay computes rgba(0,0,0,0.8) both sides).

**THE BYTE-PARITY BACKLOG (assessed — all documented render-equal
allowances)**: the CardTitle text-base/leading-none per-page pair (the
DIV base matches REF's default form; on the leading-none pages the
text-base member is inert — a DIV inherits 16px from body), the
badge-span leading-5 no-op (text-sm's default line-height IS leading-5),
the #fafafa/#fff CTA-text pair (REF per-button inconsistent; computed
equal), the chart line-count/recharts-mount-order pairs. None actioned —
changing them would break verified pins for zero rendered difference.

**The instrument lessons**: agent-browser evals flake on LONG one-shot
reads (the zone-probe's combined drawer panel+footer eval failed both
sides; the split reads worked first try); a `div.md\:hidden`-sticky
interior filter finds nothing on a 404 page — always verify the page
actually rendered before reading interiors (the casing gap masqueraded
as a missing kicker for one probe iteration); the :3200 standalone
server sometimes SURVIVES its orchestrator's exit — kill-by-port before
rebooting on a new build.

Pins: 2 new (R51-A1/A2) + the session-51 casing spec (3). Gates: lint
0/0 · tsc ✓ · 791/791 unit (+2) · build ✓ · 255/255 E2E (+3). Live:
verify-r45 13/13 (the 18TH login deploy `DJGK9Qoy`→`ChN8O3_i`) +
standing audits 5/5 + route sweep 12/12 + the /Dashboard live pair
MATCH. 8 screenshots (232-235) → 380 PNG. DB pristine (the
loading-probe user swept — scripts/sweep-loading-probe.ts persisted).

## §62 Session 52 (parity round 51) — the nav-registry drift check + the computed-truth census method

The round's two new measurements, both transferable:

**The nav-registry drift check.** REF's login build is under ACTIVE
development (19 deploys at this census); the clone's 61-route registry
was fixed at the session-32 census. The drift check: expand ALL 8 REF
groups live (`[data-sidebar="sidebar"]` + the chevron buttons), read
the complete nav tree (`a[href]` href+label+order), and diff against
`NAV_ITEMS`. Result: 44/44 links match — no new REF modules. The pin
(R52-A1/A2 in `tests/unit/recipes.test.ts`): the ordered 44-href
registry tripwire + the 5-tab BOTTOM_NAV set — a future REF module or a
clone nav refactor both surface as an immediate RED. Run this census
whenever the deploy watch fires; the pin catches the clone side between
censuses.

**The computed-truth census method.** When the two platforms differ in
class-list CONSTRUCTION — REF's runtime CONCATENATES the shadcn base
with per-item extensions (yielding `gap-2 gap-3` + a duplicated `flex`
in one attribute), the clone's `cn()`/tailwind-merge DEDUPES to the
winner (`gap-3`) — the class BYTES can never match, but the rendered
result can. The method: read the COMPUTED cascade result
(`getComputedStyle`: gap, display, padding) + geometry, and pin THAT
(R52-B in `tests/e2e/mobile-navigation.spec.ts`). Byte-comparing class
strings across construction-different platforms produces false diffs;
comparing computed styles produces ground truth. The same method
settled the round-50 tab member-order family and the byte-backlog
allowances — this round made it explicit and E2E-pinned.

**The instrument lessons.** The agent-browser long-eval flake re-hit at
~1.2k chars (failed under rapid sequencing on BOTH apps; the identical
eval ran clean standalone) — the standing fix: keep one-shot evals
small, split composite reads, and retry once on command failure. The
r52 `evalOn` pattern: parse agent-browser's pretty-printed object
output directly (it is NOT quote-wrapped for objects; scalar strings
ARE — unwrap them), and never let a scalar's parse failure masquerade
as an eval failure. The workspace-reap pattern: the sandbox reaps
detached processes between tool calls — every orchestrator boots its
own :3200 server (kill-by-port first), while the agent-browser daemon
survives because it self-daemonizes.

## §63 Session 53 (parity round 52) — the per-route state-family census

The round's transferable lesson extends §62's computed-truth method:
when a state recipe is ROUTE-DEPENDENT — the same component renders
different state per route (the bottom bar's active tab, a per-page
active nav item, a route-conditioned badge) — censusing the recipe on
ONE route proves the recipe, not the family. Rounds 50/51 measured the
active tab on /dashboard only; this round paired all FIVE tab routes
(390×844, both apps) and found the family identical — each route
highlights exactly its own tab (blue-600 `rgb(37,99,235)` on the
blue-50 `rgb(239,246,255)` pill; siblings slate-600 on transparent;
icons tracking labels via currentColor).

**The method**: (1) enumerate every route that exhibits the state
(the 5 BOTTOM_NAV hrefs); (2) pair each one live, reading the COMPUTED
family (color/background/font-weight/icon-color) — not the class
bytes; (3) pin the family as a route-walking E2E test (`for (const c
of cases) { goto; expect(active computed pair); expect(inactive
sibling) }`) so the ACTIVE-MATCHING LOGIC is guarded per-route, not
per-recipe. The clone's bottom bar matches with `pathname === tab.href`
(exact equality) — a future prefix route or a startsWith regression
breaks exactly one case, and the pin names the route.

**The round's deploy lesson**: a login-build deploy that changes BOTH
chunks (JS + CSS — the 20th, the first CSS churn in ~15 deploys)
justifies re-reading every registry-shaped surface the deploy could
touch (the nav tree), even when the app-side fingerprints are quiet —
the registry re-check read both sides' complete trees (52 entries: 10
group triggers + 44 leaves) and found zero drift, converting a
hash-change scare into a census record. The 20th deploy also confirms
the standing watch pattern: verify-r45 standalone (13/13) + the app
side's confirmation ladder (standing 5/5 + sweep 12/12 + verify-r49
13/13) — the app-side instruments re-run through every login deploy
because the two builds deploy independently.

## §64 Session 54 (parity round 53) — the interaction-walk census

**The frontier problem**: rounds 50–52 pinned the mobile navigation's
every STATIC family — the at-rest chrome, the drawer panel/footer, the
expanded-group interiors, the per-route active states. But a surface's
static families can all match while its INTERACTION family diverges:
no prior round had paired the full user journey (open → expand →
navigate → dismiss) live. The never-paired-live behaviors are exactly
where silent divergences hide.

**The walk** (`scripts/r54-census.mjs`, both apps at 390×844, seven
paired phases): the at-rest chrome → the hamburger tap's settled
drawer family → the drawer's DEFAULT group-state map → the group
expansion round-trip → the leaf-tap navigation → the overlay-tap
close → the bottom-tab tap + active pair. **7/9 MATCH; the 2 DIFFs
are the same finding** — REF's drawer STAYS OPEN after a leaf tap
(`data-state="open"` at 500ms and 1900ms, real CDP clicks) while the
clone closes it: the documented reference regression from session
10/11 (its own drawer auto-closed in the early builds, a redeploy
broke it, 3/3 trials then), re-verified live 43 rounds and 20 login
deploys later. The deviation direction stays (the clone's auto-close
is the superset: the standard mobile pattern + a pathname-change
effect covering browser-back, which REF's drawer also survives open).

**The instrument rules** (two false DIFFs in the first draft):

- **The visible-link rule**: a raw selector click
  (`a[href="/training"]`) hits the FIRST DOM match — on the clone
  that's the hidden desktop-sidebar copy (its DOM precedes the drawer
  portal; REF's portal precedes its sidebar). The click on a hidden
  element is a no-op — the instrument silently measures nothing.
  Filter for visibility (`offsetParent !== null`) or scope to the
  drawer's own container before clicking.
- **The symmetric-settling rule**: paired reads must settle for the
  SAME delay after their respective dispatches. The first draft read
  REF 1.2s after its overlay tap (fully closed + unmounted) but the
  clone ~0ms after (mid exit-animation, `data-state="closed"`) — a
  false DIFF from timing asymmetry, not behavior.
- **The Radix overlay rule**: the Dialog outside-close contract
  listens for `pointerdown`/`pointerup`, NOT bare `click()`. A
  synthetic overlay tap must dispatch the full pointer sequence
  (`pointerdown` → `pointerup` → `click`, all bubbling) or it proves
  nothing — bare `click()` dispatches are silently ignored.

**The pin** (R54-A): the drawer's DEFAULT group-state map E2E guard —
all 8 nav group triggers + the footer bell render
`aria-expanded="false"` at first open, the collapsed groups' sub-item
leaves hidden. The full-menu pin asserts the 13 top-level labels
render but NOT the collapsed-default contract; a nav refactor that
pre-expands groups (or a Collapsible `defaultOpen` drift) would pass
every standing pin while changing the drawer's at-rest interior. The
pin walks the census-verified both-sides state.

**The lesson**: when a surface's static families are all pinned, the
next census frontier is the interaction walk — enumerate the surface's
user journey (its every state transition a finger can cause), pair
each step live, and pin the contracts that lack a guard. The
interaction family is also where the documented-deviation re-verification
lives: a reference regression recorded 43 rounds ago still reproduces
today, and the re-verification is itself census value (the deviation
list stays current without a new investigation).

## §65 Session 55 (parity round 54) — the auth-boundary navigation walk

**The frontier problem**: every prior census round signs in and signs
out to REACH its surface — the boundary journeys themselves (the
post-login landing, the logged-out guard, the logout carry, the
from_url round-trip) were never the measured object. The §64 lesson
generalizes past a single surface: the JOURNEYS BETWEEN surfaces are
themselves a parity family, and URL-level contracts diverge just as
silently as pixel-level ones.

**The walk** (`scripts/r55-census.mjs`, seven paired phases, both
apps at desktop): the post-login landing (no from_url) · the root
serve · the root guard · the deep-route logged-out guard · the
from_url round-trip · the logout walk (user menu → Logout) · the
authed /login stay. **1/7 MATCH — six real functional gaps, one
family**: REF's post-login landing is the ROOT `/` (its index route
serves the dashboard, URL-unchanged) while the clone landed at
`/dashboard`; REF's guard carries the REQUESTED absolute URL as
`from_url` while the clone's (app) layout hardcoded `/dashboard`
(App Router layouts receive no pathname); REF's logout carries the
CURRENT page; REF's from_url is the full absolute URL. The deep-link
round-trip (share a URL → sign in → land where you meant to go)
worked on REF and broke on the clone — a genuine functional-parity
gap, not an allowance.

**The fixes** (all closed, post-fix census **7/7 MATCH**):

- **The root rewrite** (`next.config.ts`): `{ source: "/",
  destination: "/dashboard" }` — the session-51 URL-unchanged-serve
  pattern's sibling. REF serves the dashboard AT the root; the clone
  now does too. `src/app/page.tsx` removed (beforeFiles rewrites
  precede the filesystem — the page was dead code).
- **The edge proxy** (`src/proxy.ts`): Next 16's `proxy.ts`
  convention (`middleware.ts` is the deprecated name — both work,
  the regexp constants live in `next/dist/lib/constants.js`). A
  cookie-PRESENCE guard at the edge carrying
  `from_url=<the request's absolute URL>`; the (app) layout's full
  HMAC + DB verify stays as defense-in-depth for present-but-invalid
  cookies. Two-tier by design: the edge check is cheap and
  path-aware; the layout check is authoritative but path-blind.
- **The resolver** (`src/lib/login-redirect.ts`):
  `resolveFromUrl(from, origin)` — the open-redirect guard. Path-form
  (leading `/`, not `//` or `/\`) passes; same-origin absolute URLs
  extract pathname + search; everything else → null → the root
  default. REF's absolute format and the clone's historic path format
  both honor; the foreign-origin forms never redirect.
- **The logout carry** (`src/app/logout/route.ts`): the same-origin
  Referer rides as `from_url` — the user-menu logout navigates via
  `window.location.href` (the R35-A6 anti-prefetch contract), so the
  browser attaches the current page as Referer.

**The pins**: R55-A..E + G (6 E2E) + the 9-form resolver unit table
+ the R51-A2 rewrite-scope pin extended (the root joined the closed
rewrite family) + the session-47 signup-landing pin re-targeted (the
signup rides the same landing contract — the view-swapped login
shares one URL).

**The instrument rules**:

- **The in-place sign-in rule**: a capture that re-opens `/login`
  fresh WIPES the guard's from_url param — the round-trip evidence
  requires signing in AT the guard's landing URL. Same class as the
  §64 visible-link rule: the instrument's navigation must preserve
  the state it is about to measure.
- **The oneLine eval rule re-hit**: multi-line eval expressions fail
  on the literal `\n` between JS tokens ("Invalid or unexpected
  token") — one-line every expression before `JSON.stringify`.
- **The Host-header authority rule**: in standalone mode,
  `req.nextUrl`'s re-derived origin can spell the host differently
  than the browser (`localhost` vs `127.0.0.1`) — build redirect
  targets and from_url params on the REQUEST's Host header (the
  browser's actual authority), or the login's same-origin resolver
  silently rejects the round-trip.

**The lesson**: when a surface's static and interaction families are
all pinned, the next frontier is the boundary journeys — sign-in,
guard, logout — because every census passes THROUGH them and none
ever measures them. URL-level parity is functional parity: the
deep-link round-trip is a user-visible behavior, and its fix (the
proxy + the resolver) is also the security surface (the open-redirect
guard) — the parity fix and the hardening land together.

## 66. The history journey walk + the read-only surface family (session 56, parity round 55)

**The frontier problem**: round 54 censused the AUTH boundary's
journeys; this round took the §65 lesson one layer deeper — the
**history stack's walks** (back, forward, scroll restore, the drawer
journey, the tab journey): every census signs in and clicks through
routes, but the back button's URL/content/active-leaf contracts were
never the measured object. And the mobile-grid reconnaissance
surfaced a second never-measured family: **REF's `bg-slate-50`
read-only recipe** — the gray-filled, inert surfaces (tiles, the
identity email, the table headers) whose interiors sat below every
prior census's measurement threshold.

**The walk** (`scripts/r56-census.mjs`, seven paired phases at
1440×900 + the mobile drawer phase at 390×844): the simple back ·
the forward restore · the two-deep chain · the scroll restoration ·
the settings tab journey · the /Dashboard casing · the mobile drawer
journey. **6/7 walk contracts MATCH** (the scroll family in steady
state; REF's FIRST popstate after a fresh load can reset to top —
the SPA initial-mount race, non-deterministic [0,40,40], not a
contract). The drawer journey is the documented session-10 deviation
re-verified through its back extension.

**The read-only surface family** (the supplementary census — four
real visual gaps, ALL closed):

- **R56-A — the settings Company tiles**: `p-4 bg-slate-50
  rounded-lg` + the Address tile's UNPREFIXED `col-span-2` — the
  always-on span that forces the 2-track implicit grid below md (REF
  at 390px computes 2 content-sized tracks; the clone had a stacked
  921px column). The R13-B pin had covered the grid + labels, never
  the tile interiors — the longest-lived gap of the family.
- **R56-B — the profile identity Email**: disabled +
  `bg-slate-50` (REF live-measured; the clone rendered it editable).
- **R56-C — the profile Phone/Job Title placeholders**: removed
  (REF renders both empty fields bare; the placeholders were an
  early-build authoring, never REF-verified).
- **R56-D — the hrreports thead row**: a plain
  `<tr className="border-b bg-slate-50">` (REF's computed
  rgb(248,250,252) 33px inert header; the clone rode the shadcn
  hover-tinted TableRow default).

**R56-E — the history-stack corruption (RECORDED, a Next.js 16.4.0
framework bug)**: after a full document load of ANY (app) route, the
SECOND client-side navigation replaces the fresh-loaded entry's URL
with a duplicate of the entry below it — the Navigation API entry
dumps show `["/profile", "/"]` → one click →
`["/profile", "/", "/staffrequests"]` → a second click →
`["/profile", "/profile", "/staffrequests", "/training"]`. The user
loses the page they landed on (back-back skips it). 5/5
deterministic in the isolated repro (`scripts/r56-probe8.mjs`),
generic across routes (the beforeFiles rewrite is INNOCENT — verified
with plain routes); the clone's own code performs no history
manipulation. Not fixable in-app without hand-patching framework
internals: the E2E pins the CORRECT one-click back contract, the
repro script is the standing detector, and the follow-up is the
Next upgrade watch (`docs/remediation-plan-session56.md` §B).

**The pins**: R56-A..E (5 E2E in
`tests/e2e/session56-readonly-family.spec.ts` — computed-truth, the
r52 method) + 4 unit pins (the R56-A..D recipe family).

**The instrument rules**:

- **The Navigation API rule**: `navigation.entries()` is the ground
  truth for history-stack forensics — the URL bar and
  `history.length` cannot distinguish a replaced entry from a
  truncated one (a corrupted stack LOOKS like a stuck back button).
- **The viewport-verification rule**: verify `window.innerWidth` in
  the same session before mobile-grid measurements — `agent-browser
  set viewport` failures are silent and the default viewport is
  ~1280 (a "mobile" census that never re-settles measures desktop
  widths and invents phantom divergences).
- **The raw-comparison rule**: the census `ev()` wrapper's
  ERR-strings still compare soundly (agent-browser returns raw
  objects unquoted and string values quoted — the double-parse
  ERR-wraps half the returns; compare the RAW forms, not extracted
  fields).

**The lesson**: the census frontier has two remaining layers past
surfaces — the boundary journeys (round 54) and the history-stack
walks (this round) — plus the sub-threshold interiors (the read-only
recipe): a surface's STATIC pin can pass while its tile-level
computed truth diverges, because the pin asserted the container and
never the contents. When a divergence hides below the measurement
threshold, the fix is the computed-truth method applied one level
deeper — not a new census family.

## 67. The affordance-stub family (session 57, parity round 56)

**The layer this round censused:** the click behavior of the
affordances every census SEES but never presses — buttons that fire
info toasts in the clone where REF opens real dialogs / hidden file
inputs, plus two invented profile tab interiors. Pre-fix
**0/6 MATCH** (`scripts/r57-census.mjs`, five paired phases);
post-fix **6/6**. The instrument lessons: (1) a bare eval `.click()`
on a Radix TabsTrigger fires no `pointerdown` — the tab never
activates; use the REAL browser click (snapshot ref →
`agent-browser click`); (2) `//` comments inside eval templates
swallow the expression when the newlines collapse to the one-line
shell command; (3) the two-parse `ev()` ERR-wraps bare-string
returns — state reads must return JSON; (4) the exported
`DATABASE_URL` trap re-fires per tool-call — prefix every
db-touching command with `unset DATABASE_URL`.

- **The import superset** (`src/components/shared/bulk-import-dialog.tsx`
  + `src/app/api/employees/import/route.ts`): REF's verbatim
  Bulk Import Employees recipe (max-w-5xl — the file-spreadsheet
  icon title, the 4-step info alert, the w-full template button, the
  dashed dropzone with the filename swap + Process File →
  "Processing..." states, the destructive "Validation Errors:"
  alert, the Cancel/X footer) + the WORKING flow REF lacks (REF's
  own Process File fails on its own template's format — measured
  live): the exact 7-column template blob, the client-side parse,
  per-row validation, the review table, the Import POST (admin/hr
  gate, full_name split, duplicate-email skip, the honest
  created/skipped summary).
- **The media superset** (`src/app/(app)/companywall/page.tsx` +
  `src/app/api/posts/route.ts` + `src/app/api/media/[name]/route.ts`):
  REF's hidden `#media-upload` input contract (one shared input,
  `accept="image/*,video/*"`, class `hidden`) + the composer
  preview, the multipart post, `db/uploads/` storage, the
  path-guarded serve-by-extension route (name regex + no `..` +
  extension allowlist), and the media rendered on the post card.
- **The WhatsApp config** (`src/components/shared/whatsapp-dialog.tsx`
  + `src/app/api/integrations/whatsapp/route.ts` + the `Integration`
  model): REF's verbatim Configure WhatsApp API dialog (max-w-lg,
  the 3 fields + placeholders + required pair, the Cancel/Save
  Configuration footer, `tracking-tight` on the title) + the
  persistence REF lacks (REF's save closes silently — measured).
  SMS/ZKT stay the REF-parity no-op stubs (measured: no dialog on
  REF either).
- **The profile tab rebuilds** (`src/app/(app)/profile/page.tsx`):
  the Social tab = REF's Connected Accounts card (the 4 icon-tile
  rows — LinkedIn `bg-blue-100`/`text-blue-600`, Twitter
  `bg-sky-100`/`text-sky-600`, GitHub, Facebook — with the URL
  inputs + Save Accounts; persists to the 4 new User fields); the
  Preferences tab = REF's two-card recipe (the 2 `p-4 bg-slate-50`
  toggle rows + Save Preferences; the red-framed Danger Zone + the
  DELETE-typed confirmation dialog) with `pushEnabled` persisted and
  `DELETE /api/profile` walking the relations explicitly (SQLite
  has no ON DELETE CASCADE). **The profile-tab cards use the
  plain-div title recipe** (`font-semibold leading-none
  tracking-tight`, NO CardTitle/CardDescription pattern, no
  description line) — REF's measured classes on this surface.
- **The palette pins** (`src/app/globals.css`): the sky family
  (bg-sky-100/text-sky-600 — v4's oklch default rendered them in
  lab()) + red-200/400/800/900 (the Danger Zone frame) — the
  standing rule: pin every family a new surface uses, or the
  computed styles serialize as lab().
- **The pins**: 7 unit (the R57-A..p recipe family,
  RED-first) + 7 E2E (computed truth + the three superset
  round-trips: import, media, deletion). Four legacy pins followed
  their recipes to new homes (R19-F/R46-G1/session-47 — the
  trigger button moved into the dialog component; R14-E inverted to
  the artifact's REF-verified absence).

## §68 Session 58 (parity round 57) — the CTA-fill recipe family

The round's census read the computed background fill of every
primary action across all 50 routes (`scripts/r58-fills-final.mjs`)
— **REF maintains five fill recipes where the clone had converged
on one gradient**:

1. **The blue gradient CTA** (session-4, unchanged) — the clone
   matches everywhere REF uses it.
2. **The DARK solid** — `bg-primary` #171717 (hover /90, dark
   #fafafa; the `dark` Button variant): the wall Post, the four
   profile saves, the loans empty-state CTA, tenantsetup Continue,
   securitysettings Save (REF's LOCK glyph), the hrassistant send
   (48×36 default-size icon-only), the employees view-toggle pair
   (dark + `size="sm"`).
3. **The BLUE-600 solid** — `bg-blue-600 hover:bg-blue-700`
   (palette-pinned): staffrequests New Request, documenttracker
   Add Document, workflowconfigpage ×2, recruitmentkanban Add
   Applicant, notificationpreferences Save Preferences (the new
   `blue` variant).
4. **The INDIGO-600 solid** (the `solidIndigo` variant):
   evaluations New Review (sm, 125×32), performancemanagement Set
   New Goal.
5. **The TEAL-600 solid** (the `teal` variant, teal-700 pinned):
   surveyanalytics Run AI Analysis.

One-offs: the REVERSED indigo→blue gradient on recruitment's Post
New Job (the `indigoBlue` variant); expenses' New Expense = REF's
purple→pink (the existing `pink` variant); **the P1 assets fix** —
the `bg-none` + v3-utility authoring rendered NO fill at all in
v4's cascade (background-image: none sorts AFTER the gradient
utilities — near-white text on transparent); now `variant="green"`.

**The form-control checked fills** (`switch.tsx` + `checkbox.tsx`):
`data-[state=checked]:bg-primary` resolved against
`--color-primary` (#1877F2 — the Facebook blue the theme carries
for the active-nav custom classes) — every checked control rendered
the blue where REF renders the dark #171717. Both components now
pin the literals; the token stays for the nav.

**The employees view-toggle re-measure**: REF renders LIST FIRST
(x=1301), GRID second (x=1349), `flex gap-2` (8px) — the
session-14 "Grid first" order flipped in one of the deploys;
post-fix the pair reads byte-identical both sides.

**The profile DELETE walk's three missing non-cascade relations**
(live-verified P2003 on a throwaway db copy): Asset.assignedToId
(detach), Review.reviewerId (delete), SurveyResponse.employeeId
(delete) — accounts with any of them could NOT be deleted before.
The E2E regression guard plants all three rows on a fresh user and
deletes cleanly. Plus: the posts multipart path now enforces the
content `max(2000)`.

**The pins**: 10 unit (the R58 family, RED-first) + 10 E2E
(computed truth). Gates: lint 0/0 · tsc ✓ · **823/823 unit** ·
build ✓ · **286/286 E2E** · post-fix census **16/16 fills MATCH**.

**Instrument lessons**: (1) bash `$(...)` substitution mangles the
nested template strings — census reads must run through the node
`evalOn` path (false MATCHes otherwise); (2) hover states
contaminate computed-color reads — the parked mouse holds `:hover`
(Chromium serializes `/90` color-mixes as lab()/oklab()); move the
mouse away before at-rest reads; (3) classify fills as "any
non-plain fill", not the expected set (the first reader missed
REF's indigo/teal solids); (4) `to right` vs `90deg` is
Chromium's serialization equivalence, not a drift; (5) JSX
attribute expressions take plain `/* */` comments — `{/* */}`
inside `actions={…}` is a parse error.

## §69 Session 59 (parity round 58) — the badge/chip fill family

The r58 button census saw every primary action's fill; this round
censused the layer it never read — **every NON-button leaf's computed
fill** (status pills, count chips, table badges; all 49 routes,
paired live, `scripts/r59-badge-census.mjs`). Pre-fix 44/49, post-fix
47/49 (the two documented allowances: the profile role text, the
with-data employees surface).

**R59-A — the taskmanager count chips are STATUS-TINTED per column**:
Backlog `bg-slate-100 text-slate-700`, To Do `bg-blue-100
text-blue-700`, In Progress `bg-yellow-100 text-yellow-700`, Review
`bg-purple-100 text-purple-700`, Done `bg-green-100 text-green-700`
(+ REF's transition/focus members). The clone had the uniform slate
— the session-6 pin measured only Backlog and generalized it: the
census blind-spot pattern again (single-column measurement ≠ the
family).

**R59-B — the recruitmentkanban stage chips**: Applied `bg-slate-200`,
Interviewing `bg-blue-100`, Offer `bg-amber-100` (REF keeps TWO
warning shades across its own pages — amber here, yellow on the
taskmanager; carry both, do not normalize), Hired `bg-green-100`,
Rejected `bg-red-100`, all `text-*-700`. The class prefix was
already byte-identical — only the tint members drifted.

**R59-E — the securitysettings Enabled form**: REF's badge carries
the **CircleCheckBig glyph** (`w-3 h-3 mr-1` — 92px vs the plain
76px) + the `shadow hover:bg-primary/80 border-green-200` members;
the Disabled form stays the plain slate. The census's "timing
artifact" DIFF decomposed into the content-wait lesson AND this real
16px structural gap — triage an artifact before dismissing it.

**R59-D — the trap-2 palette sweep**: the census's `lab()`
serializations exposed the oklch drift on every UNPINNED shade in
active use. Sixteen pins landed (yellow-100/600/700,
amber-100/400/600/700, red-100, purple-100/700, emerald-100/700,
violet-100/700, pink-600 — the v3 hexes, byte-identical to the
REF-measured rgb() truths). The sweep method: `grep` the used
shades per family across `src/` minus the `@theme` pin inventory —
the gap list IS the pin list.

**R59-C — the documented allowance**: the profile role badge recipe
matches byte-for-byte; the TEXT reads "Admin" (the seed's role —
load-bearing for the requireRole superset gates and the admin-gated
E2E round-trips) vs REF's "User". Do NOT flip the seed role to
chase one badge's text.

**The with-data frontier re-verified**: REF's own Create Employee
wizard is a silent no-op live (4 steps → Create → no row, no toast)
— the employees-table surfaces stay REF-unmeasurable; the clone's
working wizard remains the documented superset.

**The pins**: 5 unit (RED-first) + 6 E2E (computed truth). Gates:
lint 0/0 · tsc ✓ · **828/828 unit** · build ✓ · **291/291 E2E** ·
post-fix census **47/49** · DB pristine (1/1/2).

**Instrument lessons**: (1) `agent-browser close --all` RESETS THE
VIEWPORT — re-opened sessions default to 1280×577 and the verify
scripts ride the ref session's existing viewport; always re-set
1440×900 after any session reset (a fresh-opened ref produced a
12/13 verify-r49 with pure viewport-artifact chart widths); (2)
data-gated badge reads need CONTENT waits, not fixed milliseconds
(the census missed REF's four Enabled badges at 400ms — the Loader2
gate); (3) the census leaf filter (children.length > 0) hides
icon-bearing badges — the census is the survey, the E2E pin (icon
class + geometry) is the contract; (4) a "false DIFF" deserves one
more look before writing it off.

## §70 Session 60 (parity round 59) — the dark-mode fill family

The r57/r58 censuses covered fills in LIGHT mode; this round took the
same union read into **DARK mode** (`html.dark`, the shared
`localStorage darkMode="true"` contract — session 33), all 49 routes
paired live (`scripts/r60-darkfill-census.mjs`). Pre-fix 39/49,
post-fix 45/49 (four documented DIFFs: the profile role text, the
employees with-data leaves, REF's live careers postings, the 404 tag
superset). **Two lessons generalize: read backgroundImage with
backgroundColor** (the payrollengine computed the "right" color while
the default gradient image class painted over it — tailwind-merge
does not conflict the two) and **never set-compare fills** (the
r58-24 "byte-identical" claim hid a mapping inversion).

**R60-A — the checkbox dark pair + the glyph**: REF's dark form is
bg `#fafafa` (its dark `--primary`) + the `#171717` check
(primary-foreground) — pin the literal pair
(`dark:data-[state=checked]:bg-[#fafafa]`), never
`dark:text-white`. The glyph is authored `h-4 w-4` (14×16 rendered —
the flex shrink; REF-measured, both sides identical).

**R60-B — the employees default view is GRID**: REF boots
GRID-active (bg-primary on the grid toggle, the outline on list —
non-persisted; three fresh loads + the reload test). Set-compare hid
this for two rounds.

**R60-C — the settings Company edit is an INLINE form flip**: the
12-field recipe (the `grid md:grid-cols-2 gap-6` grid, REF's labels
+ placeholders verbatim, Save Changes in the header with the
lucide-save glyph, Cancel at the bottom-right) — not a dialog. The
schema/API gain logoUrl/city/country; keep the working PATCH
(REF's own form renders empty + its Save is a silent no-op).

**R60-D — the compliance notify tints**: `text-*-600 border-*-200
hover:bg-*-50` per severity window (red/orange/yellow) on the
outline base — the tints do NOT flip in dark.

**R60-E — the blue-600 text split**: REF authors literal
`text-white` on workflowconfigpage x2 + notificationpreferences;
recruitmentkanban/staffrequests/documenttracker/the chat new-chat
keep the flipping primary-foreground token. Read TEXT colors, not
just fills.

**R60-F — the payrollengine Generate Payroll is the FLAT emerald
solid** (`bg-emerald-600 hover:bg-emerald-700
text-primary-foreground shadow`, backgroundImage: none) — via the
dedicated `emerald` variant, never a className over the default
gradient (the image class survives the merge).

**The r60 instrument lessons**: the `"$Abcd1234"` double-quote
shell-expansion trap (a password fill in double quotes expands to
EMPTY — silent re-auth failures); REF's short session TTL (re-auth
every 15 routes + login-page detection); content waits for
client-rendered surfaces (the 404); settle the 150ms
transition-colors before color reads (mid-flight blends like
rgb(60,60,60)); and the sweep needs the non-cascade FK walk (a
stray's NotificationPreference P2003s the bare user delete).

## §71 Session 61 (parity round 60) — the dark-mode text-color family

**The census**: the computed `color` of every text-bearing NON-button
element (h1–h6, text leaves, non-button icons) + ::placeholder
colors, all 49 routes paired live in dark — the recorded r59/r60
blind spot ("the prior censuses never read button TEXT colors")
extended past buttons. Pre-fix **23/49**, post-fix **40/49** (nine
documented DIFFs). Comparison: the deduped (tag|color) set —
text-agnostic against the seeded-LOC vs zero-data-REF populations;
every DIFF decomposed element-level with classes + both-theme
verification.

**The hard-won recipes this round**:

- **The unpinned-shade discipline is per-CONSUMER, not per-round**:
  pinning orange-500/700/900 + purple-500 (the lab() serializations)
  wasn't the end — R61-D's fix made green-400 active on the clone and
  its OWN drift appeared. When a fix introduces a new shade consumer,
  verify its computed value the same run.
- **The compliance severity chips are NOT the mini-centered recipe**:
  REF (both themes) renders per-severity card borders
  (`border-{red,orange,yellow,blue}-200`) + DIV values (`text-3xl
  font-bold mb-1 text-*-700`, unflipping) + DIV labels (`text-xs
  text-slate-500`). The hrreports/npref mini-centered cards render P
  values — two different REF recipes that a shared component had
  converged. Per-page recipes must be measured per page.
- **REF authors slate-400 where intuition reaches for the token**: the
  search/filter icons carry literal `text-slate-400` (unflipping,
  rgb(148,163,184) both themes) — the clone's muted-foreground token
  renders slate-500 in light and neutral-400 in dark. The same family:
  the chat h2 (slate-900, unflipping), the No-chats line
  (slate-500 + p-4 text-center), the requestreports tr (`border-b
  text-left text-slate-500` — the ths inherit it), the profile kicker
  subtitle (slate-400 — a per-page variance).
- **Recharts 3's legend order ignores both the Bar mount order and the
  YAxis declaration order** (measured both) — and the `payload` prop
  is omitted from the recharts-3 public types (a TS build error, not a
  runtime one). The deterministic path: `<Legend content={(props) =>
  <DefaultLegendContent {...props} payload={reordered} />} />`.
- **A recipe comment without the recipe is a regression signal**: the
  r11 "base mt-2 overridden to mt-6 per trap 4" comment survived in
  the evaluations source while the mt-6 member itself had gone missing
  — everything below the tab strip sat 16px high for who knows how
  many rounds. Pin the member, not the comment.
- **The asChild icon escapes the button filters**: the profile's
  kicker back-arrow renders via `asChild` as an `<a>` —
  `closest('button')` doesn't exclude it, and at w:0 (hidden at
  desktop) it still reads a computed color. Census reads need the
  r60 w:0 filter, not just the button filter.

**The purge P2003 chain (test infra)**: a leaked fixture row made
every subsequent global-setup purge DIE SILENTLY at the employee
sweep (the global-setup swallows purge errors as non-fatal) — the
stale rows then poisoned `findFirst`-based assertions in later runs.
A purge must walk the FKs first (fixtures → employees → the
non-cascade user dependents), and a silently-failing sweep is worse
than no sweep.

**The r61 instrument lessons**: the manual-:3100-server trap (the
in-memory login rate limiter — LIMIT 10/15min per-IP "local" —
accumulated across debug logins + reused-port playwright runs →
mid-suite 403 lockouts; always kill manual servers before
`test:e2e`); REF's transient refresh-cw (a blue-600 loading icon that
appears only mid-fetch, y:-52 — settled re-reads don't show it);
lucide-react's Filter renders class `lucide-funnel` (the
library-version family — target `class*="funnel"` in the E2E).

## §72 Session 62 (parity round 61) — the dark-mode border-color family

**The frontier**: the prior censuses covered fills (r57 CTAs light,
r58 badges light, r59 union dark) and text colors (r60/r61 non-button
text dark) — **borders were never censused**. The r62 census
(`scripts/r62-border-census.mjs`, 49 routes, paired live, DARK, three
batches) read the computed `border-color` of every visibly-bordered
element in `main`, buttons INCLUDED (button borders were never read
by any prior census). Pre-fix 29/49 → post-fix **44/49** (five
documented DIFFs: the employees seeded leaves, the attendance admin
superset, the interviewassistant r48-C1 superset card, the
onboardingtemplates 404 `<a>` superset, REF's live careers data).

**The families** (all live-measured, element-level decomposed via
`scripts/r62-probe.mjs` + `r62-probe-cmp.mjs`):

1. **The frozen light-mode literal** — the dashboard Customize button
   pinned `border-[#e5e5e5]` (a session-3 light measurement); REF's
   button rides the flipping `border-input` token. Light identical,
   dark divergent — the literal retired, the token supplies both.
   Audit for this family: grep authored `border-[#` literals in page
   code; any that match a token's LIGHT value are frozen pins.
2. **The wrong token on a shared component** — the Checkbox borders
   rode `border-primary`, but the clone's `--primary` is the nav-blue
   repurposing (#1877f2 both themes); REF's checkbox border rides
   REF's own flipping `--primary` (#171717 light / #fafafa dark). A
   BOTH-theme divergence invisible to every fill/text census — fixed
   with the literal pair (the established fill-literal pattern in the
   same file: `border-[#171717] dark:border-[#fafafa]`).
3. **The trap-2 drift on border shades** — `border-green-200` rendered
   `lab(92.42% -26.47 12.94)` on the clone vs REF's pinned
   `rgb(187,247,208)` (#bbf7d0). New pins: green-200, amber-200,
   cyan-300, cyan-50 (the v3 sRGB hexes).
4. **The unflipping border-slate-200 card family** — REF's page cards
   carry an explicit `border-slate-200` (they stay LIGHT-bordered in
   dark mode); the clone's cards rode the flipping `border` token
   (dark #262626). Nine cards across seven routes + the
   loans/offboarding empty-state rewrites to REF's live recipe.
5. **REF's borders live on different elements per family** — page
   cards (the card), assetmanagement/payrollmodule tables (the header
   ROW: `border-b border-slate-200 bg-slate-50`), recruitment's table
   (the THEAD itself — the shared TableHeader's `[&_tr]:border-b`
   neutralized there), the shiftcalendar (the th: `border-b
   border-slate-200 bg-white` + the weekend `bg-slate-50
   text-slate-400`). Never generalize one measured site to a shared
   component.
6. **The per-color action buttons** — REF's attendance trio carries
   explicit outline borders (Devices cyan-300 + hover:bg-cyan-50,
   Settings slate-300 + hover:bg-accent, Dashboard blue-300 +
   hover:bg-blue-50).
7. **The per-stage kanban columns** — the session-11 pin had
   generalized the Applied column's slate to all five (the r59
   single-measure blind spot again); REF's columns are per-stage
   (slate/blue/amber/green/red) inside `flex-shrink-0 w-64` wrappers
   (`p-3 min-h-[400px]` on the column div).

**The muted-foreground mapping note** (documented, no fix): REF's
`--muted-foreground` = neutral-500 (#737373) light / #a3a3a3 dark,
but REF AUTHORS `text-slate-500` (#64748b) on its subtitles; the
clone's token pins #64748b (subtitle parity) and its tabs/select
carry the neutral-500/400 literals (tab parity) — computed parity on
every censused dimension. A token-level re-map would ripple through
all 49 routes' text surfaces: a future round's scope, not a patch.

**The r62 instrument lessons**: the rect-visibility filter for border
reads (zero-content dividers render 1px+ rects — filter by
`rect.width === 0 && rect.height === 0` only, never by text content);
the truncated class-string trap (tw-merge reorders members — compare
SORTED member SETS, `[...el.classList].sort()`, before declaring a
member missing; the "missing min-h-[60px]" was a false positive);
both-theme bugs hide from single-theme censuses (the checkbox border
diverged in LIGHT too); census batches must save DIFF dumps to files
(a mid-batch tool timeout otherwise loses the batch).

## §73 Session 63 (parity round 62) — the light-mode text-color census

The third computed-color census dimension and the LAST uncensured
theme layer: the computed `color` of every text-bearing element in
`main` — BUTTONS INCLUDED (button text/icons were never read by any
prior census in ANY theme — the r60/r61/r62 blind spot closed) —
plus `::placeholder` colors, all 49 routes, paired live in LIGHT.
Pre-fix 26/49 → post-fix **41/49** (every remaining DIFF decomposed
and documented as a known allowance or a re-confirmed transient).
The round was also the vehicle for the documented byte-parity
backlog: REF's `--muted-foreground` = neutral-500 #737373 (the
clone's token pins slate-500 #64748b for the subtitle/tab parity) —
the un-compensated token riders surfaced as the 15-route placeholder
family.

**The fixes (R63-A..G)**: (A) the Input/Textarea placeholder moved
from `placeholder:text-muted-foreground` to REF's muted LITERAL pair
`placeholder:text-[#737373] dark:placeholder:text-[#a3a3a3]` (the
R62-B checkbox pattern; the token stays pinned for the
subtitle/tab-parity consumers); (B) the hrreports empty Group By
trigger — REF's trigger mounts WITHOUT `data-placeholder` (its
runtime differs) and renders its own foreground pair
(#0a0a0a/#fafafa) while the clone's Radix fires data-placeholder →
the R37-E neutral literal painted it (a BOTH-theme button-text
divergence); the trigger instance now overrides with BOTH variant
members — **the dark: member is REQUIRED**: cn()/tw-merge replaces
the base member PER VARIANT at merge time, so a light-only override
leaves the base's dark member live (learned twice: first the E2E
dark assertion caught it); (C) the profile kicker subtitle is the
FLIPPING pair (slate-500 light / slate-400 dark — the r61-O pin
froze the dark measurement for both themes); (D) the shiftcalendar
assign affordance is iconed (lucide-plus w-3 h-3 + gap-0.5 mt-1,
unflipping slate-300); (E) the shiftcalendar summary "color diff"
was a CHILDREN-FILTER artifact (an iconed title is invisible to the
leaf read — the color always matched); the real divergences are
structural: the pb-3 header override + the text-base flex title +
the lucide-users icon; (F) the recruitment AI Score th carries the
trending-up icon inside the flex gap-1 wrapper (both tables); (G)
the attendance restricted card's icon is **lucide-x** (the r61-W
color fix kept the un-measured shield SHAPE — color censuses cannot
see icon shapes) + the h3 is text-slate-800 (unflipping).

**The r63 instrument lessons**: (1) the standalone static-copy trap —
`npx next build` alone leaves `.next/standalone/.next/static` EMPTY
(the copies live in the `bun run build` script); an E2E run against
the uncopied build serves UNSTYLED pages whose computed colors read
as the Chrome UA defaults (::placeholder rgb(117,117,117)) — always
build via the package script; (2) Tailwind v4 dark: variants compile
to `:where(.dark,.dark *)` = ZERO specificity — ties resolve by file
order in CSS but the operative resolver is cn()/tw-merge (REPLACES
the base member per variant); author BOTH variant members on
instance overrides; (3) the children-filter census artifact — a
title carrying an icon is invisible to the leaf text read;
decompose "color diffs" to the STRUCTURE before pinning a color that
already matched; (4) the visibility:hidden recharts tooltip mounts
WITH a default label on REF but empty on the clone — at-rest
invisible census artifacts are documentation, not fixes (hover
parity holds); (5) a page that fits one 900px viewport makes two
full-page captures byte-identical — capture the second surface at a
different viewport (the 390×844 mobile pair), and the agent-browser
viewport state can go stale after restore cycles (fresh sessions
when the capture size doesn't stick); (6) the pin-defect trio — a
source COMMENT containing the retired member breaks the pin's
`.not.toContain`; a recipe comment between a label and its control
breaks legacy regex windows (widen the window); a globally-scoped
`.not.toContain` breaks when another element legitimately shares
the retired class (the shiftcalendar "+N more" overflow button —
scope retirement assertions to the measured surface or pin the
sharer positively with its allowance reason).

The frontier after this round: the three computed-color dimensions
(fill r59–r60, text r60–r63, border r61–r62) are now censused in
BOTH themes (light text was the last uncensured layer); the
remaining known divergences are the documented allowances (the
with-data superset surfaces stay REF-unmeasurable at the demo's
zero state; the advancedanalytics hidden-tooltip artifact; the
muted-foreground/primary TOKEN re-mapping question stays a future
round's scope — the literal pairs hold computed parity on every
censused surface); the login deploy watch stays armed at the
post-26th finals (JS D3ArZVPB / CSS OJK0Y98H — the first CSS-side
login change since round 45, re-audited non-visual 13/13 via
verify-r45); the Next.js 16.4.0 history bug remains the one
recorded functional divergence whose fix lives upstream.

> **Session-64 correction**: the "BOTH themes" claim above was a slip —
> the border family had run in DARK only (r61); the LIGHT border cell
> had never been censused. §74's round closed it (44/49 pre-fix, all 5
> DIFFs documented allowances, zero border fixes) — the matrix is NOW
> genuinely complete: fill (light r57–r58 + dark r59), text (dark r60 +
> light r62), border (dark r61 + light r63).

## §74 Session 64 (parity round 63) — the light-mode border-color census

Workspace rebuilt from scratch (fresh clone at `b1ab187`, the round-62
landing); environment per protocol. Baseline gates ALL GREEN (880/880
unit · 333/333 E2E). Deploy watch: **both sides quiet** — the post-26th
finals held (JS `D3ArZVPB` / CSS `OJK0Y98H`), no 27th deploy.

**The census** (`scripts/r64-lightborder-census.mjs`, 49 routes, paired
live, LIGHT, three batches, DIFF dumps to files): the computed
`border-color` of every visibly-bordered element in `main`, buttons
included — the last uncensured cell of the computed-color matrix.
**Pre-fix 44/49** (the best pre-fix state of any census round — the
light recipes were the original cloning baseline and seven rounds of
pins hold them); all 5 DIFFs decomposed to documented allowances
(`r64-probe.mjs`): the seeded employees grid card + its "Full Time"
badge, the attendance "Today's Overview"/"Recent Records" admin
superset cards, the interviewassistant r48-C1 AI Analysis card, the
onboardingtemplates r36 404 Go-Home anchor (members byte-identical,
tag superset), REF's live careers company buttons. **Post-fix re-run:
44/49 unchanged — zero border fixes.**

**The round's real finds — the input-family probes.** The census's
set-comparison inversion risk was closed with the element-level
symmetric diff (`r64-probe-cmp.mjs`), which surfaced an authorship
split on the payroll search input whose padding dimension had never
been measured. Two per-dimension probes followed:

- **R64-A — the iconed-search left padding** (`r64-probe2.mjs`, all 49
  routes, both sides, computed paddingLeft): REF clears the `absolute
  left-3` search icon with `pl-10` (payroll — 40px) or `pl-9`
  (payrollmodule / documenttracker / assetmanagement — 36px,
  live-measured); the clone rendered the same wrappers WITHOUT the
  padding member — typed text started at 12px and collided with the
  icon (a visible UX defect). employees / chat / staffrequests /
  careers already carried their measured members. Session-12's R11-H
  pin held the payroll toolbar's outer geometry (862px / relative /
  flex-1) but never the interior member — a 51-round-old measurement
  gap. Post-fix: 9/9 iconed surfaces at parity.
- **R64-B..E — the placeholder-TEXT dimension** (`r64-probe3.mjs`, all
  49 routes, both sides — r60/r63 read placeholder COLORS only):
  45/49 verbatim pre-fix; four authored strings retired for REF's live
  copy — the compliance search ("Search employee..." — the query
  filters document name AND employeeName; the aria-label follows), the
  recruitmentkanban search ("Search applicants..."), the
  interviewassistant notes textarea (REF's verbatim observations
  string — R61-L had pinned the SELECT's placeholder only), and the
  tenantsetup wizard ("Acme Corporation" / "admin@acme.com" — R31-C10
  held the labels only). Post-fix: 49/49.

**TDD**: 5 unit pins (the R64 block, RED-first — retirement assertions
scoped per the r63 pin-defect lessons; the recipe comments contain no
retired literals) + 6 E2E (`tests/e2e/session64-light-border.spec.ts`:
the four paddings computed, the four placeholder surfaces, and the
round's border-census truth pin — the payroll search input rides the
border-input token pair rgb(229,229,229) light / rgb(38,38,38) dark).
**Gates**: lint 0/0 · tsc ✓ · 885/885 unit (+5) · build ✓ · 339/339
E2E (+6, zero flakes) · post-fix probes 9/9 padding + 49/49 text ·
44/49 border (unchanged, all allowances) · 18 screenshots (the
326–343 pair set: the typed-text padding pairs, the placeholder pairs,
the mobile drawer pair @390×844 — the standing mobile-menu check
evidence; 520 files, hash-verified distinct) · deploy watch quiet · DB
pristine.

The frontier after this round: **the computed-color matrix is
complete** (fill light+dark, text dark+light, border dark+light — every
cell censused, every DIFF decomposed to a fix or a documented
allowance); the input-family dimensions now carry computed pins
(padding + placeholder text); the remaining known divergences are the
documented allowances (the with-data superset surfaces stay
REF-unmeasurable at the demo's zero state; the advancedanalytics
hidden-tooltip artifact); the muted-foreground/primary TOKEN
re-mapping question stays a future round's optional scope (the literal
pairs hold computed parity on every censused surface); the login
deploy watch stays armed at the post-26th finals; the Next.js 16.4.0
history bug remains the one recorded functional divergence whose fix
lives upstream.

### Session 64 instrument lessons (carry-forward)

1. **The zero-fix census is legitimate — and the inversion probe is
   where the yield hides.** A census can come back all-allowance (the
   light border did) yet the round still yields real fixes: the
   element-level symmetric diff surfaced an authorship split whose
   downstream dimension (padding) had never been measured. After a
   zero-DIFF census, run at least one per-dimension probe on the
   family the census shares a surface with.
2. **Color censuses cannot see PADDING.** The iconed-search family's
   left padding was never in any computed read, and byte-level
   geometry pins held only the pages measured WITH the member; four
   sibling pages authored without it drifted for 51 rounds.
3. **The placeholder-TEXT dimension was never censused.** r60/r63 read
   the ::placeholder COLORS; the text values were only byte-pinned on
   measured surfaces, and four authored strings survived. A copy census
   is cheap (one attribute read, all routes) and catches invented
   strings no color read can see.
4. **The fresh-session screenshot protocol.** Fresh agent-browser
   sessions for viewport-sensitive captures (the r63 stale-viewport
   lesson applied: fresh "ref64"/"loc64" sessions, zero stale-state
   fights).
5. **The tw-merge member-order mirage.** The post-fix clone inputs
   serialize their members in REF's order (`focus-visible:ring-1
   focus-visible:ring-ring` first) because tw-merge reorders on merge;
   compare sorted member SETS (the r62 lesson, re-confirmed in the
   probe2 tails).

## §75 Session 65 (parity round 64) — the geometry census (padding + border-radius)

Workspace rebuilt (fresh clone at `c10ab5b`, the round-63 landing);
environment per protocol. Baseline gates ALL GREEN (885/885 unit ·
338+1 E2E — the session-42 user-menu transient 6/6 isolated, joining
the documented family). **Deploy watch: the 28TH LOGIN DEPLOY
detected** (login JS `D3ArZVPB`→`DcjXLM5U` + CSS
`OJK0Y98H`→`D_pxMX7I`, the frontend-config chunk held, the app side
quiet) — re-audited NON-VISUAL via the full ladder (standing 5/5 +
sweep 12/12 + verify-r49 13/13 + verify-r45 13/13, after a fresh
re-auth — the deploy had invalidated the shared REF session; the first
ladder run read the login page on every route). The watch finals are
the post-28th hashes.

**The census** (`scripts/r65-geometry-census.mjs`, 49 routes, paired
live, LIGHT, three batches, DIFF dumps to files): the computed padding
(4 sides) + border-radius of every geometry-bearing element in main,
buttons included — the first full-population read of the two
dimensions every color census was blind to. **Pre-fix 32/49.** All 17
DIFFs decomposed element-level (`r65-probe` + `r65-probe-cmp` the
symmetric tuple diff with class/rect/text attribution; `r65-probe2`
the per-tile recipe probe across the 18 stat-tile pages): **7 fix
families + the 5 documented-allowance routes. Post-fix 44/49 — exactly
the projection.**

The seven families (the fix layer records the full member sets):

- **R65-A** the StatCard standard-variant tile is PADDING-DRIVEN — REF
  live-measures `bg-{c}-100 p-3 rounded-xl` 48×48 on payroll /
  expenses / surveys / attendance; the session-17 "NOT p-3" note was a
  page-specific generalization (advancedanalytics / analytics
  tile-right / allleaverequests / payrollai render FIXED on REF — the
  per-tile probe split the family). The standard base is now `p-3
  rounded-xl …` with the `tileFixed` escape; tile-right is fixed by
  contract (the post-fix census caught the regression on /analytics
  before it shipped — the E2E re-run held).
- **R65-B** the td/th UA-padding restoration — TW v4's preflight
  universal padding reset (`*,:after,:before,::backdrop{…;padding:0}`)
  zeroes the Chrome UA's `td,th{padding:1px}`; REF's runtime keeps the
  1px on every unstyled cell side. Restored in `@layer base` (the
  R23-A cursor precedent). A REAL Tailwind v4 engine difference — the
  fourth documented preflight divergence (cursor, the space-y flip,
  the shadow scale, and now the cell padding).
- **R65-C** the chat column header — ONE `p-4 border-b border-slate-200`
  wrapper (the split authoring had DROPPED the border-b; the r63
  border census's set comparison couldn't see it — the page's other
  slate-200 borders satisfied the set) + the padding-driven px-3
  new-chat button.
- **R65-D** the compliance filter row's bordered-white-box member set
  (`flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border
  border-slate-200`) — another set-blindness catch (the clone's Card
  root had supplied the identical white tuple).
- **R65-E** the hrassistant geometry — the 500px p-6 space-y-4 pane,
  the border-t p-4 flex gap-3 row, the min-h-[60px] textarea (the
  clone authored 460px/p-4/p-3/48px — visible layout drift).
- **R65-F** the requestreports Back button — `variant="ghost"
  size="sm"` (the default-size override leaked the base py-2 as an 8px
  vertical pad REF does not render).
- **R65-G** `--radius-sm: 0.25rem` — REF's live rounded-sm computes
  4px (the v4 scale); the 2px pin was the v3-era assumption never
  computed-verified.

**TDD**: 9 unit pins (the R65 block RED-first; 2 legacy amendments —
the session-10 tile pin to the two-form contract, the R48-C7 Back pin
to the sm size; the R60-E chat member re-ordered) + 7 E2E
(`tests/e2e/session65-geometry.spec.ts`, computed truth).
**Gates**: lint 0/0 · tsc ✓ · 892/892 unit · build ✓ · 346/346 E2E
(the session-58 switch/checkbox transient fired once mid-suite, 11/11
isolated per the flake-check) · post-fix census 44/49 · 24 screenshots
(the 344–367 pair set; the mobile pair byte-matches the r64 set —
cross-round byte-stability of the standing surface) → 550 files ·
DB pristine.

The frontier after this round: **the computed-style matrix now covers
color (fill/text/border × light/dark) AND geometry (padding +
radius, light)**; the remaining geometry cells are the dark-mode
geometry re-census (theme-invariant by authoring, but the dark: variant
members have never been computed-verified) and the margin/gap dimension
(no census has read margins); the td/th restoration should be
re-verified on the next dark census (the 1px is theme-invariant);
the muted-foreground/--primary token re-map stays a future round's
optional scope; the login deploy watch stays armed at the post-28th
finals; the Next.js 16.4.0 history bug remains the one recorded
functional divergence whose fix lives upstream.

### Session 65 instrument lessons (carry-forward)

1. **The rounded-full serialization split**: TW v4's
   `calc(infinity * 1px)` serializes as `33554432px` (2^25) vs REF's
   v3-era `9999px` — normalize any radius ≥ 9999 to a `full` token or
   the family drowns the real DIFFs (the first run read 2/17 with the
   serialization noise as the only DIFF family).
2. **No `//` comments inside eval strings** — `evalOn` flattens
   newlines; a `//` comment swallows the rest of the one-liner.
3. **A deploy invalidates every REF session — re-auth before the
   ladder**: the standing-run and routesweep scripts assume a
   pre-authed session; a uniform identical read across all routes is
   the stale-session signature (the first ladder run read the login
   page everywhere — 0/5 + 0/12).
4. **Set blindness, second face**: same-set-DIFFERENT-STRUCTURE false
   MATCHes — the chat's missing border-b and the compliance's missing
   box hid behind tuples other elements supplied. Set equality is the
   alarm; per-element attribution (class + rect + text) is the
   verdict.
5. **A frozen measurement can be a frozen GENERALIZATION**: the R16-D
   "NOT p-3" tile note was real data applied to the wrong population —
   re-measure per page before trusting any family-level pin.

## §76 Session 66 (parity round 65) — the margin/gap census (margin + gap)

Workspace rebuilt (fresh clone at `0a31b7c`, the round-64 landing);
environment per protocol. Baseline gates ALL GREEN (892/892 unit ·
E2E 345/346 — the one failure RETIRED as a real spec race, below).
**Deploy watch: the 29TH LOGIN DEPLOY detected** (login JS
`DcjXLM5U`→`q8Uif46n` + CSS `D_pxMX7I`→`CiCfCTzx`; the app side
quiet) — re-audited NON-VISUAL via the full ladder after a fresh
re-auth (standing 5/5 + sweep 12/12 + verify-r49 13/13 + verify-r45
13/13). The watch finals are the post-29th hashes.

**The census** (`scripts/r66-margin-census.mjs`, 49 routes, paired
live, LIGHT, three batches): the computed margin (4 sides) +
rowGap/columnGap of every margin/gap-bearing element in main — the
FIRST full-population read of the two dimensions NO census had ever
covered. **Pre-fix 19/49; post-fix 45/49** (the 4 remaining DIFFs are
the documented allowances: employees seeded, attendance admin
superset, careers live data, interviewassistant r48-C1). The 18 fix
families and their full member sets live in
`docs/remediation-plan-session66.md`; the highlights:

- **R66-A** the PageCanvas scroll band cloned (the r47 "non-clone"
  reversed — the `-80,0,0,0` census family, 8 routes).
- **R66-B** the EmptyState icon is SVG-authored (`w-16 h-16 mx-auto
  mb-4 text-slate-300` ON the svg; the wrapper + `[&_svg]` divs
  retired; the icon names fixed to REF's live set).
- **R66-C/D/E/F** the per-page recipe splits: the tileFixed UNSPACED
  row; the employees alwaysRow + `grid md:grid-cols-2 lg:grid-cols-3
  gap-6`; the Radix tabs rhythm (space-y-6 root + **the R22-B
  `mb-0!` List kill** — the v4 inline-flex margins never collapse,
  the 48px trap); the actions-cluster three-form truth.
- **R66-G..R** the group/recipe re-measures (companywall's
  REF-side drift, payrollengine's 4px groups, tenantsetup's ml-auto
  footer, the surveyanalytics single-grid, the shiftswap card-only
  wrapper, the kanban flat root + bare zone, the EMPTY hrassistant
  pane, the chat gap-2).

**The session-58 "transient" RETIRED**: the switch/checkbox spec
fired 3× consecutively in isolation on the cold sandbox — a
count-without-wait race (the count read 0 while the fetch was
pending; the post-failure snapshot showed the correct state). The
wait mirrors the switches block; the documented-transient family
shrinks by one and its real mechanism is recorded.

**TDD**: 18 unit pins (RED-first) + 5 legacy-pin amendments + 1
legacy E2E amendment + 14 E2E
(`tests/e2e/session66-margin-gap.spec.ts`, computed truth).
**Gates**: lint 0/0 · tsc ✓ · 910/910 unit · build ✓ · **360/360
E2E** · post-fix census 45/49 · 36 screenshots (the 368–403 pair set
→ 580 files; the 402 mobile pair byte-matches the r65 366 pair —
cross-round byte-stability of the standing surface) · DB pristine.

The frontier after this round: **the computed-style matrix is now
complete across every axis this project has defined — color (fill ×
light/dark, text × light/dark, border × light/dark) AND geometry
(padding + radius, light) AND spacing (margin + gap, light)**. The
remaining verification cells: the DARK-mode re-census of the two
geometry axes (theme-invariant by authoring, never
computed-verified); the muted-foreground/--primary token re-map
stays optional; the login deploy watch stays armed at the post-29th
finals; the Next.js 16.4.0 history bug remains the one recorded
functional divergence whose fix lives upstream.

### Session 66 instrument lessons (carry-forward)

1. **The space-y direction flip is a POSITION problem**: v3 zeroes
   the FIRST child, v4 the LAST — and the tuple bundles each
   element's own gap, so position-equal sets still diverged. Mark II
   parses the parent's authored value and emits `v:N` for every
   boundary-shaped pair — position-independent on both engines.
2. **A census MATCH can be a set-absorption false MATCH** (set
   blindness, third face): allleaverequests MATCHed while its row
   carried a member REF never renders. Probes are the verdict.
3. **Inline-flex margins never collapse**: a space-y root under v4
   DOUBLES the tabs→content gap (24+24). The R22-B `mb-0!` kill on
   the List + the content's own mt is the compensation (census v:24
   + visual 24 on both engines).
4. **A census read can be a mid-load transient** (evaluations' tabs
   read mr=0 at census time, (304,304) settled) — re-probe at rest
   before fixing.
5. **A pinned "transient" can be a real spec race**: the session-58
   flake's true mechanism was a count-without-wait race — when a
   transient fires in isolation, retire the race.
6. **A frozen measurement can drift ON REF's side** (the R10-C
   companywall pin recorded a REF that no longer exists) —
   re-measure before amending the clone.

## §77 Session 67 (parity round 66) — the dark-mode geometry/spacing re-census (the matrix-completion verification round)

Workspace rebuilt (fresh clone at `07fcfbf`, the round-65 landing);
environment per protocol (the exported-DATABASE_URL trap hit and
resolved — the sandbox re-exports it per invocation; the AUTH_SECRET
quoting contract: the ladder greps the QUOTED form). Baseline gates:
lint 0/0 · tsc ✓ · 910/910 unit · build ✓ · E2E 359/360 — the one
failure RETIRED as a real spec race (below).

**Deploy watch: THE 30TH LOGIN DEPLOY detected** (login JS
`q8Uif46n`→`DwY57mhH` + CSS `CiCfCTzx`→`BpSyi-cD`; the app side
quiet `C-IrDy5f`/`BGNH4KkS`) — re-audited NON-VISUAL via the full
confirmation ladder after a fresh re-auth (standing 5/5 + sweep 12/12
+ verify-r49 13/13 + verify-r45 13/13). The watch finals are the
post-30th hashes.

**The censuses** (`scripts/r67-dark-geometry-census.mjs` +
`scripts/r67-dark-margin-census.mjs` — the r65/r66 populations
re-read in the DARK cascade, all 49 routes, armed via localStorage
`darkMode="true"` + the boot script's pre-paint class): **the first
VERIFICATION-ONLY round in the project's history — zero fix families
on the two axes.** Dark geometry **44/49** + dark margin/gap **45/49**
— every DIFF a byte-identical standing allowance (employees seeded,
attendance admin superset, interviewassistant r48-C1,
onboardingtemplates r36 anchor, careers live data).

**The theme-invariance byte-proof**: the DIFF routes re-read in LIGHT
vs DARK produce BYTE-IDENTICAL census tuples on BOTH axes (the
5-route geometry re-read + the 4-route margin re-read, diffed
file-vs-file: zero differences). The geometry + spacing axes are
computed-verified theme-invariant end to end — the computed-style
matrix is now COMPLETE: color (fill/text/border) × light/dark,
geometry × light/dark, spacing × light/dark.

**The R37-C spec race RETIRED** (the r66 lesson-5 family): the
full-suite 359/360 failure measured the Add-Level button at 109.06px
vs the 110–115 pin — the dialog's `zoom-in-95` animate-in makes
`toBeVisible()` pass at MOUNT while the scale transition is in flight
(113 × mid-scale ≈ 109.06). The poll-until-stable read (two
consecutive equal widths = settled) is the fix — the settle contract
for ANY geometry read on an animated surface.

**The mobile-menu standing check**: the full functional cycle
verified (toggle → open + nav links; the Training LMS link navigates;
Escape closes), and the 418 LIGHT mobile drawer pair @390×844
BYTE-MATCHES the r66 402 pair on both sides (three-round
byte-stability of the standing surface); the DARK mobile drawer pair
(420/421) is the new dark-surface evidence.

**TDD**: zero unit pins (zero source changes) + 6 E2E
(`tests/e2e/session67-dark-geometry.spec.ts` — the theme-invariance
contract locked with computed truth: R67-A the boot-script dark
contract incl. the /login theme-inert R39-B split, R67-B the dark
StatCard padded/tileFixed twins, R67-C the dark scroll band, R67-D
the dark svg-authored empty-state margins, R67-E the dark employees
grid + alwaysRow, R67-F the dark tenantsetup circle + ml-auto).
**Gates**: lint 0/0 · tsc ✓ · 910/910 unit (unchanged) · build ✓ ·
**366/366 E2E** (+6; the hardened R37-C green) · the censuses 44/49
+ 45/49 (all allowances) · 18 screenshots (the 404–421 pair set →
604 files; the 418 pair byte-matches the r66 set) · DB pristine.

The frontier after this round: **the computed-style matrix is
COMPLETE** — every axis (color fill/text/border, geometry
padding+radius, spacing margin+gap) censused in BOTH themes, every
DIFF across all ten censuses a documented allowance or a shipped
fix. The remaining recorded items: the muted-foreground/--primary
token re-map (optional); the login deploy watch stays armed at the
post-30th finals (`DwY57mhH`/`BpSyi-cD` + the quiet app side
`C-IrDy5f`/`BGNH4KkS`); the Next.js 16.4.0 history bug remains the
one recorded functional divergence whose fix lives upstream.

### Session 67 instrument lessons (carry-forward)

1. **The measure-without-settle race**: an animated surface (dialog
   zoom-in-95) passes `toBeVisible()` at mount while the transform is
   in flight — a geometry read taken then measures the ANIMATION, not
   the element (109.06 = 113 × mid-scale). Poll-until-stable is the
   settle contract for any geometry read on an animated surface.
2. **The theme re-census needs a NAVIGATION after the localStorage
   write**: the boot script applies html.dark pre-paint on LOAD —
   setting `darkMode="true"` does not toggle the current page. The
   census route-opens all navigate (the reads are correctly dark);
   verify dark via the post-navigation body background
   (`rgb(10,10,10)`), not a same-page class check.
3. **A verification round still needs the allowance byte-proof**: a
   census that returns all-allowance is weak evidence alone (the r64
   zero-fix lesson); the byte-identity diff (the same routes re-read
   in LIGHT vs DARK, tuples compared file-vs-file) is the strong
   form — theme-invariance proven PER ROUTE, not just per axis.
4. **The per-batch DIFF dump OVERWRITES by default**: re-run the DIFF
   routes as their own batch (or set the dump env) before
   byte-diffing across reads.
5. **The AUTH_SECRET quoting contract**: the ladder greps the QUOTED
   form from `.env`; an unquoted secret greps empty and the
   instrumentation gate refuses the boot. `.env` values follow the
   `.env.example` form: quoted.

## §78 Session 68 (parity round 67) — the Next.js security-patch upgrade + the history-bug closure + the 31st-deploy ladder + the drift re-census

The matrix was complete (r66); this round converted the recorded
frontier into verified closure. Baseline reproduced on 16.4.0 first
(lint 0/0 · tsc ✓ · 910/910 unit · build ✓ · E2E 366/366, 5.5m zero
flakes), then `bun add next@16.4.2 eslint-config-next@16.4.2` —
**16.4.1 ships TWO CRITICAL unauthenticated-RCE security fixes**
(use-cache functions returning typed arrays + the Image Optimization
API when SVG files are used) plus a High Server-Actions DoS fix;
16.4.2 adds the Turbopack snapshot-consistency backports. A
production-ready codebase cannot stay on 16.4.0 against two critical
unauthenticated RCEs. Post-upgrade gates ALL GREEN: lint 0/0 · tsc ✓
· 910/910 unit · build ✓ (22.4s) · **E2E 366/366 on the upgraded
build (5.6m, zero flakes)** — the upgrade is regression-free at
every gate.

**THE R56-E DIVERGENCE CLOSES** (the one recorded functional
divergence): the 16.4.0 Navigation API corruption — after a full
document load, the SECOND client-side navigation replaced the loaded
entry's URL with the entry-below duplicate, back-back skipping the
loaded page, 5/5 deterministic — is **FIXED UPSTREAM between 16.4.0
and 16.4.2**. The revived detector
(`scripts/r68-history-detector.mjs`, the session-56 entries-dump
repro shape) reads: push-only growth (prefix preserved, +1 entry per
click, ZERO adjacent duplicates) + back-back REACHING the loaded
page. Locked with `tests/e2e/session68-history-closure.spec.ts`
(2 computed-truth pins, green on the first run): R68-A the two-deep
back contract + R68-B the push-only entries contract — a future
framework upgrade that reintroduces the corruption trips the gate.

**The 31st login deploy** (`scripts/r68-deploy-watch.mjs`, the
post-30th finals armed): login JS `DwY57mhH`→`8hcVVGz2`, login CSS
QUIET (`BpSyi-cD`), the app side QUIET — re-audited **NON-VISUAL**
via the full confirmation ladder after a fresh re-auth, ON THE
UPGRADED :3200 standalone (a free re-validation of the standing
audits on 16.4.2): standing 5/5 + sweep 12/12 + verify-r49 13/13 +
verify-r45 13/13. The watch finals are the post-31st hashes.

**The REF-drift light-text re-census** (the r63 instrument re-run
against the CURRENT REF — the color censuses last ran ≥3 REF deploys
ago): **42/49 MATCH — NO DRIFT**, better than the r63 post-fix 41/49
(the r63-era taskmanager mid-load transient now MATCHES at steady
state). Every DIFF decomposes to the documented allowance set
exactly: employees (seeded), profile (the asChild back-arrow tag
artifact), attendance (admin superset), interviewassistant (r48-C1),
advancedanalytics (the hidden recharts-tooltip mount),
onboardingtemplates (the r36 `<a>` superset), careers (live data).
The placeholder literal pairs (`rgb(115,115,115)` everywhere
censused), the muted text pairs, and the neutral literal overrides
all held — **the muted-foreground/--primary token question CLOSES
as architectural**: the re-map has zero user-visible surface (every
computed surface carries its literal override; this census is the
evidence).

**The standing checks**: the mobile-menu full functional cycle
(toggle → nav links → the Training LMS link navigates to /training →
auto-close, `open:false` verified post-navigation) + the TW-v4
standing scan (`!important` 15, oklch all comments) + **the
byte-stability pair: the 438 LIGHT mobile drawer pair @390×844
BYTE-MATCHES the r67 418 pair on BOTH sides (md5-identical)** — a
FOUR-round chain (438 ≡ 418 ≡ 402 ≡ 366) and the FIRST CROSS-VERSION
byte-proof: 418 was captured on 16.4.0, 438 on 16.4.2 — the upgrade
changed zero rendered bytes of the standing surface; the REF side
identical also re-confirms the 31st deploy left the app surface
untouched. Screenshots: the 422–439 pair set (18 files, 616 total —
the LIGHT route pairs on the upgraded build, the light complement to
r67's dark theme). DB pristine (the verify-r45 loading-probe user
swept per the r61 protocol).

TDD: +2 E2E, zero unit pins (zero app-source changes; the upgrade's
regression proof is the full suite green on 16.4.2). Gates: lint 0/0
· tsc ✓ · 910/910 unit · build ✓ · **E2E 368/368** · DB pristine.
`next` + `eslint-config-next` pinned at 16.4.2.

### §78 instrument lessons (carry-forward)

1. **A re-run detector inherits the live session's stack**: the
   entries-dump detector's first run was the clean evidence; the
   re-run's first read showed the PREVIOUS run's Navigation entries
   (a same-URL `open` is a reload, not a new entry). The determinism
   pre-step: `open about:blank` first — a document change resets the
   starting stack.
2. **agent-browser eval returns two shapes** — JSON-encoded strings
   for scalars, PRETTY-PRINTED JSON (real newlines) for arrays: the
   parse chain must try the plain parse before the double-decode or
   array reads come back "ERR:" + raw text.
3. **The background-launch pattern for long runs**: `(setsid nohup
   … < /dev/null &)` detached from the tool's process group; the
   plain `nohup … & disown` died silently (0-byte log) when the
   invocation returned.
4. **The sleep-units trap, hit again**: `sleep 2500` = 2500 SECONDS
   (41 minutes), not 2.5s — shell sleeps are SECONDS; the session-67
   "units error" lesson is standing and cost a 60s timeout here.
5. **A login-side-only deploy still triggers the full ladder**: the
   31st changed only the login JS (CSS + app quiet), but the
   protocol ran the complete confirmation ladder — a login change
   can presage an app rollout; the byte-stability pair is the
   independent app-surface re-confirmation.

## §79 Session 69 (parity round 68) — the 32nd-deploy confirmation ladder + the HTTP-layer security-headers parity set

**The round's context.** The recorded backlog came out of round 67 empty
of open visual/functional items — the matrix complete (color × light/dark,
geometry × light/dark, spacing × light/dark), the security patches current
(16.4.2), the history divergence closed and pinned. The remaining standing
items: the deploy watch (re-armed at the post-31st finals), the Next.js
patch watch, and the open superset-expansion consideration. This round
converted all three.

**THE 32ND LOGIN DEPLOY** (`scripts/r69-deploy-watch.mjs`, the post-31st
finals armed): login JS `8hcVVGz2`→`CKnh3tRk` plus a NEW
`api/frontend-config.js?v=3` script; login CSS QUIET (`BpSyi-cD`); the
app side QUIET (`C-IrDy5f`/`BGNH4KkS`). The frontend-config payload is
Base44 PLATFORM infrastructure — Datadog tokens, the Turnstile site key
(`TURNSTILE_LOGIN_ENABLED: "true"`), the Google client ID, platform URLs —
not an Eon-HR-app change. The login DOM recon: structurally unchanged
(the same 7 buttons — Continue with Google/Microsoft/Apple, Sign in,
Forgot password?, Need an account? Sign up — one form, email+password,
ZERO Turnstile iframes/widgets rendered for our session). The full
confirmation ladder ran anyway per the standing protocol: after a fresh
re-auth — standing **5/5** + sweep **12/12** + verify-r49 **13/13** +
verify-r45 **13/13** (the login-view family: the direct paired audit of
the changed surface) → **NON-VISUAL**. The Turnstile config is recorded
as a standing watch note: while the challenge stays unenforced for our
flow, no clone-side action; an ENFORCED rollout would break the watch's
own re-auth and require a login-surface re-audit + a clone-side
bot-guard decision.

**R69-A — the HTTP-layer parity set (the round's fix family, the first
below the DOM layer in the project's history).** 67 rounds of audits
lived at the DOM/computed-style layer; the HTTP response-header layer
was never censused. The live REF serves a 5-header security set on every
response (`curl -sI https://eon.base44.app/login`):

- `x-content-type-options: nosniff`
- `x-frame-options: DENY`
- `referrer-policy: strict-origin-when-cross-origin`
- `strict-transport-security: max-age=31536000`
- `permissions-policy: camera=(self), microphone=(self),
  geolocation=(self), payment=(self), usb=(self), magnetometer=(),
  gyroscope=()`

The clone's standalone served NONE of them (next.config.ts had no
`headers()`; src/proxy.ts adds none; zero existing tests). The fix:
`async headers()` in `next.config.ts` — source `/:path*` so every route
(pages AND `/api/*`) carries the set, exactly like the REF platform.
Design decisions: HSTS included (browsers ignore it over plain HTTP —
the local/E2E transport; it protects real TLS-fronted deployments; it
matches REF); `x-frame-options: DENY` safe (the app never frames
itself); NO CSP (REF serves none, measured — and a Next.js CSP needs
its own nonce pipeline for inline/hydration scripts). TDD: the pin RED
first (`tests/e2e/session69-security-headers.spec.ts` R69-Aa the page
route + R69-Ab the API route — 2 specs failing on the headerless
build) → the fix → re-build → pin GREEN (3/3 with the setup project) →
curl parity verified against the served standalone (page + API both;
values byte-identical to REF — the casing difference is transport-level
HTTP/1.1 vs HTTP/2 normalization). E2E 368 → 370. **The one legacy
amendment the fix required (R51-A2, per the r65/r66 protocol)**: the
rewrite-scope pin's regex matched `source:` literals across the WHOLE
next.config.ts, so the headers() block's own `source: "/:path*"`
(Next's headers API shares the key name) tripped it — the pin now
reads the REWRITES() BLOCK (its true contract: exactly the two
entries) and ADDITIONALLY pins the headers contract (exactly one
catch-all; the two config surfaces kept separate). 910/910 green.

**The standing checks.** The mobile-menu full functional cycle (toggle →
the drawer opens with Dashboard/Training LMS/Assets/Staff Requests/AI HR
Assistant → the Training LMS link navigates to /training → auto-close
`open:false` verified). The byte-stability pair: **the 456 LIGHT mobile
drawer pair @390×844 BYTE-MATCHES the r68 438 pair on BOTH sides
(md5-identical) — the FIVE-round chain (456 ≡ 438 ≡ 418 ≡ 402 ≡ 366)**:
the 32nd deploy left the mobile surface byte-identical AND the header
patch changed zero rendered bytes. The TW-v4 standing scan: `!important`
15 (baseline held), the oklch hits all comments. Screenshots: the
440–457 set (18 files → 640 on disk; all 9 same-number pairs
hash-distinct) — the LOGIN page pair on the 32nd-deploy REF (captured
logged-out, fresh sessions, BEFORE the auth) + the LIGHT standing route
pairs + the mobile drawer pair. DB pristine (the verify-r45
loading-probe user swept per the r61 protocol).

**Gates:** lint 0/0 · tsc ✓ · 910/910 unit · build ✓ · **E2E 370/370**
(zero flakes) · the ladder NON-VISUAL (43/43) · byte-stability 456≡438
· DB pristine. `.env.example` verified (only DATABASE_URL + AUTH_SECRET
are read — the process.env sweep re-run this round).

**Carry-forward lessons (session-69 instrument notes):**

1. **The layer below the DOM exists** — after 67 computed-style rounds,
   the HTTP response-header layer was the last un-audited surface; the
   REF's platform infra (not its app code) carried a full security set
   the DOM census could never see. Census new LAYERS, not just new
   members of a censused layer.
2. **A tool-timeout kill takes the spawned server with it** — the
   screenshots wrapper spawned the :3200 server WITHOUT `setsid`, so
   the 600s tool timeout killed both; the surviving evidence (the URL +
   the drawer state) proved the killed tail had ALREADY run, but the
   clean re-run needed the detached reboot. Long-running instruments
   spawn their servers `(setsid … &)` or accept re-booting on kill.
3. **The deploy-watch verdict can ADD instruments** — the 32nd shipped
   a NEW script (`frontend-config.js`) the fingerprint regex had to
   grow around; the watch's value is the DIFF against the last known
   set, and new members are findings to decode (payload read), not
   noise to ignore.

## §80 Session 70 (parity round 69) — the SEO-surface parity pair (sitemap + robots Sitemap directive) + the CSP nonce pipeline (the first security-policy superset)

**The round's motivation.** The recorded backlog stayed EMPTY of open
visual/functional items; the standing watches were the deploy watch, the
Next.js patch watch, and the superset-expansion consideration. The r68
lesson ("census new LAYERS, not just new members") sent the sweep below
the response headers, where it found the last uncensured member of the
SEO layer the clone otherwise supersedes.

1. **The watches: BOTH QUIET.** The r70 deploy watch (the post-32nd
   finals armed) read the login side at JS `CKnh3tRk` + CSS `BpSyi-cD`
   (the frontend-config preload holding) and the app side at
   `C-IrDy5f`/`BGNH4KkS` — no 33rd deploy, NO ladder required. The
   fresh re-auth succeeded clean (the Turnstile challenge unenforced
   for our session/IP — the standing login-side watch item). `npm view
   next`: 16.4.2 remains the latest stable (16.5.0 canary-only).
2. **THE SEO-SURFACE GAP (R70-A)**: the live REF serves
   `sitemap.xml` (200, application/xml, 61 `<url>` entries — `/` at
   1.0 + the 60 app routes at 0.8, all `<changefreq>weekly</changefreq>`,
   no `<lastmod>`; saved as docs/ref-sitemap-r70.xml) and its
   robots.txt declares `Sitemap: …/sitemap.xml`. The clone served NO
   sitemap route and its static robots.txt had no Sitemap directive.
   Fixed with the Next metadata routes: `src/lib/sitemap-routes.ts`
   (the 61-slug canonical registry — the session-32 complete page set
   in the clone's lowercase canonical form — + `buildSitemap`, the
   pure builder) + `src/app/sitemap.ts` (origin via headers(), the
   metadataBase pattern) + `src/app/robots.ts` (REF's directives + the
   clone's `Disallow: /api/` superset + the origin-resolved Sitemap
   line), with `public/robots.txt` DELETED (the static file shadows
   the route). The live URL-set diff: REF's 61 ⊆ the clone's 62; the
   one superset member `/dashboard` (the clone's canonical dashboard
   route — its page canonical points there; REF omits it only because
   its dashboard IS `/`). Documented renderer normalizations (not
   divergences): priority `1` vs REF's `1.0` (xsd:decimal-equal), the
   robots `User-Agent:` capitalization (the spec is case-insensitive),
   compact XML vs REF's pretty-print.
3. **THE CSP NONCE PIPELINE (R70-B) — the first security-policy
   SUPERSET** (REF serves no CSP — measured in r68): the official
   Next.js middleware-nonce pattern. `src/lib/csp.ts` `buildCsp(nonce,
   isDev)`: `default-src 'self'; script-src 'self' 'nonce-N'
   'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self'
   data: blob:; font-src 'self' data:; connect-src 'self'; base-uri
   'self'; form-action 'self'; frame-ancestors 'none'; object-src
   'none'` — NO upgrade-insecure-requests (it would upgrade the
   plain-HTTP standalone's subresources to https and break the local +
   E2E transport; HSTS covers TLS), dev adds `'unsafe-eval'` + `ws:`.
   `src/proxy.ts` extended: the per-request nonce set on the REQUEST
   headers (Next reads the nonce from the request CSP header and
   stamps it on every script it renders — curl-verified: the chunks
   carry `nonce="…"`) AND the response; the matcher widened to include
   /login + /logout (documents with scripts), the R55-C auth-redirect
   explicitly scoped past the two auth pages. The root layout nonces
   its own inline scripts (THEME_BOOT + the two JSON-LD blocks — CSP
   applies to non-executable script types too). The strict `'self'`
   baseline is EARNED: the full-source URL sweep reads ZERO external
   runtime resources (only placeholder strings in seed data). The
   functional proof: the FULL E2E suite green on the patched build —
   any blocked script would break hydration and fail the suite loudly.
4. **The standing checks**: the mobile-menu cycle green (toggle → the
   drawer with Dashboard/Training LMS/Assets/Staff Requests → the
   Training LMS link CLICKED:/training → auto-close `open:false`
   verified); **the byte-stability pair 474 BYTE-MATCHES the r69 456
   pair on BOTH sides (md5-identical: ref e24ad06…, loc e3df921…) —
   the SIX-round chain (474≡456≡438≡418≡402≡366)**: the quiet REF +
   the header/meta-layer fix families changed zero rendered bytes; the
   TW-v4 scan clean (`!important` 15, oklch all comments); DB pristine
   (users = [sepnetflix2023@outlook.com] only). The sweep's other
   findings recorded: REF's soft-404 (HTTP 200 SPA shell on unknown
   routes — the clone's proper 404 kept as the production-grade
   superset) + REF's manifest/favicon 302-redirects (the clone
   self-hosts both).

TDD: +12 unit (the 7-spec sitemap seam incl. the registry-vs-filesystem
readdirSync pin + the 5-spec csp seam) + 4 E2E (both pairs), RED-first
(4 failed on the unpatched build → 5/5 green after). Gates: lint 0/0 ·
tsc ✓ · **922/922 unit** · build ✓ · **E2E 374/374 (5.6m, zero
flakes)** · byte-stability 474≡456 · DB pristine. Screenshots: the
458–475 set (18 files → 658 on disk; all 9 same-number pairs
hash-distinct).

**The session-70 instrument lessons (carry-forward):**

1. **The detached-launch pattern needs the parenthesized subshell** —
   `setsid nohup … &` inside a `&&` chain still died silently (the
   18-byte log); `(setsid nohup … < /dev/null &)` survived. The r68
   lesson survives refinement: it is not setsid alone but the
   double-fence (subshell + setsid) that escapes the tool's process
   group.
2. **Assert against the renderer's serialization, not the spec's
   spelling** — the sitemap pin expected `<priority>1.0</priority>`
   (REF's bytes) where Next serializes `1`; the robots pin expected
   `User-agent:` where Next renders `User-Agent:`. RED-first caught
   both on the patched build in seconds; the fix is in the ASSERTION
   (the semantic contract — xsd:decimal equivalence, case-insensitive
   directives), never in re-implementing the renderer's bytes.
3. **Template scripts inherit template bugs** — the r69 screenshots
   template's auto-close eval had an unbalanced paren (a SyntaxError
   misread as a check failure); the cycle's URL evidence proved
   navigation, and the direct re-run (`open:false`) closed the proof.
   Copy an instrument, re-verify its weakest read.

## §81 Session 71 (parity round 70) — the CSP completion pair (the missed JSON-LD nonce + the style-src elem/attr split) + the TLS-fronted deployment story + the drawer-instrument correction

**The round's motivation.** The backlog stayed EMPTY; the standing
watches were the deploy watch, the patch watch, the Turnstile rollout,
and the candor-ordered superset candidates: "a TLS-fronted deployment
story, CSP style-src hardening, and whatever the next deploy carries."

1. **THE 33RD LOGIN DEPLOY: DETECTED, LADDERED, NON-VISUAL.** The r71
   watch read login JS `CKnh3tRk`→`BCr9BMlh` (CSS quiet, the app side
   quiet). The full ladder: standing 5/5 + sweep 12/12 + verify-r49
   13/13 + verify-r45 13/13 — and this round the login standing pair
   BYTE-CONFIRMS the verdict (476 ≡ the r70 458 pair on both sides:
   the deploy changed the login JS hash without changing a rendered
   byte). The watch finals are the post-33rd hashes.
2. **R71-A THE CSP COMPLETION (the pure superset deepened).** The r70
   delta audit found the root layout's two JSON-LD blocks nonced but
   the LOGIN LAYOUT's BreadcrumbList bare — CSP gates
   non-executable script types too, so the browser blocked it
   silently (no visual delta, invisible to the E2E suite; caught by
   reading the served HTML with curl). The same audit swept the whole
   surface for `<style>` ELEMENTS: exactly ONE exists (the session-45
   login focus-cascade mirror; 27 app routes + 404 + logout read
   zero) — which reshaped the "nonce'd style pipeline touching every
   Radix primitive" candidate into the CSP spec's elem/attr SPLIT:
   `style-src-elem 'self' 'nonce-N'` + `style-src-attr
   'unsafe-inline'` (the attribute side is DYNAMIC by nature — Radix
   popper px offsets, vaul transforms, recharts svg styles cannot be
   nonce'd or hashed; the element side is where the hardening pays).
   The `<style>` block MOVED from the client page to the SERVER login
   layout (client components cannot read headers(); rendered before
   {children}, keeping the body-after-head-links winning cascade
   position). Dev adds elem 'unsafe-inline' (Turbopack's injected
   styles). Proof stack: the R71-A1..A3 pins + the CSP-violation
   console probe (dialog, select popper, 9 recharts svgs, the vaul
   drawer — zero violations) + the FULL suite green (380/380).
3. **R71-B THE TLS-FRONTED DEPLOYMENT STORY.** HSTS is served (r69)
   but only bites behind real TLS; the missing piece is the PROXY
   CONTRACT, now PINNED: the spoofed `x-forwarded-proto: https`
   resolves https:// sitemap locs + the robots Sitemap line + the
   canonical/og URLs (the whole metadataBase origin chain —
   zero-config TLS, no site-URL env var exists or is needed).
   DEPLOYMENT.md rewritten to the measured truth: the Eon HR name (it
   still said "ORBITAL"), the 42-handler/54-endpoint counts (it said
   16), the `NEXT_PUBLIC_SITE_URL` row DELETED (nothing reads it —
   the honest two-variable env contract), and the new §8 (nginx +
   Caddy examples, the x-forwarded-proto table, why the app serves
   its own security headers and no upgrade-insecure-requests).
4. **THE DRAWER-INSTRUMENT CORRECTION (the evidence lesson).** The
   492 byte-stability capture initially missed the 474 pair on BOTH
   sides — two instrument defects, not code changes: (a) the r70
   template's `button[aria-label="Toggle Sidebar"]` NEVER matched on
   REF since the r46 redeploy dropped the aria-label — every r66-r70
   REF "drawer pair" actually captured the drawer CLOSED (the probe
   instruments got the r46 amendment; the screenshot scripts never
   did); (b) a raw eval `b.click()` programmatic open triggers
   vaul/Radix onOpenAutoFocus — the first menu button renders its
   focus-visible ring, a different legitimate state than the
   user-realistic mouse open. The CORRECTED mechanism (the
   accessible-name snapshot ref, mouse-based): the LOC 492 pair
   BYTE-MATCHES 474 (md5 e3df921… — the SEVEN-round chain
   492≡474≡456≡438≡418≡402≡366 HOLDS through both r71 fix families)
   and the REF drawer is captured OPEN for the first time (bfaa0da…,
   the corrected baseline; ref-vs-loc open-drawer delta 3.6% — text
   antialiasing + the standing allowances, panel means within 4 sRGB
   units, scrims identical).

TDD: +2 unit (the csp seam's prod elem/attr split + the NO-blanket
regex + the dev elem allowance; the R44-A1 legacy pin amended to the
layout — the cascade mirror's new home) + 6 E2E (the R71-A triple RED
first — 3 failed on the unpatched build — + the R71-B TLS triple, the
r67 verification-pin pattern, GREEN pre-change and live-curl-verified;
one assertion-vs-renderer normalization: the robots "User-Agent:"
capitalization, the r70 lesson repeating on the round's own spec). The
session70-csp pin amended to the split contract. Gates: lint 0/0 ·
tsc ✓ · **924/924 unit** · build ✓ · **E2E 380/380 (5.9m, zero
flakes)** · byte-stability 492≡474 (LOC; the REF baseline corrected) ·
the ladder 43/43 · DB pristine. Screenshots: the 476-492 set (18
files → 676 tracked; all 9 same-number pairs hash-distinct; the route
pairs byte-stable vs r70 on both sides).

**The session-71 instrument lessons (carry-forward):**

1. **CSP gates the non-executable script types — audit them by
   reading the served bytes, not by watching the suite.** A blocked
   `application/ld+json` block produces zero rendering delta, so the
   380-spec suite stayed green over a policy violation for a full
   round. The catch instrument: curl the served HTML and grep the
   tag list for un-nonced members — the audit the r70 round should
   have run at GREEN time.
2. **Classify the gate before touching source.** The first suite
   launch failed 367/374 with `browserType.launch: Executable
   doesn't exist` — the fresh machine's playwright cache held
   chromium-1200 while @playwright/test 1.63 pins the 1248 shell.
   Infrastructure failure, not source debt: `bunx playwright install
   chromium` retired it without a single code edit. Reproduce, read
   the error's own words, then split infra from code.
3. **A byte-stability chain is only as honest as its capture
   mechanism.** The six-round drawer chain held — but the REF side
   was byte-stable at capturing a CLOSED drawer (the selector never
   matched since r46). Chains prove stability of WHAT YOU CAPTURE;
   when the pair's purpose is a specific state, verify the state
   itself (the scrim read, the link visibility) at capture time — the
   snapshot-ref click is the mechanism that survives attribute
   drift, and the mouse-vs-programmatic open distinction (the
   onOpenAutoFocus focus ring) is part of the state's definition.

## §82 Session 72 (parity round 71) — the Trusted-Types rung (the CSP strictness ladder's next step) + the PWA/offline story (the service worker + the offline fallback) + the 34th-deploy ladder

**The round's motivation.** The backlog stayed EMPTY; the standing watches
were the deploy watch (the post-33rd finals), the patch watch, the
Turnstile rollout, and the candor-ordered superset candidates from
session_155: "the remaining CSP strictness rungs (a Trusted-Types
story), a PWA/offline story (the manifest already self-hosted), and
whatever the next deploy carries."

1. **THE 34TH LOGIN DEPLOY: DETECTED, LADDERED, NON-VISUAL.** The r72
   watch read login JS `BCr9BMlh`→`DOgRuj38` (CSS quiet, the app side
   quiet, the preload holding). The full ladder: standing 5/5 + sweep
   12/12 + verify-r49 13/13 (one 0/13 zero.db re-create race, re-run
   green — infrastructure, classified before touching source) +
   verify-r45 13/13 — and the login standing pair (493) BYTE-CONFIRMS
   the verdict (≡ the r71 476 pair on both sides). The watch finals
   are the post-34th hashes.
2. **R72-A THE TRUSTED-TYPES RUNG.** The sink census green-lit it: the
   whole source reads ZERO raw DOM-XSS sinks (innerHTML/
   insertAdjacentHTML/document.write/outerHTML — all zero) and exactly
   FIVE dangerouslySetInnerHTML members, every one server-rendered,
   constant-authored and nonced. The rung (CSP3): `require-
   trusted-types-for 'script'` + `trusted-types default` (the
   policy-NAME allowlist) + the nonced TT_BOOT bootstrap FIRST in the
   root layout's <head> (the pass-through default policy:
   createHTML/createScript/createScriptURL identity functions —
   HONEST SCOPE: it enables the enforcement machinery and makes every
   future sink loud, it does not sanitize; the five current sinks are
   constant-authored, nothing to sanitize). Production-only (dev's
   Turbopack pipeline would trip it); Chromium-only enforcement
   (graceful elsewhere). The LIVE pin: creating a ROGUE policy name
   THROWS under the allowlist — RED pre-change (any name was allowed),
   GREEN post-change. The console probe: the dialog + the vaul drawer
   + 3 recharts svgs render with ZERO violations under the hardened
   policy.
3. **R72-B THE PWA/OFFLINE STORY.** The PWA-layer census measured REF:
   login-surface-only manifest linkage (a stale platform-template
   description, EXTERNAL supabase icons), NO manifest on the authed
   shell, ZERO service workers. The clone already superSETS the
   manifest surface (every-page linkage, self-hosted icons); the
   missing piece was the OFFLINE SHELL, now shipped: `public/sw.js`
   (CACHE `eon-hr-shell-r72`: the static shell precached at install +
   cache-first `/_next/static/` chunks + network-only NAVIGATIONS
   with the cached `/offline.html` fallback — page HTML is NEVER
   cached and NEVER served from cache: the authed-HTML leak-free
   design; /api/ passes through untouched) + `public/offline.html`
   (CSP-clean by construction: zero scripts, zero `<style>` ELEMENTS
   — inline style attributes only) + the nonced production-only
   SW_REGISTRATION bootstrap. The proof quadruple: the UN-AUTHED
   /sw.js fetch (200 + the 5-header set), the nonced registration
   script in the served HTML, the LIVE registration (ready resolves,
   scope '/', the reloaded page controlled), and the setOffline(true)
   navigation landing on the offline page. The FULL suite green WITH
   the worker active is the functional proof.
4. **THE EIGHT-ROUND BYTE CHAIN.** The 509 drawer pair BYTE-MATCHES
   the r71 492 pair on BOTH sides (loc `e3df921…`, ref `bfaa0da…` —
   509≡492≡474≡456≡438≡418≡402≡366): the two new <head> boots are
   non-visual, zero rendered bytes, and the corrected open-drawer REF
   baseline reproduces. All 9 pairs byte-stable vs the r71 set
   (493≡476 through 509≡492).

TDD: +13 unit (the csp seam's TT pair + worker-src pins in both shapes
+ the dev NO-TT pin; the pwa-surface seam: the SW semantic contract
(the versioned cache, the shell list, the EXACTLY-ONE caches.match,
skipWaiting/clients.claim), the offline page's CSP-clean construction,
the manifest's self-hosted-icons superset, the root-layout source
pins) + 7 E2E (the R72-A triple RED-first + the R72-B quadruple RED-
first; one assertion-vs-authoring normalization: the /sw.js quote
style). Gates: lint 0/0 · tsc ✓ · **937/937 unit** · build ✓ ·
**E2E 387/387 (6.2m, zero flakes — the SEQUENTIAL proof run)** ·
byte-stability 509≡492 (the eight-round chain, both sides) · the
ladder 43/43 NON-VISUAL · 694 tracked screenshots (+18) · DB
pristine. TRAPS (both infrastructure, classified before touching
source): the zero.db re-create race (0/13 → re-run 13/13) and the
CONCURRENT-load chromium target-crash (the mid-round 379/380+1 read
with the ladder running in parallel; the organogram spec 3/3 green in
isolation; the final sequential run 387/387).

**The session-72 instrument lessons (carry-forward):**

1. **Port-safe is not LOAD-safe.** The ladder uses :3200/:3201 and the
   suite uses :3100 — the r70 round ran them concurrently and got
   away with it; this round's concurrent run crashed one chromium
   target at `browserContext.newPage` and timed out another at
   context setup (45s), with the failing set VARYING between runs
   (the nondeterminism signature of infrastructure, not source).
   The final proof run must be SEQUENTIAL — nothing else heavy on
   the machine while the suite reads its verdict.
2. **Re-run before root-cause.** verify-r49's first read this round
   was 0/13 — every LOC pair showing the login page — on byte-
   identical code to the round that read 13/13. The re-run read
   exactly 13/13. The zero.db re-create (rm + push + seed + boot in
   one process tree) races itself on a loaded machine; one green
   re-run on identical source retires the question before any
   investigation.
3. **A functional superset needs a leak-free design, not a maximal
   cache.** The easy PWA story caches everything; the honest one
   caches the static shell ONLY — page HTML never enters the Cache
   Storage (no stale authed pages, no cross-user leakage on shared
   machines), navigations go to the network first and fall back to
   the offline page. Less cache, more truth: the E2E offline spec
   PROVES the fallback on an uncached route rather than asserting a
   cache hit.
