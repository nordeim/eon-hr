# Remediation Plan — Session 4

Audit + parity round 3. Every gap below was measured live against
`https://eon.base44.app` (dual agent-browser sessions, DOM ground truth —
computed styles and bounding boxes, not VLM guesses). Reference measurements
were taken at 1440×900 (desktop) and 390×844 (mobile).

Baseline at session start: lint ✓ · tsc ✓ · 49/49 unit ✓ · build ✓ · 75/75 E2E ✓
(commits up to `c7c4b79`).

---

## Part 1 — Code audit findings (skills: code-review-and-audit, tdd)

### A. Stale scaffold branding & broken tooling scripts

| ID | Finding | Fix |
|----|---------|-----|
| AUD-1 | `package.json` still identifies as `"name": "orbital"`, description "ORBITAL — AI project management workspace" (scaffold leftover) | Rename to `eon-hr` / Eon HR description |
| AUD-2 | `scripts/capture-screens.sh`, `capture-screenshots.mjs`, `capture-wizard.sh` log in as `demo@orbital.app` / `Demo1234!` and read cookie `orbital_session` — but the seed user is `sepnetflix2023@outlook.com` / `$Abcd1234` and the cookie is `eon_session`. These scripts CANNOT work. | Fix credentials + cookie name in all four scripts |
| AUD-3 | `scripts/smoke-test.sh` uses `demo@orbital.app` + `/tmp/orbital-smoke-cookies.txt` | Same fix |
| AUD-4 | Legacy session-1 probe scripts with obsolete expectations (ORBITAL bottom sheet, Goals/Agent tabs): `par-probe.sh`, `par-probe2.sh`, `par-probe3.sh`, `par-compare.sh`, `paired-probe.sh`, `paired-probe-v214.mjs`, `vlm-sanity.mjs` | Delete (dead code, misleading) |

Audit otherwise clean: secret scan clean (demo credentials only), no TODOs,
no stray console.log, no `any`, session-3 hardening (boot guard, PATCH
validation) verified intact.

## Part 2 — Parity gaps (live-measured)

### B. Typography (app-wide)

