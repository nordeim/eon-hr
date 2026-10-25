"use client";

import * as React from "react";
import { Banknote, Calculator, DollarSign, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatSar, initials, currentPeriod } from "@/lib/utils";

interface PayslipRow {
  id: string;
  employeeId: string;
  period: string;
  basicSalary: number;
  overtimeHours?: number; // session92 R92-M
  allowances: number;
  bonus: number;
  deductions: number;
  notes?: string | null; // session92 R92-M
  netSalary: number;
  status: string;
  employee: { id: string; employeeId: string; firstName: string; lastName: string; email: string } | null;
}

interface EmployeeOption {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  baseSalary: number; // session92 R92-M: the Generate Payslip contract (the REF's dialog generates from the base)
}

function monthLabel(period: string): string {
  const [y, m] = period.split("-").map(Number);
  if (!y || !m) return period;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function toMinor(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export default function PayrollModulePage() {
  const toast = useToast();
  // Session 12 (R11-I): the period is state — the reference's header month
  // input (160px, type="month") drives the whole page.
  const [period, setPeriod] = React.useState(currentPeriod());
  const [records, setRecords] = React.useState<PayslipRow[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  // Session 12 (R11-I): the standalone max-w-sm employee search.
  const [search, setSearch] = React.useState("");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PayslipRow | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const [payrollRes, empRes] = await Promise.all([
        fetch(`/api/payroll?period=${period}`),
        fetch("/api/employees"),
      ]);
      const payrollJson = await payrollRes.json();
      const empJson = await empRes.json();
      if (payrollJson.ok) setRecords(payrollJson.data.records);
      else toast.toast({ title: "Failed to load payslips", description: payrollJson.error?.message, variant: "error" });
      if (empJson.ok) setEmployees(empJson.data.employees);
    } catch {
      toast.toast({ title: "Failed to load payslips", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [period, toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const stats = React.useMemo(() => {
    const total = records.reduce((s, r) => s + r.netSalary, 0);
    const basic = records.reduce((s, r) => s + r.basicSalary, 0);
    const paid = records.filter((r) => r.status === "paid").length;
    const draft = records.filter((r) => r.status === "draft").length;
    return { total, basic, paid, draft };
  }, [records]);

  // Session 12 (R11-I): the standalone search filters the table.
  const visibleRecords = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q === "") return records;
    return records.filter((r) => {
      const name = `${r.employee?.firstName ?? ""} ${r.employee?.lastName ?? ""}`.trim().toLowerCase();
      return name.includes(q) || r.employeeId.toLowerCase().includes(q);
    });
  }, [records, search]);

  async function onGenerateAll() {
    setGenerating(true);
    try {
      const res = await fetch("/api/payroll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Generation failed", description: json.error?.message, variant: "error" });
        return;
      }
      const { created, skipped } = json.data as { created: number; skipped: number };
      toast.toast({
        title: created > 0 ? `Generated ${created} payslip${created === 1 ? "" : "s"}` : "All payslips already exist",
        description:
          created > 0
            ? `Draft payslips for ${monthLabel(period)} created from base salaries.`
            : `${skipped} employee record${skipped === 1 ? "" : "s"} already exist for ${monthLabel(period)}.`,
        variant: created > 0 ? "success" : "info",
      });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setGenerating(false);
    }
  }

  async function onSave(data: {
    employeeId: string;
    period: string;
    basicSalary: number;
    overtimeHours: number;
    allowances: number;
    bonus: number;
    deductions: number;
    notes?: string;
  }) {
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/payroll?id=${editing.id}` : "/api/payroll", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: editing?.status ?? "draft" }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({
        title: editing ? "Payslip updated" : "Payslip added",
        description: `${monthLabel(data.period)} · Net ${formatSar(
          data.basicSalary + data.allowances + data.bonus - data.deductions
        )}.`,
        variant: "success",
      });
      setDialogOpen(false);
      setEditing(null);
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onMarkPaid(record: PayslipRow) {
    try {
      const res = await fetch(`/api/payroll?id=${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Update failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Payslip marked as paid", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  async function onDelete(record: PayslipRow) {
    if (!window.confirm(`Delete the payslip for ${record.period}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/payroll?id=${record.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Payslip deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <PageHeader
        rowBreakpoint="md"
        title="Payroll Module"
        subtitle="Generate & manage monthly payslips"
        actions={
          <>
            {/* Session 12 (R11-I): the reference's header month input (160px). */}
            <Input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value || currentPeriod())}
              className="w-40"
              aria-label="Payslip period"
            />
            <Button variant="outline" onClick={onGenerateAll} disabled={generating || loading}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Calculator className="mr-2" aria-hidden="true" />}
              Generate All
            </Button>
            <Button variant="green"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2" aria-hidden="true" />
              Add Payslip
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard variant="compact-s" labelTag="p" label="Total Payroll" value={formatSar(stats.total)} icon={<DollarSign className="w-5 h-5 text-green-600" aria-hidden="true" />} tileClassName="bg-green-100" />
        <StatCard variant="compact-s" labelTag="p" label="Basic Salaries" value={formatSar(stats.basic)} icon={<DollarSign className="w-5 h-5 text-blue-600" aria-hidden="true" />} tileClassName="bg-blue-100" />
        <StatCard variant="compact-s" labelTag="p" label="Paid" value={stats.paid} icon={<DollarSign className="w-5 h-5 text-emerald-600" aria-hidden="true" />} tileClassName="bg-emerald-100" />
        <StatCard variant="compact-s" labelTag="p" label="Draft" value={stats.draft} icon={<DollarSign className="w-5 h-5 text-yellow-600" aria-hidden="true" />} tileClassName="bg-yellow-100" />
      </div>

      {/* Session 12 (R11-I): the reference's standalone search — a relative
          max-w-sm (384px) wrapper with a 16px Search icon and an h-9 input
          ("Search employees...") between the stats and the table card. */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
        {/* Session 64 (R64-A): REF clears the left-3 search icon with
            pl-9 (36px — live-measured this round). */}
        <Input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search employees"
          className="pl-9"
        />
      </div>

      {/* Session 12 (R11-I): border-b DIV-title CardHeader ("Payslips —
          {month}", 65px) over a p-0 table area; the empty state is the
          systemic in-table row (py-12 text-center text-slate-400, 117px). */}
      <Card className="border-slate-200">
        <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-200">
          <div className="font-semibold leading-none tracking-tight">Payslips — {monthLabel(period)}</div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              {/* Session 62 (R62-H1): REF's header row carries
                  border-slate-200 bg-slate-50 (the unflipping pair,
                  r62 census). */}
              <TableRow className="border-slate-200 bg-slate-50">
                <TableHead>Employee</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRecords.length === 0 ? (
                <TableRow>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {/* Session 87 (R87-C): the full REF sentence re-measured
                        by the full-registry cross-side pixel-diff — the
                        live-read text carries the CTA tail the truncated
                        form dropped. */}
                    No payslips for {monthLabel(period)}. Click{" "}
                    {"\""}Generate All{"\""} to create them.
                  </td>
                </TableRow>
              ) : (
                visibleRecords.map((record) => {
                const name = `${record.employee?.firstName ?? ""} ${record.employee?.lastName ?? ""}`.trim() || "—";
                return (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initials(name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {record.employee?.employeeId ?? record.employeeId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(record.basicSalary)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(record.allowances)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(record.bonus)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatSar(record.deductions)}</TableCell>
                    <TableCell className="font-medium text-foreground">{formatSar(record.netSalary)}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {record.status !== "paid" ? (
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label={`Mark payslip as paid for ${name}`}
                            title="Mark as paid"
                            onClick={() => onMarkPaid(record)}
                          >
                            <Banknote aria-hidden="true" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="iconSm"
                          aria-label={`Edit payslip for ${name}`}
                          title="Edit"
                          onClick={() => {
                            setEditing(record);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="iconSm"
                          aria-label={`Delete payslip for ${name}`}
                          title="Delete"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => onDelete(record)}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <PayslipDialog
        key={editing ? editing.id : "new"}
        open={dialogOpen}
        record={editing}
        employees={employees}
        defaultPeriod={period}
        saving={saving}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        onSave={onSave}
      />
    </div>
  );
}

function PayslipDialog({
  open,
  record,
  employees,
  defaultPeriod,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  record: PayslipRow | null;
  employees: EmployeeOption[];
  defaultPeriod: string;
  saving: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (data: {
    employeeId: string;
    period: string;
    basicSalary: number;
    overtimeHours: number;
    allowances: number;
    bonus: number;
    deductions: number;
    notes?: string;
  }) => Promise<boolean>;
}) {
  // Session92 (R92-M): the REF's live dialog contract (512x372, "Add
  // Payslip") — Employee *, Bonus (SAR), Notes ("Optional notes...") and
  // the Generate Payslip footer; the payslip generates from the employee's
  // baseSalary for the current period.
  const [form, setForm] = React.useState(() => ({
    employeeId: record?.employeeId ?? employees[0]?.id ?? "",
    bonus: record ? String(record.bonus / 100) : "0",
    notes: record?.notes ?? "",
  }));

  React.useEffect(() => {
    if (open) {
      setForm({
        employeeId: record?.employeeId ?? employees[0]?.id ?? "",
        bonus: record ? String(record.bonus / 100) : "0",
        notes: record?.notes ?? "",
      });
    }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const employee = employees.find((emp) => emp.id === form.employeeId);
    const bonus = toMinor(form.bonus);
    if (!employee || bonus === null) return;
    const saved = await onSave({
      employeeId: form.employeeId,
      period: record?.period ?? defaultPeriod,
      basicSalary: record?.basicSalary ?? employee.baseSalary,
      overtimeHours: record?.overtimeHours ?? 0,
      allowances: record?.allowances ?? 0,
      bonus,
      deductions: record?.deductions ?? 0,
      notes: form.notes || undefined,
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{record ? "Edit Payslip" : "Add Payslip"}</DialogTitle>
          <DialogDescription>
            {record ? "Update this payslip's bonus and notes." : "Generate a payslip with a bonus for an employee."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ps-employee">Employee *</Label>
            <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
              <SelectTrigger id="ps-employee">
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
            <Label htmlFor="ps-bonus">Bonus (SAR)</Label>
            <Input
              id="ps-bonus"
              type="number"
              min="0"
              step="0.01"
              value={form.bonus}
              onChange={(e) => setForm({ ...form, bonus: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ps-notes">Notes</Label>
            <Textarea
              id="ps-notes"
              rows={3}
              placeholder="Optional notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="green" type="submit" disabled={saving || !form.employeeId}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {record ? "Save Changes" : "Generate Payslip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
