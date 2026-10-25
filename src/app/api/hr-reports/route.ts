import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser } from "@/lib/api";

// GET /api/hr-reports?source=&from=&to=&groupBy=&status=
// Session 91 (R91-B): the REF's FOUR-ENTITY report builder — Employees,
// Staff Requests, Expense Claims, Leave Requests — with entity-dependent
// group-by fields + table columns (live-read from the REF's open selects).
// The status filter is the REF's constant union (All | Pending | Approved |
// Rejected | Active | Completed) applied to each entity's own status field —
// values outside an entity's vocabulary match nothing (the REF's design).

const SOURCES = ["employees", "staff-requests", "expense-claims", "leave-requests"] as const;
type Source = (typeof SOURCES)[number];

const EMPLOYEE_GROUPS = ["job_title", "department_id", "employment_status", "employment_type", "start_date"] as const;
const STAFF_REQUEST_GROUPS = ["category", "status", "priority", "amount", "created_date"] as const;
const EXPENSE_CLAIM_GROUPS = ["expense_type", "amount", "status", "date"] as const;
const LEAVE_REQUEST_GROUPS = ["leave_type", "status", "start_date", "end_date"] as const;

const QuerySchema = z.object({
  source: z.enum(SOURCES).default("employees"),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "From date must be YYYY-MM-DD")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "To date must be YYYY-MM-DD")
    .optional(),
  groupBy: z.string().default(""),
  status: z
    .enum(["all", "pending", "approved", "rejected", "active", "completed"])
    .default("all"),
});

const isEmployeeGroup = (g: string): g is (typeof EMPLOYEE_GROUPS)[number] =>
  (EMPLOYEE_GROUPS as readonly string[]).includes(g);
const isStaffRequestGroup = (g: string): g is (typeof STAFF_REQUEST_GROUPS)[number] =>
  (STAFF_REQUEST_GROUPS as readonly string[]).includes(g);
const isExpenseClaimGroup = (g: string): g is (typeof EXPENSE_CLAIM_GROUPS)[number] =>
  (EXPENSE_CLAIM_GROUPS as readonly string[]).includes(g);
const isLeaveRequestGroup = (g: string): g is (typeof LEAVE_REQUEST_GROUPS)[number] =>
  (LEAVE_REQUEST_GROUPS as readonly string[]).includes(g);

function fmtDate(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "—";
}

