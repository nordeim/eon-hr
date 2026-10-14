import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, zodErr } from "@/lib/api";

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

/* Session 36 (R35-F6): REF's Add Shift dialog fields (live-measured on
   the reference: Shift Name / Code "e.g., M, E, N" / Start Time / End
   Time / Break minutes / Tolerance minutes "0" / Status). The clone's
   Shift model gained the three nullable columns; creation is
   discriminated from calendar assignment by the payload shape — the
   existing shiftcalendar POST (employeeId+shiftId+date) is unchanged. */
const ShiftInput = z.object({
  name: z.string().trim().min(1, "Shift name is required").max(60),
  code: z.string().trim().max(8).optional(),
  startTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "Start time must be HH:MM"),
  endTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "End time must be HH:MM"),
  breakMinutes: z.number().int().min(0).max(480).optional(),
  toleranceMinutes: z.number().int().min(0).max(240).optional(),
  active: z.boolean().default(true),
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

// POST /api/shifts — assign a shift to an employee on a date, or create a
// shift definition (shape-discriminated; see ShiftInput above)
export async function POST(req: NextRequest) {
  return guard<{ assignment: { id: string } } | { shift: { id: string; name: string } }>(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    /* Session 36 (R35-F6): shape discrimination — a payload carrying
       employeeId is a calendar assignment (the shiftcalendar consumer);
       anything else parses as a shift definition from the Settings →
       Shifts tab's Add Shift dialog. The body is read ONCE (a fetch
       Request's stream is single-use — a second req.json() throws). */
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return err("VALIDATION", "Invalid JSON body");
    }
    const shape =
      raw && typeof raw === "object" && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : null;

    if (shape && typeof shape.employeeId === "string") {
      const parsed = AssignInput.safeParse(raw);
      if (!parsed.success) return zodErr(parsed.error);
      const data = parsed.data;

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
    }

    const parsed = ShiftInput.safeParse(raw);
    if (!parsed.success) return zodErr(parsed.error);
    const data = parsed.data;

    const end = data.endTime === "00:00" ? "24:00" : data.endTime;
    if (end <= data.startTime) return err("VALIDATION", "End time must be after start time");

    const createShift = await db.shift.create({
      data: {
        name: data.name,
        code: data.code || null,
        startTime: data.startTime,
        endTime: data.endTime,
        breakMinutes: data.breakMinutes ?? null,
        toleranceMinutes: data.toleranceMinutes ?? null,
        active: data.active,
      },
      select: { id: true, name: true },
    });
    return ok({ shift: createShift });
  });
}

// DELETE /api/shifts?id=xxx — remove an assignment
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    /* Session 36 (R35-F6): ?shiftId= removes a shift DEFINITION (the
       Settings → Shifts tab's cleanup path — assignments cascade);
       ?id= keeps its assignment semantics for the shift calendar. */
    const shiftId = req.nextUrl.searchParams.get("shiftId");
    if (shiftId) {
      const existingShift = await db.shift.findUnique({ where: { id: shiftId }, select: { id: true } });
      if (!existingShift) return err("NOT_FOUND", "Shift not found");
      await db.shift.delete({ where: { id: shiftId } });
      return ok({ deleted: true });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Assignment id is required");

    const existing = await db.shiftAssignment.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Assignment not found");

    await db.shiftAssignment.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
