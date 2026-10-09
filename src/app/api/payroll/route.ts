import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// Money is integer minor units (SAR * 100) — floats never cross the wire.

const PayrollInput = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Period must be in YYYY-MM format"),
  basicSalary: z.number().int().min(0, "Basic salary cannot be negative").max(1_000_000_000),
  allowances: z.number().int().min(0, "Allowances cannot be negative").max(1_000_000_000).default(0),
  bonus: z.number().int().min(0, "Bonus cannot be negative").max(1_000_000_000).default(0),
  deductions: z.number().int().min(0, "Deductions cannot be negative").max(1_000_000_000).default(0),
  status: z.enum(["draft", "approved", "paid"]).default("draft"),
});

function netOf(basic: number, allowances: number, bonus: number, deductions: number): number {
  return basic + allowances + bonus - deductions;
}

// GET /api/payroll?period=&employeeId=&status=
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const period = req.nextUrl.searchParams.get("period") ?? "";
    const employeeId = req.nextUrl.searchParams.get("employeeId") ?? "";
    const status = req.nextUrl.searchParams.get("status") ?? "all";

    const records = await db.payrollRecord.findMany({
      where: {
        AND: [
          period ? { period } : {},
          employeeId ? { employeeId } : {},
          status !== "all" ? { status } : {},
        ],
      },
      include: {
        employee: {
          select: { id: true, employeeId: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: [{ period: "desc" }, { createdAt: "desc" }],
    });
    return ok({ records });
  });
}

// POST /api/payroll
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, PayrollInput);
    if (!data) return bad;

    const employee = await db.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) return err("NOT_FOUND", "Employee not found");

    const dupe = await db.payrollRecord.findUnique({
      where: { employeeId_period: { employeeId: data.employeeId, period: data.period } },
    });
    if (dupe) return err("CONFLICT", "A payroll record already exists for this employee and period");

    const record = await db.payrollRecord.create({
      data: {
        employeeId: data.employeeId,
        period: data.period,
        basicSalary: data.basicSalary,
        allowances: data.allowances,
        bonus: data.bonus,
        deductions: data.deductions,
        netSalary: netOf(data.basicSalary, data.allowances, data.bonus, data.deductions),
        status: data.status,
        paidAt: data.status === "paid" ? new Date() : null,
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    return ok({ record });
  });
}

// PATCH /api/payroll?id=xxx  (edit amounts and/or change status)
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Payroll record id is required");

    const { data, response: bad } = await parseBody(req, PayrollInput.partial());
    if (!data) return bad;

    const existing = await db.payrollRecord.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Payroll record not found");

    const basic = data.basicSalary ?? existing.basicSalary;
    const allowances = data.allowances ?? existing.allowances;
    const bonus = data.bonus ?? existing.bonus;
    const deductions = data.deductions ?? existing.deductions;
    const status = data.status ?? existing.status;

    const record = await db.payrollRecord.update({
      where: { id },
      data: {
        ...(data.basicSalary !== undefined ? { basicSalary: basic } : {}),
        ...(data.allowances !== undefined ? { allowances } : {}),
        ...(data.bonus !== undefined ? { bonus } : {}),
        ...(data.deductions !== undefined ? { deductions } : {}),
        netSalary: netOf(basic, allowances, bonus, deductions),
        status,
        ...(status === "paid" && !existing.paidAt ? { paidAt: new Date() } : {}),
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    return ok({ record });
  });
}

// DELETE /api/payroll?id=xxx
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Payroll record id is required");

    const existing = await db.payrollRecord.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Payroll record not found");

    await db.payrollRecord.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
