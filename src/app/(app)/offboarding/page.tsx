"use client";

import * as React from "react";
import { CalendarDays, CheckCircle2, Loader2, Plus, Trash2, UserMinus, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate, initials } from "@/lib/utils";

interface ChecklistItem {
  title: string;
  done: boolean;
}

interface OffboardingRow {
  id: string;
  employeeId: string;
  lastDay: string;
  reason: string | null;
  status: string;
  createdAt: string;
  checklistItems: ChecklistItem[];
  employee: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string | null;
  } | null;
}

interface EmployeeOption {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
}

export default function OffboardingPage() {
  const toast = useToast();
  const [processes, setProcesses] = React.useState<OffboardingRow[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  // Session92 (R92-K): the REF's live dialog contract (512x372, "Start
  // Offboarding Process") — Employee, Notice Date, Last Working Day,
  // Termination Date, Final Settlement (SAR).
  const [form, setForm] = React.useState({ employeeId: "", noticeDate: "", lastDay: "", terminationDate: "", finalSettlement: "" });

  const load = React.useCallback(async () => {
    try {
      const [offRes, empRes] = await Promise.all([fetch("/api/offboarding"), fetch("/api/employees")]);
      const offJson = await offRes.json();
      const empJson = await empRes.json();
      if (offJson.ok) setProcesses(offJson.data.processes);
      else toast.toast({ title: "Failed to load offboarding", description: offJson.error?.message, variant: "error" });
      if (empJson.ok) setEmployees(empJson.data.employees);
    } catch {
      toast.toast({ title: "Failed to load offboarding", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.employeeId || !form.lastDay) return;
    setSaving(true);
    try {
      const res = await fetch("/api/offboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: form.employeeId,
          lastDay: form.lastDay,
          noticeDate: form.noticeDate || undefined,
          terminationDate: form.terminationDate || undefined,
          finalSettlement: form.finalSettlement ? Math.round(Number(form.finalSettlement) * 100) : undefined,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Failed to start offboarding", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({
        title: "Offboarding journey started",
        description: "A 6-step checklist was created for this departure.",
        variant: "success",
      });
      setDialogOpen(false);
      setForm({ employeeId: "", noticeDate: "", lastDay: "", terminationDate: "", finalSettlement: "" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function onToggleItem(process: OffboardingRow, index: number, done: boolean) {
    try {
      const res = await fetch(`/api/offboarding?id=${process.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIndex: index, done }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        return;
      }
      setProcesses((prev) =>
        prev.map((p) => (p.id === process.id ? { ...p, ...json.data.process } : p))
      );
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onStatusChange(process: OffboardingRow, status: string) {
    try {
      const res = await fetch(`/api/offboarding?id=${process.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: `Journey ${status === "completed" ? "completed" : "cancelled"}`, variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onDelete(process: OffboardingRow) {
    if (!window.confirm("Delete this offboarding process? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/offboarding?id=${process.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Offboarding process deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader

        /* Session 49 (R48-A3): the always-row family — REF renders the
         *  UNPREFIXED always-row (measured @1440×900 this round).
         *  Session 49 (R48-A5): REF renders the single action DIRECTLY
         *  in the row (no cluster wrapper — live-measured). */
        alwaysRow
        actionsUnwrapped
        section="Offboarding Management"
        layout="flat36"
        actionsStart
        iconClassName="text-blue-600"
        /* Session 87 (R87-E): the kicker icon re-measured by the
           full-registry cross-side pixel-diff — path-data-verified
           against the REF's rendered svg: the USERS glyph (the three
           paths + the 9,7 r4 circle), not the checkmark family
           (CircleCheckBig was the original build's guess). */
        sectionIcon={<Users aria-hidden="true" />}
        title="Offboarding Journey"
        subtitle="Manage employee departures smoothly"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2" aria-hidden="true" />
            New Offboarding
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : processes.length === 0 ? (
        /* Session 14 (R13-G): the reference wraps its content in `grid
            md:grid-cols-2 lg:grid-cols-3`; the empty state is ONE
            full-width card (238px) — icon + h3 + P only, NO CTA (the
            affordance is the header button). */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Session 62 (R62-D1): REF's live card recipe — the unflipping
              border-slate-200 + text-card-foreground shadow (was the
              hand-rolled shadow-sm; the r62 border census). */}
          <div className="rounded-xl border bg-card text-card-foreground shadow col-span-full border-slate-200">
            <EmptyState
              icon={<UserMinus aria-hidden="true" />}
              title="No offboarding processes"
              description="Start an offboarding journey when needed"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {processes.map((process) => {
            const name =
              `${process.employee?.firstName ?? ""} ${process.employee?.lastName ?? ""}`.trim() || "—";
            const done = process.checklistItems.filter((i) => i.done).length;
            const total = process.checklistItems.length;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <Card key={process.id}>
                <CardContent className="flex flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initials(name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{name}</p>
                        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                          Last day {formatDate(process.lastDay)}
                          {process.reason ? ` · ${process.reason}` : ""}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={process.status} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Checklist progress</span>
                      <span className="font-medium text-foreground">
                        {done}/{total} · {progress}%
                      </span>
                    </div>
                    <Progress value={progress} aria-label={`${progress}% of checklist complete`} />
                  </div>

                  <ul className="flex flex-col gap-2">
                    {process.checklistItems.map((item, index) => (
                      <li key={`${process.id}-${index}`} className="flex items-center gap-3 rounded-lg border p-2.5">
                        <Checkbox
                          id={`${process.id}-item-${index}`}
                          checked={item.done}
                          onCheckedChange={(checked) => onToggleItem(process, index, checked === true)}
                          aria-label={item.title}
                        />
                        <label
                          htmlFor={`${process.id}-item-${index}`}
                          className={`flex-1 cursor-pointer text-sm ${
                            item.done ? "text-muted-foreground line-through" : "text-foreground"
                          }`}
                        >
                          {item.title}
                        </label>
                        {item.done ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border" aria-hidden="true" />
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-end gap-1 border-t pt-3">
                    {process.status === "in_progress" ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => onStatusChange(process, "completed")}>
                          <CheckCircle2 aria-hidden="true" />
                          Complete
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStatusChange(process, "cancelled")}
                        >
                          <XCircle aria-hidden="true" />
                          Cancel
                        </Button>
                      </>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="iconSm"
                      aria-label={`Delete offboarding for ${name}`}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onDelete(process)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Start Offboarding Process</DialogTitle>
            <DialogDescription>
              Start an offboarding journey — a checklist of exit tasks is created automatically.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="off-employee">Employee</Label>
              <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
                <SelectTrigger id="off-employee">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="off-notice">Notice Date</Label>
              <Input
                id="off-notice"
                type="date"
                value={form.noticeDate}
                onChange={(e) => setForm({ ...form, noticeDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="off-lastday">Last Working Day</Label>
              <Input
                id="off-lastday"
                type="date"
                required
                value={form.lastDay}
                onChange={(e) => setForm({ ...form, lastDay: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="off-termination">Termination Date</Label>
              <Input
                id="off-termination"
                type="date"
                value={form.terminationDate}
                onChange={(e) => setForm({ ...form, terminationDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="off-settlement">Final Settlement (SAR)</Label>
              <Input
                id="off-settlement"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 12500.00"
                value={form.finalSettlement}
                onChange={(e) => setForm({ ...form, finalSettlement: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Start Offboarding
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
