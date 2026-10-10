"use client";

import * as React from "react";
import { ArrowLeftRight, Calendar, CalendarRange, CalendarX2, ChevronLeft, ChevronRight, Clock3, Loader2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";

interface ShiftOption {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  department?: string | null;
  active: boolean;
}

interface AssignmentRow {
  id: string;
  dateKey: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  shiftId: string;
  shiftName: string;
  shiftTime: string;
}

interface EmployeeOption {
  id: string;
  name: string;
  code: string;
}

interface ShiftsPayload {
  month: string;
  daysInMonth: number;
  shifts: ShiftOption[];
  assignments: AssignmentRow[];
  employees: EmployeeOption[];
  stats: {
    totalEmployees: number;
    shiftsDefined: number;
    assignmentsThisMonth: number;
    unassignedDays: number;
  };
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function ShiftCalendarPage() {
  const toast = useToast();
  const [month, setMonth] = React.useState("");
  const [data, setData] = React.useState<ShiftsPayload | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [swapsOpen, setSwapsOpen] = React.useState(false);
  const [assignDate, setAssignDate] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback((targetMonth: string | null) => {
    const qs = targetMonth ? `?month=${encodeURIComponent(targetMonth)}` : "";
    fetch(`/api/shifts${qs}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) {
          setData(json.data);
          setMonth(json.data.month);
        } else {
          toast.toast({ title: "Failed to load", description: json.error?.message, variant: "error" });
        }
      })
      .catch(() => toast.toast({ title: "Failed to load", description: "Network error", variant: "error" }))
      .finally(() => setLoading(false));
  }, [toast]);

  React.useEffect(() => {
    load(null);
  }, [load]);

  async function assignShift(employeeId: string, shiftId: string, date: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, shiftId, date }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Assignment failed", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({ title: "Shift assigned", description: "The calendar has been updated.", variant: "success" });
      await load(month);
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function removeAssignment(a: AssignmentRow) {
    if (!window.confirm(`Remove ${a.employeeName}'s ${a.shiftName} on ${a.dateKey}?`)) return;
    try {
      const res = await fetch(`/api/shifts?id=${a.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Remove failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Assignment removed", variant: "success" });
      await load(month);
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  const cells = React.useMemo(() => {
    if (!data) return [];
    const [y, m] = data.month.split("-").map(Number);
    const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Monday-first
    const list: { day: number | null; dateKey: string | null }[] = [];
    for (let i = 0; i < offset; i++) list.push({ day: null, dateKey: null });
    for (let d = 1; d <= data.daysInMonth; d++) {
      list.push({ day: d, dateKey: `${data.month}-${String(d).padStart(2, "0")}` });
    }
    while (list.length % 7 !== 0) list.push({ day: null, dateKey: null });
    return list;
  }, [data]);

  /** Session 11 (R10-J): the calendar renders as the reference's
   *  border-collapse table — cells chunked into Mon-first week rows. */
  const weeks = React.useMemo(() => {
    const rows: { day: number | null; dateKey: string | null }[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [cells]);

  /** Session 11 (R10-J): the All Departments toolbar select — filters the
   *  visible assignments by the assigned shift's department (superset: the
   *  reference renders the select but wires nothing). */
  const [departmentFilter, setDepartmentFilter] = React.useState("all");
  const departmentNames = React.useMemo(() => {
    const names = new Set<string>();
    data?.shifts.forEach((s) => {
      if (s.department) names.add(s.department);
    });
    return [...names].sort();
  }, [data]);

  const shiftById = React.useMemo(() => {
    const map = new Map<string, ShiftOption>();
    data?.shifts.forEach((s) => map.set(s.id, s));
    return map;
  }, [data]);

  const assignmentsByDate = React.useMemo(() => {
    const map = new Map<string, AssignmentRow[]>();
    data?.assignments.forEach((a) => {
      if (departmentFilter !== "all") {
        const shift = shiftById.get(a.shiftId);
        if (!shift || shift.department !== departmentFilter) return;
      }
      const list = map.get(a.dateKey) ?? [];
      list.push(a);
      map.set(a.dateKey, list);
    });
    return map;
  }, [data, departmentFilter, shiftById]);

  /** Session 11 (R10-J): the summary card body — per-shift assignment
   *  counts (the reference's card renders empty at 0 assignments; ours
   *  rides the same furniture with the live breakdown). */
  const summaryRows = React.useMemo(() => {
    const counts = new Map<string, { shiftId: string; shiftName: string; time: string; count: number }>();
    data?.assignments.forEach((a) => {
      if (departmentFilter !== "all") {
        const shift = shiftById.get(a.shiftId);
        if (!shift || shift.department !== departmentFilter) return;
      }
      const row = counts.get(a.shiftId) ?? { shiftId: a.shiftId, shiftName: a.shiftName, time: a.shiftTime, count: 0 };
      row.count += 1;
      counts.set(a.shiftId, row);
    });
    return [...counts.values()].sort((x, y) => y.count - x.count);
  }, [data, departmentFilter, shiftById]);

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f5f3ff,#eef2ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        section="Shift Management"
        layout="flat-tight"
        iconClassName="text-violet-600"
        sectionIcon={<Calendar aria-hidden="true" />}
        title="Shift Calendar"
        subtitle="Drag & drop shifts · Overlap prevention · Swap requests"
        actions={
          <Button variant="outline" onClick={() => setSwapsOpen(true)}>
            <ArrowLeftRight className="mr-2" aria-hidden="true" />
            Shift Swaps
          </Button>
        }
      />

      {loading && !data ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : data ? (
        <>
          {/* Session 11 (R10-J): the reference's standalone month toolbar —
              `flex flex-wrap items-center gap-4` between the header and the
              stats: prev/next 36x36 outline chevrons + the month label
              (`font-semibold text-slate-800 min-w-36 text-center`) + the All
              Departments select (w-48). No Today button on the reference.
              The clone's working month/department state rides this row; the
              department select filters assignments client-side (superset —
              the reference renders the select but wires nothing). */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous month"
              onClick={() => {
                setLoading(true);
                load(shiftMonth(data.month, -1));
              }}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <span className="min-w-36 text-center font-semibold text-slate-800">{monthLabel(data.month)}</span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next month"
              onClick={() => {
                setLoading(true);
                load(shiftMonth(data.month, 1));
              }}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger aria-label="Department filter" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentNames.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session 11 (R10-J): the reference's mini stat cards are
              border-0 + shadow-sm with per-card colored values
              (blue/violet/emerald/amber-600) and text-xs slate-500 labels. */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard variant="mini" className="border-0 shadow-sm"
              label="Total Employees"
              value={data.stats.totalEmployees}
              valueClassName="text-blue-600"
            />
            <StatCard variant="mini" className="border-0 shadow-sm"
              label="Shifts Defined"
              value={data.stats.shiftsDefined}
              valueClassName="text-violet-600"
            />
            <StatCard variant="mini" className="border-0 shadow-sm"
              label="Assignments This Month"
              value={data.stats.assignmentsThisMonth}
              valueClassName="text-emerald-600"
            />
            <StatCard variant="mini" className="border-0 shadow-sm"
              label="Unassigned Days"
              value={data.stats.unassignedDays}
              valueClassName="text-amber-600"
            />
          </div>

          {/* Session 11 (R10-J): the reference's calendar card — p-0 with an
              overflow-x-auto wrapper around a `w-full border-collapse
              text-xs` TABLE: th `py-3 px-2 text-center font-semibold
              text-slate-600`; day cells `border border-slate-100 align-top
              p-1 min-h-[80px] transition-colors bg-white` containing the
              day number (text-xs text-slate-400 mb-1) over a space-y-0.5
              stack; empty cells `border-slate-50 bg-slate-50/50`; the
              "assign" affordance = `text-xs text-slate-300
              hover:text-blue-500`. The clone's working assign/remove flow
              rides the reference's furniture. */}
          <div className="rounded-xl bg-card shadow-sm">
            <div className="overflow-x-auto p-0">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    {WEEKDAYS.map((d) => (
                      <th key={d} className="px-2 py-3 text-center font-semibold text-slate-600">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, wi) => (
                    <tr key={`week-${wi}`}>
                      {week.map((cell, ci) => {
                        if (!cell.day || !cell.dateKey) {
                          return <td key={`blank-${wi}-${ci}`} className="min-h-[80px] border border-slate-50 bg-slate-50/50" />;
                        }
                        const dayAssignments = assignmentsByDate.get(cell.dateKey) ?? [];
                        return (
                          <td key={cell.dateKey} className="min-h-[80px] border border-slate-100 bg-white p-1 align-top transition-colors">
                            <div className="mb-1 text-xs text-slate-400">{cell.day}</div>
                            <div className="space-y-0.5">
                              {dayAssignments.length === 0 ? (
                                <button
                                  type="button"
                                  className="flex items-center text-xs text-slate-300 hover:text-blue-500"
                                  onClick={() => setAssignDate(cell.dateKey)}
                                >
                                  assign
                                </button>
                              ) : (
                                <>
                                  {dayAssignments.slice(0, 2).map((a) => (
                                    <span
                                      key={a.id}
                                      className="flex items-center justify-between gap-1 rounded border border-primary/25 bg-accent px-1.5 py-1 text-left text-xs"
                                    >
                                      <span className="min-w-0 flex-1">
                                        <span className="block truncate font-medium text-foreground">{a.employeeName}</span>
                                        <span className="block truncate text-muted-foreground">
                                          {a.shiftName} {a.shiftTime}
                                        </span>
                                      </span>
                                      <button
                                        type="button"
                                        className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-red-600"
                                        aria-label={`Remove ${a.employeeName} shift on ${cell.dateKey}`}
                                        onClick={() => removeAssignment(a)}
                                      >
                                        <X className="h-3 w-3" aria-hidden="true" />
                                      </button>
                                    </span>
                                  ))}
                                  {dayAssignments.length > 2 ? (
                                    <button
                                      type="button"
                                      className="flex items-center text-xs text-slate-300 hover:text-blue-500"
                                      onClick={() => setAssignDate(cell.dateKey)}
                                    >
                                      +{dayAssignments.length - 2} more
                                    </button>
                                  ) : null}
                                </>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Session 11 (R10-J): the reference's summary card — CardHeader
              with border-b border-slate-100 ("Employee Schedule Summary —
              {Month} {Year}") + p-0 content (empty on the reference at 0
              assignments; the clone's per-department breakdown rides it as
              the superset). */}
          <div className="rounded-xl bg-card shadow-sm">
            <div className="flex flex-col space-y-1.5 border-b border-slate-100 p-6">
              <div className="font-semibold leading-none tracking-tight">
                Employee Schedule Summary — {monthLabel(data.month)}
              </div>
            </div>
            <div className="p-0">
              {summaryRows.length > 0 ? (
                <div className="flex flex-col divide-y divide-slate-100">
                  {summaryRows.map((row) => (
                    <div key={row.shiftId} className="flex items-center justify-between px-6 py-3 text-sm">
                      <span className="font-medium text-foreground">{row.shiftName}</span>
                      <span className="text-muted-foreground">
                        {row.count} assignment{row.count === 1 ? "" : "s"} · {row.time}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <AssignShiftDialog
        key={assignDate ?? "closed"}
        date={assignDate}
        shifts={data?.shifts.filter((s) => s.active) ?? []}
        employees={data?.employees ?? []}
        saving={saving}
        onClose={() => setAssignDate(null)}
        onSave={assignShift}
      />

      <Dialog open={swapsOpen} onOpenChange={setSwapsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Shift Swaps</DialogTitle>
            <DialogDescription>Employee shift swap requests pending review.</DialogDescription>
          </DialogHeader>
          <EmptyState
            icon={<ArrowLeftRight className="h-6 w-6" aria-hidden="true" />}
            title="No swap requests"
            description="Swap requests between employees will appear here."
          />
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}

function AssignShiftDialog({
  date,
  shifts,
  employees,
  saving,
  onClose,
  onSave,
}: {
  date: string | null;
  shifts: ShiftOption[];
  employees: EmployeeOption[];
  saving: boolean;
  onClose: () => void;
  onSave: (employeeId: string, shiftId: string, date: string) => Promise<boolean>;
}) {
  const [employeeId, setEmployeeId] = React.useState(() => employees[0]?.id ?? "");
  const [shiftId, setShiftId] = React.useState(() => shifts[0]?.id ?? "");

  const open = date !== null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    const saved = await onSave(employeeId, shiftId, date);
    if (saved) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : onClose())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Shift</DialogTitle>
          <DialogDescription>
            {date ? `Choose an employee and shift for ${date}.` : "Choose an employee and shift."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="shift-employee">Employee</Label>
            {employees.length === 0 ? (
              <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                No employees yet — add employees first.
              </p>
            ) : (
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger id="shift-employee">
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
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="shift-select">Shift</Label>
            {shifts.length === 0 ? (
              <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                No shifts defined yet — create shifts in Settings first.
              </p>
            ) : (
              <Select value={shiftId} onValueChange={setShiftId}>
                <SelectTrigger id="shift-select">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.startTime}–{s.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !employeeId || !shiftId}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Assign Shift
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
