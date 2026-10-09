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

  const assignmentsByDate = React.useMemo(() => {
    const map = new Map<string, AssignmentRow[]>();
    data?.assignments.forEach((a) => {
      const list = map.get(a.dateKey) ?? [];
      list.push(a);
      map.set(a.dateKey, list);
    });
    return map;
  }, [data]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Shift Management"
        sectionIcon={<Calendar aria-hidden="true" />}
        title="Shift Calendar"
        subtitle="Drag & drop shifts · Overlap prevention · Swap requests"
        actions={
          <Button variant="outline" onClick={() => setSwapsOpen(true)}>
            <ArrowLeftRight aria-hidden="true" />
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
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard
              label="Total Employees"
              value={data.stats.totalEmployees}
              icon={<Users className="h-4 w-4" aria-hidden="true" />}
            />
            <StatCard
              label="Shifts Defined"
              value={data.stats.shiftsDefined}
              icon={<Clock3 className="h-4 w-4" aria-hidden="true" />}
            />
            <StatCard
              label="Assignments This Month"
              value={data.stats.assignmentsThisMonth}
              icon={<CalendarRange className="h-4 w-4" aria-hidden="true" />}
            />
            <StatCard
              label="Unassigned Days"
              value={data.stats.unassignedDays}
              icon={<CalendarX2 className="h-4 w-4" aria-hidden="true" />}
            />
          </div>

          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">{monthLabel(data.month)}</h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="iconSm"
                  aria-label="Previous month"
                  onClick={() => {
                    setLoading(true);
                    load(shiftMonth(data.month, -1));
                  }}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLoading(true);
                    load(null);
                  }}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="iconSm"
                  aria-label="Next month"
                  onClick={() => {
                    setLoading(true);
                    load(shiftMonth(data.month, 1));
                  }}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1.5 pb-1.5 text-center text-xs font-medium text-muted-foreground">
                {WEEKDAYS.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((cell, i) => {
                  if (!cell.day || !cell.dateKey) {
                    return <div key={`blank-${i}`} className="min-h-24 rounded-lg border bg-secondary/20" />;
                  }
                  const dayAssignments = assignmentsByDate.get(cell.dateKey) ?? [];
                  return (
                    <div
                      key={cell.dateKey}
                      className="flex min-h-24 flex-col gap-1 rounded-lg border bg-card p-1.5"
                    >
                      <span className="px-0.5 text-xs font-medium text-muted-foreground">{cell.day}</span>
                      {dayAssignments.length === 0 ? (
                        <button
                          type="button"
                          className="self-start rounded px-1 py-0.5 text-xs font-medium text-primary hover:bg-accent"
                          onClick={() => setAssignDate(cell.dateKey)}
                        >
                          assign
                        </button>
                      ) : (
                        <div className="flex flex-col gap-1">
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
                              className="self-start rounded px-1 text-xs font-medium text-primary hover:bg-accent"
                              onClick={() => setAssignDate(cell.dateKey)}
                            >
                              +{dayAssignments.length - 2} more
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
