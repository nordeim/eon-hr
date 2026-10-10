---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
---

# Eon HR

A full-stack HR management platform (Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Prisma/SQLite) with 46 routes, 49 API endpoints, 45 data models, HMAC cookie auth, and a 230-spec test pyramid (144 unit + 86 E2E).

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
| Unit (pure seams) | Vitest | 6 | 144 | `tests/unit/`, `tests/db-path.test.ts` |
| E2E (browser) | Playwright | 5 | 86 | `tests/e2e/*.spec.ts` |

- **Unit**: db-path resolution contract (15), auth crypto/session (14 — incl. the production secret boot guard), money & date utils (13), design-token contract (session-6 re-measured: neutral foreground #0A0A0A, white background, neutral secondary/accent #F5F5F5, exact destructive #EF4444, neutral-900 #171717, the v3 palette pin and shadow geometry), session-5 parity recipes (38 — sidebar leaf/group geometry, mobile chrome, the six PageHeader layout recipes and the per-page icon-color matrix), session-6 content recipes (27 — card/StatCard/EmptyState/button variants, dashboard cards + kicker, taskmanager board, per-page gradient map, shell canvas), session-7/8 shell recipes (27 — md responsive boundary, category-A mobile kickers, the inline Add-Employee wizard: max-w-4xl card, gradient header, 48px icon circles, photo-upload circle, border-t footer, overlay rgba pin, plus the session-8 interior pins: sRGB card-header gradient, trailing ArrowRight CTA, 68px field wrappers). Pure functions/CSS only — no Prisma, no network.
- **E2E**: auth logged-out surface; sidebar + all 46 routes render; mobile navigation regression pins (drawer 288px, dark overlay, no X button, bottom tabs — text-sm labels, blue active tab, 16px leaf icons / 20px group icons, the sticky mobile kicker at top-[73px]); the md responsive-boundary pin (767px mobile chrome → 800px desktop sidebar); dashboard parity (leave balances 21/21, 30/30, bordered quick-action chips, single-line expense total, active-nav `rgb(24,119,242)`, the session-6 card recipe — 222px cards, 24px-title rows, #0A0A0A tokens); per-page canvas + CTA colors (payroll green gradient + dark empty-state CTA); taskmanager board recipe; 4-step inline wizard CRUD round-trip against an isolated `db/e2e.db` on the production standalone server (port 3100).

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

- `src/app/(app)/*` — 46 authenticated routes behind the shell layout (auth guard + sidebar + mobile drawer + bottom tabs).
- `src/app/api/*` — 49 route handlers, one file per resource.
- `src/components/ui` — primitives; `src/components/shared` — page furniture; `src/components/layout` — shell.
- `src/lib` — auth, api envelope, db client, db-path resolver, validation, utils, nav config.

### API Design

`ApiResult<T> = { ok: true, data: T } | { ok: false, error: { code: ApiErrorCode, message, fieldErrors? } }`. Codes: `VALIDATION | UNAUTHENTICATED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL`. HTTP status maps 400/401/403/404/409/500.

### Database / Data Layer

45 Prisma models over SQLite. Relative `file:` URLs resolve against `prisma/schema.prisma` (db-path contract). Money: integer minor units. JSON-shaped fields parse defensively. Idempotent seed (natural-key upserts).

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
