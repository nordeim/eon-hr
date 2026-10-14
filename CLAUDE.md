---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
---

# Eon HR

A full-stack HR management platform (Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Prisma/SQLite) with 61 routes (REF's complete page registry — the session-32 orphan-route hunt), 51 API endpoints, 47 data models, HMAC cookie auth, and a 765-spec test pyramid (598 unit + 167 E2E).

**Tech Stack:** Next.js 16 (App Router, standalone output) · React 19 · TypeScript 5 (strict) · Tailwind CSS 4 (CSS-first) · Radix UI primitives · Prisma 6 + SQLite · Zod 4 · Recharts 2 · Vitest 5 · Playwright 1.63

## Core Identity & Purpose

Eon HR is a production-grade clone-and-extend of a commercial HR SaaS product. It exists to provide (1) pixel-parity with the reference UI — sidebar shell, employee-portal dashboard, mobile drawer navigation — and (2) a functional superset: every module (employees, payroll, recruitment, training, compliance, performance, assets, communications, analytics, AI assistant, settings) implements real CRUD against a typed Prisma schema. It is maintained as a reference-quality codebase: tested, linted, documented, and deployable as a standalone Node server.

Key technical decisions: custom HMAC-signed cookie sessions over NextAuth (stateless, zero external dependencies, immediate revocation via user re-read); SQLite over PostgreSQL (zero-config local story, schema-relative path resolution pinned by tests); REST route handlers with a typed ActionResult envelope over Server Actions (uniform testable boundary for all 49 endpoints); integer minor units for all money.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — mine requirements fully; read the affected files, schema, and tests before proposing anything.
2. **PLAN** — produce a structured roadmap; present it before implementing.
3. **VALIDATE** — get explicit approval before writing code (scope money/auth/state-machine changes explicitly).
4. **IMPLEMENT** — modular, tested, documented increments; one logical change per commit.
5. **VERIFY** — run the full gate: `lint → typecheck → test → build`, then browser-verify the golden path; check edge cases, accessibility, and security.
6. **DELIVER** — hand off with verification evidence; document what was Verified / Reasoned / Assumed and what remains.

### Project-Specific Principles

- **Parity first, superset second**: match the reference UI byte-for-byte where it exists (colors pinned by measured hex, shadow geometry pinned, empty-state copy verbatim); extend functionality without changing the visual grammar.
- **Server is truth**: client state mirrors API responses; no derived state is stored.
- **Money is integers**: SAR amounts circulate as halalas; conversion happens only at form boundaries.
- **No error swallowed silently**: every catch logs once and returns an actionable message.

## Implementation Standards

### General Coding Practices

- Early returns; composition over inheritance; self-documenting names.
- TDD Red-Green-Refactor for pure seams (auth, db-path, utils, validation); regression test before any bug fix ships.
- Strict TypeScript: no `any` (use `unknown`), `interface` for shapes, `type` for unions.

### Language & Framework Guidelines

- **Next.js 16**: App Router only. `params`/`searchParams`/`cookies()`/`headers()` are always `await`ed. Page files export only `default` + route segment config (`dynamic`, `revalidate`). Standalone output (`output: "standalone"`).
- **Client vs server**: `"use client"` only for interactive leaves; analytics pages stay server components and pass plain serializable data to chart islands.
- **Server Components** read the database directly; client pages fetch `/api/*` route handlers.
- **Fonts**: NO webfont — the reference self-hosts none; `--font-sans` in
  `@theme` pins Tailwind v4's default `ui-sans-serif` stack verbatim
  (session-4 measurement). Never add `next/font`/`<link>` fonts; they drift
  text metrics off the reference.
- **Metadata API** for titles; root layout exports the template `"%s | Eon HR"`.
- **Radix + CVA** (shadcn pattern) for primitives — wrap/style, never rebuild.
- **Tailwind 4**: CSS-first `@theme` in `src/app/globals.css`; NO `tailwind.config.js`. Respect the six engine traps in `docs/Tailwind-V4-Validation-Report.md` (full hsl() values, pinned palette, sRGB gradients, no child margins under `space-y`, pinned `--shadow-sm`, and the space-y selector flip for hidden first siblings — trap 6 needs an explicit mt-* on the second child).
- **Prisma**: single `schema.prisma`; `db:push` for local, migrations for production; the client is a `globalThis` singleton (`src/lib/db.ts`).
- **API design**: `/api/{resource}/route.ts`; Zod-validated bodies; typed `ApiResult<T>` envelope; mutation endpoints take `?id=` for PATCH/DELETE.

## Development Workflow

### Environment Setup

```bash
bun install                 # install dependencies
cp .env.example .env        # DATABASE_URL="file:../db/custom.db"
bun run db:push             # push schema → <repo>/db/custom.db
bun run db:seed             # seed demo user + company + leave balances
bun run dev                 # dev server on http://localhost:3000
```

### Build Commands

| Command | Purpose |
|---|---|
| `bun run dev` | Dev server (port 3000, Turbopack) |
| `bun run build` | Production standalone build (`.next/standalone/`) |
| `bun run start` | Run the standalone server (NODE_ENV=production) |
| `bun run lint` | ESLint over the repo |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` | Vitest unit layer |
| `bun run test:e2e` | Playwright E2E (build first!) |
| `bun run db:push` / `db:seed` / `db:generate` | Prisma utilities |

**Sign-in:** `sepnetflix2023@outlook.com` / `$Abcd1234` (seeded).

## Testing Strategy

### Test Pyramid

| Layer | Framework | Files | Specs | Location |
|---|---|---|---|---|
| Unit (pure seams) | Vitest | 6 | 598 | `tests/unit/`, `tests/db-path.test.ts` |
| E2E (browser) | Playwright | 20 | 167 | `tests/e2e/*.spec.ts` |

- **Unit**: db-path resolution contract (15), auth crypto/session (14 — incl. the production secret boot guard), money & date utils (13), design-token contract (session-6 re-measured: neutral foreground #0A0A0A, white background, neutral secondary/accent #F5F5F5, exact destructive #EF4444, neutral-900 #171717, the v3 palette pin and shadow geometry), session-5 parity recipes (38 — sidebar leaf/group geometry, mobile chrome, the six PageHeader layout recipes and the per-page icon-color matrix), session-6 content recipes (27 — card/StatCard/EmptyState/button variants, dashboard cards + kicker, taskmanager board, per-page gradient map, shell canvas), session-7/8/9 shell recipes (37 — md responsive boundary, category-A mobile kickers, the inline Add-Employee wizard: max-w-4xl card, gradient header, 48px icon circles, photo-upload circle, border-t footer, overlay rgba pin, plus the session-8 interior pins: sRGB card-header gradient, trailing ArrowRight CTA, 68px field wrappers, plus the session-9 pins: centered actions cluster + row-level raised offset, centered headers, small-page 24px recipes, the static mobile kicker, the analyticsdashboard page root, the employees native-select filter row, plus the session-10 pins: the centered-title flex-1 row fill, the companywall max-w-3xl feed + composer recipe, the training bare-H2 section row + dark/outline tab strip + simple empty state, the eight-variant StatCard map with the per-page matrix, the attendance seven-button cluster + Report Type toolbar, the session-aware 404 page, plus the session-11 pins: the two-pattern actionsStart header taxonomy, the cyan-700 pin, the composer precision recipe, the toast viewport geometry, the read-only headers, the shiftcalendar toolbar + table calendar, the kanban board, the reports icon chips, the profile identity card, the empty-state mb-4 fix, plus the session-12 pins: the sidebar footer left-aligned cluster recipe, the EmptyState conditional descriptionClassName + iconChip variant, the systemic table th/empty-row recipe, the documenttracker stat/chip/bare-empty recipes, the DIV-title border-b headers, the evaluations equal-width tab pill + value-in-tile stats, the employees zero-render, the communications channel cards, the analyticsdashboard full-width chart stack, the chart-page height pins, the securitysettings plain rows, plus the session-13 pins: the notificationpreferences stat/row/save/simple-empty recipes, the hrreports toolbar grid + flush subtitle + gap-2 actions + per-tile stat colors + padded table container, the analytics stacked-tile + border-b chart-card + plain-summary recipes with unconditional charts, the staffrequests px-3 py-1 trigger, the PageHeader subtitleClassName/actionsClassName and StatCard labelClassName props, plus the session-14 pins: the systemic iconed-button mr-2/mr-1 matrix, the white shrink-wrapped tab-pill recipe with space-y-6 roots + mt-0 contents, the three tab-trigger icon gap recipes, the line-box field recipe (inline label + mt-2 control), the settings Company card, the profile 4-tab + General form, the attendance Mark Attendance tabs + access-restricted recipe, the compliance tab restructure, the reports category card + tile grid + Report Filters, the offboarding col-span-full empty, the surveys zero-render, the no-tile StatCard flex row, the taskmanager empty column + DIV badge, the payrollengine 64px fields, the shiftcalendar gap-2 chevron cluster + anchor CTA, the hrreports empty Group By default, plus the session-15 pins: the recruitment white pill + 12px gap-1 trigger icons, the training role=group chip row + empty h2 row + empty-state CTA + dashed add-tile, the performancemanagement white pill, the staffrequests plain-block pill wrapper (the x-position pin), the profile preferences TabsContent value + 4-field General + type=button Change Photo, the compliance size=sm notify buttons, plus the session-16 pins: the systemic tab-pill neutral-500 inactive color (REF's muted-foreground token visibly renders on tab surfaces), the sidebar footer Bell slate-600 / Moon zinc-700 / name zinc-700 colors, the actions-cluster fitting rule (no shrink-0), the organogram bare card + simple empty + overflow wrapper, the staffrequests bg-secondary pill + mine default scope, plus the session-17 pins: the flex-centered never-padded StatCard tile (min-content = the bare svg; shrinks 48→24 under constraint), the workflowautomation zero-render (nothing below the stat row), the chat sidebar p-8 text-center + right-pane bare-centered 80px-icon recipes, the surveys "0%" zero value, the employees shrinkable filter-row search (md:flex-initial + md:max-w-64). Plus the session-18 pins: the per-page rowBreakpoint taxonomy (nine REF-md pages vs the always-row sm default), the profile kicker back-button + subtitle recipe (36px ghost ArrowLeft, 69px bar), attendance's md:flex-wrap. Plus the session-19 pins: the interaction-parity focus-ring taxonomy (the systemic button ring-1 no-offset recipe, the Input/Textarea ring-offset-2, the sidebar ring-sidebar-ring blue-500 token + its three call sites, the mobile hamburger focus classes, the login slate-400 input pair + zinc-950 Sign in ring with the same-variant tailwind-merge lesson, the select trigger button recipe, the TabsTrigger ring-offset-2). Plus the session-20 hover-recipe pins (13 — the sidebar zinc-100/#18181B/0.8 leaf recipe + active-leaf text flip, the footer ghost accent recipe with the bell SVG owning text-slate-600, the user name slate-900 correction, the blue-tinted Import CSV outline, the accent menu-item recipe incl. the red Logout flip, the login shadow-sm + no-underline pair, the mobile hamburger colors, the no-hover bottom tabs, the ASCII-dots placeholder). Plus the session-21 pressed-state pins (5 — the group button active: pair + the expanded-group data-[state=open]:hover: gray recipe, the leaf/sub-item authored active: pair, the active-leaf text-only pressed flip with the v4-utility-vs-unlayered-class lesson, the active bottom tab bg-blue-50 pill). Plus the session-22 motion pins (7 — the group trigger transition-all duration-200 recipe, the chevron instant-snap negative pin, the globals.css enter/exit keyframes + @utility animation subset, the select + user-dropdown fade/zoom recipes, the drawer slide utilities with the 500ms/300ms + vaul-bezier timings, the toast fade+slide enter). Plus the session-23 scroll-dimension + dialog-surface pins (13 — the no-scrollbar-styling contract across sidebar-nav/dialog/globals, the TabsContent mb-0! phantom killer, the loans dialog max-w-2xl + H2-only header + the four loan types + the installment display + Paid From + the Requesting-for card + justify-end Submit Request actions + the API/schema loanType/paidFrom + the table Type column, the compliance Expired-first order + At-Risk title, the hrreports 33px uppercase-th + header-only-at-zero contract, the attendancedashboard 37px all-left th + the py-8 P empty state). Plus the session-24 cursor + selection pins (5 — the base-layer button cursor-pointer restoration with the v4-preflight-removal lesson, the select-none contract on exactly the 8 REF-wrapped page roots, and the NEGATIVE scope lock pinning /settings selectable for the 38 auto routes). Plus the session-27 reduced-motion + DnD pins (6 — the globals.css prefers-reduced-motion block's presence/recipe/unlayeredness/media-scoping with the never-animation-none Radix unmount trap, and the kanban DnD source contract: draggable/setData/preventDefault/onDrop/moveTask). Plus the session-28 DnD depth pins (7 — the recruitment pipeline DnD source contract: draggable/setData/preventDefault/onDrop/onMove + the cursor-grab affordance; the within-column reorder: Task.position in the schema, the GET position-asc/createdAt-desc ordering, the PATCH order array with positional reassignment, and the taskmanager insertion-target contract: dragOverId + reorderTask). Plus the session-29 ordering-depth + print pins (6 — Candidate.position in the schema, the GET position-asc/appliedAt-desc ordering, the PATCH order array with the transactional reassignment, the recruitmentkanban insertion-target contract: dragOverId + reorderCandidate over the FULL candidates array + the preserved cross-stage toast; the globals.css @media print block's selectors and its UNLAYERED placement after the reduced-motion rule). Plus the session-30 pins (6 — the leaf-list ul WITHOUT mb-1: the expanded-group trailing gap is the root wrapper's gap-1 only, REF-measured 4px (the session-5 pin corrected); the organogram page delegating to the client island; the island's DnD source contract: draggable/setData/dragOverId ring/reparent with the { managerId } PATCH + router.refresh; the client cycle guard (isDescendant before any request); the employees PATCH ancestor-walk cycle guard; the print block's print-color-adjust exact + @page 10mm). Plus the session-31 pins (7 — the drawer Content's border-r + the swipe contract (touchstart/move/end + threshold + the horizontal-dominant guard); the chat left-card natural-height recipe (CardHeader p-4 border-b + the text-sm title + the p-2 max-h-96 body + the plain No chats line, the stretched card NEGATIVE-pinned); the chat right-pane centered MessageSquare + single-line recipe with the extra-copy NEGATIVE pins; the legacy /assets flat36 always-row header + green-to-blue canvas + bg-slate-50 band + leading-none title + the Inbox-over-line empty; the legacy dialog field set incl. Desktop/Tablet; the API enum extension). Plus the session-32 pins (16 — the orphan-route coverage census 47→61; the 10 real-page recipes: the careers sRGB hero, the employeeportal centered H2+circle card, the externaljobapplication icon-first empty + space-y-12 wrapper + pt-12 content, the hrassistant single-pane chat, the payrollai green canvas + stat trio, the payrollreports hand-rolled 56/108/156 header + filter/tabs/report cards, the requestreports/requestsettings centered flush-sub headers + 960px config cards, the shiftswap violet canvas + tab pills, the tenantsetup mb-[22px] circle + h-11 fields; the dashboard alias re-exports + plain titles; the blank null renders; the ShiftSwap + ApprovalConfig schema contracts; the two API routes' guard/requireUser presence). Pure functions/CSS only — no Prisma, no network.
- **E2E**: auth logged-out surface; sidebar + all 47 routes render (incl. REF's legacy /assets orphan); mobile navigation regression pins (drawer 288px, dark overlay, no X button, bottom tabs — text-sm labels, blue active tab, 16px leaf icons / 20px group icons, the sticky mobile kicker at top-[73px]); the md responsive-boundary pin (767px mobile chrome → 800px desktop sidebar); dashboard parity (leave balances 21/21, 30/30, bordered quick-action chips, single-line expense total, active-nav `rgb(24,119,242)`, the session-6 card recipe — 222px cards, 24px-title rows, #0A0A0A tokens); per-page canvas + CTA colors (payroll green gradient + dark empty-state CTA); taskmanager board recipe; the kanban drag-drop round-trip (synthetic DragEvents, Backlog→Done, persisted after reload); the within-column reorder round-trip (drag a card onto another, order persists via the position column); the recruitment pipeline drag-drop round-trip (applied→interviewing, persisted after reload); the within-stage candidate reorder round-trip (drag a card onto another in the same stage, order persists via the position column); the print-media superset (under page.emulateMedia print the shell chrome computes display:none, the padding/min-height resets apply, cards break-inside avoid + print-color-adjust exact; screen media restores everything); the organogram re-parent superset (drag a node onto another, managerId persists after reload; dropping onto a descendant is rejected with the cycle toast); the hr-assistant chat empty-state contract (the natural-height card + the centered MessageSquare pane; the extra copy NEGATIVE-pinned); the legacy /assets contract + add-asset round-trip (incl. the desktop type; beforeEach pre-clean — the e2e DB persists across runs); the drawer border pin + the swipe-to-close pair (CDP touch dispatches — the enter-animation settling + inter-phase frames lessons; the sub-threshold test polls the live transform mid-gesture); 4-step inline wizard CRUD round-trip against an isolated `db/e2e.db` on the production standalone server (port 3100).

### Test Commands

```bash
bun run test                                    # unit layer
bun run build && bun run test:e2e               # e2e layer (needs the standalone build)
bunx vitest run tests/unit/auth.test.ts         # one unit file
bunx playwright test tests/e2e/dashboard.spec.ts # one e2e spec
```

## Code Quality Standards

### Linting & Formatting

```bash
bun run lint        # eslint . — must be clean before commit
bun run typecheck   # tsc --noEmit — must be clean before commit
```

ESLint 9 flat config with `eslint-config-next` and TypeScript rules. Never
disable a rule to make a gate pass — fix the code or flag the debt.

## Git & Version Control

### Branching Strategy

`main` only. Short-lived feature branches when collaborating; merge within 1–3 days. Push via `docs/ssh_git_wrapper_v3.py` (see `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).

### Commit Standards

Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`), atomic units, imperative mood, explain why in the body when non-obvious. Never commit secrets, keys, or `.env`.

## Error Handling & Debugging

- API handlers wrap their body in `guard()` — one catch, one structured `console.error`, one `INTERNAL` response. Never return raw exception text.
- Client fetches always branch on `json.ok`; failures surface as toasts with `error.message`.
- Debugging: `dev.log` (dev server), `console.error` entries carry the route context; E2E traces land in `test-results/`.

## Communication & Documentation

Explain the "why" behind decisions in commit messages and ADRs. Document assumptions and constraints when they affect future changes. Keep `AGENTS.md`, this file, `README.md`, and `Project_Architecture_Document.md` in sync with the code — update them when behavior, commands, or architecture change.

## Project-Specific Standards

### Architecture

- `src/app/(app)/*` — 60 authenticated routes behind the shell layout (auth guard + sidebar + mobile drawer + bottom tabs) — the full REF registry incl. the 14 session-32 orphans.
- `src/app/api/*` — 51 route handlers, one file per resource.
- `src/components/ui` — primitives; `src/components/shared` — page furniture; `src/components/layout` — shell.
- `src/lib` — auth, api envelope, db client, db-path resolver, validation, utils, nav config.

### API Design

`ApiResult<T> = { ok: true, data: T } | { ok: false, error: { code: ApiErrorCode, message, fieldErrors? } }`. Codes: `VALIDATION | UNAUTHENTICATED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL`. HTTP status maps 400/401/403/404/409/500.

### Database / Data Layer

47 Prisma models over SQLite (session 32 added ShiftSwap + ApprovalConfig). Relative `file:` URLs resolve against `prisma/schema.prisma` (db-path contract). Money: integer minor units. JSON-shaped fields parse defensively. Idempotent seed (natural-key upserts).

### Environment Variables

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | SQLite (or PostgreSQL) connection. Relative `file:` URLs resolve against `prisma/schema.prisma` | `file:../db/custom.db` |
| `AUTH_SECRET` | HMAC session signing secret. REQUIRED in production (≥16 chars) | `openssl rand -hex 32` |

Only these two variables are read by the codebase (`src/lib/db-path.ts`, `src/lib/auth.ts`) — see `.env.example`.

## Anti-Patterns to Avoid

- CWD-relative or absolute SQLite paths "fixes" (break the db-path contract).
- Float arithmetic on money; `toFixed` before storage.
- Building state from fetched copies instead of re-fetching after mutations.
- `mt-*`/`mb-*` children inside `space-y-*` containers (Tailwind v4 trap 4).
- Silencing failing tests or loosening types to make a gate pass.
- Hand-editing `package.json` instead of `bun add`.
