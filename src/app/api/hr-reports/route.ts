import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser } from "@/lib/api";

// GET /api/hr-reports?source=employees&from=&to=&groupBy=&status=
// Server-side grouping + filtering for the HR Reports & Analytics builder.

const QuerySchema = z.object({
  source: z
    .literal("employees", { message: "Only the Employees data source is supported" })
    .default("employees"),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "From date must be YYYY-MM-DD")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "To date must be YYYY-MM-DD")
    .optional(),
  groupBy: z.enum(["department", "status", "type"]).default("status"),
  status: z.enum(["all", "active", "on_leave", "suspended", "terminated"]).default("all"),
});

interface EmployeeLike {
  department: string | null;
  employmentStatus: string;
  employmentType: string;
}

const GROUP_LABELS: Record<"department" | "status" | "type", (e: EmployeeLike) => string> = {
  department: (e) => e.department ?? "Unassigned",
  status: (e) => e.employmentStatus,
  type: (e) => e.employmentType,
};

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
    const { from, to, groupBy, status } = parsed.data;

    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate = to ? new Date(`${to}T23:59:59.999`) : null;

    const employees = await db.employee.findMany({
      where: {
        AND: [
          fromDate && !Number.isNaN(fromDate.getTime()) ? { startDate: { gte: fromDate } } : {},
          toDate && !Number.isNaN(toDate.getTime()) ? { startDate: { lte: toDate } } : {},
          status !== "all" ? { employmentStatus: status } : {},
        ],
      },
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

    const groupOf = GROUP_LABELS[groupBy];
    const groups = new Map<string, number>();
    for (const e of employees) {
      const key = groupOf({
        department: e.department?.name ?? null,
        employmentStatus: e.employmentStatus,
        employmentType: e.employmentType,
      });
      groups.set(key, (groups.get(key) ?? 0) + 1);
    }

    return ok({
      stats: {
        totalRecords: employees.length,
        uniqueGroups: groups.size,
        activeCount: employees.filter((e) => e.employmentStatus === "active").length,
      },
      groups: [...groups.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      records: employees.map((e) => ({
        fullName: `${e.firstName} ${e.lastName}`.trim(),
        jobTitle: e.jobTitle,
        department: e.department?.name ?? null,
        employmentStatus: e.employmentStatus,
        employmentType: e.employmentType,
        startDate: e.startDate ? e.startDate.toISOString() : null,
      })),
    });
  });
}
