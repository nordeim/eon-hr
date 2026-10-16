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

A complete, production-ready HR management platform — 61 application routes (the reference's COMPLETE page registry: the session-32 orphan-route hunt recovered 14 routes the earlier build 404'd on — 10 real pages incl. careers, shift swap, payroll AI and the tenant-setup wizard, 2 dashboard aliases, 2 reference blank stubs) covering employees, payroll, recruitment, training, compliance, performance, communications, analytics and AI assistance, with a pixel-parity dashboard shell and a fully functional CRUD backend.

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
| 📱 **Mobile-first navigation** | Hamburger drawer + bottom tab bar, pinned by E2E specs; keyboard focus rings match the reference taxonomy (blue sidebar ring, 1px button rings, offset-2 inputs/tabs); hover states match the measured reference recipes (sidebar zinc-100/#18181B, ghost accent hovers, blue-tinted Import CSV outline, no-hover bottom tabs); pressed states match too (the group button active: gray recipe, the expanded-group hover-gray, the authored leaf/sub-item active: pair, the active bottom tab blue-50 pill); motion matches (dropdowns/dialogs/selects fade+zoom in at 150ms, the mobile drawer slides 500ms/300ms with the vaul bezier, nav transitions run 200ms, the group chevron snaps); scroll matches (browser-default scrollbars everywhere, the v4 trailing space-y phantom margin eliminated, tab cards end where the reference's do); the cursor + selection dimensions match (every button computes cursor:pointer like the v3 reference — v4 dropped the preflight rule, restored in the base layer; the 8 core-module pages are user-select:none like the reference's touch-pan-y wrapper while their portals stay selectable; caret-colors and ::selection identical); the a11y-attribute dimension matches (the sidebar group toggles carry aria-controls in both states like the reference's older Radix, and the notifications bell opens the reference's exact 384px popover — haspopup/expanded/controls contract included — while the clone keeps its stricter a11y supersets: named icon buttons, aria-current page markers, progressbar roles, aria-hidden decorative icons); the SEO/meta dimension matches (per-route titles byte-identical to the reference's mechanical slug pattern — "Taskmanager \| Eon HR", dashboard/login "Eon HR" — with the full og/twitter card family, per-route canonicals resolved against the serving origin, JSON-LD WebSite + Organization schemas, a manifest, and the self-hosted og-image/icon family derived from the EonHR logo); the accessibility dimension SUPERSEDES the reference (the clone respects prefers-reduced-motion — near-zero animation/transition durations under the OS-level reduce preference while the reference keeps animating, the Radix unmount contract preserved, default-media visual parity byte-identical); the task board is a functional superset (real HTML5 drag-and-drop between kanban columns — cards carry the reference's cursor-grab recipe but actually drag, routing through the same PATCH path as the Move-to menu, keyboard path preserved — plus within-column reordering: dropping a card onto another inserts before it and persists via a position column, and the recruitment pipeline kanban drags the same way: candidates move between stages with the Move-to dropdown kept as the keyboard path — plus within-stage candidate ordering on the identical position-column contract (drag a candidate onto another in the same stage, order persists, filters cannot corrupt it); the print dimension supersedes too (@media print hides the shell chrome/portals, resets the tab-bar padding and min-h-screen, cards and table rows never split across pages — and prints with full color fidelity: print-color-adjust exact keeps every badge, chart fill and table tint, @page 10mm pins consistent margins — the reference ships zero print rules and prints its sidebar as noise); the sidebar's expanded-group trailing geometry matches the reference exactly (the next root item sits at the measured +4px — a 28-round-invisible 4px divergence found by the sidebar-internal census and eliminated); and the organogram is a functional superset (drag an employee card onto another to re-parent them — the managerId PATCH round-trips with optimistic tree surgery, insertion rings and dual cycle guards: the client tree-walk rejects dropping a manager onto their own report before any request fires, the API's ancestor-walk guard is the authoritative second line); the mobile drawer carries the reference's 1px #e5e5e5 right border (the default border token — distinct from the desktop sidebar's slate-200, exactly like the reference's two surfaces) and SWIPES closed (a horizontal-dominant leftward drag past a third of the panel width dismisses it, the exit animation continuing from the finger — zero at-rest impact); the HR assistant chat renders the reference's exact empty-state recipes (a natural-height Active Chats card with the plain muted line, a centered 64px MessageSquare over a single line — no invented copy); and the reference's legacy /assets orphan route is served in full (the flat36 always-row header, the green-to-blue canvas, the bg-slate-50 card band, the Inbox empty state, the Add Asset dialog with the Desktop/Tablet types); route coverage is now the reference's COMPLETE 61-page registry (session 32: 14 recovered orphan routes — the public careers + external-job pages, the employee onboarding portal, the single-pane HR assistant, payroll AI suggestions, the payroll reporting suite, request reports + request settings, the shift-swap manager with a real ShiftSwap model + API, the tenant-setup wizard with a live Company PATCH, the organization-setup + dynamic-dashboard aliases, and the home + employee-detail blank stubs — each measured live and restored byte-identically, the functional supersets wired to real Prisma models) |
| 🏦 **Loan management** | The reference's exact New Loan Request dialog — 672px, Loan Type (Standard/Emergency/Salary Advance/Personal), live Monthly Installment computation, Paid From, and the Requesting-for preview card — backed by a real API |

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
| E2E tests | Playwright | 1.63 | 217 specs across auth, nav (61 routes — the full registry), mobile, dashboard, inline 4-step wizard CRUD, kanban drag-drop (cross-column + within-column reorder) + recruitment pipeline drag-drop (cross-stage + within-stage reorder) + organogram re-parent drag-drop (+ cycle rejection) + print-media emulation (chrome hidden + color fidelity) + hr-assistant chat empty states + legacy /assets contract & round-trip + drawer border & swipe-to-close (CDP touch) + the session-32 orphan-route contracts (blank stubs, aliases, empty states, the shiftswap/requestsettings/tenantsetup round-trips) + session-4/6/7 geometry pins + the session-33 dark-mode contracts (toggle, persistence across reload, the pre-paint boot, the Moon-to-Sun swap, the dark mobile chrome, the RTL fixed-panel contract) + the swipe-to-open CDP touch quartet + the session-34 login-Alert contract (the shadcn Alert geometry + the lab()/rgba() serialization acceptance) + the session-35 dialog-interior contracts (the leading-none title + the 2-col row + the installment recipe + the 80% backdrop) + the payrollreports tab round-trips (the superset) + the session-36 contracts (the user-menu w-48 geometry + the prefetch-logout regression guard, the 404 wrapper re-centering + the Go Home icon, the settings-tab actions: the dark-solid header buttons + the Create Approval Workflow + Add Shift dialog round-trips + the Quick Presets + the Logs island, the compliance Saudi taxonomy) + the session-37 contracts (the dialog FORM family: native-validation empty submits, the departments three-field rebuild round-trip with pre-clean/asserted cleanup, the shift 60/0 defaults, the asset text layer) + the session-38 contracts (the keyboard/focus family: the five focus-restore pairs — Escape returns focus to the DialogTrigger, the trigger aria contract, the asset at-rest enabled submit, the loans text layer — the apartment placeholder, the 0/New Era LLC defaults, the reason required — and the Add Level 113px window) + the session-39 login contracts (the responsive mobile pair: 44px inputs at 16px, the stacked links row, the spacer scroll + the desktop recipe pair: the placeholder slate-600, the zinc typed-text, the main root, the social family, the or-chip) + the session-40..42 layers (the theme-inert login, the shell-restructure selectors, the careers family round-trips, the footer-focus Tab-walked rings + the employees row + the data-sidebar counts) + the session-43 login-redeploy contracts (the input DOM-string content family, the transition-settled Sign in ring render — the ring-ring token resolving the login-scoped zinc-950 --ring, the w-full column structure, the field-wrapper pair, the mobile responsive pair) + the session-44 sidebar contracts (the peer data-attr family, the programmatic desktop-trigger icon-rail collapse + geometry, the group-label/brand rail collapse + the expand-back, the mobile matchMedia branch, the 19/11 open-group counts + the menu-button attribute contract, the active custom-primary-bg recipe + the inline blue style, the chevron glyph pair) + the session-45 login-interior contracts (the field icon colors + the older-lucide Mail glyph, the social fills: the black Apple + REF's Microsoft square variant + the Google attr order, the keyboard-focused slate-400 ring — the injected runtime rules beat the focus-visible token — while the Sign in keeps its zinc-950 token ring, the loading-state interior via route interception: the "Signing in..." copy swap + the mr-2 spinner, the title/subtitle member order) + the session-46 hidden-flow contracts (the password-reset view swap + the back button, the anti-enumeration success view with the green Alert + the email span, the three-field sign-up view, the duplicate-email error with REF's verbatim copy, the "Sending..."/"Creating account..." loading swaps) + the session-47 zero-state interior contracts (the payroll + recruitment stat families at zero with the DIV value tags, the page-root trio pair + the v3 gradient forms with the dark pairs, the attendance nested canvas, the CardTitle div census, the zero-tenant dashboard leave-balances defaults via the signup superset, the profile avatar input + id family, the training message-only zero-state) |

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
│   └── 📂 e2e/                     # Playwright: 91 specs, isolated e2e.db
├── 📂 docs/
│   ├── 📂 screenshots/             # 196 remediated UI captures (desktop + mobile + tablet bands + wizard + focus rings + hover + pressed states + motion + scroll/dialog + cursor + a11y + SEO/meta + reduced-motion/DnD + DnD-depth + ordering/print + sidebar/organogram/print-color + drawer-border/chat/legacy-assets/orphan-routes evidence + the dark-theme pair + dark settings + dark mobile drawer + RTL + light-restored + the round-33 wired-page pairs + the login-error pair + the round-34 dialog pairs + the RTL fixed-panel pair + the payrollreports tabs + the dark-sidebar token pair + the round-35 re-measure pairs: the user-menu w-48, the 404 re-centering, the workflows/theme/logs/add-shift settings pairs, the compliance select + the round-36 form-contract pairs: the add-department rebuild, the workflow form dialog, the add-shift 60/0 defaults, the asset text layer + the round-37 keyboard/focus pairs: the loans text layer, the Add Level mr-1, the focus-restore rings, the asset enabled submit + the round-38 login re-audit pairs: the desktop + mobile pairs, the placeholder/glow close-up, the links-row mobile pair)
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
bun run test          # Vitest unit layer (718 specs: db-path, auth, utils, tokens, session-5..47 recipes)
bun run test:e2e      # Playwright E2E (217 specs) — boots the production standalone server
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
