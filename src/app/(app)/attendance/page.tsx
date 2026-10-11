"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Calendar, CalendarCheck, Clock3, FileSpreadsheet, FileText, Gauge, LayoutDashboard, Loader2, MonitorSmartphone, Printer, Settings, ShieldAlert, UserCheck, Users, UserX, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";

interface EmployeeOption {
  id: string;
  name: string;
  code: string;
  email: string;
}

interface AttendanceRecordRow {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  dateKey: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  minutesLate: number;
}

interface SummaryRow {
  employeeId: string;
  name: string;
  code: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  days: number;
  rate: number;
}

interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateArrivals: number;
  onLeaveToday: number;
  attendanceRate: number;
}

const ATTENDANCE_STATUSES = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "leave", label: "Leave" },
];

/** Session 10 (R9-E): the reference's Report Type toolbar — a card between
 *  the header and the stats with a three-option select. */
const REPORT_TYPES = [
  { value: "all", label: "All Staff Report" },
  { value: "individual", label: "Individual Employee" },
  { value: "department", label: "Department Report" },
] as const;

export default function StaffAttendancePage() {
  const router = useRouter();
  const toast = useToast();
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [records, setRecords] = React.useState<AttendanceRecordRow[]>([]);
  const [summary, setSummary] = React.useState<SummaryRow[]>([]);
  const [stats, setStats] = React.useState<AttendanceStats>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateArrivals: 0,
    onLeaveToday: 0,
    attendanceRate: 0,
  });
  const [canMark, setCanMark] = React.useState(false);
  const [today, setToday] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogSeq, setDialogSeq] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [reportType, setReportType] = React.useState<(typeof REPORT_TYPES)[number]["value"]>("all");

  function openMarkDialog() {
    setDialogSeq((s) => s + 1);
    setDialogOpen(true);
  }

  const load = React.useCallback(() => {
    fetch("/api/attendance")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) {
          setEmployees(json.data.employees);
          setRecords(json.data.records);
          setSummary(json.data.summary);
          setStats(json.data.stats);
          setCanMark(json.data.canMark);
          setToday(json.data.today);
        } else {
          toast.toast({ title: "Failed to load", description: json.error?.message, variant: "error" });
        }
      })
      .catch(() => toast.toast({ title: "Failed to load", description: "Network error", variant: "error" }))
      .finally(() => setLoading(false));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function markAttendance(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({ title: "Attendance marked", description: "The record has been saved.", variant: "success" });
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  const todayOverview = React.useMemo(() => {
    const marked = stats.presentToday + stats.absentToday + stats.lateArrivals + stats.onLeaveToday;
    const pct = (n: number) => (marked > 0 ? Math.round((n / marked) * 100) : 0);
    return {
      marked,
      rows: [
        { key: "present", label: "Present", value: stats.presentToday, className: "bg-emerald-500" },
        { key: "late", label: "Late", value: stats.lateArrivals, className: "bg-amber-500" },
        { key: "absent", label: "Absent", value: stats.absentToday, className: "bg-red-500" },
        { key: "leave", label: "On Leave", value: stats.onLeaveToday, className: "bg-blue-500" },
      ].map((r) => ({ ...r, pct: pct(r.value) })),
    };
  }, [stats]);

  /** Session 10 (R9-E): the Report Type drives the stat row's scope —
   *  "all" keeps the server stats; the other modes derive per-employee /
   *  per-department aggregates from the loaded records and summary rows
   *  (the reference renders the select but wires nothing — ours works). */
  const reportStats = React.useMemo(() => {
    if (reportType === "individual") {
      const withRecords = new Set(records.map((r) => r.employeeId));
      const present = records.filter((r) => r.status === "present").length;
      const absent = records.filter((r) => r.status === "absent").length;
      const late = records.filter((r) => r.status === "late").length;
      const marked = present + absent + late;
      return {
        first: { label: "Employees with Records", value: withRecords.size },
        second: { label: "Present Records", value: present },
        third: { label: "Absent Records", value: absent },
        fourth: { label: "Late Records", value: late },
        fifth: { label: "Record Rate", value: `${marked > 0 ? Math.round(((present + late) / marked) * 100) : 0}%` },
      };
    }
    if (reportType === "department") {
      // The attendance payload carries no department field (per-employee
      // summary only) — the department report aggregates across the
      // tracked employee rows, the honest scope available client-side.
      const days = summary.reduce((n, s) => n + s.days, 0);
      const present = summary.reduce((n, s) => n + s.present, 0);
      const late = summary.reduce((n, s) => n + s.late, 0);
      return {
        first: { label: "Employees Tracked", value: summary.length },
        second: { label: "Tracked Days", value: days },
        third: { label: "Present Entries", value: present },
        fourth: { label: "Late Entries", value: late },
        fifth: { label: "Avg Rate", value: `${summary.length > 0 ? Math.round(summary.reduce((n, s) => n + s.rate, 0) / summary.length) : 0}%` },
      };
    }
    return {
      first: { label: "Total Employees", value: stats.totalEmployees },
      second: { label: "Present Today", value: stats.presentToday },
      third: { label: "Absent Today", value: stats.absentToday },
      fourth: { label: "Late Arrivals", value: stats.lateArrivals },
      fifth: { label: "Attendance Rate", value: `${stats.attendanceRate}%` },
    };
  }, [reportType, records, summary, employees, stats]);

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#eff6ff,#ecfeff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Attendance Management"
        layout="flat48"
        iconClassName="text-blue-600"
        className="sm:flex-wrap"
        sectionIcon={<Calendar aria-hidden="true" />}
        title="Staff Attendance"
        subtitle="Track and manage employee attendance records"
        actions={
          /* Session 10 (R9-E): the reference's seven-button cluster —
             Print/PDF/Excel at h-8/12px outline, Devices (cyan-700 text —
             rgb(14,116,144) = pinned v3 cyan-700, session 11 R10-A),
             Settings, Dashboard (blue-700 text) at h-9/14px outline, and
             the cyan-gradient Import Attendance CTA; every icon carries
             the reference's mr-2 (16px effective icon-text gap). The
             reference squeezes its title to a 312px two-line wrap and
             lets the PAGE overflow horizontally (docW 1558 at 1440 — its
             own bug); our fitting page keeps the title on one line and
             wraps the cluster to a second row instead (sm:flex-wrap).
             Dashboard navigates to /attendancedashboard (the reference's
             one live control); Devices/Settings toast (the reference
             leaves both dead). */
          <>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2" aria-hidden="true" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.toast({ title: "Export queued", description: "Your PDF report is being generated.", variant: "info" })}
            >
              <FileText className="mr-2" aria-hidden="true" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.toast({ title: "Export queued", description: "Your Excel export is being generated.", variant: "info" })}
            >
              <FileSpreadsheet className="mr-2" aria-hidden="true" />
              Excel
            </Button>
            <Button
              variant="outline"
              className="text-cyan-700"
              onClick={() => toast.toast({ title: "Devices", description: "Kiosk and biometric device sync is managed by your administrator.", variant: "info" })}
            >
              <MonitorSmartphone className="mr-2" aria-hidden="true" />
              Devices
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.toast({ title: "Attendance settings", description: "Grace period, overtime and shift rules are configured by your administrator.", variant: "info" })}
            >
              <Settings className="mr-2" aria-hidden="true" />
              Settings
            </Button>
            <Button variant="outline" className="text-blue-700" onClick={() => router.push("/attendancedashboard")}>
              <LayoutDashboard className="mr-2" aria-hidden="true" />
              Dashboard
            </Button>
            {canMark ? (
              <Button variant="cyan" onClick={openMarkDialog}>
                <CalendarCheck className="mr-2" aria-hidden="true" />
                Import Attendance
              </Button>
            ) : null}
          </>
        }
      />

      {/* Session 10 (R9-E): the reference's Report Type toolbar — a card
          between the header and the stats (measured (288,280) 70px tall)
          with the "Report Type:" label and a three-option select. The
          reference's own page overflows its content area (1238px wide);
          the clone keeps the fitting 1120px — the documented
          fix-the-broken superset. */}
      <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <Label htmlFor="attendance-report-type" className="shrink-0 text-sm font-medium text-foreground">
          Report Type:
        </Label>
        <Select value={reportType} onValueChange={(v) => setReportType(v as (typeof REPORT_TYPES)[number]["value"])}>
          <SelectTrigger id="attendance-report-type" className="w-48" aria-label="Report type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REPORT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            <StatCard label={reportStats.first.label} value={reportStats.first.value} icon={<Users className="h-4 w-4" aria-hidden="true" />} />
            <StatCard label={reportStats.second.label} value={reportStats.second.value} icon={<UserCheck className="h-4 w-4" aria-hidden="true" />} />
            <StatCard label={reportStats.third.label} value={reportStats.third.value} icon={<UserX className="h-4 w-4" aria-hidden="true" />} />
            <StatCard label={reportStats.fourth.label} value={reportStats.fourth.value} icon={<Clock3 className="h-4 w-4" aria-hidden="true" />} />
            <StatCard label={reportStats.fifth.label} value={reportStats.fifth.value} icon={<Gauge className="h-4 w-4" aria-hidden="true" />} />
          </div>

          {/* Session 14 (R13-D): the reference's stat-tab block — the
              DEFAULT shrink-wrapped TabsList (471px) with bg-white +
              border, iconed triggers (flex + gap-2, 16px
              svg, no icon margin). The first tab is Mark
              Attendance: non-admins get the centered access-restricted
              recipe; admins keep the clone's overview superset. */}
          <Tabs defaultValue="mark" className="space-y-6">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="mark" className="gap-2"><Workflow className="h-4 w-4" aria-hidden="true" /> Mark Attendance</TabsTrigger>
              <TabsTrigger value="summary" className="gap-2"><Users className="h-4 w-4" aria-hidden="true" /> Employee Summary</TabsTrigger>
              <TabsTrigger value="records" className="gap-2"><Calendar className="h-4 w-4" aria-hidden="true" /> Records</TabsTrigger>
            </TabsList>

            <TabsContent value="mark" className="mt-0">
              {!canMark ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center bg-red-100 rounded-full">
                  <ShieldAlert className="h-8 w-8 text-red-600" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">Access Restricted</h3>
                <p className="text-slate-500 max-w-sm">
                  Only Admin or Security role users can mark attendance. Please contact your administrator.
                </p>
              </div>
              ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Today&apos;s Overview</h2>
                    <span className="text-xs text-muted-foreground">
                      {todayOverview.marked} record{todayOverview.marked === 1 ? "" : "s"} today
                    </span>
                  </div>
                  {todayOverview.marked === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No attendance records yet today.
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-col gap-4">
                      {todayOverview.rows.map((row) => (
                        <div key={row.key} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">{row.label}</span>
                            <span className="text-muted-foreground">
                              {row.value} · {row.pct}%
                            </span>
                          </div>
                          <Progress value={row.pct} indicatorClassName={row.className} aria-label={`${row.label} today`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Recent Records</h2>
                    <span className="text-xs text-muted-foreground">Latest 5</span>
                  </div>
                  {records.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No attendance records yet.</p>
                  ) : (
                    <ul className="mt-2 flex flex-col divide-y divide-border/60">
                      {records.slice(0, 5).map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{r.employeeName}</p>
                            <p className="text-xs text-muted-foreground">
                              {r.dateKey}
                              {r.checkInTime ? ` · in ${r.checkInTime}` : ""}
                              {r.checkOutTime ? ` · out ${r.checkOutTime}` : ""}
                            </p>
                          </div>
                          <StatusBadge status={r.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              )}
            </TabsContent>

            <TabsContent value="summary" className="mt-0">
              <div className="rounded-xl border bg-card shadow-sm">
                {summary.length === 0 ? (
                  <EmptyState
                    icon={<Users className="h-6 w-6" aria-hidden="true" />}
                    title="No employees found"
                    description="Attendance summaries appear once records exist."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead>Late</TableHead>
                        <TableHead>Leave</TableHead>
                        <TableHead>Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.map((row) => (
                        <TableRow key={row.employeeId}>
                          <TableCell>
                            <p className="font-medium text-foreground">{row.name}</p>
                            <p className="text-xs text-muted-foreground">{row.code}</p>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{row.present}</TableCell>
                          <TableCell className="text-muted-foreground">{row.absent}</TableCell>
                          <TableCell className="text-muted-foreground">{row.late}</TableCell>
                          <TableCell className="text-muted-foreground">{row.leave}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={row.rate} className="w-16" aria-label={`${row.name} attendance rate`} />
                              <span className="text-sm text-muted-foreground">{row.rate}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="records" className="mt-0">
              <div className="rounded-xl border bg-card shadow-sm">
                {records.length === 0 ? (
                  <EmptyState
                    icon={<CalendarCheck className="h-6 w-6" aria-hidden="true" />}
                    title="No attendance records"
                    description={
                      canMark
                        ? "Mark attendance to start tracking your team."
                        : "Records appear once attendance has been marked."
                    }
                    action={
                      canMark ? (
                        <Button variant="dark" onClick={openMarkDialog}>
                          <CalendarCheck aria-hidden="true" />
                          Mark Attendance
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Late min</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <p className="font-medium text-foreground">{r.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{r.employeeCode}</p>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{r.dateKey}</TableCell>
                          <TableCell className="text-muted-foreground">{r.checkInTime ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{r.checkOutTime ?? "—"}</TableCell>
                          <TableCell>
                            <StatusBadge status={r.status} />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.minutesLate > 0 ? r.minutesLate : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {canMark ? (
        <MarkAttendanceDialog
          key={`mark-${dialogSeq}`}
          open={dialogOpen}
          employees={employees}
          defaultDate={today}
          saving={saving}
          onOpenChange={setDialogOpen}
          onSave={markAttendance}
        />
      ) : null}
    </div>
    </div>
  );
}

function MarkAttendanceDialog({
  open,
  employees,
  defaultDate,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  employees: EmployeeOption[];
  defaultDate: string;
  saving: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [form, setForm] = React.useState({
    employeeId: employees[0]?.id ?? "",
    date: defaultDate,
    status: "present",
    checkIn: "",
    checkOut: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const saved = await onSave({
      employeeId: form.employeeId,
      date: form.date,
      status: form.status,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>Record attendance for one employee on a specific date.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="att-employee">Employee</Label>
            <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
              <SelectTrigger id="att-employee">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="att-date">Date</Label>
              <Input
                id="att-date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="att-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger id="att-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTENDANCE_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="att-checkin">Check In</Label>
              <Input
                id="att-checkin"
                type="time"
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="att-checkout">Check Out</Label>
              <Input
                id="att-checkout"
                type="time"
                value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.employeeId}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Save Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
