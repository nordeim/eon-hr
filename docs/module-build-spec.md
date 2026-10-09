# Eon HR — Module Page Build Specification (for build agents)

You are building module pages for the Eon HR clone at `/home/z/my-project/eon-hr`.
READ THIS ENTIRELY BEFORE WRITING ANY CODE. Follow every rule.

## Project facts

- Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 4 (CSS-first, no tailwind.config)
- Prisma + SQLite. Import the client: `import { db } from "@/lib/db"`
- Path alias: `@/*` → `src/*`
- The app shell (sidebar/header/mobile nav) already exists at `src/app/(app)/layout.tsx`. You only build page files inside `src/app/(app)/<route>/page.tsx` (stub pages exist — REPLACE their content)
- Dev server already running on port 3000 with `bun run dev` (do NOT start it). Verify pages with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/<route>` (expect 200) — the browser session is owned by the main agent; do NOT use agent-browser
- Auth: `getSessionUser()` from `@/lib/auth` in server components; the (app) layout already guards routes

## Available components (already built — do NOT recreate)

All in `@/components/ui/*`: Button (variants: default/outline/ghost/secondary/destructive/link; sizes default/sm/lg/icon/iconSm), Card + CardHeader/CardTitle/CardDescription/CardContent/CardFooter, Input, Textarea, Label, Badge (variants: default/secondary/success/warning/destructive/info/purple/outline), Avatar/AvatarImage/AvatarFallback, Dialog/DialogTrigger/DialogContent/DialogHeader/DialogTitle/DialogDescription/DialogFooter/DialogClose, Select/SelectTrigger/SelectContent/SelectItem/SelectValue, Tabs/TabsList/TabsTrigger/TabsContent, Switch, Checkbox, DropdownMenu*, Table/TableHeader/TableBody/TableRow/TableHead/TableCell, Progress (props: value, indicatorClassName), ToastProvider + `useToast()` hook (toast.toast({title, description?, variant?})).

Shared in `@/components/shared/*`:
- `PageHeader({section?, title, subtitle?, actions?})`
- `StatCard({label, value, hint?, icon?, iconClassName?})`
- `EmptyState({icon?, title, description?, action?})`
- `StatusBadge({status})` — status string → colored badge (covers: pending, approved, rejected, active, on_leave, suspended, terminated, full_time, part_time, contract, intern, paid, present, absent, late, applied, interviewing, offer, hired, open, paused, closed, valid, expiring, expired, pending_upload, resolved, critical, high, medium, low, on_track, at_risk, behind, not_started, available, assigned, repair, retired, urgent, issued, success, failed, sent, in_progress, completed, draft, cancelled)

Utils from `@/lib/utils`: `cn`, `formatSar(minorUnits)` (money is INTEGER minor units — SAR * 100), `formatDate`, `formatDateTime`, `timeAgo`, `initials(name)`, `currentPeriod()` ("2026-10"), `daysBetween`.

## Page structure pattern (MANDATORY for every page)

```tsx
"use client"; // client pages fetch from /api/* and manage state
// OR server component reading db directly for read-only pages (analytics).

export default function XPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader section="SectionName" title="Title" subtitle="..."
        actions={<><Button variant="outline">Secondary</Button><Button>Primary</Button></>} />
      {/* stat cards row */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4"> <StatCard .../> ... </div>
      {/* content card(s) */}
    </div>
  );
}
```

## Design rules (visual parity with reference)

- Page bg: light (bg-background, near #F8FAFC). Cards: white, `rounded-xl border shadow-sm`
- Primary color: blue (#2563eb). Muted text: #6b7280. NEVER use indigo or purple as primary.
- Icons: lucide-react, 4.5 size (`h-4 w-4` / `h-5 w-5`)
- Spacing: page gap-6, card grids gap-4/gap-5, card padding p-5/p-6
- Every list/table MUST have: loading state (Loader2 spin), empty state (EmptyState component), error toast
- Table rows: `hover:bg-secondary/40`; header cells `text-muted-foreground font-medium`
- Dialogs for create/edit forms (max-w-lg), form grid `grid grid-cols-2 gap-4` for paired fields
- Numbers: money via formatSar. NEVER render floats for money.

## API pattern (MANDATORY)

Create `src/app/api/<resource>/route.ts` following the envelope in `@/lib/api`:

```ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

const Input = z.object({ /* fields with messages */ });

export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;
    // query with filters from req.nextUrl.searchParams
    return ok({ items });
  });
}

