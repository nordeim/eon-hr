# Eon HR — Session 2 Remediation Plan

**Date:** 2026-10-09 · **Author:** main agent (Super Z)
**Method:** live dual-browser audit — `agent-browser` sessions against `https://eon.base44.app` (reference) and `http://localhost:3000` (clone) at desktop 1440×900 and mobile 390×844; VLM screenshot diffing; DOM computed-style extraction.

**Scope rule:** the repo `skills/` folder is excluded from code checking, testing and compilation.

---

## 1. Validation summary (what was checked and confirmed healthy)

| Gate | Result |
|---|---|
| `git pull` (refresh) | Fast-forward 693be09 → 8be5cb3 (`docs/session_1.md`, `worklog.md`, `docs/prompt-to-review-2.md` added) |
| Unit tests (`bun run test`) | 38/38 pass (db-path 15, auth 10, utils 13) |
| `bun run typecheck` | clean |
| `bun run lint` | clean |
| Dev server `/api/health` | `{"status":"ok","db":"up"}` |
| `dev.log` errors | none since restart |
| DB path contract | `.env DATABASE_URL="file:../db/custom.db"` → `<repo>/db/custom.db` (CLI + runtime + `db-path.ts` converge) |
| Route inventory | 46 app routes + 42 API route families — matches shipped docs |
| Mobile drawer behavior | Opens, expands groups, navigates, closes on route change (only invisible 0×0 Radix leftovers remain) |

## 2. Gap inventory (reference → clone deltas)

### A. Design tokens (`src/app/globals.css`)

| # | Element | Reference (measured) | Clone (measured) | Severity |
|---|---|---|---|---|
| A1 | Primary / active-nav blue | `rgb(24,119,242)` = `#1877F2` (class `custom-primary-bg`) | `#2563EB` | High — every active nav item + primary button |
| A2 | Text links ("View all", "Request leave") | `#2563EB` (text-blue-600) — separate from primary | `--primary` | Medium |
| A3 | Muted text | slate-500 `#64748B` | `#6B7280` (gray-500) | Medium — page furniture everywhere |
| A4 | App canvas background | `bg-gradient-to-br from-slate-50 to-blue-50` (`#F8FAFC → #EFF6FF`, measured on the content wrapper `min-h-screen … p-4 md:p-8`) | flat `#F1F7FE` | Medium |
| A5 | Inactive sidebar item text | slate-600 `#475569` | `text-foreground/80` | Low |
| A6 | Sidebar border | slate-200 `#E2E8F0` | `rgb(225,231,239)` | Low |
| A7 | Card shadow | default `shadow` on cards | `shadow-sm` | Low |

### B. Sidebar (`src/components/layout/sidebar-nav.tsx`, `src/lib/nav-config.ts`)

| # | Element | Reference | Clone | Severity |
|---|---|---|---|---|
| B1 | Training LMS icon | `Video` | `GraduationCap` | Medium |
| B2 | Assets icon | `Laptop` | `Package` | Medium |
| B3 | Staff Requests icon | `FileText` | `ClipboardList` | Medium |
| B4 | Communications icon | `MessageCircle` | `MessageSquare` | Low |
| B5 | AI HR Assistant icon | `Target` | `Bot` | Medium |
| B6 | Sub-menu items | each carries a `w-4 h-4` lucide icon (Users, SquareCheckBig, Plane, Calendar, Calendar, FileText …) | dot indicators, no icons | Medium |
| B7 | Active sub-item | solid `#1877F2` bg + white text (same treatment as top-level) | `bg-primary/10` tint + primary text | High |
| B8 | Language button | `Languages` icon + label **"عربي"** (default state shows the Arabic target) | `Globe` icon + "EN" | High — visible on every page |
| B9 | User avatar | 36px circle `bg-gradient-to-br from-blue-500 to-indigo-500` with white `CircleUser` icon | initials letter on dark circle | High |
| B10 | User menu trigger | `w-full justify-start gap-3 hover:bg-slate-100`, no chevron | has `ChevronsUpDown` chevron | Low |
| B11 | Sidebar width | 256px (`w-64`) | 256px | ✅ match |
| B12 | Group label "Main Menu" | 12px slate-500 | 12px muted | ✅ near-match (fixed by A3) |

### C. Mobile shell (`src/components/layout/app-shell.tsx`)

| # | Element | Reference | Clone | Severity |
|---|---|---|---|---|
| C1 | Mobile header height/padding | `px-6 py-4` ≈ 73px, shows **EonHR + "Demo"** subtitle | `h-14 px-4` (56px), no "Demo" | Medium |
| C2 | Mobile drawer width | **288px** | 280px | Low |
| C3 | Drawer overlay | `bg-black/80`, z-50 | `bg-black/50`, z-40 | Medium |
| C4 | Drawer close (X) button | none visible | prominent X at top-right | Medium |
| C5 | Bottom tab icons | LayoutDashboard / Users / **SquareCheckBig** / **Calendar** / **CircleUser** | House / Users / ListChecks / CalendarCheck / UserRound | Medium |
| C6 | Bottom tab active state | **none** — all tabs slate-600 always | active tab `text-primary` | Medium |
| C7 | Bottom tab item geometry | `flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-h-[44px]` | `flex-1 gap-0.5 text-[11px]` | Low |

