# AGENTS.md — Eon HR

High-signal operating notes for AI coding agents working in this repo. Read
`CLAUDE.md` for the full development constitution and
`Project_Architecture_Document.md` for architecture rationale.

## Commands

| Task | Command |
|---|---|
| Install | `bun install` |
| Dev server | `bun run dev` (port 3000) |
| Lint | `bun run lint` |
| Typecheck | `bun run typecheck` |
| Unit tests | `bun run test` (Vitest, 102 specs) |
| E2E tests | `bun run test:e2e` (Playwright, 84 specs — needs `bun run build` first; the runner does NOT build for you) |
| Production build | `bun run build` (standalone output at `.next/standalone/`) |
| Push schema | `bun run db:push` |
| Seed | `bun run db:seed` |
| Single unit test | `bunx vitest run tests/unit/auth.test.ts` |
| Single E2E spec | `bunx playwright test tests/e2e/mobile-navigation.spec.ts` |

**Gate order before any commit**: `lint → typecheck → test → build`. E2E is
the pre-push gate (`docs/how-to-git-push-using-ssh-wrapper_SKILL.md` rule 2).

## Database path — the one rule you cannot break

`DATABASE_URL="file:../db/custom.db"` in `.env` resolves **against
`prisma/schema.prisma`** — not the CWD — for BOTH the Prisma CLI and the
runtime. The runtime rule is implemented in `src/lib/db-path.ts` and pinned
by `tests/db-path.test.ts` (15 specs, including the Next standalone
`process.chdir` trap). The database therefore always lives at
`<repo>/db/custom.db`. NEVER "fix" a path by making it CWD-relative or
absolute; if a tool sees a different file, an exported `DATABASE_URL` env var
is overriding `.env` — unset it first (`unset DATABASE_URL`).

**Never manually edit `package.json`** — add dependencies with `bun add`.

## Environment

- `.env` is gitignored; copy `.env.example`. `AUTH_SECRET` must be ≥16 chars
  and is REQUIRED in production — enforced at boot by
  `src/instrumentation.ts` (`register()` → `assertProductionSecret()`); the
  standalone server refuses to serve (instrumentation error, HTTP 500)
  without it. Pinned by `tests/unit/auth.test.ts`.
- An exported `DATABASE_URL` in your shell silently overrides `.env` for the
  Prisma CLI — always `unset DATABASE_URL` before `db:push`/`db:seed` if the
  db file lands in the wrong place.

## Tailwind CSS 4 — read the trap log first

`docs/Tailwind-V4-Validation-Report.md` (appendix "Project Trap Log") pins
six v3→v4 engine differences already fixed in `src/app/globals.css`:

1. Theme vars must be full `hsl()`/hex values — bare triplets under
   `@theme inline` resolve to transparent.
2. The v3-era palette is pinned in `@theme` (v4's oklch defaults drift
   1–3 sRGB units per channel).
3. Parity-critical gradients use `bg-[linear-gradient(...)]` (v4 interpolates
   `bg-gradient-to-*` in oklab) — including the shell canvas, the per-page
   canvases, and every CTA gradient (session 6: per-page colors — payroll
   green→emerald, attendance blue→cyan, compliance red→orange, chat purple,
   templates indigo, workflows pink).
4. **No `mt-*`/`mb-*` utilities on children of `space-y-*`/`space-x-*`
   containers** — v3's selector specificity overrides them, v4's `:where()`
   wrapper does not. Use flex `gap` layouts instead.
5. `--shadow-sm` is pinned to v3 geometry; v4 shifted the whole shadow scale
   one notch.
6. v4's `space-y-*` selector flipped (margin-block-end on `:not(:last-child)`
   vs v3's margin-top on `* + *`) — a `display:none` FIRST sibling no longer
   offsets the second child; restore the v3 offset with an explicit `mt-*`
   on the second child (see the dashboard welcome row).

Also: CSS comments containing `*/` sequences (e.g. `mt-*/mb-*` inside a
comment) terminate the comment and corrupt `@theme` — write "margin-top"
instead. `next.config.ts` sets `allowedDevOrigins` because Next 16's
dev-origin protection silently blocks chunks for 127.0.0.1 and the sandbox
preview host.

## Conventions

- **API envelope**: every route handler returns
  `{ ok: true, data } | { ok: false, error: { code, message, fieldErrors? } }`
  via `src/lib/api.ts` helpers (`ok`, `err`, `guard`, `requireUser`,
  `requireRole`, `parseBody`). Nothing throws across the boundary.
- **Money**: integer minor units (1 SAR = 100 halalas) end to end. Convert at
  form boundaries (`Math.round(Number(v) * 100)`), display with
  `formatSar()`. Floats never touch money.
- **Validation**: Zod at every boundary; schemas in `src/lib/validation.ts`
  or co-located in the route file.
- **Auth**: HMAC cookie sessions (`src/lib/auth.ts`); pages under
  `src/app/(app)/` are guarded by its `layout.tsx`. Role gates:
  `requireRole(["admin", "hr"])` for admin mutations.
- **Pages**: `"use client"` pages fetch `/api/*`; analytics pages are server
  components querying `db` directly with a `"use client"` chart component
  sibling (Recharts needs plain serializable props — no `Date` objects
  across the boundary).
- **Prisma JSON fields** (tasks, conditions, participants…): parse with
  `try { JSON.parse(x || "[]") } catch { [] }` — never trust the shape.
- **Rate limiter**: login allows 10 attempts/IP/15 min (in-memory map in the
  login route). Keep total real logins per E2E run under that budget — the
  auth setup project signs in ONCE and reuses storageState.

## Testing quirks

- Playwright needs `bun .next/standalone/server.js` to exist → run
  `bun run build` before `test:e2e` after changing code.
- E2E uses an isolated `db/e2e.db` (global-setup pushes + seeds it); the dev
  server's `db/custom.db` is never touched by tests.
- Browser binaries: `bunx playwright install chromium` once.
- Strict-mode locators: scope headings with `exact: true` when a page
  contains both a title and a "All {Title}" card heading.

## Page architecture (session 6) — where padding and gradients live

The reference paints its canvas per page; `main` is BARE
(`flex-1 flex flex-col pb-20 md:pb-0` — no padding). Every page renders:

```
main
└── page root: min-h-screen bg-[linear-gradient(to_right_bottom,X,Y)] p-4 md:p-8
    └── content wrapper: mx-auto flex w-full max-w-7xl flex-col gap-8
```

Per-page gradient map (measured): payroll green-50→blue-50, payrollmodule
green→emerald, payrollengine emerald→teal, training/communications/
hrassistantchat purple→blue, expenses purple→pink, interviewassistant
purple→indigo, recruitment indigo→blue, allleaverequests/documenttracker
blue→indigo, attendance(+dashboard) blue→cyan, evaluations/hrletters
indigo→purple, compliancedashboard red→orange, organogram teal→green,
surveys teal→cyan, surveyanalytics teal→slate, shiftcalendar violet→indigo,
performancemanagement slate→indigo, workflowautomation slate→purple; the
rest slate→blue; employees/analytics/templates/announcements/
recruitmentkanban/notificationpreferences/hrreports/workflowconfigpage/
staffrequests/dashboard have NO canvas (plain roots, some with p-6 +
narrow max-w — see `docs/remediation-plan-session6.md` §S2). The shell
canvas gradient (slate-50→blue-50, sRGB) lives on the AppShell root div.

Do NOT re-add padding to `main` or move gradients to `body` — both are
reference-measured contracts pinned by tests.
