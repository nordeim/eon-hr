import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CalendarClock, TrendingDown, TrendingUp, Users } from "lucide-react";
import {
  DepartmentDistributionBar,
  HeadcountTrendLine,
  PayrollTrendLine,
  type DeptCount,
  type HeadcountPoint,
  type PayrollPoint,
} from "./charts";
import { ScheduleReportButton } from "./schedule-report-button";

interface MonthBucket {
  key: string; // "2026-10"
  label: string; // "Oct"
  end: Date;
}

/** Last N months (including the current one), oldest first. */
function lastMonths(count: number): MonthBucket[] {
  const now = new Date();
  const out: MonthBucket[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    out.push({
      key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
      label: start.toLocaleString("en-US", { month: "short" }),
      end,
    });
  }
  return out;
}

function tenureMonths(startDate: Date | null): number | null {
  if (!startDate) return null;
  const now = new Date();
  const months =
    (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
  return Math.max(0, months);
}

export default async function AdvancedAnalyticsPage() {
  const months = lastMonths(6);

  const [employees, payrollRecords] = await Promise.all([
    db.employee.findMany({
      select: {
        employmentStatus: true,
        startDate: true,
        department: { select: { name: true } },
        leaveBalances: { select: { entitled: true, used: true } },
      },
    }),
    db.payrollRecord.findMany({
      select: { period: true, netSalary: true },
      where: { period: { in: months.map((m) => m.key) } },
    }),
  ]);

  const total = employees.length;
  const terminated = employees.filter((e) => e.employmentStatus === "terminated").length;
  const active = employees.filter((e) => e.employmentStatus === "active").length;
  const turnoverRate = total > 0 ? Math.round((terminated / total) * 100) : 0;

  const tenures = employees
    .map((e) => tenureMonths(e.startDate))
    .filter((t): t is number => t !== null);
  const avgTenure =
    tenures.length > 0
      ? Math.round((tenures.reduce((a, b) => a + b, 0) / tenures.length) * 10) / 10
      : 0;

  // AI attrition heuristic: on-leave staff or >50% leave-usage consumers.
  const atRisk = employees.filter(
    (e) =>
      e.employmentStatus === "on_leave" ||
      e.leaveBalances.some((b) => b.entitled > 0 && b.used / b.entitled > 0.5)
  ).length;

  const allBalances = employees.flatMap((e) => e.leaveBalances);
  const avgLeaveUsage =
    allBalances.length > 0
      ? Math.round((allBalances.reduce((a, b) => a + b.used, 0) / allBalances.length) * 10) / 10
      : 0;

  // ---- Charts ----
  const headcountTrend: HeadcountPoint[] = months.map((m) => ({
    month: m.label,
    headcount: employees.filter((e) => e.startDate && e.startDate <= m.end).length,
  }));

  const deptMap = new Map<string, number>();
  for (const e of employees) {
    const dept = e.department?.name;
    if (dept) deptMap.set(dept, (deptMap.get(dept) ?? 0) + 1);
  }
  const deptCounts: DeptCount[] = [...deptMap.entries()]
    .map(([name, count]) => ({ name, employees: count }))
    .sort((a, b) => b.employees - a.employees);

  const payrollTrend: PayrollPoint[] = months.map((m) => ({
    month: m.label,
    payroll: payrollRecords
      .filter((p) => p.period === m.key)
      .reduce((sum, p) => sum + p.netSalary, 0),
  }));
  const hasPayroll = payrollRecords.length > 0;

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Advanced Analytics"
        layout="flat36"
        actionsStart
        iconClassName="text-blue-600"
        sectionIcon={<TrendingUp aria-hidden="true" />}
        title="Analytics & Insights"
        subtitle="Comprehensive HR analytics and predictive insights"
        actions={<ScheduleReportButton />}
      />

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard label="Total Headcount" value={total} icon={<Users aria-hidden="true" />} />
        <StatCard
          label="Turnover Rate"
          value={`${turnoverRate}%`}
          icon={<TrendingDown aria-hidden="true" />}
        />
        <StatCard label="Avg Tenure" value={avgTenure} icon={<CalendarClock aria-hidden="true" />} />
        <StatCard label="At Risk" value={atRisk} icon={<AlertTriangle aria-hidden="true" />} />
      </div>

      {/* Session 12 (R11-U): the reference's 2×2 chart grid — charts
          render unconditionally (empty axes at zero data), and the
          Payroll Trend shares its row with Employee Engagement Insights. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          {/* Session 12 (R11-U): leading-none DIV title (65px) with a
              full p-6 content pad on this page. */}
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="font-semibold leading-none tracking-tight">Headcount Trend</div>
          </div>
          <CardContent className="p-6">
            <HeadcountTrendLine data={headcountTrend} />
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          {/* Session 12 (R11-U): leading-none DIV title (65px) with a
              full p-6 content pad on this page. */}
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="font-semibold leading-none tracking-tight">Department Distribution</div>
          </div>
          <CardContent className="p-6">
            <DepartmentDistributionBar data={deptCounts} />
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          {/* Session 12 (R11-U): leading-none DIV title (65px) with a
              full p-6 content pad on this page. */}
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="font-semibold leading-none tracking-tight">Payroll Trend (Last 6 Months)</div>
          </div>
          <CardContent className="p-6">
            <PayrollTrendLine data={payrollTrend} />
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          {/* Session 12 (R11-U): the reference's engagement card — border-b
              DIV-title header + p-6 > space-y-4: the orange At-Risk banner
              (p-4 bg-orange-50 rounded-lg border border-orange-200, P
              text-sm slate-600 mb-2 + P text-3xl orange-700) over the
              grid-cols-2 pair (p-3 blue-50 / green-50 tiles with text-xs
              labels + text-2xl colored values). */}
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-200">
            <div className="font-semibold leading-none tracking-tight">Employee Engagement Insights</div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-slate-600 mb-2">At Risk of Leaving (AI)</p>
                <p className="text-3xl font-bold text-orange-700">{atRisk}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-slate-600">Active Employees</p>
                  <p className="text-2xl font-bold text-blue-700">{active}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-slate-600">Avg Leave Usage</p>
                  <p className="text-2xl font-bold text-green-700">{avgLeaveUsage}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session 12 (R11-U): the reference's scheduled-reports card —
          border-b DIV-title header + p-6 > text-center py-8 with a 48px
          icon and a single P. */}
      <Card className="border-slate-200">
        <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-200">
          <div className="font-semibold leading-none tracking-tight">Scheduled Reports</div>
        </div>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <CalendarClock className="mx-auto mb-3 h-12 w-12 text-slate-300" aria-hidden="true" />
            <p className="text-slate-500">No scheduled reports</p>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