### D. PageHeader (`src/components/shared/page-header.tsx` — affects 44 pages)

| # | Element | Reference dominant pattern | Clone | Severity |
|---|---|---|---|---|
| D1 | Module page title | `h1.text-4xl md:text-5xl font-bold text-slate-900 mb-3` (48px desktop — used by taskmanager, attendance, payroll, expenses, leavemanagement, training, surveys, companywall, profile) | `text-2xl` (24px) | High |
| D2 | Module page subtitle | `p.text-lg text-slate-600` (18px) | `text-sm font-medium text-muted-foreground` (14px) | Medium |
| D3 | Section kicker | `span.text-sm font-medium text-slate-700` | `text-sm font-medium text-muted-foreground` | Low (fixed with D2 pass) |
| D4 | Dashboard/employees title | `text-3xl` (30px), **no** `tracking-tight` | `text-2xl tracking-tight sm:text-3xl` | Medium |

*Reference title sizes are inconsistent across pages (24/30/36/48px). Remediation standardizes on the dominant module-page pattern (48px) and keeps the measured 30px style for dashboard/employees. This is a documented parity trade-off — replicating the reference's per-page inconsistency would harm maintainability.*

### E. Dashboard (`src/app/(app)/dashboard/page.tsx` + widgets)

| # | Element | Reference | Clone | Severity |
|---|---|---|---|---|
| E1 | Quick Action buttons | `flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50` + inline `w-4 h-4 text-blue-600` icon + `text-sm text-slate-700` label | icon tiles `h-10 w-10 bg-accent` + gap-3 | High |
| E2 | Quick Actions extra subtitle | none | "Common self-service shortcuts" | Medium |
| E3 | Expense Claims amount | single line `text-2xl font-bold text-slate-900 mb-3` → "0 SAR total" | "0 SAR" (text-3xl) + "total" on second line | High |
| E4 | Empty-state text style | `text-sm text-slate-400 text-center py-2` ("No claims yet") / `py-4` ("No requests yet") | `py-8 text-muted-foreground` | Medium |
| E5 | Customize button icon | `Settings` (gear) | `Settings2` (sliders) | Low |
| E6 | Content padding | `p-4 md:p-8` with `pb-20 md:pb-0` (bottom-bar clearance) | `px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6` | Low |

### F. Login (`src/app/login/page.tsx`)

| # | Element | Reference | Clone | Severity |
|---|---|---|---|---|
| F1 | "Sign in" button | slate-900 `#0F172A` (dark) | `--primary` blue | High |
| F2 | "Forgot password?" / "Sign up" links | slate-500 gray, no underline | primary blue | Medium |
| F3 | Email placeholder | `you@example.com` | `you@company.com` | Low |
| F4 | Brand mark | Base44 default `symbol-orange.png` (20×20 image) | inline briefcase SVG | Low — self-host a copy in `public/` |

### G. Employees (`src/app/(app)/employees/page.tsx` + `src/app/api/employees`)

| # | Element | Reference | Clone | Severity |
|---|---|---|---|---|
| G1 | "Add Employee" flow | **4-step wizard**: ① Personal Information (Full Name*, Work Email*, Private Email, Phone, DOB, Gender select, Nationality default "Saudi Arabia", National ID, Iqama Number, Iqama Expiry) ② Job Information (Job Title*, Department, Employment Type, Start Date*, Manager) ③ Contract Information (Contract Type default "Indefinite", Contract Start Date, Bank Name, IBAN, GOSI Number) ④ Documents & Attachments (Onboarding Template select, Upload Documents) — Back/Next/Create Employee footer | single-step dialog (First/Last Name, Email, Phone, Job Title, Status, Type) | **High — functional superset gap** |
| G2 | Table columns | Employee, Job Title, Status, Start Date, Actions | adds "Employment" column | Medium |
| G3 | Stat cards | none on this page | 4 StatCards | Medium — remove for parity |
| G4 | Primary action button style | `bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg` | flat `--primary` | Medium |

### H. Leave management (`src/app/(app)/leavemanagement/page.tsx`)

| # | Element | Reference | Clone | Severity |
|---|---|---|---|---|
| H1 | Header | kicker "Leave Management" + title "Leave Requests" + subtitle "Request time off and manage approvals" | title "Leave Management" + subtitle "Request and manage your leave" | Medium |
| H2 | Leave balances card | not present on this page (balances live on the dashboard) | "My Leave Balances" card added | Medium |
| H3 | Empty state | `Plane` icon, "No leave requests yet", no CTA button in card | clock icon, "No requests yet" + CTA | Medium |

### I. Housekeeping