export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser(); // requireRole(["admin","hr"]) for admin ops
    if (!user) return response;
    const { data, response: bad } = await parseBody(req, Input);
    if (!data) return bad;
    // create; catch unique conflicts with err("CONFLICT", "...")
    return ok({ item });
  });
}

// PATCH/DELETE take ?id= query param, return err("NOT_FOUND", ...) when missing
```

Client fetch helper pattern:
```ts
const res = await fetch("/api/resource", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
const json = await res.json();
if (!json.ok) { toast.toast({ title: "Failed", description: json.error?.message, variant: "error" }); return; }
```

Zod schemas: add to `src/lib/validation.ts` OR define locally in the route file (local is fine).

## Prisma schema facts (models available)

User, Company, Department, Employee (employeeId, firstName, lastName, email, jobTitle, employmentStatus/Type, startDate, baseSalary minor units), LeaveType/LeaveBalance (year, entitled, used) /LeaveRequest (days, status pending/approved/rejected, approverId), AttendanceRecord (date, checkIn/Out, status present/absent/late/leave, minutesLate, overtime), Shift/ShiftAssignment, Document (type, expiryDate, status valid/expiring/expired/pending_upload), PayrollRecord (period "2026-10", basicSalary/allowances/bonus/deductions/netSalary minor units, status draft/approved/paid), Loan (amount, installmentMonths, monthlyDeduction, remaining, status), ExpenseClaim (title, category, amount, status pending/approved/rejected/reimbursed), JobPosting (title, department, location, type, status open/paused/closed, openings) / Candidate (name, stage applied/interviewing/offer/hired/rejected, aiScore, skillsMatch, cvText), OnboardingTemplate (tasks JSON string) / OnboardingProcess (progress 0-100) / OffboardingProcess (checklist JSON, lastDay), TrainingPlatform (name, category technical/soft_skills/compliance/product/tools/leadership, coursesCount, logoColor), ComplianceAlert (severity critical/high/medium/low, type, title, message, status active/resolved), HRLetter (type employment/salary/bank/noc/experience, status pending/issued), Survey (questions JSON, status draft/active/closed) / SurveyResponse (answers JSON, sentiment -100..100), Goal (title, category, progress, status on_track/at_risk/behind/completed, dueDate) / ReviewCycle / Review (overallRating 1-5) / Evaluation (ratings JSON, aiSummary), Asset (name, type, serialNumber, assignedToId, status available/assigned/repair/retired, warrantyExpiry), StaffRequest (category general/it/hr/facilities/finance/admin, priority, status, response), Post (content, audience, likes) / Announcement (title, content, priority normal/high/urgent) / Notification (type, title, body, read) / Conversation (participants JSON) / Message (senderId, content) / CommunicationLog (channel email/sms/whatsapp), AIChat/AIMessage (role user/assistant), Workflow (module, trigger, conditions JSON, actions JSON, active, executions) / WorkflowExecution, NotificationPreference (per-user toggles), AuditLog, SecuritySettings (twoFactorAuth, auditLogging, dataEncryption, automatedBackups, gdprCompliance).

JSON-string fields: parse with try/catch, `JSON.parse(str || "[]")`, never trust shape.

## Money rule

ALWAYS integer minor units (1 SAR = 100). Form inputs take SAR as string/number → `Math.round(Number(v) * 100)` before save. Display via `formatSar()`. Aggregates: `_sum: { amount: true }`.

## Tailwind v4 traps (MANDATORY to respect)

1. NO explicit `mt-*`/`mb-*` utilities on children of `space-y-*`/`space-x-*` containers (use flex gap instead) — v3/v4 selector specificity differs
2. No bare HSL triplets in theme; use component classes only (already set up)
3. No `bg-gradient-to-*` for parity-critical gradients — use `bg-[linear-gradient(...)]` if needed
4. `h-4.5 w-4.5` etc. work (v4 dynamic spacing)

## The logged-in user

`useSearchParams()` → `?new=1` opens the create dialog automatically (dashboard quick actions link with ?new=1 — implement this on staffrequests, expenses, leavemanagement pages).

## Quality bar

- TypeScript strict-safe (no `any`)
- `bun run lint` must pass for your files (`cd /home/z/my-project/eon-hr && bun run lint 2>&1 | tail -20` — fix YOUR errors only; ignore pre-existing warnings in others' files)
- Every page: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/<route>` returns 200
- After all pages: update the worklog `/home/z/my-project/worklog.md` (append with --- separator, Task ID, agent name, files built)
