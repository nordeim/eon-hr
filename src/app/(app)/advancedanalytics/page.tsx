import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CalendarClock, HeartPulse, TrendingDown, TrendingUp, Users } from "lucide-react";
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
        iconClassName="text-blue-600"
        sectionIcon={<TrendingUp aria-hidden="true" />}
        title="Analytics & Insights"
        subtitle="Comprehensive HR analytics and predictive insights"
        actions={<ScheduleReportButton />}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Headcount" value={total} icon={<Users aria-hidden="true" />} />
        <StatCard
          label="Turnover Rate"
          value={`${turnoverRate}%`}
          icon={<TrendingDown aria-hidden="true" />}
        />
        <StatCard
          label="Avg Tenure"
          value={avgTenure}
          hint="months"
          icon={<CalendarClock aria-hidden="true" />}
        />
        <StatCard
          label="At Risk"
          value={atRisk}
          hint="AI Prediction"
          icon={<AlertTriangle aria-hidden="true" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Headcount Trend</CardTitle>
            <CardDescription>Cumulative headcount over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {total === 0 ? (
              <EmptyState title="No data yet" description="Add employees to see the headcount trend." />
            ) : (
              <HeadcountTrendLine data={headcountTrend} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Employees per department</CardDescription>
          </CardHeader>
          <CardContent>
            {deptCounts.length === 0 ? (
              <EmptyState title="No data yet" description="Assign departments to employees." />
            ) : (
              <DepartmentDistributionBar data={deptCounts} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Trend</CardTitle>
          <CardDescription>Net payroll totals over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          {hasPayroll ? (
            <PayrollTrendLine data={payrollTrend} />
          ) : (
            <EmptyState title="No data yet" description="Add payroll records to see the payroll trend." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee Engagement Insights</CardTitle>
          <CardDescription>Attrition signals and leave behaviour across the workforce</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border bg-secondary/30 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              <div>
                <dt className="text-sm text-muted-foreground">At Risk of Leaving (AI)</dt>
                <dd className="text-xl font-semibold text-foreground">{atRisk}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-secondary/30 p-4">
              <Users className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
              <div>
                <dt className="text-sm text-muted-foreground">Active Employees</dt>
                <dd className="text-xl font-semibold text-foreground">{active}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-secondary/30 p-4">
              <HeartPulse className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
              <div>
                <dt className="text-sm text-muted-foreground">Avg Leave Usage</dt>
                <dd className="text-xl font-semibold text-foreground">{avgLeaveUsage}</dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>Automated report deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<CalendarClock className="h-6 w-6" aria-hidden="true" />}
            title="No scheduled reports"
            description="Schedule a recurring report to keep stakeholders in the loop."
          />
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
