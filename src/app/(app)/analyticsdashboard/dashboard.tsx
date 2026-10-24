"use client";

import * as React from "react";
import { Calendar, DollarSign, Download, FileText, Printer, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { useToast } from "@/components/ui/toast";
import { formatSar } from "@/lib/utils";
import {
  AttendanceVsLeaveBar,
  DistributionPie,
  ExpenseTrendLine,
  HiringTrendArea,
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

  function exportStatusCsv() {
    const rows: (string | number | null)[][] = [
      ["Status", "Employees"],
      ...data.statusSlices.map((s) => [s.name, s.value]),
    ];
    downloadCsv("employee-status.csv", rows);
    toast.toast({
      title: "Chart exported",
      description: "employee-status.csv downloaded.",
      variant: "success",
    });
  }

  const statusChipClassName = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("active")) return "bg-green-100 text-green-700";
    if (n.includes("leave")) return "bg-yellow-100 text-yellow-700";
    if (n.includes("suspend")) return "bg-orange-100 text-orange-700";
    if (n.includes("terminat")) return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    // Session 9 (R8-D): the page root this route was missing (session-6 S2
    // codemod miss) — reference: p-4 md:p-8 space-y-8 min-h-screen
    // bg-gradient-to-br from-slate-50 to-blue-50 (sRGB, trap 3).
    <div className="p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        rowBreakpoint="md"
        title="Analytics Dashboard"
        subtitle="Visual overview of key HR metrics and trends"
        /* Session 88 (R88-D): the REF's cluster is the UNWRAPPED
           `flex items-center gap-3` (live-measured, 3/3 reload-stable).
           flex-nowrap retires the default's flex-wrap (twMerge resolves
           the pair to the nowrap member) — reproducing the REF-authored
           mobile overflow chain: the cluster keeps its 456px natural
           width, the shell's overflow-auto root scrolls to 488, and the
           subtitle stays on ONE line (h=24) instead of wrapping. The
           desktop band is unchanged (the cluster fits any >=768 row). */
        actionsClassName="flex-nowrap"
        actions={
          <>
            <Select value={String(range)} onValueChange={(v) => setRange(Number(v))}>
              <SelectTrigger className="w-36" aria-label="Time range">
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
              <Download className="mr-2" aria-hidden="true" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2" aria-hidden="true" />
              Export PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard variant="compact" valueTag="p" labelTag="p" labelClassName="text-slate-600"
          label="Active Employees"
          value={stats.activeEmployees}
          hint={`${stats.totalEmployees} total`}
          icon={<Users className="w-5 h-5 text-blue-600" aria-hidden="true" />} tileClassName="bg-blue-100"
        />
        <StatCard variant="compact" valueTag="p" labelTag="p" labelClassName="text-slate-600"
          label="Total Payroll"
          value={formatSar(stats.payrollTotal)}
          hint={`${stats.payrollRecords} records`}
          icon={<DollarSign className="w-5 h-5 text-green-600" aria-hidden="true" />} tileClassName="bg-green-100"
        />
        <StatCard variant="compact" valueTag="p" labelTag="p" labelClassName="text-slate-600"
          label="Leave Requests"
          value={stats.leaveRequests}
          hint={`${stats.pendingRequests} pending`}
          icon={<Calendar className="w-5 h-5 text-yellow-600" aria-hidden="true" />}
          tileClassName="bg-yellow-100"
        />
        <StatCard variant="compact" valueTag="p" labelTag="p" labelClassName="text-slate-600"
          label="Total Expenses"
          value={formatSar(stats.expensesTotal)}
          hint={`${stats.expensesApproved} approved`}
          icon={<TrendingUp className="w-5 h-5 text-purple-600" aria-hidden="true" />}
          tileClassName="bg-purple-100"
        />
      </div>

      {/* Session 12 (R11-R): the reference's stacked chart layout —
          space-y-6: full-width area → grid md:grid-cols-2 gap-6 (bar +
          line) → grid md:grid-cols-3 gap-6 (pies) → the full-width
          Employee Status Breakdown chips card. Card headers are
          title-only (72px, flex flex-col space-y-1.5 p-6) with content
          p-6 pt-0. */}
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="font-semibold tracking-tight text-base">Hiring Trend — New Employees per Month</div>
          </div>
          <CardContent className="p-6 pt-0">
            <HiringTrendArea data={months} />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="font-semibold tracking-tight text-base">Attendance vs Leave Trend</div>
            </div>
            <CardContent className="p-6 pt-0">
              <AttendanceVsLeaveBar data={months} />
            </CardContent>
          </Card>

          <Card>
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="font-semibold tracking-tight text-base">Monthly Expense Trend (SAR)</div>
            </div>
            <CardContent className="p-6 pt-0">
              <ExpenseTrendLine data={months} />
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="font-semibold tracking-tight text-base">Employees by Department</div>
            </div>
            <CardContent className="p-6 pt-0">
              <DistributionPie data={data.departmentSlices} name="Employees" />
            </CardContent>
          </Card>

          <Card>
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="font-semibold tracking-tight text-base">Employment Types</div>
            </div>
            <CardContent className="p-6 pt-0">
              <DistributionPie data={data.employmentTypeSlices} name="Employees" />
            </CardContent>
          </Card>

          <Card>
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="font-semibold tracking-tight text-base">Leave Types Distribution</div>
            </div>
            <CardContent className="p-6 pt-0">
              <DistributionPie data={data.leaveTypeSlices} name="Requests" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center justify-between">
              <div className="font-semibold tracking-tight text-base">Employee Status Breakdown</div>
              <Button variant="outline" size="sm" onClick={exportStatusCsv}>
                <Download className="mr-1" aria-hidden="true" />
                Export
              </Button>
            </div>
          </div>
          <CardContent className="p-6 pt-0">
            {/* Reference chips: px-4 py-3 rounded-xl bg-{c}-100
                text-{c}-700 text-center min-w-[100px] with a text-2xl
                bold value and a text-xs capitalize label. */}
            <div className="flex flex-wrap gap-3">
              {data.statusSlices.map((s) => (
                <div key={s.name} className={`px-4 py-3 rounded-xl text-center min-w-[100px] ${statusChipClassName(s.name)}`}>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs capitalize">{s.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
