"use client";

import * as React from "react";
import { Calendar, CalendarCheck, Clock3, FileSpreadsheet, FileText, Gauge, Loader2, Printer, ShieldAlert, UserCheck, Users, UserX } from "lucide-react";
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

export default function StaffAttendancePage() {
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

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Attendance Management"
        layout="flat48"
        iconClassName="text-blue-600"
        titleClassName="leading-[2]"
        sectionIcon={<Calendar aria-hidden="true" />}
        title="Staff Attendance"
        subtitle="Track and manage employee attendance records"
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer aria-hidden="true" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.toast({ title: "Export queued", description: "Your PDF report is being generated.", variant: "info" })}
            >
              <FileText aria-hidden="true" />
              PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.toast({ title: "Export queued", description: "Your Excel export is being generated.", variant: "info" })}
            >
              <FileSpreadsheet aria-hidden="true" />
              Excel
            </Button>
            {canMark ? (
              <Button onClick={openMarkDialog}>
                <CalendarCheck aria-hidden="true" />
                Mark Attendance
              </Button>
            ) : null}
          </>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : (
        <>
          {!canMark ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">Access Restricted</p>
                <p className="mt-0.5 text-sm text-amber-800">
                  Only Admin or Security role users can mark attendance. Please contact your administrator.
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            <StatCard label="Total Employees" value={stats.totalEmployees} icon={<Users className="h-4 w-4" aria-hidden="true" />} />
            <StatCard
              label="Present Today"
              value={stats.presentToday}
              icon={<UserCheck className="h-4 w-4" aria-hidden="true" />}
            />
            <StatCard label="Absent Today" value={stats.absentToday} icon={<UserX className="h-4 w-4" aria-hidden="true" />} />
            <StatCard label="Late Arrivals" value={stats.lateArrivals} icon={<Clock3 className="h-4 w-4" aria-hidden="true" />} />
            <StatCard
              label="Attendance Rate"
              value={`${stats.attendanceRate}%`}
              icon={<Gauge className="h-4 w-4" aria-hidden="true" />}
            />
          </div>

          <Tabs defaultValue="dashboard" className="flex flex-col gap-4">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="summary">Employee Summary</TabsTrigger>
              <TabsTrigger value="records">Records</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-0">
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
                        <Button onClick={openMarkDialog}>
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
