import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CircleCheckBig, CircleCheckBig as CheckCircle2, Clock, ClipboardList, ListChecks, Users } from "lucide-react";
import { DepartmentCompletionBar, type DeptCompletion, type StatusSlice, EmployeeStatusPie } from "./charts";
import { daysBetween } from "@/lib/utils";

interface TaskItem {
  title?: string;
  done?: boolean;
}

/** Parse the JSON `tasks` column defensively (never trust the shape). */
function parseTasks(raw: string | null | undefined): TaskItem[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is TaskItem => typeof t === "object" && t !== null);
  } catch {
    return [];
  }
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  on_leave: "On Leave",
  suspended: "Suspended",
  terminated: "Terminated",
};
const STATUS_COLORS: Record<string, string> = {
  active: "#2563eb",
  on_leave: "#f59e0b",
  suspended: "#ef4444",
  terminated: "#6b7280",
};

export default async function AnalyticsPage() {
  const [employeeCount, templateCount, statusGroups, processes, templates] = await Promise.all([
    db.employee.count(),
    db.onboardingTemplate.count(),
    db.employee.groupBy({ by: ["employmentStatus"], _count: { _all: true } }),
    db.onboardingProcess.findMany({
      select: {
        status: true,
        startedAt: true,
        completedAt: true,
        tasks: true,
        employee: { select: { department: { select: { name: true } } } },
      },
    }),
    db.onboardingTemplate.findMany({ select: { tasks: true } }),
  ]);

  // ---- Task completion aggregates (onboarding processes + template tasks) ----
  let tasksDone = 0;
  let tasksTotal = 0;
  const deptStats = new Map<string, { done: number; total: number }>();
  const completionDurations: number[] = [];

  for (const proc of processes) {
    const items = parseTasks(proc.tasks);
    const doneCount = items.filter((i) => i.done === true).length;
    tasksTotal += items.length;
    tasksDone += doneCount;
    const deptName = proc.employee.department?.name;
    if (deptName) {
      const agg = deptStats.get(deptName) ?? { done: 0, total: 0 };
      agg.total += items.length;
      agg.done += doneCount;
      deptStats.set(deptName, agg);
    }
    if (proc.status === "completed" && proc.completedAt) {
      completionDurations.push(daysBetween(proc.startedAt, proc.completedAt));
    }
  }
  for (const tpl of templates) {
    tasksTotal += parseTasks(tpl.tasks).length;
  }

  const activeOnboarding = processes.filter((p) => p.status === "in_progress").length;
  const completedOnboardings = processes.filter((p) => p.status === "completed").length;
  const avgCompletionDays =
    completionDurations.length > 0
      ? Math.round(completionDurations.reduce((a, b) => a + b, 0) / completionDurations.length)
      : 0;
  const taskCompletionPct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  // ---- Chart data (plain, serializable) ----
  const statusSlices: StatusSlice[] = statusGroups
    .filter((g) => g._count._all > 0)
    .map((g) => ({
      name: STATUS_LABELS[g.employmentStatus] ?? g.employmentStatus,
      value: g._count._all,
      color: STATUS_COLORS[g.employmentStatus] ?? "#94a3b8",
    }));

  const deptCompletion: DeptCompletion[] = [...deptStats.entries()]
    .filter(([, v]) => v.total > 0)
    .map(([name, v]) => ({
      name,
      completion: Math.round((v.done / v.total) * 100),
    }))
    .sort((a, b) => b.completion - a.completion);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Track your onboarding performance and metrics"
      />

      {/* Reference top row (session-4 live measurement): FOUR stat cards with
          48px colored icon tiles (rounded-xl) — blue/purple/green/orange
          100 backgrounds, 24px -600 icons, 30px values, 14px/400 labels.
          The templates count is card 1's hint in the reference. */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={employeeCount}
          hint={`${templateCount} templates`}
          icon={<Users aria-hidden="true" />}
          iconClassName="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 [&_svg]:h-6 [&_svg]:w-6"
          valueClassName="text-3xl"
        />
        <StatCard
          label="Avg. Completion"
          value={avgCompletionDays}
          hint="days"
          icon={<Calendar aria-hidden="true" />}
          iconClassName="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 [&_svg]:h-6 [&_svg]:w-6"
          valueClassName="text-3xl"
        />
        <StatCard
          label="Task Completion"
          value={`${taskCompletionPct}%`}
          hint={`${tasksDone} / ${tasksTotal}`}
          icon={<CircleCheckBig aria-hidden="true" />}
          iconClassName="h-12 w-12 rounded-xl bg-green-100 text-green-600 [&_svg]:h-6 [&_svg]:w-6"
          valueClassName="text-3xl"
        />
        <StatCard
          label="Active Onboarding"
          value={activeOnboarding}
          hint="in progress"
          icon={<Clock aria-hidden="true" />}
          iconClassName="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 [&_svg]:h-6 [&_svg]:w-6"
          valueClassName="text-3xl"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employee Status Distribution</CardTitle>
            <CardDescription>Active vs. on-leave, suspended and terminated staff</CardDescription>
          </CardHeader>
          <CardContent>
            {statusSlices.length === 0 ? (
              <EmptyState title="No data yet" description="Add employees to see the status split." />
            ) : (
              <EmployeeStatusPie data={statusSlices} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Task Completion</CardTitle>
            <CardDescription>Onboarding task completion rate per department</CardDescription>
          </CardHeader>
          <CardContent>
            {deptCompletion.length === 0 ? (
              <EmptyState
                title="No data yet"
                description="Start onboarding processes to track task completion."
              />
            ) : (
              <DepartmentCompletionBar data={deptCompletion} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Onboarding Summary</CardTitle>
          <CardDescription>Overall onboarding activity across templates and processes</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border bg-secondary/30 p-4">
              <ListChecks className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
              <div>
                <dt className="text-sm text-muted-foreground">Total Tasks Created</dt>
                <dd className="text-xl font-semibold text-foreground">{tasksTotal}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-secondary/30 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
              <div>
                <dt className="text-sm text-muted-foreground">Completed Onboardings</dt>
                <dd className="text-xl font-semibold text-foreground">{completedOnboardings}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-secondary/30 p-4">
              <ClipboardList className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
              <div>
                <dt className="text-sm text-muted-foreground">Templates Created</dt>
                <dd className="text-xl font-semibold text-foreground">{templateCount}</dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
