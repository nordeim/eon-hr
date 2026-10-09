import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// Money is integer minor units (SAR * 100).

const LoanInput = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  amount: z.number().int().min(1, "Loan amount must be positive").max(1_000_000_000),
  installmentMonths: z.number().int().min(1, "At least 1 installment month").max(60, "Maximum 60 installment months").default(12),
  reason: z.string().trim().max(500, "Reason is too long").optional().or(z.literal("")),
});

const LoanPatch = z.object({
  status: z.enum(["pending", "approved", "active", "rejected", "completed"]).optional(),
  action: z.enum(["payment"]).optional(),
});

// GET /api/loans?status=
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const status = req.nextUrl.searchParams.get("status") ?? "all";
    const loans = await db.loan.findMany({
      where: status !== "all" ? { status } : {},
      include: {
        employee: { select: { id: true, employeeId: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { requestedAt: "desc" },
    });
    return ok({ loans });
  });
}

// POST /api/loans — new loan request (starts as pending).
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, LoanInput);
    if (!data) return bad;

    const employee = await db.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) return err("NOT_FOUND", "Employee not found");

    const monthlyDeduction = Math.max(1, Math.round(data.amount / data.installmentMonths));
    const loan = await db.loan.create({
      data: {
        employeeId: data.employeeId,
        amount: data.amount,
        installmentMonths: data.installmentMonths,
        monthlyDeduction,
        remaining: data.amount,
        reason: data.reason || null,
        status: "pending",
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    return ok({ loan });
  });
}

// PATCH /api/loans?id=xxx — status changes, or action=payment to record an
// installment payment (reduces remaining; completes the loan when it hits 0).
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Loan id is required");

    const { data, response: bad } = await parseBody(req, LoanPatch);
    if (!data) return bad;
    if (!data.status && !data.action) {
      return err("VALIDATION", "Provide a status or an action");
    }

    const existing = await db.loan.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Loan not found");

    if (data.action === "payment") {
      if (existing.status !== "active") {
        return err("VALIDATION", "Installments can only be recorded for active loans");
      }
      const remaining = Math.max(0, existing.remaining - existing.monthlyDeduction);
      const loan = await db.loan.update({
        where: { id },
        data: {
          remaining,
          ...(remaining === 0 ? { status: "completed" } : {}),
        },
        include: { employee: { select: { firstName: true, lastName: true } } },
      });
      return ok({ loan });
    }

    const loan = await db.loan.update({
      where: { id },
      data: {
        status: data.status!,
        ...(existing.status === "pending" && data.status ? { decidedAt: new Date() } : {}),
        ...(data.status === "completed" ? { remaining: 0 } : {}),
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    return ok({ loan });
  });
}

// DELETE /api/loans?id=xxx
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Loan id is required");

    const existing = await db.loan.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Loan not found");

    await db.loan.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
