# Eon HR

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://sqlite.org/)
[![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-1.63-2EAD33?logo=playwright)](https://playwright.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)

A complete, production-ready HR management platform — 46 application routes covering employees, payroll, recruitment, training, compliance, performance, communications, analytics and AI assistance, with a pixel-parity dashboard shell and a fully functional CRUD backend.

## Quick Overview

Eon HR is a full-stack human-resources workspace that replicates and extends a reference SaaS product. It ships an employee self-service portal, an administrative back office spanning 12 HR domains, real-time chat and a company wall, an AI-assistant chat, and seven analytics dashboards — all backed by a 45-model Prisma schema with authenticated API routes for every mutation. The zero-config SQLite database and seeded demo account make the entire surface explorable within two minutes of cloning.

**Demo account:** `sepnetflix2023@outlook.com` / `$Abcd1234`

## Key Features

| Feature | Description |
|---|---|
| 🏠 **Employee portal dashboard** | Personalized welcome, quick actions, live leave balances, recent requests and expense totals |
| 👥 **Employee lifecycle** | Directory with search/filters, list & grid views, full CRUD, CSV import affordance |
| 💰 **Payroll engine** | Monthly payslips, bulk generation, attendance-derived deductions (late/absent/overtime) |
| 🎯 **Recruitment suite** | Job postings, applicant ranking with deterministic AI CV scoring, pipeline kanban, interview analyzer |
| 📋 **Leave & attendance** | Leave requests with approval workflow and balance updates, attendance records, shift calendar |
| 🛡️ **Compliance monitor** | Document expiry tracking with severity-bucketed alerts and notification sweeps |
| ⭐ **Performance** | Goals & KPIs with progress tracking, review cycles, 360° evaluations |
| 💬 **Communications** | Company wall, real-time chat, announcements, email/SMS/WhatsApp dispatch logging |
| 📊 **Analytics** | Seven dashboards (headcount, payroll, attendance, surveys, HR reports, organogram, visual KPIs) |
| 🤖 **AI HR assistant** | Rule-based HR chat with persistent conversation history |
| ⚙️ **Settings & security** | Company profile, departments, security toggles, audit log, workflow engine |
| 📱 **Mobile-first navigation** | Hamburger drawer + bottom tab bar, pinned by E2E specs |

## Architecture

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Server rendering, route handlers, standalone output |
| UI runtime | React | 19.x | Component model |
| Language | TypeScript | 5.x (strict) | Type safety across app and API |
| Styling | Tailwind CSS | 4.x (CSS-first `@theme`) | Design tokens, utilities — no config file |
| Components | Radix UI + CVA (shadcn pattern) | latest | Accessible primitives |
| Charts | Recharts | 2.x | Analytics visualizations |
| Database | SQLite via Prisma ORM | 6.x / 45 models | Zero-config persistence at `db/custom.db` |
| Auth | Custom HMAC cookie sessions + scrypt | node:crypto | Stateless, revocation-safe |
| Validation | Zod | 4.x | Every API boundary |
| State | React hooks + per-page local state | — | Server is the source of truth |
| Unit tests | Vitest | 5.x | Pure seams (db-path, auth, utils) |
| E2E tests | Playwright | 1.63 | 68 specs across auth, nav, mobile, CRUD |

## File Hierarchy

```
📂 eon-hr/
├── 📂 prisma/
│   ├── 📄 schema.prisma            # 45 models, SQLite datasource
│   └── 📄 seed.ts                  # Idempotent demo seed
├── 📂 db/                          # SQLite databases (gitignored)
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 📄 layout.tsx           # Root layout + ToastProvider
│   │   ├── 📄 page.tsx             # Auth-aware root redirect
│   │   ├── 📂 login/               # Social + email sign-in
│   │   ├── 📂 (app)/               # 46 auth-guarded module routes
│   │   └── 📂 api/                 # 49 route handlers (ActionResult envelope)
│   ├── 📂 components/
│   │   ├── 📂 ui/                  # 16 shadcn-style primitives
│   │   ├── 📂 layout/              # Sidebar, mobile drawer, bottom tabs
│   │   └── 📂 shared/              # PageHeader, StatCard, EmptyState, StatusBadge
│   ├── 📂 lib/                     # auth, api, db, db-path, validation, utils, nav
│   └── 📂 stores/                  # Client state (Zustand)
├── 📂 tests/
│   ├── 📂 unit/                    # Vitest: auth, utils
│   ├── 📄 db-path.test.ts          # DB path resolution contract (15 specs)
│   └── 📂 e2e/                     # Playwright: 68 specs, isolated e2e.db
├── 📂 docs/
│   ├── 📂 screenshots/             # Captured UI evidence
│   └── 📄 Tailwind-V4-Validation-Report.md  # Engine trap log
└── 📄 AGENTS.md • CLAUDE.md • Project_Architecture_Document.md
```

## Quick Start

Prerequisites: **Node.js ≥ 20** (or Bun ≥ 1.1) and a package manager.

```bash
# 1. Install dependencies
bun install                # or: npm install

# 2. Create .env (defaults work for local development)
cp .env.example .env       # DATABASE_URL="file:../db/custom.db" → resolves to <repo>/db/custom.db

# 3. Push the schema and seed the demo data
bun run db:push
bun run db:seed

# 4. Start the dev server
bun run dev                # → http://localhost:3000
```

### Verify Setup

```bash
curl http://localhost:3000/api/health
# {"status":"ok","db":"up","time":"..."}      ← expected

curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/login
# 200                                         ← expected
```

Sign in at `http://localhost:3000/login` with the demo account above — the dashboard should greet **"Welcome back, sepnetflix2023!"** with Annual Leave **21 / 21 days** and Sick Leave **30 / 30 days**.

## Environment Variables

```bash
# Database — RELATIVE file: URLs resolve against prisma/schema.prisma,
# exactly like the Prisma CLI (src/lib/db-path.ts pins the runtime rule).
DATABASE_URL="file:../db/custom.db"     # → <repo>/db/custom.db

# Session signing secret for HMAC cookie auth.
# REQUIRED in production: generate with `openssl rand -hex 32`.
AUTH_SECRET=""

# Canonical public origin — metadata, sitemap, robots.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Testing

```bash
bun run test          # Vitest unit layer (38 specs: db-path, auth, utils)
bun run test:e2e      # Playwright E2E (68 specs) — boots the production standalone server
bun run lint          # ESLint (Next 16 + TypeScript rules)
bun run typecheck     # tsc --noEmit
```

The E2E layer builds the standalone server, pushes an isolated schema to `db/e2e.db`, seeds it, signs the demo user in once (storageState), and runs every spec against the production build on port 3100 — including the mobile-navigation regression pins documented in `docs/Tailwind-V4-Validation-Report.md`.

## Design System

| Token | Hex | Usage |
|---|---|---|
| Background | `#F1F7FE` | App canvas (measured from reference) |
| Card | `#FFFFFF` | Surfaces, tables, dialogs |
| Primary | `#2563EB` | Actions, links, active nav, avatars |
| Success | `#10B981` | Sick-leave bars, approved badges |
| Text primary | `hsl(221 39% 11%)` | Headings and body |
| Text muted | `#6B7280` | Subtitles, empty states |
| Border | `hsl(214 32% 91%)` | Card and input borders |

Typography: **Inter** (via `next/font`) — 12px section kickers, 24–32px bold page titles, 14px body. Radius: `rounded-xl` cards, `rounded-lg` controls. Shadows: v3-geometry `--shadow-sm` pin (see the Tailwind trap log).

## License

MIT — see the repository license file.
