"use client";

import * as React from "react";
import { AlertTriangle, Building2, CheckCircle2, Clock, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";
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
  records: AttendanceRecordRow[]; // current month only
  monthTitle: string; // "October 2026"
  daysInMonth: number;
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
      ["Employee", "Department", "Present", "Absent", "Late", "Rate %"],
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
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#eff6ff,#ecfeff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Attendance Dashboard"
        subtitle="Daily clock-in/out trends, late arrivals & department reports"
        actions={
          <>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-[190px]" aria-label="Filter by department">
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
              <Download aria-hidden="true" />
              Export Report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Session 12 (R11-T): the reference's 146px compact cards WITH 40px
            icon tiles — CheckCircle2 green, AlertTriangle red, Clock
            yellow, Users blue (live-measured). */}
        <StatCard variant="compact" label="Present Days" value={presentDays} icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} tileClassName="bg-green-100 text-green-600" />
        <StatCard variant="compact" label="Absent Days" value={absentDays} icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />} tileClassName="bg-red-100 text-red-600" />
        <StatCard variant="compact" label="Late Arrivals" value={lateArrivals} icon={<Clock className="h-4 w-4" aria-hidden="true" />} tileClassName="bg-yellow-100 text-yellow-600" />
        <StatCard variant="compact" label="Attendance Rate" value={`${attendanceRate}%`} icon={<Users className="h-4 w-4" aria-hidden="true" />} tileClassName="bg-blue-100 text-blue-600" />
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
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Employee Attendance Summary</CardTitle>
            <CardDescription>
              {data.monthTitle} attendance breakdown per employee
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download aria-hidden="true" />
            Export
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {summary.length === 0 ? (
            <div className="pb-6">
              <EmptyState
                icon={<Building2 className="h-6 w-6" aria-hidden="true" />}
                title="No employees found for selected filter."
                description="Try selecting All Departments or add employees."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Present</TableHead>
                  <TableHead className="text-right">Absent</TableHead>
                  <TableHead className="text-right">Late</TableHead>
                  <TableHead className="text-right">Rate %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((s) => (
                  <TableRow key={s.employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initials(s.employee.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{s.employee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.employee.department ?? "—"}</TableCell>
                    <TableCell className="text-right">{s.present}</TableCell>
                    <TableCell className="text-right">{s.absent}</TableCell>
                    <TableCell className="text-right">{s.late}</TableCell>
                    <TableCell className="text-right font-medium">{s.rate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
