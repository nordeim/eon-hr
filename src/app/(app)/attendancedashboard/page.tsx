import { db } from "@/lib/db";
import {
  AttendanceDashboard,
  type AttendanceDashboardData,
  type AttendanceEmployee,
  type AttendanceRecordRow,
  type DepartmentOption,
} from "./dashboard";

export default async function AttendanceDashboardPage({
  /* Session 88 (R88-E): the REF renders a month filter input as the
   * first header action (live-measured: type=month, w=160, the standard
   * Input classes, the current-month default). This wires it
   * functionally — the SUPERSET: ?month=YYYY-MM reloads the window,
   * title, and day count for the selected month (validated; invalid or
   * missing falls back to the current month). */
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawMonth = typeof params.month === "string" ? params.month : "";
  const monthMatch = rawMonth.match(/^(\d{4})-(\d{2})$/);
  const now = new Date();
  const year = monthMatch ? Number(monthMatch[1]) : now.getFullYear();
  // month is 1-based in the input value; Date takes 0-based.
  const monthIndex = monthMatch ? Number(monthMatch[2]) - 1 : now.getMonth();
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  const monthTitle = `${new Date(year, monthIndex, 1).toLocaleString("en-US", { month: "long" })} ${year}`;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const monthValue = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

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
