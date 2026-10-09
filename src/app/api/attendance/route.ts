import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// /api/attendance — Staff Attendance module.
// GET  → employees, recent records, today's stats, per-employee summary and a
//        canMark flag (admin | hr | security only).
// POST → mark attendance (same roles). One record per employee per day
//        (unique [employeeId, date]) — conflicts return CONFLICT.

const ATTENDANCE_STATUSES = ["present", "absent", "late", "leave"] as const;

const MarkInput = z.object({
  employeeId: z.string().trim().min(1, "Employee is required"),
  date: z.string().trim().min(1, "Date is required"),
  status: z.enum(ATTENDANCE_STATUSES),
  checkIn: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Check-in must be HH:MM")
    .optional()
    .or(z.literal("")),
  checkOut: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Check-out must be HH:MM")
    .optional()
    .or(z.literal("")),
});

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtTime(d: Date | null): string | null {
  if (!d) return null;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const EMPLOYEE_SELECT = {
  id: true,
  employeeId: true,
  firstName: true,
  lastName: true,
  email: true,
} as const;

function fullName(e: { firstName: string; lastName: string }): string {
  return `${e.firstName} ${e.lastName}`.trim();
}

// GET /api/attendance
export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const [employees, records] = await Promise.all([
      db.employee.findMany({ select: EMPLOYEE_SELECT, orderBy: { firstName: "asc" } }),
      db.attendanceRecord.findMany({
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 1000,
        select: {
          id: true,
          employeeId: true,
          date: true,
          checkIn: true,
          checkOut: true,
          status: true,
          minutesLate: true,
          employee: { select: { firstName: true, lastName: true, employeeId: true } },
        },
      }),
    ]);

    const today = dateKey(new Date());
    const todayRecords = records.filter((r) => dateKey(new Date(r.date)) === today);
    const present = todayRecords.filter((r) => r.status === "present").length;
    const absent = todayRecords.filter((r) => r.status === "absent").length;
    const late = todayRecords.filter((r) => r.status === "late").length;
    const onLeave = todayRecords.filter((r) => r.status === "leave").length;
    const total = employees.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    const stats = {
      totalEmployees: total,
      presentToday: present,
      absentToday: absent,
      lateArrivals: late,
      onLeaveToday: onLeave,
      attendanceRate: rate,
    };

    const summaryMap = new Map<
      string,
      { employeeId: string; name: string; code: string; present: number; absent: number; late: number; leave: number; days: number }
    >();
    for (const r of records) {
      const key = r.employeeId;
      let row = summaryMap.get(key);
      if (!row) {
        row = {
          employeeId: r.employeeId,
          name: fullName(r.employee),
          code: r.employee.employeeId,
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
          days: 0,
        };
        summaryMap.set(key, row);
      }
      row.days += 1;
      if (r.status === "present") row.present += 1;
      else if (r.status === "absent") row.absent += 1;
      else if (r.status === "late") row.late += 1;
      else if (r.status === "leave") row.leave += 1;
    }
    const summary = Array.from(summaryMap.values())
      .map((row) => ({
        ...row,
        rate: row.days > 0 ? Math.round(((row.present + row.late) / row.days) * 100) : 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const items = records.map((r) => ({
      id: r.id,
      employeeId: r.employeeId,
      employeeName: fullName(r.employee),
      employeeCode: r.employee.employeeId,
      dateKey: dateKey(new Date(r.date)),
      checkInTime: fmtTime(r.checkIn),
      checkOutTime: fmtTime(r.checkOut),
      status: r.status,
      minutesLate: r.minutesLate,
    }));

    return ok({
      employees: employees.map((e) => ({ id: e.id, name: fullName(e), code: e.employeeId, email: e.email })),
      records: items,
      stats,
      summary,
      canMark: ["admin", "hr", "security"].includes(user.role),
      today,
    });
  });
}

// POST /api/attendance — mark one employee for one day
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr", "security"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, MarkInput);
    if (!data) return bad;

    const employee = await db.employee.findUnique({ where: { id: data.employeeId }, select: { id: true } });
    if (!employee) return err("NOT_FOUND", "Employee not found");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      return err("VALIDATION", "Date must be YYYY-MM-DD");
    }

    const day = new Date(`${data.date}T00:00:00`);
    if (Number.isNaN(day.getTime())) return err("VALIDATION", "Enter a valid date");

    const existing = await db.attendanceRecord.findFirst({
      where: { employeeId: data.employeeId, date: day },
      select: { id: true },
    });
    if (existing) {
      return err("CONFLICT", "Attendance is already marked for this employee on this date");
    }

    const checkIn = data.checkIn ? new Date(`${data.date}T${data.checkIn}:00`) : null;
    const checkOut = data.checkOut ? new Date(`${data.date}T${data.checkOut}:00`) : null;

    let minutesLate = 0;
    if (data.status === "late" && data.checkIn) {
      const [h, m] = data.checkIn.split(":").map(Number);
      minutesLate = Math.max(0, h * 60 + m - 9 * 60); // standard start 09:00
    }

    const record = await db.attendanceRecord.create({
      data: {
        employeeId: data.employeeId,
        date: day,
        checkIn,
        checkOut,
        status: data.status,
        minutesLate,
      },
      select: { id: true },
    });
    return ok({ record });
  });
}