| # | Item | Severity |
|---|---|---|
| I1 | `.env.example` still branded "ORBITAL" (pre-clone scaffold) — rewrite for Eon HR | Medium |
| I2 | `eon-hr_SKILL.md` (distill-codebase-skill + to-distill-project-into-skill) not yet created | Medium |
| I3 | Screenshots of the remediated app + docs alignment + final commit/push via SSH wrapper | Required deliverable |

---

## 3. Accepted deviations (superset behaviors — keep)

1. **Active nav highlighting on `/Dashboard`** — the reference fails to highlight the sidebar item when the URL is `/Dashboard` (case-sensitivity bug in the original's pathname match). The clone highlights correctly. Keeping the correct behavior is a deliberate bug-fix superset.
2. **No active state on bottom tabs** — reference genuinely lacks it, so the clone will match (parity) even though highlighting would be better UX.
3. **"Edit with Base44" floating badge** — reference's builder-platform artifact; intentionally not cloned.
4. **Reference's per-page inconsistent title sizes** — standardized to the dominant patterns (see D).
5. Real persistence, real CRUD, real API envelope — the functional superset already shipped in session 1 stays.

## 4. TDD strategy

- **Unit (Vitest):** extend `tests/unit/` with a token/theme contract test that reads `globals.css` and pins `--primary: #1877F2`, `--muted-foreground` slate-500 value, and the pinned v4 trap values (shadow, palette) — regression-pins the token changes.
- **E2E (Playwright):** update/extend `tests/e2e/mobile-navigation.spec.ts` (drawer width 288, overlay, no X button, bottom-tab icons, no active tab), `tests/e2e/navigation.spec.ts` (sidebar icons + عربي label + avatar gradient), `dashboard.spec.ts` (expense "0 SAR total" single line, quick-action bordered buttons), `login.spec.ts` (dark Sign-in button, gray links, placeholder), and add `employees-wizard.spec.ts` pinning the 4-step wizard flow end-to-end against the isolated e2e db.
- **Red-Green:** write/adjust the specs first where practical, then patch components, then re-run the full gate `lint → typecheck → test → build → test:e2e`.

## 5. Execution order (ToDo)

1. **Tokens & globals.css** — A1–A7: `--primary #1877F2`, add `--link #2563EB`, slate-500 muted, gradient canvas (sRGB-pinned per trap 3), card shadow, sidebar border. Add `public/logo.png` (self-hosted reference brand mark).
2. **Sidebar** — B1–B10: icon swaps in `nav-config.ts` (+ per-child icons), solid active sub-items, `Languages` icon + "عربي" default label, gradient `CircleUser` avatar, remove chevron, hover `bg-slate-100`.
3. **Mobile shell** — C1–C7: header `px-6 py-4` + Demo subtitle, drawer `w-[288px]` + `bg-black/80` z-50, remove X button, bottom-tab icons + geometry + no active state, main padding `p-4 md:p-8` + `pb-20 md:pb-0`.
4. **PageHeader** — D1–D4: `text-4xl md:text-5xl` default + `text-lg text-slate-600` subtitle + slate-700 kicker; `size="lg"` variant (30px) for dashboard/employees.
5. **Dashboard** — E1–E6: bordered quick actions with inline blue icons, remove extra subtitle, expense amount single-line, empty-state paddings, `Settings` gear icon.
6. **Login** — F1–F4: dark sign-in button, gray links, placeholder, self-hosted logo.
7. **Employees** — G1–G4: 4-step wizard (schema: add `nationality`, `nationalId`, `iqamaNumber`, `iqamaExpiry`, `gender`, `dob`, `privateEmail`, `contractType`, `contractStartDate`, `bankName`, `iban`, `gosiNumber`, `managerId` fields — most already exist), remove stat cards, fix table columns, gradient primary button. Extend API + validation.
8. **Leave management** — H1–H3: header texts, remove balances card, Plane empty state.
9. **Housekeeping** — I1–I3: rewrite `.env.example`, capture screenshots, update README/AGENTS/CLAUDE/PAD, write `eon-hr_SKILL.md`, update `worklog.md`.
10. **Gate + push** — full gate, commit to main, push via `docs/ssh_git_wrapper_v3.py` (SSH key from the task prompt, key shredded after push).

## 6. Verification checklist (post-remediation)

- [ ] Reference vs clone side-by-side screenshots (desktop + mobile) re-diffed via VLM — no High/Medium gaps remain
- [ ] `bun run test` (now incl. token contract) green
- [ ] `bun run build` + `bun run test:e2e` green (incl. new wizard + mobile-nav pins)
- [ ] `bun run lint` + `bun run typecheck` clean
- [ ] Mobile drawer: opens via hamburger, expands groups, navigates, closes; no X button; 288px; dark overlay
- [ ] `docs/screenshots/` refreshed with remediated captures
- [ ] `.env.example` matches codebase; no "ORBITAL" references
- [ ] `eon-hr_SKILL.md` present, validated per the distill checklist
- [ ] Committed to `main` and pushed via SSH wrapper; remote HEAD == local HEAD
