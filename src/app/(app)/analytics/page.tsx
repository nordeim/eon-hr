import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, CircleCheckBig, Clock, Users } from "lucide-react";
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
    <div className="p-4 md:p-8">
      {/* Session 49 (R48-C8): REF's verbatim content wrapper — `max-w-7xl
       *  mx-auto space-y-8` directly under the BARE root (a plain p-4
       *  md:p-8 padding wrapper — the gradient + the full-height canvas
       *  are gone — live-measured @1440×900 this round). Replaces the
       *  trap-4 mitigation wrapper (flex-col gap-8); trap audit clean —
       *  no authored mt/mb on the direct children, no hidden first
       *  sibling (the bare hero block is the first child). */}
      <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        /* Session 49 (R48-A2): the bare family — REF renders the hero
         *  block as a DIRECT child of the content wrapper (no hero row).
         *  Live-measured @1440×900 this round. */
        bare
        title="Analytics Dashboard"
        size="lg"
        subtitle="Track your onboarding performance and metrics"
      />

      {/* Session 13 (R12-E): the reference's stat row — STACKED tiles
          (label on top, 30px value mt-2, text-xs hint mt-2, 48×48 tile
          top-right; 138px cards), `grid md:grid-cols-4 gap-6`. */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard variant="tile-right" labelTag="p"
          label="Total Employees"
          value={employeeCount}
          hint={`${templateCount} templates`}
          icon={<Users className="w-6 h-6 text-blue-600" aria-hidden="true" />} tileClassName="bg-blue-100"
          iconClassName="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 [&_svg]:h-6 [&_svg]:w-6"
          valueClassName="text-3xl"
        />
        <StatCard variant="tile-right" labelTag="p"
          label="Avg. Completion"
          value={avgCompletionDays}
          hint="days"
          icon={<Calendar className="w-6 h-6 text-purple-600" aria-hidden="true" />} tileClassName="bg-purple-100"
          iconClassName="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 [&_svg]:h-6 [&_svg]:w-6"
          valueClassName="text-3xl"
        />
        <StatCard variant="tile-right" labelTag="p"
          label="Task Completion"
          value={`${taskCompletionPct}%`}
          hint={`${tasksDone} / ${tasksTotal}`}
          icon={<CircleCheckBig className="w-6 h-6 text-green-600" aria-hidden="true" />} tileClassName="bg-green-100"
          iconClassName="h-12 w-12 rounded-xl bg-green-100 text-green-600 [&_svg]:h-6 [&_svg]:w-6"
          valueClassName="text-3xl"
        />
        <StatCard variant="tile-right" labelTag="p"
          label="Active Onboarding"
          value={activeOnboarding}
          hint="in progress"
          icon={<Clock className="w-6 h-6 text-orange-600" aria-hidden="true" />} tileClassName="bg-orange-100"
          iconClassName="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 [&_svg]:h-6 [&_svg]:w-6"
          valueClassName="text-3xl"
        />
      </div>

      {/* Session 13 (R12-E): the reference's chart row — `grid
          lg:grid-cols-2 gap-6` (548px tiles); cards carry border-b
          headers with leading-none DIV titles (no descriptions) and
          render the charts UNCONDITIONALLY (zero-data included). */}
      {/* Session 62 (R62-D2): the three chart cards + border-slate-200 —
          REF's cards stay LIGHT-bordered in dark (the unflipping pair,
          r62 census). */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="p-6 border-b border-slate-200">
            <div className="font-semibold leading-none tracking-tight">Employee Status Distribution</div>
          </CardHeader>
          <CardContent className="p-6">
            <EmployeeStatusPie data={statusSlices} />
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="p-6 border-b border-slate-200">
            <div className="font-semibold leading-none tracking-tight">Department Task Completion</div>
          </CardHeader>
          <CardContent className="p-6">
            <DepartmentCompletionBar data={deptCompletion} />
          </CardContent>
        </Card>
      </div>

      {/* Session 13 (R12-E): the reference's Onboarding Summary — border-b
          header (title-only) + `grid md:grid-cols-3 gap-8` of plain text
          stacks: text-sm slate-500 label mb-2 over a text-2xl bold value
          (slate-900 / green-600 / indigo-600). No icons, no borders. */}
      <Card className="border-slate-200">
        <CardHeader className="p-6 border-b border-slate-200">
          <div className="font-semibold leading-none tracking-tight">Onboarding Summary</div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-slate-500 mb-2">Total Tasks Created</p>
              <p className="text-2xl font-bold text-slate-900">{tasksTotal}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-2">Completed Onboardings</p>
              <p className="text-2xl font-bold text-green-600">{completedOnboardings}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-2">Templates Created</p>
              <p className="text-2xl font-bold text-indigo-600">{templateCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
