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
| 🧑‍💼 **4-step employee wizard** | Personal → Job → Contract → Documents & Attachments with Saudi-specific fields (nationality, iqama, GOSI, IBAN) — mirrors the reference flow exactly |
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
| Charts | Recharts | 3.x | Analytics visualizations |
| Database | SQLite via Prisma ORM | 6.x / 45 models | Zero-config persistence at `db/custom.db` |
| Auth | Custom HMAC cookie sessions + scrypt | node:crypto | Stateless, revocation-safe |
| Validation | Zod | 4.x | Every API boundary |
| State | React hooks + per-page local state | — | Server is the source of truth |
| Unit tests | Vitest | 5.x | Pure seams (db-path, auth, utils, design tokens, shell recipes) |
| E2E tests | Playwright | 1.63 | 86 specs across auth, nav, mobile, dashboard, inline 4-step wizard CRUD + session-4/6/7 geometry pins |

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
│   │   ├── 📂 ui/                  # 15 shadcn-style primitives
│   │   ├── 📂 layout/              # Sidebar, mobile drawer, bottom tabs
│   │   └── 📂 shared/              # PageHeader, StatCard, EmptyState, StatusBadge
│   ├── 📂 lib/                     # auth, api, db, db-path, validation, utils, nav
│   └── 📂 stores/                  # Client state (Zustand)
├── 📂 tests/
│   ├── 📂 unit/                    # Vitest: auth, utils, design tokens
│   ├── 📄 db-path.test.ts          # DB path resolution contract (15 specs)
│   └── 📂 e2e/                     # Playwright: 86 specs, isolated e2e.db
├── 📂 docs/
│   ├── 📂 screenshots/             # 24 remediated UI captures (desktop + mobile + tablet + wizard)
│   ├── 📄 remediation-plan-session1.md       # Session-2 gap inventory & fix log
│   └── 📄 Tailwind-V4-Validation-Report.md    # Engine trap log
└── 📄 AGENTS.md • CLAUDE.md • Project_Architecture_Document.md • eon-hr_SKILL.md
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
```

These are the only two variables the codebase reads — see `.env.example`.

## Testing

```bash
bun run test          # Vitest unit layer (164 specs: db-path, auth, utils, tokens, session-5/6/7/8/9 recipes)
bun run test:e2e      # Playwright E2E (86 specs) — boots the production standalone server
bun run lint          # ESLint (Next 16 + TypeScript rules)
bun run typecheck     # tsc --noEmit
```

The E2E layer builds the standalone server, pushes an isolated schema to `db/e2e.db`, seeds it, signs the demo user in once (storageState), and runs every spec against the production build on port 3100 — including the mobile-navigation regression pins documented in `docs/Tailwind-V4-Validation-Report.md`.

## Design System

All tokens live in the `@theme inline` block of `src/app/globals.css`
(Tailwind v4 CSS-first — no config file), pinned to values **measured from
the live reference app** and regression-pinned by `tests/unit/tokens.test.ts`.

| Token | Hex | Usage |
|---|---|---|
| Primary | `#1877F2` | Active nav, primary actions (reference-measured `custom-primary-bg`) |
| Link | `#2563EB` | "View all" / "Request leave" text links (reference `text-blue-600`) |
| Background | `#FFFFFF` | Body base; the shell root paints the canvas gradient (slate-50 → blue-50, sRGB-pinned) |
| Card | `#FFFFFF` | Surfaces, tables, dialogs |
| Text primary | `#0A0A0A` (neutral-950) | Headings and body (reference `0 0% 3.9%`, session-6) |
| Text muted | `#64748B` (slate-500) | Subtitles, empty states (rendered-truth pin) |
| Primary button | per-page gradients, sRGB | Blue `#2563EB→#4F46E5` default; green/cyan/red/purple/indigo/pink per module (session-6) |
| Primary-fg | `#FAFAFA` | Gradient button text (slate-50, not pure white) |
| Border | `#E5E5E5` (neutral-200) | Cards, inputs, tables (session-4 measurement) |
| Secondary/Accent | `#F5F5F5` / `#171717` fg | Neutral hovers (reference `0 0% 96.1%`, session-6) |
| Dark button | `#171717` | shadcn-default variant: toggles, empty-state CTAs |
| Sidebar border | `#E2E8F0` (slate-200) | Sidebar + header dividers |

The v3-era slate/blue/green/indigo families are hex-pinned so utilities like
`bg-slate-600` render byte-identical to the reference (Tailwind v4's default
oklch palette drifts 1–3 sRGB units — one of the five traps documented in
`docs/Tailwind-V4-Validation-Report.md`; neutral/purple/orange added in
session 4). Typography: the reference's own stack — Tailwind's default
`ui-sans-serif` family pinned verbatim (no webfont; the reference self-hosts
nothing) — 12px badge/nav labels, 30px dashboard and 48px module titles,
14px body. Radius: `rounded-xl` cards + section badges (pill), `rounded-md`
buttons/inputs (reference 6px), `rounded-full` login card fields. Shadows:
v3-geometry `--shadow-sm`/`--shadow` pins.

## Reference Parity & Superset

The UI was audited against the live reference (`https://eon.base44.app`) with
a dual-browser workflow (desktop 1440×900 + mobile 390×844): colors and
geometry extracted from computed styles, screenshots diffed, every claim
verified in the DOM. Session 2 closed the gap inventory in
`docs/remediation-plan-session1.md` — primary token, sidebar icons and
gradient avatar, عربي language button, 288px mobile drawer with dark overlay,
reference PageHeader scale, bordered quick-action chips, single-line expense
total, dark sign-in button, gradient brand squircle, and the reference's
4-step Add Employee wizard (Saudi-specific fields).

Session 3 (`docs/remediation-plan-session3.md`) re-audited with fresh
measurements and closed a second round: the true sidebar surface (#FAFAFA,
not white), the real brand squircle (40×40, sRGB gradient #2563EB→#4F46E5 —
session 2 had measured the wrong element), the dashboard mobile page-title
kicker + 32px section rhythm (Tailwind v4 trap 6: the `space-y` selector
flip), neutral-200 card borders, the 73px mobile app bar, and the page
wrapper spacing across all 46 module pages. A few deliberate deviations
remain documented (e.g. the reference's `/Dashboard` case-sensitivity bug is
fixed, its builder badge is not cloned).

Deep engineering knowledge — the six Tailwind v4 traps, the wizard
button-swap form-submit bug, debugging runbooks and coding patterns — is
distilled in **`eon-hr_SKILL.md`**.

Session 7 (`docs/remediation-plan-session7.md`) closed parity round 6: the
true responsive boundary (**md 768px** — the reference's tablet band shows
the desktop sidebar, verified by dual-browser viewport sweep), the mobile
**page-title kickers** on the seven category-A routes (sticky z-20 bars
replacing the desktop headers below md), and the reference's **inline
Add-Employee wizard** (a page-replacing max-w-4xl card with a gradient
header, 48px icon-circle step rail, photo-upload circle and border-t
footer — not a modal dialog).

## License

MIT — see the repository license file.
