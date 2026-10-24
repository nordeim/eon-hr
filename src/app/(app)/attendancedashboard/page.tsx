import { db } from "@/lib/db";
import {
  AttendanceDashboard,
  type AttendanceDashboardData,
  type AttendanceEmployee,
  type AttendanceRecordRow,
  type DepartmentOption,
} from "./dashboard";

/* Session 88 (R88-B1): the month picker's functional superset — the
 * selected month rides the ?month= query param (YYYY-MM), the default
 * being the current month. Validated: a well-formed YYYY-MM with a
 * real month index, else the current month (no throw on garbage). */
function parseMonthParam(raw: string | undefined): { year: number; month: number } {
  const now = new Date();
  const m = /^([0-9]{4})-(0[1-9]|1[0-2])$/.exec(raw ?? "");
  if (!m) return { year: now.getFullYear(), month: now.getMonth() };
  return { year: Number(m[1]), month: Number(m[2]) - 1 };
}

export default async function AttendanceDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const sp = await searchParams; // the Next 16 contract (always awaited)
  const { year, month } = parseMonthParam(sp?.month);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const monthDate = new Date(year, month, 1);
  const monthTitle = `${monthDate.toLocaleString("en-US", { month: "long" })} ${year}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthValue = `${year}-${String(month + 1).padStart(2, "0")}`;

  const [departments, employees, records] = await Promise.all([
    db.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        departmentId: true,
        department: { select: { name: true } },
      },
      orderBy: { firstName: "asc" },
    }),
    db.attendanceRecord.findMany({
      where: { date: { gte: monthStart, lte: monthEnd } },
      select: { employeeId: true, date: true, status: true, checkIn: true },
    }),
  ]);

  const data: AttendanceDashboardData = {
    departments: departments.map((d): DepartmentOption => ({ id: d.id, name: d.name })),
    employees: employees.map(
      (e): AttendanceEmployee => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`.trim(),
        departmentId: e.departmentId,
        department: e.department?.name ?? null,
      })
    ),
    records: records.map(
      (r): AttendanceRecordRow => ({
        employeeId: r.employeeId,
        date: r.date.toISOString(),
        status: r.status,
        checkIn: r.checkIn ? r.checkIn.toISOString() : null,
      })
    ),
    monthTitle,
    daysInMonth,
    monthValue,
  };

  return <AttendanceDashboard data={data} />;
}