function fmtMoney(minor: number | null): string {
  // minor units → the plain major-unit string (the report table form)
  return minor === null ? "—" : (minor / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const parsed = QuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!parsed.success) {
      return err("VALIDATION", "Invalid report parameters", {
        query: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      });
    }
    const { source, from, to, groupBy, status } = parsed.data;

    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate = to ? new Date(`${to}T23:59:59.999`) : null;
    const inRange = (d: Date) =>
      (!fromDate || Number.isNaN(fromDate.getTime()) || d >= fromDate) &&
      (!toDate || Number.isNaN(toDate.getTime()) || d <= toDate);

    type Row = { cells: (string | null)[]; group: string; active: boolean };
    let rows: Row[] = [];

    if (source === "employees") {
      const group = isEmployeeGroup(groupBy) ? groupBy : null;
      const employees = await db.employee.findMany({
        where: status !== "all" ? { employmentStatus: status } : {},
        select: {
          firstName: true,
          lastName: true,
          jobTitle: true,
          department: { select: { name: true } },
          employmentStatus: true,
          employmentType: true,
          startDate: true,
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      });
      rows = employees
        .filter((e) => !e.startDate || inRange(e.startDate))
        .map((e) => ({
          cells: [
            `${e.firstName} ${e.lastName}`.trim(),
            e.jobTitle,
            e.department?.name ?? null,
            e.employmentStatus,
            e.employmentType,
            fmtDate(e.startDate),
          ],
          group: group
            ? group === "job_title"
              ? e.jobTitle ?? "Unassigned"
              : group === "department_id"
                ? e.department?.name ?? "Unassigned"
                : group === "employment_status"
                  ? e.employmentStatus
                  : group === "employment_type"
                    ? e.employmentType
                    : fmtDate(e.startDate)
            : "",
          active: e.employmentStatus === "active",
        }));
    } else if (source === "staff-requests") {
      const group = isStaffRequestGroup(groupBy) ? groupBy : null;
      const requests = await db.staffRequest.findMany({
        where: status !== "all" ? { status } : {},
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
      rows = requests
        .filter((r) => inRange(r.createdAt))
        .map((r) => ({
          cells: [
            r.user.name,
            r.category.replace(/_/g, " ").replace(/\b\w/, (c) => c.toUpperCase()),
            r.status.replace(/_/g, " ").replace(/\b\w/, (c) => c.toUpperCase()),
            r.priority.replace(/\b\w/, (c) => c.toUpperCase()),
            fmtMoney(r.amount),
            fmtDate(r.createdAt),
          ],
          group: group
            ? group === "category"
              ? r.category.replace(/_/g, " ").replace(/\b\w/, (c) => c.toUpperCase())
              : group === "status"
                ? r.status.replace(/_/g, " ").replace(/\b\w/, (c) => c.toUpperCase())
                : group === "priority"
                  ? r.priority.replace(/\b\w/, (c) => c.toUpperCase())
                  : group === "amount"
                    ? fmtMoney(r.amount)
                    : fmtDate(r.createdAt)
            : "",
          active: r.status === "approved",
        }));
    } else if (source === "expense-claims") {
      const group = isExpenseClaimGroup(groupBy) ? groupBy : null;
      const claims = await db.expenseClaim.findMany({
        where: status !== "all" ? { status } : {},
        include: { employee: { select: { firstName: true, lastName: true } } },
        orderBy: { date: "desc" },
      });
      rows = claims
        .filter((c) => inRange(c.date))
        .map((c) => ({
          cells: [
            `${c.employee.firstName} ${c.employee.lastName}`.trim(),
            c.category.replace(/\b\w/, (ch) => ch.toUpperCase()),
            fmtMoney(c.amount),
            c.status.replace(/\b\w/, (ch) => ch.toUpperCase()),
            fmtDate(c.date),
          ],
          group: group
            ? group === "expense_type"
              ? c.category.replace(/\b\w/, (ch) => ch.toUpperCase())
              : group === "amount"
                ? fmtMoney(c.amount)
                : group === "status"
                  ? c.status.replace(/\b\w/, (ch) => ch.toUpperCase())
                  : fmtDate(c.date)
            : "",
          active: c.status === "approved",
        }));
    } else {
      const group = isLeaveRequestGroup(groupBy) ? groupBy : null;
      const leaves = await db.leaveRequest.findMany({
        where: status !== "all" ? { status } : {},
        include: {
          employee: { select: { firstName: true, lastName: true } },
          leaveType: { select: { name: true } },
        },
        orderBy: { startDate: "desc" },
      });
      rows = leaves
        .filter((l) => inRange(l.startDate))
        .map((l) => ({
          cells: [
            `${l.employee.firstName} ${l.employee.lastName}`.trim(),
            l.leaveType.name,
            l.status.replace(/\b\w/, (ch) => ch.toUpperCase()),
            fmtDate(l.startDate),
            fmtDate(l.endDate),
          ],
          group: group
            ? group === "leave_type"
              ? l.leaveType.name
              : group === "status"
                ? l.status.replace(/\b\w/, (ch) => ch.toUpperCase())
                : group === "start_date"
                  ? fmtDate(l.startDate)
                  : fmtDate(l.endDate)
            : "",
          active: l.status === "approved",
        }));
    }

    /* Session 91 (R91-B): the report RUNS only when a group is chosen —
     * the REF's initial state renders 0/0/0 stats + the grid-only chart
     * + the 0-row table (live-read: 0/0/0 even with a populated tenant),
     * and the old clone's empty-Group-By contract matched it (the API's
     * validation rejection → the empty payload). Restored explicitly: no
     * valid group → the empty report. */
    const hasGroup =
      (source === "employees" && isEmployeeGroup(groupBy)) ||
      (source === "staff-requests" && isStaffRequestGroup(groupBy)) ||
      (source === "expense-claims" && isExpenseClaimGroup(groupBy)) ||
      (source === "leave-requests" && isLeaveRequestGroup(groupBy));
    if (!hasGroup) {
      return ok({
        stats: { totalRecords: 0, uniqueGroups: 0, activeCount: 0 },
        groups: [],
        records: [],
      });
    }

    const groups = new Map<string, number>();
    for (const row of rows) {
      groups.set(row.group, (groups.get(row.group) ?? 0) + 1);
    }

    return ok({
      stats: {
        totalRecords: rows.length,
        uniqueGroups: groups.size,
        activeCount: rows.filter((r) => r.active).length,
      },
      groups: [...groups.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      records: rows.map((r) => ({ cells: r.cells })),
    });
  });
}
