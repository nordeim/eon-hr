import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// Payroll Engine — computes salary slips from attendance data.
//
// Money is integer minor units (SAR * 100). The rules (documented in the page):
//   - Late deduction: 0.5 SAR per late minute (50 minor/min), capped at 10% of
//     the employee's basic salary.
//   - Absent deduction: each absent day deducts one daily salary (basic / 30).
//   - Overtime pay: 1.5x the hourly rate (basic / (30 days * 8 hours)).
// Overtime lands in the `bonus` column (extra pay), deductions in `deductions`.

const LATE_RATE_PER_MIN = 50; // minor units (0.50 SAR)
const LATE_CAP_RATIO = 0.1; // 10% of basic salary
const WORK_DAYS = 30;
const WORK_HOURS_PER_DAY = 8;

const EngineInput = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  departmentId: z.string().optional(),
});

function periodNow(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthBounds(month: string): { start: Date; end: Date } {
  const [y, m] = month.split("-").map(Number);
  return { start: new Date(Date.UTC(y, m - 1, 1)), end: new Date(Date.UTC(y, m, 1)) };
}

// GET /api/payroll/engine — departments for the filter dropdown.
export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const departments = await db.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return ok({ departments, currentPeriod: periodNow() });
  });
}

// POST /api/payroll/engine — generate (upsert) payroll records for a month.
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, EngineInput);
    if (!data) return bad;

    const { start, end } = monthBounds(data.month);

    const employees = await db.employee.findMany({
      where: {
        employmentStatus: { not: "terminated" },
        ...(data.departmentId ? { departmentId: data.departmentId } : {}),
      },
      select: { id: true, employeeId: true, firstName: true, lastName: true, baseSalary: true },
      orderBy: { employeeId: "asc" },
    });
    if (employees.length === 0) {
      return err("NOT_FOUND", "No employees found for this selection");
    }

    const attendance = await db.attendanceRecord.findMany({
      where: { date: { gte: start, lt: end } },
      select: { employeeId: true, status: true, minutesLate: true, overtime: true },
    });

    const agg = new Map<
      string,
      { minutesLate: number; overtimeMinutes: number; absentDays: number; records: number }
    >();
    for (const rec of attendance) {
      const entry =
        agg.get(rec.employeeId) ??
        { minutesLate: 0, overtimeMinutes: 0, absentDays: 0, records: 0 };
      entry.records += 1;
      entry.minutesLate += Math.max(0, rec.minutesLate);
      entry.overtimeMinutes += Math.max(0, rec.overtime);
      if (rec.status === "absent") entry.absentDays += 1;
      agg.set(rec.employeeId, entry);
    }

    const results: {
      employeeId: string;
      name: string;
      basicSalary: number;
      lateDeduction: number;
      absentDeduction: number;
      overtimePay: number;
      net: number;
      attendanceDays: number;
    }[] = [];

    for (const emp of employees) {
      const a = agg.get(emp.id) ?? { minutesLate: 0, overtimeMinutes: 0, absentDays: 0, records: 0 };
      const basic = emp.baseSalary;
      const daily = Math.round(basic / WORK_DAYS);
      const hourly = Math.round(basic / (WORK_DAYS * WORK_HOURS_PER_DAY));

      const lateDeduction = Math.min(Math.round(a.minutesLate * LATE_RATE_PER_MIN), Math.round(basic * LATE_CAP_RATIO));
      const absentDeduction = a.absentDays * daily;
      const overtimePay = Math.round(a.overtimeMinutes * hourly * 1.5);

      const deductions = lateDeduction + absentDeduction;
      const net = basic + overtimePay - deductions;

      await db.payrollRecord.upsert({
        where: { employeeId_period: { employeeId: emp.id, period: data.month } },
        create: {
          employeeId: emp.id,
          period: data.month,
          basicSalary: basic,
          allowances: 0,
          bonus: overtimePay,
          deductions,
          netSalary: net,
          status: "draft",
        },
        update: {
          basicSalary: basic,
          allowances: 0,
          bonus: overtimePay,
          deductions,
          netSalary: net,
        },
      });

      results.push({
        employeeId: emp.id,
        name: `${emp.firstName} ${emp.lastName}`.trim(),
        basicSalary: basic,
        lateDeduction,
        absentDeduction,
        overtimePay,
        net,
        attendanceDays: a.records,
      });
    }

    const totalDeductions = results.reduce((s, r) => s + r.lateDeduction + r.absentDeduction, 0);
    const totalOvertime = results.reduce((s, r) => s + r.overtimePay, 0);

    return ok({
      month: data.month,
      processed: results.length,
      attendanceRecords: attendance.length,
      totalDeductions,
      totalOvertime,
      results,
    });
  });
}
