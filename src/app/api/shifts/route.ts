import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// /api/shifts — shared by two consumers:
// 1. Settings → Shifts tab: GET ?active=true → { shifts } (read-only list with
//    department names).
// 2. Shift Calendar: GET ?month=YYYY-MM (default current) → shifts + month
//    assignments (employee + shift info), employees and calendar stats;
//    POST assigns employee+shift to a date (admin/hr) — unique [employeeId,
//    date] gives overlap prevention; DELETE ?id= removes an assignment.

const AssignInput = z.object({
  employeeId: z.string().trim().min(1, "Employee is required"),
  shiftId: z.string().trim().min(1, "Shift is required"),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fullName(e: { firstName: string; lastName: string }): string {
  return `${e.firstName} ${e.lastName}`.trim();
}

function parseMonth(monthParam: string | null): { year: number; month: number } {
  const now = new Date();
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12) return { year: y, month: m };
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

// GET /api/shifts?active=true (list only) | ?month=YYYY-MM (calendar payload)
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const activeOnly = req.nextUrl.searchParams.get("active") === "true";

    const [shifts, departments] = await Promise.all([
      db.shift.findMany({
        where: activeOnly ? { active: true } : {},
        orderBy: { startTime: "asc" },
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
          departmentId: true,
          active: true,
        },
      }),
      db.department.findMany({ select: { id: true, name: true } }),
    ]);
    const deptById = new Map(departments.map((d) => [d.id, d.name]));
    const shiftItems = shifts.map((s) => ({
      id: s.id,
      name: s.name,
      startTime: s.startTime,
      endTime: s.endTime,
      department: s.departmentId ? (deptById.get(s.departmentId) ?? null) : null,
      active: s.active,
    }));

    if (activeOnly) return ok({ shifts: shiftItems });

    const { year, month } = parseMonth(req.nextUrl.searchParams.get("month"));
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(year, month, 0).getDate();

    const [assignments, employees] = await Promise.all([
      db.shiftAssignment.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
        orderBy: { date: "asc" },
        select: {
          id: true,
          employeeId: true,
          shiftId: true,
          date: true,
          employee: { select: { firstName: true, lastName: true, employeeId: true } },
          shift: { select: { id: true, name: true, startTime: true, endTime: true } },
        },
      }),
      db.employee.findMany({
        select: { id: true, employeeId: true, firstName: true, lastName: true },
        orderBy: { firstName: "asc" },
      }),
    ]);

    const items = assignments.map((a) => ({
      id: a.id,
      dateKey: dateKey(new Date(a.date)),
      employeeId: a.employeeId,
      employeeName: fullName(a.employee),
      employeeCode: a.employee.employeeId,
      shiftId: a.shiftId,
      shiftName: a.shift.name,
      shiftTime: `${a.shift.startTime}–${a.shift.endTime}`,
    }));

    const assignedDays = new Set(items.map((a) => a.dateKey));
    const unassignedDays = daysInMonth - assignedDays.size;

    return ok({
      month: `${year}-${String(month).padStart(2, "0")}`,
      daysInMonth,
      shifts: shiftItems,
      assignments: items,
      employees: employees.map((e) => ({ id: e.id, name: fullName(e), code: e.employeeId })),
      stats: {
        totalEmployees: employees.length,
        shiftsDefined: shiftItems.length,
        assignmentsThisMonth: items.length,
        unassignedDays: Math.max(0, unassignedDays),
      },
    });
  });
}

// POST /api/shifts — assign a shift to an employee on a date
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, AssignInput);
    if (!data) return bad;

    const [employee, shift] = await Promise.all([
      db.employee.findUnique({ where: { id: data.employeeId }, select: { id: true } }),
      db.shift.findUnique({ where: { id: data.shiftId }, select: { id: true } }),
    ]);
    if (!employee) return err("NOT_FOUND", "Employee not found");
    if (!shift) return err("NOT_FOUND", "Shift not found");

    const day = new Date(`${data.date}T00:00:00`);
    if (Number.isNaN(day.getTime())) return err("VALIDATION", "Enter a valid date");

    const existing = await db.shiftAssignment.findFirst({
      where: { employeeId: data.employeeId, date: day },
      select: { id: true },
    });
    if (existing) {
      return err("CONFLICT", "This employee already has a shift on this date (overlap prevention)");
    }

    const assignment = await db.shiftAssignment.create({
      data: { employeeId: data.employeeId, shiftId: data.shiftId, date: day },
      select: { id: true },
    });
    return ok({ assignment });
  });
}

// DELETE /api/shifts?id=xxx — remove an assignment
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Assignment id is required");

    const existing = await db.shiftAssignment.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Assignment not found");

    await db.shiftAssignment.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
