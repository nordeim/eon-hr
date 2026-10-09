import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";
import { EmployeeInput } from "@/lib/validation";

// GET /api/employees?search=&status=&type=
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
    const status = req.nextUrl.searchParams.get("status") ?? "all";
    const type = req.nextUrl.searchParams.get("type") ?? "all";

    const employees = await db.employee.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { firstName: { contains: search } },
                  { lastName: { contains: search } },
                  { email: { contains: search } },
                  { jobTitle: { contains: search } },
                ],
              }
            : {},
          status !== "all" ? { employmentStatus: status } : {},
          type !== "all" ? { employmentType: type } : {},
        ],
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        jobTitle: true,
        employmentStatus: true,
        employmentType: true,
        startDate: true,
        baseSalary: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ employees });
  });
}

// POST /api/employees
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, EmployeeInput);
    if (!data) return bad;

    const existing = await db.employee.findUnique({ where: { email: data.email } });
    if (existing) return err("CONFLICT", "An employee with this email already exists");

    const count = await db.employee.count();
    const employee = await db.employee.create({
      data: {
        employeeId: `EMP-${String(count + 1).padStart(4, "0")}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        jobTitle: data.jobTitle || null,
        employmentStatus: data.employmentStatus,
        employmentType: data.employmentType,
        startDate: data.startDate ? new Date(data.startDate) : null,
        baseSalary: data.baseSalary,
      },
      select: { id: true, employeeId: true },
    });
    return ok({ employee });
  });
}

// PATCH /api/employees?id=xxx
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Employee id is required");
    const { data, response: bad } = await parseBody(req, EmployeeInput.partial());
    if (!data) return bad;

    const existing = await db.employee.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Employee not found");

    if (data.email && data.email !== existing.email) {
      const dupe = await db.employee.findUnique({ where: { email: data.email } });
      if (dupe) return err("CONFLICT", "Another employee already uses this email");
    }

    await db.employee.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
        ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
        ...(data.jobTitle !== undefined ? { jobTitle: data.jobTitle || null } : {}),
        ...(data.employmentStatus !== undefined ? { employmentStatus: data.employmentStatus } : {}),
        ...(data.employmentType !== undefined ? { employmentType: data.employmentType } : {}),
        ...(data.startDate !== undefined ? { startDate: data.startDate ? new Date(data.startDate) : null } : {}),
        ...(data.baseSalary !== undefined ? { baseSalary: data.baseSalary } : {}),
      },
    });
    return ok({ updated: true });
  });
}

// DELETE /api/employees?id=xxx
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Employee id is required");
    const existing = await db.employee.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Employee not found");

    await db.employee.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
