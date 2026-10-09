import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// /api/departments — departments list used by settings + pickers.
// GET    → departments with employee counts
// POST   → create (admin/hr)
// DELETE → ?id= remove (admin/hr, only when empty)

const DepartmentInput = z.object({
  name: z.string().trim().min(1, "Department name is required").max(80),
  code: z.string().trim().max(20).optional().or(z.literal("")),
});

export async function GET() {
  return guard(async () => {
    await requireUser();
    const departments = await db.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true, _count: { select: { employees: true } } },
    });
    return ok({
      departments: departments.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        employeeCount: d._count.employees,
      })),
    });
  });
}

export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, DepartmentInput);
    if (!data) return bad;

    const dupe = await db.department.findUnique({ where: { name: data.name } });
    if (dupe) return err("CONFLICT", "A department with this name already exists");

    const department = await db.department.create({
      data: { name: data.name, code: data.code || null },
      select: { id: true, name: true, code: true, _count: { select: { employees: true } } },
    });
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "department.create",
        entity: "department",
        entityId: department.id,
        detail: JSON.stringify({ name: data.name, code: data.code || null }),
      },
    });
    return ok({
      department: { id: department.id, name: department.name, code: department.code, employeeCount: 0 },
    });
  });
}

export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Department id is required");
    const existing = await db.department.findUnique({
      where: { id },
      select: { id: true, name: true, _count: { select: { employees: true } } },
    });
    if (!existing) return err("NOT_FOUND", "Department not found");
    if (existing._count.employees > 0) {
      return err("CONFLICT", "Move the employees out of this department before deleting it");
    }

    await db.department.delete({ where: { id } });
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "department.delete",
        entity: "department",
        entityId: id,
        detail: JSON.stringify({ name: existing.name }),
      },
    });
    return ok({ deleted: true });
  });
}
