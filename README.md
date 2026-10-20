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

Eon HR is a full-stack human-resources workspace that replicates and extends a reference SaaS product. It ships an employee self-service portal, an administrative back office spanning 12 HR domains, real-time chat and a company wall, an AI-assistant chat, and seven analytics dashboards — all backed by a 47-model Prisma schema with authenticated API routes for every mutation. The zero-config SQLite database and seeded demo account make the entire surface explorable within two minutes of cloning.

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
| Database | SQLite via Prisma ORM | 6.x / 48 models | Zero-config persistence at `db/custom.db` |
| Auth | Custom HMAC cookie sessions + scrypt | node:crypto | Stateless, revocation-safe |
| Validation | Zod | 4.x | Every API boundary |
| State | React hooks + per-page local state | — | Server is the source of truth |
| Unit tests | Vitest | 5.x | Pure seams (db-path, auth, utils, design tokens, shell recipes) |
| E2E tests | Playwright | 1.63 | 360 specs across auth, nav (61 routes — the full registry), mobile, dashboard, inline 4-step wizard CRUD, kanban drag-drop (cross-column + within-column reorder) + recruitment pipeline drag-drop (cross-stage + within-stage reorder) + organogram re-parent drag-drop (+ cycle rejection) + print-media emulation (chrome hidden + color fidelity) + hr-assistant chat empty states + legacy /assets contract & round-trip + drawer border & swipe-to-close (CDP touch) + the session-32 orphan-route contracts (blank stubs, aliases, empty states, the shiftswap/requestsettings/tenantsetup round-trips) + session-4/6/7 geometry pins + the session-33 dark-mode contracts (toggle, persistence across reload, the pre-paint boot, the Moon-to-Sun swap, the dark mobile chrome, the RTL fixed-panel contract) + the swipe-to-open CDP touch quartet + the session-34 login-Alert contract (the shadcn Alert geometry + the lab()/rgba() serialization acceptance) + the session-35 dialog-interior contracts (the leading-none title + the 2-col row + the installment recipe + the 80% backdrop) + the payrollreports tab round-trips (the superset) + the session-36 contracts (the user-menu w-48 geometry + the prefetch-logout regression guard, the 404 wrapper re-centering + the Go Home icon, the settings-tab actions: the dark-solid header buttons + the Create Approval Workflow + Add Shift dialog round-trips + the Quick Presets + the Logs island, the compliance Saudi taxonomy) + the session-37 contracts (the dialog FORM family: native-validation empty submits, the departments three-field rebuild round-trip with pre-clean/asserted cleanup, the shift 60/0 defaults, the asset text layer) + the session-38 contracts (the keyboard/focus family: the five focus-restore pairs — Escape returns focus to the DialogTrigger, the trigger aria contract, the asset at-rest enabled submit, the loans text layer — the apartment placeholder, the 0/New Era LLC defaults, the reason required — and the Add Level 113px window) + the session-39 login contracts (the responsive mobile pair: 44px inputs at 16px, the stacked links row, the spacer scroll + the desktop recipe pair: the placeholder slate-600, the zinc typed-text, the main root, the social family, the or-chip) + the session-40..42 layers (the theme-inert login, the shell-restructure selectors, the careers family round-trips, the footer-focus Tab-walked rings + the employees row + the data-sidebar counts) + the session-43 login-redeploy contracts (the input DOM-string content family, the transition-settled Sign in ring render — the ring-ring token resolving the login-scoped zinc-950 --ring, the w-full column structure, the field-wrapper pair, the mobile responsive pair) + the session-44 sidebar contracts (the peer data-attr family, the programmatic desktop-trigger icon-rail collapse + geometry, the group-label/brand rail collapse + the expand-back, the mobile matchMedia branch, the 19/11 open-group counts + the menu-button attribute contract, the active custom-primary-bg recipe + the inline blue style, the chevron glyph pair) + the session-45 login-interior contracts (the field icon colors + the older-lucide Mail glyph, the social fills: the black Apple + REF's Microsoft square variant + the Google attr order, the keyboard-focused slate-400 ring — the injected runtime rules beat the focus-visible token — while the Sign in keeps its zinc-950 token ring, the loading-state interior via route interception: the "Signing in..." copy swap + the mr-2 spinner, the title/subtitle member order) + the session-46 hidden-flow contracts (the password-reset view swap + the back button, the anti-enumeration success view with the green Alert + the email span, the three-field sign-up view, the duplicate-email error with REF's verbatim copy, the "Sending..."/"Creating account..." loading swaps) + the session-47 zero-state interior contracts (the payroll + recruitment stat families at zero with the DIV value tags, the page-root trio pair + the v3 gradient forms with the dark pairs, the attendance nested canvas, the CardTitle div census, the zero-tenant dashboard leave-balances defaults via the signup superset, the profile avatar input + id family, the training message-only zero-state) + the session-48 unmapped-interior contracts (the kicker dark pair + the dashboard kicker verbatim, the md-family row members, the per-page stat tags with the tile architecture — the icon classes ON the svg, the compact tile mb-3 rendered direct, the no-tile label-top rewrite, the mt-4 family — the 27-route rootmap with the space-y wrappers + the merged roots + the bare roots + the stubs, the zero-state affordances on five pages, the kanban badge-form chips) + the session-50 deep-interior contracts (the glyph family — payrollmodule/payrollengine calculator, surveyanalytics brain, the npref check/bell/smartphone switch set + the opacity-30 zero bell, employeeportal's direct briefcase, shiftswap's arrow-left-right pair; shiftswap's stat icon family on plain cards + the py-2 pills + the p-12 empty; staffrequests' Radix Tabs form with the panel-direct zero state; payrollmodule's bare search/th forms; payrollengine's shadow-sm flats; requestsettings' plain cards) + the session-51 route-casing contracts (the /Dashboard canonical-capital rewrite: the URL-unchanged serve, the lowercase regression guard, the auth-guard ride-through) + the session-52 drawer-group pin (the expanded drawer group's sub-item computed family — the computed-truth census method) + the session-53 bottom-nav active-state family pin (each of the five tab routes highlights its own tab — the active computed blue-600/blue-50 pair, walking the four routes the earlier pins never covered) + the session-54 drawer default-group-map pin (all 8 nav group triggers + the footer bell render aria-expanded="false" at first open — the collapsed-default contract the full-menu pin never covered) + the session-55 auth-boundary spec (6 — R55-A..E+G: the post-login ROOT landing `/` which the root rewrite serves the dashboard at URL-unchanged like REF's index route, the deep-link from_url round-trip — the edge proxy carries the requested absolute URL, the sign-in resolver returns the user to the guarded page, the logout's same-origin Referer carry, the open-redirect guard — foreign/protocol-relative/backslash from_url forms rejected, the authed-/login stays) + the session-56 read-only family spec (5 — R56-A..E, computed truth: the settings Company tiles' slate bg + radius + the Address span map, the mobile 2-track implicit grid, the profile identity Email's disabled + slate bg + the absent phone/job-title placeholders, the hrreports thead's slate row, the history one-click back contract over the documented Next.js 16.4.0 two-click corruption) + the session-57 affordance-stub family spec (7 — R57-A..E, computed truth: the Bulk Import Employees dialog recipe + the working import round-trip (file → Process File → review → Import → the rows land), the wall's hidden #media-upload contract + the media round-trip (preview → multipart post → /api/media/ served content-type), the Configure WhatsApp API dialog recipe, the Connected Accounts 4-field form + the computed sky tile, the Preferences two-card recipe + the computed red Danger Zone frame, the DELETE-typed gate + the full account-deletion round-trip) + the session-58 CTA-fill family spec (10 — R58-1..24, computed truth: the five fill recipes pinned per route (the DARK solid, the BLUE-600 solid, the INDIGO-600 solid, the TEAL-600 solid, the two one-off gradients + the P1 assets bg-none fix), the switch/checkbox dark checked fills, the employees view-toggle geometry (dark+sm, LIST first, gap-2) + round-trip, the hrassistant 48x36 send, the w-full interviewassistant CTA, the posts multipart content cap, the with-data deletion round-trip with all three P2003 rows planted) + the session-59 badge/chip fill family spec (6 — R59-A..E, computed truth: the ten status-tinted kanban count-chip fills (taskmanager slate/blue/yellow/purple/green + recruitmentkanban slate-200/blue/amber/green/red), the sixteen trap-2 palette pins rendering rgb() instead of the oklch lab() drift, the seeded employees Active badge's pinned emerald pair, the five securitysettings badges incl. REF's CircleCheckBig glyph + the 92px Enabled geometry) | + the session-60 dark-mode fill family spec (6 — R60-A..F, computed truth, both themes: the checkbox's light #171717/white + dark #fafafa/#171717 pair with the 14x16 glyph, the employees toggle pair (GRID active by default — REF's non-persisted fresh state), the compliance notify severity text tints (unflipping in dark), the blue-600 text-white split + the chat new-chat's token flip, the payrollengine's flat emerald solid (backgroundImage: none — the gradient-over-color P1 fix), and the settings Company inline 12-field form flip with the working PATCH round-trip) |
| + the session-61 dark-mode text-color family spec (18 — R61-A..X, computed truth, both themes where applicable: the four+one palette pins rendering rgb() (orange-500/700/900, purple-500, green-400), the seven authored-slate-400 search/filter icons (unflipping both themes), the compliance severity chips (per-severity card borders + colored DIV values + xs slate-500 DIV labels), the at-risk TriangleAlert + the 48px green-400 CircleCheckBig empty state, the evaluations per-tile value colors + the restored 24px tab→stats gap, the securitysettings blue Shield recommendation glyphs, the chat Messages h2 (unflipping slate-900) + the bare search wrapper geometry, the payroll DollarSign empty-state icon, the payrollai CardHeader + p-6/py-12 stack, the interviewassistant standard placeholder + the retired hint, the hrassistant empty pane, the hrassistantchat No-chats recipe, the profile kicker pair (the session-63 amendment: the flipping slate-500 light / slate-400 dark), the surveyanalytics legend (blue-500 + the Avg Sentiment % name + the DOM order via the DefaultLegendContent reorder), the analytics + advancedanalytics legend removals, the icon shapes (Zap/Shield/CircleCheckBig/CircleAlert/Award), the attendance red-500, the requestreports tr members) |
| + the session-62 dark-mode border-color family spec (14 — R62-A..K, computed border truth, both themes where applicable: the Customize button riding the flipping border-input pair (the retired session-3 frozen literal), the checkbox border literal pair (light #171717 / dark #fafafa — the both-theme bug on the wrong token), the four palette pins rendering rgb() (green-200, amber-200, cyan-300 + the cyan-50 hover fill), the unflipping border-slate-200 card family in dark (the loans + offboarding empty-state rewrites, the hrletters/analytics/profile/compliance cards, the attendance Report-Type 3-level shape + the stat cards' hover:shadow-lg members), the attendance action-button trio (cyan-300/slate-300/blue-300 + the per-color hovers), the recruitmentkanban per-stage column pairs inside the flex-shrink-0 w-64 wrappers, the shiftcalendar th border-b + the weekend variant, the thead-row recipes (assetmanagement/payrollmodule slate-200/slate-50 on the row; recruitment's thead-level border with the neutralized inner tr), the profile role badge's DIV tag, the compliance severity cards' two-level shape + the At-Risk overflow-hidden, the textarea resize-none) |
| + the session-63 light-mode text-color family spec (6 — R63-A..F, computed text truth, both themes where applicable: the payroll search placeholder riding REF's muted literal pair (light #737373 / dark #a3a3a3 — the token's slate-500 tint retired), the hrreports empty Group By trigger's foreground pair (light #0a0a0a / dark #fafafa — the instance override carrying BOTH variant members over the base's R37-E neutral literal), the profile kicker subtitle's flipping pair at 390×844 (slate-500 light / slate-400 dark — the r61 dark-only pin amended), the shiftcalendar assign affordance's Plus icon + the unflipping slate-300, the summary header's Users icon + the foreground pair + the pb-3, the recruitment AI Score th's TrendingUp icon inside the flex wrapper) |
| + the session-64 light-mode border census + input-family probes spec (6 — R64-A..F, computed truth: the iconed-search paddings (payroll 40px / payrollmodule, documenttracker, assetmanagement 36px — typed text now clears the absolute left-3 icon), the placeholder-text surfaces (the compliance "Search employee...", the recruitmentkanban "Search applicants...", the interviewassistant verbatim observations textarea, the tenantsetup "Acme Corporation"/"admin@acme.com" example pair), and the round's border-census truth pin (the payroll search input rides the border-input token pair — light rgb(229,229,229) / dark rgb(38,38,38))) |
| + the session-65 geometry census spec (7 — R65-A..G, computed truth: the padding-driven standard stat tiles (payroll/expenses/surveys/attendance 12px) + the tileFixed pages at 0px, the td/th UA-padding restoration (the unstyled cell sides riding the 1px like REF — the v4-preflight universal padding reset retired), the chat column header's single p-4 border-b wrapper + the px-3 new-chat button (the dropped border-b restored), the compliance filter row's bordered-white-box member set, the hrassistant 500px/p-6 pane + p-4 row + 60px textarea, the requestreports Back button's sm-size padding (no py-2 leak), the securitysettings checkboxes' 4px rounded-sm (the --radius-sm token re-pinned to REF's live scale)) |
| + the session-66 margin/gap census spec (14 — R66-A..R, computed truth: the PageCanvas scroll band (-80px top margin, hidden above the canvas, on the band pages + absent on the others), the svg-authored empty-state icons (the 479px centered auto margins + the retired wrapper), the StatCard tileFixed unspaced rows (0px) vs the padded pages (12px), the employees alwaysRow header (gap 0, mb-8 32px) + the md:2/lg:3 gap-6 grid, the actions-cluster truth (staffrequests 8px gap-2 cluster + the expenses raw button riding the row directly), the companywall 8px space-y-2 audience group with the leading-none label, the payrollengine 4px space-y-1 label-to-control groups, the tenantsetup 16px circle + the ml-auto Continue, the 16px workflowconfigpage CTA margin, the 24px performancemanagement tabs-to-content rhythm + the 24px goals grid, the 32px shiftswap pills-to-card + the v:16 card wrapper, the surveyanalytics single-grid (2 computed tracks + the col-span third card), the EMPTY hrassistant pane, the 8px chat new-chat gap) |

## File Hierarchy

```
📂 eon-hr/
├── 📂 prisma/
│   ├── 📄 schema.prisma            # 48 models, SQLite datasource
│   └── 📄 seed.ts                  # Idempotent demo seed
├── 📂 db/                          # SQLite databases (gitignored)
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 📄 layout.tsx           # Root layout + ToastProvider
│   │   ├── 📄 page.tsx             # Auth-aware root redirect
│   │   ├── 📂 login/               # Social + email sign-in
│   │   ├── 📂 (app)/               # 61 auth-guarded module routes (the full REF registry)
│   │   └── 📂 api/                 # 54 route handlers (ActionResult envelope)
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
bun run test          # Vitest unit layer (910 specs: db-path, auth, utils, tokens, session-5..66 recipes)
bun run test:e2e      # Playwright E2E (360 specs) — boots the production standalone server
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
