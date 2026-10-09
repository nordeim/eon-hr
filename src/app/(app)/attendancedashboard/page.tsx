import { db } from "@/lib/db";
import {
  AttendanceDashboard,
  type AttendanceDashboardData,
  type AttendanceEmployee,
  type AttendanceRecordRow,
  type DepartmentOption,
} from "./dashboard";

export default async function AttendanceDashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const monthTitle = `${now.toLocaleString("en-US", { month: "long" })} ${now.getFullYear()}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

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
  };

  return <AttendanceDashboard data={data} />;
}