**B1 — Font stack.** Reference `body.font-family`:
`ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`
— exactly Tailwind v4's DEFAULT stack. The clone self-hosts Inter via
next/font (`Inter, "Inter Fallback", …`) → metric drift (measured: "Add
Employee" button 152px vs ref 165px at same font-size).

Fix: remove `next/font/google` Inter from `layout.tsx` + drop the
`--font-sans` override in `globals.css` (v4 default == ref stack, byte-exact).
Side benefit: no webfont download, no FOUT.

### C. Shared components (app-wide)

**C1 — Button default variant.** Ref primary CTAs ("Add Employee",
"New Leave Request"): `linear-gradient(to right, rgb(37,99,235), rgb(79,70,229))`
(= `#2563EB → #4F46E5`, sRGB), hover endpoints `#1D4ED8 → #4338CA`,
`rounded-md` (6px), text `#FAFAFA`, v3 `shadow` (sm on leave page, lg on
employees — use `shadow`), `h-9 px-4 py-2 text-sm font-medium`.
Clone: solid `bg-primary #1877F2`, `rounded-lg`, white text.
Per trap 3 the gradient must be the arbitrary sRGB form:
`bg-[linear-gradient(to_right,#2563EB,#4F46E5)]` +
`hover:bg-[linear-gradient(to_right,#1D4ED8,#4338CA)]`.

**C2 — `--color-primary-foreground`: white → `#FAFAFA`** (ref measured
rgb(250,250,250) on `text-primary-foreground` buttons). The sidebar active
item text stays WHITE (ref nav active = rgb(255,255,255)) → change
`sidebar-nav.tsx` active classes to explicit `text-white`.

**C3 — `--color-border` / `--color-input`: `hsl(214 32% 91%)` → `#E5E5E5`**
(neutral-200). Measured on ref inputs, cards, table wrappers. (The Card
component already pins #E5E5E5 directly; unify the tokens.)

**C4 — Input component:** `rounded-lg` → `rounded-md` (ref 6px).

**C5 — Icon-search inputs:** ref icon→text gap 12px → text at 40px; clone
`pl-9` (36px) → `pl-10` (40px) wherever a Search/Mail/Lock icon sits at
`left-3` (employees, chat ×2; login inputs are covered by L1).

### D. Sidebar geometry (every page, desktop + drawer)

Ref (measured): header row 89px (logo tile 40×40, `py-6`); nav container
inset 20px (`px-5 pt-5`); "Main Menu" = `h-8` (32px) row, `px-3`,
`text-xs font-semibold uppercase tracking-wider` slate-500; top-level items
`h-8` (32px) `px-2` `gap-2` `font-normal` with **20px icons** (`h-5 w-5`),
active = `bg-primary` + `font-medium` + white text; list `gap-1` (4px);
sub-items `h-8 px-3 gap-3` (12px paddings/gap), 16px icons, active =
`bg-primary font-medium`; sub-list indent 16px (clone `pl-4` already
produces the measured x=36 ✓); chevron 16px ✓. Brand text uses `h2`.

Clone today: header 73px (`py-4`), nav `px-3 py-2` (12px), "Main Menu" 28px
small `<p>`, items 40px `px-3 py-2.5 gap-2.5 font-medium` 18px icons,
list `gap-0.5`, sub-items 36px `px-2 gap-2`, sub-list `gap-0.5`.

| ID | Fix |
|----|-----|
| D1 | SidebarHeader: `py-4` → `py-6` (89px row) |
| D2 | Brand "EonHR": `span` → `h2` (ref semantics; only h2 on page) |
| D3 | Nav container: `px-3 py-2` → `px-5 pt-5 pb-4` |
| D4 | "Main Menu": `<p>` small label → `<div class="flex h-8 items-center px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">` |
| D5 | List: `gap-0.5` → `gap-1` (top + sub lists) |
| D6 | NavLink + CollapsibleNavItem: `h-8 … px-2 py-2 gap-2 font-normal`, icons `h-5 w-5`; active keeps bg-primary + adds `font-medium`; icon color slate-600 (inactive) / white (active) |
| D7 | Sub-items: `h-8 px-3 py-2 gap-3`; keep `pl-4` on sub-list |
| D8 | Active text: `text-primary-foreground` → `text-white` (pairs with C2) |

### E. Page subtitles (~24 pages)

Ref module pages use descriptive subtitles; the clone repeats module names.
Measured diff (`scripts/page-titles.mjs`, full copy in /tmp):

| Route | Ref subtitle (use exactly) |
|-------|---------------------------|
| /taskmanager | Manage tasks, track progress, and collaborate with your team |
| /allleaverequests | Manage and approve employee leave requests |
| /attendance | Track and manage employee attendance records |
| /shiftcalendar | Drag & drop shifts · Overlap prevention · Swap requests |
| /documenttracker | Track employee documents & automated expiry alerts |
| /payroll | Automated salary processing and management |
| /loans | Manage and track loan requests |
| /expenses | Submit and manage expense reimbursements |
| /recruitment | AI-assisted CV parsing, scoring & applicant tracking |
| /interviewassistant | AI-powered interview preparation and analysis |
| /templates | dynamic: "{n} templates available" |
| /offboarding | Manage employee departures smoothly |
| /training | Expand your skills with our comprehensive training library |
| /compliancedashboard | Proactive document expiry tracking & automated notifications |
| /hrletters | Request and manage official HR documents |
| /surveys | Create surveys and gather employee feedback |
| /performancemanagement | Track performance, set goals, and conduct reviews |
| /evaluations | Structured reviews, automated workflows & AI-generated performance reports |
| /workflowautomation | Streamline HR processes with intelligent automation |
| /companywall | Stay connected with your team |
| /communications | Send emails, SMS, and WhatsApp messages to your team |
| /organogram | Visual representation of your organization structure |
| /hrassistantchat | Chat with your AI-powered HR assistant |
| /settings | Configure your HR system |
| /profile | Manage your personal information and preferences |
| /leavemanagement | Request time off and manage approvals |

(Announcements + analytics already match. `/employees` count subtitle ✓.)

### F. Chat page restructure (layout only, keep all function)

Ref: NO page header. One outer card `rounded-xl shadow-lg border
border-slate-200 overflow-hidden` (x=288, w=1120, h≈772 =
`h-[calc(100vh-8rem)]`) inside the standard page container; flex row:
list column `w-80 border-r border-slate-200` ("Messages" `h2` 18px/700 +
40×32 `bg-blue-600` + icon-only button) | chat pane flex-1 (18px/700
"Select a conversation" h3 empty state).
Clone: PageHeader + two separate cards + "+ New" labeled button.

### G. Analytics stat cards

Ref: 48px tiles `rounded-xl` bg-{blue,purple,green,orange}-100 with 24px
colored icons (blue-600 / purple-600 / green-600 / orange-600); value
`text-3xl` (30px); label 14px/400 slate-500. Clone StatCard: 32px
`bg-accent rounded-lg` tile, accent-colored icon, `text-2xl` value.
Fix per-page via the existing `iconClassName` prop + a new optional
`valueClassName` (StatCard is shared — other pages keep their measured
smaller tiles, e.g. documenttracker 44px).

### H. Login page (re-measured this session)

| ID | Gap | Fix |
|----|-----|-----|
| L1 | inputs 36px/r8/white bg/pl-9 vs ref 48px/r12/`bg-slate-50/50`/border-slate-200/pl-10 | `min-h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-10` (email+password) |
| L2 | sign-in 44px vs 48px | `h-11` → `h-12` |
| L3 | card inner pad `px-6 py-6 sm:px-8` vs `p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10` | adopt ref padding scale |
| L4 | page bg solid slate-100 vs `bg-gradient-to-br from-slate-50 to-slate-100` | sRGB arbitrary form (trap 3) |
| L5 | missing top accent bar | `absolute top-0 left-0 right-0 h-1` gradient `#e2e8f0→#cbd5e1→#e2e8f0` |

(Card w=448, rounded-2xl 16px, bg-white/95, logo 96×96 rounded-full, socials
h54/r12/slate-200, h1 30/700, sub 16/500 slate-500 — all already ✓.)

### Verified non-gaps (no action)

Active nav #1877F2; sub-item active/inactive states byte-equal; sidebar
surface #FAFAFA + 256px; h1 30px/700 y=32; page rhythm gap-8; dashboard
grid/geometry; login card/logo/socials; analytics card labels & onboarding
summary; chat functional parity; drawer 288px/no-X/80% overlay; attendance
"Access Restricted" (ref role-limits the demo user — clone superset OK);
ESS ref page permanently stuck on "Loading your profile…" (ref bug — clone
superset OK); "Edit with Base44" floating widget (builder chrome, not app).

---

## Part 3 — Execution order (TDD)

1. **R1 tokens + tests** (RED first): pin `--primary-foreground #fafafa`,
   `--border #e5e5e5`, `--input #e5e5e5` in `tests/unit/tokens.test.ts`;
   assert `--font-sans` override REMOVED. Then apply in globals.css (C2/C3,
   B1).
2. **R2 layout.tsx**: remove Inter import (B1).
3. **R3 Button** (C1): default variant → gradient/rounded-md/shadow; E2E
   dashboard spec gains a gradient assertion (RED → GREEN).
4. **R4 Input** (C4/C5): rounded-md + pl-10 on icon inputs.
5. **R5 sidebar-nav** (D1–D8): geometry + semantics; mobile-nav E2E keeps
   drawer pins (288/80/no-X) and gains a nav-item-height pin.
6. **R6 subtitles** (E): ~26 page files, copy table above.
7. **R7 chat restructure** (F).
8. **R8 analytics StatCards** (G).
9. **R9 login** (L1–L5); login E2E updated (input height, button height).
10. **R10 audit fixes** (AUD-1…4): package.json, scripts, delete dead probes.
11. Full gates: lint · tsc · unit · build · E2E. Browser-verify (desktop +
    mobile drawer) against the live reference. Screenshots refresh.

All changes stay on `main`; no new branches.
