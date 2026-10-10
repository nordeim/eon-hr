"use client";

import * as React from "react";
import { Download, FileText, Printer, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatSar } from "@/lib/utils";
import {
  AttendanceVsLeaveLine,
  DistributionPie,
  ExpenseTrendArea,
  HiringTrendBar,
  type MonthPoint,
  type Slice,
} from "./charts";

export interface EmployeeCsvRow {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string | null;
  department: string | null;
  employmentStatus: string;
  employmentType: string;
  startDate: string | null;
  baseSalary: number;
}

export interface DashboardStats {
  activeEmployees: number;
  totalEmployees: number;
  payrollTotal: number;
  payrollRecords: number;
  leaveRequests: number;
  pendingRequests: number;
  expensesTotal: number;
  expensesApproved: number;
}

export interface AnalyticsDashboardData {
  employees: EmployeeCsvRow[];
  months: MonthPoint[]; // 12 months, oldest first
  hasAttendance: boolean;
  hasExpenses: boolean;
  stats: DashboardStats;
  departmentSlices: Slice[];
  employmentTypeSlices: Slice[];
  leaveTypeSlices: Slice[];
  statusSlices: Slice[];
}

const RANGE_OPTIONS = [3, 6, 12];

function escapeCsv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function downloadCsv(filename: string, rows: (string | number | null)[][]): void {
  const csv = rows.map((row) => row.map((cell) => escapeCsv(String(cell ?? ""))).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Small export button pinned to a chart card header. */
function ChartExportButton({
  filename,
  rows,
  toast,
}: {
  filename: string;
  rows: (string | number | null)[][];
  toast: ReturnType<typeof useToast>["toast"];
}) {
  return (
    <Button
      variant="outline"
      size="iconSm"
      aria-label={`Export ${filename}`}
      onClick={() => {
        downloadCsv(filename, rows);
        toast({ title: "Chart exported", description: `${filename} downloaded.`, variant: "success" });
      }}
    >
      <Download aria-hidden="true" />
    </Button>
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsDashboardData }) {
  const toast = useToast();
  const [range, setRange] = React.useState(6);
  const months = data.months.slice(-range);
  const { stats } = data;

  function exportEmployeesCsv() {
    const rows: (string | number | null)[][] = [
      ["Employee ID", "Full Name", "Email", "Job Title", "Department", "Employment Status", "Employment Type", "Start Date", "Base Salary"],
      ...data.employees.map((e) => [
        e.employeeId,
        `${e.firstName} ${e.lastName}`.trim(),
        e.email,
        e.jobTitle,
        e.department,
        e.employmentStatus,
        e.employmentType,
        e.startDate ? e.startDate.slice(0, 10) : null,
        (e.baseSalary / 100).toFixed(2),
      ]),
    ];
    downloadCsv("employees.csv", rows);
    toast.toast({
      title: "Export ready",
      description: `${data.employees.length} employees exported to CSV.`,
      variant: "success",
    });
  }

  const trendRows = (headers: string[], pick: (m: MonthPoint) => (string | number)[]) =>
    months.map((m) => [m.label, ...pick(m)]);

  return (
    // Session 9 (R8-D): the page root this route was missing (session-6 S2
    // codemod miss) — reference: p-4 md:p-8 space-y-8 min-h-screen
    // bg-gradient-to-br from-slate-50 to-blue-50 (sRGB, trap 3).
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Visual overview of key HR metrics and trends"
        actions={
          <>
            <Select value={String(range)} onValueChange={(v) => setRange(Number(v))}>
              <SelectTrigger className="w-[150px]" aria-label="Time range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    Last {r} months
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportEmployeesCsv}>
              <Download aria-hidden="true" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer aria-hidden="true" />
              Export PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard variant="compact"
          label="Active Employees"
          value={stats.activeEmployees}
          hint={`${stats.totalEmployees} total`}
          icon={<Users aria-hidden="true" />}
        />
        <StatCard variant="compact"
          label="Total Payroll"
          value={formatSar(stats.payrollTotal)}
          hint={`${stats.payrollRecords} records`}
          icon={<FileText aria-hidden="true" />}
        />
        <StatCard variant="compact"
          label="Leave Requests"
          value={stats.leaveRequests}
          hint={`${stats.pendingRequests} pending`}
        />
        <StatCard variant="compact"
          label="Total Expenses"
          value={formatSar(stats.expensesTotal)}
          hint={`${stats.expensesApproved} approved`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Hiring Trend</CardTitle>
              <CardDescription>New employees per month</CardDescription>
            </div>
            <ChartExportButton
              filename="hiring-trend.csv"
              toast={toast.toast}
              rows={[["Month", "New Employees"], ...trendRows(["New Employees"], (m) => [m.hires])]}
            />
          </CardHeader>
          <CardContent>
            {stats.totalEmployees === 0 ? (
              <EmptyState title="No data yet" description="Hires appear once employees have start dates." />
            ) : (
              <HiringTrendBar data={months} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Attendance vs Leave Trend</CardTitle>
              <CardDescription>Monthly attendance and leave days</CardDescription>
            </div>
            <ChartExportButton
              filename="attendance-leave-trend.csv"
              toast={toast.toast}
              rows={[
                ["Month", "Attendance", "Leave"],
                ...trendRows(["Attendance", "Leave"], (m) => [m.attendance, m.leave]),
              ]}
            />
          </CardHeader>
          <CardContent>
            {data.hasAttendance ? (
              <AttendanceVsLeaveLine data={months} />
            ) : (
              <EmptyState title="No data yet" description="Attendance records feed this chart." />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Monthly Expense Trend</CardTitle>
            <CardDescription>Approved expense claims per month (SAR)</CardDescription>
          </div>
          <ChartExportButton
            filename="monthly-expenses.csv"
            toast={toast.toast}
            rows={[
              ["Month", "Expenses (SAR)"],
              ...trendRows(["Expenses (SAR)"], (m) => [(m.expenses / 100).toFixed(2)]),
            ]}
          />
        </CardHeader>
        <CardContent>
          {data.hasExpenses ? (
            <ExpenseTrendArea data={months} />
          ) : (
            <EmptyState title="No data yet" description="Approved expense claims feed this chart." />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Employees by Department</CardTitle>
              <CardDescription>Headcount per department</CardDescription>
            </div>
            <ChartExportButton
              filename="employees-by-department.csv"
              toast={toast.toast}
              rows={[["Department", "Employees"], ...data.departmentSlices.map((s) => [s.name, s.value])]}
            />
          </CardHeader>
          <CardContent>
            {data.departmentSlices.length === 0 ? (
              <EmptyState title="No data yet" description="Assign employees to departments." />
            ) : (
              <DistributionPie data={data.departmentSlices} name="Employees" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Employment Types</CardTitle>
              <CardDescription>Full-time, part-time, contract and interns</CardDescription>
            </div>
            <ChartExportButton
              filename="employment-types.csv"
              toast={toast.toast}
              rows={[["Employment Type", "Employees"], ...data.employmentTypeSlices.map((s) => [s.name, s.value])]}
            />
          </CardHeader>
          <CardContent>
            {data.employmentTypeSlices.length === 0 ? (
              <EmptyState title="No data yet" description="Employment types appear with employee records." />
            ) : (
              <DistributionPie data={data.employmentTypeSlices} name="Employees" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Leave Types Distribution</CardTitle>
              <CardDescription>Leave requests by leave type</CardDescription>
            </div>
            <ChartExportButton
              filename="leave-types.csv"
              toast={toast.toast}
              rows={[["Leave Type", "Requests"], ...data.leaveTypeSlices.map((s) => [s.name, s.value])]}
            />
          </CardHeader>
          <CardContent>
            {data.leaveTypeSlices.length === 0 ? (
              <EmptyState title="No data yet" description="Leave requests feed this chart." />
            ) : (
              <DistributionPie data={data.leaveTypeSlices} name="Requests" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Employee Status Breakdown</CardTitle>
              <CardDescription>Active, on leave, suspended and terminated</CardDescription>
            </div>
            <ChartExportButton
              filename="employee-status.csv"
              toast={toast.toast}
              rows={[["Status", "Employees"], ...data.statusSlices.map((s) => [s.name, s.value])]}
            />
          </CardHeader>
          <CardContent>
            {data.statusSlices.length === 0 ? (
              <EmptyState title="No data yet" description="Employee statuses feed this chart." />
            ) : (
              <DistributionPie data={data.statusSlices} name="Employees" />
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
