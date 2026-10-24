"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, CircleCheckBig, Clock, Download, TriangleAlert, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useRouter } from "next/navigation";
import { initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClockInDistribution, DailyAttendanceTrend, type DayPoint, type HourBucket } from "./charts";

export interface DepartmentOption {
  id: string;
  name: string;
}

export interface AttendanceEmployee {
  id: string;
  name: string;
  departmentId: string | null;
  department: string | null;
}

export interface AttendanceRecordRow {
  employeeId: string;
  date: string; // ISO
  status: string; // present | absent | late | leave
  checkIn: string | null; // ISO
}

export interface AttendanceDashboardData {
  departments: DepartmentOption[];
  employees: AttendanceEmployee[];
  records: AttendanceRecordRow[]; // the selected month only
  monthTitle: string; // "October 2026"
  daysInMonth: number;
  monthValue: string; // "2026-10" — the R88-B1 month picker's value
}

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

function rate(present: number, absent: number, late: number): number {
  const denom = present + absent + late;
  return denom > 0 ? Math.round(((present + late) / denom) * 100) : 0;
}

export function AttendanceDashboard({ data }: { data: AttendanceDashboardData }) {
  const toast = useToast();
  const router = useRouter();
  const [department, setDepartment] = React.useState<string>("all");

  const employees = React.useMemo(
    () =>
      department === "all"
        ? data.employees
        : data.employees.filter((e) => e.departmentId === department),
    [data.employees, department]
  );
  const employeeIds = React.useMemo(() => new Set(employees.map((e) => e.id)), [employees]);
  const records = React.useMemo(
    () => data.records.filter((r) => employeeIds.has(r.employeeId)),
    [data.records, employeeIds]
  );

  const presentDays = records.filter((r) => r.status === "present").length;
  const absentDays = records.filter((r) => r.status === "absent").length;
  const lateArrivals = records.filter((r) => r.status === "late").length;
  const attendanceRate = rate(presentDays, absentDays, lateArrivals);

  const daily: DayPoint[] = React.useMemo(() => {
    const days: DayPoint[] = [];
    for (let day = 1; day <= data.daysInMonth; day++) {
      const dayRecords = records.filter((r) => new Date(r.date).getDate() === day);
      days.push({
        day: String(day),
        present: dayRecords.filter((r) => r.status === "present").length,
        late: dayRecords.filter((r) => r.status === "late").length,
        absent: dayRecords.filter((r) => r.status === "absent").length,
      });
    }
    return days;
  }, [records, data.daysInMonth]);

  const clockInBuckets: HourBucket[] = React.useMemo(() => {
    const hours = new Map<number, number>();
    for (const r of records) {
      if (!r.checkIn) continue;
      const hour = new Date(r.checkIn).getHours();
      hours.set(hour, (hours.get(hour) ?? 0) + 1);
    }
    const keys = [...hours.keys()];
    if (keys.length === 0) return [];
    const min = Math.min(...keys);
    const max = Math.max(...keys);
    const out: HourBucket[] = [];
    for (let h = min; h <= max; h++) {
      out.push({ hour: `${String(h).padStart(2, "0")}:00`, count: hours.get(h) ?? 0 });
    }
    return out;
  }, [records]);

  const summary = React.useMemo(
    () =>
      employees.map((e) => {
        const rows = records.filter((r) => r.employeeId === e.id);
        const present = rows.filter((r) => r.status === "present").length;
        const absent = rows.filter((r) => r.status === "absent").length;
        const late = rows.filter((r) => r.status === "late").length;
        return { employee: e, present, absent, late, rate: rate(present, absent, late) };
      }),
    [employees, records]
  );

  function exportReport() {
    if (summary.length === 0) {
      toast.toast({ title: "Nothing to export", description: "No employees match the filter.", variant: "info" });
      return;
    }
    const rows: (string | number | null)[][] = [
      /* Session 88 (R88-B4): the REF's last column is "Rate" (not
       * "Rate %" — live-measured on the plain th). */
      ["Employee", "Department", "Present", "Absent", "Late", "Rate"],
      ...summary.map((s) => [
        s.employee.name,
        s.employee.department ?? "—",
        s.present,
        s.absent,
        s.late,
        s.rate,
      ]),
    ];
    downloadCsv(`attendance-report-${data.monthTitle.toLowerCase().replace(" ", "-")}.csv`, rows);
    toast.toast({
      title: "Export ready",
      description: `Attendance summary for ${summary.length} employees downloaded.`,
      variant: "success",
    });
  }

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <PageHeader
        rowBreakpoint="md"
        title="Attendance Dashboard"
        subtitle="Daily clock-in/out trends, late arrivals & department reports"
        actions={
          <>
            {/* Session 88 (R88-B1): the REF's month picker — a type=month
                Input (w-40) BEFORE the department select, value the
                selected month (live-measured x885 w160 h36). The superset:
                picking a month refetches via the ?month= param. */}
            <Input
              type="month"
              className="w-40"
              aria-label="Filter by month"
              value={data.monthValue}
              onChange={(e) => {
                const next = e.target.value;
                if (next) router.push(`/attendancedashboard?month=${next}`);
              }}
            />
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-44" aria-label="Filter by department">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {data.departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportReport}>
              <Download className="mr-2" aria-hidden="true" />
              Export Report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Session 12 (R11-T): the reference's 146px compact cards WITH 40px
            icon tiles — CheckCircle2 green, AlertTriangle red, Clock
            yellow, Users blue (live-measured). */}
        <StatCard variant="compact" valueTag="p" labelTag="p" labelClassName="text-slate-600" label="Present Days" value={presentDays} icon={<CircleCheckBig className="w-5 h-5 text-green-600" aria-hidden="true" />} tileClassName="bg-green-100" />
        <StatCard variant="compact" valueTag="p" labelTag="p" labelClassName="text-slate-600" label="Absent Days" value={absentDays} icon={<TriangleAlert className="w-5 h-5 text-red-600" aria-hidden="true" />} tileClassName="bg-red-100" />
        <StatCard variant="compact" valueTag="p" labelTag="p" labelClassName="text-slate-600" label="Late Arrivals" value={lateArrivals} icon={<Clock className="w-5 h-5 text-yellow-600" aria-hidden="true" />} tileClassName="bg-yellow-100" />
        <StatCard variant="compact" valueTag="p" labelTag="p" labelClassName="text-slate-600" label="Attendance Rate" value={`${attendanceRate}%`} icon={<Users className="w-5 h-5 text-blue-600" aria-hidden="true" />} tileClassName="bg-blue-100" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          {/* Session 12 (R11-U): title-only header (72px) — no
              description on the reference. */}
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="font-semibold tracking-tight text-base">Daily Attendance Trend — {data.monthTitle}</div>
          </div>
          <CardContent className="p-6 pt-0">
            {/* Session 12 (R11-U): the reference renders the chart (empty
                axes) even with no records — no EmptyState fallback. */}
            <DailyAttendanceTrend data={daily} />
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="font-semibold tracking-tight text-base">Clock-In Time Distribution</div>
          </div>
          <CardContent className="p-6 pt-0">
            <ClockInDistribution data={clockInBuckets} />
          </CardContent>
        </Card>
      </div>

      <Card>
        {/* Session 88 (R88-B4): the REF's summary card — the PLAIN h80
            CardHeader (`flex flex-col space-y-1.5 p-6`) wrapping ONE
            justify-between row: the title-only div (font-semibold
            tracking-tight text-base, NO description) + the inline
            outline sm export button (live-measured h80 vs the flex-row
            h98 form with the description). */}
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold tracking-tight text-base">Employee Attendance Summary</div>
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="mr-1" aria-hidden="true" />
              Export
            </Button>
          </div>
        </div>
        <CardContent className="px-0 pb-0">
          {/* Session 23 (R22-F) + Session 88 (R88-B4): the REF renders a
              PLAIN table — `w-full text-sm`, a class-less thead, the
              `border-b border-slate-200` tr, and bare
              `text-left py-2 px-3 text-slate-500 font-medium` th's (the
              shadcn Table component's base classes polluted every th/tr
              and shifted the row border color — the r86-I class). At 0
              rows: the header-only table + a bare `py-8 text-slate-400` P
              as the table's SIBLING — NOT an EmptyState component. */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Employee</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Department</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Present</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Absent</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Late</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Rate</th>
              </tr>
            </thead>
            {summary.length > 0 ? (
              <tbody>
                {summary.map((s) => (
                  <tr key={s.employee.id} className="border-b border-slate-100">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initials(s.employee.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{s.employee.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{s.employee.department ?? "—"}</td>
                    <td className="py-2 px-3">{s.present}</td>
                    <td className="py-2 px-3">{s.absent}</td>
                    <td className="py-2 px-3">{s.late}</td>
                    <td className="py-2 px-3 font-medium">{s.rate}%</td>
                  </tr>
                ))}
              </tbody>
            ) : null}
          </table>
          {summary.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No employees found for selected filter.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
