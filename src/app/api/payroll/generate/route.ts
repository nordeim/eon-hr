import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireRole, parseBody } from "@/lib/api";

const GenerateInput = z.object({
  period: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Period must be in YYYY-MM format")
    .optional(),
});

function periodNow(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// POST /api/payroll/generate — create draft payslips for ALL employees for a
// period, using each employee's baseSalary as the basic salary. Employees that
// already have a record for the period are skipped (idempotent).
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, GenerateInput);
    if (!data) return bad;

    const period = data.period ?? periodNow();

    const employees = await db.employee.findMany({
      select: { id: true, employeeId: true, firstName: true, lastName: true, baseSalary: true },
      orderBy: { employeeId: "asc" },
    });
    if (employees.length === 0) {
      return err("NOT_FOUND", "No employees found — add employees before generating payslips");
    }

    const existing = await db.payrollRecord.findMany({
      where: { period },
      select: { employeeId: true },
    });
    const existingSet = new Set(existing.map((r) => r.employeeId));

    const toCreate = employees
      .filter((e) => !existingSet.has(e.id))
      .map((e) => ({
        employeeId: e.id,
        period,
        basicSalary: e.baseSalary,
        allowances: 0,
        bonus: 0,
        deductions: 0,
        netSalary: e.baseSalary,
        status: "draft",
      }));

    if (toCreate.length > 0) {
      await db.payrollRecord.createMany({ data: toCreate });
    }

    return ok({
      period,
      created: toCreate.length,
      skipped: employees.length - toCreate.length,
      total: employees.length,
    });
  });
}
