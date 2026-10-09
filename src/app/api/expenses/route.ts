import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// Money is integer minor units (SAR * 100). The client converts SAR → minor
// units (Math.round(sar * 100)) before sending; we never accept floats.

const ExpenseInput = z.object({
  employeeId: z.string().optional(),
  title: z.string().trim().min(1, "Title is required").max(120),
  category: z.enum(["travel", "meals", "equipment", "training", "medical", "other"]).default("other"),
  amount: z.number().int().min(1, "Amount must be positive").max(1_000_000_000),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  date: z.string().optional().or(z.literal("")),
});

const ExpensePatch = z.object({
  status: z.enum(["pending", "approved", "rejected", "reimbursed"]),
});

// GET /api/expenses?status=
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const status = req.nextUrl.searchParams.get("status") ?? "all";
    const claims = await db.expenseClaim.findMany({
      where: status !== "all" ? { status } : {},
      include: {
        employee: { select: { id: true, employeeId: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ claims });
  });
}

// POST /api/expenses — submit a new claim (any signed-in user; defaults to the
// user's linked employee when no employeeId is provided).
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, ExpenseInput);
    if (!data) return bad;

    const employeeId = data.employeeId ?? user.employeeId;
    if (!employeeId) {
      return err("VALIDATION", "Select an employee for this claim");
    }
    const employee = await db.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return err("NOT_FOUND", "Employee not found");

    const claim = await db.expenseClaim.create({
      data: {
        employeeId,
        userId: user.id,
        title: data.title,
        category: data.category,
        amount: data.amount,
        description: data.description || null,
        ...(data.date ? { date: new Date(data.date) } : {}),
        status: "pending",
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    return ok({ claim });
  });
}

// PATCH /api/expenses?id=xxx — approve / reject / reimburse (admin & hr only).
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Claim id is required");

    const { data, response: bad } = await parseBody(req, ExpensePatch);
    if (!data) return bad;

    const existing = await db.expenseClaim.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Expense claim not found");

    const claim = await db.expenseClaim.update({
      where: { id },
      data: {
        status: data.status,
        decidedAt: data.status === "pending" ? null : new Date(),
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    return ok({ claim });
  });
}

// DELETE /api/expenses?id=xxx — admin/hr, or the owner of the claim.
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Claim id is required");

    const existing = await db.expenseClaim.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Expense claim not found");

    const isOwner = existing.userId === user.id;
    const isPrivileged = user.role === "admin" || user.role === "hr";
    if (!isOwner && !isPrivileged) {
      return err("FORBIDDEN", "You do not have permission to delete this claim");
    }

    await db.expenseClaim.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
