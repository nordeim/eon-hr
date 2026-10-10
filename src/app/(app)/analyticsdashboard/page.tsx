import { db } from "@/lib/db";
import { AnalyticsDashboard, type AnalyticsDashboardData, type EmployeeCsvRow } from "./dashboard";
import type { MonthPoint, Slice } from "./charts";

interface MonthBucket {
  start: Date;
  end: Date;
  label: string; // "May 26"
}

/** Last N months (including the current one), oldest first. */
function lastMonths(count: number): MonthBucket[] {
  const now = new Date();
  const out: MonthBucket[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const label = `${start.toLocaleString("en-US", { month: "short" })} ${String(start.getFullYear()).slice(2)}`;
    out.push({ start, end, label });
  }
  return out;
}

function inMonth(date: Date | null | undefined, month: MonthBucket): boolean {
  if (!date) return false;
  return date >= month.start && date <= month.end;
}

function labelize(v: string): string {
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function toSlices(groups: Map<string, number>): Slice[] {
  return [...groups.entries()]
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export default async function AnalyticsDashboardPage() {
  const months = lastMonths(12);

  const [employees, attendance, payroll, leaveRequests, expenses] = await Promise.all([
    db.employee.findMany({
      select: {
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        jobTitle: true,
        employmentStatus: true,
        employmentType: true,
        startDate: true,
        baseSalary: true,
        department: { select: { name: true } },
      },
    }),
    db.attendanceRecord.findMany({ select: { date: true, status: true } }),
    db.payrollRecord.findMany({ select: { netSalary: true } }),
    db.leaveRequest.findMany({
      select: { status: true, leaveType: { select: { name: true } } },
    }),
    db.expenseClaim.findMany({ select: { date: true, amount: true, status: true } }),
  ]);

  const monthPoints: MonthPoint[] = months.map((month) => ({
    label: month.label,
    hires: employees.filter((e) => inMonth(e.startDate, month)).length,
    attendance: attendance.filter(
      (a) => inMonth(a.date, month) && (a.status === "present" || a.status === "late")
    ).length,
    leave: attendance.filter((a) => inMonth(a.date, month) && a.status === "leave").length,
    expenses: expenses
      .filter((c) => inMonth(c.date, month) && (c.status === "approved" || c.status === "reimbursed"))
      .reduce((sum, c) => sum + c.amount, 0),
  }));

  const hasAttendance = attendance.length > 0;
  const approvedExpenses = expenses.filter(
    (c) => c.status === "approved" || c.status === "reimbursed"
  );

  const departmentGroups = new Map<string, number>();
  const typeGroups = new Map<string, number>();
  const statusGroups = new Map<string, number>();
  for (const e of employees) {
    if (e.department) {
      departmentGroups.set(e.department.name, (departmentGroups.get(e.department.name) ?? 0) + 1);
    }
    typeGroups.set(labelize(e.employmentType), (typeGroups.get(labelize(e.employmentType)) ?? 0) + 1);
    statusGroups.set(labelize(e.employmentStatus), (statusGroups.get(labelize(e.employmentStatus)) ?? 0) + 1);
  }

  const leaveTypeGroups = new Map<string, number>();
  for (const req of leaveRequests) {
    const name = req.leaveType.name;
    leaveTypeGroups.set(name, (leaveTypeGroups.get(name) ?? 0) + 1);
  }

  // Session 12 (R11-R): the reference's status chips render ALL five
  // statuses (lowercase labels + the capitalize class) even at zero —
  // active / on leave / suspended / terminated / resigned.
  const STATUS_ORDER = ["active", "on leave", "suspended", "terminated", "resigned"] as const;
  const statusCounts = new Map<string, number>(STATUS_ORDER.map((s) => [s, 0]));
  for (const e of employees) {
    const key = e.employmentStatus === "on_leave" ? "on leave" : e.employmentStatus;
    if (statusCounts.has(key)) statusCounts.set(key, (statusCounts.get(key) ?? 0) + 1);
  }
  const statusSlicesAll: Slice[] = STATUS_ORDER.map((name) => ({ name, value: statusCounts.get(name) ?? 0 }));

  const employeeRows: EmployeeCsvRow[] = employees.map((e) => ({
    employeeId: e.employeeId,
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email,
    jobTitle: e.jobTitle,
    department: e.department?.name ?? null,
    employmentStatus: e.employmentStatus,
    employmentType: e.employmentType,
    startDate: e.startDate ? e.startDate.toISOString() : null,
    baseSalary: e.baseSalary,
  }));

  const data: AnalyticsDashboardData = {
    employees: employeeRows,
    months: monthPoints,
    hasAttendance,
    hasExpenses: approvedExpenses.length > 0,
    stats: {
      activeEmployees: employees.filter((e) => e.employmentStatus === "active").length,
      totalEmployees: employees.length,
      payrollTotal: payroll.reduce((sum, p) => sum + p.netSalary, 0),
      payrollRecords: payroll.length,
      leaveRequests: leaveRequests.length,
      pendingRequests: leaveRequests.filter((r) => r.status === "pending").length,
      expensesTotal: approvedExpenses.reduce((sum, c) => sum + c.amount, 0),
      expensesApproved: approvedExpenses.length,
    },
    departmentSlices: toSlices(departmentGroups),
    employmentTypeSlices: toSlices(typeGroups),
    leaveTypeSlices: toSlices(leaveTypeGroups),
    statusSlices: statusSlicesAll,
  };

  return <AnalyticsDashboard data={data} />;
}
